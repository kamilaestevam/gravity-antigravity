---
name: antigravity-schema-composition
description: "Use esta skill sempre que uma tarefa envolver schemas Prisma, fragments, scripts de composição ou migrations. Reescrita 2026-04-17 após o pivô Schema-per-Organizacao. Define composição por produto (não mais por organizacao), models sem coluna de organizacao, multi-schema reality, orquestrador de migrations e o que nunca editar. Todo agente consulta esta skill antes de tocar em qualquer .prisma."
---

# Gravity — Schema Composition

> **Reescrita 2026-04-17 após o pivô Schema-per-Organização.**
> Decisões em [ADR-001](../../../documentos-tecnicos/arquitetura/schema-composition/adr-001-schema-por-organizacao.md), [ADR-002](../../../documentos-tecnicos/governanca/lei/sdk-resolvedor-organizacao/adr-002-sdk-resolvedor-organizacao.md) e [ADR-003](../../../documentos-tecnicos/arquitetura/schema-composition/adr-003-migracao-dados-legados.md).
>
> **Notas técnicas-chave:** o prefixo de schema PostgreSQL `tenant_<cuid>` é nome físico real; `tenant_id` é a coluna física antiga durante a janela de migração — o **campo Prisma é sempre `id_organizacao`** (DDD), mapeado via `@map("tenant_id")` enquanto a coluna não for renomeada.

> **Nota sobre nomes legados preservados:** vários nomes técnicos preservam o termo `tenant` por compatibilidade do SDK e dos artefatos físicos: o prefixo de schema PostgreSQL `tenant_<cuid>`, o script `migrate-all-tenants.ts`, os eventos `TenantProvisioned` e `TenantProvisionedComplete`, e a coluna física `tenant_id`. A migração desses nomes para `organizacao` virá em sessão dedicada (ADR futuro). Esta skill **não** repete o aviso a cada uso — a regra é: se você vê `tenant` num desses contextos físicos, é intencional.

---

## O Que Mudou no Pivô

| Antes (pré-pivô) | Depois (pós-pivô 2026-04-17) |
|:---|:---|
| 1 banco compartilhado por todos os serviços da organizacao | Cada produto e o serviço-de-organizacao compartilhado têm seu **próprio banco** com **N schemas (1 por organizacao)** |
| Models tinham `id_organizacao String` + 3 índices `@@index([id_organizacao, ...])` | Models de produto **não têm campo de organizacao**. O **schema é a organizacao**. |
| Coordenador compunha schema unificado de todos os serviços da organizacao | Coordenador compõe schema **por produto** (base + fragments dos serviços de produto) — não há mais "schema unificado de organizacao" |
| RLS PostgreSQL como defesa secundária | RLS apenas no Configurador. Em produtos, isolamento via `SET LOCAL search_path` no `withTenant` |
| `prisma migrate dev` aplicava em 1 schema | `scripts/ativamente/migrate-all-tenants.ts` aplica migration em **N schemas** |

---

## A Topologia Real de Bancos

```text
DB configurador          ← single-schema "public"
  └── organizacoes, usuarios, billing, permissões, plans
      (fonte de verdade global de identidade)

DB organizacao           ← schema-per-organizacao
  ├── schema "tenant_<cuid_A>" → atividades, email, whatsapp, ... da Organização A
  ├── schema "tenant_<cuid_B>" → atividades, email, whatsapp, ... da Organização B
  └── schema "public"          → tabelas globais (ex: ncm_catalog se houver)

DB pedido                ← schema-per-organizacao (1 banco por produto)
  ├── schema "tenant_<cuid_A>"
  └── schema "tenant_<cuid_B>"

DB processo              ← schema-per-organizacao
DB simula-custo          ← schema-per-organizacao
DB bid-frete             ← schema-per-organizacao
DB bid-cambio            ← schema-per-organizacao
DB nf-importacao         ← schema-per-organizacao
DB financeiro-comex      ← schema-per-organizacao
DB conector-erp          ← schema-per-organizacao
```

> **Regra:** nenhum produto compartilha banco com outro produto. Provisionamento de schema novo dispara via evento `TenantProvisioned` (worker + DLQ — [ADR-003](../../../documentos-tecnicos/arquitetura/schema-composition/adr-003-migracao-dados-legados.md)).

---

## Como Escrever um Model Pós-Pivô

### Estrutura obrigatória (produto)

```prisma
model Fatura {
  // 1. ID sempre primeiro
  id          String   @id @default(cuid())

  // 2. Campos do domínio (SEM campo de organizacao — o schema É a organizacao)
  numero      String
  valor       Decimal  @db.Decimal(15, 2)
  status      FaturaStatus @default(PENDENTE)

  // 3. Timestamps por último
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  // 4. Índices de domínio (SEM @@index([id_organizacao]))
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
// ❌ proibido pós-pivô — o schema é a organizacao
model Fatura {
  id              String @id
  id_organizacao  String    // ← REMOVER (campo + coluna física legada)
  numero          String

  @@index([id_organizacao])                       // ← REMOVER
  @@index([id_organizacao, id_produto])           // ← REMOVER
  @@index([id_organizacao, id_usuario])           // ← REMOVER
}
```

### Janela transitória (Fases 2-3 do ADR-003)

Durante o dual-write, o campo Prisma `id_organizacao` (com `@map("tenant_id")` apontando para a coluna física antiga) permanece nas tabelas por compatibilidade. **Após Fase 4 (Cleanup), o campo e a coluna são removidos via migration**. Não escreva código novo confiando em `id_organizacao` em produto — sempre use o schema isolado pelo SDK.

---

## Composição de Schema — Apenas Por Produto

A "composição de schema unificado de organizacao" foi **eliminada**. Cada banco tem seu próprio schema, composto independentemente:

### Para um produto (com fragments de serviços de produto)

```text
produto/pedido/server/prisma/
├── schema.base.prisma      ← models do próprio produto + datasource + generator
└── schema.prisma           ← composto (base + fragments)

servicos-global/produto/helpdesk/prisma/
└── fragment.prisma         ← composto no schema do produto que usar helpdesk
```

### Para o banco da organizacao (compartilhado entre serviços da organizacao)

```text
servicos-global/organizacao/prisma/
├── schema.base.prisma                   ← datasource + generator
├── atividades/prisma/fragment.prisma
├── email/prisma/fragment.prisma
├── whatsapp/...
└── schema.prisma                         ← composto (base + N fragments)
```

> **Regra:** o banco da organizacao continua tendo composição via fragments porque os serviços da organizacao são desenvolvidos em paralelo. Mas o resultado é aplicado em **cada schema `tenant_<cuid>`** via orquestrador, não em uma única tabela global.

---

## O Script de Composição — Por Produto

```typescript
// scripts/compose-product-schema.ts
import fs from 'node:fs'
import path from 'node:path'

interface ComposeArgs {
  productDir: string                       // ex: 'produto/pedido/server'
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

Migrations aplicam em **N schemas** (1 por organizacao ativa):

```typescript
// scripts/ativamente/migrate-all-tenants.ts
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

  // Exceção: console.log tolerado em scripts CLI de infra
  console.log(`Aplicando migration "${migrationName}" em ${rows.length} schemas...`)

  // 2. Aplicar a migration em cada schema (set search_path antes)
  for (const { schema_name } of rows) {
    const url = `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}schema=${schema_name}`
    try {
      execSync(
        `npx prisma migrate deploy --schema=prisma/schema.prisma`,
        { env: { ...process.env, DATABASE_URL: url }, stdio: 'inherit' }
      )
      // Exceção: console.log tolerado em scripts CLI de infra
      console.log(`✅ ${schema_name}`)
    } catch (err) {
      // Exceção: console.log tolerado em scripts CLI de infra
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
// servicos-global/organizacao/provisioner/worker.ts (consome o evento)
async function onTenantProvisioned({ idOrganizacao, products }: TenantProvisionedEvent) {
  for (const product of products) {
    const dbUrl = getProductDbUrl(product)
    await provisionTenantSchema({
      databaseUrl: dbUrl,
      schemaName: `tenant_${idOrganizacao}`,  // schema prefix real do Postgres
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
// produto/pedido/server/prisma/schema.base.prisma
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

> ⚠️ **REGRA ABSOLUTA:** Naming canônico (campos, tabelas, models, enums, headers) vive em [DDD Nomenclatura](../../governanca/lei/ddd-nomenclatura/SKILL.md). Esta skill define apenas o que é **específico da composição multi-schema**.

| Elemento | Convenção | Exemplo |
|:---|:---|:---|
| Schema PostgreSQL (prefixo físico) | `tenant_<cuid>` | `tenant_cl4abc123def0g0h1i2j3k4l5` |

> **Validação:** regex `^tenant_c[a-z0-9]{24}$` (CUID v1 gerado pelo Prisma). O SDK rejeita schemas que não batem.

> **TS vs Prisma/DB:** TypeScript em **camelCase** (ex: `idOrganizacao`, `databaseUrl`); Prisma/DB em **snake_case** (ex: `id_organizacao`, `created_at`). Os dois mundos não se misturam — o mapper/DTO faz a conversão na fronteira.

---

## Validação Pelo Coordenador

Após receber fragments e antes de orquestrar migration:

```bash
# 1. Compor o schema do produto
npx tsx scripts/compose-product-schema.ts --product=pedido

# 2. Validar Prisma
npx prisma validate --schema=produto/pedido/server/prisma/schema.prisma

# 3. Gerar cliente
npx prisma generate --schema=produto/pedido/server/prisma/schema.prisma

# 4. Criar migration (ainda NÃO deploy)
npx prisma migrate dev --create-only --name "add-fatura-status" \
  --schema=produto/pedido/server/prisma/schema.prisma

# 5. Revisar SQL gerada
cat produto/pedido/server/prisma/migrations/*/migration.sql

# 6. Aplicar em N schemas via orquestrador (staging primeiro)
npx tsx scripts/ativamente/migrate-all-tenants.ts --product=pedido --env=staging
```

Se qualquer etapa falhar → Coordenador notifica o agente responsável com o erro específico. Não avança.

---

## Checklist Anti-Conflito (fragments)

- [ ] Meu fragment não define datasources nem generators
- [ ] Models não têm campo `id_organizacao` (o schema É a organizacao)
- [ ] Models não têm `@@index([id_organizacao, ...])` (o schema isola fisicamente)
- [ ] Nomes de models e enums não colidem com outros fragments
- [ ] Nenhuma relação com models de outros fragments (use IDs cruzados ou peça ao Coordenador para arbitrar)
- [ ] **`@@map("tabela_snake_case")` declarado em todo model** (PascalCase Prisma + snake_case PG). `@map` de coluna: só para colunas físicas legadas durante janela de migração (ex.: `@map("tenant_id")`). Colunas novas seguem DDD direto com paridade Prisma↔PG.

---

## O Que Nunca Fazer

- ❌ Editar `schema.prisma` final manualmente — sobrescrito no próximo `compose`
- ❌ Adicionar campo `id_organizacao` em models de produto novos — o schema É a organizacao
- ❌ Rodar `prisma migrate dev` direto contra DB de produto — sempre via orquestrador
- ❌ Provisionar schema novo manualmente — é responsabilidade do worker do `TenantProvisioned`
- ❌ Compartilhar banco entre dois produtos
- ❌ Confiar em RLS em banco de produto (não existe mais)
- ❌ Usar `import { PrismaClient } from '@prisma/client'` em código de aplicação — apenas dentro do SDK

---

## Checklist — Antes de Submeter Schema/Migration

- [ ] Models não têm campo `id_organizacao` (exceto durante janela de migração ADR-003 Fases 2-3, onde fica `id_organizacao String` com `@map("tenant_id")`)?
- [ ] Removi os 3 índices antigos por organizacao (`@@index([id_organizacao])`, `@@index([id_organizacao, id_produto])`, `@@index([id_organizacao, id_usuario])`)?
- [ ] Rodei `compose-product-schema` localmente?
- [ ] `prisma validate` passou?
- [ ] Migration foi criada com `--create-only` e revisei o SQL?
- [ ] O orquestrador `migrate-all-tenants.ts` foi testado em staging com pelo menos 2 schemas?
- [ ] Acionei o Coordenador para aprovar antes de aplicar em produção?
- [ ] Atualizei `documentos-tecnicos/` se a mudança afeta contrato/regra?

> **TS vs Prisma/DB:** TypeScript em **camelCase**, Prisma/DB em **snake_case**. Não misturar — o mapper faz a fronteira.
