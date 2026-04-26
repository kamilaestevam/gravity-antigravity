// server/routes/tenantProducts.ts
// Ativação/desativação de produtos por tenant — gravity_admin only
// Montado em /api/admin/tenants pelo index.ts
// Ex: POST /api/admin/tenants/:tenantId/products/:productKey/activate
//
// Gestão de produtos contratados por um tenant (self-service)
// POST /api/v1/assinaturas/subscribe  — Contratar produto
// GET  /api/v1/assinaturas            — Listar produtos contratados
// DELETE /api/v1/assinaturas/:key     — Cancelar produto

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { productConfigService } from '../services/productConfigService.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { StatusProdutoGravity } from '../../../../configurador/generated/index.js'

export const tenantProductsRouter = Router()

// ─── Self-service routes (tenant authenticated) ────────────────────────────

const SubscribeSchema = z.object({
  product_key: z.string().min(1),
})

/**
 * GET /api/v1/assinaturas
 * Lista todos os produtos contratados pelo tenant autenticado
 */
tenantProductsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const configs = await prisma.configuracaoProduto.findMany({
      where: { id_organizacao_config_produto_gravity: req.auth.tenantId },
      orderBy: { data_criacao_config_produto_gravity: 'desc' },
    })

    // Enriquece com dados do catálogo
    const slugs = configs.map(c => c.chave_produto_config_produto_gravity)
    const catalog = await prisma.produtoGravity.findMany({
      where: { slug: { in: slugs } },
    })
    const catalogMap = new Map(catalog.map(p => [p.slug, p]))

    // DTO: ConfiguracaoProduto rename → contrato legado
    const products = configs.map(c => ({
      product_key: c.chave_produto_config_produto_gravity,
      is_active: c.ativo_config_produto_gravity,
      config: c.configuracao_config_produto_gravity,
      subscribed_at: c.data_criacao_config_produto_gravity,
      catalog: catalogMap.get(c.chave_produto_config_produto_gravity) ?? null,
    }))

    res.json({ products })
  } catch {
    // configuracaoProduto pode não existir — retorna vazio
    res.json({ products: [] })
  }
})

/**
 * POST /api/v1/assinaturas/subscribe
 * Contrata um produto do catálogo para o tenant autenticado
 */
tenantProductsRouter.post('/subscribe', requireAuth, async (req, res, next) => {
  try {
    const parsed = SubscribeSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('product_key é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const { product_key } = parsed.data

    // Verifica se o produto existe no catálogo
    const catalogProduct =
      await prisma.produtoGravity.findFirst({ where: { slug: product_key, status: { in: [StatusProdutoGravity.ATIVO] } } }).catch(() => null)

    if (!catalogProduct) {
      throw new AppError('Produto não encontrado ou inativo', 404, 'NOT_FOUND')
    }

    // Cria ou reativa o ProductConfig
    const config = await prisma.configuracaoProduto.upsert({
      where: {
        id_organizacao_config_produto_gravity_chave_produto_config_produto_gravity: {
          id_organizacao_config_produto_gravity: req.auth.tenantId,
          chave_produto_config_produto_gravity: product_key,
        },
      },
      create: {
        id_organizacao_config_produto_gravity: req.auth.tenantId,
        chave_produto_config_produto_gravity: product_key,
        configuracao_config_produto_gravity: {},
        ativo_config_produto_gravity: true,
      },
      update: {
        ativo_config_produto_gravity: true,
      },
    })

    res.status(201).json({ config, catalog: catalogProduct })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/assinaturas/:key
 * Cancela (desativa) um produto do tenant
 */
tenantProductsRouter.delete('/:key', requireAuth, async (req, res, next) => {
  try {
    await prisma.configuracaoProduto.updateMany({
      where: {
        id_organizacao_config_produto_gravity: req.auth.tenantId,
        chave_produto_config_produto_gravity: req.params.key,
      },
      data: { ativo_config_produto_gravity: false },
    })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ─── Admin routes (gravity_admin only) ─────────────────────────────────────

const ActivateProductSchema = z.object({
  config: z.record(z.unknown()).optional().default({}),
})

/**
 * GET /api/admin/tenants/:tenantId/products
 * Lista produtos ativados para um tenant específico
 */
tenantProductsRouter.get('/:tenantId/products', requireAuth, requireGravityAdmin, async (req, res, next) => {
  try {
    const tenant = await prisma.organizacao.findUnique({
      where: { id_organizacao: req.params.tenantId },
      select: { id_organizacao: true, nome_organizacao: true },
    })
    if (!tenant) {
      throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
    }

    const configs = await prisma.configuracaoProduto.findMany({
      where: { id_organizacao_config_produto_gravity: req.params.tenantId },
      orderBy: { data_criacao_config_produto_gravity: 'desc' },
    })

    // DTO: ConfiguracaoProduto rename → contrato legado para painel admin
    const productsDto = configs.map(c => ({
      id: c.id_config_produto_gravity,
      tenant_id: c.id_organizacao_config_produto_gravity,
      product_key: c.chave_produto_config_produto_gravity,
      config: c.configuracao_config_produto_gravity,
      is_active: c.ativo_config_produto_gravity,
      created_at: c.data_criacao_config_produto_gravity,
      updated_at: c.data_atualizacao_config_produto_gravity,
    }))

    res.json({ tenant_id: tenant.id_organizacao, tenant_name: tenant.nome_organizacao, products: productsDto })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/admin/tenants/:tenantId/products/:productKey/activate
 * Ativa um produto para um tenant
 */
tenantProductsRouter.post(
  '/:tenantId/products/:productKey/activate',
  requireAuth,
  requireGravityAdmin,
  async (req, res, next) => {
    try {
      const parsed = ActivateProductSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new AppError(
          parsed.error.errors[0]?.message ?? 'Dados inválidos',
          400,
          'VALIDATION_ERROR'
        )
      }

      const tenant = await prisma.organizacao.findUnique({
        where: { id_organizacao: req.params.tenantId },
      })
      if (!tenant) {
        throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
      }

      const config = await productConfigService.upsertConfig(
        req.params.tenantId,
        req.params.productKey,
        parsed.data.config,
        true
      )

      console.info(`[admin] produto ativado tenant_id=${req.params.tenantId} product_key=${req.params.productKey}`)

      res.json({ activated: true, config })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * POST /api/admin/tenants/:tenantId/products/:productKey/deactivate
 * Desativa um produto para um tenant
 */
tenantProductsRouter.post(
  '/:tenantId/products/:productKey/deactivate',
  requireAuth,
  requireGravityAdmin,
  async (req, res, next) => {
    try {
      const tenant = await prisma.organizacao.findUnique({
        where: { id_organizacao: req.params.tenantId },
      })
      if (!tenant) {
        throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
      }

      await productConfigService.disableProduct(
        req.params.tenantId,
        req.params.productKey
      )

      console.info(`[admin] produto desativado tenant_id=${req.params.tenantId} product_key=${req.params.productKey}`)

      res.json({ deactivated: true })
    } catch (err) {
      next(err)
    }
  }
)
