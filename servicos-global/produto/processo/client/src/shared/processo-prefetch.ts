import type { ProcessoVisualizacaoId } from '../components/processo-visualizacao-context'

const prefetchChunk = {
  insights: () => import('../pages/ProcessoInsights'),
  lista: () => import('../pages/ProcessoLista'),
  dashboard: () => import('../pages/ProcessoDashboard'),
  kanban: () => import('../pages/todos/TodosProcessosKanban'),
} as const satisfies Record<ProcessoVisualizacaoId, () => Promise<unknown>>

export function prefetchProcessoVisualizacao(id: ProcessoVisualizacaoId): void {
  void prefetchChunk[id]()
}
