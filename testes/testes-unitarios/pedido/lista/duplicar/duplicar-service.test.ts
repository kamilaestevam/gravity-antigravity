// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Testes unitários do DuplicarService (preview, confirmar, duplicarItens).
 *
 * Cobre casos U-SVC-01 a U-SVC-52 do plano duplicar-unitario.md.
 *
 * Estratégia:
 *   - Prisma completamente mockado (vi.fn())
 *   - auditLog mockado (fire-and-forget)
 *   - Foco na lógica pura: clonagem, zeramento, renumeração, isolamento org
 */

// ── Mock do auditLog ──────────────────────────────────────────────────────────

vi.mock('../../../../../servicos-global/servicos-plataforma/historico-global/src/audit-client.js', () => ({
  auditLog: vi.fn(),
}))

// ── Import real do service ────────────────────────────────────────────────────

import { DuplicarService, AppError } from '../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js'
import type { OpcoesDuplicacao, DuplicarPayload, DuplicarItemPayload } from '../../../../../servicos-global/produto/pedido/server/src/services/duplicarExcluirService.js'

// ── Helpers de mock ───────────────────────────────────────────────────────────

const ORG_ID = 'org-001'
const WORKSPACE_ID = 'ws-001'
const USER_ID = 'usr-001'
const USER_NAME = 'Teste User'

function criarPedidoMock(overrides: Record<string, unknown> = {}) {
  return {
    id_pedido: 'ped-001',
    id_organizacao: ORG_ID,
    id_workspace: WORKSPACE_ID,
    numero_pedido: 'PED-2026/001',
    status_pedido: 'rascunho',
    valor_total_pedido: 1000,
    valor_total_cambio_pedido: 5000,
    taxa_cambio_estimada_pedido: 5.0,
    numero_proforma_pedido: 'PRO-001',
    numero_invoice_pedido: 'INV-001',
    referencia_importador_pedido: 'REF-IMP',
    referencia_exportador_pedido: 'REF-EXP',
    referencia_fabricante_pedido: 'REF-FAB',
    contrato_cambio_id_pedido: 'CC-001',
    peso_liquido_total_pedido: 100,
    peso_bruto_total_pedido: 120,
    cubagem_total_pedido: 2.5,
    tipo_embalagem_pedido: 'caixa',
    quantidade_volumes_pedido: 10,
    data_emissao_pedido: new Date('2026-01-15'),
    data_embarque_pedido: new Date('2026-02-01'),
    data_criacao_pedido: new Date('2026-01-01'),
    data_atualizacao_pedido: new Date('2026-01-10'),
    ids_origem_consolidacao_pedido: null,
    data_consolidacao_pedido: null,
    data_transferencia_saldo_pedido: null,
    itens_pedido: [criarItemMock()],
    ...overrides,
  }
}

function criarItemMock(overrides: Record<string, unknown> = {}) {
  return {
    id_item: 'it-001',
    id_pedido: 'ped-001',
    id_organizacao: ORG_ID,
    id_workspace: WORKSPACE_ID,
    sequencia_item_pedido: 1,
    quantidade_inicial_item: 100,
    quantidade_atual_item: 80,
    quantidade_pronta_item: 10,
    quantidade_transferida_item: 5,
    quantidade_cancelada_item: 5,
    valor_total_item: 500,
    valor_por_unidade_item: 5,
    numero_lpco: 'LPCO-001',
    numero_certificado_origem: 'CO-001',
    referencia_importador_item: 'REF-IMP-IT',
    referencia_exportador_item: 'REF-EXP-IT',
    referencia_fabricante_item: 'REF-FAB-IT',
    peso_liquido_unitario_item: 1.0,
    peso_bruto_unitario_item: 1.2,
    cubagem_unitaria_item: 0.025,
    tipo_embalagem_item: 'caixa',
    quantidade_volumes_item: 1,
    descricao_completa_item_pt: 'Descrição PT',
    descricao_completa_item_en: 'Description EN',
    descricao_completa_item_es: 'Descripción ES',
    descricao_completa_item_nf: 'Desc NF',
    texto_posicao_ncm: 'NCM texto',
    grupo_item: 'G1',
    subgrupo_item: 'SG1',
    campo_especial_item: 'especial',
    atributos_catalogo: '{"cor":"azul"}',
    data_criacao_item: new Date('2026-01-01'),
    data_atualizacao_item: new Date('2026-01-10'),
    data_embarque_item: new Date('2026-03-01'),
    ...overrides,
  }
}

function criarDbMock(overrides: {
  configResult?: Record<string, unknown> | null
  pedidosResult?: Record<string, unknown>[]
  pedidoFindFirst?: Record<string, unknown> | null
  itensResult?: Record<string, unknown>[]
  todosItensResult?: { id_item: string; sequencia_item_pedido: number }[]
  countResult?: number
  findFirstNumero?: Record<string, unknown> | null
  statusFK?: { id_pedido_status: string } | null
} = {}) {
  const mockCreate = vi.fn().mockImplementation((args: { data: Record<string, unknown> }) => ({
    ...args.data,
    id_pedido: args.data.id_pedido ?? 'ped-novo-001',
  }))
  const mockItemCreate = vi.fn().mockImplementation((args: { data: Record<string, unknown> }) => ({
    ...args.data,
    id_item: args.data.id_item ?? 'it-novo-001',
  }))
  const mockItemUpdate = vi.fn().mockResolvedValue({})

  return {
    configuracaoPedido: {
      findFirst: vi.fn().mockResolvedValue(overrides.configResult ?? null),
    },
    pedido: {
      findMany: vi.fn().mockResolvedValue(overrides.pedidosResult ?? [criarPedidoMock()]),
      findFirst: vi.fn().mockResolvedValue(overrides.findFirstNumero ?? null),
      count: vi.fn().mockResolvedValue(overrides.countResult ?? 5),
      create: mockCreate,
      update: vi.fn().mockResolvedValue({}),
    },
    pedidoItem: {
      findMany: vi.fn().mockResolvedValue(
        overrides.itensResult ?? overrides.todosItensResult ?? [criarItemMock()],
      ),
      create: mockItemCreate,
      update: mockItemUpdate,
    },
    statusPedido: {
      findFirst: vi.fn().mockResolvedValue(overrides.statusFK ?? { id_pedido_status: 'st-001' }),
    },
    // expose mocks for assertions
    _mocks: { mockCreate, mockItemCreate, mockItemUpdate },
  }
}

// ── Instância do service ──────────────────────────────────────────────────────

let service: DuplicarService

beforeEach(() => {
  service = new DuplicarService()
  vi.clearAllMocks()
})

// ══════════════════════════════════════════════════════════════════════════════
// preview()
// ══════════════════════════════════════════════════════════════════════════════

describe('DuplicarService.preview', () => {
  it('U-SVC-01: retorna config e pedidos para 1 id', async () => {
    const db = criarDbMock()
    const result = await service.preview(db as unknown as Record<string, unknown>, ORG_ID, ['ped-001'])

    expect(result.config).toBeDefined()
    expect(result.config.numero_auto).toBe(false) // default config
    expect(result.pedidos).toHaveLength(1)
    expect(result.pedidos[0]).toMatchObject({
      id: 'ped-001',
      numero_pedido: 'PED-2026/001',
      total_itens: 1,
    })
  })

  it('U-SVC-02: retorna config com numero_auto=true quando configurado', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'rascunho' },
    })
    const result = await service.preview(db as unknown as Record<string, unknown>, ORG_ID, ['ped-001'])

    expect(result.config.numero_auto).toBe(true)
    expect(result.config.copiar_datas).toBe(true)
    expect(result.config.status_inicial).toBe('rascunho')
  })

  it('U-SVC-03: retorna preview para 2 pedidos', async () => {
    const pedidos = [
      criarPedidoMock({ id_pedido: 'ped-001', itens_pedido: [criarItemMock()] }),
      criarPedidoMock({ id_pedido: 'ped-002', numero_pedido: 'PED-002', itens_pedido: [criarItemMock(), criarItemMock({ id_item: 'it-002' })] }),
    ]
    const db = criarDbMock({ pedidosResult: pedidos })
    const result = await service.preview(db as unknown as Record<string, unknown>, ORG_ID, ['ped-001', 'ped-002'])

    expect(result.pedidos).toHaveLength(2)
    expect(result.pedidos[1].total_itens).toBe(2)
  })

  it('U-SVC-04: lança AppError 404 quando pedido não encontrado', async () => {
    const db = criarDbMock({ pedidosResult: [] })

    await expect(
      service.preview(db as unknown as Record<string, unknown>, ORG_ID, ['inexistente']),
    ).rejects.toThrow(AppError)

    await expect(
      service.preview(db as unknown as Record<string, unknown>, ORG_ID, ['inexistente']),
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' })
  })

  it('U-SVC-05: filtra por id_organizacao na query', async () => {
    const db = criarDbMock()
    await service.preview(db as unknown as Record<string, unknown>, ORG_ID, ['ped-001'])

    expect(db.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: ORG_ID }),
      }),
    )
  })

  it('U-SVC-06: lança 404 quando 2 ids mas só 1 encontrado', async () => {
    const db = criarDbMock({ pedidosResult: [criarPedidoMock()] })

    await expect(
      service.preview(db as unknown as Record<string, unknown>, ORG_ID, ['ped-001', 'ped-999']),
    ).rejects.toMatchObject({ statusCode: 404 })
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// confirmar()
// ══════════════════════════════════════════════════════════════════════════════

describe('DuplicarService.confirmar', () => {
  const payloadBase: DuplicarPayload = { ids: ['ped-001'] }

  it('U-SVC-10: duplica 1 pedido com numero_auto=true', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    const result = await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    expect(result.criados).toHaveLength(1)
    expect(result.erros).toHaveLength(0)
    expect(result.criados[0].original_id).toBe('ped-001')
    expect(result.criados[0].novo_id).toBeDefined()
    expect(result.criados[0].numero_pedido).toMatch(/pedi_id_/)
  })

  it('U-SVC-11: duplica 1 pedido com numero_auto=false e número fornecido', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: false, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = { ids: ['ped-001'], numeros: { 'ped-001': 'COPIA-001' } }
    const result = await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    expect(result.criados).toHaveLength(1)
    expect(result.criados[0].numero_pedido).toBe('COPIA-001')
  })

  it('U-SVC-12: lança 400 quando auto=false e número não fornecido', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: false, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })

    await expect(
      service.confirmar(db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase),
    ).rejects.toMatchObject({ statusCode: 400, code: 'VALIDATION_ERROR' })
  })

  it('U-SVC-13: duplica 2 pedidos com auto=true', async () => {
    const pedidos = [
      criarPedidoMock({ id_pedido: 'ped-001' }),
      criarPedidoMock({ id_pedido: 'ped-002', numero_pedido: 'PED-002' }),
    ]
    const db = criarDbMock({
      pedidosResult: pedidos,
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = { ids: ['ped-001', 'ped-002'] }
    const result = await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    expect(result.criados).toHaveLength(2)
  })

  it('U-SVC-14: retorna erro quando número duplicado no banco', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    // Simula que o número gerado já existe
    db.pedido.findFirst.mockResolvedValue({ id_pedido: 'existente' })

    const result = await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    expect(result.criados).toHaveLength(0)
    expect(result.erros).toHaveLength(1)
    expect(result.erros[0].motivo).toContain('já está em uso')
  })

  it('U-SVC-15: lança 404 quando pedido não encontrado', async () => {
    const db = criarDbMock({ pedidosResult: [] })

    await expect(
      service.confirmar(db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase),
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  // ── Campos SEMPRE resetados ──────────────────────────────────────────────

  it('U-SVC-20: id_pedido do clone é diferente do original', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    expect(createCall.data.id_pedido).not.toBe('ped-001')
    expect(createCall.data.id_pedido).toMatch(/^pedi_id_/)
  })

  it('U-SVC-21: data_criacao_pedido NÃO está no spread do clone', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    expect(createCall.data).not.toHaveProperty('data_criacao_pedido')
  })

  it('U-SVC-22: data_atualizacao_pedido NÃO está no spread do clone', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    expect(createCall.data).not.toHaveProperty('data_atualizacao_pedido')
  })

  it('U-SVC-23: ids_origem_consolidacao_pedido removido', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    expect(createCall.data).not.toHaveProperty('ids_origem_consolidacao_pedido')
  })

  it('U-SVC-24: itens clonados têm quantidade_pronta_item = 0', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    const itensClonados = createCall.data.itens_pedido.create
    expect(itensClonados[0].quantidade_pronta_item).toBe(0)
  })

  it('U-SVC-25: itens clonados têm quantidade_transferida_item = 0', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    const itensClonados = createCall.data.itens_pedido.create
    expect(itensClonados[0].quantidade_transferida_item).toBe(0)
  })

  it('U-SVC-26: itens clonados têm quantidade_cancelada_item = 0', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    const itensClonados = createCall.data.itens_pedido.create
    expect(itensClonados[0].quantidade_cancelada_item).toBe(0)
  })

  it('U-SVC-27: itens clonados têm quantidade_atual_item = quantidade_inicial_item', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    const itensClonados = createCall.data.itens_pedido.create
    // quantidade_inicial_item do mock = 100
    expect(itensClonados[0].quantidade_atual_item).toBe(100)
  })

  // ── Opções de duplicação ─────────────────────────────────────────────────

  it('U-SVC-30: copiar_valores_precos=false zera campos de valor no pedido', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = {
      ids: ['ped-001'],
      opcoes: {
        copiar_datas: true,
        copiar_valores_precos: false,
        copiar_referencias_externas: true,
        copiar_pesos_cubagem: true,
        copiar_descricoes_complementares: true,
      },
    }
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    expect(createCall.data.valor_total_pedido).toBeNull()
    expect(createCall.data.valor_total_cambio_pedido).toBeNull()
    expect(createCall.data.taxa_cambio_estimada_pedido).toBeNull()
  })

  it('U-SVC-31: copiar_valores_precos=false zera campos de valor nos itens', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = {
      ids: ['ped-001'],
      opcoes: {
        copiar_datas: true,
        copiar_valores_precos: false,
        copiar_referencias_externas: true,
        copiar_pesos_cubagem: true,
        copiar_descricoes_complementares: true,
      },
    }
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    const itens = createCall.data.itens_pedido.create
    expect(itens[0].valor_total_item).toBeNull()
    expect(itens[0].valor_por_unidade_item).toBeNull()
  })

  it('U-SVC-32: copiar_referencias_externas=false zera referências no pedido', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = {
      ids: ['ped-001'],
      opcoes: {
        copiar_datas: true,
        copiar_valores_precos: true,
        copiar_referencias_externas: false,
        copiar_pesos_cubagem: true,
        copiar_descricoes_complementares: true,
      },
    }
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    expect(createCall.data.numero_proforma_pedido).toBeNull()
    expect(createCall.data.numero_invoice_pedido).toBeNull()
    expect(createCall.data.referencia_importador_pedido).toBeNull()
    expect(createCall.data.referencia_exportador_pedido).toBeNull()
    expect(createCall.data.referencia_fabricante_pedido).toBeNull()
    expect(createCall.data.contrato_cambio_id_pedido).toBeNull()
  })

  it('U-SVC-33: copiar_referencias_externas=false zera referências nos itens', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = {
      ids: ['ped-001'],
      opcoes: {
        copiar_datas: true,
        copiar_valores_precos: true,
        copiar_referencias_externas: false,
        copiar_pesos_cubagem: true,
        copiar_descricoes_complementares: true,
      },
    }
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    const itens = createCall.data.itens_pedido.create
    expect(itens[0].numero_lpco).toBeNull()
    expect(itens[0].numero_certificado_origem).toBeNull()
    expect(itens[0].referencia_importador_item).toBeNull()
    expect(itens[0].referencia_exportador_item).toBeNull()
    expect(itens[0].referencia_fabricante_item).toBeNull()
  })

  it('U-SVC-34: copiar_pesos_cubagem=false zera pesos no pedido', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = {
      ids: ['ped-001'],
      opcoes: {
        copiar_datas: true,
        copiar_valores_precos: true,
        copiar_referencias_externas: true,
        copiar_pesos_cubagem: false,
        copiar_descricoes_complementares: true,
      },
    }
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    expect(createCall.data.peso_liquido_total_pedido).toBeNull()
    expect(createCall.data.peso_bruto_total_pedido).toBeNull()
    expect(createCall.data.cubagem_total_pedido).toBeNull()
    expect(createCall.data.tipo_embalagem_pedido).toBeNull()
    expect(createCall.data.quantidade_volumes_pedido).toBeNull()
  })

  it('U-SVC-35: copiar_pesos_cubagem=false zera pesos nos itens', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = {
      ids: ['ped-001'],
      opcoes: {
        copiar_datas: true,
        copiar_valores_precos: true,
        copiar_referencias_externas: true,
        copiar_pesos_cubagem: false,
        copiar_descricoes_complementares: true,
      },
    }
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    const itens = createCall.data.itens_pedido.create
    expect(itens[0].peso_liquido_unitario_item).toBeNull()
    expect(itens[0].peso_bruto_unitario_item).toBeNull()
    expect(itens[0].cubagem_unitaria_item).toBeNull()
    expect(itens[0].tipo_embalagem_item).toBeNull()
    expect(itens[0].quantidade_volumes_item).toBeNull()
  })

  it('U-SVC-36: copiar_descricoes_complementares=false zera descrições nos itens', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = {
      ids: ['ped-001'],
      opcoes: {
        copiar_datas: true,
        copiar_valores_precos: true,
        copiar_referencias_externas: true,
        copiar_pesos_cubagem: true,
        copiar_descricoes_complementares: false,
      },
    }
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    const itens = createCall.data.itens_pedido.create
    expect(itens[0].descricao_completa_item_pt).toBeNull()
    expect(itens[0].descricao_completa_item_en).toBeNull()
    expect(itens[0].descricao_completa_item_es).toBeNull()
    expect(itens[0].descricao_completa_item_nf).toBeNull()
    expect(itens[0].texto_posicao_ncm).toBeNull()
    expect(itens[0].grupo_item).toBeNull()
    expect(itens[0].subgrupo_item).toBeNull()
    expect(itens[0].campo_especial_item).toBeNull()
    expect(itens[0].atributos_catalogo).toBeNull()
  })

  it('U-SVC-37: copiar_datas=false zera todos os campos Date do pedido e itens', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = {
      ids: ['ped-001'],
      opcoes: {
        copiar_datas: false,
        copiar_valores_precos: true,
        copiar_referencias_externas: true,
        copiar_pesos_cubagem: true,
        copiar_descricoes_complementares: true,
      },
    }
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    // data_embarque_pedido era Date → deve ser null
    expect(createCall.data.data_embarque_pedido).toBeNull()
    // itens também
    const itens = createCall.data.itens_pedido.create
    expect(itens[0].data_embarque_item).toBeNull()
  })

  it('U-SVC-38: opcoes ausente (retrocompat) não zera nenhum campo', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: true, duplicar_status_inicial: 'copiar' },
    })
    const payload: DuplicarPayload = { ids: ['ped-001'] } // sem opcoes
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payload,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    // Valores preservados (não null)
    expect(createCall.data.valor_total_pedido).toBe(1000)
    expect(createCall.data.numero_proforma_pedido).toBe('PRO-001')
    expect(createCall.data.peso_liquido_total_pedido).toBe(100)
  })

  it('U-SVC-39: status_inicial=copiar herda status do original', async () => {
    const db = criarDbMock({
      pedidosResult: [criarPedidoMock({ status_pedido: 'aprovado' })],
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    expect(createCall.data.status_pedido).toBe('aprovado')
  })

  it('U-SVC-40: status_inicial fixo usa valor da config', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'rascunho' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    const createCall = db.pedido.create.mock.calls[0][0]
    expect(createCall.data.status_pedido).toBe('rascunho')
  })

  it('U-SVC-41: filtra por id_organizacao no confirmar', async () => {
    const db = criarDbMock({
      configResult: { duplicar_numero_auto: true, duplicar_copiar_datas: false, duplicar_status_inicial: 'copiar' },
    })
    await service.confirmar(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, USER_ID, USER_NAME, payloadBase,
    )

    expect(db.pedido.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id_organizacao: ORG_ID }),
      }),
    )
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// duplicarItens()
// ══════════════════════════════════════════════════════════════════════════════

describe('DuplicarService.duplicarItens', () => {
  const payloadBase: DuplicarItemPayload = { pedido_id: 'ped-001', item_ids: ['it-001'] }

  it('U-SVC-50: duplica 1 item dentro do pedido', async () => {
    const db = criarDbMock({
      pedidoFindFirst: criarPedidoMock(),
      itensResult: [criarItemMock()],
      todosItensResult: [{ id_item: 'it-001', sequencia_item_pedido: 1 }],
    })
    // Configure findMany to return different results on different calls
    db.pedidoItem.findMany
      .mockResolvedValueOnce([criarItemMock()]) // itens a duplicar
      .mockResolvedValueOnce([{ id_item: 'it-001', sequencia_item_pedido: 1 }]) // todos itens do pedido

    db.pedido.findFirst.mockResolvedValue(criarPedidoMock())

    const result = await service.duplicarItens(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payloadBase,
    )

    expect(result.criados).toHaveLength(1)
    expect(result.criados[0].original_id).toBe('it-001')
    expect(result.criados[0].novo_id).toMatch(/^pite_id_/)
  })

  it('U-SVC-51: item duplicado mantém id_pedido do pai', async () => {
    const db = criarDbMock()
    db.pedidoItem.findMany
      .mockResolvedValueOnce([criarItemMock()])
      .mockResolvedValueOnce([{ id_item: 'it-001', sequencia_item_pedido: 1 }])
    db.pedido.findFirst.mockResolvedValue(criarPedidoMock())

    await service.duplicarItens(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payloadBase,
    )

    const createCall = db.pedidoItem.create.mock.calls[0][0]
    expect(createCall.data.id_pedido).toBe('ped-001')
  })

  it('U-SVC-52: duplica 2 itens do mesmo pedido', async () => {
    const item1 = criarItemMock({ id_item: 'it-001', sequencia_item_pedido: 1 })
    const item2 = criarItemMock({ id_item: 'it-002', sequencia_item_pedido: 2 })
    const db = criarDbMock()
    db.pedidoItem.findMany
      .mockResolvedValueOnce([item1, item2])
      .mockResolvedValueOnce([
        { id_item: 'it-001', sequencia_item_pedido: 1 },
        { id_item: 'it-002', sequencia_item_pedido: 2 },
      ])
    db.pedido.findFirst.mockResolvedValue(criarPedidoMock())

    const payload: DuplicarItemPayload = { pedido_id: 'ped-001', item_ids: ['it-001', 'it-002'] }
    const result = await service.duplicarItens(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payload,
    )

    expect(result.criados).toHaveLength(2)
  })

  it('U-SVC-53: lança 404 quando pedido não encontrado', async () => {
    const db = criarDbMock()
    db.pedido.findFirst.mockResolvedValue(null)

    await expect(
      service.duplicarItens(db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payloadBase),
    ).rejects.toMatchObject({ statusCode: 404 })
  })

  it('U-SVC-54: lança 404 quando item não pertence ao pedido', async () => {
    const db = criarDbMock()
    db.pedido.findFirst.mockResolvedValue(criarPedidoMock())
    db.pedidoItem.findMany.mockResolvedValueOnce([]) // nenhum item encontrado

    await expect(
      service.duplicarItens(db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payloadBase),
    ).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' })
  })

  it('U-SVC-55: itens duplicados têm quantidade_pronta/transferida/cancelada = 0', async () => {
    const db = criarDbMock()
    db.pedidoItem.findMany
      .mockResolvedValueOnce([criarItemMock()])
      .mockResolvedValueOnce([{ id_item: 'it-001', sequencia_item_pedido: 1 }])
    db.pedido.findFirst.mockResolvedValue(criarPedidoMock())

    await service.duplicarItens(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payloadBase,
    )

    const createCall = db.pedidoItem.create.mock.calls[0][0]
    expect(createCall.data.quantidade_pronta_item).toBe(0)
    expect(createCall.data.quantidade_transferida_item).toBe(0)
    expect(createCall.data.quantidade_cancelada_item).toBe(0)
  })

  it('U-SVC-56: itens duplicados têm quantidade_atual = quantidade_inicial', async () => {
    const db = criarDbMock()
    db.pedidoItem.findMany
      .mockResolvedValueOnce([criarItemMock({ quantidade_inicial_item: 200 })])
      .mockResolvedValueOnce([{ id_item: 'it-001', sequencia_item_pedido: 1 }])
    db.pedido.findFirst.mockResolvedValue(criarPedidoMock())

    await service.duplicarItens(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payloadBase,
    )

    const createCall = db.pedidoItem.create.mock.calls[0][0]
    expect(createCall.data.quantidade_atual_item).toBe(200)
  })

  it('U-SVC-57: filtra por id_organizacao na busca de itens', async () => {
    const db = criarDbMock()
    db.pedido.findFirst.mockResolvedValue(criarPedidoMock())
    db.pedidoItem.findMany
      .mockResolvedValueOnce([criarItemMock()])
      .mockResolvedValueOnce([{ id_item: 'it-001', sequencia_item_pedido: 1 }])

    await service.duplicarItens(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payloadBase,
    )

    // Verifica que ambas as chamadas findMany incluem id_organizacao
    for (const call of db.pedidoItem.findMany.mock.calls) {
      expect(call[0].where).toHaveProperty('id_organizacao', ORG_ID)
    }
  })

  it('U-SVC-58: copiar_valores_precos=false zera valores nos itens duplicados', async () => {
    const db = criarDbMock()
    db.pedido.findFirst.mockResolvedValue(criarPedidoMock())
    db.pedidoItem.findMany
      .mockResolvedValueOnce([criarItemMock()])
      .mockResolvedValueOnce([{ id_item: 'it-001', sequencia_item_pedido: 1 }])

    const payload: DuplicarItemPayload = {
      pedido_id: 'ped-001',
      item_ids: ['it-001'],
      opcoes: {
        copiar_datas: true,
        copiar_valores_precos: false,
        copiar_referencias_externas: true,
        copiar_pesos_cubagem: true,
        copiar_descricoes_complementares: true,
      },
    }
    await service.duplicarItens(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payload,
    )

    const createCall = db.pedidoItem.create.mock.calls[0][0]
    expect(createCall.data.valor_total_item).toBeNull()
    expect(createCall.data.valor_por_unidade_item).toBeNull()
  })

  it('U-SVC-59: renumeração sequencial após duplicação', async () => {
    const db = criarDbMock()
    db.pedido.findFirst.mockResolvedValue(criarPedidoMock())
    db.pedidoItem.findMany
      .mockResolvedValueOnce([criarItemMock({ id_item: 'it-001' })])
      .mockResolvedValueOnce([
        { id_item: 'it-001', sequencia_item_pedido: 1 },
        { id_item: 'it-002', sequencia_item_pedido: 2 },
      ])

    await service.duplicarItens(
      db as unknown as Record<string, unknown>, ORG_ID, WORKSPACE_ID, payloadBase,
    )

    // Should have called update for renumbering (3 items total: it-001, novo, it-002)
    expect(db.pedidoItem.update).toHaveBeenCalled()
  })
})
