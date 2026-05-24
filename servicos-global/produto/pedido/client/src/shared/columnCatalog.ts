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
  id:          string
  labelKey:    string
  descKey:     string
  iconeKey:    string
  cor:         string
  origem:      'Pedido' | 'Item'
  tipoAgg:     'Contagem' | 'Soma' | 'Média'
  campoBase:   string
  descricao:   string
}

export const CARDS_CATALOGO: CardDefinicao[] = [

  // ── Pedido (colunasPai) ───────────────────────────────────────────────────

  {
    id: 'total_pedidos',
    labelKey: 'pedido.total_pedidos',   descKey: 'pedido.itens_total',
    iconeKey: 'package',               cor: 'var(--ws-accent, #818cf8)',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
    campoBase: 'Nº Pedido',
    descricao: 'Quantidade total de pedidos de todos os status da plataforma nos últimos 30 dias',
  },
  {
    id: 'valor_total',
    labelKey: 'pedido.valor_total',     descKey: 'pedido.soma_pedidos',
    iconeKey: 'currency',              cor: '#34d399',
    origem: 'Pedido',                  tipoAgg: 'Soma',
    campoBase: 'Valor Total do Pedido',
    descricao: 'Soma do valor total de todos os pedidos na moeda original nos últimos 30 dias',
  },
  {
    id: 'valor_total_brl',
    labelKey: 'pedido.valor_total_brl', descKey: 'pedido.valor_total_brl_desc',
    iconeKey: 'currency-circle',       cor: '#34d399',
    origem: 'Pedido',                  tipoAgg: 'Soma',
    campoBase: 'Valor Total do Pedido',
    descricao: 'Soma do valor total de todos os pedidos convertido para Real (BRL) pela taxa PTAX de venda nos últimos 30 dias',
  },
  {
    id: 'qtd_total',
    labelKey: 'pedido.qtd_total',       descKey: 'pedido.qtd_acumulada',
    iconeKey: 'scales',                cor: '#fbbf24',
    origem: 'Pedido',                  tipoAgg: 'Soma',
    campoBase: 'Qtd. Inicial do Pedido',
    descricao: 'Soma da quantidade inicial de todos os pedidos nos últimos 30 dias',
  },
  {
    id: 'pedidos_atrasados',
    labelKey: 'pedido.pedidos_atrasados', descKey: 'pedido.pedidos_atrasados_desc',
    iconeKey: 'warning',               cor: '#f87171',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
    campoBase: 'Todas as Datas Previstas',
    descricao: 'Pedidos dos últimos 30 dias com qualquer data prevista anterior a hoje e sem data confirmada correspondente. Datas: Pedido Pronto, Inspeção, Coleta, Receb. Rascunho Pedido, Aprov. Rascunho Pedido, Receb. Rascunho Proforma, Aprov. Rascunho Proforma, Envio Original Proforma, Receb. Original Proforma, Receb. Rascunho Invoice, Aprov. Rascunho Invoice, Envio Original Invoice, Receb. Original Invoice',
  },
  {
    id: 'pedidos_abertos',
    labelKey: 'pedido.pedidos_abertos',   descKey: 'pedido.pedidos_abertos_desc',
    iconeKey: 'clipboard',             cor: '#60a5fa',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
    campoBase: 'Status do Pedido',
    descricao: 'Quantidade de pedidos com status "Aberto" nos últimos 30 dias',
  },
  {
    id: 'pedidos_em_andamento',
    labelKey: 'pedido.pedidos_em_andamento', descKey: 'pedido.pedidos_em_andamento_desc',
    iconeKey: 'arrow',                 cor: '#a78bfa',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
    campoBase: 'Status do Pedido',
    descricao: 'Quantidade de pedidos com status "Em Andamento" nos últimos 30 dias',
  },
  {
    id: 'cobertura_pendente',
    labelKey: 'pedido.cobertura_pendente', descKey: 'pedido.cobertura_pendente_desc',
    iconeKey: 'currency-circle',       cor: '#fb923c',
    origem: 'Pedido',                  tipoAgg: 'Soma',
    campoBase: 'Valor Total do Pedido',
    descricao: 'Soma do valor total dos pedidos que possuem ao menos um item com cobertura cambial pendente nos últimos 30 dias',
  },
  {
    id: 'alertas_total',
    labelKey: 'pedido.alertas_total', descKey: 'pedido.alertas_total_desc',
    iconeKey: 'warning',               cor: '#f59e0b',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
    campoBase: 'Alertas',
    descricao: 'Quantidade total de alertas (divergências e inconsistências) em pedidos e itens no período',
  },
  {
    id: 'alertas_pedido',
    labelKey: 'pedido.alertas_pedido', descKey: 'pedido.alertas_pedido_desc',
    iconeKey: 'warning',               cor: '#f59e0b',
    origem: 'Pedido',                  tipoAgg: 'Contagem',
    campoBase: 'Alertas do Pedido',
    descricao: 'Alertas no nível do pedido: divergências pai/filho, número duplicado, agregados inconsistentes',
  },
  {
    id: 'alertas_item',
    labelKey: 'pedido.alertas_item', descKey: 'pedido.alertas_item_desc',
    iconeKey: 'warning',               cor: '#fbbf24',
    origem: 'Item',                    tipoAgg: 'Contagem',
    campoBase: 'Alertas do Item',
    descricao: 'Alertas no nível do item: Part Number duplicado no mesmo pedido',
  },

  // ── Item (colunasFilha) ───────────────────────────────────────────────────

  {
    id: 'itens_prontos',
    labelKey: 'pedido.itens_prontos',   descKey: 'pedido.itens_prontos_desc',
    iconeKey: 'check',                 cor: '#34d399',
    origem: 'Item',                    tipoAgg: 'Soma',
    campoBase: 'Qtd. Pronta do Pedido',
    descricao: 'Soma da quantidade pronta de todos os itens de todos os pedidos nos últimos 30 dias',
  },
  {
    id: 'qtd_atual_total',
    labelKey: 'pedido.qtd_atual_total', descKey: 'pedido.qtd_atual_total_desc',
    iconeKey: 'gauge',                 cor: '#38bdf8',
    origem: 'Item',                    tipoAgg: 'Soma',
    campoBase: 'Saldo do Pedido',
    descricao: 'Soma do saldo disponível (quantidade atual) de todos os itens nos últimos 30 dias',
  },
  {
    id: 'qtd_transferida_total',
    labelKey: 'pedido.qtd_transferida_total', descKey: 'pedido.qtd_transferida_total_desc',
    iconeKey: 'arrows',                cor: '#a3e635',
    origem: 'Item',                    tipoAgg: 'Soma',
    campoBase: 'Qtd. Transferida do Pedido',
    descricao: 'Soma da quantidade já transferida/alocada em processos logísticos nos últimos 30 dias',
  },
  {
    id: 'qtd_inicial_total',
    labelKey: 'pedido.qtd_inicial_total', descKey: 'pedido.qtd_inicial_total_desc',
    iconeKey: 'stack',                 cor: '#94a3b8',
    origem: 'Item',                    tipoAgg: 'Soma',
    campoBase: 'Qtd. Inicial do Pedido',
    descricao: 'Soma das quantidades originais de todos os itens de todos os pedidos nos últimos 30 dias',
  },
  {
    id: 'valor_itens_total',
    labelKey: 'pedido.valor_itens_total', descKey: 'pedido.valor_itens_total_desc',
    iconeKey: 'money',                 cor: '#f59e0b',
    origem: 'Item',                    tipoAgg: 'Soma',
    campoBase: 'Valor do Item',
    descricao: 'Soma do valor de todos os itens de todos os pedidos nos últimos 30 dias',
  },
]

// IDs adicionados por padrão para novos usuários
export const CARDS_PADRAO = ['total_pedidos', 'valor_total', 'qtd_total']
