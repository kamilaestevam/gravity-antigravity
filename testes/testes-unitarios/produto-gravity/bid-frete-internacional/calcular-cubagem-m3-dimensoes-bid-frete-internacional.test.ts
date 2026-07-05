import { describe, expect, it } from 'vitest'
import {
  calcularCubagemM3AutoDimensoesBidFreteInternacional,
  calcularCubagemM3DimensoesBidFreteInternacional,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/calcular-cubagem-m3-dimensoes-bid-frete-internacional'

describe('calcular-cubagem-m3-dimensoes-bid-frete-internacional', () => {
  it('converte CM para m³ (120 × 80 × 90 cm = 0.864 m³)', () => {
    const m3 = calcularCubagemM3DimensoesBidFreteInternacional(120, 80, 90, 'CM')
    expect(m3).toBeCloseTo(0.864, 4)
  })

  it('converte M para m³', () => {
    const m3 = calcularCubagemM3DimensoesBidFreteInternacional(2, 2, 2, 'M')
    expect(m3).toBe(8)
  })

  it('converte IN para m³', () => {
    const m3 = calcularCubagemM3DimensoesBidFreteInternacional(10, 10, 10, 'IN')
    expect(m3).toBeCloseTo(0.0254 ** 3 * 1000, 4)
  })

  it('retorna null sem unidade ou dimensão inválida', () => {
    expect(calcularCubagemM3DimensoesBidFreteInternacional(0, 1, 1, 'M')).toBeNull()
    expect(calcularCubagemM3DimensoesBidFreteInternacional(1, 1, 1, 'XX')).toBeNull()
  })

  it('calcularCubagemM3AutoDimensoes formata string para o form', () => {
    const texto = calcularCubagemM3AutoDimensoesBidFreteInternacional({
      comprimento: '120',
      largura: '80',
      altura: '90',
      codigo_unidade: 'cm',
    })
    expect(texto).toBe('0.864')
  })
})
