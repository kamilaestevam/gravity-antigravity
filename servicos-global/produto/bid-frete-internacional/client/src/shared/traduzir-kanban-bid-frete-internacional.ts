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
} from './types'
import type { StatusCotacaoConfigBidFreteInternacional } from './status-config-bid-frete-internacional'

export function traduzirStatusColunaKanbanBidFrete(
  t: TFunction,
  status: Pick<StatusCotacaoConfigBidFreteInternacional, 'nome' | 'rotulo' | 'gerenciado_sistema'>,
): string {
  const canonico = STATUS_LABELS[status.nome as StatusCotacao]
  if (status.gerenciado_sistema && canonico) {
    return t(`bidfrete.status_cotacao.${status.nome}`, { defaultValue: canonico })
  }
  if (canonico) {
    return t(`bidfrete.status_cotacao.${status.nome}`, { defaultValue: status.rotulo || canonico })
  }
  return t(`bidfrete.kanban.status_personalizado.${status.nome}`, {
    defaultValue: status.rotulo,
  })
}

export function traduzirOperacaoKanbanBidFrete(
  t: TFunction,
  operacao: TipoOperacao,
): string {
  return t(`bidfrete.enums.operacao.${operacao}`, {
    defaultValue: OPERACAO_LABELS[operacao] ?? operacao,
  })
}

export function traduzirModalKanbanBidFrete(
  t: TFunction,
  modal: ModalFrete,
): string {
  return t(`bidfrete.enums.modal.${modal}`, {
    defaultValue: MODAL_LABELS[modal] ?? modal,
  })
}

export function traduzirModalidadeKanbanBidFrete(
  t: TFunction,
  modalidade: ModalidadeCarga,
): string {
  return t(`bidfrete.enums.modalidade.${modalidade}`, {
    defaultValue: MODALIDADE_LABELS[modalidade] ?? modalidade,
  })
}
