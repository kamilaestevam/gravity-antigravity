# 📋 Log de Execução: QA Auditor (E2E - ULTIMATE)
**Documento Auditado:** `testes-e2e/lista-pedidos-e2e.md`

---

### 🛡️ Metadados do Teste
- **Nome da Tela:** Lista de Pedidos
- **Ambiente:** [ ] Teste  | [ ] Produção
- **Local do Teste:** Navegador (Playwright Engine)
- **Tipo de Teste:** [ ] Unitário | [ ] Funcional | [x] E2E
- **Data do Teste:** __/__/____
- **Hora do Teste:** __:__

---

### ✅ Check-list de Análise (Ponto-a-Ponto)

#### 1. Infra, Performance & Integridade (SLA 4s)
- [ ] **LP-P01**: A URL `/pedidos` responde com status 200 — sem redirect inesperado ou tela de erro?
- [ ] **LP-P02**: O tempo até a tabela estar visível (`waitForSelector('.gtv-linha--pai')`) é inferior a 4 segundos em staging?
- [ ] **LP-P03**: A página está visualmente íntegra — sem quebras de layout, fontes não carregadas ou imagens 404?
- [ ] **LP-P04**: Em viewport 1440x900, não há scroll horizontal indesejado na tabela?
- [ ] **LP-P05**: O título da página exibe exatamente "Lista" — não "Pedidos", não "Lista de Pedidos", não vazio?
- [ ] **LP-P06**: O console do navegador não tem erros `[Error]` ou `[Uncaught]` durante o carregamento inicial?

#### 2. KPI Cards — Carregamento e Valores
- [ ] **LP-K01**: Os 5 cards KPI são renderizados na área acima da tabela — nenhum card ausente ou com layout quebrado?
- [ ] **LP-K02**: Nenhum card exibe texto `undefined`, `NaN`, ou campo completamente vazio após o carregamento dos dados?
- [ ] **LP-K03**: O card "Pedidos Abertos" exibe subtexto "Pedidos com status aberto" — exatamente este texto?
- [ ] **LP-K04**: O valor numérico do card "Pedidos Abertos" bate com a contagem de linhas pai com badge ABERTO visíveis na aba "Todos"?
- [ ] **LP-K05**: O card "Total Pedidos" exibe no subtexto o total de itens no formato "X itens no total"?
- [ ] **LP-K06**: O card "Quantidade Total" exibe o subtexto no formato "X.XXX,XX saldo atual" — com separador de milhar e 2 casas decimais?
- [ ] **LP-K07**: O card "Valor Total" exibe o valor no formato `R$ X.XXX,XX` — com símbolo de moeda BRL?
- [ ] **LP-K08**: Hover sobre um card exibe tooltip com informações adicionais — tooltip aparece e desaparece corretamente?

#### 3. Tabs de Filtro de Status
- [ ] **LP-T01**: As seguintes tabs estão presentes e visíveis nesta ordem: Todos | Rascunho | Aberto | Em Andamento | Aprovado | Transferido | Consolidado | Cancelado?
- [ ] **LP-T02**: A tab "Todos" está com estilo ativo (diferente das demais) ao carregar a página pela primeira vez?
- [ ] **LP-T03**: Clicar em "Aberto" — somente linhas com badge ABERTO aparecem na tabela; linhas com badge RASCUNHO ou CANCELADO somem?
- [ ] **LP-T04**: Clicar em "Rascunho" — somente linhas com badge RASCUNHO aparecem?
- [ ] **LP-T05**: Clicar em "Transferido" — somente linhas com badge TRANSFERIDO aparecem (status backend `transferencia`)?
- [ ] **LP-T06**: Clicar em "Consolidado" — somente linhas com badge CONSOLIDADO aparecem?
- [ ] **LP-T07**: Clicar em "Cancelado" — somente linhas com badge CANCELADO aparecem?
- [ ] **LP-T08**: Clicar em "Em Andamento" com nenhum pedido nesse status — tabela exibe estado vazio com mensagem (não fica em branco sem aviso)?
- [ ] **LP-T09**: Clicar em "Todos" após qualquer filtro de tab — todos os pedidos voltam imediatamente?
- [ ] **LP-T10**: A tab pessoal (nome do usuário logado) aparece ao final da lista de tabs e filtra apenas seus pedidos?

#### 4. Tabela — Estado Inicial
- [ ] **LP-L01**: As colunas visíveis por padrão são exatamente: Nº Pedido / Part Number | Tipo de Operação | Nome do Importador | Nome do Exportador | Status | Referência Importador | Referência Exportador?
- [ ] **LP-L02**: Linhas pai (pedidos) são visualmente mais destacadas que linhas filho — `font-weight: 600` e cor `#f1f5f9` na linha pai vs `font-weight: 400` e cor `#cbd5e1` na linha filho?
- [ ] **LP-L03**: Células sem valor exibem "—" (travessão) — nunca vazio, `null` ou `undefined`?
- [ ] **LP-L04**: O badge de status de cada pedido exibe a cor correspondente ao valor padrão de `STATUS_CORES_DEFAULT` (ex: `cancelado` → `#f87171`), salvo override por configuração?
- [ ] **LP-L05**: O badge EXPORTAÇÃO é visualmente distinto do badge IMPORTAÇÃO — cores diferentes aplicadas inline?
- [ ] **LP-L06**: O ícone de alerta (⚠️ / Warning) aparece na linha de pedidos com dados incompletos ou NCM inválido?

#### 5. Fluxo: Expandir e Recolher Pedido
- [ ] **LP-E01**: Clicar no chevron de um pedido com itens filho expande a linha e exibe os itens abaixo dela?
- [ ] **LP-E02**: O `aria-expanded` do chevron muda de `"false"` para `"true"` após o clique — verificável via `getAttribute('aria-expanded')`?
- [ ] **LP-E03**: Os itens filho aparecem com índice numérico sequencial (1, 2, 3...) na célula antes do Part Number?
- [ ] **LP-E04**: Cada item filho exibe seu Part Number corretamente na célula correspondente?
- [ ] **LP-E05**: Clicar novamente no chevron recolhe os itens — os elementos filho desaparecem do DOM ou ficam com `display: none`?
- [ ] **LP-E06**: Expandir um segundo pedido não colapsa o primeiro — ambos ficam expandidos simultaneamente?
- [ ] **LP-E07**: Pedido sem itens filho: chevron não é exibido ou está com `disabled` — nunca é clicável sem efeito?

#### 6. Fluxo: Busca
- [ ] **LP-B01**: Digitar "PO-2026/001" no campo de busca exibe somente esse pedido (e seus itens, se expandido)?
- [ ] **LP-B02**: Digitar "PCB-MCU-32F" (part number de item filho) retorna o pedido pai correspondente?
- [ ] **LP-B03**: Digitar "Gravity" retorna pedidos cujo `nome_exportador` contém "Gravity" — case-insensitive?
- [ ] **LP-B04**: Digitar texto sem resultado exibe estado vazio com mensagem — a tabela não fica em branco silencioso?
- [ ] **LP-B05**: Pressionar `Escape` com o campo de busca focado limpa o valor e restaura a lista?
- [ ] **LP-B06**: Limpar o campo clicando no X (se existir) ou apagando o texto restaura a lista completa?
- [ ] **LP-B07**: Busca combinada com filtro de tab — digitar "PO-2026" com tab "Aberto" ativa retorna apenas pedidos abertos que contenham "PO-2026"?

#### 7. Fluxo: Seleção e Ações em Massa
- [ ] **LP-S01**: Clicar no checkbox de PO-2026/001 — a linha recebe visual de selecionado e o checkbox fica marcado?
- [ ] **LP-S02**: Com 1 pedido selecionado, os ícones da toolbar ficam ativos (não `disabled`)?
- [ ] **LP-S03**: Com 1 pedido selecionado, o botão "Transferir" fica ativo?
- [ ] **LP-S04**: Selecionar 2 pedidos — o checkbox global exibe estado indeterminado (não marcado nem desmarcado)?
- [ ] **LP-S05**: Clicar no checkbox global com alguns pedidos selecionados seleciona todos os pedidos visíveis?
- [ ] **LP-S06**: Desmarcar o checkbox global deseleciona todos os pedidos?
- [ ] **LP-S07**: Com 0 pedidos selecionados, os ícones de ação estão desabilitados ou ocultos?
- [ ] **LP-S08**: Clicar no ícone de excluir com 1 pedido selecionado abre modal de confirmação — não exclui imediatamente?
- [ ] **LP-S09**: Cancelar o modal de confirmação fecha o modal e o pedido permanece na lista?
- [ ] **LP-S10**: Confirmar a exclusão remove o pedido da lista e exibe toast de sucesso?
- [ ] **LP-S11**: Clicar no ícone de edição em massa (PencilLine) abre `ModalEdicaoEmMassa` com os pedidos selecionados?
- [ ] **LP-S12**: Clicar no ícone de duplicar abre `ModalDuplicar` — não executa a duplicação direto?

#### 8. Fluxo: Botão "+ Novo"
- [ ] **LP-N01**: Clicar em "+ Novo" abre dropdown com as opções "Novo Pedido" e "Novo Item" visíveis?
- [ ] **LP-N02**: Hover em "Novo Item" exibe submenu com opção "Manual" com descrição "Adicionar item"?
- [ ] **LP-N03**: Clicar em "Novo Pedido" abre `ModalNovoPedido` — não navega para outra página?
- [ ] **LP-N04**: Clicar em "Manual" (sob Novo Item) abre `ModalNovoItem`?
- [ ] **LP-N05**: Clicar fora do dropdown (área da tabela) fecha o menu — sem executar ação?
- [ ] **LP-N06**: Pressionar `Escape` fecha o dropdown quando ele está aberto?

#### 9. Fluxo: Colunas Configuráveis
- [ ] **LP-C01**: Clicar em "Colunas" abre painel ou modal de seleção de colunas?
- [ ] **LP-C02**: Desmarcar a coluna "Nome do Exportador" a remove da tabela imediatamente?
- [ ] **LP-C03**: Marcar novamente a coluna "Nome do Exportador" a restaura na tabela?
- [ ] **LP-C04**: Navegar para "Dashboard" e voltar para "Lista" — a coluna ocultada continua oculta (preferência persistida)?

#### 10. Fluxo: Exportar
- [ ] **LP-X01**: Clicar em "Exportar" abre submenu com os formatos disponíveis?
- [ ] **LP-X02**: Selecionar "Excel" inicia o download de um arquivo `.xlsx`?
- [ ] **LP-X03**: Selecionar "CSV" inicia o download de um arquivo `.csv`?
- [ ] **LP-X04**: Exportar com tab "Aberto" ativa — o arquivo baixado contém apenas os pedidos com status aberto?
- [ ] **LP-X05**: Exportar com busca ativa — o arquivo contém apenas os pedidos filtrados pela busca?

#### 11. Fluxo: Filtros de Coluna (Popover)
- [ ] **LP-FC01**: Clicar no ícone de filtro do header "Status" abre popover de filtro por enum?
- [ ] **LP-FC02**: Selecionar "Aberto" no popover e aplicar filtra as linhas para exibir apenas pedidos ABERTO?
- [ ] **LP-FC03**: Clicar em "Limpar" no popover remove o filtro e restaura a lista?
- [ ] **LP-FC04**: Clicar fora do popover de filtro fecha o popover sem aplicar filtro?
- [ ] **LP-FC05**: Com filtro de coluna ativo, um chip de filtro aparece acima da tabela indicando o filtro aplicado?
- [ ] **LP-FC06**: Clicar no X do chip de filtro ativo remove o filtro e restaura a lista?

#### 12. Fluxo: Ordenação de Coluna
- [ ] **LP-O01**: Clicar no ícone de filtro e selecionar "A → Z" no header de uma coluna de texto ordena as linhas em ordem crescente?
- [ ] **LP-O02**: Selecionar "Z → A" ordena em ordem decrescente?
- [ ] **LP-O03**: A ordenação é aplicada ao conjunto filtrado — não ignora tabs ou buscas ativas?

#### 13. Navegação Lateral e Breadcrumb
- [ ] **LP-M01**: Clicar em "Dashboard" no menu lateral navega para a tela de dashboard sem reload completo da aplicação?
- [ ] **LP-M02**: Clicar em "Kanban" navega para a tela de kanban?
- [ ] **LP-M03**: Clicar em "Histórico" navega para a tela de histórico?
- [ ] **LP-M04**: Clicar em "Configurações" navega para a tela de configurações?
- [ ] **LP-M05**: O item "Lista" no menu lateral está com estilo ativo (destacado) enquanto a tela Lista estiver aberta — e perde o destaque ao navegar para outra tela?

---

### 📸 Prova Visual (QA E2E):
*(Anexar os seguintes prints:)*
1. `01-lista-estado-inicial.png` — tela carregada com todos os pedidos, tab "Todos" ativa
2. `02-pedido-expandido.png` — após expandir um pedido com itens filho visíveis
3. `03-tab-filtro-aberto.png` — após clicar na tab "Aberto", apenas pedidos ABERTO visíveis
4. `04-busca-ativa.png` — campo de busca preenchido com resultado filtrado
5. `05-selecao-checkbox.png` — 1+ pedidos selecionados com toolbar de ações ativa
6. `06-dropdown-novo.png` — dropdown "+ Novo" aberto com submenu "Novo Item" visível

---

### 📊 Resultado Final:
[ ] **APROVADO** (Sem pendências)
[ ] **REPROVADO** (Erro crítico em um dos fluxos acima)
[ ] **RESSALVAS** (Funciona, mas com ajustes de UX/Estética necessários)
