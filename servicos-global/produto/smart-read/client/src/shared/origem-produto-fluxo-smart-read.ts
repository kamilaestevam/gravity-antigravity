/**
 * Persiste origem do produto na sessão do Smart Docs (sobrevive retomar sem query string).
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

export function resolverOrigemProdutoFluxoSmartRead(
  origemUrl: string | null | undefined,
): OrigemProdutoFluxoSmartRead | null {
  if (origemUrl === 'pedido' || origemUrl === 'bid-frete-internacional') {
    salvarOrigemProdutoFluxoSmartRead(origemUrl)
    return origemUrl
  }
  return lerOrigemProdutoFluxoSmartRead()
}
