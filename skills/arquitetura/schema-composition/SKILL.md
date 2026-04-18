---
name: antigravity-schema-composition
description: "Use esta skill sempre que uma tarefa envolver schemas Prisma, fragments, scripts de composição ou migrations. Reescrita 2026-04-17 após o pivô Schema-per-Tenant. Define composição por produto (não mais por tenant), models sem tenant_id, multi-schema reality, orquestrador de migrations e o que nunca editar. Todo agente consulta esta skill antes de tocar em qualquer .prisma."
---

# Gravity — Schema Composition (pós-pivô 2026-04-17)

> **Reescrita 2026-04-17 após o pivô Schema-per-Tenant.**
> Decisões em [ADR-001](../../../documentos-tecnicos/adr/ADR-001-schema-per-tenant.md), [ADR-002](../../../documentos-tecnicos/adr/ADR-002-tenant-resolver-sdk.md) e [ADR-003](../../../documentos-tecnicos/adr/ADR-003-migracao-dados-legados.md).

---

## O Que Mudou no Pivô

| Antes (pré-pivô) | Depois (pós-pivô 2026-04-17) |
|:---|:---|
| 1 banco `tenant-db` compartilhado por todos os serviços de tenant | Cada produto e o serviço-tenant compartilhado têm seu **próprio banco** com **N schemas (1 por tenant)** |
| Models tinham `tenant_id String` + 3 índices `@@index([tenant_id, ...])` | Models de produto **não têm `tenant_id`**. O **schema é o tenant**. |
| Coordenador compunha schema unificado de todos os serviços de tenant | Coordenador compõe schema **por produto** (base + fragments dos serviços de produto) — não há mais "schema unificado de tenant" |
| RLS PostgreSQL como defesa secundária | RLS apenas no Configurador. Em produtos, isolamento via `SET LOCAL search_path` no `withTenant` |
| `prisma migrate dev` aplicava em 1 schema | `scripts/migrate-all-tenants.ts` aplica migration em **N schemas** |

---

## A Topologia Real de Bancos

```text
DB configurador          ← single-schema "public"
  └── tenants, users, billing, permissões, plans
      (fonte de verdade global de identidade)

DB tenant-shared         ← schema-per-tenant
  ├── schema "tenant_<cuid_A>" → atividades, email, whatsapp, ... do Tenant A
  ├── schema "tenant_<cuid_B>" → atividades, email, whatsapp, ... do Tenant B
  └── schema "public"          → tabelas globais (ex: ncm_catalog se houver)

DB pedido-db             ← schema-per-tenant (1 banco por produto)
  ├── schema "tenant_<cuid_A>"
  └── schema "tenant_<cuid_B>"

DB processo-db           ← schema-per-tenant
DB simula-custo-db       ← schema-per-tenant
DB bid-frete-db          ← schema-per-tenant
DB bid-cambio-db         ← schema-per-tenant
DB nf-importacao-db      ← schema-per-tenant
DB financeiro-comex-db   ← schema-per-tenant
DB conector-erp-db       ← schema-per-tenant
```

> **Regra:** nenhum produto compartilha banco com outro produto. Provisionamento de schema novo dispara via evento `TenantProvisioned` (worker + DLQ — [ADR-003](../../../documentos-tecnicos/adr/ADR-003-migracao-dados-legados.md)).

---

## Como Escrever um Model Pós-Pivô

### Estrutura obrigatória (produto)

```prisma
model Fatura {
  // 1. ID sempre primeiro
  id          String   @id @default(cuid())

  // 2. Campos do domínio (SEM tenant_id — o schema é o tenant)
  numero      String
  valor       Decimal  @db.Decimal(15, 2)
  status      FaturaStatus @default(PENDENTE)

  // 3. Timestamps por último
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  // 4. Índices de domínio (SEM @@index([tenant_id]))
  @@index([numero])
  @@index([status, created_at])
}

enum FaturaStatus {
  PENDENTE
  PAGA
  CANCELADA
}
```

### O que NÃO fazer mais

```prisma
// ❌ proibido pós-pivô — o schema é o tenant
model Fatura {
  id        String @id
  tenant_id String          // ← REMOVER
  numero    String

  @@index([tenant_id])                       // ← REMOVER
  @@index([tenant_id, product_id])           // ← REMOVER
  @@index([tenant_id, user_id])              // ← REMOVER
}
```

### Janela transitória (Fases 2-3 do ADR-003)

Durante o dual-write, `tenant_id` permanece em coluna por compatibilidade. **Após Fase 4 (Cleanup), é removido via migration**. Não escreva código novo confiando em `tenant_id` — sempre use o schema isolado pelo SDK.

---

## Composição de Schema — Apenas Por Produto

A "composição de schema unificado de tenant" foi **eliminada**. Cada banco tem seu próprio schema, composto independentemente:

### Para um produto (com fragments de serviços de produto)

```text
produtos/pedido/server/prisma/
├── schema.base.prisma      ← models do próprio produto + datasource + generator
└── schema.prisma           ← composto (base + fragments)

servicos-global/produto/helpdesk/prisma/
└── fragment.prisma         ← composto no schema do produto que usar helpdesk
```

### Para o tenant-shared (compartilhado entre serviços de tenant)

```text
servicos-global/tenant/prisma/
├── schema.base.prisma                   ← datasource + generator
├── atividades/prisma/fragment.prisma
├── email/prisma/fragment.prisma
├── whatsapp/...
└── schema.prisma                         ← composto (base + N fragments)
```

> **Regra:** `tenant-shared` continua tendo composição via fragments porque os serviços de tenant são desenvolvidos em paralelo. Mas o resultado é aplicado em **cada schema `tenant_<cuid>`** via orquestrador, não em uma única tabela global.

---

## O Script de Composição — Por Produto

```typescript
// scripts/compose-product-schema.ts
import fs from 'node:fs'
import path from 'node:path'

interface ComposeArgs {
  productDir: string                       // ex: 'produtos/pedido/server'
  serviceFragments: string[]               // ex: ['servicos-global/produto/helpdesk/prisma/fragment.prisma']
}

export function composeProductSchema({ productDir, serviceFragments }: ComposeArgs) {
  const base = fs.readFileSync(
    path.join(productDir, 'prisma/schema.base.prisma'), 'utf8'
  )
  const fragments = serviceFragments.map(f => fs.readFileSync(f, 'utf8'))
  const composed = [base, ...fragments].join('\n\n')

  fs.writeFileSync(
    path.join(productDir, 'prisma/schema.prisma'), composed
  )
}
```

Executado pelo Coordenador antes de `prisma generate` e antes do orquestrador de migrations.

---

## O Orquestrador de Migrations — `migrate-all-tenants.ts`

Migrations aplicam em **N schemas** (1 por tenant ativo):

```typescript
// scripts/migrate-all-tenants.ts
import { execSync } from 'node:child_process'
import { Client } from 'pg'

interface MigrateArgs {
  databaseUrl: string                      // banco do produto
  migrationName: string
}

async function migrateAllTenants({ databaseUrl, migrationName }: MigrateArgs) {
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  // 1. Listar todos os schemas tenant_*
  const { rows } = await client.query<{ schema_name: string }>(`
    SELECT schema_name FROM information_schema.schemata
    WHERE schema_name LIKE 'tenant_%'
    ORDER BY schema_name
  `)
  await client.end()

  console.log(`Aplicando migration "${migrationName}" em ${rows.length} schemas...`)

  // 2. Aplicar a migration em cada schema (set search_path antes)
  for (const { schema_name } of rows) {
    const url = `${databaseUrl}?schema=${schema_name}`
    try {
      execSync(
        `npx prisma migrate deploy --schema=prisma/schema.prisma`,
        { env: { ...process.env, DATABASE_URL: url }, stdio: 'inherit' }
      )
      console.log(`✅ ${schema_name}`)
    } catch (err) {
      console.error(`❌ ${schema_name} — abortando.`)
      throw err
    }
  }
}
```

> **Regra:** nenhum agente roda `prisma migrate dev` solto contra DB de produto. Sempre via orquestrador. Falha em 1 schema **aborta** o lote inteiro (rollback manual + investigação).

---

## Provisionamento de Schema Novo

Não é responsabilidade do agente que escreve a feature. Quando o Configurador emite `TenantProvisioned`:

```typescript
// servicos-global/tenant/provisioner/worker.ts (consome o evento)
async function onTenantProvisioned({ tenantId, products }: TenantProvisionedEvent) {
  for (const product of products) {
    const dbUrl = getProductDbUrl(product)
    await provisionTenantSchema({
      databaseUrl: dbUrl,
      schemaName: `tenant_${tenantId.replace(/-/g, '')}`,
    })
    // Worker tem retry exponencial + DLQ se falhar.
  }
}
```

`provisionTenantSchema` faz:
1. `CREATE SCHEMA IF NOT EXISTS "tenant_xxx"`
2. Aplica todas as migrations existentes nesse schema
3. Notifica o Configurador (`TenantProvisionedComplete` no event bus)

---

## O schema.base.prisma — Nunca Modificar Manualmente

Contém apenas datasource e generator. Models vão em fragments ou no próprio produto:

```prisma
// produtos/pedido/server/prisma/schema.base.prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-1.1.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("PEDIDO_DATABASE_URL")
}
```

---

## Regras de Naming

| Elemento | Convenção | Exemplo |
|:---|:---|:---|
| Schema PostgreSQL | `tenant_<cuid>` | `tenant_a1b2c3d4...` |
| Model | PascalCase, prefixado se houver risco de colisão | `Fatura`, `HelpdeskTicket` |
| Campos | snake_case | `numero_pedido`, `created_at` |
| Enum values | UPPER_SNAKE_CASE | `EM_PROCESSAMENTO`, `PAGA` |

> Validação: regex `^tenant_c[a-z0-9]{24}$` (CUID gerado pelo Prisma). O SDK rejeita schemas que não batem.

---

## Validação Pelo Coordenador

Após receber fragments e antes de orquestrar migration:

```bash
# 1. Compor o schema do produto
npx tsx scripts/compose-product-schema.ts --product=pedido

# 2. Validar Prisma
npx prisma validate --schema=produtos/pedido/server/prisma/schema.prisma

# 3. Gerar cliente
npx prisma generate --schema=produtos/pedido/server/prisma/schema.prisma

# 4. Criar migration (ainda NÃO deploy)
npx prisma migrate dev --create-only --name "add-fatura-status" \
  --schema=produtos/pedido/server/prisma/schema.prisma

# 5. Revisar SQL gerada
cat produtos/pedido/server/prisma/migrations/*/migration.sql

# 6. Aplicar em N schemas via orquestrador (staging primeiro)
npx tsx scripts/migrate-all-tenants.ts --product=pedido --env=staging
```

Se qualquer etapa falhar → Coordenador notifica o agente responsável com o erro específico. Não avança.

---

## Checklist Anti-Conflito (fragments)

- [ ] Meu fragment não define datasources nem generators
- [ ] Models não têm `tenant_id` (o schema é o tenant)
- [ ] Models não têm `@@index([tenant_id, ...])` (o schema isola fisicamente)
- [ ] Nomes de models e enums não colidem com outros fragments
- [ ] Nenhuma relação com models de outros fragments (use IDs cruzados ou peça ao Coordenador para arbitrar)
- [ ] Sem `@map` ou `@@map` (mantém naming canônico)

---

## O Que Nunca Fazer

- ❌ Editar `schema.prisma` final manualmente — sobrescrito no próximo `compose`
- ❌ Adicionar `tenant_id` em models de produto — o schema é o tenant
- ❌ Rodar `prisma migrate dev` direto contra DB de produto — sempre via orquestrador
- ❌ Provisionar schema novo manualmente — é responsabilidade do worker do `TenantProvisioned`
- ❌ Compartilhar banco entre dois produtos
- ❌ Confiar em RLS em banco de produto (não existe mais)
- ❌ Usar `import { PrismaClient } from '@prisma/client'` em código de aplicação — apenas dentro do SDK

---

## Checklist — Antes de Submeter Schema/Migration

- [ ] Models não têm `tenant_id` (exceto durante janela de migração ADR-003 Fases 2-3)?
- [ ] Removi os 3 índices de tenant antigos (`@@index([tenant_id])`, etc.)?
- [ ] Rodei `compose-product-schema` localmente?
- [ ] `prisma validate` passou?
- [ ] Migration foi criada com `--create-only` e revisei o SQL?
- [ ] O orquestrador `migrate-all-tenants.ts` foi testado em staging com pelo menos 2 schemas?
- [ ] Acionei o Coordenador para aprovar antes de aplicar em produção?
- [ ] Atualizei `documentos-tecnicos/` se a mudança afeta contrato/regra?
