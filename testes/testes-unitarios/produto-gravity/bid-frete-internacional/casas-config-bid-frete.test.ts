import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  carregarCasasDecimaisBidFrete,
  COLUNAS_NUMERICAS_BID_FRETE,
  getCasasDecimaisBidFrete,
  salvarCasasDecimaisBidFrete,
  STORAGE_KEY_CASAS_BID_FRETE,
  SYNC_EVENT_CASAS_BID_FRETE,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/casas-config-bid-frete'

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

describe('casas-config-bid-frete', () => {
  it('retorna defaults nativos quando storage vazio', () => {
    const cfg = carregarCasasDecimaisBidFrete()
    for (const col of COLUNAS_NUMERICAS_BID_FRETE) {
      expect(cfg[col.campo]).toBe(col.padrao)
    }
  })

  it('salvarCasasDecimaisBidFrete persiste coluna personalizada e dispara sync', () => {
    const dispatch = vi.fn()
    vi.stubGlobal('window', { dispatchEvent: dispatch })
    salvarCasasDecimaisBidFrete({
      peso_kg_cotacao_bid_frete_internacional: 4,
      col_manual: 3,
    })
    expect(getCasasDecimaisBidFrete('peso_kg_cotacao_bid_frete_internacional', 2)).toBe(4)
    expect(getCasasDecimaisBidFrete('col_manual', 2)).toBe(3)
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: SYNC_EVENT_CASAS_BID_FRETE }))
    expect(lsStore[STORAGE_KEY_CASAS_BID_FRETE]).toContain('"col_manual":3')
  })

  it('getCasasDecimaisBidFrete usa padrao para chave ausente', () => {
    expect(getCasasDecimaisBidFrete('inexistente', 5)).toBe(5)
  })
})
