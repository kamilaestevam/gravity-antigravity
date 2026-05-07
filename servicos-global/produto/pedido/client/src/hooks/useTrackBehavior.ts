/**
 * useTrackBehavior.ts — Hook de rastreamento de comportamento do usuário
 *
 * Fase 2 do sistema de GABI Insights Personalizados.
 *
 * Rastreia automaticamente:
 *  - Mudanças de rota (route_visited)
 *  - Filtros aplicados (filter_applied) — chamado manualmente
 *  - Widgets clicados (widget_clicked) — chamado manualmente
 *  - Insights clicados (insight_clicked) — chamado manualmente
 *
 * Fire-and-forget: POST para /eventos-comportamento sem bloquear a UX.
 * Falha silenciosa: erro de rede não propaga para o usuário.
 */

import { useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { pedidoEventoApi, type EventoComportamentoTipo, type EventoComportamentoPayload } from '../shared/api'

async function sendEvent(event: EventoComportamentoTipo, payload: EventoComportamentoPayload): Promise<void> {
  // Fire-and-forget com fallback silencioso (Mand. 08 — comportamento intencional aqui:
  // analytics nao deve degradar UX). request() central ja anexa Bearer JWT + headers de tenant.
  try {
    await pedidoEventoApi.registrar(event, payload)
  } catch {
    // Silencioso
  }
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function useTrackBehavior() {
  const location = useLocation()
  const lastRoute = useRef<string>('')

  // Rastreia mudanças de rota automaticamente
  useEffect(() => {
    const route = location.pathname + location.search
    if (route === lastRoute.current) return
    lastRoute.current = route
    void sendEvent('route_visited', { route })
  }, [location])

  // Rastreia filtro aplicado
  const trackFilter = useCallback((field: string, value?: string) => {
    void sendEvent('filter_applied', { filter_field: field, filter_value: value })
  }, [])

  // Rastreia clique em widget do dashboard
  const trackWidget = useCallback((widgetId: string) => {
    void sendEvent('widget_clicked', { widget_id: widgetId })
  }, [])

  // Rastreia clique em insight da Gabi
  const trackInsight = useCallback((insightId: string) => {
    void sendEvent('insight_clicked', { insight_id: insightId })
  }, [])

  // Rastreia visualização de coluna
  const trackColumn = useCallback((columnKey: string) => {
    void sendEvent('column_viewed', { column_key: columnKey })
  }, [])

  return { trackFilter, trackWidget, trackInsight, trackColumn }
}
