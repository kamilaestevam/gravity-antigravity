import type { TFunction } from 'i18next'
import type { FiltroOperacaoMapaInsightsPedido, SecaoFiltroMapaInsightsPedidoId } from './filtrar-dados-mapa-insights-pedido'
import { FILTROS_OPERACAO_MAPA_INSIGHTS_PEDIDO } from './filtrar-dados-mapa-insights-pedido'

const PREFIXO = 'pedido.visao_geral.mapa'

export function traduzirLabelFiltroOperacaoMapaPedido(
  t: TFunction,
  id: FiltroOperacaoMapaInsightsPedido,
): string {
  const meta = FILTROS_OPERACAO_MAPA_INSIGHTS_PEDIDO.find((f) => f.id === id)
  if (id === 'importacao') {
    return t('pedido.visao_geral.modal.importacao', { defaultValue: meta?.label ?? 'Importação' })
  }
  return t('pedido.visao_geral.modal.exportacao', { defaultValue: meta?.label ?? 'Exportação' })
}

export function traduzirTooltipFiltroOperacaoMapaPedido(
  t: TFunction,
  id: FiltroOperacaoMapaInsightsPedido,
): string {
  const meta = FILTROS_OPERACAO_MAPA_INSIGHTS_PEDIDO.find((f) => f.id === id)
  return t(`${PREFIXO}.filtro.operacao.${id}.tooltip`, {
    defaultValue: meta?.tooltipDescricao ?? id,
  })
}

export function traduzirTituloSecaoFiltroMapaPedido(
  t: TFunction,
  id: SecaoFiltroMapaInsightsPedidoId,
): string {
  const defaults: Record<SecaoFiltroMapaInsightsPedidoId, string> = {
    operacao: 'Operação',
    origem: 'Origem (país)',
    destino: 'Destino (país)',
    exportador: 'Exportador',
    importador: 'Importador',
    status: 'Status do Pedido',
  }
  return t(`${PREFIXO}.filtro.secao.${id}`, { defaultValue: defaults[id] })
}

export function traduzirResumoMapaFiltradoPedido(
  t: TFunction,
  opcoes: {
    totalFiltrosAtivos: number
    totalPedidos: number
    totalPedidosBase: number
    pinsAtivos: number
    pinsBase: number
    rotasAtivas: number
    rotasBase: number
  },
): string {
  const {
    totalFiltrosAtivos,
    totalPedidos,
    totalPedidosBase,
    pinsAtivos,
    pinsBase,
    rotasAtivas,
    rotasBase,
  } = opcoes

  if (totalFiltrosAtivos === 0) {
    return t(`${PREFIXO}.refinar.resumo_todos`, {
      defaultValue: `Exibindo todos · ${totalPedidos} pedidos · ${pinsAtivos} locais · ${rotasAtivas} rotas`,
      pedidos: totalPedidos,
      locais: pinsAtivos,
      rotas: rotasAtivas,
    })
  }

  return t(`${PREFIXO}.refinar.resumo_filtrado`, {
    defaultValue: `${totalPedidos}/${totalPedidosBase} pedidos · ${pinsAtivos}/${pinsBase} locais · ${rotasAtivas}/${rotasBase} rotas · ${totalFiltrosAtivos} filtro(s)`,
    totalPedidos,
    totalPedidosBase,
    pinsAtivos,
    pinsBase,
    rotasAtivas,
    rotasBase,
    filtros: totalFiltrosAtivos,
  })
}
