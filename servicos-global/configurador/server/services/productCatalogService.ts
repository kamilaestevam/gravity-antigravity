// server/services/productCatalogService.ts
// CRUD do catálogo master de produtos da plataforma Gravity.
// Gerenciado exclusivamente por gravity_admin.

import { prisma } from '../lib/prisma.js'
// Importa tipos do client gerado (output customizado) — não do @prisma/client hoisted,
// que resolve para outro schema em ambiente monorepo.
import type { Prisma } from '../../../../configurador/generated/index.js'

type PriceTierInput = {
  range_from: number
  range_to?: number
  price: number
  currency?: string
}

// ProdutoGravityCreateInput já trata price_tiers como relação aninhada — adicionamos
// uma versão "flat" do array para que as rotas aceitem JSON simples.
type ProductCreateData = Prisma.ProdutoGravityCreateInput & { price_tiers?: PriceTierInput[] }
type ProductUpdateData = Prisma.ProdutoGravityUpdateInput & { price_tiers?: PriceTierInput[] }

const ACTIVE_PRODUCT_INCLUDE = {
  price_tiers: true,
  negotiations: true,
} satisfies Prisma.ProdutoGravityInclude

export const productCatalogService = {
  /**
   * Lista todos os produtos do catálogo com paginação e filtros.
   * Ignora produtos soft-deletados.
   */
  async list(params: {
    page?: number
    limit?: number
    search?: string
    status?: string
  }) {
    const page = params.page ?? 1
    const limit = params.limit ?? 50
    const skip = (page - 1) * limit

    const where: Prisma.ProdutoGravityWhereInput = { deleted_at: null }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    if (params.status) {
      where.status = params.status as Prisma.EnumStatusProdutoFilter
    }

    const [products, total] = await Promise.all([
      prisma.produtoGravity.findMany({
        where,
        skip,
        take: limit,
        include: ACTIVE_PRODUCT_INCLUDE,
        orderBy: { created_at: 'desc' },
      }),
      prisma.produtoGravity.count({ where }),
    ])

    return {
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  },

  /**
   * Retorna um Set com todos os slugs/backend_modules já em uso
   * (payload enxuto — apenas duas colunas).
   */
  async listUsedSlugs(): Promise<Set<string>> {
    const rows = await prisma.produtoGravity.findMany({
      where: { deleted_at: null },
      select: { slug: true, backend_module: true },
    })
    const used = new Set<string>()
    for (const row of rows) {
      if (row.backend_module) used.add(row.backend_module)
      used.add(row.slug)
    }
    return used
  },

  /**
   * Busca um produto pelo ID (inclui soft-deleted por padrão para permitir
   * auditoria histórica — o chamador filtra se não quiser).
   */
  async getById(id: string) {
    return prisma.produtoGravity.findUnique({
      where: { id },
      include: ACTIVE_PRODUCT_INCLUDE,
    })
  },

  /**
   * Busca um produto pelo slug — ignora soft-deletados.
   */
  async getBySlug(slug: string) {
    return prisma.produtoGravity.findFirst({
      where: { slug, deleted_at: null },
      include: { price_tiers: true },
    })
  },

  /**
   * Cria um novo produto no catálogo.
   */
  async create(data: ProductCreateData) {
    const { price_tiers, ...productData } = data

    return prisma.produtoGravity.create({
      data: {
        ...productData,
        price_tiers: price_tiers?.length
          ? {
              create: price_tiers.map(tier => ({
                range_from: tier.range_from,
                range_to: tier.range_to,
                price: tier.price,
                currency: tier.currency ?? 'BRL',
              })),
            }
          : undefined,
      },
      include: { price_tiers: true },
    })
  },

  /**
   * Atualiza um produto existente.
   */
  async update(id: string, data: ProductUpdateData) {
    const { price_tiers, ...productData } = data

    return prisma.$transaction(async (tx) => {
      if (price_tiers !== undefined) {
        await tx.faixaPreco.deleteMany({ where: { product_id: id } })
        if (price_tiers.length > 0) {
          await tx.faixaPreco.createMany({
            data: price_tiers.map(tier => ({
              product_id: id,
              range_from: tier.range_from,
              range_to: tier.range_to,
              price: tier.price,
              currency: tier.currency ?? 'BRL',
            })),
          })
        }
      }

      return tx.produtoGravity.update({
        where: { id },
        data: productData,
        include: { price_tiers: true },
      })
    })
  },

  /**
   * Alterna status Ativo/Suspenso de um produto.
   */
  async toggleStatus(id: string) {
    const product = await prisma.produtoGravity.findUnique({ where: { id } })
    if (!product) return null

    const newStatus = product.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    return prisma.produtoGravity.update({
      where: { id },
      data: { status: newStatus },
    })
  },

  /**
   * Conta negociações ativas (is_unlimited OU ends_at futuro) para um produto.
   */
  async countActiveNegotiations(productId: string): Promise<number> {
    const now = new Date()
    return prisma.negociacaoEspecial.count({
      where: {
        product_id: productId,
        OR: [
          { is_unlimited: true },
          { ends_at: { gte: now } },
          { ends_at: null },
        ],
      },
    })
  },

  /**
   * Soft-delete — marca deleted_at. Preserva PriceTiers e SpecialNegotiations.
   */
  async softDelete(id: string) {
    return prisma.produtoGravity.update({
      where: { id },
      data: { deleted_at: new Date() },
    })
  },

  /**
   * Hard-delete — remove do banco. Cascade apaga PriceTiers e SpecialNegotiations.
   * Use com cautela — preferir softDelete.
   */
  async hardDelete(id: string) {
    return prisma.produtoGravity.delete({ where: { id } })
  },

  /**
   * Lista produtos ativos para exibição pública (Store/Marketplace).
   */
  async listPublic() {
    return prisma.produtoGravity.findMany({
      where: {
        status: { in: ['ACTIVE', 'COMING_SOON'] },
        deleted_at: null,
      },
      include: { price_tiers: true },
      orderBy: { name: 'asc' },
    })
  },

  /**
   * Seed dos produtos iniciais (idempotente — verifica se já existem).
   * Invocado apenas por CLI — nunca exposto via HTTP.
   */
  async seedInitialProducts() {
    const count = await prisma.produtoGravity.count()
    if (count > 0) {
      await this.ensureMissingProducts()
      return { seeded: false, count }
    }

    await prisma.$transaction([
      prisma.produtoGravity.create({ data: seedProducts[0] }),
      prisma.produtoGravity.create({ data: seedProducts[1] }),
      prisma.produtoGravity.create({ data: seedProducts[2] }),
      prisma.produtoGravity.create({ data: seedProducts[3] }),
      prisma.produtoGravity.create({ data: seedProducts[4] }),
    ])

    return { seeded: true, count: seedProducts.length }
  },

  /**
   * Garante que produtos canônicos existam no banco. Usado pelo CLI de seed.
   */
  async ensureMissingProducts() {
    const expectedSlugs = seedProducts.map(p => p.slug)

    let created = 0
    let updated = 0
    for (const product of seedProducts) {
      const existing = await prisma.produtoGravity.findFirst({ where: { slug: product.slug } })
      if (!existing) {
        await prisma.produtoGravity.create({ data: product })
        created++
      } else if (existing.name !== product.name) {
        await prisma.produtoGravity.update({ where: { id: existing.id }, data: { name: product.name } })
        updated++
      }
    }

    const toRemove = await prisma.produtoGravity.findMany({
      where: { slug: { notIn: expectedSlugs } },
      select: { id: true },
    })
    for (const p of toRemove) {
      await prisma.produtoGravity.delete({ where: { id: p.id } })
    }

    return { created, updated, removed: toRemove.length }
  },

  /**
   * Ativa produtos para um tenant específico (idempotente).
   * Usado no seed inicial via CLI.
   */
  async activateProductsForTenant(tenantId: string, productKeys: string[]) {
    const results = await Promise.all(
      productKeys.map(key =>
        prisma.configuracaoProduto.upsert({
          where: { tenant_id_product_key: { tenant_id: tenantId, product_key: key } },
          create: { tenant_id: tenantId, product_key: key, config: {}, is_active: true },
          update: { is_active: true },
        }),
      ),
    )
    return { activated: results.length, tenant_id: tenantId, products: productKeys }
  },
}

// ─── Catálogo canônico ───────────────────────────────────────────────────────

const seedProducts: Prisma.ProdutoGravityUncheckedCreateInput[] = [
  {
    name: 'Simula Custo',
    slug: 'simula-custo',
    description: 'Gestão de custos estimados de exportação e importação',
    status: 'ACTIVE',
    billing_type: 'PER_ESTIMATE',
    unit_price: 10.99,
    minimum_price: 0,
    user_limit_type: 'LIMITED',
    base_users_qty: 10,
    backend_module: 'simula-custo',
    target_audience: 'Importadores, exportadores e despachantes aduaneiros',
  },
  {
    name: 'Bid Frete',
    slug: 'bid-frete',
    description: 'Licitação inteligente de fretes internacionais com análise de fornecedores, ranking automático e cálculo de savings',
    status: 'ACTIVE',
    billing_type: 'PER_PROCESS',
    has_setup: true,
    unit_price: 1.99,
    minimum_price: 199,
    user_limit_type: 'UNLIMITED',
    backend_module: 'bid-frete',
    target_audience: 'Importadores, exportadores e despachantes aduaneiros',
  },
  {
    name: 'Bid Cambio',
    slug: 'bid-cambio',
    description: 'Gestão e cotação de câmbio comercial para operações de COMEX — marketplace de corretoras com comparativo automático e cálculo de economia',
    status: 'ACTIVE',
    billing_type: 'PER_PROCESS',
    has_setup: false,
    unit_price: 2.99,
    minimum_price: 199,
    user_limit_type: 'UNLIMITED',
    backend_module: 'bid-cambio',
    target_audience: 'Importadores, exportadores, tradings, agentes de carga e despachantes aduaneiros',
  },
  {
    name: 'Pedido',
    slug: 'pedido',
    description: 'Gestão de pedidos de importação e exportação com controle de saldo, etapas e rastreabilidade',
    status: 'ACTIVE',
    billing_type: 'PER_PROCESS',
    has_setup: false,
    unit_price: 1.99,
    minimum_price: 0,
    user_limit_type: 'UNLIMITED',
    backend_module: 'pedido',
    target_audience: 'Importadores, exportadores e despachantes aduaneiros',
  },
  {
    name: 'NF Import',
    slug: 'nf-importacao',
    description: 'Gestão completa de notas fiscais de importação com DI, rateio de despesas e exportação contábil',
    status: 'ACTIVE',
    billing_type: 'PER_PROCESS',
    has_setup: false,
    unit_price: 1.99,
    minimum_price: 0,
    user_limit_type: 'UNLIMITED',
    backend_module: 'nf-importacao',
    target_audience: 'Importadores, despachantes aduaneiros e contadores',
  },
]
