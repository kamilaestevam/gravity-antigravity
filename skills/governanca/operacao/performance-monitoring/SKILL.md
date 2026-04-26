---
name: antigravity-performance-monitoring
description: "Use esta skill para configurar APM, dashboards, alertas, profiling e monitoramento de performance. Define ferramentas, métricas obrigatórias e limiares de alerta. Consultada pelo DevOps/SRE ao configurar monitoramento de qualquer serviço."
---

# Gravity — Performance & Monitoring

## Stack de Monitoramento

| Ferramenta | Função | Custo |
|:---|:---|:---|
| **Sentry** | Erros + Performance (APM) | Free tier |
| **UptimeRobot** | Health checks externos | Free tier |
| **Railway Metrics** | CPU, memória, rede | Incluso |
| **Grafana Cloud** | Dashboards customizados (Fase 2) | Free tier |

---

## Métricas Obrigatórias por Serviço

| Métrica | Como medir | Alerta quando |
|:---|:---|:---|
| Latência p50 | Sentry Performance | > 100ms |
| Latência p95 | Sentry Performance | > 200ms |
| Latência p99 | Sentry Performance | > 500ms |
| Error rate | Sentry | > 1% |
| Health check | UptimeRobot | 2 falhas consecutivas |
| CPU | Railway Metrics | > 80% por 5 min |
| Memória | Railway Metrics | > 85% |
| Conexões DB | Railway/PgBouncer | > 80% do pool |

---

## Sentry — Configuração de Performance

```typescript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // APM — capturar transações
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Profiling (Fase 2)
  profilesSampleRate: 0.05,

  integrations: [
    // Auto-instrumentar Express
    new Sentry.Integrations.Express({ app }),
    // Auto-instrumentar Prisma
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
})
```

---

## Budget de Latência por Camada

Para atingir **≤ 200ms** end-to-end:

| Camada | Budget | Justificativa |
|:---|:---|:---|
| Rede (Railway internal) | 5ms | Rede interna, latência mínima |
| Express middleware | 10ms | Parse, auth, correlation |
| Validação Zod | 5ms | Validação de schema |
| Query Prisma | 80ms | Operação principal de banco |
| Lógica de negócio | 50ms | Cálculos, transformações |
| Serialização response | 5ms | JSON.stringify |
| Overhead/buffer | 45ms | Margem de segurança |
| **Total** | **200ms** | |

> Se uma camada excede o budget → investigar e otimizar.

---

## Dashboard de Performance (Grafana — Fase 2)

Painéis obrigatórios:

1. **Overview** — latência p50/p95/p99 por serviço
2. **Error Rate** — % de erros por serviço nos últimos 30 min
3. **Throughput** — req/s por serviço
4. **Database** — query time, conexões ativas, dead tuples
5. **Infra** — CPU, memória, disco por serviço

---

## Alertas

| Alerta | Condição | Canal | Ação |
|:---|:---|:---|:---|
| Serviço down | Health check falhou 2x | Slack + Email | Runbook P0 |
| Latência alta | p95 > 200ms por 5 min | Slack | Investigar queries |
| Error spike | Error rate > 5% por 5 min | Slack + Sentry | Investigar stack traces |
| DB connections | > 80% pool por 5 min | Slack | Verificar leaks |
| Memory high | > 85% por 10 min | Slack | Verificar memory leaks |
| Disk high | > 80% | Email | Cleanup ou upgrade |

---

## Profiling (Fase 2)

Para queries lentas ou CPU spikes:

```typescript
// Usar Sentry Profiling para flame graphs
Sentry.init({
  profilesSampleRate: 0.05, // 5% das transações
})

// Para debug pontual: Node.js built-in profiler
node --prof server/index.ts
node --prof-process isolate-*.log > profile.txt
```

---

## Checklist — Ao Configurar Monitoramento

- [ ] Sentry inicializado com performance tracking?
- [ ] UptimeRobot monitor criado para `/health`?
- [ ] Métricas de latência p95 visíveis?
- [ ] Alertas configurados para thresholds definidos?
- [ ] Budget de latência validado para fluxos críticos?
- [ ] Railway Metrics acessível para CPU/memória?
