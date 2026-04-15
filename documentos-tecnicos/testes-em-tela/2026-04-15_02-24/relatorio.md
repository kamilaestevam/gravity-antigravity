# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 1/6 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **TAB-Aberto.01** | Tab "Aberto" está visível na barra de tabs | 10.07s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[class*="tab"]').filter({ hasText: /^Aberto$/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - wai`
| ✅ | **TAB-Aberto.02** | Clicar "Aberto" não recarrega a página (SPA) | 0.65s |
| ❌ | **TAB-Aberto.03** | Tab "Aberto" fica com estilo ativo após clicar | 30.08s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ❌ | **TAB-Aberto.04** | Tabela permanece visível após clicar em "Aberto" | 5.06s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.lp-tabela-wrapper')
Expected: visible
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.lp-tabela-wrapper')[22m
`
| ❌ | **TAB-Aberto.05** | Se tab "Aberto" vazia: exibe mensagem de estado vazio (não tela em branco) | 0.00s |
  > `locator.count: Target page, context or browser has been closed`
| ❌ | **TAB-Aberto.06** | Badges visíveis após tab "Aberto" são todos do tipo correto | 0.00s |
  > `locator.count: Target page, context or browser has been closed`

*Gerado em 2026-04-15_02-24 por lista-pedidos.monitoring.spec.ts*
