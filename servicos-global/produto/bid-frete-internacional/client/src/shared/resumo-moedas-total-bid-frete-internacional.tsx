/**
 * Exibição de totais por moeda — chip único ou pilha de chips quando multi-moeda.
 */
import React from 'react'
import {
  formatarTotalMoedaBidFrete,
  formatarValorNumericoBidFrete,
  type TotalPorMoedaBidFreteInternacional,
} from './taxas-linha-proposta-bid-frete-internacional'

export type VarianteResumoMoedasBidFreteInternacional = 'secao' | 'geral'

export interface ResumoMoedasTotalBidFreteInternacionalProps {
  totais: TotalPorMoedaBidFreteInternacional[]
  variante: VarianteResumoMoedasBidFreteInternacional
  rotuloAcessibilidade: string
  moedaFallback?: string
}

export function ResumoMoedasTotalBidFreteInternacional({
  totais,
  variante,
  rotuloAcessibilidade,
  moedaFallback = 'USD',
}: ResumoMoedasTotalBidFreteInternacionalProps) {
  const itensPositivos = totais.filter(({ total }) => total > 0)
  const exibir =
    itensPositivos.length > 0
      ? itensPositivos
      : [{ moeda: moedaFallback, total: 0 }]

  if (exibir.length === 1) {
    const { moeda, total } = exibir[0]
    return (
      <span className={`brc-total-valor brc-total-valor--${variante}`}>
        {formatarTotalMoedaBidFrete(moeda, total)}
      </span>
    )
  }

  return (
    <ul
      className={`brc-total-moedas brc-total-moedas--${variante}`}
      aria-label={rotuloAcessibilidade}
    >
      {exibir.map(({ moeda, total }) => (
        <li key={moeda} className="brc-total-moeda-chip">
          <span className="brc-total-moeda-sigla">{moeda}</span>
          <span className="brc-total-moeda-valor">{formatarValorNumericoBidFrete(total)}</span>
        </li>
      ))}
    </ul>
  )
}
