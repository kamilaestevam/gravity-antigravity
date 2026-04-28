# AUDITORIA DE EXECUÇÃO — Pedido BANCO
**Data:** 2026-04-19
**Etapa:** 1 — BANCO (@@map / @map only — nomes TypeScript preservados)
**Executado em:** `produto/pedido/server/prisma/schema.prisma` + `fragment.prisma`

---

## Resumo Executivo

| Item | Resultado |
|---|---|
| `prisma format` | ✅ OK (0 erros) |
| `prisma generate` | ✅ OK — Prisma Client v5.22.0 gerado |
| Nomes antigos de tabelas nas sources | ✅ ZERO |
| Novos @@map presentes | ✅ 21 ocorrências |
| Novos @map de campos críticos | ✅ 19 ocorrências |

---

## 1. Tabelas Renomeadas via @@map (schema.prisma + fragment.prisma)

| Model Prisma | @@map Antigo | @@map Novo |
|---|---|---|
| `Pedido` | (nenhum — default `pedido`) | `pedido_produto_gravity` |
| `PedidoItem` | (nenhum) | `pedido_itens` |
| `Processo` | (nenhum) | `tabela_processos` |
| `ProcessoFatura` | (nenhum) | `fatura_processo` |
| `ProcessoItem` | (nenhum) | `logistica_processo` |
| `ProcessoContainer` | (nenhum) | `container_processo` |
| `PedidoStatus` | (nenhum) | `status_pedido` |
| `PedidoColuna` | (nenhum) | `pedido_colunas` |
| `PedidoPreferenciaUsuario` | (nenhum) | `preferencia_coluna_pedido` |
| `PedidoPreferenciaPadrao` | (nenhum) | `preferencia_padrao_pedido` |
| `MapeamentoImport` | `mapeamento_import` | `aprendizado_importacao_dados` |
| `PedidoAnexo` | `pedido_anexos` | `anexo_pedido` |
| `PedidoTemplatePdf` | `pedido_templates_pdf` | `template_pedido_pdf` |
| `TransferHistorico` | `transfer_historico` | `tracking_items_transferidos` |
| `ColunaUsuarioPedido` | `colunas_usuario_pedido` | `coluna_usuario_pedido` |
| `ValorColunaUsuarioPedido` | `valores_colunas_usuario_pedido` | `valor_coluna_usuario_pedido` |
| `KanbanPreferencias` | (nenhum) | `kanban_preferencias` |
| `DashboardConfig` | (nenhum) | `dashboard_preferencias` |
| `PedidoCasasDecimaisConfig` | `pedido_casas_decimais_config` | `pedido_casas_decimais` |
| `PedidoSaldoFormulaConfig` | (nenhum) | `pedido_saldo_formula` |
| `DashboardPainel` | `dashboard_paineis` | `dashboard_painel` |

---

## 2. Campos Renomeados via @map

### Model `Pedido`

| Campo Prisma (TypeScript) | @map DB Column |
|---|---|
| `quantidade_total_inicial_pedido` | `quantidade_total_pedido` |
| `condicao_pagamento_pedido` | `condicao_pagamento` |
| `taxa_cambio_estimada_pedido` | `taxa_cambio_estimada` |
| `pedido_criado_em` | `created_at` |
| `pedido_atualizado_em` | `updated_at` |

### Model `PedidoItem`

| Campo Prisma (TypeScript) | @map DB Column |
|---|---|
| `quantidade_inicial_item_pedido` | `quantidade_inicial_pedido` |
| `saldo_item_pedido` | `quantidade_atual_pedido` |
| `quantidade_pronta_total_item_pedido` | `quantidade_pronta_pedido` |
| `quantidade_transferida_item_pedido` | `quantidade_transferida_pedido` |
| `quantidade_cancelada_item_pedido` | `quantidade_cancelada_pedido` |
| `valor_total_itens` | `valor_total_item` |
| `valor_unitario_item` | `valor_por_unidade_item` |
| `peso_liquido_unitario_item` | `peso_liquido_unitario` |
| `peso_bruto_unitario_item` | `peso_bruto_unitario` |
| `cubagem_unitaria_item` | `cubagem_unitaria` |
| `item_criado_em` | `created_at` |
| `item_atualizado_em` | `updated_at` |

### Model `Processo`

| Campo Prisma (TypeScript) | @map DB Column |
|---|---|
| `numero_processo` | `id_processo` |

### Model `ProcessoContainer`

| Campo Prisma (TypeScript) | @map DB Column |
|---|---|
| `numero_container` | `container_numero` |
| `numero_lacre` | `container_lacre` |
| `tipo_container` | `container_tipo` |
| `tara` | `container_tara` |
| `peso_bruto` | `container_peso_bruto` |
| `container_peso_liquido` | *(campo NOVO — sem @map)* |
| `container_metragem_cubica` | *(campo NOVO — sem @map)* |

---

## 3. Provas Forenses — Terminal (excluindo node_modules)

```
# TABELAS ANTIGAS — TODAS ZERO

$ grep -rn "pedidos_comerciais"         produto/pedido/ --include="*.prisma" --exclude-dir=node_modules
→ 0 ocorrências ✅

$ grep -rn '"mapeamento_import"'        produto/pedido/ --include="*.prisma" --exclude-dir=node_modules
→ 0 ocorrências ✅

$ grep -rn '"transfer_historico"'       produto/pedido/ --include="*.prisma" --exclude-dir=node_modules
→ 0 ocorrências ✅

$ grep -rn '"pedido_casas_decimais_config"' produto/pedido/ --include="*.prisma" --exclude-dir=node_modules
→ 0 ocorrências ✅

$ grep -rn '"dashboard_paineis"'        produto/pedido/ --include="*.prisma" --exclude-dir=node_modules
→ 0 ocorrências ✅

$ grep -rn '"pedido_templates_pdf"'     produto/pedido/ --include="*.prisma" --exclude-dir=node_modules
→ 0 ocorrências ✅

$ grep -rn '"pedido_anexos"'            produto/pedido/ --include="*.prisma" --exclude-dir=node_modules
→ 0 ocorrências ✅

$ grep -rn '"colunas_usuario_pedido"'   produto/pedido/ --include="*.prisma" --exclude-dir=node_modules
→ 0 ocorrências ✅

$ grep -rn '"valores_colunas_usuario_pedido"' produto/pedido/ --include="*.prisma" --exclude-dir=node_modules
→ 0 ocorrências ✅
```

---

## 4. Confirmação — Novos @@map no Generated Client

```
$ grep -n "@@map" produto/pedido/server/node_modules/.prisma/client/schema.prisma

64:  @@map("pedido_produto_gravity")
111: @@map("pedido_itens")
234: @@map("tabela_processos")
253: @@map("fatura_processo")
280: @@map("logistica_processo")
302: @@map("container_processo")
322: @@map("status_pedido")
344: @@map("pedido_colunas")
359: @@map("preferencia_coluna_pedido")
371: @@map("preferencia_padrao_pedido")
389: @@map("aprendizado_importacao_dados")
410: @@map("anexo_pedido")
425: @@map("template_pedido_pdf")
447: @@map("tracking_items_transferidos")
475: @@map("coluna_usuario_pedido")
492: @@map("valor_coluna_usuario_pedido")
506: @@map("kanban_preferencias")
521: @@map("dashboard_preferencias")
548: @@map("pedido_casas_decimais")
564: @@map("pedido_saldo_formula")
581: @@map("dashboard_painel")
```

---

## 5. Nota Estratégica — BANCO Phase

Os nomes dos campos **Prisma/TypeScript** (`quantidade_total_inicial_pedido`, `saldo_item_pedido`, etc.) foram **preservados intencionalmente** nesta etapa.

A diretiva `@map(...)` mapeia cada campo para o novo nome de coluna no PostgreSQL sem quebrar o código TypeScript existente. A renomeação dos campos TypeScript ocorrerá na **ETAPA 2 — BACKEND**.

| Etapa | O que muda |
|---|---|
| BANCO (atual) | Nomes de tabelas e colunas no PostgreSQL via `@@map`/`@map` |
| BACKEND (próxima) | Nomes de campos TypeScript no código `.ts`/`.tsx` |
| FRONTEND (última) | Referências de campos na UI e tipos de API |

---

## Veredicto Final

**✅ ETAPA 1 BANCO — PEDIDO: CONCLUÍDA E AUDITADA**

- 0 nomes antigos de tabelas nas sources Prisma
- 21 novos @@map confirmados no generated client
- 19 @map de campos críticos confirmados
- `prisma format` + `prisma generate` sem erros
