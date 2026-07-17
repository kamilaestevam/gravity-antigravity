/**
 * Prefill Nova Cotação BID Frete a partir do Smart Docs.
 * Usa localStorage (handoff entre abas/noopener) com espelho em sessionStorage.
 */
import {
  CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ,
  PacotePrefillCotacaoBidFreteSmartReadSchema,
  type PacotePrefillCotacaoBidFreteSmartRead,
  type PrefillFormularioCotacaoBidFreteSmartRead,
} from '../../../shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'
import type {
  DetalheMapeamentoSmartReadCotacaoBidFrete,
  PassoInicialPrefillSmartReadCotacaoBidFrete,
} from '../../../shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'

function gravarBruto(bruto: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ, bruto)
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ, bruto)
  }
}

function lerBruto(): string | null {
  if (typeof sessionStorage !== 'undefined') {
    const daSessao = sessionStorage.getItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
    if (daSessao) return daSessao
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
  }
  return null
}

function limparBruto(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(CHAVE_SESSION_PREFILL_COTACAO_BID_FRETE_SMART_READ)
  }
}

export function salvarPrefillCotacaoBidFreteSmartRead(pacote: PacotePrefillCotacaoBidFreteSmartRead): void {
  gravarBruto(JSON.stringify(pacote))
}

export function carregarPrefillCotacaoBidFreteSmartRead(): PacotePrefillCotacaoBidFreteSmartRead | null {
  const bruto = lerBruto()
  if (!bruto) return null
  try {
    return PacotePrefillCotacaoBidFreteSmartReadSchema.parse(JSON.parse(bruto))
  } catch (erro) {
    console.warn('[smart-read] prefill BID Frete inválido no storage', erro)
    return null
  }
}

export function limparPrefillCotacaoBidFreteSmartRead(): void {
  limparBruto()
}

export function montarPacotePrefillCotacaoBidFreteSmartRead(params: {
  idLeitura: string
  idBid?: string | null
  prefill: PrefillFormularioCotacaoBidFreteSmartRead
  detalheMapeamento: DetalheMapeamentoSmartReadCotacaoBidFrete
  passoInicialTipo: PassoInicialPrefillSmartReadCotacaoBidFrete
  iniciarNoPassoFornecedores: boolean
}): PacotePrefillCotacaoBidFreteSmartRead {
  return PacotePrefillCotacaoBidFreteSmartReadSchema.parse({
    id_leitura: params.idLeitura,
    id_bid_bid_frete_internacional: params.idBid?.trim() || undefined,
    prefill: params.prefill,
    detalhe_mapeamento: params.detalheMapeamento,
    passo_inicial_tipo: params.passoInicialTipo,
    iniciar_no_passo_fornecedores: params.iniciarNoPassoFornecedores,
    criado_em: new Date().toISOString(),
  })
}
