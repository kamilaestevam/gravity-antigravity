/**
 * efeito-destaque-tutorial-simulador-smart-doc.ts — destaca alvo na UI ao hover no guia
 */

import { useEffect, type RefObject } from 'react'

const CLASSE_DESTAQUE_ATIVO = 'sds-tutorial-destaque-ativo'
const CLASSE_ALVO_DESTACADO = 'sds-tutorial-alvo--destacado'

export function useEfeitoDestaqueTutorialSimulador(
  idAlvoDestacado: string | null,
  refRaiz: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const raiz = refRaiz.current
    if (!raiz) return

    raiz.querySelectorAll(`.${CLASSE_ALVO_DESTACADO}`).forEach((el) => {
      el.classList.remove(CLASSE_ALVO_DESTACADO)
    })

    if (!idAlvoDestacado) {
      raiz.classList.remove(CLASSE_DESTAQUE_ATIVO)
      return
    }

    raiz.classList.add(CLASSE_DESTAQUE_ATIVO)
    raiz.querySelectorAll(`[data-sds-tutorial-alvo="${idAlvoDestacado}"]`).forEach((el) => {
      el.classList.add(CLASSE_ALVO_DESTACADO)
    })

    return () => {
      raiz.classList.remove(CLASSE_DESTAQUE_ATIVO)
    }
  }, [idAlvoDestacado, refRaiz])
}
