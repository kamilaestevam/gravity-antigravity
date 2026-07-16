import {
  CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ,
  PacotePrefillCotacaoBidFreteSmartReadSchema,
  type PacotePrefillCotacaoBidFreteSmartRead,
} from '../../../../smart-read/shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'

export function carregarPrefillSmartReadNovaCotacaoBidFreteInternacional(): PacotePrefillCotacaoBidFreteSmartRead | null {
  if (typeof sessionStorage === 'undefined') return null
  const bruto = sessionStorage.getItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
  if (!bruto) return null
  try {
    return PacotePrefillCotacaoBidFreteSmartReadSchema.parse(JSON.parse(bruto))
  } catch {
    return null
  }
}

export function limparPrefillSmartReadNovaCotacaoBidFreteInternacional(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
}
