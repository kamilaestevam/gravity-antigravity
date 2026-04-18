# Dicionário de Dados — Módulo Pedido (Fonte Única da Verdade)

**Produto:** Pedido (Gestão de Pedidos de Comércio Exterior)
**Data:** 2026-04-18
**Status:** Definitivo (Arquitetura Risco Zero / Schema-per-Tenant)

---

## 1. A Regra Fundamental — Paridade Nominal Absoluta

Todo campo do produto Pedido obedece à seguinte convenção estrita:

`nome_no_banco (PostgreSQL) = nome_no_back (Prisma/TS) = nome_no_front (React) = chave_no_payload_JSON`

**Não existe nenhuma camada de tradução.** É proibido o uso de `@map()` ou dicionários de alias.

---

## 2. Entidade: PedidoWorkspaceConfig (Configurações Dinâmicas do Tenant)
**Propósito:** Armazena as preferências de exibição e cálculo definidas na tela de Configurações do Workspace. Existe apenas 1 registro ativo por schema/tenant.

| Nome Canônico | Tipo Dado | Natureza | Default | Label Tela |
|---|---|---|---|---|
| `id` | string | sistema | - | ID |
| `casas_decimais_valor` | int | físico | 2 | Casas Decimais Valor |
| `casas_decimais_quantidade` | int | físico | 2 | Casas Decimais Qtd |
| `casas_decimais_peso` | int | físico | 3 | Casas Decimais Peso |
| `casas_decimais_cubagem` | int | físico | 3 | Casas Decimais Cubagem |
| `formula_saldo_pedido` | string | físico | `A-B-C` | Fórmula Saldo do Pedido |
| `formato_data` | string | físico | `DD/MM/AAAA` | Formato de Data |

---

## 3. Entidade: Pedido (Cabeçalho da Operação)
**Nota de Isolamento:** O `tenant_id` e `company_id` são omitidos pois a tabela reside fisicamente no schema do próprio tenant.

| Nome Canônico | Tipo Dado | Natureza | Obrig. | Edit. Front | Default | Label Tela |
|---|---|---|---|---|---|---|
| `id` | string | sistema | sim | não | - | ID |
| `tipo_operacao` | string | físico | sim | não | - | Tipo de Operação |
| `numero_pedido` | string | físico | sim | sim | - | Nº Pedido / Part Number |
| `status` | string | físico | sim | sim | `aberto` | Status |
| `status_id` | string | físico | não | sim | - | Status ID |
| `importacao_exportador_id` | string | físico | não | sim | - | Exportador |
| `exportacao_importador_id` | string | físico | não | sim | - | Importador |
| `fabricante_id` | string | físico | não | sim | - | Fabricante |
| `incoterm` | string | físico | não | sim | - | Incoterm |
| `moeda_pedido` | string | físico | sim | sim | `USD` | Moeda |
| `unidade_comercializada_pedido` | string | físico | não | sim | - | Unidade |
| `cobertura_cambial_pedido` | string | físico | sim | sim | `com_cobertura` | Cobertura Cambial |
| `condicao_pagamento_pedido` | string | físico | não | sim | - | Condição de Pagamento |
| `numero_proforma` | string | físico | não | sim | - | Número da Proforma |
| `numero_invoice` | string | físico | não | sim | - | Número da Invoice |
| `referencia_importador` | string | físico | não | sim | - | Ref. Importador |
| `referencia_exportador` | string | físico | não | sim | - | Ref. Exportador |
| `referencia_fabricante` | string | físico | não | sim | - | Ref. Fabricante |
| `valor_total_cambio_pedido` | Decimal(18,6) | físico | não | sim | - | Valor Total Câmbio |
| `moeda_cambio_pedido` | string | físico | não | sim | - | Moeda Câmbio |
| `taxa_cambio_estimada_pedido` | Decimal(18,6) | físico | não | sim | - | Taxa Câmbio Estimada |
| `contrato_cambio_id_pedido` | string | físico | não | sim | - | Contrato Câmbio ID |
| `data_emissao_pedido` | DateTime | físico | sim | sim | `now()` | Data P.O |
| `cnpj_importador` | string | físico | não | sim | - | CNPJ Importador |
| `valor_total_pedido` | Decimal(18,6) | calculado | não | não | - | Valor Total do Pedido |
| `quantidade_total_inicial_pedido` | Decimal(18,6) | calculado | não | não | - | Qtd. Inicial do Pedido |
| `quantidade_pronta_total_pedido` | Decimal(18,6) | calculado | não | não | - | Qtd. Pronta do Pedido |
| `quantidade_transferida_total_pedido` | Decimal(18,6) | calculado | não | não | - | Qtd. Transferida do Pedido |
| `quantidade_cancelada_total_pedido` | Decimal(18,6) | calculado | não | não | - | Qtd. Cancelada do Pedido |
| `saldo_total_pedido` | Decimal(18,6) | calculado | não | não | - | Saldo do Pedido |
| `peso_liquido_total_pedido` | Decimal(18,6) | calculado | não | não | - | Peso Líquido Total |
| `peso_bruto_total_pedido` | Decimal(18,6) | calculado | não | não | - | Peso Bruto Total |
| `cubagem_total_pedido` | Decimal(18,6) | calculado | não | não | - | Cubagem Total |
| `detalhes_operacionais` | Json | virtual | não | sim | - | Detalhes JSONB |
| `campos_custom` | Json | virtual | não | sim | - | Campos Custom JSONB |
| `pedidos_origem_id` | Json | sistema | não | não | - | Pedidos Origem IDs |
| `data_consolidacao_pedido` | DateTime | sistema | não | não | - | Data Consolidação |
| `deleted_at` | DateTime | sistema | não | não | - | Deleted At |
| `pedido_criado_em` | DateTime | sistema | sim | não | `now()` | Criado Em |
| `pedido_atualizado_em` | DateTime | sistema | sim | não | `@updatedAt` | Atualizado Em |

**Campos Virtuais Mapeados (Dentro de detalhes_operacionais):**
* `nome_exportador` (string)
* `nome_importador` (string)
* `nome_fabricante` (string)

---

## 4. Entidade: PedidoItem (Linhas da Operação)

| Nome Canônico | Tipo Dado | Natureza | Obrig. | Edit. Front | Default | Label Tela |
|---|---|---|---|---|---|---|
| `id` | string | sistema | sim | não | - | ID |
| `pedido_id` | string | sistema | sim | não | - | Pedido ID (FK) |
| `sequencia_item` | int | físico | não | sim | - | Sequência |
| `part_number` | string | físico | sim | sim | - | Part Number |
| `ncm` | string | físico | sim | sim | - | NCM |
| `descricao_item` | string | físico | sim | sim | - | Descrição |
| `unidade_comercializada_item` | string | físico | não | sim | - | Unidade |
| `quantidade_inicial_item_pedido` | Decimal(18,6) | físico | sim | sim | - | Qtd Inicial (A) |
| `quantidade_pronta_total_item_pedido` | Decimal(18,6) | físico | sim | sim | `0` | Qtd Pronta (B') |
| `quantidade_transferida_item_pedido` | Decimal(18,6) | físico | sim | sim | `0` | Qtd Transferida (B) |
| `quantidade_cancelada_item_pedido` | Decimal(18,6) | físico | sim | sim | `0` | Qtd Cancelada (C) |
| `saldo_item_pedido` | Decimal(18,6) | calculado | sim | não | - | Saldo |
| `moeda_item` | string | físico | sim | sim | `USD` | Moeda |
| `valor_unitario_item` | Decimal(18,6) | físico | não | sim | - | Valor Unitário |
| `valor_total_item` | Decimal(18,6) | calculado | não | não | - | Valor Total |
| `peso_liquido_unitario_item` | Decimal(18,6) | físico | não | sim | - | Peso Líq. Unitário |
| `peso_bruto_unitario_item` | Decimal(18,6) | físico | não | sim | - | Peso Bruto Unitário |
| `cubagem_unitaria_item` | Decimal(18,6) | físico | não | sim | - | Cubagem Unitária |
| `campos_custom` | Json | virtual | não | sim | - | Campos Custom JSONB |
| `item_criado_em` | DateTime | sistema | sim | não | `now()` | Criado Em |
| `item_atualizado_em` | DateTime | sistema | sim | não | `@updatedAt` | Atualizado Em |
