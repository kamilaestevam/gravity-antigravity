/**
 * @nucleo/campo-ncm-global — index
 * Campo de seleção de NCM com validação não bloqueante e modal de busca.
 * Requer o serviço ncm-sync rodando em /api/v1/ncm.
 */

export { SelectNcmGlobal } from './SelectNcmGlobal.js'
export type { NcmSelectGlobalProps } from './SelectNcmGlobal.js'

export { CampoBuscarNcm } from './CampoBuscarNcm.js'
export type { ModalBuscaNcmProps, NcmOpcao } from './CampoBuscarNcm.js'

export { useNcmValidation } from './useNcmValidation.js'
export type {
  UseNcmValidationOptions,
  UseNcmValidationReturn,
  NcmValidacaoStatus,
  NcmValidacaoResultado,
} from './useNcmValidation.js'
