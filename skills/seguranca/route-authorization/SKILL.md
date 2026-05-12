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
| `/workspace/*` (Configurador) | ✅ | ✅ | ✅ read-only | ❌ | ❌ |
| `/hub` | ✅ | ✅ | ✅ | ✅ filtrado | ✅ filtrado |
| `/store` | ✅ | ✅ | ✅ | ✅ sem comprar | ✅ sem comprar |
| `/core/*` | ✅ | ✅ | ✅ | ✅ filtrado | ✅ filtrado |
| `/produto/*` | ✅ se contratado | ✅ | ✅ | ⚠️ contratado + habilitado | ⚠️ contratado + habilitado |

### Decisões importantes
- **`/workspace/*` é bloco único** — Standard não entra em nenhuma sub-rota, nem `api-cockpit`, nem `taxas-moeda`. Decisão do dono 2026-05-12.
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
- `requireConfiguradorAccess` — leitura `/workspace/*` (MASTER+SAdmin+ADMIN)
- `requireConfiguradorMutation` — mutação `/workspace/*` (MASTER+SAdmin, ADMIN bloqueado)

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

## Histórico

- **2026-05-12** — Skill criada. Matriz travada em conjunto com dono. 7 arquivos backend hardened, 1 wrapper frontend criado, Store + Hub gateados.
- **Bug raiz**: Standard acessava Configurador via card "Criar novo workspace" no Hub porque `ProtectedRoute` genérico só checava `isSignedIn`. Líder Técnico identificou que múltiplas rotas mutativas backend também estavam sem guard — bypass via `curl` era possível.
