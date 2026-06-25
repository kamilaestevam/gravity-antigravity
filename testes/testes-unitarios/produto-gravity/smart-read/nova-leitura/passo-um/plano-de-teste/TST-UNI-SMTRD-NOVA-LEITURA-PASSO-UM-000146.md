# Plano Unitário — TST-UNI-SMTRD-NOVA-LEITURA-PASSO-UM-000146

**Escopo:** Passo 01 Anexar arquivo — Nova Leitura Smart Read  
**Spec:** `TST-UNI-SMTRD-NOVA-LEITURA-PASSO-UM-000146.test.tsx`  
**Fixtures:** `../fixtures/amostras/` (gerar via `gerar-fixtures-passo-um.mjs`)

| # | Cenário | Casos |
|---|---------|-------|
| 01 | Abertura da tela | U01 constantes SSOT |
| 02 | Passo 01 ativo | U02 passo inicial |
| 03 | Anexar arquivos | U03 dropzone + input |
| 04 | 8 tipos aceitos | U04, U04b |
| 05 | Card após sucesso | U05 |
| 06 | Nome no card | U06 |
| 07–08 | Visualizar | U07/U08 |
| 09 | Excluir | U09 |
| 10 | Cancelar | U10 |
| 11 | Enviar → passo 2 | U11, U11b |

```bash
npx vitest run --config vitest.config.ci.ts testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-um/plano-de-teste/TST-UNI-SMTRD-NOVA-LEITURA-PASSO-UM-000146.test.tsx
```
