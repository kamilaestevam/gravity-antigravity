import type { Dispatch, SetStateAction } from 'react'
import type { BidFreteInternacional, Cotacao } from './types'

export function patchCotacaoNoEstadoListaBidFrete(
  cotacao: Cotacao,
  setCotacoes: Dispatch<SetStateAction<Cotacao[]>>,
  setCotacoesAvulsas: Dispatch<SetStateAction<Cotacao[]>>,
  setBids: Dispatch<SetStateAction<BidFreteInternacional[]>>,
): void {
  const id = cotacao.id_cotacao_bid_frete_internacional
  const patch = (c: Cotacao) => (c.id_cotacao_bid_frete_internacional === id ? cotacao : c)
  setCotacoes(prev => prev.map(patch))
  setCotacoesAvulsas(prev => prev.map(patch))
  setBids(prev =>
    prev.map(bid => ({
      ...bid,
      cotacoes: (bid.cotacoes ?? []).map(patch),
    })),
  )
}
