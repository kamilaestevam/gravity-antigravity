/**
 * @nucleo/tabela-virtual-global — useGTExpandir
 * Gerencia o estado de expansão/colapso das linhas pai
 * e o cache de filhos carregados sob demanda.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export interface UseGTExpandirRetorno<T, C> {
  expandidos: Set<string>
  filhosCache: Map<string, C[]>
  carregandoFilhos: Set<string>
  toggle: (id: string, item: T) => Promise<void>
  colapsar: (id: string) => void
  colapsarTodos: () => void
  /** Atualiza um filho individual no cache (usado após edição inline) */
  atualizarFilhoNoCache: (filho: C, filhoIdFn: (f: C) => string) => void
}

export function useGTExpandir<T, C>(
  onCarregarFilhos?: (item: T) => Promise<C[]>,
  dados?: T[],
  itemId?: (item: T) => string,
): UseGTExpandirRetorno<T, C> {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [filhosCache, setFilhosCache] = useState<Map<string, C[]>>(new Map())
  const [carregandoFilhos, setCarregandoFilhos] = useState<Set<string>>(new Set())

  // Refs síncronas para evitar stale closure no toggle sem incluir state nas deps
  const expandidosRef = useRef(expandidos)
  expandidosRef.current = expandidos
  const filhosCacheRef = useRef(filhosCache)
  filhosCacheRef.current = filhosCache

  const toggle = useCallback(
    async (id: string, item: T) => {
      // Se já expandido, apenas colapsa
      if (expandidosRef.current.has(id)) {
        setExpandidos(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
        return
      }

      // Se não há loader, expande imediatamente (sem filhos ou filhos via prop estática)
      if (!onCarregarFilhos) {
        setExpandidos(prev => new Set(prev).add(id))
        return
      }

      // Se já está no cache, expande sem recarregar
      if (filhosCacheRef.current.has(id)) {
        setExpandidos(prev => new Set(prev).add(id))
        return
      }

      // Carrega os filhos sob demanda
      setCarregandoFilhos(prev => new Set(prev).add(id))
      try {
        const filhos = await onCarregarFilhos(item)
        setFilhosCache(prev => {
          const next = new Map(prev)
          next.set(id, filhos)
          return next
        })
        setExpandidos(prev => new Set(prev).add(id))
      } finally {
        setCarregandoFilhos(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    [onCarregarFilhos],
  )

  // ── Auto-revalidar filhos de pais expandidos quando os dados mudam ───────────
  // Quando carregarInicial() / qualquer re-fetch atualiza a referência de um pai
  // que já está expandido, os filhos no cache ficam com _p stale. Este efeito
  // detecta a mudança de referência por id e recarrega silenciosamente.
  const dadosAnteriorRef = useRef<Map<string, T>>(new Map())

  useEffect(() => {
    if (!onCarregarFilhos || !dados || !itemId || expandidosRef.current.size === 0) return

    const paisParaRecarregar: { id: string; item: T }[] = []

    for (const id of expandidosRef.current) {
      const itemAtual = dados.find(d => itemId(d) === id)
      if (!itemAtual) continue
      const itemAnterior = dadosAnteriorRef.current.get(id)
      // Referência mudou = dados novos do servidor
      if (itemAnterior !== undefined && itemAnterior !== itemAtual) {
        paisParaRecarregar.push({ id, item: itemAtual })
      }
    }

    // Atualizar snapshot dos pais expandidos
    const novoSnapshot = new Map<string, T>()
    for (const d of dados) {
      const id = itemId(d)
      if (expandidosRef.current.has(id)) novoSnapshot.set(id, d)
    }
    dadosAnteriorRef.current = novoSnapshot

    if (paisParaRecarregar.length === 0) return

    for (const { id, item } of paisParaRecarregar) {
      onCarregarFilhos(item)
        .then(filhos => {
          setFilhosCache(prev => {
            const next = new Map(prev)
            next.set(id, filhos)
            return next
          })
        })
        .catch(() => { /* silent — filhos antigos permanecem se falhar */ })
    }
  }, [dados, itemId, onCarregarFilhos])

  const colapsar = useCallback((id: string) => {
    setExpandidos(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const colapsarTodos = useCallback(() => {
    setExpandidos(new Set())
  }, [])

  const atualizarFilhoNoCache = useCallback((filho: C, filhoIdFn: (f: C) => string) => {
    const fId = filhoIdFn(filho)
    setFilhosCache(prev => {
      const next = new Map(prev)
      for (const [paiId, filhos] of next) {
        const idx = filhos.findIndex(f => filhoIdFn(f) === fId)
        if (idx !== -1) {
          const novos = [...filhos]
          novos[idx] = filho
          next.set(paiId, novos)
          break
        }
      }
      return next
    })
  }, [])

  return { expandidos, filhosCache, carregandoFilhos, toggle, colapsar, colapsarTodos, atualizarFilhoNoCache }
}
