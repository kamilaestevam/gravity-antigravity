/**
 * Colunas personalizadas da Lista — lê do mesmo localStorage que Configurações.
 */
import type { ColunaUsuarioBidFreteLista } from './filtros-coluna-lista-bid-frete-internacional'

export const STORAGE_COLUNAS_PERSONALIZADAS_BID_FRETE =
  'bid-frete:config:colunas-personalizadas'

export const EVENTO_COLUNAS_PERSONALIZADAS_BID_FRETE_ATUALIZADO =
  'bid-frete:colunas-personalizadas-atualizado'

export function lerColunasPersonalizadasListaBidFrete(): ColunaUsuarioBidFreteLista[] {
  try {
    const raw = localStorage.getItem(STORAGE_COLUNAS_PERSONALIZADAS_BID_FRETE)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ColunaUsuarioBidFreteLista[]
    return Array.isArray(parsed) ? parsed.filter(c => c.ativo) : []
  } catch {
    return []
  }
}

export function publicarColunasPersonalizadasBidFreteAtualizadas(): void {
  window.dispatchEvent(new CustomEvent(EVENTO_COLUNAS_PERSONALIZADAS_BID_FRETE_ATUALIZADO))
}
