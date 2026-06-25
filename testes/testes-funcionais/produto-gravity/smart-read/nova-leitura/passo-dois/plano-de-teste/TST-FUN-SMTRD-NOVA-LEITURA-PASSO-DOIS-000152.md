# Plano Funcional — TST-FUN-SMTRD-NOVA-LEITURA-PASSO-DOIS-000152

**Escopo:** Passo 02 — polling GET `/api/v1/smart-read/leituras/:id`  
**Spec:** `TST-FUN-SMTRD-NOVA-LEITURA-PASSO-DOIS-000152.test.ts`

| # | Cenário | Casos |
|---|---------|-------|
| 01 | GET leitura em processamento | F01 status PROCESSING + extração parcial |
| 02 | GET leitura concluída | F02 status COMPLETED + documentos |
| 03 | Isolamento workspace | F03 404 fora do workspace |
| 04 | Headers obrigatórios | F04 ORGANIZACAO_AUSENTE |

```bash
npx vitest run --config vitest.config.ci.ts testes/testes-funcionais/produto-gravity/smart-read/nova-leitura/passo-dois/plano-de-teste/TST-FUN-SMTRD-NOVA-LEITURA-PASSO-DOIS-000152.test.ts
```
