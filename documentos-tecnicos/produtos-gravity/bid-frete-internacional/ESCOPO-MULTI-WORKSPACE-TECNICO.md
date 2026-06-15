# Escopo Multi-Workspace — BID Frete Internacional

> **Produto:** BID Frete Internacional  
> **Versão:** 1.0  
> **Data:** Junho 2026  
> **Status:** Em produção (paridade com Pedido)

---

## Visão geral

Usuários com acesso a múltiplas filiais (workspaces) podem selecionar **uma ou várias** no menu lateral do produto — com opção **Selecionar tudo** / **Desmarcar tudo** — e ver cotações, insights, lista, kanban e dashboard agregados nesse escopo.

A preferência é **persistida no backend** (por `id_organizacao` + `id_usuario`) e replicada em `sessionStorage` como cache local.

---

## UI (menu lateral)

| Prop `TelaProdutoGlobal` | Valor |
|---|---|
| `modoWorkspace` | `'multiplo'` |
| `workspacesEscopoIds` | IDs selecionados (Zustand) |
| `onAlternarWorkspaceEscopo` | Toggle checkbox por workspace |
| `onDefinirEscopoWorkspaces` | Selecionar tudo / limpar |

Comportamento idêntico ao Pedido (`MenuLateralGlobal`).

---

## Persistência (SSOT)

| Camada | Onde | Contrato |
|---|---|---|
| Backend | `lista_painel_usuario_global` | Painel reservado `__meta_escopo_workspaces_v1__`, `config_json`: `{ "_v": 1, "ids_workspaces": string[] }` |
| API | `GET/PUT /api/v1/bid-frete-internacional/config/escopo-workspaces` | `{ ids_workspaces_escopo: string[] }` |
| Cliente (cache) | `sessionStorage` | `bid-frete-internacional:workspaces_escopo:{id_organizacao}` |

**Sem migration:** reutiliza tabela existente; painel meta é `visivel_lista_painel_usuario_global = false` e **excluído** do `GET /lista/paineis`.

---

## Hidratação (`useEscopoWorkspacesBidFreteInternacional`)

1. Backend (`obterEscopoWorkspaces`) ou fallback `sessionStorage` (chave por org).
2. Filtro: `ids.filter(id => idsDisponiveis.has(id))` — descarta IDs stale ou workspace inacessível.
3. Default: workspace ativo da sessão (`gravity_company_id`).

---

## Filtro nas APIs

Query `ids_workspaces` (CSV), mesma semântica do Pedido:

| Prioridade | Fonte |
|---|---|
| 1 | `?ids_workspaces=a,b,c` |
| 2 | `?id_workspace=` (legado) |
| 3 | Header `x-id-workspace` |
| 4 | Sem filtro → org inteira |

Rotas que consomem o filtro:

- `GET /cotacoes`
- `GET /bids-frete-internacional` (cotações aninhadas)
- `GET /dashboard/kpis`, `/insights`, `/insights-alertas`, `/insights-graficos`, `/insights-detalhe`, `/mapa-cotacoes`

Helper server: `server/src/shared/workspace-filtro-bid-frete-internacional.ts`

---

## Autorização — 3 camadas (paridade Pedido)

| Camada | Onde |
|---|---|
| 1 — UI | Menu lateral só lista workspaces de `/api/v1/me`; hidratação descarta IDs stale |
| 2 — Backend | `validarMultiWorkspaceBidFreteInternacional` via S2S `GET /api/v1/internal/usuarios/:id/workspaces-habilitados` — IDs não habilitados → **403** `WORKSPACE_NAO_AUTORIZADO` |
| 3 — Portão 3 | Header `x-id-workspace` permanece single; multi-seleção só via query `ids_workspaces` |

Arquivo: `server/src/shared/validar-multi-workspace-bid-frete-internacional.ts`

PUT `/config/escopo-workspaces` valida `ids_workspaces_escopo` na camada 2 antes de gravar.

---

## Workspaces desabilitados — dúvida frequente de usuários

Workspaces com `status_workspace != 'ATIVO'` **não aparecem** no menu lateral (fonte: `/api/v1/me` / Hub).

| Situação percebida | Explicação |
|---|---|
| "Sumiu a empresa X" | Workspace X foi **desabilitado** no Configurador — não é bug de dados |
| Escopo salvo incluía workspace inativo | Na hidratação, IDs inativos são **descartados** silenciosamente |
| Lista vazia com filtro antigo | Usuário pode ter só workspaces inativos no escopo salvo → reabrir menu e selecionar filiais ativas |

**Gabi:** orientar usuário a verificar Configurador → Workspaces → status ATIVO; não implica perda de cotações (dados permanecem no banco).

---

## "Minhas cotações sumiram / não carregam" — dúvida frequente de usuários

> **Regra de ouro (para Gabi e suporte):** a Lista **nunca** busca "todas as cotações" — toda busca envia o filtro `ids_workspaces` resolvido a partir do escopo da sessão. Lista vazia quase sempre significa **escopo/contexto diferente**, não perda de dados. Cotações não são apagadas automaticamente em nenhum fluxo.

### Por que a mesma conta pode ver resultados diferentes em duas janelas

O escopo de workspaces é cacheado em `sessionStorage` **por janela do navegador**. Uma janela anônima (ou um navegador novo) começa com cache vazio e re-hidrata o escopo do zero — podendo resolver para um workspace diferente do da outra janela. Os KPIs do topo (Total de Cotações, Valor Total, Propostas) são calculados sobre **a mesma lista filtrada**, por isso zeram juntos de forma consistente — o que reforça a percepção (errada) de "perdi tudo".

### Tabela de diagnóstico

| Situação percebida | Causa provável | Verificação |
|---|---|---|
| "Minhas cotações não carregam" / lista vazia + KPIs zerados | Escopo de workspaces não inclui o workspace dono das cotações | Abrir o seletor de workspaces no menu lateral e marcar a filial correta (ou **Selecionar tudo**) |
| "Em uma janela aparece, na outra não" (mesmo usuário) | Sessões com escopo diferente (cache por sessão) ou **ambientes diferentes** (produção vs QA = bancos distintos) | Conferir a URL das duas janelas; depois conferir o seletor de workspaces em cada uma |
| "Sistema perdeu minhas cotações depois que troquei de workspace no Hub" | Workspace ativo mudou → escopo default re-hidratou para o novo workspace | Marcar o workspace anterior no seletor de escopo |
| "Sumiu a empresa X" | Workspace desabilitado no Configurador (ver seção anterior) | Configurador → Workspaces → status ATIVO |
| Lista vazia logo após criar cotação | Cotação criada no workspace ativo, que não está no escopo selecionado | Incluir o workspace ativo no escopo |

### Roteiro de resposta da Gabi (ordem de verificação)

1. **Tranquilizar:** "Suas cotações não foram apagadas — a lista mostra apenas as filiais (workspaces) selecionadas no momento."
2. **Escopo:** pedir para abrir o seletor de workspaces no menu lateral do BID Frete e clicar em **Selecionar tudo**. Na grande maioria dos casos, isso resolve.
3. **Workspace ativo:** se persiste, conferir no Hub qual workspace está ativo e se é o mesmo onde as cotações foram criadas (a coluna **Workspace** da lista identifica o dono de cada cotação).
4. **Ambiente:** se o usuário compara duas janelas/links, conferir se ambas apontam para o mesmo ambiente (`usegravity.com.br`). Ambientes diferentes usam bancos diferentes.
5. **Workspace inativo:** verificar Configurador → Workspaces → status ATIVO (seção anterior).
6. Se nada acima resolver → abrir chamado para o suporte (não orientar o usuário a "recriar" cotações).

A mesma lógica vale para o produto **Pedido** ("sistema perdeu meus pedidos") — ver `documentos-tecnicos/produtos-gravity/pedido/FILTRO-MULTI-WORKSPACE-REGRAS-NEGOCIO.md`.

---

## Arquivos SSOT

| Arquivo | Papel |
|---|---|
| `shared/preferenciasEscopoWorkspacesBidFreteInternacional.ts` | Schema meta + nome painel reservado |
| `client/src/shared/useEscopoWorkspacesBidFreteInternacional.ts` | Zustand + sessionStorage |
| `server/src/routes/preferencia-escopo-workspaces-bid-frete-internacional.ts` | GET/PUT preferência |
| `server/src/shared/workspace-filtro-bid-frete-internacional.ts` | Query `ids_workspaces` → cláusula Prisma |
| `server/src/shared/validar-multi-workspace-bid-frete-internacional.ts` | S2S Configurador — camada 2 |
| `client/src/App.tsx` | Wiring `modoWorkspace="multiplo"` |
| `skills/produtos-gravity/bid-frete-internacional/SKILL.md` | Referência vertical |

---

## Referências

- Pedido (padrão): `documentos-tecnicos/produtos-gravity/pedido/FILTRO-MULTI-WORKSPACE-TECNICO.md`
- Painéis Lista (escopo **não** vai em `config_json` do painel): `PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md`
