# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 0/7 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **U.01** | Botão "Exportar" visível na toolbar | 10.09s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('button', { name: /exportar/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByRo`
| ❌ | **U.02** | Clicar "Exportar" exibe opção "Excel" no submenu | 15.06s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: /exportar/i }).first()[22m
`
| ❌ | **U.03** | Submenu "Exportar" exibe opção "CSV" | 15.06s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: /exportar/i }).first()[22m
`
| ❌ | **U.04** | Submenu "Exportar" exibe opção "TXT" | 6.18s |
  > `locator.click: Test timeout of 60000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: /exportar/i }).first()[22m
`
| ❌ | **U.05** | Submenu "Exportar" exibe opção "XML" | 0.00s |
  > `locator.click: Target page, context or browser has been closed`
| ❌ | **U.06** | Submenu "Exportar" exibe opção "JSON" | 0.00s |
  > `locator.click: Target page, context or browser has been closed`
| ❌ | **U.07** | Submenu "Exportar" exibe opção "PDF" | 0.00s |
  > `locator.click: Target page, context or browser has been closed`

*Gerado em 2026-04-15_02-55 por lista-pedidos.monitoring.spec.ts*
