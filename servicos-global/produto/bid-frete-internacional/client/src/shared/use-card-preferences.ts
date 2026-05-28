import { useCallback, useEffect, useState } from 'react'

export interface CardDefinicao {
  id: string
  campoBase: string
  tipoAgg: 'Contagem' | 'Soma' | 'Média'
  origem: 'Cotação' | 'Proposta'
  labelKey: string
  descKey: string
  descricao: string
  /** Cards customizados (localStorage) — ícone Phosphor e cor hex. */
  icone?: string
  cor?: string
}

export interface CardPreferencia {
  id: string
  visible: boolean
}

export type CardPeriodoCodigo = '7d' | '30d' | '6m' | '1a' | 'tudo'

export const CARD_PERIODOS: Array<{ id: CardPeriodoCodigo; label: string }> = [
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: '6m', label: '6 meses' },
  { id: '1a', label: '1 ano' },
  { id: 'tudo', label: 'Tudo' },
]

export const CARDS_CATALOGO: CardDefinicao[] = [
  { id: 'total_cotacoes', campoBase: 'id', tipoAgg: 'Contagem', origem: 'Cotação', labelKey: 'bidfrete.config.cards.total_cotacoes', descKey: 'bidfrete.config.cards.total_cotacoes_desc', descricao: 'Total de cotações de frete iniciadas no período' },
  { id: 'valor_total_frete', campoBase: 'valor_total_proposta_bid_frete_internacional', tipoAgg: 'Soma', origem: 'Cotação', labelKey: 'bidfrete.config.cards.valor_total_frete', descKey: 'bidfrete.config.cards.valor_total_frete_desc', descricao: 'Valor acumulado das propostas de frete aprovadas' },
  { id: 'propostas_recebidas', campoBase: 'id', tipoAgg: 'Contagem', origem: 'Proposta', labelKey: 'bidfrete.config.cards.propostas_recebidas', descKey: 'bidfrete.config.cards.propostas_recebidas_desc', descricao: 'Quantidade total de respostas recebidas de fornecedores' },
  { id: 'saving_total', campoBase: 'ganho_valor_cotacao_bid_frete_internacional', tipoAgg: 'Soma', origem: 'Cotação', labelKey: 'bidfrete.config.cards.saving_total', descKey: 'bidfrete.config.cards.saving_total_desc', descricao: 'Economia gerada comparando a proposta vencedora com o teto' },
  { id: 'tempo_medio_resposta', campoBase: 'tempo_medio_resposta', tipoAgg: 'Média', origem: 'Proposta', labelKey: 'bidfrete.config.cards.tempo_medio_resposta', descKey: 'bidfrete.config.cards.tempo_medio_resposta_desc', descricao: 'Tempo médio de resposta dos armadores e agentes de carga' },
  { id: 'cotacoes_expiradas', campoBase: 'id', tipoAgg: 'Contagem', origem: 'Cotação', labelKey: 'bidfrete.config.cards.cotacoes_expiradas', descKey: 'bidfrete.config.cards.cotacoes_expiradas_desc', descricao: 'Cotações de frete expiradas sem aprovação' },
]

export const CARDS_PADRAO = ['total_cotacoes', 'valor_total_frete', 'propostas_recebidas']

const STORAGE_KEY = 'bid-frete:config:cards'
const PERIOD_KEY = 'bid-frete:config:cards-periodo'
const CUSTOM_CATALOG_KEY = 'bid-frete:config:cards-catalogo-custom'
const STORAGE_VERSION_KEY = 'bid-frete:config:cards-prefs-version'
const SYNC_EVENT = 'bid-frete:cards-updated'
const CURRENT_PREFS_VERSION = 2
const DEFAULT_PERIODO: CardPeriodoCodigo = '30d'

/** Conjunto legado gravado antes do alinhamento com Pedido (6 cards visíveis). */
const LEGACY_FALLBACK_CARD_IDS = [
  'total_cotacoes',
  'valor_total_frete',
  'propostas_recebidas',
  'saving_total',
  'tempo_medio_resposta',
  'cotacoes_expiradas',
] as const

export const DEFAULT_CARD_PREFERENCIAS: CardPreferencia[] = CARDS_PADRAO.map(id => ({ id, visible: true }))

export function carregarCardsCustomizados(): CardDefinicao[] {
  try {
    const raw = localStorage.getItem(CUSTOM_CATALOG_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is CardDefinicao =>
        item != null
        && typeof item === 'object'
        && typeof (item as CardDefinicao).id === 'string'
        && (item as CardDefinicao).id.startsWith('card_'),
    )
  } catch {
    return []
  }
}

export function listarCardsCatalogo(): CardDefinicao[] {
  return [...CARDS_CATALOGO, ...carregarCardsCustomizados()]
}

export function registrarCardCustomizado(def: CardDefinicao): void {
  const custom = carregarCardsCustomizados()
  if (custom.some(c => c.id === def.id)) return
  localStorage.setItem(CUSTOM_CATALOG_KEY, JSON.stringify([...custom, def]))
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

function cardExiste(id: string): boolean {
  return listarCardsCatalogo().some(c => c.id === id)
}

function isLegacyFallbackPrefs(salvas: CardPreferencia[]): boolean {
  if (salvas.length !== LEGACY_FALLBACK_CARD_IDS.length) return false
  const ids = salvas.map(p => p.id).sort().join('|')
  const legacyIds = [...LEGACY_FALLBACK_CARD_IDS].sort().join('|')
  return ids === legacyIds && salvas.every(p => p.visible)
}

export function carregarPreferenciasCardsBidFrete(): CardPreferencia[] {
  try {
    const version = Number(localStorage.getItem(STORAGE_VERSION_KEY) ?? '1')
    const raw = localStorage.getItem(STORAGE_KEY)

    if (version < CURRENT_PREFS_VERSION) {
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_PREFS_VERSION))
      if (!raw) {
        salvarPreferenciasCardsBidFrete(DEFAULT_CARD_PREFERENCIAS)
        return DEFAULT_CARD_PREFERENCIAS
      }
      const salvas = JSON.parse(raw) as CardPreferencia[]
      if (Array.isArray(salvas) && isLegacyFallbackPrefs(salvas)) {
        salvarPreferenciasCardsBidFrete(DEFAULT_CARD_PREFERENCIAS)
        return DEFAULT_CARD_PREFERENCIAS
      }
    }

    if (!raw) return DEFAULT_CARD_PREFERENCIAS
    const salvas = JSON.parse(raw) as CardPreferencia[]
    if (!Array.isArray(salvas)) return DEFAULT_CARD_PREFERENCIAS
    const validas = salvas.filter(p => p && typeof p.id === 'string' && cardExiste(p.id))
    return validas.length > 0 ? validas : DEFAULT_CARD_PREFERENCIAS
  } catch {
    return DEFAULT_CARD_PREFERENCIAS
  }
}

export function carregarPeriodoCardsBidFrete(): CardPeriodoCodigo {
  try {
    const raw = localStorage.getItem(PERIOD_KEY) as CardPeriodoCodigo | null
    if (raw && CARD_PERIODOS.some(p => p.id === raw)) return raw
  } catch { /* ignore */ }
  return DEFAULT_PERIODO
}

export function salvarPreferenciasCardsBidFrete(next: CardPreferencia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

export function salvarPeriodoCardsBidFrete(periodo: CardPeriodoCodigo) {
  localStorage.setItem(PERIOD_KEY, periodo)
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

export function useCardPreferencesBidFrete() {
  const [prefs, setPrefs] = useState<CardPreferencia[]>(carregarPreferenciasCardsBidFrete)
  const [periodo, setPeriodoState] = useState<CardPeriodoCodigo>(carregarPeriodoCardsBidFrete)
  const [catalogo, setCatalogo] = useState<CardDefinicao[]>(() => listarCardsCatalogo())

  useEffect(() => {
    function onSync() {
      setPrefs(carregarPreferenciasCardsBidFrete())
      setPeriodoState(carregarPeriodoCardsBidFrete())
      setCatalogo(listarCardsCatalogo())
    }
    window.addEventListener(SYNC_EVENT, onSync)
    window.addEventListener('storage', onSync)
    return () => {
      window.removeEventListener(SYNC_EVENT, onSync)
      window.removeEventListener('storage', onSync)
    }
  }, [])

  const persistir = useCallback((next: CardPreferencia[]) => {
    setPrefs(next)
    salvarPreferenciasCardsBidFrete(next)
  }, [])

  const setPeriodo = useCallback((next: CardPeriodoCodigo) => {
    setPeriodoState(next)
    salvarPeriodoCardsBidFrete(next)
  }, [])

  const adicionar = useCallback((id: string) => {
    setPrefs(prev => {
      if (prev.some(p => p.id === id)) return prev
      const next = [...prev, { id, visible: true }]
      salvarPreferenciasCardsBidFrete(next)
      return next
    })
  }, [])

  const remover = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.filter(p => p.id !== id)
      salvarPreferenciasCardsBidFrete(next)
      return next
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setPrefs(prev => {
      const next = prev.map(p => (p.id === id ? { ...p, visible: !p.visible } : p))
      salvarPreferenciasCardsBidFrete(next)
      return next
    })
  }, [])

  const reordenar = useCallback((novaOrdem: CardPreferencia[]) => {
    persistir(novaOrdem)
  }, [persistir])

  const resetar = useCallback(() => {
    persistir(DEFAULT_CARD_PREFERENCIAS)
    setPeriodo(DEFAULT_PERIODO)
    localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_PREFS_VERSION))
  }, [persistir, setPeriodo])

  return {
    prefs,
    catalogo,
    visiveis: prefs.filter(p => p.visible),
    disponiveis: catalogo.filter(c => !prefs.some(p => p.id === c.id)),
    periodo,
    persistir,
    setPeriodo,
    adicionar,
    remover,
    toggle,
    reordenar,
    resetar,
  }
}
