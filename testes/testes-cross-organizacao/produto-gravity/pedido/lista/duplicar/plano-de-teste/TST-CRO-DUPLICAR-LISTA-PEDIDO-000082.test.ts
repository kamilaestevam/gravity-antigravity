// @vitest-environment node
/**
 * TST-CRO-DUPLICAR-LISTA-PEDIDO-000082 — Cross-organização Duplicar (service)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js', () => ({
  auditLog: vi.fn(),
}))

import { DuplicarService } from '../../../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js'

const ORG_A = 'org-A'
const ORG_B = 'org-B'

function criarPedidoOrg(orgId: string) {
  return {
    id_pedido: `ped-${orgId}`,
    id_organizacao: orgId,
    id_workspace: `ws-${orgId}`,
    numero_pedido: `PED-${orgId}`,
    status_pedido: 'rascunho',
    itens_pedido: [{
      id_item: `it-${orgId}`,
      id_pedido: `ped-${orgId}`,
      id_organizacao: orgId,
      id_workspace: `ws-${orgId}`,
      sequencia_item_pedido: 1,
      quantidade_inicial_item: 100,
      quantidade_atual_item: 100,
      quantidade_pronta_item: 0,
      quantidade_transferida_item: 0,
      quantidade_cancelada_item: 0,
    }],
  }
}

function criarDbMockComOrg(orgDoRegistro: string) {
  return {
    configuracaoPedido: {
      findFirst: vi.fn().mockResolvedValue({
        duplicar_numero_auto: true,
        duplicar_copiar_datas: false,
        duplicar_status_inicial: 'copiar',
      }),
    },
    pedido: {
      findMany: vi.fn().mockImplementation((args: { where: { id_organizacao: string } }) => {
        if (args.where.id_organizacao === orgDoRegistro) {
          return Promise.resolve([criarPedidoOrg(orgDoRegistro)])
        }
        return Promise.resolve([])
      }),
      findFirst: vi.fn().mockImplementation((args: { where: { id_organizacao: string } }) => {
        if (args.where.id_organizacao === orgDoRegistro) {
          return Promise.resolve(criarPedidoOrg(orgDoRegistro))
        }
        return Promise.resolve(null)
      }),
      count: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockImplementation((args: { data: Record<string, unknown> }) => ({
        ...args.data,
        id_pedido: args.data.id_pedido ?? 'ped-novo',
      })),
      update: vi.fn().mockResolvedValue({}),
    },
    pedidoItem: {
      findMany: vi.fn().mockImplementation((args: { where: { id_organizacao: string } }) => {
        if (args.where.id_organizacao === orgDoRegistro) {
          return Promise.resolve([{
            id_item: `it-${orgDoRegistro}`,
            id_pedido: `ped-${orgDoRegistro}`,
            id_organizacao: orgDoRegistro,
            sequencia_item_pedido: 1,
            quantidade_inicial_item: 100,
            quantidade_atual_item: 100,
            quantidade_pronta_item: 0,
            quantidade_transferida_item: 0,
            quantidade_cancelada_item: 0,
          }])
        }
        return Promise.resolve([])
      }),
      create: vi.fn().mockImplementation((args: { data: Record<string, unknown> }) => ({
        ...args.data,
        id_item: args.data.id_item ?? 'it-novo',
      })),
      update: vi.fn().mockResolvedValue({}),
    },
    statusPedido: {
      findFirst: vi.fn().mockResolvedValue({ id_pedido_status: 'st-001' }),
    },
  }
}

let service: DuplicarService

beforeEach(() => {
  service = new DuplicarService()
  vi.clearAllMocks()
})

describe('TST-CRO-DUPLICAR-LISTA-PEDIDO-000082 — Service', () => {
  it('CRO-DUP-01: preview filtra por id_organizacao do token', async () => {
    const db = criarDbMockComOrg(ORG_A)
    await service.preview(db as unknown as Record<string, unknown>, ORG_A, [`ped-${ORG_A}`])
    expect(db.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id_organizacao: ORG_A }) }),
    )
  })

  it('CRO-DUP-02: confirmar filtra por id_organizacao do token', async () => {
    const db = criarDbMockComOrg(ORG_A)
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_A, undefined, 'usr', 'User',
      { ids: [`ped-${ORG_A}`] },
    )
    expect(db.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id_organizacao: ORG_A }) }),
    )
  })

  it('CRO-DUP-03: duplicarItens filtra por id_organizacao do token', async () => {
    const db = criarDbMockComOrg(ORG_A)
    await service.duplicarItens(
      db as unknown as Record<string, unknown>, ORG_A, undefined,
      { pedido_id: `ped-${ORG_A}`, item_ids: [`it-${ORG_A}`] },
    )
    expect(db.pedido.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id_organizacao: ORG_A }) }),
    )
  })

  it('CRO-DUP-04: preview org B com pedido org A → 404', async () => {
    const db = criarDbMockComOrg(ORG_A)
    await expect(
      service.preview(db as unknown as Record<string, unknown>, ORG_B, [`ped-${ORG_A}`]),
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' })
  })

  it('CRO-DUP-05: confirmar org B com pedido org A → 404', async () => {
    const db = criarDbMockComOrg(ORG_A)
    await expect(
      service.confirmar(
        db as unknown as Record<string, unknown>, ORG_B, undefined, 'usr', 'User',
        { ids: [`ped-${ORG_A}`] },
      ),
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('CRO-DUP-06: duplicarItens org B com pedido org A → 404', async () => {
    const db = criarDbMockComOrg(ORG_A)
    await expect(
      service.duplicarItens(
        db as unknown as Record<string, unknown>, ORG_B, undefined,
        { pedido_id: `ped-${ORG_A}`, item_ids: [`it-${ORG_A}`] },
      ),
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' })
  })
})
