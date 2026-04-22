---
name: antigravity-observabilidade
description: "Use esta skill sempre que uma tarefa envolver logs, monitoramento, health checks, rastreamento de requests entre serviços ou configuração de Sentry e UptimeRobot. Define o padrão de correlation ID, estrutura de logs, health check obrigatório e roadmap de distributed tracing. Todo agente consulta esta skill ao criar ou modificar qualquer servidor Express."
---

# Gravity — Observabilidade

Sem observabilidade, não conseguimos depurar problemas em produção, especialmente em uma arquitetura multi-organização e distribuída.

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
// shared/logger.ts

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

---

## Pilar 2 — Correlation ID

O correlation ID é gerado no **primeiro serviço** que recebe o request. É propagado via header `x-correlation-id` em **toda chamada interna**. Permite rastrear um request de ponta a ponta:

```
produto → tenant-services → configurador
```

**Middleware obrigatório em todo servidor:**

```typescript
// middleware/correlation.ts
import { randomUUID } from 'crypto'
import { Request, Response, NextFunction } from 'express'

export function correlationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.correlationId = req.headers['x-correlation-id'] as string
    || randomUUID()

  res.setHeader('x-correlation-id', req.correlationId)
  next()
}
```

**Como propagar em chamadas entre serviços:**

```typescript
// Sempre passar o correlation ID nas chamadas para outros serviços
async function callTenantService(
  endpoint: string,
  correlationId: string,
  token: string
) {
  return fetch(`${process.env.TENANT_SERVICES_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-correlation-id': correlationId,  // ← obrigatório
      'x-internal-key': process.env.INTERNAL_SERVICE_KEY!
    }
  })
}
```

---

## Pilar 3 — Distributed Tracing (Fase 2)

Implementado na Fase 2 com OpenTelemetry SDK no Node.js. Exporta para Grafana Cloud (free tier) ou Jaeger.

---

## Health Check — Obrigatório em Todo Servidor

```typescript
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      service: 'nome-do-servico',
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    res.status(503).json({
      status: 'down',
      service: 'nome-do-servico',
      timestamp: new Date().toISOString()
    })
  }
})
```

**Nomes de serviço no health check:**

| Serviço | `service` |
|:---|:---|
| Gateway | `gravity-gateway` |
| Configurador | `configurador` |
| Tenant Services | `tenant-services` |
| Simulador Comex | `simulador-comex` |
| Marketplace | `marketplace` |

---

## Sentry — Configuração por Serviço

```typescript
// server/index.ts
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})

// Antes de todas as rotas
app.use(Sentry.Handlers.requestHandler())

// Contexto de organização após ter auth e correlationId
app.use((req, res, next) => {
  Sentry.setUser({ id: req.auth?.id_usuario })
  Sentry.setTag('id_organizacao', req.auth?.id_organizacao)
  Sentry.setTag('correlation_id', req.correlationId)
  Sentry.setTag('service', 'nome-do-servico')
  next()
})

// ... rotas ...

// Antes do error handler global
app.use(Sentry.Handlers.errorHandler())
app.use(errorHandler) // error handler global do antigravity-code-standards
```

---

## UptimeRobot — Monitors a Configurar

| Monitor | URL | Intervalo |
|:---|:---|:---|
| Configurador | `https://configurador.gravity.com.br/health` | 5 min |
| Tenant Services | `https://tenant-services.gravity.com.br/health` | 5 min |
| Simulador Comex | `https://simulador-comex.gravity.com.br/health` | 5 min |
| Marketplace | `https://marketplace.gravity.com.br/health` | 5 min |

---

## Ordem dos Middlewares com Observabilidade

```typescript
// server/index.ts — ordem obrigatória
const app = express()

// 1. Sentry — antes de tudo
Sentry.init({ dsn: process.env.SENTRY_DSN })
app.use(Sentry.Handlers.requestHandler())

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
app.use(Sentry.Handlers.errorHandler())

// 9. Error handler global — sempre último
app.use(errorHandler)
```

---

## Métricas de Latência — p95/p99 (Dream Team)

### Metas de SLA

| Métrica | Meta | Alerta quando |
|:---|:---|:---|
| Latência p50 | ≤ 50ms | > 100ms por 5 min |
| Latência p95 | ≤ 200ms | > 200ms por 5 min |
| Latência p99 | ≤ 500ms | > 500ms por 5 min |
| Error rate | < 1% | > 1% por 5 min |

### Configuração de Performance no Sentry

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // APM — capturar transações de performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  integrations: [
    new Sentry.Integrations.Express({ app }),
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
})
```

### Alertas de Latência no Sentry

Configurar alertas no Sentry Dashboard:
1. **Alert Rule:** Transaction Duration p95 > 200ms for 5 min → Slack #alerts
2. **Alert Rule:** Error Rate > 5% for 5 min → Slack #alerts + Email
3. **Alert Rule:** New error type (first seen) → Slack #errors

---

## Health Check P0 — Notificação em < 5 min (Dream Team)

**Regra P0:** se um serviço cair, o responsável é notificado em **menos de 5 minutos**.

### Health Check com dependências

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

### UptimeRobot — Configuração P0

| Monitor | URL | Intervalo | Alerta |
|:---|:---|:---|:---|
| Configurador | `/health` | 2 min | Slack + Email |
| Tenant Services | `/health` | 2 min | Slack + Email |
| SimulaCusto | `/health` | 5 min | Slack |
| Bid Frete | `/health` | 5 min | Slack |
| Marketplace | `/health` | 5 min | Email |

> **2 falhas consecutivas** → notificação imediata.

---

## Checklist — Ao Criar um Novo Servidor

- [ ] `correlationMiddleware` registrado antes das rotas de negócio?
- [ ] Correlation ID propagado via `x-correlation-id` em toda chamada para outros serviços?
- [ ] Endpoint `/health` implementado com verificação do banco?
- [ ] Sentry inicializado com `dsn`, `environment`, contexto de organização **e performance**?
- [ ] `SENTRY_DSN` documentado no `.env.example`?
- [ ] Logger estruturado usando `createLogger` com todos os campos obrigatórios?
- [ ] Nenhum `console.log` com dados sensíveis — apenas via logger estruturado?
- [ ] Monitor no UptimeRobot configurado para o novo serviço?
- [ ] Alertas de latência p95 > 200ms configurados no Sentry?
- [ ] Health check P0 com verificação de dependências?
