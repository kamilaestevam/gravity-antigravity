# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 2/8 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ✅ | **G.08** | Busca com tab "Aberto" ativa retorna interseção (abertos + termo) | 0.07s |
| ❌ | **H.01** | Checkbox da primeira linha pai está visível | 10.09s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.gtv-linha--pai').first().locator('input[type="checkbox"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
`
| ❌ | **H.02** | Clicar no checkbox marca a linha (checked=true) | 15.06s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.gtv-linha--pai').first().locator('input[type="checkbox"]').first()[22m
`
| ❌ | **H.03** | Linha selecionada recebe estilo visual de seleção imediatamente | 15.05s |
  > `locator.evaluate: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.gtv-linha--pai').first()[22m
`
| ❌ | **H.04** | Com 1 pedido selecionado, botões de ação ficam habilitados (sem disabled) | 0.07s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m`
| ✅ | **H.05** | Botão "Transferir" não está disabled com 1 pedido selecionado | 0.04s |
| ❌ | **H.06** | Clicar novamente no checkbox desmarca a linha | 9.44s |
  > `locator.click: Test timeout of 60000ms exceeded.
Call log:
[2m  - waiting for locator('.gtv-linha--pai').first().locator('input[type="checkbox"]').first()[22m
`
| ❌ | **H.07** | Com 0 pedidos selecionados, botões de ação voltam a disabled | 0.00s |
  > `page.screenshot: Target page, context or browser has been closed`

*Gerado em 2026-04-15_02-39 por lista-pedidos.monitoring.spec.ts*
