// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Testes Funcionais — Isolamento de Organização (Cross-Org)
 *
 * Cobre: F-ISO-01 a F-ISO-06
 * Estratégia: Verifica que TODA query do DuplicarService inclui id_organizacao no WHERE
 */

// ── Mock do auditLog ──────────────────────────────────────────────────────────

vi.mock('../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js', () => ({
  auditLog: vi.fn(),
}))

// ── Import real do service ────────────────────────────────────────────────────

import { DuplicarService, AppError } from '../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  // Este mock simula um banco que só tem dados da org especificada
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
        // Simula isolamento: só retorna se a org do filtro bate com a org do registro
        if (args.where.id_organizacao === orgDoRegistro) {
          return Promise.resolve([criarPedidoOrg(orgDoRegistro)])
        }
        return Promise.resolve([]) // Não encontra nada de outra org
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

// ── Testes de Isolamento ──────────────────────────────────────────────────────

describe('Isolamento de Organização — Cross-Org', () => {
  it('F-ISO-01: Preview inclui id_organizacao no WHERE', async () => {
    const db = criarDbMockComOrg(ORG_A)
    await service.preview(db as unknown as Record<string, unknown>, ORG_A, [`ped-${ORG_A}`])

    expect(db.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: ORG_A }),
      }),
    )
  })

  it('F-ISO-02: Confirmar inclui id_organizacao no WHERE', async () => {
    const db = criarDbMockComOrg(ORG_A)
    await service.confirmar(
      db as unknown as Record<string, unknown>,
      ORG_A, undefined, 'usr', 'User',
      { ids: [`ped-${ORG_A}`] },
    )

    expect(db.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: ORG_A }),
      }),
    )
  })

  it('F-ISO-03: DuplicarItens inclui id_organizacao no WHERE', async () => {
    const db = criarDbMockComOrg(ORG_A)
    await service.duplicarItens(
      db as unknown as Record<string, unknown>,
      ORG_A, undefined,
      { pedido_id: `ped-${ORG_A}`, item_ids: [`it-${ORG_A}`] },
    )

    // Verifica pedido.findFirst
    expect(db.pedido.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: ORG_A }),
      }),
    )
    // Verifica pedidoItem.findMany
    for (const call of db.pedidoItem.findMany.mock.calls) {
      expect(call[0].where).toHaveProperty('id_organizacao', ORG_A)
    }
  })

  it('F-ISO-04: Preview de pedido da org A com token da org B retorna 404', async () => {
    const db = criarDbMockComOrg(ORG_A) // banco só tem dados de ORG_A

    // Token da org B tenta acessar pedido da org A
    await expect(
      service.preview(db as unknown as Record<string, unknown>, ORG_B, [`ped-${ORG_A}`]),
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' })
  })

  it('F-ISO-05: Confirmar pedido da org A com token da org B retorna 404', async () => {
    const db = criarDbMockComOrg(ORG_A)

    await expect(
      service.confirmar(
        db as unknown as Record<string, unknown>,
        ORG_B, undefined, 'usr', 'User',
        { ids: [`ped-${ORG_A}`] },
      ),
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('F-ISO-06: DuplicarItens da org A com token da org B retorna 404', async () => {
    const db = criarDbMockComOrg(ORG_A)

    await expect(
      service.duplicarItens(
        db as unknown as Record<string, unknown>,
        ORG_B, undefined,
        { pedido_id: `ped-${ORG_A}`, item_ids: [`it-${ORG_A}`] },
      ),
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' })
  })
})
