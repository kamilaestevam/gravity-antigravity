import { useEffect, useRef, useCallback } from 'react'
import { useDashboardStore } from '../store/dashboardStore.js'
import type { DashboardWidgetConfig, WidgetResult } from '../store/dashboardStore.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTenantHeaders(): Record<string, string> {
  const tenantId = localStorage.getItem('x-tenant-id') ?? ''
  const userId = localStorage.getItem('x-user-id') ?? ''
  return {
    'Content-Type': 'application/json',
    ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
  }
}

// ─── Interface ────────────────────────────────────────────────────────────────

interface UseDashboardDataOptions {
  widgetId: string
  querySpec: DashboardWidgetConfig['query_spec']
  enabled?: boolean
}

interface UseDashboardDataReturn {
  result: WidgetResult | null
  loading: boolean
  error: string | null
  refetch: () => void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardData({
  widgetId,
  querySpec,
  enabled = true,
}: UseDashboardDataOptions): UseDashboardDataReturn {
  const setWidgetData = useDashboardStore((s) => s.setWidgetData)
  const setWidgetLoading = useDashboardStore((s) => s.setWidgetLoading)
  const setWidgetError = useDashboardStore((s) => s.setWidgetError)
  const result = useDashboardStore((s) => s.widgetData[widgetId] ?? null)
  const loading = useDashboardStore((s) => s.widgetLoading[widgetId] ?? false)
  const error = useDashboardStore((s) => s.widgetErrors[widgetId] ?? null)

  // Serializa querySpec para detectar mudanças via deep compare
  const querySpecKey = JSON.stringify(querySpec)
  const querySpecKeyRef = useRef<string>(querySpecKey)

  const executeQuery = useCallback(async () => {
    if (!enabled) return

    setWidgetLoading(widgetId, true)
    setWidgetError(widgetId, null)

    try {
      const res = await fetch('/api/v1/dashboards/widgets/executar-query', {
        method: 'POST',
        headers: getTenantHeaders(),
        body: JSON.stringify({ spec: querySpec }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => `Status ${res.status}`)
        throw new Error(text || `Status ${res.status}`)
      }

      const body: { data: WidgetResult } = await res.json()
      setWidgetData(widgetId, body.data)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar widget'
      setWidgetError(widgetId, message)
    } finally {
      setWidgetLoading(widgetId, false)
    }
  }, [widgetId, querySpecKey, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-executa quando querySpec muda (deep compare via JSON.stringify)
  useEffect(() => {
    if (querySpecKeyRef.current !== querySpecKey) {
      querySpecKeyRef.current = querySpecKey
    }
    executeQuery()
  }, [querySpecKey, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { result, loading, error, refetch: executeQuery }
}
