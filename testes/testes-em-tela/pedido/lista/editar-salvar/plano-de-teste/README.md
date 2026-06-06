# TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001

| Arquivo | Função |
|---------|--------|
| `plano-teste-em-tela.md` | Roteiro e prints (Nº PEDIDO / Nº ITEM + **TIPO DE OPERAÇÃO** + **REFERÊNCIA IMPORTADOR**) |
| `run-lista-editar-salvar.ts` | Runner Playwright |

Colunas cobertas: **Nº PEDIDO / Nº ITEM** (prints 03–05), **TIPO DE OPERAÇÃO** (passos **06–12**) e **REFERÊNCIA IMPORTADOR** (passos **13–16**: salvar só pedido, replicar com checkbox, editar item, alerta divergência).

Resultados: `../resultado-teste/<runId>/` (PNG + `RESULTADO.txt`).
