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

    function limparDestaques() {
      document.querySelectorAll(`.${CLASSE_ALVO_DESTACADO}`).forEach((el) => {
        el.classList.remove(CLASSE_ALVO_DESTACADO)
      })
      raiz?.classList.remove(CLASSE_DESTAQUE_ATIVO)
      document.body.classList.remove(CLASSE_DESTAQUE_ATIVO)
    }

    limparDestaques()

    if (!idAlvoDestacado) {
      return
    }

    raiz?.classList.add(CLASSE_DESTAQUE_ATIVO)
    document.body.classList.add(CLASSE_DESTAQUE_ATIVO)

    const seletor = `[data-sds-tutorial-alvo="${idAlvoDestacado}"]`
    document.querySelectorAll(seletor).forEach((el) => {
      el.classList.add(CLASSE_ALVO_DESTACADO)
    })

    return () => {
      limparDestaques()
    }
  }, [idAlvoDestacado, refRaiz])
}
