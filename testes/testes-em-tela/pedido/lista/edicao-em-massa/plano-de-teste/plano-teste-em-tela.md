# Plano de Teste em Tela — Pedido / Lista / Edição em Massa

**ID:** TST-EMT-PEDIDO-LISTA-EDICAO-EM-MASSA-000081
**Data:** 2026-06-11
**Versão:** 1.0
**Criticidade:** alta
**Skill:** `skills/testes/teste-em-tela/SKILL.md`

**Escopo pasta:** `testes/testes-em-tela/pedido/lista/edicao-em-massa/`
**Plano + runner:** `plano-de-teste/` (este arquivo + `run-lista-edicao-em-massa.ts` + `gerar-plano-edicao-em-massa.ts`)
**Prints:** `../resultado-teste/<runId>/` — uma pasta por execução
**SSOT:** `servicos-global/produto/pedido/shared/camposEdicaoMassa.ts` — 111 campos pedido + 55 campos item = **166 campos** + 8 tipos de colunas manuais

> O modal Admin («O que será testado») agrupa casos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.
> **Plano gerado** por `gerar-plano-edicao-em-massa.ts` — não editar tabelas de campos à mão; regenerar a partir do SSOT.

---

## Regra de sequência dos prints

> **Padrão obrigatório** por campo editado em massa, **dois** prints em sequência:
>
> 1. **`-selecao.png`** — passo «Revisar alterações» com o de→para visível (antes de aplicar)
> 2. **`-resultado.png`** — grade **após aplicar** (sucesso ou erro visível na lista/toast)
>
> Validações de UX/drift/erros usam **um** print por verificação.

---

## Regras-mestre (valem para TODAS as etapas)

1. **Anti-viés 50/50** — passos pares partem de campo **vazio** (preencher); passos ímpares partem de campo **pré-preenchido** (substituir). Nunca testar todos os campos no mesmo estado.
2. **Pedido-alvo** — pedido com **maior quantidade de itens** da lista (maximiza propagação/cascade). Número anotado no relatório.
3. **Tipos de operação** — garantir na preparação pelo menos 1 pedido de Importação e 1 de Exportação.
4. **Validação tripla por campo** — preview de→para correto; valor aplicado na lista; persiste após F5.
5. **UX intacta** — modal mantém 3 passos (Campos → Revisão → Resultado), 3 níveis (Combinado / Pedido / Item), combobox com busca e «Adicionar campo».
6. **Falha não bloqueia** — exceção em um campo reprova apenas aquela linha (`EMT_ROW`); o runner continua.

---

## Roteiro de execução

### ETAPA 0 — PREPARAÇÃO (passos 001–002)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **001** | Login Clerk + workspace de teste + abrir Lista de Pedidos | Lista com linhas editáveis · Print `001-estado-inicial.png` (sucesso ou erro) |
| **002** | Varredura: eleger pedido-alvo (maior nº de itens) e confirmar Importação + Exportação presentes | rowId e nº do pedido anotados no relatório |

### ETAPA 1 — ABERTURA E UX DO MODAL (passo 003)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **003** | Selecionar pedido-alvo (checkbox) → clicar «Edição em Massa» na barra | Título «Editar em Massa (1 pedido selecionado)» · stepper com 3 passos · toggle com 3 níveis · combobox com busca e grupos DDD · Print `003-modal-aberto.png` (sucesso ou erro) |

### ETAPA 2 — GUARD-RAIL DE DRIFT (passos 004–005)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **004** | Nível **Pedido**: listar campos do combobox | ≥ 111 campos (SSOT) · todos os rótulos do SSOT presentes · nenhum bloqueado listado (`valor_total_pedido`, `quantidade_total_pedido`, `peso_liquido_total_pedido`, `peso_bruto_total_pedido`…) · Print `004-combobox-pedido.png` (sucesso ou erro) |
| **005** | Nível **Item**: listar campos do combobox | ≥ 55 campos (SSOT) · todos os rótulos do SSOT presentes · nenhum bloqueado listado (`valor_total_item`, `quantidade_atual_item`, `quantidade_transferida_item`, `id_item`…) · Print `005-combobox-item.png` (sucesso ou erro) |

> Bloqueados pedido (undefined): `valor_total_pedido`, `quantidade_total_pedido`, `peso_liquido_total_pedido`, `peso_bruto_total_pedido`, `cubagem_total_pedido`, `id_pedido`, `id_organizacao`, `id_workspace`, `id_status_pedido`, `data_criacao_pedido`, `data_atualizacao_pedido`, `data_exclusao_pedido`, `data_consolidacao_pedido`, `ids_origem_consolidacao_pedido`
> Bloqueados item (undefined): `valor_total_item`, `quantidade_atual_item`, `quantidade_transferida_item`, `id_item`, `id_organizacao`, `id_workspace`, `id_pedido`, `data_criacao_item`, `data_atualizacao_item`, `data_exclusao_item`


---

## CAMPOS DE PEDIDO — campo a campo

### ETAPA 3 — PEDIDO · IDENTIFICACAO (passos 006–008)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **006** | Editar em massa `numero_pedido` (Numero do Pedido, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `006-numero_pedido-selecao.png` (sucesso ou erro) · Print `006-numero_pedido-resultado.png` (sucesso ou erro) |
| **007** | Editar em massa `tipo_operacao_pedido` (Tipo de Operacao, seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `007-tipo_operacao_pedido-selecao.png` (sucesso ou erro) · Print `007-tipo_operacao_pedido-resultado.png` (sucesso ou erro) |
| **008** | Editar em massa `status_pedido` (Status do Pedido, seleção (dropdown com busca)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `008-status_pedido-selecao.png` (sucesso ou erro) · Print `008-status_pedido-resultado.png` (sucesso ou erro) |

### ETAPA 4 — PEDIDO · EXPORTADOR (passos 009–021)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **009** | Editar em massa `nome_exportador` (Exportador — Nome, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `009-nome_exportador-selecao.png` (sucesso ou erro) · Print `009-nome_exportador-resultado.png` (sucesso ou erro) |
| **010** | Editar em massa `endereco_exportador` (Exportador — Endereco, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `010-endereco_exportador-selecao.png` (sucesso ou erro) · Print `010-endereco_exportador-resultado.png` (sucesso ou erro) |
| **011** | Editar em massa `pais_exportador` (Exportador — Pais, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `011-pais_exportador-selecao.png` (sucesso ou erro) · Print `011-pais_exportador-resultado.png` (sucesso ou erro) |
| **012** | Editar em massa `estado_exportador` (Exportador — Estado, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `012-estado_exportador-selecao.png` (sucesso ou erro) · Print `012-estado_exportador-resultado.png` (sucesso ou erro) |
| **013** | Editar em massa `cidade_exportador` (Exportador — Cidade, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `013-cidade_exportador-selecao.png` (sucesso ou erro) · Print `013-cidade_exportador-resultado.png` (sucesso ou erro) |
| **014** | Editar em massa `zip_code_exportador` (Exportador — ZIP Code, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `014-zip_code_exportador-selecao.png` (sucesso ou erro) · Print `014-zip_code_exportador-resultado.png` (sucesso ou erro) |
| **015** | Editar em massa `exportador_ou_fabricante` (Exportador ou Fabricante, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `015-exportador_ou_fabricante-selecao.png` (sucesso ou erro) · Print `015-exportador_ou_fabricante-resultado.png` (sucesso ou erro) |
| **016** | Editar em massa `relacao_exportador_fabricante` (Relacao Export./Fabric., texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `016-relacao_exportador_fabricante-selecao.png` (sucesso ou erro) · Print `016-relacao_exportador_fabricante-resultado.png` (sucesso ou erro) |
| **017** | Editar em massa `nome_contato_exportador` (Contato Export. — Nome, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `017-nome_contato_exportador-selecao.png` (sucesso ou erro) · Print `017-nome_contato_exportador-resultado.png` (sucesso ou erro) |
| **018** | Editar em massa `email_contato_exportador` (Contato Export. — Email, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `018-email_contato_exportador-selecao.png` (sucesso ou erro) · Print `018-email_contato_exportador-resultado.png` (sucesso ou erro) |
| **019** | Editar em massa `whatsapp_contato_exportador` (Contato Export. — WhatsApp, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `019-whatsapp_contato_exportador-selecao.png` (sucesso ou erro) · Print `019-whatsapp_contato_exportador-resultado.png` (sucesso ou erro) |
| **020** | Editar em massa `cargo_contato_exportador` (Contato Export. — Cargo, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `020-cargo_contato_exportador-selecao.png` (sucesso ou erro) · Print `020-cargo_contato_exportador-resultado.png` (sucesso ou erro) |
| **021** | Editar em massa `departamento_contato_exportador` (Contato Export. — Depto., texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `021-departamento_contato_exportador-selecao.png` (sucesso ou erro) · Print `021-departamento_contato_exportador-resultado.png` (sucesso ou erro) |

### ETAPA 5 — PEDIDO · IMPORTADOR (passos 022–023)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **022** | Editar em massa `nome_importador` (Importador — Nome, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `022-nome_importador-selecao.png` (sucesso ou erro) · Print `022-nome_importador-resultado.png` (sucesso ou erro) |
| **023** | Editar em massa `cnpj_importador_pedido` (Importador — CNPJ, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `023-cnpj_importador_pedido-selecao.png` (sucesso ou erro) · Print `023-cnpj_importador_pedido-resultado.png` (sucesso ou erro) |

### ETAPA 6 — PEDIDO · FABRICANTE (passos 024–029)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **024** | Editar em massa `nome_fabricante` (Fabricante — Nome, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `024-nome_fabricante-selecao.png` (sucesso ou erro) · Print `024-nome_fabricante-resultado.png` (sucesso ou erro) |
| **025** | Editar em massa `endereco_fabricante` (Fabricante — Endereco, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `025-endereco_fabricante-selecao.png` (sucesso ou erro) · Print `025-endereco_fabricante-resultado.png` (sucesso ou erro) |
| **026** | Editar em massa `pais_fabricante` (Fabricante — Pais, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `026-pais_fabricante-selecao.png` (sucesso ou erro) · Print `026-pais_fabricante-resultado.png` (sucesso ou erro) |
| **027** | Editar em massa `estado_fabricante` (Fabricante — Estado, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `027-estado_fabricante-selecao.png` (sucesso ou erro) · Print `027-estado_fabricante-resultado.png` (sucesso ou erro) |
| **028** | Editar em massa `cidade_fabricante` (Fabricante — Cidade, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `028-cidade_fabricante-selecao.png` (sucesso ou erro) · Print `028-cidade_fabricante-resultado.png` (sucesso ou erro) |
| **029** | Editar em massa `zip_code_fabricante` (Fabricante — ZIP Code, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `029-zip_code_fabricante-selecao.png` (sucesso ou erro) · Print `029-zip_code_fabricante-resultado.png` (sucesso ou erro) |

### ETAPA 7 — PEDIDO · DOCUMENTOS (passos 030–034)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **030** | Editar em massa `referencia_importador_pedido` (Referencia Importador, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `030-referencia_importador_pedido-selecao.png` (sucesso ou erro) · Print `030-referencia_importador_pedido-resultado.png` (sucesso ou erro) |
| **031** | Editar em massa `referencia_exportador_pedido` (Referencia Exportador, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `031-referencia_exportador_pedido-selecao.png` (sucesso ou erro) · Print `031-referencia_exportador_pedido-resultado.png` (sucesso ou erro) |
| **032** | Editar em massa `numero_proforma_pedido` (No Proforma, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `032-numero_proforma_pedido-selecao.png` (sucesso ou erro) · Print `032-numero_proforma_pedido-resultado.png` (sucesso ou erro) |
| **033** | Editar em massa `numero_invoice_pedido` (No Invoice, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `033-numero_invoice_pedido-selecao.png` (sucesso ou erro) · Print `033-numero_invoice_pedido-resultado.png` (sucesso ou erro) |
| **034** | Editar em massa `referencia_fabricante_pedido` (Referencia Fabricante, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `034-referencia_fabricante_pedido-selecao.png` (sucesso ou erro) · Print `034-referencia_fabricante_pedido-resultado.png` (sucesso ou erro) |

### ETAPA 8 — PEDIDO · OPE (passos 035–046)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **035** | Editar em massa `codigo_ope` (OPE — Codigo, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `035-codigo_ope-selecao.png` (sucesso ou erro) · Print `035-codigo_ope-resultado.png` (sucesso ou erro) |
| **036** | Editar em massa `nome_ope` (OPE — Nome, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `036-nome_ope-selecao.png` (sucesso ou erro) · Print `036-nome_ope-resultado.png` (sucesso ou erro) |
| **037** | Editar em massa `endereco_ope` (OPE — Endereco, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `037-endereco_ope-selecao.png` (sucesso ou erro) · Print `037-endereco_ope-resultado.png` (sucesso ou erro) |
| **038** | Editar em massa `pais_ope` (OPE — Pais, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `038-pais_ope-selecao.png` (sucesso ou erro) · Print `038-pais_ope-resultado.png` (sucesso ou erro) |
| **039** | Editar em massa `estado_ope` (OPE — Estado, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `039-estado_ope-selecao.png` (sucesso ou erro) · Print `039-estado_ope-resultado.png` (sucesso ou erro) |
| **040** | Editar em massa `cidade_ope` (OPE — Cidade, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `040-cidade_ope-selecao.png` (sucesso ou erro) · Print `040-cidade_ope-resultado.png` (sucesso ou erro) |
| **041** | Editar em massa `zip_code_ope` (OPE — ZIP Code, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `041-zip_code_ope-selecao.png` (sucesso ou erro) · Print `041-zip_code_ope-resultado.png` (sucesso ou erro) |
| **042** | Editar em massa `tin_ope` (OPE — TIN, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `042-tin_ope-selecao.png` (sucesso ou erro) · Print `042-tin_ope-resultado.png` (sucesso ou erro) |
| **043** | Editar em massa `email_ope` (OPE — Email, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `043-email_ope-selecao.png` (sucesso ou erro) · Print `043-email_ope-resultado.png` (sucesso ou erro) |
| **044** | Editar em massa `situacao_ope` (OPE — Situacao, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `044-situacao_ope-selecao.png` (sucesso ou erro) · Print `044-situacao_ope-resultado.png` (sucesso ou erro) |
| **045** | Editar em massa `versao_ope` (OPE — Versao, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `045-versao_ope-selecao.png` (sucesso ou erro) · Print `045-versao_ope-resultado.png` (sucesso ou erro) |
| **046** | Editar em massa `cnpj_raiz_empresa_responsavel` (CNPJ Raiz Empresa Responsavel, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `046-cnpj_raiz_empresa_responsavel-selecao.png` (sucesso ou erro) · Print `046-cnpj_raiz_empresa_responsavel-resultado.png` (sucesso ou erro) |

### ETAPA 9 — PEDIDO · COMERCIAL (passos 047–055)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **047** | Editar em massa `incoterm_pedido` (Incoterm, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `047-incoterm_pedido-selecao.png` (sucesso ou erro) · Print `047-incoterm_pedido-resultado.png` (sucesso ou erro) |
| **048** | Editar em massa `moeda_pedido` (Moeda do Pedido, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `048-moeda_pedido-selecao.png` (sucesso ou erro) · Print `048-moeda_pedido-resultado.png` (sucesso ou erro) |
| **049** | Editar em massa `unidade_comercializada_pedido` (Unidade Comercializada do Pedido, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `049-unidade_comercializada_pedido-selecao.png` (sucesso ou erro) · Print `049-unidade_comercializada_pedido-resultado.png` (sucesso ou erro) |
| **050** | Editar em massa `condicao_pagamento_pedido` (Condicao de Pagamento — Comercial, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `050-condicao_pagamento_pedido-selecao.png` (sucesso ou erro) · Print `050-condicao_pagamento_pedido-resultado.png` (sucesso ou erro) |
| **051** | Editar em massa `condicao_pagamento_siscomex_pedido` (Condicao de Pagamento — Siscomex, seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `051-condicao_pagamento_siscomex_pedido-selecao.png` (sucesso ou erro) · Print `051-condicao_pagamento_siscomex_pedido-resultado.png` (sucesso ou erro) |
| **052** | Editar em massa `tipo_volume_pedido` (Tipo Volume Pedido, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `052-tipo_volume_pedido-selecao.png` (sucesso ou erro) · Print `052-tipo_volume_pedido-resultado.png` (sucesso ou erro) |
| **053** | Editar em massa `quantidade_volumes_pedido` (Qtd. de Volumes, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `053-quantidade_volumes_pedido-selecao.png` (sucesso ou erro) · Print `053-quantidade_volumes_pedido-resultado.png` (sucesso ou erro) |
| **054** | Editar em massa `tipo_volume_item` (Tipo Volume Item, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `054-tipo_volume_item-selecao.png` (sucesso ou erro) · Print `054-tipo_volume_item-resultado.png` (sucesso ou erro) |
| **055** | Editar em massa `cobertura_cambial_pedido` (Cobertura Cambial, seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `055-cobertura_cambial_pedido-selecao.png` (sucesso ou erro) · Print `055-cobertura_cambial_pedido-resultado.png` (sucesso ou erro) |

### ETAPA 10 — PEDIDO · CAMBIO (passos 056–059)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **056** | Editar em massa `valor_total_cambio_pedido` (Valor Total Cambio, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `056-valor_total_cambio_pedido-selecao.png` (sucesso ou erro) · Print `056-valor_total_cambio_pedido-resultado.png` (sucesso ou erro) |
| **057** | Editar em massa `moeda_cambio_pedido` (Moeda Cambio, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `057-moeda_cambio_pedido-selecao.png` (sucesso ou erro) · Print `057-moeda_cambio_pedido-resultado.png` (sucesso ou erro) |
| **058** | Editar em massa `taxa_cambio_estimada_pedido` (Taxa Cambio Estimada, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `058-taxa_cambio_estimada_pedido-selecao.png` (sucesso ou erro) · Print `058-taxa_cambio_estimada_pedido-resultado.png` (sucesso ou erro) |
| **059** | Editar em massa `contrato_cambio_id_pedido` (Contrato de Cambio (ID), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `059-contrato_cambio_id_pedido-selecao.png` (sucesso ou erro) · Print `059-contrato_cambio_id_pedido-resultado.png` (sucesso ou erro) |

### ETAPA 11 — PEDIDO · LOGISTICA (passos 060–066)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **060** | Editar em massa `porto_origem` (Porto de Origem, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `060-porto_origem-selecao.png` (sucesso ou erro) · Print `060-porto_origem-resultado.png` (sucesso ou erro) |
| **061** | Editar em massa `porto_destino` (Porto de Destino, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `061-porto_destino-selecao.png` (sucesso ou erro) · Print `061-porto_destino-resultado.png` (sucesso ou erro) |
| **062** | Editar em massa `local_de_origem` (País origem, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `062-local_de_origem-selecao.png` (sucesso ou erro) · Print `062-local_de_origem-resultado.png` (sucesso ou erro) |
| **063** | Editar em massa `local_de_destino` (País destino, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `063-local_de_destino-selecao.png` (sucesso ou erro) · Print `063-local_de_destino-resultado.png` (sucesso ou erro) |
| **064** | Editar em massa `aeroporto_origem` (Aeroporto de Origem, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `064-aeroporto_origem-selecao.png` (sucesso ou erro) · Print `064-aeroporto_origem-resultado.png` (sucesso ou erro) |
| **065** | Editar em massa `aeroporto_destino` (Aeroporto de Destino, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `065-aeroporto_destino-selecao.png` (sucesso ou erro) · Print `065-aeroporto_destino-resultado.png` (sucesso ou erro) |
| **066** | Editar em massa `data_embarque_origem` (Data de Embarque na Origem, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `066-data_embarque_origem-selecao.png` (sucesso ou erro) · Print `066-data_embarque_origem-resultado.png` (sucesso ou erro) |

### ETAPA 12 — PEDIDO · DATAS (passos 067–080)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **067** | Editar em massa `data_emissao_pedido` (Data de Emissao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `067-data_emissao_pedido-selecao.png` (sucesso ou erro) · Print `067-data_emissao_pedido-resultado.png` (sucesso ou erro) |
| **068** | Editar em massa `data_documento_pedido` (Data do Documento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `068-data_documento_pedido-selecao.png` (sucesso ou erro) · Print `068-data_documento_pedido-resultado.png` (sucesso ou erro) |
| **069** | Editar em massa `data_documento_proforma_pedido` (Data do Documento Proforma, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `069-data_documento_proforma_pedido-selecao.png` (sucesso ou erro) · Print `069-data_documento_proforma_pedido-resultado.png` (sucesso ou erro) |
| **070** | Editar em massa `data_documento_invoice_pedido` (Data do Documento Invoice, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `070-data_documento_invoice_pedido-selecao.png` (sucesso ou erro) · Print `070-data_documento_invoice_pedido-resultado.png` (sucesso ou erro) |
| **071** | Editar em massa `data_prevista_pedido_pronto` (Data Prevista — Pedido Pronto, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `071-data_prevista_pedido_pronto-selecao.png` (sucesso ou erro) · Print `071-data_prevista_pedido_pronto-resultado.png` (sucesso ou erro) |
| **072** | Editar em massa `data_confirmada_pedido_pronto` (Data Confirmada — Pedido Pronto, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `072-data_confirmada_pedido_pronto-selecao.png` (sucesso ou erro) · Print `072-data_confirmada_pedido_pronto-resultado.png` (sucesso ou erro) |
| **073** | Editar em massa `data_meta_pedido_pronto` (Data Meta — Pedido Pronto, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `073-data_meta_pedido_pronto-selecao.png` (sucesso ou erro) · Print `073-data_meta_pedido_pronto-resultado.png` (sucesso ou erro) |
| **074** | Editar em massa `data_prevista_inspecao_pedido` (Data Prevista — Inspecao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `074-data_prevista_inspecao_pedido-selecao.png` (sucesso ou erro) · Print `074-data_prevista_inspecao_pedido-resultado.png` (sucesso ou erro) |
| **075** | Editar em massa `data_confirmada_inspecao_pedido` (Data Confirmada — Inspecao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `075-data_confirmada_inspecao_pedido-selecao.png` (sucesso ou erro) · Print `075-data_confirmada_inspecao_pedido-resultado.png` (sucesso ou erro) |
| **076** | Editar em massa `data_meta_inspecao_pedido` (Data Meta — Inspecao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `076-data_meta_inspecao_pedido-selecao.png` (sucesso ou erro) · Print `076-data_meta_inspecao_pedido-resultado.png` (sucesso ou erro) |
| **077** | Editar em massa `data_prevista_coleta_pedido` (Data Prevista — Coleta, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `077-data_prevista_coleta_pedido-selecao.png` (sucesso ou erro) · Print `077-data_prevista_coleta_pedido-resultado.png` (sucesso ou erro) |
| **078** | Editar em massa `data_confirmada_coleta_pedido` (Data Confirmada — Coleta, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `078-data_confirmada_coleta_pedido-selecao.png` (sucesso ou erro) · Print `078-data_confirmada_coleta_pedido-resultado.png` (sucesso ou erro) |
| **079** | Editar em massa `data_meta_coleta_pedido` (Data Meta — Coleta, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `079-data_meta_coleta_pedido-selecao.png` (sucesso ou erro) · Print `079-data_meta_coleta_pedido-resultado.png` (sucesso ou erro) |
| **080** | Editar em massa `data_transferencia_saldo_pedido` (Data de Transferencia de Saldo, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `080-data_transferencia_saldo_pedido-selecao.png` (sucesso ou erro) · Print `080-data_transferencia_saldo_pedido-resultado.png` (sucesso ou erro) |

### ETAPA 13 — PEDIDO · DATAS DRAFT PEDIDO (passos 081–086)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **081** | Editar em massa `data_previsao_recebimento_rascunho_pedido` (Draft Pedido — Prev. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `081-data_previsao_recebimento_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `081-data_previsao_recebimento_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **082** | Editar em massa `data_confirmacao_recebimento_rascunho_pedido` (Draft Pedido — Conf. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `082-data_confirmacao_recebimento_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `082-data_confirmacao_recebimento_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **083** | Editar em massa `data_meta_recebimento_rascunho_pedido` (Draft Pedido — Meta Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `083-data_meta_recebimento_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `083-data_meta_recebimento_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **084** | Editar em massa `data_previsao_aprovacao_rascunho_pedido` (Draft Pedido — Prev. Aprovacao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `084-data_previsao_aprovacao_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `084-data_previsao_aprovacao_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **085** | Editar em massa `data_confirmacao_aprovacao_rascunho_pedido` (Draft Pedido — Conf. Aprovacao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `085-data_confirmacao_aprovacao_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `085-data_confirmacao_aprovacao_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **086** | Editar em massa `data_meta_aprovacao_rascunho_pedido` (Draft Pedido — Meta Aprovacao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `086-data_meta_aprovacao_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `086-data_meta_aprovacao_rascunho_pedido-resultado.png` (sucesso ou erro) |

### ETAPA 14 — PEDIDO · DATAS DRAFT PROFORMA (passos 087–099)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **087** | Editar em massa `data_previsao_recebimento_rascunho_proforma_pedido` (Draft Proforma — Prev. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `087-data_previsao_recebimento_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `087-data_previsao_recebimento_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **088** | Editar em massa `data_confirmacao_recebimento_rascunho_proforma_pedido` (Draft Proforma — Conf. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `088-data_confirmacao_recebimento_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `088-data_confirmacao_recebimento_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **089** | Editar em massa `data_meta_recebimento_rascunho_proforma_pedido` (Draft Proforma — Meta Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `089-data_meta_recebimento_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `089-data_meta_recebimento_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **090** | Editar em massa `data_previsao_aprovacao_rascunho_proforma_pedido` (Draft Proforma — Prev. Aprovacao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `090-data_previsao_aprovacao_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `090-data_previsao_aprovacao_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **091** | Editar em massa `data_confirmacao_aprovacao_rascunho_proforma_pedido` (Draft Proforma — Conf. Aprovacao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `091-data_confirmacao_aprovacao_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `091-data_confirmacao_aprovacao_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **092** | Editar em massa `data_meta_aprovacao_rascunho_proforma_pedido` (Draft Proforma — Meta Aprovacao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `092-data_meta_aprovacao_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `092-data_meta_aprovacao_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **093** | Editar em massa `data_previsao_envio_original_proforma_pedido` (Original Proforma — Prev. Envio, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `093-data_previsao_envio_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `093-data_previsao_envio_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **094** | Editar em massa `data_confirmacao_envio_original_proforma_pedido` (Original Proforma — Conf. Envio, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `094-data_confirmacao_envio_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `094-data_confirmacao_envio_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **095** | Editar em massa `data_meta_envio_original_proforma_pedido` (Original Proforma — Meta Envio, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `095-data_meta_envio_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `095-data_meta_envio_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **096** | Editar em massa `data_previsao_recebimento_original_proforma_pedido` (Original Proforma — Prev. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `096-data_previsao_recebimento_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `096-data_previsao_recebimento_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **097** | Editar em massa `data_confirmacao_recebimento_original_proforma_pedido` (Original Proforma — Conf. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `097-data_confirmacao_recebimento_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `097-data_confirmacao_recebimento_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **098** | Editar em massa `data_meta_recebimento_original_proforma_pedido` (Original Proforma — Meta Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `098-data_meta_recebimento_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `098-data_meta_recebimento_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **099** | Editar em massa `data_proforma_invoice` (Data da Proforma Invoice, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `099-data_proforma_invoice-selecao.png` (sucesso ou erro) · Print `099-data_proforma_invoice-resultado.png` (sucesso ou erro) |

### ETAPA 15 — PEDIDO · DATAS DRAFT INVOICE (passos 100–112)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **100** | Editar em massa `data_previsao_recebimento_rascunho_invoice_pedido` (Draft Invoice — Prev. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `100-data_previsao_recebimento_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `100-data_previsao_recebimento_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **101** | Editar em massa `data_confirmacao_recebimento_rascunho_invoice_pedido` (Draft Invoice — Conf. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `101-data_confirmacao_recebimento_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `101-data_confirmacao_recebimento_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **102** | Editar em massa `data_meta_recebimento_rascunho_invoice_pedido` (Draft Invoice — Meta Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `102-data_meta_recebimento_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `102-data_meta_recebimento_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **103** | Editar em massa `data_previsao_aprovacao_rascunho_invoice_pedido` (Draft Invoice — Prev. Aprovacao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `103-data_previsao_aprovacao_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `103-data_previsao_aprovacao_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **104** | Editar em massa `data_confirmacao_aprovacao_rascunho_invoice_pedido` (Draft Invoice — Conf. Aprovacao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `104-data_confirmacao_aprovacao_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `104-data_confirmacao_aprovacao_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **105** | Editar em massa `data_meta_aprovacao_rascunho_invoice_pedido` (Draft Invoice — Meta Aprovacao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `105-data_meta_aprovacao_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `105-data_meta_aprovacao_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **106** | Editar em massa `data_previsao_envio_original_invoice_pedido` (Original Invoice — Prev. Envio, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `106-data_previsao_envio_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `106-data_previsao_envio_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **107** | Editar em massa `data_confirmacao_envio_original_invoice_pedido` (Original Invoice — Conf. Envio, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `107-data_confirmacao_envio_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `107-data_confirmacao_envio_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **108** | Editar em massa `data_meta_envio_original_invoice_pedido` (Original Invoice — Meta Envio, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `108-data_meta_envio_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `108-data_meta_envio_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **109** | Editar em massa `data_previsao_recebimento_original_invoice_pedido` (Original Invoice — Prev. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `109-data_previsao_recebimento_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `109-data_previsao_recebimento_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **110** | Editar em massa `data_confirmacao_recebimento_original_invoice_pedido` (Original Invoice — Conf. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `110-data_confirmacao_recebimento_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `110-data_confirmacao_recebimento_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **111** | Editar em massa `data_meta_recebimento_original_invoice_pedido` (Original Invoice — Meta Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `111-data_meta_recebimento_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `111-data_meta_recebimento_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **112** | Editar em massa `data_invoice` (Data da Invoice, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `112-data_invoice-selecao.png` (sucesso ou erro) · Print `112-data_invoice-resultado.png` (sucesso ou erro) |

### ETAPA 16 — PEDIDO · FINANCEIRO (passos 113–113)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **113** | Editar em massa `casas_decimais_valor_pedido` (Casas Decimais — Valor, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `113-casas_decimais_valor_pedido-selecao.png` (sucesso ou erro) · Print `113-casas_decimais_valor_pedido-resultado.png` (sucesso ou erro) |

### ETAPA 17 — PEDIDO · FISICO (passos 114–116)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **114** | Editar em massa `casas_decimais_quantidade_pedido` (Casas Decimais — Qtd., numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `114-casas_decimais_quantidade_pedido-selecao.png` (sucesso ou erro) · Print `114-casas_decimais_quantidade_pedido-resultado.png` (sucesso ou erro) |
| **115** | Editar em massa `casas_decimais_peso_pedido` (Casas Decimais — Peso, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `115-casas_decimais_peso_pedido-selecao.png` (sucesso ou erro) · Print `115-casas_decimais_peso_pedido-resultado.png` (sucesso ou erro) |
| **116** | Editar em massa `casas_decimais_cubagem_pedido` (Casas Decimais — Cubagem, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `116-casas_decimais_cubagem_pedido-selecao.png` (sucesso ou erro) · Print `116-casas_decimais_cubagem_pedido-resultado.png` (sucesso ou erro) |


---

## CAMPOS DE ITEM — campo a campo

### ETAPA 18 — ITEM · PRODUTO (passos 117–131)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **117** | Editar em massa `sequencia_item_pedido` (Sequencia do Item, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `117-sequencia_item_pedido-selecao.png` (sucesso ou erro) · Print `117-sequencia_item_pedido-resultado.png` (sucesso ou erro) |
| **118** | Editar em massa `part_number_item` (Part Number, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `118-part_number_item-selecao.png` (sucesso ou erro) · Print `118-part_number_item-resultado.png` (sucesso ou erro) |
| **119** | Editar em massa `ncm_item` (NCM, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `119-ncm_item-selecao.png` (sucesso ou erro) · Print `119-ncm_item-resultado.png` (sucesso ou erro) |
| **120** | Editar em massa `descricao_item` (Descricao do Item, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `120-descricao_item-selecao.png` (sucesso ou erro) · Print `120-descricao_item-resultado.png` (sucesso ou erro) |
| **121** | Editar em massa `unidade_comercializada_item` (Unidade Comercializada do Item, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `121-unidade_comercializada_item-selecao.png` (sucesso ou erro) · Print `121-unidade_comercializada_item-resultado.png` (sucesso ou erro) |
| **122** | Editar em massa `tipo_operacao_item` (Tipo de Operacao (Item), seleção (dropdown com busca)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `122-tipo_operacao_item-selecao.png` (sucesso ou erro) · Print `122-tipo_operacao_item-resultado.png` (sucesso ou erro) |
| **123** | Editar em massa `descricao_completa_item_pt` (Descricao Completa (PT), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `123-descricao_completa_item_pt-selecao.png` (sucesso ou erro) · Print `123-descricao_completa_item_pt-resultado.png` (sucesso ou erro) |
| **124** | Editar em massa `descricao_completa_item_en` (Descricao Completa (EN), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `124-descricao_completa_item_en-selecao.png` (sucesso ou erro) · Print `124-descricao_completa_item_en-resultado.png` (sucesso ou erro) |
| **125** | Editar em massa `descricao_completa_item_es` (Descricao Completa (ES), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `125-descricao_completa_item_es-selecao.png` (sucesso ou erro) · Print `125-descricao_completa_item_es-resultado.png` (sucesso ou erro) |
| **126** | Editar em massa `descricao_completa_item_nf` (Descricao Completa (NF), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `126-descricao_completa_item_nf-selecao.png` (sucesso ou erro) · Print `126-descricao_completa_item_nf-resultado.png` (sucesso ou erro) |
| **127** | Editar em massa `texto_posicao_ncm` (Texto Posicao NCM, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `127-texto_posicao_ncm-selecao.png` (sucesso ou erro) · Print `127-texto_posicao_ncm-resultado.png` (sucesso ou erro) |
| **128** | Editar em massa `grupo_item` (Grupo do Item, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `128-grupo_item-selecao.png` (sucesso ou erro) · Print `128-grupo_item-resultado.png` (sucesso ou erro) |
| **129** | Editar em massa `subgrupo_item` (Subgrupo do Item, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `129-subgrupo_item-selecao.png` (sucesso ou erro) · Print `129-subgrupo_item-resultado.png` (sucesso ou erro) |
| **130** | Editar em massa `campo_especial_item` (Campo Especial do Item, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `130-campo_especial_item-selecao.png` (sucesso ou erro) · Print `130-campo_especial_item-resultado.png` (sucesso ou erro) |
| **131** | Editar em massa `atributos_catalogo` (Atributos de Catalogo, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `131-atributos_catalogo-selecao.png` (sucesso ou erro) · Print `131-atributos_catalogo-resultado.png` (sucesso ou erro) |

### ETAPA 19 — ITEM · QUANTIDADES (passos 132–135)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **132** | Editar em massa `quantidade_inicial_item` (Qtd. Inicial, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `132-quantidade_inicial_item-selecao.png` (sucesso ou erro) · Print `132-quantidade_inicial_item-resultado.png` (sucesso ou erro) |
| **133** | Editar em massa `quantidade_pronta_item` (Qtd. Pronta Total, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `133-quantidade_pronta_item-selecao.png` (sucesso ou erro) · Print `133-quantidade_pronta_item-resultado.png` (sucesso ou erro) |
| **134** | Editar em massa `quantidade_cancelada_item` (Qtd. Cancelada, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `134-quantidade_cancelada_item-selecao.png` (sucesso ou erro) · Print `134-quantidade_cancelada_item-resultado.png` (sucesso ou erro) |
| **135** | Editar em massa `casas_decimais_quantidade_item` (Casas Decimais — Qtd., numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `135-casas_decimais_quantidade_item-selecao.png` (sucesso ou erro) · Print `135-casas_decimais_quantidade_item-resultado.png` (sucesso ou erro) |

### ETAPA 20 — ITEM · FINANCEIRO (passos 136–138)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **136** | Editar em massa `moeda_item` (Moeda do Item, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `136-moeda_item-selecao.png` (sucesso ou erro) · Print `136-moeda_item-resultado.png` (sucesso ou erro) |
| **137** | Editar em massa `valor_por_unidade_item` (Valor por Unidade, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `137-valor_por_unidade_item-selecao.png` (sucesso ou erro) · Print `137-valor_por_unidade_item-resultado.png` (sucesso ou erro) |
| **138** | Editar em massa `casas_decimais_valor_item` (Casas Decimais — Valor, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `138-casas_decimais_valor_item-selecao.png` (sucesso ou erro) · Print `138-casas_decimais_valor_item-resultado.png` (sucesso ou erro) |

### ETAPA 21 — ITEM · CAMBIO (passos 139–139)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **139** | Editar em massa `cobertura_cambial_item` (Cobertura Cambial, seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `139-cobertura_cambial_item-selecao.png` (sucesso ou erro) · Print `139-cobertura_cambial_item-resultado.png` (sucesso ou erro) |

### ETAPA 22 — ITEM · COMERCIAL (passos 140–142)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **140** | Editar em massa `condicao_pagamento_siscomex_item` (Condicao de Pagamento — Siscomex, seleção (dropdown com busca)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `140-condicao_pagamento_siscomex_item-selecao.png` (sucesso ou erro) · Print `140-condicao_pagamento_siscomex_item-resultado.png` (sucesso ou erro) |
| **141** | Editar em massa `incoterm_item` (Incoterm (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `141-incoterm_item-selecao.png` (sucesso ou erro) · Print `141-incoterm_item-resultado.png` (sucesso ou erro) |
| **142** | Editar em massa `condicao_pagamento_item` (Condicao de Pagamento — Comercial (Item), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `142-condicao_pagamento_item-selecao.png` (sucesso ou erro) · Print `142-condicao_pagamento_item-resultado.png` (sucesso ou erro) |

### ETAPA 23 — ITEM · PARTES (passos 143–145)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **143** | Editar em massa `nome_exportador_item` (Exportador (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `143-nome_exportador_item-selecao.png` (sucesso ou erro) · Print `143-nome_exportador_item-resultado.png` (sucesso ou erro) |
| **144** | Editar em massa `nome_importador_item` (Importador (Item), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `144-nome_importador_item-selecao.png` (sucesso ou erro) · Print `144-nome_importador_item-resultado.png` (sucesso ou erro) |
| **145** | Editar em massa `nome_fabricante_item` (Fabricante (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `145-nome_fabricante_item-selecao.png` (sucesso ou erro) · Print `145-nome_fabricante_item-resultado.png` (sucesso ou erro) |

### ETAPA 24 — ITEM · DOCUMENTOS (passos 146–154)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **146** | Editar em massa `referencia_importador_item` (Referencia Importador (Item), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `146-referencia_importador_item-selecao.png` (sucesso ou erro) · Print `146-referencia_importador_item-resultado.png` (sucesso ou erro) |
| **147** | Editar em massa `referencia_exportador_item` (Referencia Exportador (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `147-referencia_exportador_item-selecao.png` (sucesso ou erro) · Print `147-referencia_exportador_item-resultado.png` (sucesso ou erro) |
| **148** | Editar em massa `referencia_fabricante_item` (Referencia Fabricante (Item), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `148-referencia_fabricante_item-selecao.png` (sucesso ou erro) · Print `148-referencia_fabricante_item-resultado.png` (sucesso ou erro) |
| **149** | Editar em massa `numero_proforma_item` (No Proforma (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `149-numero_proforma_item-selecao.png` (sucesso ou erro) · Print `149-numero_proforma_item-resultado.png` (sucesso ou erro) |
| **150** | Editar em massa `numero_invoice_item` (No Invoice (Item), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `150-numero_invoice_item-selecao.png` (sucesso ou erro) · Print `150-numero_invoice_item-resultado.png` (sucesso ou erro) |
| **151** | Editar em massa `tipo_embalagem` (Tipo de Embalagem, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `151-tipo_embalagem-selecao.png` (sucesso ou erro) · Print `151-tipo_embalagem-resultado.png` (sucesso ou erro) |
| **152** | Editar em massa `numero_lpco` (No LPCO, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `152-numero_lpco-selecao.png` (sucesso ou erro) · Print `152-numero_lpco-resultado.png` (sucesso ou erro) |
| **153** | Editar em massa `numero_certificado_origem` (No Certificado de Origem, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `153-numero_certificado_origem-selecao.png` (sucesso ou erro) · Print `153-numero_certificado_origem-resultado.png` (sucesso ou erro) |
| **154** | Editar em massa `data_certificado_origem` (Data Certificado de Origem, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `154-data_certificado_origem-selecao.png` (sucesso ou erro) · Print `154-data_certificado_origem-resultado.png` (sucesso ou erro) |

### ETAPA 25 — ITEM · FISICO (passos 155–159)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **155** | Editar em massa `peso_liquido_unitario_item` (Peso Liquido Unitario, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `155-peso_liquido_unitario_item-selecao.png` (sucesso ou erro) · Print `155-peso_liquido_unitario_item-resultado.png` (sucesso ou erro) |
| **156** | Editar em massa `peso_bruto_unitario_item` (Peso Bruto Unitario, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `156-peso_bruto_unitario_item-selecao.png` (sucesso ou erro) · Print `156-peso_bruto_unitario_item-resultado.png` (sucesso ou erro) |
| **157** | Editar em massa `cubagem_unitaria_item` (Cubagem Unitaria, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `157-cubagem_unitaria_item-selecao.png` (sucesso ou erro) · Print `157-cubagem_unitaria_item-resultado.png` (sucesso ou erro) |
| **158** | Editar em massa `casas_decimais_peso_item` (Casas Decimais — Peso, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `158-casas_decimais_peso_item-selecao.png` (sucesso ou erro) · Print `158-casas_decimais_peso_item-resultado.png` (sucesso ou erro) |
| **159** | Editar em massa `casas_decimais_cubagem_item` (Casas Decimais — Cubagem, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `159-casas_decimais_cubagem_item-selecao.png` (sucesso ou erro) · Print `159-casas_decimais_cubagem_item-resultado.png` (sucesso ou erro) |

### ETAPA 26 — ITEM · DATAS (passos 160–171)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **160** | Editar em massa `data_emissao_item` (Data de Emissao (Item), data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `160-data_emissao_item-selecao.png` (sucesso ou erro) · Print `160-data_emissao_item-resultado.png` (sucesso ou erro) |
| **161** | Editar em massa `data_consolidacao_item` (Data de Consolidacao (Item), data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `161-data_consolidacao_item-selecao.png` (sucesso ou erro) · Print `161-data_consolidacao_item-resultado.png` (sucesso ou erro) |
| **162** | Editar em massa `data_embarque_item` (Data de Embarque (Item), data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `162-data_embarque_item-selecao.png` (sucesso ou erro) · Print `162-data_embarque_item-resultado.png` (sucesso ou erro) |
| **163** | Editar em massa `data_prevista_item_pronto` (Data Prevista — Item Pronto, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `163-data_prevista_item_pronto-selecao.png` (sucesso ou erro) · Print `163-data_prevista_item_pronto-resultado.png` (sucesso ou erro) |
| **164** | Editar em massa `data_confirmada_item_pronto` (Data Confirmada — Item Pronto, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `164-data_confirmada_item_pronto-selecao.png` (sucesso ou erro) · Print `164-data_confirmada_item_pronto-resultado.png` (sucesso ou erro) |
| **165** | Editar em massa `data_meta_item_pronto` (Data Meta — Item Pronto, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `165-data_meta_item_pronto-selecao.png` (sucesso ou erro) · Print `165-data_meta_item_pronto-resultado.png` (sucesso ou erro) |
| **166** | Editar em massa `data_prevista_inspecao_item` (Data Prevista — Inspecao (Item), data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `166-data_prevista_inspecao_item-selecao.png` (sucesso ou erro) · Print `166-data_prevista_inspecao_item-resultado.png` (sucesso ou erro) |
| **167** | Editar em massa `data_confirmada_inspecao_item` (Data Confirmada — Inspecao (Item), data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `167-data_confirmada_inspecao_item-selecao.png` (sucesso ou erro) · Print `167-data_confirmada_inspecao_item-resultado.png` (sucesso ou erro) |
| **168** | Editar em massa `data_meta_inspecao_item` (Data Meta — Inspecao (Item), data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `168-data_meta_inspecao_item-selecao.png` (sucesso ou erro) · Print `168-data_meta_inspecao_item-resultado.png` (sucesso ou erro) |
| **169** | Editar em massa `data_prevista_coleta_item` (Data Prevista — Coleta (Item), data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `169-data_prevista_coleta_item-selecao.png` (sucesso ou erro) · Print `169-data_prevista_coleta_item-resultado.png` (sucesso ou erro) |
| **170** | Editar em massa `data_confirmada_coleta_item` (Data Confirmada — Coleta (Item), data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `170-data_confirmada_coleta_item-selecao.png` (sucesso ou erro) · Print `170-data_confirmada_coleta_item-resultado.png` (sucesso ou erro) |
| **171** | Editar em massa `data_meta_coleta_item` (Data Meta — Coleta (Item), data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · persiste após F5 · Print `171-data_meta_coleta_item-selecao.png` (sucesso ou erro) · Print `171-data_meta_coleta_item-resultado.png` (sucesso ou erro) |

---

### ETAPA 27 — NÍVEL COMBINADO + CASCADE (passos 172–173)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **172** | Nível **Combinado**: editar `incoterm` (espelhado pedido↔item) | Preview mostra alteração no pedido E nos itens · linha pai e TODAS as filhas com novo valor · Print `172-combinado-incoterm-selecao.png` (sucesso ou erro) · Print `172-combinado-incoterm-resultado.png` (sucesso ou erro) |
| **173** | Combinado: campo só-pedido (`observacoes_pedido`) + só-item (`part_number_item`) na mesma sessão | Ambos aplicados nos escopos corretos · persiste após F5 |

### ETAPA 28 — COLUNAS MANUAIS DO USUÁRIO — 8 TIPOS (passos 174–182)

Criar (ou reutilizar) 1 coluna manual de **cada um dos 8 tipos**. Os 7 editáveis aparecem no grupo «Personalizadas» (convenção `coluna_usuario:<id>`); **fórmula NÃO aparece** (calculada). Metade dos tipos parte de valor vazio, metade de pré-preenchido (anti-viés).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **174** | Editar em massa coluna manual tipo **texto** | Input texto livre · valor aplicado na célula da coluna · Print `174-coluna-texto-selecao.png` (sucesso ou erro) · Print `174-coluna-texto-resultado.png` (sucesso ou erro) |
| **175** | Editar em massa coluna manual tipo **numero** | Input numérico · valor aplicado na célula da coluna · Print `175-coluna-numero-selecao.png` (sucesso ou erro) · Print `175-coluna-numero-resultado.png` (sucesso ou erro) |
| **176** | Editar em massa coluna manual tipo **data** | Date picker · valor aplicado na célula da coluna · Print `176-coluna-data-selecao.png` (sucesso ou erro) · Print `176-coluna-data-resultado.png` (sucesso ou erro) |
| **177** | Editar em massa coluna manual tipo **moeda** | Input numérico + formatação de moeda · valor aplicado na célula da coluna · Print `177-coluna-moeda-selecao.png` (sucesso ou erro) · Print `177-coluna-moeda-resultado.png` (sucesso ou erro) |
| **178** | Editar em massa coluna manual tipo **percentual** | Input percentual · valor aplicado na célula da coluna · Print `178-coluna-percentual-selecao.png` (sucesso ou erro) · Print `178-coluna-percentual-resultado.png` (sucesso ou erro) |
| **179** | Editar em massa coluna manual tipo **checkbox** | Select «✓ Sim / ✗ Não» (mesmo padrão da edição inline) · valor aplicado na célula da coluna · Print `179-coluna-checkbox-selecao.png` (sucesso ou erro) · Print `179-coluna-checkbox-resultado.png` (sucesso ou erro) |
| **180** | Editar em massa coluna manual tipo **tipo-documento** | Seleção de tipo de documento · valor aplicado na célula da coluna · Print `180-coluna-tipo-documento-selecao.png` (sucesso ou erro) · Print `180-coluna-tipo-documento-resultado.png` (sucesso ou erro) |
| **181** | Coluna tipo **fórmula** | **NÃO listada** no combobox · célula continua exibindo valor calculado · Print `181-coluna-formula-bloqueada.png` (sucesso ou erro) |
| **182** | Validar escopo | Coluna escopo Pedido só no nível Pedido/Combinado; escopo Item só no nível Item/Combinado · Print `182-coluna-escopo.png` (sucesso ou erro) |

### ETAPA 29 — AUTO-FILL TIPO DE OPERAÇÃO (passos 183–185)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **183** | Pedido **Importação**: `tipo_operacao_pedido` → Exportação → reverter | Auto-fill dos campos dependentes coerente · reversão restaura estado · Print `183-tipo-operacao-imp-exp.png` (sucesso ou erro) |
| **184** | Pedido **Exportação**: → Importação → reverter | Comportamento simétrico · Print `184-tipo-operacao-exp-imp.png` (sucesso ou erro) |
| **185** | `tipo_operacao_item` no nível **Item** | Itens seguem a mesma regra · Print `185-tipo-operacao-item.png` (sucesso ou erro) |

### ETAPA 30 — ERROS, BLOQUEIOS E ESTADOS (passos 186–189)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **186** | Avançar sem campo preenchido | «Revisar alterações» desabilitado · Print `186-erros-revisar-desabilitado.png` (sucesso ou erro) |
| **187** | Campo `@@unique` (`numero_pedido`) com >1 pedido selecionado | Input bloqueado com aviso de colisão · Print `187-erros-unique-bloqueado.png` (sucesso ou erro) |
| **188** | «Voltar» no passo Revisão | Retorna ao passo Campos sem aplicar |
| **189** | «Cancelar» no passo Campos | Modal fecha sem aplicar nada |

### ETAPA 31 — PERSISTÊNCIA FINAL + RELATÓRIO (passo 190)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **190** | Navegar Hub → voltar à Lista · gravar `RESULTADO.txt` | Valores das etapas anteriores persistem · relatório com todas as linhas `EMT_ROW` · Print `190-persistencia-final.png` (sucesso ou erro) |

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 001 | `001-estado-inicial.png` | Lista carregada pós-login no workspace de teste |
| 003 | `003-modal-aberto.png` | Modal Editar em Massa aberto — stepper, níveis e combobox |
| 004 | `004-combobox-pedido.png` | Combobox nível Pedido — 111 campos do SSOT |
| 005 | `005-combobox-item.png` | Combobox nível Item — 55 campos do SSOT |
| 006 | `006-numero_pedido-selecao.png` | Numero do Pedido — passo Revisão com de→para visível |
| 006 | `006-numero_pedido-resultado.png` | Numero do Pedido — lista após aplicar |
| 007 | `007-tipo_operacao_pedido-selecao.png` | Tipo de Operacao — passo Revisão com de→para visível |
| 007 | `007-tipo_operacao_pedido-resultado.png` | Tipo de Operacao — lista após aplicar |
| 008 | `008-status_pedido-selecao.png` | Status do Pedido — passo Revisão com de→para visível |
| 008 | `008-status_pedido-resultado.png` | Status do Pedido — lista após aplicar |
| 009 | `009-nome_exportador-selecao.png` | Exportador — Nome — passo Revisão com de→para visível |
| 009 | `009-nome_exportador-resultado.png` | Exportador — Nome — lista após aplicar |
| 010 | `010-endereco_exportador-selecao.png` | Exportador — Endereco — passo Revisão com de→para visível |
| 010 | `010-endereco_exportador-resultado.png` | Exportador — Endereco — lista após aplicar |
| 011 | `011-pais_exportador-selecao.png` | Exportador — Pais — passo Revisão com de→para visível |
| 011 | `011-pais_exportador-resultado.png` | Exportador — Pais — lista após aplicar |
| 012 | `012-estado_exportador-selecao.png` | Exportador — Estado — passo Revisão com de→para visível |
| 012 | `012-estado_exportador-resultado.png` | Exportador — Estado — lista após aplicar |
| 013 | `013-cidade_exportador-selecao.png` | Exportador — Cidade — passo Revisão com de→para visível |
| 013 | `013-cidade_exportador-resultado.png` | Exportador — Cidade — lista após aplicar |
| 014 | `014-zip_code_exportador-selecao.png` | Exportador — ZIP Code — passo Revisão com de→para visível |
| 014 | `014-zip_code_exportador-resultado.png` | Exportador — ZIP Code — lista após aplicar |
| 015 | `015-exportador_ou_fabricante-selecao.png` | Exportador ou Fabricante — passo Revisão com de→para visível |
| 015 | `015-exportador_ou_fabricante-resultado.png` | Exportador ou Fabricante — lista após aplicar |
| 016 | `016-relacao_exportador_fabricante-selecao.png` | Relacao Export./Fabric. — passo Revisão com de→para visível |
| 016 | `016-relacao_exportador_fabricante-resultado.png` | Relacao Export./Fabric. — lista após aplicar |
| 017 | `017-nome_contato_exportador-selecao.png` | Contato Export. — Nome — passo Revisão com de→para visível |
| 017 | `017-nome_contato_exportador-resultado.png` | Contato Export. — Nome — lista após aplicar |
| 018 | `018-email_contato_exportador-selecao.png` | Contato Export. — Email — passo Revisão com de→para visível |
| 018 | `018-email_contato_exportador-resultado.png` | Contato Export. — Email — lista após aplicar |
| 019 | `019-whatsapp_contato_exportador-selecao.png` | Contato Export. — WhatsApp — passo Revisão com de→para visível |
| 019 | `019-whatsapp_contato_exportador-resultado.png` | Contato Export. — WhatsApp — lista após aplicar |
| 020 | `020-cargo_contato_exportador-selecao.png` | Contato Export. — Cargo — passo Revisão com de→para visível |
| 020 | `020-cargo_contato_exportador-resultado.png` | Contato Export. — Cargo — lista após aplicar |
| 021 | `021-departamento_contato_exportador-selecao.png` | Contato Export. — Depto. — passo Revisão com de→para visível |
| 021 | `021-departamento_contato_exportador-resultado.png` | Contato Export. — Depto. — lista após aplicar |
| 022 | `022-nome_importador-selecao.png` | Importador — Nome — passo Revisão com de→para visível |
| 022 | `022-nome_importador-resultado.png` | Importador — Nome — lista após aplicar |
| 023 | `023-cnpj_importador_pedido-selecao.png` | Importador — CNPJ — passo Revisão com de→para visível |
| 023 | `023-cnpj_importador_pedido-resultado.png` | Importador — CNPJ — lista após aplicar |
| 024 | `024-nome_fabricante-selecao.png` | Fabricante — Nome — passo Revisão com de→para visível |
| 024 | `024-nome_fabricante-resultado.png` | Fabricante — Nome — lista após aplicar |
| 025 | `025-endereco_fabricante-selecao.png` | Fabricante — Endereco — passo Revisão com de→para visível |
| 025 | `025-endereco_fabricante-resultado.png` | Fabricante — Endereco — lista após aplicar |
| 026 | `026-pais_fabricante-selecao.png` | Fabricante — Pais — passo Revisão com de→para visível |
| 026 | `026-pais_fabricante-resultado.png` | Fabricante — Pais — lista após aplicar |
| 027 | `027-estado_fabricante-selecao.png` | Fabricante — Estado — passo Revisão com de→para visível |
| 027 | `027-estado_fabricante-resultado.png` | Fabricante — Estado — lista após aplicar |
| 028 | `028-cidade_fabricante-selecao.png` | Fabricante — Cidade — passo Revisão com de→para visível |
| 028 | `028-cidade_fabricante-resultado.png` | Fabricante — Cidade — lista após aplicar |
| 029 | `029-zip_code_fabricante-selecao.png` | Fabricante — ZIP Code — passo Revisão com de→para visível |
| 029 | `029-zip_code_fabricante-resultado.png` | Fabricante — ZIP Code — lista após aplicar |
| 030 | `030-referencia_importador_pedido-selecao.png` | Referencia Importador — passo Revisão com de→para visível |
| 030 | `030-referencia_importador_pedido-resultado.png` | Referencia Importador — lista após aplicar |
| 031 | `031-referencia_exportador_pedido-selecao.png` | Referencia Exportador — passo Revisão com de→para visível |
| 031 | `031-referencia_exportador_pedido-resultado.png` | Referencia Exportador — lista após aplicar |
| 032 | `032-numero_proforma_pedido-selecao.png` | No Proforma — passo Revisão com de→para visível |
| 032 | `032-numero_proforma_pedido-resultado.png` | No Proforma — lista após aplicar |
| 033 | `033-numero_invoice_pedido-selecao.png` | No Invoice — passo Revisão com de→para visível |
| 033 | `033-numero_invoice_pedido-resultado.png` | No Invoice — lista após aplicar |
| 034 | `034-referencia_fabricante_pedido-selecao.png` | Referencia Fabricante — passo Revisão com de→para visível |
| 034 | `034-referencia_fabricante_pedido-resultado.png` | Referencia Fabricante — lista após aplicar |
| 035 | `035-codigo_ope-selecao.png` | OPE — Codigo — passo Revisão com de→para visível |
| 035 | `035-codigo_ope-resultado.png` | OPE — Codigo — lista após aplicar |
| 036 | `036-nome_ope-selecao.png` | OPE — Nome — passo Revisão com de→para visível |
| 036 | `036-nome_ope-resultado.png` | OPE — Nome — lista após aplicar |
| 037 | `037-endereco_ope-selecao.png` | OPE — Endereco — passo Revisão com de→para visível |
| 037 | `037-endereco_ope-resultado.png` | OPE — Endereco — lista após aplicar |
| 038 | `038-pais_ope-selecao.png` | OPE — Pais — passo Revisão com de→para visível |
| 038 | `038-pais_ope-resultado.png` | OPE — Pais — lista após aplicar |
| 039 | `039-estado_ope-selecao.png` | OPE — Estado — passo Revisão com de→para visível |
| 039 | `039-estado_ope-resultado.png` | OPE — Estado — lista após aplicar |
| 040 | `040-cidade_ope-selecao.png` | OPE — Cidade — passo Revisão com de→para visível |
| 040 | `040-cidade_ope-resultado.png` | OPE — Cidade — lista após aplicar |
| 041 | `041-zip_code_ope-selecao.png` | OPE — ZIP Code — passo Revisão com de→para visível |
| 041 | `041-zip_code_ope-resultado.png` | OPE — ZIP Code — lista após aplicar |
| 042 | `042-tin_ope-selecao.png` | OPE — TIN — passo Revisão com de→para visível |
| 042 | `042-tin_ope-resultado.png` | OPE — TIN — lista após aplicar |
| 043 | `043-email_ope-selecao.png` | OPE — Email — passo Revisão com de→para visível |
| 043 | `043-email_ope-resultado.png` | OPE — Email — lista após aplicar |
| 044 | `044-situacao_ope-selecao.png` | OPE — Situacao — passo Revisão com de→para visível |
| 044 | `044-situacao_ope-resultado.png` | OPE — Situacao — lista após aplicar |
| 045 | `045-versao_ope-selecao.png` | OPE — Versao — passo Revisão com de→para visível |
| 045 | `045-versao_ope-resultado.png` | OPE — Versao — lista após aplicar |
| 046 | `046-cnpj_raiz_empresa_responsavel-selecao.png` | CNPJ Raiz Empresa Responsavel — passo Revisão com de→para visível |
| 046 | `046-cnpj_raiz_empresa_responsavel-resultado.png` | CNPJ Raiz Empresa Responsavel — lista após aplicar |
| 047 | `047-incoterm_pedido-selecao.png` | Incoterm — passo Revisão com de→para visível |
| 047 | `047-incoterm_pedido-resultado.png` | Incoterm — lista após aplicar |
| 048 | `048-moeda_pedido-selecao.png` | Moeda do Pedido — passo Revisão com de→para visível |
| 048 | `048-moeda_pedido-resultado.png` | Moeda do Pedido — lista após aplicar |
| 049 | `049-unidade_comercializada_pedido-selecao.png` | Unidade Comercializada do Pedido — passo Revisão com de→para visível |
| 049 | `049-unidade_comercializada_pedido-resultado.png` | Unidade Comercializada do Pedido — lista após aplicar |
| 050 | `050-condicao_pagamento_pedido-selecao.png` | Condicao de Pagamento — Comercial — passo Revisão com de→para visível |
| 050 | `050-condicao_pagamento_pedido-resultado.png` | Condicao de Pagamento — Comercial — lista após aplicar |
| 051 | `051-condicao_pagamento_siscomex_pedido-selecao.png` | Condicao de Pagamento — Siscomex — passo Revisão com de→para visível |
| 051 | `051-condicao_pagamento_siscomex_pedido-resultado.png` | Condicao de Pagamento — Siscomex — lista após aplicar |
| 052 | `052-tipo_volume_pedido-selecao.png` | Tipo Volume Pedido — passo Revisão com de→para visível |
| 052 | `052-tipo_volume_pedido-resultado.png` | Tipo Volume Pedido — lista após aplicar |
| 053 | `053-quantidade_volumes_pedido-selecao.png` | Qtd. de Volumes — passo Revisão com de→para visível |
| 053 | `053-quantidade_volumes_pedido-resultado.png` | Qtd. de Volumes — lista após aplicar |
| 054 | `054-tipo_volume_item-selecao.png` | Tipo Volume Item — passo Revisão com de→para visível |
| 054 | `054-tipo_volume_item-resultado.png` | Tipo Volume Item — lista após aplicar |
| 055 | `055-cobertura_cambial_pedido-selecao.png` | Cobertura Cambial — passo Revisão com de→para visível |
| 055 | `055-cobertura_cambial_pedido-resultado.png` | Cobertura Cambial — lista após aplicar |
| 056 | `056-valor_total_cambio_pedido-selecao.png` | Valor Total Cambio — passo Revisão com de→para visível |
| 056 | `056-valor_total_cambio_pedido-resultado.png` | Valor Total Cambio — lista após aplicar |
| 057 | `057-moeda_cambio_pedido-selecao.png` | Moeda Cambio — passo Revisão com de→para visível |
| 057 | `057-moeda_cambio_pedido-resultado.png` | Moeda Cambio — lista após aplicar |
| 058 | `058-taxa_cambio_estimada_pedido-selecao.png` | Taxa Cambio Estimada — passo Revisão com de→para visível |
| 058 | `058-taxa_cambio_estimada_pedido-resultado.png` | Taxa Cambio Estimada — lista após aplicar |
| 059 | `059-contrato_cambio_id_pedido-selecao.png` | Contrato de Cambio (ID) — passo Revisão com de→para visível |
| 059 | `059-contrato_cambio_id_pedido-resultado.png` | Contrato de Cambio (ID) — lista após aplicar |
| 060 | `060-porto_origem-selecao.png` | Porto de Origem — passo Revisão com de→para visível |
| 060 | `060-porto_origem-resultado.png` | Porto de Origem — lista após aplicar |
| 061 | `061-porto_destino-selecao.png` | Porto de Destino — passo Revisão com de→para visível |
| 061 | `061-porto_destino-resultado.png` | Porto de Destino — lista após aplicar |
| 062 | `062-local_de_origem-selecao.png` | País origem — passo Revisão com de→para visível |
| 062 | `062-local_de_origem-resultado.png` | País origem — lista após aplicar |
| 063 | `063-local_de_destino-selecao.png` | País destino — passo Revisão com de→para visível |
| 063 | `063-local_de_destino-resultado.png` | País destino — lista após aplicar |
| 064 | `064-aeroporto_origem-selecao.png` | Aeroporto de Origem — passo Revisão com de→para visível |
| 064 | `064-aeroporto_origem-resultado.png` | Aeroporto de Origem — lista após aplicar |
| 065 | `065-aeroporto_destino-selecao.png` | Aeroporto de Destino — passo Revisão com de→para visível |
| 065 | `065-aeroporto_destino-resultado.png` | Aeroporto de Destino — lista após aplicar |
| 066 | `066-data_embarque_origem-selecao.png` | Data de Embarque na Origem — passo Revisão com de→para visível |
| 066 | `066-data_embarque_origem-resultado.png` | Data de Embarque na Origem — lista após aplicar |
| 067 | `067-data_emissao_pedido-selecao.png` | Data de Emissao — passo Revisão com de→para visível |
| 067 | `067-data_emissao_pedido-resultado.png` | Data de Emissao — lista após aplicar |
| 068 | `068-data_documento_pedido-selecao.png` | Data do Documento — passo Revisão com de→para visível |
| 068 | `068-data_documento_pedido-resultado.png` | Data do Documento — lista após aplicar |
| 069 | `069-data_documento_proforma_pedido-selecao.png` | Data do Documento Proforma — passo Revisão com de→para visível |
| 069 | `069-data_documento_proforma_pedido-resultado.png` | Data do Documento Proforma — lista após aplicar |
| 070 | `070-data_documento_invoice_pedido-selecao.png` | Data do Documento Invoice — passo Revisão com de→para visível |
| 070 | `070-data_documento_invoice_pedido-resultado.png` | Data do Documento Invoice — lista após aplicar |
| 071 | `071-data_prevista_pedido_pronto-selecao.png` | Data Prevista — Pedido Pronto — passo Revisão com de→para visível |
| 071 | `071-data_prevista_pedido_pronto-resultado.png` | Data Prevista — Pedido Pronto — lista após aplicar |
| 072 | `072-data_confirmada_pedido_pronto-selecao.png` | Data Confirmada — Pedido Pronto — passo Revisão com de→para visível |
| 072 | `072-data_confirmada_pedido_pronto-resultado.png` | Data Confirmada — Pedido Pronto — lista após aplicar |
| 073 | `073-data_meta_pedido_pronto-selecao.png` | Data Meta — Pedido Pronto — passo Revisão com de→para visível |
| 073 | `073-data_meta_pedido_pronto-resultado.png` | Data Meta — Pedido Pronto — lista após aplicar |
| 074 | `074-data_prevista_inspecao_pedido-selecao.png` | Data Prevista — Inspecao — passo Revisão com de→para visível |
| 074 | `074-data_prevista_inspecao_pedido-resultado.png` | Data Prevista — Inspecao — lista após aplicar |
| 075 | `075-data_confirmada_inspecao_pedido-selecao.png` | Data Confirmada — Inspecao — passo Revisão com de→para visível |
| 075 | `075-data_confirmada_inspecao_pedido-resultado.png` | Data Confirmada — Inspecao — lista após aplicar |
| 076 | `076-data_meta_inspecao_pedido-selecao.png` | Data Meta — Inspecao — passo Revisão com de→para visível |
| 076 | `076-data_meta_inspecao_pedido-resultado.png` | Data Meta — Inspecao — lista após aplicar |
| 077 | `077-data_prevista_coleta_pedido-selecao.png` | Data Prevista — Coleta — passo Revisão com de→para visível |
| 077 | `077-data_prevista_coleta_pedido-resultado.png` | Data Prevista — Coleta — lista após aplicar |
| 078 | `078-data_confirmada_coleta_pedido-selecao.png` | Data Confirmada — Coleta — passo Revisão com de→para visível |
| 078 | `078-data_confirmada_coleta_pedido-resultado.png` | Data Confirmada — Coleta — lista após aplicar |
| 079 | `079-data_meta_coleta_pedido-selecao.png` | Data Meta — Coleta — passo Revisão com de→para visível |
| 079 | `079-data_meta_coleta_pedido-resultado.png` | Data Meta — Coleta — lista após aplicar |
| 080 | `080-data_transferencia_saldo_pedido-selecao.png` | Data de Transferencia de Saldo — passo Revisão com de→para visível |
| 080 | `080-data_transferencia_saldo_pedido-resultado.png` | Data de Transferencia de Saldo — lista após aplicar |
| 081 | `081-data_previsao_recebimento_rascunho_pedido-selecao.png` | Draft Pedido — Prev. Recebimento — passo Revisão com de→para visível |
| 081 | `081-data_previsao_recebimento_rascunho_pedido-resultado.png` | Draft Pedido — Prev. Recebimento — lista após aplicar |
| 082 | `082-data_confirmacao_recebimento_rascunho_pedido-selecao.png` | Draft Pedido — Conf. Recebimento — passo Revisão com de→para visível |
| 082 | `082-data_confirmacao_recebimento_rascunho_pedido-resultado.png` | Draft Pedido — Conf. Recebimento — lista após aplicar |
| 083 | `083-data_meta_recebimento_rascunho_pedido-selecao.png` | Draft Pedido — Meta Recebimento — passo Revisão com de→para visível |
| 083 | `083-data_meta_recebimento_rascunho_pedido-resultado.png` | Draft Pedido — Meta Recebimento — lista após aplicar |
| 084 | `084-data_previsao_aprovacao_rascunho_pedido-selecao.png` | Draft Pedido — Prev. Aprovacao — passo Revisão com de→para visível |
| 084 | `084-data_previsao_aprovacao_rascunho_pedido-resultado.png` | Draft Pedido — Prev. Aprovacao — lista após aplicar |
| 085 | `085-data_confirmacao_aprovacao_rascunho_pedido-selecao.png` | Draft Pedido — Conf. Aprovacao — passo Revisão com de→para visível |
| 085 | `085-data_confirmacao_aprovacao_rascunho_pedido-resultado.png` | Draft Pedido — Conf. Aprovacao — lista após aplicar |
| 086 | `086-data_meta_aprovacao_rascunho_pedido-selecao.png` | Draft Pedido — Meta Aprovacao — passo Revisão com de→para visível |
| 086 | `086-data_meta_aprovacao_rascunho_pedido-resultado.png` | Draft Pedido — Meta Aprovacao — lista após aplicar |
| 087 | `087-data_previsao_recebimento_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Prev. Recebimento — passo Revisão com de→para visível |
| 087 | `087-data_previsao_recebimento_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Prev. Recebimento — lista após aplicar |
| 088 | `088-data_confirmacao_recebimento_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Conf. Recebimento — passo Revisão com de→para visível |
| 088 | `088-data_confirmacao_recebimento_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Conf. Recebimento — lista após aplicar |
| 089 | `089-data_meta_recebimento_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Meta Recebimento — passo Revisão com de→para visível |
| 089 | `089-data_meta_recebimento_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Meta Recebimento — lista após aplicar |
| 090 | `090-data_previsao_aprovacao_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Prev. Aprovacao — passo Revisão com de→para visível |
| 090 | `090-data_previsao_aprovacao_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Prev. Aprovacao — lista após aplicar |
| 091 | `091-data_confirmacao_aprovacao_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Conf. Aprovacao — passo Revisão com de→para visível |
| 091 | `091-data_confirmacao_aprovacao_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Conf. Aprovacao — lista após aplicar |
| 092 | `092-data_meta_aprovacao_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Meta Aprovacao — passo Revisão com de→para visível |
| 092 | `092-data_meta_aprovacao_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Meta Aprovacao — lista após aplicar |
| 093 | `093-data_previsao_envio_original_proforma_pedido-selecao.png` | Original Proforma — Prev. Envio — passo Revisão com de→para visível |
| 093 | `093-data_previsao_envio_original_proforma_pedido-resultado.png` | Original Proforma — Prev. Envio — lista após aplicar |
| 094 | `094-data_confirmacao_envio_original_proforma_pedido-selecao.png` | Original Proforma — Conf. Envio — passo Revisão com de→para visível |
| 094 | `094-data_confirmacao_envio_original_proforma_pedido-resultado.png` | Original Proforma — Conf. Envio — lista após aplicar |
| 095 | `095-data_meta_envio_original_proforma_pedido-selecao.png` | Original Proforma — Meta Envio — passo Revisão com de→para visível |
| 095 | `095-data_meta_envio_original_proforma_pedido-resultado.png` | Original Proforma — Meta Envio — lista após aplicar |
| 096 | `096-data_previsao_recebimento_original_proforma_pedido-selecao.png` | Original Proforma — Prev. Recebimento — passo Revisão com de→para visível |
| 096 | `096-data_previsao_recebimento_original_proforma_pedido-resultado.png` | Original Proforma — Prev. Recebimento — lista após aplicar |
| 097 | `097-data_confirmacao_recebimento_original_proforma_pedido-selecao.png` | Original Proforma — Conf. Recebimento — passo Revisão com de→para visível |
| 097 | `097-data_confirmacao_recebimento_original_proforma_pedido-resultado.png` | Original Proforma — Conf. Recebimento — lista após aplicar |
| 098 | `098-data_meta_recebimento_original_proforma_pedido-selecao.png` | Original Proforma — Meta Recebimento — passo Revisão com de→para visível |
| 098 | `098-data_meta_recebimento_original_proforma_pedido-resultado.png` | Original Proforma — Meta Recebimento — lista após aplicar |
| 099 | `099-data_proforma_invoice-selecao.png` | Data da Proforma Invoice — passo Revisão com de→para visível |
| 099 | `099-data_proforma_invoice-resultado.png` | Data da Proforma Invoice — lista após aplicar |
| 100 | `100-data_previsao_recebimento_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Prev. Recebimento — passo Revisão com de→para visível |
| 100 | `100-data_previsao_recebimento_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Prev. Recebimento — lista após aplicar |
| 101 | `101-data_confirmacao_recebimento_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Conf. Recebimento — passo Revisão com de→para visível |
| 101 | `101-data_confirmacao_recebimento_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Conf. Recebimento — lista após aplicar |
| 102 | `102-data_meta_recebimento_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Meta Recebimento — passo Revisão com de→para visível |
| 102 | `102-data_meta_recebimento_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Meta Recebimento — lista após aplicar |
| 103 | `103-data_previsao_aprovacao_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Prev. Aprovacao — passo Revisão com de→para visível |
| 103 | `103-data_previsao_aprovacao_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Prev. Aprovacao — lista após aplicar |
| 104 | `104-data_confirmacao_aprovacao_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Conf. Aprovacao — passo Revisão com de→para visível |
| 104 | `104-data_confirmacao_aprovacao_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Conf. Aprovacao — lista após aplicar |
| 105 | `105-data_meta_aprovacao_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Meta Aprovacao — passo Revisão com de→para visível |
| 105 | `105-data_meta_aprovacao_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Meta Aprovacao — lista após aplicar |
| 106 | `106-data_previsao_envio_original_invoice_pedido-selecao.png` | Original Invoice — Prev. Envio — passo Revisão com de→para visível |
| 106 | `106-data_previsao_envio_original_invoice_pedido-resultado.png` | Original Invoice — Prev. Envio — lista após aplicar |
| 107 | `107-data_confirmacao_envio_original_invoice_pedido-selecao.png` | Original Invoice — Conf. Envio — passo Revisão com de→para visível |
| 107 | `107-data_confirmacao_envio_original_invoice_pedido-resultado.png` | Original Invoice — Conf. Envio — lista após aplicar |
| 108 | `108-data_meta_envio_original_invoice_pedido-selecao.png` | Original Invoice — Meta Envio — passo Revisão com de→para visível |
| 108 | `108-data_meta_envio_original_invoice_pedido-resultado.png` | Original Invoice — Meta Envio — lista após aplicar |
| 109 | `109-data_previsao_recebimento_original_invoice_pedido-selecao.png` | Original Invoice — Prev. Recebimento — passo Revisão com de→para visível |
| 109 | `109-data_previsao_recebimento_original_invoice_pedido-resultado.png` | Original Invoice — Prev. Recebimento — lista após aplicar |
| 110 | `110-data_confirmacao_recebimento_original_invoice_pedido-selecao.png` | Original Invoice — Conf. Recebimento — passo Revisão com de→para visível |
| 110 | `110-data_confirmacao_recebimento_original_invoice_pedido-resultado.png` | Original Invoice — Conf. Recebimento — lista após aplicar |
| 111 | `111-data_meta_recebimento_original_invoice_pedido-selecao.png` | Original Invoice — Meta Recebimento — passo Revisão com de→para visível |
| 111 | `111-data_meta_recebimento_original_invoice_pedido-resultado.png` | Original Invoice — Meta Recebimento — lista após aplicar |
| 112 | `112-data_invoice-selecao.png` | Data da Invoice — passo Revisão com de→para visível |
| 112 | `112-data_invoice-resultado.png` | Data da Invoice — lista após aplicar |
| 113 | `113-casas_decimais_valor_pedido-selecao.png` | Casas Decimais — Valor — passo Revisão com de→para visível |
| 113 | `113-casas_decimais_valor_pedido-resultado.png` | Casas Decimais — Valor — lista após aplicar |
| 114 | `114-casas_decimais_quantidade_pedido-selecao.png` | Casas Decimais — Qtd. — passo Revisão com de→para visível |
| 114 | `114-casas_decimais_quantidade_pedido-resultado.png` | Casas Decimais — Qtd. — lista após aplicar |
| 115 | `115-casas_decimais_peso_pedido-selecao.png` | Casas Decimais — Peso — passo Revisão com de→para visível |
| 115 | `115-casas_decimais_peso_pedido-resultado.png` | Casas Decimais — Peso — lista após aplicar |
| 116 | `116-casas_decimais_cubagem_pedido-selecao.png` | Casas Decimais — Cubagem — passo Revisão com de→para visível |
| 116 | `116-casas_decimais_cubagem_pedido-resultado.png` | Casas Decimais — Cubagem — lista após aplicar |
| 117 | `117-sequencia_item_pedido-selecao.png` | Sequencia do Item — passo Revisão com de→para visível |
| 117 | `117-sequencia_item_pedido-resultado.png` | Sequencia do Item — lista após aplicar |
| 118 | `118-part_number_item-selecao.png` | Part Number — passo Revisão com de→para visível |
| 118 | `118-part_number_item-resultado.png` | Part Number — lista após aplicar |
| 119 | `119-ncm_item-selecao.png` | NCM — passo Revisão com de→para visível |
| 119 | `119-ncm_item-resultado.png` | NCM — lista após aplicar |
| 120 | `120-descricao_item-selecao.png` | Descricao do Item — passo Revisão com de→para visível |
| 120 | `120-descricao_item-resultado.png` | Descricao do Item — lista após aplicar |
| 121 | `121-unidade_comercializada_item-selecao.png` | Unidade Comercializada do Item — passo Revisão com de→para visível |
| 121 | `121-unidade_comercializada_item-resultado.png` | Unidade Comercializada do Item — lista após aplicar |
| 122 | `122-tipo_operacao_item-selecao.png` | Tipo de Operacao (Item) — passo Revisão com de→para visível |
| 122 | `122-tipo_operacao_item-resultado.png` | Tipo de Operacao (Item) — lista após aplicar |
| 123 | `123-descricao_completa_item_pt-selecao.png` | Descricao Completa (PT) — passo Revisão com de→para visível |
| 123 | `123-descricao_completa_item_pt-resultado.png` | Descricao Completa (PT) — lista após aplicar |
| 124 | `124-descricao_completa_item_en-selecao.png` | Descricao Completa (EN) — passo Revisão com de→para visível |
| 124 | `124-descricao_completa_item_en-resultado.png` | Descricao Completa (EN) — lista após aplicar |
| 125 | `125-descricao_completa_item_es-selecao.png` | Descricao Completa (ES) — passo Revisão com de→para visível |
| 125 | `125-descricao_completa_item_es-resultado.png` | Descricao Completa (ES) — lista após aplicar |
| 126 | `126-descricao_completa_item_nf-selecao.png` | Descricao Completa (NF) — passo Revisão com de→para visível |
| 126 | `126-descricao_completa_item_nf-resultado.png` | Descricao Completa (NF) — lista após aplicar |
| 127 | `127-texto_posicao_ncm-selecao.png` | Texto Posicao NCM — passo Revisão com de→para visível |
| 127 | `127-texto_posicao_ncm-resultado.png` | Texto Posicao NCM — lista após aplicar |
| 128 | `128-grupo_item-selecao.png` | Grupo do Item — passo Revisão com de→para visível |
| 128 | `128-grupo_item-resultado.png` | Grupo do Item — lista após aplicar |
| 129 | `129-subgrupo_item-selecao.png` | Subgrupo do Item — passo Revisão com de→para visível |
| 129 | `129-subgrupo_item-resultado.png` | Subgrupo do Item — lista após aplicar |
| 130 | `130-campo_especial_item-selecao.png` | Campo Especial do Item — passo Revisão com de→para visível |
| 130 | `130-campo_especial_item-resultado.png` | Campo Especial do Item — lista após aplicar |
| 131 | `131-atributos_catalogo-selecao.png` | Atributos de Catalogo — passo Revisão com de→para visível |
| 131 | `131-atributos_catalogo-resultado.png` | Atributos de Catalogo — lista após aplicar |
| 132 | `132-quantidade_inicial_item-selecao.png` | Qtd. Inicial — passo Revisão com de→para visível |
| 132 | `132-quantidade_inicial_item-resultado.png` | Qtd. Inicial — lista após aplicar |
| 133 | `133-quantidade_pronta_item-selecao.png` | Qtd. Pronta Total — passo Revisão com de→para visível |
| 133 | `133-quantidade_pronta_item-resultado.png` | Qtd. Pronta Total — lista após aplicar |
| 134 | `134-quantidade_cancelada_item-selecao.png` | Qtd. Cancelada — passo Revisão com de→para visível |
| 134 | `134-quantidade_cancelada_item-resultado.png` | Qtd. Cancelada — lista após aplicar |
| 135 | `135-casas_decimais_quantidade_item-selecao.png` | Casas Decimais — Qtd. — passo Revisão com de→para visível |
| 135 | `135-casas_decimais_quantidade_item-resultado.png` | Casas Decimais — Qtd. — lista após aplicar |
| 136 | `136-moeda_item-selecao.png` | Moeda do Item — passo Revisão com de→para visível |
| 136 | `136-moeda_item-resultado.png` | Moeda do Item — lista após aplicar |
| 137 | `137-valor_por_unidade_item-selecao.png` | Valor por Unidade — passo Revisão com de→para visível |
| 137 | `137-valor_por_unidade_item-resultado.png` | Valor por Unidade — lista após aplicar |
| 138 | `138-casas_decimais_valor_item-selecao.png` | Casas Decimais — Valor — passo Revisão com de→para visível |
| 138 | `138-casas_decimais_valor_item-resultado.png` | Casas Decimais — Valor — lista após aplicar |
| 139 | `139-cobertura_cambial_item-selecao.png` | Cobertura Cambial — passo Revisão com de→para visível |
| 139 | `139-cobertura_cambial_item-resultado.png` | Cobertura Cambial — lista após aplicar |
| 140 | `140-condicao_pagamento_siscomex_item-selecao.png` | Condicao de Pagamento — Siscomex — passo Revisão com de→para visível |
| 140 | `140-condicao_pagamento_siscomex_item-resultado.png` | Condicao de Pagamento — Siscomex — lista após aplicar |
| 141 | `141-incoterm_item-selecao.png` | Incoterm (Item) — passo Revisão com de→para visível |
| 141 | `141-incoterm_item-resultado.png` | Incoterm (Item) — lista após aplicar |
| 142 | `142-condicao_pagamento_item-selecao.png` | Condicao de Pagamento — Comercial (Item) — passo Revisão com de→para visível |
| 142 | `142-condicao_pagamento_item-resultado.png` | Condicao de Pagamento — Comercial (Item) — lista após aplicar |
| 143 | `143-nome_exportador_item-selecao.png` | Exportador (Item) — passo Revisão com de→para visível |
| 143 | `143-nome_exportador_item-resultado.png` | Exportador (Item) — lista após aplicar |
| 144 | `144-nome_importador_item-selecao.png` | Importador (Item) — passo Revisão com de→para visível |
| 144 | `144-nome_importador_item-resultado.png` | Importador (Item) — lista após aplicar |
| 145 | `145-nome_fabricante_item-selecao.png` | Fabricante (Item) — passo Revisão com de→para visível |
| 145 | `145-nome_fabricante_item-resultado.png` | Fabricante (Item) — lista após aplicar |
| 146 | `146-referencia_importador_item-selecao.png` | Referencia Importador (Item) — passo Revisão com de→para visível |
| 146 | `146-referencia_importador_item-resultado.png` | Referencia Importador (Item) — lista após aplicar |
| 147 | `147-referencia_exportador_item-selecao.png` | Referencia Exportador (Item) — passo Revisão com de→para visível |
| 147 | `147-referencia_exportador_item-resultado.png` | Referencia Exportador (Item) — lista após aplicar |
| 148 | `148-referencia_fabricante_item-selecao.png` | Referencia Fabricante (Item) — passo Revisão com de→para visível |
| 148 | `148-referencia_fabricante_item-resultado.png` | Referencia Fabricante (Item) — lista após aplicar |
| 149 | `149-numero_proforma_item-selecao.png` | No Proforma (Item) — passo Revisão com de→para visível |
| 149 | `149-numero_proforma_item-resultado.png` | No Proforma (Item) — lista após aplicar |
| 150 | `150-numero_invoice_item-selecao.png` | No Invoice (Item) — passo Revisão com de→para visível |
| 150 | `150-numero_invoice_item-resultado.png` | No Invoice (Item) — lista após aplicar |
| 151 | `151-tipo_embalagem-selecao.png` | Tipo de Embalagem — passo Revisão com de→para visível |
| 151 | `151-tipo_embalagem-resultado.png` | Tipo de Embalagem — lista após aplicar |
| 152 | `152-numero_lpco-selecao.png` | No LPCO — passo Revisão com de→para visível |
| 152 | `152-numero_lpco-resultado.png` | No LPCO — lista após aplicar |
| 153 | `153-numero_certificado_origem-selecao.png` | No Certificado de Origem — passo Revisão com de→para visível |
| 153 | `153-numero_certificado_origem-resultado.png` | No Certificado de Origem — lista após aplicar |
| 154 | `154-data_certificado_origem-selecao.png` | Data Certificado de Origem — passo Revisão com de→para visível |
| 154 | `154-data_certificado_origem-resultado.png` | Data Certificado de Origem — lista após aplicar |
| 155 | `155-peso_liquido_unitario_item-selecao.png` | Peso Liquido Unitario — passo Revisão com de→para visível |
| 155 | `155-peso_liquido_unitario_item-resultado.png` | Peso Liquido Unitario — lista após aplicar |
| 156 | `156-peso_bruto_unitario_item-selecao.png` | Peso Bruto Unitario — passo Revisão com de→para visível |
| 156 | `156-peso_bruto_unitario_item-resultado.png` | Peso Bruto Unitario — lista após aplicar |
| 157 | `157-cubagem_unitaria_item-selecao.png` | Cubagem Unitaria — passo Revisão com de→para visível |
| 157 | `157-cubagem_unitaria_item-resultado.png` | Cubagem Unitaria — lista após aplicar |
| 158 | `158-casas_decimais_peso_item-selecao.png` | Casas Decimais — Peso — passo Revisão com de→para visível |
| 158 | `158-casas_decimais_peso_item-resultado.png` | Casas Decimais — Peso — lista após aplicar |
| 159 | `159-casas_decimais_cubagem_item-selecao.png` | Casas Decimais — Cubagem — passo Revisão com de→para visível |
| 159 | `159-casas_decimais_cubagem_item-resultado.png` | Casas Decimais — Cubagem — lista após aplicar |
| 160 | `160-data_emissao_item-selecao.png` | Data de Emissao (Item) — passo Revisão com de→para visível |
| 160 | `160-data_emissao_item-resultado.png` | Data de Emissao (Item) — lista após aplicar |
| 161 | `161-data_consolidacao_item-selecao.png` | Data de Consolidacao (Item) — passo Revisão com de→para visível |
| 161 | `161-data_consolidacao_item-resultado.png` | Data de Consolidacao (Item) — lista após aplicar |
| 162 | `162-data_embarque_item-selecao.png` | Data de Embarque (Item) — passo Revisão com de→para visível |
| 162 | `162-data_embarque_item-resultado.png` | Data de Embarque (Item) — lista após aplicar |
| 163 | `163-data_prevista_item_pronto-selecao.png` | Data Prevista — Item Pronto — passo Revisão com de→para visível |
| 163 | `163-data_prevista_item_pronto-resultado.png` | Data Prevista — Item Pronto — lista após aplicar |
| 164 | `164-data_confirmada_item_pronto-selecao.png` | Data Confirmada — Item Pronto — passo Revisão com de→para visível |
| 164 | `164-data_confirmada_item_pronto-resultado.png` | Data Confirmada — Item Pronto — lista após aplicar |
| 165 | `165-data_meta_item_pronto-selecao.png` | Data Meta — Item Pronto — passo Revisão com de→para visível |
| 165 | `165-data_meta_item_pronto-resultado.png` | Data Meta — Item Pronto — lista após aplicar |
| 166 | `166-data_prevista_inspecao_item-selecao.png` | Data Prevista — Inspecao (Item) — passo Revisão com de→para visível |
| 166 | `166-data_prevista_inspecao_item-resultado.png` | Data Prevista — Inspecao (Item) — lista após aplicar |
| 167 | `167-data_confirmada_inspecao_item-selecao.png` | Data Confirmada — Inspecao (Item) — passo Revisão com de→para visível |
| 167 | `167-data_confirmada_inspecao_item-resultado.png` | Data Confirmada — Inspecao (Item) — lista após aplicar |
| 168 | `168-data_meta_inspecao_item-selecao.png` | Data Meta — Inspecao (Item) — passo Revisão com de→para visível |
| 168 | `168-data_meta_inspecao_item-resultado.png` | Data Meta — Inspecao (Item) — lista após aplicar |
| 169 | `169-data_prevista_coleta_item-selecao.png` | Data Prevista — Coleta (Item) — passo Revisão com de→para visível |
| 169 | `169-data_prevista_coleta_item-resultado.png` | Data Prevista — Coleta (Item) — lista após aplicar |
| 170 | `170-data_confirmada_coleta_item-selecao.png` | Data Confirmada — Coleta (Item) — passo Revisão com de→para visível |
| 170 | `170-data_confirmada_coleta_item-resultado.png` | Data Confirmada — Coleta (Item) — lista após aplicar |
| 171 | `171-data_meta_coleta_item-selecao.png` | Data Meta — Coleta (Item) — passo Revisão com de→para visível |
| 171 | `171-data_meta_coleta_item-resultado.png` | Data Meta — Coleta (Item) — lista após aplicar |
| 172 | `172-combinado-incoterm-selecao.png` | Combinado: incoterm — preview de→para pedido+itens |
| 172 | `172-combinado-incoterm-resultado.png` | Combinado: incoterm aplicado — cascade pai+filhos na lista |
| 174 | `174-coluna-texto-selecao.png` | Coluna manual texto — passo Revisão |
| 174 | `174-coluna-texto-resultado.png` | Coluna manual texto — lista após aplicar |
| 175 | `175-coluna-numero-selecao.png` | Coluna manual numero — passo Revisão |
| 175 | `175-coluna-numero-resultado.png` | Coluna manual numero — lista após aplicar |
| 176 | `176-coluna-data-selecao.png` | Coluna manual data — passo Revisão |
| 176 | `176-coluna-data-resultado.png` | Coluna manual data — lista após aplicar |
| 177 | `177-coluna-moeda-selecao.png` | Coluna manual moeda — passo Revisão |
| 177 | `177-coluna-moeda-resultado.png` | Coluna manual moeda — lista após aplicar |
| 178 | `178-coluna-percentual-selecao.png` | Coluna manual percentual — passo Revisão |
| 178 | `178-coluna-percentual-resultado.png` | Coluna manual percentual — lista após aplicar |
| 179 | `179-coluna-checkbox-selecao.png` | Coluna manual checkbox — passo Revisão |
| 179 | `179-coluna-checkbox-resultado.png` | Coluna manual checkbox — lista após aplicar |
| 180 | `180-coluna-tipo-documento-selecao.png` | Coluna manual tipo-documento — passo Revisão |
| 180 | `180-coluna-tipo-documento-resultado.png` | Coluna manual tipo-documento — lista após aplicar |
| 181 | `181-coluna-formula-bloqueada.png` | Combobox sem a coluna fórmula (bloqueada) |
| 182 | `182-coluna-escopo.png` | Colunas por escopo — pedido vs item sem vazamento |
| 183 | `183-tipo-operacao-imp-exp.png` | Pedido Importação → Exportação em massa |
| 184 | `184-tipo-operacao-exp-imp.png` | Pedido Exportação → Importação em massa |
| 185 | `185-tipo-operacao-item.png` | tipo_operacao_item no nível Item |
| 186 | `186-erros-revisar-desabilitado.png` | «Revisar alterações» desabilitado sem campos |
| 187 | `187-erros-unique-bloqueado.png` | numero_pedido bloqueado com >1 pedido (@@unique) |
| 190 | `190-persistencia-final.png` | Lista após navegar Hub→Lista — valores persistidos |
