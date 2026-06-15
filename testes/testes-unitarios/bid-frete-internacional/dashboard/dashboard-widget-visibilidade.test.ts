import { describe, expect, it } from 'vitest'
import type { DashboardWidgetConfig } from '@nucleo/dashboard'
import {
  ordenarWidgetsLista,
  sincronizarOrdemPainelPorPosicaoGrid,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/dashboardWidgetVisibilidade'

function widget(id: string, x: number, y: number, ordem?: number): DashboardWidgetConfig {
  return {
    id,
    title: id,
    chart_type: 'KPI_CARD',
    query_spec: { filters: { period: '30d' }, fields: [] },
    position: { x, y, w: 3, h: 2 },
    config: ordem !== undefined ? { ordem_painel: ordem } : {},
  }
}

describe('sincronizarOrdemPainelPorPosicaoGrid', () => {
  it('reordena ordem_painel após mover widget no grid (y/x)', () => {
    const widgets = [
      widget('a', 0, 0, 0),
      widget('b', 3, 0, 1),
      widget('c', 0, 2, 2),
    ]
    const movidos = sincronizarOrdemPainelPorPosicaoGrid([
      widgets[0],
      { ...widgets[1], position: { ...widgets[1].position, x: 0, y: 2 } },
      { ...widgets[2], position: { ...widgets[2].position, x: 3, y: 0 } },
    ])
    const ordenados = ordenarWidgetsLista(movidos).map(w => w.id)
    expect(ordenados).toEqual(['a', 'c', 'b'])
    expect(movidos.find(w => w.id === 'b')?.config?.ordem_painel).toBe(2)
    expect(movidos.find(w => w.id === 'c')?.config?.ordem_painel).toBe(1)
  })
})
