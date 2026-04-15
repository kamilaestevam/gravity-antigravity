# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 0/4 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **J.01** | Wrapper .lp-cards está visível acima da tabela | 10.07s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.lp-cards')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.lp-cards')[22m
`
| ❌ | **J.02** | .lp-cards tem display:grid (grid-template-columns definido) | 15.06s |
  > `locator.evaluate: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards')[22m
`
| ❌ | **J.03** | Nenhum card exibe texto "undefined" | 15.06s |
  > `locator.textContent: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards')[22m
`
| ❌ | **J.04** | Nenhum card exibe texto "NaN" | 6.07s |
  > `locator.textContent: Test timeout of 60000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards')[22m
`

*Gerado em 2026-04-15_02-44 por lista-pedidos.monitoring.spec.ts*
