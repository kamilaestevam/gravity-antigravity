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
| **EXPORTADOR** (`nome_exportador`) | Exportação: espelhado com workspace; Importação: vincular ou popover de troca |
| **REFERÊNCIA IMPORTADOR / EXPORTADOR** | Padrão Incoterm — pedido+item editáveis, checkbox replicar, alerta divergência |
| **VALOR TOTAL DO PEDIDO/ITEM** (`valor_total_pedido`) | Pedido bloqueado (soma mesma moeda); item editável via popover moeda+valor |

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
| Moeda | ✅ MND-01…08 + tooltips §0 | ✅ |
| Valor total (`valor_total_pedido`) | ✅ VLR-01…10 + tooltips §0 | ✅ |
| Valor unitário | Em migração (piloto no código) | 🟡 parcial |
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

## 5B. EXPORTADOR (`nome_exportador`)

> Decisão de produto **2026-06** — espelho invertido do Importador (§5), aprovada pelo dono.

O exportador exibido depende do **tipo de operação** do pedido.

### Exportação (`tipo_operacao = exportacao`)

| # | Regra |
|---|--------|
| **EXPE-01** | O exportador é o **workspace** do pedido — exibe o nome do workspace, não um fornecedor do Cadastros. |
| **EXPE-02** | Tooltip: *Espelhado com o workspace* — **sem** link para Configurador ou Cadastros na célula preenchida. |
| **EXPE-03** | Edição inline no pedido abre o **mesmo select de Workspace** (alterar workspace troca o exportador). |
| **EXPE-04** | Linha **item** somente leitura — espelha o workspace do pedido. |

### Importação (`tipo_operacao = importacao`)

| # | Regra |
|---|--------|
| **IMPE-01** | Exportador = contraparte estrangeira vinculada via Cadastros (`importacao_exportador_id` + `nome_exportador`). |
| **IMPE-02** | Célula **vazia** → link **«Vincular exportador»** no popover → tela Fornecedor no Configurador (fluxo existente com `retorno`). |
| **IMPE-03** | Célula **preenchida** → clique abre **popover** com lista de exportadores da organização (`pode_ser_exportador_fornecedor=true`). |
| **IMPE-04** | Popover permite **trocar** o exportador sem sair da Lista; atalho → Configurador / Fornecedores. |
| **IMPE-05** | **Sem** checkbox «Aplicar a todos os itens» e **sem** alerta de divergência na coluna Exportador. |
| **IMPE-06** | Linha **item** somente leitura — badge/link espelha o pedido; clique no badge abre o mesmo popover do pedido. |

**EMT:** `run-lista-exportador-emt.ts` — ETAPA 6 EXPORTADOR em `plano-teste-em-tela.md`.

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

## 8. MOEDA DO PEDIDO/ITEM (`moeda_pedido`)

> Decisão de produto **2026-06-07** — padrão Incoterm (checkbox replicar) + aviso de impacto cruzado em Valor Unitário e Valor Total. Tooltips alinhados ao framework §0.

| # | Regra |
|---|--------|
| **MND-01** | Label da coluna na grade: **Moeda do Pedido/Item** — títulos de tooltip separados por nível (§0). |
| **MND-02** | Linha **pedido** editável — select de `cadastros.moeda` (`useMoedasPedido`). |
| **MND-03** | Popover no pedido exibe checkbox **«Aplicar a todos os itens deste pedido»** (default desmarcado). |
| **MND-04** | Linha **item** editável — persiste `moeda_item`. |
| **MND-05** | Sem checkbox: só o **pedido** persiste; itens **não** replicam. |
| **MND-06** | Com checkbox: pedido **e todos** os itens recebem a mesma moeda (`moeda_pedido` → `moeda_item`). |
| **MND-07** | **Alerta âmbar** (`⚠`) na célula do **pedido** quando itens divergem (`moeda_item_divergente`) — tooltip *Moedas divergentes entre itens*. **Sem** pill `alerta_moeda_divergente` no tooltip (ícone na célula basta). |
| **MND-08** | **Aviso amarelo** no tooltip **pedido e item** + popover de edição: *A alteração da moeda irá alterar também Valor Unitário do Item e Valor Total do Pedido/Item* (`aviso_impacto_moeda`). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Moeda do Pedido* (`moeda_pedido_titulo_linha_pedido`) | `editavel_pedido` → `replica_itens` → `editavel_item` |
| **Item** | *Moeda do item* (`moeda_item_titulo`) | `editavel_item` |

**Código:** `pai_moeda_pedido` · `PILLS_PEDIDO_MOEDA` / `PILLS_ITEM_MOEDA` · `tituloTooltipCelulaPorColuna` em `buildTooltipRegraLista.tsx`.

---

## 8A. VALOR TOTAL DO PEDIDO/ITEM (`valor_total_pedido`)

> Decisão de produto **2026-06-08** — coluna dinâmica pedido/item. Pedido **não editável**; item via popover **moeda + valor** (`.gtv-edit-moeda-valor`). Tooltips alinhados ao framework §0.

| # | Regra |
|---|--------|
| **VLR-01** | Label na grade: **Valor Total do Pedido/Item** — títulos de tooltip: *Valor total do pedido* (pai) / *Valor Total do Item* (filho). |
| **VLR-02** | Linha **pedido** **bloqueada** — cursor `not-allowed`; exibe soma dos `valor_total_item` na **mesma moeda** ou `—` se moedas divergirem. |
| **VLR-03** | Linha **item** **editável** — popover moeda + valor; item vazio pode incluir valor e qualquer moeda e salvar. |
| **VLR-04** | Valor preenchido do item = **Valor unitário do item × Qtd. Inicial do Item** (pill de fórmula na tooltip do item). |
| **VLR-05** | Ao abrir o popover em item preenchido, exibir **valor e moeda originais** antes da edição. |
| **VLR-06** | Alterar valor/moeda no item persiste `valor_total_item` + `moeda_item` e recalcula agregado do pedido. |
| **VLR-07** | **Alerta âmbar** na célula do **pedido** quando itens têm moedas divergentes no valor (`moeda_item_divergente`) — *Moedas divergentes entre itens*. |
| **VLR-08** | **Aviso amarelo** no tooltip **pedido e item**: *A alteração da moeda aqui irá alterar também Moeda do Pedido/Item e Valor Unitário do Item* (`valor_total_item_impacto_moeda_edicao`). |
| **VLR-09** | Alterar moeda no popover do item propaga impacto em `moeda_item`, `valor_por_unidade_item` e agregados (sincronização local pós-save). |
| **VLR-10** | Sair da Lista e voltar — valores e moedas salvos nos itens **persistem** na grade (passo 71 EMT). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** (expandido) | *Valor total do pedido* | `bloqueado_edicao` → `valor_total_soma_mesma_moeda` → `editavel_nos_itens` → `alerta_moeda_divergente_entre_itens` |
| **Item** | *Valor Total do Item* | `editavel_nos_itens` → `valor_total_item_formula` |
| **Cabeçalho** (sem expandir) | *Valor Total do Pedido/Item* | `bloqueado_edicao` → `valor_total_soma_mesma_moeda` → `editavel_nos_itens` → `alerta_moeda_divergente_entre_itens` |

**Código:** `PILLS_PEDIDO_VALOR_TOTAL` / `PILLS_ITEM_VALOR_TOTAL` · `CHAVES_COLUNA_INLINE_BLOQUEADA_PEDIDO` · `enriquecerColunaBloqueadaInlinePedido` em `buildTooltipRegraLista.tsx`.

**EMT:** passos 62–71 (ordem exata regras 01–08) em `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md`.

---

## 8B. UNIDADE COMERCIALIZADA DO PEDIDO/ITEM (`unidade_comercializada_pedido`)

> Decisão de produto **2026-06-08** — padrão Moeda/Incoterm (checkbox replicar) + aviso de impacto nas colunas de quantidade. Select de unidades via Cadastros (`useUnidadesPedido`).

| # | Regra |
|---|--------|
| **UNC-01** | Label na grade: **Unidade Comercializada** — títulos de tooltip: *Unidade Comercializada do Pedido* (pai) / *Unidade Comercializada do Item* (filho). |
| **UNC-02** | Campo **pedido vazio** (`—`) é **editável** — clicar abre popover de unidade. |
| **UNC-03** | Hover na célula do **pedido** exibe tooltip (quando habilitada). |
| **UNC-04** | Tooltip **pedido**: `editavel_pedido` → `replica_itens` → `editavel_item` → `alerta_divergencia` + aviso *A alteração da unidade irá alterar também Qtd. Inicial, Qtd. Pronta, Qtd. Transferida, Saldo e Qtd. Cancelada* (`aviso_impacto_unidade_full`). |
| **UNC-05** | Clicar na célula do **pedido** abre popover/modal com dropdown de unidades. |
| **UNC-06** | Lista do dropdown = **fonte única** Cadastros/unidade (`useUnidadesPedido`). |
| **UNC-07** | Selecionar unidade no **pedido** (vazio ou preenchido) persiste `unidade_comercializada_pedido`. Sem checkbox: só o pedido; com checkbox: pedido **e todos** os itens (`unidade_comercializada_pedido` → `unidade_comercializada_item`). |
| **UNC-08** | Clicar na célula do **item** abre o mesmo popover (somente unidade, `apenasUnidade`). |
| **UNC-09** | Lista do item = mesma fonte Cadastros; editar unidade no item persiste `unidade_comercializada_item`. |
| **UNC-10** | Unidade **divergente** entre itens → **alerta âmbar** na célula do **pedido** (`unidade_comercializada_item_divergente`) — *Unidades divergentes entre itens*. |
| **UNC-11** | Tooltip **item**: mesmas 4 pills do pedido + mesmo aviso de impacto (`aviso_impacto_unidade_full`). |
| **UNC-12** | Sair da Lista e voltar — unidades salvas no pedido e nos itens **persistem** na grade (passo 82 EMT). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Unidade Comercializada do Pedido* | `editavel_pedido` → `replica_itens` → `editavel_item` → `alerta_divergencia` |
| **Item** | *Unidade Comercializada do Item* | `editavel_pedido` → `replica_itens` → `editavel_item` → `alerta_divergencia` |

**Código:** `pai_unidade_comercializada` · `PILLS_PEDIDO_UNIDADE` / `PILLS_ITEM_UNIDADE` · `tipo: 'unidade'` + `apenasUnidade: true` em `ColunasPai.tsx`.

**EMT:** passos 72–82 (ordem regras 01–08 do dono) em `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md`.

---

## 8C. QTD. TRANSFERIDA DO PEDIDO/ITEM (`quantidade_transferida_total`)

> Decisão de produto **2026-06-03** — coluna **somente leitura** na lista; alteração exclusiva via menu **Transferir**. Pedido = soma dos itens na mesma unidade comercializada (ou alerta de divergência). Fluxos split/redução: `documentos-tecnicos/produtos-gravity/pedido/TRANSFERIR-REGRAS-NEGOCIO.md`.

| # | Regra |
|---|--------|
| **QTR-01** | Label na grade: **Qtd. Transferida do Pedido/Item** — títulos de tooltip: *Qtd. Transferida do Pedido* (pai) / *Qtd. Transferida do Item* (filho). |
| **QTR-02** | Célula do **pedido** e do **item**: não editável na lista (`cursor: not-allowed`); popover de edição **não** abre ao clicar. |
| **QTR-03** | Tooltip **pedido**: `calculado_pedido_qtd_transferida` → `bloqueado_edicao` → `soma_mesma_unidade` → `alerta_unidade_comercializada_divergente` → `casas_decimais_config` + aviso *Para alterar os itens, clique em Transferir no menu principal*. |
| **QTR-04** | Tooltip **item**: `somente_leitura` → `so_operacao` + **mesmo aviso** Transferir do pedido. |
| **QTR-05** | Conteúdo do tooltip **item** = conteúdo do tooltip **pedido** (mesmas pills + aviso) quando ambos visíveis na mesma linha expandida. |
| **QTR-06** | Unidades **divergentes** entre itens → pedido sem soma agregada (alerta visual *Unidades divergentes*), alinhado às demais colunas de quantidade. |
| **QTR-07** | Cenários **Split** (novo/existente) incrementam `quantidade_transferida_item` na origem e destino conforme `TRANSFERIR-REGRAS-NEGOCIO.md`. |
| **QTR-08** | Cenário **Redução simples** incrementa **`quantidade_cancelada_item`** (não `quantidade_transferida_item`) na origem — coluna Qtd. Transferida **permanece inalterada**. |
| **QTR-09** | Após Transferir, persistência validada ao sair para o hub e voltar à lista (passos 106 / 124 / 134 EMT). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Qtd. Transferida do Pedido* | `calculado_pedido_qtd_transferida` → `bloqueado_edicao` → `soma_mesma_unidade` → `alerta_unidade_comercializada_divergente` → `casas_decimais_config` |
| **Item** | *Qtd. Transferida do Item* | `somente_leitura` → `so_operacao` |

**Código:** `PILLS_PEDIDO_QTD_TRANSFERIDA` / `PILLS_ITEM_QTD_TRANSFERIDA` em `pillsTooltipColunaLista.ts` · `tipo: 'qtd_transferida'` em `ColunasPai.tsx`.

**EMT:** passos 83–134 (ETAPAs 23–26) em `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

---

## 8D. SALDO DO PEDIDO/ITEM (`saldo_itens_do_pedido`)

> Decisão de produto **2026-06-08** — coluna **somente leitura**; pedido = soma dos saldos dos itens na **mesma unidade** (ou alerta *Unidades divergentes*); item = inicial − transferida − cancelada. Fórmula do pedido editável no Configurador.

| # | Regra |
|---|--------|
| **SLD-01** | Label na grade: **Saldo do Pedido/Item** — títulos de tooltip: *Saldo do Pedido* (pai) / *Saldo do Item* (filho). |
| **SLD-02** | Célula do **pedido** e do **item**: não editável na lista (`tipo: saldo`). |
| **SLD-03** | Tooltip **pedido**: `calculado_pedido_saldo` → `bloqueado_edicao` → `alerta_unidade_comercializada_divergente` → `formula_config` → `casas_decimais_config` + link *Editar fórmula no Configurador*. |
| **SLD-04** | Tooltip **item**: `somente_leitura` → `formula_config` + mesmo link ao Configurador. |
| **SLD-05** | Unidades **divergentes** entre itens → célula do pedido sem soma (alerta visual *Unidades divergentes*). |
| **SLD-06** | Saldo do item altera ao mudar Qtd. Inicial, Transferir ou Cancelar — **sem** aviso amarelo de impacto de unidade nesta coluna. |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Saldo do Pedido* | `calculado_pedido_saldo` → `bloqueado_edicao` → `alerta_unidade_comercializada_divergente` → `formula_config` → `casas_decimais_config` |
| **Item** | *Saldo do Item* | `somente_leitura` → `formula_config` |
| **Cabeçalho** (sem expandir) | *Saldo do Pedido/Item* | Mesmas pills pedido + item em bloco único (override `!dual`) |

**Código:** `pai_saldo_formula` / `dinamico_saldo` · `PILLS_PEDIDO_SALDO` / `PILLS_ITEM_SALDO` · `tituloTooltipCelulaPorColuna` (`saldo_itens_do_pedido`).

---

## 8E. QTD. CANCELADA DO PEDIDO/ITEM (`quantidade_cancelada_total_pedido`)

> Decisão de produto **2026-06-08** — coluna **somente leitura**; alteração via menu **Transferir** (redução simples incrementa `quantidade_cancelada_item`). Espelha §8C (Qtd. Transferida).

| # | Regra |
|---|--------|
| **QCN-01** | Label na grade: **Qtd. Cancelada do Pedido/Item** — títulos: *Qtd. Cancelada do Pedido* (pai) / *Qtd. Cancelada do Item* (filho). |
| **QCN-02** | Célula do **pedido** e do **item**: não editável na lista. |
| **QCN-03** | Tooltip **pedido**: `calculado_pedido_qtd_cancelada` → `bloqueado_edicao` → `soma_mesma_unidade` → `alerta_unidade_comercializada_divergente` → `casas_decimais_config` + aviso *Para cancelar os itens, selecione o(s) item(s) e clique em Transferir no menu principal. Escolha a opção Redução Simples*. |
| **QCN-04** | Tooltip **item**: `somente_leitura` → `so_operacao` + **mesmo aviso** do pedido. |
| **QCN-05** | Unidades **divergentes** → pedido sem soma agregada (*Unidades divergentes*). |
| **QCN-06** | **Sem** aviso amarelo de impacto de unidade nesta coluna. |
| **QCN-07** | Cenário **Redução simples** incrementa **`quantidade_cancelada_item`** na origem — **Qtd. Transferida** inalterada (ver QTR-08). |
| **QCN-08** | Cenários **Split** (novo/existente) **não** incrementam Qtd. Cancelada — apenas Qtd. Transferida. |
| **QCN-09** | Casas decimais da coluna configuráveis em **Pedido → Configurações → Casas decimais** (`quantidade_cancelada_total_pedido`). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Qtd. Cancelada do Pedido* | `calculado_pedido_qtd_cancelada` → `bloqueado_edicao` → `soma_mesma_unidade` → `alerta_unidade_comercializada_divergente` → `casas_decimais_config` |
| **Item** | *Qtd. Cancelada do Item* | `somente_leitura` → `so_operacao` |
| **Cabeçalho** (sem expandir) | *Qtd. Cancelada do Pedido/Item* | Override `!dual` (pedido + item) |

**Código:** `dinamico_qtd_cancelada` · `PILLS_PEDIDO_QTD_CANCELADA` / item `somente_leitura` + `so_operacao` · aviso em `buildTooltipRegraLista.tsx` (`quantidade_cancelada_edicao_via_transferir`).

**EMT:** passos 169–206 (ETAPAs 34–38) em `testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/plano-teste-em-tela.md` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

---

## 8F. QTD. DE VOLUMES DO PEDIDO (`quantidade_volumes_pedido`)

> Decisão de produto **2026-06-08** — coluna **somente no pedido**; itens exibem `—`. Não editável na célula da lista; alteração via **Edição em Massa** (nível pedido). Inteiro, sem unidade comercializada.

| # | Regra |
|---|--------|
| **VOL-01** | Label na grade: **Qtd. de Volumes do Pedido** — tooltip: *Qtd. Total de Volumes do Pedido* (pai). |
| **VOL-02** | Célula do **pedido**: não editável inline (`editavel: false`, `tipo: calculado`). |
| **VOL-03** | Linhas de **item**: sempre **`—`** (campo não existe em `PedidoItem`). |
| **VOL-04** | Tooltip **pedido**: `bloqueado_edicao` → `calculado_pedido` → `alerta_divergencia`. |
| **VOL-05** | Tooltip **item** (coluna alinhada): `somente_leitura` — indica campo do pedido. |
| **VOL-06** | Formato: inteiro; `null`/`undefined` → `—`; **sem** sufixo UN. |
| **VOL-07** | Edição permitida via **Edição em Massa** (`ModalPedidosEdicaoMassa`, campo `quantidade_volumes_pedido`). |
| **VOL-08** | **Não** replica em itens; **sem** checkbox «Aplicar em todos os itens». |
| **VOL-09** | Coluna **filtrável** e **ordenável**; rodapé pode exibir soma dos pedidos visíveis. |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Qtd. Total de Volumes do Pedido* | `bloqueado_edicao` → `calculado_pedido` → `alerta_divergencia` |
| **Item** | *(coluna alinhada)* | `somente_leitura` |
| **Cabeçalho** (sem expandir) | *Qtd. de Volumes do Pedido* | Override `!dual` (pedido + item) |

**Código:** `pai_calculado_volumes` · `PILLS_PEDIDO_VOLUMES` · `CHAVES_COLUNA_INLINE_BLOQUEADA_ITEM` · `CAMPOS_DERIVADOS_PAI`.

**EMT:** passos 207–226 (ETAPAs 40–42) · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

---

## 8G. PESO LÍQUIDO TOTAL DO PEDIDO/ITEM (`peso_liquido_total_pedido` / `peso_liquido_unitario_item`)

> Decisão de produto **2026-06-08** — pedido = soma dos itens na mesma unidade de peso (ou alerta *Unidades de peso líquido divergentes*); item editável via popover qty + unidade. Fonte de unidades: Cadastros `categoria=peso` (**G**, **KG**, **TON**).

| # | Regra |
|---|--------|
| **PLQ-01** | Label na grade: **Peso Líquido Total do Pedido/Item** — tooltip pedido: *Peso Líquido Total do Pedido*; item: editável unitário. |
| **PLQ-02** | Célula do **pedido**: não editável na lista (`editavel: false`, `cursor: not-allowed`). |
| **PLQ-03** | Tooltip **pedido**: `calculado_pedido` → `bloqueado_edicao` → `alerta_divergencia`. |
| **PLQ-04** | Tooltip **item**: `editavel_item` → `alerta_divergencia`. |
| **PLQ-05** | Clicar no **item** abre popover com quantidade + select de unidade de peso. |
| **PLQ-06** | Lista do select = Cadastros/unidade `categoria=peso` — EMT exige **G**, **KG** e **TON** visíveis (`G — Grama`, `KG — Quilograma`, `TON — Tonelada`). |
| **PLQ-07** | Aviso amarelo no popover do item: *A alteração da unidade irá alterar também Peso Bruto Total* (`aviso_impacto_peso_bruto`). |
| **PLQ-08** | Editar peso líquido no item persiste `peso_liquido_unitario_item` + `peso_liquido_unidade_item`; pedido recalcula `peso_liquido_total_pedido`. |
| **PLQ-09** | Unidades de peso **divergentes** entre itens → pedido sem soma (alerta *Unidades de peso líquido divergentes*). |
| **PLQ-10** | Formato: casas decimais de Config (`peso_liquido_total_pedido` / unitário); badge de unidade na célula do item; pedido exibe **KG** agregado. |
| **PLQ-11** | Persistência validada ao sair para o hub e voltar à lista (passo 237 EMT). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Peso Líquido Total do Pedido* | `calculado_pedido` → `bloqueado_edicao` → `alerta_divergencia` |
| **Item** | *(dinâmico Pedido/Item)* | `editavel_item` → `alerta_divergencia` |

**Código:** `pai_calculado_peso` · `dinamico_peso_liquido` · `PILLS_PEDIDO_PESO_CUBAGEM` · `unidadesPeso` em `useUnidadesPedido` · `aviso_impacto_peso_bruto` em `ColunasPai.tsx`.

**EMT:** passos 227–237 (ETAPA 44) · `validar-peso-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

---

## 8H. PESO BRUTO TOTAL DO PEDIDO/ITEM (`peso_bruto_total_pedido` / `peso_bruto_unitario_item`)

> Espelha §8G — pedido bloqueado (soma); item editável; unidades de peso do Cadastros; aviso cruzado com Peso Líquido.

| # | Regra |
|---|--------|
| **PLB-01** | Label na grade: **Peso Bruto Total do Pedido/Item** — tooltip pedido: *Peso Bruto Total do Pedido*. |
| **PLB-02** | Célula do **pedido**: não editável na lista. |
| **PLB-03** | Tooltip **pedido**: `calculado_pedido` → `bloqueado_edicao` → `alerta_divergencia`. |
| **PLB-04** | Tooltip **item**: `editavel_item` → `alerta_divergencia`. |
| **PLB-05** | Clicar no **item** abre popover qty + select de unidade. |
| **PLB-06** | Select lista **G**, **KG** e **TON** (mesma fonte Cadastros `categoria=peso`). |
| **PLB-07** | Aviso amarelo: *A alteração da unidade irá alterar também Peso Líquido Total* (`aviso_impacto_peso_liquido`). |
| **PLB-08** | Editar no item persiste `peso_bruto_unitario_item` + `peso_bruto_unidade_item`; pedido recalcula total. |
| **PLB-09** | Unidades divergentes → alerta *Unidades de peso bruto divergentes* no pedido. |
| **PLB-10** | Casas decimais de Config; badge de unidade no item; pedido em **KG**. |
| **PLB-11** | Persistência hub → lista (passo 248 EMT). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Peso Bruto Total do Pedido* | `calculado_pedido` → `bloqueado_edicao` → `alerta_divergencia` |
| **Item** | *(dinâmico Pedido/Item)* | `editavel_item` → `alerta_divergencia` |

**Código:** `dinamico_peso_bruto` · `aviso_impacto_peso_liquido` em `ColunasPai.tsx`.

**EMT:** passos 238–248 (ETAPA 45) · `validar-peso-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

---

## 9. Logística (Porto, País, Aeroporto)

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

## 10. Resumo comparativo

| Aspecto | Workspace | TIPO DE OPERAÇÃO | STATUS | Importador | Exportador | Ref. Imp./Exp. | Moeda | Valor total | Unidade com. | Logística | Incoterm |
|---------|-----------|------------------|--------|------------|------------|----------------|-------|-------------|--------------|-----------|----------|
| Edição no pedido | ✅ | ✅ | ✅ | ✅ (IMP: via workspace) | ✅ (EXP: via workspace) | ✅ | ✅ | ❌ bloqueado | ✅ select unidade | ✅ | ✅ |
| Edição no item | ❌ travado | ❌ travado | ✅ | ❌ travado | ❌ travado | ✅ | ✅ | ✅ popover moeda+valor | ✅ select unidade | ✅ (roteia pedido) | ✅ |
| Checkbox replicar no pedido | ❌ ausente | ❌ ausente | ✅ presente | ❌ ausente | ❌ ausente | ✅ presente | ✅ presente | ❌ ausente | ✅ presente | ❌ ausente | ✅ presente |
| Replicação sem checkbox | ✅ sempre | ✅ sempre | ❌ não replica | — | — | ❌ não replica | ❌ não replica | — | ❌ não replica | Espelhado visual | ❌ não replica |
| Alerta âmbar se diverge | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ (só célula) | ✅ (moeda no valor) | ✅ (unidades) | ❌ | ✅ |
| Opções do select (pedido) | Workspaces habilitados | Importação / Exportação | Status nativos + custom | IMP: workspaces / EXP: fornecedores | EXP: workspaces / IMP: fornecedores | Texto livre | Cadastros moeda | — | Cadastros unidade | Cadastros | Incoterms cadastros |

---

## 11. Histórico

| Data | Evento |
|------|--------|
| 2026-05-13 | Checkbox «Aplicar a todos os itens» — entrega genérica ([`REPLICAR-PAI-EM-ITENS-TECNICO.md`](./REPLICAR-PAI-EM-ITENS-TECNICO.md)) |
| 2026-06 | TIPO DE OPERAÇÃO — regras TOP-01…05; EMT aprovado (PR #199, runner #201) |
| 2026-06-03 | STATUS — regras 00–04; fix alerta sem expandir (`status_itens_snapshot`); TDZ `statusOpts`/`pedidos` |
| 2026-06-03 | WORKSPACE — WS-01…06; sem alerta; select com todos workspaces habilitados |
| 2026-06-03 | IMPORTADOR — IMP-01…04 / EXP-01…06; modal seletor na exportação; IMP espelhado com workspace |
| 2026-06-08 | EXPORTADOR — EXPE-01…04 / IMPE-01…06; espelho invertido do Importador; EMT `run-lista-exportador-emt.ts` |
| 2026-06-06 | NCM — NCM-01…07; sem alerta de divergência (vários NCMs por pedido é normal) |
| 2026-06-06 | REF. IMPORTADOR / EXPORTADOR — REF-01…08; EMT passos 13–20 (mesmas regras, padrão Incoterm) |
| 2026-06-06 | LOGÍSTICA — LOG-01…06; tooltips espelhados (sem alerta/replicar) em Porto/País/Aeroporto |
| 2026-06-03 | LOG-00 — EMT logística valida espelhamento, não código fixo (runner opção dinâmica) |
| 2026-06-06 | INCOTERM — INC-01…08; EMT passos 21–24 (select Cadastros + checkbox + alerta divergência) |
| 2026-06-07 | §0 Framework tooltips (linha pedido / linha item / avisos); LOG-06 alinhado a títulos `{Coluna} do Pedido/Item` |
| 2026-06-07 | MOEDA — MND-01…08; tooltips pedido/item + aviso impacto; pills `editavel_pedido` → `replica_itens` → `editavel_item` / item `editavel_item` |
| 2026-06-08 | VALOR TOTAL — VLR-01…10; pedido bloqueado + soma; item popover; pills `editavel_nos_itens`; EMT passos 62–71 (ordem 01–08) |
| 2026-06-08 | UNIDADE COMERCIALIZADA — UNC-01…12; select Cadastros + checkbox; pills espelhadas pedido/item; EMT passos 72–82 |
