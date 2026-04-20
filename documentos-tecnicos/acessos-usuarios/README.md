# Acessos e Permissoes de Usuarios — Gravity Platform

> Ultima atualizacao: 2026-04-19
> Escopo: Modelo completo de roles, camadas de protecao, gestao de admins e historico de incidentes

---

## Principio Arquitetural — Fonte da Verdade para Multi-tenancy

> **DIRETRIZ ABSOLUTA — Nenhuma excecao tolerada.**

O Gravity opera com separacao estrita de responsabilidades entre Clerk e Prisma:

| Componente | Papel |
|---|---|
| **Clerk** | JWT doorman — autentica o usuario, gerencia senha/2FA/sessao. Nao armazena role nem tenantId de tenant. |
| **Prisma (banco do Configurador)** | Fonte da Verdade — armazena `role`, `tenantId` e permissoes granulares |
| **`GET /api/v1/me`** | Endpoint canonico — devolve identidade completa com nomes DDD em Portugues |
| **`useMeSync`** | Hidratador — busca `/api/v1/me` com Bearer token e popula o ShellStore |
| **ShellStore** | Estado global no frontend — unica fonte de `currentUser.role` e `currentUser.tenantId` |

> **Nota sobre `gravity_admin`:** o acesso ao Admin Panel interno da Gravity ainda usa `publicMetadata.role = 'gravity_admin'` no Clerk, verificado pelo middleware `requireGravityAdmin`. Isso e exclusivo da equipe Gravity — nao se aplica a roles de tenant (MASTER, STANDARD, etc.).

### O que esta PROIBIDO

- **Nunca usar o sistema de Organizations do Clerk (B2B nativo).** Esse sistema foi removido em 2026-04-16 e nao deve ser reintroduzido em nenhuma hipotese.
- **Nunca atribuir roles ou tenants via Clerk Organizations** — toda logica de vinculo empresa/usuario pertence ao Prisma.
- **Nunca hardcodar roles no frontend** — nenhum componente exibe role fixo. Todo cargo exibido na UI vem de `useShellStore().currentUser.role`.
- **Nunca exibir roles nativos do Clerk** (ex: `org:member`, `basic_member`, "Membro") — esses conceitos nao existem na plataforma.
- **Nunca ler `publicMetadata.tenantId` ou `publicMetadata.role` no frontend** — esses campos nao sao mais escritos pelo backend para usuarios de tenant. A fonte e sempre `ShellStore.currentUser`, populado por `useMeSync`.
- **Nunca escrever `publicMetadata` para roles de tenant** — o backend nao escreve mais `{ tenantId, role }` no Clerk para usuarios comuns. O dado vem do Prisma via `GET /api/v1/me`.

### Fluxo Correto de Role e Tenant (pós-refatoração DDD — 2026-04-19)

```
[Usuario autentica no Clerk]
         |
         v (JWT Bearer token no frontend)
[useMeSync: GET /api/v1/me com Authorization: Bearer <token>]
         |
         v (Configurador valida JWT + consulta Prisma)
[Retorna DDD: { usuario: { id_usuario, nome_usuario, tipo_usuario,
                           id_organizacao_usuario },
               organizacao: { nome_organizacao } }]
         |
         v (useMeSync mapeia para ShellStore)
[ShellStore.currentUser: { id, name, tenantId, role, ... }]
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
| `servicos-global/shell/hooks/useMeSync.ts` | **Hidratador principal** — busca `GET /api/v1/me` com Bearer token e popula o ShellStore. Substitui `useSyncClerkToShell` (removido em 2026-04-19). |
| `servicos-global/configurador/server/routes/me.ts` | **Endpoint canonico de identidade** — valida JWT, consulta Prisma, retorna campos DDD em Portugues |
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
