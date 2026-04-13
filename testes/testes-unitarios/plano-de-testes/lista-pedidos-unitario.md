# 📋 Log de Execução: QA Auditor (Unitário - ULTIMATE)
**Documento Auditado:** `testes-unitarios/lista-pedidos-unitario.md`

---

### 🛡️ Metadados do Teste
- **Nome da Tela:** Lista de Pedidos
- **Ambiente:** [x] Teste  | [ ] Produção
- **Local do Teste:** Lógica de Código & Configuração (Vitest)
- **Tipo de Teste:** [x] Unitário | [ ] Funcional | [ ] E2E
- **Data do Teste:** __/__/____
- **Hora do Teste:** __:__

---

### ✅ Check-list de Análise (Meticulosidade Máxima)

#### 1. Formatação de Valores — Funções Utilitárias
- [ ] **LP-U01**: `fmtQuantidade(8900, 2)` retorna `"8.900,00"` — usa `toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`?
- [ ] **LP-U02**: `fmtQuantidade(0)` retorna `"0,00"` — nunca retorna `undefined`, `NaN` ou string vazia?
- [ ] **LP-U03**: `fmtQuantidade(8900, 0)` retorna `"8.900"` — parâmetro `casas` é respeitado?
- [ ] **LP-U04**: `fmtMoeda(180300)` retorna `"R$ 180.300,00"` — usa `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })`?
- [ ] **LP-U05**: `fmtMoeda(180300, 'USD')` retorna o valor formatado em USD — parâmetro `moeda` sobrescreve o padrão `'BRL'`?
- [ ] **LP-U06**: `fmtMoeda(0)` retorna `"R$ 0,00"` — nunca retorna `undefined` ou `NaN`?

#### 2. Lógica de Status — `getStatusCor` e `getStatusLabel`
- [ ] **LP-U07**: `getStatusCor('draft')` retorna `'#94a3b8'` quando localStorage `pedido:status_config` está vazio?
- [ ] **LP-U08**: `getStatusCor('aberto')` retorna `'#f472b6'` (padrão) quando não há override no localStorage?
- [ ] **LP-U09**: `getStatusCor('em_andamento')` retorna `'#fb923c'` no estado padrão?
- [ ] **LP-U10**: `getStatusCor('aprovado')` retorna `'#facc15'` no estado padrão?
- [ ] **LP-U11**: `getStatusCor('transferencia')` retorna `'#2dd4bf'` no estado padrão?
- [ ] **LP-U12**: `getStatusCor('consolidado')` retorna `'#a78bfa'` no estado padrão?
- [ ] **LP-U13**: `getStatusCor('cancelado')` retorna `'#f87171'` no estado padrão?
- [ ] **LP-U14**: `getStatusCor('status_inexistente')` retorna `'#64748b'` como fallback — nunca retorna `undefined`?
- [ ] **LP-U15**: Com override no localStorage `pedido:status_config`, `getStatusCor` retorna a cor customizada em vez do padrão?
- [ ] **LP-U16**: `getStatusLabel('draft')` retorna `'Rascunho'`?
- [ ] **LP-U17**: `getStatusLabel('transferencia')` retorna `'Transferido'` — não `'transferencia'` nem `'Transferencia'`?
- [ ] **LP-U18**: `getStatusLabel('status_customizado')` retorna o label do localStorage quando existir — e o valor raw quando não existir?

#### 3. Fórmula de Saldo — `lerSaldoFormulaAST` e `SALDO_FORMULA_PADRAO`
- [ ] **LP-U19**: `SALDO_FORMULA_PADRAO` é exatamente `'quantidade_total_inicial_pedido - quantidade_transferida_total - quantidade_cancelada_total_pedido'`?
- [ ] **LP-U20**: `lerSaldoFormulaAST()` retorna o AST da fórmula padrão quando localStorage `pedido:saldo_formula` está vazio?
- [ ] **LP-U21**: `lerSaldoFormulaAST()` retorna o AST da fórmula customizada quando `pedido:saldo_formula` tem valor válido no localStorage?
- [ ] **LP-U22**: `lerSaldoFormulaAST()` cai para a fórmula padrão sem lançar exceção quando o valor no localStorage é JSON inválido?

#### 4. KPI Cards — Registry e Cálculo (`cardRegistry.tsx`)
- [ ] **LP-U23**: `CARD_REGISTRY.pedidos_abertos.getValue(stats)` retorna `stats.pedidosAbertos` — que conta apenas pedidos com `status === 'aberto'`?
- [ ] **LP-U24**: `CARD_REGISTRY.pedidos_abertos.format(1)` retorna `1` (número inteiro, não formatado com casas decimais)?
- [ ] **LP-U25**: `CARD_REGISTRY.pedidos_abertos.subtexto(stats)` retorna `'Pedidos com status aberto'` — texto fixo, independente do valor?
- [ ] **LP-U26**: `CARD_REGISTRY.total_pedidos.subtexto(stats)` retorna `'${stats.nItens} itens no total'` — usa `stats.nItens`?
- [ ] **LP-U27**: `CARD_REGISTRY.qtd_total.format(8900)` retorna `'8.900,00'` — usa `fmtQuantidade`?
- [ ] **LP-U28**: `CARD_REGISTRY.qtd_total.subtexto(stats)` retorna `'${fmtQuantidade(stats.qtdAtualTotal)} saldo atual'`?
- [ ] **LP-U29**: `CARD_REGISTRY.valor_total.format(180300)` retorna `'R$ 180.300,00'` — usa `fmtMoeda`?
- [ ] **LP-U30**: `CARD_REGISTRY.valor_total.subtexto(stats)` retorna `'Soma de todos os pedidos'` — texto fixo?
- [ ] **LP-U31**: Quando `stats.total === 0`, todos os `getValue` retornam `0` — nunca `undefined` ou `NaN`?

#### 5. KPI Cards — Ícones e Variantes Visuais
- [ ] **LP-U32**: `CARD_REGISTRY.total_pedidos.icone` renderiza ícone `Package` com cor `var(--ws-accent, #818cf8)`?
- [ ] **LP-U33**: `CARD_REGISTRY.qtd_total.variante` é `'aviso'` e ícone é `Scales` com cor `#fbbf24`?
- [ ] **LP-U34**: `CARD_REGISTRY.pedidos_abertos.icone` renderiza ícone `ClipboardText` com cor `#60a5fa`?
- [ ] **LP-U35**: `CARD_REGISTRY.valor_total.variante` é `'sucesso'` e ícone é `CurrencyDollar` com cor `#34d399`?
- [ ] **LP-U36**: `CARD_REGISTRY.pedidos_atrasados.variante` é `'perigo'` e ícone é `Warning` com cor `#f87171`?

#### 6. Estrutura Visual da Tabela — CSS
- [ ] **LP-U37**: Células de linha pai (`.gtv-linha:not(.gtv-linha--filho) .gtv-celula`) têm `font-weight: 600` e `color: #f1f5f9`?
- [ ] **LP-U38**: Células de linha filho (`.gtv-linha--filho .gtv-celula`) têm `font-weight: 400` e `color: #cbd5e1`?
- [ ] **LP-U39**: Células `.gtv-celula--right` dentro de `.lp-tabela-wrapper` têm `justify-content: center` e `text-align: center` — alinhamento central sobrescreve o padrão right?
- [ ] **LP-U40**: `.lp-dropdown-btn` tem `transition: background 0.1s` e no hover aplica `background: var(--bg-hover)`?
- [ ] **LP-U41**: `.lp-dropdown-item-btn` tem `font-weight: 600`, `border-radius: 0.5rem` e `transition: background 0.1s`?
- [ ] **LP-U42**: `.lp-cards` usa `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))` para layout responsivo dos cards?

#### 7. Tipos e Contratos — `types.ts`
- [ ] **LP-U43**: `StatusPedido` é uma union type com exatamente 7 valores: `'draft' | 'aberto' | 'em_andamento' | 'aprovado' | 'transferencia' | 'consolidado' | 'cancelado'`?
- [ ] **LP-U44**: `STATUS_PEDIDO_LABELS` mapeia `'transferencia'` para `'Transferido'` — não para `'Transferencia'`?
- [ ] **LP-U45**: `TipoOperacao` é `'importacao' | 'exportacao'` — sem acento, snake_case?
- [ ] **LP-U46**: Interface `PedidoItem` tem campo `saldo_item_pedido: number` (obrigatório, não opcional)?
- [ ] **LP-U47**: Interface `PedidoItem` tem `casas_decimais_quantidade_item: number` e `casas_decimais_valor_item: number`?

#### 8. Clean Code & Tipagem
- [ ] **LP-U48**: Não existem `console.log` nem comentários de debug em `ListaPedidos.tsx`, `cardRegistry.tsx` ou `types.ts`?
- [ ] **LP-U49**: Nenhum `any` explícito em `cardRegistry.tsx` — a única exceção documentada é o cast necessário em `cobertura_pendente.tooltip` com comentário inline?
- [ ] **LP-U50**: `fmtQuantidade` e `fmtMoeda` são exportadas de `types.ts` — não duplicadas em outros arquivos?

---

### 📊 Resultado Final:
[ ] **APROVADO** | [ ] **REPROVADO** | [ ] **RESSALVAS**
