// server/services/productCatalogService.ts
// CRUD do catálogo master de produtos da plataforma Gravity.
// Gerenciado exclusivamente por gravity_admin.

import { prisma } from '../lib/prisma.js'
import type { Prisma } from '@prisma/client'

export const productCatalogService = {
  /**
   * Lista todos os produtos do catálogo com paginação e filtros
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

    const where: Prisma.ProductWhereInput = {}

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    if (params.status) {
      where.status = params.status as Prisma.EnumProductStatusFilter
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { price_tiers: true, negotiations: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return {
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  },

  /**
   * Busca um produto pelo ID
   */
  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { price_tiers: true, negotiations: true },
    })
  },

  /**
   * Busca um produto pelo slug
   */
  async getBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: { price_tiers: true },
    })
  },

  /**
   * Cria um novo produto no catálogo
   */
  async create(data: Prisma.ProductCreateInput & { price_tiers?: Array<{
    range_from: number
    range_to?: number
    price: number
    currency?: string
  }> }) {
    const { price_tiers, ...productData } = data

    return prisma.product.create({
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
   * Atualiza um produto existente
   */
  async update(
    id: string,
    data: Prisma.ProductUpdateInput & { price_tiers?: Array<{
      range_from: number
      range_to?: number
      price: number
      currency?: string
    }> }
  ) {
    const { price_tiers, ...productData } = data

    return prisma.$transaction(async (tx) => {
      if (price_tiers !== undefined) {
        await tx.priceTier.deleteMany({ where: { product_id: id } })
        if (price_tiers.length > 0) {
          await tx.priceTier.createMany({
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

      return tx.product.update({
        where: { id },
        data: productData,
        include: { price_tiers: true },
      })
    })
  },

  /**
   * Alterna status Ativo/Suspenso de um produto
   */
  async toggleStatus(id: string) {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return null

    const newStatus = product.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    return prisma.product.update({
      where: { id },
      data: { status: newStatus },
    })
  },

  /**
   * Remove um produto do catálogo (cascade deleta tiers e negociações)
   */
  async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  },

  /**
   * Lista produtos ativos para exibição pública (Store/Marketplace)
   */
  async listPublic() {
    return prisma.product.findMany({
      where: { status: { in: ['ACTIVE', 'COMING_SOON'] } },
      include: { price_tiers: true },
      orderBy: { name: 'asc' },
    })
  },

  /**
   * Seed dos produtos iniciais (idempotente — verifica se já existem)
   */
  async seedInitialProducts() {
    const count = await prisma.product.count()
    if (count > 0) {
      // Verificar se novos produtos precisam ser adicionados (upsert)
      await this.ensureMissingProducts()
      return { seeded: false, count }
    }

    const products = await prisma.$transaction([
      prisma.product.create({
        data: {
          name: 'SimulaCusto',
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
      }),
      prisma.product.create({
        data: {
          name: 'Smart Read',
          slug: 'smart-read',
          description: 'Leitura inteligente de documentos via OCR e IA',
          status: 'ACTIVE',
          billing_type: 'PER_DOCUMENT',
          unit_price: 5.99,
          minimum_price: 0,
          user_limit_type: 'UNLIMITED',
          backend_module: 'smart-read',
          target_audience: 'Logística, Financeiro e Aduaneiro',
          price_tiers: {
            create: [
              { range_from: 10, range_to: 100, price: 5.99 },
              { range_from: 100, range_to: 500, price: 2.99 },
              { range_from: 500, price: 1.99 },
            ],
          },
        },
      }),
      prisma.product.create({
        data: {
          name: 'BID Frete Internacional',
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
      }),
      prisma.product.create({
        data: {
          name: 'BID Cambio',
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
      }),
      prisma.product.create({
        data: {
          name: 'LPCO',
          slug: 'lpco',
          description: 'Gestão de Licenças, Permissões, Certificados e Outros Documentos do Portal Único Siscomex — acompanhamento do ciclo de vida, resposta a exigências, controle de saldo Flex e integração bidirecional com o Portal Único',
          status: 'ACTIVE',
          billing_type: 'PER_PROCESS',
          has_setup: false,
          unit_price: 0.99,
          minimum_price: 0,
          user_limit_type: 'UNLIMITED',
          backend_module: 'lpco',
          target_audience: 'Importadores, exportadores e despachantes aduaneiros',
        },
      }),
    ])

    return { seeded: true, count: products.length }
  },

  /**
   * Garante que produtos novos do seed sejam criados no banco existente.
   * Roda como upsert — cria apenas os que não existem.
   */
  async ensureMissingProducts() {
    const newProducts = [
      {
        name: 'LPCO',
        slug: 'lpco',
        description: 'Gestão de Licenças, Permissões, Certificados e Outros Documentos do Portal Único Siscomex — acompanhamento do ciclo de vida, resposta a exigências, controle de saldo Flex e integração bidirecional com o Portal Único',
        status: 'ACTIVE',
        billing_type: 'PER_PROCESS',
        has_setup: false,
        unit_price: 0.99,
        minimum_price: 0,
        user_limit_type: 'UNLIMITED',
        backend_module: 'lpco',
        target_audience: 'Importadores, exportadores e despachantes aduaneiros',
      },
    ]

    let created = 0
    for (const product of newProducts) {
      const existing = await prisma.product.findFirst({ where: { slug: product.slug } })
      if (!existing) {
        await prisma.product.create({ data: product })
        created++
        console.log(`[seed] Produto '${product.name}' (${product.slug}) criado`)
      }
    }
    if (created > 0) console.log(`[seed] ${created} novo(s) produto(s) adicionado(s)`)
  },

  /**
   * Ativa produtos para um tenant especifico (idempotente)
   * Usado no seed inicial para habilitar produtos demo
   */
  async activateProductsForTenant(tenantId: string, productKeys: string[]) {
    const results = await Promise.all(
      productKeys.map(key =>
        prisma.productConfig.upsert({
          where: { tenant_id_product_key: { tenant_id: tenantId, product_key: key } },
          create: { tenant_id: tenantId, product_key: key, config: {}, is_active: true },
          update: { is_active: true },
        })
      )
    )
    return { activated: results.length, tenant_id: tenantId, products: productKeys }
  },
}
