# Plano de Teste em Tela — Pedido / Lista / Editar e Salvar

**ID:** TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001  
**Data:** 2026-06-06  
**Versão:** 3.2  
**Criticidade:** alta  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**Status:** Aguardando aprovação do dono

**Escopo pasta:** `testes/testes-em-tela/pedido/lista/editar-salvar/`  
**Plano + runner:** `plano-de-teste/` (este arquivo + `run-lista-editar-salvar.ts`)  
**Prints:** `../resultado-teste/<runId>/` — uma pasta por execução

---

## Resumo executivo

Validação visual com Playwright na **Lista de Pedidos**:

1. Coluna **Nº PEDIDO / Nº ITEM** — editar pedido e item, alerta de Part Number duplicado.
2. Coluna **TIPO DE OPERAÇÃO** — passos **06 a 12**: modal no pedido, sem checkbox replicar, troca Importação ↔ Exportação com replicação nos itens, célula do item travada.
3. Coluna **IMPORTADOR** (`nome_importador`) — passos **13 a 16**: Importação = select de workspaces (nome legível, nunca CUID); Exportação = select de fornecedores importadores; item travado.
4. Coluna **EXPORTADOR** (`nome_exportador`) — passos **17 a 20**: Exportação = select de workspaces (nome legível, nunca CUID); Importação = select de fornecedores exportadores; item travado.
5. Coluna **NCM** (`ncm`) — passos **21 a 27**: código `8528.59.00`, busca por texto `monitor`, seleção na lista, pedido e item; tooltip com pill «Editável no pedido».

---

## Plano do teste

```
Produto: Pedido
URL: https://usegravity.com.br/pedido/pedidos/lista

Checklist TIPO DE OPERAÇÃO (EMT_ROW no log):

| # | O que foi feito | Resultado esperado |
|---|-----------------|-------------------|
| 06 | Abrir modal na linha do pedido (Importação) | Popover abre |
| 07 | Modal sem «Aplicar a todos os itens» (Importação) | Checkbox ausente |
| 08 | Alterar Importação → Exportação | Pedido **e** todos os itens exibem Exportação |
| — | Itens travados após Exportação | Célula sem edição; popover não abre |
| 09 | Abrir modal na linha do pedido (Exportação) | Popover abre |
| 10 | Modal sem «Aplicar a todos os itens» (Exportação) | Checkbox ausente |
| 11 | Alterar Exportação → Importação | Pedido **e** todos os itens exibem Importação |
| 12 | Itens travados | Célula travada; popover não abre no item |

Contrato log: `✓ EMT_ROW|Ambiente|Produto|Local|Sublocal|O que foi feito|Resultado`
Sublocal: `TIPO DE OPERAÇÃO` | Local: `Lista` | Produto: `Pedido`

Checklist IMPORTADOR (EMT_ROW no log):

| # | O que foi feito | Resultado esperado |
|---|-----------------|-------------------|
| 13 | Clicar **IMPORTADOR** no pedido **Importação** | Popover abre com lista de **workspaces** (nomes legíveis) |
| 14 | Confirmar troca de workspace no pedido Importação | **Importador** exibe nome do workspace escolhido (não CUID) |
| 15 | Clicar **IMPORTADOR** no pedido **Exportação** | Popover abre com lista de **fornecedores importadores** |
| 16 | Clicar **IMPORTADOR** na linha **item** | Célula travada; popover **não** abre |

Sublocal: `IMPORTADOR` | Local: `Lista` | Produto: `Pedido`

Checklist EXPORTADOR (EMT_ROW no log):

| # | O que foi feito | Resultado esperado |
|---|-----------------|-------------------|
| 17 | Clicar **EXPORTADOR** no pedido **Exportação** | Popover abre com lista de **workspaces** (nomes legíveis) |
| 18 | Confirmar troca de workspace no pedido Exportação | **Exportador** exibe nome do workspace escolhido (não CUID) |
| 19 | Clicar **EXPORTADOR** no pedido **Importação** | Popover abre com lista de **fornecedores exportadores** |
| 20 | Clicar **EXPORTADOR** na linha **item** | Célula travada; popover **não** abre |

Sublocal: `EXPORTADOR` | Local: `Lista` | Produto: `Pedido`

Checklist NCM (EMT_ROW no log):

| # | O que foi feito | Resultado esperado |
|---|-----------------|-------------------|
| 21 | Abrir **NCM** no pedido e inserir `8528.59.00` | Valida (`.gtv-ncm-validation`) e salva no pedido |
| 22 | Digitar `monitor` no NCM do pedido | Lista `.gtv-ncm-busca-item` com **≥2** opções |
| 23 | Selecionar uma NCM da lista no pedido | Confirma e salva no pedido |
| 24 | Abrir **NCM** no item 1 e inserir `8528.59.00` | Valida e salva no item |
| 25 | Digitar `monitor` no NCM do item | Lista com **≥2** opções |
| 26 | Selecionar uma NCM da lista no item | Confirma e salva no item |
| 27 | Hover na célula **NCM** do pedido | Tooltip contém «Editável no pedido» |

Sublocal: `NCM` | Local: `Lista` | Produto: `Pedido`
```

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-pos-login.png` | Hub/pós-login |
| 02 | `02-lista-carregada.png` | Lista aberta — pedido expandido com itens visíveis |
| 03 | `03-editar-pedido-numero-sucesso.png` | Número do pedido salvo |
| 04 | `04-editar-item-part-number-sucesso.png` | Part Number do 1º item salvo |
| 05 | `05-alerta-part-number-duplicado-pedido.png` | Alerta PN duplicado |
| 06 | `06-tipo-operacao-modal-importacao.png` | Clicar pedido → modal aberto (estado Importação) |
| 07 | `07-tipo-operacao-sem-checkbox-importacao.png` | Modal **sem** «Aplicar a todos os itens do pedido» |
| 08 | `08-tipo-operacao-pedido-itens-exportacao.png` | Após Importação → Exportação: pedido **e** itens = Exportação |
| 09 | `09-tipo-operacao-modal-exportacao.png` | Clicar pedido → modal aberto (estado Exportação) |
| 10 | `10-tipo-operacao-sem-checkbox-exportacao.png` | Modal **sem** checkbox replicar |
| 11 | `11-tipo-operacao-pedido-itens-importacao.png` | Após Exportação → Importação: pedido **e** itens = Importação |
| 12 | `12-tipo-operacao-item-travado.png` | Clicar item → célula travada, popover não abre |
| 13 | `13-importador-imp-workspace-selecao.png` | Pedido Importação — popover Importador com workspaces |
| 14 | `14-importador-imp-workspace-resultado.png` | Importador exibe nome do workspace (sem CUID) |
| 15 | `15-importador-exp-fornecedor-selecao.png` | Pedido Exportação — popover Importador com fornecedores |
| 16 | `16-importador-item-travado.png` | Item — célula Importador travada |
| 17 | `17-exportador-exp-workspace-selecao.png` | Pedido Exportação — popover Exportador com workspaces |
| 18 | `18-exportador-exp-workspace-resultado.png` | Exportador exibe nome do workspace (sem CUID) |
| 19 | `19-exportador-imp-fornecedor-selecao.png` | Pedido Importação — popover Exportador com fornecedores |
| 20 | `20-exportador-item-travado.png` | Item — célula Exportador travada |
| 21 | `21-ncm-pedido-codigo-selecao.png` / `21-ncm-pedido-codigo-resultado.png` | NCM pedido — código `8528.59.00` validado e salvo |
| 22 | `22-ncm-pedido-busca-monitor-selecao.png` | NCM pedido — busca `monitor`, lista aberta |
| 23 | `23-ncm-pedido-busca-monitor-resultado.png` | NCM pedido — item da lista selecionado e salvo |
| 24 | `24-ncm-item-codigo-selecao.png` / `24-ncm-item-codigo-resultado.png` | NCM item — código validado e salvo |
| 25 | `25-ncm-item-busca-monitor-selecao.png` | NCM item — busca `monitor`, lista aberta |
| 26 | `26-ncm-item-busca-monitor-resultado.png` | NCM item — seleção da lista salva |
| 27 | `27-ncm-tooltip-pedido.png` | Tooltip NCM com pill «Editável no pedido» |
| 99 | `99-erro.png` | Só se falhar |

Viewport: **1440×900** (fixo)

---

## Roteiro de execução

### ETAPA 0 — Preparação
1. Confirmar ambiente (Produção ou Local)
2. Runner cria `resultado-teste/<EMT_RUN_ID>/`
3. Login → print `01-pos-login.png`

### ETAPA 1 — Nº PEDIDO / Nº ITEM
1. Navegar lista; expandir pedido com **≥2 itens** → `02`
2. Editar número do pedido → `03`
3. Editar Part Number item 1 → `04`
4. Duplicar PN no item 2 → alerta âmbar → `05`

### ETAPA 2 — TIPO DE OPERAÇÃO (passos 06–12)

**Pré-condição:** pedido expandido com itens visíveis; runner garante pedido em **Importação** antes do passo 06.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **06** | Clicar **TIPO DE OPERAÇÃO** na linha do **pedido** (Importação) | Modal/popover abre → print `06` |
| **07** | Inspecionar o modal | Texto «Aplicar a todos os itens deste pedido» **não** aparece → print `07` |
| **08** | Selecionar **Exportação** e confirmar | Badge **Exportação** no pedido **e** em **todos** os itens → print `08` |
| *(impl.)* | Clicar **TIPO DE OPERAÇÃO** nos **itens** | Popover **não** abre; célula **travada** |
| **09** | Clicar **TIPO DE OPERAÇÃO** na linha do **pedido** (Exportação) | Modal abre → print `09` |
| **10** | Inspecionar o modal | Checkbox replicar **ausente** → print `10` |
| **11** | Selecionar **Importação** e confirmar | Badge **Importação** no pedido **e** em **todos** os itens → print `11` |
| **12** | Clicar célula **TIPO DE OPERAÇÃO** no **item** | Célula travada; popover **não** abre → print `12` |

### ETAPA — IMPORTADOR (`nome_importador`) (passos 13–16)

**Pré-condição:** pedido em **Importação** para passos 13–14; pedido em **Exportação** para passo 15; item expandido para passo 16.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **13** | Clicar **IMPORTADOR** na linha do **pedido** (Importação) | Popover abre com opções de **workspace** (nomes legíveis) → print `13` |
| **14** | Selecionar outro workspace e confirmar | Coluna **Importador** exibe o **nome** do workspace (nunca CUID cru) → print `14` |
| **15** | Clicar **IMPORTADOR** na linha do **pedido** (Exportação) | Popover abre com lista de **fornecedores importadores** → print `15` |
| **16** | Clicar **IMPORTADOR** na linha do **item** | Célula travada; popover **não** abre → print `16` |

### ETAPA — EXPORTADOR (`nome_exportador`) (passos 17–20)

**Pré-condição:** pedido em **Exportação** para passos 17–18; pedido em **Importação** para passo 19; item expandido para passo 20.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **17** | Clicar **EXPORTADOR** na linha do **pedido** (Exportação) | Popover abre com opções de **workspace** (nomes legíveis) → print `17` |
| **18** | Selecionar outro workspace e confirmar | Coluna **Exportador** exibe o **nome** do workspace (nunca CUID cru) → print `18` |
| **19** | Clicar **EXPORTADOR** na linha do **pedido** (Importação) | Popover abre com lista de **fornecedores exportadores** → print `19` |
| **20** | Clicar **EXPORTADOR** na linha do **item** | Célula travada; popover **não** abre → print `20` |

### ETAPA — NCM (`ncm`) (passos 21–27)

**Pré-condição:** pedido expandido; API `/api/v1/cadastros/ncm/buscar?q=monitor` disponível.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **21** | Clicar **NCM** no **pedido**; digitar `8528.59.00`; confirmar | Validação NCM visível; toast sucesso; célula exibe o código → prints `21` |
| **22** | Abrir NCM no pedido; digitar `monitor` | Lista com várias NCMs (≥2) → print `22` |
| **23** | Clicar uma opção da lista; confirmar | Salva no pedido → print `23` |
| **24** | Clicar **NCM** no **item 1**; digitar `8528.59.00`; confirmar | Valida e salva no item → prints `24` |
| **25** | Abrir NCM no item; digitar `monitor` | Lista com várias NCMs → print `25` |
| **26** | Selecionar uma NCM; confirmar | Salva no item → print `26` |
| **27** | Hover na célula **NCM** do pedido | Tooltip contém «Editável no pedido» → print `27` |

### ETAPA 3 — Relatório
1. Gerar `RESULTADO.txt` com linhas `EMT_ROW|…` e resultado PASSOU/FALHOU

---

## Execução

```bash
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-editar-salvar.ts
```
