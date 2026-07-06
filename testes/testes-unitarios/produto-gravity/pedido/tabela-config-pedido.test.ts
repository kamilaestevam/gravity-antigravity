import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  carregarTabelaConfigPedido,
  DEFAULT_TABELA_CONFIG_PEDIDO,
  salvarTabelaConfigPedido,
  STORAGE_KEY_TABELA_PEDIDO,
  SYNC_EVENT_TABELA_PEDIDO,
} from '../../../../servicos-global/produto/pedido/client/src/shared/tabela-config-pedido'

const lsStore: Record<string, string> = {}

beforeEach(() => {
  Object.keys(lsStore).forEach(k => delete lsStore[k])
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((k: string) => lsStore[k] ?? null),
    setItem: vi.fn((k: string, v: string) => {
      lsStore[k] = v
    }),
    removeItem: vi.fn((k: string) => {
      delete lsStore[k]
    }),
  })
})

describe('tabela-config-pedido', () => {
  it('retorna padrão quando storage vazio', () => {
    expect(carregarTabelaConfigPedido()).toEqual(DEFAULT_TABELA_CONFIG_PEDIDO)
  })

  it('carrega linhasPorPagina e destacarAtrasados salvos', () => {
    lsStore[STORAGE_KEY_TABELA_PEDIDO] = JSON.stringify({
      linhasPorPagina: 50,
      destacarAtrasados: false,
    })
    expect(carregarTabelaConfigPedido()).toEqual({
      linhasPorPagina: 50,
      destacarAtrasados: false,
    })
  })

  it('salvarTabelaConfigPedido persiste e dispara evento de sync', () => {
    const dispatch = vi.fn()
    vi.stubGlobal('window', { dispatchEvent: dispatch })
    salvarTabelaConfigPedido({ linhasPorPagina: 25, destacarAtrasados: false })
    expect(carregarTabelaConfigPedido()).toEqual({
      linhasPorPagina: 25,
      destacarAtrasados: false,
    })
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: SYNC_EVENT_TABELA_PEDIDO }))
  })
})
