/**
 * @nucleo/modal-sem-sessoes-global — index
 * Ponto único de re-exportação para o pacote @nucleo/modal-sem-sessoes-global.
 */

export { ModalSemSessoes, ModalSemSessoes as ModalSemSessoesGlobal, ModalSemSessoesProvider } from './ModalSemSessoes.js'
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
  ModalSemSessoesProps,
  BotaoModal,
  BotaoModalVariante,
  TamanhoModal,
  ItemModalStack,
  ModalManagerState,
} from './tipos.js'
