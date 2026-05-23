# Skill — Route Authorization (Cadeia 1)

> **SSOT da autorização de ROTA por `tipo_usuario` no Gravity.**
> Aprovada por Coordenador + Líder Técnico em 2026-05-12.
> Decisões travadas com o dono em 2026-05-12.

---

## Escopo

Esta skill define **quem pode abrir cada ÁREA do app** — granularidade de bloco (área), não sub-rota ou ação.

Granularidade fina (ação/campo dentro da tela) é responsabilidade da **Cadeia 2** — ver skill `seguranca/permissoes/SKILL.md`.

---

## As 2 Cadeias de Autorização do Gravity

| | Cadeia 1 (esta skill) | Cadeia 2 (`permissoes/`) |
|---|---|---|
| **Pergunta** | "Pode abrir a tela X?" | "Pode fazer ação Y na tela?" |
| **Granularidade** | Tela inteira | Seção/ação |
| **Configurável por usuário?** | ❌ não (é por TIPO) | ✅ sim (Master configura) |
| **Onde mora** | `route-policy.ts` (matriz hardcoded) | Banco `UsuarioPermissao` + modal |

---

## Matriz Cadeia 1 (TRAVADA)

| Área | MASTER | SAdmin | ADMIN | PADRAO | FORNECEDOR |
|---|---|---|---|---|---|
| `/admin/*` | ❌ | ✅ | ✅ | ❌ | ❌ |
| `/configurador/*` (Configurador) | ✅ | ✅ | ✅ read-only | ❌ | ❌ |
| `/hub` | ✅ | ✅ | ✅ | ✅ filtrado | ✅ filtrado |
| `/store` | ✅ | ✅ | ✅ | ✅ sem comprar | ✅ sem comprar |
| `/core/*` | ✅ | ✅ | ✅ | ✅ filtrado | ✅ filtrado |
| `/produto/*` | ✅ se contratado | ✅ | ✅ | ⚠️ contratado + habilitado | ⚠️ contratado + habilitado |

### Decisões importantes
- **`/configurador/*` é bloco único** — Standard não entra em nenhuma sub-rota, nem `api-cockpit`, nem `taxas-moeda`. Decisão do dono 2026-05-12.
- **ADMIN entra mas é read-only** — backend bloqueia mutações via `requireConfiguradorMutation`.
- **`/store` "Comprar" SEMPRE bloqueado** para PADRAO/FORNECEDOR — Fornecedor é potencial cliente (vê valor, não adquire).
- **`/hub` "Criar novo workspace"** — escondido para PADRAO/FORNECEDOR; renderiza só se `podeMutarConfigurador()`.
- **REGRA 4 (Limbo) preservada** — Master/SuperAdmin nunca são bloqueados, mesmo sem workspace.

---

## Arquivos canônicos (3 camadas)

### 1. Frontend — Matriz declarativa
`servicos-global/configurador/src/routing/route-policy.ts`
- `MATRIZ_ACESSO_AREA` — fonte única
- `podeAcessarArea(tipoUsuario, area)` — query da matriz
- `podeMutarConfigurador(tipoUsuario)` — Master/SAdmin only
- `podeComprarNoStore(tipoUsuario)` — Master/SAdmin/Admin

### 2. Frontend — Wrappers de rota
`servicos-global/configurador/src/routing/guards.tsx`
- `<AuthorizedRoute area={...}>` — wrapper parametrizado
- `<ConfiguradorRoute>` — atalho para `area="configurador"`

### 3. Backend — Middlewares
`servicos-global/configurador/server/middleware/requireConfiguradorAccess.ts`
- `requireConfiguradorAccess` — leitura `/configurador/*` (MASTER+SAdmin+ADMIN)
- `requireConfiguradorMutation` — mutação `/configurador/*` (MASTER+SAdmin, ADMIN bloqueado)

### Já existentes (mantidos)
- `requireGravityAdmin` — `/admin/*`
- `requireMasterRole` — só MASTER (casos específicos)
- `requireUserManagementRole` — gestão de usuários (MASTER+SAdmin)
- `requirePermissao` — Cadeia 2

---

## Como adicionar nova rota (procedimento)

**3 passos sempre — defesa em profundidade obrigatória:**

1. **Decidir a área** — qual entrada da matriz se encaixa? Se nenhuma, abrir discussão com Coord antes de criar nova área.
2. **Frontend** — adicionar a rota no `App.tsx` envolvida pelo wrapper certo (`<AuthorizedRoute area="...">` ou atalho).
3. **Backend** — toda rota mutativa (`POST/PATCH/PUT/DELETE`) recebe middleware:
   - Configurador → `requireConfiguradorMutation`
   - Admin Gravity → `requireGravityAdmin`
   - Self do usuário → `requireAuth` apenas (com checagem manual de propriedade)

**Deny-by-default.** Rota não registrada em nenhuma área é negada.

---

## Mandamentos aplicados

- **01** (Clerk só auth) — `tipo_usuario` vem de `/api/v1/me` (banco), nunca de Clerk metadata
- **04** (Limbo) — Master/SAdmin nunca bloqueados pela matriz
- **06** (Zod) — `useCarregarTipoUsuario` valida payload de `/me` com Zod
- **08** (fail-closed) — `pronto && !tipoUsuario` → `Navigate /hub` (não permite)
- **09** (Zod bilateral) — `meContextoMinimoSchema` espelha contrato do backend

---

## Defesa em profundidade

| Camada | Quem aplica | Falha aqui = |
|---|---|---|
| **UI gating** | `podeMutarConfigurador()` esconde botão | usuário não vê opção, mas pode digitar URL |
| **Rota frontend** | `<AuthorizedRoute>` redireciona | usuário não abre tela, mas pode chamar API direto |
| **Middleware backend** | `requireConfiguradorMutation` | API retorna 403 — gate final |
| **RLS banco** (futuro) | políticas Postgres | última linha — protege contra bug de middleware |

Sem as 3 primeiras camadas em sincronia, `curl` burla. **Backend é mandatório.**

---

---

## 🚪 Portão 3 — Acesso granular usuário × produto Gravity

Modelo de 3 portões para acesso a produto (decisão dono 2026-05-12):

| Portão | Pergunta | Onde |
|---|---|---|
| **1** | Org contratou o produto? | `ProdutoGravityConfiguracao.ativo` + `ProdutoGravityAssinatura.status IN [ATIVA, EM_TESTE]` |
| **2** | Workspace habilitou o produto? | `ProdutoGravityWorkspace.ativo_produto_gravity_workspace = true` |
| **3** | Usuário pode abrir esse produto neste workspace? | Linha `<slug>:acesso_usuario_produtos_gravity:permitido` em `UsuarioPermissao` |

### Convenção da chave Portão 3

String canônica em `UsuarioPermissao.permissao_usuario`:

```
<slug_produto>:acesso_usuario_produtos_gravity:permitido
```

Exemplo: `pedido:acesso_usuario_produtos_gravity:permitido`

**Helpers em `shared/permissoes-canonicas.ts`:**
- `buildAcessoUsuarioProdutosGravityString(slug)` → constrói a chave
- `ehPermissaoAcessoUsuarioProdutoGravity(str)` → detecta família
- `extrairSlugDaPermissao(str)` → extrai slug (granular ou Portão 3)

### Implementação (5 camadas)

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| **Constantes** | `shared/permissoes-canonicas.ts` | `SECAO_ACESSO_PRODUTO`, `ACAO_ACESSO_PERMITIDO`, regex aceita 2 famílias |
| **Service Configurador** | `server/services/permissao-usuario-servico.ts` | `verificarAcessoUsuarioProdutoGravity(org, user, ws, slug)` |
| **Service SSOT Hub+Core** | `server/services/produtos-acessiveis-service.ts` | `listarSlugsProdutosAcessiveis(org, user, ws?)` — aplica os 3 portões |
| **S2S endpoint** | `server/routes/acesso.ts` `/internal/acesso-produto/verificar` | Permite produtos consultarem Portão 3 via HTTP |
| **Middleware shared** | `@gravity/resolver-organizacao` `verificarAcessoProduto()` | Factory para produtos; lê `x-id-workspace` do header e chama S2S |
| **Modal admin** | `src/pages/configurador/ModalEditarUsuario.tsx` (aba "Produtos") | Master configura quais produtos cada Standard pode acessar |

### Default α (rapa-tapete)

Standards/Fornecedores **existentes** recebem chave Portão 3 para todos os produtos habilitados nos workspaces deles via script de backfill:

```bash
npx tsx server/scripts/backfill-acesso-usuario-produtos-gravity.ts          # dry-run
npx tsx server/scripts/backfill-acesso-usuario-produtos-gravity.ts --apply  # aplica
```

Idempotente. Ator: `SISTEMA_BACKFILL_PORTAO_3_2026_05_12`.
Reversível: `DELETE FROM usuario_permissao WHERE permissao_usuario_concedido_por = 'SISTEMA_BACKFILL_PORTAO_3_2026_05_12'`.

### Aplicação em produtos

**Padrão (produtos que usam `resolverOrganizacao`):**

```ts
import { resolverOrganizacao, verificarAcessoProduto } from '@gravity/resolver-organizacao'

app.use(resolverOrganizacao({ chaveProduto: 'pedido', ... }))
app.use(verificarAcessoProduto({ chaveProduto: 'pedido',
  configuradorBaseUrl: process.env.CONFIGURATOR_URL!,
  chaveInterna: process.env.CHAVE_INTERNA_SERVICO!,
}))
```

**Estado atual dos 7 produtos:**

| Produto | Auth atual | Portão 3 aplicado? |
|---|---|---|
| Pedido | `resolverOrganizacao` (JWT do browser) | ✅ Aplicado em 2026-05-12 (piloto) |
| BID-Frete | `requireInternalKey` (S2S) | ⏳ Pendente — exige primeiro migrar pra `resolverOrganizacao` |
| BID-Câmbio | `requireInternalKey` (S2S) | ⏳ idem |
| LPCO | `requireInternalKey` (S2S) | ⏳ idem |
| NF-Importação | `requireInternalKey` (S2S) | ⏳ idem |
| SimulaCusto | `requireInternalKey` (S2S) | ⏳ idem |
| Processo | `requireInternalKey` (S2S) | ⏳ idem |

**Mitigação para os 6 pendentes:** o Hub (`/hub/init`) e o Core (`/workspaces/:id/produtos-gravity`) já filtram via `produtos-acessiveis-service` — Standards sem acesso não veem o produto no menu/Hub. URL direta para esses 6 produtos atualmente passa o `requireInternalKey` mas não tem gate de Portão 3 (risco baixo em dev; precisa migração arquitetural para fechar).

### Mandamentos atendidos

- **01** — `tipo_usuario` do banco (não Clerk metadata)
- **04** — Master/SuperAdmin/Admin bypass em todos os portões (service-side)
- **06** — Zod no request S2S
- **08** — fail-closed: erro de comunicação → 503 (não fallback "permitido")
- **09** — Zod bilateral no request/response S2S

---

## Histórico

- **2026-05-12 (manhã)** — Skill criada. Matriz Cadeia 1 travada. Hub + Configurador route guard. Store botão Comprar bloqueado.
- **2026-05-12 (tarde)** — Portão 3 implementado em 5 checkpoints (CP1 fundação backend, CP2 Hub/Core filtros, CP3 aba Produtos no modal, CP4 backfill α, CP5 middleware piloto Pedido + skill).
- **2026-05-12 (noite)** — Convite admin cross-org (P0) + Lazy Disambiguation no requireAuth (P1).
- **Bug raiz**: Standard acessava Configurador via card "Criar novo workspace" no Hub porque `ProtectedRoute` genérico só checava `isSignedIn`. Líder Técnico identificou que múltiplas rotas mutativas backend também estavam sem guard — bypass via `curl` era possível.

---

## 🚪 Plan B v6 — Lazy Disambiguation no requireAuth (2026-05-12)

### Problema

`UserJSON` do Clerk v5 **não contém `invitation_id`** no payload de `user.created` webhook. A transição `pending_inv_*` → `user_*` acontece no primeiro login via fallback por email em `requireAuth.ts`.

Quando o mesmo email tem **>1 pending** em organizações diferentes (cross-org), o fallback antes da entrega bloqueava silenciosamente com 401 — **DoS de login** para o convidado.

### Solução

`server/middleware/requireAuth.ts:124-187` — quando `candidates.length > 1`:

1. Log alto: `[requireAuth] EMAIL_FALLBACK_AMBIGUO` (Mand. 08 — sem silêncio)
2. Consulta `clerkClient.invitations.getInvitationList({ status: 'accepted', limit: 100 })`
3. Filtra por email, ordena por `createdAt` DESC
4. Encontra o primeiro candidato cujo `id_clerk_usuario === 'pending_' + inv.id`
5. UPDATE deterministico → segue fluxo normal
6. Se não resolver: 401 explícito com log de erro

### Características

| Aspecto | Valor |
|---|---|
| Pay-for-use | API Clerk extra **apenas** em ambiguidade |
| Determinismo | `invitation.id` é único globalmente |
| Idempotência | UPDATE só ocorre se acha match |
| Fail-loud | Log alto + 401 se não conseguir desambiguar (Mand. 08) |
| Mand. 01 | Sem `publicMetadata` Clerk — só consulta lista de invitations |

### Cenários cobertos

| # | Cenário | Comportamento |
|---|---|---|
| 1 | 1 candidato | Caminho rápido — UPDATE direto (99% dos casos) |
| 2 | >1 candidatos, invitation aceita encontrada | Desambigua via Clerk + UPDATE |
| 3 | >1 candidatos, nenhuma invitation aceita bate | 401 + log de erro `FALHA_DESAMBIGUAR_VIA_CLERK` |
| 4 | Clerk API falhou | 401 + log `CLERK_INVITATIONS_API_FALHOU` |
| 5 | 0 candidatos | 401 padrão `Usuário não encontrado no sistema` |

### Documento técnico

`documentos-tecnicos/arquitetura/convite-admin-cross-org.md` (seção Plan B v6).
