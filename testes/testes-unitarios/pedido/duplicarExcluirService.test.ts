/**
 * duplicarExcluirService.test.ts — Testes unitários do serviço de duplicar e excluir pedidos
 *
 * Cobertura:
 *   - duplicar: copia todos os campos do pedido
 *   - duplicar: copia todos os itens com saldo zerado
 *   - duplicar: config numero_auto gera número correto
 *   - duplicar: config copiar_datas = false reseta datas
 *   - duplicar: config status_inicial = 'draft' ignora status original
 *   - excluir: hard delete remove pedido e itens
 *   - excluir: status não permitido é bloqueado
 *   - excluir item: pedido sem item é excluído (config false)
 *   - excluir item: pedido sem item permanece (config true)
 *   - cross-tenant: não duplica/exclui pedido de outro tenant
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DuplicarService, ExcluirService, AppError } from '../../../produto/pedido/server/src/services/duplicarExcluirService'

// ── Helpers ───────────────────────────────────────────────────────────────────

function criarPedidoMock(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    tenant_id: 'tenant-abc',
    company_id: 'company-1',
    numero_pedido: `PO-${id}`,
    status: 'draft',
    tipo_operacao: 'importacao',
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    cobertura_cambial_pedido: 'sem_cobertura',
    data_emissao_pedido: '2026-01-01T00:00:00.000Z',
    data_prevista_pedido_pronto: '2026-03-01T00:00:00.000Z',
    valor_total_pedido: 5000,
    importacao_exportador_id: null,
    exportacao_importador_id: null,
    pedidos_origem_id: [],
    itens: [],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function criarItemMock(id: string, pedidoId: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    tenant_id: 'tenant-abc',
    company_id: 'company-1',
    pedido_id: pedidoId,
    part_number: `PN-${id}`,
    ncm: '8471.30.12',
    descricao_item: 'Produto de teste',
    quantidade_inicial_item_pedido: 100,
    saldo_item_pedido: 100,
    quantidade_pronta_total: 0,
    quantidade_transferida_item: 0,
    quantidade_cancelada_item_pedido: 0,
    moeda_item: 'USD',
    valor_unitario_item: 50,
    valor_total_itens: 5000,
    casas_decimais_quantidade_item: 2,
    casas_decimais_valor_item: 2,
    unidade_comercializada_item: 'UN',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function criarDbMock(pedidos: ReturnType<typeof criarPedidoMock>[], configOverrides: Record<string, unknown> = {}) {
  const config = {
    tenant_id: 'tenant-abc',
    duplicar_numero_auto: false,
    duplicar_copiar_datas: false,
    duplicar_status_inicial: 'copiar',
    excluir_status_permitidos: ['draft'],
    excluir_pedido_sem_item_permitido: false,
    ...configOverrides,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txMock: Record<string, any> = {
    pedido: {
      findMany: vi.fn().mockImplementation(({ where }: { where: { id?: { in?: string[] }; tenant_id?: string } }) => {
        const ids = where.id?.in ?? []
        const tId = where.tenant_id
        return pedidos.filter(p =>
          (ids.length === 0 || ids.includes(p.id)) && (!tId || p.tenant_id === tId),
        )
      }),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...data, id: `novo-${Date.now()}` }),
      ),
      count: vi.fn().mockResolvedValue(10),
      delete: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: pedidos.length }),
    },
    pedidoItem: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...data, id: `novo-item-${Date.now()}` }),
      ),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(0),
    },
    pedidoHistorico: {
      create: vi.fn().mockResolvedValue({}),
      createMany: vi.fn().mockResolvedValue({}),
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbMock: Record<string, any> = {
    ...txMock,
    configuracaoPedido: {
      findFirst: vi.fn().mockResolvedValue(config),
    },
    $transaction: vi.fn().mockImplementation((fn: (tx: unknown) => Promise<unknown>) => fn(txMock)),
  }

  return { dbMock, txMock }
}

// ── DuplicarService ───────────────────────────────────────────────────────────

describe('DuplicarService', () => {
  let service: DuplicarService

  beforeEach(() => {
    service = new DuplicarService()
  })

  it('deve retornar preview com config e pedidos', async () => {
    const pedido = criarPedidoMock('p1', { itens: [criarItemMock('i1', 'p1'), criarItemMock('i2', 'p1')] })
    const { dbMock } = criarDbMock([pedido])

    const resultado = await service.preview(dbMock, 'tenant-abc', ['p1'])

    expect(resultado.config.numero_auto).toBe(false)
    expect(resultado.config.copiar_datas).toBe(false)
    expect(resultado.pedidos).toHaveLength(1)
    expect(resultado.pedidos[0].id).toBe('p1')
    expect(resultado.pedidos[0].total_itens).toBe(2)
  })

  it('deve duplicar pedido copiando todos os campos', async () => {
    const item = criarItemMock('i1', 'p1', { saldo_item_pedido: 80, quantidade_transferida_item: 20 })
    const pedido = criarPedidoMock('p1', { itens: [item] })
    const { dbMock, txMock } = criarDbMock([pedido])

    await service.confirmar(dbMock, 'tenant-abc', 'company-1', 'user-1', {
      ids: ['p1'],
      numeros: { p1: 'PO-COPY-001' },
    })

    expect(txMock.pedido.create).toHaveBeenCalledOnce()
    const createCall = txMock.pedido.create.mock.calls[0][0]
    expect(createCall.data.numero_pedido).toBe('PO-COPY-001')
    expect(createCall.data.tenant_id).toBe('tenant-abc')
    expect(createCall.data.incoterm).toBe('FOB')
    expect(createCall.data.moeda_pedido).toBe('USD')
  })

  it('deve clonar itens com saldo zerado', async () => {
    const item = criarItemMock('i1', 'p1', {
      quantidade_inicial_item_pedido: 100,
      saldo_item_pedido: 60,
      quantidade_transferida_item: 30,
      quantidade_cancelada_item_pedido: 10,
      quantidade_pronta_total: 5,
    })
    const pedido = criarPedidoMock('p1', { itens: [item] })
    const { dbMock, txMock } = criarDbMock([pedido])

    await service.confirmar(dbMock, 'tenant-abc', 'company-1', 'user-1', {
      ids: ['p1'],
      numeros: { p1: 'PO-COPY-001' },
    })

    const createCall = txMock.pedido.create.mock.calls[0][0]
    const itemCriado = createCall.data.itens.create[0]
    // Saldo zerado: saldo_item_pedido = quantidade_inicial_item_pedido
    expect(itemCriado.saldo_item_pedido).toBe(100)
    expect(itemCriado.quantidade_transferida_item).toBe(0)
    expect(itemCriado.quantidade_cancelada_item_pedido).toBe(0)
    expect(itemCriado.quantidade_pronta_total).toBe(0)
  })

  it('deve respeitar config copiar_datas = false (reseta datas)', async () => {
    const pedido = criarPedidoMock('p1', {
      itens: [],
      data_prevista_pedido_pronto: '2026-12-01T00:00:00.000Z',
    })
    const { dbMock, txMock } = criarDbMock([pedido], { duplicar_copiar_datas: false })

    await service.confirmar(dbMock, 'tenant-abc', 'company-1', 'user-1', {
      ids: ['p1'],
      numeros: { p1: 'PO-COPY-001' },
    })

    const createCall = txMock.pedido.create.mock.calls[0][0]
    expect(createCall.data.data_prevista_pedido_pronto).toBeNull()
  })

  it('deve respeitar config copiar_datas = true (mantém datas)', async () => {
    const pedido = criarPedidoMock('p1', {
      itens: [],
      data_prevista_pedido_pronto: '2026-12-01T00:00:00.000Z',
    })
    const { dbMock, txMock } = criarDbMock([pedido], { duplicar_copiar_datas: true })

    await service.confirmar(dbMock, 'tenant-abc', 'company-1', 'user-1', {
      ids: ['p1'],
      numeros: { p1: 'PO-COPY-001' },
    })

    const createCall = txMock.pedido.create.mock.calls[0][0]
    expect(createCall.data.data_prevista_pedido_pronto).toBe('2026-12-01T00:00:00.000Z')
  })

  it('deve usar config status_inicial = "draft" ignorando status original', async () => {
    const pedido = criarPedidoMock('p1', { itens: [], status: 'consolidado' })
    const { dbMock, txMock } = criarDbMock([pedido], { duplicar_status_inicial: 'draft' })

    await service.confirmar(dbMock, 'tenant-abc', 'company-1', 'user-1', {
      ids: ['p1'],
      numeros: { p1: 'PO-COPY-001' },
    })

    const createCall = txMock.pedido.create.mock.calls[0][0]
    expect(createCall.data.status).toBe('draft')
  })

  it('deve usar status "copiar" quando config status_inicial = "copiar"', async () => {
    const pedido = criarPedidoMock('p1', { itens: [], status: 'aberto' })
    const { dbMock, txMock } = criarDbMock([pedido], { duplicar_status_inicial: 'copiar' })

    await service.confirmar(dbMock, 'tenant-abc', 'company-1', 'user-1', {
      ids: ['p1'],
      numeros: { p1: 'PO-COPY-001' },
    })

    const createCall = txMock.pedido.create.mock.calls[0][0]
    expect(createCall.data.status).toBe('aberto')
  })

  it('deve rejeitar se numero não fornecido e config não é auto', async () => {
    const pedido = criarPedidoMock('p1', { itens: [] })
    const { dbMock } = criarDbMock([pedido], { duplicar_numero_auto: false })

    await expect(
      service.confirmar(dbMock, 'tenant-abc', 'company-1', 'user-1', { ids: ['p1'] }),
    ).rejects.toThrow(AppError)
  })

  it('cross-tenant: não duplica pedido de outro tenant', async () => {
    const pedido = criarPedidoMock('p1', { tenant_id: 'outro-tenant', itens: [] })
    const { dbMock } = criarDbMock([pedido])
    // dbMock filtra por tenant_id, retornará array vazio para 'tenant-abc'

    await expect(
      service.confirmar(dbMock, 'tenant-abc', 'company-1', 'user-1', {
        ids: ['p1'],
        numeros: { p1: 'PO-COPY-001' },
      }),
    ).rejects.toThrow(AppError)
  })
})

// ── ExcluirService ────────────────────────────────────────────────────────────

describe('ExcluirService', () => {
  let service: ExcluirService

  beforeEach(() => {
    service = new ExcluirService()
  })

  it('deve separar permitidos e bloqueados no preview', async () => {
    const p1 = criarPedidoMock('p1', { status: 'draft', itens: [criarItemMock('i1', 'p1')] })
    const p2 = criarPedidoMock('p2', { status: 'aberto', itens: [] })
    const { dbMock } = criarDbMock([p1, p2])

    const resultado = await service.preview(dbMock, 'tenant-abc', ['p1', 'p2'])

    expect(resultado.permitidos).toHaveLength(1)
    expect(resultado.permitidos[0].id).toBe('p1')
    expect(resultado.bloqueados).toHaveLength(1)
    expect(resultado.bloqueados[0].id).toBe('p2')
    expect(resultado.bloqueados[0].motivo).toContain('aberto')
  })

  it('deve executar hard delete de pedido e itens', async () => {
    const pedido = criarPedidoMock('p1', { itens: [criarItemMock('i1', 'p1'), criarItemMock('i2', 'p1')] })
    const { dbMock, txMock } = criarDbMock([pedido])

    const resultado = await service.confirmar(dbMock, 'tenant-abc', 'user-1', ['p1'])

    expect(txMock.pedidoItem.deleteMany).toHaveBeenCalledWith({
      where: { pedido_id: { in: ['p1'] }, tenant_id: 'tenant-abc' },
    })
    expect(txMock.pedido.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['p1'] }, tenant_id: 'tenant-abc' },
    })
    expect(resultado.excluidos).toBe(1)
    expect(resultado.itens_excluidos).toBe(2)
  })

  it('deve criar audit trail ANTES do hard delete', async () => {
    const pedido = criarPedidoMock('p1', { itens: [criarItemMock('i1', 'p1')] })
    const { dbMock, txMock } = criarDbMock([pedido])

    await service.confirmar(dbMock, 'tenant-abc', 'user-1', ['p1'])

    // Audit trail foi chamado antes do deleteMany
    const histCalls = txMock.pedidoHistorico.create.mock.invocationCallOrder
    const deleteCalls = txMock.pedidoItem.deleteMany.mock.invocationCallOrder
    expect(histCalls[0]).toBeLessThan(deleteCalls[0])
  })

  it('deve bloquear exclusão de pedido com status não permitido', async () => {
    const pedido = criarPedidoMock('p1', { status: 'consolidado', itens: [] })
    const { dbMock } = criarDbMock([pedido])

    await expect(
      service.confirmar(dbMock, 'tenant-abc', 'user-1', ['p1']),
    ).rejects.toThrow(AppError)
  })

  it('excluir item: deve excluir o pedido pai quando config excluir_pedido_sem_item_permitido = false', async () => {
    const pedido = criarPedidoMock('p1', { itens: [criarItemMock('i1', 'p1')] })
    const { dbMock, txMock } = criarDbMock([pedido], {
      excluir_pedido_sem_item_permitido: false,
    })

    // findFirst retorna o pedido (pertence ao tenant)
    dbMock.pedido.findFirst.mockResolvedValue(pedido)
    // Após excluir o item, restam 0 itens
    txMock.pedidoItem.count.mockResolvedValue(0)
    txMock.pedidoItem.findMany.mockResolvedValue([criarItemMock('i1', 'p1')])

    const resultado = await service.excluirItens(dbMock, 'tenant-abc', 'user-1', 'p1', ['i1'])

    expect(txMock.pedido.delete).toHaveBeenCalledWith({ where: { id: 'p1' } })
    expect(resultado.pedidos_excluidos_por_sem_item).toBe(1)
  })

  it('excluir item: deve manter o pedido pai quando config excluir_pedido_sem_item_permitido = true', async () => {
    const pedido = criarPedidoMock('p1', { itens: [criarItemMock('i1', 'p1')] })
    const { dbMock, txMock } = criarDbMock([pedido], {
      excluir_pedido_sem_item_permitido: true,
    })

    // findFirst retorna o pedido (pertence ao tenant)
    dbMock.pedido.findFirst.mockResolvedValue(pedido)
    txMock.pedidoItem.count.mockResolvedValue(0)
    txMock.pedidoItem.findMany.mockResolvedValue([criarItemMock('i1', 'p1')])

    const resultado = await service.excluirItens(dbMock, 'tenant-abc', 'user-1', 'p1', ['i1'])

    expect(txMock.pedido.delete).not.toHaveBeenCalled()
    expect(resultado.pedidos_excluidos_por_sem_item).toBe(0)
  })

  it('cross-tenant: não exclui pedido de outro tenant', async () => {
    const pedido = criarPedidoMock('p1', { tenant_id: 'outro-tenant' })
    const { dbMock } = criarDbMock([pedido])

    await expect(
      service.confirmar(dbMock, 'tenant-abc', 'user-1', ['p1']),
    ).rejects.toThrow(AppError)
  })
})
