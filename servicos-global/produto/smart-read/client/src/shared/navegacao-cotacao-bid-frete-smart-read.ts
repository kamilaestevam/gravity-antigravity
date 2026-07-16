/** Navegação Smart Docs → Nova Cotação BID Frete (sem importar client do produto irmão). */
export function buildUrlNovaCotacaoPrefillSmartReadBidFreteInternacional(
  idLeitura: string,
  idBid?: string | null,
  idPainelLista?: string | null,
): string {
  const params = new URLSearchParams({
    origem: 'smart-read',
    id_leitura: idLeitura,
  })
  const bid = idBid?.trim()
  if (bid) params.set('id_bid', bid)
  const painel = idPainelLista?.trim()
  if (painel) params.set('id_painel_lista', painel)
  return `/bid-frete/cotacoes/nova?${params.toString()}`
}
