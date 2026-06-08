# Plano de Teste em Tela — Pedido / Lista / Novo Item Manual

**ID:** TST-EMT-PEDIDO-LISTA-NOVO-ITEM-MANUAL-001  
**Data:** 2026-06-03  
**Versão:** 1.0  
**Criticidade:** alta  
**Skill:** `skills/testes/teste-em-tela/SKILL.md`  
**Status:** Aguardando aprovação do dono

**Escopo pasta:** `testes/testes-em-tela/pedido/lista/novo-item-manual/`  
**Plano + runner:** `plano-de-teste/` (este arquivo + `run-novo-item-manual.ts`)  
**Prints:** `../resultado-teste/<runId>/` — uma pasta por execução  
**Componente:** `servicos-global/produto/pedido/client/src/components/ModalItemNovo.tsx`  
**Barra:** `BarraAcoesPedido` → **Novo** → **Novo Item** → **Manual**

> O modal Admin («O que será testado») agrupa casos pelos títulos `### ETAPA …` abaixo.

---

## Resumo executivo

| Bloco | Passos | Runner |
|-------|--------|--------|
| Preparação (login + lista) | 01 | `run-novo-item-manual.ts` |
| Abrir modal Item Manual | 02 | idem |
| Lista de pedidos (escopo workspace) | 03–04 | idem |
| Preencher campos do item | 05.1–05.7 | idem |
| Item na grade | 06 | idem |
| Conferência colunas na lista | 07.1–07.8 | idem |
| Persistência hub → lista | 08 | idem |
| Relatório | — | `RESULTADO.txt` |

**Total:** ~22 passos / 22 casos

---

## Pré-condições

- Usuário autenticado (Clerk) com acesso ao produto **Pedido**.
- Pelo menos **1 pedido** com status **aberto** ou **rascunho** nos **workspaces selecionados** no filtro da Lista (SSOT: `useEscopoWorkspacesPedido` + `pedidoVirtualApi.listar({ idsWorkspacesFiltro })`).
- Cadastros com **moedas** e catálogo **NCM** disponíveis.

**Valores fixos no runner** (sufixo dinâmico `EMT-{timestamp}`):

| Campo modal | Valor teste |
|-------------|-------------|
| Part Number | `EMT-NIM-{sufixo}` |
| NCM | `8528.59.00` |
| Descrição | `EMT Novo Item Manual {sufixo}` |
| Qtd. Inicial | `100` |
| Moeda | 1ª opção do Cadastros no select |
| Valor Unitário | `25,50` |
| Valor Total (readonly) | `2.550,00` (100 × 25,50) |

---

## Regra universal — persistência

**Passo 08:** após conferir a grade, navegar ao **hub**, voltar à **Lista**, reexpandir o pedido e confirmar que o item criado permanece com os mesmos valores.

**Print:** `08-novo-item-persistencia-apos-navegar-resultado.png`

---

### ETAPA 0 — Preparação (passo 01)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **01** | Login Clerk → abrir **Lista de Pedidos** (`/pedido/pedidos/lista`) | Grade carregada com ≥1 linha de pedido · Print `01-lista-carregada.png` |

### ETAPA 1 — Abrir modal Novo Item Manual (passo 02)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **02** | Clicar **Novo** → submenu **Novo Item** → **Manual** | Modal *Novo Item* aberto · passo *Selecionar Pedido* visível · Print `02-modal-novo-item-manual-aberto.png` |

### ETAPA 2 — Seleção do pedido destino (passos 03–04)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **03** | Abrir dropdown **Pedido de destino** | Lista exibe **todos** os pedidos abertos/rascunho dos **workspaces selecionados** no filtro da Lista (mesmo escopo da API `idsWorkspacesFiltro`) · ≥1 opção · Print `03-modal-lista-pedidos-escopo-workspace.png` |
| **04** | Selecionar **1º pedido** da lista → **Próximo** | Passo *Dados do Item* aberto · campo locked *Pedido: {nº}* visível · Print `04-modal-pedido-selecionado-passo-dados.png` |

### ETAPA 3 — Preencher campos (passos 05.1–05.7)

| Passo | Campo | APROVADO quando |
|-------|-------|-----------------|
| **05.1** | **Part Number** (`#mni-pn`) | Valor `EMT-NIM-{sufixo}` no input · Print `05.1-campo-part-number.png` |
| **05.2** | **NCM** (`SelectNcmGlobal`) | Código `8528.59.00` validado · Print `05.2-campo-ncm-selecao.png` |
| **05.3** | **Descrição** (`#mni-desc`) | Texto preenchido · Print `05.3-campo-descricao.png` |
| **05.4** | **Quantidade Inicial do Item** (`#mni-qty`) | `100` formatado · Print `05.4-campo-qtd-inicial.png` |
| **05.5** | **Moeda** (`#mni-moeda`) | Sigla do Cadastros selecionada · Print `05.5-campo-moeda-selecao.png` |
| **05.6** | **Valor Unitário do Item** (`#mni-valor`) | `25,50` · campo **Valor Total dos Itens** (`#mni-total`) readonly = `2.550,00` · Print `05.6-campo-valor-unitario-total-calculado.png` |
| **05.7** | Botão **Adicionar Item** | Toast sucesso · modal fecha · Print `05.7-adicionar-item-resultado.png` |

### ETAPA 4 — Item no pedido (passo 06)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **06** | Lista recarrega e **expande** o pedido selecionado | Nova linha **item** visível com Part Number `EMT-NIM-{sufixo}` · Print `06-item-novo-linha-grade-resultado.png` |

### ETAPA 5 — Conferência colunas na grade (passos 07.1–07.8)

Localizar a linha do item pelo Part Number e inspecionar `data-gtv-campo` na grade:

| Passo | Coluna (label lista) | Campo (`data-gtv-campo`) | APROVADO quando |
|-------|----------------------|--------------------------|-----------------|
| **07.1** | Nº ITEM | `part_number` | Exibe `EMT-NIM-{sufixo}` · Print `07.1-coluna-part-number.png` |
| **07.2** | NCM | `ncm` | Contém `8528.59.00` · Print `07.2-coluna-ncm.png` |
| **07.3** | DESCRIÇÃO DO ITEM | `descricao_item` | Contém texto do passo 05.3 · Print `07.3-coluna-descricao.png` |
| **07.4** | QTD. INICIAL DO PEDIDO/ITEM | `quantidade_total_pedido` | Exibe `100` + unidade comercial · Print `07.4-coluna-qtd-inicial.png` |
| **07.5** | MOEDA DO PEDIDO/ITEM | `moeda_pedido` | Sigla igual passo 05.5 · Print `07.5-coluna-moeda.png` |
| **07.6** | VALOR UNITÁRIO DO ITEM | `valor_por_unidade_item` | Exibe `25,50` + moeda · Print `07.6-coluna-valor-unitario.png` |
| **07.7** | VALOR TOTAL DO PEDIDO/ITEM | `valor_total_pedido` | Exibe total calculado (≈ `2.550,00`) + moeda · Print `07.7-coluna-valor-total.png` |
| **07.8** | Agregado pedido (qtd / valor) | linha **pedido** | Soma dos itens coerente com item adicionado · Print `07.8-pedido-agregados-resultado.png` |

### ETAPA 6 — Persistência (passo 08)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **08** | **Hub** → **Lista** → reexpandir pedido | Item e colunas 07.1–07.7 inalterados · Print `08-novo-item-persistencia-apos-navegar-resultado.png` |

### ETAPA 7 — Relatório

1. Gerar `RESULTADO.txt` com linhas `EMT_ROW|…` e resultado Aprovado/Reprovado por passo.

---

## Execução local

```bash
npx tsx testes/testes-em-tela/pedido/lista/novo-item-manual/plano-de-teste/run-novo-item-manual.ts
```

Variáveis: `PLAYWRIGHT_BASE_URL`, `E2E_CLERK_USER_EMAIL`, `E2E_CLERK_USER_PASSWORD`, `CLERK_SECRET_KEY`, `EMT_RUN_ID` (opcional).

---

## Futuro (fora deste plano)

| Tipo | Pasta prevista | Status |
|------|----------------|--------|
| FUN | `testes/testes-funcionais/pedido/Lista/novo-item-manual/plano-de-teste/` | Pendente |
| UNI | `testes/testes-unitarios/pedido/lista/novo-item-manual/plano-de-teste/` | Pendente |
