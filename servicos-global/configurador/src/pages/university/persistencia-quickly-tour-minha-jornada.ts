/** Persistência local — Quickly Tour da tela Minha jornada (Gravity University). */

const CHAVE_SUPRIMIDO = 'university_quickly_tour_minha_jornada_suprimido_v1'

export function quicklyTourMinhaJornadaSuprimido(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(CHAVE_SUPRIMIDO) === '1'
  } catch {
    return false
  }
}

export function suprimirQuicklyTourMinhaJornada(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CHAVE_SUPRIMIDO, '1')
  } catch {
    /* ignora quota / modo privado */
  }
}

export function reverterSuprimirQuicklyTourMinhaJornada(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CHAVE_SUPRIMIDO)
  } catch {
    /* ignora quota / modo privado */
  }
}
