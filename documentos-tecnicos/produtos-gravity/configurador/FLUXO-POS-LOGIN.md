# Configurador — Fluxo Pós-Login

> Documentação técnica do skip automático `/hub → /core` e do escape hatch `?select=1`.
> Skill associada: [`antigravity-configurador`](../../../skills/produtos-gravity/configurador/SKILL.md).

---

## Visão Geral

Após autenticar com sucesso no Clerk, o usuário cai em `/hub` (rota canônica DDD).

A tela `<SelecionarWorkspace />` decide se mantém o usuário ali (mostrando os workspaces da organização) ou redireciona automaticamente para `/core` (workspace de trabalho) com base em 4 condições.

---

## Regra canônica

| Cenário | Destino |
|---|---|
| Usuário **com** `id_workspace_preferido_usuario` salvo + outras 3 condições verdadeiras | Redirect automático para `/core` (skip dispara) |
| Usuário **sem** preferência salva | Permanece em `/hub` (mostra `<SelecionarWorkspace />`) |
| Usuário **com** `?select=1` na URL | Permanece em `/hub` (escape hatch — força a tela de seleção mesmo com preferência) |
| Usuário com `tipo_usuario = FORNECEDOR` | **Sempre** permanece em `/hub` (cross-organização exige escolha explícita) |
| Tenant com **0 produtos ativos** | Permanece em `/hub` (modal "Nenhum produto") |

---

## Fluxograma

```
[user clica "Continuar com Google" / e-mail+senha]
                    │
                    ▼
            [Clerk autentica]
                    │
                    ▼
   ┌──────[ signInFallbackRedirectUrl="/hub" ]──────┐
   │                                                 │
   ▼                                                 ▼
[GET /api/v1/hub/init]                  [Componente <SelecionarWorkspace>]
   │                                                 │
   │ retorna: companies[], products[],               │
   │ preferredCompanyId, tenant info                 │
   ▼                                                 ▼
   ┌────────── Avaliar 4 condições do skip ─────────┐
   │  1. searchParams.get('select') !== '1'         │
   │  2. preferredCompanyId !== null                │
   │  3. produtos ativos > 0                        │
   │  4. tipo_usuario !== 'FORNECEDOR'              │
   └─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   TODAS true                 ANY false
        │                       │
        ▼                       ▼
[navigate('/core', replace)]  [renderiza tela /hub com cards de workspace]
```

---

## Onde o skip é avaliado

📍 `servicos-global/configurador/src/pages/SelecionarWorkspace.tsx` — linhas ~461-481

```ts
const forceSelect = searchParams.get('select') === '1'
if (
  !forceSelect &&
  serverPreferredId &&
  totalAtivos > 0 &&
  dbRole !== 'FORNECEDOR'
) {
  const targetWs = mapeados.find(w => w.id === serverPreferredId)
  if (targetWs) {
    sessionStorage.setItem('gravity_company_id', targetWs.id)
    sessionStorage.setItem('gravity_company_name', targetWs.nome)
    navigate('/core', { replace: true })
    return
  }
}
```

> **Importante:** comparar pelo enum cru (`'FORNECEDOR'`), nunca pelo label traduzido (`'Fornecedor'`).
> Mandamento 03 (DDD) e 08 (sem fallback silencioso).

---

## Escape hatch `?select=1`

Sem o parâmetro, qualquer botão "Voltar ao Hub" entraria em loop para usuários com preferência (skip volta a disparar). Por isso **TODOS os botões de navegação para o `/hub`** devem usar `?select=1`:

| Local | Padrão correto |
|---|---|
| Botão "Voltar ao Hub" no header | `navigate('/hub?select=1')` ou `window.location.href = '/hub?select=1'` |
| Item de menu na sidebar de produto | `to: '/hub?select=1'` |
| Click no nó "hub" do `<LocalizadorGlobal>` | `navigate('/hub?select=1')` |

**Exceção:** `App.tsx > RootRedirect` (rota `/`) mantém `Navigate to="/hub"` sem `?select=1` — quem digita `/` na URL espera "home", não "trocar workspace". O skip é desejado neste caso.

---

## Como o usuário desmarca uma preferência

1. Acessa `/hub?select=1` (via botão "Voltar ao Hub" de qualquer tela autenticada)
2. No card do workspace preferido atual, vê o ícone ★ (estrela cheia) com tooltip "Remover workspace principal"
3. Clica → `togglePreferred()` envia `PUT /api/v1/me/preferencias { preferredCompanyId: null }`
4. Toast "Workspace principal removido"
5. Próximo login: `preferredCompanyId = null` → skip não dispara → vê `/hub` naturalmente

📍 `SelecionarWorkspace.tsx:307-341` — implementação do `togglePreferred()`
📍 `SelecionarWorkspace.tsx:851-860` — UI do botão estrela no card

---

## Comportamento por `tipo_usuario`

| `tipo_usuario` | Pula `/hub → /core` se tem preferência? | Justificativa |
|---|---|---|
| `SUPER_ADMIN` | ✅ Sim (segue regra padrão) | Admin Gravity, mas se tem preferência salva é porque marcou explicitamente. Pode desmarcar via estrela. |
| `ADMIN` | ✅ Sim | idem |
| `MASTER` | ✅ Sim | UX otimizada — entra direto no workspace de trabalho |
| `PADRAO` | ✅ Sim | idem |
| `FORNECEDOR` | ❌ Não — sempre `/hub` | Cross-organização, escolha explícita obrigatória |

> **Nota futura:** se o produto decidir que `gravity_admin = true` deve sempre ver `/hub` para enfatizar supervisão multi-organização, basta adicionar `&& dbRole !== 'SUPER_ADMIN' && dbRole !== 'ADMIN'` à condição.
> Não é o comportamento atual (validado em 2026-04-30).

---

## Endpoints envolvidos

| Endpoint | Método | Responsabilidade |
|---|---|---|
| `/api/v1/hub/init` | GET | Retorna `companies`, `products`, `preferredCompanyId`. Limpa `id_workspace_preferido_usuario` se aponta para workspace `INATIVO` ou inexistente (resilient cleanup). |
| `/api/v1/me/preferencias` | GET | Retorna `preferredCompanyId` puro (sem joins). |
| `/api/v1/me/preferencias` | PUT | Body: `{ preferredCompanyId: string \| null }`. Persiste no banco. `null` = desmarcar. |

---

## Fonte da verdade — campo do banco

`Usuario.id_workspace_preferido_usuario` (`configurador/prisma/schema.prisma:116`)

- Tipo: `String?` (nullable)
- FK: `Workspace.id_workspace` (`onDelete: SetNull`, `map: "usuario_id_workspace_preferido_usuario_fkey"`)
- Index: `@@index([id_workspace_preferido_usuario])`
- Atualizado **apenas** via `PUT /api/v1/me/preferencias` (rota explícita) ou pela rotina de cleanup do `/hub/init` (que só sabe setar para `null`)

---

## Casos de teste

| # | Cenário | Esperado |
|---|---|---|
| 1 | Login pela primeira vez (sem preferência) | Vê `/hub` com lista de workspaces |
| 2 | Login com preferência salva | Pula direto para `/core` do workspace preferido |
| 3 | Click em "Voltar ao Hub" do `/core` | Vê `/hub?select=1` com cards (skip não dispara) |
| 4 | Click em "Voltar ao Hub" do `/store`, `/admin/*`, `/workspace/*` ou produto | idem ao caso 3 |
| 5 | Click na estrela do workspace preferido (em `/hub?select=1`) | Toast "removido" + próximo login vê `/hub` |
| 6 | FORNECEDOR com preferência | Vê `/hub` (skip não dispara — exceção) |
| 7 | Tenant com 0 produtos ativos | Vê `/hub` com modal "Nenhum produto" (não pula) |
| 8 | Workspace preferido apontando para empresa `INATIVO` | `/hub/init` limpa o campo automaticamente; user vê `/hub` |

---

## Verificação obrigatória ao mexer no fluxo

Antes de qualquer alteração no SelecionarWorkspace, App.tsx (RootRedirect/PublicRoute/ProtectedRoute), Header, Core ou nas pages que têm botão "Voltar ao Hub", rodar:

```bash
grep -rE "navigate\\('/hub'\\)|window\\.location\\.href\\s*=\\s*'/hub'" servicos-global/
```

**O resultado deve ser zero.** Cada `'/hub'` deve ser `'/hub?select=1'` (exceto `RootRedirect` em `App.tsx:172` e a Route `<Route path="/hub">` em si).

---

## Bugs históricos relacionados

| Data | Bug | Resolvido em |
|---|---|---|
| 2026-04-30 | Botões "Voltar ao Hub" em 12 lugares sem `?select=1` causavam loop. Apenas `Core.tsx:265` estava correto. Detectado durante teste manual. | Commit `16840c71` (8 arquivos, 13+/13-) |
| 2026-04-30 | Comparação por label traduzido (`userRole !== 'Fornecedor'`) violava Mandamento 03 e podia falhar com mudança de i18n. | Commit `eb87bf01` |
| 2026-04-30 | Rotas `/sign-in` e `/sign-up` órfãs após refactor DDD; `signInUrl` do Clerk apontava para rota inexistente. | Commit `eb87bf01` |
| 2026-04-30 | Render inline `<AutenticacaoPage />` em `RootRedirect` para deslogados deixava URL `/` sem refletir estado. Migrado para redirect explícito para `/login`. | Commit `eb87bf01` |
| 2026-04-30 | Props Clerk `afterSignInUrl` / `afterSignUpUrl` deprecated. Migradas para `signInFallbackRedirectUrl` / `signUpFallbackRedirectUrl`. | Commit `eb87bf01` |

---

## Arquitetura de rotas relacionadas

```
App.tsx (Routes)
├── /                              → <RootRedirect />
│                                     │
│                                     ├─ logado:    Navigate to="/hub" (skip pode disparar)
│                                     └─ deslogado: Navigate to="/login"
│
├── /login/*                       → <PublicRoute><AutenticacaoPage /></PublicRoute>
├── /cadastro/continuar            → <PublicRoute><CadastroContinuarPage /></PublicRoute> (convite + OAuth missing-fields)
├── /cadastro/sso-callback         → <AuthenticateWithRedirectCallback> (intercepta OAuth do Google)
├── /cadastro/*                    → <PublicRoute><AutenticacaoPage /></PublicRoute>
├── /recuperar-senha/redefinir     → <PublicRoute><RecuperarSenhaRedefinirPage /></PublicRoute> (codigo + nova senha)
├── /recuperar-senha/*             → <PublicRoute><AutenticacaoPage /></PublicRoute>
│
├── /hub                           → <ProtectedRoute><SelecionarWorkspace /></ProtectedRoute>
│                                     │
│                                     └─ avalia 4 condições do skip
│                                        ├─ TODAS true: navigate('/core', replace)
│                                        └─ ANY false: renderiza tela com cards
│
├── /core                          → <ProtectedRoute>
│   ├── (index)                       <Hub /> (dashboard do core)
│   └── /core/atividades, ...         <Core /> (com sidebar)
│                                   </ProtectedRoute>
│
└── /produto/<slug>/*              → <ProtectedRoute>...{ProdutoApp}...</ProtectedRoute>
```

---

## Configuração do ClerkProvider (`main.tsx`)

```tsx
<ClerkProvider
  publishableKey={PUBLISHABLE_KEY}
  localization={ptBR}
  signUpFallbackRedirectUrl="/hub"   // após cadastro: vai para /hub (skip pode disparar)
  signInFallbackRedirectUrl="/hub"   // após login:    idem
  signInUrl="/login"                 // rota local de login (DDD canônica)
  signUpUrl="/cadastro"              // rota local de cadastro (DDD canônica)
>
  ...
</ClerkProvider>
```

> `Fallback` (não `Force`): se o usuário foi redirecionado para `/login` porque tentou acessar `/admin/visao-geral`, depois de logar volta para `/admin/visao-geral` (não `/hub`). Comportamento UX padrão.

---

## Fluxo de recuperação de senha (reset_password_email_code)

Etapa 1 — `/recuperar-senha` (renderizada por `LoginGlobal` em modo `isForgotPassword`):
- Usuário informa o e-mail e submete.
- `useSignIn().create({ strategy: 'reset_password_email_code', identifier: email })` dispara o envio real do código de 6 dígitos pelo Clerk.
- Estado `success` mostra "Verifique seu e-mail" + botão "Tenho o código" → `/recuperar-senha/redefinir?email=<email>`.

Etapa 2 — `/recuperar-senha/redefinir` (`RecuperarSenhaRedefinirPage`):
- Recebe `?email=` na query (apenas para exibição) e usa o `signIn` ativo do contexto Clerk.
- Form Gravity-styled (split panel) com:
  - Código de 6 dígitos (validação `/^\d{6}$/`)
  - Nova senha (`BannerRequisitosGlobal` com 5 requisitos + barra de força)
  - Confirmação de senha
- Ao submeter: `signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code, password })` + `setActive({ session: createdSessionId })` → `navigate('/hub')`.
- Botão "Não recebi — reenviar código" repete o `signIn.create(...)`.

**Mandamento 08 (sem fallback silencioso):** o componente legado fingia sucesso sem chamar o Clerk (TODO de 03/2026). Corrigido em 04/05/2026 — qualquer falha de rede / e-mail inválido / rate limit agora aparece via `setStatus('error')` + mensagem real do Clerk.

---

## Dependências externas

- **Clerk SDK** (`@clerk/clerk-react`) — fornece `useAuth()`, `useUser()`, `RedirectToSignIn`, `<SignedIn>`, `<SignedOut>`. Versão atual usa `signInFallbackRedirectUrl` (props legadas `afterSignInUrl` foram migradas em 2026-04-30).
- **react-router-dom v6** — `<Navigate>`, `useNavigate()`, `useSearchParams()`.

---

## Glossário

| Termo | Significado |
|---|---|
| **Skip pós-login** | Redirect automático `/hub → /core` quando 4 condições batem |
| **Escape hatch** | Query param `?select=1` que desabilita o skip por requisição |
| **Workspace preferido** | Valor de `id_workspace_preferido_usuario` no banco |
| **`<SelecionarWorkspace>`** | Componente da rota `/hub` — mostra cards de workspace ou aplica o skip |
| **`<Hub>`** | Componente da rota `/core` index — dashboard do workspace selecionado (não confundir com a tela `/hub`) |

---

**Última revisão:** 2026-04-30
**Commits relevantes:** `78eb5cae`, `2a112a65`, `eb87bf01`, `16840c71`
