# Plano Cross-Org — TST-CRO-SMTRD-NOVA-LEITURA-PASSO-UM-000148

**Escopo:** Isolamento workspace Smart Read  
**Spec:** `TST-CRO-SMTRD-NOVA-LEITURA-PASSO-UM-000148.test.ts`

| # | Cenário | Casos |
|---|---------|-------|
| 01 | Clausula workspace | CRO-01 |
| 02 | Org B não vê leitura de A | CRO-02 |
| 03 | Header x-id-workspace | CRO-03 |
| 04 | Fallback id_organizacao | CRO-04 |

```bash
npx vitest run --config vitest.config.ci.ts testes/testes-cross-organizacao/produto-gravity/smart-read/nova-leitura/passo-um/plano-de-teste/TST-CRO-SMTRD-NOVA-LEITURA-PASSO-UM-000148.test.ts
```
