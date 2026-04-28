/**
 * @nucleo/modal-global — use-modal
 * Hook de abertura/fechamento de modais via modal-manager.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  abrirModal,
  fecharModal,
  fecharUltimoModal,
  fecharTodosModais,
  subscribeModais,
  isModalAberto,
} from './modal-manager.js'
import type { ItemModalStack, ModalManagerState } from './tipos.js'

// ─── useModal ─────────────────────────────────────────────────────────────────

/**
 * Hook para controlar modais via modal-manager.
 *
 * @example
 * const { abrir, fechar } = useModal()
 * abrir('confirmar-deletar', { titulo: 'Confirmar exclusão', children: ... })
 */
export function useModal() {
  return {
    abrir: abrirModal,
    fechar: fecharModal,
    fecharUltimo: fecharUltimoModal,
    fecharTodos: fecharTodosModais,
    isAberto: isModalAberto,
  }
}

// ─── useModalStack ────────────────────────────────────────────────────────────

/**
 * Hook que subscreve as mudanças do modal-manager e retorna o stack atual.
 * Usado pelo ModalProvider para renderizar todos os modais abertos.
 */
export function useModalStack(): ModalManagerState {
  const [state, setState] = useState<ModalManagerState>({ stack: [] })

  useEffect(() => {
    const unsub = subscribeModais((novoState) => setState(novoState))
    return unsub
  }, [])

  return state
}

// ─── useModalLocal ────────────────────────────────────────────────────────────

/**
 * Hook para controlar um modal local (sem o manager global).
 * Use quando o modal é totalmente controlado por um componente pai.
 *
 * @example
 * const { aberto, abrir, fechar } = useModalLocal()
 * <button onClick={abrir}>Abrir</button>
 * <ModalOverlay aberto={aberto} aoFechar={fechar} titulo="..." />
 */
export function useModalLocal(abertoPadrao = false) {
  const [aberto, setAberto] = useState(abertoPadrao)

  const abrir = useCallback(() => setAberto(true), [])
  const fechar = useCallback(() => setAberto(false), [])
  const alternar = useCallback(() => setAberto((p) => !p), [])

  return { aberto, abrir, fechar, alternar }
}
