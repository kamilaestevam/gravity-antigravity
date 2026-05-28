/** Preferências da aba Configurações → Tabela (lista de cotações). */

export interface TabelaConfigBidFrete {
  linhasPorPagina: 25 | 50 | 100 | 200
  destacarAtrasados: boolean
}

export const STORAGE_KEY_TABELA_BID_FRETE = 'bid-frete:config:tabela'
export const SYNC_EVENT_TABELA_BID_FRETE = 'bid-frete:tabela-updated'

export const HORAS_LIMITE_DESTAQUE_EXPIRACAO = 2

export const DEFAULT_TABELA_CONFIG_BID_FRETE: TabelaConfigBidFrete = {
  linhasPorPagina: 100,
  destacarAtrasados: true,
}

const LINHAS_VALIDAS = new Set([25, 50, 100, 200])

export function carregarTabelaConfigBidFrete(): TabelaConfigBidFrete {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TABELA_BID_FRETE)
    if (!raw) return DEFAULT_TABELA_CONFIG_BID_FRETE
    const parsed = JSON.parse(raw) as Partial<TabelaConfigBidFrete>
    const linhas = Number(parsed.linhasPorPagina)
    return {
      linhasPorPagina: LINHAS_VALIDAS.has(linhas)
        ? (linhas as TabelaConfigBidFrete['linhasPorPagina'])
        : DEFAULT_TABELA_CONFIG_BID_FRETE.linhasPorPagina,
      destacarAtrasados: parsed.destacarAtrasados ?? DEFAULT_TABELA_CONFIG_BID_FRETE.destacarAtrasados,
    }
  } catch {
    return DEFAULT_TABELA_CONFIG_BID_FRETE
  }
}

export function notificarTabelaConfigBidFreteAtualizada(): void {
  window.dispatchEvent(new CustomEvent(SYNC_EVENT_TABELA_BID_FRETE))
}
