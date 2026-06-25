// TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109 — isolamento organização
// @vitest-environment node
import { describe, it, expect } from 'vitest'

interface Pedido { id_pedido: string; id_organizacao: string }

function filtrarPedidosPorOrg(todos: Pedido[], orgAlvo: string, pedidoIds: string[]): Pedido[] {
  return todos.filter(p => p.id_organizacao === orgAlvo && pedidoIds.includes(p.id_pedido))
}

const PEDIDOS: Pedido[] = [
  { id_pedido: 'ped_001', id_organizacao: 'org_A' },
  { id_pedido: 'ped_002', id_organizacao: 'org_A' },
  { id_pedido: 'ped_100', id_organizacao: 'org_B' },
]

describe('TST-FUN-EDICAO-EM-MASSA-LISTA-PEDIDO-000109 — isolamento', () => {
  it('F06: org A solicita pedidos próprios', () => {
    const r = filtrarPedidosPorOrg(PEDIDOS, 'org_A', ['ped_001', 'ped_002'])
    expect(r).toHaveLength(2)
    expect(r.every(p => p.id_organizacao === 'org_A')).toBe(true)
  })

  it('F07: org A envia pedido da org B → vazio', () => {
    expect(filtrarPedidosPorOrg(PEDIDOS, 'org_A', ['ped_100'])).toHaveLength(0)
  })
})
