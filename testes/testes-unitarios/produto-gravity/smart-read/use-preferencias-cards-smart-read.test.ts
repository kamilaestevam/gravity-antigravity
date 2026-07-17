import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CARDS_PADRAO_KPI_SMART_READ,
  normalizarPreferenciasCardsKpi,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/catalogo-cards-kpi-smart-read.ts'
import {
  STORAGE_KEY_CONFIGURACOES_SMART_READ,
  carregarConfiguracoesSmartRead,
  salvarConfiguracoesSmartRead,
  snapshotPadraoConfiguracoesSmartRead,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/persistencia-configuracoes-smart-read.ts'

const lsStore: Record<string, string> = {}

beforeEach(() => {
  Object.keys(lsStore).forEach((k) => delete lsStore[k])
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((k: string) => lsStore[k] ?? null),
    setItem: vi.fn((k: string, v: string) => {
      lsStore[k] = v
    }),
    removeItem: vi.fn((k: string) => {
      delete lsStore[k]
    }),
    clear: vi.fn(() => {
      Object.keys(lsStore).forEach((k) => delete lsStore[k])
    }),
  })
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('preferencias cards smart-read via persistencia-configuracoes', () => {
  it('carrega cards padrao quando storage vazio', () => {
    const cfg = carregarConfiguracoesSmartRead()
    expect(cfg.cards.map((c) => c.id)).toEqual(CARDS_PADRAO_KPI_SMART_READ.map((c) => c.id))
    expect(cfg.cards.every((c) => c.visible)).toBe(true)
  })

  it('persiste ordem e visibilidade dos cards', () => {
    const snapshot = snapshotPadraoConfiguracoesSmartRead()
    snapshot.cards = normalizarPreferenciasCardsKpi([
      { id: 'documentos', visible: true },
      { id: 'total_leituras', visible: false },
      { id: 'concluidas', visible: true },
    ])
    salvarConfiguracoesSmartRead(snapshot)

    expect(window.dispatchEvent).toHaveBeenCalled()
    const salvo = carregarConfiguracoesSmartRead()
    expect(salvo.cards.map((c) => c.id)).toEqual(['documentos', 'total_leituras', 'concluidas'])
    expect(salvo.cards.find((c) => c.id === 'total_leituras')?.visible).toBe(false)
    expect(lsStore[STORAGE_KEY_CONFIGURACOES_SMART_READ]).toBeTruthy()
  })

  it('preserva subset de cards salvo explicitamente', () => {
    const snapshot = snapshotPadraoConfiguracoesSmartRead()
    snapshot.cards = normalizarPreferenciasCardsKpi([{ id: 'falhas', visible: true }])
    salvarConfiguracoesSmartRead(snapshot)

    const salvo = carregarConfiguracoesSmartRead()
    expect(salvo.cards).toEqual([{ id: 'falhas', visible: true }])
  })
})
