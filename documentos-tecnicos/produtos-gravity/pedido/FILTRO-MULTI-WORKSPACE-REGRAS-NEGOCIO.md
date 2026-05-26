# Filtro Multi-Workspace — Regras de Negócio

> **Produto:** Pedido (COMEX)
> **Versão:** 1.1
> **Data:** Maio 2026
> **Status:** ✅ Em produção — v1.0 commit `4bafb1b6`; v1.1 escopo por org PR #80

---

## Por que existe

Usuários MASTER, SUPER_ADMIN e ADMIN de uma organização frequentemente operam **múltiplas filiais (workspaces)** simultaneamente — ex: importadora que opera CDE, ABC e FGH como CNPJs separados mas compartilha COMEX/contabilidade. Antes desta entrega, a Lista de Pedidos só mostrava o workspace **ativo** (selecionado no Hub), forçando troca de workspace para ver pedidos de outra filial.

A entrega traz:
1. Coluna **Workspace** sempre visível na Lista (identifica o dono de cada pedido).
2. **Filtro multi-seleção** no header da coluna (popover com checkbox por workspace).
3. **Defesa de autorização** em 3 camadas (UI + backend + Portão 3).

---

## Visibilidade — quem vê o quê

### Lista de workspaces no popover de filtro

A lista é alimentada pelo endpoint `/api/v1/hub/init` do Configurador, que **filtra workspaces INATIVOS** e cruza com permissões do tipo de usuário.

| Tipo do usuário | Workspaces que aparecem no popover |
|---|---|
| `SUPER_ADMIN` | Todos os workspaces **ATIVO** da organização |
| `ADMIN` | Todos os workspaces **ATIVO** da organização |
| `MASTER` | Todos os workspaces **ATIVO** da organização |
| `PADRAO` | Apenas workspaces **ATIVO** onde existe `UsuarioWorkspace.ativo = true` |
| `FORNECEDOR` | Apenas workspaces **ATIVO** onde existe `UsuarioWorkspace.ativo = true` (pode ser cross-organização — fornecedor de plataforma vinculado a clientes) |

**Regra crítica para PADRAO/FORNECEDOR:** AND entre `UsuarioWorkspace.ativo_usuario_workspace = true` **E** `Workspace.status_workspace = 'ATIVO'`. Se o workspace for inativado pelo Master, o usuário PADRAO/FORNECEDOR deixa de vê-lo no popover automaticamente.

### Workspaces vazios

Workspaces sem pedidos aparecem normalmente no popover (o filtro não esconde "vazios"). Se o usuário marcar apenas workspaces vazios, a Lista exibe Empty State.

---

## Comportamento da Lista

### Coluna "Workspace"

- **Posição:** após "Tipo de Operação" (3ª coluna, parte do grupo "Identificação").
- **Sempre visível** — mesmo para usuários com preferências de coluna antigas (migração automática persiste a posição correta no backend).
- **Conteúdo:** nome do workspace dono do pedido (`Workspace.nome_workspace`).
- **Ordenação:** desabilitada nesta versão (ver dívida D8 no doc técnico).

### Estado inicial ao abrir a Lista

1. Workspace ATIVO (Hub) é automaticamente marcado no filtro.
2. Chip "Workspace: \<nome\>" aparece na toolbar.
3. Lista mostra pedidos do workspace ATIVO (via header `x-id-workspace`).

### Ações do usuário

| Ação | Resultado |
|---|---|
| **Marcar workspace adicional** | Backend retorna pedidos dos workspaces marcados (soma). |
| **Desmarcar workspace** | Backend re-retorna apenas os workspaces restantes. |
| **"Selecionar tudo"** no popover | Marca todos os workspaces visíveis (respeitando busca atual se houver). |
| **"Limpar seleção"** (mesmo botão quando tudo está marcado) | Desmarca todos. **Lista fica vazia** (sem fetch). |
| **`× Limpar filtro`** no popover footer | Mesmo efeito de desmarcar tudo. Lista vazia. |
| **`×` no chip da toolbar** | Mesmo efeito. Lista vazia. |
| **"Limpar tudo"** na toolbar | Limpa todos os filtros (busca + colunas). Workspace também volta a vazio. |
| **Clicar no corpo do chip** | Reabre o popover ancorado no chip — usuário vê os marcados, pode desmarcar individualmente. |
| **Re-marcar qualquer workspace** após esvaziar | Refetch normal. |

### Empty selection (regra explícita)

**Desmarcar tudo deixa a Lista vazia.** Não há fallback automático para o workspace ATIVO — é uma escolha consciente do usuário ("não quero ver nada agora"). Diferente da inicialização (1º mount), onde o workspace ATIVO é pré-marcado para evitar abertura confusa.

### Chip de filtro ativo

Aparece SEMPRE que há ao menos 1 workspace marcado. Texto híbrido:

| Quantidade | Exibição do chip |
|---|---|
| 1 | `Workspace: CDE EXPORTADOR` |
| 2 | `Workspace: CDE EXPORTADOR, ABC` |
| 3+ | `Workspace: 6 selecionados` |

**Tooltip do chip (hover):** lista numerada de TODOS os selecionados (`1. CDE EXPORTADOR / 2. ABC / 3. HIJ IMPORTADOR / ...`). Padrão `TooltipGlobal` do design system.

---

## Autorização — defesa em 3 camadas

### Camada 1 — UI (visibilidade)

Popover só mostra workspaces que o usuário pode acessar (regra de visibilidade acima). Evita que o usuário tente filtrar por algo impossível.

### Camada 2 — Backend (validarMultiWorkspace)

Para cada request com `?ids_workspaces=<csv>`, o backend do Pedido valida via S2S contra o Configurador:

- Se algum id solicitado NÃO está na lista de workspaces habilitados do usuário → **403 com lista de bloqueados explícita** (Mand. 08 — falha ruidosa, sem fallback silencioso).
- Cross-organização (não-FORNECEDOR) → automaticamente bloqueado (workspace fora da org não aparece na lista de habilitados).

Mesmo se o frontend for adulterado (DevTools, request custom), a Camada 2 garante a integridade.

### Camada 3 — Portão 3 (header)

O middleware `verificarAcessoProduto` continua validando o workspace ATIVO no header `x-id-workspace`. Garante que o usuário tem o produto Pedido habilitado para o workspace base. **Não foi alterado** nesta entrega.

---

## Workspaces inativos

### Comportamento esperado

- **INATIVO no `/hub/init`:** NÃO aparece no popover de nenhum tipo de usuário (filtro `status_workspace='ATIVO'` aplicado em ambos os branches do endpoint).
- **INATIVO no backend de validação:** se o usuário tentar forjar request com workspace inativado, a S2S retorna 403 (workspace não está em `workspaces_habilitados`).
- **Pedidos antigos de workspace agora INATIVO:** continuam no banco. Só não são exibidos via filtro normal. Para auditoria, usar o script `auditar-workspaces-pedidos.mjs`.

### Workspace ATIVO foi inativado durante a sessão

- O usuário verá menos opções no popover no próximo `/hub/init`.
- Se o header `x-id-workspace` ainda apontar para o workspace inativado, o backend pode retornar 403 — o usuário precisará trocar de workspace no Hub.
- Comportamento aceitável (caso raro, normalmente o Master notifica antes).

---

## Criação/edição de pedidos sob filtro multi

### Criar novo pedido

O botão "Novo Pedido" continua criando no workspace ATIVO (via header). **Não é afetado pelo filtro multi-workspace.** Após criar, o pedido aparece na Lista se o workspace ATIVO estiver entre os marcados.

### Editar pedido inline

Edição inline (célula, dropdown) e edição via drawer também usam o workspace ATIVO. Pedidos de OUTROS workspaces ainda são editáveis (a Lista mostra todos os marcados), mas a request de update vai com o `x-id-workspace` = ativo. O backend valida a posse pelo `id_workspace` do registro (já filtrado por organização).

### Edição em massa, transferência, consolidação

Ações em lote continuam considerando os pedidos selecionados, **independente do filtro de workspace na Lista**. O backend valida cada pedido individualmente via `id_organizacao`. Workspace é parte da identidade do pedido, não restringe ações em si.

---

## Tabelas de exemplo (baseado em dados reais)

### Cenário: org `cmoarq22a000l1358c1p2qfqt`

Auditoria mostra 14 workspaces (11 ATIVO + 3 INATIVO). Apenas 1 (`CDE EXPORTADOR`) tem pedidos no banco.

| Filtro selecionado | Resultado |
|---|---|
| Só CDE EXPORTADOR (default ao abrir) | 108 pedidos / 579 itens |
| Só ABC (sem dados) | 0 pedidos (lista vazia) |
| CDE + ABC | 108 pedidos (CDE contribui) |
| Todos os ATIVO (11) | 108 pedidos |
| Tudo desmarcado | 0 pedidos |
| Tentar marcar workspace INATIVO | Não aparece no popover |

---

## Limitações conhecidas (esta versão)

1. **Sem ordenação por nome de workspace** — coluna `sortavel:false`. Ordenação requer JOIN com tabela `Workspace` ou cache cliente (dívida D8).
2. **Sem agrupamento visual** — pedidos de workspaces diferentes aparecem misturados, identificados pela coluna "Workspace". Não há separadores visuais entre grupos.
3. **Total de pedidos no header da Lista** soma todos os workspaces marcados. Não há quebra por workspace.

---

## Cache local do escopo (menu lateral + Hub)

O escopo multi-workspace do menu lateral Pedido persiste em:

1. **Backend** — `preferencia_usuario_coluna_pedido` (por `id_organizacao` + `id_usuario`).
2. **`sessionStorage`** — chave **`pedido:workspaces_escopo:{id_organizacao}`** (PR #80).

### Regra de negócio — mesmo browser, org diferente

| Situação | Comportamento esperado |
|---|---|
| Usuário operou org A e depois entra na org B (signup ou troca) | Escopo da org A **não** deve aparecer no modal do Hub nem afetar listagens da org B |
| Chave legado `pedido:workspaces_escopo` ainda no browser | Pode ser lida uma vez como fallback, mas IDs são **filtrados** contra workspaces da org B |
| Modal "Filtro de workspaces no Pedido" no Hub | Exibe **nomes** (`nome_workspace`), nunca CUID como label |

**Importante:** isso corrige **metadado local enganoso** — não implica acesso a dados de outra organização (isolamento por schema/banco permanece).

---

## Referências

- Documento técnico: `FILTRO-MULTI-WORKSPACE-TECNICO.md` (este diretório)
- Skill do produto: `skills/produtos-gravity/pedido/SKILL.md` — seção "Filtro Multi-Workspace"
- Skill de S2S: `skills/seguranca/autenticacao-s2s/SKILL.md` — endpoint workspaces-habilitados
- Skill de permissões: `skills/seguranca/permissoes/SKILL.md` — regra de visibilidade workspace
- Auditoria DB: `scripts/auditar-workspaces-pedidos.mjs`
