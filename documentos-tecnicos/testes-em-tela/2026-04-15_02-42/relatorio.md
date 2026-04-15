# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 10/15 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ✅ | **H.13** | Clicar em Excluir com 1 pedido abre modal de confirmação (não exclui imediatamente) | 0.03s |
| ❌ | **H.14** | Cancelar modal de exclusão não altera a lista | 0.04s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m`
| ✅ | **I.01** | Chevron de expandir visível na linha pai | 0.04s |
| ✅ | **I.02** | Chevron tem aria-expanded="false" antes de clicar | 0.05s |
| ✅ | **I.03** | Clicar no chevron muda aria-expanded de "false" para "true" | 0.03s |
| ✅ | **I.04** | Linhas filho aparecem abaixo da linha pai após expandir | 0.03s |
| ✅ | **I.05** | Linhas filho têm índice numérico sequencial na 1ª célula | 0.04s |
| ✅ | **I.06** | Células de Part Number nos filhos não estão todas vazias | 0.04s |
| ✅ | **I.07** | Clicar novamente no chevron recolhe filhos — aria-expanded volta a "false" | 0.03s |
| ✅ | **I.08** | Expandir 2 pedidos simultaneamente — ambos ficam expandidos | 0.04s |
| ✅ | **I.09** | Chevron ativável com Enter (acessibilidade por teclado) | 0.03s |
| ❌ | **J.01** | Wrapper .lp-cards está visível acima da tabela | 10.06s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.lp-cards')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.lp-cards')[22m
`
| ❌ | **J.02** | .lp-cards tem display:grid (grid-template-columns definido) | 15.05s |
  > `locator.evaluate: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards')[22m
`
| ❌ | **J.03** | Nenhum card exibe texto "undefined" | 15.04s |
  > `locator.textContent: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards')[22m
`
| ❌ | **J.04** | Nenhum card exibe texto "NaN" | 9.61s |
  > `locator.textContent: Test timeout of 60000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards')[22m
`

*Gerado em 2026-04-15_02-42 por lista-pedidos.monitoring.spec.ts*
