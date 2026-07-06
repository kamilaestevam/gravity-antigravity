import type { TFunction } from 'i18next'
import {
  MODAL_LABELS,
  MODALIDADE_LABELS,
  OPERACAO_LABELS,
  STATUS_LABELS,
  type ModalFrete,
  type ModalidadeCarga,
  type StatusCotacao,
  type TipoOperacao,
  type Visibilidade,
} from './types'
import {
  traduzirModalKanbanBidFrete,
  traduzirModalidadeKanbanBidFrete,
  traduzirOperacaoKanbanBidFrete,
  traduzirStatusColunaKanbanBidFrete,
} from './traduzir-kanban-bid-frete-internacional'

export {
  traduzirModalKanbanBidFrete,
  traduzirModalidadeKanbanBidFrete,
  traduzirOperacaoKanbanBidFrete,
  traduzirStatusColunaKanbanBidFrete,
}

export function traduzirStatusCotacaoBidFrete(
  t: TFunction,
  status: StatusCotacao | string,
  rotuloFallback?: string,
): string {
  const canonico = STATUS_LABELS[status as StatusCotacao]
  if (canonico) {
    return t(`bidfrete.status_cotacao.${status}`, {
      defaultValue: rotuloFallback ?? canonico,
    })
  }
  if (rotuloFallback) {
    return t(`bidfrete.kanban.status_personalizado.${status}`, {
      defaultValue: rotuloFallback,
    })
  }
  return status
}

export function traduzirVisibilidadeBidFrete(
  t: TFunction,
  visibilidade: Visibilidade | string,
): string {
  if (visibilidade === 'ABERTA') {
    return t('bidfrete.nova_cotacao.aberta', { defaultValue: 'Aberta' })
  }
  if (visibilidade === 'DIRECIONADA') {
    return t('bidfrete.nova_cotacao.direcionada', { defaultValue: 'Direcionada' })
  }
  return String(visibilidade)
}

export function traduzirSimNaoBidFrete(
  t: TFunction,
  valor: boolean | string,
): string {
  const sim =
    valor === true ||
    valor === 'true' ||
    String(valor).toLowerCase() === 'sim'
  return sim
    ? t('bidfrete.nova_cotacao.sim', { defaultValue: 'Sim' })
    : t('bidfrete.nova_cotacao.nao', { defaultValue: 'Não' })
}

export function opcoesOperacaoListaBidFrete(
  t: TFunction,
): Array<{ valor: string; label: string }> {
  return (Object.keys(OPERACAO_LABELS) as TipoOperacao[]).map(valor => ({
    valor,
    label: traduzirOperacaoKanbanBidFrete(t, valor),
  }))
}

export function opcoesModalListaBidFrete(
  t: TFunction,
): Array<{ valor: string; label: string }> {
  return (Object.keys(MODAL_LABELS) as ModalFrete[]).map(valor => ({
    valor,
    label: traduzirModalKanbanBidFrete(t, valor),
  }))
}

export function opcoesModalidadeListaBidFrete(
  t: TFunction,
): Array<{ valor: string; label: string }> {
  return (Object.keys(MODALIDADE_LABELS) as ModalidadeCarga[]).map(valor => ({
    valor,
    label: traduzirModalidadeKanbanBidFrete(t, valor),
  }))
}

export function opcoesVisibilidadeListaBidFrete(
  t: TFunction,
): Array<{ valor: string; label: string }> {
  return (['ABERTA', 'DIRECIONADA'] as Visibilidade[]).map(valor => ({
    valor,
    label: traduzirVisibilidadeBidFrete(t, valor),
  }))
}

export function opcoesAnonimaListaBidFrete(
  t: TFunction,
): Array<{ valor: string; label: string }> {
  return [
    { valor: 'true', label: traduzirSimNaoBidFrete(t, true) },
    { valor: 'false', label: traduzirSimNaoBidFrete(t, false) },
  ]
}

export function opcoesStatusPadraoListaBidFrete(
  t: TFunction,
): Array<{ valor: string; label: string }> {
  return (Object.keys(STATUS_LABELS) as StatusCotacao[]).map(valor => ({
    valor,
    label: traduzirStatusCotacaoBidFrete(t, valor),
  }))
}

export function mapOperacaoLabelsBidFrete(t: TFunction): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(OPERACAO_LABELS) as TipoOperacao[]).map(k => [
      k,
      traduzirOperacaoKanbanBidFrete(t, k),
    ]),
  )
}

export function mapModalLabelsBidFrete(t: TFunction): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(MODAL_LABELS) as ModalFrete[]).map(k => [
      k,
      traduzirModalKanbanBidFrete(t, k),
    ]),
  )
}

export function mapModalidadeLabelsBidFrete(t: TFunction): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(MODALIDADE_LABELS) as ModalidadeCarga[]).map(k => [
      k,
      traduzirModalidadeKanbanBidFrete(t, k),
    ]),
  )
}

export function mapVisibilidadeLabelsBidFrete(t: TFunction): Record<string, string> {
  return {
    ABERTA: traduzirVisibilidadeBidFrete(t, 'ABERTA'),
    DIRECIONADA: traduzirVisibilidadeBidFrete(t, 'DIRECIONADA'),
  }
}

export function mapAnonimaLabelsBidFrete(t: TFunction): Record<string, string> {
  return {
    true: traduzirSimNaoBidFrete(t, true),
    false: traduzirSimNaoBidFrete(t, false),
  }
}

export function mapStatusLabelsBidFrete(t: TFunction): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(STATUS_LABELS) as StatusCotacao[]).map(k => [
      k,
      traduzirStatusCotacaoBidFrete(t, k),
    ]),
  )
}
