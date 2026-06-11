/**
 * TST-UNI-MBOTO-000047 — prefetchVisualizacao dispara chunk e queries corretas
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { prefetchVisualizacao } from '../../../../servicos-global/produto/pedido/client/src/shared/pedidos-prefetch.js'

vi.mock('../../../../servicos-global/produto/pedido/client/src/shared/api.js', () => ({
  pedidoVirtualApi: { listar: vi.fn(async () => ({ data: [], total: 0 })) },
  pedidoVisaoGeralApi: { agregado: vi.fn(async () => ({ data: { total: 0 } })) },
}))

describe('TST-UNI-MBOTO-000047 — prefetchVisualizacao', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    vi.clearAllMocks()
  })

  it('prefetch kanban dispara listar com escopo hidratado', async () => {
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery')
    prefetchVisualizacao(queryClient, 'kanban', ['ws_1'], true, 1)
    expect(prefetchSpy).toHaveBeenCalled()
    const keys = prefetchSpy.mock.calls.map(c => c[0].queryKey)
    expect(keys.some(k => Array.isArray(k) && String(k[0]).includes('pedido'))).toBe(true)
  })

  it('prefetch agregado quando escopo >= 4 workspaces', async () => {
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery')
    prefetchVisualizacao(queryClient, 'visao-geral', ['ws_1', 'ws_2', 'ws_3', 'ws_4'], true, 4)
    const keys = prefetchSpy.mock.calls.map(c => c[0].queryKey)
    expect(keys.some(k => Array.isArray(k) && k[0] === 'visao-geral-agregado')).toBe(true)
  })

  it('não prefetch queries se escopo não hidratado', () => {
    const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery')
    prefetchVisualizacao(queryClient, 'kanban', ['ws_1'], false, 1)
    expect(prefetchSpy).not.toHaveBeenCalled()
  })
})
