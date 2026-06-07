# TST-EMT-PEDIDO-LISTA-EDITAR-SALVAR-001

| Arquivo | Função |
|---------|--------|
| `plano-teste-em-tela.md` | Roteiro e prints |
| `run-lista-editar-salvar.ts` | Runner Playwright |

Colunas cobertas:

- **Nº PEDIDO / Nº ITEM** (prints 03–05)
- **TIPO DE OPERAÇÃO** (passos **06–12**)
- **REFERÊNCIA IMPORTADOR** (passos **13–16**)
- **REFERÊNCIA EXPORTADOR** (passos **17–20**)
- **INCOTERM** (passos **21–24**: select Cadastros, checkbox, item isolado, alerta)
- **DESCRIÇÃO DO ITEM** (passos **25–28**: tooltip ghost + texto + checkbox; sem alerta de divergência)
- **LOGÍSTICA** (passos **29–34**: Porto/País/Aeroporto — tooltip espelhada + edição pedido/item)
- **NCM** (passos **35–41**: código `8528.59.00`, busca `monitor`, tooltip «Editável no pedido»)

Resultados: `../resultado-teste/<runId>/` (PNG + `RESULTADO.txt`).
