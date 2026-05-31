# Ordem de Colunas no Banco — BID Frete Internacional

> **Motivo:** PostgreSQL não reordena colunas com `ALTER`; a ordem física define a visualização no Railway → Database → Data.  
> **Status:** Aplicado em prod e teste (migrations `20260530120000`, `20260530130000`)

---

## 1. Regra geral

Em **qualquer tabela** do produto que tenha `id_organizacao` e `id_workspace`:

```
… → id_organizacao → id_workspace → id_produto_gravity → id_usuario → …
```

FKs de negócio relevantes ficam **no topo**, logo após a PK.

---

## 2. Ordem por tabela

### `bid_frete_internacional`

| # | Coluna |
|---|--------|
| 1 | `id_bid_bid_frete_internacional` |
| 2 | `id_organizacao` |
| 3 | `id_workspace` |
| 4 | `id_produto_gravity` |
| 5 | `id_usuario` |
| … | demais campos |

### `cotacao_bid_frete_internacional`

| # | Coluna |
|---|--------|
| 1 | `id_cotacao_bid_frete_internacional` |
| 2 | **`id_bid_bid_frete_internacional`** |
| 3 | `id_organizacao` |
| 4 | `id_workspace` |
| … | demais campos |

### `proposta_bid_frete_internacional`

| # | Coluna |
|---|--------|
| 1 | `id_proposta_bid_frete_internacional` |
| 2 | **`id_cotacao_bid_frete_internacional`** |
| 3 | **`id_bid_bid_frete_internacional`** (snapshot) |
| 4 | `id_organizacao` |
| 5 | `id_workspace` (snapshot) |
| … | demais campos (bloco prazos: `dias_transito` → `dias_free_time` → **`dias_prazo_pagamento`** → `validade`) |

### `ganho_bid_frete_internacional`

| # | Coluna |
|---|--------|
| 1 | PK (`id` legado ou `id_ganho_bid_frete_internacional` após rename completo) |
| 2 | `id_organizacao` |
| 3 | `id_workspace` |
| … | demais campos |

> **Nota:** Em prod, `ganho` ainda pode usar nomes legados (`id`, `valor_target`, …). A migration fixup reordena com o schema presente.

---

## 3. Migrations

| Migration | Escopo |
|-----------|--------|
| `20260530120000_reorder_colunas_bid_frete_internacional` | Backfill `id_bid` na proposta; reorder bid, cotação, proposta, ganho; recria FKs/índices |
| `20260530130000_fixup_reorder_bid_ganho_colunas` | Corrige skip idempotente; reorder efetivo de `bid` e `ganho` |
| `20260531120000_add_dias_prazo_pagamento_proposta_bid_frete_internacional` | Coluna `dias_prazo_pagamento_proposta_bid_frete_internacional` (Int?, entre free time e validade) |

Função SQL temporária: `bfi_reorder_table_columns(table, column_order[])` — recria tabela, copia dados, dropa original. **Idempotente:** compara posição das N primeiras colunas desejadas.

---

## 4. Como aplicar

```powershell
# Via Railway CLI (DATABASE_PUBLIC_URL)
$env:BID_FRETE_INTERNATIONAL_DATABASE_URL = "<url>"
npx tsx scripts/ativamente/aplicar-migrations-bid-frete-internacional.ts
```

Ou script PowerShell: `scripts/ativamente/migrate-bid-frete-internacional-producao.ps1` (requer `.env.producao` com TCP proxy).

Deploy site: `scripts/build-site.sh` / `start-site.sh` aplicam se `BID_FRETE_INTERNATIONAL_DATABASE_URL` estiver definida.

---

## 5. Novas tabelas / colunas

Ao adicionar model no `fragment.prisma`:

1. Declarar campos na **ordem desejada** no fragment (Prisma usa ordem do model para migrations `CREATE TABLE` novas).
2. Para tabelas existentes, criar migration de reorder seguindo o padrão `bfi_reorder_table_columns` ou equivalente.
3. Manter `id_workspace` imediatamente após `id_organizacao`.

---

## 6. Verificação

```sql
SELECT column_name, ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cotacao_bid_frete_internacional'
ORDER BY ordinal_position
LIMIT 6;
```

Esperado: PK → `id_bid` → `id_organizacao` → `id_workspace`.
