# PLAN_BACKEND_Pedido — Plano de Batalha (Backend)

> **Diretório raiz:** `produto/pedido/server/`
> **Schema Prisma:** `produto/pedido/server/prisma/schema.prisma`
> **Fase:** 2 — Plano aprovado. Não executar sem Fase 3 iniciada.

---

## 1. ARQUIVOS PRISMA A ALTERAR

### `produto/pedido/server/prisma/schema.prisma`
- 20 @@map renames (ver PLAN_BANCO_Pedido)
- 5 field renames em `Pedido`
- 12 field renames em `PedidoItem`
- 1 field rename em `Processo` (`numero_processo` → `id_processo`)
- 6 field renames em `ProcessoContainer`
- 2 novos campos em `ProcessoContainer`

### `produto/pedido/server/prisma/fragment.prisma`
- Contém os models complementares: `PedidoAnexo`, `PedidoTemplatePdf`, `TransferHistorico`, `ColunaUsuarioPedido`, `ValorColunaUsuarioPedido`, `MapeamentoImport`, `UserBehaviorEvent`, `PedidoCasasDecimaisConfig`, `KanbanPreferencias`, `DashboardPainel`
- Mesmo conjunto de @@map renames aplicável (é a fonte — `schema.prisma` inclui via compose)
- Verificar quais models do `fragment.prisma` aparecem nas tabelas de rename do PLAN_BANCO_Pedido

---

## 2. SUBSTITUIÇÕES GLOBAIS — CAMPO POR CAMPO

Execute em `produto/pedido/server/src/`:

### `Pedido` — campos renomeados
| DE | PARA | Grep pattern |
|---|---|---|
| `quantidade_total_inicial_pedido` | `quantidade_total_pedido` | `quantidade_total_inicial_pedido` |
| `condicao_pagamento_pedido` | `condicao_pagamento` | `condicao_pagamento_pedido` |
| `taxa_cambio_estimada_pedido` | `taxa_cambio_estimada` | `taxa_cambio_estimada_pedido` |
| `pedido_criado_em` | `created_at` | `pedido_criado_em` |
| `pedido_atualizado_em` | `updated_at` | `pedido_atualizado_em` |

### `PedidoItem` — campos renomeados
| DE | PARA | Grep pattern |
|---|---|---|
| `quantidade_inicial_item_pedido` | `quantidade_inicial_pedido` | `quantidade_inicial_item_pedido` |
| `saldo_item_pedido` | `quantidade_atual_pedido` | `saldo_item_pedido` |
| `quantidade_pronta_total_item_pedido` | `quantidade_pronta_pedido` | `quantidade_pronta_total_item_pedido` |
| `quantidade_transferida_item_pedido` | `quantidade_transferida_pedido` | `quantidade_transferida_item_pedido` |
| `quantidade_cancelada_item_pedido` | `quantidade_cancelada_pedido` | `quantidade_cancelada_item_pedido` |
| `valor_total_itens` | `valor_total_item` | `valor_total_itens` |
| `valor_unitario_item` | `valor_por_unidade_item` | `valor_unitario_item` |
| `peso_liquido_unitario_item` | `peso_liquido_unitario` | `peso_liquido_unitario_item` |
| `peso_bruto_unitario_item` | `peso_bruto_unitario` | `peso_bruto_unitario_item` |
| `cubagem_unitaria_item` | `cubagem_unitaria` | `cubagem_unitaria_item` |
| `item_criado_em` | `created_at` | `item_criado_em` |
| `item_atualizado_em` | `updated_at` | `item_atualizado_em` |

### `Processo` — campos renomeados
| DE | PARA | Grep pattern |
|---|---|---|
| `numero_processo` | `id_processo` | `numero_processo` |

### `ProcessoContainer` — campos renomeados
| DE | PARA | Grep pattern |
|---|---|---|
| `numero_container` | `container_numero` | `numero_container` |
| `numero_lacre` | `container_lacre` | `numero_lacre` |
| `tipo_container` | `container_tipo` | `tipo_container` |
| `tara` | `container_tara` | `\.tara\b` |
| `peso_bruto` (em container) | `container_peso_bruto` | `peso_bruto` (filtrar por contexto) |

### Tabelas renomeadas — prisma client calls
| DE | PARA |
|---|---|
| `prisma.pedido` (@@map muda, model name não) | verificar se usado direto ou via `withTenant` |
| `prisma.processo` | verificar referências |
| `prisma.processoFatura` | `prisma.processoFatura` (model name não muda, @@map sim) |
| `prisma.processoItem` | mantém |
| `prisma.processoContainer` | mantém |
| `prisma.pedidoStatus` | mantém |
| `prisma.mapeamentoImport` | `prisma.aprendizadoImportacaoDados` |
| `prisma.pedidoAnexo` | `prisma.anexoPedido` |
| `prisma.pedidoTemplatePdf` | `prisma.templatePedidoPdf` |
| `prisma.transferHistorico` | `prisma.trackingItemsTransferidos` |
| `prisma.dashboardConfig` | `prisma.dashboardPreferencias` |
| `prisma.pedidoCasasDecimaisConfig` | `prisma.pedidoCasasDecimais` |
| `prisma.pedidoSaldoFormulaConfig` | `prisma.pedidoSaldoFormula` |

---

## 3. ROTAS A ATUALIZAR

### `produto/pedido/server/src/routes/`

| Arquivo | Campos afetados |
|---|---|
| `init.ts` | Campos de `Pedido` e `PedidoItem` na query principal |
| `behaviorTracking.ts` | Verificar referências a campos de pedido |
| `casasDecimais.ts` | `PedidoCasasDecimaisConfig` → `PedidoCasasDecimais` |
| `saldoFormula.ts` | `PedidoSaldoFormulaConfig` → `PedidoSaldoFormula` |
| `processo.ts` (se existir) | `numero_processo` → `id_processo` |

### Rotas que retornam `saldo_item_pedido` (crítico)
O saldo é calculado dinamicamente em algumas queries. Grep completo:
```bash
grep -r "saldo_item_pedido" produto/pedido/server/src/
```
Cada ocorrência precisa virar `quantidade_atual_pedido`.

### Rotas de Processo/Container
```bash
grep -r "numero_processo" produto/pedido/server/src/
grep -r "numero_container" produto/pedido/server/src/
grep -r "numero_lacre" produto/pedido/server/src/
grep -r "tipo_container" produto/pedido/server/src/
```

---

## 4. TIPOS TYPESCRIPT A ATUALIZAR

```bash
# Localizar todos os tipos/interfaces com campos antigos:
grep -r "quantidade_total_inicial_pedido" produto/pedido/server/src/
grep -r "saldo_item_pedido" produto/pedido/server/src/
grep -r "item_criado_em\|item_atualizado_em" produto/pedido/server/src/
grep -r "pedido_criado_em\|pedido_atualizado_em" produto/pedido/server/src/
```

---

## 5. SCHEMAS ZOD A ATUALIZAR

Toda rota tem schema Zod. Localizar e atualizar:
```bash
grep -rn "z\.object" produto/pedido/server/src/routes/
```

Schemas que provavelmente incluem campos antigos:
- Schema de criação de pedido (campos `condicao_pagamento_pedido`, etc.)
- Schema de criação de item (campos `quantidade_inicial_item_pedido`, etc.)
- Schema de filtro/busca de pedidos
- Schema de processo e container

---

## 6. SHARED / API TYPES

### `produto/pedido/client/src/shared/api.ts` (modificado — git status)
Este arquivo contém os tipos da API compartilhados entre client e server. Campos a atualizar:
- Todos os field names do PedidoItem
- Todos os field names do Pedido
- Referências a `numero_processo`

### `produto/pedido/client/src/shared/columnBehaviorConfig.ts` (modificado — git status)
Configuração de colunas que pode referenciar nomes antigos de campos.

---

## 7. MIGRATION DO @@map (operação física no DB)

⚠️ Renomear @@map em Prisma cria migration que altera a tabela no PostgreSQL.
Para ambiente schema-per-tenant (ADR-001), a migration precisa rodar em TODOS os schemas.

```bash
# Gerar migration
npx prisma migrate dev --name ddd-rename-tables

# Em produção: usar o orquestrador
npx tsx scripts/migrate-all-tenants.ts --migration=ddd-rename-tables
```

---

## 8. CHECKLIST FASE 3

```bash
# Verificação final — zero ocorrências de nomes antigos:
grep -r "quantidade_total_inicial_pedido" produto/pedido/        # zero
grep -r "saldo_item_pedido" produto/pedido/                      # zero
grep -r "quantidade_inicial_item_pedido" produto/pedido/         # zero
grep -r "quantidade_pronta_total_item_pedido" produto/pedido/    # zero
grep -r "valor_total_itens" produto/pedido/                      # zero
grep -r "valor_unitario_item\b" produto/pedido/                  # zero
grep -r "peso_liquido_unitario_item" produto/pedido/             # zero
grep -r "peso_bruto_unitario_item" produto/pedido/               # zero
grep -r "cubagem_unitaria_item" produto/pedido/                  # zero
grep -r "pedido_criado_em\|pedido_atualizado_em" produto/pedido/ # zero
grep -r "item_criado_em\|item_atualizado_em" produto/pedido/     # zero
grep -r "numero_processo" produto/pedido/                        # zero
grep -r "numero_container" produto/pedido/                       # zero
grep -r "numero_lacre" produto/pedido/                           # zero
grep -r "tipo_container\b" produto/pedido/                       # zero
grep -r "prisma\.mapeamentoImport" produto/pedido/               # zero
grep -r "pedidos_comerciais" produto/pedido/                     # zero (@@map antigo)

npx tsc --noEmit                                                  # zero erros
```
