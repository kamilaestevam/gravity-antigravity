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

Demais colunas propagáveis seguem [`REPLICAR-PAI-EM-ITENS-TECNICO.md`](./REPLICAR-PAI-EM-ITENS-TECNICO.md) (Incoterm, datas, referências, etc.).

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

## 6. Resumo comparativo

| Aspecto | Workspace | TIPO DE OPERAÇÃO | STATUS | Importador | Incoterm (referência) |
|---------|-----------|------------------|--------|------------|------------------------|
| Edição no pedido | ✅ | ✅ | ✅ | ✅ (IMP: via workspace) | ✅ |
| Edição no item | ❌ travado | ❌ travado | ✅ | ❌ travado | ✅ |
| Checkbox replicar no pedido | ❌ ausente | ❌ ausente | ✅ presente | ❌ ausente | ✅ presente |
| Replicação sem checkbox | ✅ sempre | ✅ sempre | ❌ não replica | — | ❌ não replica |
| Alerta âmbar se diverge | ❌ | ❌ | ✅ | ❌ | ✅ |
| Opções do select (pedido) | Workspaces habilitados | Importação / Exportação | Status nativos + custom | IMP: workspaces | Incoterms cadastros |

---

## 7. Histórico

| Data | Evento |
|------|--------|
| 2026-05-13 | Checkbox «Aplicar a todos os itens» — entrega genérica ([`REPLICAR-PAI-EM-ITENS-TECNICO.md`](./REPLICAR-PAI-EM-ITENS-TECNICO.md)) |
| 2026-06 | TIPO DE OPERAÇÃO — regras TOP-01…05; EMT aprovado (PR #199, runner #201) |
| 2026-06-03 | STATUS — regras 00–04; fix alerta sem expandir (`status_itens_snapshot`); TDZ `statusOpts`/`pedidos` |
| 2026-06-03 | WORKSPACE — WS-01…06; sem alerta; select com todos workspaces habilitados |
| 2026-06-03 | IMPORTADOR — IMP-01…04 / EXP-01…06; modal seletor na exportação; IMP espelhado com workspace |
