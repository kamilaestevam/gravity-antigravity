---
name: antigravity-resilience-patterns
description: "Use esta skill para implementar padrões de resiliência. Define degradação graciosa, retry com backoff, dead letter queue, circuit breaker, endpoint de agregação e health check P0. Consultada pelo Backend e DevOps/SRE ao construir comunicação entre serviços."
---

# Gravity — Resilience Patterns

## Por Que Resiliência

Na arquitetura distribuída do Gravity, serviços falham. A rede falha. O banco fica lento. A questão não é **se** vai falhar, mas **como** o sistema se comporta quando falha.

---

## Padrão 1 — Degradação Graciosa

Quando um serviço da organização está fora do ar, o produto continua funcionando para tudo que é local.

### No Frontend

```typescript
// shared/api.ts — wrapper para chamadas a serviços da organização
async function fetchOrgService<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(
      `${TENANT_SERVICES_URL}${endpoint}`,
      {
        ...options,
        headers: {
          'x-chave-interna': INTERNAL_KEY,
          ...options?.headers,
        },
        signal: AbortSignal.timeout(5000), // timeout de 5s
      }
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (err) {
    console.warn(`Serviço da organização indisponível: ${endpoint}`, err)
    return null // degradação graciosa
  }
}

// Na UI — mostrar fallback
function DashboardPage() {
  const activities = useOrgQuery('/activities')

  if (activities === null) {
    return (
      <ServiceUnavailable
        service="Atividades"
        message="Serviço temporariamente indisponível. Dados locais funcionam normalmente."
        retryIn={30}
      />
    )
  }
  return <ActivityList data={activities} />
}
```

### No Backend

```typescript
// Endpoint de agregação — Promise.allSettled para não bloquear tudo
app.get('/api/dashboard', async (req, res) => {
  const [activities, timers, emails] = await Promise.allSettled([
    orgAPI.get(`/activities?id_usuario=${req.auth.id_usuario}&id_produto=bid-frete`),
    orgAPI.get(`/timers?id_usuario=${req.auth.id_usuario}&active=true`),
    orgAPI.get(`/email?unread=true&limit=5`),
  ])

  res.json({
    activities: activities.status === 'fulfilled' ? activities.value : null,
    timers: timers.status === 'fulfilled' ? timers.value : null,
    emails: emails.status === 'fulfilled' ? emails.value : null,
    partial: [activities, timers, emails].some(r => r.status === 'rejected'),
  })
})
```

> **Regra:** se a tela precisa de dados de múltiplos serviços, use `Promise.allSettled` (não `Promise.all`). Um serviço falhando não deve derrubar os outros.

---

## Padrão 2 — Retry com Backoff Exponencial

Para ações que podem falhar temporariamente (rede, timeout, serviço reiniciando):

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxRetries) throw err
      const delay = baseDelay * Math.pow(2, attempt - 1) // 1s, 2s, 4s
      const jitter = Math.random() * 500 // evitar thundering herd
      await new Promise(r => setTimeout(r, delay + jitter))
    }
  }
  throw new Error('Unreachable')
}
```

---

## Padrão 3 — Dead Letter Queue

Quando todos os retries falham, a ação vai para uma tabela de falhas para reprocessamento posterior. Ver skill `antigravity-cross-boundary` para implementação completa com `enqueueOrgAction` e `FailedOrgAction`.

### Evolução: BullMQ (Fase 3)

```typescript
// Quando escalar para fila real
import { Queue, Worker } from 'bullmq'

const orgQueue = new Queue('org-actions', { connection: redis })

// Enfileirar
await orgQueue.add('create-activity', payload, {
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 },
})

// Processar
new Worker('org-actions', async (job) => {
  await orgAPI.post(`/api/org/${job.name}`, job.data)
}, { connection: redis })
```

---

## Padrão 4 — Circuit Breaker (Fase 3)

Evitar chamadas repetidas a um serviço que está sabidamente fora do ar:

```typescript
class CircuitBreaker {
  private failures = 0
  private lastFailure = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private threshold: number = 5,
    private timeout: number = 30000 // 30s
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.reset()
      return result
    } catch (err) {
      this.failures++
      this.lastFailure = Date.now()
      if (this.failures >= this.threshold) {
        this.state = 'OPEN'
      }
      throw err
    }
  }

  private reset() {
    this.failures = 0
    this.state = 'CLOSED'
  }
}
```

---

## Padrão 5 — Health Check P0

**Regra P0:** se um serviço cair, o responsável é notificado em **menos de 5 minutos**.

```typescript
// Health check com verificação de dependências
app.get('/health', async (req, res) => {
  const checks = {
    database: false,
    orgServices: false,
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch {}

  try {
    const r = await fetch(`${ORG_URL}/health`, { signal: AbortSignal.timeout(2000) })
    checks.orgServices = r.ok
  } catch {}

  const healthy = checks.database // DB é obrigatório, serviços da organização é nice-to-have
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'bid-frete',
    checks,
    timestamp: new Date().toISOString(),
  })
})
```

---

## Timeouts Obrigatórios

| Chamada | Timeout | Razão |
|:---|:---|:---|
| Chamada S2S (serviço da organização) | 5s | Evitar travamento |
| Chamada ao Configurador | 3s | Auth deve ser rápida |
| Query Prisma | 10s | Queries pesadas têm mais margem |
| Health check dependency | 2s | Rápido — só verificar |
| Chamada a API externa | 10s | Redes externas são imprevisíveis |

---

## Checklist — Resiliência

- [ ] Chamadas a serviços externos com timeout?
- [ ] `Promise.allSettled` para múltiplas chamadas paralelas?
- [ ] Retry com backoff para ações cross-boundary?
- [ ] UI mostra degradação graciosa (não tela de erro)?
- [ ] Health check verifica dependências críticas?
- [ ] Dead letter queue para falhas persistentes?
- [ ] Endpoint de agregação para reduzir chamadas HTTP?
