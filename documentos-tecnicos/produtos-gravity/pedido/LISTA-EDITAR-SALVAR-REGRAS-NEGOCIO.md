# Lista de Pedidos — Editar e Salvar (Regras de Negócio)

> **Produto:** Pedido (COMEX)  
> **Tela:** `/pedido/pedidos/lista` — edição inline na hierarquia **Pedido (pai) → PedidoItem (filho)**  
> **Versão:** 1.0  
> **Data:** 2026-06-03  
> **Status:** Vigente — aprovado pelo dono (regras STATUS 00–04 e TIPO DE OPERAÇÃO 2026-06)

**Doc técnico:** [`LISTA-EDITAR-SALVAR-TECNICO.md`](./LISTA-EDITAR-SALVAR-TECNICO.md)  
**Replicação genérica (checkbox):** [`REPLICAR-PAI-EM-ITENS-TECNICO.md`](./REPLICAR-PAI-EM-ITENS-TECNICO.md)  
**Testes EMT:** `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md`

---

## Escopo deste documento

Regras de produto para colunas com comportamento **especial** na Lista (diferente do padrão «checkbox replicar + alerta de divergência»):

| Coluna | Foco |
|--------|------|
| **Nº PEDIDO / Nº ITEM** (identificadores) | Edição por nível; alerta de Part Number duplicado |
| **WORKSPACE** | Exclusivo do pedido; replicação automática; item travado; sem alerta |
| **TIPO DE OPERAÇÃO** | Exclusivo do pedido; replicação automática; item travado |
| **STATUS** | Pedido e item editáveis; checkbox replicar; alerta âmbar de divergência |
| **IMPORTADOR** (`nome_importador`) | Importação: espelhado com workspace; Exportação: vincular ou modal de troca |
| **REFERÊNCIA IMPORTADOR / EXPORTADOR** | Padrão Incoterm — pedido+item editáveis, checkbox replicar, alerta divergência |

Demais colunas propagáveis seguem [`REPLICAR-PAI-EM-ITENS-TECNICO.md`](./REPLICAR-PAI-EM-ITENS-TECNICO.md) (Incoterm, datas, referência fabricante, etc.).

**Tooltips de coluna:** framework em [`LISTA-EDITAR-SALVAR-TECNICO.md` §6](./LISTA-EDITAR-SALVAR-TECNICO.md#6-tooltips-de-coluna-na-lista). As seções abaixo descrevem pills e alertas **por coluna**; títulos e matriz completas serão fechados campo a campo pelo dono.

---

## 0. Framework de tooltips (lista)

> Vigente **2026-06-07**. Não substitui as regras de edição das seções 1–8 — define **como** a UI explica cada coluna no hover.

### 01 — Tooltip linha pedido

Aparece no **cabeçalho** da coluna e na **célula da linha do pedido**.

| Elemento | Regra |
|----------|--------|
| **Título** | Sempre `{Nome da coluna} do Pedido` — ex.: *Moeda do Pedido*, *Valor Total do Pedido* |
| **Pills** | Apenas as exigidas pela regra do campo, nesta ordem: (1) Bloqueado para edição → (2) Total/somatória → (3) Editável no pedido → (4) Aplicar em todos os itens → (5) Editável no item → (6) Alerta se divergirem → (7) Depende de importação/exportação |
| **Aviso amarelo** | Opcional, abaixo das pills — quando editar o campo impacta outras colunas |

### 02 — Tooltip linha item

Aparece na **célula da linha do item** (pedido expandido).

| Elemento | Regra |
|----------|--------|
| **Título** | Sempre `{Nome da coluna} do Item` — ex.: *Moeda do item* |
| **Pills** | Apenas as exigidas, nesta ordem: (1) Bloqueado → (2) Editável no item → (3) Alerta se divergirem |
| **Aviso amarelo** | Opcional — mesmo critério do pedido |

### 03 — Avisos de impacto (ambos os níveis)

Texto livre orientado ao operador — ex.: *«A alteração da moeda irá alterar também Valor Unitário do Item e Valor Total do Pedido/Item»*. Não substitui pill de alerta de divergência (âmbar na célula).

### Mapeamento pill → linguagem do usuário

| Pill (código) | Texto na UI |
|---------------|-------------|
| `bloqueado_edicao` / `somente_leitura` | Bloqueado para edição |
| `valor_total_soma_mesma_moeda`, `calculado_pedido`, etc. | Total do xxx / somatória (conforme coluna) |
| `editavel_pedido` | Editável no pedido |
| `replica_itens` / `replica_itens_auto` | Aplicar em todos os itens |
| `editavel_item` / `editavel_nos_itens` | Editável no item |
| `alerta_divergencia` / `alerta_moeda_divergente` | Alerta se XX divergirem |
| `cond_import_export` | Depende de importação ou exportação |
| `espelhado_logistica_bidirecional` | Espelhado com itens e pedido |

### Status da documentação por coluna

| Coluna | Tooltips documentados neste arquivo | Alinhado ao framework 01/02 |
|--------|-------------------------------------|------------------------------|
| Moeda | Em migração (piloto no código) | 🟡 parcial |
| Valor total / unitário | Em migração (piloto no código) | 🟡 parcial |
| Logística (LOG-06) | ✅ pills definidas | 🟡 títulos `{Coluna} do Pedido/Item` pendentes |
| Demais seções 1–8 | Regras de edição + pills pontuais | 🟡 revisão campo a campo pelo dono |

---

## 1. Nº PEDIDO e Nº ITEM

### Nº PEDIDO (linha pai)

- Editável na linha do **pedido** quando o usuário tem `pedido:lista:editar`.
- Persiste via API (`PUT /api/v1/pedidos/:id` ou fluxo inline equivalente).
- Campo com `@@unique` por organização — **um pedido por vez** na edição inline (não é edição em massa).

### Nº ITEM / Part Number (linha filho)

- Editável na linha do **item** (`part_number` e identificadores de item).
- Alteração no item **não** altera o número do pedido pai.
- **Alerta âmbar** na coluna do pedido quando dois ou mais itens do mesmo pedido compartilham o mesmo Part Number (`part_number_duplicado_no_pedido`).

---

## 2. WORKSPACE

> Decisão de produto **2026-06** — alinhada a TIPO DE OPERAÇÃO na replicação; **sem** alerta de divergência.

| # | Regra |
|---|--------|
| **WS-01** | Somente a linha **pedido** edita workspace (`id_workspace`). |
| **WS-02** | Linha **item** é **somente leitura** (igual TIPO DE OPERAÇÃO) — popover não abre. |
| **WS-03** | Ao salvar no pedido, replica **automaticamente** para todos os itens (`replicar_em_itens` efetivo = `true`). |
| **WS-04** | Popover **sem** checkbox «Aplicar a todos os itens». |
| **WS-05** | **Sem** alerta âmbar — pedido e itens ficam sempre alinhados após edição. |
| **WS-06** | Select **único**: opções = todos os workspaces **habilitados** ao usuário (`workspacesDisponiveis` / `/hub/init`), não só os já visíveis na página. |

---

## 3. TIPO DE OPERAÇÃO

> Decisão de produto **2026-06** (validada em produção e EMT passos 06–12).

| # | Regra |
|---|--------|
| **TOP-01** | Somente a linha **pedido** edita `tipo_operacao`. |
| **TOP-02** | Ao salvar no pedido, o valor replica **automaticamente** para todos os itens (`replicar_em_itens` efetivo = `true` — sem escolha do usuário). |
| **TOP-03** | O popover de edição no pedido **não** exibe o checkbox «Aplicar a todos os itens deste pedido». |
| **TOP-04** | A célula **TIPO DE OPERAÇÃO** na linha **item** é **somente leitura** — clique não abre popover. |
| **TOP-05** | **Sem** alerta âmbar de divergência entre pedido e itens (`tipo_operacao_divergente` / `ALERTA_OVERRIDE.tipo_operacao = false`). |

### Comportamento esperado (operador)

1. Usuário clica **TIPO DE OPERAÇÃO** no pedido → abre seletor Importação / Exportação.
2. Confirma a troca → pedido **e todos os itens** exibem o novo tipo (expandidos ou ao expandir depois).
3. Clicar no item na mesma coluna → nada acontece (célula travada).

### O que não é

- Não é campo «propagável opcional» como Incoterm (sem checkbox = divergir).
- Não permite override por item na Lista (diferente da edição em massa aba **Item**, que tem `tipo_operacao_item`).

---

## 4. STATUS

> Decisão de produto **2026-06** — regras **00–04** definidas pelo dono.

| # | Regra |
|---|--------|
| **00** | **Todos** os status são replicáveis na UI — nativos (`rascunho`, `aberto`, …) **e** customizados (Configurações → Status). |
| **01** | A coluna **STATUS** na linha **pedido** é **editável** (select com opções de `statusOpts` / abas configuradas). |
| **02** | O popover no pedido exibe o checkbox **«Aplicar a todos os itens deste pedido»** (padrão `replicar_em_itens = false`). |
| **03** | A coluna **STATUS** na linha **item** é **editável** (select com as mesmas opções). |
| **04** | **Alerta âmbar** (`⚠`) quando: status do pedido ≠ status de algum item **ou** status entre itens difere (item ≠ item). Tooltip: *Status divergente entre pedido e itens*. |

### Com checkbox desmarcado (só pedido)

- O **pedido** persiste o novo status via `POST /api/v1/pedidos/alteracoes-status-lote/confirmar`.
- Os **itens** mantêm o status anterior na sessão (via `_p.status` e, se ainda não expandidos, `status_itens_snapshot`).
- O alerta âmbar aparece **mesmo sem expandir** o pedido antes da edição (desde que o pedido tenha itens — `quantidade_total_pedido`, `saldo_itens_do_pedido` ou `ncms_distintos_count` > 0).

### Com checkbox marcado (replicar)

- Pedido e itens em memória recebem o mesmo status.
- Alerta de divergência some quando todos ficam homogêneos.

### Edição no item

- Altera `_p.status` na UI para exibir divergência e permitir cenários item-a-item.
- **Dívida conhecida (P0):** alteração de status **só no item** ainda **não persiste** no banco — após F5 o item volta a refletir o status do pedido. Decisão de produto/API pendente.

---

## 4. NCM

> Decisão de produto **2026-06** — vários NCMs no mesmo pedido é cenário normal (cada item com classificação própria).

| # | Regra |
|---|--------|
| **NCM-01** | Campo **ghost** — persiste no banco no **item**; linha do pedido guarda valor canônico de sessão. |
| **NCM-02** | Linha **pedido** e linha **item** editáveis. |
| **NCM-03** | Popover no pedido exibe checkbox **«Aplicar a todos os itens deste pedido»** (default desmarcado). |
| **NCM-04** | **Sem** checkbox: só a linha do pedido atualiza na sessão; itens **não** recebem PATCH. |
| **NCM-05** | **Com** checkbox: PATCH do mesmo NCM em **todos** os itens. |
| **NCM-06** | **Sem** alerta âmbar — vários NCMs no mesmo pedido é normal. |
| **NCM-07** | Exibição no pedido: valor canônico da sessão; se vazio e todos os itens coincidem, mostra o NCM único; senão `—`. |

---

## 5. IMPORTADOR (`nome_importador`)

> Decisão de produto **2026-06** — aprovada pelo dono.

O importador exibido depende do **tipo de operação** do pedido (espelhado com Exportador na lógica inversa).

### Importação (`tipo_operacao = importacao`)

| # | Regra |
|---|--------|
| **IMP-01** | O importador é o **workspace** do pedido — exibe o nome do workspace, não um fornecedor do Cadastros. |
| **IMP-02** | Tooltip: *Espelhado com o workspace* — **sem** link para Configurador ou Cadastros. |
| **IMP-03** | Edição inline no pedido abre o **mesmo select de Workspace** (alterar workspace troca o importador). |
| **IMP-04** | Linha **item** somente leitura — espelha o workspace do pedido. |

### Exportação (`tipo_operacao = exportacao`)

| # | Regra |
|---|--------|
| **EXP-01** | Importador = contraparte estrangeira vinculada via Cadastros (`exportacao_importador_id` + `nome_importador`). |
| **EXP-02** | Célula **vazia** → link **«Vincular importador»** → tela Fornecedor no Configurador (fluxo existente com `retorno`). |
| **EXP-03** | Célula **preenchida** → clique abre **modal** com lista de importadores da organização (`pode_ser_importador_fornecedor=true`). |
| **EXP-04** | Modal permite **trocar** o importador sem sair da Lista; atalho → Configurador / Fornecedores. |
| **EXP-05** | **Sem** checkbox «Aplicar a todos os itens» e **sem** alerta de divergência na coluna Importador. |
| **EXP-06** | Linha **item** somente leitura — badge/link espelha o pedido; clique no badge abre o mesmo modal do pedido. |

---

## 6. REFERÊNCIA IMPORTADOR e REFERÊNCIA EXPORTADOR

> Decisão de produto **2026-06** — **mesmas regras** para ambas as colunas (padrão Incoterm).

| # | Regra |
|---|--------|
| **REF-01** | Tipo `alfanumerico` — **sem** diferença entre Importação e Exportação. |
| **REF-02** | Linha **pedido** editável; popover exibe checkbox **«Aplicar a todos os itens deste pedido»** (default desmarcado). |
| **REF-03** | Linha **item** editável. |
| **REF-04** | Sem checkbox: só o **pedido** persiste; itens **não** replicam. |
| **REF-05** | Com checkbox: pedido **e todos** os itens recebem o mesmo valor (`referencia_*_pedido` → `referencia_*_item`). |
| **REF-06** | Edição isolada no item altera só aquele item; pedido e demais itens permanecem. |
| **REF-07** | **Alerta âmbar** na coluna do pedido quando valor do pedido ≠ valor de algum item — tooltip *Referências divergentes entre itens*. |
| **REF-08** | Campos **não** estão em `COLUNAS_SEM_REPLICACAO` — replicação opcional via checkbox. |

**EMT:** passos 13–16 (Importador) e 17–20 (Exportador) em `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md`.

---

## 7. INCOTERM

> Padrão de referência para Ref. Importador/Exportador. Select validado em produção pelo dono (2026-06).

| # | Regra |
|---|--------|
| **INC-01** | UI **select** padrão — opções de `cadastros.incoterm` (`useIncotermsPedido`); **não** input de texto livre. |
| **INC-02** | Linha **pedido** e linha **item** editáveis. |
| **INC-03** | Popover no pedido exibe checkbox **«Aplicar a todos os itens deste pedido»** (default desmarcado). |
| **INC-04** | Sem checkbox: só o pedido persiste; itens não replicam. |
| **INC-05** | Com checkbox: pedido e todos os itens = mesmo Incoterm (`incoterm_pedido` → `incoterm_item`). |
| **INC-06** | Edição isolada no item altera só aquele item. |
| **INC-07** | **Alerta âmbar** na coluna do pedido — tooltip *Incoterms divergentes entre itens*. |
| **INC-08** | Sem diferença entre Importação e Exportação. |

**EMT:** passos 21–24 em `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md`.

---

## 8. Logística (Porto, País, Aeroporto)

> Campos em `CAMPOS_LOGISTICA_PEDIDO` — valor **único no Pedido**; itens **espelham** `_p` na UI.

| # | Regra |
|---|--------|
| **LOG-00** | EMT: o código escolhido (UN/LOCODE, ISO, IATA) pode ser **qualquer opção** do Cadastros — o critério é **salvou com sucesso** e pedido + itens exibem o **mesmo** valor espelhado. |
| **LOG-01** | Campo existe só no model **Pedido** (sem coluna em `PedidoItem`). |
| **LOG-02** | Linha **pedido** editável (select Cadastros). |
| **LOG-03** | Linha **item** exibe o mesmo valor (**espelhado** com o pedido). |
| **LOG-04** | Edição no **item** roteia PATCH para o **pedido**. |
| **LOG-05** | **Sem** checkbox replicar e **sem** alerta de divergência. |
| **LOG-06** | Tooltip **pedido**: «Editável no pedido» · «Editável no item» · «Espelhado com itens e pedido» (ordem canônica §0). **Item**: mesmas pills até revisão campo a campo. Título: `{Coluna} do Pedido` / `{Coluna} do Item` (ex.: *Porto de Origem do Pedido*). |

---

## 9. Resumo comparativo

| Aspecto | Workspace | TIPO DE OPERAÇÃO | STATUS | Importador | Ref. Imp./Exp. | Logística | Incoterm |
|---------|-----------|------------------|--------|------------|----------------|-----------|----------|
| Edição no pedido | ✅ | ✅ | ✅ | ✅ (IMP: via workspace) | ✅ | ✅ | ✅ |
| Edição no item | ❌ travado | ❌ travado | ✅ | ❌ travado | ✅ | ✅ (roteia pedido) | ✅ |
| Checkbox replicar no pedido | ❌ ausente | ❌ ausente | ✅ presente | ❌ ausente | ✅ presente | ❌ ausente | ✅ presente |
| Replicação sem checkbox | ✅ sempre | ✅ sempre | ❌ não replica | — | ❌ não replica | Espelhado visual | ❌ não replica |
| Alerta âmbar se diverge | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Opções do select (pedido) | Workspaces habilitados | Importação / Exportação | Status nativos + custom | IMP: workspaces | Texto livre | Cadastros | Incoterms cadastros |

---

## 10. Histórico

| Data | Evento |
|------|--------|
| 2026-05-13 | Checkbox «Aplicar a todos os itens» — entrega genérica ([`REPLICAR-PAI-EM-ITENS-TECNICO.md`](./REPLICAR-PAI-EM-ITENS-TECNICO.md)) |
| 2026-06 | TIPO DE OPERAÇÃO — regras TOP-01…05; EMT aprovado (PR #199, runner #201) |
| 2026-06-03 | STATUS — regras 00–04; fix alerta sem expandir (`status_itens_snapshot`); TDZ `statusOpts`/`pedidos` |
| 2026-06-03 | WORKSPACE — WS-01…06; sem alerta; select com todos workspaces habilitados |
| 2026-06-03 | IMPORTADOR — IMP-01…04 / EXP-01…06; modal seletor na exportação; IMP espelhado com workspace |
| 2026-06-06 | NCM — NCM-01…07; sem alerta de divergência (vários NCMs por pedido é normal) |
| 2026-06-06 | REF. IMPORTADOR / EXPORTADOR — REF-01…08; EMT passos 13–20 (mesmas regras, padrão Incoterm) |
| 2026-06-06 | LOGÍSTICA — LOG-01…06; tooltips espelhados (sem alerta/replicar) em Porto/País/Aeroporto |
| 2026-06-03 | LOG-00 — EMT logística valida espelhamento, não código fixo (runner opção dinâmica) |
| 2026-06-06 | INCOTERM — INC-01…08; EMT passos 21–24 (select Cadastros + checkbox + alerta divergência) |
| 2026-06-07 | §0 Framework tooltips (linha pedido / linha item / avisos); LOG-06 alinhado a títulos `{Coluna} do Pedido/Item` |
