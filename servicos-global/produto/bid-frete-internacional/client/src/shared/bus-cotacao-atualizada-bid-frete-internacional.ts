import type { Cotacao } from './types'

/** Evento global — lista e detalhe escutam para espelhar o mesmo registro. */
export const SYNC_EVENT_COTACAO_BID_FRETE_ATUALIZADA = 'bid-frete-internacional:cotacao-atualizada'

export function publicarCotacaoAtualizadaBidFrete(cotacao: Cotacao): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<Cotacao>(SYNC_EVENT_COTACAO_BID_FRETE_ATUALIZADA, { detail: cotacao }),
  )
}

export function inscreverCotacaoAtualizadaBidFrete(
  handler: (cotacao: Cotacao) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<Cotacao>).detail
    if (detail?.id_cotacao_bid_frete_internacional) handler(detail)
  }
  window.addEventListener(SYNC_EVENT_COTACAO_BID_FRETE_ATUALIZADA, listener)
  return () => window.removeEventListener(SYNC_EVENT_COTACAO_BID_FRETE_ATUALIZADA, listener)
}
