/** Meta de XP por nível no dashboard Minha jornada (Guia Gravity). */
export const XP_POR_NIVEL_GUIA_GRAVITY = 75

export function calcularNivelGuiaGravity(xpTotal: number) {
  const nivel = Math.max(1, Math.floor(xpTotal / XP_POR_NIVEL_GUIA_GRAVITY) + 1)
  const xpMetaNivel = nivel * XP_POR_NIVEL_GUIA_GRAVITY
  const xpParaSubir = Math.max(0, xpMetaNivel - xpTotal)
  const pctNivel = Math.min(100, Math.round((xpTotal / xpMetaNivel) * 100))
  return { nivel, xpMetaNivel, xpParaSubir, pctNivel }
}
