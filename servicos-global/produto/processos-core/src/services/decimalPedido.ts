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
