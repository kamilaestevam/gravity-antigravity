# PLAN_BANCO_Pedido — Plano de Batalha (Banco)

> **Banco:** `gravity-pedido-producao` / `gravity-pedido-teste`
> **Schema Prisma:** `produto/pedido/server/prisma/schema.prisma`
> **Fragment:** `produto/pedido/server/prisma/fragment.prisma`
> **Fase:** 2 — Plano aprovado. Não executar sem Fase 3 iniciada.

---

## 1. RENOMEAR TABELAS (@@map)

| Model (DE) | Model (PARA) | @@map atual | @@map alvo |
|---|---|---|---|
| `Pedido` | `Pedido` | `pedidos_comerciais` | `pedido_produto_gravity` |
| `Processo` | `Processo` | (sem @@map) | `tabela_processos` |
| `ProcessoFatura` | `ProcessoFatura` | `processo_faturas` | `fatura_processo` |
| `ProcessoItem` | `ProcessoItem` | `processo_itens` | `logistica_processo` |
| `ProcessoContainer` | `ProcessoContainer` | `processo_containers` | `container_processo` |
| `PedidoStatus` | `PedidoStatus` | `pedido_status` | `status_pedido` |
| `PedidoColuna` | `PedidoColuna` | `pedido_colunas` | `pedido_colunas` (manter) |
| `PedidoPreferenciaUsuario` | `PedidoPreferenciaUsuario` | `pedido_preferencias_usuario` | `preferencia_coluna_pedido` |
| `PedidoPreferenciaPadrao` | `PedidoPreferenciaPadrao` | `pedido_preferencias_padrao` | `preferencia_padrao_pedido` |
| `MapeamentoImport` | `AprendizadoImportacaoDados` | `mapeamento_import` | `aprendizado_importacao_dados` |
| `PedidoAnexo` | `AnexoPedido` | (sem @@map) | `anexo_pedido` |
| `PedidoTemplatePdf` | `TemplatePedidoPdf` | (sem @@map) | `template_pedido_pdf` |
| `TransferHistorico` | `TrackingItemsTransferidos` | `transfer_historico` | `tracking_items_transferidos` |
| `ColunaUsuarioPedido` | `ColunaUsuarioPedido` | `colunas_usuario_pedido` | `coluna_usuario_pedido` |
| `ValorColunaUsuarioPedido` | `ValorColunaUsuarioPedido` | `valores_colunas_usuario_pedido` | `valor_coluna_usuario_pedido` |
| `KanbanPreferencias` | `KanbanPreferencias` | (sem @@map) | `kanban_preferencias` |
| `DashboardConfig` | `DashboardPreferencias` | `dashboard_config` | `dashboard_preferencias` |
| `PedidoCasasDecimaisConfig` | `PedidoCasasDecimais` | (sem @@map) | `pedido_casas_decimais` |
| `PedidoSaldoFormulaConfig` | `PedidoSaldoFormula` | (sem @@map) | `pedido_saldo_formula` |
| `DashboardPainel` | `DashboardPainel` | (sem @@map) | `dashboard_painel` |

---

## 2. RENOMEAR CAMPOS — `Pedido` (@@map: `pedido_produto_gravity`)

| Campo atual (banco) | Campo alvo (banco) | Natureza |
|---|---|---|
| `quantidade_total_inicial_pedido` | `quantidade_total_pedido` | físico (alias) |
| `condicao_pagamento_pedido` | `condicao_pagamento` | físico (alias) |
| `taxa_cambio_estimada_pedido` | `taxa_cambio_estimada` | físico (alias) |
| `pedido_criado_em` | `created_at` | sistema |
| `pedido_atualizado_em` | `updated_at` | sistema |

---

## 3. RENOMEAR CAMPOS — `PedidoItem`

| Campo atual (banco) | Campo alvo (banco) | Natureza |
|---|---|---|
| `quantidade_inicial_item_pedido` | `quantidade_inicial_pedido` | físico (alias) |
| `saldo_item_pedido` | `quantidade_atual_pedido` | físico (alias) |
| `quantidade_pronta_total_item_pedido` | `quantidade_pronta_pedido` | físico (alias) |
| `quantidade_transferida_item_pedido` | `quantidade_transferida_pedido` | físico (alias) |
| `quantidade_cancelada_item_pedido` | `quantidade_cancelada_pedido` | físico (alias) |
| `valor_total_itens` | `valor_total_item` | físico (alias) |
| `valor_unitario_item` | `valor_por_unidade_item` | físico (alias) |
| `peso_liquido_unitario_item` | `peso_liquido_unitario` | físico (alias) |
| `peso_bruto_unitario_item` | `peso_bruto_unitario` | físico (alias) |
| `cubagem_unitaria_item` | `cubagem_unitaria` | físico (alias) |
| `item_criado_em` | `created_at` | sistema |
| `item_atualizado_em` | `updated_at` | sistema |

---

## 4. RENOMEAR CAMPOS — `Processo` (@@map: `tabela_processos`)

| Campo atual (banco) | Campo alvo (banco) | Natureza |
|---|---|---|
| `numero_processo` | `id_processo` | físico — identificador visível ao usuário |

> Demais campos do `Processo` mantêm os nomes atuais (já seguem convenção snake_case adequada).

---

## 5. RENOMEAR CAMPOS — `ProcessoContainer` (@@map: `container_processo`)

| Campo atual (banco) | Campo alvo (banco) | Natureza |
|---|---|---|
| `numero_container` | `container_numero` | físico |
| `numero_lacre` | `container_lacre` | físico |
| `tipo_container` | `container_tipo` | físico |
| `tara` | `container_tara` | físico |
| `peso_bruto` | `container_peso_bruto` | físico |
| `data_devolucao_prevista` | `data_devolucao_prevista` | físico (manter) |
| `data_devolucao_real` | `data_devolucao_real` | físico (manter) |
| `local_devolucao` | `local_devolucao` | físico (manter) |

### Campos novos a CRIAR em `ProcessoContainer`:

| Campo novo | Tipo | Descrição |
|---|---|---|
| `container_peso_liquido` | `Decimal? @db.Decimal(18, 6)` | Peso líquido do container |
| `container_metragem_cubica` | `Decimal? @db.Decimal(18, 6)` | Metragem cúbica do container |

---

## 6. LABELS DE TELA (referência para frontend)

| Campo banco | Label na tela |
|---|---|
| `data_devolucao_prevista` | "Data prevista da devolução do container" |
| `data_devolucao_real` | "Data confirmada da devolução do container" |
| `local_devolucao` | "Local de Devolução do Container" |
| `id_processo` | "Número do Processo Gravity" |
| `anexo_pedido` | "Anexo do Pedido" |
| `template_pedido_pdf` | "Template Pedido - PDF" |
| `coluna_usuario_pedido` | Nome determinado pelo usuário na criação |
| `kanban_preferencias` | (sem tela própria — preferência salva) |
| `dashboard_preferencias` | (sem tela própria — preferência salva) |
| `pedido_casas_decimais` | "Casas Decimais do Pedido" |
| `pedido_saldo_formula` | "Fórmula Saldo do Pedido" |
| `dashboard_painel` | "Dashboard" (título de página) |
| `preferencia_coluna_pedido` | (sem tela própria — salva automaticamente) |
| `preferencia_padrao_pedido` | (sem tela própria — template do sistema) |
| `aprendizado_importacao_dados` | (sem tela própria — sugerido na importação) |
| `status_pedido` | "Status do Pedido" |

---

## 7. TABELAS SEM ALTERAÇÃO (manter como estão)

| Model | @@map | Motivo |
|---|---|---|
| `ProcessoFatura` (campos internos) | `fatura_processo` | Campos já nomeados corretamente (`tipo_fatura`, `numero_fatura`, etc.) |
| `ProcessoItem` (campos internos) | `logistica_processo` | Campos já nomeados corretamente |
| `PedidoColuna` | `pedido_colunas` | Mantido — catalogo de colunas do sistema |

---

## 8. ORDEM DE EXECUÇÃO

```
1. Backup manual do banco pedido antes de qualquer migration
2. Adicionar novos campos em ProcessoContainer (container_peso_liquido, container_metragem_cubica)
3. Renomear @@map de todas as tabelas (operação segura — apenas metadata)
4. Renomear campos em Pedido (5 campos)
5. Renomear campos em PedidoItem (12 campos)
6. Renomear campo id_processo em Processo
7. Renomear campos em ProcessoContainer (6 campos)
8. Validar FK constraints após renames
9. tsc zero erros + grep zero legacy names no banco Pedido
```

---

## 9. RISCOS

| Risco | Mitigação |
|---|---|
| `pedido_criado_em` → `created_at` conflita se já existe campo `created_at` | Verificar schema antes de renomear — pode precisar de DROP + ADD |
| `saldo_item_pedido` é calculado dinamicamente em algumas rotas | Grep todas as queries que usam esse campo antes de renomear |
| `numero_processo` pode estar hardcoded em múltiplas rotas de Processo | Grep completo antes de renomear para `id_processo` |
| @@map de Pedido muda de `pedidos_comerciais` para `pedido_produto_gravity` | Qualquer SQL raw que usa o nome da tabela diretamente quebra |
