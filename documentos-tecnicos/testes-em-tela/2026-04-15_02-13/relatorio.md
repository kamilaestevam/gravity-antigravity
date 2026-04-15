# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 0/8 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **A1.03** | Ícone de filtro visível no header "Nº Pedido / Part Number" | 10.09s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.gtv-th').filter({ hasText: 'Nº Pedido' }).first().locator('button').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000`
| ❌ | **A1.04** | Clicar no ícone de filtro abre popover da coluna | 0.05s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ❌ | **A1.05** | Popover exibe label "Nº Pedido" no cabeçalho (nome da coluna) | 15.06s |
  > `locator.textContent: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('[aria-label*="Filtrar"]').first().locator('.lp-filtro-coluna-nome').first()[22m
`
| ❌ | **A1.06** | Botão "Cresc." (ordenar crescente) visível no popover | 10.07s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[aria-label*="Filtrar"]').first().getByText('Cresc.')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting`
| ❌ | **A1.07** | Botão "Decresc." (ordenar decrescente) visível no popover | 10.08s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[aria-label*="Filtrar"]').first().getByText('Decresc.')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiti`
| ❌ | **A1.08** | Campo de input de busca de texto visível no popover | 0.94s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[aria-label*="Filtrar"]').first().locator('input[type="text"], input:not([type])').first()
Expected: visible
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms`
| ❌ | **A1.09** | Botão "× Limpar filtro" visível no rodapé do popover | 0.01s |
  > `expect.toBeVisible: Target page, context or browser has been closed`
| ❌ | **A1.10** | Botão "Aplicar" visível no rodapé (coluna tipo texto) | 0.00s |
  > `expect.toBeVisible: Target page, context or browser has been closed`

*Gerado em 2026-04-15_02-13 por lista-pedidos.monitoring.spec.ts*
