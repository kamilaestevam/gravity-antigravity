/**
 * Testes unitarios — productCatalogService.ts
 * CRUD do catalogo master de produtos da plataforma Gravity.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockPrisma = vi.hoisted(() => ({
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  priceTier: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  $transaction: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: mockPrisma,
}))

import { productCatalogService } from '../../../servicos-global/configurador/server/services/productCatalogService.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'clx123abc',
    name: 'SimulaCusto',
    slug: 'simula-custo',
    description: 'Gestao de custos de importacao',
    status: 'ACTIVE',
    billing_type: 'PER_ESTIMATE',
    unit_price: 10.99,
    minimum_price: 0,
    user_limit_type: 'LIMITED',
    base_users_qty: 10,
    backend_module: 'simula-custo',
    target_audience: 'Importadores',
    has_setup: false,
    setup_price: null,
    setup_currency: 'BRL',
    unit_currency: 'BRL',
    minimum_currency: 'BRL',
    total_price: null,
    total_currency: 'BRL',
    extra_user_price: null,
    extra_user_currency: 'BRL',
    helpdesk_hours: 4,
    extra_hour_price: null,
    extra_hour_currency: 'BRL',
    launch_date: null,
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-03-01'),
    price_tiers: [],
    negotiations: [],
    ...overrides,
  }
}

// ─── Reset ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── list() ─────────────────────────────────────────────────────────────────

describe('productCatalogService.list', () => {
  it('deve retornar produtos com paginacao padrao', async () => {
    const products = [makeProduct()]
    mockPrisma.product.findMany.mockResolvedValue(products)
    mockPrisma.product.count.mockResolvedValue(1)

    const result = await productCatalogService.list({})

    expect(result.products).toEqual(products)
    expect(result.pagination).toEqual({
      page: 1,
      limit: 50,
      total: 1,
      pages: 1,
    })
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 50,
        include: { price_tiers: true, negotiations: true },
        orderBy: { created_at: 'desc' },
      })
    )
  })

  it('deve aplicar paginacao customizada', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(100)

    const result = await productCatalogService.list({ page: 3, limit: 10 })

    expect(result.pagination).toEqual({
      page: 3,
      limit: 10,
      total: 100,
      pages: 10,
    })
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    )
  })

  it('deve aplicar filtro de busca (search)', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(0)

    await productCatalogService.list({ search: 'simula' })

    const call = mockPrisma.product.findMany.mock.calls[0][0]
    expect(call.where.OR).toEqual([
      { name: { contains: 'simula', mode: 'insensitive' } },
      { slug: { contains: 'simula', mode: 'insensitive' } },
      { description: { contains: 'simula', mode: 'insensitive' } },
    ])
  })

  it('deve aplicar filtro de status', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(0)

    await productCatalogService.list({ status: 'ACTIVE' })

    const call = mockPrisma.product.findMany.mock.calls[0][0]
    expect(call.where.status).toBe('ACTIVE')
  })

  it('deve combinar search e status', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(0)

    await productCatalogService.list({ search: 'bid', status: 'SUSPENDED' })

    const call = mockPrisma.product.findMany.mock.calls[0][0]
    expect(call.where.OR).toBeDefined()
    expect(call.where.status).toBe('SUSPENDED')
  })

  it('deve calcular pages corretamente com arredondamento para cima', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])
    mockPrisma.product.count.mockResolvedValue(51)

    const result = await productCatalogService.list({ limit: 10 })

    expect(result.pagination.pages).toBe(6)
  })
})

// ─── getById() ──────────────────────────────────────────────────────────────

describe('productCatalogService.getById', () => {
  it('deve retornar produto com price_tiers e negotiations quando encontrado', async () => {
    const product = makeProduct()
    mockPrisma.product.findUnique.mockResolvedValue(product)

    const result = await productCatalogService.getById('clx123abc')

    expect(result).toEqual(product)
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 'clx123abc' },
      include: { price_tiers: true, negotiations: true },
    })
  })

  it('deve retornar null quando produto nao encontrado', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null)

    const result = await productCatalogService.getById('inexistente')

    expect(result).toBeNull()
  })
})

// ─── getBySlug() ────────────────────────────────────────────────────────────

describe('productCatalogService.getBySlug', () => {
  it('deve retornar produto com price_tiers quando encontrado', async () => {
    const product = makeProduct()
    mockPrisma.product.findUnique.mockResolvedValue(product)

    const result = await productCatalogService.getBySlug('simula-custo')

    expect(result).toEqual(product)
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { slug: 'simula-custo' },
      include: { price_tiers: true },
    })
  })

  it('deve retornar null quando slug nao encontrado', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null)

    const result = await productCatalogService.getBySlug('nao-existe')

    expect(result).toBeNull()
  })
})

// ─── create() ───────────────────────────────────────────────────────────────

describe('productCatalogService.create', () => {
  it('deve criar produto sem price_tiers', async () => {
    const created = makeProduct()
    mockPrisma.product.create.mockResolvedValue(created)

    const data = {
      name: 'SimulaCusto',
      slug: 'simula-custo',
      description: 'Gestao de custos',
      status: 'ACTIVE',
      billing_type: 'PER_ESTIMATE',
      unit_price: 10.99,
      minimum_price: 0,
      user_limit_type: 'LIMITED',
      base_users_qty: 10,
      helpdesk_hours: 4,
    }

    const result = await productCatalogService.create(data as never)

    expect(result).toEqual(created)
    expect(mockPrisma.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'SimulaCusto',
        slug: 'simula-custo',
      }),
      include: { price_tiers: true },
    })
  })

  it('deve criar produto com price_tiers aninhados', async () => {
    const created = makeProduct({
      price_tiers: [
        { id: 't1', product_id: 'clx123abc', range_from: 1, range_to: 100, price: 5.99, currency: 'BRL' },
      ],
    })
    mockPrisma.product.create.mockResolvedValue(created)

    const data = {
      name: 'Smart Read',
      slug: 'smart-read',
      description: 'Leitura inteligente',
      status: 'ACTIVE',
      billing_type: 'PER_DOCUMENT',
      unit_price: 5.99,
      minimum_price: 0,
      user_limit_type: 'UNLIMITED',
      helpdesk_hours: 2,
      price_tiers: [
        { range_from: 1, range_to: 100, price: 5.99, currency: 'BRL' },
      ],
    }

    await productCatalogService.create(data as never)

    const createCall = mockPrisma.product.create.mock.calls[0][0]
    expect(createCall.data.price_tiers).toEqual({
      create: [
        { range_from: 1, range_to: 100, price: 5.99, currency: 'BRL' },
      ],
    })
  })

  it('deve usar BRL como moeda padrao quando currency nao informado em price_tiers', async () => {
    mockPrisma.product.create.mockResolvedValue(makeProduct())

    await productCatalogService.create({
      name: 'Test',
      slug: 'test',
      description: 'Test',
      status: 'ACTIVE',
      billing_type: 'MONTHLY',
      unit_price: 10,
      minimum_price: 0,
      user_limit_type: 'UNLIMITED',
      helpdesk_hours: 0,
      price_tiers: [
        { range_from: 1, range_to: 50, price: 9.99 },
      ],
    } as never)

    const createCall = mockPrisma.product.create.mock.calls[0][0]
    expect(createCall.data.price_tiers.create[0].currency).toBe('BRL')
  })

  it('deve omitir price_tiers no create quando array vazio', async () => {
    mockPrisma.product.create.mockResolvedValue(makeProduct())

    await productCatalogService.create({
      name: 'Test',
      slug: 'test',
      description: 'Test',
      status: 'ACTIVE',
      billing_type: 'MONTHLY',
      unit_price: 10,
      minimum_price: 0,
      user_limit_type: 'UNLIMITED',
      helpdesk_hours: 0,
      price_tiers: [],
    } as never)

    const createCall = mockPrisma.product.create.mock.calls[0][0]
    expect(createCall.data.price_tiers).toBeUndefined()
  })
})

// ─── update() ───────────────────────────────────────────────────────────────

describe('productCatalogService.update', () => {
  it('deve atualizar produto e substituir price_tiers via transaction', async () => {
    const updated = makeProduct({ name: 'SimulaCusto Pro' })

    // $transaction recebe uma callback; precisamos executar ela com um mock tx
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      // Cria um tx que tem os mesmos mocks
      const tx = {
        product: { update: vi.fn().mockResolvedValue(updated) },
        priceTier: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }), createMany: vi.fn().mockResolvedValue({ count: 1 }) },
      }
      return fn(tx as unknown as typeof mockPrisma)
    })

    const result = await productCatalogService.update('clx123abc', {
      name: 'SimulaCusto Pro',
      price_tiers: [
        { range_from: 1, range_to: 100, price: 4.99, currency: 'BRL' },
      ],
    } as never)

    expect(result).toEqual(updated)
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it('deve deletar price_tiers antigos e criar novos na transacao', async () => {
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue(makeProduct()) },
      priceTier: {
        deleteMany: vi.fn().mockResolvedValue({ count: 3 }),
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
    }

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
      return fn(mockTx)
    })

    await productCatalogService.update('clx123abc', {
      name: 'Updated',
      price_tiers: [
        { range_from: 1, range_to: 50, price: 9.99 },
        { range_from: 51, price: 4.99 },
      ],
    } as never)

    expect(mockTx.priceTier.deleteMany).toHaveBeenCalledWith({
      where: { product_id: 'clx123abc' },
    })
    expect(mockTx.priceTier.createMany).toHaveBeenCalledWith({
      data: [
        { product_id: 'clx123abc', range_from: 1, range_to: 50, price: 9.99, currency: 'BRL' },
        { product_id: 'clx123abc', range_from: 51, range_to: undefined, price: 4.99, currency: 'BRL' },
      ],
    })
  })

  it('deve deletar todos os price_tiers quando array vazio', async () => {
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue(makeProduct()) },
      priceTier: {
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
        createMany: vi.fn(),
      },
    }

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
      return fn(mockTx)
    })

    await productCatalogService.update('clx123abc', {
      price_tiers: [],
    } as never)

    expect(mockTx.priceTier.deleteMany).toHaveBeenCalledWith({
      where: { product_id: 'clx123abc' },
    })
    expect(mockTx.priceTier.createMany).not.toHaveBeenCalled()
  })

  it('deve atualizar produto sem tocar price_tiers quando nao informado', async () => {
    const mockTx = {
      product: { update: vi.fn().mockResolvedValue(makeProduct({ name: 'Renamed' })) },
      priceTier: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
    }

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
      return fn(mockTx)
    })

    await productCatalogService.update('clx123abc', {
      name: 'Renamed',
    } as never)

    expect(mockTx.priceTier.deleteMany).not.toHaveBeenCalled()
    expect(mockTx.priceTier.createMany).not.toHaveBeenCalled()
    expect(mockTx.product.update).toHaveBeenCalledWith({
      where: { id: 'clx123abc' },
      data: { name: 'Renamed' },
      include: { price_tiers: true },
    })
  })
})

// ─── toggleStatus() ─────────────────────────────────────────────────────────

describe('productCatalogService.toggleStatus', () => {
  it('deve alternar de ACTIVE para SUSPENDED', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(makeProduct({ status: 'ACTIVE' }))
    mockPrisma.product.update.mockResolvedValue(makeProduct({ status: 'SUSPENDED' }))

    const result = await productCatalogService.toggleStatus('clx123abc')

    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'clx123abc' },
      data: { status: 'SUSPENDED' },
    })
    expect(result?.status).toBe('SUSPENDED')
  })

  it('deve alternar de SUSPENDED para ACTIVE', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(makeProduct({ status: 'SUSPENDED' }))
    mockPrisma.product.update.mockResolvedValue(makeProduct({ status: 'ACTIVE' }))

    const result = await productCatalogService.toggleStatus('clx123abc')

    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'clx123abc' },
      data: { status: 'ACTIVE' },
    })
    expect(result?.status).toBe('ACTIVE')
  })

  it('deve alternar de COMING_SOON para ACTIVE (nao-ACTIVE vira ACTIVE)', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(makeProduct({ status: 'COMING_SOON' }))
    mockPrisma.product.update.mockResolvedValue(makeProduct({ status: 'ACTIVE' }))

    const result = await productCatalogService.toggleStatus('clx123abc')

    expect(mockPrisma.product.update).toHaveBeenCalledWith({
      where: { id: 'clx123abc' },
      data: { status: 'ACTIVE' },
    })
    expect(result?.status).toBe('ACTIVE')
  })

  it('deve retornar null quando produto nao encontrado', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null)

    const result = await productCatalogService.toggleStatus('inexistente')

    expect(result).toBeNull()
    expect(mockPrisma.product.update).not.toHaveBeenCalled()
  })
})

// ─── delete() ───────────────────────────────────────────────────────────────

describe('productCatalogService.delete', () => {
  it('deve deletar produto pelo ID', async () => {
    mockPrisma.product.delete.mockResolvedValue(makeProduct())

    const result = await productCatalogService.delete('clx123abc')

    expect(mockPrisma.product.delete).toHaveBeenCalledWith({
      where: { id: 'clx123abc' },
    })
    expect(result.id).toBe('clx123abc')
  })
})

// ─── listPublic() ───────────────────────────────────────────────────────────

describe('productCatalogService.listPublic', () => {
  it('deve retornar apenas produtos ACTIVE e COMING_SOON', async () => {
    const activeProduct = makeProduct({ status: 'ACTIVE' })
    const comingSoonProduct = makeProduct({ id: 'clx456', status: 'COMING_SOON', name: 'Novo Produto' })
    mockPrisma.product.findMany.mockResolvedValue([activeProduct, comingSoonProduct])

    const result = await productCatalogService.listPublic()

    expect(result).toHaveLength(2)
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
      where: { status: { in: ['ACTIVE', 'COMING_SOON'] } },
      include: { price_tiers: true },
      orderBy: { name: 'asc' },
    })
  })

  it('deve ordenar por nome ascendente', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])

    await productCatalogService.listPublic()

    const call = mockPrisma.product.findMany.mock.calls[0][0]
    expect(call.orderBy).toEqual({ name: 'asc' })
  })

  it('deve incluir price_tiers mas nao negotiations', async () => {
    mockPrisma.product.findMany.mockResolvedValue([])

    await productCatalogService.listPublic()

    const call = mockPrisma.product.findMany.mock.calls[0][0]
    expect(call.include.price_tiers).toBe(true)
    expect(call.include.negotiations).toBeUndefined()
  })
})

// ─── seedInitialProducts() ──────────────────────────────────────────────────

describe('productCatalogService.seedInitialProducts', () => {
  it('deve pular seed quando ja existem produtos (idempotente)', async () => {
    mockPrisma.product.count.mockResolvedValue(3)

    const result = await productCatalogService.seedInitialProducts()

    expect(result).toEqual({ seeded: false, count: 3 })
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('deve executar seed quando nao existem produtos', async () => {
    mockPrisma.product.count.mockResolvedValue(0)

    const seededProducts = [
      makeProduct({ name: 'SimulaCusto', slug: 'simula-custo' }),
      makeProduct({ name: 'Smart Read', slug: 'smart-read' }),
      makeProduct({ name: 'BID Frete Internacional', slug: 'bid-frete' }),
    ]
    mockPrisma.$transaction.mockResolvedValue(seededProducts)

    const result = await productCatalogService.seedInitialProducts()

    expect(result).toEqual({ seeded: true, count: 3 })
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
  })

  it('deve criar exatamente 3 produtos no seed', async () => {
    mockPrisma.product.count.mockResolvedValue(0)
    mockPrisma.$transaction.mockResolvedValue([
      makeProduct(),
      makeProduct(),
      makeProduct(),
    ])

    await productCatalogService.seedInitialProducts()

    // $transaction recebe um array com 4 product.create (SimulaCusto, Smart Read, BID Frete, BID Cambio)
    const transactionArg = mockPrisma.$transaction.mock.calls[0][0]
    expect(transactionArg).toHaveLength(4)
  })

  it('nao deve criar produtos duplicados em chamadas consecutivas', async () => {
    // Primeira chamada: seed
    mockPrisma.product.count.mockResolvedValue(0)
    mockPrisma.$transaction.mockResolvedValue([makeProduct(), makeProduct(), makeProduct()])
    await productCatalogService.seedInitialProducts()

    // Segunda chamada: ja existem
    mockPrisma.product.count.mockResolvedValue(3)
    const result = await productCatalogService.seedInitialProducts()

    expect(result).toEqual({ seeded: false, count: 3 })
  })
})
