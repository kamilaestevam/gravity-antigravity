import {
  CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ,
  PacotePrefillCotacaoBidFreteSmartReadSchema,
  type PacotePrefillCotacaoBidFreteSmartRead,
} from '../../../../smart-read/shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'

function lerBrutoPrefillSmartRead(): string | null {
  if (typeof sessionStorage !== 'undefined') {
    const daSessao = sessionStorage.getItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
    if (daSessao) return daSessao
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
  }
  return null
}

export function carregarPrefillSmartReadNovaCotacaoBidFreteInternacional(): PacotePrefillCotacaoBidFreteSmartRead | null {
  const bruto = lerBrutoPrefillSmartRead()
  if (!bruto) return null
  try {
    return PacotePrefillCotacaoBidFreteSmartReadSchema.parse(JSON.parse(bruto))
  } catch (erro) {
    console.warn('[bid-frete] prefill Smart Docs inválido no storage', erro)
    return null
  }
}

export function limparPrefillSmartReadNovaCotacaoBidFreteInternacional(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
  }
}
