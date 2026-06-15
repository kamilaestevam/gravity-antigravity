/**
 * Valores de colunas personalizadas por cotação — localStorage até API paridade Pedido.
 */
import type { Cotacao } from './types'

export const STORAGE_VALORES_COLUNAS_USUARIO_BID_FRETE =
  'bid-frete:config:valores-colunas-usuario'

export type ValoresColunasUsuarioBidFreteStore = Record<string, Record<string, string>>

export function lerValoresColunasUsuarioBidFrete(): ValoresColunasUsuarioBidFreteStore {
  try {
    const raw = localStorage.getItem(STORAGE_VALORES_COLUNAS_USUARIO_BID_FRETE)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ValoresColunasUsuarioBidFreteStore
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function salvarValorColunaUsuarioBidFrete(
  idCotacao: string,
  idColuna: string,
  valor: string,
): void {
  const store = lerValoresColunasUsuarioBidFrete()
  const atual = store[idCotacao] ?? {}
  store[idCotacao] = { ...atual, [idColuna]: valor }
  localStorage.setItem(STORAGE_VALORES_COLUNAS_USUARIO_BID_FRETE, JSON.stringify(store))
}

export function enriquecerCotacaoComColunasUsuario(cotacao: Cotacao): Cotacao {
  const store = lerValoresColunasUsuarioBidFrete()
  const id = cotacao.id_cotacao_bid_frete_internacional
  const valores = store[id]
  if (!valores || Object.keys(valores).length === 0) return cotacao
  return {
    ...cotacao,
    _colunas_usuario: { ...cotacao._colunas_usuario, ...valores },
  }
}

export function enriquecerCotacoesComColunasUsuario(cotacoes: Cotacao[]): Cotacao[] {
  return cotacoes.map(enriquecerCotacaoComColunasUsuario)
}
