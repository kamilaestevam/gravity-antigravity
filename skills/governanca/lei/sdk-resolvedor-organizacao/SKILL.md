---
name: antigravity-sdk-resolvedor-organizacao
description: "Use esta skill sempre que precisar acessar banco de dados de produto ou serviço-organizacao, configurar middleware de organizacao, escrever worker/CRON multi-organizacao, ou consumir a identidade/cache da organizacao. Define o contrato público de @gravity/resolver-organizacao — o ÚNICO caminho permitido para tocar o banco após o pivô Schema-per-Organizacao."
---

# Gravity — SDK `@gravity/resolver-organizacao`

> Implementa [ADR-001](../../../documentos-tecnicos/arquitetura/schema-composition/adr-001-schema-por-organizacao.md) (Schema-per-Organizacao) e [ADR-002](../../../documentos-tecnicos/governanca/lei/sdk-resolvedor-organizacao/adr-002-sdk-resolvedor-organizacao.md) (Contrato do SDK). Referência completa do SDK em [referencia.md](../../../documentos-tecnicos/governanca/lei/sdk-resolvedor-organizacao/referencia.md).
>
> **Pacote real (v0.2.0):** `@gravity/resolver-organizacao` em `packages/resolver-organizacao/`. A nomenclatura DDD foi aplicada na API pública: funções, types, campos de interface, campos de config e códigos de erro estão todos em PT-BR sem acentos. Os únicos nomes legados que permanecem por razões físicas são o prefixo `tenant_<cuid>` no schema PostgreSQL e a coluna física legada `tenant_id` (em remoção, ver Roadmap).

---

## Por Que Este SDK Existe

Após o pivô Schema-per-Organizacao, **acessar o banco direto via Prisma é proibido**. O SDK é o **único caminho** de qualquer código de produto/serviço para o banco. Ele garante:

1. `SET LOCAL search_path TO "tenant_<cuid>", public` aplicado dentro de `$transaction` — **garantia do Postgres, não da aplicação**
2. Tipagem `BancoOrganizacao` que remove métodos perigosos (`$transaction`, `$connect`, etc.)
3. Identidade da Organizacao via Configurador (`GET /api/internal/users/:idUsuario`), nunca do `publicMetadata` do Clerk (Mandamento 01)
4. Cache in-memory com TTL (índices por `idUsuario` e por `idOrganizacao`)
5. Observabilidade: log de erro + span por chamada do wrapper

> **Regra inviolável:** `import { PrismaClient }` em código de aplicação = bloqueio no CI. Use o SDK.

---

## API Pública — Exports Reais

```typescript
import {
  resolverOrganizacao,           // Express RequestHandler factory (1× por servidor)
  withOrganizacao,               // Wrapper para handlers Express
  withOrganizacaoContext,        // Wrapper para CRONs/workers (sem req)
  AppError,                      // Erro tipado { statusCode, code, message }
  type ContextoOrganizacao,      // { idOrganizacao, nomeSchema, idWorkspace?, idUsuario, tiposUsuario, idCorrelacao }
  type BancoOrganizacao,         // Prisma.TransactionClient sem métodos de engine
  type ConfigResolverOrganizacao,// Config do resolverOrganizacao()
  type ChaveProduto,             // 'pedido' | 'processo' | 'simula-custo' | ...
} from '@gravity/resolver-organizacao'
```

### Não é exportado (proibido fora do SDK)

- `PrismaClient` / `_internalPrisma` — singleton privado
- `buildSchemaName` — uso interno; não construir nome de schema manual fora do SDK
- `CacheOrganizacao`, `createConfiguradorClient` — implementação interna

---

## Bootstrap — `resolverOrganizacao(config): RequestHandler`

Retorna **diretamente** um `RequestHandler` Express. Instanciar **1 vez no boot**.

```typescript
// produto/pedido/server/index.ts
import express from 'express'
import { resolverOrganizacao } from '@gravity/resolver-organizacao'

const app = express()

app.use(express.json())
app.use(resolverOrganizacao({
  chaveProduto:        'pedido',
  configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
  chaveInterna:        process.env.INTERNAL_SERVICE_KEY!,
  clerkSecretKey:      process.env.CLERK_SECRET_KEY,
  cacheTtlMs:          60_000,
}))

app.listen(process.env.PORT)
```

> **Atenção aos nomes exatos:** `chaveProduto`, `chaveInterna`, `configuradorBaseUrl`. Qualquer outra grafia → erro de tipo no boot.

### Config completa (`ConfigResolverOrganizacao`)

| Campo | Tipo | Obrigatório | Default |
|:---|:---|:---:|:---|
| `chaveProduto` | `ChaveProduto` | ✅ | — |
| `configuradorBaseUrl` | `string` (URL) | ✅ | — |
| `chaveInterna` | `string` (≥16 chars) | ✅ | — |
| `clerkSecretKey` | `string` | — | `process.env.CLERK_SECRET_KEY` |
| `cacheTtlMs` | `number` | — | `60_000` |
| `redisUrl` | `string` | — | sem default; ausência → cache in-memory + event-bus desabilitado |
| `configuradorTimeoutMs` | `number` | — | `5_000` |
| `configuradorRetries` | `1-5` | — | `3` |

`resolverOrganizacao()` valida a config **sincronamente** no boot — lança `Error` antes do servidor iniciar se faltar campo obrigatório.

---

## Uso #1 — `withOrganizacao(req, fn)` — Handlers Express

```typescript
import { withOrganizacao, AppError } from '@gravity/resolver-organizacao'
import { z } from 'zod'

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

app.get('/pedidos', async (req, res, next) => {
  try {
    const { limit } = QuerySchema.parse(req.query)

    const pedidos = await withOrganizacao(req, async (db) => {
      // db: BancoOrganizacao — search_path JÁ aplicado, dentro de $transaction
      return db.pedido.findMany({ take: limit, orderBy: { data_criacao_pedido: 'desc' } })
    })

    res.json(pedidos)
  } catch (err) { next(err) }
})
```

**Erros possíveis:**
- `ORGANIZACAO_MISSING` (500) — `req.organizacao` não populado (middleware não rodou)
- `INVALID_ORGANIZACAO_ID` (400) — `nomeSchema` fora do regex (defense-in-depth antes do SQL)

---

## Uso #2 — `withOrganizacaoContext(idOrganizacao, fn)` — CRONs / Workers

```typescript
import { withOrganizacaoContext } from '@gravity/resolver-organizacao'

// BullMQ worker
queue.process('emitir-nota', async (job) => {
  const { idOrganizacao } = job.data

  await withOrganizacaoContext(idOrganizacao, async (ctx, db) => {
    // ctx: ContextoOrganizacao { idOrganizacao, nomeSchema, idWorkspace?, idUsuario, tiposUsuario, idCorrelacao }
    // db:  BancoOrganizacao com search_path aplicado
    await db.nota.update({ where: { id: job.data.idNota }, data: { status: 'EMITIDA' } })
  })
})
```

**Defense-in-depth adicional:** após resolver via Configurador, `withOrganizacaoContext` confirma que o `nomeSchema` retornado bate com o esperado para o `idOrganizacao` informado. Se divergir → `ORGANIZACAO_SCHEMA_MISMATCH` (500).

### Cuidados em loops multi-organizacao

```typescript
// ✅ CORRETO — transação isolada por Organizacao
for (const organizacao of organizacoesAtivas) {
  await withOrganizacaoContext(organizacao.id_organizacao, async (ctx, db) => {
    await db.pedido.updateMany({ data: { processado: true } })
  })
}

// ❌ ERRADO — 1 única transação, search_path da Organizacao [0] contamina todas
await withOrganizacaoContext(organizacoesAtivas[0].id_organizacao, async (ctx, db) => {
  for (const organizacao of organizacoesAtivas) {   // BUG!
    await db.pedido.updateMany({ data: { processado: true } })
  }
})
```

---

## Tipo `BancoOrganizacao` — Referência Rápida

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

## `ContextoOrganizacao` — Campos Reais

```typescript
interface ContextoOrganizacao {
  idOrganizacao: string    // CUID da Organizacao — req.organizacao.idOrganizacao
  nomeSchema:    string    // "tenant_<32hex>" — schema PostgreSQL real, não usar diretamente
  idWorkspace?:  string    // Workspace ativo (opcional)
  idUsuario:     string    // SUID do usuário Clerk
  tiposUsuario:  string[]  // Ex: ['PEDIDO_READ', 'PEDIDO_WRITE']
  idCorrelacao:  string    // ULID por request — propagar em logs
}
```

> O campo `nomeSchema` recebe o valor `tenant_<cuid>` — o prefixo `tenant_` é o **nome físico real** do schema PostgreSQL e permanece por razões de migração de dados (não é renomeado sem ciclo coordenado).

---

## Códigos de Erro do SDK

| Código | HTTP | Origem |
|:---|:---:|:---|
| `UNAUTHENTICATED` | 401 | Token ausente/inválido/expirado |
| `ORGANIZACAO_MISSING` | 500 | `req.organizacao` não populado pelo middleware |
| `ORGANIZACAO_NOT_FOUND` | 404 | Configurador retorna 404 para a Organizacao solicitada |
| `ORGANIZACAO_INACTIVE` | 403 | Organizacao `suspended` ou `deleted` |
| `ORGANIZACAO_SCHEMA_MISMATCH` | 500 | `nomeSchema` diverge do `idOrganizacao` (spoofing detectado) |
| `INVALID_ORGANIZACAO_ID` | 400 | CUID da Organizacao inválido ou `nomeSchema` fora do regex |
| `CONFIGURADOR_UNAVAILABLE` | 503 | Configurador offline após retries |

---

## Variáveis de Ambiente

| Var | Onde | Nota |
|:---|:---|:---|
| `DATABASE_URL` | Lida pelo SDK internamente | Sem `?schema=` — SDK usa `SET LOCAL` |
| `CONFIGURATOR_URL` | Passa via `configuradorBaseUrl` | SDK não lê env direto |
| `INTERNAL_SERVICE_KEY` | Passa via `chaveInterna` | ≥ 16 chars |
| `CLERK_SECRET_KEY` | Default de `clerkSecretKey` | Pode passar explícito |

---

## Testes no Pacote SDK

Os testes do SDK ficam **dentro do pacote** (`packages/resolver-organizacao/tests/`), não na raiz `testes/`. É a única exceção à regra de testes centralizados — pacotes publicáveis têm seus próprios testes.

```bash
cd packages/resolver-organizacao

npm test            # unit + integration (sem banco)
npm run test:e2e    # E2E (requer DATABASE_URL real)
npm run test:all    # tudo
```

**Vitest local:** o pacote instala `vitest@2` localmente porque o root tem `vitest@4` que requer `vite@6`, mas o monorepo usa `vite@5`. Não alterar essa dependência sem resolver o root.

---

## Testes Cross-Organizacao Obrigatórios em Produtos

Todo produto que consome o SDK deve ter ao menos:

```typescript
// Em qualquer arquivo de testes do produto
it('Organizacao A não vê dados da Organizacao B', async () => {
  const id = randomUUID()

  await withOrganizacaoContext(orgB.id_organizacao, async (_ctx, db) => {
    await db.minhaTabelaPrincipal.create({ data: { id, valor: 'segredo-B' } })
  })

  const result = await withOrganizacaoContext(orgA.id_organizacao, async (_ctx, db) => {
    return db.minhaTabelaPrincipal.findUnique({ where: { id } })
  })

  expect(result).toBeNull()
})

it('crash não polui search_path da próxima request', async () => {
  await expect(
    withOrganizacaoContext(orgA.id_organizacao, async () => { throw new Error('crash') })
  ).rejects.toThrow()

  const path = await withOrganizacaoContext(orgB.id_organizacao, async (_ctx, db) => {
    const [row] = await db.$queryRaw<{ search_path: string }[]>`SHOW search_path`
    return row!.search_path
  })

  expect(path).toContain(orgB.nomeSchema)
  expect(path).not.toContain(orgA.nomeSchema)
})
```

---

## O Que Nunca Fazer

```typescript
// ❌ PrismaClient direto — linter CI bloqueia
import { PrismaClient } from '@prisma/client'
new PrismaClient()

// ❌ Campo errado do contexto — use idOrganizacao
req.organizacao.id              // ERRADO
req.organizacao.idOrganizacao   // CORRETO

// ❌ $transaction aninhado dentro de withOrganizacao
await withOrganizacao(req, async (db) => {
  await db.$transaction(async (tx) => { ... })  // PROIBIDO
})

// ❌ identidade do Clerk (Mandamento 01 — Clerk só serve para autenticação)
session.publicMetadata.tenantId   // NUNCA — campo legado do Clerk; use req.organizacao.idOrganizacao

// ❌ SET search_path manual — linter bloqueia
await db.$executeRawUnsafe('SET search_path TO meu_schema')

// ❌ db reutilizado fora do callback
let db
await withOrganizacao(req, async (_db) => { db = _db })
await db.pedido.findMany()   // transação já fechou
```

---

## Checklist — Antes de Mergear Código com o SDK

- [ ] `resolverOrganizacao()` chamado 1× no boot, retorno direto com `app.use()`?
- [ ] Config usa nomes corretos: `chaveProduto`, `configuradorBaseUrl`, `chaveInterna`?
- [ ] Todo acesso a banco via `withOrganizacao` ou `withOrganizacaoContext`?
- [ ] Nenhum `import { PrismaClient }` no diff?
- [ ] Import vem de `@gravity/resolver-organizacao` (pacote v0.2)?
- [ ] `req.organizacao.idOrganizacao` (não `req.organizacao.id`)?
- [ ] Nenhum `db.$transaction` aninhado dentro do callback?
- [ ] Testes anti-cross-organizacao presentes para as tabelas do produto?
- [ ] Error handler global trata `instanceof AppError`?
- [ ] `vitest@2` no `package.json` do pacote (não herdar `vitest@4` do root)?

---

## Roadmap

| Sprint | O que muda no SDK |
|:---|:---|
| **Sprint 1** ✅ | Implementação completa do SDK (v0.1): middleware, wrappers, cache, errors, 71 testes — pacote inicial sob nome legado |
| **Sprint 2** ✅ | Migração DDD da API pública — pacote renomeado para `@gravity/resolver-organizacao` (v0.2): funções, types, campos de interface, config e error codes em PT-BR |
| **Sprint 3** | BullMQ real; Redis distribuído; helper `cacheOrganizacao(req.organizacao)` para chaves de produtos |
| **Sprint 4** | Migração de `produto/*` legados (que ainda usam `WHERE id_organizacao = ?` e RLS) para `withOrganizacao` |
| **Sprint 5** | Remoção da coluna física legada `tenant_id` (já não há mais campo Prisma `id_organizacao` em models de produto) |
