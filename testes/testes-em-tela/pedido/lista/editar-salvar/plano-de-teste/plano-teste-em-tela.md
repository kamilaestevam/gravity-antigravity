# Plano de Teste em Tela — Pedido / Lista / Editar e Salvar

**ID:** TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045  
**Data:** 2026-06-06  
**Versão:** 5.3  
**Criticidade:** alta  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**Status:** Aguardando aprovação do dono

**Escopo pasta:** `testes/testes-em-tela/pedido/lista/editar-salvar/`  
**Plano + runner:** `plano-de-teste/` (este arquivo + `run-lista-editar-salvar.ts`)  
**Prints:** `../resultado-teste/<runId>/` — uma pasta por execução  
**Regras de negócio:** `documentos-tecnicos/produtos-gravity/pedido/LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md`

> O modal Admin («O que será testado») agrupa casos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Regra de sequência dos prints

> **Padrão obrigatório** (igual TIPO DE OPERAÇÃO 06→08): para cada edição com select/popover, **dois** prints em sequência:
>
> 1. **`-selecao.png`** — popover/select **aberto** com o valor escolhido (antes de confirmar)
> 2. **`-resultado.png`** — grade **após salvar** (sucesso ou erro visível na lista/toast)
>
> Alertas de divergência usam apenas **`-resultado.png`** (não há popover de edição).  
> Tooltips usam **um** print por nível (`-tooltip-pedido.png` / `-tooltip-item.png`).

---

## Regra universal — persistência ao fim de cada ETAPA

> **Obrigatório** em toda `### ETAPA …` que altera dados na lista (runner principal ou dedicado), **exceto** ETAPA 0 (preparação) e ETAPA 43 (relatório).

**Último passo da etapa** (quando ainda não existir):

1. Navegar para o **hub** (sair da tela Lista)
2. Voltar à **Lista de Pedidos**
3. Reencontrar o pedido pelo **nº pedido** e **reexpandir**
4. **APROVADO** quando **tudo** salvo na etapa permanece na grade (pedido + itens)

**Print:** `{passo}-{slug}-persistencia-apos-navegar-resultado.png`

| Situação | Ação |
|----------|------|
| Etapa já termina com persistência | Manter (Qtd. Pronta, Qtd. Inicial, Valor Total, Unidade Comercializada) |
| Etapa sem persistência | Incluir como **último passo** da ETAPA |
| Logística (29.x–34.x) | Subpasso **`.6`** (ex.: 29.6) |
| Importador / Exportador (runners dedicados) | Mesma regra no fechamento |

---

## Resumo executivo

| Bloco | Passos no runner | Runner |
|-------|------------------|--------|
| **Nº PEDIDO / Nº ITEM** | 03–05 | `run-lista-editar-salvar.ts` |
| **WORKSPACE** | — (documentado) | pendente no runner principal |
| **TIPO DE OPERAÇÃO** | 06–12 | `run-lista-editar-salvar.ts` |
| **STATUS** | — (documentado) | pendente no runner principal |
| **IMPORTADOR** | — | `run-lista-importador-emt.ts` (dedicado) |
| **EXPORTADOR** | — | `run-lista-exportador-emt.ts` (dedicado) |
| **REFERÊNCIA IMPORTADOR** | 13–16 | `run-lista-editar-salvar.ts` |
| **REFERÊNCIA EXPORTADOR** | 17–20 | `run-lista-editar-salvar.ts` |
| **INCOTERM** | 21–24 | `run-lista-editar-salvar.ts` |
| **DESCRIÇÃO DO ITEM** | 25–28 | `run-lista-editar-salvar.ts` |
| **PORTO DE ORIGEM** | 29 (5 sub-passos) | `run-lista-editar-salvar.ts` |
| **PORTO DE DESTINO** | 30 (5 sub-passos) | `run-lista-editar-salvar.ts` |
| **PAÍS DE ORIGEM** | 31 (5 sub-passos) | `run-lista-editar-salvar.ts` |
| **PAÍS DE DESTINO** | 32 (5 sub-passos) | `run-lista-editar-salvar.ts` |
| **AEROPORTO DE ORIGEM** | 33 (5 sub-passos) | `run-lista-editar-salvar.ts` |
| **AEROPORTO DE DESTINO** | 34 (5 sub-passos) | `run-lista-editar-salvar.ts` |
| **NCM** | 35–41 | `run-lista-editar-salvar.ts` |
| **QTD. PRONTA DO PEDIDO/ITEM** | 42–48 | `run-lista-editar-salvar.ts` |
| **QTD. INICIAL DO PEDIDO/ITEM** | 49–55 | `run-lista-editar-salvar.ts` |
| **MOEDA DO PEDIDO/ITEM** | 56–61 | `run-lista-editar-salvar.ts` |
| **VALOR TOTAL DO PEDIDO/ITEM** | 62–71 | `run-lista-editar-salvar.ts` |
| **UNIDADE COMERCIALIZADA DO PEDIDO/ITEM** | 72–82 | `run-lista-editar-salvar.ts` |
| **QTD. TRANSFERIDA — Básico** | 83–87 | `run-lista-editar-salvar.ts` |
| **QTD. TRANSFERIDA — Novo Pedido** | 88–106 | `run-lista-editar-salvar.ts` |
| **QTD. TRANSFERIDA — Pedido Existente** | 107–124 | `run-lista-editar-salvar.ts` |
| **QTD. TRANSFERIDA — Redução Simples** | 125–134 | `run-lista-editar-salvar.ts` |
| **SALDO — Básico** | 135–142 | `run-lista-editar-salvar.ts` |
| **SALDO — Alterar fórmula Config e restaurar** | 143–150 | `run-lista-editar-salvar.ts` |
| **SALDO — Fórmula item e recálculo** | 151–156 | `run-lista-editar-salvar.ts` |
| **SALDO — Unidades divergentes** | 157–160 | `run-lista-editar-salvar.ts` |
| **SALDO — Pós-transferência** | 161–168 | `run-lista-editar-salvar.ts` |
| **QTD. CANCELADA — Básico** | 169–176 | `run-lista-editar-salvar.ts` |
| **QTD. CANCELADA — Redução Simples** | 177–188 | `run-lista-editar-salvar.ts` |
| **QTD. CANCELADA — Unidades divergentes** | 189–192 | `run-lista-editar-salvar.ts` |
| **QTD. CANCELADA — Split não incrementa** | 193–198 | `run-lista-editar-salvar.ts` |
| **QTD. CANCELADA — Casas decimais Config** | 199–206 | `run-lista-editar-salvar.ts` |
| ~~QTD. VOLUMES (legado 207–226)~~ | — | **substituído** por ETAPA 48 (273–287) |
| **PESO LÍQUIDO TOTAL DO PEDIDO/ITEM** | 227–237 | `run-lista-editar-salvar.ts` + `validar-peso-lista.ts` |
| **PESO BRUTO TOTAL DO PEDIDO/ITEM** | 238–248 | `run-lista-editar-salvar.ts` + `validar-peso-lista.ts` |
| **CUBAGEM TOTAL DO PEDIDO/ITEM** | 249–259 | `run-lista-editar-salvar.ts` + `validar-cubagem-lista.ts` |
| **TIPO VOLUME PEDIDO/ITEM** | 260–272 | `run-lista-editar-salvar.ts` + `validar-tipo-volume-lista.ts` |
| **QTD. DE VOLUMES DO PEDIDO** | 273–287 | `run-lista-editar-salvar.ts` + `validar-qtd-volumes-lista.ts` |
| **COBERTURA CAMBIAL DO PEDIDO** | 288–302 | `run-lista-editar-salvar.ts` + `validar-cobertura-cambial-lista.ts` |

> **Ordem de execução no runner:** Peso (227–248), Cubagem (249–259), Tipo Volume (260–272), Qtd. Volumes (273–287) e Cobertura Cambial (288–302) rodam **antes** de Qtd. Transferida (83–134), após Unidade Comercializada (82). **SSOT** tipos de volume: **`cadastros.volume`** · cobertura cambial: **`cadastros.cambio_siscomex`** (`tipo=cobertura_cambial`).

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-pos-login.png` | Hub/pós-login |
| 02 | `02-lista-carregada.png` | Lista aberta — pedido expandido com itens visíveis |
| 03 | `03-editar-pedido-numero-sucesso.png` | Número do pedido salvo |
| 04 | `04-editar-item-part-number-sucesso.png` | Part Number do 1º item salvo |
| 05 | `05-alerta-part-number-duplicado-pedido.png` | Alerta PN duplicado |
| 06 | `06-tipo-operacao-modal-importacao.png` | Clicar pedido → modal aberto (Importação) |
| 07 | `07-tipo-operacao-sem-checkbox-importacao.png` | Modal **sem** «Aplicar a todos os itens» |
| 08 | `08-tipo-operacao-pedido-itens-exportacao.png` | Importação → Exportação: pedido **e** itens |
| 09 | `09-tipo-operacao-modal-exportacao.png` | Modal aberto (Exportação) |
| 10 | `10-tipo-operacao-sem-checkbox-exportacao.png` | Modal **sem** checkbox replicar |
| 11 | `11-tipo-operacao-pedido-itens-importacao.png` | Exportação → Importação: pedido **e** itens |
| 12 | `12-tipo-operacao-item-travado.png` | Item travado — popover não abre |
| 13 | `13-ref-importador-pedido-sem-replicar-selecao.png` | Popover pedido sem checkbox |
| | `13-ref-importador-pedido-sem-replicar-resultado.png` | Só pedido persiste |
| 14 | `14-ref-importador-pedido-replicar-todos-selecao.png` | Popover com checkbox marcado |
| | `14-ref-importador-pedido-replicar-todos-resultado.png` | Pedido + todos os itens iguais |
| 15 | `15-ref-importador-editar-item-isolado-selecao.png` | Editar só o item 1 |
| | `15-ref-importador-editar-item-isolado-resultado.png` | Item isolado; pedido mantém valor |
| 16 | `16-ref-importador-alerta-divergencia-resultado.png` | Ícone âmbar na coluna do pedido |
| 17 | `17-ref-exportador-pedido-sem-replicar-selecao.png` | Popover pedido sem checkbox |
| | `17-ref-exportador-pedido-sem-replicar-resultado.png` | Só pedido persiste |
| 18 | `18-ref-exportador-pedido-replicar-todos-selecao.png` | Popover com checkbox marcado |
| | `18-ref-exportador-pedido-replicar-todos-resultado.png` | Pedido + todos os itens iguais |
| 19 | `19-ref-exportador-editar-item-isolado-selecao.png` | Editar só o item 1 |
| | `19-ref-exportador-editar-item-isolado-resultado.png` | Item isolado |
| 20 | `20-ref-exportador-alerta-divergencia-resultado.png` | Ícone âmbar na coluna do pedido |
| 21 | `21-incoterm-pedido-sem-replicar-selecao.png` | Select Incoterm no pedido (sem checkbox) |
| | `21-incoterm-pedido-sem-replicar-resultado.png` | Só pedido persiste |
| 22 | `22-incoterm-pedido-replicar-todos-selecao.png` | Select com checkbox marcado |
| | `22-incoterm-pedido-replicar-todos-resultado.png` | Pedido + todos os itens iguais |
| 23 | `23-incoterm-editar-item-isolado-selecao.png` | Select no item 1 |
| | `23-incoterm-editar-item-isolado-resultado.png` | Item isolado |
| 24 | `24-incoterm-alerta-divergencia-resultado.png` | Ícone âmbar na coluna do pedido |
| 25 | `25-descricao-tooltip-pedido.png` | Tooltip pedido — Descrição do Item |
| | `25-descricao-tooltip-item.png` | Tooltip item — Descrição do Item |
| 26 | `26-descricao-pedido-sem-replicar-selecao.png` | Popover texto no pedido (sem checkbox) |
| | `26-descricao-pedido-sem-replicar-resultado.png` | Só pedido persiste |
| 27 | `27-descricao-pedido-replicar-todos-selecao.png` | Popover com checkbox marcado |
| | `27-descricao-pedido-replicar-todos-resultado.png` | Pedido + todos os itens iguais |
| 28 | `28-descricao-editar-item-isolado-selecao.png` | Editar só o item 1 |
| | `28-descricao-editar-item-isolado-resultado.png` | Item isolado; pedido mantém valor |
| | `28-descricao-sem-alerta-divergencia-resultado.png` | **Sem** ícone âmbar na coluna do pedido |
| 29 | `29-log-porto-origem-tooltip-pedido.png` | Tooltip pedido — Porto de Origem |
| | `29-log-porto-origem-tooltip-item.png` | Tooltip item — Porto de Origem |
| | `29-log-porto-origem-pedido-selecao.png` | Select aberto no pedido |
| | `29-log-porto-origem-pedido-resultado.png` | Pedido + itens espelhados |
| | `29-log-porto-origem-item-selecao.png` | Select aberto no item 1 |
| | `29-log-porto-origem-item-resultado.png` | Pedido atualizado via item |
| 30 | `30-log-porto-destino-tooltip-pedido.png` | Tooltip pedido — Porto de Destino |
| | `30-log-porto-destino-tooltip-item.png` | Tooltip item |
| | `30-log-porto-destino-pedido-selecao.png` | Select no pedido |
| | `30-log-porto-destino-pedido-resultado.png` | Espelhamento |
| | `30-log-porto-destino-item-selecao.png` | Select no item |
| | `30-log-porto-destino-item-resultado.png` | Espelhamento via item |
| 31 | `31-log-pais-origem-tooltip-pedido.png` | Tooltip pedido — País de Origem |
| | `31-log-pais-origem-tooltip-item.png` | Tooltip item |
| | `31-log-pais-origem-pedido-selecao.png` | Select no pedido |
| | `31-log-pais-origem-pedido-resultado.png` | Espelhamento |
| | `31-log-pais-origem-item-selecao.png` | Select no item |
| | `31-log-pais-origem-item-resultado.png` | Espelhamento via item |
| 32 | `32-log-pais-destino-tooltip-pedido.png` | Tooltip pedido — País de Destino |
| | `32-log-pais-destino-tooltip-item.png` | Tooltip item |
| | `32-log-pais-destino-pedido-selecao.png` | Select no pedido |
| | `32-log-pais-destino-pedido-resultado.png` | Espelhamento |
| | `32-log-pais-destino-item-selecao.png` | Select no item |
| | `32-log-pais-destino-item-resultado.png` | Espelhamento via item |
| 33 | `33-log-aeroporto-origem-tooltip-pedido.png` | Tooltip pedido — Aeroporto de Origem |
| | `33-log-aeroporto-origem-tooltip-item.png` | Tooltip item |
| | `33-log-aeroporto-origem-pedido-selecao.png` | Select no pedido |
| | `33-log-aeroporto-origem-pedido-resultado.png` | Espelhamento |
| | `33-log-aeroporto-origem-item-selecao.png` | Select no item |
| | `33-log-aeroporto-origem-item-resultado.png` | Espelhamento via item |
| 34 | `34-log-aeroporto-destino-tooltip-pedido.png` | Tooltip pedido — Aeroporto de Destino |
| | `34-log-aeroporto-destino-tooltip-item.png` | Tooltip item |
| | `34-log-aeroporto-destino-pedido-selecao.png` | Select no pedido |
| | `34-log-aeroporto-destino-pedido-resultado.png` | Espelhamento |
| | `34-log-aeroporto-destino-item-selecao.png` | Select no item |
| | `34-log-aeroporto-destino-item-resultado.png` | Espelhamento via item |
| 35 | `35-ncm-pedido-codigo-selecao.png` | NCM `8528.59.00` no pedido — popover aberto |
| | `35-ncm-pedido-codigo-resultado.png` | Código validado e salvo no pedido |
| 36 | `36-ncm-pedido-busca-monitor-selecao.png` | Busca «monitor» no pedido — lista de NCMs |
| 37 | `37-ncm-pedido-busca-monitor-resultado.png` | NCM selecionada da busca salva no pedido |
| 38 | `38-ncm-item-codigo-selecao.png` | NCM `8528.59.00` no item 1 — popover aberto |
| | `38-ncm-item-codigo-resultado.png` | Código validado e salvo no item |
| 39 | `39-ncm-item-busca-monitor-selecao.png` | Busca «monitor» no item — lista de NCMs |
| 40 | `40-ncm-item-busca-monitor-resultado.png` | NCM selecionada da busca salva no item |
| 41 | `41-ncm-tooltip-pedido.png` | Tooltip NCM contém «Editável no pedido» |
| 42 | `42-qtd-pronta-pedido-sem-itens-resultado.png` | Pedido sem itens — célula vazia (`—`) |
| 43 | `43-qtd-pronta-pedido-mesma-unidade-resultado.png` | Pedido com itens mesma unidade — soma correta |
| 44 | `44-qtd-pronta-pedido-unidades-divergentes-resultado.png` | Unidades divergentes — alerta sem valor numérico |
| 45 | `45-qtd-pronta-item-incluir-selecao.png` | Popover item 1 — incluir qtd pronta |
| | `45-qtd-pronta-item-incluir-resultado.png` | Valor e unidade salvos no item |
| 46 | `46-qtd-pronta-item-editar-selecao.png` | Popover item 1 — editar qtd pronta |
| | `46-qtd-pronta-item-editar-resultado.png` | Valor editado e unidade persistidos |
| 47 | `47-qtd-pronta-aviso-unidade-item.png` | Modal exibe aviso de impacto da unidade |
| 48 | `48-qtd-pronta-persistencia-apos-navegar-resultado.png` | Sair da lista e voltar — valores mantidos |
| 49 | `49-qtd-inicial-pedido-sem-itens-resultado.png` | Pedido sem itens — célula vazia (`—`) |
| 50 | `50-qtd-inicial-pedido-mesma-unidade-resultado.png` | Pedido com itens mesma unidade — soma correta |
| 51 | `51-qtd-inicial-pedido-unidades-divergentes-resultado.png` | Unidades divergentes — alerta sem valor numérico |
| 52 | `52-qtd-inicial-item-incluir-selecao.png` | Popover item 1 — incluir qtd inicial |
| | `52-qtd-inicial-item-incluir-resultado.png` | Valor e unidade salvos no item |
| 53 | `53-qtd-inicial-item-editar-selecao.png` | Popover item 1 — editar qtd inicial |
| | `53-qtd-inicial-item-editar-resultado.png` | Valor editado e unidade persistidos |
| 54 | `54-qtd-inicial-aviso-unidade-item.png` | Modal exibe aviso de impacto da unidade |
| 55 | `55-qtd-inicial-persistencia-apos-navegar-resultado.png` | Sair da lista e voltar — valores mantidos |
| 56 | `56-moeda-tooltip-pedido.png` | Tooltip pedido — Moeda do Pedido/Item (3 pills) |
| | `57-moeda-tooltip-item.png` | Tooltip item — Moeda do Pedido/Item (3 pills) |
| 58 | `58-moeda-pedido-sem-replicar-selecao.png` | Select Moeda no pedido (sem checkbox) |
| | `58-moeda-pedido-sem-replicar-resultado.png` | Só pedido persiste |
| 59 | `59-moeda-pedido-replicar-todos-selecao.png` | Select com checkbox marcado |
| | `59-moeda-pedido-replicar-todos-resultado.png` | Pedido + todos os itens iguais |
| 60 | `60-moeda-editar-item-isolado-selecao.png` | Select no item 1 |
| | `60-moeda-editar-item-isolado-resultado.png` | Item isolado; pedido mantém valor |
| 61 | `61-moeda-alerta-divergencia-resultado.png` | Alerta «Moedas divergentes entre itens» na coluna do pedido |
| 62 | `62-valor-pedido-nao-edita-resultado.png` | **01** — Pedido não editável (clicar não abre popover) |
| 63 | `63-valor-pedido-cursor-bloqueado.png` | **02** — Cursor `not-allowed` no hover do pedido |
| 64 | `64-valor-tooltip-pedido.png` | **03** — Tooltip pedido (bloqueado + soma + editável nos itens + alerta + aviso moeda) |
| 65 | `65-valor-item-incluir-selecao.png` | **04** — Item vazio: incluir valor + moeda qualquer |
| | `65-valor-item-incluir-resultado.png` | Valor e moeda salvos no item |
| 66 | `66-valor-item-formula-unitario-qtd-resultado.png` | **05** — Grade: valor total = unitário × qtd inicial |
| 67 | `67-valor-item-popover-originais.png` | **04** — Popover exibe valor e moeda originais |
| 68 | `68-valor-item-editar-selecao.png` | **05** — Editar novo valor e moeda |
| | `68-valor-item-editar-resultado.png` | Valor editado persistido |
| 69 | `69-valor-item2-moeda-divergente-selecao.png` | **06** — Item 2 com moeda distinta |
| | `69-valor-alerta-divergencia-resultado.png` | Alerta «Moedas divergentes entre itens» na coluna Valor do pedido |
| 70 | `70-valor-tooltip-item.png` | **07** — Tooltip item (editável + fórmula + aviso moeda) |
| 71 | `71-valor-persistencia-apos-navegar-resultado.png` | **08** — Sair da lista, voltar — dados salvos persistem |
| 99 | `99-erro.png` | Só se falhar |

Viewport: **1440×900**

---

## Roteiro de execução

### ETAPA 0 — Preparação

1. Confirmar ambiente (Produção ou Local)
2. Runner cria `resultado-teste/<EMT_RUN_ID>/`
3. Login · Print `01-pos-login.png` (sucesso ou erro)

### ETAPA 1 — Nº PEDIDO / Nº ITEM

**Pré-condição:** pedido expandido com **≥2 itens**.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **02** | Navegar lista; expandir pedido | Grade visível · Print `02-lista-carregada.png` (sucesso ou erro) |
| **03** | Editar número do pedido | Valor salvo · Print `03-editar-pedido-numero-sucesso.png` (sucesso ou erro) |
| **04** | Editar Part Number do **1º item** | Valor salvo · Print `04-editar-item-part-number-sucesso.png` (sucesso ou erro) |
| **05** | Duplicar PN no **2º item** | Alerta âmbar no pedido · Print `05-alerta-part-number-duplicado-pedido.png` (sucesso ou erro) |

### ETAPA 2 — WORKSPACE

> **Regras WS-01…06** — runner principal **ainda não automatiza** esta coluna; bloco documentado para o modal e para implementação futura.

| Regra | Comportamento esperado |
|-------|------------------------|
| WS-01 | Somente a linha **pedido** edita workspace |
| WS-02 | Linha **item** somente leitura — popover não abre |
| WS-03 | Ao salvar no pedido, replica **automaticamente** para todos os itens |
| WS-04 | Popover **sem** checkbox «Aplicar a todos os itens» |
| WS-05 | **Sem** alerta âmbar de divergência |
| WS-06 | Select lista todos os workspaces habilitados ao usuário |

### ETAPA 3 — TIPO DE OPERAÇÃO (passos 06–12)

**Pré-condição:** pedido expandido com itens visíveis; runner garante pedido em **Importação** antes do passo 06.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **06** | Clicar **TIPO DE OPERAÇÃO** na linha do **pedido** (Importação) | Modal/popover abre · Print `06-tipo-operacao-modal-importacao.png` (sucesso ou erro) |
| **07** | Inspecionar o modal | Checkbox «Aplicar a todos os itens» **ausente** · Print `07-tipo-operacao-sem-checkbox-importacao.png` (sucesso ou erro) |
| **08** | Selecionar **Exportação** e confirmar | Pedido **e** todos os itens = Exportação · Print `08-tipo-operacao-pedido-itens-exportacao.png` (sucesso ou erro) |
| *(impl.)* | Clicar **TIPO DE OPERAÇÃO** nos **itens** | Popover **não** abre; célula **travada** |
| **09** | Clicar **TIPO DE OPERAÇÃO** no **pedido** (Exportação) | Modal abre · Print `09-tipo-operacao-modal-exportacao.png` (sucesso ou erro) |
| **10** | Inspecionar o modal | Checkbox replicar **ausente** · Print `10-tipo-operacao-sem-checkbox-exportacao.png` (sucesso ou erro) |
| **11** | Selecionar **Importação** e confirmar | Pedido **e** todos os itens = Importação · Print `11-tipo-operacao-pedido-itens-importacao.png` (sucesso ou erro) |
| **12** | Clicar célula **TIPO DE OPERAÇÃO** no **item** | Célula travada · Print `12-tipo-operacao-item-travado.png` (sucesso ou erro) |

### ETAPA 4 — STATUS

> **Regras STATUS 00–04** — runner principal **ainda não automatiza** esta coluna; bloco documentado para o modal e para implementação futura.

| Regra | Comportamento esperado |
|-------|------------------------|
| 00 | Todos os status (nativos e customizados) são replicáveis na UI |
| 01 | Coluna **STATUS** na linha **pedido** é editável (select) |
| 02 | Popover no pedido exibe checkbox «Aplicar a todos os itens deste pedido» |
| 03 | Coluna **STATUS** na linha **item** é editável |
| 04 | **Alerta âmbar** quando status do pedido ≠ status de algum item |

### ETAPA 5 — IMPORTADOR (`nome_importador`)

> Runner **dedicado:** `run-lista-importador-emt.ts` (não faz parte da sequência 03–34 do runner principal).

1. Coluna **IMPORTADOR** em pedido **Importação** — select lista workspaces com **nomes** (nunca CUID cru)
2. Coluna **IMPORTADOR** em pedido **Exportação** — modal seletor de importadores / atalho fornecedores
3. Tooltip espelhado conforme tipo de operação (ver `LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md` §5)

### ETAPA 6 — EXPORTADOR (`nome_exportador`)

> Runner **dedicado:** `run-lista-exportador-emt.ts` (não faz parte da sequência 03–82 do runner principal).  
> Espelho invertido do Importador — ver `LISTA-EDITAR-SALVAR-REGRAS-NEGOCIO.md` §5B.

1. Coluna **EXPORTADOR** em pedido **Exportação** — select lista workspaces com **nomes** (nunca CUID cru; ex.: `CDE EXPORTADOR`); espelhado com workspace
2. Coluna **EXPORTADOR** em pedido **Importação** — popover lista fornecedores exportadores / atalho **Vincular exportador** (ex.: Foxconn, Bosch)
3. Tooltip espelhado conforme tipo de operação — **sem** link para Configurador na exportação (espelho workspace)

### ETAPA 7 — REFERÊNCIA IMPORTADOR (passos 13–16)

**Pré-condição:** pedido expandido com **≥2 itens**.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **13** | Editar no **pedido** `REF-IMP-EMT-SOLO-*`; **sem** checkbox; confirmar | Só pedido persiste · Print `13-ref-importador-pedido-sem-replicar-selecao` · `…-resultado` (sucesso ou erro) |
| **14** | Editar no **pedido** `REF-IMP-EMT-TODOS-*`; **com** checkbox; confirmar | Pedido **e** todos os itens iguais · Print `14-ref-importador-pedido-replicar-todos-selecao` · `…-resultado` (sucesso ou erro) |
| **15** | Editar no **1º item** `REF-IMP-EMT-ITEM-*`; confirmar | Só item 1 muda · Print `15-ref-importador-editar-item-isolado-selecao` · `…-resultado` (sucesso ou erro) |
| **16** | Inspecionar coluna do **pedido** | Ícone âmbar visível · Print `16-ref-importador-alerta-divergencia-resultado.png` (sucesso ou erro) |

### ETAPA 8 — REFERÊNCIA EXPORTADOR (passos 17–20)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **17** | Editar no **pedido** `REF-EXP-EMT-SOLO-*`; **sem** checkbox; confirmar | Só pedido persiste · Print `17-ref-exportador-pedido-sem-replicar-selecao` · `…-resultado` (sucesso ou erro) |
| **18** | Editar no **pedido** `REF-EXP-EMT-TODOS-*`; **com** checkbox; confirmar | Pedido **e** todos os itens iguais · Print `18-ref-exportador-pedido-replicar-todos-selecao` · `…-resultado` (sucesso ou erro) |
| **19** | Editar no **1º item** `REF-EXP-EMT-ITEM-*`; confirmar | Só item 1 muda · Print `19-ref-exportador-editar-item-isolado-selecao` · `…-resultado` (sucesso ou erro) |
| **20** | Inspecionar coluna do **pedido** | Ícone âmbar visível · Print `20-ref-exportador-alerta-divergencia-resultado.png` (sucesso ou erro) |

### ETAPA 9 — INCOTERM (passos 21–24)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **21** | Select no pedido, sigla A, **sem** checkbox → confirmar | Só pedido persiste · Print `21-incoterm-pedido-sem-replicar-selecao` · `…-resultado` (sucesso ou erro) |
| **22** | Select no pedido, sigla B, **com** checkbox → confirmar | Pedido **e** todos os itens iguais · Print `22-incoterm-pedido-replicar-todos-selecao` · `…-resultado` (sucesso ou erro) |
| **23** | Select no **item 1**, sigla C → confirmar | Item isolado · Print `23-incoterm-editar-item-isolado-selecao` · `…-resultado` (sucesso ou erro) |
| **24** | Inspecionar coluna do **pedido** | Ícone âmbar visível · Print `24-incoterm-alerta-divergencia-resultado.png` (sucesso ou erro) |

### ETAPA 10 — DESCRIÇÃO DO ITEM (passos 25–28)

Campo **ghost** (`descricao_item`): persiste no banco só no item; linha do pedido é exibição agregada. **Sem** alerta âmbar de divergência.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **25** | Hover célula **pedido** e **item 1** | 3 pills ghost em ambos · Print `25-descricao-tooltip-pedido` · `25-descricao-tooltip-item` (sucesso ou erro) |
| **26** | Texto no pedido, **sem** checkbox → confirmar | Só pedido persiste · Print `26-descricao-pedido-sem-replicar-selecao` · `…-resultado` (sucesso ou erro) |
| **27** | Texto no pedido, **com** checkbox → confirmar | Pedido + todos os itens iguais · Print `27-descricao-pedido-replicar-todos-selecao` · `…-resultado` (sucesso ou erro) |
| **28** | Texto no **item 1** → confirmar; inspecionar coluna do pedido | Item isolado; **sem** alerta âmbar · Print `28-descricao-editar-item-isolado-selecao` · `…-resultado` · `28-descricao-sem-alerta-divergencia-resultado` (sucesso ou erro) |

**Prefixos de valor no runner:** `DESC-EMT-SOLO-*` · `DESC-EMT-TODOS-*` · `DESC-EMT-ITEM-*`

### ETAPA 11 — PORTO DE ORIGEM (`porto_origem`, passo 29)

**Regras LOG-00…06:** **LOG-00** — o código escolhido (porto/país/aeroporto) é **qualquer opção disponível** no select; critério = salvou com sucesso + pedido e itens espelham o **mesmo** valor exibido. Demais: valor único no pedido; itens espelham `_p`; tooltip com 3 pills espelhadas; **sem** checkbox replicar; **sem** alerta âmbar.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **29.1** | Hover tooltip na célula do **pedido** | Título «Porto de Origem» + 3 pills espelhadas · Print `29-log-porto-origem-tooltip-pedido.png` (sucesso ou erro) |
| **29.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `29-log-porto-origem-tooltip-item.png` (sucesso ou erro) |
| **29.3** | Select no **pedido** → **1ª opção do catálogo** → confirmar | **Sem** checkbox replicar · Toast sucesso · Pedido **e** itens com o **mesmo** valor · Prints `29-log-porto-origem-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **29.4** | Select no **item 1** → **outra opção** (se houver) → confirmar | Toast sucesso · Pedido atualizado via item; todos espelham o **mesmo** valor · Prints `29-log-porto-origem-item-selecao` · `…-resultado` (sucesso ou erro) |
| **29.5** | Inspecionar coluna do **pedido** | **Sem** ícone âmbar de divergência (LOG-05) |

### ETAPA 12 — PORTO DE DESTINO (`porto_destino`, passo 30)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **30.1** | Hover tooltip na célula do **pedido** | Título «Porto de Destino» + 3 pills · Print `30-log-porto-destino-tooltip-pedido.png` (sucesso ou erro) |
| **30.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `30-log-porto-destino-tooltip-item.png` (sucesso ou erro) |
| **30.3** | Select no **pedido** → opção do catálogo → confirmar | Toast sucesso · Espelhamento em todos os itens · Prints `30-log-porto-destino-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **30.4** | Select no **item 1** → outra opção (se houver) → confirmar | Toast sucesso · Pedido + itens espelham o mesmo valor · Prints `30-log-porto-destino-item-selecao` · `…-resultado` (sucesso ou erro) |
| **30.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 13 — PAÍS DE ORIGEM (`local_de_origem`, passo 31)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **31.1** | Hover tooltip na célula do **pedido** | Título «País de Origem» + 3 pills · Print `31-log-pais-origem-tooltip-pedido.png` (sucesso ou erro) |
| **31.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `31-log-pais-origem-tooltip-item.png` (sucesso ou erro) |
| **31.3** | Select no **pedido** → opção do catálogo → confirmar | Toast sucesso · Espelhamento · Prints `31-log-pais-origem-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **31.4** | Select no **item 1** → outra opção (se houver) → confirmar | Toast sucesso · Pedido + itens espelham o mesmo valor · Prints `31-log-pais-origem-item-selecao` · `…-resultado` (sucesso ou erro) |
| **31.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 14 — PAÍS DE DESTINO (`local_de_destino`, passo 32)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **32.1** | Hover tooltip na célula do **pedido** | Título «País de Destino» + 3 pills · Print `32-log-pais-destino-tooltip-pedido.png` (sucesso ou erro) |
| **32.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `32-log-pais-destino-tooltip-item.png` (sucesso ou erro) |
| **32.3** | Select no **pedido** → opção do catálogo → confirmar | Toast sucesso · Espelhamento · Prints `32-log-pais-destino-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **32.4** | Select no **item 1** → outra opção (se houver) → confirmar | Toast sucesso · Pedido + itens espelham o mesmo valor · Prints `32-log-pais-destino-item-selecao` · `…-resultado` (sucesso ou erro) |
| **32.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 15 — AEROPORTO DE ORIGEM (`aeroporto_origem`, passo 33)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **33.1** | Hover tooltip na célula do **pedido** | Título «Aeroporto de Origem» + 3 pills · Print `33-log-aeroporto-origem-tooltip-pedido.png` (sucesso ou erro) |
| **33.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `33-log-aeroporto-origem-tooltip-item.png` (sucesso ou erro) |
| **33.3** | Select no **pedido** → opção do catálogo → confirmar | Toast sucesso · Espelhamento · Prints `33-log-aeroporto-origem-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **33.4** | Select no **item 1** → outra opção (se houver) → confirmar | Toast sucesso · Pedido + itens espelham o mesmo valor · Prints `33-log-aeroporto-origem-item-selecao` · `…-resultado` (sucesso ou erro) |
| **33.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 16 — AEROPORTO DE DESTINO (`aeroporto_destino`, passo 34)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **34.1** | Hover tooltip na célula do **pedido** | Título «Aeroporto de Destino» + 3 pills · Print `34-log-aeroporto-destino-tooltip-pedido.png` (sucesso ou erro) |
| **34.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `34-log-aeroporto-destino-tooltip-item.png` (sucesso ou erro) |
| **34.3** | Select no **pedido** → opção do catálogo → confirmar | Toast sucesso · Espelhamento · Prints `34-log-aeroporto-destino-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **34.4** | Select no **item 1** → outra opção (se houver) → confirmar | Toast sucesso · Pedido + itens espelham o mesmo valor · Prints `34-log-aeroporto-destino-item-selecao` · `…-resultado` (sucesso ou erro) |
| **34.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 17 — NCM (passos 35–41)

Campo **ghost** — persiste no banco no **item**; linha do pedido exibe valor canônico. **Sem** alerta âmbar (NCM-06).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **35** | Digitar código **8528.59.00** no **pedido** → confirmar | Código valida · Prints `35-ncm-pedido-codigo-selecao` · `…-resultado` (sucesso ou erro) |
| **36** | Buscar **monitor** no **pedido** | Lista ≥2 NCMs · Print `36-ncm-pedido-busca-monitor-selecao.png` (sucesso ou erro) |
| **37** | Selecionar 1ª NCM da busca no **pedido** → confirmar | Valor salvo no pedido · Print `37-ncm-pedido-busca-monitor-resultado.png` (sucesso ou erro) |
| **38** | Digitar código **8528.59.00** no **item 1** → confirmar | Código valida no item · Prints `38-ncm-item-codigo-selecao` · `…-resultado` (sucesso ou erro) |
| **39** | Buscar **monitor** no **item 1** | Lista ≥2 NCMs · Print `39-ncm-item-busca-monitor-selecao.png` (sucesso ou erro) |
| **40** | Selecionar 1ª NCM da busca no **item 1** → confirmar | Valor salvo no item · Print `40-ncm-item-busca-monitor-resultado.png` (sucesso ou erro) |
| **41** | Hover tooltip na célula **NCM** do **pedido** | Texto contém «Editável no pedido» · Print `41-ncm-tooltip-pedido.png` (sucesso ou erro) |

### ETAPA 18 — QTD. PRONTA DO PEDIDO/ITEM (passos 42–48)

Coluna **`quantidade_pronta_itens_pedido_total`** — pedido **bloqueado** (soma calculada); **item editável** via popover unidade+quantidade.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **42** | Localizar pedido **sem itens**; inspecionar célula do **pedido** | Exibe **`—`** (vazio) · Print `42-qtd-pronta-pedido-sem-itens-resultado.png` (sucesso ou erro) |
| **43** | Localizar pedido com itens de **mesma unidade comercializada** | Célula do **pedido** = **soma** das qtd. prontas dos itens · Print `43-qtd-pronta-pedido-mesma-unidade-resultado.png` (sucesso ou erro) |
| **44** | Localizar pedido com itens de **unidades comercializadas diferentes** | Célula do **pedido** exibe alerta **«Unidades divergentes entre itens»** — **sem** valor numérico · Print `44-qtd-pronta-pedido-unidades-divergentes-resultado.png` (sucesso ou erro) |
| **45** | No **item 1** do pedido em uso: incluir qtd pronta **150,00** + unidade **UN** → confirmar | Salva com sucesso — valor e unidade exatos na grade · Prints `45-qtd-pronta-item-incluir-selecao` · `…-resultado` (sucesso ou erro) |
| **46** | Editar qtd pronta do **item 1** para **275,50** + unidade **UN** → confirmar | Salva com sucesso — valor e unidade exatos · Prints `46-qtd-pronta-item-editar-selecao` · `…-resultado` (sucesso ou erro) |
| **47** | Abrir popover de edição do **item 1** (qtd pronta) | Modal contém aviso **«A alteração da unidade irá alterar também Unidade Comercializada, Qtd. Inicial, Qtd. Transferida, Saldo e Qtd. Cancelada»** · Print `47-qtd-pronta-aviso-unidade-item.png` (sucesso ou erro) |
| **48** | Navegar para **hub** e voltar à lista; reabrir o pedido editado | Qtd pronta **275,50 UN** no item 1 e agregado coerente no pedido · Print `48-qtd-pronta-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

**Valores no runner:** incluir `150,00` · editar `275,50` · unidade `UN`

### ETAPA 19 — QTD. INICIAL DO PEDIDO/ITEM (passos 49–55)

Coluna **`quantidade_total_pedido`** — pedido **bloqueado** (soma calculada); **item editável** via popover unidade+quantidade.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **49** | Localizar pedido **sem itens**; inspecionar célula do **pedido** | Exibe **`—`** (vazio) · Print `49-qtd-inicial-pedido-sem-itens-resultado.png` (sucesso ou erro) |
| **50** | Localizar pedido com itens de **mesma unidade comercializada** | Célula do **pedido** = **soma** das qtd. iniciais dos itens · Print `50-qtd-inicial-pedido-mesma-unidade-resultado.png` (sucesso ou erro) |
| **51** | Localizar pedido com itens de **unidades comercializadas diferentes** | Célula do **pedido** exibe alerta **«Unidades divergentes entre itens»** — **sem** valor numérico · Print `51-qtd-inicial-pedido-unidades-divergentes-resultado.png` (sucesso ou erro) |
| **52** | No **item 1** do pedido em uso: incluir qtd inicial **320,00** + unidade **UN** → confirmar | Salva com sucesso — valor e unidade exatos na grade · Prints `52-qtd-inicial-item-incluir-selecao` · `…-resultado` (sucesso ou erro) |
| **53** | Editar qtd inicial do **item 1** para **410,75** + unidade **UN** → confirmar | Salva com sucesso — valor e unidade exatos · Prints `53-qtd-inicial-item-editar-selecao` · `…-resultado` (sucesso ou erro) |
| **54** | Abrir popover de edição do **item 1** (qtd inicial) | Modal contém aviso **«A alteração da unidade irá alterar também Unidade Comercializada, Qtd. Pronta, Qtd. Transferida, Saldo e Qtd. Cancelada»** · Print `54-qtd-inicial-aviso-unidade-item.png` (sucesso ou erro) |
| **55** | Navegar para **hub** e voltar à lista; reabrir o pedido editado | Qtd inicial **410,75 UN** no item 1 e agregado coerente no pedido · Print `55-qtd-inicial-persistencia-apos-navegar-resultado.png` (sucesso ou erro) |

**Valores no runner:** incluir `320,00` · editar `410,75` · unidade `UN`

### ETAPA 20 — MOEDA DO PEDIDO/ITEM (passos 56–61)

Coluna **`moeda_pedido`** — select do Cadastros com checkbox **«Aplicar em todos os itens»** (igual Incoterm/REF). Tooltip com **3 pills** espelhadas no pedido e no item.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **56** | Hover tooltip na célula **Moeda** do **pedido** | Título «Moeda do Pedido/Item» + 3 pills (editável pedido, editável item, aplicar em todos) · Print `56-moeda-tooltip-pedido.png` (sucesso ou erro) |
| **57** | Hover tooltip na célula **Moeda** do **item 1** | Mesmas 3 pills · Print `57-moeda-tooltip-item.png` (sucesso ou erro) |
| **58** | Select no pedido, sigla A, **sem** checkbox → **Confirmar** | Só pedido persiste · Print `58-moeda-pedido-sem-replicar-selecao` · `…-resultado` (sucesso ou erro) |
| **59** | Select no pedido, sigla B, **com** checkbox → **Confirmar** | Pedido **e** todos os itens iguais · Print `59-moeda-pedido-replicar-todos-selecao` · `…-resultado` (sucesso ou erro) |
| **60** | Select no **item 1**, sigla C → **Confirmar** | Item isolado; pedido e demais itens mantêm valor · Print `60-moeda-editar-item-isolado-selecao` · `…-resultado` (sucesso ou erro) |
| **61** | Inspecionar coluna do **pedido** | Alerta **«Moedas divergentes entre itens»** visível · Print `61-moeda-alerta-divergencia-resultado.png` (sucesso ou erro) |

### ETAPA 21 — VALOR TOTAL DO PEDIDO/ITEM (passos 62–71)

Coluna dinâmica **`valor_total_pedido`**. Passos **62, 63, 64…** seguem a **ordem exata** das regras **01–08** do dono (numeração contínua após o passo 61).

| Passo | Regra | Ação | APROVADO quando |
|-------|-------|------|-----------------|
| **62** | **01** | **Clicar** na célula **Valor** do **pedido** | Popover **não** abre — pedido não editável · Print `62-valor-pedido-nao-edita-resultado.png` |
| **63** | **02** | Hover na célula **Valor** do **pedido** | Cursor `not-allowed` · Print `63-valor-pedido-cursor-bloqueado.png` |
| **64** | **03** | Hover tooltip na célula **Valor** do **pedido** | Título «Valor total do pedido» + pills Bloqueado, Total do Pedido (soma mesma moeda), Editável nos itens, Alerta moeda divergente + aviso *«A alteração da moeda aqui irá alterar também Moeda do Pedido/Item e Valor Unitário do Item»* · Print `64-valor-tooltip-pedido.png` |
| **65** | **04** | No **item 1** vazio: incluir valor + **qualquer** moeda do Cadastros → confirmar | Salva com sucesso — valor e moeda exatos na grade · Prints `65-valor-item-incluir-selecao` · `…-resultado` |
| **66** | **05** | Inspecionar **item 1** preenchido na grade | Valor total exibido = **Valor unitário do item × Qtd. Inicial do item** · Print `66-valor-item-formula-unitario-qtd-resultado.png` |
| **67** | **04** | Abrir popover do **item 1** preenchido (sem editar) | Exibe valor e moeda **originais** do passo 65 · Print `67-valor-item-popover-originais.png` |
| **68** | **05** | No popover: editar para **2.750,00** + mesma moeda do passo 65 → confirmar | Salva com sucesso · Prints `68-valor-item-editar-selecao` · `…-resultado` |
| **69** | **06** | No **item 2**: valor **1.000,00** + moeda **distinta** do item 1 → confirmar | Alerta **«Moedas divergentes entre itens»** na coluna Valor do pedido · Prints `69-valor-item2-moeda-divergente-selecao` · `69-valor-alerta-divergencia-resultado` |
| **70** | **07** | Hover tooltip na célula **Valor** do **item 1** | Título «Valor Total do Item» + pills Editável nos itens, fórmula *Valor unitário × Qtd. Inicial* + aviso de moeda · Print `70-valor-tooltip-item.png` |
| **71** | **08** | Sair da Lista (hub) → voltar à Lista → reexpandir o pedido | Item 1 mantém **2.750,00** + moeda; item 2 mantém **1.000,00** + moeda · Print `71-valor-persistencia-apos-navegar-resultado.png` |

**Valores no runner:** incluir = unitário×qtd (ou fallback `1.500,50`) · moeda = 1ª opção do Cadastros · editar `2.750,00` · item 2 `1.000,00`

### ETAPA 22 — UNIDADE COMERCIALIZADA DO PEDIDO/ITEM (passos 72–82)

Coluna **`unidade_comercializada_pedido`** — select do Cadastros com checkbox **«Aplicar em todos os itens»** (padrão Moeda). Popover `apenasUnidade` (somente sigla, sem quantidade). Passos **72, 73, 74…** seguem a **ordem exata** das regras **01–08** do dono (numeração contínua após o passo 71).

| Passo | Regra | Ação | APROVADO quando |
|-------|-------|------|-----------------|
| **72** | **01** | **Clicar** na célula **Unidade** do **pedido** (vazio `—` ou preenchido) | Popover de unidade **abre** — campo editável · Print `72-unidade-pedido-abre-popover-resultado.png` |
| **73** | **02** | Hover na célula **Unidade** do **pedido** | Tooltip visível · Print `73-unidade-tooltip-pedido-hover.png` |
| **74** | **03** | Inspecionar tooltip do **pedido** | Título *Unidade Comercializada do Pedido* + pills Editável no pedido, Editável nos itens, Aplicar em todos os itens, Alerta se itens divergirem + aviso *«A alteração da unidade irá alterar também Qtd. Inicial, Qtd. Pronta, Qtd. Transferida, Saldo e Qtd. Cancelada»* · Print `74-unidade-tooltip-pedido.png` |
| **75** | **04** | Abrir popover do **pedido** (clicar célula) | Modal/popover visível · Print `75-unidade-pedido-modal-aberto.png` |
| **76** | **05** | Abrir dropdown de unidades no popover do **pedido** | Lista com opções do **Cadastros** (≥3 siglas) · Print `76-unidade-pedido-lista-cadastros.png` |
| **77** | **06** | Select no pedido, sigla A, **sem** checkbox → confirmar | Só pedido persiste · Prints `77-unidade-pedido-sem-replicar-selecao` · `…-resultado` |
| **78** | **06** | Select no pedido, sigla B, **com** checkbox → confirmar | Pedido **e** todos os itens iguais · Prints `78-unidade-pedido-replicar-todos-selecao` · `…-resultado` |
| **79** | **07** | **Clicar** na célula **Unidade** do **item 1** | Popover abre com dropdown de unidades · Print `79-unidade-item-modal-aberto.png` |
| **80** | **08** | No **item 1**: sigla C → confirmar; no **item 2** (se houver): sigla **divergente** → confirmar | Item 1 isolado; alerta **«Unidades divergentes entre itens»** na coluna do pedido · Prints `80-unidade-item-isolado-selecao` · `…-resultado` · `80-unidade-alerta-divergencia-resultado` |
| **81** | **07** | Hover tooltip na célula **Unidade** do **item 1** | Mesmas 4 pills + aviso de impacto · Print `81-unidade-tooltip-item.png` |
| **82** | **08** | Sair da Lista (hub) → voltar à Lista → reexpandir o pedido | Pedido e itens mantêm unidades salvas nos passos 77–80 · Print `82-unidade-persistencia-apos-navegar-resultado.png` |

**Valores no runner:** 3 siglas distintas do Cadastros (dinâmico) · item 2 = sigla divergente da replicada no passo 78

### ETAPA 23 — QTD. TRANSFERIDA DO PEDIDO/ITEM — Básico (passos 83–87)

Coluna **`quantidade_transferida_total`**. Pedido e item **bloqueados** (`cursor: not-allowed`). **Tooltip único** (mesmo conteúdo pedido = item). Regras §8C QTR-01…06 · `TRANSFERIR-REGRAS-NEGOCIO.md` para fluxos seguintes.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **83** | Hover célula **pedido** | Cursor bloqueado · Print `83-qtd-transf-cursor-pedido.png` |
| **84** | Tooltip **pedido** | Título *Qtd. Transferida do Pedido* + pills + aviso Transferir · Print `84-qtd-transf-tooltip-pedido.png` |
| **85** | Clicar célula **pedido** | Popover **não** abre · Print `85-qtd-transf-pedido-nao-edita.png` |
| **86** | Hover célula **item 1** | Cursor bloqueado · tooltip **idêntico** ao passo 84 · Print `86-qtd-transf-item-tooltip.png` |
| **87** | Clicar célula **item 1** | Popover **não** abre · Print `87-qtd-transf-item-nao-edita.png` |

### ETAPA 24 — QTD. TRANSFERIDA — Novo Pedido (Split) (passos 88–106)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **88** | Checkbox **item 1** | Item selecionado |
| **89** | Menu → **Transferir** | Modal abre · Print `89-transf-modal-aberto.png` |
| **90** | **Split — Novo Pedido** → Próximo | Passo quantidade |
| **91** | Quantidade com **saldo após ≥ 1** | Saldo correto · Print `91-transf-novo-saldo.png` |
| **92** | Saldo negativo | Não avança |
| **93** | Nº do **novo pedido** | Campo aceito |
| **94** | **Quantidade a Transferir** | Correta · Print `94-transf-novo-qtd-transferir.png` |
| **95** | Inspecionar painel **Origem** no modal (antes de confirmar) | Pedido/item de origem, quantidade e saldo exibidos corretamente |
| **96** | Inspecionar painel **Destino** (novo pedido) | Nº do novo pedido e quantidade a transferir corretos |
| **97** | Clicar **Confirmar** no modal Transferir (split — novo pedido) | Transferência concluída com sucesso; modal fecha · Print `97-transf-novo-sucesso.png` |
| **98** | Na lista, localizar e expandir o **novo pedido** | Pedido encontrado; linha expandida com itens visíveis |
| **99** | Abrir pedido e item e conferir se **todos os dados** foram replicados — **todas as colunas** do pedido e item | Grade SSOT 100% correta · Print `99-transf-novo-grade-completa.png` |
| **100** | Confirmar se — **Novo Pedido** — a **Qtd. Inicial** do(s) item(ns) é igual; não foi alterada | Valor igual ao esperado pós-transferência |
| **101** | Confirmar se — **Novo Pedido** — a **Qtd. Transferida** do(s) item(ns) foi atualizada e está correta | Valor reflete a quantidade transferida |
| **102** | Confirmar se — **Novo Pedido** — o **Saldo** do(s) item(ns) foi atualizado e está correto | Saldo consistente com inicial − transferida − cancelada |
| **103** | Confirmar se — **Pedido de Origem** — a **Qtd. Inicial** do(s) item(ns) é igual; não foi alterada | Valor idêntico ao pré-transferência |
| **104** | Confirmar se — **Pedido de Origem** — a **Qtd. Transferida** do(s) item(ns) foi atualizada e está correta | Incremento conforme quantidade transferida |
| **105** | Confirmar se — **Pedido de Origem** — o **Saldo** do(s) item(ns) foi atualizado e está correto | Saldo reduzido conforme regra de transferência |
| **106** | Hub → Lista → reexpandir origem e novo pedido | Dados persistem após navegação · Print `106-transf-novo-persistencia.png` |

### ETAPA 25 — QTD. TRANSFERIDA — Pedido Existente (Split) (passos 107–124)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **107** | Checkbox **outro item** | Item selecionado |
| **108** | **Transferir** → **Split — Pedido Existente** | Modal · Print `108-transf-existente-modal.png` |
| **109** | Quantidade válida | Saldo ≥ 1 |
| **110** | Saldo negativo | Bloqueado |
| **111** | **Pedido de Destino** | Destino válido |
| **112** | Conferir **Quantidade a transferir** no modal | Valor correto conforme saldo disponível |
| **113** | Inspecionar painéis **Origem** e **Destino** (pedido existente) | Dados de origem e destino corretos |
| **114** | Clicar **Confirmar** no modal Transferir (split — pedido existente) | Transferência concluída com sucesso; modal fecha · Print `114-transf-existente-sucesso.png` |
| **115** | Na lista, localizar e expandir o **pedido de destino** | Pedido destino encontrado e expandido |
| **116** | Na lista, localizar e expandir o **pedido de origem** | Pedido origem encontrado e expandido |
| **117** | Abrir pedido e item e conferir se **todos os dados** foram replicados — **todas as colunas** | Grade SSOT 100% correta · Print `115-transf-existente-grade.png` |
| **118** | Confirmar se — **Pedido de Destino** — **Qtd. Inicial** do(s) item(ns) | Valor correto pós-transferência |
| **119** | Confirmar se — **Pedido de Destino** — **Qtd. Transferida** do(s) item(ns) | Atualizada e correta |
| **120** | Confirmar se — **Pedido de Destino** — **Saldo** do(s) item(ns) | Atualizado e correto |
| **121** | Confirmar se — **Pedido de Origem** — **Qtd. Inicial**, **Qtd. Transferida** e **Saldo** do(s) item(ns) | Inicial inalterada; transferida e saldo atualizados |
| **124** | Hub → Lista | Persistência · Print `124-transf-existente-persistencia.png` |

### ETAPA 26 — QTD. TRANSFERIDA — Redução Simples (passos 125–134)

> `reducao_simples` incrementa **`quantidade_cancelada_item`** (não `quantidade_transferida_item`).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **125** | Checkbox em **outro item** | Item selecionado |
| **126** | **Redução Simples** | Fluxo sem destino · Print `126-transf-reducao-modal.png` |
| **127** | Quantidade com **saldo após ≥ 1** | Saldo correto |
| **128** | Saldo negativo | Não confirma |
| **129** | Confirmar | Sucesso · Print `129-transf-reducao-sucesso.png` |
| **130** | **Qtd. Inicial** | Inalterada |
| **131** | **Qtd. Transferida** | Inalterada |
| **132** | **Qtd. Cancelada** | Incrementada |
| **133** | **Saldo** | `inicial − transferida − cancelada` |
| **134** | Hub → Lista | Persistência · Print `134-transf-reducao-persistencia.png` |

### ETAPA 28 — SALDO DO PEDIDO/ITEM — Básico (passos 135–142)

Coluna **`saldo_itens_do_pedido`**. Pedido e item **somente leitura** (`tipo: saldo`). Regras §8D SLD-01…04 · `PILLS_PEDIDO_SALDO` / `PILLS_ITEM_SALDO`.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **135** | Hover célula **Saldo** do **pedido** | Cursor bloqueado · Print `135-saldo-cursor-pedido.png` |
| **136** | Tooltip **pedido** | Título *Saldo do Pedido* + pills `calculado_pedido_saldo` → `bloqueado_edicao` → `alerta_unidade_comercializada_divergente` → `formula_config` → `casas_decimais_config` + link *Editar fórmula no Configurador* · Print `136-saldo-tooltip-pedido.png` |
| **137** | Clicar célula **pedido** | Popover **não** abre · Print `137-saldo-pedido-nao-edita.png` |
| **138** | Hover tooltip célula **Saldo** do **item 1** | Título *Saldo do Item* + pills `somente_leitura` → `formula_config` · Print `138-saldo-tooltip-item.png` |
| **139** | Clicar célula **item 1** | Popover **não** abre · Print `139-saldo-item-nao-edita.png` |
| **140** | Colapsar pedido → hover cabeçalho **Saldo do Pedido/Item** | Tooltip bloco único pedido + item (override `!dual`) · Print `140-saldo-tooltip-cabecalho.png` |
| **141** | Inspecionar **formato** na grade | Separadores BR; sufixo **UN** quando > 0; **0,00** sem UN quando zero |
| **142** | Hub → Lista → reexpandir pedido | Saldos inalterados · Print `142-saldo-persistencia-basico.png` |

### ETAPA 29 — SALDO — Alterar fórmula no Configurador e restaurar (passos 143–150)

> Fluxo obrigatório: **Config → alterar → Lista (conferir mudou) → Config → restaurar original → Lista (conferir voltou) → hub/Lista (persistência)**. Runner grava snapshot da fórmula antes de alterar e restaura em `try/finally`. Fórmula original: `quantidade_total_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido`.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **143** | Na **Lista**, clicar link *Editar fórmula no Configurador* do tooltip Saldo (passo 136) **ou** navegar **Pedido → Configurações → Fórmula de Saldo** | Tela de fórmula aberta · Print `143-saldo-config-formula-atual.png` |
| **144** | **Antes de editar:** registrar snapshot da fórmula original (API `GET /api/v1/pedidos/configuracoes/saldo-formula` ou texto visível) | Fórmula padrão confirmada e salva no runner |
| **145** | No **Configurador**, alterar fórmula para variante **válida** (ex.: `quantidade_total_pedido - quantidade_cancelada_total_pedido`) → clicar **Salvar** | Toast/sucesso · Print `145-saldo-config-formula-alterada.png` |
| **146** | Voltar à **Lista de Pedidos** → expandir o **mesmo pedido** de teste → inspecionar coluna **Saldo do pedido** | Valor na grade **diferente** do passo 142 — reflete a **nova** fórmula · Print `146-saldo-lista-formula-alterada-resultado.png` |
| **147** | Voltar ao **Configurador → Fórmula de Saldo** → colar/restaurar a **fórmula original** do passo 144 → **Salvar** | Fórmula padrão salva no tenant · Print `147-saldo-config-formula-restaurada.png` |
| **148** | Voltar à **Lista** → **mesmo pedido** → inspecionar coluna **Saldo do pedido** | Valor na grade **igual** ao esperado com fórmula original (antes do passo 145) · Print `148-saldo-lista-formula-padrao-resultado.png` |
| **149** | Abrir **Configurações** novamente | Campo exibe fórmula original — confirma persistência no backend |
| **150** | **Hub** → **Lista** → reexpandir pedido | Fórmula original no Config **e** saldos corretos na grade após navegação · Print `150-saldo-persistencia-pos-config.png` |

### ETAPA 30 — SALDO — Fórmula item e recálculo (passos 151–156)

Regra **SLD-06** — saldo altera ao mudar Qtd. Inicial, Transferir ou Cancelar.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **151** | Inspecionar **item 1** na grade | Saldo item = `inicial − transferida − cancelada` |
| **152** | Editar **Qtd. Inicial** do **item 1** → confirmar | Saldo item **recalcula** na grade · Prints `152-saldo-qtd-inicial-selecao` · `…-resultado` |
| **153** | Inspecionar pedido com itens na **mesma unidade** | Saldo pedido = **soma** dos saldos dos itens |
| **154** | Conferir **item** pós-redução simples (ETAPA 26) | Saldo reflete `cancelada` incrementada |
| **155** | Tooltip **item** após recálculo | Pill `formula_config` visível |
| **156** | Hub → Lista → reexpandir | Saldos persistem · Print `156-saldo-persistencia-recalculo.png` |

### ETAPA 31 — SALDO — Unidades divergentes (passos 157–160)

Regra **SLD-05** — pedido com itens em unidades distintas (item 2 da ETAPA 22).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **157** | Inspecionar célula **Saldo** do **pedido** | Alerta *Unidades divergentes* — **sem** soma · Print `157-saldo-alerta-unidades-divergentes.png` |
| **158** | Expandir → inspecionar **cada item** | Saldo individual de cada item correto |
| **159** | Tooltip **pedido** | Pill `alerta_unidade_comercializada_divergente` visível |
| **160** | Hub → Lista → reexpandir | Alerta e saldos por item persistem · Print `160-saldo-persistencia-divergencia.png` |

### ETAPA 32 — SALDO — Pós-transferência (passos 161–168)

Valida **somente a coluna Saldo** reaproveitando pedidos das ETAPAs 24–26 (não repete fluxo Transferir).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **161** | **Novo Pedido** — saldo **item** no pedido criado (ETAPA 24) | `inicial − transferida − cancelada` |
| **162** | **Novo Pedido** — saldo **item** no pedido de **origem** | Reduzido conforme transferência |
| **163** | **Novo Pedido** — saldo **pedido** (mesma unidade) | Soma dos saldos dos itens na mesma unidade |
| **164** | **Pedido Existente** — saldo **destino** e **origem** (ETAPA 25) | Atualizados e corretos |
| **165** | **Redução Simples** — saldo após cancelamento (ETAPA 26) | `inicial − transferida − cancelada` |
| **166** | Inspecionar **0,00** na grade | Exibe `0,00` **sem** sufixo UN |
| **167** | Inspecionar valor **> 0** | Exibe quantidade + **UN** |
| **168** | Hub → Lista → reexpandir origem, destino e novo pedido | Saldos persistem · Print `168-saldo-persistencia-pos-transferencia.png` |

### ETAPA 34 — QTD. CANCELADA DO PEDIDO/ITEM — Básico (passos 169–176)

Coluna **`quantidade_cancelada_total_pedido`**. Pedido e item **somente leitura** (`tipo: calculado`). Regras §8E QCN-01…06 · `PILLS_PEDIDO_QTD_CANCELADA` / item `somente_leitura` + `so_operacao`.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **169** | Hover célula **Qtd. Cancelada** do **pedido** | Cursor bloqueado · Print `169-qcan-cursor-pedido.png` |
| **170** | Tooltip **pedido** | Título *Qtd. Cancelada do Pedido* + pills `calculado_pedido_qtd_cancelada` → `bloqueado_edicao` → `soma_mesma_unidade` → `alerta_unidade_comercializada_divergente` → `casas_decimais_config` + aviso Redução Simples via Transferir · Print `170-qcan-tooltip-pedido.png` |
| **171** | Clicar célula **pedido** | Popover **não** abre · Print `171-qcan-pedido-nao-edita.png` |
| **172** | Hover tooltip **item 1** | Título *Qtd. Cancelada do Item* + pills `somente_leitura` → `so_operacao` · Print `172-qcan-tooltip-item.png` |
| **173** | Clicar célula **item 1** | Popover **não** abre · Print `173-qcan-item-nao-edita.png` |
| **174** | Item sem cancelamento | `0,00 UN` ou `—` conforme estado |
| **175** | Colapsar pedido → hover cabeçalho **Qtd. Cancelada do Pedido/Item** | Tooltip bloco único pedido + item · Print `175-qcan-tooltip-cabecalho.png` |
| **176** | Hub → Lista → reexpandir pedido | Valores inalterados · Print `176-qcan-persistencia-basico.png` |

### ETAPA 35 — QTD. CANCELADA — Redução Simples (passos 177–188)

> Fluxo que **incrementa** a coluna (QCN-07 / QTR-08). Valida **Qtd. Cancelada**; **Qtd. Transferida** permanece inalterada.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **177** | Checkbox **outro item** (saldo ≥ 1) | Item selecionado |
| **178** | Menu → **Redução Simples** | Modal aberto · Print `178-qcan-reducao-modal.png` |
| **179** | Anotar **Qtd. Cancelada** atual do item na grade | Baseline registrado no runner |
| **180** | Quantidade válida (saldo após ≥ 1) | Preview correto |
| **181** | Saldo negativo | Não confirma |
| **182** | Clicar **Confirmar** | Sucesso · Print `182-qcan-reducao-sucesso.png` |
| **183** | **Qtd. Cancelada** do **item** | Incrementada pela quantidade cancelada |
| **184** | **Qtd. Transferida** do **item** | **Inalterada** |
| **185** | **Qtd. Cancelada** do **pedido** | Soma dos itens (mesma unidade) |
| **186** | **Saldo** do item | `inicial − transferida − cancelada` |
| **187** | Item com cancelada **> 0** | Célula com destaque vermelho |
| **188** | Hub → Lista → reexpandir | Valores persistem · Print `188-qcan-persistencia-reducao.png` |

### ETAPA 36 — QTD. CANCELADA — Unidades divergentes (passos 189–192)

Regra **QCN-05** — item 2 com unidade distinta (ETAPA 22).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **189** | Inspecionar célula **Qtd. Cancelada** do **pedido** | Alerta *Unidades divergentes* — **sem** soma · Print `189-qcan-alerta-unidades-divergentes.png` |
| **190** | Expandir → inspecionar **cada item** | Cancelada individual correta |
| **191** | Tooltip **pedido** | Pill `alerta_unidade_comercializada_divergente` visível |
| **192** | Hub → Lista → reexpandir | Persistência · Print `192-qcan-persistencia-divergencia.png` |

### ETAPA 37 — QTD. CANCELADA — Split não incrementa (passos 193–198)

> Split (ETAPAs 24–25) **não** incrementa Qtd. Cancelada (QCN-08).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **193** | Anotar cancelada do **item** na **origem** (pós-ETAPA 35) | Baseline registrado |
| **194** | Após **Split Novo Pedido** (ETAPA 24) — **origem** | Cancelada **igual** ao baseline |
| **195** | **Novo pedido** criado | Cancelada = `0,00 UN` (ou valor esperado) |
| **196** | Após **Split Pedido Existente** (ETAPA 25) — origem e destino | Sem incremento indevido em cancelada |
| **197** | Conferir colunas | **Qtd. Transferida** alterada; **Qtd. Cancelada** independente |
| **198** | Hub → Lista → reexpandir | Persistência · Print `198-qcan-persistencia-pos-split.png` |

### ETAPA 38 — QTD. CANCELADA — Casas decimais no Config (passos 199–206)

> Runner grava casas decimais originais (padrão **2**) e restaura em `try/finally`.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **199** | **Pedido → Configurações → Casas decimais** | Valor atual de *Qtd. Cancelada do Pedido* visível · Print `199-qcan-config-casas-atual.png` |
| **200** | Registrar snapshot casas decimais originais | Padrão confirmado antes da edição |
| **201** | Alterar *Qtd. Cancelada* para **0** casas → **Salvar** | Sucesso · Print `201-qcan-config-casas-alteradas.png` |
| **202** | Voltar à **Lista** → item com cancelada **> 0** | Exibição **sem** decimais (ex.: `10 UN`) · Print `202-qcan-lista-casas-alteradas.png` |
| **203** | Config → restaurar **2** casas → **Salvar** | Valor original · Print `203-qcan-config-casas-restauradas.png` |
| **204** | Lista → **mesmo item** | Volta `10,00 UN` · Print `204-qcan-lista-casas-padrao.png` |
| **205** | Abrir **Configurações** novamente | Campo exibe **2** casas — persistência no backend |
| **206** | **Hub** → **Lista** → reexpandir | Config + grade corretos · Print `206-qcan-persistencia-pos-config.png` |

> **Obsoleto:** ETAPAs 40–42 (passos 207–226) foram **substituídas** pelas ETAPAs 47–48 (260–288), alinhadas ao produto atual.

### ETAPA 44 — PESO LÍQUIDO TOTAL DO PEDIDO/ITEM (passos 227–237)

Coluna **`peso_liquido_total_pedido`** (pedido = soma bloqueada) / **`peso_liquido_unitario`** no item (editável). Regras §8G PLQ-01…11 · `PILLS_PEDIDO_PESO_CUBAGEM` · select Cadastros **G / KG / TON**.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **227** | Hover célula **pedido** na coluna Peso Líquido | Cursor `not-allowed` · Print `227-plq-cursor-pedido.png` |
| **228** | Tooltip **pedido** | Título *Peso Líquido Total do Pedido* + pills `calculado_pedido` → `bloqueado_edicao` → `alerta_divergencia` · Print `228-plq-tooltip-pedido.png` |
| **229** | Clicar célula **pedido** | Popover **não** abre · Print `229-plq-pedido-nao-edita.png` |
| **230** | Hover célula **item 1** | Tooltip `editavel_item` → `alerta_divergencia` · Print `230-plq-tooltip-item.png` |
| **231** | Clicar célula **item 1** | Popover qty + unidade abre · Print `231-plq-item-abre-popover-resultado.png` |
| **232** | Abrir select de unidade no popover | Lista contém **G**, **KG** e **TON** (`G — Grama`, `KG — Quilograma`, `TON — Tonelada`) · Print `232-plq-select-unidades.png` |
| **233** | Inspecionar aviso amarelo no popover | Texto *A alteração da unidade irá alterar também Peso Bruto Total* · Print `233-plq-aviso-impacto-bruto.png` |
| **234** | Informar **10,000** → unidade **KG** → confirmar | Item 1 exibe valor · Prints `234-plq-item-incluir-selecao.png` + `234-plq-item-incluir-resultado.png` |
| **235** | Inspecionar célula **pedido** | Total atualizado (soma dos itens) · Print `235-plq-pedido-soma-resultado.png` |
| **236** | Editar item 1 para **12,500 KG** | Grade atualiza · Prints `236-plq-item-editar-selecao.png` + `236-plq-item-editar-resultado.png` |
| **237** | Hub → Lista → reexpandir | **12,500 KG** persiste no item · Print `237-plq-persistencia-apos-navegar-resultado.png` |

### ETAPA 45 — PESO BRUTO TOTAL DO PEDIDO/ITEM (passos 238–248)

Coluna **`peso_bruto_total_pedido`** (pedido bloqueado) / **`peso_bruto_unitario`** no item. Regras §8H PLB-01…11 · mesmo select **G / KG / TON** · aviso cruzado com Peso Líquido.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **238** | Hover célula **pedido** na coluna Peso Bruto | Cursor `not-allowed` · Print `238-plb-cursor-pedido.png` |
| **239** | Tooltip **pedido** | Título *Peso Bruto Total do Pedido* + pills calculado/bloqueado/divergência · Print `239-plb-tooltip-pedido.png` |
| **240** | Clicar célula **pedido** | Popover **não** abre · Print `240-plb-pedido-nao-edita.png` |
| **241** | Hover célula **item 1** | Tooltip editável + divergência · Print `241-plb-tooltip-item.png` |
| **242** | Clicar célula **item 1** | Popover abre · Print `242-plb-item-abre-popover-resultado.png` |
| **243** | Abrir select de unidade | Lista contém **G**, **KG** e **TON** · Print `243-plb-select-unidades.png` |
| **244** | Inspecionar aviso amarelo | *A alteração da unidade irá alterar também Peso Líquido Total* · Print `244-plb-aviso-impacto-liquido.png` |
| **245** | Informar **20,000** → **KG** → confirmar | Item 1 exibe valor · Prints `245-plb-item-incluir-selecao.png` + `245-plb-item-incluir-resultado.png` |
| **246** | Inspecionar célula **pedido** | Total atualizado · Print `246-plb-pedido-soma-resultado.png` |
| **247** | Editar item 1 para **25,500 KG** | Grade atualiza · Prints `247-plb-item-editar-selecao.png` + `247-plb-item-editar-resultado.png` |
| **248** | Hub → Lista → reexpandir | **25,500 KG** persiste · Print `248-plb-persistencia-apos-navegar-resultado.png` |

### ETAPA 46 — CUBAGEM TOTAL DO PEDIDO/ITEM (passos 249–259)

Coluna **`cubagem_total_pedido`** (pedido bloqueado, soma) / **`cubagem_unitaria`** no item (editável). Regras §8I CUB-01…11 · select Cadastros com **M3** obrigatório · **sem** aviso amarelo cruzado.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **249** | Hover célula **pedido** na coluna Cubagem | Cursor `not-allowed` · Print `249-cub-cursor-pedido.png` |
| **250** | Tooltip **pedido** | Título *Cubagem Total do Pedido* + pills calculado/bloqueado/divergência · Print `250-cub-tooltip-pedido.png` |
| **251** | Clicar célula **pedido** | Popover **não** abre · Print `251-cub-pedido-nao-edita.png` |
| **252** | Hover célula **item 1** | Tooltip editável + divergência · Print `252-cub-tooltip-item.png` |
| **253** | Clicar célula **item 1** | Popover qty + unidade abre · Print `253-cub-item-abre-popover-resultado.png` |
| **254** | Abrir select de unidade | **M3** com rótulo `M3 — …` e ≥3 opções Cadastros · Print `254-cub-select-unidades.png` |
| **255** | Inspecionar popover | **Sem** aviso amarelo de impacto em outro campo · Print `255-cub-sem-aviso-impacto.png` |
| **256** | Informar **15,250** → **M3** → confirmar | Item 1 exibe valor em M³ · Prints `256-cub-item-incluir-selecao.png` + `256-cub-item-incluir-resultado.png` |
| **257** | Inspecionar célula **pedido** | Total = soma dos itens (mesma unidade) · Print `257-cub-pedido-soma-resultado.png` |
| **258** | Editar item 1 para **20,500 M3** | Grade atualiza · Prints `258-cub-item-editar-selecao.png` + `258-cub-item-editar-resultado.png` |
| **259** | Hub → Lista → reexpandir | **20,500 M³** persiste · Print `259-cub-persistencia-apos-navegar-resultado.png` |

### ETAPA 47 — TIPO VOLUME PEDIDO/ITEM (passos 260–272)

Coluna **`tipo_volume_pedido`** / **`tipo_volume_item`**. Popover **somente select** (`apenasUnidade`). **SSOT:** `cadastros.volume` — modal deve listar **todas** as opções ativas do banco (ex.: `01 — Tambor de Plástico` … `06 — Caixa de Isopor`). Ao abrir o modal, **aviso amarelo obrigatório:** *«A edição aqui irá alterar a Qtd de Volumes do Pedido/Item»* (`aviso_impacto_tipo_volume`). Regras §8J TVL-01…12.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **260** | Scroll até coluna **Tipo Volume Pedido/Item** | Coluna visível |
| **261** | Hover célula **pedido** | Cursor editável · Print `261-tvl-cursor-pedido.png` |
| **262** | Tooltip **pedido** | Título *Tipo de Volume do Pedido* + pills `editavel_pedido` → `replica_itens` → `alerta_divergencia` · Print `262-tvl-tooltip-pedido.png` |
| **263** | Clicar célula **pedido** | Modal/popover **Tipo Volume Pedido/Item** abre (somente select) **com aviso amarelo** *«A edição aqui irá alterar a Qtd de Volumes do Pedido/Item»* · Print `263-tvl-pedido-abre-popover-aviso-resultado.png` |
| **264** | Abrir dropdown no modal | Lista **completa** de `cadastros.volume` — mesma ordem/códigos do banco (`01`, `02`, `03` …); busca «Buscar…» funcional · Print `264-tvl-select-cadastros-volume.png` |
| **265** | Selecionar tipo **diferente do atual** (ex. `05 — Caixa de Papelão`) → **Confirmar** | Coluna **Qtd. de Volumes do Pedido** reflete o novo tipo na exibição (ex. pluralização/nome do tipo na célula qtd, mesmo que qtd = 0) · Print `265-tvl-impacto-qtd-volumes-resultado.png` |
| **266** | Reabrir popover **pedido** | Aviso amarelo **persiste** — mesmo texto *«A edição aqui irá alterar a Qtd de Volumes do Pedido/Item»* · Print `266-tvl-aviso-impacto.png` |
| **267** | Tipo **A** → **sem** checkbox «Aplicar em todos os itens» → confirmar | Só **pedido** exibe tipo A · Prints `267-tvl-pedido-sem-replicar-selecao.png` + `267-tvl-pedido-sem-replicar-resultado.png` |
| **268** | Tipo **B** → **com** checkbox marcado → confirmar | Pedido **e todos os itens** = tipo B · Prints `268-tvl-pedido-replicar-todos-selecao.png` + `268-tvl-pedido-replicar-todos-resultado.png` |
| **269** | Editar **somente item 2** → tipo **C** | Item 2 = C; pedido mantém B · Print `269-tvl-item2-isolado-resultado.png` |
| **270** | Inspecionar **pedido** | Alerta âmbar *Tipos de volume divergentes entre itens* · Print `270-tvl-alerta-divergencia-resultado.png` |
| **271** | Hover + clicar **item 1** → alterar tipo → confirmar | Tooltip item + edição isolada · Prints `271-tvl-item1-editar-selecao.png` + `271-tvl-item1-editar-resultado.png` |
| **272** | Hub → Lista → reexpandir | Tipos persistem · Print `272-tvl-persistencia-apos-navegar-resultado.png` |

### ETAPA 48 — QTD. DE VOLUMES DO PEDIDO (passos 273–287)

Coluna **`quantidade_volumes_pedido`**. Pedido **bloqueado** inline; edição no **item** (popover com **número inteiro + select tipo**) e **Edição em Massa**. **SSOT** do select: mesmo `cadastros.volume` do passo 264. Regras §8F VOL-01…12 (revisada). Grade/rodapé **incluídos nesta etapa** (ex-ETAPA 49).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **273** | Scroll até **Qtd. de Volumes do Pedido** | Coluna visível |
| **274** | Hover célula **pedido** | Cursor `not-allowed` · Print `274-vol-cursor-pedido.png` |
| **275** | Tooltip **pedido** | Título *Qtd. Total de Volumes do Pedido* + pills `bloqueado_edicao` → `calculado_pedido_volumes` → `alerta_divergencia` · Print `275-vol-tooltip-pedido.png` |
| **276** | Clicar célula **pedido** | Popover **não** abre · Print `276-vol-pedido-nao-edita.png` |
| **277** | Hover célula **item 1** | Tooltip `editavel_item` · Print `277-vol-tooltip-item.png` |
| **278** | Clicar célula **item 1** | Modal abre com **campo numérico** (inteiro) **e** **select de tipo de volume**; select lista opções `cadastros.volume` (SSOT) · Print `278-vol-item-popover-qty-e-select.png` |
| **279** | Informar **12** + selecionar tipo **05 — Caixa de Papelão** → confirmar | Coluna **Tipo Volume Pedido/Item** no **pedido** (e itens espelhados) atualizada para o tipo escolhido; Qtd. exibe `12 caixas de papelão` · Prints `279-vol-impacto-tipo-volume-selecao.png` + `279-vol-impacto-tipo-volume-resultado.png` |
| **280** | Reabrir popover **item** | Aviso *«A edição aqui irá alterar Tipo de Volume do Pedido/Item»* · Print `280-vol-aviso-impacto.png` |
| **281** | Checkbox **pedido** → **Edição em Massa** → **Qtd. de Volumes** → **24** → confirmar | Pedido e itens espelhados = `24 …` · Prints `281-vol-massa-24-modal.png` + `281-vol-massa-24-resultado.png` |
| **282** | Clicar célula **pedido** | Popover **ainda não** abre · Print `282-vol-pedido-ainda-bloqueado.png` |
| **283** | Ordenar coluna (asc/desc) | Lista reordena sem erro |
| **284** | Filtrar (valor **> 0**) | Só pedidos com volumes; rodapé com **soma** dos visíveis |
| **285** | Limpar filtro | Pedido de teste ainda exibe **24** |
| **286** | Hub → Lista → reexpandir | **24** persiste · Print `286-vol-persistencia-apos-navegar-resultado.png` |
| **287** | *(fechamento etapa 48 — grade incluída)* | Estado final consolidado · Print `287-vol-estado-final-grade.png` |

### ETAPA 49 — COBERTURA CAMBIAL DO PEDIDO (passos 288–302)

Coluna **`cobertura_cambial`** (dual pedido/item). Select editável · **SSOT** `cadastros.cambio_siscomex` (`tipo=cobertura_cambial`) via `useCambioSiscomexPedido` — rótulo `código — nome`. Popover do **pedido** exibe checkbox **«Aplicar a todos os itens deste pedido»**; **marcado** replica em todos os itens; **desmarcado** altera só o pedido. Alerta âmbar *Coberturas cambiais divergentes entre itens* quando itens divergem. Regras §8K COB-01…12.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **288** | Scroll até **Cobertura Cambial do Pedido/Item** | Coluna visível |
| **289** | Hover célula **pedido** | Cursor editável · Print `289-cob-cursor-pedido.png` |
| **290** | Tooltip **pedido** | Título *Cobertura Cambial* + pills `editavel_pedido` → `replica_itens` → `alerta_divergencia` · Print `290-cob-tooltip-pedido.png` |
| **291** | Tooltip **item 1** | Pills `editavel_item` → `alerta_divergencia` · Print `291-cob-tooltip-item.png` |
| **292** | Clicar célula **pedido** | Popover select abre · Print `292-cob-pedido-abre-popover-resultado.png` |
| **293** | Abrir dropdown | Lista **completa** do Cadastros (`cobertura_cambial` ativos); busca «Buscar…» funcional · Print `293-cob-select-cadastros-ssot.png` |
| **294** | Inspecionar popover **pedido** | Checkbox **«Aplicar a todos os itens deste pedido»** visível e desmarcado por padrão · Print `294-cob-checkbox-aplicar-todos-visivel.png` |
| **295** | Selecionar opção **A** → checkbox **desmarcado** → confirmar | **Só pedido** = A; itens **inalterados** · Prints `295-cob-pedido-sem-replicar-selecao.png` + `295-cob-pedido-sem-replicar-resultado.png` |
| **296** | Selecionar opção **B** → checkbox **marcado** → confirmar | **Pedido e todos os itens** = B (réplica válida) · Prints `296-cob-pedido-replicar-todos-selecao.png` + `296-cob-pedido-replicar-todos-resultado.png` |
| **297** | Editar **somente item 2** → opção **C** → confirmar | Item 2 = C; pedido mantém B · Print `297-cob-item2-isolado-resultado.png` |
| **298** | Inspecionar célula **pedido** | Ícone/alerta âmbar *Coberturas cambiais divergentes entre itens* visível · Print `298-cob-alerta-divergencia-resultado.png` |
| **299** | Editar **item 1** → opção **D** → confirmar | Edição isolada no item · Prints `299-cob-item1-editar-selecao.png` + `299-cob-item1-editar-resultado.png` |
| **300** | Checkbox **pedido** → **Edição em Massa** → **Cobertura Cambial** → opção **E** → confirmar | Pedido + itens espelhados = E · Prints `300-cob-massa-selecao.png` + `300-cob-massa-resultado.png` |
| **301** | Hub → Lista → reexpandir | Cobertura persiste · Print `301-cob-persistencia-apos-navegar-resultado.png` |
| **302** | *(fechamento etapa 49)* | Estado final consolidado · Print `302-cob-estado-final-grade.png` |

### ETAPA 43 — Relatório

1. Gerar `RESULTADO.txt` com linhas `EMT_ROW|…` e resultado Aprovado/Reprovado

---

## Execução

```bash
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-editar-salvar.ts
```

Runner dedicado **Importador:**

```bash
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-importador-emt.ts
```

Runner dedicado **Exportador:**

```bash
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-exportador-emt.ts
```

---

## Contagem de casos

| Bloco | Passos | Casos EMT (aprox.) |
|-------|--------|-------------------|
| Nº PEDIDO / ITEM | 02–05 | 4 |
| WORKSPACE | documentado | 6 regras |
| TIPO OPERAÇÃO | 06–12 | 7 |
| STATUS | documentado | 5 regras |
| IMPORTADOR | runner dedicado | 3 |
| EXPORTADOR | runner dedicado | 3 |
| REF. IMPORTADOR | 13–16 | 4 |
| REF. EXPORTADOR | 17–20 | 4 |
| INCOTERM | 21–24 | 4 |
| DESCRIÇÃO DO ITEM | 25–28 | 6 |
| PORTO DE ORIGEM | 29.1–29.5 | 5 |
| PORTO DE DESTINO | 30.1–30.5 | 5 |
| PAÍS DE ORIGEM | 31.1–31.5 | 5 |
| PAÍS DE DESTINO | 32.1–32.5 | 5 |
| AEROPORTO DE ORIGEM | 33.1–33.5 | 5 |
| AEROPORTO DE DESTINO | 34.1–34.5 | 5 |
| NCM | 35–41 | 7 |
| QTD. PRONTA DO PEDIDO/ITEM | 42–48 | 7 |
| QTD. INICIAL DO PEDIDO/ITEM | 49–55 | 7 |
| MOEDA DO PEDIDO/ITEM | 56–61 | 6 |
| VALOR TOTAL DO PEDIDO/ITEM | 62–71 | 10 |
| UNIDADE COMERCIALIZADA DO PEDIDO/ITEM | 72–82 | 11 |
| QTD. TRANSFERIDA — Básico | 83–87 | 5 |
| QTD. TRANSFERIDA — Novo Pedido | 88–106 | 19 |
| QTD. TRANSFERIDA — Pedido Existente | 107–124 | 18 |
| QTD. TRANSFERIDA — Redução Simples | 125–134 | 10 |
| SALDO — Básico | 135–142 | 8 |
| SALDO — Alterar fórmula Config e restaurar | 143–150 | 8 |
| SALDO — Fórmula item e recálculo | 151–156 | 6 |
| SALDO — Unidades divergentes | 157–160 | 4 |
| SALDO — Pós-transferência | 161–168 | 8 |
| QTD. CANCELADA — Básico | 169–176 | 8 |
| QTD. CANCELADA — Redução Simples | 177–188 | 12 |
| QTD. CANCELADA — Unidades divergentes | 189–192 | 4 |
| QTD. CANCELADA — Split não incrementa | 193–198 | 6 |
| QTD. CANCELADA — Casas decimais Config | 199–206 | 8 |
| TIPO VOLUME PEDIDO/ITEM | 260–272 | 13 |
| QTD. DE VOLUMES DO PEDIDO | 273–287 | 15 |
| PESO LÍQUIDO TOTAL DO PEDIDO/ITEM | 227–237 | 11 |
| PESO BRUTO TOTAL DO PEDIDO/ITEM | 238–248 | 11 |
| CUBAGEM TOTAL DO PEDIDO/ITEM | 249–259 | 11 |
| COBERTURA CAMBIAL DO PEDIDO | 288–302 | 15 |
| **Total runner principal** | | **~302 passos / ~334 casos** |
| **+ runners dedicados Importador/Exportador** | | **+6 regras** |
