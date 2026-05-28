import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  carregarTabelaConfigBidFrete,
  DEFAULT_TABELA_CONFIG_BID_FRETE,
  salvarTabelaConfigBidFrete,
  STORAGE_KEY_TABELA_BID_FRETE,
  SYNC_EVENT_TABELA_BID_FRETE,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/tabela-config-bid-frete'

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

describe('tabela-config-bid-frete', () => {
  it('retorna padrão quando storage vazio', () => {
    expect(carregarTabelaConfigBidFrete()).toEqual(DEFAULT_TABELA_CONFIG_BID_FRETE)
  })

  it('carrega linhasPorPagina e destacarAtrasados salvos', () => {
    lsStore[STORAGE_KEY_TABELA_BID_FRETE] = JSON.stringify({
      linhasPorPagina: 50,
      destacarAtrasados: false,
    })
    expect(carregarTabelaConfigBidFrete()).toEqual({
      linhasPorPagina: 50,
      destacarAtrasados: false,
    })
  })

  it('ignora linhasPorPagina inválido', () => {
    lsStore[STORAGE_KEY_TABELA_BID_FRETE] = JSON.stringify({
      linhasPorPagina: 999,
      destacarAtrasados: true,
    })
    expect(carregarTabelaConfigBidFrete().linhasPorPagina).toBe(100)
  })

  it('salvarTabelaConfigBidFrete persiste e dispara evento de sync', () => {
    const dispatch = vi.fn()
    vi.stubGlobal('window', { dispatchEvent: dispatch })
    salvarTabelaConfigBidFrete({ linhasPorPagina: 25, destacarAtrasados: false })
    expect(carregarTabelaConfigBidFrete()).toEqual({
      linhasPorPagina: 25,
      destacarAtrasados: false,
    })
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: SYNC_EVENT_TABELA_BID_FRETE }))
  })
})
