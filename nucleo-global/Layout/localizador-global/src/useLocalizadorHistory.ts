import { useState, useCallback, useEffect } from 'react'
import type { LocalizadorEntry } from './types'

const SESSION_KEY_PREFIX = 'gravity:localizador:'
const MAX_ENTRIES = 10

interface UseLocalizadorHistoryOptions {
  productId: string
  productLabel: string
  productColor: string
  pageLabel: string
  pagePath: string
}

interface UseLocalizadorHistoryReturn {
  history: LocalizadorEntry[]
  /** Chama ao navegar para uma nova página */
  addEntry: (opts: UseLocalizadorHistoryOptions) => void
  clearHistory: () => void
}

function readFromSession(productId: string): LocalizadorEntry[] {
  try {
    const raw = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${productId}`)
    if (!raw) return []
    return JSON.parse(raw) as LocalizadorEntry[]
  } catch {
    return []
  }
}

function writeToSession(productId: string, entries: LocalizadorEntry[]): void {
  try {
    sessionStorage.setItem(`${SESSION_KEY_PREFIX}${productId}`, JSON.stringify(entries))
  } catch {
    // sessionStorage indisponível — sem crash
  }
}

/**
 * Gerencia o histórico de navegação por produto em sessionStorage.
 * O componente LocalizadorGlobal recebe `history` via props —
 * este hook é usado pelo pai para produzir esse dado.
 *
 * Uso:
 * ```tsx
 * const { history, addEntry } = useLocalizadorHistory('bid-cambio')
 *
 * useEffect(() => {
 *   addEntry({ productId, productLabel, productColor, pageLabel, pagePath })
 * }, [pagePath])
 *
 * <LocalizadorGlobal history={history} ... />
 * ```
 */
export function useLocalizadorHistory(productId: string): UseLocalizadorHistoryReturn {
  const [history, setHistory] = useState<LocalizadorEntry[]>(() =>
    readFromSession(productId)
  )

  // Sincroniza se o productId mudar (troca de produto no mesmo mount)
  useEffect(() => {
    setHistory(readFromSession(productId))
  }, [productId])

  const addEntry = useCallback(
    (opts: UseLocalizadorHistoryOptions) => {
      setHistory((prev: LocalizadorEntry[]) => {
        const last = prev[prev.length - 1]
        // Evita duplicar a mesma página consecutivamente
        if (last && last.pagePath === opts.pagePath && last.productId === opts.productId) {
          return prev
        }
        const entry: LocalizadorEntry = { ...opts, timestamp: Date.now() }
        const next = [...prev, entry].slice(-MAX_ENTRIES)
        writeToSession(opts.productId, next)
        return next
      })
    },
    []
  )

  const clearHistory = useCallback(() => {
    try {
      sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${productId}`)
    } catch {
      // sem crash
    }
    setHistory([])
  }, [productId])

  return { history, addEntry, clearHistory }
}
