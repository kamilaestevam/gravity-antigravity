# Acessos e Permissoes de Usuarios — Gravity Platform

> Ultima atualizacao: 2026-04-16
> Escopo: Modelo completo de roles, camadas de protecao, gestao de admins e historico de incidentes

---

## Principio Arquitetural — Fonte da Verdade para Multi-tenancy

> **DIRETRIZ ABSOLUTA — Nenhuma excecao tolerada.**

O Gravity opera com separacao estrita de responsabilidades entre Clerk e Prisma:

| Componente | Papel |
|---|---|
| **Clerk** | Provedor de Identidade (IdP) — autentica o usuario, gerencia senha/2FA/sessao |
| **Prisma (banco)** | Fonte da Verdade — armazena `tenantId`, `role` e permissoes granulares |
| **`publicMetadata`** | Ponte server-side — Prisma escreve; frontend le; usuario nao pode alterar |
| **`useSyncClerkToShell`** | Sincronizador — le `publicMetadata` e popula o estado global (ShellStore) |
| **ShellStore** | Estado global no frontend — unica fonte de `currentUser.role` e `currentUser.tenantId` |

### O que esta PROIBIDO

- **Nunca usar o sistema de Organizations do Clerk (B2B nativo).** Esse sistema foi removido em 2026-04-16 e nao deve ser reintroduzido em nenhuma hipotese.
- **Nunca atribuir roles ou tenants via Clerk Organizations** — toda logica de vinculo empresa/usuario pertence ao Prisma.
- **Nunca hardcodar roles no frontend** — nenhum componente exibe role fixo. Todo cargo exibido na UI vem de `useShellStore().currentUser.role`.
- **Nunca exibir roles nativos do Clerk** (ex: `org:member`, `basic_member`, "Membro") — esses conceitos nao existem na plataforma.

### Fluxo Correto de Role e Tenant

```
[Usuario autentica no Clerk]
         |
         v
[Backend (Prisma): verifica/cria vinculo tenant, define role]
         |
         v (via Clerk SDK — escrita server-side, CLERK_SECRET_KEY)
[publicMetadata.tenantId + publicMetadata.role]
         |
         v (via useSyncClerkToShell — hooks/useSyncClerkToShell.ts)
[ShellStore.currentUser: { tenantId, role, avatarUrl, ... }]
         |
         v
[Componentes React: Header, UsuarioGlobal, guards de rota, etc.]
```

**Nenhuma etapa pode ser pulada ou substituida por dado vindo do cliente.**

---

## Indice

| Documento | O que cobre |
|-----------|-------------|
| [modelo-de-roles.md](./modelo-de-roles.md) | As duas cadeias de permissao, todos os roles, tabela comparativa |
| [camadas-de-protecao.md](./camadas-de-protecao.md) | As 3 camadas que bloqueiam acesso indevido ao admin |
| [gestao-de-admins.md](./gestao-de-admins.md) | Como criar/revogar admins, quem pode fazer isso, passo a passo |
| [incidentes-e-auditoria.md](./incidentes-e-auditoria.md) | Incidente 31/03/2026 + correcoes aplicadas + lies aprendidas |

---

## Resumo do Modelo

O Gravity opera com **duas cadeias independentes** de controle de acesso:

```
Cadeia 1 — Quem o usuario e na plataforma (role global)
  └── Super Admin  →  Admin  →  Master  →  Standard  →  Fornecedor

Cadeia 2 — O que o usuario pode fazer em cada produto (permissao granular)
  └── Definida pelo Master da organizacao para Standard e Fornecedor
```

### Separacao critica

| Tipo | Roles | Acessa Admin Panel? |
|------|-------|:-------------------:|
| Equipe Gravity (interno) | `super_admin`, `admin` | Sim |
| Cliente / Tenant | `master`, `standard`, `fornecedor` | Nao — nunca |

> **Regra absoluta:** nenhum usuario de tenant pode acessar o Admin Panel da Gravity, independente do que o Master configurar. As duas cadeias sao completamente separadas.

---

## Arquivos de Codigo Relacionados

| Arquivo | Funcao |
|---------|--------|
| `servicos-global/shell/hooks/useSyncClerkToShell.ts` | **Sincronizador principal** — le `publicMetadata` do Clerk e popula o ShellStore |
| `servicos-global/shell/store/useShellStore.ts` | ShellStore — estado global de `currentUser` (role, tenantId, avatarUrl) |
| `servicos-global/shell/Header.tsx` | Le `currentUser` do ShellStore; exibe cargo e avatar sem fallbacks hardcoded |
| `nucleo-global/Layout/usuario-global/src/UsuarioGlobal.tsx` | Componente de perfil — recebe `userRole` e `avatarUrl` via props do Header |
| `servicos-global/configurador/src/App.tsx` | `AdminRoute` — guard de rota frontend |
| `servicos-global/configurador/src/pages/admin/AdminLayout.tsx` | Verificacao de role em profundidade |
| `servicos-global/configurador/server/middleware/requireAuth.ts` | Validacao de JWT Clerk em toda rota |
| `servicos-global/configurador/server/middleware/requireGravityAdmin.ts` | Verifica `gravity_admin` no Clerk |
| `servicos-global/configurador/server/lib/clerk.ts` | `isGravityAdmin()` — fonte de verdade para acesso admin |
| `servicos-global/configurador/server/routes/admin.ts` | Todas as rotas `/api/admin/*` |
| `servicos-global/configurador/server/routes/adminSecurity.ts` | Rotas `/api/admin/security/*` |
| `servicos-global/configurador/server/routes/adminProducts.ts` | Rotas `/api/admin/products/*` |
