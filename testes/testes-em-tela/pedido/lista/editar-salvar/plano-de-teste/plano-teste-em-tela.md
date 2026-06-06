# Plano de Teste em Tela — Pedido / Lista / Editar e Salvar

**ID:** TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001  
**Data:** 2026-06-06  
**Versão:** 3.1  
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

### ETAPA 3 — Relatório
1. Gerar `RESULTADO.txt` com linhas `EMT_ROW|…` e resultado PASSOU/FALHOU

---

## Execução

```bash
npx tsx testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-editar-salvar.ts
```
