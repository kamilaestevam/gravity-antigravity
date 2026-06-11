/**
 * Prefetch de chunks ao hover nas pills do seletor BID Frete.
 */

import type { BidFreteVisualizacaoId } from '../components/bid-frete-visualizacao-context'
import type { ModoVisualizacaoBidFrete } from '../components/BidFreteVisualizacaoTabs'

const prefetchCliente = {
  insights: () => import('../pages/visao-geral'),
  lista:         () => import('../pages/lista-bid-frete-internacional'),
  dashboard:     () => import('../pages/dashboard'),
  kanban:        () => import('../pages/lista-bid-frete-internacional'),
} as const satisfies Record<BidFreteVisualizacaoId, () => Promise<unknown>>

const prefetchFornecedor = {
  insights: () =>
    import('../pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-dashboard'),
  lista: () =>
    import('../pages/visao-fornecedor-bid-frete-internacional/lista-visao-fornecedor-bid-frete-internacional'),
  dashboard: () =>
    import('../pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-paineis-dashboard'),
  kanban: () =>
    import('../pages/visao-fornecedor-bid-frete-internacional/kanban-visao-fornecedor-bid-frete-internacional'),
} as const satisfies Record<BidFreteVisualizacaoId, () => Promise<unknown>>

export function prefetchBidFreteVisualizacao(
  modo: ModoVisualizacaoBidFrete,
  id: BidFreteVisualizacaoId,
): void {
  const map = modo === 'fornecedor' ? prefetchFornecedor : prefetchCliente
  void map[id]()
}
