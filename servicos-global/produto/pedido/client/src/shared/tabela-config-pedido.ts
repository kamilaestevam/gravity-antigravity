/** Preferências da aba Configurações → Tabela (lista de pedidos). */

export interface TabelaConfigPedido {
  linhasPorPagina: 25 | 50 | 100 | 200
  destacarAtrasados: boolean
}

export const STORAGE_KEY_TABELA_PEDIDO = 'pedido:tabela_config'
export const SYNC_EVENT_TABELA_PEDIDO = 'pedido:tabela-updated'

export const DEFAULT_TABELA_CONFIG_PEDIDO: TabelaConfigPedido = {
  linhasPorPagina: 100,
  destacarAtrasados: true,
}

const LINHAS_VALIDAS = new Set([25, 50, 100, 200])

export function carregarTabelaConfigPedido(): TabelaConfigPedido {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TABELA_PEDIDO)
    if (!raw) return DEFAULT_TABELA_CONFIG_PEDIDO
    const parsed = JSON.parse(raw) as Partial<TabelaConfigPedido>
    const linhas = Number(parsed.linhasPorPagina)
    return {
      linhasPorPagina: LINHAS_VALIDAS.has(linhas)
        ? (linhas as TabelaConfigPedido['linhasPorPagina'])
        : DEFAULT_TABELA_CONFIG_PEDIDO.linhasPorPagina,
      destacarAtrasados: parsed.destacarAtrasados ?? DEFAULT_TABELA_CONFIG_PEDIDO.destacarAtrasados,
    }
  } catch {
    return DEFAULT_TABELA_CONFIG_PEDIDO
  }
}

export function salvarTabelaConfigPedido(config: TabelaConfigPedido): void {
  localStorage.setItem(STORAGE_KEY_TABELA_PEDIDO, JSON.stringify(config))
  notificarTabelaConfigPedidoAtualizada()
}

export function notificarTabelaConfigPedidoAtualizada(): void {
  window.dispatchEvent(new CustomEvent(SYNC_EVENT_TABELA_PEDIDO))
}
