/**
 * currencyConverter.ts — Conversao de moeda para Financeiro Comex
 *
 * Regra de negocio (RN-004): taxa e valor sao imutaveis apos salvar.
 * valor_brl = valor * taxa_cambio (calculado no momento do lancamento)
 */

/**
 * Converte valor em moeda estrangeira para BRL
 * @param valor Valor na moeda original (4 casas decimais)
 * @param taxaCambio Taxa de cambio com 7 casas decimais
 * @returns Valor em BRL (4 casas decimais)
 */
export function calcularValorBRL(valor: number, taxaCambio: number): number {
  if (valor < 0) throw new Error('Valor nao pode ser negativo')
  if (taxaCambio <= 0) throw new Error('Taxa de cambio deve ser maior que zero')
  return roundTo4(valor * taxaCambio)
}

/**
 * Formata taxa de cambio com 7 casas decimais
 */
export function formatarTaxa(taxa: number): string {
  return taxa.toFixed(7)
}

/**
 * Arredonda para 4 casas decimais (ROUND_HALF_UP)
 */
export function roundTo4(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000
}

/**
 * Converte taxa de cambio recebida como string para numero
 * Aceita virgula como separador decimal (formato brasileiro)
 */
export function parseTaxa(input: string | number): number {
  if (typeof input === 'number') {
    if (isNaN(input) || input <= 0) throw new Error(`Taxa invalida: ${input}`)
    return input
  }
  const normalized = input.replace(',', '.')
  const parsed = parseFloat(normalized)
  if (isNaN(parsed) || parsed <= 0) throw new Error(`Taxa invalida: ${input}`)
  return parsed
}

/**
 * Taxa padrao para BRL (1.0000000)
 */
export const TAXA_BRL = 1.0
