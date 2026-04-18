---
name: antigravity-database-governance
description: "Use esta skill SEMPRE antes de criar ou alterar models Prisma, schemas, migrations, ou qualquer código que toque banco de dados. Define três regras inegociáveis: (1) paridade nominal absoluta Front=Back=Banco, (2) Database-per-Service com isolamento físico por produto, (3) schema public 100% vazio em bancos de produto. Criada na Sprint 2 (2026-04-18)."
---

# Gravity — Governança de Banco de Dados

> Esta skill é **complementar** a `skills/arquitetura/tenant-isolation/SKILL.md` e `skills/arquitetura/sdk-tenant-resolver/SKILL.md`.
> Foco: regras físicas de estrutura, nomeação e paridade — não no acesso ao banco (que é responsabilidade do SDK).

---

## Regra Zero — Padrão de IDs (CUID Obrigatório)

> **Decisão arquitetural de 2026-04-18 — inviolável.**

**Todo campo `id` em todo model Prisma do projeto DEVE usar `@default(cuid())`.**

```prisma
// ✅ OBRIGATÓRIO — padrão único do ecossistema
model Qualquer {
  id String @id @default(cuid())
}

// ❌ ESTRITAMENTE PROIBIDO — nunca usar uuid() em nenhum model
model Qualquer {
  id String @id @default(uuid())
}
```

| Contexto | Gerador | Formato |
|:---|:---|:---|
| Tenant, Company, Pedido, todos os models | Prisma `@default(cuid())` | `c` + 24 chars `[a-z0-9]`, 25 chars total |
| User (Clerk) | Clerk (externo) | `user_...` — não controlado pelo Prisma |
| correlationId (por request) | `randomUUID()` runtime | UUID v4 — não é ID de model Prisma |

**Por que CUID e não UUID:**
- O banco é a fonte de verdade — os dados existentes usam CUID
- O código obedece o banco (não o contrário)
- CUID é o padrão gerado pelo Prisma `@default(cuid())` desde o início do projeto
- Schema names derivam do tenantId: `tenant_<cuid>` (regex `^tenant_c[a-z0-9]{24}$`)

**Agentes: se você escrever `@default(uuid())` em qualquer arquivo `.prisma`, o CI vai bloquear o deploy.**

---

## As 3 Regras Inegociáveis

### Regra 1 — Paridade Nominal Absoluta (Front = Back = Banco)

**A regra mais importante do projeto.** Definida em [`documentos-tecnicos/campos-back-front-banco/documentacao-tecnica.md`](../../../documentos-tecnicos/campos-back-front-banco/documentacao-tecnica.md).

```
nome_no_banco (PostgreSQL snake_case)
  = nome_no_back (Prisma model field + TypeScript server)
    = nome_no_front (TypeScript client + interface)
      = chave no payload JSON da API
```

**Não existe nenhuma camada de tradução.** Exemplos:

```typescript
// ✅ CORRETO — mesmo nome nos 4 contextos
// Banco:  quantidade_inicial_item_pedido DECIMAL(18,6)
// Prisma: quantidade_inicial_item_pedido Decimal
// API:    { "quantidade_inicial_item_pedido": 10.5 }
// React:  item.quantidade_inicial_item_pedido

// ❌ PROIBIDO — qualquer forma de alias
model PedidoItem {
  quantidade_inicial_item_pedido Decimal @map("qty_initial")  // BLOQUEADO
}

// ❌ PROIBIDO — dicionário de tradução no serviço
const aliasMap = { quantidadeInicial: 'quantidade_inicial_item_pedido' }  // BLOQUEADO

// ❌ PROIBIDO — camelCase no banco
model PedidoItem {
  quantidadeInicial Decimal  // ERRADO — banco é snake_case
}
```

**Como verificar conformidade:**
1. Abrir `campos-back-front-banco/export-campos-completo-corrigido.csv`
2. Colunas `nome_no_banco`, `nome_no_back`, `nome_no_front` devem ser **idênticas**
3. Nenhum `@map()` de coluna no `fragment.prisma` de produto
4. Nenhum alias em services TypeScript

---

### Regra 2 — Database-per-Service (Banco Separado por Produto)

**Cada produto tem seu próprio banco PostgreSQL.** Não compartilha banco com outro produto, nunca.

#### Hierarquia física obrigatória

```
Banco PostgreSQL (por produto)
  └── Schema: tenant_<cuid>    ← 1 por tenant (empresa)
       └── Tabelas: pedido, pedido_item, ...   ← dados do tenant
```

#### Bancos existentes e suas variáveis de ambiente

| Serviço | Banco | DATABASE_URL |
|:---|:---|:---|
| Pedido | `gravity-pedido` | `DATABASE_URL` em `produtos/pedido/server/` |
| Processo | `gravity-processo` | `DATABASE_URL` em `produtos/processo/server/` |
| SimulaCusto | `gravity-simula-custo` | `DATABASE_URL` em `produtos/simula-custo/server/` |
| NF Importação | `gravity-nf-importacao` | `DATABASE_URL` em `produtos/nf-importacao/server/` |
| Conector ERP | `gravity-conector-erp` | `DATABASE_URL` em `servicos-global/tenant/conector-erp/` |
| Serviços Tenant | `gravity-tenant-services` | `DATABASE_URL` em `servicos-global/tenant/server/` |
| Configurador | `gravity-configurador` | `DATABASE_URL` em `servicos-global/configurador/` |

> **Configurador é exceção:** schema `public` único (fonte de verdade de identidade global — Tenant, User, Subscription). Não usa Schema-per-Tenant.

#### Proibições de cross-service

```typescript
// ❌ PROIBIDO — produto acessando banco de outro produto
import { prisma as pedidoPrisma } from '../../../produtos/pedido/server/prisma.js'

// ❌ PROIBIDO — produto acessando banco do Configurador
import { prisma as configuradorPrisma } from '../../../servicos-global/configurador/server/prisma.js'

// ✅ CORRETO — comunicação apenas via REST API com x-internal-key
const response = await fetch(`${CONFIGURATOR_URL}/api/internal/users/${userId}`, {
  headers: { 'x-internal-key': process.env.INTERNAL_SERVICE_KEY! }
})
```

---

### Regra 3 — `public` 100% Vazio em Bancos de Produto

Em todo banco de produto (Pedido, Processo, SimulaCusto, etc.), após a migração Schema-per-Tenant, o schema `public` **deve estar completamente vazio**. Toda tabela de dados vive em `tenant_<id>`.

```sql
-- ✅ Estado correto após migração completa (ADR-003 Fase 4)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
-- → 0 linhas (zero tabelas)

-- ✅ Todas as tabelas estão nos schemas de tenant
SELECT schemaname, tablename FROM pg_tables
WHERE schemaname LIKE 'tenant_%';
-- → pedido, pedido_item, pedido_item_lote, ... (por schema/tenant)
```

**Por que isso importa:**
1. **Elimina "fantasmas":** tabelas em `public` podem ser lidas por qualquer conexão sem `search_path` definido
2. **Previne acesso acidental:** um desenvolvedor que se conecta sem SDK não encontra dado nenhum
3. **Auditoria limpa:** `\dt` no `public` retorna vazio — estado inequívoco de conformidade

#### Limpeza de resíduos locais

Durante desenvolvimento, é comum o `prisma migrate dev` criar tabelas no `public`. Antes de qualquer commit:

```bash
# Verificar se public está limpo
psql $DATABASE_URL -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';"
# Esperado: 0

# Se houver resíduos — limpar explicitamente
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# NÃO usar prisma migrate dev em banco de produto
# Migrations rodam via scripts/migrate-all-tenants.ts (ADR-003)
```

---

## Referências de Nomenclatura por Módulo

### Fonte de verdade de campos

| Módulo | Arquivo canônico |
|:---|:---|
| **Pedido** | `documentos-tecnicos/campos-back-front-banco/export-campos-completo-corrigido.csv` |
| **Processo** | `documentos-tecnicos/arquitetura-do-produto/dicionario-master-comex.prisma` |
| **Admin** | `documentos-tecnicos/campos-back-front-banco/admin-telas-padronizacao.md` |
| **Configurador/Workspace** | `documentos-tecnicos/campos-back-front-banco/configurador-telas-padronizacao.md` |
| **Core (IDs, modelos globais)** | `documentos-tecnicos/arquitetura-do-produto/dicionario-dados.md` |

### Convenção de nomenclatura

| Contexto | Convenção | Exemplo |
|:---|:---|:---|
| Tabela PostgreSQL | `snake_case` plural | `pedido_item` |
| Campo PostgreSQL | `snake_case` | `quantidade_inicial_item_pedido` |
| Model Prisma | `PascalCase` singular | `PedidoItem` |
| Campo Prisma | `snake_case` (idêntico ao banco) | `quantidade_inicial_item_pedido` |
| TypeScript server | `snake_case` no DTO/interface | `quantidade_inicial_item_pedido` |
| TypeScript client | `snake_case` | `item.quantidade_inicial_item_pedido` |
| Chave JSON API | `snake_case` | `{ "quantidade_inicial_item_pedido": 10 }` |
| Schema tenant | `tenant_<32hex>` | `tenant_550e8400e29b41d4a716446655440000` |

### Padrão de IDs (Stripe-Like)

```
[prefixo]_id_[9 dígitos]_[YY]

Pedido:    ped_id_108422/26
Processo:  core_id_000001/26
Invoice:   inv_id_001920/26
DUIMP:     duim_id_108422/26
Estimativa: esti_id_108422/26
```

Sequência isolada por **workspace** e **produto**. Reset automático no virar do ano.

---

## Campos Calculados — Regras Absolutas

Campos calculados **nunca são editáveis** e **nunca são enviados pelo front**. Computados sempre no servidor/banco.

### Módulo Pedido

**Nível Pedido (calculados a partir dos itens):**
```
valor_total_pedido                  = SUM(valor_total_itens)
quantidade_total_inicial_pedido     = SUM(quantidade_inicial_item_pedido)
quantidade_transferida_total_pedido = SUM(quantidade_transferida_item_pedido)
peso_liquido_total_pedido           = SUM(peso_liquido_unitario × saldo)
peso_bruto_total_pedido             = SUM(peso_bruto_unitario × saldo)
cubagem_total_pedido                = SUM(cubagem_unitaria × saldo)
```

**Nível Item (lógica A-B-C):**
```
saldo_item_pedido         = quantidade_inicial_item_pedido
                            − quantidade_transferida_item_pedido
                            − quantidade_cancelada_item_pedido
                            (NUNCA editável)

valor_total_itens         = valor_unitario_item × saldo_item_pedido
                            (NUNCA editável)
```

> **Referência:** `project_pedido_campos_quantidade.md` na memória do agente.

---

## Estrutura de `fragment.prisma` por Produto

Cada produto/serviço escreve **apenas seu próprio** `fragment.prisma`. O Coordenador compõe o `schema.prisma` final via `scripts/compose-tenant-schema.ts`.

```text
produtos/pedido/prisma/
  └── fragment.prisma           ← define modelos Pedido, PedidoItem, PedidoItemLote

servicos-global/tenant/notificacoes/prisma/
  └── fragment.prisma           ← define modelos Notificacao, NotificacaoConfig

# O Coordenador une todos os fragments:
servicos-global/tenant/generated/
  └── schema.prisma             ← NUNCA editar diretamente
```

**Regras do `fragment.prisma`:**
- Nenhum `@map()` de coluna
- Nenhum `tenant_id` após ADR-003 Fase 4 (o schema isolado dispensa o campo)
- Nenhum `@@index([tenant_id, ...])` após ADR-003 Fase 4
- Nenhum agente edita `schema.prisma` final — só o Coordenador

---

## Checklist — Antes de Criar ou Alterar Qualquer Model

- [ ] Nome do campo está idêntico no banco, Prisma, TypeScript e JSON?
- [ ] Consultei `export-campos-completo-corrigido.csv` (Pedido) ou o dicionário correspondente?
- [ ] Nenhum `@map()` de coluna no `fragment.prisma`?
- [ ] Produto tem seu próprio `DATABASE_URL` (não compartilha banco)?
- [ ] `public` schema não vai receber tabelas de dados?
- [ ] Campos calculados não estão marcados como editáveis/obrigatórios no front?
- [ ] ID segue o padrão `[prefixo]_id_[9 dígitos]/[YY]`?
- [ ] Só modifiquei o `fragment.prisma` do meu produto (não o `schema.prisma` composto)?
- [ ] Migration vai rodar via orquestrador `scripts/migrate-all-tenants.ts` (não `prisma migrate dev`)?
