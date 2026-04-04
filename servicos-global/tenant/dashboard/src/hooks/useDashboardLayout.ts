import { useCallback, useRef, useState } from 'react'
import { useDashboardStore } from '../store/dashboardStore.js'

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

// ─── Tipos do grid ────────────────────────────────────────────────────────────

export interface GridLayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
}

// ─── Interface ────────────────────────────────────────────────────────────────

interface UseDashboardLayoutOptions {
  configId: string | null
}

interface UseDashboardLayoutReturn {
  handleLayoutChange: (layouts: GridLayoutItem[]) => void
  saveLayout: () => Promise<void>
  isSaving: boolean
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardLayout({
  configId,
}: UseDashboardLayoutOptions): UseDashboardLayoutReturn {
  const [isSaving, setIsSaving] = useState(false)

  const activeConfig = useDashboardStore((s) => s.activeConfig)
  const pendingLayout = useDashboardStore((s) => s.pendingLayout)
  const setPendingLayout = useDashboardStore((s) => s.setPendingLayout)
  const clearPendingLayout = useDashboardStore((s) => s.clearPendingLayout)
  const setActiveConfig = useDashboardStore((s) => s.setActiveConfig)

  // Snapshot do layout anterior para rollback otimista
  const previousLayoutRef = useRef<typeof pendingLayout>({})

  // Debounce ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── saveLayout ─────────────────────────────────────────────────────────────

  const saveLayout = useCallback(async (): Promise<void> => {
    if (!configId || !activeConfig) return

    setIsSaving(true)

    // Monta o novo layout mesclando pendingLayout com o layout atual
    const updatedWidgets = activeConfig.widgets.map((w) => {
      const pos = pendingLayout[w.id]
      if (!pos) return w
      return { ...w, position: pos }
    })

    const updatedLayout = updatedWidgets.map((w) => ({ ...w.position, i: w.id }))

    // Snapshot para rollback
    previousLayoutRef.current = { ...pendingLayout }

    try {
      const res = await fetch(`/api/v1/dashboard/configs/${configId}`, {
        method: 'PUT',
        headers: getTenantHeaders(),
        body: JSON.stringify({ layout: updatedLayout }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => `Status ${res.status}`)
        throw new Error(text || `Status ${res.status}`)
      }

      // Sucesso: atualiza config no store e limpa pending
      setActiveConfig({ ...activeConfig, widgets: updatedWidgets })
      clearPendingLayout()
    } catch (err: unknown) {
      // Rollback: restaura layout anterior no store
      Object.entries(previousLayoutRef.current).forEach(([id, pos]) => {
        setPendingLayout(id, pos)
      })

      const message =
        err instanceof Error ? err.message : 'Erro ao salvar layout'

      // Dispara evento customizado para que a UI possa exibir toast
      window.dispatchEvent(
        new CustomEvent('dashboard:layout-save-error', { detail: { message } }),
      )
    } finally {
      setIsSaving(false)
    }
  }, [configId, activeConfig, pendingLayout, clearPendingLayout, setActiveConfig, setPendingLayout])

  // ─── handleLayoutChange ─────────────────────────────────────────────────────

  const handleLayoutChange = useCallback(
    (layouts: GridLayoutItem[]): void => {
      // Atualiza pendingLayout otimisticamente para cada item do grid
      layouts.forEach((item) => {
        setPendingLayout(item.i, {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        })
      })

      // Debounce de 1000ms antes de salvar automaticamente
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        saveLayout()
      }, 1_000)
    },
    [setPendingLayout, saveLayout],
  )

  return { handleLayoutChange, saveLayout, isSaving }
}
