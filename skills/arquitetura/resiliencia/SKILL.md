---
name: antigravity-resiliencia
description: "Use esta skill para implementar padrões de resiliência. Define degradação graciosa, retry com backoff, dead letter queue, endpoint de agregação e timeouts obrigatórios. Aponta para a SSOT em casos de Health Check (observabilidade) e roadmap futuro (BullMQ, Circuit Breaker). Consultada pelo Backend e DevOps/SRE ao construir comunicação entre serviços."
---

# Gravity — Resilience Patterns

## Por Que Resiliência

Na arquitetura distribuída do Gravity, serviços falham. A rede falha. O banco fica lento. A questão não é **se** vai falhar, mas **como** o sistema se comporta quando falha.

---

## Padrão 1 — Degradação Graciosa

Quando um serviço da organização está fora do ar, o produto continua funcionando para tudo que é local.

### Wrapper de chamada cross-service

> 🚨 **ALERTA DE SEGURANÇA (S2S APENAS):** O wrapper abaixo e o uso do header `x-internal-key` são ESTRITAMENTE para comunicação Backend-to-Backend (Server-to-Server) dentro da rede interna. NUNCA copies este padrão para código frontend (React/Browser). O frontend comunica com os serviços APENAS via JWT do Clerk passando pelo proxy do Configurador.

```typescript
// servicos-global/nucleo/api-client.ts
// Wrapper para chamadas a serviços da organização.
// O `logger` vem do createLogger do nucleo-global (ver skill de observabilidade).

async function fetchOrganizacaoService<T>(
  endpoint: string,
  correlationId: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(
      `${ORGANIZACAO_SERVICES_URL}${endpoint}`,
      {
        ...options,
        headers: {
          'x-chave-interna': INTERNAL_KEY,
          'x-id-correlacao': correlationId,
          ...options?.headers,
        },
        signal: AbortSignal.timeout(5000), // timeout de 5s
      }
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (err) {
    logger.warn('Servico da organizacao indisponivel', { endpoint, error: err })
    return null // degradação graciosa
  }
}
```

### Na UI — fallback de degradação

```typescript
function DashboardPage() {
  const activities = useOrganizacaoQuery('/activities')

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

### Endpoint de agregação — padrão Route → Controller → Service

A orquestração com `Promise.allSettled` mora **no Service**. A Route só roteia, o Controller só chama o Service.

```typescript
// <produto>/server/src/routes/dashboard.routes.ts
import { Router } from 'express'
import { dashboardController } from '../controllers/dashboard.controller'

export const dashboardRoutes = Router()
dashboardRoutes.get('/dashboard', dashboardController.agregar)
```

```typescript
// <produto>/server/src/controllers/dashboard.controller.ts
import { Request, Response } from 'express'
import { dashboardService } from '../services/dashboard.service'

export const dashboardController = {
  async agregar(req: Request, res: Response) {
    const result = await dashboardService.agregar(req.auth, req.correlationId)
    res.json(result)
  },
}
```

```typescript
// <produto>/server/src/services/dashboard.service.ts
import { organizacaoAPI } from '@gravity/nucleo'

export const dashboardService = {
  async agregar(auth: AuthContext, correlationId: string) {
    const [activities, timers, emails] = await Promise.allSettled([
      organizacaoAPI.get(
        `/activities?id_usuario=${auth.id_usuario}&id_produto=bid-frete`,
        { correlationId }
      ),
      organizacaoAPI.get(
        `/timers?id_usuario=${auth.id_usuario}&active=true`,
        { correlationId }
      ),
      organizacaoAPI.get(
        `/email?unread=true&limit=5`,
        { correlationId }
      ),
    ])

    return {
      activities: activities.status === 'fulfilled' ? activities.value : null,
      timers: timers.status === 'fulfilled' ? timers.value : null,
      emails: emails.status === 'fulfilled' ? emails.value : null,
      partial: [activities, timers, emails].some(r => r.status === 'rejected'),
    }
  },
}
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

Quando todos os retries falham, a ação vai para uma tabela de falhas para reprocessamento posterior. Ver skill [`cross-boundary`](../../seguranca/cross-boundary/SKILL.md) para implementação completa com `enqueueOrganizacaoAction` e `FailedOrganizacaoAction`.

---

## Health Check P0

> ⚠️ **REGRA ABSOLUTA:** O Health Check P0 com verificação de dependências vive em [Observabilidade](../observabilidade/SKILL.md).

---

## Roadmap Futuro

> ⚠️ **Roadmap Futuro:** BullMQ e Circuit Breaker serão documentados quando oficialmente implementados na arquitetura.

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
- [ ] Health check verifica dependências críticas (ver [Observabilidade](../observabilidade/SKILL.md))?
- [ ] Dead letter queue para falhas persistentes?
- [ ] Endpoint de agregação respeitando Route → Controller → Service?
- [ ] Correlation ID propagado via `x-id-correlacao` em toda chamada cross-service?
