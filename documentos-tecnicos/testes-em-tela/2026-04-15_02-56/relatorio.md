# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 25/28 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ✅ | **U.08** | Clicar "Excel" inicia download de arquivo .xlsx | 0.08s |
| ✅ | **U.09** | Clicar "CSV" inicia download de arquivo .csv | 0.04s |
| ✅ | **U.10** | Exportar com tab "Aberto" ativa — exporta apenas pedidos abertos | 0.05s |
| ❌ | **V.01** | Botão "Colunas" visível na toolbar | 10.06s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('button', { name: /colunas/i }).first().or(locator('button').filter({ hasText: /colunas/i }).first())
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeV`
| ❌ | **V.02** | Clicar "Colunas" abre painel de seleção de colunas | 15.06s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: /colunas/i }).first().or(locator('button').filter({ hasText: /colunas/i }).first())[22m
`
| ✅ | **V.03** | Painel de colunas lista ao menos "Nº Pedido" e "Status" | 0.06s |
| ✅ | **V.04** | Pressionar Escape fecha o painel de colunas | 0.47s |
| ✅ | **V.05** | Ocultar coluna "Nome do Exportador" remove-a da tabela imediatamente | 0.05s |
| ✅ | **V.06** | Preferências de colunas persistem ao navegar para Dashboard e voltar | 0.07s |
| ✅ | **W.01** | Com 1 pedido selecionado, botão "Transferir" fica habilitado | 0.04s |
| ✅ | **W.02** | Clicar "Transferir" abre ModalTransferir sem navegar para outra página | 0.04s |
| ✅ | **W.03** | ModalTransferir exibe campo de quantidade para transferência | 0.03s |
| ✅ | **W.04** | Cancelar/Fechar ModalTransferir fecha sem alterar a lista | 0.04s |
| ✅ | **W.05** | Selecionar 2 pedidos — botão "Consolidar" fica habilitado | 0.04s |
| ✅ | **W.06** | Clicar "Consolidar" abre ModalConsolidar sem navegar | 0.04s |
| ✅ | **W.07** | Cancelar ModalConsolidar fecha sem consolidar | 0.46s |
| ✅ | **W.08** | Com 1+ pedido selecionado, ícone PencilLine (edição em massa) habilitado | 0.05s |
| ✅ | **W.09** | Clicar ícone de edição abre ModalEdicaoEmMassa com pedidos pré-carregados | 15.66s |
| ✅ | **W.10** | Com 1 pedido selecionado, ícone FilePdf (gerar PDF) habilitado | 0.04s |
| ✅ | **W.11** | Clicar ícone FilePdf abre ModalGerarPdf sem navegar | 0.04s |
| ✅ | **W.12** | Com 1 pedido selecionado, ícone CopySimple (duplicar) habilitado | 0.04s |
| ✅ | **W.13** | Clicar ícone Duplicar abre ModalDuplicar — não duplica imediatamente | 0.06s |
| ❌ | **W.14** | Cancelar ModalDuplicar não cria pedido novo na lista | 0.03s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m0[39m
Received:   [31m0[39m`
| ✅ | **X.01** | Clicar na linha pai abre DrawerPedido (painel lateral) | 0.04s |
| ✅ | **X.02** | Botão Eye (visualizar) na linha pai abre DrawerPedido | 0.07s |
| ✅ | **Y.01** | Popover de coluna numérica exibe campo de valor mínimo | 0.03s |
| ✅ | **Y.02** | Popover numérico exibe botões Cresc. e Decresc. | 0.05s |
| ✅ | **Y.03** | Digitar valor mínimo e aplicar filtra linhas com valor ≥ mínimo | 0.03s |

*Gerado em 2026-04-15_02-56 por lista-pedidos.monitoring.spec.ts*
