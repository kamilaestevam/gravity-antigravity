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
| **MOEDA CÂMBIO** (`moeda_cambio_pedido`) | Valor único no pedido; itens espelham; alerta moeda comercial divergente |
| **ANEXOS** (`anexo_pedido`, `anexo_proforma`, `anexo_invoice`, `anexo_lpco` + custom `tipo === 'anexo'`) | Célula ícone + painel; vínculo individual por linha; tooltips dual editável pedido/item |

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
| Anexos (`anexo_*`) | ✅ §8P ANX-01…10 | ✅ |
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

> Decisão de produto **2026-06-08** (revisada **2026-06-03**) — valor persiste no **Pedido**; na grade o **pedido** exibe o total formatado e **não** abre popover inline; **itens** editam via popover **quantidade inteira + select de tipo** (`cadastros.volume`). Alteração no item ou em **Edição em Massa** atualiza também **Tipo Volume Pedido/Item**.

| # | Regra |
|---|--------|
| **VOL-01** | Label na grade: **Qtd. de Volumes do Pedido/Item** — tooltip pedido: *Qtd. Total de Volumes do Pedido*. |
| **VOL-02** | Célula do **pedido**: bloqueada inline (`CHAVES_COLUNA_INLINE_BLOQUEADA_PEDIDO`); clique **não** abre popover. |
| **VOL-03** | Célula do **item**: editável — popover com **campo numérico** (inteiro) **e** **select** de tipo de volume. |
| **VOL-04** | Tooltip **pedido**: `bloqueado_edicao` → `calculado_pedido_volumes` → `alerta_divergencia`. |
| **VOL-05** | Tooltip **item**: `editavel_item`. |
| **VOL-06** | Exibição: `formatarExibicaoQuantidadeVolume` — ex. `12 caixas de papelão` (qtd + nome pluralizado do tipo); qtd `0`/ausente com tipo → só o nome do tipo; sem tipo → `—`. |
| **VOL-07** | Select do popover = **SSOT** `cadastros.volume` via `useVolumesPedido` (rótulo `codigo — nome`, ex. `05 — Caixa de Papelão`). |
| **VOL-08** | Sem aviso amarelo no tooltip — pills «Aplicar em todos os itens» / «Editável no item» bastam; item não espelha pedido automaticamente. |
| **VOL-09** | Edição em Massa no **pedido** (checkbox + campo `quantidade_volumes_pedido`) replica qtd/tipo para pedido e itens. |
| **VOL-10** | Coluna **filtrável** e **ordenável**; rodapé soma dos pedidos visíveis (ETAPA 48 unifica grade/rodapé; ex-ETAPA 49). |
| **VOL-11** | Mudança de qtd/tipo no item deve refletir na coluna **Tipo Volume Pedido/Item** (pedido + itens espelhados). |
| **VOL-12** | Persistência validada hub → lista (passo 286 EMT). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Qtd. Total de Volumes do Pedido* | `bloqueado_edicao` → `calculado_pedido_volumes` → `alerta_divergencia` |
| **Item** | *(dinâmico Pedido/Item)* | `editavel_item` |
| **Cabeçalho** (sem expandir) | *Qtd. de Volumes do Pedido/Item* | Override `!dual` (pedido + item) |

**Código:** `pai_calculado_volumes` · `PILLS_PEDIDO_VOLUMES` · `PILLS_ITEM_VOLUMES` · `CHAVES_COLUNA_INLINE_BLOQUEADA_PEDIDO` · `formatarExibicaoQuantidadeVolume` · `useVolumesPedido`.

**EMT:** passos 273–287 (ETAPA 48) · `validar-qtd-volumes-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

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

## 8I. CUBAGEM TOTAL DO PEDIDO/ITEM (`cubagem_total_pedido` / `cubagem_unitaria_item`)

> Decisão de produto **2026-06-08** — pedido = soma dos itens na mesma unidade de cubagem (ou alerta *Unidades de cubagem divergentes*); item editável via popover qty + unidade. Fonte: Cadastros `categoria` ∈ comprimento \| area \| volume (**M3** obrigatório no EMT).

| # | Regra |
|---|--------|
| **CUB-01** | Label na grade: **Cubagem Total do Pedido/Item** — tooltip pedido: *Cubagem Total do Pedido*. |
| **CUB-02** | Célula do **pedido**: não editável na lista (`editavel: false`). |
| **CUB-03** | Tooltip **pedido**: `calculado_pedido` → `bloqueado_edicao` → `alerta_divergencia`. |
| **CUB-04** | Tooltip **item**: `editavel_item` → `alerta_divergencia`. |
| **CUB-05** | Clicar no **item** abre popover qty + select de unidade de cubagem. |
| **CUB-06** | Lista do select = Cadastros/unidade (comprimento \| area \| volume) — EMT exige **M3** (`M3 — …`) e ≥3 opções. |
| **CUB-07** | **Sem** aviso amarelo de impacto cruzado nesta coluna (diferente de peso). |
| **CUB-08** | Editar no item persiste `cubagem_unitaria_item` + `cubagem_unidade_item`; pedido recalcula `cubagem_total_pedido`. |
| **CUB-09** | Unidades divergentes entre itens → pedido sem soma (*Unidades de cubagem divergentes*). |
| **CUB-10** | Formato: casas decimais de Config; badge **M³** no pedido; item exibe unidade escolhida. |
| **CUB-11** | Persistência hub → lista (passo 259 EMT). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Cubagem Total do Pedido* | `calculado_pedido` → `bloqueado_edicao` → `alerta_divergencia` |
| **Item** | *(dinâmico Pedido/Item)* | `editavel_item` → `alerta_divergencia` |

**Código:** `pai_calculado_cubagem` · `dinamico_cubagem` · `PILLS_PEDIDO_PESO_CUBAGEM` · `unidadesCubagem` em `useUnidadesPedido`.

**EMT:** passos 249–259 (ETAPA 46) · `validar-cubagem-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

---

## 8J. TIPO VOLUME PEDIDO/ITEM (`tipo_volume_pedido` / `tipo_volume_item`)

> Decisão de produto **2026-06-03** — pedido e itens editáveis; popover **somente select** (`apenasUnidade`). **SSOT:** `cadastros.volume` via `useVolumesPedido`. Alteração de tipo atualiza exibição em **Qtd. de Volumes do Pedido** (pluralização/nome).

| # | Regra |
|---|--------|
| **TVL-01** | Label na grade: **Tipo Volume Pedido/Item** — tooltip pedido: *Tipo de Volume do Pedido*. |
| **TVL-02** | Célula do **pedido**: editável — popover com **apenas** select de tipo (sem campo numérico). |
| **TVL-03** | Célula do **item**: editável — mesmo popover (select only), campo `tipo_volume_item`. |
| **TVL-04** | Tooltip **pedido**: `editavel_pedido` → `replica_itens` → `alerta_divergencia`. |
| **TVL-05** | Tooltip **item**: `editavel_item` → `alerta_divergencia`. |
| **TVL-06** | Select lista **todas** as opções ativas de `cadastros.volume` — formato `codigo — nome_volume` (ex. `01 — Tambor de Plástico` … `06 — Caixa de Isopor`); busca «Buscar…» funcional. |
| **TVL-07** | Sem aviso amarelo no tooltip — acoplamento tipo↔qtd fica no popover de edição se necessário; não espelha pedido↔item sozinho. |
| **TVL-08** | Checkbox «Aplicar em todos os itens» no **pedido** — marcado replica tipo em todos os itens; desmarcado altera só o pedido. |
| **TVL-09** | Tipos **divergentes** entre itens → alerta âmbar *Tipos de volume divergentes entre itens* no pedido (`tipo_volume_item_divergente`). |
| **TVL-10** | Exibição pedido: rótulo do tipo agregado ou alerta; item: `formatarNomeVolumeExibicao` (singular). |
| **TVL-11** | Confirmar tipo diferente deve refletir na coluna **Qtd. de Volumes** (texto com novo tipo, mesmo qtd = 0). |
| **TVL-12** | Persistência hub → lista (passo 272 EMT). |

### Tooltips (framework §0)

| Nível | Título | Pills (ordem canônica) |
|-------|--------|--------------------------|
| **Pedido** | *Tipo de Volume do Pedido* | `editavel_pedido` → `replica_itens` → `alerta_divergencia` |
| **Item** | *(dinâmico Pedido/Item)* | `editavel_item` → `alerta_divergencia` |
| **Cabeçalho** (sem expandir) | *Tipo Volume Pedido/Item* | Override `!dual` (pedido + item) |

**Código:** `tipo_volume_pedido` em `ColunasPai.tsx` (`apenasUnidade: true`) · mapa filho `tipo_volume_pedido` · `useVolumesPedido` · `aviso_impacto_tipo_volume`.

**EMT:** passos 260–272 (ETAPA 47) · `validar-tipo-volume-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

---

## 8K. COBERTURA CAMBIAL DO PEDIDO (`cobertura_cambial`)

> Decisão de produto **2026-06-03** — coluna dual pedido/item; select Cadastros; checkbox replicar no pedido; alerta de divergência entre itens.

| # | Regra |
|---|--------|
| **COB-01** | Label na grade: **Cobertura Cambial do Pedido/Item** — tooltip: *Cobertura Cambial*. |
| **COB-02** | Célula do **pedido** e do **item**: editáveis via popover **select**. |
| **COB-03** | Tooltip **pedido**: `editavel_pedido` → `replica_itens` → `alerta_divergencia`. |
| **COB-04** | Tooltip **item**: `editavel_item` → `alerta_divergencia`. |
| **COB-05** | Popover do **pedido** exibe checkbox **«Aplicar a todos os itens deste pedido»** (visível; desmarcado por padrão). |
| **COB-06** | **Sem** checkbox: salva **somente** no pedido; itens permanecem com valor anterior. |
| **COB-07** | **Com** checkbox marcado: replica a opção escolhida em **todos** os itens do pedido. |
| **COB-08** | Select lista opções ativas de **`cadastros.cambio_siscomex`** (`tipo=cobertura_cambial`) — rótulo `codigo — nome`. |
| **COB-09** | Coberturas **divergentes** entre itens → alerta âmbar *Coberturas cambiais divergentes entre itens* no pedido. |
| **COB-10** | Edição em Massa (`cobertura_cambial_pedido`) replica para pedido e itens. |
| **COB-11** | Coluna **filtrável**; **sem** aviso amarelo de impacto cruzado. |
| **COB-12** | Persistência hub → lista (passo 301 EMT). |

**Código:** `pai_ghost_cobertura` · `useCambioSiscomexPedido` · `cobertura_cambial_divergente` · `GHOST_COBERTURA`.

**EMT:** passos 288–302 (ETAPA 49) · `validar-cobertura-cambial-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

---

## 8L. CONDIÇÃO DE PAGAMENTO DO PEDIDO/ITEM — SISCOMEX (`condicao_pagamento_siscomex`)

> Decisão de produto **2026-06-03** — coluna dual pedido/item; select Cadastros; checkbox replicar no pedido; alerta de divergência entre itens. Espelha Cobertura Cambial (§8K), com SSOT `modalidade_pagamento`.

| # | Regra |
|---|--------|
| **CPS-01** | Label na grade: **Condição de Pagamento do Pedido/Item — Siscomex** — tooltip: *Modalidade de Pagamento — Siscomex*. |
| **CPS-02** | Célula do **pedido** e do **item**: editáveis via popover **select**. |
| **CPS-03** | Tooltip **pedido**: `editavel_pedido` → `replica_itens` → `alerta_divergencia`. |
| **CPS-04** | Tooltip **item**: `editavel_item` → `alerta_divergencia`. |
| **CPS-05** | Popover do **pedido** exibe checkbox **«Aplicar a todos os itens deste pedido»** (visível; desmarcado por padrão). |
| **CPS-06** | **Sem** checkbox: salva **somente** no pedido; itens permanecem com valor anterior. |
| **CPS-07** | **Com** checkbox marcado: replica a modalidade escolhida em **todos** os itens do pedido. |
| **CPS-08** | Select lista opções ativas de **`cadastros.cambio_siscomex`** (`tipo=modalidade_pagamento`) — rótulo `codigo — nome` (ex.: `21 — Pagamento à vista total ou preponderante — outros`). |
| **CPS-09** | Modalidades **divergentes** entre itens → alerta âmbar *Modalidades Siscomex divergentes entre itens* no pedido (`condicao_pagamento_siscomex_divergente`). |
| **CPS-10** | Edição em Massa (`condicao_pagamento_siscomex_pedido` / `_item`) replica para pedido e itens quando nível pedido. |
| **CPS-11** | Coluna **filtrável**; **sem** aviso amarelo de impacto cruzado. |
| **CPS-12** | Persistência hub → lista (passo 316 EMT). |

**Código:** `condicao_pagamento_siscomex` · `useCambioSiscomexPedido` · `condicao_pagamento_siscomex_divergente` · `mapaPropagacaoPedidoItem`.

**EMT:** passos 303–317 (ETAPA 50) · `validar-condicao-pagamento-siscomex-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

---

## 8M. CONDIÇÃO DE PAGAMENTO DO PEDIDO/ITEM — COMERCIAL (`condicao_pagamento`)

> Decisão de produto **2026-06-03** — coluna dual pedido/item; **texto livre** (sem Cadastros); checkbox replicar no pedido; alerta de divergência entre itens; truncamento na grade com ícone olho quando > 50 caracteres.

| # | Regra |
|---|--------|
| **CPG-01** | Label na grade: **Condição de Pagamento do Pedido/Item — Comercial** — tooltip pedido: *Condição de Pagamento do Pedido — Comercial*; item: *Condição de Pagamento do Item — Comercial*. |
| **CPG-02** | Célula do **pedido** e do **item**: editáveis via popover **texto livre** (alfanumérico). |
| **CPG-03** | Tooltip **pedido**: `editavel_pedido` → `replica_itens` → `alerta_divergencia`. |
| **CPG-04** | Tooltip **item**: `editavel_item` → `alerta_divergencia`. |
| **CPG-05** | Popover do **pedido** exibe checkbox **«Aplicar a todos os itens deste pedido»** (visível; desmarcado por padrão). |
| **CPG-06** | **Sem** checkbox: salva **somente** no pedido; itens permanecem com valor anterior. |
| **CPG-07** | **Com** checkbox marcado: replica o texto em **todos** os itens do pedido. |
| **CPG-08** | Texto **> 50 caracteres** na grade: exibição truncada com reticências + ícone **olho**; hover/click revela texto completo. |
| **CPG-09** | Condições **divergentes** entre itens → alerta âmbar *Condições de pagamento divergentes entre itens* no pedido (`condicao_pagamento_divergente`). |
| **CPG-10** | Edição em Massa (`condicao_pagamento_pedido` / `condicao_pagamento_item`) replica para pedido e itens quando nível pedido. |
| **CPG-11** | Popover (pedido e item) exibe **aviso amarelo** *«A edição aqui irá alterar a Condição de Pagamento do Pedido/Item»* (`aviso_impacto_condicao_pagamento`). |
| **CPG-12** | Coluna **filtrável**; persistência hub → lista (passo 331 EMT). |

**Código:** `condicao_pagamento` · `condicao_pagamento_pedido` / `condicao_pagamento_item` · `condicao_pagamento_divergente` · `mapaPropagacaoPedidoItem` · `renderDescricaoTruncada`.

**EMT:** passos 318–332 (ETAPA 51) · `validar-condicao-pagamento-comercial-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

**Prefixos de valor no runner:** `CPG-EMT-SOLO-*` · `CPG-EMT-TODOS-*` · `CPG-EMT-ITEM-*` · `CPG-EMT-LONGO-*` (> 50 caracteres).

---

## 8N. MOEDA CÂMBIO (`moeda_cambio_pedido`)

> Decisão de produto **2026-06-08** — valor **único no Pedido**; itens **espelham** `_p.moeda_cambio_pedido` na UI (badge ISO, ex.: `EUR` na captura do dono); select Cadastros; **sem** checkbox replicar; alerta âmbar quando `moeda_pedido` ≠ `moeda_item` em algum item.

| # | Regra |
|---|--------|
| **MCB-01** | Label na grade: **Moeda Câmbio** — tooltip: *Moeda Câmbio*; coluna **filtrável** (ícone funil). |
| **MCB-02** | Campo existe só no model **Pedido** (`moeda_cambio_pedido`); itens exibem o mesmo código via contexto `_p`. |
| **MCB-03** | Célula exibe **badge** com sigla ISO (ex.: `EUR`, `USD`, `BRL`) — classe `gtv-celula-moeda`. |
| **MCB-04** | Tooltip **pedido**: `editavel_pedido` → `editavel_item` → `alerta_moeda_divergente`. |
| **MCB-05** | Tooltip **item**: `editavel_item`. |
| **MCB-06** | Linha **pedido** e **item** editáveis via popover **select** (opções ativas de **`cadastros.moeda`**). |
| **MCB-07** | Edição no **item** roteia PATCH para o **pedido**; após salvar, **pedido e todos os itens** exibem a **mesma** sigla (espelhamento). |
| **MCB-08** | Popover **sem** checkbox «Aplicar a todos os itens» — valor é sempre do pedido. |
| **MCB-09** | Popover exibe **aviso amarelo** *«Moeda de câmbio é exclusiva do pedido e não altera a moeda comercial dos itens»* (`aviso_impacto_moeda_cambio`). |
| **MCB-10** | Alterar Moeda Câmbio **não** modifica colunas **Moeda do Pedido/Item** (`moeda_pedido` / `moeda_item`). |
| **MCB-11** | Quando `moeda_pedido` ≠ `moeda_item` em algum item → alerta âmbar *Moedas divergentes entre itens* na célula do **pedido** (`moeda_cambio_divergente`); itens **sem** ícone na célula. |
| **MCB-12** | Edição em Massa (`moeda_cambio_pedido`) e persistência hub → lista (passo 346 EMT). |

**Código:** `moeda_cambio_pedido` · `calcularMoedaCambioDivergente` · `montarContextoPaiItem` · `classeMoedaBadge`.

**EMT:** passos 333–347 (ETAPA 52) · `validar-moeda-cambio-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

**Valores no runner:** siglas do Cadastros (ex.: `EUR` · `USD` · `BRL`) — critério = salvou + espelhamento visual em pedido e itens.

---

## 8O. DATA DE TRANSFERÊNCIA DE SALDO (`data_transferencia_saldo_pedido`)

> Decisão de produto **2026-06-08** — coluna dual pedido/item (`data_transferencia_saldo_pedido` → `data_transferencia_saldo_item`); **dupla origem**: alimentação **automática** ao transferir saldo **e** edição **manual** na lista; formato **DD/MM/AAAA** (ex.: `06/06/2026` na captura do dono).

| # | Regra |
|---|--------|
| **DTS-01** | Label na grade: **Data de Transferência de Saldo** — tooltip: *Data de Transferência de Saldo*; coluna **filtrável** e **ordenável**. |
| **DTS-02** | Célula do **pedido** e do **item**: editáveis via popover **data** (`tipo: periodo`). |
| **DTS-03** | Tooltip **pedido**: `editavel_pedido` → `replica_itens` → `atualiza_transferencia_saldo` → `alerta_divergencia`. |
| **DTS-04** | Tooltip **item**: `editavel_item` → `atualiza_transferencia_saldo` → `alerta_divergencia`. |
| **DTS-05** | Popover do **pedido** exibe checkbox **«Aplicar a todos os itens deste pedido»** (visível; desmarcado por padrão). |
| **DTS-06** | **Sem** checkbox: salva **somente** no pedido; itens permanecem com data anterior. |
| **DTS-07** | **Com** checkbox marcado: replica a data em **todos** os itens (`mapaPropagacaoPedidoItem`). |
| **DTS-08** | **Automático — Transferir:** ao confirmar split (`novo_pedido`, `pedido_existente`, `transfer_intercompany`, etc.), grava **data do dia** no **pedido de origem** (`data_transferencia_saldo_pedido`) e no **item de origem** (`data_transferencia_saldo_item`). |
| **DTS-09** | **Automático — exceções:** `reducao_simples` e `substituicao_pura` **não** alteram esta coluna (QTR-08 / `CENARIOS_SEM_DATA_TRANSFERENCIA_SALDO`). |
| **DTS-10** | Datas **divergentes** entre itens → alerta âmbar *Datas de transferência de saldo divergentes entre itens* no pedido (`data_transferencia_saldo_pedido_divergente`). |
| **DTS-11** | Edição em Massa (`data_transferencia_saldo_pedido`, tipo `data`) replica para pedido e itens quando nível pedido. |
| **DTS-12** | Pill `atualiza_transferencia_saldo` documenta a alimentação automática via menu **Transferir**. |
| **DTS-13** | **Sem** aviso amarelo de impacto cruzado no popover (diferente de Tipo Volume / Moeda). |
| **DTS-14** | Persistência hub → lista (passo 362 EMT). |

**Código:** `criarColunaDataReplicavel` · `TransferirService.dataTransferenciaSaldoParaCenario` · `PILLS_PEDIDO_DATA_TRANSFERENCIA_SALDO` · `fmtData`.

**EMT:** passos 348–363 (ETAPA 53) · `validar-data-transferencia-saldo-lista.ts` · plano `TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-000045`.

**Ordem runner:** passos 348–363 rodam **após** ETAPA 26 (Qtd. Transferida — Redução Simples, passo **134**), para validar alimentação automática pós-Transferir.

**Datas no runner (manual):** `15/01/2026` · `20/02/2026` · `25/03/2026` · `06/06/2026` (massa / captura dono).

---

## 8P. ANEXOS NA LISTA (`anexo_pedido`, `anexo_proforma`, `anexo_invoice`, `anexo_lpco`)

> Decisão de produto **2026-06-09** — colunas **não editáveis inline**; operador interage pelo **ícone de clipe** na célula. Cada linha (pedido **ou** item) possui anexos **individuais** (`vinculo` + `vinculo_id` da própria linha). Colunas customizadas `tipo === 'anexo'` seguem a mesma UX.

| # | Regra |
|---|--------|
| **ANX-01** | Chaves padrão: `anexo_pedido`, `anexo_proforma`, `anexo_invoice`, `anexo_lpco` — SSOT em `anexoColunaLista.ts`. |
| **ANX-02** | Célula exibe ícone de clipe; badge numérico quando há arquivos na **categoria** da coluna. |
| **ANX-03** | Contagem carregada no **mount** da célula (`anexosApi.listar`) — operador vê quantidade **sem** abrir o painel. |
| **ANX-04** | Clique abre painel flutuante (portal, 340px): listar, upload, download e exclusão por arquivo. |
| **ANX-05** | Linha **pedido**: `vinculo = pedido`, `vinculo_id = pedido.id`. Linha **item**: `vinculo = item`, `vinculo_id = item.id`. |
| **ANX-06** | Categoria do anexo = sufixo da chave (`pedido`, `proforma`, `invoice`, `lpco`) ou id da coluna customizada. |
| **ANX-07** | **Sem** edição inline de texto; **sem** alerta âmbar de divergência entre linhas. |
| **ANX-08** | Tooltip **pedido**: título `{Coluna} do Pedido` + pill `editavel_pedido` + descrição *«Clique no ícone…»* (`pedido.coluna_pai.{campo}_desc`). |
| **ANX-09** | Tooltip **item**: título `{Coluna} do Item` + pill `editavel_item` + mesma descrição orientativa. |
| **ANX-10** | Painel usa `BotaoGlobal` (Continuar anexando / Salvar); ícone vazio também abre seletor de arquivo. |

### Tooltips (framework §0)

| Nível | Pills | Descrição extra |
|-------|-------|-----------------|
| Pedido | `editavel_pedido` | `pedido.coluna_pai.anexo_*_desc` |
| Item | `editavel_item` | Idem |

**Código:** `anexoColunaLista.ts` · `renderCelulaAnexoLista.tsx` · `CelulaAnexosColuna.tsx` · `buildTooltipRegraLista.tsx` (`pai_anexo`).

**Doc técnico:** [`LISTA-EDITAR-SALVAR-TECNICO.md` §6](./LISTA-EDITAR-SALVAR-TECNICO.md#6-tooltips-de-coluna-na-lista) · [`ANEXOS-GERAR-PDF-TECNICO.md`](./ANEXOS-GERAR-PDF-TECNICO.md).

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
| 2026-06-03 | §8F revisada (VOL-01…12) + §8J TVL-01…12 — Tipo Volume + Qtd. Volumes; SSOT `cadastros.volume`; cruzamento 265/279; ETAPA 49 fundida na 48 |
| 2026-06-03 | §8K COB-01…12 — Cobertura Cambial; checkbox replicar + alerta divergência; EMT passos 288–302 |
| 2026-06-03 | §8L CPS-01…12 — Condição Pagamento Siscomex; SSOT `modalidade_pagamento`; EMT passos 303–317 |
| 2026-06-08 | §8M CPG-01…12 — Condição Pagamento Comercial; texto livre + checkbox; EMT passos 318–332 |
| 2026-06-08 | §8N MCB-01…12 — Moeda Câmbio; espelhamento pedido/itens + alerta moeda comercial divergente; EMT passos 333–347 |
| 2026-06-08 | §8O DTS-01…14 — Data Transferência Saldo; automático (Transferir) + manual; EMT passos 348–363 (após passo 134) |
| 2026-06-09 | §8P ANX-01…10 — Anexos na lista (ícone, vínculo por linha, tooltips dual, preload badge) |
