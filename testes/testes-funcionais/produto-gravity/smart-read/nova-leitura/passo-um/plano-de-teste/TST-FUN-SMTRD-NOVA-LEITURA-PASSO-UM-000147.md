# Plano Funcional — TST-FUN-SMTRD-NOVA-LEITURA-PASSO-UM-000147

**Escopo:** POST `/api/v1/smart-read/leituras` (Enviar do passo 1)  
**Spec:** `TST-FUN-SMTRD-NOVA-LEITURA-PASSO-UM-000147.test.ts`

| # | Cenário | Casos |
|---|---------|-------|
| 01 | Upload Enviar | F01 202 + ids |
| 02 | Validação | F02 sem arquivo, F03 sem org |
| 03 | 8 tipos aceitos | F04 (8 extensões) |
| 04 | Isolamento workspace | F05 vínculo ausente |

```bash
npx vitest run --config vitest.config.ci.ts testes/testes-funcionais/produto-gravity/smart-read/nova-leitura/passo-um/plano-de-teste/TST-FUN-SMTRD-NOVA-LEITURA-PASSO-UM-000147.test.ts
```
