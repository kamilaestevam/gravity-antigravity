/**
 * @nucleo/campo-ncm-global — index
 * Campo de seleção de NCM com validação não bloqueante e modal de busca.
 * Requer o serviço ncm-sync rodando em /api/v1/ncm.
 */

export { NcmSelectGlobal } from './NcmSelectGlobal.js'
export type { NcmSelectGlobalProps } from './NcmSelectGlobal.js'

export { ModalBuscaNcm } from './ModalNcmBusca.js'
export type { ModalBuscaNcmProps, NcmOpcao } from './ModalNcmBusca.js'

export { useNcmValidation } from './useNcmValidation.js'
export type {
  UseNcmValidationOptions,
  UseNcmValidationReturn,
  NcmValidacaoStatus,
  NcmValidacaoResultado,
} from './useNcmValidation.js'
