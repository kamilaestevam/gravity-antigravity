/**
 * @nucleo/utils — index
 * Ponto único de re-exportação para o pacote @nucleo/utils.
 *
 * Tipos duplicados em formatadores/mascaras/validadores e tipos.ts foram
 * resolvidos: tipos.ts re-exporta apenas os exclusivos (OpcaoSimples,
 * IntervaloData, ResultadoPaginado). Os tipos compartilhados ficam no
 * arquivo da implementação correspondente.
 */

export * from './formatadores.js'
export * from './mascaras.js'
export * from './validadores.js'
export type { OpcaoSimples, IntervaloData, ResultadoPaginado } from './tipos.js'
