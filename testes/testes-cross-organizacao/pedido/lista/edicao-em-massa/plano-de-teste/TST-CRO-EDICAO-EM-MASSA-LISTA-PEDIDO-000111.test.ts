// TST-CRO-EDICAO-EM-MASSA-LISTA-PEDIDO-000111
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js', () => ({
  auditLog: vi.fn(),
}))

import { EdicaoEmMassaService } from '../../../../../../servicos-global/produto/pedido/server/src/services/edicaoEmMassaService.js'

const ORG_A = 'org-A'
const ORG_B = 'org-B'

function criarPedido(orgId: string, id: string) {
  return {
    id_pedido: id,
    id_organizacao: orgId,
    id_workspace: `ws-${orgId}`,
    itens_pedido: [{
      id_item: `item-${id}`,
      id_pedido: id,
      id_organizacao: orgId,
      sequencia_item_pedido: 1,
    }],
  }
}

function criarDb(orgRegistro: string) {
  return {
    pedido: {
      findMany: vi.fn().mockImplementation((args: { where: { id_organizacao: string } }) => {
        if (args.where.id_organizacao === orgRegistro) {
          return Promise.resolve([criarPedido(orgRegistro, `ped-${orgRegistro}`)])
        }
        return Promise.resolve([])
      }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    pedidoItem: {
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  }
}

describe('TST-CRO-EDICAO-EM-MASSA-LISTA-PEDIDO-000111', () => {
  beforeEach(() => vi.clearAllMocks())

  it('CRO-01/CRO-02: org B não encontra pedidos da org A', async () => {
    const svc = new EdicaoEmMassaService()
    const db = criarDb(ORG_A)
    await expect(
      svc.confirmar(ORG_B, 'user-b', 'User B', db as never, {
        pedido_ids: [`ped-${ORG_A}`],
        campos: [{
          campo: 'status_pedido',
          tipo: 'select',
          nivel: 'pedido',
          operacao: 'substituir',
          valor: 'rascunho',
        }],
        nivel: 'pedido',
      }),
    ).rejects.toMatchObject({ statusCode: 404 })
    expect(db.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id_organizacao: ORG_B }) }),
    )
  })

  it('CRO-03: org A altera próprio pedido (fast path substituir)', async () => {
    const svc = new EdicaoEmMassaService()
    const db = criarDb(ORG_A)
    db.pedido.updateMany = vi.fn().mockResolvedValue({ count: 1 })
    const r = await svc.confirmar(ORG_A, 'user-a', 'User A', db as never, {
      pedido_ids: [`ped-${ORG_A}`],
      campos: [{
        campo: 'status_pedido',
        tipo: 'select',
        nivel: 'pedido',
        operacao: 'substituir',
        valor: 'rascunho',
      }],
      nivel: 'pedido',
    })
    expect(r.pedidos_atualizados).toBe(1)
  })
})
