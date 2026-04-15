# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 1/13 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **J.05** | Card "Total Pedidos" visível na área de KPIs | 10.07s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.lp-cards').getByText(/total pedidos/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for l`
| ❌ | **J.06** | Subtexto do card Total Pedidos no formato "X itens no total" | 10.04s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText(/\d+ itens no total/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByText(/\d+ itens no t`
| ❌ | **J.07** | Hover no card Total Pedidos exibe tooltip em até 700ms | 15.05s |
  > `locator.hover: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards > *').first()[22m
`
| ❌ | **J.08** | Card de Quantidade Total visível | 15.05s |
  > `locator.textContent: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards')[22m
`
| ❌ | **J.09** | Subtexto do card Qtd. Total contém "saldo atual" | 10.05s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText(/saldo atual/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByText(/saldo atual/i)[22m
`
| ❌ | **J.10** | Card de Valor Total visível | 15.07s |
  > `locator.textContent: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards')[22m
`
| ❌ | **J.11** | Subtexto "Soma de todos os pedidos" visível no card | 10.08s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText(/soma de todos os pedidos/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByText(/soma de `
| ❌ | **J.12** | Subtexto exato "Pedidos com status aberto" visível no card | 10.04s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText('Pedidos com status aberto')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByText('Pedidos `
| ❌ | **K.01** | Botão "+ Novo" visível na toolbar | 10.07s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.lp-dropdown-btn').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.lp-dropdown-`
| ❌ | **K.02** | Clicar "+ Novo" exibe opção "Novo Pedido" | 15.04s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-dropdown-btn').first()[22m
`
| ❌ | **K.03** | Dropdown "+ Novo" exibe opção "Novo Item" | 10.05s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText(/novo item/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByText(/novo item/i).fi`
| ✅ | **K.04** | Pressionar Escape fecha o dropdown "+ Novo" | 0.45s |
| ❌ | **K.05** | Clicar fora do dropdown fecha sem executar ação | 14.16s |
  > `locator.click: Test timeout of 60000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-dropdown-btn').first()[22m
`

*Gerado em 2026-04-15_02-45 por lista-pedidos.monitoring.spec.ts*
