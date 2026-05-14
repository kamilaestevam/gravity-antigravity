# Filtro Multi-Workspace — Documento Técnico

> **Produto:** Pedido (COMEX)
> **Versão:** 1.0
> **Data:** Maio 2026
> **Status:** ✅ Em produção (commit `4bafb1b6`)
> **Tracking:** Filtro multi-workspace na Lista, coluna "Workspace" sempre visível, popover com seleção interativa, defesa em 3 camadas

---

## Sumário

1. [Visão geral](#visão-geral)
2. [Stack](#stack)
3. [Arquivos modificados](#arquivos-modificados)
4. [Backend — endpoint S2S de habilitação](#backend--endpoint-s2s-de-habilitação)
5. [Backend — validação no produto Pedido](#backend--validação-no-produto-pedido)
6. [Frontend — coluna, popover e chip](#frontend--coluna-popover-e-chip)
7. [Estado e sincronização](#estado-e-sincronização)
8. [Autorização — 3 camadas](#autorização--3-camadas)
9. [Casos de borda](#casos-de-borda)
10. [Testes](#testes)
11. [Dívidas conhecidas](#dívidas-conhecidas)

---

## Visão geral

A Lista de Pedidos suporta filtro multi-workspace: o usuário pode selecionar 1 ou N workspaces da sua organização e ver pedidos+itens de todos juntos. A coluna "Workspace" mostra o dono de cada pedido. O filtro vive no popover do header da coluna (UX consistente com outros filtros enum).

**Caminho B (adotado):** o header `x-id-workspace` permanece single para não romper o Portão 3. O filtro multi-workspace é exposto via query param `?ids_workspaces=<csv>` que sobrepõe o header quando vem com ≥1 valor.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript strict, Vite |
| Backend produto | Express + TypeScript, Prisma (banco do Pedido) |
| Backend autorização | Configurador (Express + Prisma) |
| Comunicação inter-serviços | S2S com `x-chave-interna-servico` |
| Validação | Zod em todas as rotas |
| Erros | `AppError` — nunca `res.status().json()` direto |

---

## Arquivos modificados

### Backend

| Arquivo | Tipo | Mudança |
|---|---|---|
| `servicos-global/configurador/server/routes/workspaces-habilitados-internal.ts` | NOVO | Endpoint S2S |
| `servicos-global/configurador/server/__tests__/workspaces-habilitados-internal.test.ts` | NOVO | 6 testes funcionais |
| `servicos-global/configurador/server/index.ts` | mod | Registra router |
| `servicos-global/configurador/server/routes/hub-init.ts` | mod | Filtro `status_workspace='ATIVO'` em ambos branches |
| `servicos-global/produto/processos-core/src/routes/pedidos.ts` | mod | `parseCsvQueryParam` + `validarMultiWorkspace` |
| `packages/resolver-organizacao/src/configurador-client.ts` | mod | Método `obterWorkspacesHabilitadosDoUsuario` |
| `packages/resolver-organizacao/src/obter-workspaces-habilitados.ts` | NOVO | Helper público |
| `packages/resolver-organizacao/src/index.ts` | mod | Export do helper |

### Frontend (Pedido)

| Arquivo | Tipo | Mudança |
|---|---|---|
| `servicos-global/produto/pedido/client/src/pages/Pedidos.tsx` | mod | Estado, useEffects de sincronia, popover clicável a partir do chip, lista numerada no tooltip |
| `servicos-global/produto/pedido/client/src/shared/api.ts` | mod | `workspacesDisponiveisApi.listar()` + param `idsWorkspacesFiltro` |
| `servicos-global/produto/pedido/client/src/components/lista/ColunasPai.tsx` | mod | Coluna "Workspace" com `key='id_workspace'` |

### Tooling

| Arquivo | Tipo | Mudança |
|---|---|---|
| `scripts/auditar-workspaces-pedidos.mjs` | NOVO | Auditoria DB cross-banco |

---

## Backend — endpoint S2S de habilitação

### Especificação

```
GET /api/v1/internal/usuarios/:id_usuario/workspaces-habilitados?id_organizacao=X
Headers:
  x-chave-interna-servico: <CHAVE_INTERNA_SERVICO>

Response 200:
{
  "tipo_usuario": "SUPER_ADMIN" | "ADMIN" | "MASTER" | "PADRAO" | "FORNECEDOR",
  "workspaces_habilitados": ["cmo...", "cmo...", ...]
}

Erros:
  400 VALIDATION_ERROR         — id_organizacao ausente
  401 NO_INTERNAL_KEY          — sem header x-chave-interna-servico
  403 ORGANIZACAO_MISMATCH     — usuário não pertence à org (exceto FORNECEDOR cross-tenant)
  404 USUARIO_NAO_ENCONTRADO   — id_usuario inexistente
```

### Regras de cálculo (`workspaces_habilitados`)

| Tipo Usuário | Filtro Prisma |
|---|---|
| MASTER / SUPER_ADMIN / ADMIN | `Workspace { id_organizacao, status_workspace: 'ATIVO' }` |
| PADRAO / FORNECEDOR | `UsuarioWorkspace { id_usuario, id_organizacao, ativo_usuario_workspace: true, company: { status_workspace: 'ATIVO' } }` |

**Importante:** PADRAO/FORNECEDOR exigem **AND** entre `UsuarioWorkspace.ativo` e `Workspace.status_workspace='ATIVO'`. Workspace inativado mesmo com vínculo ativo → NÃO aparece. Mand. 04 não cobre PADRAO (que não tem bypass).

### Cross-tenant (FORNECEDOR)

Único tipo que pode ter `UsuarioWorkspace` em organização diferente da `Usuario.id_organizacao`. A validação de org-match (linha 82-91 do endpoint) só aplica para tipos não-FORNECEDOR. Útil para fornecedores externos cadastrados como usuário de uma org de plataforma e vinculados aos workspaces dos clientes que atendem.

### SSOT

Replica a regra de visibilidade do `/api/v1/hub/init` (linhas 66-117) para evitar drift. Se a regra mudar, mudar nos DOIS endpoints (TODO: extrair para `organizacaoService.workspacesAcessiveis(idUsuario, idOrganizacao, tipo_usuario)`).

---

## Backend — validação no produto Pedido

### Parser CSV defensivo (`parseCsvQueryParam`)

Express expõe `req.query[chave]` como `string | string[] | ParsedQs | undefined`. O parser aceita:

- `?ids_workspaces=a,b,c` → `['a', 'b', 'c']`
- `?ids_workspaces=a&ids_workspaces=b` → `['a', 'b']` (Express array)
- Ausente / vazio / só vírgulas → `undefined`

Aplica trim, dedup via `Set`, ignora vazios.

### Validação multi-workspace (`validarMultiWorkspace`)

```
async function validarMultiWorkspace(
  ctx: ContextoOrganizacao,
  idsSolicitados: string[],
): Promise<{ valido: true } | { valido: false; bloqueados: string[] }>
```

1. Chama `obterWorkspacesHabilitadosDoUsuario` via S2S
2. `habilitadosSet = new Set(workspacesHabilitados)`
3. `bloqueados = idsSolicitados.filter(id => !habilitadosSet.has(id))`
4. `bloqueados.length > 0` → `{ valido: false, bloqueados }`
5. Caso contrário → `{ valido: true }`

Cross-org coberto: workspace de outra org NÃO aparece em `habilitados` → cai automaticamente em `bloqueados`. **Não há código defensivo extra de cross-org** — a regra emerge da intersecção.

### Resposta 403 (Mand. 08 — falha ruidosa)

```json
{
  "error": {
    "code": "WORKSPACE_NAO_AUTORIZADO",
    "message": "N workspace(s) não autorizado(s) para este usuário",
    "workspaces_bloqueados": ["id1", "id2"]
  }
}
```

Cliente decide tratamento. O produto Pedido mantém pedidos antigos visíveis (`keepPreviousData`) e registra `setErroCarga(err.message)` — visível no empty state.

### Aplicação no WHERE Prisma

```ts
if (idsWorkspacesQuery && idsWorkspacesQuery.length > 0) {
  where.id_workspace = { in: idsWorkspacesQuery }
} else if (idWorkspace) {        // x-id-workspace header
  where.id_workspace = idWorkspace
}
```

Query param **sobrepõe** header. Header continua sendo validado pelo Portão 3 (workspace ativo do usuário no produto).

---

## Frontend — coluna, popover e chip

### Coluna "Workspace" (`ColunasPai.tsx`)

```ts
{
  key: 'id_workspace',          // DDD-puro
  label: 'Workspace',
  tipo: 'texto',                // promovido para 'enum' em detectarTipoColuna
  filtravel: true,
  sortavel: false,              // ordenação só por id (backend); ver dívida D8
  grupo: 'Identificação',
  render: (_, row) => {
    const id = (row as { id_workspace?: string }).id_workspace ?? ''
    const nome = workspacesMap?.get(id)?.nome ?? id
    return <span style={{ display: 'block', textAlign: 'left' }}>{nome}</span>
  },
}
```

**Posição:** imediatamente após "Tipo de Operação" (`_COLUNAS_PADRAO_SEQUENCIA[2]`). Migração para usuários com prefs antigas (workspace após `numero_pedido`) move automaticamente para a posição nova e persiste no backend (`pedidoConfigApi.salvarPreferenciaUsuarioColunaPedido`).

### Popover (filtro enum genérico)

Reusa o `FiltroPopoverColuna` existente. Mudanças:

1. **`Selecionar tudo` no topo** — checkbox com 3 estados (vazio / indeterminado / marcado). Texto alterna "Selecionar tudo" ↔ "Limpar seleção". Respeita busca atual (opera só sobre `valoresFiltrados`).

2. **`valoresUnicosPorCampo` special-case `id_workspace`** — em vez de derivar valores únicos da página atual, usa `workspacesDisponiveis` completo (já filtrado por tipo de usuário pelo `/hub/init`).

3. **`detectarTipoColuna`** — `id_workspace` cai em 'enum'.

### Chip de filtro ativo

Layout: `[Label]: [Valor] [×]`.

- **Body do chip clicável** — abre o mesmo popover do header da coluna, ancorado no chip (`onFiltroColuna(col.key, chipElement)`).
- **`×` separado** — limpa o filtro inteiro.
- **Tooltip `TooltipGlobal`** (padrão UX) com lista numerada dos selecionados:

```jsx
<TooltipGlobal titulo={col.label} descricao={
  <ol style={{...}}>
    {valores.map((v, i) => (
      <li key={v}>
        <span style={{ opacity: 0.55 }}>{i+1}.</span>
        <span>{v}</span>
      </li>
    ))}
  </ol>
}>
  <chipBody />
</TooltipGlobal>
```

### Híbrido de exibição (`rotulofiltro`)

| Valores | Exibição |
|---|---|
| 0 | `(nenhum)` |
| 1 | `Workspace: CDE` |
| 2 | `Workspace: CDE, ABC` |
| 3+ | `Workspace: N selecionados` |

Threshold em 2 segue padrão `tabela-global` (i18n `tabela.selecionado_singular/_plural`). Aplica-se a todos os filtros enum (workspace, status, incoterm, tipo_operacao).

---

## Estado e sincronização

### Fontes de verdade

| Estado | Tipo | Origem |
|---|---|---|
| `workspacesDisponiveis` | `WorkspaceDisponivel[]` | `/api/v1/hub/init` |
| `workspacesMap` | `Map<id, { nome, cnpj }>` | derivado de `workspacesDisponiveis` (useMemo) |
| `workspaceAtivo` | `string` | `sessionStorage.getItem('gravity_company_id')` |
| `filtrosAtivos['id_workspace']` | `{ tipo:'enum', valor:Set<nome> }` | controlado pelo popover |
| `workspacesSelecionados` | `string[]` | derivado de `filtrosAtivos` via useEffect |

### useEffects

#### 1. Inicialização (UMA vez, after mount + workspacesMap loaded)

```
Aguarda: workspacesMap.size > 0 && workspaceAtivo && filtrosAtivos['id_workspace'] undefined
Ação: setFiltrosAtivos({ id_workspace: { tipo:'enum', valor: Set([nome_do_ativo]) } })
Flag: initializedFilterRef = true (não roda mais)
```

Garante que o popover abre com o workspace ativo já marcado (UX consistente: o que está marcado = o que está sendo exibido).

#### 2. Sincronia `filtrosAtivos → workspacesSelecionados`

```
filtro presente, Set não vazio → converte nomes → ids via workspacesMap → setWorkspacesSelecionados([ids])
filtro presente, Set vazio     → setWorkspacesSelecionados([])
filtro undefined + init=true   → setWorkspacesSelecionados([])  (usuário limpou)
filtro undefined + init=false  → não toca (aguarda init no mount)
```

Comparação por conteúdo (`prev.every((v, i) => v === target[i])`) evita re-render desnecessário quando o resultado é idêntico ao anterior.

#### 3. Sincronia `workspacesSelecionados → fetch`

```
useEffect [workspacesSelecionados]:
  carregarInicial()
```

#### 4. Decisão de envio do query param (`carregarInicial`)

```ts
// Curto-circuito ANTES do carregandoRef guard:
if (workspacesSelecionados.length === 0) {
  setPedidos([])  // sem fetch
  setTotal(0)
  setTotalItensBanco(0)
  carregandoRef.current = false  // libera lock se estava preso
  return
}

if (carregandoRef.current) return
carregandoRef.current = true

const ehSelecaoDefault = workspacesSelecionados.length === 1
  && workspacesSelecionados[0] === workspaceAtivo
const idsWorkspacesFiltro = ehSelecaoDefault ? undefined : workspacesSelecionados

// fetch com ?ids_workspaces=<csv> se idsWorkspacesFiltro presente
```

**Por que o curto-circuito vem antes do guard:** se outro fetch está em vôo quando o usuário desmarca tudo, o guard bloquearia a nova chamada e a UI ficaria presa mostrando dados antigos. O curto-circuito é instantâneo (sem rede) e força o estado a refletir a UI imediatamente.

---

## Autorização — 3 camadas

```
┌─────────────────────────────────────────────────────────────────┐
│ Camada 1 — Frontend (UI)                                        │
│ /hub/init aplica regra de visibilidade no Configurador.         │
│ Popover só mostra workspaces que o usuário PODE ver.            │
│ Defesa contra confusão (usuário não tenta filtrar o impossível) │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Camada 2 — Backend Pedido (validarMultiWorkspace)               │
│ S2S → Configurador retorna lista habilitada.                    │
│ Ids fora da lista → 403 com workspaces_bloqueados[].            │
│ Defesa contra forjamento (mesmo se UI for tampered, falha aqui) │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ Camada 3 — Portão 3 (header x-id-workspace)                     │
│ verificarAcessoProduto valida acesso ao workspace ATIVO         │
│ (single, do header). NÃO toca query param.                      │
│ Defesa estrutural: produto Pedido habilitado no workspace base. │
└─────────────────────────────────────────────────────────────────┘
```

### Por que essas 3 camadas

| Ameaça | Camada que protege |
|---|---|
| Usuário sem ideia do que pode ver | 1 (popover não mostra inacessíveis) |
| Usuário malicioso forjando request | 2 (validação S2S no backend) |
| Bug que envia ids errados | 2 (validação S2S) |
| Produto Pedido não habilitado pro workspace ativo | 3 (Portão 3 nega antes da rota rodar) |
| Workspace inativado durante a sessão | 1 (próximo /hub/init não retorna) + 2 (validação rejeita) |

---

## Casos de borda

| Cenário | Comportamento |
|---|---|
| `workspacesMap` ainda carregando | Popover sem opções; init useEffect aguarda |
| `workspaceAtivo` vazio (sessionStorage ausente) | `workspacesSelecionados=[]`; sem fetch automático |
| Usuário desmarca o último workspace | `workspacesSelecionados=[]` → lista vazia (intencional, **sem fetch**) |
| Usuário re-marca após esvaziar | Refetch normal |
| Backend retorna 403 (workspace bloqueado) | `catch` em `carregarInicial` → `setErroCarga`; pedidos antigos persistem (`keepPreviousData`); erro acessível no empty state |
| Workspace ATIVO foi inativado entre fetches | Não aparece mais no popover; mas o header ainda envia o id antigo; backend pode 403 → usuário precisa trocar workspace ativo no Hub |
| PADRAO acessa workspace fora do membership | 403 explícito + `workspaces_bloqueados[]` |
| Pedido criado por edit/drawer | Continua usando workspace ATIVO via header — não afetado pelo filtro |
| Cross-org não-FORNECEDOR | 403 ORGANIZACAO_MISMATCH no S2S |
| FORNECEDOR cross-org | Permitido (exceção codificada no endpoint S2S) |

---

## Testes

### Funcionais (Configurador — endpoint S2S)

`servicos-global/configurador/server/__tests__/workspaces-habilitados-internal.test.ts` — 6 testes:

1. MASTER → todos workspaces ATIVO da org
2. PADRAO → apenas habilitados via `UsuarioWorkspace.ativo`
3. FORNECEDOR → idem PADRAO, ignora cross-tenant mismatch
4. Usuário inexistente → 404 `USUARIO_NAO_ENCONTRADO`
5. Sem header `x-chave-interna-servico` → 401
6. PADRAO com `id_organizacao` diferente → 403 `ORGANIZACAO_MISMATCH`

### Auditoria DB

`scripts/auditar-workspaces-pedidos.mjs` cruza:
- Banco do Configurador (`CONFIGURADOR_DATABASE_URL`) → `public.workspace`
- Banco do Pedido (`DATABASE_URL` em `produto/pedido/.env`) → `public.pedido` + `public.pedido_item`

Output: por organização, workspaces COM dados vs SEM dados + contagem total.

```bash
node scripts/auditar-workspaces-pedidos.mjs
# OU específica:
node scripts/auditar-workspaces-pedidos.mjs cmoarq22a000l1358c1p2qfqt
```

### E2E (não criado nesta entrega — pendente)

Sugestão de plano:
1. Login MASTER → abre Lista → workspace ativo marcado, chip visível
2. Marca workspace adicional → URL contém `?ids_workspaces=<csv>` → pedidos somados
3. Desmarca tudo → lista vazia, sem request adicional ao backend
4. Login PADRAO sem acesso a workspace X → workspace X não aparece no popover
5. Forge request com workspace X via DevTools → backend retorna 403

---

## Dívidas conhecidas

| ID | Item | Status |
|---|---|---|
| D7 | `GTColuna.label` / `opcoes[].label` (nucleo-global) → `rotulo` | 🟡 Aberta — refactor multi-arquivo, entrega dedicada |
| D8 | Coluna Workspace `sortavel:false` | 🟡 Aberta — exige JOIN ou cache client |
| D9 | Híbrido + chip clicável + tooltip numerado vivem só no Pedido | 🟡 Aberta — promover para `nucleo-global/tabela-virtual-global` |
| D10 | `workspacesDisponiveisApi` faz fetch dedicado | 🟡 Aberta — exige design decision (A/B/C/D, ver análise Líder Técnico) |
| D11 | SSOT da regra de visibilidade duplicada (`/hub/init` + S2S habilitados) | ✅ **Resolvida** — `organizacaoService.workspacesAcessiveis()` (2026-05-13) |
| D12 | Lógica de migração de coluna inline em Pedidos.tsx | ✅ **Resolvida** — `shared/migracaoColunas.ts` com 16 testes (2026-05-13) |
| D13 | Admin Panel `/admin/organizacoes` retorna preview de 5 workspaces sem lazy-load completo | 🟡 Aberta — delegada para outro agente |

---

## Referências cruzadas

- Regras de negócio: `FILTRO-MULTI-WORKSPACE-REGRAS-NEGOCIO.md` (este diretório)
- Skill do produto: `skills/produtos-gravity/pedido/SKILL.md`
- Skill de S2S: `skills/seguranca/autenticacao-s2s/SKILL.md`
- Skill de permissões: `skills/seguranca/permissoes/SKILL.md`
- SDK helper: `packages/resolver-organizacao/src/obter-workspaces-habilitados.ts`
- Commit: `4bafb1b6` — `feat(pedido/filtro-multi-workspace): coluna Workspace + filtro por seleção`
