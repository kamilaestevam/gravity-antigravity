// @vitest-environment node
import { describe, it, expect } from 'vitest'

interface Pedido {
  id_pedido: string
  id_organizacao: string
}

function filtrarPedidosPorOrg(
  todosPedidos: Pedido[],
  orgAlvo: string,
  pedidoIds: string[],
): Pedido[] {
  return todosPedidos.filter(
    p => p.id_organizacao === orgAlvo && pedidoIds.includes(p.id_pedido)
  )
}

const PEDIDOS_BANCO: Pedido[] = [
  { id_pedido: 'ped_001', id_organizacao: 'org_A' },
  { id_pedido: 'ped_002', id_organizacao: 'org_A' },
  { id_pedido: 'ped_003', id_organizacao: 'org_A' },
  { id_pedido: 'ped_100', id_organizacao: 'org_B' },
  { id_pedido: 'ped_101', id_organizacao: 'org_B' },
  { id_pedido: 'ped_200', id_organizacao: 'org_C' },
]

describe('Edição em Massa — Isolamento de Organização', () => {
  it('F11: Org A solicita seus próprios pedidos → retorna apenas pedidos da Org A', () => {
    const resultado = filtrarPedidosPorOrg(
      PEDIDOS_BANCO,
      'org_A',
      ['ped_001', 'ped_002'],
    )

    expect(resultado).toHaveLength(2)
    expect(resultado.every(p => p.id_organizacao === 'org_A')).toBe(true)
    expect(resultado.map(p => p.id_pedido)).toEqual(['ped_001', 'ped_002'])
  })

  it('F12: Org A envia pedido_id da Org B → retorna vazio (pedido não encontrado)', () => {
    const resultado = filtrarPedidosPorOrg(
      PEDIDOS_BANCO,
      'org_A',
      ['ped_100', 'ped_101'],
    )

    expect(resultado).toHaveLength(0)
  })
})
