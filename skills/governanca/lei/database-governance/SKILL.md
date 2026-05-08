---
name: antigravity-database-governance
description: "Use esta skill SEMPRE antes de criar ou alterar models Prisma, schemas, migrations, ou qualquer código que toque banco de dados. Define três regras inegociáveis: (1) paridade nominal absoluta Front=Back=Banco, (2) Database-per-Service com isolamento físico por produto, (3) schema public 100% vazio em bancos de produto. Criada na Sprint 2 (2026-04-18)."
---

# Gravity — Governança de Banco de Dados

> Esta skill é **complementar** a `skills/governanca/lei/isolamento-organizacao/SKILL.md` e `skills/governanca/lei/sdk-resolvedor-organizacao/SKILL.md`.
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

// ❌ ESTRITAMENTE PROIBIDO — nunca usar suid() em nenhum model
model Qualquer {
  id String @id @default(suid())
}
```

| Contexto | Gerador | Formato |
|:---|:---|:---|
| Organização, Workspace, Pedido, todos os models | Prisma `@default(cuid())` | `c` + 24 chars `[a-z0-9]`, 25 chars total |
| Usuário (Clerk) | Clerk (externo) | `user_...` — não controlado pelo Prisma |
| correlationId (por request) | `randomUUID()` runtime | SUID v4 — não é ID de model Prisma |

**Por que CUID e não SUID:**
- O banco é a fonte de verdade — os dados existentes usam CUID
- O código obedece o banco (Mandamento 02 — `schema.prisma` é INTOCÁVEL)
- CUID é o padrão gerado pelo Prisma `@default(cuid())` desde o início do projeto
- Schema names derivam do `id_organizacao`: `tenant_<cuid>` (regex `^tenant_c[a-z0-9]{24}$`) — o prefixo `tenant_` é mantido como identificador real de schema PostgreSQL

**Agentes: se você escrever `@default(suid())` em qualquer arquivo `.prisma`, o CI vai bloquear o deploy.**

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
3. Nenhum `@map()` de **coluna** no `fragment.prisma` de produto (paridade campo↔coluna é absoluta)
4. Nenhum alias em services TypeScript
5. **`@@map("tabela_snake_case")` é obrigatório em todo model** — o model fica em PascalCase (convenção Prisma), a tabela PG em snake_case. Isso NÃO rompe paridade porque é o nome da tabela, não da coluna.

---

### Regra 2 — Database-per-Service (Banco Separado por Produto)

**Cada produto tem seu próprio banco PostgreSQL.** Não compartilha banco com outro produto, nunca.

#### Hierarquia física obrigatória

```
Banco PostgreSQL (por produto)
  └── Schema: tenant_<cuid>    ← 1 por organização (empresa)
       └── Tabelas: pedido, pedido_item, ...   ← dados da organização
```

#### Bancos existentes e suas variáveis de ambiente

| Serviço | Banco | DATABASE_URL |
|:---|:---|:---|
| Pedido | `gravity-pedido` | `DATABASE_URL` em `produto/pedido/server/` |
| Processo | `gravity-processo` | `DATABASE_URL` em `produto/processo/server/` |
| SimulaCusto | `gravity-simula-custo` | `DATABASE_URL` em `produto/simula-custo/server/` |
| NF Importação | `gravity-nf-importacao` | `DATABASE_URL` em `produto/nf-importacao/server/` |
| Conector ERP | `gravity-conector-erp` | `DATABASE_URL` em `servicos-global/organização/conector-erp/` |
| Serviços por Organização | `gravity-organização-services` | `DATABASE_URL` em `servicos-global/organização/server/` |
| Configurador | `gravity-configurador` | `DATABASE_URL` em `servicos-global/configurador/` |

> **Configurador é exceção:** schema `public` único (fonte de verdade de identidade global — Organização, Workspace, Usuário, Subscription). Não usa Schema-per-Organização.

#### Proibições de cross-service

```typescript
// ❌ PROIBIDO — produto acessando banco de outro produto
import { prisma as pedidoPrisma } from '../../../produto/pedido/server/prisma.js'

// ❌ PROIBIDO — produto acessando banco do Configurador
import { prisma as configuradorPrisma } from '../../../servicos-global/configurador/server/prisma.js'

// ✅ CORRETO — comunicação apenas via REST API com x-chave-interna
const response = await fetch(`${CONFIGURATOR_URL}/api/internal/users/${idUsuario}`, {
  headers: { 'x-chave-interna': process.env.INTERNAL_SERVICE_KEY! }
})
```

---

### Regra 3 — `public` 100% Vazio em Bancos de Produto

Em todo banco de produto (Pedido, Processo, SimulaCusto, etc.), após a migração Schema-per-Organização, o schema `public` **deve estar completamente vazio**. Toda tabela de dados vive em `tenant_<id>`.

```sql
-- ✅ Estado correto (Pivô Arquitetural 2026-04-17)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
-- → 0 linhas (zero tabelas)

-- ✅ Todas as tabelas estão nos schemas de organização
SELECT schemaname, tablename FROM pg_tables
WHERE schemaname LIKE 'tenant_%';
-- → pedido, pedido_item, pedido_item_lote, ... (por schema/organização)
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
# Migrations rodam via scripts/ativamente/migrate-all-tenants.ts (Pivô Arquitetural 2026-04-17)
```

---

## Regra de Ouro — FK Nullable Proibida para Acesso Global (Mandamento 04)

> **Decisão arquitetural de 2026-04-20 — inviolável.**
> **Exceção Master/Super Admin:** Master e Super Admin (Gravity Admin) têm acesso global SEM precisar de `UsuarioWorkspace` (Mandamento 04 — Lógica do Limbo).
> A regra abaixo se aplica apenas a outros papéis (`tipo_usuario` que requer vínculo explícito por workspace).

**O acesso de um usuário a "todos os Workspaces" de um tipo que requer vínculo NUNCA é representado por `id_workspace = null` ou FK ausente.**

É SEMPRE feito via **Bulk Insert explícito** na tabela de vínculos (`UsuarioWorkspace`) no ato do convite.

```typescript
// ❌ PROIBIDO — FK nullable para representar "acesso global"
model UsuarioWorkspace {
  id_workspace String?   // NUNCA — null não significa "todos"
}

// ❌ PROIBIDO — lógica condicional no backend para "se null, retorna tudo"
if (!membership.id_workspace) return allWorkspaces  // NUNCA — Mandamento 08

// ✅ OBRIGATÓRIO — Bulk Insert no momento do convite (papéis que requerem vínculo)
async function convidarUsuarioComVinculo(idOrganizacao: string, idUsuario: string) {
  const workspacesAtivos = await prisma.workspace.findMany({
    where: { id_organizacao: idOrganizacao, status: 'ATIVA' }
  })
  await prisma.usuarioWorkspace.createMany({
    data: workspacesAtivos.map(w => ({
      id_organizacao: idOrganizacao,
      id_workspace: w.id,   // sempre explícito — nunca null
      id_usuario: idUsuario,
      tipo_usuario: 'WORKSPACE_ADMIN',
    }))
  })
}

// ✅ Master/Super Admin (Mandamento 04): NÃO criar UsuarioWorkspace — acesso global é detectado pelo tipo_usuario
```

**Por que Bulk Insert e não FK nullable:**
1. **Consistência:** o banco sempre reflete o estado real — sem lógica condicional de "null = todos"
2. **Auditoria:** cada vínculo tem timestamp de criação — rastreável
3. **Novos Workspaces:** ao criar um novo `Workspace`, o worker cria automaticamente o vínculo para todos os usuários do organização que têm `tipo_usuario` que requer vínculo
4. **Performance:** `WHERE id_workspace = ?` usa índice — sem table scan condicional

**Regra adicional:** ao criar um novo `Workspace` na organização, disparar um job que cria `UsuarioWorkspace` para todos os usuários cujo `tipo_usuario` exige vínculo explícito. Master/Super Admin são ignorados (acesso global automático).

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
| Tabela PostgreSQL | `snake_case` singular, declarada via `@@map("...")` | `empresa`, `pedido_item`, `ope_historico_status` |
| Campo PostgreSQL | `snake_case` com sufixo da tabela | `quantidade_inicial_item_pedido`, `suid_empresa`, `cnpj_empresa` |
| Model Prisma | `PascalCase` singular (acrônimos em caixa alta OK) | `PedidoItem`, `Empresa`, `NCM`, `OPE`, `OpeHistoricoStatus` |
| Campo Prisma | `snake_case` (idêntico ao banco) | `quantidade_inicial_item_pedido`, `suid_empresa` |
| TypeScript server | `snake_case` no DTO/interface | `quantidade_inicial_item_pedido` |
| TypeScript client | `snake_case` | `item.quantidade_inicial_item_pedido` |
| Chave JSON API | `snake_case` | `{ "quantidade_inicial_item_pedido": 10 }` |
| Schema da organização | `tenant_<cuid>` | `tenant_c` + 24 chars `[a-z0-9]` — regex: `^tenant_c[a-z0-9]{24}$` (prefixo `tenant_` é o nome real do schema PostgreSQL — manter) |

### Padrão de IDs (formato sequencial por workspace/produto)

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

## Regras de Migrations para Bancos de Produto

> **Aprendizado validado em produção — Sprint 2 (2026-04-18).**

### Regra 1 — Schema dinâmico, nunca fixo

Migrations de produto **nunca referenciam um schema fixo pelo nome**. O orquestrador
`scripts/ativamente/migrate-all-tenants.ts` já faz `SET search_path TO "tenant_<cuid>"` antes de
executar cada migration — qualquer prefixo hardcoded é redundante e quebra o isolamento.

```sql
-- ❌ PROIBIDO — schema fixo herdado da arquitetura antiga
ALTER TABLE "pedido"."pedido_item" RENAME COLUMN ...
CREATE TYPE "pedido"."StatusPedido" AS ENUM (...)

-- ✅ CORRETO — sem prefixo, search_path já foi definido pelo orquestrador
ALTER TABLE "pedido_item" RENAME COLUMN ...
CREATE TYPE "StatusPedido" AS ENUM (...)
```

**Se um arquivo `.sql` contiver `"<nome_produto>".`, o CI bloqueará o deploy.**

### Regra 2 — Idempotência Obrigatória em Migrations de Rename/Alter

O orquestrador `migrate-all-tenants.ts` pode rodar a mesma migration em N tenants em
momentos diferentes. Migrations que fazem `RENAME COLUMN` ou `ALTER COLUMN TYPE` devem
usar `DO $$ IF EXISTS` para não falhar em tenants cujo estado físico já está à frente.

```sql
-- ❌ PROIBIDO — falha se a coluna já foi renomeada
ALTER TABLE "pedido_item" RENAME COLUMN "quantidade_inicial" TO "quantidade_inicial_item_pedido";

-- ✅ OBRIGATÓRIO — idempotente, seguro para qualquer estado do banco
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pedido_item' AND column_name = 'quantidade_inicial'
  ) THEN
    ALTER TABLE "pedido_item" RENAME COLUMN "quantidade_inicial" TO "quantidade_inicial_item_pedido";
  END IF;
END $$;
```

**Regra adicional para cast de tipo com DEFAULT:**
Antes de `ALTER COLUMN TYPE`, sempre `DROP DEFAULT` primeiro:

```sql
-- ❌ Falha quando a coluna tem DEFAULT incompatível com o novo tipo
ALTER TABLE "pedidos_comerciais"
  ALTER COLUMN "pedidos_origem" TYPE JSONB USING to_jsonb("pedidos_origem");

-- ✅ Correto
ALTER TABLE "pedidos_comerciais" ALTER COLUMN "pedidos_origem" DROP DEFAULT;
ALTER TABLE "pedidos_comerciais"
  ALTER COLUMN "pedidos_origem" TYPE JSONB USING to_jsonb("pedidos_origem");
```

### Regra 3 — Fluxo Obrigatório para Novo Banco de Produto

Ao criar um novo banco de produto no Railway:

```bash
# Passo 1 — Provisionar schemas físicos (um por organização ativo)
CONFIGURADOR_DATABASE_URL=<url_cfg> DATABASE_URL=<url_produto> \
  npx tsx scripts/migration/01-provision-schemas.ts

# Passo 2 — Aplicar migrations em todos os schemas
CONFIGURADOR_DATABASE_URL=<url_cfg> DATABASE_URL=<url_produto> \
  npx tsx scripts/ativamente/migrate-all-tenants.ts --product=<nome>

# ❌ NUNCA usar diretamente — cria tabelas no schema public (proibido)
npx prisma migrate dev
```

**Ambiente de teste DEVE ser validado antes de executar em produção.**
O Passo 1 e 2 em produção exigem autorização explícita do responsável técnico.

**Workaround para migration órfã (Prisma >=5):** quando `prisma migrate resolve --applied` trava por timeout em bancos com muitos schemas, registrar manualmente via:

```ts
// scripts/ativamente/register-migration.ts
await client.query(`
  INSERT INTO "_prisma_migrations"
    (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
  VALUES ($1, $2, NOW(), $3, NOW(), 1)
  ON CONFLICT (id) DO NOTHING
`, [randomUUID(), checksum, migrationName])
```

**Pré-requisito:** o SQL da migration já foi aplicado manualmente (ou via script node). O INSERT só registra que a Prisma deve considerar a migration concluída.

---

### Regra 4 — Migration history é imutável

Migration aplicada em qualquer ambiente **nunca** é editada, renomeada ou removida. Correção é sempre via **nova migration** que ajusta o estado.

❌ **Proibido:**
- Editar SQL de migration aplicada
- Renomear pasta `<timestamp>_<nome>/` de migration aplicada
- Deletar entrada de `_prisma_migrations`

✅ **Correto:** criar `<novo_timestamp>_fix_<descricao>/migration.sql` que aplica o ajuste, e validar idempotência (Regra 2).

**Por quê:** o checksum da migration aplicada está no `_prisma_migrations`. Editar o arquivo gera mismatch e Prisma detecta drift na próxima execução, bloqueando deploys.

---

### Regra 5 — Validar drift schema↔DB antes de toda alteração

Antes de adicionar migration, alterar `fragment.prisma` ou propor RENAME COLUMN, **sempre** verificar se o estado físico do banco bate com o schema Prisma:

```bash
# Em ambiente isolado (sem afetar dev local):
DATABASE_URL=<url_do_banco_alvo> npx prisma db pull --schema=/tmp/pulled.prisma
diff /tmp/pulled.prisma <fragment.prisma esperado>
```

Ou query direta para campos específicos:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = '<schema>' AND table_name = '<tabela>'
ORDER BY ordinal_position;
```

Se houver diff inesperado: **parar**. Drift indica migration órfã, edição manual no banco ou bug em script. Resolver antes de prosseguir, nunca por cima.

**Caso real (2026-05-02):** durante refactor do `historico-global` para DDD, descoberta tardia de que o banco `organizacao-teste` estava **47 de 51 tabelas** ainda em legado inglês (`tenant_id`, `actor_type`, etc.) e enums com valores `USER`/`SUCCESS`. A migration proposta assumia estado intermediário que nunca existiu — só foi descoberto porque rodamos query de drift antes de aplicar. Sem essa validação, migration teria falhado em produção ou corrompido dados.

---

## Regra obrigatória — Master-data tem seed idempotente

> **Aprendizado validado em produção — 2026-05-08.**

Toda tabela de **master-data** (catálogo global, sem `id_organizacao`, ex: `moeda`, `unidade`, `pais`, `ncm`, `incoterm`) precisa ter um **seed dedicado e idempotente** em `prisma/seed-<entidade>.ts`. Sem exceção.

**Por quê:** migrations destrutivas (renomear tabela com Prisma gerando DROP+CREATE em vez de RENAME) apagam todos os registros de master-data sem aviso. A 24/04/2026 a migration `fix_model_casing_revert` no Cadastros apagou todas as ~134 moedas e ~13 unidades cadastradas, e ninguém percebeu por 2 semanas porque o front usava constantes hardcoded paralelas (anti-padrão da `cadastros-snapshot-policy`). Quando descoberto em 2026-05-08, exigiu um seed para repopular — que deveria ter existido desde o `init`.

### Estrutura obrigatória

```text
servicos-global/<servico>/prisma/
  ├── data/
  │   └── <entidade>-canonicas.ts    ← lista TS importável e testável
  ├── seed-<entidade>.ts              ← script idempotente (upsert)
  └── ...

servicos-global/<servico>/__tests__/unit/
  └── <entidade>-canonicas.test.ts    ← valida shape, sem duplicatas, passa Zod
```

### O seed precisa

- Usar **upsert** por chave primária (idempotente — pode rodar quantas vezes quiser)
- Ler de `prisma/data/<entidade>-canonicas.ts` (não inline, pra ser testável)
- Logar `inseridas/atualizadas/total` para visibilidade
- Mandamento 08: falhar alto se `DATABASE_URL` faltar
- Ser executável via `DATABASE_URL=<url> npx tsx prisma/seed-<entidade>.ts`

### O teste precisa validar

- Lista não está vazia
- Sem chaves duplicadas
- Cada entrada passa o `*Schema` Zod do serviço (Mandamento 09)
- Moedas/unidades/etc. essenciais ao COMEX estão presentes (USD, EUR, BRL, KG, UN)

### Caminho proibido

❌ Manter constante hardcoded paralela em código TS de produto/nucleo-global como "fonte" do banco. A fonte é o banco. O seed só repopula. Constantes paralelas viram dívida de sincronização e mascaram bancos vazios em produção.

### Referência canônica

`servicos-global/cadastros/prisma/seed-moedas.ts` + `prisma/data/moedas-canonicas.ts` + `__tests__/unit/moedas-canonicas.test.ts` (commit de 2026-05-08). Replicar o padrão para qualquer master-data nova.

---

## Estrutura de `fragment.prisma` por Produto

Cada produto/serviço escreve **apenas seu próprio** `fragment.prisma`. O Coordenador compõe o `schema.prisma` final via `scripts/ativamente/compose-organização-schema.ts`.

```text
produto/pedido/server/prisma/
  └── fragment.prisma           ← define modelos Pedido, PedidoItem, PedidoItemLote

servicos-global/organização/notificacoes/prisma/
  └── fragment.prisma           ← define modelos Notificacao, NotificacaoConfig

# O Coordenador une todos os fragments:
servicos-global/organização/generated/
  └── schema.prisma             ← NUNCA editar diretamente
```

**Regras do `fragment.prisma`:**
- Nenhum `@map()` de **coluna** (paridade campo Prisma ↔ coluna PG é absoluta)
- **`@@map("tabela_snake_case")` é obrigatório** em todo model — garante nome da tabela PG em snake_case enquanto o model fica em PascalCase
- Nenhum campo de identificador de organização em models de produto (o schema isolado dispensa o campo)
- Nenhum `@@index` em campo de identificador de organização
- Nenhum agente edita `schema.prisma` final — só o Coordenador (Mandamento 02 — schema é INTOCÁVEL)

---

## Checklist — Antes de Criar ou Alterar Qualquer Model

- [ ] Nome do campo está idêntico no banco, Prisma, TypeScript e JSON?
- [ ] Consultei `export-campos-completo-corrigido.csv` (Pedido) ou o dicionário correspondente?
- [ ] Nenhum `@map()` de coluna no `fragment.prisma`?
- [ ] **Model em PascalCase com `@@map("tabela_snake_case")` declarado?**
- [ ] Produto tem seu próprio `DATABASE_URL` (não compartilha banco)?
- [ ] `public` schema não vai receber tabelas de dados?
- [ ] Campos calculados não estão marcados como editáveis/obrigatórios no front?
- [ ] ID segue o padrão `[prefixo]_id_[9 dígitos]/[YY]`?
- [ ] Só modifiquei o `fragment.prisma` do meu produto (não o `schema.prisma` composto)?
- [ ] Migration vai rodar via orquestrador `scripts/ativamente/migrate-all-tenants.ts` (não `prisma migrate dev`)?
