# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 2/5 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **A1.11** | Clicar "Cresc." fecha o popover | 15.07s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('[aria-label*="Filtrar"]').first().getByText('Cresc.')[22m
`
| ❌ | **A1.12** | Tabela continua visível e com linhas após ordenar crescente | 10.05s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.lp-tabela-wrapper')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.lp-tabela-wrapper'`
| ✅ | **A1.13** | Valores col1 após crescente estão em ordem A→Z (1ª célula ≤ última) | 0.05s |
| ❌ | **A1.14** | Clicar "Decresc." fecha o popover | 15.06s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('[aria-label*="Filtrar"]').first().getByText('Decresc.')[22m
`
| ✅ | **A1.15** | Valores col1 após decrescente estão em ordem Z→A (1ª célula ≥ última) | 0.04s |

*Gerado em 2026-04-15_02-14 por lista-pedidos.monitoring.spec.ts*
