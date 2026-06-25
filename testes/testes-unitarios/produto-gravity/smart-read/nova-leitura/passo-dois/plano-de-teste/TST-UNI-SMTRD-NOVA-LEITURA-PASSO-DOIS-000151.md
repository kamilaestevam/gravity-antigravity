# Plano Unitário — TST-UNI-SMTRD-NOVA-LEITURA-PASSO-DOIS-000151

**Escopo:** Passo 02 Análise do arquivo — Nova Leitura Smart Read  
**Spec:** `TST-UNI-SMTRD-NOVA-LEITURA-PASSO-DOIS-000151.test.tsx`  
**Fixtures:** `../fixtures/arquivos-passo-dois-fixture.ts`

| # | Cenário | Casos |
|---|---------|-------|
| 01 | Passo 2 ativo | U01 retomar PROCESSING |
| 02 | Nome da leitura | U02 fixture nome_leitura |
| 03 | Cards com documentos | U03 chips de tipos |
| 04 | Visualizar documento | U04 expandir + olho |
| 05 | Tempo de leitura | U05 timer HH:MM:SS |
| 06 | Recursos reduzidos | U06 saving calculado |
| 07 | Tempo acumulado | U07 infográfico workspace |
| 08 | Três análises completas | U08 pipeline 100% |
| 09 | Globo progresso | U09 progresso geral 100% |
| 10 | SLA 75s | U10 etapas completam antes de 75s |

```bash
npx vitest run --config vitest.config.ci.ts testes/testes-unitarios/produto-gravity/smart-read/nova-leitura/passo-dois/plano-de-teste/TST-UNI-SMTRD-NOVA-LEITURA-PASSO-DOIS-000151.test.tsx
```
