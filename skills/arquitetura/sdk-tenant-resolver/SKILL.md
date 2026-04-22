---
name: antigravity-sdk-tenant-resolver
description: "Use esta skill sempre que precisar acessar banco de dados de produto ou serviço-tenant, configurar middleware de tenant, escrever worker/CRON multi-tenant, ou consumir a identidade/cache do tenant. Define o contrato público de @gravity/tenant-resolver — o ÚNICO caminho permitido para tocar o banco após o pivô Schema-per-Tenant. Implementação validada Sprint 1 (2026-04-18): 71/71 testes passando."
---

# Gravity — SDK `@gravity/tenant-resolver`

> Implementa [ADR-001](../../../documentos-tecnicos/adr/ADR-001-schema-per-tenant.md) e [ADR-002](../../../documentos-tecnicos/adr/ADR-002-tenant-resolver-sdk.md).
> Referência completa: [`documentos-tecnicos/sdk/tenant-resolver.md`](../../../documentos-tecnicos/sdk/tenant-resolver.md)
>
> **Nota DDD (Mandamento 03):** embora a biblioteca tenha nome legado (`@gravity/tenant-resolver`) e a sua API pública atual ainda exponha campos com nome `tenantId`/`schemaName`, o **parâmetro semântico que trafega é estritamente a Organização** (`id_organizacao`/`idOrganizacao`). Em código de aplicação, alimente sempre as chamadas com a variável `idOrganizacao` (DDD); funções legadas internas que ainda recebem `tenantId` devem ser refatoradas para aceitar `idOrganizacao` no roadmap. Os identificadores reais preservados (nome do pacote, prefixo de schema PostgreSQL `tenant_<cuid>`, header `x-tenant-id`) são objetos físicos/contratos externos que não são renomeados sem ciclo de migração coordenado.

---

## Por Que Este SDK Existe

Após o pivô Schema-per-Tenant, **acessar o banco direto via Prisma é proibido**. O SDK é o **único caminho** de qualquer código de produto/serviço para o banco. Ele garante:

1. `SET LOCAL search_path TO "tenant_<id>", public` aplicado dentro de `$transaction` — **garantia do Postgres, não da aplicação**
2. Tipagem `TenantDatabase` que remove métodos perigosos (`$transaction`, `$connect`, etc.)
3. Identidade da Organização via Configurador (`GET /api/internal/users/:idUsuario`), nunca do `publicMetadata` do Clerk (Mandamento 01)
4. Cache in-memory com TTL (dual index: por idUsuario + por idOrganizacao — internamente o SDK ainda chama esses índices de `userId`/`tenantId` enquanto a API pública não é renomeada)
5. Observabilidade: log de erro + span por `withTenant`

> **Regra inviolável:** `import { PrismaClient }` em código de aplicação = bloqueio no CI. Use o SDK.

---

## API Pública — Exports Reais

```typescript
import {
  tenantResolver,              // Express RequestHandler factory (1× por servidor)
  withTenant,                  // Wrapper para handlers Express
  withTenantContext,           // Wrapper para CRONs/workers (sem req)
  AppError,                    // Erro tipado { statusCode, code, message }
  type TenantContext,          // { tenantId, schemaName, workspaceId?, userId, roles, correlationId }
  type TenantDatabase,         // Prisma.TransactionClient sem métodos de engine
  type ResolverConfig,         // Config do tenantResolver()
  type ProductKey,             // 'pedido' | 'processo' | 'simula-custo' | ...
  type PrismaTransactionClient,// Alias legacy de TenantDatabase
} from '@gravity/tenant-resolver'
```

### Não é exportado (proibido fora do SDK)

- `PrismaClient` / `_internalPrisma` — singleton privado
- `buildSchemaName` — uso interno; não construir schemaName manual fora do SDK
- `TenantCache`, `createConfiguradorClient` — implementação interna

---

## Bootstrap — `tenantResolver(config): RequestHandler`

Retorna **diretamente** um `RequestHandler` Express. Instanciar **1 vez no boot**.

```typescript
// produtos/pedido/server/index.ts
import express from 'express'
import { tenantResolver } from '@gravity/tenant-resolver'

const app = express()

app.use(express.json())
app.use(tenantResolver({                              // ← retorna RequestHandler diretamente
  productKey:          'pedido',
  configuradorBaseUrl: process.env.CONFIGURATOR_URL!,  // ← campo correto: configuradorBaseUrl
  internalKey:         process.env.INTERNAL_SERVICE_KEY!,
  clerkSecretKey:      process.env.CLERK_SECRET_KEY,
  cacheTtlMs:          60_000,
}))

app.listen(process.env.PORT)
```

> **Atenção ao nome:** `configuradorBaseUrl` (não `configuradorUrl`).

### Config completa (`ResolverConfig`)

| Campo | Tipo | Obrigatório | Default |
|:---|:---|:---:|:---|
| `productKey` | `ProductKey` | ✅ | — |
| `configuradorBaseUrl` | `string` (URL) | ✅ | — |
| `internalKey` | `string` (≥16 chars) | ✅ | — |
| `clerkSecretKey` | `string` | — | `process.env.CLERK_SECRET_KEY` |
| `cacheTtlMs` | `number` | — | `60_000` |
| `configuradorTimeoutMs` | `number` | — | `5_000` |
| `configuradorRetries` | `1-5` | — | `3` |
| `redisUrl` | `string` | — | Sprint 2; sem efeito em Sprint 1 |

`tenantResolver()` valida a config **sincronamente** no boot — lança `Error` antes do servidor iniciar se faltar campo obrigatório.

---

## Uso #1 — `withTenant(req, fn)` — Handlers Express

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
      // db: TenantDatabase — search_path JÁ aplicado, dentro de $transaction
      return db.pedido.findMany({ take: limit, orderBy: { created_at: 'desc' } })
    })

    res.json(pedidos)
  } catch (err) { next(err) }
})
```

**Erros possíveis:**
- `TENANT_MISSING` (500) — `req.tenant` não populado (middleware não rodou)
- `INVALID_TENANT_ID` (400) — schemaName fora do regex (defense-in-depth antes do SQL)

---

## Uso #2 — `withTenantContext(idOrganizacao, fn)` — CRONs / Workers

> O nome da função (`withTenantContext`) e do primeiro parâmetro na assinatura atual da API (`tenantId`) são preservados como contrato externo do SDK. Em código de aplicação, **passe sempre a variável `idOrganizacao`** (DDD).

```typescript
import { withTenantContext } from '@gravity/tenant-resolver'

// BullMQ worker
queue.process('emitir-nota', async (job) => {
  const { idOrganizacao } = job.data

  await withTenantContext(idOrganizacao, async (ctx, db) => {
    // ctx: TenantContext { tenantId, schemaName, roles, correlationId, ... }
    //      (campos do contexto ainda usam nomes legados na API pública atual; em
    //      aplicação trate-os como Organização: ctx.tenantId === idOrganizacao)
    // db:  TenantDatabase com search_path aplicado
    await db.nota.update({ where: { id: job.data.notaId }, data: { status: 'EMITIDA' } })
  })
})
```

**Defense-in-depth adicional:** após resolver via Configurador, `withTenantContext` confirma que o `schemaName` retornado bate com o esperado para o `idOrganizacao` informado. Se divergir → `TENANT_SCHEMA_MISMATCH` (500 — código do SDK preservado).

### Cuidados em loops multi-organização

```typescript
// ✅ CORRETO — transação isolada por Organização
for (const organizacao of organizacoesAtivas) {
  await withTenantContext(organizacao.id_organizacao, async (ctx, db) => {
    await db.pedido.updateMany({ data: { processado: true } })
  })
}

// ❌ ERRADO — 1 única transação, search_path da Organização [0] contamina todas
await withTenantContext(organizacoesAtivas[0].id_organizacao, async (ctx, db) => {
  for (const organizacao of organizacoesAtivas) {   // BUG!
    await db.pedido.updateMany({ data: { processado: true } })
  }
})
```

---

## Tipo `TenantDatabase` — Referência Rápida

| O que roda | Disponível? |
|:---|:---:|
| `db.<modelo>.findMany()` / `.create()` / etc. | ✅ |
| `db.$queryRaw\`SELECT ...\`` | ✅ |
| `db.$executeRaw\`UPDATE ...\`` | ✅ |
| `db.$executeRawUnsafe(sql)` | ⚠️ linter bloqueia `SET search_path` |
| `db.$transaction(...)` | ❌ antipattern — já dentro de uma |
| `db.$connect()` / `$disconnect()` | ❌ vaza pool |
| `db.$on()` / `$use()` / `$extends()` | ❌ quebra isolamento |

---

## `TenantContext` — Campos Reais

> A interface `TenantContext` é o **contrato externo atual** do SDK; os nomes dos campos (`tenantId`, `workspaceId`, `userId`) são legados e estão no roadmap para serem renomeados para `idOrganizacao`/`idWorkspace`/`idUsuario`. Em código de aplicação, **trate semanticamente** esses campos como Organização/Workspace/Usuário (DDD).

```typescript
interface TenantContext {
  tenantId:      string    // CUID da Organização — req.tenant.tenantId (semântica: idOrganizacao)
  schemaName:    string    // "tenant_<32hex>" — schema PostgreSQL real, não usar diretamente
  workspaceId?:  string    // Workspace ativo (opcional — semântica: idWorkspace)
  userId:        string    // UUID do usuário Clerk (semântica: idUsuario)
  roles:         string[]  // Ex: ['PEDIDO_READ', 'PEDIDO_WRITE']
  correlationId: string    // UUID por request — propagar em logs
}
// NÃO HÁ: permissions, email (versão 0.1.0)
```

---

## Códigos de Erro do SDK

| Código | HTTP | Origem |
|:---|:---:|:---|
| `UNAUTHENTICATED` | 401 | Token ausente/inválido/expirado |
| `TENANT_MISSING` | 500 | `req.tenant` (semântica: contexto da Organização) não populado pelo middleware |
| `TENANT_NOT_FOUND` | 404 | Configurador retorna 404 para a Organização solicitada |
| `TENANT_INACTIVE` | 403 | Organização `suspended` ou `deleted` |
| `TENANT_SCHEMA_MISMATCH` | 500 | schemaName diverge do `idOrganizacao` (spoofing detectado) |
| `INVALID_TENANT_ID` | 400 | CUID da Organização inválido ou schemaName fora do regex |
| `CONFIGURADOR_UNAVAILABLE` | 503 | Configurador offline após retries |
| `CONFIGURADOR_INVALID_RESPONSE` | 503 | Resposta não valida Zod |

> Os nomes dos códigos de erro (`TENANT_*`) são preservados como contrato do SDK. O significado semântico é sempre **Organização**.

---

## Variáveis de Ambiente

| Var | Onde | Nota |
|:---|:---|:---|
| `DATABASE_URL` | Lida pelo SDK internamente | Sem `?schema=` — SDK usa `SET LOCAL` |
| `CONFIGURATOR_URL` | Passa via `configuradorBaseUrl` | SDK não lê env direto |
| `INTERNAL_SERVICE_KEY` | Passa via `internalKey` | ≥ 16 chars |
| `CLERK_SECRET_KEY` | Default de `clerkSecretKey` | Pode passar explícito |

---

## Testes no Pacote SDK

Os testes do SDK ficam **dentro do pacote** (`packages/tenant-resolver/tests/`), não na raiz `testes/`. É a única exceção à regra de testes centralizados — pacotes publicáveis têm seus próprios testes.

```bash
cd packages/tenant-resolver

npm test            # unit + integration (71 testes, sem banco)
npm run test:e2e    # E2E (requer DATABASE_URL real)
npm run test:all    # tudo
```

**Vitest local:** o pacote instala `vitest@2` localmente porque o root tem `vitest@4` que requer `vite@6`, mas o monorepo usa `vite@5`. Não alterar essa dependência sem resolver o root.

---

## Testes Cross-Organização Obrigatórios em Produtos

Todo produto que consome o SDK deve ter ao menos:

```typescript
// Em qualquer arquivo de testes do produto
it('Organização A não vê dados da Organização B', async () => {
  const id = randomUUID()

  await withTenantContext(orgB.id_organizacao, async (_ctx, db) => {
    await db.minhaTabelaPrincipal.create({ data: { id, valor: 'segredo-B' } })
  })

  const result = await withTenantContext(orgA.id_organizacao, async (_ctx, db) => {
    return db.minhaTabelaPrincipal.findUnique({ where: { id } })
  })

  expect(result).toBeNull()
})

it('crash não polui search_path da próxima request', async () => {
  await expect(
    withTenantContext(orgA.id_organizacao, async () => { throw new Error('crash') })
  ).rejects.toThrow()

  const path = await withTenantContext(orgB.id_organizacao, async (_ctx, db) => {
    const [row] = await db.$queryRaw<{ search_path: string }[]>`SHOW search_path`
    return row!.search_path
  })

  expect(path).toContain(orgB.schemaName)
  expect(path).not.toContain(orgA.schemaName)
})
```

---

## O Que Nunca Fazer

```typescript
// ❌ PrismaClient direto — linter CI bloqueia
import { PrismaClient } from '@prisma/client'
new PrismaClient()

// ❌ Nome errado do campo de config
tenantResolver({ configuradorUrl: '...' })   // campo é configuradorBaseUrl

// ❌ Chamada errada do middleware
const resolver = tenantResolver(config)
app.use(resolver.middleware())  // ERRADO — tenantResolver já retorna RequestHandler
// CORRETO:
app.use(tenantResolver(config))

// ❌ TenantContext.id (nome antigo)
req.tenant.id              // ERRADO — campo do contrato externo é tenantId (semântica: idOrganizacao)
req.tenant.tenantId        // CORRETO (em aplicação, trate como idOrganizacao)

// ❌ $transaction aninhado dentro de withTenant
await withTenant(req, async (db) => {
  await db.$transaction(async (tx) => { ... })  // PROIBIDO

// ❌ identidade do Clerk (Mandamento 01 — Clerk só serve para autenticação)
session.publicMetadata.tenantId  // NUNCA — use req.tenant.tenantId (semântica: idOrganizacao)

// ❌ SET search_path manual — linter bloqueia
await db.$executeRawUnsafe('SET search_path TO meu_schema')

// ❌ db reutilizado fora do callback
let db
await withTenant(req, async (_db) => { db = _db })
await db.pedido.findMany()   // transação já fechou
```

---

## Checklist — Antes de Mergear Código com o SDK

- [ ] `tenantResolver()` chamado 1× no boot, retorno direto com `app.use()`?
- [ ] `configuradorBaseUrl` (não `configuradorUrl`) na config?
- [ ] Todo acesso a banco via `withTenant` ou `withTenantContext`?
- [ ] Nenhum `import { PrismaClient }` no diff?
- [ ] `req.tenant.tenantId` (não `req.tenant.id`) — semântica: `idOrganizacao`?
- [ ] Nenhum `db.$transaction` aninhado dentro do callback?
- [ ] Testes anti-cross-organização presentes para as tabelas do produto?
- [ ] Error handler global trata `instanceof AppError`?
- [ ] `vitest@2` no `package.json` do pacote (não herdar `vitest@4` do root)?

---

## Roadmap

| Sprint | O que muda no SDK |
|:---|:---|
| **Sprint 1** ✅ | Implementação completa: middleware, withTenant, withTenantContext, cache, errors, 71 testes |
| **Sprint 2** | BullMQ real; Redis distribuído; `tenantCache(req.tenant)` helper para chaves de produtos |
| **Sprint 3** | `produto/pedido` e demais migrados do modelo antigo para `withTenant` |
| **Sprint 4** | Remoção do campo Prisma `id_organizacao` (e da coluna física legada `tenant_id`) dos models (ADR-003 Fase 4) |
