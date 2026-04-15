# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 54/69 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **K.06** | Hover em "Novo Pedido" exibe submenu com opção "Manual" | 15.06s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-dropdown-btn').first()[22m
`
| ❌ | **K.07** | Submenu "Novo Pedido" exibe opção "Importação" | 10.05s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText(/importa/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByText(/importa/i).first(`
| ✅ | **K.08** | Clicar "Manual" em Novo Pedido abre ModalNovoPedido (sem navegar) | 0.07s |
| ❌ | **K.09** | Hover em "Novo Item" exibe submenu com opção "Manual" | 15.05s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-dropdown-btn').first()[22m
`
| ✅ | **K.10** | Descrição "Adicionar item" visível no submenu de Novo Item | 0.04s |
| ✅ | **K.11** | Clicar "Manual" em Novo Item abre ModalNovoItem | 0.05s |
| ❌ | **L.01** | .lp-cards: display=grid | 15.05s |
  > `locator.evaluate: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.lp-cards')[22m
`
| ✅ | **L.02** | .lp-dropdown-btn: transition contém "0.1s" | 0.05s |
| ✅ | **L.03** | Célula de linha pai: color #f1f5f9 (rgb 241,245,249) | 0.05s |
| ✅ | **L.04** | Célula de linha filho: color #cbd5e1 (rgb 203,213,225) | 0.04s |
| ✅ | **L.05** | Célula de linha pai: font-weight=600 | 0.06s |
| ✅ | **L.06** | Célula de linha filho: font-weight=400 | 0.05s |
| ✅ | **M.01** | Durante fetch lento, tabela exibe skeleton ou spinner (não fica em branco) | 8.84s |
| ✅ | **M.02** | API retorna 500 → página não trava silenciosamente (sem crash JS) | 10.46s |
| ❌ | **M.03** | Lista vazia exibe "Nenhum pedido encontrado" e CTA Novo Pedido | 11.81s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByText(/nenhum pedido encontrado/i).or(getByText(/crie seu primeiro/i)).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms`
| ❌ | **M.04** | Botão "Novo Pedido" como CTA no estado vazio | 11.71s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('button', { name: /novo pedido/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getB`
| ✅ | **N.01** | Header "Incoterm" visível nas colunas (pode estar oculta por padrão) | 0.10s |
| ✅ | **N.02** | Popover Incoterm abre com Cresc. / Decresc. / campo de busca | 0.04s |
| ✅ | **N.03** | Célula Incoterm exibe valor ou "—" (nunca undefined/null) | 0.06s |
| ✅ | **N.04** | Pedido com incoterms divergentes entre itens exibe ícone de alerta ⚠ amarelo | 0.03s |
| ✅ | **N.05** | Dblclick em célula Incoterm abre input de edição inline | 0.05s |
| ❌ | **O.01** | Header "Valor Total do Pedido" visível | 0.07s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ✅ | **O.02** | Hover no header Valor Total → tooltip "Calculado com base nos itens" | 0.03s |
| ✅ | **O.03** | Célula Valor Total exibe badge de moeda + valor numérico | 0.05s |
| ✅ | **O.04** | Dblclick em Valor Total NÃO abre edição (campo calculado, não editável) | 0.05s |
| ✅ | **O.05** | Pedido com moedas divergentes exibe alerta ⚠ em Valor Total | 0.05s |
| ❌ | **P.01** | Header "Saldo do Pedido" visível | 0.11s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ✅ | **P.02** | Célula Saldo do Pedido com valor > 0 exibe cor azul (#60a5fa) | 0.03s |
| ✅ | **P.03** | Tooltip do Saldo é interativo — contém link para editar fórmula no Configurador | 0.05s |
| ✅ | **P.04** | Dblclick em Saldo do Pedido NÃO abre edição (campo calculado) | 0.03s |
| ✅ | **Q.01** | Header "NCM" visível | 0.06s |
| ✅ | **Q.02** | Célula NCM formata 8 dígitos como XXXX.XX.XX (ex: 8542.31.90) | 0.06s |
| ✅ | **Q.03** | Célula NCM usa font-family monospace | 0.04s |
| ✅ | **Q.04** | Pedido com NCMs diferentes entre itens exibe alerta ⚠ amarelo | 0.03s |
| ✅ | **Q.05** | Header "Número da Proforma" visível | 0.08s |
| ✅ | **Q.06** | Célula Nº Proforma exibe valor ou "—" (nunca vazio/null) | 0.05s |
| ✅ | **Q.07** | Header "Número da Invoice" visível | 0.03s |
| ✅ | **Q.08** | Célula Nº Invoice exibe valor ou "—" (nunca vazio/null) | 0.04s |
| ✅ | **R.01** | Header "Data P.O" visível | 0.13s |
| ✅ | **R.02** | Célula Data P.O exibe data no formato DD/MM/AAAA ou "—" | 0.04s |
| ✅ | **R.03** | Dblclick em Data P.O NÃO abre edição direta (campo data) | 0.06s |
| ✅ | **S.01-header** | Header "Qtd. Inicial do Pedido" visível | 0.06s |
| ✅ | **S.01-celula** | Célula "Qtd. Inicial do Pedido" exibe número ou "—" (nunca vazio) | 0.04s |
| ✅ | **S.01-readonly** | Célula "Qtd. Inicial do Pedido" NÃO abre edição — campo calculado | 0.05s |
| ✅ | **S.02-header** | Header "Qtd. Pronta do Pedido" visível | 0.07s |
| ✅ | **S.02-celula** | Célula "Qtd. Pronta do Pedido" exibe número ou "—" (nunca vazio) | 0.04s |
| ✅ | **S.02-readonly** | Célula "Qtd. Pronta do Pedido" NÃO abre edição — campo calculado | 0.06s |
| ✅ | **S.03-header** | Header "Qtd. Transferida do Pedido" visível | 0.06s |
| ✅ | **S.03-celula** | Célula "Qtd. Transferida do Pedido" exibe número ou "—" (nunca vazio) | 0.03s |
| ✅ | **S.03-readonly** | Célula "Qtd. Transferida do Pedido" NÃO abre edição — campo calculado | 0.04s |
| ✅ | **S.04-header** | Header "Qtd. Cancelada do Pedido" visível | 0.07s |
| ✅ | **S.04-celula** | Célula "Qtd. Cancelada do Pedido" exibe número ou "—" (nunca vazio) | 0.03s |
| ✅ | **S.04-readonly** | Célula "Qtd. Cancelada do Pedido" NÃO abre edição — campo calculado | 0.03s |
| ✅ | **T.01** | Header "Referência do Fabricante" visível quando ativado | 0.10s |
| ✅ | **T.02** | Célula Ref. Fabricante exibe valor ou "—" | 0.05s |
| ✅ | **T.03** | Dblclick em Ref. Fabricante abre input de edição inline | 0.05s |
| ✅ | **T.04** | Header "Cobertura Cambial" visível quando ativado | 0.07s |
| ✅ | **T.05** | Célula Cobertura Cambial exibe valor conhecido ou "—" | 0.03s |
| ✅ | **T.06** | Itens com coberturas cambiais diferentes exibem alerta ⚠ amarelo | 0.04s |
| ✅ | **T.07** | Header "Condição de Pagamento" visível quando ativado | 0.06s |
| ✅ | **T.08** | Célula Condição de Pagamento exibe valor ou "—" | 0.03s |
| ✅ | **T.09** | Dblclick em Condição de Pagamento abre edição inline | 0.06s |
| ❌ | **U.01** | Botão "Exportar" visível na toolbar | 10.05s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: getByRole('button', { name: /exportar/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for getByRo`
| ❌ | **U.02** | Clicar "Exportar" exibe opção "Excel" no submenu | 15.05s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: /exportar/i }).first()[22m
`
| ❌ | **U.03** | Submenu "Exportar" exibe opção "CSV" | 15.07s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: /exportar/i }).first()[22m
`
| ❌ | **U.04** | Submenu "Exportar" exibe opção "TXT" | 9.59s |
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

*Gerado em 2026-04-15_02-49 por lista-pedidos.monitoring.spec.ts*
