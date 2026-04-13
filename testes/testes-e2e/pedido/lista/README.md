# E2E · Pedido / Lista de Pedidos — Índice da Suite

**Tela:** `/pedidos`
**Padrão:** um arquivo por coluna ou feature · cada check = uma ação isolada do usuário

---

## Colunas (21 arquivos)

| Arquivo | Coluna | Tipo de filtro | Editável | Checks |
|---------|--------|---------------|----------|--------|
| `col_01_numero_pedido.md` | Nº Pedido / Part Number | texto | não | 36 |
| `col_02_tipo_operacao.md` | Tipo de Operação | enum | não | 25 |
| `col_03_nome_exportador.md` | Nome do Exportador | texto | só Importação | 31 |
| `col_04_nome_importador.md` | Nome do Importador | texto | só Exportação | 30 |
| `col_05_referencia_importador.md` | Referência Importador | texto | sim | 32 |
| `col_06_referencia_exportador.md` | Referência Exportador | texto | sim | 30 |
| `col_07_status.md` | Status | enum | via badge | 33 |
| `col_08_ncm.md` | NCM | texto | sim | 25 |
| `col_09_numero_proforma.md` | Número da Proforma | texto | não | 19 |
| `col_10_numero_invoice.md` | Número da Invoice | texto | não | 19 |
| `col_11_incoterm.md` | Incoterm | texto | sim | 25 |
| `col_12_valor_total_pedido.md` | Valor Total do Pedido | numérico | calculado | 24 |
| `col_13_data_po.md` | Data P.O | data | não | 12 |
| `col_14_referencia_fabricante.md` | Referência do Fabricante | texto | sim | 22 |
| `col_15_qtd_inicial.md` | Qtd. Inicial do Pedido | numérico | calculado | 14 |
| `col_16_qtd_pronta.md` | Qtd. Pronta do Pedido | numérico | calculado | 12 |
| `col_17_saldo_pedido.md` | Saldo do Pedido | numérico | calculado | 17 |
| `col_18_qtd_transferida.md` | Qtd. Transferida do Pedido | numérico | calculado | 12 |
| `col_19_qtd_cancelada.md` | Qtd. Cancelada do Pedido | numérico | calculado | 13 |
| `col_20_cobertura_cambial.md` | Cobertura Cambial | texto | não | 12 |
| `col_21_condicao_pagamento.md` | Condição de Pagamento | texto | sim | 21 |

---

## Features Transversais (8 arquivos)

| Arquivo | Feature | Checks |
|---------|---------|--------|
| `feat_tabs.md` | Tabs de status | 40 |
| `feat_busca_global.md` | Busca global | 22 |
| `feat_kpi_cards.md` | KPI Cards | 26 |
| `feat_exportar.md` | Exportar (6 formatos) | 19 |
| `feat_checkboxes.md` | Seleção e checkboxes | 26 |
| `feat_expandir.md` | Expandir/recolher filhos | 21 |
| `feat_colunas_configuravel.md` | Painel de colunas | 16 |
| `feat_modais.md` | Modais de ação em massa | 34 |
| `feat_drawer.md` | Drawer do pedido | 21 |
| `feat_novo_botao.md` | Botão + Novo | 20 |

---

## Totalizador

| Categoria | Arquivos | Checks |
|-----------|----------|--------|
| Colunas | 21 | 463 |
| Features | 10 | 245 |
| **Total** | **31** | **708** |

---

## Como executar

```
# Documento → revisão manual (abrir o .md, marcar os checks)
# Código → quando os documentos forem aprovados:
npx playwright test testes/testes-e2e/pedido/lista/ \
  --config=produto/pedido/client/e2e/playwright.config.ts
```

## Próximo passo

Após validar o padrão dos documentos → converter cada `.md` em spec Playwright atômico (`.spec.ts`) seguindo a mesma estrutura de IDs (ex: `C01-H01`, `TAB-A01`).
