/**
 * useDashboardConfig.ts — Estado dos widgets do Dashboard do Demo
 * Persiste em localStorage. Sem Zustand — só useState.
 */

import { useState } from 'react'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface DemoWidget {
  id:         string
  title:      string
  chart_type: string
  query_spec: { fields: string[]; operation: string }
}

// ── Widgets padrão ────────────────────────────────────────────────────────────

export const DEFAULT_WIDGETS: DemoWidget[] = [
  { id: 'status_dist',    title: 'Distribuição por Status',  chart_type: 'DONUT', query_spec: { fields: ['status'],      operation: 'COUNT' } },
  { id: 'valor_trend',    title: 'Valor ao Longo do Tempo',  chart_type: 'LINE',  query_spec: { fields: ['valor'],       operation: 'SUM'   } },
  { id: 'por_responsavel',title: 'Itens por Responsável',    chart_type: 'BAR',   query_spec: { fields: ['responsavel'], operation: 'COUNT' } },
  { id: 'por_periodo',    title: 'Distribuição por Período', chart_type: 'BAR_HORIZONTAL', query_spec: { fields: ['data'], operation: 'COUNT' } },
]

const STORAGE_KEY = 'demo:dashboard-widgets'

function carregar(): DemoWidget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as DemoWidget[]
  } catch {}
  return DEFAULT_WIDGETS
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useDashboardConfig() {
  const [widgets, setWidgets] = useState<DemoWidget[]>(carregar)

  function salvar(ws: DemoWidget[]) {
    setWidgets(ws)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ws))
  }

  function remover(id: string) {
    salvar(widgets.filter(w => w.id !== id))
  }

  function atualizar(id: string, patch: Partial<DemoWidget>) {
    salvar(widgets.map(w => w.id === id ? { ...w, ...patch } : w))
  }

  function resetar() {
    localStorage.removeItem(STORAGE_KEY)
    setWidgets(DEFAULT_WIDGETS)
  }

  return { widgets, remover, atualizar, resetar }
}
