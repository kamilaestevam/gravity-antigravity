---
name: antigravity-database-operations
description: "Use esta skill para operações de banco de dados — migrations, backups, índices, vacuum, particionamento, connection pooling e monitoramento. Consultada pelo Estrutura de Dados antes de qualquer operação no banco."
---

# Gravity — Database Operations

---

## ⛔ Padrão de Acesso ao Banco (Obrigatório)

> **Validado em produção — Sprint 1/2026-04-18 (Lotes 1, 2 e 3 — produto/pedido/server).**
> Qualquer desvio deste padrão **bloqueia o CI** e causa vazamento de dados cross-organização.

### O que é PROIBIDO (padrão legado)

```typescript
// ❌ PROIBIDO — linter CI bloqueia; vazamento de schema garantido
const db = (req as any).prisma
const idOrganizacao = (req as any).tenantId
const idUsuario     = (req as any).userId

// ❌ PROIBIDO — import direto de PrismaClient fora do SDK
import { PrismaClient } from '@prisma/client'

// ❌ PROIBIDO — TenantRequest como tipo de handler (nome do tipo preservado por compatibilidade do SDK)
import type { TenantRequest } from '../shared/types.js'
router.get('/rota', async (req: TenantRequest, res: Response) => { ... })

// ❌ PROIBIDO — leitura de Organização/Usuário por header (use req.organizacao do SDK)
const idOrganizacao = req.headers['x-organização-id'] as string   // header preservado por compatibilidade de protocolo
const idUsuario     = req.headers['x-user-id'] as string
```

### O que é OBRIGATÓRIO (withTenant)

```typescript
import { withTenant, type TenantContext } from '@gravity/tenant-resolver'

// ✅ CORRETO — rota padrão
router.get('/rota', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db            = rawDb as any           // cast obrigatório: TenantDatabase não inclui models do produto
      const ctx           = (req as unknown as { organização: TenantContext }).organização  // cast obrigatório: module augmentation não propaga entre node_modules locais
      // A API atual do SDK ainda usa tenantId/userId — semântica: idOrganizacao/idUsuario
      const idOrganizacao = ctx.tenantId
      const idUsuario     = ctx.userId
      const userRoles     = ctx.roles

      const resultado = await db.meuModel.findMany({
        where: { id_organizacao: idOrganizacao },   // ← campo Prisma DDD; durante fase de transição o model legado usa
      })
      res.json({ data: resultado })
    })
  } catch (err) {
    next(err)
  }
})
```

### Padrão para dados que saem do bloco withTenant

```typescript
// ✅ CORRETO — capturar dados que serão usados fora da transação
let itens: Array<{ id: string }> = []
await withTenant(req, async (rawDb) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = rawDb as any
  itens = await db.pedidoItem.findMany({ where: { id_organizacao: idOrganizacao } })   // campo Prisma DDD
  // res.json() aqui dentro se os dados não saem
})
// ⚠️ Se chamar código externo com itens: db JÁ fechou. Não reutilizar rawDb aqui.
```

### Padrão fire-and-forget (background após transação principal)

```typescript
// ✅ CORRETO — capturar idOrganizacao ANTES de withTenant; disparar DEPOIS que a transação fecha
//             (a API atual do SDK ainda chama o campo de tenantId — semântica: idOrganizacao)
const idOrganizacao = (req as unknown as { organização: TenantContext }).organizacao.idOrganizacao

await withTenant(req, async (rawDb) => {
  // ... operação principal, res.json() aqui dentro
})

// Só depois que withTenant resolve (transação fechada):
if (deveDisparar) {
  setImmediate(() => {
    withTenantContext(idOrganizacao, async (ctx, rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await executarTarefaBackground(rawDb as any, ctx.tenantId)   // ctx.tenantId = idOrganizacao
    }).catch(console.error)
  })
}
```

### Por que `const db = rawDb as any`?

O SDK exporta `TenantDatabase` (= `Omit<Prisma.TransactionClient, ...>`), mas esse `@prisma/client`
é **o do pacote SDK**, não do produto. Os models do produto (`pedido`, `pedidoItem`, etc.) só existem
no `@prisma/client` gerado pelo produto — e TypeScript não consegue unificar os dois. O cast `as any`
é o padrão adotado no codebase (ver `analytics.ts` como referência). O ESLint disable é obrigatório.

### Por que `(req as unknown as { organização: TenantContext }).organização`?

O SDK faz `declare module 'express-serve-static-core'` para adicionar `req.organizacao`. Mas o produto
tem seu **próprio** `express` em `node_modules/` — a augmentation do SDK não se propaga. O duplo
cast `as unknown as { ... }` é o contorno correto e necessário.

---

## Topologia de Bancos

| Banco Railway (produção) | Banco Railway (teste) | Serviço | Schema | Dados |
|:---|:---|:---|:---|:---|
| `gravity-configurador-producao` | `gravity-configurador-teste` | Configurador | `public` (único) | Tenants, planos, billing, permissões |
| `gravity-servicos-producao` | `gravity-servicos-teste` | Organização Services | `tenant_<cuid>` por organização | Email, WhatsApp, dashboard, histórico |
| `gravity-pedido-producao` | `gravity-pedido-teste` | Pedido | `tenant_<cuid>` por organização | Pedidos comerciais, itens, lotes |
| `gravity-processo-producao` | `gravity-processo-teste` | Processo | `tenant_<cuid>` por organização | Processos logísticos, DI, DUIMP |
| `gravity-simula-custo-producao` | `gravity-simula-custo-teste` | SimulaCusto | `tenant_<cuid>` por organização | Estimativas, cache fiscal |

> **Nomes oficiais e únicos de referência para scripts de manutenção, migrations e documentação:**
> staging = `gravity-servicos-teste` | produção = `gravity-servicos-producao`
> Nunca use variações como `gravity-organização-teste`, `gravity-serviços-*` ou `gravity-services-*`.

> **Regra absoluta:** cada produto tem seu próprio banco PostgreSQL isolado.
> Nenhum produto acessa banco de outro produto — comunicação apenas via REST API.

### Estrutura interna de cada banco de produto

```
gravity-pedido-producao (PostgreSQL)
  ├── public                         ← 100% VAZIO (nenhuma tabela aqui)
  ├── tenant_cmo4vtp3i0000m86ft8vt5vnu   ← empresa A
  │    ├── pedido_produto_gravity    ← @@map do model Pedido (DDD 2026-04-19)
  │    ├── pedido_item
  │    └── _prisma_migrations
  └── tenant_cm...xyz                    ← empresa B
       ├── pedido_produto_gravity
       ├── pedido_item
       └── _prisma_migrations
```

O Configurador é a única exceção: usa schema `public` como fonte de verdade global de identidade (Organização, User, Subscription).

---

## Padrão de Identidade — CUID (SUID Expressamente Proibido)

> **Mandato estabelecido em 2026-04-18. Inviolável em todas as camadas.**

O Gravity usa **exclusivamente CUID** como padrão de ID. SUID está **expressamente proibido** em todos os contextos — schema Prisma, código TypeScript, migrations SQL.

### ⛔ SUID está PROIBIDO

```typescript
// ❌ PROIBIDO — nunca usar SUID em nenhuma forma
import { randomUUID } from 'crypto'
const id = randomUUID()                            // ❌
const id = crypto.randomUUID()                    // ❌
const id = uuidv4()                                // ❌

// ❌ PROIBIDO — SUID no schema Prisma
id  String  @id @default(dbgenerated("gen_random_uuid()"))  // ❌
id  String  @id @default(suid())                            // ❌
```

### ✅ Padrão Obrigatório — CUID gerado pelo Prisma

```prisma
// ✅ CORRETO — em todo fragment.prisma ou schema.base.prisma
model Pedido {
  id  String  @id @default(cuid())   // CUID: 25 chars, ex: cmo4vtp3i0000m86ft8vt5vnu
  ...

  @@map("pedido_produto_gravity")    // nome da tabela PostgreSQL (DDD 2026-04-19)
}
```

```typescript
// ✅ Em código TypeScript — se precisar de ID antecipado antes do create:
function gerarId(prefixo: string): string {
  const seq = String(Math.floor(Math.random() * 9999999)).padStart(7, '0')
  const ano = String(new Date().getFullYear()).slice(-2)
  return `${prefixo}_id_${seq}-${ano}`
}
// Uso: gerarId('pedi') → 'pedi_id_0038421-26'
```

### Por que CUID e não SUID?

| Critério | SUID v4 | CUID |
|:---|:---|:---|
| Ordenação temporal | ❌ Completamente aleatório | ✅ Prefixo monotônico |
| Legibilidade nos logs | ❌ `550e8400-e29b-41d4-a716-446655440000` | ✅ `cmo4vtp3i0000m86ft8vt5vnu` |
| Nome de schema PostgreSQL | ❌ Hífens quebram identificadores sem aspas | ✅ Sem hífens — `tenant_cmo4vtp3i...` |
| Consistência cross-camada | ❌ Depende da biblioteca (suid, nanoid, etc.) | ✅ Fonte única: Prisma `@default(cuid())` |
| Fingerprint de máquina | ❌ Pura aleatoriedade | ✅ Inclui fingerprint — colisões improváveis |

> O nome do schema PostgreSQL é `tenant_<cuid>` — sem hífens, compatível com identificadores nativos do PostgreSQL.
> A consistência entre SDK (`tenant_<cuid>` no `search_path`), Backend (ID de pedido/item) e Frontend (URLs, params) exige um único padrão de ID em toda a plataforma.

---

## Migrations

### Fluxo obrigatório para bancos de produto (Schema-per-Organização)

```bash
# 1. Gerar a migration localmente (desenvolvimento)
npx prisma migrate dev --name descricao-clara
# Revise o SQL gerado ANTES de continuar

# 2. Provisionar schemas nos bancos de produto (se novo banco ou novo organização)
CONFIGURADOR_DATABASE_URL=<url_cfg> DATABASE_URL=<url_produto_teste> \
  npx tsx scripts/migration/01-provision-schemas.ts

# 3. Aplicar migrations em TESTE primeiro — obrigatório
CONFIGURADOR_DATABASE_URL=<url_cfg> DATABASE_URL=<url_produto_teste> \
  npx tsx scripts/ativamente/migrate-all-tenants.ts --product=<nome>

# 4. Validar resultado no banco de teste

# 5. Só após validação explícita → aplicar em PRODUÇÃO (exige autorização)
CONFIGURADOR_DATABASE_URL=<url_cfg> DATABASE_URL=<url_produto_producao> \
  npx tsx scripts/ativamente/migrate-all-tenants.ts --product=<nome>
```

> **`prisma migrate dev` em banco de produto é proibido** — ele cria tabelas no schema
> `public`, violando a Regra 3 da `database-governance` (public 100% vazio).

### Regras invioláveis para o SQL das migrations

**1. Sem schema fixo hardcoded:**
```sql
-- ❌ PROIBIDO
ALTER TABLE "pedido"."pedido_itens" ...
-- ✅ CORRETO (search_path já foi definido pelo orquestrador)
ALTER TABLE "pedido_itens" ...
```

**2. RENAME e ALTER TYPE devem ser idempotentes:**
```sql
-- ✅ Padrão obrigatório
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedido_itens' AND column_name = 'nome_antigo') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "nome_antigo" TO "nome_novo";
  END IF;
END $$;
```

**3. DROP DEFAULT antes de cast de tipo:**
```sql
-- ✅ Obrigatório quando a coluna tem DEFAULT
ALTER TABLE "tabela" ALTER COLUMN "coluna" DROP DEFAULT;
ALTER TABLE "tabela" ALTER COLUMN "coluna" TYPE JSONB USING to_jsonb("coluna");
```

### Migrations destrutivas — sempre em duas fases

**Fase A** — adicionar novo (retrocompatível):
- Criar nova coluna/tabela
- Deploy do código que usa ambas
- Validar em staging e produção

**Fase B** — remover antigo (somente após validação):
- Remover coluna/tabela antiga
- Deploy final

---

## Índices Obrigatórios

Toda tabela no DB de organização (servicos-global) e produtos — campos Prisma em DDD; `@map` para a coluna física se necessário (ex.: `` enquanto a coluna ainda existir no banco):

```prisma
@@index([id_organizacao])
@@index([id_organizacao, id_produto])
@@index([id_organizacao, id_usuario])
```

### Índices compostos adicionais por padrão de query

```prisma
// Se filtra por status frequentemente
@@index([id_organizacao, status])

// Se ordena por data frequentemente
@@index([id_organizacao, created_at])

// Unique constraints sempre incluem id_organizacao
@@unique([id_organizacao, slug])
@@unique([id_organizacao, reference_number])
```

---

## Connection Pooling — PgBouncer (Fase 3)

Para atingir 50k requisições simultâneas:

| Config | Valor | Razão |
|:---|:---|:---|
| `pool_mode` | `transaction` | Conexão liberada após cada transaction |
| `default_pool_size` | 20 | Por serviço Railway |
| `max_client_conn` | 200 | Limite total |
| `server_idle_timeout` | 300 | Limpar conexões ociosas |

```bash
# Connection string via PgBouncer
DATABASE_URL=postgresql://user:pass@pgbouncer:6432/dbname?pgbouncer=true
```

> No Prisma: adicionar `?pgbouncer=true` à connection string.

---

## Particionamento (Fase 3)

Tabelas de alto volume que crescem indefinidamente:

| Tabela | Estratégia | Chave |
|:---|:---|:---|
| `audit_logs` | Range por mês | `created_at` |
| `emails` | Range por mês | `created_at` |
| `whatsapp_messages` | Range por mês | `created_at` |
| `dashboard_metrics` | Range por mês | `period_start` |

```sql
-- Exemplo: particionar audit_logs por mês
-- id TEXT (CUID) — nunca SUID; id_organizacao TEXT (CUID da organização)
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  id_organizacao TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  ...
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

---

## Vacuum e Manutenção

| Operação | Frequência | Automático? |
|:---|:---|:---|
| `autovacuum` | Contínuo | Sim (PostgreSQL padrão) |
| `ANALYZE` | Após migrations grandes | Manual |
| `REINDEX` | Mensal em tabelas de alto volume | Manual |
| Dead tuple ratio | Monitorar — alertar se > 20% | Automático |

---

## Monitoramento de Banco

| Métrica | Alerta quando | Ação |
|:---|:---|:---|
| Conexões ativas | > 80% do pool | Investigar queries lentas |
| Query time p95 | > 100ms | Revisar índices |
| Dead tuples | > 20% da tabela | Vacuum manual |
| Disk usage | > 80% | Cleanup ou upgrade |
| Lock waits | > 5s | Investigar deadlocks |

---

## Checklist — Operações de Banco

**Antes de criar uma migration:**
- [ ] O SQL referencia schema fixo (`"pedido".`, `"processo".`)? Se sim, remover.
- [ ] RENAME COLUMN ou ALTER TYPE está envolvido? Se sim, usar `DO $$ IF EXISTS`.
- [ ] ALTER TYPE com cast envolve coluna com DEFAULT? Se sim, `DROP DEFAULT` primeiro.
- [ ] Índices obrigatórios presentes (`id_organizacao`, `id_produto`, `id_usuario` — DDD/Mandamento 03)?
- [ ] Unique constraints incluem `id_organizacao`?

**Antes de escrever código de acesso ao banco:**
- [ ] Todo acesso ao banco usa `withTenant(req, fn)` ou `withTenantContext(idOrganizacao, fn)` (semântica DDD; o nome do parâmetro na API atual do SDK ainda é `tenantId`)?
- [ ] Nenhum `(req as any).prisma`, `req.prisma` ou `TenantRequest` no diff?
- [ ] `TenantContext` extraído via `(req as unknown as { organização: TenantContext }).organização`?
- [ ] `rawDb` castado como `const db = rawDb as any` com eslint-disable?
- [ ] Dados capturados via `let` antes de `withTenant` se precisam sair do bloco?
- [ ] Fire-and-forget usa `withTenantContext` APÓS `await withTenant(...)` resolver?
- [ ] Callbacks de `.filter()`, `.map()`, `.reduce()` NÃO têm `: any` explícito (hook CI bloqueia)?
- [ ] Ver `skills/arquitetura/sdk-tenant-resolver/SKILL.md` para referência completa.

**Nova Rota — Checklist do Desenvolvedor (regras invioláveis):**
- [ ] **withTenant obrigatório** — toda leitura/escrita de banco passa por `withTenant(req, ...)` ou `withTenantContext(tenantId, ...)`. Nunca `req.prisma`, nunca `new PrismaClient()`.
- [ ] **CUID obrigatório para novos registros** — IDs usam `@default(cuid())` no schema Prisma ou o helper `gerarId(prefixo)` em código TypeScript. SUID (`randomUUID`, `uuidv4`, `@default(suid())`) está proibido.
- [ ] **`as any` restrito ao cast do `db`** — `const db = rawDb as any` é o único `as any` autorizado na rota. Tipos de negócio (`Pedido`, `PedidoItem`, `Organização`, etc.) nunca recebem `as any`. Resultados de `findMany` usam `as any[]` (não `as any`) para permitir callbacks sem `: any` explícito.
- [ ] **Zod antes do banco** — toda rota valida entrada com `z.safeParse()` antes de qualquer operação com `db`.
- [ ] **Erros via `AppError`** — nunca `res.status(400).json()` direto no handler sem `next(err)`.

**Antes de aplicar em produção:**
- [ ] Migration validada no banco de **teste** (`gravity-*-teste`) com sucesso?
- [ ] Autorização explícita do responsável técnico obtida?
- [ ] Backup manual feito antes de migration destrutiva?
- [ ] `prisma migrate dev` NÃO foi usado diretamente no banco de produto?
- [ ] Query time validado para queries novas?
