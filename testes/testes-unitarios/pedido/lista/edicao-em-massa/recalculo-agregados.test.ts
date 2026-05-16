// @vitest-environment node
import { describe, it, expect } from 'vitest'

/**
 * Campos de quantidade do item que, ao serem editados, disparam
 * recálculo dos agregados do pedido pai.
 * Reprodução do set interno do serviço.
 */
const CAMPOS_QUANTIDADE_ITEM = new Set([
  'quantidade_inicial_item',
  'quantidade_transferida_item',
  'quantidade_pronta_item',
  'quantidade_cancelada_item',
  'quantidade_atual_item',
])

function disparaRecalculoAgregados(campo: string): boolean {
  return CAMPOS_QUANTIDADE_ITEM.has(campo)
}

describe('Edição em Massa — Recálculo de Agregados', () => {
  it('U27: quantidade_inicial_item dispara recálculo', () => {
    expect(disparaRecalculoAgregados('quantidade_inicial_item')).toBe(true)
  })

  it('U28: peso_liquido_unitario NÃO dispara recálculo (atualização direta)', () => {
    expect(disparaRecalculoAgregados('peso_liquido_unitario')).toBe(false)
  })

  it('U29: incoterm NÃO dispara recálculo', () => {
    expect(disparaRecalculoAgregados('incoterm')).toBe(false)
  })
})
