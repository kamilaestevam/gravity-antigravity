/**
 * useListaCardKpis — busca KPIs agregados da API para cards da Lista
 */

import { useState, useEffect, useRef } from 'react'
import { listaCardKpisSchema, type CardPeriodoCodigo, type ListaCardKpis } from './lista-card-schemas'
import { request } from './api'
import { useEscopoWorkspacesPedido } from './useEscopoWorkspacesPedido'

export interface ListaCardKpisParams {
  period: CardPeriodoCodigo
  status?: string
  busca?: string
  idsWorkspacesFiltro?: string[]
  enabled?: boolean
}

export function useListaCardKpis(params: ListaCardKpisParams) {
  const [kpis, setKpis] = useState<ListaCardKpis | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const seqRef = useRef(0)
  const versaoEscopo = useEscopoWorkspacesPedido(s => s.versaoEscopo)

  const {
    period,
    status,
    busca,
    idsWorkspacesFiltro,
    enabled = true,
  } = params

  useEffect(() => {
    if (!enabled) {
      setKpis(null)
      setCarregando(false)
      setErro(null)
      return
    }

    const seq = ++seqRef.current
    const q = new URLSearchParams()
    q.set('period', period)
    if (status && status !== 'todos') q.set('status', status)
    if (busca?.trim()) q.set('busca', busca.trim())
    if (idsWorkspacesFiltro?.length) q.set('ids_workspaces', idsWorkspacesFiltro.join(','))

    // Limpa KPIs stale imediatamente — evita cards desincronizados da tabela vazia
    setKpis(null)
    setCarregando(true)
    setErro(null)

    request<unknown>(`/api/v1/pedidos/lista/kpis?${q}`)
      .then(raw => {
        if (seq !== seqRef.current) return
        setKpis(listaCardKpisSchema.parse(raw))
      })
      .catch(err => {
        if (seq !== seqRef.current) return
        setErro(err instanceof Error ? err.message : 'Erro ao carregar KPIs')
        setKpis(null)
      })
      .finally(() => {
        if (seq === seqRef.current) setCarregando(false)
      })
  }, [period, status, busca, idsWorkspacesFiltro?.join(','), enabled, versaoEscopo])

  return { kpis, carregando, erro }
}
