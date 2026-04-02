/**
 * columnCatalog.ts — Todas as colunas da tabela de pedidos que podem virar cards
 *
 * Cada entrada representa uma coluna da TabelaCamadasGlobal.
 * O usuário escolhe quais quer ver como card na tela principal.
 *
 * origem:  'Pedido' → colunasPai  |  'Item' → colunasFilha
 * tipoAgg: como o valor é calculado (exibido no catálogo)
 */

export interface CardDefinicao {
  id:       string
  labelKey: string
  descKey:  string
  iconeKey: string
  cor:      string
  origem:   'Pedido' | 'Item'
  tipoAgg:  'Contagem' | 'Soma' | 'Média'
}

export const CARDS_CATALOGO: CardDefinicao[] = [

  // ── Pedido (colunasPai) ───────────────────────────────────────────────────

  {
    id: 'total_pedidos',
    labelKey: 'pedido.total_pedidos',   descKey: 'pedido.itens_total',
    iconeKey: 'package',               cor: 'var(--ws-accent, #818cf8)',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
  },
  {
    id: 'valor_total',
    labelKey: 'pedido.valor_total',     descKey: 'pedido.soma_pedidos',
    iconeKey: 'currency',              cor: '#34d399',
    origem: 'Pedido',                  tipoAgg: 'Soma',
  },
  {
    id: 'qtd_total',
    labelKey: 'pedido.qtd_total',       descKey: 'pedido.qtd_acumulada',
    iconeKey: 'scales',                cor: '#fbbf24',
    origem: 'Pedido',                  tipoAgg: 'Soma',
  },
  {
    id: 'pedidos_atrasados',
    labelKey: 'pedido.pedidos_atrasados', descKey: 'pedido.pedidos_atrasados_desc',
    iconeKey: 'warning',               cor: '#f87171',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
  },
  {
    id: 'pedidos_abertos',
    labelKey: 'pedido.pedidos_abertos',   descKey: 'pedido.pedidos_abertos_desc',
    iconeKey: 'clipboard',             cor: '#60a5fa',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
  },
  {
    id: 'pedidos_em_andamento',
    labelKey: 'pedido.pedidos_em_andamento', descKey: 'pedido.pedidos_em_andamento_desc',
    iconeKey: 'arrow',                 cor: '#a78bfa',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
  },
  {
    id: 'cobertura_pendente',
    labelKey: 'pedido.cobertura_pendente', descKey: 'pedido.cobertura_pendente_desc',
    iconeKey: 'currency-circle',       cor: '#fb923c',
    origem: 'Pedido',                  tipoAgg: 'Soma',
  },

  // ── Item (colunasFilha) ───────────────────────────────────────────────────

  {
    id: 'itens_prontos',
    labelKey: 'pedido.itens_prontos',   descKey: 'pedido.itens_prontos_desc',
    iconeKey: 'check',                 cor: '#34d399',
    origem: 'Item',                    tipoAgg: 'Soma',
  },
  {
    id: 'qtd_atual_total',
    labelKey: 'pedido.qtd_atual_total', descKey: 'pedido.qtd_atual_total_desc',
    iconeKey: 'gauge',                 cor: '#38bdf8',
    origem: 'Item',                    tipoAgg: 'Soma',
  },
  {
    id: 'qtd_transferida_total',
    labelKey: 'pedido.qtd_transferida_total', descKey: 'pedido.qtd_transferida_total_desc',
    iconeKey: 'arrows',                cor: '#a3e635',
    origem: 'Item',                    tipoAgg: 'Soma',
  },
  {
    id: 'qtd_inicial_total',
    labelKey: 'pedido.qtd_inicial_total', descKey: 'pedido.qtd_inicial_total_desc',
    iconeKey: 'stack',                 cor: '#94a3b8',
    origem: 'Item',                    tipoAgg: 'Soma',
  },
  {
    id: 'valor_itens_total',
    labelKey: 'pedido.valor_itens_total', descKey: 'pedido.valor_itens_total_desc',
    iconeKey: 'money',                 cor: '#f59e0b',
    origem: 'Item',                    tipoAgg: 'Soma',
  },
]

// IDs adicionados por padrão para novos usuários
export const CARDS_PADRAO = ['total_pedidos', 'valor_total', 'qtd_total']
