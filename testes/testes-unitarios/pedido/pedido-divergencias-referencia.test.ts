import { describe, expect, it } from 'vitest'
import { calcularDivergenciasPedido } from '../../../servicos-global/produto/pedido/shared/pedidoDivergencias'

describe('calcularDivergenciasPedido — referencia_importador / referencia_exportador', () => {
  it('marca divergente quando pedido difere do único valor preenchido nos itens', () => {
    const divergencias = calcularDivergenciasPedido(
      [{ referencia_importador: 'cde' }],
      { referencia_importador: 'abc' },
    )
    expect(divergencias.referencia_importador_divergente).toBe(true)
  })

  it('não marca divergente quando pedido e itens concordam', () => {
    const divergencias = calcularDivergenciasPedido(
      [
        { referencia_importador: 'abc' },
        { referencia_importador: 'abc' },
      ],
      { referencia_importador: 'abc' },
    )
    expect(divergencias.referencia_importador_divergente).toBe(false)
  })

  it('marca divergente quando itens têm valores distintos entre si', () => {
    const divergencias = calcularDivergenciasPedido(
      [
        { referencia_exportador: 'REF-A' },
        { referencia_exportador: 'REF-B' },
      ],
      { referencia_exportador: 'REF-A' },
    )
    expect(divergencias.referencia_exportador_divergente).toBe(true)
  })

  it('não marca divergente quando pedido e itens estão vazios', () => {
    const divergencias = calcularDivergenciasPedido(
      [{ referencia_importador: null }, { referencia_importador: '' }],
      { referencia_importador: null },
    )
    expect(divergencias.referencia_importador_divergente).toBe(false)
  })
})
