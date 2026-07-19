/** SSOT — status padrão do Pedido (Configurações › Status). Alinhado a `STATUS_PADRAO` em pedidos-config.ts. */
export type StatusPedidoManual = {
  slug: string
  rotulo: string
  cor: string
  eh_sistema: boolean
  gatilho: string
  comeca: string
  termina: string
}

export const CATALOGO_STATUS_PADRAO_PEDIDO: StatusPedidoManual[] = [
  {
    slug: 'rascunho',
    rotulo: 'Rascunho',
    cor: '#94a3b8',
    eh_sistema: true,
    gatilho: '**Automático** na criação (**+ Novo**, importação ou Smart Docs).',
    comeca: 'Pedido recém-criado, ainda em montagem ou com avisos.',
    termina: 'Avança para **Aberto** ou **Cancelado** na **Lista**.',
  },
  {
    slug: 'aberto',
    rotulo: 'Aberto',
    cor: '#3b82f6',
    eh_sistema: true,
    gatilho: '**Manual** na **Lista** ou **automático** quando o saldo não indica transferência.',
    comeca: 'Pedido validado, com itens ativos e saldo disponível.',
    termina: 'Vira **Transferido**, **Consolidado** ou **Cancelado**.',
  },
  {
    slug: 'em_andamento',
    rotulo: 'Em Andamento',
    cor: '#f97316',
    eh_sistema: false,
    gatilho: '**Manual** na **Lista** ou edição em massa.',
    comeca: 'Etapa operacional entre abertura e aprovação.',
    termina: 'Segue para **Aprovado**, status customizado ou etapa anterior.',
  },
  {
    slug: 'aprovado',
    rotulo: 'Aprovado',
    cor: '#facc15',
    eh_sistema: false,
    gatilho: '**Manual** após aprovação comercial ou interna.',
    comeca: 'Pedido liberado para embarque ou movimentação de saldo.',
    termina: 'Continua até **Transferido**, **Consolidado** ou status customizado.',
  },
  {
    slug: 'transferencia',
    rotulo: 'Transferido',
    cor: '#2dd4bf',
    eh_sistema: true,
    gatilho: '**Automático** ao **Transferir** saldo ou com **Qtd. transferida** > 0.',
    comeca: 'Parte ou todo o saldo saiu do pedido.',
    termina: 'Encerra em **Consolidado** ou **Cancelado**.',
  },
  {
    slug: 'consolidado',
    rotulo: 'Consolidado',
    cor: '#a78bfa',
    eh_sistema: true,
    gatilho: '**Automático** com **Qtd. atual** zerada ou ao **Consolidar** pedidos.',
    comeca: 'Pedido encerrado ou origens fundidas em novo pedido.',
    termina: 'Estado **terminal**: sem novas movimentações.',
  },
  {
    slug: 'cancelado',
    rotulo: 'Cancelado',
    cor: '#ef4444',
    eh_sistema: true,
    gatilho: '**Manual** na **Lista**; importação reverte só em **Rascunho**.',
    comeca: 'Pedido anulado pelo workspace.',
    termina: 'Estado **terminal**: permanece no histórico.',
  },
]

export const TOTAL_STATUS_PADRAO_PEDIDO = CATALOGO_STATUS_PADRAO_PEDIDO.length

export const TOTAL_STATUS_SISTEMA_PEDIDO = CATALOGO_STATUS_PADRAO_PEDIDO.filter((s) => s.eh_sistema).length

export const TOTAL_STATUS_EDITAVEIS_PADRAO_PEDIDO = CATALOGO_STATUS_PADRAO_PEDIDO.filter((s) => !s.eh_sistema).length
