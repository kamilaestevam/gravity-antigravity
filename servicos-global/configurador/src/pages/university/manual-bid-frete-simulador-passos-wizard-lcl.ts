type ModalWizard = 'MARITIMO' | 'AEREO' | 'RODOVIARIO' | ''
type ModalidadeWizard = 'FCL' | 'LCL' | 'FTL' | 'LTL' | ''

export function ehMaritimoLclCotacaoBidFreteInternacional(
  modal?: ModalWizard | null,
  modalidade?: ModalidadeWizard | null,
): boolean {
  return modal === 'MARITIMO' && modalidade === 'LCL'
}

export type TipoPassoWizardNovaCotacao =
  | 'modal'
  | 'origem'
  | 'carga'
  | 'armazenagem'
  | 'fornecedores'
  | 'resumo'

export function sequenciaPassosWizardNovaCotacao(
  modal: ModalWizard,
  modalidade: ModalidadeWizard,
): TipoPassoWizardNovaCotacao[] {
  const seq: TipoPassoWizardNovaCotacao[] = ['modal', 'origem', 'carga']
  if (ehMaritimoLclCotacaoBidFreteInternacional(modal, modalidade)) {
    seq.push('armazenagem')
  }
  seq.push('fornecedores', 'resumo')
  return seq
}

export function tipoPassoWizardNovaCotacao(
  step: number,
  modal: ModalWizard,
  modalidade: ModalidadeWizard,
): TipoPassoWizardNovaCotacao | undefined {
  return sequenciaPassosWizardNovaCotacao(modal, modalidade)[step - 1]
}
