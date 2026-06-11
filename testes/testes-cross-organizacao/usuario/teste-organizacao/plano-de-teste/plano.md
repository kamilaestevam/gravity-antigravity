# Plano Cross-Organização — Usuário × Organização (isolamento)

> Parte do domínio `PEDIDO-USUARIO-FALTA-ORGANIZACAO`. Tipo **CRO** (Vitest + 2 organizações).
> Família de ID: `TST-CRO-PEDIDO-USUARIO-FALTA-ORGANIZACAO-{NNNNNN}`.

## Cenários (da Matriz DEFINITIVA)

| ID matriz | Cenário | Alvo |
|-----------|---------|------|
| CRO-01 | Override admin A→B: dados de B sob override; header `x-organizacao-override` aplicado | `resolver-organizacao/src/middleware.ts` |
| CRO-02 | Override por **não-admin** → 403 `OVERRIDE_NAO_AUTORIZADO` | `resolver-organizacao/src/middleware.ts` |
| CRO-03 | Usuário de ORG_A **nunca** lê schema de ORG_B (`SET LOCAL search_path`) | `resolver-organizacao/src/with-tenant.ts` |

## Reaproveitamento
- Já existe cobertura em `packages/resolver-organizacao/tests/integration/middleware-override.test.ts` e `tenant-isolation.e2e.test.ts` — **não deletar** (pacote publicável). Estes CRO complementam do ponto de vista do produto.

## Status
⏳ **Specs a gerar** (`TST-CRO-PEDIDO-USUARIO-FALTA-ORGANIZACAO-0000NN.test.ts`).

> ⚠️ Não deletar — mantém a pasta `plano-de-teste/` versionada.
