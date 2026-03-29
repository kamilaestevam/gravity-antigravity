---
name: antigravity-database-operations
description: "Use esta skill para operações de banco de dados — migrations, backups, índices, vacuum, particionamento, connection pooling e monitoramento. Consultada pelo Estrutura de Dados antes de qualquer operação no banco."
---

# Gravity — Database Operations

## Topologia de Bancos

| Banco | Serviço | Dados |
|:---|:---|:---|
| configurador-db | Configurador | Tenants, planos, billing, permissões |
| tenant-db | Tenant Services | Atividades, email, WhatsApp, dashboard, histórico |
| simula-custo-db | SimulaCusto | Estimativas, cache fiscal |
| bid-frete-db | Bid Frete | Cotações, bids, fornecedores |

> **Regra:** cada produto tem seu próprio banco. Nenhum produto acessa banco de outro.

---

## Migrations

### Fluxo obrigatório

```bash
# 1. Compor schema (se usa fragments)
npx ts-node scripts/compose-tenant-schema.ts

# 2. Validar schema
npx prisma validate

# 3. Gerar migration
npx prisma migrate dev --name descricao-clara

# 4. Revisar o SQL gerado
# 5. Testar em staging
# 6. Só então aplicar em produção
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

- [ ] Migration testada em staging antes de produção?
- [ ] Backup manual antes de migration destrutiva?
- [ ] Índices obrigatórios presentes (tenant_id, product_id, user_id)?
- [ ] Unique constraints incluem tenant_id?
- [ ] Query time validado para queries novas?
- [ ] Connection pooling configurado (Fase 3)?
