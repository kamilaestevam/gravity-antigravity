/** Meta de XP por nível no dashboard Minha jornada (Guia Gravity). */
import { arredondarXpGuiaGravity } from './pesos-academy-guia-gravity.js'

export const XP_POR_NIVEL_GUIA_GRAVITY = 75

export function calcularNivelGuiaGravity(xpTotal: number) {
  const xpArredondado = arredondarXpGuiaGravity(xpTotal)
  const nivel = Math.max(1, Math.floor(xpArredondado / XP_POR_NIVEL_GUIA_GRAVITY) + 1)
  const xpMetaNivel = nivel * XP_POR_NIVEL_GUIA_GRAVITY
  const xpParaSubir = arredondarXpGuiaGravity(Math.max(0, xpMetaNivel - xpArredondado))
  const pctNivel = Math.min(100, Math.round((xpArredondado / xpMetaNivel) * 100))
  return { nivel, xpMetaNivel, xpParaSubir, pctNivel }
}
