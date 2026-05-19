# Plano de Testes E2E — Editar e Salvar Inline (Lista de Pedidos)

**ID:** TST-E2E-PEDIDO-EDITAR-SALVAR-001
**Data:** 2026-05-17
**Versao:** 1.0
**Criticidade:** alta
**Ambiente:** Playwright + Percy em Staging
**Status:** Aguardando aprovacao do dono

---

## Resumo Executivo

Plano de teste E2E completo para edicao inline e salvamento de campos individuais na Lista de Pedidos. Cobre o ciclo completo clicar→popover→editar→salvar→persistencia para TODAS as colunas editaveis (PAI + FILHO), verificacao de campos bloqueados (calculados, saldo, somente_leitura), propagacao via checkbox "Aplicar a todos os itens", divergencia pai/filho com icone amarelo, formatacao numerica brasileira, truncamento de texto com Eye+tooltip, valores vazios (travessao), deep-links Importador/Exportador para Configurador, cancelamento com rollback, e permissoes. Criticidade alta: edicao incorreta de campos financeiros/operacionais causa dados errados em producao.

---

## Pre-requisitos

| Requisito | Detalhe |
|-----------|---------|
| Ambiente | Staging |
| Organizacao | Org de teste com pelo menos 3 pedidos com 3-5 itens cada |
| Dados — tipo_operacao | Pelo menos 1 pedido com tipo_operacao='importacao' e 1 com 'exportacao' |
| Dados — divergencia | Pelo menos 1 pedido com itens divergentes (NCM, incoterm, moeda diferentes entre itens) |
| Dados — numericos | Pedidos com valores numericos preenchidos (valor_total_item, quantidades, pesos) |
| Dados — datas | Pedidos com campos de data preenchidos E vazios |
| Dados — texto longo | Pedidos com textos >50 chars em referencia_importador ou nome_fabricante |
| Permissao | Usuario com `pedido:lista:editar` (podeEditarLista=true) |
| Permissao negativa | Usuario SEM `pedido:lista:editar` (para teste C18) |
| Servidor | Frontend http://localhost:5179 (Vite) ou http://localhost:8000 (shell), backend http://localhost:8030 |

---

## SSOT — columnBehaviorConfig.ts

> Fonte unica de verdade: `servicos-global/produto/pedido/client/src/shared/columnBehaviorConfig.ts`

| Tipo | Editavel PAI | Editavel ITEM | Soma | Alerta |
|------|-------------|---------------|------|--------|
| alfanumerico | true | true | false | true |
| calculado | **false** | **true** | true | false |
| saldo | false | false | true | false |
| somente_leitura | false | false | false | false |

---

## Fluxos de Teste

### FLUXO 1 — Campos alfanumericos PAI: clicar, editar, salvar, confirmar persistencia

**Categoria:** CRUD + Inline Edit
**Casos:** 15

| Passo | Coluna | Tipo Input | Verificacao |
|-------|--------|------------|-------------|
| 1.1 | `numero_pedido` | texto | Editar → salvar → recarregar → valor persiste |
| 1.2 | `tipo_operacao` | select (importacao/exportacao) | Selecionar → salvar → badge atualiza |
| 1.3 | `nome_fabricante` | texto | Editar → salvar → persistencia |
| 1.4 | `referencia_importador` | texto | Editar → salvar → persistencia |
| 1.5 | `referencia_exportador` | texto | Editar → salvar → persistencia |
| 1.6 | `ncm` | texto/busca | Editar → salvar → persistencia |
| 1.7 | `numero_proforma` | texto | Editar → salvar → persistencia |
| 1.8 | `numero_invoice` | texto | Editar → salvar → persistencia |
| 1.9 | `incoterm` | select/busca | Selecionar → salvar → persistencia |
| 1.10 | `data_emissao_pedido` | datepicker | Selecionar data → salvar → formato dd/mm/aaaa |
| 1.11 | `referencia_fabricante` | texto | Editar → salvar → persistencia |
| 1.12 | `cobertura_cambial` | texto | Editar → salvar → persistencia |
| 1.13 | `condicao_pagamento` | texto/select | Editar → salvar → persistencia |
| 1.14 | `nome_exportador` | texto (apenas importacao) | Ver FLUXO 5 |
| 1.15 | `nome_importador` | texto (apenas exportacao) | Ver FLUXO 5 |

**Passos por campo:**
1. Localizar coluna na tabela (scroll horizontal se necessario)
2. Clicar na celula do campo na linha PAI → popover abre
3. Digitar/selecionar novo valor
4. Clicar Confirmar (checkmark) ou pressionar Enter
5. Verificar flash verde de sucesso (600ms)
6. Verificar notificacao toast "Campo atualizado com sucesso"
7. Recarregar pagina (F5)
8. Verificar que o valor novo aparece na celula

---

### FLUXO 2 — 47 campos de data PAI

**Categoria:** CRUD + Datepicker
**Casos:** 47

| Grupo | Campos | Quantidade |
|-------|--------|------------|
| Pedido Pronto | data_prevista/confirmada/meta_pedido_pronto | 3 |
| Inspecao | data_prevista/confirmada/meta_inspecao_pedido | 3 |
| Coleta | data_prevista/confirmada/meta_coleta_pedido | 3 |
| Consolidacao | data_consolidacao_pedido | 1 |
| Transferencia | data_transferencia_saldo_pedido | 1 |
| Rascunho Pedido — Recebimento | data_prevista/confirmada/meta_recebimento_rascunho_pedido | 3 |
| Rascunho Pedido — Aprovacao | data_prevista/confirmada/meta_aprovacao_rascunho_pedido | 3 |
| Documento Pedido | data_documento_pedido | 1 |
| Proforma — Receb. Rascunho | data_prevista/confirmada/meta_recebimento_rascunho_proforma | 3 |
| Proforma — Aprov. Rascunho | data_prevista/confirmada/meta_aprovacao_rascunho_proforma | 3 |
| Proforma — Envio Original | data_prevista/confirmada/meta_envio_original_proforma | 3 |
| Proforma — Receb. Original | data_prevista/confirmada/meta_recebimento_original_proforma | 3 |
| Documento Proforma | data_proforma_invoice | 1 |
| Invoice — Receb. Rascunho | data_prevista/confirmada/meta_recebimento_rascunho_invoice | 3 |
| Invoice — Aprov. Rascunho | data_prevista/confirmada/meta_aprovacao_rascunho_invoice | 3 |
| Invoice — Envio Original | data_prevista/confirmada/meta_envio_original_invoice | 3 |
| Invoice — Receb. Original | data_prevista/confirmada/meta_recebimento_original_invoice | 3 |
| Documento Invoice | data_invoice | 1 |

**Passos por data:**
1. Scroll horizontal ate a coluna de data
2. Clicar na celula (pode mostrar "—" se vazia) → popover com datepicker
3. Selecionar data 15/06/2026
4. Confirmar → celula exibe "15/06/2026"
5. Recarregar → valor persiste

---

### FLUXO 3 — Campos calculados PAI: NAO editaveis (bloqueados)

**Categoria:** Validacao de bloqueio
**Casos:** 10

| Passo | Coluna | Tipo | Verificacao |
|-------|--------|------|-------------|
| 3.1 | `valor_total_pedido` | calculado | Clicar → nenhum popover abre |
| 3.2 | `valor_item` | calculado | Clicar → nenhum popover |
| 3.3 | `quantidade_total_pedido` | calculado | Clicar → nenhum popover |
| 3.4 | `quantidade_pronta_itens_pedido_total` | calculado | Clicar → nenhum popover |
| 3.5 | `quantidade_transferida_total` | calculado | Clicar → nenhum popover |
| 3.6 | `quantidade_cancelada_total_pedido` | calculado | Clicar → nenhum popover |
| 3.7 | `peso_liquido_total_pedido` | calculado | Clicar → nenhum popover |
| 3.8 | `peso_bruto_total_pedido` | calculado | Clicar → nenhum popover |
| 3.9 | `cubagem_total_pedido` | calculado | Clicar → nenhum popover |
| 3.10 | `saldo_itens_do_pedido` | saldo | Clicar → nenhum popover |

Verificar tooltip "Calculado a partir dos itens" (se implementado).

---

### FLUXO 4 — Campos somente_leitura PAI: NAO editaveis

**Categoria:** Validacao de bloqueio
**Casos:** 6

| Passo | Coluna | Verificacao |
|-------|--------|-------------|
| 4.1 | `status` | Clicar → nenhum popover (getEditavel = false no PAI) |
| 4.2 | `pais_exportador` | Clicar → nenhum popover |
| 4.3 | `estado_exportador` | Clicar → nenhum popover |
| 4.4 | `cidade_exportador` | Clicar → nenhum popover |
| 4.5 | `endereco_exportador` | Clicar → nenhum popover |
| 4.6 | `zip_code_exportador` | Clicar → nenhum popover |

---

### FLUXO 5 — Edicao condicional: nome_exportador e nome_importador

**Categoria:** Logica condicional por tipo_operacao
**Casos:** 4

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 5.1 | Localizar pedido com tipo_operacao='importacao', clicar nome_exportador | Popover ABRE → editar → salvar → persistencia | 01_exportador_importacao |
| 5.2 | No MESMO pedido importacao, clicar nome_importador | Popover NAO abre | 02_importador_bloqueado |
| 5.3 | Localizar pedido com tipo_operacao='exportacao', clicar nome_importador | Popover ABRE → editar → salvar → persistencia | 03_importador_exportacao |
| 5.4 | No MESMO pedido exportacao, clicar nome_exportador | Popover NAO abre | 04_exportador_bloqueado |

---

### FLUXO 6 — Propagacao: checkbox "Aplicar a todos os itens deste pedido"

**Categoria:** Propagacao + Checkbox + Persistencia
**Casos:** 8

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 6.1 | Expandir pedido para ver itens atuais → anotar valores | Valores anotados | 05_itens_antes |
| 6.2 | Clicar em campo propagavel (incoterm) na linha PAI | Popover abre COM checkbox "Aplicar a todos os itens" | 06_popover_checkbox |
| 6.3 | **COM checkbox marcado** + editar valor + Confirmar | Salva | |
| 6.4 | Expandir → verificar TODOS itens com valor novo | Todos alinhados ao pai | 07_itens_propagados |
| 6.5 | Recarregar → propagacao persistida | Persistencia confirmada | |
| 6.6 | Clicar em campo propagavel, **SEM marcar checkbox** + editar + Confirmar | Apenas pedido muda | 08_sem_propagacao |
| 6.7 | Expandir → itens mantêm valores originais | Isolamento confirmado | 09_itens_originais |
| 6.8 | Clicar em campo SEM par no MAPA_PROPAGACAO (numero_pedido) | Popover NÃO exibe checkbox | 10_sem_checkbox |

**Campos propagaveis (com checkbox):** incoterm, moeda, condicao_pagamento, casas_decimais_valor/quantidade/peso/cubagem, cobertura_cambial, referencia_importador/exportador/fabricante, todas as 47 datas
**Campos SEM propagacao (sem checkbox):** numero_pedido, valor_total_pedido, quantidade_volumes_pedido, saldo, calculados

---

### FLUXO 7 — Edicao de item FILHO: campos calculados editaveis no item

**Categoria:** CRUD + Inline Edit (nivel item)
**Casos:** 12

| Passo | Coluna | Tipo no PAI | Editavel ITEM | Verificacao |
|-------|--------|-------------|---------------|-------------|
| 7.1 | `valor_total_item` | calculado | **SIM** | Expandir → clicar → popover abre → editar → salvar |
| 7.2 | `quantidade_inicial_pedido` | calculado | **SIM** | Popover abre → editar → salvar |
| 7.3 | `quantidade_pronta_itens_pedido_total` | calculado | **SIM** | Popover abre → editar → salvar |
| 7.4 | `peso_liquido_total_pedido` | calculado | **SIM** | Popover abre → editar → salvar |
| 7.5 | `peso_bruto_total_pedido` | calculado | **SIM** | Popover abre → editar → salvar |
| 7.6 | `cubagem_total_pedido` | calculado | **SIM** | Popover abre → editar → salvar |
| 7.7 | `status` | somente_leitura | **SIM** (override) | Select dropdown → salvar |
| 7.8 | `saldo_itens_do_pedido` | saldo | **NAO** | Clicar → nenhum popover |
| 7.9 | `quantidade_transferida_total` | calculado | **NAO** (override) | Clicar → nenhum popover |
| 7.10 | `quantidade_cancelada_total_pedido` | calculado | **NAO** (override) | Clicar → nenhum popover |
| 7.11 | `pais_exportador` | somente_leitura | **NAO** | Clicar → nenhum popover |
| 7.12 | Recarregar → valores persistidos, aggregates recalculados no PAI | | |

---

### FLUXO 8 — Edicao de item individual: isolamento de outros itens

**Categoria:** Isolamento + CRUD
**Casos:** 6

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 8.1 | Expandir pedido com 3+ itens → anotar valores de todos | Valores anotados | 11_itens_antes_edicao |
| 8.2 | Editar ncm do 2o item → salvar | Apenas 2o item muda | |
| 8.3 | Verificar 1o e 3o itens mantêm ncm original | Isolamento confirmado | 12_isolamento_itens |
| 8.4 | Verificar pedido pai NAO alterado | Pai intacto | |
| 8.5 | Editar part_number do 3o item → salvar | Apenas 3o muda | |
| 8.6 | Editar moeda_item do 1o item → salvar | Apenas 1o muda, aggregate recalculado | |

---

### FLUXO 9 — Divergencia pai/filho: icone amarelo apos edicao

**Categoria:** Alertas + UX
**Casos:** 8

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 9.1 | Expandir pedido → editar ncm de 1 item com valor diferente do PAI → salvar | Item salvo | |
| 9.2 | Colapsar pedido → verificar icone amarelo na coluna ncm da linha PAI | Icone amarelo visivel | 13_divergencia_ncm |
| 9.3 | Repetir para incoterm: editar 1 item com incoterm diferente | Icone amarelo no PAI | 14_divergencia_incoterm |
| 9.4 | Repetir para moeda_item: editar moeda de 1 item | Icone amarelo no PAI | 15_divergencia_moeda |
| 9.5 | Propagar valor do PAI com checkbox → icone amarelo desaparece | Itens alinhados | 16_divergencia_resolvida |
| 9.6 | Editar TODOS os itens com MESMO valor (=PAI) → icone desaparece | Alinhamento manual | |
| 9.7 | Verificar tooltip do icone amarelo | Info sobre divergencia | |
| 9.8 | Unidades mistas entre itens → icone na coluna de quantidade | Heterogeneidade detectada | |

---

### FLUXO 10 — Formatacao numerica brasileira

**Categoria:** UX/Visual
**Casos:** 8

| Passo | Verificacao | Screenshot |
|-------|-------------|------------|
| 10.1 | valor_total_pedido exibe "274.519,34" (ponto milhar, virgula decimal) | 17_formato_numero |
| 10.2 | Badge de moeda ao lado do valor (USD azul, EUR verde, BRL amarelo) | 18_badge_moeda |
| 10.3 | Quantidades com casas decimais da config do workspace | |
| 10.4 | Pesos com formato brasileiro | |
| 10.5 | Editar valor numerico → digitar "1234.56" → celula exibe "1.234,56" | 19_edicao_numero |
| 10.6 | Valores zero exibem "0,00" (nao vazio) | |
| 10.7 | Valores null exibem "—" (travessao) | |
| 10.8 | Cubagem com formato brasileiro | |

---

### FLUXO 11 — Truncamento de texto: 50 chars + "…" + Eye + tooltip

**Categoria:** UX/Visual
**Casos:** 6

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 11.1 | Localizar pedido com referencia_importador > 50 chars | Celula mostra texto truncado + "…" + icone Eye | 20_truncamento |
| 11.2 | Hover sobre a celula/Eye | Tooltip exibe texto completo | 21_tooltip_completo |
| 11.3 | Localizar pedido com nome_fabricante <= 50 chars | Texto completo sem truncamento | |
| 11.4 | Localizar pedido com campo vazio | Exibe "—" (travessao) | |
| 11.5 | Editar campo truncado → popover mostra valor completo | Input com texto inteiro | 22_edicao_truncado |
| 11.6 | ColunasFilho: item com descricao > 50 chars | Truncamento identico ao pai | |

---

### FLUXO 12 — Valores vazios: travessao "—" consistente

**Categoria:** UX/Visual
**Casos:** 5

| Passo | Campo | Verificacao |
|-------|-------|-------------|
| 12.1 | Campo texto null | Exibe "—" (em-dash, U+2014) |
| 12.2 | Campo numerico null | Exibe "—" |
| 12.3 | Campo data null | Exibe "—" |
| 12.4 | Campo moeda null | Exibe "—" (sem badge) |
| 12.5 | Clicar no "—" de campo editavel | Popover abre com input vazio |

---

### FLUXO 13 — Deep-links: Importador/Exportador navegam ao Configurador

**Categoria:** Navegacao
**Casos:** 4

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 13.1 | Localizar badge de Importador na coluna nome_importador | Badge clicavel visivel | |
| 13.2 | Clicar no badge → navega para Configurador | URL: /workspace/empresas-e-parceiros com retorno= | 23_deep_link |
| 13.3 | Clicar "Voltar" ou usar retorno → volta para Lista | Filtros preservados | |
| 13.4 | Repetir para badge de Exportador | Mesma navegacao | |

---

### FLUXO 14 — Cancelar edicao: Esc ou botao Cancelar preserva valor original

**Categoria:** Rollback + UX
**Casos:** 5

| Passo | Acao | Resultado Esperado |
|-------|------|-------------------|
| 14.1 | Clicar na celula editavel → popover abre | Popover visivel |
| 14.2 | Alterar valor no input | Valor modificado no popover |
| 14.3 | Pressionar Esc → popover fecha | Celula mostra valor ORIGINAL |
| 14.4 | Repetir: clicar botao Cancelar (X) → popover fecha | Valor original preservado |
| 14.5 | Nenhuma requisicao PUT/PATCH enviada ao backend | Network tab limpa |

---

### FLUXO 15 — Erro ao salvar: rollback visual e notificacao

**Categoria:** Estados de erro
**Casos:** 4

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 15.1 | Editar campo com valor que o backend rejeita | Erro retornado | |
| 15.2 | Verificar flash vermelho na celula (1000ms) | Flash visivel | 24_erro_flash |
| 15.3 | Valor volta ao original (rollback) | Valor restaurado | |
| 15.4 | Notificacao toast com mensagem amigavel (sem stack trace) | Toast vermelho | 25_erro_toast |

---

### FLUXO 16 — Aggregates atualizados apos edicao de item

**Categoria:** Recalculo automatico
**Casos:** 6

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 16.1 | Anotar valor_total_pedido do PAI | Valor base | |
| 16.2 | Expandir → editar valor_total_item do 1o item (aumentar) → salvar | Valor alterado | |
| 16.3 | Verificar valor_total_pedido do PAI recalculado (soma dos itens) | Novo total | 26_aggregate |
| 16.4 | Editar moeda de 1 item para EUR (outros em USD) → salvar | Moedas mistas | |
| 16.5 | Verificar valor_total_pedido do PAI mostra "—" ou indicacao de moedas mistas | Regra de homogeneidade | 27_moedas_mistas |
| 16.6 | Editar todas as moedas para USD → valor_total_pedido volta a somar | Homogeneidade restaurada | |

---

### FLUXO 17 — Edicao de status do item: cascade para pedido e todos os itens

**Categoria:** Status + Cascade
**Casos:** 4

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 17.1 | Expandir pedido → clicar em status do 1o item → select | Dropdown de status | 28_status_select |
| 17.2 | Selecionar "consolidado" → confirmar | Status alterado | |
| 17.3 | Verificar TODOS os itens mudaram para "consolidado" | Cascade confirmado | 29_status_cascade |
| 17.4 | Verificar pedido PAI mudou para "consolidado" com badge de cor | Badge atualizado | |

---

### FLUXO 18 — Permissao de edicao: sem permissao, celulas bloqueadas

**Categoria:** Seguranca + Permissoes
**Casos:** 3

| Passo | Acao | Resultado Esperado | Screenshot |
|-------|------|--------------------|------------|
| 18.1 | Logar com usuario sem permissao de edicao | Login com usuario restrito | |
| 18.2 | Clicar em celula alfanumerica editavel | Nenhum popover abre | 30_sem_permissao |
| 18.3 | Verificar tooltip "Sem permissao para editar" (se implementado) | Tooltip ou cursor padrao | |

---

## Categorias do QA Cobertas

| # | Categoria | Status | Fluxos |
|---|-----------|--------|--------|
| 1 | Operacoes CRUD | COBERTO | 1, 2, 7, 8 |
| 2 | Filtros e Busca | N/A | Edicao inline, nao usa filtros |
| 3 | Selects e Dropdowns | COBERTO | 1 (tipo_operacao, incoterm), 17 (status) |
| 4 | Importacao e Exportacao | N/A | |
| 5 | Navegacao e Layout | COBERTO | 13 (deep-links) |
| 6 | Modais e Formularios | COBERTO | 1-2 (popover = mini-modal) |
| 7 | Estados de Interface | COBERTO | 14 (cancelar), 15 (erro), 12 (vazio) |
| 8 | Operacoes em Massa | N/A | Ver plano de edicao-em-massa separado |
| 9 | Visualizacoes | COBERTO | 10 (formato), 11 (truncamento), 9 (divergencia) |
| 10 | Validacao Visual (Percy) | COBERTO | Screenshots numerados |
| 11 | Testes Especificos | COBERTO | 5 (condicional), 6 (propagacao), 16 (aggregates), 18 (permissao) |

---

## Validacao Visual com Percy

| Screenshot | Descricao |
|------------|-----------|
| percy_01_popover_texto | Popover de edicao de campo texto |
| percy_02_popover_datepicker | Popover de edicao de data |
| percy_03_popover_select | Popover com select (tipo_operacao) |
| percy_04_popover_checkbox | Popover com checkbox "Aplicar a todos" |
| percy_05_flash_sucesso | Flash verde 600ms na celula |
| percy_06_flash_erro | Flash vermelho 1000ms na celula |
| percy_07_divergencia_icone | Icone amarelo de divergencia no PAI |
| percy_08_truncamento_eye | Texto truncado + Eye + tooltip |
| percy_09_travessao | Celula com "—" para valor null |
| percy_10_formato_numerico | Numero brasileiro 274.519,34 + badge moeda |

---

## Estrutura de Arquivos Esperada

```
testes/testes-e2e/pedido/Lista/editar-salvar/
├── editar-salvar-e2e.md                             ← este plano
├── TST-E2E-PEDIDO-EDITAR-SALVAR-001.spec.ts         ← Fluxos 1-6 (PAI: alfanumericos, datas, bloqueados, condicional, propagacao)
├── TST-E2E-PEDIDO-EDITAR-SALVAR-ITENS-002.spec.ts   ← Fluxos 7-8 (ITEM: calculados editaveis, isolamento)
├── TST-E2E-PEDIDO-EDITAR-SALVAR-UX-003.spec.ts      ← Fluxos 9-13 (divergencia, formato, truncamento, vazios, deep-links)
└── TST-E2E-PEDIDO-EDITAR-SALVAR-EDGE-004.spec.ts    ← Fluxos 14-18 (cancelar, erro, aggregates, status, permissao)
```

**Total de passos:** ~161
**Total de verificacoes de coluna:** 80 PAI + 12 ITEM = 92 (nivel celula-a-celula)
