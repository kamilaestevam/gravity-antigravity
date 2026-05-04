// server/routes/tenantProducts.ts
// Ativação/desativação de produtos por organização — gravity_admin only
// Montado em /api/v1/admin/organizacoes pelo index.ts
// Ex: POST /api/v1/admin/organizacoes/:id_organizacao/produtos/:id_produto_gravity/ativar
//
// Self-service (montado em /api/v1/assinaturas — fora de escopo da API-1):
// POST /api/v1/assinaturas/subscribe  — Contratar produto
// GET  /api/v1/assinaturas            — Listar produtos contratados
// DELETE /api/v1/assinaturas/:key     — Cancelar produto

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { productConfigService } from '../services/produto-gravity-configuracao-service.js'
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
    const configs = await prisma.produtoGravityConfiguracao.findMany({
      where: { id_organizacao_configuracao_produto_gravity: req.auth.id_organizacao },
      orderBy: { data_criacao_configuracao_produto_gravity: 'desc' },
    })

    // Enriquece com dados do catálogo
    const slugs = configs.map(c => c.chave_produto_configuracao_produto_gravity)
    const catalogRows = await prisma.produtoGravity.findMany({
      where: { slug_produto_gravity: { in: slugs } },
    })
    // DTO: ProdutoGravity rename → contrato legado (apenas chaves usadas pelo consumer)
    const catalog = catalogRows.map(p => ({
      id: p.id_produto_gravity,
      name: p.nome_produto_gravity,
      slug: p.slug_produto_gravity,
      description: p.descricao_produto_gravity,
      status: p.status_produto_gravity,
    }))
    const catalogMap = new Map(catalog.map(p => [p.slug, p]))

    // DTO: ConfiguracaoProduto rename → contrato legado
    const products = configs.map(c => ({
      product_key: c.chave_produto_configuracao_produto_gravity,
      is_active: c.ativo_configuracao_produto_gravity,
      config: c.configuracao_config_produto_gravity,
      subscribed_at: c.data_criacao_configuracao_produto_gravity,
      catalog: catalogMap.get(c.chave_produto_configuracao_produto_gravity) ?? null,
    }))

    res.json({ products })
  } catch {
    // configuracaoProduto pode não existir — retorna vazio
    res.json({ products: [] })
  }
})

/**
 * POST /api/v1/admin/organizacoes/assinar-produto
 * (Self-service em /api/v1/assinaturas/assinar-produto — mesma rota, dois mounts)
 * Contrata um produto do catálogo para a organização autenticada
 */
tenantProductsRouter.post('/assinar-produto', requireAuth, async (req, res, next) => {
  try {
    const parsed = SubscribeSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('product_key é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const { product_key } = parsed.data

    // Verifica se o produto existe no catálogo
    const catalogProduct =
      await prisma.produtoGravity.findFirst({
        where: {
          slug_produto_gravity: product_key,
          status_produto_gravity: { in: [StatusProdutoGravity.ATIVO] },
        },
      }).catch(() => null)

    if (!catalogProduct) {
      throw new AppError('Produto não encontrado ou inativo', 404, 'NOT_FOUND')
    }

    // Cria ou reativa o ProductConfig
    const config = await prisma.produtoGravityConfiguracao.upsert({
      where: {
        id_organizacao_configuracao_produto_gravity_chave_produto_configuracao_produto_gravity: {
          id_organizacao_configuracao_produto_gravity: req.auth.id_organizacao,
          chave_produto_configuracao_produto_gravity: product_key,
        },
      },
      create: {
        id_organizacao_configuracao_produto_gravity: req.auth.id_organizacao,
        chave_produto_configuracao_produto_gravity: product_key,
        configuracao_config_produto_gravity: {},
        ativo_configuracao_produto_gravity: true,
      },
      update: {
        ativo_configuracao_produto_gravity: true,
      },
    })

    res.status(201).json({ config, catalog: catalogProduct })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/admin/organizacoes/:id_organizacao
 * (Self-service em /api/v1/assinaturas/:id_organizacao — mesma rota, dois mounts)
 * Cancela (desativa) um produto da organização
 */
tenantProductsRouter.delete('/:id_organizacao', requireAuth, async (req, res, next) => {
  try {
    await prisma.produtoGravityConfiguracao.updateMany({
      where: {
        id_organizacao_configuracao_produto_gravity: req.auth.id_organizacao,
        chave_produto_configuracao_produto_gravity: req.params.id_organizacao,
      },
      data: { ativo_configuracao_produto_gravity: false },
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
 * GET /api/v1/admin/organizacoes/:id_organizacao/produtos
 * Lista produtos ativados para uma organização específica
 */
tenantProductsRouter.get('/:id_organizacao/produtos', requireAuth, requireGravityAdmin, async (req, res, next) => {
  try {
    const { id_organizacao } = req.params
    const tenant = await prisma.organizacao.findUnique({
      where: { id_organizacao },
      select: { id_organizacao: true, nome_organizacao: true },
    })
    if (!tenant) {
      throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
    }

    const configs = await prisma.produtoGravityConfiguracao.findMany({
      where: { id_organizacao_configuracao_produto_gravity: id_organizacao },
      orderBy: { data_criacao_configuracao_produto_gravity: 'desc' },
    })

    // DTO: ConfiguracaoProduto rename → contrato legado para painel admin
    const productsDto = configs.map(c => ({
      id: c.id_configuracao_produto_gravity,
      tenant_id: c.id_organizacao_configuracao_produto_gravity,
      product_key: c.chave_produto_configuracao_produto_gravity,
      config: c.configuracao_config_produto_gravity,
      is_active: c.ativo_configuracao_produto_gravity,
      created_at: c.data_criacao_configuracao_produto_gravity,
      updated_at: c.data_atualizacao_configuracao_produto_gravity,
    }))

    res.json({ tenant_id: tenant.id_organizacao, tenant_name: tenant.nome_organizacao, products: productsDto })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/admin/organizacoes/:id_organizacao/produtos/:id_produto_gravity/ativar
 * Ativa um produto para uma organização
 */
tenantProductsRouter.post(
  '/:id_organizacao/produtos/:id_produto_gravity/ativar',
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

      const { id_organizacao, id_produto_gravity: productKey } = req.params

      const tenant = await prisma.organizacao.findUnique({
        where: { id_organizacao },
      })
      if (!tenant) {
        throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
      }

      const config = await productConfigService.upsertConfig(
        id_organizacao,
        productKey,
        parsed.data.config,
        true
      )

      console.info(`[admin] produto ativado id_organizacao=${id_organizacao} product_key=${productKey}`)

      res.json({ activated: true, config })
    } catch (err) {
      next(err)
    }
  }
)

/**
 * POST /api/v1/admin/organizacoes/:id_organizacao/produtos/:id_produto_gravity/desativar
 * Desativa um produto para uma organização
 */
tenantProductsRouter.post(
  '/:id_organizacao/produtos/:id_produto_gravity/desativar',
  requireAuth,
  requireGravityAdmin,
  async (req, res, next) => {
    try {
      const { id_organizacao, id_produto_gravity: productKey } = req.params

      const tenant = await prisma.organizacao.findUnique({
        where: { id_organizacao },
      })
      if (!tenant) {
        throw new AppError('Organizacao não encontrado', 404, 'NOT_FOUND')
      }

      await productConfigService.disableProduct(
        id_organizacao,
        productKey
      )

      console.info(`[admin] produto desativado id_organizacao=${id_organizacao} product_key=${productKey}`)

      res.json({ deactivated: true })
    } catch (err) {
      next(err)
    }
  }
)
