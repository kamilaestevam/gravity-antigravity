/**
 * SessionStorage — prefill Nova Cotação BID Frete a partir do Smart Docs.
 */
import {
  CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ,
  PacotePrefillCotacaoBidFreteSmartReadSchema,
  type PacotePrefillCotacaoBidFreteSmartRead,
  type PrefillFormularioCotacaoBidFreteSmartRead,
} from '../../../shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'
import type { DetalheMapeamentoSmartReadCotacaoBidFrete } from '../../../shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'

export function salvarPrefillCotacaoBidFreteSmartRead(pacote: PacotePrefillCotacaoBidFreteSmartRead): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ, JSON.stringify(pacote))
}

export function carregarPrefillCotacaoBidFreteSmartRead(): PacotePrefillCotacaoBidFreteSmartRead | null {
  if (typeof sessionStorage === 'undefined') return null
  const bruto = sessionStorage.getItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
  if (!bruto) return null
  try {
    return PacotePrefillCotacaoBidFreteSmartReadSchema.parse(JSON.parse(bruto))
  } catch {
    return null
  }
}

export function limparPrefillCotacaoBidFreteSmartRead(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
}

export function montarPacotePrefillCotacaoBidFreteSmartRead(params: {
  idLeitura: string
  idBid?: string | null
  prefill: PrefillFormularioCotacaoBidFreteSmartRead
  detalheMapeamento: DetalheMapeamentoSmartReadCotacaoBidFrete
  iniciarNoPassoFornecedores: boolean
}): PacotePrefillCotacaoBidFreteSmartRead {
  return PacotePrefillCotacaoBidFreteSmartReadSchema.parse({
    id_leitura: params.idLeitura,
    id_bid_bid_frete_internacional: params.idBid?.trim() || undefined,
    prefill: params.prefill,
    detalhe_mapeamento: params.detalheMapeamento,
    iniciar_no_passo_fornecedores: params.iniciarNoPassoFornecedores,
    criado_em: new Date().toISOString(),
  })
}
