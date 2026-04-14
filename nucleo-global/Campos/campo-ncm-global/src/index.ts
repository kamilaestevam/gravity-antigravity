/**
 * @nucleo/campo-ncm-global — index
 * Campo de seleção de NCM com validação não bloqueante e modal de busca.
 * Requer o serviço ncm-sync rodando em /api/v1/ncm.
 */

export { NcmSelectGlobal } from './NcmSelectGlobal.js'
export type { NcmSelectGlobalProps } from './NcmSelectGlobal.js'

export { ModalBuscaNcm } from './ModalBuscaNcm.js'
export type { ModalBuscaNcmProps, NcmOpcao } from './ModalBuscaNcm.js'

export { useNcmValidation } from './useNcmValidation.js'
export type {
  UseNcmValidationOptions,
  UseNcmValidationReturn,
  NcmValidacaoStatus,
  NcmValidacaoResultado,
} from './useNcmValidation.js'
