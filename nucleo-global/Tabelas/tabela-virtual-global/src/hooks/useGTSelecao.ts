/**
 * @nucleo/tabela-virtual-global — useGTSelecao
 * Gerencia seleção múltipla com Set<string> para O(1) de lookup.
 */

import { useState, useCallback, useMemo } from 'react'

export interface UseGTSelecaoRetorno {
  selecionados: Set<string>
  /** true se todos os ids fornecidos estão selecionados */
  todosSelecionados: (ids: string[]) => boolean
  /** true se alguns (mas não todos) ids estão selecionados */
  parcialmnteSelecionados: (ids: string[]) => boolean
  toggleItem: (id: string) => void
  toggleTodos: (ids: string[]) => void
  limpar: () => void
  selecionadosArray: string[]
}

export function useGTSelecao(): UseGTSelecaoRetorno {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())

  const selecionadosArray = useMemo(() => Array.from(selecionados), [selecionados])

  const toggleItem = useCallback((id: string) => {
    setSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleTodos = useCallback((ids: string[]) => {
    setSelecionados(prev => {
      const todosJaSelecionados = ids.every(id => prev.has(id))
      if (todosJaSelecionados) {
        // Deseleciona todos
        const next = new Set(prev)
        ids.forEach(id => next.delete(id))
        return next
      } else {
        // Seleciona todos
        const next = new Set(prev)
        ids.forEach(id => next.add(id))
        return next
      }
    })
  }, [])

  const limpar = useCallback(() => {
    setSelecionados(new Set())
  }, [])

  const todosSelecionados = useCallback(
    (ids: string[]) => ids.length > 0 && ids.every(id => selecionados.has(id)),
    [selecionados],
  )

  const parcialmnteSelecionados = useCallback(
    (ids: string[]) => {
      const algum = ids.some(id => selecionados.has(id))
      const todos = ids.every(id => selecionados.has(id))
      return algum && !todos
    },
    [selecionados],
  )

  return {
    selecionados,
    todosSelecionados,
    parcialmnteSelecionados,
    toggleItem,
    toggleTodos,
    limpar,
    selecionadosArray,
  }
}
