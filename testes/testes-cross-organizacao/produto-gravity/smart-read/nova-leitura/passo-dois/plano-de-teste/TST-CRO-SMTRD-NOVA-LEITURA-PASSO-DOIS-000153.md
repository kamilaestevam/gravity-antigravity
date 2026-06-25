# Plano Cross-Org — TST-CRO-SMTRD-NOVA-LEITURA-PASSO-DOIS-000153

**Escopo:** Isolamento workspace no polling do passo 2  
**Spec:** `TST-CRO-SMTRD-NOVA-LEITURA-PASSO-DOIS-000153.test.ts`

| # | Cenário | Casos |
|---|---------|-------|
| 01 | Clausula workspace | CRO-01 filtro OR |
| 02 | Org B não vê leitura A | CRO-02 snapshot isolado |
| 03 | Header workspace | CRO-03 x-id-workspace |
| 04 | Fallback organização | CRO-04 sem header |

```bash
npx vitest run --config vitest.config.ci.ts testes/testes-cross-organizacao/produto-gravity/smart-read/nova-leitura/passo-dois/plano-de-teste/TST-CRO-SMTRD-NOVA-LEITURA-PASSO-DOIS-000153.test.ts
```
