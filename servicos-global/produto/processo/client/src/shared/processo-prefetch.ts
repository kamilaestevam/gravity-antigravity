import type { ProcessoVisualizacaoId } from '../components/processo-visualizacao-context'

const prefetchChunk = {
  lista:  () => import('../pages/ProcessoLista'),
  kanban: () => import('../pages/todos/TodosProcessosKanban'),
} as const satisfies Record<ProcessoVisualizacaoId, () => Promise<unknown>>

export function prefetchProcessoVisualizacao(id: ProcessoVisualizacaoId): void {
  void prefetchChunk[id]()
}
