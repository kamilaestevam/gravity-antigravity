/**
 * Resolve modalidade de carga para importação — paridade wizard Nova Cotação.
 */
import { normalizarValorCampoImportacaoBid } from './normalizar-valor-importacao-bid-frete-internacional'
import type { LinhaImportacaoBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'

export type ModalidadeCargaImportacaoBid =
  | 'FCL'
  | 'LCL'
  | 'AEREO_GERAL'
  | 'RODOVIARIO_FTL'
  | 'RODOVIARIO_LTL'

const MODALIDADES_POR_MODAL: Record<string, readonly ModalidadeCargaImportacaoBid[]> = {
  MARITIMO: ['FCL', 'LCL'],
  AEREO: ['AEREO_GERAL'],
  RODOVIARIO: ['RODOVIARIO_FTL', 'RODOVIARIO_LTL'],
}

export function resolverModalidadeImportacaoBidFreteInternacional(
  row: LinhaImportacaoBidFreteInternacional,
): ModalidadeCargaImportacaoBid | null {
  const modal = (row.modal_cotacao_bid_frete_internacional ?? '').trim().toUpperCase()
  if (!modal) return null

  const raw = normalizarValorCampoImportacaoBid(
    'modalidade_cotacao_bid_frete_internacional',
    row.modalidade_cotacao_bid_frete_internacional,
  ).toUpperCase()

  const permitidas = MODALIDADES_POR_MODAL[modal]
  if (permitidas && raw && permitidas.includes(raw as ModalidadeCargaImportacaoBid)) {
    return raw as ModalidadeCargaImportacaoBid
  }

  if (modal === 'AEREO') return 'AEREO_GERAL'

  return null
}
