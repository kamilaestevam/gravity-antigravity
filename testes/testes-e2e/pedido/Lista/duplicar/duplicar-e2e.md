# Plano de Testes E2E — Duplicar Pedido

**ID:** TST-E2E-PEDIDO-DUPLICAR-001
**Data:** 2026-05-16
**Versão:** 1.0
**Criticidade:** alta
**Ambiente:** Playwright + Percy em Staging
**Status:** Aguardando aprovacao do dono

---

## Resumo Executivo

Plano de teste E2E completo para a feature de duplicacao de pedidos no produto Pedido. Cobre o modal wizard de 2 passos (Raio X + Confirmacao), duplicacao de pedidos (1 e 2), duplicacao de itens isolados (1 e multiplos), opcoes toggleaveis, verificacao de TODAS as colunas do pedido e do item pos-duplicacao, e estados de interface. Criticidade alta: duplicacao incorreta cria registros com dados financeiros/operacionais errados. Abrange as 11 categorias obrigatorias do QA.

---

## Pre-requisitos

| Requisito | Detalhe |
|-----------|---------|
| Ambiente | Staging |
| Organizacao | Org de teste com pelo menos 3 pedidos com itens |
| Dados | Pedido A: 3 itens com valores, pesos, referencias preenchidos; Pedido B: 2 itens com descricoes complementares; Pedido C: 1 item com qtd_pronta > 0 |
| Permissao | Usuario com `pedido:lista:editar` |
| Config | Organizacao com `duplicar_numero_auto=true` E outra com `=false` |

---

## Fluxos de Teste

### FLUXO 1 — Duplicar 1 Pedido (caminho feliz completo)

**Categoria:** CRUD + Modais + Verificacao de colunas

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 1.1 | Selecionar 1 pedido na tabela via checkbox | Checkbox marcado, toolbar de acoes aparece | 01_selecao_1_pedido |
| 1.2 | Clicar botao "Duplicar" (icone StackPlus) na toolbar | Modal wizard abre no Passo 1 "Configurar" | 02_modal_passo1 |
| 1.3 | Verificar stepper: "Configurar" ativo, "Confirmar" inativo | Stepper mostra passo 1 de 2 | |
| 1.4 | Verificar secao "Sempre resetado" aberta com chips de campo | Dois grupos: Pedido e Item com chips vermelhos | 03_raio_x_reset |
| 1.5 | Verificar chips Pedido: ID do pedido, Data de criacao, Data de atualizacao, Pedidos de origem, Data de consolidacao, Data de transferencia de saldo | Todos os 6 chips visiveis | |
| 1.6 | Verificar chips Item: ID do item, Data de criacao, Data de atualizacao, Saldo atual, Qtd pronta, Qtd transferida, Qtd cancelada | Todos os 7 chips visiveis | |
| 1.7 | Verificar secao "Opcoes" com 5 toggles | Todos marcados (checked) por default | 04_raio_x_opcoes |
| 1.8 | Verificar info de status na parte inferior | "Status das copias: Copiado do original" ou similar | |
| 1.9 | Clicar "Proximo" | Modal avanca para Passo 2 "Confirmar" | 05_modal_passo2 |
| 1.10 | Verificar tabela de pedidos com colunas: Original, Itens, Numero | Linha com o pedido selecionado | |
| 1.11 | Verificar coluna Itens mostra contagem + chips | Numero de itens + chips com part_number | |
| 1.12 | Se numero_auto=true: campo mostra "(gerado automaticamente)" com badge AUTO | Badge azul "AUTO" visivel | |
| 1.13 | Clicar "Duplicar" (botao final) | Loading aparece, depois tela de resultado | 06_resultado |
| 1.14 | Verificar tela de resultado: icone verde + mensagem de sucesso | "1 pedido duplicado" | |
| 1.15 | Verificar lista Original → Novo: numero do original e numero da copia | Seta → entre os dois | |
| 1.16 | Clicar "Fechar" | Modal fecha, tabela recarrega | |
| 1.17 | **VERIFICAR PEDIDO DUPLICADO NA TABELA** | Novo pedido aparece na lista | 07_tabela_pos_dup |

#### Verificacao de TODAS as colunas do pedido duplicado

| Passo | Coluna | Verificacao |
|-------|--------|-------------|
| 1.18 | `numero_pedido` | Numero novo (auto ou fornecido) |
| 1.19 | `status_pedido` | Igual ao original (se config = 'copiar') |
| 1.20 | `tipo_operacao_pedido` | Igual ao original |
| 1.21 | `data_emissao_pedido` | Data atual (se copiar_datas=true + config.copiar_datas=true) |
| 1.22 | `data_embarque_pedido` | Igual ao original |
| 1.23 | `data_chegada_pedido` | Igual ao original |
| 1.24 | `moeda_pedido` | Igual ao original |
| 1.25 | `incoterm_pedido` | Igual ao original |
| 1.26 | `valor_total_pedido` | Igual ao original (opcoes.copiar_valores_precos=true) |
| 1.27 | `valor_total_cambio_pedido` | Igual ao original |
| 1.28 | `taxa_cambio_estimada_pedido` | Igual ao original |
| 1.29 | `peso_liquido_total_pedido` | Igual ao original |
| 1.30 | `peso_bruto_total_pedido` | Igual ao original |
| 1.31 | `cubagem_total_pedido` | Igual ao original |
| 1.32 | `numero_proforma_pedido` | Igual ao original |
| 1.33 | `numero_invoice_pedido` | Igual ao original |
| 1.34 | `referencia_importador_pedido` | Igual ao original |
| 1.35 | `referencia_exportador_pedido` | Igual ao original |
| 1.36 | `referencia_fabricante_pedido` | Igual ao original |
| 1.37 | `id_pedido` | DIFERENTE do original (novo) |
| 1.38 | `data_criacao_pedido` | Data atual (resetado) |
| 1.39 | `ids_origem_consolidacao_pedido` | Nulo/vazio (resetado) |
| 1.40 | `data_consolidacao_pedido` | Nulo (resetado) |
| 1.41 | `data_transferencia_saldo_pedido` | Nulo (resetado) |

#### Verificacao de TODAS as colunas dos itens do pedido duplicado

| Passo | Coluna | Verificacao |
|-------|--------|-------------|
| 1.42 | `part_number` | Igual ao original |
| 1.43 | `ncm` | Igual ao original |
| 1.44 | `descricao_item` | Igual ao original |
| 1.45 | `quantidade_inicial_item` | Igual ao original |
| 1.46 | `quantidade_atual_item` | = quantidade_inicial_item (resetado = saldo volta ao inicio) |
| 1.47 | `quantidade_pronta_item` | 0 (resetado) |
| 1.48 | `quantidade_transferida_item` | 0 (resetado) |
| 1.49 | `quantidade_cancelada_item` | 0 (resetado) |
| 1.50 | `valor_total_item` | Igual ao original |
| 1.51 | `valor_por_unidade_item` | Igual ao original |
| 1.52 | `peso_liquido_unitario_item` | Igual ao original |
| 1.53 | `peso_bruto_unitario_item` | Igual ao original |
| 1.54 | `cubagem_unitaria_item` | Igual ao original |
| 1.55 | `descricao_completa_item_pt` | Igual ao original |
| 1.56 | `descricao_completa_item_en` | Igual ao original |
| 1.57 | `descricao_completa_item_es` | Igual ao original |
| 1.58 | `descricao_completa_item_nf` | Igual ao original |
| 1.59 | `numero_lpco` | Igual ao original |
| 1.60 | `numero_certificado_origem` | Igual ao original |
| 1.61 | `tipo_embalagem_item` | Igual ao original |
| 1.62 | `quantidade_volumes_item` | Igual ao original |
| 1.63 | `sequencia_item` | Sequencia nova contígua 1..N |
| 1.64 | `id_item` | DIFERENTE do original (novo) |

---

### FLUXO 2 — Duplicar 2 Pedidos

**Categoria:** Operacoes em Massa + CRUD

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 2.1 | Selecionar 2 pedidos via checkbox | 2 checkboxes marcados, contagem "2 selecionados" | 08_selecao_2_pedidos |
| 2.2 | Clicar "Duplicar" | Modal abre com titulo "Duplicar 2 pedidos" | 09_modal_2_pedidos |
| 2.3 | Verificar Raio X identico (mesmos chips, mesmas opcoes) | Layout identico ao fluxo 1 | |
| 2.4 | Clicar "Proximo" | Passo 2 com 2 linhas na tabela | 10_confirmar_2_pedidos |
| 2.5 | Verificar que cada pedido tem sua coluna de itens e numero | 2 linhas com chips de itens | |
| 2.6 | Clicar "Duplicar" | Resultado: "2 pedidos duplicados" | 11_resultado_2 |
| 2.7 | Verificar tabela: 2 novos pedidos aparecem | Total de pedidos aumentou em 2 | 12_tabela_2_novos |
| 2.8 | Expandir cada pedido duplicado e verificar itens | Itens corretos com saldo zerado | |

---

### FLUXO 3 — Duplicar 1 Item Isolado (dentro de um pedido)

**Categoria:** CRUD + Modais

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 3.1 | Expandir um pedido para ver itens | Itens expandem abaixo do pai | |
| 3.2 | Selecionar 1 item via checkbox (SEM selecionar o pedido pai) | Checkbox do item marcado | 13_selecao_1_item |
| 3.3 | Clicar "Duplicar" | Modal abre com titulo "Duplicar 1 item" | 14_modal_1_item |
| 3.4 | Verificar Raio X (passo 1) — mesmo layout | Opcoes identicas | |
| 3.5 | Clicar "Proximo" | Passo 2 mostra secao "Itens a duplicar" | 15_confirmar_1_item |
| 3.6 | Verificar tabela de itens: coluna Pedido Original + coluna Itens | Mostra numero do pedido pai + chip do item | |
| 3.7 | Clicar "Duplicar" | Resultado: "1 item duplicado" | 16_resultado_1_item |
| 3.8 | Fechar modal e expandir o pedido pai | Item duplicado aparece na lista de itens | 17_item_duplicado |
| 3.9 | Verificar que o item duplicado ficou IMEDIATAMENTE ABAIXO do original | Sequencia original + 1 | |
| 3.10 | Verificar TODAS as colunas do item duplicado | Mesmas verificacoes de 1.42 a 1.64 | |

---

### FLUXO 4 — Duplicar Multiplos Itens (2+)

**Categoria:** Operacoes em Massa

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 4.1 | Expandir pedido, selecionar 2 itens (nao o pedido pai) | 2 checkboxes de itens marcados | 18_selecao_2_itens |
| 4.2 | Clicar "Duplicar" | Modal com titulo "Duplicar 2 itens" | 19_modal_2_itens |
| 4.3 | Clicar "Proximo" | Passo 2 mostra 2 itens agrupados sob o pedido pai | |
| 4.4 | Clicar "Duplicar" | Resultado: "2 itens duplicados" | 20_resultado_2_itens |
| 4.5 | Expandir pedido: verificar que 2 novos itens apareceram | Total de itens aumentou em 2 | 21_pedido_com_novos |
| 4.6 | Verificar que cada item duplicado esta imediatamente abaixo do seu original | Sequencia intercalada | |
| 4.7 | Verificar colunas de TODOS os itens duplicados | part_number, valores, pesos, etc. | |

---

### FLUXO 5 — Duplicar Misto (Pedido + Itens de Outro Pedido)

**Categoria:** Caso especial

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 5.1 | Selecionar 1 pedido + 1 item de OUTRO pedido | Misto: checkbox de pedido + checkbox de item | 22_misto |
| 5.2 | Clicar "Duplicar" | Modal com titulo misto "Duplicar 1 pedido e 1 item" | 23_modal_misto |
| 5.3 | Passo 2 mostra DUAS secoes: "Pedidos" e "Itens" | Secao de pedidos + secao de itens separadas | 24_confirmar_misto |
| 5.4 | Clicar "Duplicar" | Resultado misto: "1 pedido e 1 item duplicados" | 25_resultado_misto |
| 5.5 | Verificar novo pedido na tabela + item duplicado no pedido pai | Ambos criados corretamente | |

---

### FLUXO 6 — Opcoes de Duplicacao (Toggles)

**Categoria:** Toggle/Checkbox + verificacao de persistencia

#### 6A. Desativar "Copiar valores e precos"

| Passo | Acao | Resultado Esperado |
|-------|------|-------------------|
| 6A.1 | Selecionar pedido com valores preenchidos | Pedido tem valor_total, taxa_cambio |
| 6A.2 | Abrir modal, desmarcar "Copiar valores e precos" | Checkbox desmarcado |
| 6A.3 | Confirmar duplicacao | Pedido duplicado criado |
| 6A.4 | Verificar pedido duplicado: `valor_total_pedido` = vazio/null | Campo zerado |
| 6A.5 | Verificar pedido duplicado: `valor_total_cambio_pedido` = vazio/null | Campo zerado |
| 6A.6 | Verificar pedido duplicado: `taxa_cambio_estimada_pedido` = vazio/null | Campo zerado |
| 6A.7 | Verificar itens: `valor_total_item` = vazio/null | Campo zerado |
| 6A.8 | Verificar itens: `valor_por_unidade_item` = vazio/null | Campo zerado |

#### 6B. Desativar "Copiar referencias externas"

| Passo | Acao | Resultado Esperado |
|-------|------|-------------------|
| 6B.1 | Selecionar pedido com proforma e invoice preenchidos | |
| 6B.2 | Desmarcar "Copiar referencias externas" | |
| 6B.3 | Confirmar duplicacao | |
| 6B.4 | Verificar: `numero_proforma_pedido` = null | Zerado |
| 6B.5 | Verificar: `numero_invoice_pedido` = null | Zerado |
| 6B.6 | Verificar: `referencia_importador_pedido` = null | Zerado |
| 6B.7 | Verificar: `referencia_exportador_pedido` = null | Zerado |
| 6B.8 | Verificar: `referencia_fabricante_pedido` = null | Zerado |
| 6B.9 | Verificar: `contrato_cambio_id_pedido` = null | Zerado |
| 6B.10 | Verificar itens: `numero_lpco` = null | Zerado |
| 6B.11 | Verificar itens: `numero_certificado_origem` = null | Zerado |

#### 6C. Desativar "Copiar pesos e cubagem"

| Passo | Acao | Resultado Esperado |
|-------|------|-------------------|
| 6C.1 | Selecionar pedido com pesos preenchidos | |
| 6C.2 | Desmarcar "Copiar pesos e cubagem" | |
| 6C.3 | Confirmar duplicacao | |
| 6C.4 | Verificar: `peso_liquido_total_pedido` = null | |
| 6C.5 | Verificar: `peso_bruto_total_pedido` = null | |
| 6C.6 | Verificar: `cubagem_total_pedido` = null | |
| 6C.7 | Verificar: `tipo_embalagem_pedido` = null | |
| 6C.8 | Verificar: `quantidade_volumes_pedido` = null | |
| 6C.9 | Verificar itens: `peso_liquido_unitario_item` = null | |
| 6C.10 | Verificar itens: `peso_bruto_unitario_item` = null | |
| 6C.11 | Verificar itens: `cubagem_unitaria_item` = null | |

#### 6D. Desativar "Copiar descricoes complementares"

| Passo | Acao | Resultado Esperado |
|-------|------|-------------------|
| 6D.1 | Selecionar pedido com descricoes nos itens | |
| 6D.2 | Desmarcar "Copiar descricoes complementares" | |
| 6D.3 | Confirmar duplicacao | |
| 6D.4 | Verificar item: `descricao_completa_item_pt` = null | |
| 6D.5 | Verificar item: `descricao_completa_item_en` = null | |
| 6D.6 | Verificar item: `descricao_completa_item_es` = null | |
| 6D.7 | Verificar item: `descricao_completa_item_nf` = null | |
| 6D.8 | Verificar item: `texto_posicao_ncm` = null | |
| 6D.9 | Verificar item: `grupo_item` = null | |
| 6D.10 | Verificar item: `subgrupo_item` = null | |
| 6D.11 | Verificar item: `campo_especial_item` = null | |
| 6D.12 | Verificar item: `atributos_catalogo` = null | |

#### 6E. Desativar "Copiar datas"

| Passo | Acao | Resultado Esperado |
|-------|------|-------------------|
| 6E.1 | Selecionar pedido com datas preenchidas | |
| 6E.2 | Desmarcar "Copiar datas" | |
| 6E.3 | Confirmar duplicacao | |
| 6E.4 | Verificar: TODOS os campos Date do pedido = null | data_embarque, data_chegada, etc. |
| 6E.5 | Verificar: TODOS os campos Date dos itens = null | |

#### 6F. Desativar TODAS as opcoes

| Passo | Acao | Resultado Esperado |
|-------|------|-------------------|
| 6F.1 | Desmarcar todos os 5 toggles | Nenhum marcado |
| 6F.2 | Confirmar duplicacao | Pedido criado com minimo de dados |
| 6F.3 | Verificar: apenas campos estruturais copiados | part_number, ncm, descricao, quantidade_inicial, tipo_operacao |

---

### FLUXO 7 — Numero Manual (config numero_auto=false)

**Categoria:** Formularios + Validacao

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 7.1 | Selecionar pedido (org com auto=false) | | |
| 7.2 | Abrir modal, ir para passo 2 | Campo de input de numero aparece (sem badge AUTO) | 26_numero_manual |
| 7.3 | Tentar clicar "Duplicar" com campo vazio | Botao desabilitado (podeAvancar=false) | |
| 7.4 | Campo envolto em CampoGeralGlobal com borda vermelha | Indicacao visual de obrigatorio vazio | |
| 7.5 | Digitar numero "COPIA-TEST-001" | Campo preenchido, borda muda para normal | |
| 7.6 | Clicar "Duplicar" | Resultado: pedido com numero "COPIA-TEST-001" | 27_resultado_manual |
| 7.7 | Tentar duplicar novamente com MESMO numero | Erro: "Numero ja esta em uso" | 28_erro_num_dup |

---

### FLUXO 8 — Estados de Interface

**Categoria:** Estados

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 8.1 | Abrir modal: estado de loading | GravityLoader visivel com texto "Carregando..." | 29_loading |
| 8.2 | Erro de rede no preview | Mensagem de erro vermelha com texto | 30_erro_preview |
| 8.3 | Loading durante confirmacao | Botao "Duplicar" em estado de loading | |
| 8.4 | Toast de sucesso apos duplicacao | Toast verde com mensagem | |
| 8.5 | Toast de erro apos falha | Toast vermelho com mensagem | |

---

### FLUXO 9 — Navegacao do Wizard

**Categoria:** Navegacao + Modais

| Passo | Acao | Resultado Esperado |
|-------|------|-------------------|
| 9.1 | Abrir modal: stepper mostra "Configurar" ativo | Step 1 destacado |
| 9.2 | Clicar "Proximo" | Stepper muda para "Confirmar" ativo |
| 9.3 | Clicar "Voltar" | Stepper volta para "Configurar" |
| 9.4 | Clicar diretamente no step 2 (navegacao direta) | Avanca para passo 2 |
| 9.5 | Fechar modal pelo X | Modal fecha, volta para tabela |
| 9.6 | Apos resultado: stepper oculto | Apenas botao "Fechar" visivel |

---

### FLUXO 10 — Truncamento de Texto + Tooltips

**Categoria:** UX/Visual

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 10.1 | Duplicar pedido com item de part_number longo (>18 chars) | Chip truncado com "..." | 31_chip_truncado |
| 10.2 | Hover sobre chip truncado | Tooltip mostra texto completo | 32_tooltip_chip |
| 10.3 | Pedido com >4 itens: chips inline + badge "+N" | Badge "+2" (por exemplo) visivel | 33_badge_mais |
| 10.4 | Hover sobre badge "+N" | Tooltip lista itens extras | |

---

### FLUXO 11 — Aviso de Zeramento de Saldo

**Categoria:** Estados + UX

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 11.1 | Selecionar pedido C (tem item com qtd_pronta > 0) | | |
| 11.2 | Abrir modal, ir para passo 2 | Aviso amarelo aparece: "Campos de execucao serao zerados" | 34_aviso_saldo |
| 11.3 | Verificar aviso lista campos: qtd_pronta, qtd_transferida, qtd_cancelada | Campos listados no aviso | |

---

## Categorias do QA Cobertas

| # | Categoria | Status | Fluxos |
|---|-----------|--------|--------|
| 1 | Operacoes CRUD | ✅ | 1, 2, 3, 4, 5 |
| 2 | Filtros e Busca | 🚫 Nao aplicavel | Modal nao tem filtros |
| 3 | Selects e Dropdowns | 🚫 Nao aplicavel | Modal nao tem selects |
| 4 | Importacao e Exportacao | 🚫 Nao aplicavel | |
| 5 | Navegacao e Layout | ✅ | 9 |
| 6 | Modais e Formularios | ✅ | 1, 7, 9 |
| 7 | Estados de Interface | ✅ | 8 |
| 8 | Operacoes em Massa | ✅ | 2, 4 |
| 9 | Visualizacoes | 🚫 Nao aplicavel | Modal, nao lista |
| 10 | Validacao Visual (Percy) | ✅ | 10, screenshots numerados |
| 11 | Testes Especificos | ✅ | 5 (misto), 6 (opcoes), 11 (aviso saldo) |

---

## Validacao Visual com Percy

| Screenshot | Descricao |
|------------|-----------|
| percy_01_passo1_configurar | Modal passo 1 com Raio X completo |
| percy_02_passo2_confirmar_1_pedido | Passo 2 com 1 pedido + tabela |
| percy_03_passo2_confirmar_2_pedidos | Passo 2 com 2 pedidos |
| percy_04_resultado_sucesso | Tela de resultado verde |
| percy_05_resultado_misto | Resultado com pedidos + itens |
| percy_06_numero_manual | Campo de numero obrigatorio com CampoGeral |
| percy_07_chip_truncado_tooltip | Chip com texto truncado + tooltip |
| percy_08_aviso_saldo | Aviso amarelo de zeramento |
| percy_09_erro_preview | Estado de erro |
| percy_10_opcoes_todas_desmarcadas | Raio X com 5 toggles desmarcados |

---

## Dados de Teste Necessarios

| Dado | Detalhe |
|------|---------|
| Pedido A | 3 itens: valores financeiros, pesos, referencias, descricoes — tudo preenchido |
| Pedido B | 2 itens: descricoes complementares (PT, EN, ES, NF), texto_posicao_ncm |
| Pedido C | 1 item com quantidade_pronta_total > 0, quantidade_transferida > 0 |
| Pedido D | Part number com >20 caracteres (truncamento) |
| Pedido E | >5 itens (teste de badge "+N") |

---

## Categorias Nao Aplicaveis — Justificativa

| Categoria | Justificativa |
|-----------|---------------|
| Filtros e Busca | O modal de duplicacao nao tem funcionalidade de filtro/busca |
| Selects e Dropdowns | O modal nao tem campos select — apenas checkboxes toggle |
| Importacao e Exportacao | Funcionalidade de duplicacao nao envolve import/export |
| Visualizacoes | O modal e componente isolado, nao tem alternancia lista/kanban |

---

## Estrutura de Arquivos Esperada

```
testes/testes-e2e/pedido/Lista/duplicar/
├── duplicar-e2e.md                  ← este plano
├── duplicar-1-pedido.spec.ts        ← Fluxo 1 (todas as colunas)
├── duplicar-2-pedidos.spec.ts       ← Fluxo 2
├── duplicar-1-item.spec.ts          ← Fluxo 3
├── duplicar-multiplos-itens.spec.ts ← Fluxo 4
├── duplicar-misto.spec.ts           ← Fluxo 5
├── opcoes-duplicacao.spec.ts        ← Fluxo 6 (6A-6F)
├── numero-manual.spec.ts            ← Fluxo 7
├── estados-interface.spec.ts        ← Fluxo 8
├── navegacao-wizard.spec.ts         ← Fluxo 9
├── truncamento-tooltips.spec.ts     ← Fluxo 10
└── aviso-saldo.spec.ts              ← Fluxo 11
```

**Total de passos:** ~180+
**Total de verificacoes de coluna:** ~50+ (pedido + item, por fluxo)
