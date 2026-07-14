/**
 * SSOT — classificação e regras derivadas do prefill Smart Docs → Nova Cotação BID Frete.
 */
import type { PrefillFormularioCotacaoBidFreteSmartRead } from '../../smart-read/shared/conversao-leitura-cotacao-bid-frete-smart-read-schema.js'

export const PESO_LIMITE_FTL_KG = 20_000

const INCOTERMS_EXTRAS_DESTINO_EXPORTACAO = new Set(['DDP', 'DPU'])

export function inferirTipoOperacaoPrefill(params: {
  textoOperacao: string | null
  paisOrigem: string | null
  paisDestino: string | null
}): 'IMPORTACAO' | 'EXPORTACAO' | null {
  const texto = params.textoOperacao?.trim().toUpperCase() ?? ''
  if (/EXPORT/.test(texto)) return 'EXPORTACAO'
  if (/IMPORT/.test(texto)) return 'IMPORTACAO'

  const origem = params.paisOrigem?.trim().toUpperCase().slice(0, 2) ?? ''
  const destino = params.paisDestino?.trim().toUpperCase().slice(0, 2) ?? ''
  if (destino === 'BR' && origem && origem !== 'BR') return 'IMPORTACAO'
  if (origem === 'BR' && destino && destino !== 'BR') return 'EXPORTACAO'
  return null
}

export function inferirModalidadeRodoviarioPrefill(params: {
  pesoKg: number | null
  quantidadeVolumes: number | null
  textoModalidade: string | null
}): 'RODOVIARIO_FTL' | 'RODOVIARIO_LTL' {
  const texto = params.textoModalidade?.toUpperCase() ?? ''
  if (/FTL|FULL\s*TRUCK/i.test(texto)) return 'RODOVIARIO_FTL'
  if (/LTL/i.test(texto)) return 'RODOVIARIO_LTL'
  if (params.quantidadeVolumes === 1 && (params.pesoKg ?? 0) >= PESO_LIMITE_FTL_KG) return 'RODOVIARIO_FTL'
  return 'RODOVIARIO_LTL'
}

export function deveExibirExtrasOrigemPrefill(
  prefill: Pick<PrefillFormularioCotacaoBidFreteSmartRead, 'tipo_operacao_cotacao_bid_frete_internacional' | 'incoterm_cotacao_bid_frete_internacional'>,
): boolean {
  return prefill.tipo_operacao_cotacao_bid_frete_internacional === 'IMPORTACAO'
    && prefill.incoterm_cotacao_bid_frete_internacional?.toUpperCase() === 'EXW'
}

export function deveExibirExtrasDestinoPrefill(
  prefill: Pick<PrefillFormularioCotacaoBidFreteSmartRead, 'tipo_operacao_cotacao_bid_frete_internacional' | 'incoterm_cotacao_bid_frete_internacional'>,
): boolean {
  const inc = prefill.incoterm_cotacao_bid_frete_internacional?.toUpperCase() ?? ''
  return prefill.tipo_operacao_cotacao_bid_frete_internacional === 'EXPORTACAO'
    && INCOTERMS_EXTRAS_DESTINO_EXPORTACAO.has(inc)
}

/** Aplica flags derivadas de incoterm/operação (pick-up EXW, entrega DDP/DPU). */
export function aplicarRegrasDerivadasPrefill(
  prefill: PrefillFormularioCotacaoBidFreteSmartRead,
): PrefillFormularioCotacaoBidFreteSmartRead {
  return {
    ...prefill,
    exibir_campos_extras_origem_cotacao: deveExibirExtrasOrigemPrefill(prefill),
    exibir_campos_extras_destino_cotacao: deveExibirExtrasDestinoPrefill(prefill),
  }
}
