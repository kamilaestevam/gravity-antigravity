# Plano de Teste em Tela — Pedido / Lista / Editar e Salvar

**ID:** TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001  
**Data:** 2026-06-06  
**Versão:** 4.1  
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

## Resumo executivo

| Bloco | Passos no runner | Runner |
|-------|------------------|--------|
| **Nº PEDIDO / Nº ITEM** | 03–05 | `run-lista-editar-salvar.ts` |
| **WORKSPACE** | — (documentado) | pendente no runner principal |
| **TIPO DE OPERAÇÃO** | 06–12 | `run-lista-editar-salvar.ts` |
| **STATUS** | — (documentado) | pendente no runner principal |
| **IMPORTADOR** | — | `run-lista-importador-emt.ts` (dedicado) |
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

### ETAPA 6 — REFERÊNCIA IMPORTADOR (passos 13–16)

**Pré-condição:** pedido expandido com **≥2 itens**.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **13** | Editar no **pedido** `REF-IMP-EMT-SOLO-*`; **sem** checkbox; confirmar | Só pedido persiste · Print `13-ref-importador-pedido-sem-replicar-selecao` · `…-resultado` (sucesso ou erro) |
| **14** | Editar no **pedido** `REF-IMP-EMT-TODOS-*`; **com** checkbox; confirmar | Pedido **e** todos os itens iguais · Print `14-ref-importador-pedido-replicar-todos-selecao` · `…-resultado` (sucesso ou erro) |
| **15** | Editar no **1º item** `REF-IMP-EMT-ITEM-*`; confirmar | Só item 1 muda · Print `15-ref-importador-editar-item-isolado-selecao` · `…-resultado` (sucesso ou erro) |
| **16** | Inspecionar coluna do **pedido** | Ícone âmbar visível · Print `16-ref-importador-alerta-divergencia-resultado.png` (sucesso ou erro) |

### ETAPA 7 — REFERÊNCIA EXPORTADOR (passos 17–20)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **17** | Editar no **pedido** `REF-EXP-EMT-SOLO-*`; **sem** checkbox; confirmar | Só pedido persiste · Print `17-ref-exportador-pedido-sem-replicar-selecao` · `…-resultado` (sucesso ou erro) |
| **18** | Editar no **pedido** `REF-EXP-EMT-TODOS-*`; **com** checkbox; confirmar | Pedido **e** todos os itens iguais · Print `18-ref-exportador-pedido-replicar-todos-selecao` · `…-resultado` (sucesso ou erro) |
| **19** | Editar no **1º item** `REF-EXP-EMT-ITEM-*`; confirmar | Só item 1 muda · Print `19-ref-exportador-editar-item-isolado-selecao` · `…-resultado` (sucesso ou erro) |
| **20** | Inspecionar coluna do **pedido** | Ícone âmbar visível · Print `20-ref-exportador-alerta-divergencia-resultado.png` (sucesso ou erro) |

### ETAPA 8 — INCOTERM (passos 21–24)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **21** | Select no pedido, sigla A, **sem** checkbox → confirmar | Só pedido persiste · Print `21-incoterm-pedido-sem-replicar-selecao` · `…-resultado` (sucesso ou erro) |
| **22** | Select no pedido, sigla B, **com** checkbox → confirmar | Pedido **e** todos os itens iguais · Print `22-incoterm-pedido-replicar-todos-selecao` · `…-resultado` (sucesso ou erro) |
| **23** | Select no **item 1**, sigla C → confirmar | Item isolado · Print `23-incoterm-editar-item-isolado-selecao` · `…-resultado` (sucesso ou erro) |
| **24** | Inspecionar coluna do **pedido** | Ícone âmbar visível · Print `24-incoterm-alerta-divergencia-resultado.png` (sucesso ou erro) |

### ETAPA 9 — DESCRIÇÃO DO ITEM (passos 25–28)

Campo **ghost** (`descricao_item`): persiste no banco só no item; linha do pedido é exibição agregada. **Sem** alerta âmbar de divergência.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **25** | Hover célula **pedido** e **item 1** | 3 pills ghost em ambos · Print `25-descricao-tooltip-pedido` · `25-descricao-tooltip-item` (sucesso ou erro) |
| **26** | Texto no pedido, **sem** checkbox → confirmar | Só pedido persiste · Print `26-descricao-pedido-sem-replicar-selecao` · `…-resultado` (sucesso ou erro) |
| **27** | Texto no pedido, **com** checkbox → confirmar | Pedido + todos os itens iguais · Print `27-descricao-pedido-replicar-todos-selecao` · `…-resultado` (sucesso ou erro) |
| **28** | Texto no **item 1** → confirmar; inspecionar coluna do pedido | Item isolado; **sem** alerta âmbar · Print `28-descricao-editar-item-isolado-selecao` · `…-resultado` · `28-descricao-sem-alerta-divergencia-resultado` (sucesso ou erro) |

**Prefixos de valor no runner:** `DESC-EMT-SOLO-*` · `DESC-EMT-TODOS-*` · `DESC-EMT-ITEM-*`

### ETAPA 10 — PORTO DE ORIGEM (`porto_origem`, passo 29)

**Regras LOG-01…06:** valor único no pedido; itens espelham `_p`; tooltip com 3 pills espelhadas; **sem** checkbox replicar; **sem** alerta âmbar.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **29.1** | Hover tooltip na célula do **pedido** | Título «Porto de Origem» + 3 pills espelhadas · Print `29-log-porto-origem-tooltip-pedido.png` (sucesso ou erro) |
| **29.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `29-log-porto-origem-tooltip-item.png` (sucesso ou erro) |
| **29.3** | Select no **pedido** → **BRFOR** → confirmar | **Sem** checkbox replicar · Pedido **e** itens espelham BRFOR · Prints `29-log-porto-origem-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **29.4** | Select no **item 1** → **BRSSZ** → confirmar | Pedido atualizado via item; todos espelham BRSSZ · Prints `29-log-porto-origem-item-selecao` · `…-resultado` (sucesso ou erro) |
| **29.5** | Inspecionar coluna do **pedido** | **Sem** ícone âmbar de divergência (LOG-05) |

### ETAPA 11 — PORTO DE DESTINO (`porto_destino`, passo 30)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **30.1** | Hover tooltip na célula do **pedido** | Título «Porto de Destino» + 3 pills · Print `30-log-porto-destino-tooltip-pedido.png` (sucesso ou erro) |
| **30.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `30-log-porto-destino-tooltip-item.png` (sucesso ou erro) |
| **30.3** | Select no **pedido** → **BRSSZ** → confirmar | Espelhamento em todos os itens · Prints `30-log-porto-destino-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **30.4** | Select no **item 1** → **BRITJ** → confirmar | Pedido + itens = BRITJ · Prints `30-log-porto-destino-item-selecao` · `…-resultado` (sucesso ou erro) |
| **30.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 12 — PAÍS DE ORIGEM (`local_de_origem`, passo 31)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **31.1** | Hover tooltip na célula do **pedido** | Título «País de Origem» + 3 pills · Print `31-log-pais-origem-tooltip-pedido.png` (sucesso ou erro) |
| **31.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `31-log-pais-origem-tooltip-item.png` (sucesso ou erro) |
| **31.3** | Select no **pedido** → **BR** → confirmar | Espelhamento · Prints `31-log-pais-origem-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **31.4** | Select no **item 1** → **DE** → confirmar | Pedido + itens = DE · Prints `31-log-pais-origem-item-selecao` · `…-resultado` (sucesso ou erro) |
| **31.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 13 — PAÍS DE DESTINO (`local_de_destino`, passo 32)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **32.1** | Hover tooltip na célula do **pedido** | Título «País de Destino» + 3 pills · Print `32-log-pais-destino-tooltip-pedido.png` (sucesso ou erro) |
| **32.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `32-log-pais-destino-tooltip-item.png` (sucesso ou erro) |
| **32.3** | Select no **pedido** → **DE** → confirmar | Espelhamento · Prints `32-log-pais-destino-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **32.4** | Select no **item 1** → **AO** → confirmar | Pedido + itens = AO · Prints `32-log-pais-destino-item-selecao` · `…-resultado` (sucesso ou erro) |
| **32.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 14 — AEROPORTO DE ORIGEM (`aeroporto_origem`, passo 33)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **33.1** | Hover tooltip na célula do **pedido** | Título «Aeroporto de Origem» + 3 pills · Print `33-log-aeroporto-origem-tooltip-pedido.png` (sucesso ou erro) |
| **33.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `33-log-aeroporto-origem-tooltip-item.png` (sucesso ou erro) |
| **33.3** | Select no **pedido** → **GRU** → confirmar | Espelhamento · Prints `33-log-aeroporto-origem-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **33.4** | Select no **item 1** → **CGH** → confirmar | Pedido + itens = CGH · Prints `33-log-aeroporto-origem-item-selecao` · `…-resultado` (sucesso ou erro) |
| **33.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 15 — AEROPORTO DE DESTINO (`aeroporto_destino`, passo 34)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **34.1** | Hover tooltip na célula do **pedido** | Título «Aeroporto de Destino» + 3 pills · Print `34-log-aeroporto-destino-tooltip-pedido.png` (sucesso ou erro) |
| **34.2** | Hover tooltip na célula do **item 1** | Mesmas 3 pills · Print `34-log-aeroporto-destino-tooltip-item.png` (sucesso ou erro) |
| **34.3** | Select no **pedido** → **EZE** → confirmar | Espelhamento · Prints `34-log-aeroporto-destino-pedido-selecao` · `…-resultado` (sucesso ou erro) |
| **34.4** | Select no **item 1** → **GRU** → confirmar | Pedido + itens = GRU · Prints `34-log-aeroporto-destino-item-selecao` · `…-resultado` (sucesso ou erro) |
| **34.5** | Inspecionar coluna do **pedido** | **Sem** alerta âmbar |

### ETAPA 16 — NCM (passos 35–41)

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

### ETAPA 17 — QTD. PRONTA DO PEDIDO/ITEM (passos 42–48)

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

### ETAPA 18 — QTD. INICIAL DO PEDIDO/ITEM (passos 49–55)

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

### ETAPA 19 — Relatório

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

---

## Contagem de casos

| Bloco | Passos | Casos EMT (aprox.) |
|-------|--------|-------------------|
| Nº PEDIDO / ITEM | 02–05 | 4 |
| WORKSPACE | documentado | 6 regras |
| TIPO OPERAÇÃO | 06–12 | 7 |
| STATUS | documentado | 5 regras |
| IMPORTADOR | runner dedicado | 3 |
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
| **Total runner principal** | | **~77 passos / 106 casos** |
