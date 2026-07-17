/** Meta de XP por nível no dashboard Minha jornada (Guia Gravity). */
import { arredondarXpGuiaGravity } from './pesos-academy-guia-gravity'

export const XP_POR_NIVEL_GUIA_GRAVITY = 75

export const QTD_NOMES_NIVEL_GUIA_GRAVITY = 5

export const CHAVES_TITULO_NIVEL_GUIA_GRAVITY = [
  'university.dashboard.nivel_info.nome_iniciante',
  'university.dashboard.nivel_info.nome_aprendiz',
  'university.dashboard.nivel_info.nome_praticante',
  'university.dashboard.nivel_info.nome_explorador',
  'university.dashboard.nivel_info.nome_especialista',
] as const

export function xpMinimoNivelGuiaGravity(nivel: number): number {
  return Math.max(0, (nivel - 1) * XP_POR_NIVEL_GUIA_GRAVITY)
}

export function calcularNivelGuiaGravity(xpTotal: number) {
  const xpArredondado = arredondarXpGuiaGravity(xpTotal)
  const nivel = Math.max(1, Math.floor(xpArredondado / XP_POR_NIVEL_GUIA_GRAVITY) + 1)
  const xpMetaNivel = nivel * XP_POR_NIVEL_GUIA_GRAVITY
  const xpParaSubir = arredondarXpGuiaGravity(Math.max(0, xpMetaNivel - xpArredondado))
  const indiceTitulo = Math.min(nivel - 1, QTD_NOMES_NIVEL_GUIA_GRAVITY - 1)
  const chaveTitulo = CHAVES_TITULO_NIVEL_GUIA_GRAVITY[indiceTitulo]
  const pctNivel = Math.min(100, Math.round((xpArredondado / xpMetaNivel) * 100))
  return { nivel, xpMetaNivel, xpParaSubir, indiceTitulo, chaveTitulo, pctNivel }
}
