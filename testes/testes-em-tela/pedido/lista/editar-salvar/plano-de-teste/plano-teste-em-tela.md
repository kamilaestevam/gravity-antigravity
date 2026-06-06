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
3. Coluna **REFERÊNCIA IMPORTADOR** — passos **13 a 16**: salvar só pedido, replicar com checkbox, editar item isolado, alerta de divergência.

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

Checklist REFERÊNCIA IMPORTADOR (EMT_ROW no log):

| # | O que foi feito | Resultado esperado |
|---|-----------------|-------------------|
| 13 | Editar **REFERÊNCIA IMPORTADOR** no pedido **sem** marcar «Aplicar a todos os itens» | Só o **pedido** persiste o novo valor; itens **não** replicam |
| 14 | Editar no pedido **com** «Aplicar a todos os itens do pedido» marcado | **Todos** os itens exibem o mesmo valor do pedido |
| 15 | Editar **REFERÊNCIA IMPORTADOR** em **um** item | Só aquele item altera; pedido e demais itens permanecem |
| 16 | Após divergência pedido ≠ itens | Alerta âmbar na coluna do pedido («Referências divergentes entre itens») |

Sublocal: `REFERÊNCIA IMPORTADOR` | Local: `Lista` | Produto: `Pedido`
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
| 13 | `13-ref-importador-pedido-sem-replicar.png` | Pedido salvo sem checkbox — itens inalterados |
| 14 | `14-ref-importador-pedido-replicar-todos.png` | Pedido + todos os itens com mesmo valor |
| 15 | `15-ref-importador-editar-item-isolado.png` | Só o 1º item com valor distinto |
| 16 | `16-ref-importador-alerta-divergencia.png` | Ícone âmbar de divergência na coluna do pedido |
| 99 | `99-erro.png` | Só se falhar |

Viewport: **1440×900** (fixo)

---

## Roteiro de execução

### ETAPA 0 — Preparação
1. Confirmar ambiente (Produção ou Local)
2. Runner cria `resultado-teste/<EMT_RUN_ID>/`
3. Login · Print `01-pos-login.png` (sucesso ou erro)

### ETAPA 1 — Nº PEDIDO / Nº ITEM
1. Navegar lista; expandir pedido com **≥2 itens** · Print `02-lista-carregada.png` (sucesso ou erro)
2. Editar número do pedido · Print `03-editar-pedido-numero-sucesso.png` (sucesso ou erro)
3. Editar Part Number item 1 · Print `04-editar-item-part-number-sucesso.png` (sucesso ou erro)
4. Duplicar PN no item 2 → alerta âmbar · Print `05-alerta-part-number-duplicado-pedido.png` (sucesso ou erro)

### ETAPA 2 — TIPO DE OPERAÇÃO (passos 06–12)

**Pré-condição:** pedido expandido com itens visíveis; runner garante pedido em **Importação** antes do passo 06.

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **06** | Clicar **TIPO DE OPERAÇÃO** na linha do **pedido** (Importação) | Modal/popover abre · Print `06-tipo-operacao-modal-importacao.png` (sucesso ou erro) |
| **07** | Inspecionar o modal | Texto «Aplicar a todos os itens deste pedido» **não** aparece · Print `07-tipo-operacao-sem-checkbox-importacao.png` (sucesso ou erro) |
| **08** | Selecionar **Exportação** e confirmar | Badge **Exportação** no pedido **e** em **todos** os itens · Print `08-tipo-operacao-pedido-itens-exportacao.png` (sucesso ou erro) |
| *(impl.)* | Clicar **TIPO DE OPERAÇÃO** nos **itens** | Popover **não** abre; célula **travada** |
| **09** | Clicar **TIPO DE OPERAÇÃO** na linha do **pedido** (Exportação) | Modal abre · Print `09-tipo-operacao-modal-exportacao.png` (sucesso ou erro) |
| **10** | Inspecionar o modal | Checkbox replicar **ausente** · Print `10-tipo-operacao-sem-checkbox-exportacao.png` (sucesso ou erro) |
| **11** | Selecionar **Importação** e confirmar | Badge **Importação** no pedido **e** em **todos** os itens · Print `11-tipo-operacao-pedido-itens-importacao.png` (sucesso ou erro) |
| **12** | Clicar célula **TIPO DE OPERAÇÃO** no **item** | Célula travada; popover **não** abre · Print `12-tipo-operacao-item-travado.png` (sucesso ou erro) |

### ETAPA 3 — REFERÊNCIA IMPORTADOR (passos 13–16)

**Pré-condição:** pedido expandido com **≥2 itens** (ideal; passo 15 usa o 1º item).

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **13** | Clicar **REFERÊNCIA IMPORTADOR** no **pedido**; digitar valor `REF-EMT-SOLO-*`; **não** marcar checkbox; confirmar | Pedido exibe o valor; **itens** mantêm valor anterior (não replicam) · Print `13-ref-importador-pedido-sem-replicar.png` (sucesso ou erro) |
| **14** | Clicar no **pedido**; digitar `REF-EMT-TODOS-*`; marcar **«Aplicar a todos os itens deste pedido»**; confirmar | Pedido **e todos** os itens exibem o mesmo valor · Print `14-ref-importador-pedido-replicar-todos.png` (sucesso ou erro) |
| **15** | Clicar **REFERÊNCIA IMPORTADOR** no **1º item**; digitar `REF-EMT-ITEM-*`; confirmar | Só o item editado muda; pedido e demais itens permanecem com `REF-EMT-TODOS-*` · Print `15-ref-importador-editar-item-isolado.png` (sucesso ou erro) |
| **16** | Inspecionar célula do **pedido** na coluna | Ícone âmbar visível (divergência pedido ≠ itens); tooltip «Referências divergentes entre itens» · Print `16-ref-importador-alerta-divergencia.png` (sucesso ou erro) |

### ETAPA 4 — Relatório
1. Gerar `RESULTADO.txt` com linhas `EMT_ROW|…` e resultado PASSOU/FALHOU

---

## Execução

```bash
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-editar-salvar.ts
```
