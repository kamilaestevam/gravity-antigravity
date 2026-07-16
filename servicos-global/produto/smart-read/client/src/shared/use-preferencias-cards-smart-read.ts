/**
 * use-preferencias-cards-smart-read.ts — preferências de KPI cards (localStorage)
 * Fonte única para Configurações › Card e ListaLeituraCardsSmartRead.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'

export type CardDefinicaoSmartRead = {
  id: string
  titulo: string
  descricao: string
}

export type CardPreferenciaSmartRead = {
  id: string
  visible: boolean
}

export type PreferenciasCardsSmartRead = {
  cards: CardPreferenciaSmartRead[]
  periodo: string
}

export const CARDS_CATALOGO_SMART_READ: CardDefinicaoSmartRead[] = [
  {
    id: 'leituras_realizadas',
    titulo: 'Leituras realizadas',
    descricao: 'Total de envios de leitura no período selecionado',
  },
  {
    id: 'performance_acertos',
    titulo: 'Performance de acertos',
    descricao: 'Média de acertos das leituras concluídas',
  },
  {
    id: 'recursos_reduzidos',
    titulo: 'Recursos reduzidos',
    descricao: 'Saving total (digitação + erros) das leituras visíveis — mesma base do Insights',
  },
]

export const CARDS_PADRAO_SMART_READ = CARDS_CATALOGO_SMART_READ.map((c) => c.id)
export const PERIODO_CARDS_PADRAO_SMART_READ = '30d'

const STORAGE_KEY = 'smart-read:config:cards-v1'
const STORAGE_KEY_LEGADO = 'smart-read:configuracoes:cards-v1'
export const SYNC_EVENT_CARDS_SMART_READ = 'smart-read:cards-updated'

const DEFAULT_CARDS: CardPreferenciaSmartRead[] = CARDS_PADRAO_SMART_READ.map((id) => ({
  id,
  visible: true,
}))

export const PREFERENCIAS_CARDS_PADRAO_SMART_READ: PreferenciasCardsSmartRead = {
  cards: DEFAULT_CARDS,
  periodo: PERIODO_CARDS_PADRAO_SMART_READ,
}

function normalizarCards(prefs: CardPreferenciaSmartRead[]): CardPreferenciaSmartRead[] {
  const idsValidos = new Set(CARDS_PADRAO_SMART_READ)
  const filtradas = prefs.filter((p) => idsValidos.has(p.id) && typeof p.visible === 'boolean')
  const idsPresentes = new Set(filtradas.map((p) => p.id))
  const faltantes = CARDS_PADRAO_SMART_READ.filter((id) => !idsPresentes.has(id)).map((id) => ({
    id,
    visible: true,
  }))
  return [...filtradas, ...faltantes]
}

function parseStorage(raw: string): PreferenciasCardsSmartRead | null {
  const parsed = JSON.parse(raw) as unknown
  if (Array.isArray(parsed)) {
    return {
      cards: normalizarCards(parsed as CardPreferenciaSmartRead[]),
      periodo: PERIODO_CARDS_PADRAO_SMART_READ,
    }
  }
  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as Partial<PreferenciasCardsSmartRead>
  if (!Array.isArray(obj.cards)) return null
  return {
    cards: normalizarCards(obj.cards),
    periodo: typeof obj.periodo === 'string' ? obj.periodo : PERIODO_CARDS_PADRAO_SMART_READ,
  }
}

function migrarStorageLegado(): PreferenciasCardsSmartRead | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEGADO)
    if (!raw) return null
    const legado = parseStorage(raw)
    if (!legado) return null
    salvarPreferenciasCardsSmartRead(legado)
    localStorage.removeItem(STORAGE_KEY_LEGADO)
    return legado
  } catch {
    return null
  }
}

export function carregarPreferenciasCardsSmartRead(): PreferenciasCardsSmartRead {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const migrado = migrarStorageLegado()
      return migrado ?? PREFERENCIAS_CARDS_PADRAO_SMART_READ
    }
    const parsed = parseStorage(raw)
    return parsed ?? PREFERENCIAS_CARDS_PADRAO_SMART_READ
  } catch {
    return PREFERENCIAS_CARDS_PADRAO_SMART_READ
  }
}

export function salvarPreferenciasCardsSmartRead(next: PreferenciasCardsSmartRead): void {
  const payload: PreferenciasCardsSmartRead = {
    cards: normalizarCards(next.cards),
    periodo: next.periodo,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new CustomEvent(SYNC_EVENT_CARDS_SMART_READ))
}

export function usePreferenciasCardsSmartRead() {
  const [prefs, setPrefs] = useState(carregarPreferenciasCardsSmartRead)

  useEffect(() => {
    function sync() {
      setPrefs(carregarPreferenciasCardsSmartRead())
    }
    window.addEventListener(SYNC_EVENT_CARDS_SMART_READ, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT_CARDS_SMART_READ, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const persistir = useCallback((next: PreferenciasCardsSmartRead) => {
    salvarPreferenciasCardsSmartRead(next)
    setPrefs(carregarPreferenciasCardsSmartRead())
  }, [])

  const visiveis = useMemo(
    () =>
      prefs.cards
        .filter((p) => p.visible)
        .map((p) => CARDS_CATALOGO_SMART_READ.find((c) => c.id === p.id))
        .filter((c): c is CardDefinicaoSmartRead => Boolean(c)),
    [prefs.cards],
  )

  return { prefs, visiveis, persistir }
}
