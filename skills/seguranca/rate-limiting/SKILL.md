---
name: antigravity-rate-limiting
description: "Use esta skill para implementar rate limiting por tenant e por rota. Define limites, estratégias, headers de resposta e bypass para serviços internos. Consultada pelo Segurança e Backend ao proteger endpoints contra abuso."
---

# Gravity — Rate Limiting

## Por Que Rate Limiting é Essencial

Sem rate limiting:
- Um tenant pode consumir todos os recursos e derrubar a plataforma
- Ataques de brute force não são bloqueados
- Custos de infra ficam imprevisíveis
- Um bug em um cliente pode gerar milhares de requests

---

## Limites por Tipo de Rota

| Tipo | Limite | Janela | Chave |
|:---|:---|:---|:---|
| Rotas autenticadas | 100 req | 1 min | `tenant_id` |
| Rotas públicas (marketplace) | 30 req | 1 min | IP |
| Login/auth | 10 req | 15 min | IP + email |
| Webhooks (Clerk, Stripe) | 50 req | 1 min | IP |
| Chamadas S2S internas | 500 req | 1 min | `x-internal-key` |
| Upload de arquivos | 10 req | 1 min | `tenant_id` |
| Export (CSV/Excel) | 5 req | 1 min | `tenant_id` |

---

## Implementação com express-rate-limit

```typescript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

// Rate limiter padrão — por tenant
export const tenantRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  keyGenerator: (req) => req.auth?.tenant_id || req.ip,
  standardHeaders: true, // RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Muitas requisições. Tente novamente em 1 minuto.',
    }
  },
  // Em produção, usar Redis para compartilhar entre instâncias
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
})

// Rate limiter para auth — mais restritivo
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  keyGenerator: (req) => `${req.ip}:${req.body?.email || 'unknown'}`,
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    }
  },
})

// Bypass para serviços internos
export const internalBypass = (req, res, next) => {
  if (req.headers['x-internal-key'] === process.env.INTERNAL_SERVICE_KEY) {
    return next() // Sem rate limit para chamadas internas
  }
  tenantRateLimit(req, res, next)
}
```

### Registrar no servidor

```typescript
// server/index.ts
app.use(express.json())
app.use(correlationMiddleware)

// Rate limiting — antes da auth
app.use('/api/', internalBypass)
app.use('/auth/', authRateLimit)

// Health check — sem rate limit
app.get('/health', healthHandler)
```

---

## Headers de Resposta

Quando rate limited, o servidor retorna:

```
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1711712400
Retry-After: 45
```

O frontend deve tratar:

```typescript
// shared/api.ts
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After')
  showNotification({
    type: 'warning',
    message: `Muitas requisições. Aguarde ${retryAfter}s.`,
  })
}
```

---

## Rate Limiting por Tenant (Fair Usage)

Para evitar que um tenant grande monopolize recursos:

| Plano | Requests/min | Concurrent connections |
|:---|:---|:---|
| Trial | 30 | 5 |
| Starter | 100 | 10 |
| Professional | 300 | 25 |
| Enterprise | 1000 | 50 |

> Limites configuráveis no Configurador por tenant.

---

## Monitoramento

- Log toda vez que rate limit é atingido (com tenant_id)
- Dashboard com top tenants por volume de requests
- Alerta se um tenant atinge 80% do limite consistentemente
- Alerta se rate limit global é atingido (possível ataque)

---

## Checklist — Rate Limiting

- [ ] Rate limiter configurado em todo servidor?
- [ ] Rotas públicas com limite mais restritivo?
- [ ] Auth com limite de tentativas?
- [ ] Bypass para chamadas S2S internas?
- [ ] Headers RateLimit-* no response?
- [ ] Frontend trata 429 com mensagem amigável?
- [ ] Logs de rate limit violations?
- [ ] Redis store em produção (compartilhar entre instâncias)?
