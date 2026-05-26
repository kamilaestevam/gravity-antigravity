# Atlas DDD — Apêndice manual: rotas FE de autenticação e onboarding

> **Este arquivo é mantido à mão** (não vem da planilha `gerar-atlas-ddd.py`).
> Complementa [`05-rotas-fe.md`](./05-rotas-fe.md) até a planilha incluir estas rotas.
> SSOT de comportamento: [`FLUXO-SIGNUP-ONBOARDING.md`](../produtos-gravity/configurador/FLUXO-SIGNUP-ONBOARDING.md).

**Última revisão:** 2026-05-26

---

## Rotas FE — Configurador (site `usegravity.com.br`)

| Rota DDD | Auth Clerk | Guard React | Destino após `/api/v1/me` |
|----------|------------|-------------|---------------------------|
| `/` | opcional | `RootRedirect` | deslogado → `/login`; logado → porteiro → `/trial` ou `/hub` |
| `/login` | público / logado | `PublicRoute` | logado → porteiro |
| `/cadastro` | público / logado | `PublicRoute` | logado → porteiro |
| `/cadastro/continuar` | convite | `PublicRoute` | idem |
| `/cadastro/sso-callback` | OAuth signup | `AuthenticateWithRedirectCallback` | fallback `/trial` |
| `/login/sso-callback` | OAuth signin | `AuthenticateWithRedirectCallback` | fallback `/hub` |
| `/trial` | **obrigatório** | `Onboarding` (guard interno) | sem org → formulário; com org → `/hub` |
| `/hub` | obrigatório | `ProtectedRoute` + porteiro | sem org → `/trial`; com org → `SelecionarWorkspace` |
| `/core` | obrigatório | `ProtectedRoute` | idem hub |
| `/configurador/*` | obrigatório | `ConfiguradorRoute` | MASTER+ (com org) |
| `/admin/*` | obrigatório | `AdminRoute` | `gravity_admin` |

---

## API consumida pelo porteiro (não é rota FE)

| Método | Rota DDD | Uso |
|--------|----------|-----|
| GET | `/api/v1/me` | Decide `/trial` vs `/hub` (campo `organizacao`) |
| GET | `/api/v1/hub/init` | Dados do hub; 401 → redirect `/trial` (defesa) |
| POST | `/api/v1/organizacoes` | Onboarding — cria org + workspace |

---

## Fluxograma (resumo)

```mermaid
flowchart LR
  Clerk[Sessão Clerk] --> Me[GET /api/v1/me]
  Me -->|sem org| Trial[/trial]
  Me -->|com org| Hub[/hub]
  Trial --> PostOrg[POST /organizacoes]
  PostOrg --> Hub
```

---

## Referências

- [`documentos-tecnicos/arquitetura/rotas-convencao.md`](../arquitetura/rotas-convencao.md) — convenção de URLs
- [`testes/testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.md`](../../testes/testes-unitarios/login/plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.md)
