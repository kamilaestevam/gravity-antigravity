/**
 * Origem do fluxo no Smart Docs (Pedido / BID Frete).
 * Critério: apenas a query `origem` da URL — sem isso o Smart Docs puro não mostra telas de cotação.
 * SessionStorage só espelha enquanto a URL trouxer a origem (evita “grudar” na lista).
 */
const CHAVE = 'smart-read:origem-produto-fluxo'

export type OrigemProdutoFluxoSmartRead = 'pedido' | 'bid-frete-internacional'

export function salvarOrigemProdutoFluxoSmartRead(origem: string | null | undefined): void {
  if (typeof sessionStorage === 'undefined') return
  if (origem === 'pedido' || origem === 'bid-frete-internacional') {
    sessionStorage.setItem(CHAVE, origem)
    return
  }
}

export function lerOrigemProdutoFluxoSmartRead(): OrigemProdutoFluxoSmartRead | null {
  if (typeof sessionStorage === 'undefined') return null
  const v = sessionStorage.getItem(CHAVE)
  if (v === 'pedido' || v === 'bid-frete-internacional') return v
  return null
}

export function limparOrigemProdutoFluxoSmartRead(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(CHAVE)
}

/**
 * Sem `origem` na URL → limpa sessão e retorna null (fluxo Smart Docs intocado).
 * Com `origem` válida → persiste espelho e retorna (fluxo Pedido/BID Frete).
 */
export function resolverOrigemProdutoFluxoSmartRead(
  origemUrl: string | null | undefined,
): OrigemProdutoFluxoSmartRead | null {
  if (origemUrl === 'pedido' || origemUrl === 'bid-frete-internacional') {
    salvarOrigemProdutoFluxoSmartRead(origemUrl)
    return origemUrl
  }
  limparOrigemProdutoFluxoSmartRead()
  return null
}
