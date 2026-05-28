import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  carregarFormatoDataBidFrete,
  formatarDataBidFrete,
  salvarFormatoDataBidFrete,
  STORAGE_KEY_FORMATO_DATA_BID_FRETE,
  SYNC_EVENT_FORMATO_DATA_BID_FRETE,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/formato-data-bid-frete'

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

describe('formato-data-bid-frete', () => {
  it('carrega DD/MM/AAAA do storage legado JSON', () => {
    lsStore[STORAGE_KEY_FORMATO_DATA_BID_FRETE] = JSON.stringify('MM/DD/AAAA')
    expect(carregarFormatoDataBidFrete()).toBe('MM/DD/AAAA')
  })

  it('salvarFormatoDataBidFrete formata datas e dispara sync', () => {
    const dispatch = vi.fn()
    vi.stubGlobal('window', { dispatchEvent: dispatch })
    salvarFormatoDataBidFrete('AAAA-MM-DD')
    expect(formatarDataBidFrete('2026-05-28')).toBe('2026-05-28')
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: SYNC_EVENT_FORMATO_DATA_BID_FRETE }))
  })

  it('formatarDataBidFrete usa DD/MM/AAAA por padrao', () => {
    salvarFormatoDataBidFrete('DD/MM/AAAA')
    expect(formatarDataBidFrete('2026-04-13')).toBe('13/04/2026')
  })
})
