import { AppError } from '../lib/erros.js'
import {
  codigosElegiveisSelecaoLocalFornecedorBidFrete,
  exigeSelecaoLocalFornecedorRespostaBidFrete,
  type ContextoLocaisOpcionaisCotacaoBidFrete,
} from '../../../shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional.js'
import type { LocaisPropostaRespostaBidFrete } from '../../../shared/local-proposta-resposta-bid-frete-internacional.js'

export function validarLocaisPropostaRespostaBidFreteInternacional(
  cotacao: ContextoLocaisOpcionaisCotacaoBidFrete | null | undefined,
  locais: LocaisPropostaRespostaBidFrete,
): void {
  if (!cotacao) return

  for (const lado of ['origem', 'destino'] as const) {
    if (!exigeSelecaoLocalFornecedorRespostaBidFrete(cotacao, lado)) continue

    const codigoEnviado = lado === 'origem'
      ? locais.codigo_porto_aeroporto_origem_proposta_bid_frete_internacional?.trim()
      : locais.codigo_porto_aeroporto_destino_proposta_bid_frete_internacional?.trim()

    if (!codigoEnviado) {
      throw new AppError(
        lado === 'origem'
          ? 'Informe o porto/aeroporto de origem utilizado na proposta'
          : 'Informe o porto/aeroporto de destino utilizado na proposta',
        400,
        'VALIDATION_ERROR',
      )
    }

    const elegiveis = codigosElegiveisSelecaoLocalFornecedorBidFrete(cotacao, lado)
    if (!elegiveis.includes(codigoEnviado)) {
      throw new AppError(
        'Local informado na proposta nao esta entre as opcoes da cotacao',
        400,
        'VALIDATION_ERROR',
      )
    }
  }
}
