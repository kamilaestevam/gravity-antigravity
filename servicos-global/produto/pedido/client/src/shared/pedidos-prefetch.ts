/**
 * Prefetch de chunks e React Query ao hover nas pills do seletor de visualização.
 */

import type { QueryClient } from '@tanstack/react-query'
import type { PedidoVisualizacaoId } from '../components/pedidos-visualizacao-context'
import { QUERY_KEYS, type PedidosParams } from './queries'
import { pedidoVirtualApi, pedidoVisaoGeralApi } from './api'
import { ESCOPO_MINIMO_PARA_AGREGADO_SERVIDOR } from '../../../shared/visaoGeralResumoAggregate.js'

const prefetchChunk = {
  'visao-geral': () => import('../pages/PedidosVisaoGeral'),
  lista:         () => import('../pages/Pedidos'),
  dashboard:     () => import('../pages/PedidosDashboard'),
  kanban:        () => import('../pages/PedidosKanban'),
} as const satisfies Record<PedidoVisualizacaoId, () => Promise<unknown>>

export function prefetchVisualizacaoChunk(id: PedidoVisualizacaoId): void {
  void prefetchChunk[id]()
}

export function prefetchPedidosEscopo(
  queryClient: QueryClient,
  params: PedidosParams,
): void {
  void queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.pedidos(params),
    queryFn: () => pedidoVirtualApi.listar(params),
    staleTime: 30_000,
  })
}

export function prefetchVisualizacao(
  queryClient: QueryClient,
  id: PedidoVisualizacaoId,
  idsWorkspacesFiltro: string[] | undefined,
  escopoHidratado: boolean,
  qtdWorkspacesEscopo: number,
): void {
  prefetchVisualizacaoChunk(id)

  if (!escopoHidratado) return

  if (id === 'visao-geral' || id === 'kanban') {
    prefetchPedidosEscopo(queryClient, {
      limit: 1000,
      idsWorkspacesFiltro,
    })
  }

  if (id === 'visao-geral' && qtdWorkspacesEscopo >= ESCOPO_MINIMO_PARA_AGREGADO_SERVIDOR) {
    void queryClient.prefetchQuery({
      queryKey: ['visao-geral-agregado', idsWorkspacesFiltro],
      queryFn: () => pedidoVisaoGeralApi.agregado(idsWorkspacesFiltro),
      staleTime: 60_000,
    })
  }
}
