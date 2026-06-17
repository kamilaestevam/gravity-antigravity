/** Regras de envio de proposta dependentes da modalidade e opções da cotação. */

export type TipoTarifaPeriodoArmazenagemProposta =
  | 'REAIS'
  | 'PERCENTUAL_MERCADORIA'

export interface PeriodoArmazenagemPropostaBidFreteInternacional {
  ordem_periodo_armazenagem_proposta_bid_frete_internacional: number
  dias_periodo_armazenagem_proposta_bid_frete_internacional: number
  tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: TipoTarifaPeriodoArmazenagemProposta
  valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: number
  minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional: number
}

export interface DadosPropostaValidacaoModalidade {
  dias_free_time_proposta_bid_frete_internacional?: number | null
  periodos_armazenagem_proposta_bid_frete_internacional?: PeriodoArmazenagemPropostaBidFreteInternacional[] | null
}

export interface ContextoCotacaoValidacaoProposta {
  modalidade_cotacao_bid_frete_internacional?: string | null
  incluir_armazenagem_cotacao_bid_frete_internacional?: boolean | null
}

function periodoArmazenagemValido(p: PeriodoArmazenagemPropostaBidFreteInternacional): boolean {
  if (!Number.isInteger(p.ordem_periodo_armazenagem_proposta_bid_frete_internacional) || p.ordem_periodo_armazenagem_proposta_bid_frete_internacional <= 0) {
    return false
  }
  if (!Number.isInteger(p.dias_periodo_armazenagem_proposta_bid_frete_internacional) || p.dias_periodo_armazenagem_proposta_bid_frete_internacional <= 0) {
    return false
  }
  const tipo = p.tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional
  if (tipo !== 'REAIS' && tipo !== 'PERCENTUAL_MERCADORIA') return false
  const valor = p.valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional
  if (!Number.isFinite(valor) || valor <= 0) return false
  if (tipo === 'PERCENTUAL_MERCADORIA' && valor > 100) return false
  const minimo = p.minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional
  return Number.isFinite(minimo) && minimo >= 0
}

export function validarPropostaEnvioModalidadeCotacaoBidFreteInternacional(
  dados: DadosPropostaValidacaoModalidade,
  cotacao?: ContextoCotacaoValidacaoProposta | null,
): string | null {
  const modalidade = cotacao?.modalidade_cotacao_bid_frete_internacional
  if (modalidade === 'FCL') {
    if (dados.dias_free_time_proposta_bid_frete_internacional == null) {
      return 'Free Time e obrigatorio para cotacao FCL'
    }
  }

  if (cotacao?.incluir_armazenagem_cotacao_bid_frete_internacional === true) {
    const periodos = dados.periodos_armazenagem_proposta_bid_frete_internacional
    if (!periodos?.length) {
      return 'Informe ao menos um periodo de armazenagem quando a cotacao inclui armazenagem'
    }
    if (!periodos.every(periodoArmazenagemValido)) {
      return 'Cada periodo de armazenagem deve ter dias, tipo de tarifa (R$ ou %), valor e minimo em R$'
    }
  }

  return null
}
