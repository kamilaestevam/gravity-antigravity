# `@gravity/tenant-resolver` — Referência Técnica Completa

> **Versão:** 0.1.0 (Sprint 1 — 2026-04-18)
> **ADRs:** [ADR-001 Schema-per-Tenant](../adr/ADR-001-schema-per-tenant.md) · [ADR-002 SDK Contract](../adr/ADR-002-tenant-resolver-sdk.md)

Este documento é a fonte de verdade para o pacote `@gravity/tenant-resolver`. Qualquer agente que tocar banco de dados de produto ou serviço-tenant **deve** ler este documento antes de escrever código.

---

## Por Que Este SDK Existe

O pivô "Risco Zero" (2026-04-17) substituiu o modelo `WHERE tenant_id = ?` por **Schema-per-Tenant**: cada empresa recebe um schema PostgreSQL exclusivo (`tenant_<cuid>`). Isso elimina o vazamento cross-tenant mesmo diante de bugs de aplicação.

O SDK é o **único** caminho para qualquer código de produto/serviço acessar o banco. Ele garante:

1. `SET LOCAL search_path TO "tenant_<id>", public` executado dentro de `$transaction` (impossível vazar via pool — a garantia é **do banco**)
2. Tipagem `TenantDatabase` que remove métodos perigosos da superfície (`$transaction`, `$connect`, etc.)
3. Identidade do tenant via Configurador (`GET /api/internal/users/:userId`), nunca do `publicMetadata` Clerk
4. Cache in-memory com TTL e invalidação por tenant/usuário
5. Observabilidade: log de erro + span por `withTenant`

---

## Instalação e Versão

```bash
# No package.json do produto/serviço:
"@gravity/tenant-resolver": "workspace:*"

# Versão do Vitest local (compatível com vite@5 do monorepo):
"vitest": "^2.0.0"   # vitest@4 do root requer vite@6 — instalar localmente
```

---

## Exports Públicos

```typescript
import {
  tenantResolver,           // Express middleware factory (1× por servidor)
  withTenant,               // Wrapper para handlers Express (path HTTP)
  withTenantContext,        // Wrapper para CRONs/workers (sem req)
  AppError,                 // Classe de erro tipado
  type TenantContext,       // Contexto resolvido: tenantId, schemaName, roles, userId, correlationId
  type TenantDatabase,      // Tipo do db dentro do callback (= Prisma.TransactionClient menos métodos de engine)
  type ResolverConfig,      // Config do tenantResolver()
  type ProductKey,          // 'pedido' | 'processo' | 'simula-custo' | ...
  type PrismaTransactionClient, // Alias legacy de TenantDatabase
} from '@gravity/tenant-resolver'
```

### O que **NÃO** é exportado (proibido fora do SDK)

| Símbolo | Razão |
|:---|:---|
| `PrismaClient` | Encapsulado em `_internalPrisma` (privado) |
| `buildSchemaName` | Uso interno — não exposta para evitar construção manual fora do SDK |
| `_internalPrisma` | Singleton privado — nunca compartilhar |
| `TenantCache` | Implementação interna de cache |
| `createConfiguradorClient` | Fábrica interna — use o SDK completo |

---

## Tipos Públicos

### `TenantContext`

Contexto resolvido pelo middleware. Disponível em `req.tenant` após o middleware rodar.

```typescript
interface TenantContext {
  tenantId:     string     // UUID do tenant (igual ao Configurador)
  schemaName:   string     // "tenant_<32hex>" — ex: "tenant_550e8400e29b41d4a716446655440000"
  workspaceId?: string     // Workspace ativo (opcional)
  userId:       string     // UUID do usuário Clerk
  roles:        string[]   // Ex: ['PEDIDO_READ', 'PEDIDO_WRITE']
  correlationId: string    // UUID gerado por request — propagar em logs/spans
}
```

> **Atenção:** `tenantId` (não `id`). `roles` (não `permissions`). Não há campos `email` ou `permissions` — versão 0.1.0.

### `TenantDatabase`

```typescript
// Prisma.TransactionClient sem métodos de controle de engine.
type TenantDatabase = Omit<
  Prisma.TransactionClient,
  '$transaction' | '$connect' | '$disconnect' | '$on' | '$use' | '$extends'
>
```

| Método | Disponível? | Nota |
|:---|:---:|:---|
| `db.<modelo>.findMany()` etc. | ✅ | search_path já aplicado |
| `db.$queryRaw\`...\`` | ✅ | Roda sob a transação |
| `db.$executeRaw\`...\`` | ✅ | Idem |
| `db.$executeRawUnsafe(string)` | ⚠️ | Permitido; linter bloqueia `SET search_path` manual |
| `db.$transaction(...)` | ❌ | Já dentro de uma — aninhamento é antipattern |
| `db.$connect()` / `$disconnect()` | ❌ | Vaza pool |
| `db.$on()` / `$use()` / `$extends()` | ❌ | Quebra isolamento global |

### `ResolverConfig`

```typescript
interface ResolverConfig {
  productKey:             ProductKey  // 'pedido' | 'processo' | ...
  configuradorBaseUrl:    string      // Ex: 'http://configurador.railway.internal:8000'
  internalKey:            string      // >= 16 chars — header x-internal-key
  cacheTtlMs?:            number      // TTL do cache de tenant. Default: 60_000
  clerkSecretKey?:        string      // Default: process.env.CLERK_SECRET_KEY
  configuradorTimeoutMs?: number      // Timeout HTTP. Default: 5_000
  configuradorRetries?:   number      // Tentativas (1-5). Default: 3
  redisUrl?:              string      // Sprint 2: BullMQ. Sprint 1: sem efeito
}
```

> **Atenção:** o campo é `configuradorBaseUrl`, não `configuradorUrl`.

### `ProductKey`

```typescript
type ProductKey =
  | 'pedido'
  | 'processo'
  | 'simula-custo'
  | 'bid-frete'
  | 'bid-cambio'
  | 'nf-importacao'
  | 'financeiro-comex'
  | 'conector-erp'
  | 'tenant-services'
```

---

## API Pública — Funções

### `tenantResolver(config): RequestHandler`

Cria o middleware Express. Instanciar **1 vez no boot** do servidor. Valida a configuração de forma síncrona (falha no boot, não em runtime).

```typescript
import express from 'express'
import { tenantResolver } from '@gravity/tenant-resolver'

const app = express()

// 1× no boot — valida config sincronamente
app.use(tenantResolver({
  productKey:          'pedido',
  configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
  internalKey:         process.env.INTERNAL_SERVICE_KEY!,
  clerkSecretKey:      process.env.CLERK_SECRET_KEY,
  cacheTtlMs:          60_000,
}))

app.listen(process.env.PORT)
```

**O que o middleware faz a cada request (10 passos — ADR-002 §5):**

1. Extrai JWT do `Authorization: Bearer <token>`
2. Valida JWT via `@clerk/backend` `verifyToken`
3. Extrai `userId` do payload (campo `sub`)
4. Consulta cache in-memory por `userId`
5. Se cache miss → `GET /api/internal/users/:userId` no Configurador (com `x-internal-key`)
6. Valida que tenant está `active` (cliente Zod rejeita `suspended`/`deleted`)
7. Valida `schemaName` contra regex `^tenant_c[a-z0-9]{24}$` (defense-in-depth)
8. Gera `correlationId` (UUID v4 único por request)
9. Anexa `req.tenant: TenantContext`
10. Emite span de observabilidade + chama `next()`

Em qualquer erro, chama `next(AppError)` — nunca `res.status().json()` direto.

**Erros que o middleware gera:**

| Código | HTTP | Quando |
|:---|:---:|:---|
| `UNAUTHENTICATED` | 401 | Sem `Authorization`, token inválido, Clerk rejeita |
| `TENANT_NOT_FOUND` | 404 | Configurador retorna 404 |
| `TENANT_INACTIVE` | 403 | Tenant `suspended` ou `deleted` |
| `CONFIGURADOR_UNAVAILABLE` | 503 | Configurador offline após retries |
| `CONFIGURADOR_INVALID_RESPONSE` | 503 | Resposta não valida o schema Zod |
| `INVALID_TENANT_ID` | 400 | `schemaName` fora do regex (defense-in-depth) |

---

### `withTenant(req, fn): Promise<T>`

Para handlers Express (path HTTP). `req.tenant` já foi populado pelo middleware.

```typescript
import { withTenant, AppError } from '@gravity/tenant-resolver'
import { z } from 'zod'

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

app.get('/pedidos', async (req, res, next) => {
  try {
    const { limit } = QuerySchema.parse(req.query)

    const pedidos = await withTenant(req, async (db) => {
      // db: TenantDatabase — search_path JÁ aplicado dentro de $transaction
      return db.pedido.findMany({ take: limit, orderBy: { created_at: 'desc' } })
    })

    res.json(pedidos)
  } catch (err) { next(err) }
})
```

**Assinatura:**

```typescript
async function withTenant<T>(
  req: Request,                          // Express Request com req.tenant populado
  fn: (db: TenantDatabase) => Promise<T> // callback que recebe db isolado
): Promise<T>
```

**Erros que `withTenant` gera:**

| Código | HTTP | Quando |
|:---|:---:|:---|
| `TENANT_MISSING` | 500 | `req.tenant` não foi populado (middleware não rodou) |
| `INVALID_TENANT_ID` | 400 | `schemaName` inválido (defense-in-depth antes do SQL) |

---

### `withTenantContext(tenantId, fn): Promise<T>`

Para CRONs, workers BullMQ, scripts admin — sem `req`. Resolve o tenant via Configurador e abre transação isolada.

```typescript
import { withTenantContext } from '@gravity/tenant-resolver'

// Worker BullMQ
queue.process('emitir-nota-mensal', async (job) => {
  const { tenantId } = job.data

  await withTenantContext(tenantId, async (ctx, db) => {
    // ctx: TenantContext com tenantId, schemaName, roles, correlationId
    // db:  TenantDatabase com search_path já aplicado
    const notas = await db.nota.findMany({ where: { status: 'PENDENTE' } })
    // ...
  })
})
```

**Assinatura:**

```typescript
async function withTenantContext<T>(
  tenantId: string,
  fn: (ctx: TenantContext, db: TenantDatabase) => Promise<T>
): Promise<T>
```

**Defense-in-depth adicional:** após resolver o `TenantContext` via Configurador, `withTenantContext` confirma que o `schemaName` retornado bate com `buildSchemaName(tenantId)`. Se divergir, lança `TENANT_SCHEMA_MISMATCH` (500) — evita spoofing no Configurador.

**Erros que `withTenantContext` gera:**

| Código | HTTP | Quando |
|:---|:---:|:---|
| `INVALID_TENANT_ID` | 400 | tenantId não é UUID válido |
| `TENANT_NOT_FOUND` | 404 | Configurador retorna 404 |
| `TENANT_INACTIVE` | 403 | Tenant suspenso/deletado |
| `CONFIGURADOR_UNAVAILABLE` | 503 | Configurador offline |
| `TENANT_SCHEMA_MISMATCH` | 500 | schemaName diverge de tenantId (defense-in-depth) |
| `INVALID_TENANT_ID` | 400 | schemaName fora do regex |

---

### Cuidados em Loops Multi-Tenant

```typescript
// ✅ CORRETO — cada iteração abre transação isolada
for (const tenant of activeTenants) {
  await withTenantContext(tenant.id, async (ctx, db) => {
    const total = await db.pedido.aggregate({ _sum: { valor: true } })
    await notificar(tenant.email, total)
  })
}

// ❌ ERRADO — search_path do primeiro tenant contamina os demais
const db = await withTenantContext(activeTenants[0].id, async (ctx, db) => {
  for (const t of activeTenants) {
    return db.pedido.count()  // BUG: search_path é sempre do tenant[0]
  }
})
```

---

## `AppError` — Classe de Erro

```typescript
import { AppError } from '@gravity/tenant-resolver'

// No error handler global do produto:
app.use((err: unknown, _req, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message }
    })
  }
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Erro interno' } })
})
```

**Propriedades:**

| Propriedade | Tipo | Descrição |
|:---|:---|:---|
| `message` | `string` | Mensagem técnica (para log, não exibir ao usuário) |
| `statusCode` | `number` | Código HTTP sugerido |
| `code` | `string` | Código simbólico estável para i18n/clients |
| `name` | `'AppError'` | Para `instanceof` cross-bundle |

---

## Variáveis de Ambiente

| Var | Obrigatória | Onde usar |
|:---|:---:|:---|
| `DATABASE_URL` | ✅ | Lida pelo SDK internamente (PrismaClient) |
| `CONFIGURATOR_URL` | ✅ | Passada via `configuradorBaseUrl` na config |
| `INTERNAL_SERVICE_KEY` | ✅ | Passada via `internalKey` na config |
| `CLERK_SECRET_KEY` | ✅ | Default para `clerkSecretKey` (pode passar explícito) |
| `REDIS_URL` | — | Sprint 2: BullMQ. Sprint 1: sem efeito |

> O SDK não lê `CONFIGURATOR_URL` ou `INTERNAL_SERVICE_KEY` direto da env — o host service passa via config. Isso permite testes sem mutar `process.env`.

---

## Estrutura Real do Pacote

```text
packages/tenant-resolver/
├── package.json                          (vitest@2 local — compatível com vite@5 do monorepo)
├── vitest.config.ts                      (unit + integration; exclui *.e2e.test.ts)
├── vitest.e2e.config.ts                  (E2E; requer DATABASE_URL; timeout 30s)
├── src/
│   ├── index.ts                          ← exports públicos
│   ├── types.ts                          ← TenantContext, TenantDatabase, ResolverConfig, ProductKey
│   ├── errors.ts                         ← AppError
│   ├── schema-name.ts                    ← buildSchemaName + isValidSchemaName (internos)
│   ├── internal-prisma.ts                ← singleton PrismaClient (NÃO exportado)
│   ├── middleware.ts                     ← tenantResolver() factory
│   ├── with-tenant.ts                    ← withTenant + withTenantContext
│   ├── configurador-client.ts            ← HTTP client com Zod + retry
│   ├── cache.ts                          ← TenantCache (dual index, lazy TTL)
│   ├── event-bus-listener.ts             ← no-op Sprint 1; BullMQ Sprint 2
│   └── observability.ts                  ← getLogger, recordSpan, recordMetric
└── tests/
    ├── unit/
    │   ├── schema-name.test.ts            (18 testes)
    │   ├── cache.test.ts                  (14 testes)
    │   └── observability.test.ts          (13 testes)
    ├── integration/
    │   ├── configurador-client.test.ts    (14 testes — mock fetch)
    │   └── middleware.test.ts             (12 testes — mock Clerk + Configurador)
    └── tenant-isolation.e2e.test.ts       (5 testes E2E — requer DATABASE_URL real)
```

**Total: 71 testes passando.** E2E auto-skip se `DATABASE_URL` ausente.

---

## Como Rodar os Testes

```bash
cd packages/tenant-resolver

# Unitários + integração (sem banco — rápidos)
npm test

# E2E (requer PostgreSQL real)
DATABASE_URL=postgresql://... npm run test:e2e

# Tudo
DATABASE_URL=postgresql://... npm run test:all
```

---

## O Padrão Obrigatório por Dentro

```typescript
// with-tenant.ts (privado — NÃO reimplementar fora do SDK)
async function runInTenantTransaction(ctx, fn, timeoutMs) {
  if (!isValidSchemaName(ctx.schemaName)) {
    throw new AppError(`schemaName inválido`, 400, 'INVALID_TENANT_ID')
  }

  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL search_path TO "${ctx.schemaName}", public`
      )
      return fn(tx as unknown as TenantDatabase)
    },
    { timeout: timeoutMs, isolationLevel: 'ReadCommitted' }
  )
}
```

**Por que `SET LOCAL` é a garantia definitiva:**
- `SET LOCAL` funciona apenas dentro de uma transação PostgreSQL
- O Postgres **reseta automaticamente** o `search_path` no COMMIT ou ROLLBACK
- Se o handler crashar, der OOM, der timeout, der erro de rede — o pool libera a conexão e o próximo `BEGIN` recebe `search_path` limpo
- **A garantia é do banco, não da aplicação** — impossível implementar errado

---

## Testes de Isolamento Cross-Tenant Obrigatórios

Todo produto que consome o SDK deve ter:

```typescript
// Em tests/security/ ou tests/integration/
it('tenant A não vê dados de tenant B', async () => {
  const recordId = randomUUID()

  await withTenantContext(tenantB.id, async (_ctx, db) => {
    await db.$executeRaw`INSERT INTO minha_tabela (id, valor) VALUES (${recordId}, 'segredo')`
  })

  const resultado = await withTenantContext(tenantA.id, async (_ctx, db) => {
    return db.$queryRaw`SELECT id FROM minha_tabela WHERE id = ${recordId}`
  })

  expect(resultado).toHaveLength(0) // tenant A não vê o dado de tenant B
})

it('crash do handler não polui search_path', async () => {
  await expect(
    withTenantContext(tenantA.id, async () => { throw new Error('crash') })
  ).rejects.toThrow()

  const searchPath = await withTenantContext(tenantB.id, async (_ctx, db) => {
    const [row] = await db.$queryRaw<{ search_path: string }[]>`SHOW search_path`
    return row!.search_path
  })

  expect(searchPath).toContain(buildSchemaName(tenantB.id))  // import buildSchemaName apenas em testes
  expect(searchPath).not.toContain(buildSchemaName(tenantA.id))
})
```

> Estes testes são a **prova material** do "Risco Zero". O SDK já tem os equivalentes em `tenant-isolation.e2e.test.ts` — produtos precisam ter a versão para suas próprias tabelas.

---

## O Que Nunca Fazer

```typescript
// ❌ PrismaClient fora do SDK
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()              // BLOQUEADO pelo linter CI

// ❌ $transaction aninhado
await withTenant(req, async (db) => {
  await db.$transaction(async (tx) => { ... }) // PROIBIDO — já dentro de uma transação

// ❌ Identidade do Clerk diretamente
const tenantId = session.publicMetadata.tenantId  // NUNCA — use req.tenant.tenantId

// ❌ SET search_path manual
await db.$executeRawUnsafe('SET search_path TO meu_schema')  // BLOQUEADO pelo linter

// ❌ Reutilizar db fora do callback
let savedDb
await withTenant(req, async (db) => { savedDb = db })
await savedDb.pedido.findMany()  // DB já fechou — undefined behavior

// ❌ config errada (nomes antigos da skill pré-Sprint-1)
tenantResolver({ configuradorUrl: '...' })     // ERRADO — campo é configuradorBaseUrl
```

---

## Checklist — Antes de Mergear Código que Usa o SDK

- [ ] `tenantResolver(config)` chamado 1× no boot com todos os campos corretos?
- [ ] Todo acesso a banco via `withTenant` ou `withTenantContext`?
- [ ] Nenhum `import { PrismaClient }` no diff?
- [ ] `TenantDatabase` não usa `$transaction`, `$connect`, `$disconnect`?
- [ ] `tenantId` lido de `req.tenant.tenantId` (não do body/Clerk metadata)?
- [ ] Testes anti-cross-tenant presentes para as tabelas do produto?
- [ ] Error handler global trata `instanceof AppError`?
- [ ] `vitest@2` instalado localmente no pacote (não usa o root `vitest@4`)?

---

## Roadmap (Sprints Futuras)

| Sprint | O que muda |
|:---|:---|
| **Sprint 2** | BullMQ real no `event-bus-listener.ts`; Redis distribuído para cache entre instâncias; `tenantCache(req.tenant)` helper para chaves Redis do produto |
| **Sprint 3** | Migrar `produto/pedido` (e demais) do modelo antigo `WHERE tenant_id` para `withTenant` |
| **Sprint 4** | Eliminar coluna `tenant_id` dos models após migração completa (ADR-003 Fase 4) |

---

*Última atualização: Sprint 1 (2026-04-18). Gerado após 71/71 testes passando.*
