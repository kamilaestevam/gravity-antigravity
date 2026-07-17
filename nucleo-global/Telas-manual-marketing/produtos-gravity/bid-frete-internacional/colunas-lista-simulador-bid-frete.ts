export type ColunaListaSimuladorBidFrete = {
  id: string
  label: string
  visivel: boolean
}

export const COLUNAS_LISTA_SIMULADOR_BID_FRETE: ColunaListaSimuladorBidFrete[] = [
  { id: 'numero_cotacao', label: 'Nº da cotação', visivel: true },
  { id: 'status', label: 'Status', visivel: true },
  { id: 'operacao', label: 'Operação', visivel: true },
  { id: 'modal', label: 'Modal', visivel: true },
  { id: 'modalidade', label: 'Modalidade', visivel: true },
  { id: 'porto_destino', label: 'Porto destino', visivel: true },
  { id: 'porto_origem', label: 'Porto origem', visivel: true },
  { id: 'tipo_container', label: 'Tipo container', visivel: true },
  { id: 'peso_kg', label: 'Peso (kg)', visivel: true },
]

export function criarEstadoColunasListaSimuladorBidFrete(): ColunaListaSimuladorBidFrete[] {
  return COLUNAS_LISTA_SIMULADOR_BID_FRETE.map((coluna) => ({ ...coluna }))
}
