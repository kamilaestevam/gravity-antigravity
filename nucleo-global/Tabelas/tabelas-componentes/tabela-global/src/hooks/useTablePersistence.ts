import { useState, useCallback, useEffect } from 'react'

export interface TablePersistenceOptions {
  tableId: string
  initialKeys: string[]
  defaultHiddenKeys?: string[]
}

export function useTablePersistence({
  tableId,
  initialKeys,
  defaultHiddenKeys = []
}: TablePersistenceOptions) {
  const storageKey = `gravity-table-cols-${tableId}`
  const orderKey   = `gravity-table-order-${tableId}`

  // ── Visibilidade ─────────────────────────────────────────────────────────────

  const loadInitialState = useCallback((): Set<string> => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return new Set(parsed)
      }
    } catch (e) {
      console.error('Erro ao carregar colunas visíveis da tabela:', e)
    }
    const visible = initialKeys.filter(k => !defaultHiddenKeys.includes(k))
    return new Set(visible)
  }, [storageKey, initialKeys, defaultHiddenKeys])

  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(loadInitialState)

  // Quando initialKeys cresce (ex.: colunas customizadas carregadas depois do mount),
  // auto-adiciona as novas chaves como visíveis (sem sobrescrever preferências salvas).
  useEffect(() => {
    setVisibleKeys(prev => {
      let changed = false
      const next = new Set(prev)
      initialKeys.forEach(k => {
        if (!next.has(k) && !defaultHiddenKeys.includes(k)) {
          next.add(k)
          changed = true
        }
      })
      return changed ? next : prev
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKeys.join('\x00'), defaultHiddenKeys.join('\x00')])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(visibleKeys)))
  }, [visibleKeys, storageKey])

  const toggleVisibility = useCallback((key: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const resetToDefault = useCallback(() => {
    const visible = initialKeys.filter(k => !defaultHiddenKeys.includes(k))
    setVisibleKeys(new Set(visible))
    setColumnOrderState([...initialKeys])
  }, [initialKeys, defaultHiddenKeys])

  const setAllVisible = useCallback(() => {
    setVisibleKeys(new Set(initialKeys))
  }, [initialKeys])

  const clearAllVisible = useCallback(() => {
    setVisibleKeys(new Set())
  }, [])

  const isVisible = useCallback((key: string) => {
    return visibleKeys.has(key)
  }, [visibleKeys])

  // ── Ordem das colunas ────────────────────────────────────────────────────────

  const loadInitialOrder = useCallback((): string[] => {
    try {
      const saved = localStorage.getItem(orderKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) { /* silent */ }
    return [...initialKeys]
  }, [orderKey, initialKeys])

  const [columnOrder, setColumnOrderState] = useState<string[]>(loadInitialOrder)

  useEffect(() => {
    localStorage.setItem(orderKey, JSON.stringify(columnOrder))
  }, [columnOrder, orderKey])

  const setColumnOrder = useCallback((newOrder: string[]) => {
    setColumnOrderState(newOrder)
  }, [])

  return {
    visibleKeys,
    isVisible,
    toggleVisibility,
    resetToDefault,
    setAllVisible,
    clearAllVisible,
    columnOrder,
    setColumnOrder,
  }
}
