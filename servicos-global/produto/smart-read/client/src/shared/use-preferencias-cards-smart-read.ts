/**
 * use-preferencias-cards-smart-read.ts — preferências de KPI cards (localStorage)
 * Sincronizável futuramente com Configurações do produto.
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
    descricao: 'Economia estimada de tempo operacional com OCR/IA',
  },
]

export const CARDS_PADRAO_SMART_READ = CARDS_CATALOGO_SMART_READ.map((c) => c.id)

const STORAGE_KEY = 'smart-read:config:cards-v1'
const SYNC_EVENT = 'smart-read:cards-updated'

const DEFAULT: CardPreferenciaSmartRead[] = CARDS_PADRAO_SMART_READ.map((id) => ({
  id,
  visible: true,
}))

function ordenarPorCatalogo(prefs: CardPreferenciaSmartRead[]): CardPreferenciaSmartRead[] {
  const ordem = new Map(CARDS_PADRAO_SMART_READ.map((id, index) => [id, index]))
  return [...prefs].sort(
    (a, b) => (ordem.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (ordem.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  )
}

function carregar(): CardPreferenciaSmartRead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT
    const salvas = JSON.parse(raw) as CardPreferenciaSmartRead[]
    if (!Array.isArray(salvas)) return DEFAULT
    const idsValidos = new Set(CARDS_PADRAO_SMART_READ)
    const visiveis = salvas.filter((p) => idsValidos.has(p.id) && typeof p.visible === 'boolean')
    const faltantes = CARDS_PADRAO_SMART_READ.filter(
      (id) => !visiveis.some((p) => p.id === id),
    ).map((id) => ({ id, visible: true }))
    return ordenarPorCatalogo([...visiveis, ...faltantes])
  } catch {
    return DEFAULT
  }
}

export function usePreferenciasCardsSmartRead() {
  const [prefs, setPrefs] = useState(carregar)

  useEffect(() => {
    function sync() {
      setPrefs(carregar())
    }
    window.addEventListener(SYNC_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SYNC_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const persistir = useCallback((next: CardPreferenciaSmartRead[]) => {
    setPrefs(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(SYNC_EVENT))
  }, [])

  const visiveis = useMemo(
    () =>
      prefs
        .filter((p) => p.visible)
        .map((p) => CARDS_CATALOGO_SMART_READ.find((c) => c.id === p.id))
        .filter((c): c is CardDefinicaoSmartRead => Boolean(c)),
    [prefs],
  )

  return { prefs, visiveis, persistir }
}
