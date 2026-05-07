// server/services/produto-gravity-catalogo-service.ts
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

// Inputs aceitos pelas rotas — contrato legado (snake_case curto), traduzido
// internamente para os nomes Prisma DDD (suffix _produto_gravity).
type ProductCreateData = {
  name: string
  slug: string
  description: string
  status?: Prisma.ProdutoGravityCreateInput['status_produto_gravity']
  launch_date?: Date | string | null
  has_setup?: boolean
  setup_price?: number | null
  setup_currency?: string
  billing_type?: Prisma.ProdutoGravityCreateInput['tipo_cobranca_produto_gravity']
  unit_price: number
  unit_currency?: string
  minimum_price?: number
  minimum_currency?: string
  total_price?: number | null
  total_currency?: string
  user_limit_type?: Prisma.ProdutoGravityCreateInput['tipo_limite_usuario_produto_gravity']
  base_users_qty?: number | null
  extra_user_price?: number | null
  extra_user_currency?: string
  helpdesk_hours?: number
  extra_hour_price?: number | null
  extra_hour_currency?: string
  gabi_quota_mensal?: number
  backend_module?: string | null
  target_audience?: string | null
  price_tiers?: PriceTierInput[]
}
type ProductUpdateData = Partial<ProductCreateData>

const ACTIVE_PRODUCT_INCLUDE = {
  faixas_preco_produto_gravity: true,
  negociacoes_especiais: true,
} satisfies Prisma.ProdutoGravityInclude

// DTO: traduz contrato legado público → fields Prisma renomeados (Option C ACL)
function toProductPrismaInput(input: ProductCreateData): Prisma.ProdutoGravityUncheckedCreateInput {
  return {
    nome_produto_gravity: input.name,
    slug_produto_gravity: input.slug,
    descricao_produto_gravity: input.description,
    status_produto_gravity: input.status,
    data_lancamento_produto_gravity: input.launch_date ?? undefined,
    possui_setup_produto_gravity: input.has_setup,
    preco_setup_produto_gravity: input.setup_price ?? undefined,
    moeda_setup_produto_gravity: input.setup_currency,
    tipo_cobranca_produto_gravity: input.billing_type,
    preco_unitario_produto_gravity: input.unit_price,
    moeda_unitario_produto_gravity: input.unit_currency,
    preco_minimo_produto_gravity: input.minimum_price,
    moeda_minimo_produto_gravity: input.minimum_currency,
    preco_total_produto_gravity: input.total_price ?? undefined,
    moeda_total_produto_gravity: input.total_currency,
    tipo_limite_usuario_produto_gravity: input.user_limit_type,
    qtd_usuarios_base_produto_gravity: input.base_users_qty ?? undefined,
    preco_usuario_extra_produto_gravity: input.extra_user_price ?? undefined,
    moeda_usuario_extra_produto_gravity: input.extra_user_currency,
    horas_helpdesk_produto_gravity: input.helpdesk_hours,
    preco_hora_extra_produto_gravity: input.extra_hour_price ?? undefined,
    moeda_hora_extra_produto_gravity: input.extra_hour_currency,
    quota_gabi_mensal_produto_gravity: input.gabi_quota_mensal,
    modulo_backend_produto_gravity: input.backend_module ?? undefined,
    publico_alvo_produto_gravity: input.target_audience ?? undefined,
  }
}

function toProductUpdateInput(input: ProductUpdateData): Prisma.ProdutoGravityUpdateInput {
  const out: Prisma.ProdutoGravityUpdateInput = {}
  if (input.name !== undefined) out.nome_produto_gravity = input.name
  if (input.slug !== undefined) out.slug_produto_gravity = input.slug
  if (input.description !== undefined) out.descricao_produto_gravity = input.description
  if (input.status !== undefined) out.status_produto_gravity = input.status
  if (input.launch_date !== undefined) out.data_lancamento_produto_gravity = input.launch_date
  if (input.has_setup !== undefined) out.possui_setup_produto_gravity = input.has_setup
  if (input.setup_price !== undefined) out.preco_setup_produto_gravity = input.setup_price
  if (input.setup_currency !== undefined) out.moeda_setup_produto_gravity = input.setup_currency
  if (input.billing_type !== undefined) out.tipo_cobranca_produto_gravity = input.billing_type
  if (input.unit_price !== undefined) out.preco_unitario_produto_gravity = input.unit_price
  if (input.unit_currency !== undefined) out.moeda_unitario_produto_gravity = input.unit_currency
  if (input.minimum_price !== undefined) out.preco_minimo_produto_gravity = input.minimum_price
  if (input.minimum_currency !== undefined) out.moeda_minimo_produto_gravity = input.minimum_currency
  if (input.total_price !== undefined) out.preco_total_produto_gravity = input.total_price
  if (input.total_currency !== undefined) out.moeda_total_produto_gravity = input.total_currency
  if (input.user_limit_type !== undefined) out.tipo_limite_usuario_produto_gravity = input.user_limit_type
  if (input.base_users_qty !== undefined) out.qtd_usuarios_base_produto_gravity = input.base_users_qty
  if (input.extra_user_price !== undefined) out.preco_usuario_extra_produto_gravity = input.extra_user_price
  if (input.extra_user_currency !== undefined) out.moeda_usuario_extra_produto_gravity = input.extra_user_currency
  if (input.helpdesk_hours !== undefined) out.horas_helpdesk_produto_gravity = input.helpdesk_hours
  if (input.extra_hour_price !== undefined) out.preco_hora_extra_produto_gravity = input.extra_hour_price
  if (input.extra_hour_currency !== undefined) out.moeda_hora_extra_produto_gravity = input.extra_hour_currency
  if (input.gabi_quota_mensal !== undefined) out.quota_gabi_mensal_produto_gravity = input.gabi_quota_mensal
  if (input.backend_module !== undefined) out.modulo_backend_produto_gravity = input.backend_module
  if (input.target_audience !== undefined) out.publico_alvo_produto_gravity = input.target_audience
  return out
}

// DTO de saída: row Prisma → contrato legado (id, name, slug, etc.)
type ProductRow = {
  id_produto_gravity: string
  nome_produto_gravity: string
  slug_produto_gravity: string
  descricao_produto_gravity: string
  status_produto_gravity: string
  data_lancamento_produto_gravity: Date | null
  possui_setup_produto_gravity: boolean
  preco_setup_produto_gravity: unknown
  moeda_setup_produto_gravity: string
  tipo_cobranca_produto_gravity: string
  preco_unitario_produto_gravity: unknown
  moeda_unitario_produto_gravity: string
  preco_minimo_produto_gravity: unknown
  moeda_minimo_produto_gravity: string
  preco_total_produto_gravity: unknown
  moeda_total_produto_gravity: string
  tipo_limite_usuario_produto_gravity: string
  qtd_usuarios_base_produto_gravity: number | null
  preco_usuario_extra_produto_gravity: unknown
  moeda_usuario_extra_produto_gravity: string
  horas_helpdesk_produto_gravity: number
  preco_hora_extra_produto_gravity: unknown
  moeda_hora_extra_produto_gravity: string
  quota_gabi_mensal_produto_gravity: number
  modulo_backend_produto_gravity: string | null
  publico_alvo_produto_gravity: string | null
  data_criacao_produto_gravity: Date
  data_atualizacao_produto_gravity: Date
  data_remocao_produto_gravity: Date | null
  faixas_preco_produto_gravity?: Array<{
    id_faixa_preco_produto_gravity: string
    id_produto_gravity_faixa_preco: string
    faixa_de_faixa_preco_produto_gravity: number
    faixa_ate_faixa_preco_produto_gravity: number | null
    preco_faixa_preco_produto_gravity: unknown
    moeda_faixa_preco_produto_gravity: string
    data_criacao_faixa_preco_produto_gravity: Date
  }>
  negociacoes_especiais?: Array<{
    id_negociacao_especial: string
    id_produto_gravity: string
    id_organizacao: string
    nome_organizacao_negociacao_especial: string
    acordo_negociacao_especial: string
    valor_unitario_negociacao_especial: unknown // Decimal | null (Prisma)
    moeda_negociacao_especial: string
    data_inicio_negociacao_especial: Date | null
    data_fim_negociacao_especial: Date | null
    ilimitado_prazo_negociacao_especial: boolean
    data_criacao_negociacao_especial: Date
    data_atualizacao_negociacao_especial: Date
  }>
}

export function toProductDto(row: ProductRow) {
  return {
    id: row.id_produto_gravity,
    name: row.nome_produto_gravity,
    slug: row.slug_produto_gravity,
    description: row.descricao_produto_gravity,
    status: row.status_produto_gravity,
    launch_date: row.data_lancamento_produto_gravity,
    has_setup: row.possui_setup_produto_gravity,
    setup_price: row.preco_setup_produto_gravity,
    setup_currency: row.moeda_setup_produto_gravity,
    billing_type: row.tipo_cobranca_produto_gravity,
    unit_price: row.preco_unitario_produto_gravity,
    unit_currency: row.moeda_unitario_produto_gravity,
    minimum_price: row.preco_minimo_produto_gravity,
    minimum_currency: row.moeda_minimo_produto_gravity,
    total_price: row.preco_total_produto_gravity,
    total_currency: row.moeda_total_produto_gravity,
    user_limit_type: row.tipo_limite_usuario_produto_gravity,
    base_users_qty: row.qtd_usuarios_base_produto_gravity,
    extra_user_price: row.preco_usuario_extra_produto_gravity,
    extra_user_currency: row.moeda_usuario_extra_produto_gravity,
    helpdesk_hours: row.horas_helpdesk_produto_gravity,
    extra_hour_price: row.preco_hora_extra_produto_gravity,
    extra_hour_currency: row.moeda_hora_extra_produto_gravity,
    gabi_quota_mensal: row.quota_gabi_mensal_produto_gravity,
    backend_module: row.modulo_backend_produto_gravity,
    target_audience: row.publico_alvo_produto_gravity,
    created_at: row.data_criacao_produto_gravity,
    updated_at: row.data_atualizacao_produto_gravity,
    deleted_at: row.data_remocao_produto_gravity,
    price_tiers: row.faixas_preco_produto_gravity?.map((t) => ({
      id: t.id_faixa_preco_produto_gravity,
      product_id: t.id_produto_gravity_faixa_preco,
      range_from: t.faixa_de_faixa_preco_produto_gravity,
      range_to: t.faixa_ate_faixa_preco_produto_gravity,
      price: t.preco_faixa_preco_produto_gravity,
      currency: t.moeda_faixa_preco_produto_gravity,
      created_at: t.data_criacao_faixa_preco_produto_gravity,
    })),
    negotiations: row.negociacoes_especiais?.map((n) => ({
      id_negociacao_especial:               n.id_negociacao_especial,
      id_produto_gravity:                   n.id_produto_gravity,
      id_organizacao:                       n.id_organizacao,
      nome_organizacao_negociacao_especial: n.nome_organizacao_negociacao_especial,
      acordo_negociacao_especial:           n.acordo_negociacao_especial,
      valor_unitario_negociacao_especial:   n.valor_unitario_negociacao_especial?.toString() ?? null,
      moeda_negociacao_especial:            n.moeda_negociacao_especial,
      data_inicio_negociacao_especial:      n.data_inicio_negociacao_especial,
      data_fim_negociacao_especial:         n.data_fim_negociacao_especial,
      ilimitado_prazo_negociacao_especial:  n.ilimitado_prazo_negociacao_especial,
      data_criacao_negociacao_especial:     n.data_criacao_negociacao_especial,
      data_atualizacao_negociacao_especial: n.data_atualizacao_negociacao_especial,
    })),
  }
}

export const produtoGravityCatalogoServico = {
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

    const where: Prisma.ProdutoGravityWhereInput = { data_remocao_produto_gravity: null }

    if (params.search) {
      where.OR = [
        { nome_produto_gravity: { contains: params.search, mode: 'insensitive' } },
        { slug_produto_gravity: { contains: params.search, mode: 'insensitive' } },
        { descricao_produto_gravity: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    if (params.status) {
      where.status_produto_gravity = params.status as Prisma.EnumStatusProdutoGravityFilter
    }

    const [rows, total] = await Promise.all([
      prisma.produtoGravity.findMany({
        where,
        skip,
        take: limit,
        include: ACTIVE_PRODUCT_INCLUDE,
        orderBy: { data_criacao_produto_gravity: 'desc' },
      }),
      prisma.produtoGravity.count({ where }),
    ])

    return {
      products: rows.map(toProductDto),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  },

  /**
   * Retorna um Set com todos os slugs/backend_modules já em uso
   * (payload enxuto — apenas duas colunas).
   */
  async listUsedSlugs(): Promise<Set<string>> {
    const rows = await prisma.produtoGravity.findMany({
      where: { data_remocao_produto_gravity: null },
      select: { slug_produto_gravity: true, modulo_backend_produto_gravity: true },
    })
    const used = new Set<string>()
    for (const row of rows) {
      if (row.modulo_backend_produto_gravity) used.add(row.modulo_backend_produto_gravity)
      used.add(row.slug_produto_gravity)
    }
    return used
  },

  /**
   * Busca um produto pelo ID (inclui soft-deleted por padrão para permitir
   * auditoria histórica — o chamador filtra se não quiser).
   */
  async getById(id: string) {
    const row = await prisma.produtoGravity.findUnique({
      where: { id_produto_gravity: id },
      include: ACTIVE_PRODUCT_INCLUDE,
    })
    return row ? toProductDto(row) : null
  },

  /**
   * Busca um produto pelo slug — ignora soft-deletados.
   */
  async getBySlug(slug: string) {
    const row = await prisma.produtoGravity.findFirst({
      where: { slug_produto_gravity: slug, data_remocao_produto_gravity: null },
      include: { faixas_preco_produto_gravity: true },
    })
    return row ? toProductDto(row) : null
  },

  /**
   * Cria um novo produto no catálogo.
   */
  async create(data: ProductCreateData) {
    const { price_tiers, ...productData } = data
    const prismaInput = toProductPrismaInput(productData)

    const row = await prisma.produtoGravity.create({
      data: {
        ...prismaInput,
        faixas_preco_produto_gravity: price_tiers?.length
          ? {
              create: price_tiers.map(tier => ({
                faixa_de_faixa_preco_produto_gravity: tier.range_from,
                faixa_ate_faixa_preco_produto_gravity: tier.range_to,
                preco_faixa_preco_produto_gravity: tier.price,
                moeda_faixa_preco_produto_gravity: tier.currency ?? 'BRL',
              })),
            }
          : undefined,
      },
      include: ACTIVE_PRODUCT_INCLUDE,
    })
    return toProductDto(row)
  },

  /**
   * Atualiza um produto existente.
   */
  async update(id: string, data: ProductUpdateData) {
    const { price_tiers, ...productData } = data

    const row = await prisma.$transaction(async (tx) => {
      if (price_tiers !== undefined) {
        await tx.produtoGravityFaixaPreco.deleteMany({ where: { id_produto_gravity_faixa_preco: id } })
        if (price_tiers.length > 0) {
          await tx.produtoGravityFaixaPreco.createMany({
            data: price_tiers.map(tier => ({
              id_produto_gravity_faixa_preco: id,
              faixa_de_faixa_preco_produto_gravity: tier.range_from,
              faixa_ate_faixa_preco_produto_gravity: tier.range_to,
              preco_faixa_preco_produto_gravity: tier.price,
              moeda_faixa_preco_produto_gravity: tier.currency ?? 'BRL',
            })),
          })
        }
      }

      return tx.produtoGravity.update({
        where: { id_produto_gravity: id },
        data: toProductUpdateInput(productData),
        include: ACTIVE_PRODUCT_INCLUDE,
      })
    })
    return toProductDto(row)
  },

  /**
   * Alterna status Ativo/Suspenso de um produto.
   *
   * Regra de domínio (decisão dono 2026-05-04):
   *   ATIVO -> SUSPENSO  : cascata em assinatura_produto_gravity das organizações:
   *                        toda assinatura ATIVA ou EM_TESTE vira SUSPENSA.
   *                        Inativas (CANCELADA) ficam intactas.
   *   SUSPENSO -> ATIVO  : cascata reversa — toda assinatura SUSPENSA volta a ATIVA.
   *                        EM_TESTE e CANCELADA não são tocadas.
   */
  async toggleStatus(id: string) {
    const product = await prisma.produtoGravity.findUnique({ where: { id_produto_gravity: id } })
    if (!product) return null

    const newStatus = product.status_produto_gravity === 'ATIVO' ? 'SUSPENSO' : 'ATIVO'

    const row = await prisma.$transaction(async (tx) => {
      const updated = await tx.produtoGravity.update({
        where: { id_produto_gravity: id },
        data: { status_produto_gravity: newStatus },
        include: ACTIVE_PRODUCT_INCLUDE,
      })

      if (newStatus === 'SUSPENSO') {
        // Suspende todas as assinaturas em uso desse produto
        await tx.produtoGravityAssinatura.updateMany({
          where: {
            id_produto_gravity: id,
            status_assinatura_produto_gravity: { in: ['ATIVA', 'EM_TESTE'] },
          },
          data: { status_assinatura_produto_gravity: 'SUSPENSA' },
        })
      } else {
        // Reativa só o que foi suspenso pela cascata anterior
        await tx.produtoGravityAssinatura.updateMany({
          where: {
            id_produto_gravity: id,
            status_assinatura_produto_gravity: 'SUSPENSA',
          },
          data: { status_assinatura_produto_gravity: 'ATIVA' },
        })
      }

      return updated
    })

    return toProductDto(row)
  },

  /**
   * Conta negociações ativas (is_unlimited OU ends_at futuro) para um produto.
   */
  async countActiveNegotiations(id_produto: string): Promise<number> {
    const now = new Date()
    return prisma.produtoGravityNegociacaoEspecial.count({
      where: {
        id_produto_gravity: id_produto,
        OR: [
          { ilimitado_prazo_negociacao_especial: true },
          { data_fim_negociacao_especial: { gte: now } },
          { data_fim_negociacao_especial: null },
        ],
      },
    })
  },

  /**
   * Soft-delete — marca data_remocao. Preserva PriceTiers e SpecialNegotiations.
   */
  async softDelete(id: string) {
    const row = await prisma.produtoGravity.update({
      where: { id_produto_gravity: id },
      data: { data_remocao_produto_gravity: new Date() },
      include: ACTIVE_PRODUCT_INCLUDE,
    })
    return toProductDto(row)
  },

  /**
   * Hard-delete — remove do banco. Cascade apaga PriceTiers e SpecialNegotiations.
   * Use com cautela — preferir softDelete.
   */
  async hardDelete(id: string) {
    return prisma.produtoGravity.delete({ where: { id_produto_gravity: id } })
  },

  /**
   * Lista produtos ativos para exibição pública (Store/Marketplace).
   */
  async listarPublico() {
    const rows = await prisma.produtoGravity.findMany({
      where: {
        status_produto_gravity: { in: ['ATIVO', 'EM_BREVE'] },
        data_remocao_produto_gravity: null,
      },
      include: { faixas_preco_produto_gravity: true },
      orderBy: { nome_produto_gravity: 'asc' },
    })
    return rows.map(toProductDto)
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
    const expectedSlugs = seedProducts.map(p => p.slug_produto_gravity)

    let created = 0
    let updated = 0
    for (const product of seedProducts) {
      const existing = await prisma.produtoGravity.findFirst({
        where: { slug_produto_gravity: product.slug_produto_gravity },
      })
      if (!existing) {
        await prisma.produtoGravity.create({ data: product })
        created++
      } else if (existing.nome_produto_gravity !== product.nome_produto_gravity) {
        await prisma.produtoGravity.update({
          where: { id_produto_gravity: existing.id_produto_gravity },
          data: { nome_produto_gravity: product.nome_produto_gravity },
        })
        updated++
      }
    }

    const toRemove = await prisma.produtoGravity.findMany({
      where: { slug_produto_gravity: { notIn: expectedSlugs } },
      select: { id_produto_gravity: true },
    })
    for (const p of toRemove) {
      await prisma.produtoGravity.delete({ where: { id_produto_gravity: p.id_produto_gravity } })
    }

    return { created, updated, removed: toRemove.length }
  },

  /**
   * Ativa produtos para um tenant específico (idempotente).
   * Usado no seed inicial via CLI.
   */
  async activateProductsForTenant(id_organizacao: string, productKeys: string[]) {
    const results = await Promise.all(
      productKeys.map(key =>
        prisma.produtoGravityConfiguracao.upsert({
          where: {
            id_organizacao_configuracao_produto_gravity_chave_produto_configuracao_produto_gravity: {
              id_organizacao_configuracao_produto_gravity: id_organizacao,
              chave_produto_configuracao_produto_gravity: key,
            },
          },
          create: {
            id_organizacao_configuracao_produto_gravity: id_organizacao,
            chave_produto_configuracao_produto_gravity: key,
            configuracao_config_produto_gravity: {},
            ativo_configuracao_produto_gravity: true,
          },
          update: { ativo_configuracao_produto_gravity: true },
        }),
      ),
    )
    return { activated: results.length, id_organizacao: id_organizacao, products: productKeys }
  },
}

// ─── Catálogo canônico ───────────────────────────────────────────────────────

const seedProducts: Prisma.ProdutoGravityUncheckedCreateInput[] = [
  {
    nome_produto_gravity: 'Simula Custo',
    slug_produto_gravity: 'simula-custo',
    descricao_produto_gravity: 'Gestão de custos estimados de exportação e importação',
    status_produto_gravity: 'ATIVO',
    tipo_cobranca_produto_gravity: 'POR_ESTIMATIVA',
    preco_unitario_produto_gravity: 10.99,
    preco_minimo_produto_gravity: 0,
    tipo_limite_usuario_produto_gravity: 'LIMITADO',
    qtd_usuarios_base_produto_gravity: 10,
    modulo_backend_produto_gravity: 'simula-custo',
    publico_alvo_produto_gravity: 'Importadores, exportadores e despachantes aduaneiros',
  },
  {
    nome_produto_gravity: 'Bid Frete',
    slug_produto_gravity: 'bid-frete',
    descricao_produto_gravity: 'Licitação inteligente de fretes internacionais com análise de fornecedores, ranking automático e cálculo de savings',
    status_produto_gravity: 'ATIVO',
    tipo_cobranca_produto_gravity: 'POR_PROCESSO',
    possui_setup_produto_gravity: true,
    preco_unitario_produto_gravity: 1.99,
    preco_minimo_produto_gravity: 199,
    tipo_limite_usuario_produto_gravity: 'ILIMITADO',
    modulo_backend_produto_gravity: 'bid-frete',
    publico_alvo_produto_gravity: 'Importadores, exportadores e despachantes aduaneiros',
  },
  {
    nome_produto_gravity: 'Bid Cambio',
    slug_produto_gravity: 'bid-cambio',
    descricao_produto_gravity: 'Gestão e cotação de câmbio comercial para operações de COMEX — marketplace de corretoras com comparativo automático e cálculo de economia',
    status_produto_gravity: 'ATIVO',
    tipo_cobranca_produto_gravity: 'POR_PROCESSO',
    possui_setup_produto_gravity: false,
    preco_unitario_produto_gravity: 2.99,
    preco_minimo_produto_gravity: 199,
    tipo_limite_usuario_produto_gravity: 'ILIMITADO',
    modulo_backend_produto_gravity: 'bid-cambio',
    publico_alvo_produto_gravity: 'Importadores, exportadores, tradings, agentes de carga e despachantes aduaneiros',
  },
  {
    nome_produto_gravity: 'Pedido',
    slug_produto_gravity: 'pedido',
    descricao_produto_gravity: 'Gestão de pedidos de importação e exportação com controle de saldo, etapas e rastreabilidade',
    status_produto_gravity: 'ATIVO',
    tipo_cobranca_produto_gravity: 'POR_PROCESSO',
    possui_setup_produto_gravity: false,
    preco_unitario_produto_gravity: 1.99,
    preco_minimo_produto_gravity: 0,
    tipo_limite_usuario_produto_gravity: 'ILIMITADO',
    modulo_backend_produto_gravity: 'pedido',
    publico_alvo_produto_gravity: 'Importadores, exportadores e despachantes aduaneiros',
  },
  {
    nome_produto_gravity: 'NF Import',
    slug_produto_gravity: 'nf-importacao',
    descricao_produto_gravity: 'Gestão completa de notas fiscais de importação com DI, rateio de despesas e exportação contábil',
    status_produto_gravity: 'ATIVO',
    tipo_cobranca_produto_gravity: 'POR_PROCESSO',
    possui_setup_produto_gravity: false,
    preco_unitario_produto_gravity: 1.99,
    preco_minimo_produto_gravity: 0,
    tipo_limite_usuario_produto_gravity: 'ILIMITADO',
    modulo_backend_produto_gravity: 'nf-importacao',
    publico_alvo_produto_gravity: 'Importadores, despachantes aduaneiros e contadores',
  },
]
