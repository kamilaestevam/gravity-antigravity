/**
 * @nucleo/modal-global — index
 * Ponto único de re-exportação para o pacote @nucleo/modal-global.
 */

export { ModalGlobal, ModalProvider } from './ModalGlobal.js'
export { useModal, useModalLocal, useModalStack } from './use-modal.js'
export {
  abrirModal,
  fecharModal,
  fecharUltimoModal,
  fecharTodosModais,
  isModalAberto,
  getEstadoModais,
  subscribeModais,
} from './modal-manager.js'
export type {
  ModalProps,
  AbaModal,
  BotaoModal,
  BotaoModalVariante,
  TamanhoModal,
  ItemModalStack,
  ModalManagerState,
} from './tipos.js'
