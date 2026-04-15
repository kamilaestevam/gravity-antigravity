# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 1/5 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **K.01** | Botão "+ Novo" visível na toolbar | 10.07s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.lp-dropdown-btn').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.lp-dropdown-`
| ❌ | **K.02** | Clicar "+ Novo" exibe opção "Novo Pedido" | 15.07s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-dropdown-btn').first()[22m
`
| ❌ | **K.03** | Dropdown "+ Novo" exibe opção "Novo Item" | 10.10s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText(/novo item/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByText(/novo item/i).fi`
| ✅ | **K.04** | Pressionar Escape fecha o dropdown "+ Novo" | 0.45s |
| ❌ | **K.05** | Clicar fora do dropdown fecha sem executar ação | 10.98s |
  > `locator.click: Test timeout of 60000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-dropdown-btn').first()[22m
`

*Gerado em 2026-04-15_02-48 por lista-pedidos.monitoring.spec.ts*
