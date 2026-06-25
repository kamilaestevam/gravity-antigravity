import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CARDS_PADRAO,
  DEFAULT_CARD_PREFERENCIAS,
  carregarPreferenciasCardsBidFrete,
  carregarPeriodoCardsBidFrete,
  listarCardsCatalogo,
  registrarCardCustomizado,
  salvarPreferenciasCardsBidFrete,
  salvarPeriodoCardsBidFrete,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/use-card-preferences'

const STORAGE_KEY = 'bid-frete:config:cards'
const PERIOD_KEY = 'bid-frete:config:cards-periodo'
const CUSTOM_CATALOG_KEY = 'bid-frete:config:cards-catalogo-custom'
const STORAGE_VERSION_KEY = 'bid-frete:config:cards-prefs-version'

const lsStore: Record<string, string> = {}

function stubBrowserStorage() {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((k: string) => lsStore[k] ?? null),
    setItem: vi.fn((k: string, v: string) => {
      lsStore[k] = v
    }),
    removeItem: vi.fn((k: string) => {
      delete lsStore[k]
    }),
  })
  vi.stubGlobal('window', {
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
}

beforeEach(() => {
  Object.keys(lsStore).forEach(k => delete lsStore[k])
  stubBrowserStorage()
})

describe('use-card-preferences (BID Frete Internacional)', () => {
  it('padrão expõe apenas 3 cards do catálogo', () => {
    expect(CARDS_PADRAO).toEqual(['total_cotacoes', 'valor_total_frete', 'propostas_recebidas'])
    expect(DEFAULT_CARD_PREFERENCIAS).toHaveLength(3)
    expect(DEFAULT_CARD_PREFERENCIAS.every(p => p.visible)).toBe(true)
  })

  it('sem storage retorna prefs e período padrão', () => {
    expect(carregarPreferenciasCardsBidFrete()).toEqual(DEFAULT_CARD_PREFERENCIAS)
    expect(carregarPeriodoCardsBidFrete()).toBe('30d')
  })

  it('persiste e recarrega preferências e período', () => {
    const custom = [
      { id: 'total_cotacoes', visible: true },
      { id: 'saving_total', visible: false },
    ]
    salvarPreferenciasCardsBidFrete(custom)
    salvarPeriodoCardsBidFrete('7d')

    expect(carregarPreferenciasCardsBidFrete()).toEqual(custom)
    expect(carregarPeriodoCardsBidFrete()).toBe('7d')
  })

  it('migra conjunto legado de 6 cards para o padrão de 3', () => {
    const legacy = [
      'total_cotacoes',
      'valor_total_frete',
      'propostas_recebidas',
      'saving_total',
      'tempo_medio_resposta',
      'cotacoes_expiradas',
    ].map(id => ({ id, visible: true }))

    lsStore[STORAGE_KEY] = JSON.stringify(legacy)
    lsStore[STORAGE_VERSION_KEY] = '1'

    expect(carregarPreferenciasCardsBidFrete()).toEqual(DEFAULT_CARD_PREFERENCIAS)
    expect(JSON.parse(lsStore[STORAGE_KEY] ?? '[]')).toEqual(DEFAULT_CARD_PREFERENCIAS)
    expect(lsStore[STORAGE_VERSION_KEY]).toBe('2')
  })

  it('não apaga prefs personalizadas na migração de versão', () => {
    const custom = [
      { id: 'total_cotacoes', visible: true },
      { id: 'cotacoes_expiradas', visible: true },
    ]
    lsStore[STORAGE_KEY] = JSON.stringify(custom)
    lsStore[STORAGE_VERSION_KEY] = '1'

    expect(carregarPreferenciasCardsBidFrete()).toEqual(custom)
  })

  it('persiste card customizado no catálogo local', () => {
    registrarCardCustomizado({
      id: 'card_teste',
      campoBase: 'valor_total_proposta_bid_frete_internacional',
      tipoAgg: 'Soma',
      origem: 'Proposta',
      labelKey: 'Meu KPI',
      descKey: 'formula',
      descricao: 'Card de teste',
      cor: '#34d399',
    })

    const catalogo = listarCardsCatalogo()
    expect(catalogo.some(c => c.id === 'card_teste')).toBe(true)
    expect(JSON.parse(lsStore[CUSTOM_CATALOG_KEY] ?? '[]')).toHaveLength(1)
  })
})
