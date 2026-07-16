import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CARDS_PADRAO_SMART_READ,
  PREFERENCIAS_CARDS_PADRAO_SMART_READ,
  SYNC_EVENT_CARDS_SMART_READ,
  carregarPreferenciasCardsSmartRead,
  salvarPreferenciasCardsSmartRead,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/use-preferencias-cards-smart-read.ts'

const STORAGE_KEY = 'smart-read:config:cards-v1'
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

describe('use-preferencias-cards-smart-read', () => {
  it('carrega padrão quando storage vazio', () => {
    expect(carregarPreferenciasCardsSmartRead()).toEqual(PREFERENCIAS_CARDS_PADRAO_SMART_READ)
  })

  it('persiste ordem, visibilidade e dispara evento para a Lista', () => {
    salvarPreferenciasCardsSmartRead({
      periodo: '7d',
      cards: [
        { id: 'recursos_reduzidos', visible: true },
        { id: 'leituras_realizadas', visible: false },
        { id: 'performance_acertos', visible: true },
      ],
    })

    expect(window.dispatchEvent).toHaveBeenCalled()
    const salvo = carregarPreferenciasCardsSmartRead()
    expect(salvo.periodo).toBe('7d')
    expect(salvo.cards.map((c) => c.id)).toEqual([
      'recursos_reduzidos',
      'leituras_realizadas',
      'performance_acertos',
    ])
    expect(salvo.cards.find((c) => c.id === 'leituras_realizadas')?.visible).toBe(false)
  })

  it('reinsere cards do catálogo ausentes como visíveis', () => {
    salvarPreferenciasCardsSmartRead({
      periodo: '30d',
      cards: [{ id: 'performance_acertos', visible: true }],
    })

    const salvo = carregarPreferenciasCardsSmartRead()
    expect(salvo.cards.map((c) => c.id)).toEqual([
      'performance_acertos',
      'leituras_realizadas',
      'recursos_reduzidos',
    ])
    expect(salvo.cards.every((c) => c.visible)).toBe(true)
  })

  it('aceita payload legado em array puro', () => {
    lsStore[STORAGE_KEY] = JSON.stringify([{ id: 'recursos_reduzidos', visible: true }])

    const salvo = carregarPreferenciasCardsSmartRead()
    expect(salvo.cards.some((c) => c.id === 'recursos_reduzidos' && c.visible)).toBe(true)
    expect(salvo.periodo).toBe('30d')
  })
})
