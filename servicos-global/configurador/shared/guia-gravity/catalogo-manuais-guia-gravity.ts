/** SSOT — manuais /docs contabilizados no card «Manuais lidos» (8). */

export const SLUGS_MANUAL_GUIA_GRAVITY = [
  'login',
  'navegacao',
  'admin',
  'configurador',
  'gabi',
  'hub',
  'store',
  'pedido',
] as const

export type SlugManualGuiaGravity = (typeof SLUGS_MANUAL_GUIA_GRAVITY)[number]

export const TOTAL_MANUAIS_GUIA_GRAVITY = SLUGS_MANUAL_GUIA_GRAVITY.length

export function slugManualGuiaGravityValido(slug: string): slug is SlugManualGuiaGravity {
  return (SLUGS_MANUAL_GUIA_GRAVITY as readonly string[]).includes(slug)
}
