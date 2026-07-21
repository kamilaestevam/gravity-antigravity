/**
 * Catálogo e visibilidade padrão das colunas da Lista BID Frete (simulador marketing).
 * Espelha ordem-colunas-lista-bid-frete-internacional.ts — 8 exibidas por padrão.
 */

export type ColunaListaSimuladorBidFrete = {
  id: string
  label: string
  manual: boolean
  visivel: boolean
  numerica?: boolean
}

/** Ordem canônica — primeiras 8 visíveis por padrão (paridade :8000). */
export const COLUNAS_LISTA_SIMULADOR_BID_FRETE: ColunaListaSimuladorBidFrete[] = [
  { id: 'numero', label: 'Nº da cotação', manual: false, visivel: true },
  { id: 'status', label: 'Status', manual: false, visivel: true },
  { id: 'operacao', label: 'Operação', manual: false, visivel: true },
  { id: 'modal', label: 'Modal', manual: false, visivel: true },
  { id: 'modalidade', label: 'Modalidade', manual: false, visivel: true },
  { id: 'destino', label: 'Porto destino', manual: false, visivel: true },
  { id: 'origem', label: 'Porto origem', manual: false, visivel: true },
  { id: 'tipo_container', label: 'Tipo container', manual: false, visivel: true },
  { id: 'peso_kg', label: 'Peso (kg)', manual: false, visivel: false, numerica: true },
  { id: 'cubagem_m3', label: 'Cubagem (m³)', manual: false, visivel: false, numerica: true },
  { id: 'quantidade_volume', label: 'Qtd. volumes', manual: false, visivel: false, numerica: true },
  { id: 'incoterm', label: 'Incoterm', manual: false, visivel: false },
  { id: 'propostas', label: 'Propostas', manual: false, visivel: false, numerica: true },
  { id: 'meta', label: 'Meta (USD)', manual: false, visivel: false, numerica: true },
  { id: 'lance', label: 'Melhor lance', manual: false, visivel: false, numerica: true },
  { id: 'savings', label: 'Saving', manual: false, visivel: false, numerica: true },
  { id: 'prazo', label: 'Prazo resposta', manual: false, visivel: false },
  { id: 'data_criacao', label: 'Data da cotação', manual: false, visivel: false },
  { id: 'referencia_interna', label: 'Referência interna', manual: false, visivel: false },
  { id: 'workspace', label: 'Workspace', manual: false, visivel: false },
]

export function criarEstadoColunasListaSimuladorBidFrete(): ColunaListaSimuladorBidFrete[] {
  return COLUNAS_LISTA_SIMULADOR_BID_FRETE.map((coluna) => ({ ...coluna }))
}
