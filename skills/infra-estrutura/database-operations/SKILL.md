---
name: antigravity-database-operations
description: "Use esta skill para operações de banco de dados — migrations, backups, índices, vacuum, particionamento, connection pooling e monitoramento. Consultada pelo Estrutura de Dados antes de qualquer operação no banco."
---

# Gravity — Database Operations

## Topologia de Bancos

| Banco Railway | Serviço | Schema | Dados |
|:---|:---|:---|:---|
| gravity-configurador-producao | Configurador | `public` (único) | Tenants, planos, billing, permissões |
| gravity-servicos-producao | Tenant Services | `tenant_<cuid>` por tenant | Email, WhatsApp, dashboard, histórico |
| gravity-pedido-producao | Pedido | `tenant_<cuid>` por tenant | Pedidos comerciais, itens, lotes |
| gravity-processo-producao | Processo | `tenant_<cuid>` por tenant | Processos logísticos, DI, DUIMP |
| gravity-simula-custo-producao | SimulaCusto | `tenant_<cuid>` por tenant | Estimativas, cache fiscal |

Cada banco possui um espelho de testes (`gravity-*-teste`) com estrutura idêntica.

> **Regra absoluta:** cada produto tem seu próprio banco PostgreSQL isolado.
> Nenhum produto acessa banco de outro produto — comunicação apenas via REST API.

### Estrutura interna de cada banco de produto

```
gravity-pedido-producao (PostgreSQL)
  ├── public                         ← 100% VAZIO (nenhuma tabela aqui)
  ├── tenant_cmo4vtp3i0000m86ft8vt5vnu   ← empresa A
  │    ├── pedidos_comerciais
  │    ├── pedido_itens
  │    └── _prisma_migrations
  └── tenant_cm...xyz                    ← empresa B
       ├── pedidos_comerciais
       ├── pedido_itens
       └── _prisma_migrations
```

O Configurador é a única exceção: usa schema `public` como fonte de verdade global de identidade (Tenant, User, Subscription).

---

## Migrations

### Fluxo obrigatório para bancos de produto (Schema-per-Tenant)

```bash
# 1. Gerar a migration localmente (desenvolvimento)
npx prisma migrate dev --name descricao-clara
# Revise o SQL gerado ANTES de continuar

# 2. Provisionar schemas nos bancos de produto (se novo banco ou novo tenant)
CONFIGURADOR_DATABASE_URL=<url_cfg> DATABASE_URL=<url_produto_teste> \
  npx tsx scripts/migration/01-provision-schemas.ts

# 3. Aplicar migrations em TESTE primeiro — obrigatório
CONFIGURADOR_DATABASE_URL=<url_cfg> DATABASE_URL=<url_produto_teste> \
  npx tsx scripts/migrate-all-tenants.ts --product=<nome>

# 4. Validar resultado no banco de teste

# 5. Só após validação explícita → aplicar em PRODUÇÃO (exige autorização)
CONFIGURADOR_DATABASE_URL=<url_cfg> DATABASE_URL=<url_produto_producao> \
  npx tsx scripts/migrate-all-tenants.ts --product=<nome>
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

Toda tabela no DB tenant e produtos:

```prisma
@@index([tenant_id])
@@index([tenant_id, product_id])
@@index([tenant_id, user_id])
```

### Índices compostos adicionais por padrão de query

```prisma
// Se filtra por status frequentemente
@@index([tenant_id, status])

// Se ordena por data frequentemente
@@index([tenant_id, created_at])

// Unique constraints sempre incluem tenant_id
@@unique([tenant_id, slug])
@@unique([tenant_id, reference_number])
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
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
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
- [ ] Índices obrigatórios presentes (tenant_id, product_id, user_id)?
- [ ] Unique constraints incluem tenant_id?

**Antes de aplicar em produção:**
- [ ] Migration validada no banco de **teste** com sucesso?
- [ ] Autorização explícita do responsável técnico obtida?
- [ ] Backup manual feito antes de migration destrutiva?
- [ ] `prisma migrate dev` NÃO foi usado diretamente no banco de produto?
- [ ] Query time validado para queries novas?
