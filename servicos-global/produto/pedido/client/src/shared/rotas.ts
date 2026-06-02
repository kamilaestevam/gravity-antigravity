// Rotas internas do produto Pedido — fonte unica de verdade.
// Consumida pelos <Route>s do App.tsx (produto) e pelo GuardaRotaPedido do shell.
//
// Ao adicionar uma rota nova:
//   1. Acrescente o sufixo aqui (em estaticas ou dinamicas).
//   2. Mapeie o componente correspondente no MAPA_ROTAS_COMPONENTES (App.tsx).
//   3. Visualizações (Lista, Kanban, Visão Geral, Dashboard) ficam no seletor
//      fixo no topo (PedidosVisualizacaoTabs) — não no menu lateral.

export const ROTAS_PEDIDO = {
  estaticas: [
    '',
    'pedidos',
    'pedidos/visao-geral',
    'pedidos/lista',
    'pedidos/dashboard',
    'pedidos/kanban',
    'pedidos/novo',
    'configuracoes',
  ],
  dinamicas: [/^pedidos\/[^/]+\/editar$/],
} as const

export const BASE_ROTA_PEDIDO = '/pedido'
