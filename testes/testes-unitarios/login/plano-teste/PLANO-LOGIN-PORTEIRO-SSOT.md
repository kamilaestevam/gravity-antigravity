# Plano de Testes — Login / Porteiro SSOT pós-autenticação

> **Escopo:** `LOGIN` · **Feature:** Porteiro `GET /api/v1/me` → `/trial` | `/hub`  
> **Pipeline:** [`skills/testes/multi-agente-plano-teste/SKILL.md`](../../../skills/testes/multi-agente-plano-teste/SKILL.md)  
> **Doc técnica:** [`documentos-tecnicos/produtos-gravity/configurador/FLUXO-SIGNUP-ONBOARDING.md`](../../../documentos-tecnicos/produtos-gravity/configurador/FLUXO-SIGNUP-ONBOARDING.md)

---

## Resumo executivo

Após sessão Clerk, o sistema **não** pode assumir `/hub` só por `isSignedIn`. O porteiro consulta o backend e decide:

| `/api/v1/me` | Destino |
|--------------|---------|
| 401 / sem `organizacao` | `/trial` (onboarding) |
| 200 + `organizacao` | `/hub` |

**Arquivos SSOT:** `destino-pos-autenticacao.ts`, `use-destino-pos-autenticacao.ts`, `NavigateDestinoPosAutenticacao.tsx`, guards em `App.tsx`.

---

## Mapa de artefatos (FONTE PRIMARIA)

| Camada | Plano | Spec / execução | Status |
|--------|-------|-----------------|--------|
| **Unitário** | `plano-teste/PLANO-LOGIN-PORTEIRO-SSOT.json` | `porteiro-resolver.test.ts`, `use-destino-pos-autenticacao.test.ts` | Implementado |
| **Funcional** | idem | `../testes-funcionais/login/porteiro-pos-autenticacao.test.ts` | Implementado |
| **E2E** | `../../testes-e2e/login/plano-teste/TST-E2E-LOGIN-000001.json` | `TST-E2E-LOGIN-000001.spec.ts` | Plano aprovado · spec skeleton |
| **Em tela** | `../../testes-em-tela/login/2026-05-26-porteiro-signup/PLANO-EM-TELA.md` | `run-porteiro-signup.ts` | Checklist manual |

### Legado substituído (deletado)

- `testes/testes-funcionais/configurador/fluxo-signup-onboarding.test.ts` → migrado para `testes-funcionais/login/`

---

## Fluxograma de teste

```mermaid
flowchart TD
  subgraph uni [Unitário]
    U1[resolverDestinoPosAutenticacao]
    U2[meDestinoPorteiroSchema]
    U3[cache porteiro]
    U4[useDestinoPosAutenticacao hook]
  end
  subgraph fun [Funcional wiring]
    F1[App RootRedirect PublicRoute ProtectedRoute]
    F2[Clerk fallbacks main.tsx]
    F3[Guards Onboarding Hub OTP]
  end
  subgraph e2e [E2E Playwright]
    E1[Signup novo → /trial]
    E2[Login existente → /hub]
    E3[/hub direto sem org → /trial]
    E4[Onboarding completo → /hub]
  end
  subgraph tela [Em tela]
    T1[Screenshots onboarding]
    T2[Screenshots hub pós-org]
  end
  uni --> fun --> e2e --> tela
```

---

## Comandos

```bash
# Unitário
npx vitest run testes/testes-unitarios/login --config testes/testes-unitarios/login/vitest.config.ts

# Funcional
npx vitest run testes/testes-funcionais/login --config testes/testes-funcionais/login/vitest.config.ts

# E2E (após aprovação dono + credenciais Clerk test)
npx playwright test testes/testes-e2e/login/TST-E2E-LOGIN-000001.spec.ts
```

---

## Categorias de cobertura (20 categorias QA)

| Cat | Nome | Unit | Fun | E2E | Em tela |
|-----|------|:----:|:---:|:---:|:-------:|
| 1 | Carregamento pós-auth | — | ✓ | ✓ | ✓ |
| 14 | RBAC / destino por org | ✓ | ✓ | ✓ | — |
| 8 | Validação contrato Zod | ✓ | ✓ | — | — |
| 9 | Estados de erro (/me 5xx) | ✓ | — | ✓ | — |
| 10 | Estados vazios (sem org) | ✓ | ✓ | ✓ | ✓ |
| 11 | Loading porteiro | ✓ | ✓ | ✓ | ✓ |
| 20 | Persistência pós-onboarding | — | ✓ | ✓ | ✓ |

---

## Critérios de aceite (release)

1. Signup **e-mail novo** em staging/prod → URL final `/trial` com modal onboarding.
2. Login **cliente existente** → `/hub` com topbar visível (não tela azul vazia).
3. Acesso direto `/hub` sem org → redirect `/trial` em &lt; 2s.
4. Todos os testes unitários + funcionais LOGIN passam no CI.
5. E2E LOGIN executado em staging antes de prod.

---

**Última revisão:** 2026-05-26 · **Registry:** `TST-UNI-LOGIN-000001`, `TST-FUN-LOGIN-000001`, `TST-E2E-LOGIN-000001`, `TST-EMT-LOGIN-000001`
