export type StatusKanbanPedidoSimulador = 'abertura' | 'anuencia' | 'desembaraco'

export type CardKanbanPedidoSimulador = {
  id: string
  titulo: string
  cliente: string
  status: StatusKanbanPedidoSimulador
  data: string
  valor: string
}

export const CARDS_KANBAN_INICIAIS_PEDIDO_SIMULADOR: CardKanbanPedidoSimulador[] = [
  {
    id: '1',
    titulo: 'PO-9821 - Master Trade',
    cliente: 'Master Importações',
    status: 'abertura',
    data: '06/07/2026',
    valor: 'USD 45.600',
  },
  {
    id: '2',
    titulo: 'PO-9822 - Log Tech',
    cliente: 'LogTech Brasil',
    status: 'anuencia',
    data: '05/07/2026',
    valor: 'USD 12.800',
  },
  {
    id: '3',
    titulo: 'PO-9823 - Global Imp',
    cliente: 'Global Trading',
    status: 'desembaraco',
    data: '04/07/2026',
    valor: 'USD 89.400',
  },
]
