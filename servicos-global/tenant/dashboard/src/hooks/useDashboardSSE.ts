import { useEffect, useRef, useState } from 'react'

// ─── Tipos dos eventos SSE ────────────────────────────────────────────────────

interface SSEEventBase {
  type: string
}

interface SSEWidgetUpdateEvent extends SSEEventBase {
  type: 'widget_update'
  widgetId: string
}

interface SSEAlertTriggeredEvent extends SSEEventBase {
  type: 'alert_triggered'
  alertId: string
  message: string
}

interface SSEHeartbeatEvent extends SSEEventBase {
  type: 'heartbeat'
}

type SSEEvent = SSEWidgetUpdateEvent | SSEAlertTriggeredEvent | SSEHeartbeatEvent

// ─── Interface ────────────────────────────────────────────────────────────────

interface UseDashboardSSEOptions {
  dashboardId: string | null
  onWidgetUpdate?: (widgetId: string) => void
  onAlertTriggered?: (alertId: string, message: string) => void
}

interface UseDashboardSSEReturn {
  connected: boolean
  lastHeartbeat: Date | null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardSSE({
  dashboardId,
  onWidgetUpdate,
  onAlertTriggered,
}: UseDashboardSSEOptions): UseDashboardSSEReturn {
  const [connected, setConnected] = useState(false)
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null)

  // Refs estáveis para evitar re-criar EventSource ao mudar callbacks
  const onWidgetUpdateRef = useRef(onWidgetUpdate)
  const onAlertTriggeredRef = useRef(onAlertTriggered)
  onWidgetUpdateRef.current = onWidgetUpdate
  onAlertTriggeredRef.current = onAlertTriggered

  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const destroyedRef = useRef(false)

  useEffect(() => {
    if (!dashboardId) return

    destroyedRef.current = false

    function connect(): void {
      if (destroyedRef.current) return

      const es = new EventSource(`/api/v1/dashboard/stream/${dashboardId}`)
      eventSourceRef.current = es

      es.onopen = () => {
        setConnected(true)
      }

      es.onmessage = (event: MessageEvent<string>) => {
        let parsed: SSEEvent

        try {
          parsed = JSON.parse(event.data) as SSEEvent
        } catch {
          // Mensagem malformada — ignorar
          return
        }

        switch (parsed.type) {
          case 'widget_update':
            onWidgetUpdateRef.current?.(parsed.widgetId)
            break

          case 'alert_triggered':
            onAlertTriggeredRef.current?.(parsed.alertId, parsed.message)
            break

          case 'heartbeat':
            setLastHeartbeat(new Date())
            break

          default:
            // Tipo desconhecido — ignorar
            break
        }
      }

      es.onerror = () => {
        setConnected(false)
        es.close()
        eventSourceRef.current = null

        if (!destroyedRef.current) {
          reconnectTimerRef.current = setTimeout(connect, 5_000)
        }
      }
    }

    connect()

    return () => {
      destroyedRef.current = true

      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      setConnected(false)
    }
  }, [dashboardId])

  return { connected, lastHeartbeat }
}
