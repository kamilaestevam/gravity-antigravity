import { describe, it, expect } from 'vitest'
import {
  arredondarAgregadoDecimal186,
  casasDecimaisSeguras,
  multiplicarDecimal186,
  numeroDecimal186,
  somarDecimal186,
} from '../../../servicos-global/produto/processos-core/src/services/decimalPedido'
import { AppError } from '../../../servicos-global/produto/processos-core/src/services/saldo-pedido'

describe('decimalPedido', () => {
  it('numeroDecimal186 aceita zero e null', () => {
    expect(numeroDecimal186(null)).toBe(0)
    expect(numeroDecimal186(0)).toBe(0)
  })

  it('numeroDecimal186 rejeita valores >= 10^12', () => {
    expect(() => numeroDecimal186(1e12, 'quantidade_inicial_item')).toThrow(AppError)
  })

  it('somarDecimal186 rejeita overflow acumulado', () => {
    expect(() =>
      somarDecimal186(999_999_999_999, 2, 'valor_total_item'),
    ).toThrow(/excede limite Decimal\(18,6\)/)
  })

  it('arredondarAgregadoDecimal186 respeita casas decimais', () => {
    expect(arredondarAgregadoDecimal186(10.4567, 2, 'valor_total_pedido')).toBe(10.46)
  })

  it('casasDecimaisSeguras usa padrao quando valor é NULL (nao confunde com 0 casas)', () => {
    expect(casasDecimaisSeguras(null, 2)).toBe(2)
    expect(casasDecimaisSeguras(undefined, 2)).toBe(2)
    expect(casasDecimaisSeguras(0, 2)).toBe(0)
  })

  it('multiplicarDecimal186 retorna null quando produto excede Decimal(18,6)', () => {
    expect(multiplicarDecimal186(200, 6_000_000_000, 'peso_liquido_unitario_item')).toBeNull()
    expect(multiplicarDecimal186(0.5, 100, 'peso_liquido_unitario_item')).toBe(50)
  })
})
