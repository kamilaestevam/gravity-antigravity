/** Regras de envio de proposta dependentes da modalidade da cotação (ex.: FCL exige Free Time). */

export interface DadosPropostaValidacaoModalidade {
  dias_free_time_proposta_bid_frete_internacional?: number | null
}

export function validarPropostaEnvioModalidadeCotacaoBidFreteInternacional(
  dados: DadosPropostaValidacaoModalidade,
  modalidade_cotacao_bid_frete_internacional?: string | null,
): string | null {
  if (modalidade_cotacao_bid_frete_internacional === 'FCL') {
    if (dados.dias_free_time_proposta_bid_frete_internacional == null) {
      return 'Free Time e obrigatorio para cotacao FCL'
    }
  }
  return null
}
