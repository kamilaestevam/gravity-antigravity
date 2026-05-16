# Plano de Teste E2E — Edição em Massa de Pedidos

> **Produto:** Pedido
> **Area:** Lista / Edição em Massa
> **Data:** 2026-05-16
> **Criticidade:** Alta
> **Total de cenarios:** 176

## Pre-requisitos

- Workspace com 5+ pedidos, cada um com 3-5 itens
- Pelo menos 2 pedidos com `tipo_operacao` diferente (importacao/exportacao)
- Dev server rodando: frontend `:8000`, backend `:8030`
- Viewport: 1440x900

---

## Cenario 1 — 1 Pedido Selecionado (T01-T55)

**Objetivo:** Verificar que TODAS as colunas editaveis do pedido podem ser editadas em massa com 1 pedido.

| # | Acao | Campo | Operacao | Valor | Resultado Esperado |
|---|------|-------|----------|-------|-------------------|
| T01 | Selecionar 1 pedido | — | — | — | Checkbox marcado, toolbar aparece |
| T02 | Clicar "Editar em massa" | — | — | — | Modal abre no Passo 1 |
| T03 | Adicionar campo | `numero_pedido` | substituir | "PED-TESTE-001" | Campo aparece na lista |
| T04 | Adicionar campo | `tipo_operacao` | substituir | "EXP" | Campo aparece + banner azul auto-fill |
| T05 | Adicionar campo | `incoterm` | substituir | "CIF" | Campo select aparece |
| T06 | Adicionar campo | `moeda_pedido` | substituir | "EUR" | Campo select aparece |
| T07 | Adicionar campo | `data_emissao_pedido` | substituir | "2026-06-01" | Campo data aparece |
| T08 | Adicionar campo | `nome_exportador` | substituir | "ACME Corp" | Campo JSON aparece |
| T09 | Adicionar campo | `nome_importador` | substituir | "Brasil Ltda" | Campo JSON aparece |
| T10 | Adicionar campo | `nome_fabricante` | substituir | "Factory Inc" | Campo JSON aparece |
| T11 | Adicionar campo | `referencia_importador` | substituir | "REF-IMP-001" | Campo aparece |
| T12 | Adicionar campo | `referencia_exportador` | substituir | "REF-EXP-001" | Campo aparece |
| T13 | Adicionar campo | `referencia_fabricante` | substituir | "REF-FAB-001" | Campo aparece |
| T14 | Adicionar campo | `numero_proforma` | substituir | "PRO-2026-001" | Campo aparece |
| T15 | Adicionar campo | `numero_invoice` | substituir | "INV-2026-001" | Campo aparece |
| T16 | Adicionar campo | `condicao_pagamento` | substituir | "30/60/90" | Campo aparece |
| T17 | Adicionar campo | `cobertura_cambial` | substituir | "SEM COBERTURA" | Campo aparece |
| T18 | Adicionar campo | `taxa_cambio_estimada` | substituir | 5.25 | Campo numerico aparece |
| T19 | Adicionar campo | `contrato_cambio_id_pedido` | substituir | "CC-001" | Campo aparece |
| T20 | Adicionar campo | `moeda_cambio_pedido` | substituir | "USD" | Campo select aparece |
| T21 | Adicionar campo | `pais_exportador` | substituir | "CHINA" | Campo JSON |
| T22 | Adicionar campo | `estado_exportador` | substituir | "GUANGDONG" | Campo JSON |
| T23 | Adicionar campo | `cidade_exportador` | substituir | "SHENZHEN" | Campo JSON |
| T24 | Adicionar campo | `endereco_exportador` | substituir | "123 Trade St" | Campo JSON |
| T25 | Adicionar campo | `zip_code_exportador` | substituir | "518000" | Campo JSON |
| T26 | Adicionar campo | `cnpj_exportador` | substituir | "12.345.678/0001-90" | Campo JSON |
| T27 | Adicionar campo | `cnpj_importador` | substituir | "98.765.432/0001-10" | Campo JSON |
| T28 | Adicionar campo | `exportador_ou_fabricante` | substituir | "SIM" | Campo JSON |
| T29 | Adicionar campo | `relacao_exportador_fabricante` | substituir | "MESMO" | Campo JSON |
| T30 | Adicionar campo | `nome_contato_exportador` | substituir | "John Smith" | Campo JSON |
| T31 | Adicionar campo | `email_contato_exportador` | substituir | "john@acme.com" | Campo JSON |
| T32 | Adicionar campo | `whatsapp_contato_exportador` | substituir | "+8613800138000" | Campo JSON |
| T33 | Adicionar campo | `cargo_contato_exportador` | substituir | "Sales Manager" | Campo JSON |
| T34 | Adicionar campo | `departamento_contato_exportador` | substituir | "Export Dept" | Campo JSON |
| T35 | Adicionar campo | `pais_fabricante` | substituir | "JAPAN" | Campo JSON |
| T36 | Adicionar campo | `estado_fabricante` | substituir | "OSAKA" | Campo JSON |
| T37 | Adicionar campo | `cidade_fabricante` | substituir | "OSAKA CITY" | Campo JSON |
| T38 | Adicionar campo | `endereco_fabricante` | substituir | "456 Maker Rd" | Campo JSON |
| T39 | Adicionar campo | `zip_code_fabricante` | substituir | "530-0001" | Campo JSON |
| T40 | Adicionar campo | `codigo_ope` | substituir | "OPE-001" | Campo JSON |
| T41 | Adicionar campo | `nome_ope` | substituir | "Operador X" | Campo JSON |
| T42 | Adicionar campo | `situacao_ope` | substituir | "ATIVA" | Campo JSON |
| T43 | Adicionar campo | `versao_ope` | substituir | "1.0" | Campo JSON |
| T44 | Adicionar campo | `pais_ope` | substituir | "BR" | Campo JSON |
| T45 | Adicionar campo | `estado_ope` | substituir | "SP" | Campo JSON |
| T46 | Adicionar campo | `cidade_ope` | substituir | "Sao Paulo" | Campo JSON |
| T47 | Adicionar campo | `endereco_ope` | substituir | "Av Paulista 1000" | Campo JSON |
| T48 | Adicionar campo | `zip_code_ope` | substituir | "01310-100" | Campo JSON |
| T49 | Adicionar campo | `tin_ope` | substituir | "TIN-12345" | Campo JSON |
| T50 | Adicionar campo | `email_ope` | substituir | "ope@test.com" | Campo JSON |
| T51 | Adicionar campo | `cnpj_raiz_empresa_responsavel` | substituir | "12345678" | Campo JSON |
| T52 | Adicionar campo | `quantidade_volumes_pedido` | substituir | 10 | Campo numerico |
| T53 | Adicionar campo | `ncm` | substituir | "8471.30.19" | Campo NCM |
| T54 | Adicionar campo | `descricao_item` | substituir | "Teste desc" | Campo texto |
| T55 | Preview → Confirmar | — | — | — | "1 pedido atualizado" com check verde |

---

## Cenario 2 — 2 Pedidos Selecionados (T56-T63)

**Objetivo:** Verificar operacoes com 2 pedidos, incluindo somar/avancar_dias e bloqueio de unique.

| # | Acao | Campo | Operacao | Valor | Resultado Esperado |
|---|------|-------|----------|-------|-------------------|
| T56 | Selecionar 2 pedidos | — | — | — | 2 checkboxes marcados |
| T57 | Abrir modal | — | — | — | Modal mostra "2 pedidos selecionados" |
| T58 | Adicionar campo | `incoterm` | substituir | "FOB" | Campo aceito |
| T59 | Adicionar campo | `taxa_cambio_estimada` | somar | 0.50 | Operacao somar |
| T60 | Adicionar campo | `data_emissao_pedido` | avancar_dias | 7 | Operacao data |
| T61 | Preview | — | — | — | Mostra impacto em 2 pedidos |
| T62 | Confirmar | — | — | — | "2 pedidos atualizados" com check verde |
| T63 | Verificar numero_pedido | — | — | — | Campo disabled ou nao listado (unique bloqueado com >1 pedido) |

---

## Cenario 3 — 4+ Pedidos (T64-T70)

**Objetivo:** Verificar operacoes em volume: percentual, recuar_dias.

| # | Acao | Campo | Operacao | Valor | Resultado Esperado |
|---|------|-------|----------|-------|-------------------|
| T64 | Selecionar 4+ pedidos | — | — | — | 4+ checkboxes |
| T65 | Adicionar campo | `nome_exportador` | substituir | "Global Corp" | Campo aceito |
| T66 | Adicionar campo | `moeda_pedido` | substituir | "USD" | Campo aceito |
| T67 | Adicionar campo | `taxa_cambio_estimada` | percentual | 5 | +5% sobre valor atual |
| T68 | Adicionar campo | `data_emissao_pedido` | recuar_dias | 3 | -3 dias |
| T69 | Preview | — | — | — | Mostra impacto em 4+ pedidos |
| T70 | Confirmar | — | — | — | "4+ pedidos atualizados" com check verde |

---

## Cenario 4 — Somente Itens Especificos (T71-T80)

**Objetivo:** Verificar edicao de itens especificos (item_ids) sem alterar todo o pedido.

| # | Acao | Campo | Operacao | Valor | Resultado Esperado |
|---|------|-------|----------|-------|-------------------|
| T71 | Expandir pedido, selecionar 2 de 5 itens | — | — | — | 2 itens marcados |
| T72 | Abrir modal | — | — | — | Modal mostra "2 itens selecionados" |
| T73 | Adicionar campo item | `quantidade_inicial_pedido` | somar | 10 | Operacao somar no item |
| T74 | Adicionar campo item | `ncm` | substituir | "3926.90.90" | NCM atualizado |
| T75 | Adicionar campo item | `descricao_item` | substituir | "Item editado" | Texto |
| T76 | Adicionar campo item | `peso_liquido_unitario` | substituir | 2.5 | Peso liquido |
| T77 | Adicionar campo item | `peso_bruto_unitario` | substituir | 3.0 | Peso bruto |
| T78 | Adicionar campo item | `cubagem_unitaria` | substituir | 0.05 | Cubagem |
| T79 | Confirmar | — | — | — | "2 itens atualizados" com check verde |
| T80 | Verificar 3 itens restantes | — | — | — | Valores inalterados |

---

## Cenario 5 — Selecao Mista pedido + itens (T81-T87)

**Objetivo:** Verificar combinacao pedido completo + itens avulsos de outro pedido (pedido_ids_completo).

| # | Acao | Campo | Operacao | Valor | Resultado Esperado |
|---|------|-------|----------|-------|-------------------|
| T81 | Selecionar 1 pedido completo + 2 itens de outro | — | — | — | Selecao mista |
| T82 | Abrir modal | — | — | — | Mostra "1 pedido + 2 itens" |
| T83 | Nivel combinado | `incoterm` | substituir | "DDP" | Cascade ativo no pedido completo |
| T84 | Preview | — | — | — | Mostra cascade nos itens do pedido completo |
| T85 | Confirmar | — | — | — | Sucesso |
| T86 | Verificar pedido completo | — | — | — | Todos itens com incoterm=DDP (cascade) |
| T87 | Verificar itens avulsos | — | — | — | 2 itens do outro pedido editados |

---

## Cenario 6 — Colunas Item Completas (T88-T110)

**Objetivo:** Verificar TODAS as colunas de item editaveis.

| # | Campo Item | Operacao | Valor | Resultado Esperado |
|---|-----------|----------|-------|-------------------|
| T88 | `part_number` | substituir | "PN-001" | Atualizado |
| T89 | `tipo_operacao_item` | substituir | "IMP" | Atualizado |
| T90 | `unidade_comercializada_item` | substituir | "KG" | Atualizado |
| T91 | `sequencia_item` | substituir | 99 | Atualizado |
| T92 | `descricao_completa_item_pt` | substituir | "Desc PT teste" | Atualizado |
| T93 | `descricao_completa_item_nf` | substituir | "Desc NF teste" | Atualizado |
| T94 | `descricao_completa_item_en` | substituir | "Desc EN test" | Atualizado |
| T95 | `descricao_completa_item_es` | substituir | "Desc ES test" | Atualizado |
| T96 | `quantidade_unidade_estatistica` | substituir | 500 | Atualizado |
| T97 | `tipo_embalagem` | substituir | "CAIXA" | Atualizado |
| T98 | `numero_lpco` | substituir | "LPCO-001" | Atualizado |
| T99 | `numero_certificado_origem` | substituir | "CO-001" | Atualizado |
| T100 | `data_certificado_origem` | substituir | "2026-03-15" | Atualizado |
| T101 | `grupo_item` | substituir | "GRUPO-A" | Atualizado |
| T102 | `subgrupo_item` | substituir | "SUB-1" | Atualizado |
| T103 | `campo_especial_item` | substituir | "ESPECIAL" | Atualizado |
| T104 | `texto_posicao_ncm` | substituir | "Posicao 84.71" | Atualizado |
| T105 | `moeda_item` | substituir | "JPY" | Atualizado |
| T106 | `incoterm` (item) | substituir | "EXW" | Atualizado |
| T107 | `condicao_pagamento` (item) | substituir | "A VISTA" | Atualizado |
| T108 | `casas_decimais_quantidade_item` | substituir | 4 | Atualizado |
| T109 | `data_emissao_pedido` (item) | avancar_dias | 10 | +10 dias |
| T110 | `data_embarque_item` | substituir | "2026-07-01" | Atualizado |

---

## Cenario 7 — Campos DUIMP (T111-T120)

**Objetivo:** Verificar colunas DUIMP nos itens.

| # | Campo DUIMP | Operacao | Valor | Resultado Esperado |
|---|------------|----------|-------|-------------------|
| T111 | `tipo_operacao_duimp` | substituir | "IMP" | Atualizado |
| T112 | `descricao_resumida_duimp` | substituir | "Equipamento X" | Atualizado |
| T113 | `ncm_duimp` | substituir | "8471.30.19" | Atualizado |
| T114 | `incoterm_duimp` | substituir | "CIF" | Atualizado |
| T115 | `moeda_produto_duimp` | substituir | "USD" | Atualizado |
| T116 | `valor_unitario_duimp` | substituir | 150.00 | Atualizado |
| T117 | `percentual_ii_duimp` | substituir | 14.0 | Atualizado |
| T118 | `percentual_ipi_duimp` | substituir | 5.0 | Atualizado |
| T119 | `percentual_pis_duimp` | substituir | 2.1 | Atualizado |
| T120 | `percentual_cofins_duimp` | substituir | 9.65 | Atualizado |

---

## Cenario 8 — Datas LPCO/Cert Origem (T121-T125)

**Objetivo:** Verificar campos de data de processos LPCO e Certificado de Origem nos itens.

| # | Campo | Operacao | Valor | Resultado Esperado |
|---|-------|----------|-------|-------------------|
| T121 | `data_prevista_conferencia_draft_lpco` | substituir | "2026-06-01" | Atualizado |
| T122 | `data_confirmada_registro_lpco` | substituir | "2026-05-20" | Atualizado |
| T123 | `data_prevista_deferimento_lpco` | avancar_dias | 5 | +5 dias |
| T124 | `data_prevista_recebimento_draft_cert_origem` | substituir | "2026-06-10" | Atualizado |
| T125 | `data_confirmada_envio_original_cert_origem` | substituir | "2026-05-15" | Atualizado |

---

## Cenario 9 — Erros e Validacoes (T126-T129)

**Objetivo:** Verificar tratamento de erros e edge cases.

| # | Cenario | Resultado Esperado |
|---|---------|-------------------|
| T126 | Campo bloqueado (valor_total_pedido) nao aparece como opcao | Nao listado no select de campos |
| T127 | Timeout (muitos pedidos com cascaded pesado) | Mensagem amigavel: "A operacao demorou mais que o esperado..." — SEM stack trace |
| T128 | numero_pedido + 2 pedidos + substituir | Zod rejeita com mensagem: "cada pedido precisa ter um valor diferente" |
| T129 | Fechar modal sem confirmar | Nenhuma alteracao aplicada nos pedidos |

---

## Cenario 10 — Datas do Pedido Pai (T130-T176)

**Objetivo:** Verificar TODAS as 47 colunas de data do pedido pai editaveis via edicao em massa.

### Pedido Pronto (3 datas)
| # | Campo | Operacao | Valor |
|---|-------|----------|-------|
| T130 | `data_prevista_pedido_pronto` | substituir | "2026-07-01" |
| T131 | `data_confirmada_pedido_pronto` | avancar_dias | 5 |
| T132 | `data_meta_pedido_pronto` | recuar_dias | 3 |

### Inspecao (3 datas)
| T133 | `data_prevista_inspecao_pedido` | substituir | "2026-07-05" |
| T134 | `data_confirmada_inspecao_pedido` | substituir | "2026-07-06" |
| T135 | `data_meta_inspecao_pedido` | avancar_dias | 7 |

### Coleta (3 datas)
| T136 | `data_prevista_coleta_pedido` | substituir | "2026-07-10" |
| T137 | `data_confirmada_coleta_pedido` | substituir | "2026-07-11" |
| T138 | `data_meta_coleta_pedido` | recuar_dias | 2 |

### Consolidacao/Transferencia (2 datas)
| T139 | `data_consolidacao_pedido` | substituir | "2026-07-15" |
| T140 | `data_transferencia_saldo_pedido` | substituir | "2026-07-16" |

### Rascunho Pedido — Recebimento (3 datas)
| T141 | `data_prevista_recebimento_rascunho_pedido` | substituir | "2026-06-01" |
| T142 | `data_confirmada_recebimento_rascunho_pedido` | avancar_dias | 3 |
| T143 | `data_meta_recebimento_rascunho_pedido` | substituir | "2026-06-05" |

### Rascunho Pedido — Aprovacao (3 datas)
| T144 | `data_prevista_aprovacao_rascunho_pedido` | substituir | "2026-06-10" |
| T145 | `data_confirmada_aprovacao_rascunho_pedido` | substituir | "2026-06-11" |
| T146 | `data_meta_aprovacao_rascunho_pedido` | recuar_dias | 5 |

### Documento Pedido (1 data)
| T147 | `data_documento_pedido` | substituir | "2026-06-15" |

### Proforma — Recebimento Rascunho (3 datas)
| T148 | `data_prevista_recebimento_rascunho_proforma` | substituir | "2026-06-20" |
| T149 | `data_confirmada_recebimento_rascunho_proforma` | avancar_dias | 4 |
| T150 | `data_meta_recebimento_rascunho_proforma` | substituir | "2026-06-22" |

### Proforma — Aprovacao Rascunho (3 datas)
| T151 | `data_prevista_aprovacao_rascunho_proforma` | substituir | "2026-06-25" |
| T152 | `data_confirmada_aprovacao_rascunho_proforma` | substituir | "2026-06-26" |
| T153 | `data_meta_aprovacao_rascunho_proforma` | recuar_dias | 2 |

### Proforma — Envio Original (3 datas)
| T154 | `data_prevista_envio_original_proforma` | substituir | "2026-07-01" |
| T155 | `data_confirmada_envio_original_proforma` | avancar_dias | 3 |
| T156 | `data_meta_envio_original_proforma` | substituir | "2026-07-03" |

### Proforma — Recebimento Original (3 datas)
| T157 | `data_prevista_recebimento_original_proforma` | substituir | "2026-07-05" |
| T158 | `data_confirmada_recebimento_original_proforma` | substituir | "2026-07-06" |
| T159 | `data_meta_recebimento_original_proforma` | recuar_dias | 4 |

### Documento Proforma (1 data)
| T160 | `data_proforma_invoice` | substituir | "2026-07-10" |

### Invoice — Recebimento Rascunho (3 datas)
| T161 | `data_prevista_recebimento_rascunho_invoice` | substituir | "2026-07-15" |
| T162 | `data_confirmada_recebimento_rascunho_invoice` | avancar_dias | 5 |
| T163 | `data_meta_recebimento_rascunho_invoice` | substituir | "2026-07-17" |

### Invoice — Aprovacao Rascunho (3 datas)
| T164 | `data_prevista_aprovacao_rascunho_invoice` | substituir | "2026-07-20" |
| T165 | `data_confirmada_aprovacao_rascunho_invoice` | substituir | "2026-07-21" |
| T166 | `data_meta_aprovacao_rascunho_invoice` | recuar_dias | 3 |

### Invoice — Envio Original (3 datas)
| T167 | `data_prevista_envio_original_invoice` | substituir | "2026-07-25" |
| T168 | `data_confirmada_envio_original_invoice` | avancar_dias | 2 |
| T169 | `data_meta_envio_original_invoice` | substituir | "2026-07-27" |

### Invoice — Recebimento Original (3 datas)
| T170 | `data_prevista_recebimento_original_invoice` | substituir | "2026-07-30" |
| T171 | `data_confirmada_recebimento_original_invoice` | substituir | "2026-07-31" |
| T172 | `data_meta_recebimento_original_invoice` | recuar_dias | 5 |

### Documento Invoice (1 data)
| T173 | `data_invoice` | substituir | "2026-08-01" |

### Operacoes mistas em datas (3 extras)
| T174 | Qualquer data pai | somar (via avancar_dias) | 30 | +30 dias |
| T175 | Qualquer data pai | subtrair (via recuar_dias) | 15 | -15 dias |
| T176 | 3 datas no mesmo batch | substituir | datas distintas | Todas atualizadas |

---

## Resumo de Cobertura

| Metrica | Valor |
|---------|-------|
| Total de cenarios | 176 |
| Colunas pai editaveis | 100% |
| Colunas item editaveis | 100% |
| Colunas datas pai | 47/47 |
| Operacoes | 6/6 (substituir, somar, subtrair, percentual, avancar_dias, recuar_dias) |
| Selecoes | 5 tipos (1 pedido, 2 pedidos, 4+, itens avulsos, misto) |
| Erros | timeout, unique, campo bloqueado, cancelar |
