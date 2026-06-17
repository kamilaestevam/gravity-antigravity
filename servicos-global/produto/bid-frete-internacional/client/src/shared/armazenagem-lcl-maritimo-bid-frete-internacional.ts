import type { ModalFrete, ModalidadeCarga } from './types'

export function ehMaritimoLclCotacaoBidFreteInternacional(
  modal?: ModalFrete | '' | null,
  modalidade?: ModalidadeCarga | '' | null,
): boolean {
  return modal === 'MARITIMO' && modalidade === 'LCL'
}

export function exigeArmazenagemFornecedorRespostaCotacao(
  incluir_armazenagem_cotacao_bid_frete_internacional?: boolean | null,
): boolean {
  return incluir_armazenagem_cotacao_bid_frete_internacional === true
}

export type TipoPassoWizardNovaCotacao =
  | 'modal'
  | 'origem'
  | 'carga'
  | 'armazenagem'
  | 'fornecedores'
  | 'resumo'

export function sequenciaPassosWizardNovaCotacao(
  modal: ModalFrete | '',
  modalidade: ModalidadeCarga | '',
): TipoPassoWizardNovaCotacao[] {
  const seq: TipoPassoWizardNovaCotacao[] = ['modal', 'origem', 'carga']
  if (ehMaritimoLclCotacaoBidFreteInternacional(modal, modalidade)) {
    seq.push('armazenagem')
  }
  seq.push('fornecedores', 'resumo')
  return seq
}

export function totalPassosWizardNovaCotacao(
  modal: ModalFrete | '',
  modalidade: ModalidadeCarga | '',
): number {
  return sequenciaPassosWizardNovaCotacao(modal, modalidade).length
}

export function tipoPassoWizardNovaCotacao(
  step: number,
  modal: ModalFrete | '',
  modalidade: ModalidadeCarga | '',
): TipoPassoWizardNovaCotacao | undefined {
  return sequenciaPassosWizardNovaCotacao(modal, modalidade)[step - 1]
}
