# Relatório — Lista de Pedidos (Monitoramento Atômico)
**Resultado:** ❌ REPROVADO — 26/45 aprovados

| Status | ID | Descrição | Duração |
|--------|----|-----------|---------|
| ❌ | **A1.26** | Busca com texto inexistente exibe estado vazio (não fica em branco) | 15.07s |
  > `locator.fill: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('[aria-label*="Filtrar"]').first().locator('input').first()[22m
`
| ❌ | **A1.27** | Limpar filtro de busca sem resultado restaura lista | 15.07s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('[aria-label*="Filtrar"]').first().getByText(/limpar filtro/i)[22m
`
| ❌ | **A1.28** | Célula col1 da linha 1 não exibe "null", "undefined" ou string vazia | 15.06s |
  > `locator.textContent: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.gtv-linha--pai').first().locator('.gtv-celula').first()[22m
`
| ✅ | **A1.29** | Células col1 sem valor exibem "—" (travessão), nunca vazio | 0.04s |
| ❌ | **A1.30** | Hover na célula col1 exibe tooltip com título e descrição | 15.05s |
  > `locator.hover: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.gtv-linha--pai').first().locator('.gtv-celula').first()[22m
`
| ❌ | **A1.31** | Clicar na célula col1 NÃO abre input de edição (campo não editável) | 15.05s |
  > `locator.dblclick: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('.gtv-linha--pai').first().locator('.gtv-celula').first()[22m
`
| ✅ | **A1.32** | Linhas filho exibem Part Number na col1 (diferente do número do pedido) | 0.03s |
| ❌ | **B2.01** | Header col2 exibe texto exato "Tipo de Operação" | 0.11s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ❌ | **B2.02** | Ícone de filtro visível no header "Tipo de Operação" | 10.05s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.gtv-th').filter({ hasText: 'Tipo de Operação' }).first().locator('button').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeou`
| ❌ | **B2.03** | Popover de filtro abre ao clicar no ícone | 0.06s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ❌ | **B2.04** | Popover exibe opção "Importação" como checkbox | 10.05s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[aria-label*="Filtrar"]').first().getByText('Importação')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - wai`
| ❌ | **B2.05** | Popover exibe opção "Exportação" como checkbox | 10.03s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[aria-label*="Filtrar"]').first().getByText('Exportação')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - wai`
| ✅ | **B2.06** | Tipo enum NÃO exibe botão "Aplicar" — aplica ao marcar o checkbox | 0.05s |
| ❌ | **B2.07** | Marcar "Importação" aplica filtro sem precisar de botão Aplicar | 15.06s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('[aria-label*="Filtrar"]').first().getByText('Importação').locator('..').or(locator('[aria-label*="Filtrar"]').first().locator('label').filter({ hasText: 'Importação' })).first()[22m
`
| ✅ | **B2.08** | Fechar popover — tabela exibe apenas pedidos de Importação | 0.68s |
| ✅ | **B2.09** | Limpar chip de filtro restaura todos os tipos de operação | 0.06s |
| ❌ | **B2.10** | Marcar "Exportação" aplica filtro de tipo exportação | 15.08s |
  > `locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('[aria-label*="Filtrar"]').first().locator('label').filter({ hasText: 'Exportação' }).first()[22m
`
| ✅ | **B2.11** | Marcar "Importação" também (ambos selecionados) restaura lista completa | 0.97s |
| ✅ | **B2.12** | Badge "Importação" tem cor inline azul (#60a5fa) | 0.04s |
| ✅ | **B2.13** | Badge "Exportação" tem cor inline verde (#34d399) | 0.07s |
| ✅ | **B2.14** | Badges da col2 não estão cortados (width > 60px) | 0.05s |
| ❌ | **C3.01** | Header col3 exibe texto "Nome do Exportador" | 0.08s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ✅ | **C3.02** | "Cresc." em Exportador ordena lista por nome do exportador A→Z | 0.04s |
| ✅ | **C3.03** | "Decresc." em Exportador ordena lista por nome do exportador Z→A | 0.04s |
| ✅ | **C3.04** | Busca parcial por nome de exportador filtra corretamente | 0.04s |
| ✅ | **C3.05** | Célula Exportador em linha de Importação aceita duplo clique para edição | 0.07s |
| ❌ | **D5.01** | Header "Status" visível e com texto exato | 0.06s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ✅ | **D5.02** | Popover "Status" exibe ao menos "Aberto" como opção | 0.04s |
| ✅ | **D5.03** | Selecionar "Aberto" no popover mostra apenas linhas com status Aberto | 0.03s |
| ✅ | **D5-COR-Rascunho** | Badge "Rascunho" tem cor inline #94a3b8 | 0.05s |
| ✅ | **D5-COR-Aberto** | Badge "Aberto" tem cor inline #f472b6 | 0.05s |
| ✅ | **D5-COR-Em_Andamento** | Badge "Em Andamento" tem cor inline #fb923c | 0.04s |
| ✅ | **D5-COR-Aprovado** | Badge "Aprovado" tem cor inline #facc15 | 0.05s |
| ✅ | **D5-COR-Transferido** | Badge "Transferido" tem cor inline #2dd4bf | 0.05s |
| ✅ | **D5-COR-Consolidado** | Badge "Consolidado" tem cor inline #a78bfa | 0.05s |
| ✅ | **D5-COR-Cancelado** | Badge "Cancelado" tem cor inline #f87171 | 0.06s |
| ✅ | **D5.11** | Status desconhecido/inexistente usa cor fallback #64748b | 0.05s |
| ✅ | **D5.12** | Clicar no badge de status abre seletor inline de status | 0.06s |
| ❌ | **E6.01** | Header "Referência Importador" visível nas colunas | 0.07s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ✅ | **E6.02** | Dblclick em célula "Ref. Importador" abre input de edição (campo editável) | 0.03s |
| ❌ | **TAB-Todos.01** | Tab "Todos" está visível na barra de tabs | 10.06s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[class*="tab"]').filter({ hasText: /^Todos$/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - wait`
| ✅ | **TAB-Todos.02** | Clicar "Todos" não recarrega a página (SPA) | 0.65s |
| ❌ | **TAB-Todos.03** | Tab "Todos" fica com estilo ativo após clicar | 30.08s |
  > `[2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m`
| ❌ | **TAB-Todos.04** | Tabela permanece visível após clicar em "Todos" | 9.00s |
  > `[2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('.lp-tabela-wrapper')
Expected: visible
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('.lp-tabela-wrapper')[22m
`
| ❌ | **TAB-Todos.05** | Se tab "Todos" vazia: exibe mensagem de estado vazio (não tela em branco) | 0.00s |
  > `locator.count: Target page, context or browser has been closed`

*Gerado em 2026-04-15_02-17 por lista-pedidos.monitoring.spec.ts*
