import { casasDecimaisSeguras } from './decimalPedido.js'

/**
 * Valor total do item = valor unitário × qtd. inicial, com arredondamento
 * conforme casas decimais configuradas no workspace (default 2).
 */
export function calcularValorTotalItemPedido(
  valorUnitario: number,
  quantidadeInicial: number,
  casasValor: unknown,
): number {
  const casas = casasDecimaisSeguras(casasValor, 2)
  const fator = Math.pow(10, casas)
  return Math.round(valorUnitario * quantidadeInicial * fator) / fator
}
