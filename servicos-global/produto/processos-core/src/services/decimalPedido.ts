/**
 * decimalPedido.ts — Limites e helpers para campos Decimal(18,6) do Pedido.
 *
 * Postgres: precision 18, scale 6 → parte inteira máxima < 10^12.
 */
import { AppError } from './saldo-pedido.js'

/** Limite absoluto exclusivo documentado pelo Postgres para Decimal(18,6). */
export const LIMITE_ABSOLUTO_DECIMAL_18_6 = 999_999_999_999.999999

export function casasDecimaisSeguras(valor: unknown, padrao: number): number {
  if (valor == null) return padrao
  const n = Number(valor)
  if (!Number.isFinite(n)) return padrao
  return Math.max(0, Math.min(6, Math.trunc(n)))
}

export function numeroDecimal186(valor: unknown, campo = 'valor'): number {
  if (valor == null) return 0
  const num =
    typeof valor === 'object'
      ? Number((valor as { toString(): string }).toString())
      : Number(valor)
  if (!Number.isFinite(num)) {
    throw new AppError(422, `${campo} numerico invalido para Decimal(18,6)`)
  }
  if (Math.abs(num) >= 1e12) {
    throw new AppError(
      422,
      `${campo} excede limite Decimal(18,6) (< 10^12): ${num}`,
    )
  }
  return num
}

export function arredondarAgregadoDecimal186(valor: number, casas: number, campo: string): number {
  const casasSeguras = casasDecimaisSeguras(casas, 2)
  const arredondado = parseFloat(valor.toFixed(casasSeguras))
  if (!Number.isFinite(arredondado) || Math.abs(arredondado) >= 1e12) {
    throw new AppError(
      422,
      `Agregado ${campo} excede limite Decimal(18,6) do pedido: ${arredondado}`,
    )
  }
  return arredondado
}

export function somarDecimal186(acumulado: number, parcela: number, campo: string): number {
  const proximo = acumulado + parcela
  if (!Number.isFinite(proximo) || Math.abs(proximo) >= 1e12) {
    throw new AppError(
      422,
      `Soma de ${campo} excede limite Decimal(18,6) do pedido`,
    )
  }
  return proximo
}

/**
 * Soma tolerante para AGREGADOS do pedido: quando o acumulado, a parcela ou
 * o resultado não cabem em Decimal(18,6), retorna `null` (agregado
 * indeterminável) em vez de lançar erro.
 *
 * Razão: o recálculo dos 5 agregados roda em TODO save de item/pedido e em
 * transferências. Um estouro na soma de peso não pode abortar a edição de
 * valor (campos sem relação de negócio) nem bloquear transferências — o
 * agregado vira `null`, mesmo padrão de moedas/unidades divergentes.
 */
export function somarAgregadoDecimal186(
  acumulado: number | null,
  parcela: number | null,
): number | null {
  if (acumulado === null || parcela === null) return null
  const proximo = acumulado + parcela
  if (!Number.isFinite(proximo) || Math.abs(proximo) >= 1e12) return null
  return proximo
}

/**
 * unitário × quantidade para agregados físicos (peso/cubagem).
 * Retorna `null` quando o produto não cabe em Decimal(18,6) — caller
 * deve marcar o agregado como indeterminável (`null`) em vez de abortar
 * saves de campos financeiros no mesmo pedido.
 */
export function multiplicarDecimal186(
  unitario: unknown,
  quantidade: number,
  campoUnitario: string,
): number | null {
  let factorUnitario: number
  try {
    factorUnitario = numeroDecimal186(unitario, campoUnitario)
  } catch {
    return null
  }
  if (!Number.isFinite(quantidade) || Math.abs(quantidade) >= 1e12) {
    return null
  }
  const produto = factorUnitario * quantidade
  if (!Number.isFinite(produto) || Math.abs(produto) >= 1e12) {
    return null
  }
  return produto
}
