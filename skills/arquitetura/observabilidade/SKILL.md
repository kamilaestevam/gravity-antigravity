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

## Audit Trail Centralizado — `auditLog()`

Toda ação de domínio (criar/atualizar/excluir pedido, transferência, edição em massa, mudança de status) **deve** emitir audit via `auditLog()` do pacote `@gravity/historico/audit-client`.

### Arquitetura

- **Transporte:** HTTP POST fire-and-forget (não aguarda resposta, não bloqueia transação).
- **Endpoint:** serviço `historico-global` (`/api/v1/historico/logs`).
- **Idempotência:** retry automático até 3 tentativas com backoff exponencial em erros 5xx/rede; descarte em 4xx (payload inválido).
- **Headers obrigatórios:** `x-id-organizacao` (do payload) e `x-internal-key` (chave inter-serviço).

### Payload (todos os campos em DDD PT-BR)

```ts
import { auditLog } from '@gravity/historico/audit-client'

auditLog({
  id_organizacao,                                 // FK glossário (sem sufixo)

  tipo_ator_historico_log: 'USUARIO',             // USUARIO | API | IA | JOB | INTEGRACAO
  id_ator_historico_log: idUsuario,
  nome_ator_historico_log: nomeUsuario,
  ip_ator_historico_log: req.ip,
  metadata_ator_historico_log: { user_agent, correlation_id, method },

  modulo_historico_log: 'pedido',                 // pedido | cadastros | configurador | …
  tipo_recurso_historico_log: 'Pedido',           // tipo do recurso afetado
  id_recurso_historico_log: idPedido,

  acao_historico_log: 'TRANSFERIR',               // CRIAR | ATUALIZAR | EXCLUIR | TRANSFERIR | …
  detalhe_acao_historico_log: `Transferiu pedido #${idPedido}`,

  estado_anterior_historico_log: pedidoAntes,     // snapshot antes da mutação
  estado_posterior_historico_log: pedidoDepois,   // snapshot depois

  status_historico_log: 'SUCESSO',                // SUCESSO | FALHA | PARCIAL
  mensagem_erro_historico_log: undefined,

  id_produto_historico_log: 'pedido',             // discriminador do produto
  id_usuario: idUsuario,                          // FK glossário (sem sufixo)
})
```

### Regras

- **Proibido** criar tabela `<produto>_historico` local. Em 2026-04-30 a tabela órfã `pedido_historico` foi removida — todos os eventos vão pro `historico-global`.
- **Proibido** aguardar `auditLog()` com `await` em path crítico — perderia o benefício fire-and-forget.
- **Proibido** usar nomes em inglês na chamada (`tenant_id`, `actor_type`). Refactor 2026-05-02 padronizou tudo em DDD.
- **Proibido** gravar `nome_ator_historico_log` com o cuid do usuário. Sempre passar `req.auth.nome_usuario` (ou label literal `'system'`/`'webhook'`/`'anonymous'` para atores não-humanos). Mandamento 08 — fix db533a8d (configurador) e Frente A 2026-05-05 (securityAuditLogger + produto/pedido).

### Detalhe da ação — diff X→Y automático (Frente B 2026-05-05)

A partir desta entrega, `detalhe_acao_historico_log` deve ser gerado pelas
funções utilitárias do nucleo-global em vez de concatenação ad-hoc:

```ts
import {
  compararEstadosHistoricoLog,
  montarDetalheAcaoHistoricoLog,
} from '@nucleo/montar-detalhe-acao-historico-log'

// Snapshot ANTES da mutação
const estado_anterior = await prisma.workspace.findUnique({ where: { id_workspace } })
const workspace = await organizacaoService.updateWorkspace(...)

// Diff X→Y automático: ['Nome: "X" → "Y"', 'Status: "Inativo" → "Ativo"']
const diff_campos = compararEstadosHistoricoLog(estado_anterior, workspace, 'Workspace')

// Texto final pra coluna "Detalhes" da tela /workspace/historico-organizacao
const detalhe_acao_historico_log = montarDetalheAcaoHistoricoLog(
  'Atualizou', 'Workspace', workspace.nome_workspace, diff_campos,
)
// → 'Atualizou workspace "CDE Importador" — Nome: "X" → "Y"; Status: "Inativo" → "Ativo"'
```

**Caller obrigatório:** capturar `estado_anterior` antes da mutação (geralmente
um `findUnique` antes do `update`) e passar ambos no `AuditService.log`. Os
módulos `@nucleo/labels-campos-historico-log` e
`@nucleo/formatar-valor-historico-log` cuidam dos rótulos PT-BR de campo e
valor (incluindo enum: `PADRAO` → `'Padrão'`, `ATIVO` → `'Ativo'`).

**DEPRECATED:** concatenação manual tipo `\`Atualizou X: ${Object.keys(...).join(', ')}\``
fica como fallback temporário em rotas que ainda não foram migradas — devem
ser substituídas pelos utilitários acima.

### Implementações de referência

- `servicos-global/configurador/server/routes/me.ts` (PATCH workspace — usa diff X→Y)
- `servicos-global/configurador/server/routes/organizacao.ts` (PATCH /me — usa diff X→Y)
- `servicos-global/produto/pedido/server/src/services/transferirService.ts`
- `servicos-global/produto/pedido/server/src/services/duplicarExcluirService.ts`
- `servicos-global/produto/pedido/server/src/services/edicaoEmMassaService.ts`
- `servicos-global/produto/pedido/server/src/routes/consolidacoes-pedido.ts`

### Auto-instrumentação opcional

Para registrar automaticamente todas as mutações HTTP (POST/PUT/PATCH/DELETE) sem mexer em cada rota, use o `createProductAuditPlugin` do `@gravity/historico/product-audit-plugin`. Aplica antes do `app.use(routes)` e captura o `res.json()` para emitir audit.

Para routers Express já protegidos por `requireAuth`/`requireGravityAdmin` (ex.: `/api/v1/admin/*`), use o `auditMiddleware` de `historico-global/server/middleware/audit.ts` — recebe `req.auth` populado e captura ator/IP/método/status/body redatado.

#### `auditMiddleware` — sanitização obrigatória (atualizado 2026-05-03)

A interface aceita `sensitiveFields?: readonly string[]` e `captureBody?: boolean`. Sem `sensitiveFields`, aplica `DEFAULT_SENSITIVE_FIELDS` (password, senha, token, secret, api_key, apiKey, authorization, webhook_secret, webhookSecret, chave_api, clerk_secret, clerkSecret) — match case-insensitive, recursivo em objetos aninhados e arrays. Conforme skill `seguranca/seguranca-5-camadas` (camada 5).

```ts
adminRouter.use(auditMiddleware({
  modulo_historico_log: 'admin',
  tipo_recurso_historico_log: 'admin_action',   // fallback
  acao_historico_log: 'ADMIN_ACTION',
  tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
  resourceTypeFromPath: (req) => deriveResource(req.path), // opcional, precedência sobre o estático
  // sensitiveFields: ['cpf', ...DEFAULT_SENSITIVE_FIELDS], // estender se necessário
  // captureBody: false,  // omite estado_posterior_historico_log
}))
```

Para passar lista customizada **somando** ao default, espalhar `[...DEFAULT_SENSITIVE_FIELDS, 'cpf']`. Se passar lista nova, ela substitui o default — atenção a regressão.

Implementação de referência: `servicos-global/configurador/server/routes/admin.ts` (mount em `/api/v1/admin/*`).

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
