# Configurador — Fluxo Signup → Onboarding → Hub

> Porteiro SSOT pós-autenticação: `GET /api/v1/me` decide `/trial` vs `/hub`.
> Skill: [`antigravity-configurador`](../../../skills/produtos-gravity/configurador/SKILL.md).
> Pós-login (skip `/hub → /core`): [`FLUXO-POS-LOGIN.md`](./FLUXO-POS-LOGIN.md).

---

## Princípio

| Camada | Responsabilidade |
|--------|------------------|
| **Clerk** | Autenticação (sessão JWT) — **não** sabe se o usuário tem organização no Gravity |
| **Porteiro (frontend)** | `GET /api/v1/me` → destino canônico |
| **Backend (`/me`)** | Fonte da verdade: `usuario` + `organizacao` no Prisma |

**Regra:** sessão Clerk **≠** cliente ativo. Cliente ativo = `organizacao` presente em `/me`.

---

## Fluxograma — Porteiro SSOT

```mermaid
flowchart TD
  A[Sessão Clerk ativa] --> B[GET /api/v1/me]
  B -->|401 ou 404| C[/trial — Onboarding]
  B -->|200 sem organizacao| C
  B -->|200 com organizacao| D[/hub — SelecionarWorkspace]
  C --> E[POST /api/v1/organizacoes]
  E --> F[limparCacheDestino + reload /hub]
  F --> D
  D --> G{Skip 4 condições?}
  G -->|sim| H[/core]
  G -->|não| I[Cards workspace]
```

---

## Onde o porteiro está aplicado

| Ponto | Arquivo | Comportamento |
|-------|---------|---------------|
| Rota `/` | `App.tsx` → `RootRedirect` | Logado → `<NavigateDestinoPosAutenticacao />` |
| `/login`, `/cadastro` | `PublicRoute` | Logado → porteiro (não `/hub` fixo) |
| Rotas autenticadas | `ProtectedRoute` | Sem org → `/trial`; com org → `children` |
| `/trial` | `Onboarding.tsx` | Se já tem org → `/hub`; senão formulário |
| `/hub` (defesa) | `SelecionarWorkspace.tsx` | `hub/init` 401 → `/trial` (redundância) |
| OTP cadastro | `LoginGlobal.tsx` | `navigate('/trial')` após verificação (UX imediata) |

**SSOT:** `servicos-global/configurador/src/routing/destino-pos-autenticacao.ts` — `resolverDestinoPosAutenticacao()`.

**Hook:** `src/hooks/use-destino-pos-autenticacao.ts` — cache por `userId` Clerk; limpo no logout (`limparCacheTipoUsuario`).

---

## Clerk — alinhamento (não substitui o porteiro)

```tsx
// main.tsx
signUpFallbackRedirectUrl="/trial"   // cadastro OAuth / reload Clerk
signInFallbackRedirectUrl="/hub"     // login existente
```

Callbacks SSO em `App.tsx` repetem os mesmos valores em `<AuthenticateWithRedirectCallback />`.

> Fallback = plano B quando o **Clerk** redireciona a página inteira. O porteiro em `RootRedirect` / `PublicRoute` / `ProtectedRoute` é obrigatório.

---

## Critérios de destino (`resolverDestinoPosAutenticacao`)

| HTTP | `organizacao` no body | Destino |
|------|------------------------|---------|
| 401, 404 | — | `trial` |
| 5xx, rede | — | `trial` (fail-safe signup) |
| 200 | `null` | `trial` |
| 200 | objeto com `id_organizacao` | `hub` |
| 200 | payload fora do contrato Zod | `trial` + `console.warn` (Mand. 08) |

---

## Onboarding (`/trial`)

1. Nome da empresa → CNPJ
2. `POST /api/v1/organizacoes` (saga Cadastros → org + workspace)
3. `limparCacheDestinoPosAutenticacao()` + `window.location.href = '/hub'`

---

## Testes

| Arquivo | Escopo |
|---------|--------|
| `testes/testes-unitarios/configurador/destino-pos-autenticacao.test.ts` | Resolver + schema Zod |
| `testes/testes-funcionais/configurador/fluxo-signup-onboarding.test.ts` | Wiring App.tsx, Clerk fallbacks, guards |

```bash
npx vitest run testes/testes-unitarios/configurador/destino-pos-autenticacao.test.ts \
  --config testes/testes-unitarios/configurador/vitest.config.ts

npx vitest run testes/testes-funcionais/configurador/fluxo-signup-onboarding.test.ts \
  --config testes/testes-funcionais/configurador/vitest.config.ts
```

---

## Bugs históricos

| Data | Sintoma | Causa | Correção |
|------|---------|-------|----------|
| até 2026-05-19 | Signup ia para `/hub` | `signUpFallbackRedirectUrl="/hub"` + `RootRedirect` sem `/me` | Commit `7ab7b5c0` + guard 401 no Hub |
| 2026-05-25 | Prod: `/hub` vazio após signup | Porteiro ausente em `RootRedirect`/`PublicRoute`; race Clerk vs SPA | Porteiro SSOT (este doc) |

---

**Última revisão:** 2026-05-25
