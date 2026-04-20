# Camadas de Protecao do Admin Panel

> Ultima atualizacao: 2026-04-16
> Status: 3 camadas ativas e independentes

---

## Contexto Arquitetural

Todas as tres camadas verificam `publicMetadata.role` do Clerk. E fundamental entender **de onde esse valor vem** e **a quem se aplica**:

- Estas tres camadas protegem exclusivamente o **Admin Panel interno da Gravity** (`/admin/*`). O unico role verificado aqui e `gravity_admin` — exclusivo da equipe interna.
- **Roles de tenant (`MASTER`, `STANDARD`, `SUPPLIER`) nao sao escritos no `publicMetadata`** desde a Refatoracao #002 (2026-04-19). Esses roles vivem exclusivamente no Prisma e chegam ao frontend via `GET /api/v1/me` → `useMeSync` → `ShellStore`.
- O `publicMetadata.role = 'gravity_admin'` e atribuido **manualmente via Clerk Dashboard** pelo super_admin — nunca por codigo automatico da aplicacao (ver `gestao-de-admins.md` para o passo a passo).
- O `publicMetadata` e server-side: o cliente nao consegue alterar esse campo.
- **Nunca** o sistema de Organizations nativo do Clerk e usado — esse sistema foi removido em 2026-04-16 e esta banido permanentemente.

---

## Visao Geral

O acesso ao Admin Panel (`/admin/*`) e protegido por tres camadas independentes. Um atacante precisaria comprometer **as tres simultaneamente** para obter acesso indevido — o que na pratica e impossivel sem comprometer a conta Clerk da Gravity.

```
Usuario tenta acessar /admin/qualquer-rota
            │
            ▼
┌─────────────────────────────────────────────┐
│  CAMADA 1 — AdminRoute (frontend/roteador)  │
│  Arquivo: App.tsx                           │
│  Le: user?.publicMetadata?.role (Clerk)     │
│  Se != 'gravity_admin' → redireciona /hub   │
│  Custo: zero (dado ja em memoria)           │
└───────────────────┬─────────────────────────┘
                    │ so passa se gravity_admin
                    ▼
┌─────────────────────────────────────────────┐
│  CAMADA 2 — AdminLayout (defesa profunda)   │
│  Arquivo: AdminLayout.tsx                   │
│  Mesmo check de role — guard no componente  │
│  Se != 'gravity_admin' → redireciona /hub   │
│  Protege mesmo se roteador falhar           │
└───────────────────┬─────────────────────────┘
                    │ so passa se gravity_admin
                    ▼
┌─────────────────────────────────────────────┐
│  CAMADA 3 — requireGravityAdmin (backend)   │
│  Arquivo: requireGravityAdmin.ts            │
│  Chama clerkClient.users.getUser() — API    │
│  Se publicMetadata.role != 'gravity_admin'  │
│  → 403 FORBIDDEN                            │
│  Protege mesmo se frontend for bypassado    │
└─────────────────────────────────────────────┘
```

---

## Camada 1 — AdminRoute (App.tsx)

**Tipo:** Guard de rota React  
**Arquivo:** `servicos-global/configurador/src/App.tsx` (funcao `AdminRoute`)

```tsx
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/sign-in" replace />

  const role = user?.publicMetadata?.role as string | undefined
  if (role !== 'gravity_admin') {
    return <Navigate to="/hub" replace />  // master, standard, etc. → bloqueado aqui
  }

  return <>{children}</>
}
```

**Como e usado:**

```tsx
// Rota /admin e seus filhos — todos protegidos pelo AdminRoute
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  <Route path="visao-geral" ... />
  <Route path="tenants" ... />
  <Route path="produtos" ... />
  {/* ... todas as sub-rotas herdadas */}
</Route>
```

**O que verifica:** `user.publicMetadata.role === 'gravity_admin'`  
**De onde vem:** Clerk — dados do usuario autenticado, carregados no login  
**Pode ser forjado pelo usuario?** Nao. `publicMetadata` e server-side no Clerk. So o backend (com `CLERK_SECRET_KEY`) consegue alterar.

---

## Camada 2 — AdminLayout (defesa em profundidade)

**Tipo:** Verificacao no componente pai  
**Arquivo:** `servicos-global/configurador/src/pages/admin/AdminLayout.tsx`

```tsx
export function AdminLayout() {
  const { user } = useUser()

  // Defesa em profundidade: bloqueia rendering se o role nao for gravity_admin,
  // mesmo que o roteador (AdminRoute) ja tenha feito essa verificacao
  const role = user?.publicMetadata?.role as string | undefined
  if (user && role !== 'gravity_admin') {
    return <Navigate to="/hub" replace />
  }

  // ... resto do componente
}
```

**Por que existe se a Camada 1 ja verifica?**  
Para o caso de:
- Um bug futuro no roteador que remova o `AdminRoute` acidentalmente
- Um novo desenvolvedor adicionar uma sub-rota sem envolver no `AdminRoute`
- Qualquer bypass de roteamento que o React Router possa ter

Custo: zero. Mesma variavel em memoria, sem rede.

---

## Camada 3 — requireGravityAdmin (backend)

**Tipo:** Express middleware  
**Arquivo:** `servicos-global/configurador/server/middleware/requireGravityAdmin.ts`

```typescript
export async function requireGravityAdmin(req, _res, next) {
  const isAdmin = await isGravityAdmin(req.auth.clerkUserId)
  if (!isAdmin) {
    throw new AppError('Acesso restrito a administradores Gravity', 403, 'FORBIDDEN')
  }
  next()
}
```

**Funcao `isGravityAdmin`** (`server/lib/clerk.ts`):

```typescript
export async function isGravityAdmin(clerkUserId: string): Promise<boolean> {
  const user = await clerkClient.users.getUser(clerkUserId)
  const meta = user.publicMetadata as Record<string, unknown>
  return meta?.role === 'gravity_admin'
}
```

**Onde e aplicado:**

| Arquivo de rota | Aplicacao |
|----------------|-----------|
| `admin.ts` | `adminRouter.use(requireAuth, requireGravityAdmin)` — todas as rotas |
| `adminSecurity.ts` | `adminSecurityRouter.use(requireAuth, requireGravityAdmin)` — todas as rotas |
| `adminProducts.ts` | `adminProductsRouter.use(requireAuth, requireGravityAdmin)` — todas as rotas |
| `apiCockpit.ts` | `apiCockpitAdminRouter.use(requireAuth, requireGravityAdmin)` — rotas admin |
| `tenantProducts.ts` | `requireGravityAdmin` em cada rota individualmente |
| `products.ts` | `requireGravityAdmin` em POST, PUT, DELETE |

**Caracteristica importante:** Chama a API do Clerk (`clerkClient.users.getUser`) — nao confia no token JWT local. Isso significa que mesmo que alguem consiga forjar um token localmente, o Clerk nao confirmara o role `gravity_admin` para esse usuario.

**Por que o Clerk e consultado em tempo real aqui (e nao o Prisma)?** Para o check de `gravity_admin` (equipe interna), o Clerk e a fonte autoritativa porque o `gravity_admin` nao e um role do Prisma — e um marcador de identidade que pertence ao IdP. Roles de tenant (`MASTER`, `STANDARD`, `SUPPLIER`) sao verificados via Prisma. Essa e a unica excecao ao principio "Prisma e fonte da verdade", e so se aplica ao acesso ao Admin Panel.

**Custo de performance:** 1 request HTTP ao Clerk por chamada admin. So afeta `dmmltda@gmail.com` (unico admin). Clientes nao chegam nessa camada.

---

## O Que Seria Necessario Para Burlar as 3 Camadas

Para um usuario nao-admin acessar o admin, precisaria de **uma das seguintes**:

1. **Comprometer a `CLERK_SECRET_KEY`** — e atribuir `gravity_admin` a si mesmo via API Clerk
2. **Acesso direto ao banco de dados** — e modificar o `clerk_user_id` de um admin para o proprio
3. **Comprometer a conta `dmmltda@gmail.com` no Clerk** — e usar as credenciais legitimas

Nenhum dos tres e possivel atraves de vulnerabilidades na aplicacao. Todos requerem comprometimento de infra (Railway, Clerk Dashboard, ou credenciais).

---

## Verificacao Rapida (Checklist)

Use este checklist ao adicionar qualquer nova area restrita ao admin:

- [ ] A rota usa `AdminRoute` em vez de `ProtectedRoute` no `App.tsx`?
- [ ] O layout/componente raiz da area tem verificacao de role em profundidade?
- [ ] O router do backend aplica `requireAuth` + `requireGravityAdmin` como middleware?
- [ ] Nenhum endpoint da area e acessivel sem o middleware?
