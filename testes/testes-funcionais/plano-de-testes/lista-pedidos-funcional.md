# 📋 Log de Execução: QA Auditor (Funcional - ULTIMATE)
**Documento Auditado:** `testes-funcionais/lista-pedidos-funcional.md`

---

### 🛡️ Metadados do Teste
- **Nome da Tela:** Lista de Pedidos
- **Ambiente:** [ ] Teste  | [x] Produção (Staging)
- **Local do Teste:** Componente & Integração (React DOM)
- **Tipo de Teste:** [ ] Unitário | [x] Funcional | [ ] E2E
- **Data do Teste:** __/__/____
- **Hora do Teste:** __:__

---

### ✅ Check-list de Análise (Experiência do Usuário & Interação)

#### 1. Tabs de Filtro — Navegação de Estado
- [ ] **LP-F01**: Clicar em uma tab muda o filtro sem recarregar a página — a URL pode mudar mas o React não desmonta o componente (navegação SPA)?
- [ ] **LP-F02**: Ao clicar em "Rascunho", apenas pedidos com `status === 'draft'` aparecem — o mapeamento usa a chave backend `draft`, não o label `Rascunho`?
- [ ] **LP-F03**: Ao clicar em "Transferido", apenas pedidos com `status === 'transferencia'` aparecem — a chave backend é `transferencia`, não `transferido`?
- [ ] **LP-F04**: Ao clicar em "Todos", todos os pedidos voltam independente do status?
- [ ] **LP-F05**: A tab ativa mantém o estado de expansão dos pedidos — expandir PO-2026/001 e trocar de tab não colapsa a expansão ao voltar para "Todos"?
- [ ] **LP-F06**: A tab pessoal (ex: "DANIEL") filtra apenas pedidos onde o campo de responsável é o usuário logado — não exibe pedidos de outros usuários?
- [ ] **LP-F07**: Ao trocar de tab, o `aria-selected="true"` migra para a tab clicada e `aria-selected="false"` nas demais?

#### 2. Expandir e Recolher Itens Filho
- [ ] **LP-F08**: Clicar no chevron de uma linha pai com itens expande os itens filho abaixo dela imediatamente (sem loading)?
- [ ] **LP-F09**: Clicar novamente no chevron recolhe os itens filho — sem animação de delay perceptível (< 150ms)?
- [ ] **LP-F10**: O chevron tem `aria-expanded="false"` no estado recolhido e `aria-expanded="true"` no estado expandido — o atributo atualiza sincronamente com o clique?
- [ ] **LP-F11**: Ao expandir, os itens filho aparecem com índice numérico sequencial começando em `1` — derivado de `sequencia_item` ou posição no array?
- [ ] **LP-F12**: Pedido sem itens filho: o chevron é renderizado desabilitado ou não é renderizado — nunca exibe chevron clicável que não faz nada?
- [ ] **LP-F13**: Expandir PO-2026/001 e depois expandir PO-2026/002 — ambos ficam expandidos simultaneamente (não é accordion exclusivo)?

#### 3. Seleção de Linhas — Checkboxes
- [ ] **LP-F14**: Clicar no checkbox de uma linha pai a seleciona — o visual de seleção (fundo destacado ou borda) é imediato?
- [ ] **LP-F15**: Ao selecionar ao menos 1 pedido, os ícones de ação na toolbar (editar, excluir, duplicar, consolidar, gerar PDF) ficam habilitados (`disabled` removido)?
- [ ] **LP-F16**: Ao selecionar ao menos 1 pedido, o botão "Transferir" fica ativo?
- [ ] **LP-F17**: O checkbox global no header seleciona todos os pedidos visíveis na aba atual — não seleciona pedidos de outras tabs?
- [ ] **LP-F18**: Desmarcar o checkbox global deseleciona todos os pedidos de uma vez — não um a um?
- [ ] **LP-F19**: Com alguns (mas não todos) pedidos selecionados, o checkbox global exibe estado indeterminado (`indeterminate` no DOM)?
- [ ] **LP-F20**: Selecionar a linha pai não seleciona automaticamente os itens filho — a seleção é independente por nível?
- [ ] **LP-F21**: Ao aplicar filtro de tab com pedidos selecionados, a seleção é limpa — não carrega pedidos ocultos como selecionados?

#### 4. Busca
- [ ] **LP-F22**: Digitar no campo de busca filtra as linhas — o filtro não dispara a cada tecla mas tem debounce ou filtra client-side sem requisição?
- [ ] **LP-F23**: A busca encontra pedidos pelo `numero_pedido` (ex: "PO-2026/001")?
- [ ] **LP-F24**: A busca encontra pedidos pelo `nome_exportador` (ex: "Gravity")?
- [ ] **LP-F25**: A busca encontra itens filho pelo `part_number` (ex: "PCB-MCU-32F") e exibe o pedido pai correspondente?
- [ ] **LP-F26**: Busca case-insensitive — digitar "gravity" retorna o mesmo que "Gravity"?
- [ ] **LP-F27**: Com busca sem resultado, a tabela exibe estado vazio com mensagem — nunca fica vazia sem feedback visual?
- [ ] **LP-F28**: Limpar o campo de busca restaura a lista completa imediatamente?
- [ ] **LP-F29**: Pressionar `Escape` com o campo de busca focado limpa o valor e retira o foco do campo?

#### 5. Botão "+ Novo" — Dropdown
- [ ] **LP-F30**: Clicar em "+ Novo" abre dropdown com ao menos as opções "Novo Pedido" e "Novo Item"?
- [ ] **LP-F31**: Hover em "Novo Item" abre submenu com a opção "Manual" — o submenu fica visível enquanto o mouse está sobre ele?
- [ ] **LP-F32**: Clicar fora do dropdown (qualquer área da página) fecha o menu via `mousedown` listener — sem executar nenhuma ação?
- [ ] **LP-F33**: Pressionar `Escape` fecha o dropdown quando ele está aberto?
- [ ] **LP-F34**: O dropdown fecha automaticamente após selecionar uma opção — não permanece aberto após navegação?
- [ ] **LP-F35**: O hover no `.lp-dropdown-btn` aplica `background: var(--bg-hover)` com `transition: background 0.1s` — transição suave sem flash?

#### 6. Ações em Massa (Toolbar)
- [ ] **LP-F36**: Com 0 pedidos selecionados, os ícones de ação estão desabilitados (`disabled` ou `aria-disabled="true"`) ou completamente ocultos?
- [ ] **LP-F37**: Com 1+ pedidos selecionados, todos os ícones relevantes ficam clicáveis?
- [ ] **LP-F38**: O ícone de excluir (lixeira) abre modal de confirmação antes de deletar — nunca deleta imediatamente?
- [ ] **LP-F39**: Cancelar o modal de confirmação de exclusão não altera o estado da lista?
- [ ] **LP-F40**: O ícone de duplicar abre `ModalDuplicar` (não executa a duplicação direto) — o usuário confirma antes?
- [ ] **LP-F41**: O ícone de edição em massa (lápis/PencilLine) abre `ModalEdicaoEmMassa` com os pedidos selecionados pré-carregados?
- [ ] **LP-F42**: O ícone de transferir abre `ModalTransferir` — não navega para outra tela?

#### 7. Colunas Configuráveis
- [ ] **LP-F43**: Clicar em "Colunas" abre painel ou modal de seleção de colunas?
- [ ] **LP-F44**: Ocultar uma coluna remove-a da tabela imediatamente — sem recarregar a página?
- [ ] **LP-F45**: Reativar uma coluna a restaura na posição original — não vai para o final?
- [ ] **LP-F46**: A preferência de colunas visíveis persiste ao navegar para "Dashboard" e voltar para "Lista" — salva em `localStorage` ou no backend?

#### 8. Exportar
- [ ] **LP-F47**: Clicar em "Exportar" abre submenu com os formatos disponíveis: Excel, CSV, TXT, XML, JSON, PDF?
- [ ] **LP-F48**: Cada formato chama a função específica: `exportarExcel`, `exportarCSV`, `exportarTXT`, `exportarXML`, `exportarJSON`, `exportarPDF`?
- [ ] **LP-F49**: Exportar com filtro de tab ativo exporta apenas os pedidos da tab — não todos do banco?
- [ ] **LP-F50**: Exportar com busca ativa exporta apenas os pedidos filtrados pela busca?

#### 9. Interações "Alive & Premium" (Design Ativo)
- [ ] **LP-F51**: Hover sobre uma linha da tabela altera o fundo da linha (highlight) — transição não é brusca (instantânea)?
- [ ] **LP-F52**: Hover sobre os ícones da toolbar exibe tooltip com o nome da ação via `TooltipGlobal` — tooltip aparece após delay padrão (não imediato)?
- [ ] **LP-F53**: O tooltip do campo "Nº Pedido / Part Number" aparece no hover via `TooltipGlobal` com título e descrição preenchidos?
- [ ] **LP-F54**: O badge de status tem cor aplicada inline via `style={{ background: getStatusCor(status) }}` — a cor muda imediatamente ao alterar configuração de status?

#### 10. Estados de Carregamento e Erro
- [ ] **LP-F55**: Durante o carregamento inicial (fetch da API), a tabela exibe skeleton ou spinner — nunca fica em branco sem feedback?
- [ ] **LP-F56**: Ao trocar de tab, se houver nova requisição ao backend, um indicador de loading aparece na tabela?
- [ ] **LP-F57**: Quando a API retorna erro (5xx), a tabela exibe mensagem de erro com opção de tentar novamente — não trava silenciosamente?
- [ ] **LP-F58**: Quando a lista carrega vazia (nenhum pedido cadastrado), exibe estado vazio com mensagem e CTA para criar o primeiro pedido?

#### 11. Acessibilidade
- [ ] **LP-F59**: As tabs têm `role="tab"` e o container tem `role="tablist"` — navegáveis com setas do teclado após o foco inicial?
- [ ] **LP-F60**: A tab ativa tem `aria-selected="true"` e `aria-controls` apontando para o painel de conteúdo correto?
- [ ] **LP-F61**: Checkboxes têm `aria-label` descritivo — não apenas `aria-label=""` vazio?
- [ ] **LP-F62**: O chevron de expandir é ativável via `Enter` ou `Space` além do clique com mouse?
- [ ] **LP-F63**: O foco visual (outline) é visível ao navegar via `Tab` por todos os elementos interativos?
- [ ] **LP-F64**: Quando itens filho são exibidos após expandir, o `aria-expanded` do chevron atualiza em tempo real — leitores de tela anunciam a mudança?

---

### 📊 Resultado Final:
[ ] **APROVADO** | [ ] **REPROVADO** | [ ] **RESSALVAS**
