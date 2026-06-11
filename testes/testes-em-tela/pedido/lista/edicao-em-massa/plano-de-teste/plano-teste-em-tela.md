# Plano de Teste em Tela — Pedido / Lista / Edição em Massa

**ID:** TST-EMT-PEDIDO-LISTA-EDICAO-EM-MASSA-000081
**Data:** 2026-06-11
**Versão:** 1.1
**Criticidade:** alta
**Skill:** `skills/testes/teste-em-tela/SKILL.md`

**Escopo pasta:** `testes/testes-em-tela/pedido/lista/edicao-em-massa/`
**Plano + runner:** `plano-de-teste/` (este arquivo + `run-lista-edicao-em-massa.ts` + `gerar-plano-edicao-em-massa.ts` + `numeracao-passos-edicao-em-massa.ts`)
**Prints:** `../resultado-teste/<runId>/` — uma pasta por execução
**Regras de negócio:** `documentos-tecnicos/produtos-gravity/pedido/EDICAO-EM-MASSA-REGRAS-NEGOCIO.md` · técnico: `EDICAO-EM-MASSA-TECNICO.md` · colunas manuais: `COLUNAS-USUARIO-REGRAS-NEGOCIO.md`
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

## Regra universal — persistência ao fim de cada ETAPA

> **Obrigatório** em toda `### ETAPA …` que altera dados (regra do modelo editar-salvar §Regra universal).

**Último passo de cada etapa de edição:** navegar para o **hub** → voltar à **Lista** → reencontrar e **reexpandir** o pedido-alvo → **APROVADO** quando tudo salvo na etapa permanece na grade.
**Print:** `{passo}-{slug}-persistencia-apos-navegar-resultado.png`
**Exceções:** ETAPA 0 (preparação), ETAPA 2 (drift — só leitura), etapa de erros (não aplica dados) e etapa final de relatório.

---

## Regras-mestre (valem para TODAS as etapas)

1. **Anti-viés 50/50** — passos pares partem de campo **vazio** (preencher); passos ímpares partem de campo **pré-preenchido** (substituir). Nunca testar todos os campos no mesmo estado.
2. **Pedido-alvo** — pedido com **maior quantidade de itens** da lista (maximiza propagação/cascade). Número anotado no relatório.
3. **Tipos de operação** — garantir na preparação pelo menos 1 pedido de Importação e 1 de Exportação.
4. **Validação tripla por campo** — preview de→para correto; valor aplicado na lista; persistência validada no fechamento da etapa (hub→lista).
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
| **004** | Nível **Pedido**: listar campos do combobox | ≥ 111 campos (SSOT) · todos os rótulos do SSOT presentes · nenhum bloqueado listado · Print `004-combobox-pedido.png` (sucesso ou erro) |
| **005** | Nível **Item**: listar campos do combobox | ≥ 55 campos (SSOT) · todos os rótulos do SSOT presentes · nenhum bloqueado listado · Print `005-combobox-item.png` (sucesso ou erro) |

> Bloqueados pedido (undefined): `valor_total_pedido`, `quantidade_total_pedido`, `peso_liquido_total_pedido`, `peso_bruto_total_pedido`, `cubagem_total_pedido`, `id_pedido`, `id_organizacao`, `id_workspace`, `id_status_pedido`, `data_criacao_pedido`, `data_atualizacao_pedido`, `data_exclusao_pedido`, `data_consolidacao_pedido`, `ids_origem_consolidacao_pedido`
> Bloqueados item (undefined): `valor_total_item`, `quantidade_atual_item`, `quantidade_transferida_item`, `id_item`, `id_organizacao`, `id_workspace`, `id_pedido`, `data_criacao_item`, `data_atualizacao_item`, `data_exclusao_item`


---

## CAMPOS DE PEDIDO — campo a campo

### ETAPA 3 — PEDIDO · IDENTIFICACAO (passos 006–009)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **006** | Editar em massa `numero_pedido` (Numero do Pedido, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `006-numero_pedido-selecao.png` (sucesso ou erro) · Print `006-numero_pedido-resultado.png` (sucesso ou erro) |
| **007** | Editar em massa `tipo_operacao_pedido` (Tipo de Operacao, seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `007-tipo_operacao_pedido-selecao.png` (sucesso ou erro) · Print `007-tipo_operacao_pedido-resultado.png` (sucesso ou erro) |
| **008** | Editar em massa `status_pedido` (Status do Pedido, seleção (dropdown com busca)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `008-status_pedido-selecao.png` (sucesso ou erro) · Print `008-status_pedido-resultado.png` (sucesso ou erro) |
| **009** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `009-pedido-identificacao-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 4 — PEDIDO · EXPORTADOR (passos 010–023)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **010** | Editar em massa `nome_exportador` (Exportador — Nome, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `010-nome_exportador-selecao.png` (sucesso ou erro) · Print `010-nome_exportador-resultado.png` (sucesso ou erro) |
| **011** | Editar em massa `endereco_exportador` (Exportador — Endereco, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `011-endereco_exportador-selecao.png` (sucesso ou erro) · Print `011-endereco_exportador-resultado.png` (sucesso ou erro) |
| **012** | Editar em massa `pais_exportador` (Exportador — Pais, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `012-pais_exportador-selecao.png` (sucesso ou erro) · Print `012-pais_exportador-resultado.png` (sucesso ou erro) |
| **013** | Editar em massa `estado_exportador` (Exportador — Estado, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `013-estado_exportador-selecao.png` (sucesso ou erro) · Print `013-estado_exportador-resultado.png` (sucesso ou erro) |
| **014** | Editar em massa `cidade_exportador` (Exportador — Cidade, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `014-cidade_exportador-selecao.png` (sucesso ou erro) · Print `014-cidade_exportador-resultado.png` (sucesso ou erro) |
| **015** | Editar em massa `zip_code_exportador` (Exportador — ZIP Code, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `015-zip_code_exportador-selecao.png` (sucesso ou erro) · Print `015-zip_code_exportador-resultado.png` (sucesso ou erro) |
| **016** | Editar em massa `exportador_ou_fabricante` (Exportador ou Fabricante, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `016-exportador_ou_fabricante-selecao.png` (sucesso ou erro) · Print `016-exportador_ou_fabricante-resultado.png` (sucesso ou erro) |
| **017** | Editar em massa `relacao_exportador_fabricante` (Relacao Export./Fabric., texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `017-relacao_exportador_fabricante-selecao.png` (sucesso ou erro) · Print `017-relacao_exportador_fabricante-resultado.png` (sucesso ou erro) |
| **018** | Editar em massa `nome_contato_exportador` (Contato Export. — Nome, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `018-nome_contato_exportador-selecao.png` (sucesso ou erro) · Print `018-nome_contato_exportador-resultado.png` (sucesso ou erro) |
| **019** | Editar em massa `email_contato_exportador` (Contato Export. — Email, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `019-email_contato_exportador-selecao.png` (sucesso ou erro) · Print `019-email_contato_exportador-resultado.png` (sucesso ou erro) |
| **020** | Editar em massa `whatsapp_contato_exportador` (Contato Export. — WhatsApp, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `020-whatsapp_contato_exportador-selecao.png` (sucesso ou erro) · Print `020-whatsapp_contato_exportador-resultado.png` (sucesso ou erro) |
| **021** | Editar em massa `cargo_contato_exportador` (Contato Export. — Cargo, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `021-cargo_contato_exportador-selecao.png` (sucesso ou erro) · Print `021-cargo_contato_exportador-resultado.png` (sucesso ou erro) |
| **022** | Editar em massa `departamento_contato_exportador` (Contato Export. — Depto., texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `022-departamento_contato_exportador-selecao.png` (sucesso ou erro) · Print `022-departamento_contato_exportador-resultado.png` (sucesso ou erro) |
| **023** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `023-pedido-exportador-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 5 — PEDIDO · IMPORTADOR (passos 024–026)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **024** | Editar em massa `nome_importador` (Importador — Nome, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `024-nome_importador-selecao.png` (sucesso ou erro) · Print `024-nome_importador-resultado.png` (sucesso ou erro) |
| **025** | Editar em massa `cnpj_importador_pedido` (Importador — CNPJ, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `025-cnpj_importador_pedido-selecao.png` (sucesso ou erro) · Print `025-cnpj_importador_pedido-resultado.png` (sucesso ou erro) |
| **026** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `026-pedido-importador-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 6 — PEDIDO · FABRICANTE (passos 027–033)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **027** | Editar em massa `nome_fabricante` (Fabricante — Nome, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `027-nome_fabricante-selecao.png` (sucesso ou erro) · Print `027-nome_fabricante-resultado.png` (sucesso ou erro) |
| **028** | Editar em massa `endereco_fabricante` (Fabricante — Endereco, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `028-endereco_fabricante-selecao.png` (sucesso ou erro) · Print `028-endereco_fabricante-resultado.png` (sucesso ou erro) |
| **029** | Editar em massa `pais_fabricante` (Fabricante — Pais, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `029-pais_fabricante-selecao.png` (sucesso ou erro) · Print `029-pais_fabricante-resultado.png` (sucesso ou erro) |
| **030** | Editar em massa `estado_fabricante` (Fabricante — Estado, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `030-estado_fabricante-selecao.png` (sucesso ou erro) · Print `030-estado_fabricante-resultado.png` (sucesso ou erro) |
| **031** | Editar em massa `cidade_fabricante` (Fabricante — Cidade, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `031-cidade_fabricante-selecao.png` (sucesso ou erro) · Print `031-cidade_fabricante-resultado.png` (sucesso ou erro) |
| **032** | Editar em massa `zip_code_fabricante` (Fabricante — ZIP Code, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `032-zip_code_fabricante-selecao.png` (sucesso ou erro) · Print `032-zip_code_fabricante-resultado.png` (sucesso ou erro) |
| **033** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `033-pedido-fabricante-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 7 — PEDIDO · DOCUMENTOS (passos 034–039)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **034** | Editar em massa `referencia_importador_pedido` (Referencia Importador, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `034-referencia_importador_pedido-selecao.png` (sucesso ou erro) · Print `034-referencia_importador_pedido-resultado.png` (sucesso ou erro) |
| **035** | Editar em massa `referencia_exportador_pedido` (Referencia Exportador, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `035-referencia_exportador_pedido-selecao.png` (sucesso ou erro) · Print `035-referencia_exportador_pedido-resultado.png` (sucesso ou erro) |
| **036** | Editar em massa `numero_proforma_pedido` (No Proforma, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `036-numero_proforma_pedido-selecao.png` (sucesso ou erro) · Print `036-numero_proforma_pedido-resultado.png` (sucesso ou erro) |
| **037** | Editar em massa `numero_invoice_pedido` (No Invoice, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `037-numero_invoice_pedido-selecao.png` (sucesso ou erro) · Print `037-numero_invoice_pedido-resultado.png` (sucesso ou erro) |
| **038** | Editar em massa `referencia_fabricante_pedido` (Referencia Fabricante, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `038-referencia_fabricante_pedido-selecao.png` (sucesso ou erro) · Print `038-referencia_fabricante_pedido-resultado.png` (sucesso ou erro) |
| **039** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `039-pedido-documentos-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 8 — PEDIDO · OPE (passos 040–052)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **040** | Editar em massa `codigo_ope` (OPE — Codigo, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `040-codigo_ope-selecao.png` (sucesso ou erro) · Print `040-codigo_ope-resultado.png` (sucesso ou erro) |
| **041** | Editar em massa `nome_ope` (OPE — Nome, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `041-nome_ope-selecao.png` (sucesso ou erro) · Print `041-nome_ope-resultado.png` (sucesso ou erro) |
| **042** | Editar em massa `endereco_ope` (OPE — Endereco, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `042-endereco_ope-selecao.png` (sucesso ou erro) · Print `042-endereco_ope-resultado.png` (sucesso ou erro) |
| **043** | Editar em massa `pais_ope` (OPE — Pais, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `043-pais_ope-selecao.png` (sucesso ou erro) · Print `043-pais_ope-resultado.png` (sucesso ou erro) |
| **044** | Editar em massa `estado_ope` (OPE — Estado, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `044-estado_ope-selecao.png` (sucesso ou erro) · Print `044-estado_ope-resultado.png` (sucesso ou erro) |
| **045** | Editar em massa `cidade_ope` (OPE — Cidade, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `045-cidade_ope-selecao.png` (sucesso ou erro) · Print `045-cidade_ope-resultado.png` (sucesso ou erro) |
| **046** | Editar em massa `zip_code_ope` (OPE — ZIP Code, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `046-zip_code_ope-selecao.png` (sucesso ou erro) · Print `046-zip_code_ope-resultado.png` (sucesso ou erro) |
| **047** | Editar em massa `tin_ope` (OPE — TIN, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `047-tin_ope-selecao.png` (sucesso ou erro) · Print `047-tin_ope-resultado.png` (sucesso ou erro) |
| **048** | Editar em massa `email_ope` (OPE — Email, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `048-email_ope-selecao.png` (sucesso ou erro) · Print `048-email_ope-resultado.png` (sucesso ou erro) |
| **049** | Editar em massa `situacao_ope` (OPE — Situacao, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `049-situacao_ope-selecao.png` (sucesso ou erro) · Print `049-situacao_ope-resultado.png` (sucesso ou erro) |
| **050** | Editar em massa `versao_ope` (OPE — Versao, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `050-versao_ope-selecao.png` (sucesso ou erro) · Print `050-versao_ope-resultado.png` (sucesso ou erro) |
| **051** | Editar em massa `cnpj_raiz_empresa_responsavel` (CNPJ Raiz Empresa Responsavel, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `051-cnpj_raiz_empresa_responsavel-selecao.png` (sucesso ou erro) · Print `051-cnpj_raiz_empresa_responsavel-resultado.png` (sucesso ou erro) |
| **052** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `052-pedido-ope-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 9 — PEDIDO · COMERCIAL (passos 053–062)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **053** | Editar em massa `incoterm_pedido` (Incoterm, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `053-incoterm_pedido-selecao.png` (sucesso ou erro) · Print `053-incoterm_pedido-resultado.png` (sucesso ou erro) |
| **054** | Editar em massa `moeda_pedido` (Moeda do Pedido, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `054-moeda_pedido-selecao.png` (sucesso ou erro) · Print `054-moeda_pedido-resultado.png` (sucesso ou erro) |
| **055** | Editar em massa `unidade_comercializada_pedido` (Unidade Comercializada do Pedido, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `055-unidade_comercializada_pedido-selecao.png` (sucesso ou erro) · Print `055-unidade_comercializada_pedido-resultado.png` (sucesso ou erro) |
| **056** | Editar em massa `condicao_pagamento_pedido` (Condicao de Pagamento — Comercial, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `056-condicao_pagamento_pedido-selecao.png` (sucesso ou erro) · Print `056-condicao_pagamento_pedido-resultado.png` (sucesso ou erro) |
| **057** | Editar em massa `condicao_pagamento_siscomex_pedido` (Condicao de Pagamento — Siscomex, seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `057-condicao_pagamento_siscomex_pedido-selecao.png` (sucesso ou erro) · Print `057-condicao_pagamento_siscomex_pedido-resultado.png` (sucesso ou erro) |
| **058** | Editar em massa `tipo_volume_pedido` (Tipo Volume Pedido, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `058-tipo_volume_pedido-selecao.png` (sucesso ou erro) · Print `058-tipo_volume_pedido-resultado.png` (sucesso ou erro) |
| **059** | Editar em massa `quantidade_volumes_pedido` (Qtd. de Volumes, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `059-quantidade_volumes_pedido-selecao.png` (sucesso ou erro) · Print `059-quantidade_volumes_pedido-resultado.png` (sucesso ou erro) |
| **060** | Editar em massa `tipo_volume_item` (Tipo Volume Item, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `060-tipo_volume_item-selecao.png` (sucesso ou erro) · Print `060-tipo_volume_item-resultado.png` (sucesso ou erro) |
| **061** | Editar em massa `cobertura_cambial_pedido` (Cobertura Cambial, seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `061-cobertura_cambial_pedido-selecao.png` (sucesso ou erro) · Print `061-cobertura_cambial_pedido-resultado.png` (sucesso ou erro) |
| **062** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `062-pedido-comercial-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 10 — PEDIDO · CAMBIO (passos 063–067)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **063** | Editar em massa `valor_total_cambio_pedido` (Valor Total Cambio, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `063-valor_total_cambio_pedido-selecao.png` (sucesso ou erro) · Print `063-valor_total_cambio_pedido-resultado.png` (sucesso ou erro) |
| **064** | Editar em massa `moeda_cambio_pedido` (Moeda Cambio, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `064-moeda_cambio_pedido-selecao.png` (sucesso ou erro) · Print `064-moeda_cambio_pedido-resultado.png` (sucesso ou erro) |
| **065** | Editar em massa `taxa_cambio_estimada_pedido` (Taxa Cambio Estimada, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `065-taxa_cambio_estimada_pedido-selecao.png` (sucesso ou erro) · Print `065-taxa_cambio_estimada_pedido-resultado.png` (sucesso ou erro) |
| **066** | Editar em massa `contrato_cambio_id_pedido` (Contrato de Cambio (ID), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `066-contrato_cambio_id_pedido-selecao.png` (sucesso ou erro) · Print `066-contrato_cambio_id_pedido-resultado.png` (sucesso ou erro) |
| **067** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `067-pedido-cambio-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 11 — PEDIDO · LOGISTICA (passos 068–075)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **068** | Editar em massa `porto_origem` (Porto de Origem, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `068-porto_origem-selecao.png` (sucesso ou erro) · Print `068-porto_origem-resultado.png` (sucesso ou erro) |
| **069** | Editar em massa `porto_destino` (Porto de Destino, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `069-porto_destino-selecao.png` (sucesso ou erro) · Print `069-porto_destino-resultado.png` (sucesso ou erro) |
| **070** | Editar em massa `local_de_origem` (País origem, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `070-local_de_origem-selecao.png` (sucesso ou erro) · Print `070-local_de_origem-resultado.png` (sucesso ou erro) |
| **071** | Editar em massa `local_de_destino` (País destino, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `071-local_de_destino-selecao.png` (sucesso ou erro) · Print `071-local_de_destino-resultado.png` (sucesso ou erro) |
| **072** | Editar em massa `aeroporto_origem` (Aeroporto de Origem, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `072-aeroporto_origem-selecao.png` (sucesso ou erro) · Print `072-aeroporto_origem-resultado.png` (sucesso ou erro) |
| **073** | Editar em massa `aeroporto_destino` (Aeroporto de Destino, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `073-aeroporto_destino-selecao.png` (sucesso ou erro) · Print `073-aeroporto_destino-resultado.png` (sucesso ou erro) |
| **074** | Editar em massa `data_embarque_origem` (Data de Embarque na Origem, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `074-data_embarque_origem-selecao.png` (sucesso ou erro) · Print `074-data_embarque_origem-resultado.png` (sucesso ou erro) |
| **075** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `075-pedido-logistica-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 12 — PEDIDO · DATAS (passos 076–090)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **076** | Editar em massa `data_emissao_pedido` (Data de Emissao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `076-data_emissao_pedido-selecao.png` (sucesso ou erro) · Print `076-data_emissao_pedido-resultado.png` (sucesso ou erro) |
| **077** | Editar em massa `data_documento_pedido` (Data do Documento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `077-data_documento_pedido-selecao.png` (sucesso ou erro) · Print `077-data_documento_pedido-resultado.png` (sucesso ou erro) |
| **078** | Editar em massa `data_documento_proforma_pedido` (Data do Documento Proforma, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `078-data_documento_proforma_pedido-selecao.png` (sucesso ou erro) · Print `078-data_documento_proforma_pedido-resultado.png` (sucesso ou erro) |
| **079** | Editar em massa `data_documento_invoice_pedido` (Data do Documento Invoice, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `079-data_documento_invoice_pedido-selecao.png` (sucesso ou erro) · Print `079-data_documento_invoice_pedido-resultado.png` (sucesso ou erro) |
| **080** | Editar em massa `data_prevista_pedido_pronto` (Data Prevista — Pedido Pronto, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `080-data_prevista_pedido_pronto-selecao.png` (sucesso ou erro) · Print `080-data_prevista_pedido_pronto-resultado.png` (sucesso ou erro) |
| **081** | Editar em massa `data_confirmada_pedido_pronto` (Data Confirmada — Pedido Pronto, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `081-data_confirmada_pedido_pronto-selecao.png` (sucesso ou erro) · Print `081-data_confirmada_pedido_pronto-resultado.png` (sucesso ou erro) |
| **082** | Editar em massa `data_meta_pedido_pronto` (Data Meta — Pedido Pronto, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `082-data_meta_pedido_pronto-selecao.png` (sucesso ou erro) · Print `082-data_meta_pedido_pronto-resultado.png` (sucesso ou erro) |
| **083** | Editar em massa `data_prevista_inspecao_pedido` (Data Prevista — Inspecao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `083-data_prevista_inspecao_pedido-selecao.png` (sucesso ou erro) · Print `083-data_prevista_inspecao_pedido-resultado.png` (sucesso ou erro) |
| **084** | Editar em massa `data_confirmada_inspecao_pedido` (Data Confirmada — Inspecao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `084-data_confirmada_inspecao_pedido-selecao.png` (sucesso ou erro) · Print `084-data_confirmada_inspecao_pedido-resultado.png` (sucesso ou erro) |
| **085** | Editar em massa `data_meta_inspecao_pedido` (Data Meta — Inspecao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `085-data_meta_inspecao_pedido-selecao.png` (sucesso ou erro) · Print `085-data_meta_inspecao_pedido-resultado.png` (sucesso ou erro) |
| **086** | Editar em massa `data_prevista_coleta_pedido` (Data Prevista — Coleta, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `086-data_prevista_coleta_pedido-selecao.png` (sucesso ou erro) · Print `086-data_prevista_coleta_pedido-resultado.png` (sucesso ou erro) |
| **087** | Editar em massa `data_confirmada_coleta_pedido` (Data Confirmada — Coleta, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `087-data_confirmada_coleta_pedido-selecao.png` (sucesso ou erro) · Print `087-data_confirmada_coleta_pedido-resultado.png` (sucesso ou erro) |
| **088** | Editar em massa `data_meta_coleta_pedido` (Data Meta — Coleta, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `088-data_meta_coleta_pedido-selecao.png` (sucesso ou erro) · Print `088-data_meta_coleta_pedido-resultado.png` (sucesso ou erro) |
| **089** | Editar em massa `data_transferencia_saldo_pedido` (Data de Transferencia de Saldo, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `089-data_transferencia_saldo_pedido-selecao.png` (sucesso ou erro) · Print `089-data_transferencia_saldo_pedido-resultado.png` (sucesso ou erro) |
| **090** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `090-pedido-datas-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 13 — PEDIDO · DATAS DRAFT PEDIDO (passos 091–097)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **091** | Editar em massa `data_previsao_recebimento_rascunho_pedido` (Draft Pedido — Prev. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `091-data_previsao_recebimento_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `091-data_previsao_recebimento_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **092** | Editar em massa `data_confirmacao_recebimento_rascunho_pedido` (Draft Pedido — Conf. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `092-data_confirmacao_recebimento_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `092-data_confirmacao_recebimento_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **093** | Editar em massa `data_meta_recebimento_rascunho_pedido` (Draft Pedido — Meta Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `093-data_meta_recebimento_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `093-data_meta_recebimento_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **094** | Editar em massa `data_previsao_aprovacao_rascunho_pedido` (Draft Pedido — Prev. Aprovacao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `094-data_previsao_aprovacao_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `094-data_previsao_aprovacao_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **095** | Editar em massa `data_confirmacao_aprovacao_rascunho_pedido` (Draft Pedido — Conf. Aprovacao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `095-data_confirmacao_aprovacao_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `095-data_confirmacao_aprovacao_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **096** | Editar em massa `data_meta_aprovacao_rascunho_pedido` (Draft Pedido — Meta Aprovacao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `096-data_meta_aprovacao_rascunho_pedido-selecao.png` (sucesso ou erro) · Print `096-data_meta_aprovacao_rascunho_pedido-resultado.png` (sucesso ou erro) |
| **097** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `097-pedido-datas-draft-pedido-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 14 — PEDIDO · DATAS DRAFT PROFORMA (passos 098–111)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **098** | Editar em massa `data_previsao_recebimento_rascunho_proforma_pedido` (Draft Proforma — Prev. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `098-data_previsao_recebimento_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `098-data_previsao_recebimento_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **099** | Editar em massa `data_confirmacao_recebimento_rascunho_proforma_pedido` (Draft Proforma — Conf. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `099-data_confirmacao_recebimento_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `099-data_confirmacao_recebimento_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **100** | Editar em massa `data_meta_recebimento_rascunho_proforma_pedido` (Draft Proforma — Meta Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `100-data_meta_recebimento_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `100-data_meta_recebimento_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **101** | Editar em massa `data_previsao_aprovacao_rascunho_proforma_pedido` (Draft Proforma — Prev. Aprovacao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `101-data_previsao_aprovacao_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `101-data_previsao_aprovacao_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **102** | Editar em massa `data_confirmacao_aprovacao_rascunho_proforma_pedido` (Draft Proforma — Conf. Aprovacao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `102-data_confirmacao_aprovacao_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `102-data_confirmacao_aprovacao_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **103** | Editar em massa `data_meta_aprovacao_rascunho_proforma_pedido` (Draft Proforma — Meta Aprovacao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `103-data_meta_aprovacao_rascunho_proforma_pedido-selecao.png` (sucesso ou erro) · Print `103-data_meta_aprovacao_rascunho_proforma_pedido-resultado.png` (sucesso ou erro) |
| **104** | Editar em massa `data_previsao_envio_original_proforma_pedido` (Original Proforma — Prev. Envio, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `104-data_previsao_envio_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `104-data_previsao_envio_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **105** | Editar em massa `data_confirmacao_envio_original_proforma_pedido` (Original Proforma — Conf. Envio, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `105-data_confirmacao_envio_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `105-data_confirmacao_envio_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **106** | Editar em massa `data_meta_envio_original_proforma_pedido` (Original Proforma — Meta Envio, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `106-data_meta_envio_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `106-data_meta_envio_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **107** | Editar em massa `data_previsao_recebimento_original_proforma_pedido` (Original Proforma — Prev. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `107-data_previsao_recebimento_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `107-data_previsao_recebimento_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **108** | Editar em massa `data_confirmacao_recebimento_original_proforma_pedido` (Original Proforma — Conf. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `108-data_confirmacao_recebimento_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `108-data_confirmacao_recebimento_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **109** | Editar em massa `data_meta_recebimento_original_proforma_pedido` (Original Proforma — Meta Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `109-data_meta_recebimento_original_proforma_pedido-selecao.png` (sucesso ou erro) · Print `109-data_meta_recebimento_original_proforma_pedido-resultado.png` (sucesso ou erro) |
| **110** | Editar em massa `data_proforma_invoice` (Data da Proforma Invoice, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `110-data_proforma_invoice-selecao.png` (sucesso ou erro) · Print `110-data_proforma_invoice-resultado.png` (sucesso ou erro) |
| **111** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `111-pedido-datas-draft-proforma-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 15 — PEDIDO · DATAS DRAFT INVOICE (passos 112–125)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **112** | Editar em massa `data_previsao_recebimento_rascunho_invoice_pedido` (Draft Invoice — Prev. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `112-data_previsao_recebimento_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `112-data_previsao_recebimento_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **113** | Editar em massa `data_confirmacao_recebimento_rascunho_invoice_pedido` (Draft Invoice — Conf. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `113-data_confirmacao_recebimento_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `113-data_confirmacao_recebimento_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **114** | Editar em massa `data_meta_recebimento_rascunho_invoice_pedido` (Draft Invoice — Meta Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `114-data_meta_recebimento_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `114-data_meta_recebimento_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **115** | Editar em massa `data_previsao_aprovacao_rascunho_invoice_pedido` (Draft Invoice — Prev. Aprovacao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `115-data_previsao_aprovacao_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `115-data_previsao_aprovacao_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **116** | Editar em massa `data_confirmacao_aprovacao_rascunho_invoice_pedido` (Draft Invoice — Conf. Aprovacao, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `116-data_confirmacao_aprovacao_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `116-data_confirmacao_aprovacao_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **117** | Editar em massa `data_meta_aprovacao_rascunho_invoice_pedido` (Draft Invoice — Meta Aprovacao, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `117-data_meta_aprovacao_rascunho_invoice_pedido-selecao.png` (sucesso ou erro) · Print `117-data_meta_aprovacao_rascunho_invoice_pedido-resultado.png` (sucesso ou erro) |
| **118** | Editar em massa `data_previsao_envio_original_invoice_pedido` (Original Invoice — Prev. Envio, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `118-data_previsao_envio_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `118-data_previsao_envio_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **119** | Editar em massa `data_confirmacao_envio_original_invoice_pedido` (Original Invoice — Conf. Envio, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `119-data_confirmacao_envio_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `119-data_confirmacao_envio_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **120** | Editar em massa `data_meta_envio_original_invoice_pedido` (Original Invoice — Meta Envio, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `120-data_meta_envio_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `120-data_meta_envio_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **121** | Editar em massa `data_previsao_recebimento_original_invoice_pedido` (Original Invoice — Prev. Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `121-data_previsao_recebimento_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `121-data_previsao_recebimento_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **122** | Editar em massa `data_confirmacao_recebimento_original_invoice_pedido` (Original Invoice — Conf. Recebimento, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `122-data_confirmacao_recebimento_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `122-data_confirmacao_recebimento_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **123** | Editar em massa `data_meta_recebimento_original_invoice_pedido` (Original Invoice — Meta Recebimento, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `123-data_meta_recebimento_original_invoice_pedido-selecao.png` (sucesso ou erro) · Print `123-data_meta_recebimento_original_invoice_pedido-resultado.png` (sucesso ou erro) |
| **124** | Editar em massa `data_invoice` (Data da Invoice, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `124-data_invoice-selecao.png` (sucesso ou erro) · Print `124-data_invoice-resultado.png` (sucesso ou erro) |
| **125** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `125-pedido-datas-draft-invoice-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 16 — PEDIDO · FINANCEIRO (passos 126–127)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **126** | Editar em massa `casas_decimais_valor_pedido` (Casas Decimais — Valor, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `126-casas_decimais_valor_pedido-selecao.png` (sucesso ou erro) · Print `126-casas_decimais_valor_pedido-resultado.png` (sucesso ou erro) |
| **127** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `127-pedido-financeiro-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 17 — PEDIDO · FISICO (passos 128–131)

Nível do modal: **Pedido**. Por campo: selecionar pedido-alvo → abrir modal → nível Pedido → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **128** | Editar em massa `casas_decimais_quantidade_pedido` (Casas Decimais — Qtd., numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `128-casas_decimais_quantidade_pedido-selecao.png` (sucesso ou erro) · Print `128-casas_decimais_quantidade_pedido-resultado.png` (sucesso ou erro) |
| **129** | Editar em massa `casas_decimais_peso_pedido` (Casas Decimais — Peso, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `129-casas_decimais_peso_pedido-selecao.png` (sucesso ou erro) · Print `129-casas_decimais_peso_pedido-resultado.png` (sucesso ou erro) |
| **130** | Editar em massa `casas_decimais_cubagem_pedido` (Casas Decimais — Cubagem, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `130-casas_decimais_cubagem_pedido-selecao.png` (sucesso ou erro) · Print `130-casas_decimais_cubagem_pedido-resultado.png` (sucesso ou erro) |
| **131** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `131-pedido-fisico-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |


---

## CAMPOS DE ITEM — campo a campo

### ETAPA 18 — ITEM · PRODUTO (passos 132–147)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **132** | Editar em massa `sequencia_item_pedido` (Sequencia do Item, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `132-sequencia_item_pedido-selecao.png` (sucesso ou erro) · Print `132-sequencia_item_pedido-resultado.png` (sucesso ou erro) |
| **133** | Editar em massa `part_number_item` (Part Number, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `133-part_number_item-selecao.png` (sucesso ou erro) · Print `133-part_number_item-resultado.png` (sucesso ou erro) |
| **134** | Editar em massa `ncm_item` (NCM, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `134-ncm_item-selecao.png` (sucesso ou erro) · Print `134-ncm_item-resultado.png` (sucesso ou erro) |
| **135** | Editar em massa `descricao_item` (Descricao do Item, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `135-descricao_item-selecao.png` (sucesso ou erro) · Print `135-descricao_item-resultado.png` (sucesso ou erro) |
| **136** | Editar em massa `unidade_comercializada_item` (Unidade Comercializada do Item, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `136-unidade_comercializada_item-selecao.png` (sucesso ou erro) · Print `136-unidade_comercializada_item-resultado.png` (sucesso ou erro) |
| **137** | Editar em massa `tipo_operacao_item` (Tipo de Operacao (Item), seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `137-tipo_operacao_item-selecao.png` (sucesso ou erro) · Print `137-tipo_operacao_item-resultado.png` (sucesso ou erro) |
| **138** | Editar em massa `descricao_completa_item_pt` (Descricao Completa (PT), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `138-descricao_completa_item_pt-selecao.png` (sucesso ou erro) · Print `138-descricao_completa_item_pt-resultado.png` (sucesso ou erro) |
| **139** | Editar em massa `descricao_completa_item_en` (Descricao Completa (EN), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `139-descricao_completa_item_en-selecao.png` (sucesso ou erro) · Print `139-descricao_completa_item_en-resultado.png` (sucesso ou erro) |
| **140** | Editar em massa `descricao_completa_item_es` (Descricao Completa (ES), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `140-descricao_completa_item_es-selecao.png` (sucesso ou erro) · Print `140-descricao_completa_item_es-resultado.png` (sucesso ou erro) |
| **141** | Editar em massa `descricao_completa_item_nf` (Descricao Completa (NF), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `141-descricao_completa_item_nf-selecao.png` (sucesso ou erro) · Print `141-descricao_completa_item_nf-resultado.png` (sucesso ou erro) |
| **142** | Editar em massa `texto_posicao_ncm` (Texto Posicao NCM, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `142-texto_posicao_ncm-selecao.png` (sucesso ou erro) · Print `142-texto_posicao_ncm-resultado.png` (sucesso ou erro) |
| **143** | Editar em massa `grupo_item` (Grupo do Item, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `143-grupo_item-selecao.png` (sucesso ou erro) · Print `143-grupo_item-resultado.png` (sucesso ou erro) |
| **144** | Editar em massa `subgrupo_item` (Subgrupo do Item, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `144-subgrupo_item-selecao.png` (sucesso ou erro) · Print `144-subgrupo_item-resultado.png` (sucesso ou erro) |
| **145** | Editar em massa `campo_especial_item` (Campo Especial do Item, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `145-campo_especial_item-selecao.png` (sucesso ou erro) · Print `145-campo_especial_item-resultado.png` (sucesso ou erro) |
| **146** | Editar em massa `atributos_catalogo` (Atributos de Catalogo, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `146-atributos_catalogo-selecao.png` (sucesso ou erro) · Print `146-atributos_catalogo-resultado.png` (sucesso ou erro) |
| **147** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `147-item-produto-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 19 — ITEM · QUANTIDADES (passos 148–152)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **148** | Editar em massa `quantidade_inicial_item` (Qtd. Inicial, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `148-quantidade_inicial_item-selecao.png` (sucesso ou erro) · Print `148-quantidade_inicial_item-resultado.png` (sucesso ou erro) |
| **149** | Editar em massa `quantidade_pronta_item` (Qtd. Pronta Total, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `149-quantidade_pronta_item-selecao.png` (sucesso ou erro) · Print `149-quantidade_pronta_item-resultado.png` (sucesso ou erro) |
| **150** | Editar em massa `quantidade_cancelada_item` (Qtd. Cancelada, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `150-quantidade_cancelada_item-selecao.png` (sucesso ou erro) · Print `150-quantidade_cancelada_item-resultado.png` (sucesso ou erro) |
| **151** | Editar em massa `casas_decimais_quantidade_item` (Casas Decimais — Qtd., numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `151-casas_decimais_quantidade_item-selecao.png` (sucesso ou erro) · Print `151-casas_decimais_quantidade_item-resultado.png` (sucesso ou erro) |
| **152** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `152-item-quantidades-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 20 — ITEM · FINANCEIRO (passos 153–156)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **153** | Editar em massa `moeda_item` (Moeda do Item, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `153-moeda_item-selecao.png` (sucesso ou erro) · Print `153-moeda_item-resultado.png` (sucesso ou erro) |
| **154** | Editar em massa `valor_por_unidade_item` (Valor por Unidade, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `154-valor_por_unidade_item-selecao.png` (sucesso ou erro) · Print `154-valor_por_unidade_item-resultado.png` (sucesso ou erro) |
| **155** | Editar em massa `casas_decimais_valor_item` (Casas Decimais — Valor, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `155-casas_decimais_valor_item-selecao.png` (sucesso ou erro) · Print `155-casas_decimais_valor_item-resultado.png` (sucesso ou erro) |
| **156** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `156-item-financeiro-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 21 — ITEM · CAMBIO (passos 157–158)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **157** | Editar em massa `cobertura_cambial_item` (Cobertura Cambial, seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `157-cobertura_cambial_item-selecao.png` (sucesso ou erro) · Print `157-cobertura_cambial_item-resultado.png` (sucesso ou erro) |
| **158** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `158-item-cambio-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 22 — ITEM · COMERCIAL (passos 159–162)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **159** | Editar em massa `condicao_pagamento_siscomex_item` (Condicao de Pagamento — Siscomex, seleção (dropdown com busca)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `159-condicao_pagamento_siscomex_item-selecao.png` (sucesso ou erro) · Print `159-condicao_pagamento_siscomex_item-resultado.png` (sucesso ou erro) |
| **160** | Editar em massa `incoterm_item` (Incoterm (Item), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `160-incoterm_item-selecao.png` (sucesso ou erro) · Print `160-incoterm_item-resultado.png` (sucesso ou erro) |
| **161** | Editar em massa `condicao_pagamento_item` (Condicao de Pagamento — Comercial (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `161-condicao_pagamento_item-selecao.png` (sucesso ou erro) · Print `161-condicao_pagamento_item-resultado.png` (sucesso ou erro) |
| **162** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `162-item-comercial-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 23 — ITEM · PARTES (passos 163–166)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **163** | Editar em massa `nome_exportador_item` (Exportador (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `163-nome_exportador_item-selecao.png` (sucesso ou erro) · Print `163-nome_exportador_item-resultado.png` (sucesso ou erro) |
| **164** | Editar em massa `nome_importador_item` (Importador (Item), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `164-nome_importador_item-selecao.png` (sucesso ou erro) · Print `164-nome_importador_item-resultado.png` (sucesso ou erro) |
| **165** | Editar em massa `nome_fabricante_item` (Fabricante (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `165-nome_fabricante_item-selecao.png` (sucesso ou erro) · Print `165-nome_fabricante_item-resultado.png` (sucesso ou erro) |
| **166** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `166-item-partes-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 24 — ITEM · DOCUMENTOS (passos 167–176)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **167** | Editar em massa `referencia_importador_item` (Referencia Importador (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `167-referencia_importador_item-selecao.png` (sucesso ou erro) · Print `167-referencia_importador_item-resultado.png` (sucesso ou erro) |
| **168** | Editar em massa `referencia_exportador_item` (Referencia Exportador (Item), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `168-referencia_exportador_item-selecao.png` (sucesso ou erro) · Print `168-referencia_exportador_item-resultado.png` (sucesso ou erro) |
| **169** | Editar em massa `referencia_fabricante_item` (Referencia Fabricante (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `169-referencia_fabricante_item-selecao.png` (sucesso ou erro) · Print `169-referencia_fabricante_item-resultado.png` (sucesso ou erro) |
| **170** | Editar em massa `numero_proforma_item` (No Proforma (Item), texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `170-numero_proforma_item-selecao.png` (sucesso ou erro) · Print `170-numero_proforma_item-resultado.png` (sucesso ou erro) |
| **171** | Editar em massa `numero_invoice_item` (No Invoice (Item), texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `171-numero_invoice_item-selecao.png` (sucesso ou erro) · Print `171-numero_invoice_item-resultado.png` (sucesso ou erro) |
| **172** | Editar em massa `tipo_embalagem` (Tipo de Embalagem, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `172-tipo_embalagem-selecao.png` (sucesso ou erro) · Print `172-tipo_embalagem-resultado.png` (sucesso ou erro) |
| **173** | Editar em massa `numero_lpco` (No LPCO, texto livre) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `173-numero_lpco-selecao.png` (sucesso ou erro) · Print `173-numero_lpco-resultado.png` (sucesso ou erro) |
| **174** | Editar em massa `numero_certificado_origem` (No Certificado de Origem, texto livre) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `174-numero_certificado_origem-selecao.png` (sucesso ou erro) · Print `174-numero_certificado_origem-resultado.png` (sucesso ou erro) |
| **175** | Editar em massa `data_certificado_origem` (Data Certificado de Origem, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `175-data_certificado_origem-selecao.png` (sucesso ou erro) · Print `175-data_certificado_origem-resultado.png` (sucesso ou erro) |
| **176** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `176-item-documentos-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 25 — ITEM · FISICO (passos 177–182)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **177** | Editar em massa `peso_liquido_unitario_item` (Peso Liquido Unitario, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `177-peso_liquido_unitario_item-selecao.png` (sucesso ou erro) · Print `177-peso_liquido_unitario_item-resultado.png` (sucesso ou erro) |
| **178** | Editar em massa `peso_bruto_unitario_item` (Peso Bruto Unitario, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `178-peso_bruto_unitario_item-selecao.png` (sucesso ou erro) · Print `178-peso_bruto_unitario_item-resultado.png` (sucesso ou erro) |
| **179** | Editar em massa `cubagem_unitaria_item` (Cubagem Unitaria, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `179-cubagem_unitaria_item-selecao.png` (sucesso ou erro) · Print `179-cubagem_unitaria_item-resultado.png` (sucesso ou erro) |
| **180** | Editar em massa `casas_decimais_peso_item` (Casas Decimais — Peso, numérico) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `180-casas_decimais_peso_item-selecao.png` (sucesso ou erro) · Print `180-casas_decimais_peso_item-resultado.png` (sucesso ou erro) |
| **181** | Editar em massa `casas_decimais_cubagem_item` (Casas Decimais — Cubagem, numérico) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `181-casas_decimais_cubagem_item-selecao.png` (sucesso ou erro) · Print `181-casas_decimais_cubagem_item-resultado.png` (sucesso ou erro) |
| **182** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `182-item-fisico-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 26 — ITEM · DATAS (passos 183–195)

Nível do modal: **Item**. Por campo: selecionar pedido-alvo → abrir modal → nível Item → escolher campo no combobox → informar valor conforme estado inicial exigido → «Revisar alterações» (preview de→para) → «Aplicar em Massa» → «Aplicado» → validar na lista.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **183** | Editar em massa `data_emissao_item` (Data de Emissao (Item), data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `183-data_emissao_item-selecao.png` (sucesso ou erro) · Print `183-data_emissao_item-resultado.png` (sucesso ou erro) |
| **184** | Editar em massa `data_consolidacao_item` (Data de Consolidacao (Item), data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `184-data_consolidacao_item-selecao.png` (sucesso ou erro) · Print `184-data_consolidacao_item-resultado.png` (sucesso ou erro) |
| **185** | Editar em massa `data_embarque_item` (Data de Embarque (Item), data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `185-data_embarque_item-selecao.png` (sucesso ou erro) · Print `185-data_embarque_item-resultado.png` (sucesso ou erro) |
| **186** | Editar em massa `data_prevista_item_pronto` (Data Prevista — Item Pronto, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `186-data_prevista_item_pronto-selecao.png` (sucesso ou erro) · Print `186-data_prevista_item_pronto-resultado.png` (sucesso ou erro) |
| **187** | Editar em massa `data_confirmada_item_pronto` (Data Confirmada — Item Pronto, data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `187-data_confirmada_item_pronto-selecao.png` (sucesso ou erro) · Print `187-data_confirmada_item_pronto-resultado.png` (sucesso ou erro) |
| **188** | Editar em massa `data_meta_item_pronto` (Data Meta — Item Pronto, data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `188-data_meta_item_pronto-selecao.png` (sucesso ou erro) · Print `188-data_meta_item_pronto-resultado.png` (sucesso ou erro) |
| **189** | Editar em massa `data_prevista_inspecao_item` (Data Prevista — Inspecao (Item), data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `189-data_prevista_inspecao_item-selecao.png` (sucesso ou erro) · Print `189-data_prevista_inspecao_item-resultado.png` (sucesso ou erro) |
| **190** | Editar em massa `data_confirmada_inspecao_item` (Data Confirmada — Inspecao (Item), data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `190-data_confirmada_inspecao_item-selecao.png` (sucesso ou erro) · Print `190-data_confirmada_inspecao_item-resultado.png` (sucesso ou erro) |
| **191** | Editar em massa `data_meta_inspecao_item` (Data Meta — Inspecao (Item), data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `191-data_meta_inspecao_item-selecao.png` (sucesso ou erro) · Print `191-data_meta_inspecao_item-resultado.png` (sucesso ou erro) |
| **192** | Editar em massa `data_prevista_coleta_item` (Data Prevista — Coleta (Item), data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `192-data_prevista_coleta_item-selecao.png` (sucesso ou erro) · Print `192-data_prevista_coleta_item-resultado.png` (sucesso ou erro) |
| **193** | Editar em massa `data_confirmada_coleta_item` (Data Confirmada — Coleta (Item), data (date picker)) partindo de campo **pré-preenchido** (substituir) | Preview de→para correto · valor aplicado na lista · Print `193-data_confirmada_coleta_item-selecao.png` (sucesso ou erro) · Print `193-data_confirmada_coleta_item-resultado.png` (sucesso ou erro) |
| **194** | Editar em massa `data_meta_coleta_item` (Data Meta — Coleta (Item), data (date picker)) partindo de campo **vazio** (preencher) | Preview de→para correto · valor aplicado na lista · Print `194-data_meta_coleta_item-selecao.png` (sucesso ou erro) · Print `194-data_meta_coleta_item-resultado.png` (sucesso ou erro) |
| **195** | **Persistência da etapa**: navegar hub → voltar à Lista → reencontrar e reexpandir o pedido-alvo | Tudo salvo na etapa permanece na grade (pedido + itens) · Print `195-item-datas-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

---

### ETAPA 27 — NÍVEL COMBINADO + CASCADE (passos 196–198)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **196** | Nível **Combinado**: editar `incoterm` (espelhado pedido↔item) | Preview mostra alteração no pedido E nos itens · linha pai e TODAS as filhas com novo valor · Print `196-combinado-incoterm-selecao.png` (sucesso ou erro) · Print `196-combinado-incoterm-resultado.png` (sucesso ou erro) |
| **197** | Combinado: campo só-pedido (`observacoes_pedido`) + só-item (`part_number_item`) na mesma sessão | Ambos aplicados nos escopos corretos |
| **198** | **Persistência da etapa**: hub → Lista → reexpandir pedido-alvo | Cascade mantido na grade · Print `198-combinado-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 28 — COLUNAS MANUAIS DO USUÁRIO — 8 TIPOS (passos 199–208)

Criar (ou reutilizar) 1 coluna manual de **cada um dos 8 tipos**. Os 7 editáveis aparecem no grupo «Personalizadas» (convenção `coluna_usuario:<id>`); **fórmula NÃO aparece** (calculada). Metade dos tipos parte de valor vazio, metade de pré-preenchido (anti-viés). Regras: `COLUNAS-USUARIO-REGRAS-NEGOCIO.md`.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **199** | Editar em massa coluna manual tipo **texto** | Input texto livre · valor aplicado na célula da coluna · Print `199-coluna-texto-selecao.png` (sucesso ou erro) · Print `199-coluna-texto-resultado.png` (sucesso ou erro) |
| **200** | Editar em massa coluna manual tipo **numero** | Input numérico · valor aplicado na célula da coluna · Print `200-coluna-numero-selecao.png` (sucesso ou erro) · Print `200-coluna-numero-resultado.png` (sucesso ou erro) |
| **201** | Editar em massa coluna manual tipo **data** | Date picker · valor aplicado na célula da coluna · Print `201-coluna-data-selecao.png` (sucesso ou erro) · Print `201-coluna-data-resultado.png` (sucesso ou erro) |
| **202** | Editar em massa coluna manual tipo **moeda** | Input numérico + formatação de moeda · valor aplicado na célula da coluna · Print `202-coluna-moeda-selecao.png` (sucesso ou erro) · Print `202-coluna-moeda-resultado.png` (sucesso ou erro) |
| **203** | Editar em massa coluna manual tipo **percentual** | Input percentual · valor aplicado na célula da coluna · Print `203-coluna-percentual-selecao.png` (sucesso ou erro) · Print `203-coluna-percentual-resultado.png` (sucesso ou erro) |
| **204** | Editar em massa coluna manual tipo **checkbox** | Select «✓ Sim / ✗ Não» (mesmo padrão da edição inline) · valor aplicado na célula da coluna · Print `204-coluna-checkbox-selecao.png` (sucesso ou erro) · Print `204-coluna-checkbox-resultado.png` (sucesso ou erro) |
| **205** | Editar em massa coluna manual tipo **tipo-documento** | Seleção de tipo de documento · valor aplicado na célula da coluna · Print `205-coluna-tipo-documento-selecao.png` (sucesso ou erro) · Print `205-coluna-tipo-documento-resultado.png` (sucesso ou erro) |
| **206** | Coluna tipo **fórmula** | **NÃO listada** no combobox · célula continua exibindo valor calculado · Print `206-coluna-formula-bloqueada.png` (sucesso ou erro) |
| **207** | Validar escopo | Coluna escopo Pedido só no nível Pedido/Combinado; escopo Item só no nível Item/Combinado · Print `207-coluna-escopo.png` (sucesso ou erro) |
| **208** | **Persistência da etapa**: hub → Lista → reexpandir pedido-alvo | Valores das colunas manuais mantidos · Print `208-colunas-usuario-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 29 — AUTO-FILL TIPO DE OPERAÇÃO (passos 209–212)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **209** | Pedido **Importação**: `tipo_operacao_pedido` → Exportação → reverter | Auto-fill dos campos dependentes coerente · reversão restaura estado · Print `209-tipo-operacao-imp-exp.png` (sucesso ou erro) |
| **210** | Pedido **Exportação**: → Importação → reverter | Comportamento simétrico · Print `210-tipo-operacao-exp-imp.png` (sucesso ou erro) |
| **211** | `tipo_operacao_item` no nível **Item** | Itens seguem a mesma regra · Print `211-tipo-operacao-item.png` (sucesso ou erro) |
| **212** | **Persistência da etapa**: hub → Lista → reexpandir pedido-alvo | Tipo de operação mantido após navegação · Print `212-tipo-operacao-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

### ETAPA 30 — ERROS, BLOQUEIOS E ESTADOS (passos 213–216)

> Etapa **somente leitura** — nenhuma alteração é aplicada; dispensa passo de persistência.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **213** | Avançar sem campo preenchido | «Revisar alterações» desabilitado · Print `213-erros-revisar-desabilitado.png` (sucesso ou erro) |
| **214** | Campo `@@unique` (`numero_pedido`) com >1 pedido selecionado | Input bloqueado com aviso de colisão · Print `214-erros-unique-bloqueado.png` (sucesso ou erro) |
| **215** | «Voltar» no passo Revisão | Retorna ao passo Campos sem aplicar |
| **216** | «Cancelar» no passo Campos | Modal fecha sem aplicar nada |

### ETAPA 31 — PERSISTÊNCIA FINAL + RELATÓRIO (passo 217)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **217** | Navegar Hub → voltar à Lista · gravar `RESULTADO.txt` | Visão final consolidada da grade · relatório com todas as linhas `EMT_ROW` · Print `217-persistencia-final.png` (sucesso ou erro) |

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
| 009 | `009-pedido-identificacao-persistencia-apos-navegar-resultado.png` | PEDIDO · Identificacao — grade após navegar hub→lista (persistência da etapa) |
| 010 | `010-nome_exportador-selecao.png` | Exportador — Nome — passo Revisão com de→para visível |
| 010 | `010-nome_exportador-resultado.png` | Exportador — Nome — lista após aplicar |
| 011 | `011-endereco_exportador-selecao.png` | Exportador — Endereco — passo Revisão com de→para visível |
| 011 | `011-endereco_exportador-resultado.png` | Exportador — Endereco — lista após aplicar |
| 012 | `012-pais_exportador-selecao.png` | Exportador — Pais — passo Revisão com de→para visível |
| 012 | `012-pais_exportador-resultado.png` | Exportador — Pais — lista após aplicar |
| 013 | `013-estado_exportador-selecao.png` | Exportador — Estado — passo Revisão com de→para visível |
| 013 | `013-estado_exportador-resultado.png` | Exportador — Estado — lista após aplicar |
| 014 | `014-cidade_exportador-selecao.png` | Exportador — Cidade — passo Revisão com de→para visível |
| 014 | `014-cidade_exportador-resultado.png` | Exportador — Cidade — lista após aplicar |
| 015 | `015-zip_code_exportador-selecao.png` | Exportador — ZIP Code — passo Revisão com de→para visível |
| 015 | `015-zip_code_exportador-resultado.png` | Exportador — ZIP Code — lista após aplicar |
| 016 | `016-exportador_ou_fabricante-selecao.png` | Exportador ou Fabricante — passo Revisão com de→para visível |
| 016 | `016-exportador_ou_fabricante-resultado.png` | Exportador ou Fabricante — lista após aplicar |
| 017 | `017-relacao_exportador_fabricante-selecao.png` | Relacao Export./Fabric. — passo Revisão com de→para visível |
| 017 | `017-relacao_exportador_fabricante-resultado.png` | Relacao Export./Fabric. — lista após aplicar |
| 018 | `018-nome_contato_exportador-selecao.png` | Contato Export. — Nome — passo Revisão com de→para visível |
| 018 | `018-nome_contato_exportador-resultado.png` | Contato Export. — Nome — lista após aplicar |
| 019 | `019-email_contato_exportador-selecao.png` | Contato Export. — Email — passo Revisão com de→para visível |
| 019 | `019-email_contato_exportador-resultado.png` | Contato Export. — Email — lista após aplicar |
| 020 | `020-whatsapp_contato_exportador-selecao.png` | Contato Export. — WhatsApp — passo Revisão com de→para visível |
| 020 | `020-whatsapp_contato_exportador-resultado.png` | Contato Export. — WhatsApp — lista após aplicar |
| 021 | `021-cargo_contato_exportador-selecao.png` | Contato Export. — Cargo — passo Revisão com de→para visível |
| 021 | `021-cargo_contato_exportador-resultado.png` | Contato Export. — Cargo — lista após aplicar |
| 022 | `022-departamento_contato_exportador-selecao.png` | Contato Export. — Depto. — passo Revisão com de→para visível |
| 022 | `022-departamento_contato_exportador-resultado.png` | Contato Export. — Depto. — lista após aplicar |
| 023 | `023-pedido-exportador-persistencia-apos-navegar-resultado.png` | PEDIDO · Exportador — grade após navegar hub→lista (persistência da etapa) |
| 024 | `024-nome_importador-selecao.png` | Importador — Nome — passo Revisão com de→para visível |
| 024 | `024-nome_importador-resultado.png` | Importador — Nome — lista após aplicar |
| 025 | `025-cnpj_importador_pedido-selecao.png` | Importador — CNPJ — passo Revisão com de→para visível |
| 025 | `025-cnpj_importador_pedido-resultado.png` | Importador — CNPJ — lista após aplicar |
| 026 | `026-pedido-importador-persistencia-apos-navegar-resultado.png` | PEDIDO · Importador — grade após navegar hub→lista (persistência da etapa) |
| 027 | `027-nome_fabricante-selecao.png` | Fabricante — Nome — passo Revisão com de→para visível |
| 027 | `027-nome_fabricante-resultado.png` | Fabricante — Nome — lista após aplicar |
| 028 | `028-endereco_fabricante-selecao.png` | Fabricante — Endereco — passo Revisão com de→para visível |
| 028 | `028-endereco_fabricante-resultado.png` | Fabricante — Endereco — lista após aplicar |
| 029 | `029-pais_fabricante-selecao.png` | Fabricante — Pais — passo Revisão com de→para visível |
| 029 | `029-pais_fabricante-resultado.png` | Fabricante — Pais — lista após aplicar |
| 030 | `030-estado_fabricante-selecao.png` | Fabricante — Estado — passo Revisão com de→para visível |
| 030 | `030-estado_fabricante-resultado.png` | Fabricante — Estado — lista após aplicar |
| 031 | `031-cidade_fabricante-selecao.png` | Fabricante — Cidade — passo Revisão com de→para visível |
| 031 | `031-cidade_fabricante-resultado.png` | Fabricante — Cidade — lista após aplicar |
| 032 | `032-zip_code_fabricante-selecao.png` | Fabricante — ZIP Code — passo Revisão com de→para visível |
| 032 | `032-zip_code_fabricante-resultado.png` | Fabricante — ZIP Code — lista após aplicar |
| 033 | `033-pedido-fabricante-persistencia-apos-navegar-resultado.png` | PEDIDO · Fabricante — grade após navegar hub→lista (persistência da etapa) |
| 034 | `034-referencia_importador_pedido-selecao.png` | Referencia Importador — passo Revisão com de→para visível |
| 034 | `034-referencia_importador_pedido-resultado.png` | Referencia Importador — lista após aplicar |
| 035 | `035-referencia_exportador_pedido-selecao.png` | Referencia Exportador — passo Revisão com de→para visível |
| 035 | `035-referencia_exportador_pedido-resultado.png` | Referencia Exportador — lista após aplicar |
| 036 | `036-numero_proforma_pedido-selecao.png` | No Proforma — passo Revisão com de→para visível |
| 036 | `036-numero_proforma_pedido-resultado.png` | No Proforma — lista após aplicar |
| 037 | `037-numero_invoice_pedido-selecao.png` | No Invoice — passo Revisão com de→para visível |
| 037 | `037-numero_invoice_pedido-resultado.png` | No Invoice — lista após aplicar |
| 038 | `038-referencia_fabricante_pedido-selecao.png` | Referencia Fabricante — passo Revisão com de→para visível |
| 038 | `038-referencia_fabricante_pedido-resultado.png` | Referencia Fabricante — lista após aplicar |
| 039 | `039-pedido-documentos-persistencia-apos-navegar-resultado.png` | PEDIDO · Documentos — grade após navegar hub→lista (persistência da etapa) |
| 040 | `040-codigo_ope-selecao.png` | OPE — Codigo — passo Revisão com de→para visível |
| 040 | `040-codigo_ope-resultado.png` | OPE — Codigo — lista após aplicar |
| 041 | `041-nome_ope-selecao.png` | OPE — Nome — passo Revisão com de→para visível |
| 041 | `041-nome_ope-resultado.png` | OPE — Nome — lista após aplicar |
| 042 | `042-endereco_ope-selecao.png` | OPE — Endereco — passo Revisão com de→para visível |
| 042 | `042-endereco_ope-resultado.png` | OPE — Endereco — lista após aplicar |
| 043 | `043-pais_ope-selecao.png` | OPE — Pais — passo Revisão com de→para visível |
| 043 | `043-pais_ope-resultado.png` | OPE — Pais — lista após aplicar |
| 044 | `044-estado_ope-selecao.png` | OPE — Estado — passo Revisão com de→para visível |
| 044 | `044-estado_ope-resultado.png` | OPE — Estado — lista após aplicar |
| 045 | `045-cidade_ope-selecao.png` | OPE — Cidade — passo Revisão com de→para visível |
| 045 | `045-cidade_ope-resultado.png` | OPE — Cidade — lista após aplicar |
| 046 | `046-zip_code_ope-selecao.png` | OPE — ZIP Code — passo Revisão com de→para visível |
| 046 | `046-zip_code_ope-resultado.png` | OPE — ZIP Code — lista após aplicar |
| 047 | `047-tin_ope-selecao.png` | OPE — TIN — passo Revisão com de→para visível |
| 047 | `047-tin_ope-resultado.png` | OPE — TIN — lista após aplicar |
| 048 | `048-email_ope-selecao.png` | OPE — Email — passo Revisão com de→para visível |
| 048 | `048-email_ope-resultado.png` | OPE — Email — lista após aplicar |
| 049 | `049-situacao_ope-selecao.png` | OPE — Situacao — passo Revisão com de→para visível |
| 049 | `049-situacao_ope-resultado.png` | OPE — Situacao — lista após aplicar |
| 050 | `050-versao_ope-selecao.png` | OPE — Versao — passo Revisão com de→para visível |
| 050 | `050-versao_ope-resultado.png` | OPE — Versao — lista após aplicar |
| 051 | `051-cnpj_raiz_empresa_responsavel-selecao.png` | CNPJ Raiz Empresa Responsavel — passo Revisão com de→para visível |
| 051 | `051-cnpj_raiz_empresa_responsavel-resultado.png` | CNPJ Raiz Empresa Responsavel — lista após aplicar |
| 052 | `052-pedido-ope-persistencia-apos-navegar-resultado.png` | PEDIDO · OPE — grade após navegar hub→lista (persistência da etapa) |
| 053 | `053-incoterm_pedido-selecao.png` | Incoterm — passo Revisão com de→para visível |
| 053 | `053-incoterm_pedido-resultado.png` | Incoterm — lista após aplicar |
| 054 | `054-moeda_pedido-selecao.png` | Moeda do Pedido — passo Revisão com de→para visível |
| 054 | `054-moeda_pedido-resultado.png` | Moeda do Pedido — lista após aplicar |
| 055 | `055-unidade_comercializada_pedido-selecao.png` | Unidade Comercializada do Pedido — passo Revisão com de→para visível |
| 055 | `055-unidade_comercializada_pedido-resultado.png` | Unidade Comercializada do Pedido — lista após aplicar |
| 056 | `056-condicao_pagamento_pedido-selecao.png` | Condicao de Pagamento — Comercial — passo Revisão com de→para visível |
| 056 | `056-condicao_pagamento_pedido-resultado.png` | Condicao de Pagamento — Comercial — lista após aplicar |
| 057 | `057-condicao_pagamento_siscomex_pedido-selecao.png` | Condicao de Pagamento — Siscomex — passo Revisão com de→para visível |
| 057 | `057-condicao_pagamento_siscomex_pedido-resultado.png` | Condicao de Pagamento — Siscomex — lista após aplicar |
| 058 | `058-tipo_volume_pedido-selecao.png` | Tipo Volume Pedido — passo Revisão com de→para visível |
| 058 | `058-tipo_volume_pedido-resultado.png` | Tipo Volume Pedido — lista após aplicar |
| 059 | `059-quantidade_volumes_pedido-selecao.png` | Qtd. de Volumes — passo Revisão com de→para visível |
| 059 | `059-quantidade_volumes_pedido-resultado.png` | Qtd. de Volumes — lista após aplicar |
| 060 | `060-tipo_volume_item-selecao.png` | Tipo Volume Item — passo Revisão com de→para visível |
| 060 | `060-tipo_volume_item-resultado.png` | Tipo Volume Item — lista após aplicar |
| 061 | `061-cobertura_cambial_pedido-selecao.png` | Cobertura Cambial — passo Revisão com de→para visível |
| 061 | `061-cobertura_cambial_pedido-resultado.png` | Cobertura Cambial — lista após aplicar |
| 062 | `062-pedido-comercial-persistencia-apos-navegar-resultado.png` | PEDIDO · Comercial — grade após navegar hub→lista (persistência da etapa) |
| 063 | `063-valor_total_cambio_pedido-selecao.png` | Valor Total Cambio — passo Revisão com de→para visível |
| 063 | `063-valor_total_cambio_pedido-resultado.png` | Valor Total Cambio — lista após aplicar |
| 064 | `064-moeda_cambio_pedido-selecao.png` | Moeda Cambio — passo Revisão com de→para visível |
| 064 | `064-moeda_cambio_pedido-resultado.png` | Moeda Cambio — lista após aplicar |
| 065 | `065-taxa_cambio_estimada_pedido-selecao.png` | Taxa Cambio Estimada — passo Revisão com de→para visível |
| 065 | `065-taxa_cambio_estimada_pedido-resultado.png` | Taxa Cambio Estimada — lista após aplicar |
| 066 | `066-contrato_cambio_id_pedido-selecao.png` | Contrato de Cambio (ID) — passo Revisão com de→para visível |
| 066 | `066-contrato_cambio_id_pedido-resultado.png` | Contrato de Cambio (ID) — lista após aplicar |
| 067 | `067-pedido-cambio-persistencia-apos-navegar-resultado.png` | PEDIDO · Cambio — grade após navegar hub→lista (persistência da etapa) |
| 068 | `068-porto_origem-selecao.png` | Porto de Origem — passo Revisão com de→para visível |
| 068 | `068-porto_origem-resultado.png` | Porto de Origem — lista após aplicar |
| 069 | `069-porto_destino-selecao.png` | Porto de Destino — passo Revisão com de→para visível |
| 069 | `069-porto_destino-resultado.png` | Porto de Destino — lista após aplicar |
| 070 | `070-local_de_origem-selecao.png` | País origem — passo Revisão com de→para visível |
| 070 | `070-local_de_origem-resultado.png` | País origem — lista após aplicar |
| 071 | `071-local_de_destino-selecao.png` | País destino — passo Revisão com de→para visível |
| 071 | `071-local_de_destino-resultado.png` | País destino — lista após aplicar |
| 072 | `072-aeroporto_origem-selecao.png` | Aeroporto de Origem — passo Revisão com de→para visível |
| 072 | `072-aeroporto_origem-resultado.png` | Aeroporto de Origem — lista após aplicar |
| 073 | `073-aeroporto_destino-selecao.png` | Aeroporto de Destino — passo Revisão com de→para visível |
| 073 | `073-aeroporto_destino-resultado.png` | Aeroporto de Destino — lista após aplicar |
| 074 | `074-data_embarque_origem-selecao.png` | Data de Embarque na Origem — passo Revisão com de→para visível |
| 074 | `074-data_embarque_origem-resultado.png` | Data de Embarque na Origem — lista após aplicar |
| 075 | `075-pedido-logistica-persistencia-apos-navegar-resultado.png` | PEDIDO · Logistica — grade após navegar hub→lista (persistência da etapa) |
| 076 | `076-data_emissao_pedido-selecao.png` | Data de Emissao — passo Revisão com de→para visível |
| 076 | `076-data_emissao_pedido-resultado.png` | Data de Emissao — lista após aplicar |
| 077 | `077-data_documento_pedido-selecao.png` | Data do Documento — passo Revisão com de→para visível |
| 077 | `077-data_documento_pedido-resultado.png` | Data do Documento — lista após aplicar |
| 078 | `078-data_documento_proforma_pedido-selecao.png` | Data do Documento Proforma — passo Revisão com de→para visível |
| 078 | `078-data_documento_proforma_pedido-resultado.png` | Data do Documento Proforma — lista após aplicar |
| 079 | `079-data_documento_invoice_pedido-selecao.png` | Data do Documento Invoice — passo Revisão com de→para visível |
| 079 | `079-data_documento_invoice_pedido-resultado.png` | Data do Documento Invoice — lista após aplicar |
| 080 | `080-data_prevista_pedido_pronto-selecao.png` | Data Prevista — Pedido Pronto — passo Revisão com de→para visível |
| 080 | `080-data_prevista_pedido_pronto-resultado.png` | Data Prevista — Pedido Pronto — lista após aplicar |
| 081 | `081-data_confirmada_pedido_pronto-selecao.png` | Data Confirmada — Pedido Pronto — passo Revisão com de→para visível |
| 081 | `081-data_confirmada_pedido_pronto-resultado.png` | Data Confirmada — Pedido Pronto — lista após aplicar |
| 082 | `082-data_meta_pedido_pronto-selecao.png` | Data Meta — Pedido Pronto — passo Revisão com de→para visível |
| 082 | `082-data_meta_pedido_pronto-resultado.png` | Data Meta — Pedido Pronto — lista após aplicar |
| 083 | `083-data_prevista_inspecao_pedido-selecao.png` | Data Prevista — Inspecao — passo Revisão com de→para visível |
| 083 | `083-data_prevista_inspecao_pedido-resultado.png` | Data Prevista — Inspecao — lista após aplicar |
| 084 | `084-data_confirmada_inspecao_pedido-selecao.png` | Data Confirmada — Inspecao — passo Revisão com de→para visível |
| 084 | `084-data_confirmada_inspecao_pedido-resultado.png` | Data Confirmada — Inspecao — lista após aplicar |
| 085 | `085-data_meta_inspecao_pedido-selecao.png` | Data Meta — Inspecao — passo Revisão com de→para visível |
| 085 | `085-data_meta_inspecao_pedido-resultado.png` | Data Meta — Inspecao — lista após aplicar |
| 086 | `086-data_prevista_coleta_pedido-selecao.png` | Data Prevista — Coleta — passo Revisão com de→para visível |
| 086 | `086-data_prevista_coleta_pedido-resultado.png` | Data Prevista — Coleta — lista após aplicar |
| 087 | `087-data_confirmada_coleta_pedido-selecao.png` | Data Confirmada — Coleta — passo Revisão com de→para visível |
| 087 | `087-data_confirmada_coleta_pedido-resultado.png` | Data Confirmada — Coleta — lista após aplicar |
| 088 | `088-data_meta_coleta_pedido-selecao.png` | Data Meta — Coleta — passo Revisão com de→para visível |
| 088 | `088-data_meta_coleta_pedido-resultado.png` | Data Meta — Coleta — lista após aplicar |
| 089 | `089-data_transferencia_saldo_pedido-selecao.png` | Data de Transferencia de Saldo — passo Revisão com de→para visível |
| 089 | `089-data_transferencia_saldo_pedido-resultado.png` | Data de Transferencia de Saldo — lista após aplicar |
| 090 | `090-pedido-datas-persistencia-apos-navegar-resultado.png` | PEDIDO · Datas — grade após navegar hub→lista (persistência da etapa) |
| 091 | `091-data_previsao_recebimento_rascunho_pedido-selecao.png` | Draft Pedido — Prev. Recebimento — passo Revisão com de→para visível |
| 091 | `091-data_previsao_recebimento_rascunho_pedido-resultado.png` | Draft Pedido — Prev. Recebimento — lista após aplicar |
| 092 | `092-data_confirmacao_recebimento_rascunho_pedido-selecao.png` | Draft Pedido — Conf. Recebimento — passo Revisão com de→para visível |
| 092 | `092-data_confirmacao_recebimento_rascunho_pedido-resultado.png` | Draft Pedido — Conf. Recebimento — lista após aplicar |
| 093 | `093-data_meta_recebimento_rascunho_pedido-selecao.png` | Draft Pedido — Meta Recebimento — passo Revisão com de→para visível |
| 093 | `093-data_meta_recebimento_rascunho_pedido-resultado.png` | Draft Pedido — Meta Recebimento — lista após aplicar |
| 094 | `094-data_previsao_aprovacao_rascunho_pedido-selecao.png` | Draft Pedido — Prev. Aprovacao — passo Revisão com de→para visível |
| 094 | `094-data_previsao_aprovacao_rascunho_pedido-resultado.png` | Draft Pedido — Prev. Aprovacao — lista após aplicar |
| 095 | `095-data_confirmacao_aprovacao_rascunho_pedido-selecao.png` | Draft Pedido — Conf. Aprovacao — passo Revisão com de→para visível |
| 095 | `095-data_confirmacao_aprovacao_rascunho_pedido-resultado.png` | Draft Pedido — Conf. Aprovacao — lista após aplicar |
| 096 | `096-data_meta_aprovacao_rascunho_pedido-selecao.png` | Draft Pedido — Meta Aprovacao — passo Revisão com de→para visível |
| 096 | `096-data_meta_aprovacao_rascunho_pedido-resultado.png` | Draft Pedido — Meta Aprovacao — lista após aplicar |
| 097 | `097-pedido-datas-draft-pedido-persistencia-apos-navegar-resultado.png` | PEDIDO · Datas Draft Pedido — grade após navegar hub→lista (persistência da etapa) |
| 098 | `098-data_previsao_recebimento_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Prev. Recebimento — passo Revisão com de→para visível |
| 098 | `098-data_previsao_recebimento_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Prev. Recebimento — lista após aplicar |
| 099 | `099-data_confirmacao_recebimento_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Conf. Recebimento — passo Revisão com de→para visível |
| 099 | `099-data_confirmacao_recebimento_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Conf. Recebimento — lista após aplicar |
| 100 | `100-data_meta_recebimento_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Meta Recebimento — passo Revisão com de→para visível |
| 100 | `100-data_meta_recebimento_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Meta Recebimento — lista após aplicar |
| 101 | `101-data_previsao_aprovacao_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Prev. Aprovacao — passo Revisão com de→para visível |
| 101 | `101-data_previsao_aprovacao_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Prev. Aprovacao — lista após aplicar |
| 102 | `102-data_confirmacao_aprovacao_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Conf. Aprovacao — passo Revisão com de→para visível |
| 102 | `102-data_confirmacao_aprovacao_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Conf. Aprovacao — lista após aplicar |
| 103 | `103-data_meta_aprovacao_rascunho_proforma_pedido-selecao.png` | Draft Proforma — Meta Aprovacao — passo Revisão com de→para visível |
| 103 | `103-data_meta_aprovacao_rascunho_proforma_pedido-resultado.png` | Draft Proforma — Meta Aprovacao — lista após aplicar |
| 104 | `104-data_previsao_envio_original_proforma_pedido-selecao.png` | Original Proforma — Prev. Envio — passo Revisão com de→para visível |
| 104 | `104-data_previsao_envio_original_proforma_pedido-resultado.png` | Original Proforma — Prev. Envio — lista após aplicar |
| 105 | `105-data_confirmacao_envio_original_proforma_pedido-selecao.png` | Original Proforma — Conf. Envio — passo Revisão com de→para visível |
| 105 | `105-data_confirmacao_envio_original_proforma_pedido-resultado.png` | Original Proforma — Conf. Envio — lista após aplicar |
| 106 | `106-data_meta_envio_original_proforma_pedido-selecao.png` | Original Proforma — Meta Envio — passo Revisão com de→para visível |
| 106 | `106-data_meta_envio_original_proforma_pedido-resultado.png` | Original Proforma — Meta Envio — lista após aplicar |
| 107 | `107-data_previsao_recebimento_original_proforma_pedido-selecao.png` | Original Proforma — Prev. Recebimento — passo Revisão com de→para visível |
| 107 | `107-data_previsao_recebimento_original_proforma_pedido-resultado.png` | Original Proforma — Prev. Recebimento — lista após aplicar |
| 108 | `108-data_confirmacao_recebimento_original_proforma_pedido-selecao.png` | Original Proforma — Conf. Recebimento — passo Revisão com de→para visível |
| 108 | `108-data_confirmacao_recebimento_original_proforma_pedido-resultado.png` | Original Proforma — Conf. Recebimento — lista após aplicar |
| 109 | `109-data_meta_recebimento_original_proforma_pedido-selecao.png` | Original Proforma — Meta Recebimento — passo Revisão com de→para visível |
| 109 | `109-data_meta_recebimento_original_proforma_pedido-resultado.png` | Original Proforma — Meta Recebimento — lista após aplicar |
| 110 | `110-data_proforma_invoice-selecao.png` | Data da Proforma Invoice — passo Revisão com de→para visível |
| 110 | `110-data_proforma_invoice-resultado.png` | Data da Proforma Invoice — lista após aplicar |
| 111 | `111-pedido-datas-draft-proforma-persistencia-apos-navegar-resultado.png` | PEDIDO · Datas Draft Proforma — grade após navegar hub→lista (persistência da etapa) |
| 112 | `112-data_previsao_recebimento_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Prev. Recebimento — passo Revisão com de→para visível |
| 112 | `112-data_previsao_recebimento_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Prev. Recebimento — lista após aplicar |
| 113 | `113-data_confirmacao_recebimento_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Conf. Recebimento — passo Revisão com de→para visível |
| 113 | `113-data_confirmacao_recebimento_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Conf. Recebimento — lista após aplicar |
| 114 | `114-data_meta_recebimento_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Meta Recebimento — passo Revisão com de→para visível |
| 114 | `114-data_meta_recebimento_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Meta Recebimento — lista após aplicar |
| 115 | `115-data_previsao_aprovacao_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Prev. Aprovacao — passo Revisão com de→para visível |
| 115 | `115-data_previsao_aprovacao_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Prev. Aprovacao — lista após aplicar |
| 116 | `116-data_confirmacao_aprovacao_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Conf. Aprovacao — passo Revisão com de→para visível |
| 116 | `116-data_confirmacao_aprovacao_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Conf. Aprovacao — lista após aplicar |
| 117 | `117-data_meta_aprovacao_rascunho_invoice_pedido-selecao.png` | Draft Invoice — Meta Aprovacao — passo Revisão com de→para visível |
| 117 | `117-data_meta_aprovacao_rascunho_invoice_pedido-resultado.png` | Draft Invoice — Meta Aprovacao — lista após aplicar |
| 118 | `118-data_previsao_envio_original_invoice_pedido-selecao.png` | Original Invoice — Prev. Envio — passo Revisão com de→para visível |
| 118 | `118-data_previsao_envio_original_invoice_pedido-resultado.png` | Original Invoice — Prev. Envio — lista após aplicar |
| 119 | `119-data_confirmacao_envio_original_invoice_pedido-selecao.png` | Original Invoice — Conf. Envio — passo Revisão com de→para visível |
| 119 | `119-data_confirmacao_envio_original_invoice_pedido-resultado.png` | Original Invoice — Conf. Envio — lista após aplicar |
| 120 | `120-data_meta_envio_original_invoice_pedido-selecao.png` | Original Invoice — Meta Envio — passo Revisão com de→para visível |
| 120 | `120-data_meta_envio_original_invoice_pedido-resultado.png` | Original Invoice — Meta Envio — lista após aplicar |
| 121 | `121-data_previsao_recebimento_original_invoice_pedido-selecao.png` | Original Invoice — Prev. Recebimento — passo Revisão com de→para visível |
| 121 | `121-data_previsao_recebimento_original_invoice_pedido-resultado.png` | Original Invoice — Prev. Recebimento — lista após aplicar |
| 122 | `122-data_confirmacao_recebimento_original_invoice_pedido-selecao.png` | Original Invoice — Conf. Recebimento — passo Revisão com de→para visível |
| 122 | `122-data_confirmacao_recebimento_original_invoice_pedido-resultado.png` | Original Invoice — Conf. Recebimento — lista após aplicar |
| 123 | `123-data_meta_recebimento_original_invoice_pedido-selecao.png` | Original Invoice — Meta Recebimento — passo Revisão com de→para visível |
| 123 | `123-data_meta_recebimento_original_invoice_pedido-resultado.png` | Original Invoice — Meta Recebimento — lista após aplicar |
| 124 | `124-data_invoice-selecao.png` | Data da Invoice — passo Revisão com de→para visível |
| 124 | `124-data_invoice-resultado.png` | Data da Invoice — lista após aplicar |
| 125 | `125-pedido-datas-draft-invoice-persistencia-apos-navegar-resultado.png` | PEDIDO · Datas Draft Invoice — grade após navegar hub→lista (persistência da etapa) |
| 126 | `126-casas_decimais_valor_pedido-selecao.png` | Casas Decimais — Valor — passo Revisão com de→para visível |
| 126 | `126-casas_decimais_valor_pedido-resultado.png` | Casas Decimais — Valor — lista após aplicar |
| 127 | `127-pedido-financeiro-persistencia-apos-navegar-resultado.png` | PEDIDO · Financeiro — grade após navegar hub→lista (persistência da etapa) |
| 128 | `128-casas_decimais_quantidade_pedido-selecao.png` | Casas Decimais — Qtd. — passo Revisão com de→para visível |
| 128 | `128-casas_decimais_quantidade_pedido-resultado.png` | Casas Decimais — Qtd. — lista após aplicar |
| 129 | `129-casas_decimais_peso_pedido-selecao.png` | Casas Decimais — Peso — passo Revisão com de→para visível |
| 129 | `129-casas_decimais_peso_pedido-resultado.png` | Casas Decimais — Peso — lista após aplicar |
| 130 | `130-casas_decimais_cubagem_pedido-selecao.png` | Casas Decimais — Cubagem — passo Revisão com de→para visível |
| 130 | `130-casas_decimais_cubagem_pedido-resultado.png` | Casas Decimais — Cubagem — lista após aplicar |
| 131 | `131-pedido-fisico-persistencia-apos-navegar-resultado.png` | PEDIDO · Fisico — grade após navegar hub→lista (persistência da etapa) |
| 132 | `132-sequencia_item_pedido-selecao.png` | Sequencia do Item — passo Revisão com de→para visível |
| 132 | `132-sequencia_item_pedido-resultado.png` | Sequencia do Item — lista após aplicar |
| 133 | `133-part_number_item-selecao.png` | Part Number — passo Revisão com de→para visível |
| 133 | `133-part_number_item-resultado.png` | Part Number — lista após aplicar |
| 134 | `134-ncm_item-selecao.png` | NCM — passo Revisão com de→para visível |
| 134 | `134-ncm_item-resultado.png` | NCM — lista após aplicar |
| 135 | `135-descricao_item-selecao.png` | Descricao do Item — passo Revisão com de→para visível |
| 135 | `135-descricao_item-resultado.png` | Descricao do Item — lista após aplicar |
| 136 | `136-unidade_comercializada_item-selecao.png` | Unidade Comercializada do Item — passo Revisão com de→para visível |
| 136 | `136-unidade_comercializada_item-resultado.png` | Unidade Comercializada do Item — lista após aplicar |
| 137 | `137-tipo_operacao_item-selecao.png` | Tipo de Operacao (Item) — passo Revisão com de→para visível |
| 137 | `137-tipo_operacao_item-resultado.png` | Tipo de Operacao (Item) — lista após aplicar |
| 138 | `138-descricao_completa_item_pt-selecao.png` | Descricao Completa (PT) — passo Revisão com de→para visível |
| 138 | `138-descricao_completa_item_pt-resultado.png` | Descricao Completa (PT) — lista após aplicar |
| 139 | `139-descricao_completa_item_en-selecao.png` | Descricao Completa (EN) — passo Revisão com de→para visível |
| 139 | `139-descricao_completa_item_en-resultado.png` | Descricao Completa (EN) — lista após aplicar |
| 140 | `140-descricao_completa_item_es-selecao.png` | Descricao Completa (ES) — passo Revisão com de→para visível |
| 140 | `140-descricao_completa_item_es-resultado.png` | Descricao Completa (ES) — lista após aplicar |
| 141 | `141-descricao_completa_item_nf-selecao.png` | Descricao Completa (NF) — passo Revisão com de→para visível |
| 141 | `141-descricao_completa_item_nf-resultado.png` | Descricao Completa (NF) — lista após aplicar |
| 142 | `142-texto_posicao_ncm-selecao.png` | Texto Posicao NCM — passo Revisão com de→para visível |
| 142 | `142-texto_posicao_ncm-resultado.png` | Texto Posicao NCM — lista após aplicar |
| 143 | `143-grupo_item-selecao.png` | Grupo do Item — passo Revisão com de→para visível |
| 143 | `143-grupo_item-resultado.png` | Grupo do Item — lista após aplicar |
| 144 | `144-subgrupo_item-selecao.png` | Subgrupo do Item — passo Revisão com de→para visível |
| 144 | `144-subgrupo_item-resultado.png` | Subgrupo do Item — lista após aplicar |
| 145 | `145-campo_especial_item-selecao.png` | Campo Especial do Item — passo Revisão com de→para visível |
| 145 | `145-campo_especial_item-resultado.png` | Campo Especial do Item — lista após aplicar |
| 146 | `146-atributos_catalogo-selecao.png` | Atributos de Catalogo — passo Revisão com de→para visível |
| 146 | `146-atributos_catalogo-resultado.png` | Atributos de Catalogo — lista após aplicar |
| 147 | `147-item-produto-persistencia-apos-navegar-resultado.png` | ITEM · Produto — grade após navegar hub→lista (persistência da etapa) |
| 148 | `148-quantidade_inicial_item-selecao.png` | Qtd. Inicial — passo Revisão com de→para visível |
| 148 | `148-quantidade_inicial_item-resultado.png` | Qtd. Inicial — lista após aplicar |
| 149 | `149-quantidade_pronta_item-selecao.png` | Qtd. Pronta Total — passo Revisão com de→para visível |
| 149 | `149-quantidade_pronta_item-resultado.png` | Qtd. Pronta Total — lista após aplicar |
| 150 | `150-quantidade_cancelada_item-selecao.png` | Qtd. Cancelada — passo Revisão com de→para visível |
| 150 | `150-quantidade_cancelada_item-resultado.png` | Qtd. Cancelada — lista após aplicar |
| 151 | `151-casas_decimais_quantidade_item-selecao.png` | Casas Decimais — Qtd. — passo Revisão com de→para visível |
| 151 | `151-casas_decimais_quantidade_item-resultado.png` | Casas Decimais — Qtd. — lista após aplicar |
| 152 | `152-item-quantidades-persistencia-apos-navegar-resultado.png` | ITEM · Quantidades — grade após navegar hub→lista (persistência da etapa) |
| 153 | `153-moeda_item-selecao.png` | Moeda do Item — passo Revisão com de→para visível |
| 153 | `153-moeda_item-resultado.png` | Moeda do Item — lista após aplicar |
| 154 | `154-valor_por_unidade_item-selecao.png` | Valor por Unidade — passo Revisão com de→para visível |
| 154 | `154-valor_por_unidade_item-resultado.png` | Valor por Unidade — lista após aplicar |
| 155 | `155-casas_decimais_valor_item-selecao.png` | Casas Decimais — Valor — passo Revisão com de→para visível |
| 155 | `155-casas_decimais_valor_item-resultado.png` | Casas Decimais — Valor — lista após aplicar |
| 156 | `156-item-financeiro-persistencia-apos-navegar-resultado.png` | ITEM · Financeiro — grade após navegar hub→lista (persistência da etapa) |
| 157 | `157-cobertura_cambial_item-selecao.png` | Cobertura Cambial — passo Revisão com de→para visível |
| 157 | `157-cobertura_cambial_item-resultado.png` | Cobertura Cambial — lista após aplicar |
| 158 | `158-item-cambio-persistencia-apos-navegar-resultado.png` | ITEM · Cambio — grade após navegar hub→lista (persistência da etapa) |
| 159 | `159-condicao_pagamento_siscomex_item-selecao.png` | Condicao de Pagamento — Siscomex — passo Revisão com de→para visível |
| 159 | `159-condicao_pagamento_siscomex_item-resultado.png` | Condicao de Pagamento — Siscomex — lista após aplicar |
| 160 | `160-incoterm_item-selecao.png` | Incoterm (Item) — passo Revisão com de→para visível |
| 160 | `160-incoterm_item-resultado.png` | Incoterm (Item) — lista após aplicar |
| 161 | `161-condicao_pagamento_item-selecao.png` | Condicao de Pagamento — Comercial (Item) — passo Revisão com de→para visível |
| 161 | `161-condicao_pagamento_item-resultado.png` | Condicao de Pagamento — Comercial (Item) — lista após aplicar |
| 162 | `162-item-comercial-persistencia-apos-navegar-resultado.png` | ITEM · Comercial — grade após navegar hub→lista (persistência da etapa) |
| 163 | `163-nome_exportador_item-selecao.png` | Exportador (Item) — passo Revisão com de→para visível |
| 163 | `163-nome_exportador_item-resultado.png` | Exportador (Item) — lista após aplicar |
| 164 | `164-nome_importador_item-selecao.png` | Importador (Item) — passo Revisão com de→para visível |
| 164 | `164-nome_importador_item-resultado.png` | Importador (Item) — lista após aplicar |
| 165 | `165-nome_fabricante_item-selecao.png` | Fabricante (Item) — passo Revisão com de→para visível |
| 165 | `165-nome_fabricante_item-resultado.png` | Fabricante (Item) — lista após aplicar |
| 166 | `166-item-partes-persistencia-apos-navegar-resultado.png` | ITEM · Partes — grade após navegar hub→lista (persistência da etapa) |
| 167 | `167-referencia_importador_item-selecao.png` | Referencia Importador (Item) — passo Revisão com de→para visível |
| 167 | `167-referencia_importador_item-resultado.png` | Referencia Importador (Item) — lista após aplicar |
| 168 | `168-referencia_exportador_item-selecao.png` | Referencia Exportador (Item) — passo Revisão com de→para visível |
| 168 | `168-referencia_exportador_item-resultado.png` | Referencia Exportador (Item) — lista após aplicar |
| 169 | `169-referencia_fabricante_item-selecao.png` | Referencia Fabricante (Item) — passo Revisão com de→para visível |
| 169 | `169-referencia_fabricante_item-resultado.png` | Referencia Fabricante (Item) — lista após aplicar |
| 170 | `170-numero_proforma_item-selecao.png` | No Proforma (Item) — passo Revisão com de→para visível |
| 170 | `170-numero_proforma_item-resultado.png` | No Proforma (Item) — lista após aplicar |
| 171 | `171-numero_invoice_item-selecao.png` | No Invoice (Item) — passo Revisão com de→para visível |
| 171 | `171-numero_invoice_item-resultado.png` | No Invoice (Item) — lista após aplicar |
| 172 | `172-tipo_embalagem-selecao.png` | Tipo de Embalagem — passo Revisão com de→para visível |
| 172 | `172-tipo_embalagem-resultado.png` | Tipo de Embalagem — lista após aplicar |
| 173 | `173-numero_lpco-selecao.png` | No LPCO — passo Revisão com de→para visível |
| 173 | `173-numero_lpco-resultado.png` | No LPCO — lista após aplicar |
| 174 | `174-numero_certificado_origem-selecao.png` | No Certificado de Origem — passo Revisão com de→para visível |
| 174 | `174-numero_certificado_origem-resultado.png` | No Certificado de Origem — lista após aplicar |
| 175 | `175-data_certificado_origem-selecao.png` | Data Certificado de Origem — passo Revisão com de→para visível |
| 175 | `175-data_certificado_origem-resultado.png` | Data Certificado de Origem — lista após aplicar |
| 176 | `176-item-documentos-persistencia-apos-navegar-resultado.png` | ITEM · Documentos — grade após navegar hub→lista (persistência da etapa) |
| 177 | `177-peso_liquido_unitario_item-selecao.png` | Peso Liquido Unitario — passo Revisão com de→para visível |
| 177 | `177-peso_liquido_unitario_item-resultado.png` | Peso Liquido Unitario — lista após aplicar |
| 178 | `178-peso_bruto_unitario_item-selecao.png` | Peso Bruto Unitario — passo Revisão com de→para visível |
| 178 | `178-peso_bruto_unitario_item-resultado.png` | Peso Bruto Unitario — lista após aplicar |
| 179 | `179-cubagem_unitaria_item-selecao.png` | Cubagem Unitaria — passo Revisão com de→para visível |
| 179 | `179-cubagem_unitaria_item-resultado.png` | Cubagem Unitaria — lista após aplicar |
| 180 | `180-casas_decimais_peso_item-selecao.png` | Casas Decimais — Peso — passo Revisão com de→para visível |
| 180 | `180-casas_decimais_peso_item-resultado.png` | Casas Decimais — Peso — lista após aplicar |
| 181 | `181-casas_decimais_cubagem_item-selecao.png` | Casas Decimais — Cubagem — passo Revisão com de→para visível |
| 181 | `181-casas_decimais_cubagem_item-resultado.png` | Casas Decimais — Cubagem — lista após aplicar |
| 182 | `182-item-fisico-persistencia-apos-navegar-resultado.png` | ITEM · Fisico — grade após navegar hub→lista (persistência da etapa) |
| 183 | `183-data_emissao_item-selecao.png` | Data de Emissao (Item) — passo Revisão com de→para visível |
| 183 | `183-data_emissao_item-resultado.png` | Data de Emissao (Item) — lista após aplicar |
| 184 | `184-data_consolidacao_item-selecao.png` | Data de Consolidacao (Item) — passo Revisão com de→para visível |
| 184 | `184-data_consolidacao_item-resultado.png` | Data de Consolidacao (Item) — lista após aplicar |
| 185 | `185-data_embarque_item-selecao.png` | Data de Embarque (Item) — passo Revisão com de→para visível |
| 185 | `185-data_embarque_item-resultado.png` | Data de Embarque (Item) — lista após aplicar |
| 186 | `186-data_prevista_item_pronto-selecao.png` | Data Prevista — Item Pronto — passo Revisão com de→para visível |
| 186 | `186-data_prevista_item_pronto-resultado.png` | Data Prevista — Item Pronto — lista após aplicar |
| 187 | `187-data_confirmada_item_pronto-selecao.png` | Data Confirmada — Item Pronto — passo Revisão com de→para visível |
| 187 | `187-data_confirmada_item_pronto-resultado.png` | Data Confirmada — Item Pronto — lista após aplicar |
| 188 | `188-data_meta_item_pronto-selecao.png` | Data Meta — Item Pronto — passo Revisão com de→para visível |
| 188 | `188-data_meta_item_pronto-resultado.png` | Data Meta — Item Pronto — lista após aplicar |
| 189 | `189-data_prevista_inspecao_item-selecao.png` | Data Prevista — Inspecao (Item) — passo Revisão com de→para visível |
| 189 | `189-data_prevista_inspecao_item-resultado.png` | Data Prevista — Inspecao (Item) — lista após aplicar |
| 190 | `190-data_confirmada_inspecao_item-selecao.png` | Data Confirmada — Inspecao (Item) — passo Revisão com de→para visível |
| 190 | `190-data_confirmada_inspecao_item-resultado.png` | Data Confirmada — Inspecao (Item) — lista após aplicar |
| 191 | `191-data_meta_inspecao_item-selecao.png` | Data Meta — Inspecao (Item) — passo Revisão com de→para visível |
| 191 | `191-data_meta_inspecao_item-resultado.png` | Data Meta — Inspecao (Item) — lista após aplicar |
| 192 | `192-data_prevista_coleta_item-selecao.png` | Data Prevista — Coleta (Item) — passo Revisão com de→para visível |
| 192 | `192-data_prevista_coleta_item-resultado.png` | Data Prevista — Coleta (Item) — lista após aplicar |
| 193 | `193-data_confirmada_coleta_item-selecao.png` | Data Confirmada — Coleta (Item) — passo Revisão com de→para visível |
| 193 | `193-data_confirmada_coleta_item-resultado.png` | Data Confirmada — Coleta (Item) — lista após aplicar |
| 194 | `194-data_meta_coleta_item-selecao.png` | Data Meta — Coleta (Item) — passo Revisão com de→para visível |
| 194 | `194-data_meta_coleta_item-resultado.png` | Data Meta — Coleta (Item) — lista após aplicar |
| 195 | `195-item-datas-persistencia-apos-navegar-resultado.png` | ITEM · Datas — grade após navegar hub→lista (persistência da etapa) |
| 196 | `196-combinado-incoterm-selecao.png` | Combinado: incoterm — preview de→para pedido+itens |
| 196 | `196-combinado-incoterm-resultado.png` | Combinado: incoterm aplicado — cascade pai+filhos na lista |
| 198 | `198-combinado-persistencia-apos-navegar-resultado.png` | Combinado — grade após navegar hub→lista |
| 199 | `199-coluna-texto-selecao.png` | Coluna manual texto — passo Revisão |
| 199 | `199-coluna-texto-resultado.png` | Coluna manual texto — lista após aplicar |
| 200 | `200-coluna-numero-selecao.png` | Coluna manual numero — passo Revisão |
| 200 | `200-coluna-numero-resultado.png` | Coluna manual numero — lista após aplicar |
| 201 | `201-coluna-data-selecao.png` | Coluna manual data — passo Revisão |
| 201 | `201-coluna-data-resultado.png` | Coluna manual data — lista após aplicar |
| 202 | `202-coluna-moeda-selecao.png` | Coluna manual moeda — passo Revisão |
| 202 | `202-coluna-moeda-resultado.png` | Coluna manual moeda — lista após aplicar |
| 203 | `203-coluna-percentual-selecao.png` | Coluna manual percentual — passo Revisão |
| 203 | `203-coluna-percentual-resultado.png` | Coluna manual percentual — lista após aplicar |
| 204 | `204-coluna-checkbox-selecao.png` | Coluna manual checkbox — passo Revisão |
| 204 | `204-coluna-checkbox-resultado.png` | Coluna manual checkbox — lista após aplicar |
| 205 | `205-coluna-tipo-documento-selecao.png` | Coluna manual tipo-documento — passo Revisão |
| 205 | `205-coluna-tipo-documento-resultado.png` | Coluna manual tipo-documento — lista após aplicar |
| 206 | `206-coluna-formula-bloqueada.png` | Combobox sem a coluna fórmula (bloqueada) |
| 207 | `207-coluna-escopo.png` | Colunas por escopo — pedido vs item sem vazamento |
| 208 | `208-colunas-usuario-persistencia-apos-navegar-resultado.png` | Colunas manuais — grade após navegar hub→lista |
| 209 | `209-tipo-operacao-imp-exp.png` | Pedido Importação → Exportação em massa |
| 210 | `210-tipo-operacao-exp-imp.png` | Pedido Exportação → Importação em massa |
| 211 | `211-tipo-operacao-item.png` | tipo_operacao_item no nível Item |
| 212 | `212-tipo-operacao-persistencia-apos-navegar-resultado.png` | Tipo de operação — grade após navegar hub→lista |
| 213 | `213-erros-revisar-desabilitado.png` | «Revisar alterações» desabilitado sem campos |
| 214 | `214-erros-unique-bloqueado.png` | numero_pedido bloqueado com >1 pedido (@@unique) |
| 217 | `217-persistencia-final.png` | Lista após navegar Hub→Lista — visão final consolidada |
