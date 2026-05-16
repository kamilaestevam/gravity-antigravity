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
  /** Extrai uma versão estável do item (ex: timestamp do servidor). Quando fornecido,
   *  filhos só são recarregados se a VERSÃO mudar — não a referência do objeto.
   *  Isso evita reload ao atualizar estado local (divergências, totais) sem fetch novo. */
  itemVersion?: (item: T) => unknown,
  /** Counter que, quando incrementado, limpa o filhosCache interno e força
   *  re-fetch dos filhos na próxima expansão. Usado após edição em massa de itens
   *  quando `itemVersion` (updated_at do pai) não muda. */
  resetCacheFilhos?: number,
): UseGTExpandirRetorno<T, C> {
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [filhosCache, setFilhosCache] = useState<Map<string, C[]>>(new Map())
  const [carregandoFilhos, setCarregandoFilhos] = useState<Set<string>>(new Set())

  // Refs síncronas para evitar stale closure no toggle sem incluir state nas deps
  const expandidosRef = useRef(expandidos)
  expandidosRef.current = expandidos
  const filhosCacheRef = useRef(filhosCache)
  filhosCacheRef.current = filhosCache

  // ── Auto-revalidar filhos de pais expandidos quando os dados mudam ───────────
  // Quando carregarInicial() / qualquer re-fetch atualiza a referência de um pai
  // que já está expandido, os filhos no cache ficam com _p stale. Este efeito
  // detecta a mudança e recarrega silenciosamente.
  // Quando `itemVersion` é fornecido, compara versões (timestamp servidor) em vez de
  // referências — evita reload ao atualizar apenas estado local (divergências, totais).
  const dadosAnteriorRef = useRef<Map<string, unknown>>(new Map())

  // ── Reset forçado do cache de filhos ──────────────────────────────────────────
  // Quando `resetCacheFilhos` é incrementado, limpa o cache interno e recarrega
  // todos os pais expandidos. Usado após edição em massa de itens quando
  // `itemVersion` (updated_at do pai) não muda e o auto-revalidar não detecta.
  const resetCacheFilhosRef = useRef(resetCacheFilhos ?? 0)
  useEffect(() => {
    const valor = resetCacheFilhos ?? 0
    if (valor === resetCacheFilhosRef.current) return
    resetCacheFilhosRef.current = valor

    // Limpa cache e snapshot
    setFilhosCache(new Map())
    dadosAnteriorRef.current = new Map()

    // Recarrega todos os pais expandidos
    if (!onCarregarFilhos || !dados || !itemId || expandidosRef.current.size === 0) return
    for (const id of expandidosRef.current) {
      const itemAtual = dados.find(d => itemId(d) === id)
      if (!itemAtual) continue
      onCarregarFilhos(itemAtual)
        .then(filhos => {
          setFilhosCache(prev => {
            const next = new Map(prev)
            next.set(id, filhos)
            return next
          })
          dadosAnteriorRef.current.set(id, itemVersion ? itemVersion(itemAtual) : itemAtual)
        })
        .catch(() => { /* silent — pais sem filhos se reexpandirem */ })
    }
  }, [resetCacheFilhos, onCarregarFilhos, dados, itemId, itemVersion])

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
        dadosAnteriorRef.current.set(id, itemVersion ? itemVersion(item) : item)
        setExpandidos(prev => new Set(prev).add(id))
        return
      }

      // Se já está no cache, expande sem recarregar
      if (filhosCacheRef.current.has(id)) {
        dadosAnteriorRef.current.set(id, itemVersion ? itemVersion(item) : item)
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
        dadosAnteriorRef.current.set(id, itemVersion ? itemVersion(item) : item)
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

  useEffect(() => {
    if (!onCarregarFilhos || !dados || !itemId || expandidosRef.current.size === 0) return

    const paisParaRecarregar: { id: string; item: T }[] = []

    for (const id of expandidosRef.current) {
      const itemAtual = dados.find(d => itemId(d) === id)
      if (!itemAtual) continue
      const chaveAnterior = dadosAnteriorRef.current.get(id)
      // Compara versão (quando fornecida) ou referência de objeto
      const chaveAtual = itemVersion ? itemVersion(itemAtual) : itemAtual
      if (chaveAnterior !== undefined && chaveAnterior !== chaveAtual) {
        paisParaRecarregar.push({ id, item: itemAtual })
      }
    }

    // Atualizar snapshot dos pais expandidos
    const novoSnapshot = new Map<string, unknown>()
    for (const d of dados) {
      const id = itemId(d)
      if (expandidosRef.current.has(id)) novoSnapshot.set(id, itemVersion ? itemVersion(d) : d)
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
  }, [dados, itemId, onCarregarFilhos, itemVersion])

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
