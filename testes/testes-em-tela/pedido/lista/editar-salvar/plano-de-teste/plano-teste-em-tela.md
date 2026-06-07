# Plano de Teste em Tela — Pedido / Lista / Editar e Salvar

**ID:** TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001  
**Data:** 2026-06-06  
**Versão:** 3.8  
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
| **LOGÍSTICA (6 colunas)** | 29–34 | `run-lista-editar-salvar.ts` |

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

### ETAPA 10 — LOGÍSTICA (passos 29–34)

**Regras LOG-01…06:** valor único no pedido; itens espelham `_p`; tooltip com 3 pills espelhadas; **sem** checkbox replicar; **sem** alerta âmbar. Cada passo: tooltips pedido+item → select pedido → select item → sem alerta âmbar.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **29** | **Porto de Origem** (`porto_origem`) — tooltips + select pedido BRFOR + select item BRSSZ | Prints `29-log-porto-origem-*` (sucesso ou erro) |
| **30** | **Porto de Destino** (`porto_destino`) — pedido BRSSZ · item BRITJ | Prints `30-log-porto-destino-*` (sucesso ou erro) |
| **31** | **País de Origem** (`local_de_origem`) — pedido BR · item DE | Prints `31-log-pais-origem-*` (sucesso ou erro) |
| **32** | **País de Destino** (`local_de_destino`) — pedido DE · item AO | Prints `32-log-pais-destino-*` (sucesso ou erro) |
| **33** | **Aeroporto de Origem** (`aeroporto_origem`) — pedido GRU · item CGH | Prints `33-log-aeroporto-origem-*` (sucesso ou erro) |
| **34** | **Aeroporto de Destino** (`aeroporto_destino`) — pedido EZE · item GRU | Prints `34-log-aeroporto-destino-*` (sucesso ou erro) |

### ETAPA 11 — Relatório

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
| LOGÍSTICA | 29–34 | 24 |
| **Total runner principal** | | **~50 passos / 92 casos** |
