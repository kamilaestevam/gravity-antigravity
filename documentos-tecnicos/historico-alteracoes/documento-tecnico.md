# Histórico de Alterações — Documento Técnico

> **Versão:** 1.0 — Onda 2  
> **Serviço:** `historico-global`  
> **Porta:** 3001 (super-servidor tenant) — todos os serviços tenant compartilham o mesmo processo  
> **Path base:** `/api/tenant/historico-global`  
> **Banco:** tenant-db (PostgreSQL via Prisma)  
> **Fila:** pg-boss (PostgreSQL-backed job queue)

---

## 1. Visão Geral da Arquitetura

O **historico-global** é um serviço de audit trail imutável para toda a plataforma Gravity. Registra toda ação relevante de usuários, APIs, automações e integrações — sem nunca bloquear a operação que originou o evento.

### Princípios arquiteturais

| Princípio | Implementação |
|-----------|---------------|
| **Fire-and-forget** | Chamadores enfileiram via pg-boss e retornam imediatamente |
| **Imutabilidade** | `HistoryLog` não tem endpoint de UPDATE ou DELETE |
| **Integridade** | Hash SHA-256 calculado no momento da persistência |
| **Isolamento de tenant** | Toda query filtra por `tenant_id`; SUPER_ADMIN/ADMIN têm visão global |
| **Observabilidade** | AlertEngine avalia regras após cada log persisted; notificações multi-canal |

### Fluxo de dados completo

```
Chamador (Controller / Middleware / Produto)
  │
  └─► AuditService.log(input)          ← fire-and-forget, nunca lança
        │
        └─► pg-boss.send('audit:log:ingestion', input)
                │
                └─► [Worker — 10 concorrentes]
                      │
                      ├─► AuditService.persist(input)    ← grava no banco
                      │     └─► Calcula SHA-256 (integrity_hash)
                      │     └─► prisma.historyLog.create(...)
                      │
                      └─► AlertEngine.check(log, logId)  ← assíncrono
                            └─► Para cada regra ativa:
                                  ├─► Filtro actor_type / action / module
                                  ├─► (opcional) COUNT eventos na janela de tempo
                                  ├─► Se disparar → prisma.alertEvent.create(...)
                                  └─► NotificationDispatcher.dispatch(rule, event)
                                        ├─► in-app  (serviço notificacoes)
                                        ├─► email   (serviço email)
                                        └─► WhatsApp (serviço whatsapp)
                                              └─► Retry 3x: 5s → 15s → 45s
```

---

## 2. Stack Tecnológica

| Componente | Tecnologia | Versão |
|-----------|-----------|--------|
| Runtime | Node.js | 24.x |
| Linguagem | TypeScript strict | ESModules |
| Framework HTTP | Express | 4.x |
| ORM | Prisma | 5.x |
| Fila de tarefas | pg-boss | 10.x |
| Validação de schema | Zod | 3.x |
| Autenticação | Clerk (`@clerk/backend`) | — |
| Testes | Vitest + Supertest | 4.x / 7.x |
| Banco | PostgreSQL | 16+ |
| Hash de integridade | crypto (SHA-256, nativo Node) | — |

---

## 3. Estrutura de Arquivos

```
servicos-global/tenant/historico-global/
├── prisma/
│   └── fragment.prisma            ← Schema Prisma do serviço (4 models, 3 enums)
│
├── server/
│   ├── routes.ts                  ← Registro de todas as 10 rotas
│   ├── index.ts                   ← Entry point do servidor standalone
│   │
│   ├── controllers/
│   │   ├── history.controller.ts  ← ingestLog, listLogs, getLogById, exportLogs
│   │   └── alert.controller.ts   ← listAlerts, updateAlert, listRules, CRUD de regras
│   │
│   ├── services/
│   │   ├── audit.service.ts       ← AuditService.log() e AuditService.persist()
│   │   ├── alert-engine.ts        ← AlertEngine.check() e evaluateRule()
│   │   └── notification-dispatcher.ts ← Despacho multi-canal com retry
│   │
│   ├── queue/
│   │   ├── pg-boss.ts             ← Singleton do pg-boss (initPgBoss / getBoss)
│   │   └── audit-worker.ts        ← Worker com 10 concorrentes
│   │
│   ├── lib/
│   │   ├── errors.ts              ← AppError (unauthorized / validation / notFound)
│   │   ├── visibility.ts          ← buildVisibilityFilter / extractAuthUser
│   │   └── securityAuditLogger.ts ← 9 métodos de eventos de segurança
│   │
│   ├── middleware/
│   │   └── audit.ts               ← auditMiddleware() e auditedJob()
│   │
│   └── schemas/
│       └── history.schema.ts      ← Zod schemas de validação
│
└── src/
    ├── Historico.tsx              ← View tenant (React)
    └── audit-client.ts            ← Cliente HTTP leve para produtos
```

---

## 4. Schema Prisma — fragment.prisma

### Model: HistoryLog

```prisma
model HistoryLog {
  id             String      @id @default(cuid())
  tenant_id      String

  // Ator
  actor_type     ActorType
  actor_id       String
  actor_name     String
  actor_ip       String?
  actor_metadata Json?

  // Recurso
  module         String
  resource_type  String
  resource_id    String?

  // Ação
  action         String
  action_detail  String

  // Estado antes/depois (para diff visual)
  before         Json?
  after          Json?

  // Resultado
  status         EventStatus @default(SUCCESS)
  error_message  String?

  // Integridade — SHA-256 calculado no momento da gravação
  integrity_hash String

  // Visibilidade por role
  product_id     String?
  user_id        String?

  created_at     DateTime    @default(now()) @db.Timestamptz

  @@index([tenant_id])
  @@index([tenant_id, product_id])
  @@index([tenant_id, user_id])
  @@index([tenant_id, created_at])
  @@index([tenant_id, module, created_at])
  @@index([actor_id, created_at])
}
```

### Model: AlertRule

```prisma
model AlertRule {
  id                       String     @id @default(cuid())
  tenant_id                String?   // null = regra global Gravity

  name                     String
  description              String?
  enabled                  Boolean    @default(true)

  // Filtro — null = qualquer valor
  actor_type               ActorType?
  action                   String?
  module                   String?
  status_filter            EventStatus?

  // Threshold (opcional): dispara se N eventos em W segundos
  threshold_count          Int?
  threshold_window_seconds Int?

  // Canais de notificação
  channel_inapp            Boolean    @default(true)
  channel_email            Boolean    @default(false)
  channel_whatsapp         Boolean    @default(false)

  // Destinatários por canal
  recipients_email         String[]
  recipients_whatsapp      String[]
  recipients_user_ids      String[]

  created_at               DateTime   @default(now())
  updated_at               DateTime   @updatedAt

  alerts                   AlertEvent[]
  @@index([tenant_id, enabled])
}
```

### Model: AlertEvent

```prisma
model AlertEvent {
  id             String      @id @default(cuid())
  tenant_id      String
  rule_id        String
  rule           AlertRule   @relation(fields: [rule_id], references: [id])

  actor_type     ActorType
  actor_id       String
  actor_name     String
  module         String
  action         String
  event_count    Int         // Quantos eventos foram detectados
  window_seconds Int         // Janela de tempo (0 = sem threshold)
  audit_log_ids  String[]    // IDs dos logs que dispararam o alerta

  status         AlertStatus @default(PENDING)
  reviewed_by    String?
  reviewed_at    DateTime?
  notes          String?

  created_at     DateTime    @default(now())
  notifications  AlertNotificationLog[]

  @@index([tenant_id, status])
  @@index([tenant_id, created_at])
}
```

### Model: AlertNotificationLog

```prisma
model AlertNotificationLog {
  id             String     @id @default(cuid())
  alert_event_id String
  alert_event    AlertEvent @relation(fields: [alert_event_id], references: [id])

  channel        String     // 'inapp' | 'email' | 'whatsapp'
  recipient      String
  status         String     @default("pending")  // pending | sent | failed
  attempts       Int        @default(1)
  error_message  String?
  sent_at        DateTime?

  created_at     DateTime   @default(now())
  @@index([alert_event_id])
}
```

### Enums

```prisma
enum ActorType  { USER  API  AI  JOB  INTEGRATION }
enum EventStatus { SUCCESS  FAILURE  PARTIAL }
enum AlertStatus { PENDING  REVIEWED  ESCALATED }
```

---

## 5. API — Endpoints

Todos os endpoints requerem `x-tenant-id` no header. Rotas de gerenciamento requerem autenticação via Clerk (`Authorization: Bearer <jwt>`).

### Logs

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| `POST` | `/logs` | Enfileirar novo evento | `x-tenant-id` |
| `GET` | `/logs` | Listar logs com filtros e paginação cursor | Clerk |
| `GET` | `/logs/:id` | Detalhe de um log específico | Clerk |
| `GET` | `/logs/export` | Exportar logs (CSV ou JSON) | Clerk |

#### POST /logs — payload

```ts
{
  actor_type:   'USER' | 'API' | 'AI' | 'JOB' | 'INTEGRATION'
  actor_id:     string       // ID do usuário/sistema que agiu
  actor_name:   string       // Nome legível para exibição
  actor_ip?:    string
  actor_metadata?: Record<string, unknown>

  module:        string      // 'pedido' | 'cotacao' | 'auth' | etc.
  resource_type: string      // 'Pedido' | 'Cotação' | 'Usuário' | etc.
  resource_id?:  string

  action:        string      // 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | etc.
  action_detail: string      // Descrição human-readable do que aconteceu

  before?:       unknown     // Estado anterior (para diff)
  after?:        unknown     // Estado posterior (para diff)

  status?:       'SUCCESS' | 'FAILURE' | 'PARTIAL'
  error_message?: string

  product_id?:  string
  user_id?:     string
}
```

**Resposta:** `202 Accepted { accepted: true }` — o log é enfileirado, não persistido sincronamente.

#### GET /logs — filtros disponíveis

```
?actor_type=USER
?actor_id=user-123
?module=pedido
?resource_type=Pedido
?resource_id=pedido-456
?action=DELETE
?status=SUCCESS
?product_id=bid-frete
?startDate=2026-01-01T00:00:00Z
?endDate=2026-03-31T23:59:59Z
?search=João                  // busca em action_detail, actor_name, resource_type
?cursor=2026-02-01T10:00:00Z  // paginação cursor-based (created_at)
?limit=50                     // 1-100, default 50
```

**Resposta:**
```json
{
  "data": [...],
  "meta": { "hasMore": true, "nextCursor": "2026-01-15T09:00:00Z", "limit": 50 }
}
```

#### GET /logs/export

```
?format=csv|json   (default: csv)
+ todos os filtros do GET /logs (exceto cursor e limit)
```

- `≤ 10.000 registros` → resposta inline (CSV ou JSON)
- `> 10.000 registros` → `202 Accepted { message, count }` — job em background (TODO: download link)

### Alertas

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/alerts` | Listar eventos de alerta (com filtro por status) |
| `PATCH` | `/alerts/:id` | Atualizar status do alerta (`REVIEWED` ou `ESCALATED`) |
| `GET` | `/alert-rules` | Listar regras de alerta configuradas |
| `POST` | `/alert-rules` | Criar nova regra de alerta |
| `PUT` | `/alert-rules/:id` | Atualizar regra existente |
| `DELETE` | `/alert-rules/:id` | Excluir regra |

---

## 6. AuditService

```ts
// servicos-global/tenant/historico-global/server/services/audit.service.ts

export const AuditService = {
  // Chamado pelos produtos/serviços — fire-and-forget
  async log(input: AuditLogInput): Promise<void> {
    try {
      const boss = getBoss()
      await boss.send('audit:log:ingestion', input, {
        retryLimit: 3,
        retryDelay: 5,
        retryBackoff: true,
      })
    } catch (error) {
      console.error('[AuditService] Falha ao enfileirar log:', error)
      // Nunca relança — nunca bloqueia a operação principal
    }
  },

  // Chamado exclusivamente pelo worker — nunca pelos serviços
  async persist(input: AuditLogInput): Promise<string> {
    const createdAt = new Date()
    const integrity_hash = computeIntegrityHash(input, createdAt)
    const log = await prisma.historyLog.create({ data: { ...input, integrity_hash, created_at: createdAt } })
    return log.id
  },
}
```

### Cálculo do integrity_hash

```ts
function computeIntegrityHash(input: AuditLogInput, createdAt: Date): string {
  const payload = JSON.stringify({
    tenant_id, actor_type, actor_id,
    module, resource_type, resource_id,
    action, action_detail, before, after, status,
    created_at: createdAt.toISOString(),
  })
  return createHash('sha256').update(payload).digest('hex')
}
```

Campos incluídos: todos os campos semanticamente relevantes. Campos excluídos: `id` (gerado após), `actor_name` (mutável), `actor_ip`, `actor_metadata`, `error_message`, `product_id`, `user_id`.

---

## 7. pg-boss — Fila de Ingestão

### Inicialização (singleton)

```ts
// server/queue/pg-boss.ts
let boss: PgBoss

export async function initPgBoss(databaseUrl: string): Promise<PgBoss> {
  if (boss) return boss
  boss = new PgBoss(databaseUrl)
  boss.on('error', (error) => console.error('[historico:pg-boss]', error))
  await boss.start()
  return boss
}
```

### Bootstrap no Configurador

```ts
// servicos-global/configurador/server/index.ts — dentro do app.listen(PORT, async () => { ... })

const tenantDbUrl = process.env.TENANT_DATABASE_URL
if (tenantDbUrl) {
  const { initPgBoss } = await import('../../tenant/historico-global/server/queue/pg-boss.js')
  const { startAuditWorker } = await import('../../tenant/historico-global/server/queue/audit-worker.js')
  await initPgBoss(tenantDbUrl)
  await startAuditWorker()
}
```

### Worker

```ts
// server/queue/audit-worker.ts
export async function startAuditWorker(): Promise<void> {
  const boss = getBoss()
  await boss.work<AuditLogInput>(
    'audit:log:ingestion',
    { teamSize: 10, teamConcurrency: 10 },
    async (job) => {
      const logId = await AuditService.persist(job.data)
      AlertEngine.check(job.data, logId).catch(console.error)
    }
  )
}
```

**Nome da fila:** `audit:log:ingestion`  
**Concorrência:** 10 workers paralelos  
**Retry do pg-boss:** até 3 tentativas com backoff exponencial (configurado no `boss.send`)

---

## 8. AlertEngine

O `AlertEngine.check()` é chamado de forma assíncrona pelo worker após cada `persist()`. Falhas não afetam a persistência do log.

### Lógica de avaliação

```
Para cada regra ativa (tenant_id = tenant OU null = global):
  1. Verificar filtro de actor_type (null = aceita qualquer)
  2. Verificar filtro de action     (null = aceita qualquer)
  3. Verificar filtro de module     (null = aceita qualquer)

  SE tem threshold:
    COUNT logs do mesmo ator/ação/módulo no período (created_at >= now - window_seconds)
    SE count < threshold → não dispara
    SE count >= threshold:
      → criar AlertEvent
      → chamar NotificationDispatcher.dispatch()

  SE não tem threshold:
    → criar AlertEvent imediatamente (event_count = 1, window_seconds = 0)
    → chamar NotificationDispatcher.dispatch()
```

### Tipos de regras

| Tipo | Uso típico |
|------|-----------|
| **Sem threshold** | Cross-tenant attempt, webhook signature failure — dispara no primeiro match |
| **Com threshold** | Ação em massa (ex: ≥ 10 DELETEs em 60s), múltiplos logins falhos |

---

## 9. NotificationDispatcher

```ts
// server/services/notification-dispatcher.ts

// Canais suportados
if (rule.channel_inapp) → POST /api/v1/notificacoes/internal (serviço notificacoes)
if (rule.channel_email) → POST /api/v1/email/send (serviço email)
if (rule.channel_whatsapp) → POST /api/v1/whatsapp/send (serviço whatsapp)

// Retry por canal
const RETRY_DELAYS_MS = [5_000, 15_000, 45_000]
// 3 tentativas: imediata → +5s → +15s → +45s
// Após falha definitiva: grava status='failed' em AlertNotificationLog
```

Todos os canais disparam em paralelo (`Promise.allSettled`). Falha em um canal não impede os outros. Cada tentativa é registrada em `AlertNotificationLog` com status `pending → sent | failed`.

---

## 10. Filtro de Visibilidade

```ts
// server/lib/visibility.ts

export function buildVisibilityFilter(user: AuthUser): Prisma.HistoryLogWhereInput {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return {}  // Sem filtro — veem toda a plataforma
  }
  if (user.role === 'MASTER') {
    return { tenant_id: user.tenant_id }  // Toda a organização
  }
  return { tenant_id: user.tenant_id, user_id: user.id }  // Apenas os próprios
}
```

| Role | Visibilidade |
|------|-------------|
| `SUPER_ADMIN` | Todos os tenants e logs |
| `ADMIN` | Todos os tenants e logs |
| `MASTER` | Todos os logs do próprio tenant |
| `STANDARD` | Apenas logs onde `user_id = auth.userId` |
| `SUPPLIER` | Apenas logs onde `user_id = auth.userId` |

---

## 11. securityAuditLogger

Utilitário para logar eventos de segurança específicos. Dual write: AuditService (fila) + POST ao Configurador `/api/admin/security/events` para o painel de segurança.

```ts
// server/lib/securityAuditLogger.ts

export const securityAudit = {
  permissionChanged(tenantId, actorId, { targetUserId, permission, action })
  roleChanged(tenantId, actorId, { targetUserId, oldRole, newRole })          // severity: CRITICAL
  crossTenantAttempt(tenantId, actorId, { targetTenantId, resource, blocked }) // severity: CRITICAL
  authFailure(tenantId, { ip, reason, endpoint })
  rateLimitHit(tenantId, { ip, endpoint, count })
  credentialOperation(tenantId, actorId, { operation, credentialType, credentialId })
  adminAccess(tenantId, adminId, { targetTenantId, resource, action })
  webhookSignatureFailure(tenantId, { source, ip, reason })                   // severity: CRITICAL
  dataDeleted(tenantId, actorId, { targetUserId, tablesAffected, recordCount, reason })
  apiKeyUsed(tenantId, apiKeyId, { module, endpoint, ip })
}
```

Uso no Configurador (exemplo — troca de role):
```ts
import { securityAudit } from '../../../tenant/historico-global/server/lib/securityAuditLogger.js'

// Após prisma.user.update({ role: ... })
securityAudit.roleChanged(req.auth.tenantId, req.auth.userId, {
  targetUserId: req.params.id,
  oldRole: user.role,
  newRole: parsed.data.role,
}).catch(() => {})
```

---

## 12. auditMiddleware

Middleware Express que instrumenta rotas automaticamente, sem alterar o código de negócio.

```ts
// server/middleware/audit.ts

export function auditMiddleware(opts: {
  module: string
  resource_type: string
  action: string
  getDetail?: (req: Request, res: Response) => string
  getBefore?: (req: Request) => unknown
  getAfter?: (req: Request, res: Response) => unknown
}): RequestHandler

// Uso em rotas Express
router.post('/pedidos', auditMiddleware({
  module: 'pedido',
  resource_type: 'Pedido',
  action: 'CREATE',
  getDetail: (req) => `Criou pedido para cliente ${req.body.cliente}`,
  getAfter: (_req, res) => res.locals.createdPedido,
}), createPedido)

// Wrapper para workers pg-boss
export async function auditedJob(
  name: string,
  tenantId: string,
  fn: () => Promise<void>
): Promise<void>
```

---

## 13. audit-client — Uso em Produtos

Para produtos que não têm acesso direto ao AuditService (isolamento), existe o `audit-client`:

```ts
// servicos-global/tenant/historico-global/src/audit-client.ts

import { auditLog } from '../historico-global/src/audit-client'

// Fire-and-forget — nunca lança, nunca bloqueia
auditLog({
  tenant_id: req.auth.tenantId,
  actor_type: 'USER',
  actor_id: req.auth.userId,
  actor_name: req.auth.userName,
  module: 'cotacao',
  resource_type: 'Cotação',
  resource_id: cotacaoId,
  action: 'APPROVE',
  action_detail: `Cotação #${cotacaoId} aprovada`,
  before: cotacaoAntes,
  after: cotacaoDepois,
})
```

**Variáveis de ambiente:**  
- `HISTORICO_URL` ou `CONFIGURADOR_URL` — URL do servidor (default: `http://localhost:8005`)
- `INTERNAL_SERVICE_KEY` — chave de autenticação inter-serviço

---

## 14. Variáveis de Ambiente

| Variável | Obrigatória | Uso |
|----------|-------------|-----|
| `TENANT_DATABASE_URL` | Sim (Configurador) | pg-boss e Prisma para o banco tenant |
| `INTERNAL_SERVICE_KEY` | Sim | Autenticação inter-serviço (`x-internal-key`) |
| `EMAIL_SERVICE_URL` | Não | URL do serviço de email para notificações |
| `WHATSAPP_SERVICE_URL` | Não | URL do serviço de WhatsApp para notificações |
| `NOTIFICACOES_SERVICE_URL` | Não | URL do serviço de notificações in-app |
| `CONFIGURADOR_URL` | Não | Para securityAuditLogger postar no painel de segurança |
| `HISTORICO_URL` | Não | Para audit-client (default = CONFIGURADOR_URL) |
| `ADMIN_URL` | Não | Para links no email de alerta |

---

## 15. Frontend — Telas

### Admin — `HistoricoGlobalAdmin.tsx`

**Rota:** `/admin/historico`  
**Arquivo:** `servicos-global/configurador/src/pages/admin/HistoricoGlobalAdmin.tsx`

Funcionalidades:
- Tabela de logs com paginação cursor-based e scroll infinito
- Filtros: tipo de ator, módulo, ação, status, período (CalendarioCampoGlobal), busca full-text
- Detalhe do log: tab "Antes/Depois" (diff visual JSON) + tab "Detalhes" (metadados completos)
- Drawer `PainelAlertas`: visualização e gestão de AlertEvent + AlertRule
- Exportação CSV/JSON
- i18n: `admin.history.*` — 7 idiomas (pt, en, es, de, it, zh, ar)

### Tenant — `Historico.tsx`

**Rota:** `/core/historico`  
**Arquivo:** `servicos-global/tenant/historico-global/src/Historico.tsx`

Funcionalidades:
- Visão equivalente ao admin, filtrada pela visibilidade do role do usuário
- Sem gestão de alertas (responsabilidade do admin/master)
- Endpoint: `/api/tenant/historico-global/logs`

---

## 16. i18n

Namespace: `admin.history`

**Idiomas implementados:**
| Idioma | Arquivo | Status |
|--------|---------|--------|
| Português | `locales/pt.json` | Completo (idioma base) |
| Inglês | `locales/en.json` | Completo |
| Espanhol | `locales/es.json` | Completo |
| Alemão | `locales/de.json` | Completo |
| Italiano | `locales/it.json` | Completo |
| Chinês | `locales/zh.json` | Completo |
| Árabe | `locales/ar.json` | Completo (RTL) |

Exemplo de chaves (`pt.json`):
```json
"admin.history": {
  "title": "Histórico Global",
  "filter.actorType": "Tipo de Ator",
  "actor.user": "Usuário",
  "action.create": "Criação",
  "status.success": "Sucesso",
  "export.csv": "Exportar CSV",
  "alert.status.pending": "Pendente",
  ...
}
```

---

## 17. Testes

### Arquivos de teste

| Arquivo | Cobertura | Testes |
|---------|-----------|--------|
| `schemas.test.ts` | Validação Zod (IngestHistory, ListQuery, AlertRule...) | 20 |
| `visibility.test.ts` | buildVisibilityFilter por role | 8 |
| `errors.test.ts` | AppError, errorHandler, códigos HTTP | 10 |
| `history.controller.test.ts` | POST /logs, GET /logs, GET /:id, export | 13 |
| `alert.controller.test.ts` | CRUD AlertRule, PATCH AlertEvent | 12 |
| `alert-engine.test.ts` | AlertEngine.check(), filtros, threshold | 7 |
| **Total** | | **80 testes** |

**Cobertura:** ≥ 70% em linhas, funções, branches e statements (threshold configurado no vitest.config.ts).

### Executar testes

```bash
npx vitest run --config testes/historico-global/vitest.config.ts
```

### Estratégia de mock

- `PrismaClient` mockado com `vi.fn().mockImplementation(function() { return mockPrisma })` (**regular function, não arrow** — arrow function não é construtora válida)
- `AuditService`, `NotificationDispatcher` e `visibility` mockados por módulo via `vi.mock()`
- App Express construído in-process via `supertest` — sem servidor HTTP real

---

## 18. Decisões Técnicas

### Por que pg-boss e não um pub/sub externo (Redis, RabbitMQ)?

O Gravity usa PostgreSQL como único banco por tenant. O pg-boss usa uma tabela no próprio banco, eliminando dependência de infraestrutura adicional. Isso também garante que jobs e dados ficam no mesmo banco — consistência sem transações distribuídas.

### Por que `created_at` como cursor em vez de `id` (UUID)?

UUIDs não têm ordem cronológica. Usar `created_at` como cursor permite paginação temporal natural, que é o que o usuário espera ao navegar no histórico. O campo usa `@db.Timestamptz` (com timezone) para precisão.

### Por que `before/after` como `Json?` e não campos tipados?

Cada módulo tem estruturas de dados completamente diferentes. Armazenar como JSON permite que qualquer produto envie seu estado sem schema compartilhado, enquanto o frontend renderiza o diff de forma genérica.

### Por que `integrity_hash` exclui `actor_name`?

`actor_name` é um dado de exibição que pode mudar (ex: usuário troca nome no Clerk). O hash cobre o que identifica a ação: quem fez (`actor_id`), o quê (`action`, `action_detail`, `before`, `after`), quando (`created_at`), e onde (`tenant_id`, `module`, `resource_type`).

### Por que `AlertRule.tenant_id` é nullable?

Regras com `tenant_id = null` são globais da Gravity (ex: "disparar alerta em toda ação CROSS_TENANT"). Regras com `tenant_id` configurado são específicas de um cliente. O `AlertEngine` busca ambas em uma única query com `OR`.

### Por que `NotificationDispatcher` usa `Promise.allSettled` e não `Promise.all`?

`Promise.allSettled` garante que falha em email não cancela o envio de WhatsApp e in-app. Cada canal é independente. O resultado de cada tentativa fica registrado em `AlertNotificationLog`.
