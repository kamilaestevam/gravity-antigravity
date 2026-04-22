---
name: antigravity-sla-performance
description: "Use esta skill para definir e monitorar SLAs de performance. Define metas de latência (200ms), throughput (50k req), disponibilidade (99,9%), budget por camada e estratégias de load testing. Consultada pelo DevOps/SRE, Backend e Estrutura de Dados ao planejar ou otimizar performance."
---

# Gravity — SLA & Performance

## Metas de SLA

| Requisito | Meta | Medição |
|:---|:---|:---|
| Latência máxima | ≤ 200ms (p95) | Sentry Performance |
| Requisições simultâneas | 50.000 | Load test com k6 |
| Disponibilidade | 99,9% (≤ 8h45min downtime/ano) | UptimeRobot |
| Escalabilidade | Auto-scaling em pico | Railway auto-scale |

---

## Budget de Latência por Camada

| Camada | Budget | Otimização |
|:---|:---|:---|
| Rede interna Railway | 5ms | N/A (infra) |
| Express middleware chain | 10ms | Mínimo de middlewares |
| Validação Zod | 5ms | Schemas pré-compilados |
| Query Prisma (DB) | 80ms | Índices compostos, select specific |
| Lógica de negócio | 50ms | Cache, memoize |
| Serialização response | 5ms | Evitar nested deep |
| Buffer de segurança | 45ms | Margem |
| **Total** | **200ms** | |

### Como medir cada camada

```typescript
// Middleware de profiling por camada
app.use((req, res, next) => {
  req.timings = { start: performance.now() }
  next()
})

// Após cada camada, registrar
req.timings.afterAuth = performance.now()
req.timings.afterValidation = performance.now()
req.timings.afterQuery = performance.now()

// No response, logar breakdown
res.on('finish', () => {
  const total = performance.now() - req.timings.start
  if (total > 200) {
    logger.warn('Slow request', {
      total,
      auth: req.timings.afterAuth - req.timings.start,
      validation: req.timings.afterValidation - req.timings.afterAuth,
      query: req.timings.afterQuery - req.timings.afterValidation,
      path: req.path,
    })
  }
})
```

---

## Load Testing com k6

### Setup básico

```javascript
// load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 },    // ramp up
    { duration: '5m', target: 500 },     // sustain
    { duration: '2m', target: 1000 },    // peak
    { duration: '5m', target: 5000 },    // stress
    { duration: '2m', target: 0 },       // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],     // p95 < 200ms
    http_req_failed: ['rate<0.01'],       // < 1% error rate
  },
}

export default function () {
  const res = http.get('https://staging.gravity.com.br/api/v1/cotacoes', {
    headers: {
      'Authorization': `Bearer ${__ENV.TEST_TOKEN}`,
      'x-internal-key': __ENV.INTERNAL_KEY,
    },
  })
  check(res, { 'status is 200': (r) => r.status === 200 })
  sleep(0.1)
}
```

### Quando rodar

| Cenário | Frequência | Meta |
|:---|:---|:---|
| Smoke test (10 users) | Cada deploy em staging | Sem erros |
| Load test (500 users) | Semanal | p95 < 200ms |
| Stress test (5000 users) | Mensal ou pré-release | Identificar limite |
| Spike test (0→5000 em 30s) | Trimestral | Auto-scaling funciona |

---

## Estratégias de Otimização

### Quando p95 > 200ms

1. **Identificar gargalo** — Sentry APM mostra qual camada está lenta
2. **Se é DB** → revisar índices, usar `select` específico, evitar N+1
3. **Se é lógica** → memoize, cache, paralelizar com Promise.all
4. **Se é rede** → verificar se chamadas S2S são paralelas, não sequenciais
5. **Se é serialização** → reduzir payload, paginar

### Padrões de Query Otimizada

> **Schema-per-Organização:** acesso ao banco do produto sempre via `withTenant`/`withTenantContext` do `@gravity/tenant-resolver`. O schema **é** a organização — não filtre por `id_organizacao`.

```typescript
// ❌ lento — carrega tudo
await withTenant(req, async (db) => {
  return db.cotacao.findMany({
    include: { bids: true, fornecedor: true },
  })
})

// ✅ rápido — só campos necessários
await withTenant(req, async (db) => {
  return db.cotacao.findMany({
    select: {
      id: true, titulo: true, status: true, created_at: true,
      _count: { select: { bids: true } },
    },
    take: 20,
    orderBy: { created_at: 'desc' },
  })
})
```

---

## Disponibilidade 99,9%

| Tempo | Downtime permitido |
|:---|:---|
| Anual | 8h 45min 36s |
| Mensal | 43min 28s |
| Semanal | 10min 4s |

**Como garantir:**
- Health checks a cada 5 min (UptimeRobot)
- Rollback instantâneo (Railway)
- Auto-scaling em picos
- Redundância de banco (Railway managed)
- Alertas P0 com resposta < 15 min

---

## Checklist — Revisão de Performance

- [ ] Budget de latência respeitado por camada?
- [ ] Índices compostos criados para queries frequentes?
- [ ] N+1 queries eliminados?
- [ ] Chamadas S2S paralelas com Promise.all?
- [ ] Load test rodado em staging?
- [ ] p95 < 200ms confirmado?
- [ ] Auto-scaling testado?
