# Acessos e Permissoes de Usuarios — Gravity Platform

> Ultima atualizacao: 2026-03-31
> Escopo: Modelo completo de roles, camadas de protecao, gestao de admins e historico de incidentes

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
| `servicos-global/configurador/src/App.tsx` | `AdminRoute` — guard de rota frontend |
| `servicos-global/configurador/src/pages/admin/AdminLayout.tsx` | Verificacao de role em profundidade |
| `servicos-global/configurador/server/middleware/requireAuth.ts` | Validacao de JWT Clerk em toda rota |
| `servicos-global/configurador/server/middleware/requireGravityAdmin.ts` | Verifica `gravity_admin` no Clerk |
| `servicos-global/configurador/server/lib/clerk.ts` | `isGravityAdmin()` — fonte de verdade |
| `servicos-global/configurador/server/routes/admin.ts` | Todas as rotas `/api/admin/*` |
| `servicos-global/configurador/server/routes/adminSecurity.ts` | Rotas `/api/admin/security/*` |
| `servicos-global/configurador/server/routes/adminProducts.ts` | Rotas `/api/admin/products/*` |
