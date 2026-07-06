import type { TFunction } from 'i18next'
import type { FiltroOperacaoModalMapaInsights } from './filtrar-dados-mapa-insights-bid-frete-internacional'
import {
  FILTROS_OPERACAO_MODAL_MAPA_INSIGHTS,
  FILTROS_STATUS_MAPA_INSIGHTS,
} from './filtrar-dados-mapa-insights-bid-frete-internacional'
import type { StatusCotacao } from './types'
import {
  traduzirModalKanbanBidFrete,
  traduzirOperacaoKanbanBidFrete,
  traduzirStatusCotacaoBidFrete,
} from './traduzir-enums-bid-frete-internacional'

const PREFIXO = 'bidfrete.insights.mapa'

export type SecaoFiltroMapaInsightsId =
  | 'operacao'
  | 'modal'
  | 'origem'
  | 'destino'
  | 'status'

export function traduzirLabelFiltroOperacaoModalMapaInsights(
  t: TFunction,
  id: FiltroOperacaoModalMapaInsights,
): string {
  if (id === 'IMPORTACAO' || id === 'EXPORTACAO') {
    return traduzirOperacaoKanbanBidFrete(t, id)
  }
  return traduzirModalKanbanBidFrete(t, id)
}

export function traduzirTooltipFiltroOperacaoModalMapaInsights(
  t: TFunction,
  id: FiltroOperacaoModalMapaInsights,
): string {
  const meta = FILTROS_OPERACAO_MODAL_MAPA_INSIGHTS.find(f => f.id === id)
  return t(`${PREFIXO}.filtro.operacao_modal.${id}.tooltip`, {
    defaultValue: meta?.tooltipDescricao ?? id,
  })
}

export function traduzirLabelFiltroStatusMapaInsights(
  t: TFunction,
  status: StatusCotacao,
): string {
  const meta = FILTROS_STATUS_MAPA_INSIGHTS.find(f => f.id === status)
  if (status === 'ENVIADA_FORNECEDORES') {
    return t(`${PREFIXO}.filtro.status.ENVIADA_FORNECEDORES`, {
      defaultValue: meta?.label ?? 'Enviada',
    })
  }
  if (status === 'AGUARDANDO_APROVACAO') {
    return t(`${PREFIXO}.filtro.status.AGUARDANDO_APROVACAO`, {
      defaultValue: meta?.label ?? 'Aprovação',
    })
  }
  return traduzirStatusCotacaoBidFrete(t, status, meta?.label)
}

export function traduzirTituloSecaoFiltroMapaInsights(
  t: TFunction,
  id: SecaoFiltroMapaInsightsId,
): string {
  const defaults: Record<SecaoFiltroMapaInsightsId, string> = {
    operacao: 'Operação',
    modal: 'Modal',
    origem: 'Origem',
    destino: 'Destino',
    status: 'Status',
  }
  return t(`${PREFIXO}.filtro.secao.${id}`, { defaultValue: defaults[id] })
}

export function traduzirResumoMapaFiltrado(
  t: TFunction,
  opcoes: {
    totalFiltrosAtivos: number
    totalCotacoes: number
    totalCotacoesBase: number
    pinsAtivos: number
    pinsBase: number
    rotasAtivas: number
    rotasBase: number
  },
): string {
  const {
    totalFiltrosAtivos,
    totalCotacoes,
    totalCotacoesBase,
    pinsAtivos,
    pinsBase,
    rotasAtivas,
    rotasBase,
  } = opcoes
  if (totalFiltrosAtivos === 0) {
    return t(`${PREFIXO}.refinar.resumo_todos`, {
      defaultValue: `Exibindo todos · ${totalCotacoes} cotações · ${pinsAtivos} terminais · ${rotasAtivas} rotas`,
      cotacoes: totalCotacoes,
      terminais: pinsAtivos,
      rotas: rotasAtivas,
    })
  }
  return t(`${PREFIXO}.refinar.resumo_filtrado`, {
    defaultValue: `${totalCotacoes}/${totalCotacoesBase} cotações · ${pinsAtivos}/${pinsBase} terminais · ${rotasAtivas}/${rotasBase} rotas · ${totalFiltrosAtivos} filtro(s)`,
    totalCotacoes,
    totalCotacoesBase,
    pinsAtivos,
    pinsBase,
    rotasAtivas,
    rotasBase,
    filtros: totalFiltrosAtivos,
  })
}

export function traduzirStatusTransitBenchmarkRota(
  t: TFunction,
  delta: number,
): string {
  if (delta > 0) {
    return t(`${PREFIXO}.benchmark.rota_mais_rapido`, {
      defaultValue: `+${delta}d mais rápido`,
      dias: delta,
    })
  }
  if (delta === 0) {
    return t(`${PREFIXO}.benchmark.rota_na_media`, { defaultValue: 'Dentro da média' })
  }
  return t(`${PREFIXO}.benchmark.rota_atrasado`, {
    defaultValue: `${Math.abs(delta)}d atrasado`,
    dias: Math.abs(delta),
  })
}

export function traduzirComparativoTransitBenchmarkRota(
  t: TFunction,
  diff: number,
  pct: number,
): string {
  if (diff > 0) {
    return t(`${PREFIXO}.benchmark.comparativo_mais_rapido`, {
      defaultValue: `+${pct}% (${diff} dia(s) mais rápido que a média das propostas)`,
      pct,
      dias: diff,
    })
  }
  if (diff < 0) {
    return t(`${PREFIXO}.benchmark.comparativo_mais_lento`, {
      defaultValue: `${pct}% (${Math.abs(diff)} dia(s) acima da média das propostas)`,
      pct,
      dias: Math.abs(diff),
    })
  }
  return t(`${PREFIXO}.benchmark.comparativo_igual`, {
    defaultValue: 'Igual à média das propostas na rota',
  })
}
