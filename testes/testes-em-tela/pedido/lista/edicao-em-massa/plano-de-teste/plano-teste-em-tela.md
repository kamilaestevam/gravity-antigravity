# Plano de Teste em Tela — Edição em Massa (Pedido / Lista)

- **ID do plano:** TST-EMT-PEDIDO-LISTA-EDICAO-EM-MASSA-000081
- **Tipo:** EMT (Teste em Tela)
- **Produto / Local / Sublocal:** Pedido / Lista / edicao-em-massa
- **Componentes:** `ModalPedidosEdicaoMassa.tsx` (front) + `edicaoEmMassaService.ts` (back) + SSOT `camposEdicaoMassa.ts`
- **Cobertura:** 111 campos de Pedido + 55 campos de Item = **166 campos do sistema** + **8 tipos de colunas manuais do usuário**
- **Runner:** `run-lista-edicao-em-massa.ts` (mesma pasta)
- **Gerado por:** `gerar-plano-edicao-em-massa.ts` — NÃO editar as tabelas de campos à mão; regenerar a partir do SSOT.

---

## REGRAS-MESTRE (valem para TODAS as etapas)

1. **Anti-viés 50/50** — os campos alternam estado inicial: ímpares partem de valor **vazio** (preencher) e pares partem de valor **pré-preenchido** (substituir). Nunca testar todos os campos no mesmo estado.
2. **Pedido-alvo** — usar o pedido com **maior quantidade de itens** da lista (maximiza propagação/cascade). Anotar o número do pedido no relatório.
3. **Tipos de operação** — garantir na preparação pelo menos **1 pedido de Importação e 1 de Exportação** no workspace de teste.
4. **Validação tripla por campo** — (a) preview de→para correto no passo «Revisar alterações»; (b) valor aplicado visível na lista; (c) valor persiste após recarregar a página (F5).
5. **UX intacta** — o modal mantém os 3 passos (Campos → Revisão → Resultado), os 3 níveis (Combinado / Pedido / Item), o combobox com busca e o botão «Adicionar campo». Qualquer regressão visual reprova a etapa.
6. **Print padrão** — `NN-<slug>-selecao.png` e `NN-<slug>-resultado.png` na pasta de resultado da execução.
7. **Falha não bloqueia** — exceção em um campo reprova apenas aquela linha; o runner continua nos demais campos (relatório `EMT_ROW` por linha).

---

### ETAPA 0 — PREPARAÇÃO DO AMBIENTE

| # | Passo | Verificação |
|---|-------|-------------|
| 0.1 | Login Clerk no ambiente alvo e entrada no workspace de teste | Lista de pedidos carrega com linhas editáveis |
| 0.2 | Varredura da lista: identificar o pedido com maior nº de itens (pedido-alvo) | rowId e número do pedido anotados no relatório |
| 0.3 | Confirmar existência de pedido de Importação e de Exportação | Ambos os tipos presentes (criar/converter se faltar) |
| 0.4 | Print do estado inicial da lista | `00-estado-inicial.png` |

### ETAPA 1 — ABERTURA E UX DO MODAL

| # | Passo | Verificação |
|---|-------|-------------|
| 1.1 | Selecionar o pedido-alvo pelo checkbox da linha pai | Checkbox marcado; barra mostra contagem |
| 1.2 | Clicar no botão «Edição em Massa» da barra | Modal abre com título «Editar em Massa (1 pedido selecionado)» |
| 1.3 | Validar os 3 passos no stepper (Campos / Revisão / Resultado) | Stepper visível com passo 1 ativo |
| 1.4 | Validar o toggle de nível com 3 opções (Combinado / Pedido / Item) | 3 botões presentes; Combinado ativo por padrão |
| 1.5 | Abrir o combobox de campos e validar busca + agrupamento por grupo DDD | Grupos visíveis; busca filtra; contador de campos correto |
| 1.6 | Print do modal aberto | `01-modal-aberto.png` |

### ETAPA 2 — GUARD-RAIL DE DRIFT (paridade com SSOT)

| # | Passo | Verificação |
|---|-------|-------------|
| 2.1 | Nível **Pedido**: contar os campos do combobox | = 111 campos do sistema (+ colunas do usuário escopo pedido, se houver) |
| 2.2 | Nível **Item**: contar os campos do combobox | = 55 campos do sistema (+ colunas do usuário escopo item, se houver) |
| 2.3 | Confirmar que NENHUM campo bloqueado aparece no combobox | undefined bloqueados de pedido e undefined de item ausentes |
| 2.4 | Conferir bloqueados de pedido: `valor_total_pedido`, `quantidade_total_pedido`, `peso_liquido_total_pedido`, `peso_bruto_total_pedido`, `cubagem_total_pedido`, `id_pedido`, `id_organizacao`, `id_workspace`, `id_status_pedido`, `data_criacao_pedido`, `data_atualizacao_pedido`, `data_exclusao_pedido`, `data_consolidacao_pedido`, `ids_origem_consolidacao_pedido` | Nenhum listado |
| 2.5 | Conferir bloqueados de item: `valor_total_item`, `quantidade_atual_item`, `quantidade_transferida_item`, `id_item`, `id_organizacao`, `id_workspace`, `id_pedido`, `data_criacao_item`, `data_atualizacao_item`, `data_exclusao_item` | Nenhum listado |
| 2.6 | Print dos comboboxes dos 2 níveis | `02-combobox-pedido.png`, `02-combobox-item.png` |


---

## CAMPOS DE PEDIDO — campo a campo

### ETAPA 3 — PEDIDO · GRUPO «IDENTIFICACAO» (3 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 1 | `numero_pedido` | Numero do Pedido | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 2 | `tipo_operacao_pedido` | Tipo de Operacao | Seleção (dropdown com busca) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 3 | `status_pedido` | Status do Pedido | Seleção (dropdown com busca) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 4 — PEDIDO · GRUPO «EXPORTADOR» (13 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 4 | `nome_exportador` | Exportador — Nome | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 5 | `endereco_exportador` | Exportador — Endereco | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 6 | `pais_exportador` | Exportador — Pais | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 7 | `estado_exportador` | Exportador — Estado | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 8 | `cidade_exportador` | Exportador — Cidade | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 9 | `zip_code_exportador` | Exportador — ZIP Code | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 10 | `exportador_ou_fabricante` | Exportador ou Fabricante | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 11 | `relacao_exportador_fabricante` | Relacao Export./Fabric. | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 12 | `nome_contato_exportador` | Contato Export. — Nome | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 13 | `email_contato_exportador` | Contato Export. — Email | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 14 | `whatsapp_contato_exportador` | Contato Export. — WhatsApp | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 15 | `cargo_contato_exportador` | Contato Export. — Cargo | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 16 | `departamento_contato_exportador` | Contato Export. — Depto. | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 5 — PEDIDO · GRUPO «IMPORTADOR» (2 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 17 | `nome_importador` | Importador — Nome | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 18 | `cnpj_importador_pedido` | Importador — CNPJ | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 6 — PEDIDO · GRUPO «FABRICANTE» (6 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 19 | `nome_fabricante` | Fabricante — Nome | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 20 | `endereco_fabricante` | Fabricante — Endereco | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 21 | `pais_fabricante` | Fabricante — Pais | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 22 | `estado_fabricante` | Fabricante — Estado | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 23 | `cidade_fabricante` | Fabricante — Cidade | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 24 | `zip_code_fabricante` | Fabricante — ZIP Code | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 7 — PEDIDO · GRUPO «DOCUMENTOS» (5 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 25 | `referencia_importador_pedido` | Referencia Importador | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 26 | `referencia_exportador_pedido` | Referencia Exportador | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 27 | `numero_proforma_pedido` | No Proforma | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 28 | `numero_invoice_pedido` | No Invoice | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 29 | `referencia_fabricante_pedido` | Referencia Fabricante | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 8 — PEDIDO · GRUPO «OPE» (12 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 30 | `codigo_ope` | OPE — Codigo | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 31 | `nome_ope` | OPE — Nome | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 32 | `endereco_ope` | OPE — Endereco | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 33 | `pais_ope` | OPE — Pais | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 34 | `estado_ope` | OPE — Estado | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 35 | `cidade_ope` | OPE — Cidade | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 36 | `zip_code_ope` | OPE — ZIP Code | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 37 | `tin_ope` | OPE — TIN | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 38 | `email_ope` | OPE — Email | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 39 | `situacao_ope` | OPE — Situacao | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 40 | `versao_ope` | OPE — Versao | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 41 | `cnpj_raiz_empresa_responsavel` | CNPJ Raiz Empresa Responsavel | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 9 — PEDIDO · GRUPO «COMERCIAL» (9 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 42 | `incoterm_pedido` | Incoterm | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 43 | `moeda_pedido` | Moeda do Pedido | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 44 | `unidade_comercializada_pedido` | Unidade Comercializada do Pedido | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 45 | `condicao_pagamento_pedido` | Condicao de Pagamento — Comercial | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 46 | `condicao_pagamento_siscomex_pedido` | Condicao de Pagamento — Siscomex | Seleção (dropdown com busca) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 47 | `tipo_volume_pedido` | Tipo Volume Pedido | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 48 | `quantidade_volumes_pedido` | Qtd. de Volumes | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 49 | `tipo_volume_item` | Tipo Volume Item | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 50 | `cobertura_cambial_pedido` | Cobertura Cambial | Seleção (dropdown com busca) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 10 — PEDIDO · GRUPO «CAMBIO» (4 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 51 | `valor_total_cambio_pedido` | Valor Total Cambio | Numérico | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 52 | `moeda_cambio_pedido` | Moeda Cambio | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 53 | `taxa_cambio_estimada_pedido` | Taxa Cambio Estimada | Numérico | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 54 | `contrato_cambio_id_pedido` | Contrato de Cambio (ID) | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 11 — PEDIDO · GRUPO «LOGISTICA» (7 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 55 | `porto_origem` | Porto de Origem | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 56 | `porto_destino` | Porto de Destino | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 57 | `local_de_origem` | País origem | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 58 | `local_de_destino` | País destino | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 59 | `aeroporto_origem` | Aeroporto de Origem | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 60 | `aeroporto_destino` | Aeroporto de Destino | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 61 | `data_embarque_origem` | Data de Embarque na Origem | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 12 — PEDIDO · GRUPO «DATAS» (14 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 62 | `data_emissao_pedido` | Data de Emissao | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 63 | `data_documento_pedido` | Data do Documento | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 64 | `data_documento_proforma_pedido` | Data do Documento Proforma | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 65 | `data_documento_invoice_pedido` | Data do Documento Invoice | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 66 | `data_prevista_pedido_pronto` | Data Prevista — Pedido Pronto | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 67 | `data_confirmada_pedido_pronto` | Data Confirmada — Pedido Pronto | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 68 | `data_meta_pedido_pronto` | Data Meta — Pedido Pronto | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 69 | `data_prevista_inspecao_pedido` | Data Prevista — Inspecao | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 70 | `data_confirmada_inspecao_pedido` | Data Confirmada — Inspecao | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 71 | `data_meta_inspecao_pedido` | Data Meta — Inspecao | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 72 | `data_prevista_coleta_pedido` | Data Prevista — Coleta | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 73 | `data_confirmada_coleta_pedido` | Data Confirmada — Coleta | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 74 | `data_meta_coleta_pedido` | Data Meta — Coleta | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 75 | `data_transferencia_saldo_pedido` | Data de Transferencia de Saldo | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 13 — PEDIDO · GRUPO «DATAS DRAFT PEDIDO» (6 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 76 | `data_previsao_recebimento_rascunho_pedido` | Draft Pedido — Prev. Recebimento | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 77 | `data_confirmacao_recebimento_rascunho_pedido` | Draft Pedido — Conf. Recebimento | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 78 | `data_meta_recebimento_rascunho_pedido` | Draft Pedido — Meta Recebimento | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 79 | `data_previsao_aprovacao_rascunho_pedido` | Draft Pedido — Prev. Aprovacao | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 80 | `data_confirmacao_aprovacao_rascunho_pedido` | Draft Pedido — Conf. Aprovacao | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 81 | `data_meta_aprovacao_rascunho_pedido` | Draft Pedido — Meta Aprovacao | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 14 — PEDIDO · GRUPO «DATAS DRAFT PROFORMA» (13 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 82 | `data_previsao_recebimento_rascunho_proforma_pedido` | Draft Proforma — Prev. Recebimento | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 83 | `data_confirmacao_recebimento_rascunho_proforma_pedido` | Draft Proforma — Conf. Recebimento | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 84 | `data_meta_recebimento_rascunho_proforma_pedido` | Draft Proforma — Meta Recebimento | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 85 | `data_previsao_aprovacao_rascunho_proforma_pedido` | Draft Proforma — Prev. Aprovacao | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 86 | `data_confirmacao_aprovacao_rascunho_proforma_pedido` | Draft Proforma — Conf. Aprovacao | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 87 | `data_meta_aprovacao_rascunho_proforma_pedido` | Draft Proforma — Meta Aprovacao | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 88 | `data_previsao_envio_original_proforma_pedido` | Original Proforma — Prev. Envio | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 89 | `data_confirmacao_envio_original_proforma_pedido` | Original Proforma — Conf. Envio | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 90 | `data_meta_envio_original_proforma_pedido` | Original Proforma — Meta Envio | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 91 | `data_previsao_recebimento_original_proforma_pedido` | Original Proforma — Prev. Recebimento | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 92 | `data_confirmacao_recebimento_original_proforma_pedido` | Original Proforma — Conf. Recebimento | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 93 | `data_meta_recebimento_original_proforma_pedido` | Original Proforma — Meta Recebimento | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 94 | `data_proforma_invoice` | Data da Proforma Invoice | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 15 — PEDIDO · GRUPO «DATAS DRAFT INVOICE» (13 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 95 | `data_previsao_recebimento_rascunho_invoice_pedido` | Draft Invoice — Prev. Recebimento | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 96 | `data_confirmacao_recebimento_rascunho_invoice_pedido` | Draft Invoice — Conf. Recebimento | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 97 | `data_meta_recebimento_rascunho_invoice_pedido` | Draft Invoice — Meta Recebimento | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 98 | `data_previsao_aprovacao_rascunho_invoice_pedido` | Draft Invoice — Prev. Aprovacao | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 99 | `data_confirmacao_aprovacao_rascunho_invoice_pedido` | Draft Invoice — Conf. Aprovacao | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 100 | `data_meta_aprovacao_rascunho_invoice_pedido` | Draft Invoice — Meta Aprovacao | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 101 | `data_previsao_envio_original_invoice_pedido` | Original Invoice — Prev. Envio | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 102 | `data_confirmacao_envio_original_invoice_pedido` | Original Invoice — Conf. Envio | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 103 | `data_meta_envio_original_invoice_pedido` | Original Invoice — Meta Envio | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 104 | `data_previsao_recebimento_original_invoice_pedido` | Original Invoice — Prev. Recebimento | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 105 | `data_confirmacao_recebimento_original_invoice_pedido` | Original Invoice — Conf. Recebimento | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 106 | `data_meta_recebimento_original_invoice_pedido` | Original Invoice — Meta Recebimento | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 107 | `data_invoice` | Data da Invoice | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 16 — PEDIDO · GRUPO «FINANCEIRO» (1 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 108 | `casas_decimais_valor_pedido` | Casas Decimais — Valor | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 17 — PEDIDO · GRUPO «FISICO» (3 campos)

Nível do modal: **Pedido**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 109 | `casas_decimais_quantidade_pedido` | Casas Decimais — Qtd. | Numérico | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 110 | `casas_decimais_peso_pedido` | Casas Decimais — Peso | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 111 | `casas_decimais_cubagem_pedido` | Casas Decimais — Cubagem | Numérico | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |


---

## CAMPOS DE ITEM — campo a campo

### ETAPA 18 — ITEM · GRUPO «PRODUTO» (15 campos)

Nível do modal: **Item**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 112 | `sequencia_item_pedido` | Sequencia do Item | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 113 | `part_number_item` | Part Number | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 114 | `ncm_item` | NCM | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 115 | `descricao_item` | Descricao do Item | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 116 | `unidade_comercializada_item` | Unidade Comercializada do Item | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 117 | `tipo_operacao_item` | Tipo de Operacao (Item) | Seleção (dropdown com busca) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 118 | `descricao_completa_item_pt` | Descricao Completa (PT) | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 119 | `descricao_completa_item_en` | Descricao Completa (EN) | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 120 | `descricao_completa_item_es` | Descricao Completa (ES) | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 121 | `descricao_completa_item_nf` | Descricao Completa (NF) | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 122 | `texto_posicao_ncm` | Texto Posicao NCM | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 123 | `grupo_item` | Grupo do Item | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 124 | `subgrupo_item` | Subgrupo do Item | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 125 | `campo_especial_item` | Campo Especial do Item | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 126 | `atributos_catalogo` | Atributos de Catalogo | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 19 — ITEM · GRUPO «QUANTIDADES» (4 campos)

Nível do modal: **Item**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 127 | `quantidade_inicial_item` | Qtd. Inicial | Numérico | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 128 | `quantidade_pronta_item` | Qtd. Pronta Total | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 129 | `quantidade_cancelada_item` | Qtd. Cancelada | Numérico | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 130 | `casas_decimais_quantidade_item` | Casas Decimais — Qtd. | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 20 — ITEM · GRUPO «FINANCEIRO» (3 campos)

Nível do modal: **Item**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 131 | `moeda_item` | Moeda do Item | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 132 | `valor_por_unidade_item` | Valor por Unidade | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 133 | `casas_decimais_valor_item` | Casas Decimais — Valor | Numérico | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 21 — ITEM · GRUPO «CAMBIO» (1 campos)

Nível do modal: **Item**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 134 | `cobertura_cambial_item` | Cobertura Cambial | Seleção (dropdown com busca) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 22 — ITEM · GRUPO «COMERCIAL» (3 campos)

Nível do modal: **Item**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 135 | `condicao_pagamento_siscomex_item` | Condicao de Pagamento — Siscomex | Seleção (dropdown com busca) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 136 | `incoterm_item` | Incoterm (Item) | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 137 | `condicao_pagamento_item` | Condicao de Pagamento — Comercial (Item) | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 23 — ITEM · GRUPO «PARTES» (3 campos)

Nível do modal: **Item**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 138 | `nome_exportador_item` | Exportador (Item) | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 139 | `nome_importador_item` | Importador (Item) | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 140 | `nome_fabricante_item` | Fabricante (Item) | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 24 — ITEM · GRUPO «DOCUMENTOS» (9 campos)

Nível do modal: **Item**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 141 | `referencia_importador_item` | Referencia Importador (Item) | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 142 | `referencia_exportador_item` | Referencia Exportador (Item) | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 143 | `referencia_fabricante_item` | Referencia Fabricante (Item) | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 144 | `numero_proforma_item` | No Proforma (Item) | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 145 | `numero_invoice_item` | No Invoice (Item) | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 146 | `tipo_embalagem` | Tipo de Embalagem | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 147 | `numero_lpco` | No LPCO | Texto livre | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 148 | `numero_certificado_origem` | No Certificado de Origem | Texto livre | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 149 | `data_certificado_origem` | Data Certificado de Origem | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 25 — ITEM · GRUPO «FISICO» (5 campos)

Nível do modal: **Item**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 150 | `peso_liquido_unitario_item` | Peso Liquido Unitario | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 151 | `peso_bruto_unitario_item` | Peso Bruto Unitario | Numérico | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 152 | `cubagem_unitaria_item` | Cubagem Unitaria | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 153 | `casas_decimais_peso_item` | Casas Decimais — Peso | Numérico | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 154 | `casas_decimais_cubagem_item` | Casas Decimais — Cubagem | Numérico | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |

### ETAPA 26 — ITEM · GRUPO «DATAS» (12 campos)

Nível do modal: **Item**. Para cada campo da tabela: abrir o modal de Edição em Massa com o pedido-alvo selecionado, selecionar o campo no combobox, informar o valor conforme o estado inicial exigido, avançar para «Revisar alterações», validar o de→para no preview, clicar «Aplicar em Massa», aguardar «Aplicado» e validar resultado na lista.

Prints obrigatórios por campo: `NN-<campo>-selecao.png` (passo 1 preenchido) e `NN-<campo>-resultado.png` (lista após aplicar).

| # | Campo (DDD) | Rótulo | Tipo de input | Estado inicial exigido | Verificações |
|---|-------------|--------|---------------|------------------------|--------------|
| 155 | `data_emissao_item` | Data de Emissao (Item) | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 156 | `data_consolidacao_item` | Data de Consolidacao (Item) | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 157 | `data_embarque_item` | Data de Embarque (Item) | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 158 | `data_prevista_item_pronto` | Data Prevista — Item Pronto | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 159 | `data_confirmada_item_pronto` | Data Confirmada — Item Pronto | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 160 | `data_meta_item_pronto` | Data Meta — Item Pronto | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 161 | `data_prevista_inspecao_item` | Data Prevista — Inspecao (Item) | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 162 | `data_confirmada_inspecao_item` | Data Confirmada — Inspecao (Item) | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 163 | `data_meta_inspecao_item` | Data Meta — Inspecao (Item) | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 164 | `data_prevista_coleta_item` | Data Prevista — Coleta (Item) | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 165 | `data_confirmada_coleta_item` | Data Confirmada — Coleta (Item) | Data (date picker) | Campo **pré-preenchido** antes da edição → substituir por valor novo | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |
| 166 | `data_meta_coleta_item` | Data Meta — Coleta (Item) | Data (date picker) | Campo **vazio** antes da edição → preencher | Preview no-passo Revisão mostra de→para correto; após Aplicar, valor visível na lista e persistido após F5 |


---

### ETAPA 27 — NÍVEL COMBINADO + CASCADE

| # | Passo | Verificação |
|---|-------|-------------|
| 27.1 | Nível **Combinado**: editar `incoterm` (campo espelhado pedido↔item) | Preview mostra alteração no pedido E nos itens |
| 27.2 | Aplicar e validar cascade na lista | Linha pai e TODAS as linhas filhas com o novo valor |
| 27.3 | Nível Combinado: editar campo só-pedido (`observacoes_pedido`) + campo só-item (`part_number_item`) na mesma sessão | Ambos aplicados nos escopos corretos |
| 27.4 | Validar persistência após F5 | Valores mantidos |
| 27.5 | Prints | `27-combinado-selecao.png`, `27-combinado-resultado.png` |

### ETAPA 28 — COLUNAS MANUAIS DO USUÁRIO — 8 TIPOS

Criar (ou reutilizar) uma coluna manual de **cada um dos 8 tipos** no escopo Pedido e repetir a verificação no escopo Item. Os 7 tipos editáveis devem aparecer no modal sob o grupo «Personalizadas» com a convenção `coluna_usuario:<id>`; o tipo **fórmula** NÃO deve aparecer (calculado, não editável).

| # | Tipo da coluna | Comportamento esperado no modal | Verificação pós-aplicar |
|---|----------------|--------------------------------|------------------------|
| 28.1 | Texto | Input texto livre | Valor aplicado na célula da coluna manual |
| 28.2 | Número | Input numérico | Valor numérico aplicado e formatado |
| 28.3 | Data | Date picker | Data aplicada no formato da lista |
| 28.4 | Moeda | Input numérico + formatação de moeda | Valor monetário aplicado |
| 28.5 | Percentual | Input percentual | Percentual aplicado |
| 28.6 | Checkbox | Select «✓ Sim / ✗ Não» (mesmo padrão da edição inline) | Estado booleano aplicado |
| 28.7 | Tipo de documento | Seleção de tipo de documento | Tipo aplicado |
| 28.8 | **Fórmula** | **NÃO listada no combobox** (bloqueada — calculada) | Célula continua exibindo valor calculado; nenhuma via de edição em massa |
| 28.9 | Escopo | Coluna criada no escopo Pedido só aparece no nível Pedido/Combinado; escopo Item só no nível Item/Combinado | Sem vazamento de escopo |
| 28.10 | Anti-viés | Metade dos tipos testada partindo de valor vazio, metade partindo de valor pré-preenchido | Alternância registrada no relatório |
| 28.11 | Prints | `28-coluna-<tipo>-selecao.png` + `-resultado.png` por tipo | 16+ prints |

### ETAPA 29 — AUTO-FILL TIPO DE OPERAÇÃO

| # | Passo | Verificação |
|---|-------|-------------|
| 29.1 | Selecionar pedido de **Importação** e editar `tipo_operacao_pedido` → Exportação | Preview correto; aplicado com sucesso |
| 29.2 | Validar auto-fill dos campos dependentes da operação | Campos de referência/parte coerentes com o novo tipo |
| 29.3 | Reverter para Importação via edição em massa | Pedido retorna ao estado original |
| 29.4 | Repetir em pedido de **Exportação** → Importação → reverter | Mesmo comportamento simétrico |
| 29.5 | Validar `tipo_operacao_item` no nível Item | Itens seguem a mesma regra |
| 29.6 | Prints | `29-tipo-operacao-*.png` |

### ETAPA 30 — ERROS, BLOQUEIOS E ESTADOS

| # | Passo | Verificação |
|---|-------|-------------|
| 30.1 | Tentar avançar sem nenhum campo preenchido | Botão «Revisar alterações» desabilitado |
| 30.2 | Campo `@@unique` (ex.: `numero_pedido`) com >1 pedido selecionado | Input bloqueado com aviso de colisão |
| 30.3 | Valor inválido (ex.: NCM incompleto) | Validação impede aplicar ou backend rejeita com erro legível |
| 30.4 | Cancelar no passo 2 («Voltar») e no passo 1 («Cancelar») | Nenhuma alteração aplicada |
| 30.5 | Prints | `30-erros-*.png` |

### ETAPA 31 — PERSISTÊNCIA FINAL + RELATÓRIO

| # | Passo | Verificação |
|---|-------|-------------|
| 31.1 | Navegar para o Hub e voltar à lista | Todos os valores aplicados nas etapas anteriores persistem |
| 31.2 | Print final da lista | `31-persistencia-final.png` |
| 31.3 | Gravar `RESULTADO.txt` com todas as linhas `EMT_ROW` | Resultado final PASSOU/FALHOU + contagem de falhas |
