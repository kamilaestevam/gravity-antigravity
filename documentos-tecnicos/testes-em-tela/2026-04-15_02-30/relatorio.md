# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 1/6 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **TAB-Aprovado.01** | Tab "Aprovado" está visível na barra de tabs | 10.07s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[class*="tab"]').filter({ hasText: /^Aprovado$/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - w`
| ✅ | **TAB-Aprovado.02** | Clicar "Aprovado" não recarrega a página (SPA) | 0.66s |
| ❌ | **TAB-Aprovado.03** | Tab "Aprovado" fica com estilo ativo após clicar | 30.09s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ❌ | **TAB-Aprovado.04** | Tabela permanece visível após clicar em "Aprovado" | 5.37s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.lp-tabela-wrapper')
Expected: visible
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.lp-tabela-wrapper')[22m
`
| ❌ | **TAB-Aprovado.05** | Se tab "Aprovado" vazia: exibe mensagem de estado vazio (não tela em branco) | 0.00s |
  > `locator.count: Target page, context or browser has been closed`
| ❌ | **TAB-Aprovado.06** | Badges visíveis após tab "Aprovado" são todos do tipo correto | 0.00s |
  > `locator.count: Target page, context or browser has been closed`

*Gerado em 2026-04-15_02-30 por lista-pedidos.monitoring.spec.ts*
