import {
  criarEstadoColunasListaSimuladorPedido,
  type ColunaListaSimuladorPedido,
} from './colunas-lista-simulador-pedido'

/** Colunas visíveis na demo «Arrastar» — paridade screenshot Visão Lista. */
const IDS_COLUNAS_VISIVEIS_DEMO_ARRASTAR = new Set([
  'nome_importador',
  'numero_pedido',
  'tipo_operacao',
  'status',
  'id_workspace',
  'nome_exportador',
  'referencia_importador',
  'referencia_exportador',
])

export function criarEstadoColunasDemonstracaoArrastarListaSimuladorPedido(): ColunaListaSimuladorPedido[] {
  return criarEstadoColunasListaSimuladorPedido().map((coluna) => ({
    ...coluna,
    visivel: IDS_COLUNAS_VISIVEIS_DEMO_ARRASTAR.has(coluna.id),
  }))
}
