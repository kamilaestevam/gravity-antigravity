// @vitest-environment node
import { describe, it, expect } from 'vitest'

/**
 * Reproduz a validação superRefine do Zod que impede substituição
 * de campos com constraint unique quando múltiplos registros são selecionados.
 */
const CAMPOS_UNIQUE_PEDIDO = new Set<string>(['numero_pedido'])

function validarUniqueEmMassa(
  pedidoIds: string[],
  campo: string,
  operacao: string,
): string | null {
  if (
    pedidoIds.length > 1 &&
    CAMPOS_UNIQUE_PEDIDO.has(campo) &&
    operacao === 'substituir'
  ) {
    return `O campo "Número do Pedido" não pode receber o mesmo valor em ${pedidoIds.length} pedidos porque cada pedido precisa ter um valor diferente.`
  }
  return null
}

describe('Edição em Massa — Unique Constraint', () => {
  it('U30: 1 pedido + substituir numero_pedido → permitido', () => {
    const erro = validarUniqueEmMassa(['ped_001'], 'numero_pedido', 'substituir')
    expect(erro).toBeNull()
  })

  it('U31: 2+ pedidos + substituir numero_pedido → erro', () => {
    const erro = validarUniqueEmMassa(
      ['ped_001', 'ped_002', 'ped_003'],
      'numero_pedido',
      'substituir',
    )
    expect(erro).toBe(
      'O campo "Número do Pedido" não pode receber o mesmo valor em 3 pedidos porque cada pedido precisa ter um valor diferente.',
    )
  })

  it('U32: 2+ pedidos + somar numero_pedido → permitido (não é substituir)', () => {
    const erro = validarUniqueEmMassa(
      ['ped_001', 'ped_002'],
      'numero_pedido',
      'somar',
    )
    expect(erro).toBeNull()
  })
})
