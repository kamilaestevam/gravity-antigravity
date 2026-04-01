/**
 * rateioEngine.ts — Motor de rateio para Financeiro Comex
 *
 * Reusa os algoritmos do NF Importacao (sem fork).
 * Distribui custos financeiros entre itens do processo.
 */

export type {
  MetodoRateio,
  ItemRateio,
  ResultadoRateioItem,
  ResultadoRateio,
} from '../../../../nf-importacao/server/src/lib/rateioAlgorithms.js'

export { calcularRateio } from '../../../../nf-importacao/server/src/lib/rateioAlgorithms.js'
