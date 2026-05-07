// server/routes/admin-produto-gravity.ts
// CRUD do catálogo master de produtos — exclusivo para gravity_admin.
// Montado em /api/v1/admin/produtos-gravity pelo index.ts.

import { Router } from 'express'
import { z } from 'zod'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { rateLimitPresets } from '../middleware/rateLimiter.js'
import { produtoGravityCatalogoServico } from '../services/produto-gravity-catalogo-service.js'
import { negociacaoEspecialServico } from '../services/negociacao-especial-servico.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'

const log = logger.child({ module: 'admin-products' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Lê os slugs de PRODUTOS registrados em contracts.json (seção "products").
 * Usa GRAVITY_CONTRACTS_PATH como fonte primária; cai em paths tradicionais
 * como fallback para compat com dev local antigo.
 */
function getContractsSlugs(): string[] {
  const candidatePaths: string[] = []

  if (process.env.GRAVITY_CONTRACTS_PATH) {
    candidatePaths.push(process.env.GRAVITY_CONTRACTS_PATH)
  }

  candidatePaths.push(
    join(__dirname, '..', '..', '..', 'contracts.json'),
    join(process.cwd(), 'servicos-global', 'contracts.json'),
    join(process.cwd(), '..', 'contracts.json'),
  )

  for (const contractsPath of candidatePaths) {
    try {
      const raw = readFileSync(contractsPath, 'utf-8')
      const contracts = JSON.parse(raw) as { products?: string[] }
      const slugs = Array.isArray(contracts.products) ? contracts.products : []
      if (slugs.length > 0) {
        log.debug('contracts.json loaded', { path: contractsPath, slug_count: slugs.length })
        return slugs
      }
    } catch {
      // tenta o próximo path
    }
  }

  log.warn('contracts.json not found — using hardcoded fallback', { tried: candidatePaths.length })
  return ['simula-custo', 'bid-frete', 'bid-cambio', 'pedido', 'nf-importacao', 'financeiro-comex']
}

export const adminProductsRouter = Router()

// Cadeia obrigatória: auth → gravity_admin check
adminProductsRouter.use(requireAuth, requireGravityAdmin)

// Rate limit moderado para operações admin (60 req/min por IP+tenant)
const adminRateLimit = rateLimitPresets.admin()

// ─── Schemas de validação ──────────────────────────────────────────────────

const PriceTierSchema = z.object({
  range_from: z.number().int().min(0),
  range_to: z.number().int().min(1).optional(),
  price: z.number().min(0),
  currency: z.string().length(3).default('BRL'),
})

const CreateProductSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().min(3).max(500),
  status: z.enum(['ATIVO', 'SUSPENSO', 'EM_BREVE', 'LEGADO', 'INATIVO']).default('ATIVO'),
  launch_date: z.string().datetime().optional(),

  has_setup: z.boolean().default(false),
  setup_price: z.number().min(0).optional(),
  setup_currency: z.string().length(3).default('BRL'),

  billing_type: z.enum([
    'MENSAL', 'POR_PROCESSO', 'POR_DOCUMENTO', 'POR_ESTIMATIVA',
    'POR_DI_DUIMP', 'POR_DUE', 'POR_PRODUTO', 'POR_FLUXO', 'POR_LPCO',
  ]).default('MENSAL'),
  unit_price: z.number().min(0),
  unit_currency: z.string().length(3).default('BRL'),
  minimum_price: z.number().min(0).default(0),
  minimum_currency: z.string().length(3).default('BRL'),
  total_price: z.number().min(0).optional(),
  total_currency: z.string().length(3).default('BRL'),

  user_limit_type: z.enum(['ILIMITADO', 'LIMITADO']).default('ILIMITADO'),
  base_users_qty: z.number().int().min(0).optional(),
  extra_user_price: z.number().min(0).optional(),
  extra_user_currency: z.string().length(3).default('BRL'),

  helpdesk_hours: z.number().int().min(0).default(0),
  extra_hour_price: z.number().min(0).optional(),
  extra_hour_currency: z.string().length(3).default('BRL'),

  backend_module: z.string().max(50).optional(),
  target_audience: z.string().max(300).optional(),

  gabi_quota_mensal: z.number().int().min(0).default(0),

  price_tiers: z.array(PriceTierSchema).optional(),
})

const UpdateProductSchema = CreateProductSchema.partial()

// ─── Rotas ─────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/produtos-gravity/slugs-disponiveis
 * Retorna slugs de contracts.json que ainda não têm produto cadastrado.
 */
adminProductsRouter.get('/slugs-disponiveis', async (_req, res, next) => {
  try {
    const allSlugs = getContractsSlugs()
    const usedSlugs = await produtoGravityCatalogoServico.listUsedSlugs()
    const available = allSlugs.filter(slug => !usedSlugs.has(slug))
    res.json({ available, all: allSlugs })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/admin/produtos-gravity
 * Lista todos os produtos do catálogo com paginação.
 */
adminProductsRouter.get('/', async (req, res, next) => {
  try {
    const result = await produtoGravityCatalogoServico.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/admin/produtos-gravity/:id_produto_gravity
 * Detalhes de um produto específico.
 */
adminProductsRouter.get('/:id_produto_gravity', async (req, res, next) => {
  try {
    const product = await produtoGravityCatalogoServico.getById(req.params.id_produto_gravity)
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/produtos-gravity
 * Cria um novo produto no catálogo.
 * Retorna 409 se o slug já existe (não faz upsert silencioso).
 */
adminProductsRouter.post('/', adminRateLimit, async (req, res, next) => {
  try {
    const parsed = CreateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }

    // Se status ATIVO, o slug deve existir em contracts.json (tem infraestrutura)
    if (parsed.data.status === 'ATIVO') {
      const contractsSlugs = getContractsSlugs()
      const moduleSlug = parsed.data.backend_module ?? parsed.data.slug
      if (!contractsSlugs.includes(moduleSlug)) {
        throw new AppError(
          `Produto ativo requer infraestrutura. O slug "${moduleSlug}" não existe em contracts.json.`,
          400,
          'MISSING_INFRASTRUCTURE',
        )
      }
    }

    const existing = await produtoGravityCatalogoServico.getBySlug(parsed.data.slug)
    if (existing) {
      throw new AppError(
        `Já existe um produto com o slug "${parsed.data.slug}". Use PUT /api/v1/admin/produtos-gravity/:id_produto_gravity para atualizar.`,
        409,
        'SLUG_CONFLICT',
      )
    }

    const product = await produtoGravityCatalogoServico.create(parsed.data)

    log.info('product created', {
      actor_id: req.auth.clerkUserId,
      resource_id: product.id,
      action: 'CREATE',
      slug: product.slug,
    })
    res.status(201).json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/v1/admin/produtos-gravity/:id_produto_gravity
 * Atualiza um produto existente.
 */
adminProductsRouter.put('/:id_produto_gravity', adminRateLimit, async (req, res, next) => {
  try {
    const parsed = UpdateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }

    const existing = await produtoGravityCatalogoServico.getById(req.params.id_produto_gravity)
    if (!existing) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugTaken = await produtoGravityCatalogoServico.getBySlug(parsed.data.slug)
      if (slugTaken) {
        throw new AppError('Já existe um produto com este slug', 409, 'CONFLICT')
      }
    }

    const product = await produtoGravityCatalogoServico.update(req.params.id_produto_gravity, parsed.data)

    log.info('product updated', {
      actor_id: req.auth.clerkUserId,
      resource_id: product.id,
      action: 'UPDATE',
    })
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/admin/produtos-gravity/:id_produto_gravity/status
 * Alterna status Ativo/Suspenso de um produto.
 */
adminProductsRouter.patch('/:id_produto_gravity/status', adminRateLimit, async (req, res, next) => {
  try {
    const product = await produtoGravityCatalogoServico.toggleStatus(req.params.id_produto_gravity)
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    log.info('product status toggled', {
      actor_id: req.auth.clerkUserId,
      resource_id: product.id,
      action: 'TOGGLE_STATUS',
      new_status: product.status,
    })
    res.json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/admin/produtos-gravity/:id_produto_gravity
 * Soft-delete (marca deleted_at). Bloqueia se houver negociações ativas.
 * Use ?force=true + ?ack_negotiations=true para remover mesmo assim (hard delete).
 */
adminProductsRouter.delete('/:id_produto_gravity', adminRateLimit, async (req, res, next) => {
  try {
    const existing = await produtoGravityCatalogoServico.getById(req.params.id_produto_gravity)
    if (!existing) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    const negotiationCount = await produtoGravityCatalogoServico.countActiveNegotiations(req.params.id_produto_gravity)
    const force = req.query.force === 'true'
    const ack = req.query.ack_negotiations === 'true'

    if (negotiationCount > 0 && !(force && ack)) {
      throw new AppError(
        `Produto possui ${negotiationCount} negociação(ões) especial(is) ativa(s). Confirme explicitamente para remover.`,
        409,
        'HAS_ACTIVE_NEGOTIATIONS',
      )
    }

    if (force) {
      await produtoGravityCatalogoServico.hardDelete(req.params.id_produto_gravity)
    } else {
      await produtoGravityCatalogoServico.softDelete(req.params.id_produto_gravity)
    }

    log.info('product deleted', {
      actor_id: req.auth.clerkUserId,
      resource_id: req.params.id_produto_gravity,
      action: force ? 'HARD_DELETE' : 'SOFT_DELETE',
      negotiation_count: negotiationCount,
    })
    res.json({ deleted: true, id: req.params.id_produto_gravity, mode: force ? 'hard' : 'soft' })
  } catch (err) {
    next(err)
  }
})

// ─── CRUD Negociação Especial ───────────────────────────────────────────────
// Sub-recurso de produto. Mount herdado do adminProductsRouter:
//   /api/v1/admin/produtos-gravity/:id_produto_gravity/negociacao-especial
// Auth: requireAuth + requireGravityAdmin (já aplicado no router acima).

const CriarNegociacaoEspecialSchema = z.object({
  id_organizacao:                       z.string().min(1),
  nome_organizacao_negociacao_especial: z.string().min(1).max(255),
  acordo_negociacao_especial:           z.string().min(1).max(2000),
  valor_unitario_negociacao_especial:   z.union([z.string(), z.number()]).nullable().optional(),
  moeda_negociacao_especial:            z.string().length(3).optional(),
  data_inicio_negociacao_especial:      z.string().datetime().nullable().optional(),
  data_fim_negociacao_especial:         z.string().datetime().nullable().optional(),
  ilimitado_prazo_negociacao_especial:  z.boolean().optional(),
})

const AtualizarNegociacaoEspecialSchema = z.object({
  acordo_negociacao_especial:           z.string().min(1).max(2000).optional(),
  valor_unitario_negociacao_especial:   z.union([z.string(), z.number()]).nullable().optional(),
  moeda_negociacao_especial:            z.string().length(3).optional(),
  data_inicio_negociacao_especial:      z.string().datetime().nullable().optional(),
  data_fim_negociacao_especial:         z.string().datetime().nullable().optional(),
  ilimitado_prazo_negociacao_especial:  z.boolean().optional(),
})

function negociacaoToDto(n: {
  id_negociacao_especial: string
  id_produto_gravity: string
  id_organizacao: string
  nome_organizacao_negociacao_especial: string
  acordo_negociacao_especial: string
  valor_unitario_negociacao_especial: unknown
  moeda_negociacao_especial: string
  data_inicio_negociacao_especial: Date | null
  data_fim_negociacao_especial: Date | null
  ilimitado_prazo_negociacao_especial: boolean
  data_criacao_negociacao_especial: Date
  data_atualizacao_negociacao_especial: Date
}) {
  return {
    id_negociacao_especial:               n.id_negociacao_especial,
    id_produto_gravity:                   n.id_produto_gravity,
    id_organizacao:                       n.id_organizacao,
    nome_organizacao_negociacao_especial: n.nome_organizacao_negociacao_especial,
    acordo_negociacao_especial:           n.acordo_negociacao_especial,
    valor_unitario_negociacao_especial:   (n.valor_unitario_negociacao_especial as { toString(): string } | null)?.toString() ?? null,
    moeda_negociacao_especial:            n.moeda_negociacao_especial,
    data_inicio_negociacao_especial:      n.data_inicio_negociacao_especial?.toISOString() ?? null,
    data_fim_negociacao_especial:         n.data_fim_negociacao_especial?.toISOString() ?? null,
    ilimitado_prazo_negociacao_especial:  n.ilimitado_prazo_negociacao_especial,
    data_criacao_negociacao_especial:     n.data_criacao_negociacao_especial.toISOString(),
    data_atualizacao_negociacao_especial: n.data_atualizacao_negociacao_especial.toISOString(),
  }
}

/**
 * GET /api/v1/admin/produtos-gravity/:id_produto_gravity/negociacao-especial
 * Lista todas as negociações especiais do produto (todas as orgs — admin only).
 */
adminProductsRouter.get('/:id_produto_gravity/negociacao-especial', async (req, res, next) => {
  try {
    const rows = await negociacaoEspecialServico.listarNegociacoesEspeciaisPorProduto(req.params.id_produto_gravity)
    res.json({ negociacao_especial: rows.map(negociacaoToDto) })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/produtos-gravity/:id_produto_gravity/negociacao-especial
 * Cria nova negociação especial para uma organização neste produto.
 */
adminProductsRouter.post('/:id_produto_gravity/negociacao-especial', adminRateLimit, async (req, res, next) => {
  try {
    const parsed = CriarNegociacaoEspecialSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body invalido', 400, 'VALIDATION_ERROR')
    }

    const valor = parsed.data.valor_unitario_negociacao_especial
    const valor_decimal = valor === null || valor === undefined ? null : Number(valor)
    if (valor_decimal !== null && Number.isNaN(valor_decimal)) {
      throw new AppError('valor_unitario_negociacao_especial invalido (nao e numero)', 400, 'VALIDATION_ERROR')
    }

    const created = await negociacaoEspecialServico.criarNegociacaoEspecial({
      id_produto_gravity:                   req.params.id_produto_gravity,
      id_organizacao:                       parsed.data.id_organizacao,
      nome_organizacao_negociacao_especial: parsed.data.nome_organizacao_negociacao_especial,
      acordo_negociacao_especial:           parsed.data.acordo_negociacao_especial,
      valor_unitario_negociacao_especial:   valor_decimal,
      moeda_negociacao_especial:            parsed.data.moeda_negociacao_especial,
      data_inicio_negociacao_especial:      parsed.data.data_inicio_negociacao_especial ? new Date(parsed.data.data_inicio_negociacao_especial) : null,
      data_fim_negociacao_especial:         parsed.data.data_fim_negociacao_especial ? new Date(parsed.data.data_fim_negociacao_especial) : null,
      ilimitado_prazo_negociacao_especial:  parsed.data.ilimitado_prazo_negociacao_especial ?? false,
    })

    log.info('negociacao_especial created', {
      actor_id: req.auth.clerkUserId,
      id_produto_gravity: req.params.id_produto_gravity,
      id_organizacao: parsed.data.id_organizacao,
      id_negociacao_especial: created.id_negociacao_especial,
    })

    res.status(201).json({ negociacao_especial: negociacaoToDto(created) })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/v1/admin/produtos-gravity/:id_produto_gravity/negociacao-especial/:id_negociacao_especial
 * Atualiza negociacao existente. id_organizacao e imutavel.
 */
adminProductsRouter.put('/:id_produto_gravity/negociacao-especial/:id_negociacao_especial', adminRateLimit, async (req, res, next) => {
  try {
    const parsed = AtualizarNegociacaoEspecialSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Body invalido', 400, 'VALIDATION_ERROR')
    }

    const valor = parsed.data.valor_unitario_negociacao_especial
    const valor_decimal = valor === null || valor === undefined ? undefined : Number(valor)
    if (valor_decimal !== undefined && Number.isNaN(valor_decimal)) {
      throw new AppError('valor_unitario_negociacao_especial invalido (nao e numero)', 400, 'VALIDATION_ERROR')
    }

    const updated = await negociacaoEspecialServico.atualizarNegociacaoEspecial({
      id_negociacao_especial:               req.params.id_negociacao_especial,
      acordo_negociacao_especial:           parsed.data.acordo_negociacao_especial,
      valor_unitario_negociacao_especial:   valor_decimal,
      moeda_negociacao_especial:            parsed.data.moeda_negociacao_especial,
      data_inicio_negociacao_especial:      parsed.data.data_inicio_negociacao_especial !== undefined
        ? (parsed.data.data_inicio_negociacao_especial ? new Date(parsed.data.data_inicio_negociacao_especial) : null)
        : undefined,
      data_fim_negociacao_especial:         parsed.data.data_fim_negociacao_especial !== undefined
        ? (parsed.data.data_fim_negociacao_especial ? new Date(parsed.data.data_fim_negociacao_especial) : null)
        : undefined,
      ilimitado_prazo_negociacao_especial:  parsed.data.ilimitado_prazo_negociacao_especial,
    })

    log.info('negociacao_especial updated', {
      actor_id: req.auth.clerkUserId,
      id_negociacao_especial: req.params.id_negociacao_especial,
    })

    res.json({ negociacao_especial: negociacaoToDto(updated) })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/admin/produtos-gravity/:id_produto_gravity/negociacao-especial/:id_negociacao_especial
 * Hard delete da negociacao. Auditoria via AuditPlugin universal.
 */
adminProductsRouter.delete('/:id_produto_gravity/negociacao-especial/:id_negociacao_especial', adminRateLimit, async (req, res, next) => {
  try {
    await negociacaoEspecialServico.excluirNegociacaoEspecial(req.params.id_negociacao_especial)

    log.info('negociacao_especial deleted', {
      actor_id: req.auth.clerkUserId,
      id_negociacao_especial: req.params.id_negociacao_especial,
    })

    res.json({ deleted: true, id_negociacao_especial: req.params.id_negociacao_especial })
  } catch (err) {
    next(err)
  }
})
