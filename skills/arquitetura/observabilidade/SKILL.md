---
name: antigravity-observabilidade
description: "Use esta skill sempre que uma tarefa envolver logs, monitoramento, health checks, rastreamento de requests entre serviços ou configuração de Sentry e UptimeRobot. Define o padrão de correlation ID, estrutura de logs, health check obrigatório e ordem dos middlewares. Todo agente consulta esta skill ao criar ou modificar qualquer servidor Express."
---

# Gravity — Observabilidade

Sem observabilidade, não conseguimos depurar problemas em produção, especialmente em uma arquitetura multi-organização e distribuída.

> ⚠️ **REGRA ABSOLUTA:** Ver [Observabilidade Mínima](../../governanca/convencao-tecnica/observabilidade-minima/SKILL.md) — métricas obrigatórias por serviço, ferramentas obrigatórias, log de auditoria de ações sensíveis. Esta skill cobre apenas o **padrão técnico** de implementação.
>
> ⚠️ **REGRA ABSOLUTA:** Ver [SLA Metas](../../governanca/lei/sla-metas/SKILL.md) — meta de **200ms p95 com 50.000 requisições simultâneas**, 99,9% uptime, budget de latência por camada. Os alertas configurados aqui implementam essas metas, não as redefinem.

## Por Que Observabilidade é Obrigatória desde o Início

1. **Depuração Multi-organização:** Identificar qual organização está causando ou sofrendo um erro
2. **Rastreamento de Requests:** Seguir uma request desde o Gateway até o serviço final
3. **Métricas de Saúde:** Saber se um serviço está "vivo" ou "morto" antes do usuário reclamar

---

## Três Pilares de Observabilidade

1. **Logs Estruturados (Logs):** Eventos discretos em formato JSON
2. **Correlation ID (Traces):** Um ID único que viaja com a request por todos os serviços
3. **Health Checks (Metrics):** Endpoints que reportam o estado de saúde do serviço

---

## Pilar 1 — Logs Estruturados

Logs não devem ser texto livre. Devem ser objetos JSON para permitir busca e agregação.

```typescript
// servicos-global/nucleo/logger.ts

interface LogContext {
  correlationId: string
  idOrganizacao?: string
  idUsuario?: string
  idProduto?: string
  service: string
}

export function createLogger(context: LogContext) {
  const base = () => ({
    timestamp: new Date().toISOString(),
    service: context.service,
    correlation_id: context.correlationId,
    id_organizacao: context.idOrganizacao,
    id_usuario: context.idUsuario,
    id_produto: context.idProduto,
  })

  return {
    info: (message: string, extra?: object) =>
      console.log(JSON.stringify({ ...base(), level: 'info', message, ...extra })),

    warn: (message: string, extra?: object) =>
      console.warn(JSON.stringify({ ...base(), level: 'warn', message, ...extra })),

    error: (message: string, err?: Error, extra?: object) =>
      console.error(JSON.stringify({
        ...base(),
        level: 'error',
        message,
        error: err?.message,
        stack: err?.stack,
        ...extra
      }))
  }
}
```

> **Onde os logs vão parar, retenção e log de auditoria:** ver [Observabilidade Mínima](../../governanca/convencao-tecnica/observabilidade-minima/SKILL.md). Esta skill cobre apenas o formato emitido pela aplicação.

---

## Pilar 2 — Correlation ID

O correlation ID é gerado no **primeiro serviço** que recebe o request. É propagado via header `x-id-correlacao` em **toda chamada interna**. Permite rastrear um request de ponta a ponta:

```
produto → organizacao-services → configurador
```

**Middleware obrigatório em todo servidor:**

```typescript
// <servico>/server/src/middlewares/correlation.ts
import { randomUUID } from 'crypto'
import { Request, Response, NextFunction } from 'express'

export function correlationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.correlationId = req.headers['x-id-correlacao'] as string
    || randomUUID()

  res.setHeader('x-id-correlacao', req.correlationId)
  next()
}
```

**Como propagar em chamadas entre serviços:**

```typescript
// Sempre passar o correlation ID nas chamadas para outros serviços
async function callOrganizacaoService(
  endpoint: string,
  correlationId: string,
  token: string
) {
  return fetch(`${process.env.ORGANIZACAO_SERVICES_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-id-correlacao': correlationId,  // ← obrigatório
      'x-chave-interna': process.env.INTERNAL_SERVICE_KEY!
    }
  })
}
```

---

## Health Check — Obrigatório em Todo Servidor

Todo serviço expõe `/health` com verificação de dependências críticas. Em caso de falha de qualquer dependência, retornar `503` para que o UptimeRobot dispare alerta P0.

```typescript
app.get('/health', async (req, res) => {
  const checks = { database: false }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch {}

  const healthy = checks.database
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'down',
    service: 'nome-do-servico',
    checks,
    timestamp: new Date().toISOString(),
  })
})
```

**Nomes de serviço no health check:**

| Serviço | `service` |
|:---|:---|
| Gateway | `gravity-gateway` |
| Configurador | `configurador` |
| Organização Services | `organizacao-services` |
| Simulador Comex | `simulador-comex` |
| Marketplace | `marketplace` |

---

## Sentry — Configuração por Serviço

> Padrões abaixo refletem o **Sentry SDK v8+** (`@sentry/node`). Em v8 a API mudou: integrações agora são funções (`expressIntegration()`, `prismaIntegration()`) e o error handler é registrado via `setupExpressErrorHandler(app)` em vez de `Sentry.Handlers.errorHandler()`.

```typescript
// server/index.ts
import * as Sentry from '@sentry/node'
import express from 'express'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // APM — capturar transações de performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  integrations: [
    Sentry.expressIntegration(),
    Sentry.prismaIntegration({ client: prisma }),
  ],
})

const app = express()

// Contexto de organização após ter auth e correlationId
app.use((req, res, next) => {
  Sentry.setUser({ id: req.auth?.id_usuario })
  Sentry.setTag('id_organizacao', req.auth?.id_organizacao)
  Sentry.setTag('correlation_id', req.correlationId)
  Sentry.setTag('service', 'nome-do-servico')
  next()
})

// ... rotas ...

// Error handler do Sentry — registrado antes do error handler global
Sentry.setupExpressErrorHandler(app)
app.use(errorHandler) // error handler global do antigravity-code-standards
```

---

## Ordem dos Middlewares com Observabilidade

```typescript
// server/index.ts — ordem obrigatória
import * as Sentry from '@sentry/node'

// 1. Sentry — antes de criar o app
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [Sentry.expressIntegration()],
})

const app = express()

// 2. Parse de body
app.use(express.json())

// 3. Correlation ID — primeiro middleware de negócio
app.use(correlationMiddleware)

// 4. Contexto do Sentry — após ter correlationId
app.use((req, res, next) => {
  Sentry.setTag('correlation_id', req.correlationId)
  Sentry.setTag('id_organizacao', req.auth?.id_organizacao)
  next()
})

// 5. Autenticação
app.use(requireAuth)

// 6. Health check — sem autenticação
app.get('/health', healthCheckHandler)

// 7. Rotas de negócio
app.use('/api/v1', rotas)

// 8. Sentry error handler — antes do global
Sentry.setupExpressErrorHandler(app)

// 9. Error handler global — sempre último
app.use(errorHandler)
```

---

## Métricas de Latência — Alertas e APM

> ⚠️ **REGRA ABSOLUTA:** As metas de latência (`p50 ≤ 50ms`, `p95 ≤ 200ms`, `p99 ≤ 500ms`, `error rate < 1%`) e os thresholds vivem em [SLA Metas](../../governanca/lei/sla-metas/SKILL.md). Os alertas abaixo **implementam** essas metas.

### Alertas de Latência no Sentry

Configurar Alert Rules no Sentry Dashboard, alinhados aos thresholds da `sla-metas`:

1. **Alert Rule:** Transaction Duration p95 > 200ms for 5 min → Slack `#alerts`
2. **Alert Rule:** Error Rate > 5% for 5 min → Slack `#alerts` + Email
3. **Alert Rule:** New error type (first seen) → Slack `#errors`

---

## UptimeRobot — Configuração P0

**Regra P0:** se um serviço cair, o responsável é notificado em **menos de 5 minutos**. Trigger: **2 falhas consecutivas** no `/health`.

| Monitor | URL | Intervalo | Alerta |
|:---|:---|:---|:---|
| Configurador | `https://configurador.gravity.com.br/health` | 2 min | Slack + Email |
| Organização Services | `https://organizacao-services.gravity.com.br/health` | 2 min | Slack + Email |
| SimulaCusto | `/health` | 5 min | Slack |
| Bid Frete | `/health` | 5 min | Slack |
| Marketplace | `https://marketplace.gravity.com.br/health` | 5 min | Email |

---

## Checklist — Ao Criar um Novo Servidor

- [ ] `correlationMiddleware` registrado antes das rotas de negócio?
- [ ] Correlation ID propagado via `x-id-correlacao` em toda chamada para outros serviços?
- [ ] Endpoint `/health` implementado com verificação do banco e retornando 503 em falha?
- [ ] Sentry inicializado com `dsn`, `environment`, contexto de organização **e performance** (API v8: `expressIntegration()` + `setupExpressErrorHandler`)?
- [ ] `SENTRY_DSN` documentado no `.env.example`?
- [ ] Logger estruturado usando `createLogger` com todos os campos obrigatórios?
- [ ] Nenhum `console.log` com dados sensíveis — apenas via logger estruturado?
- [ ] Monitor no UptimeRobot configurado para o novo serviço?
- [ ] Alertas de latência p95 > 200ms configurados no Sentry (alinhados a [SLA Metas](../../governanca/lei/sla-metas/SKILL.md))?
- [ ] Métricas obrigatórias do serviço expostas conforme [Observabilidade Mínima](../../governanca/convencao-tecnica/observabilidade-minima/SKILL.md)?
