import type { StatusKanbanPedidoSimulador } from './dados-kanban-simulador-pedido'

/** Mapa coluna → data-sds-tutorial-alvo (guia Gabi) */
export const ALVO_TUTORIAL_COLUNA_KANBAN: Record<StatusKanbanPedidoSimulador, string> = {
  rascunho: 'pedido-kanban-coluna-rascunho',
  aberto: 'pedido-kanban-coluna-aberto',
  em_andamento: 'pedido-kanban-coluna-em-andamento',
  aprovado: 'pedido-kanban-coluna-aprovado',
  transferencia: 'pedido-kanban-coluna-transferencia',
  consolidado: 'pedido-kanban-coluna-consolidado',
  cancelado: 'pedido-kanban-coluna-cancelado',
}

export function resolverAlvoTutorialColunaKanban(key: string): string | undefined {
  return ALVO_TUTORIAL_COLUNA_KANBAN[key as StatusKanbanPedidoSimulador]
}
