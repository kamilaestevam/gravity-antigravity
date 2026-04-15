# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 0/7 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **G.01** | Campo de busca global visível na toolbar | 10.09s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('input[placeholder*="uscar"], input[placeholder*="Buscar"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
`
| ❌ | **G.02** | Placeholder do campo de busca é "Buscar pedido, exportador, referência..." | 15.06s |
  > `locator.getAttribute: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('input[placeholder*="uscar"], input[placeholder*="Buscar"]').first()[22m
`
| ❌ | **G.03** | Digitar 3 chars filtra a tabela sem recarregar a página | 15.06s |
  > `locator.fill: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('input[placeholder*="uscar"], input[placeholder*="Buscar"]').first()[22m
`
| ❌ | **G.04** | Pressionar Escape com campo focado limpa o valor | 6.05s |
  > `locator.fill: Test timeout of 60000ms exceeded.
Call log:
[2m  - waiting for locator('input[placeholder*="uscar"], input[placeholder*="Buscar"]').first()[22m
`
| ❌ | **G.05** | Após limpar busca, lista volta ao estado completo | 0.00s |
  > `locator.count: Target page, context or browser has been closed`
| ❌ | **G.06** | Busca com texto inexistente exibe estado vazio (não silencioso) | 0.00s |
  > `locator.fill: Target page, context or browser has been closed`
| ❌ | **G.07** | Busca case-insensitive: "gravity" == "GRAVITY" em quantidade de resultados | 0.00s |
  > `locator.fill: Target page, context or browser has been closed`

*Gerado em 2026-04-15_02-38 por lista-pedidos.monitoring.spec.ts*
