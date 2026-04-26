// server/routes/access.ts
// Verificação de permissões entre serviços (S2S)
// GET  /api/internal/check-access   — produtos usam para verificar permissão
// POST /api/internal/service-token  — emite machine token (Fluxo 2 S2S)

import { Router } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { productConfigService } from '../services/productConfigService.js'
import { permissionsService } from '../services/permissionsService.js'
import { AppError } from '../lib/appError.js'

export const accessRouter = Router()

// Aplica x-internal-key em todas as rotas deste roteador
accessRouter.use(requireInternalKey)

const CheckAccessSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  productId: z.string().optional(),
  companyId: z.string().optional(),
  productKey: z.string(),
  resource: z.string().optional(),
  action: z.string().optional(),
})

const ProductPermissionsSchema = z.object({
  tenantId: z.string(),
  productKey: z.string(),
})

/**
 * GET /api/internal/check-access
 * Chamado por produtos para verificar se o tenant tem acesso a um produto
 * e se o usuário tem permissão para uma ação específica (opcional)
 * Requer: x-internal-key no header
 */
accessRouter.get('/check-access', async (req, res, next) => {
  try {
    const parsed = CheckAccessSchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Parâmetros inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const { tenantId, userId, productId, companyId, productKey, resource, action } = parsed.data

    // 1. Verifica se o tenant está ativo
    const tenant = await prisma.organizacao.findUnique({
      where: { id_organizacao: tenantId },
      select: { status_organizacao: true },
    })
    if (!tenant || tenant.status_organizacao !== 'ATIVO') {
      res.json({ allowed: false, reason: 'TENANT_INACTIVE' })
      return
    }

    // 2. Verifica se o produto está habilitado para o tenant
    const productConfig = await productConfigService.getConfig(tenantId, productKey)
    if (!productConfig?.is_active) {
      res.json({ allowed: false, reason: 'PRODUCT_NOT_ENABLED' })
      return
    }

    // 3. Verifica permissão granular (se solicitado)
    if (productId && resource && action) {
      const hasPermission = await permissionsService.checkPermission({
        tenantId,
        userId,
        productId,
        companyId,
        resource,
        action: action || '',
      })
      if (!hasPermission) {
        res.json({ allowed: false, reason: 'PERMISSION_DENIED' })
        return
      }
    }

    res.json({
      allowed: true,
      productConfig: productConfig.config,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/internal/tenant-products
 * Retorna TODOS os produtos habilitados para um tenant.
 * Usado pelo Shell para filtrar o sidebar dinamicamente.
 */
accessRouter.get('/tenant-products', async (req, res, next) => {
  try {
    const tenantId = req.query.tenantId as string
    if (!tenantId) {
      throw new AppError('tenantId é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const products = await productConfigService.listActiveProducts(tenantId)

    // Retorna também os inativos para que o Shell saiba o que esconder
    const allConfigs = await prisma.produtoGravityConfig.findMany({
      where: { tenant_id: tenantId },
      select: { product_key: true, is_active: true, config: true, updated_at: true },
    })

    res.json({ tenant_id: tenantId, products: allConfigs })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/internal/tenant-products/activate
 * Ativa um produto para um tenant via S2S (sem Clerk auth)
 * Usado por testes E2E e serviços internos
 */
accessRouter.post('/tenant-products/activate', async (req, res, next) => {
  try {
    const { tenantId, productKey, config: productConfig } = req.body
    if (!tenantId || !productKey) {
      throw new AppError('tenantId e productKey são obrigatórios', 400, 'VALIDATION_ERROR')
    }

    const result = await productConfigService.upsertConfig(
      tenantId,
      productKey,
      productConfig ?? {},
      true
    )

    res.json({ product_key: productKey, active: true, config: result })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/internal/tenant-products/deactivate
 * Desativa um produto para um tenant via S2S (sem Clerk auth)
 */
accessRouter.post('/tenant-products/deactivate', async (req, res, next) => {
  try {
    const { tenantId, productKey } = req.body
    if (!tenantId || !productKey) {
      throw new AppError('tenantId e productKey são obrigatórios', 400, 'VALIDATION_ERROR')
    }

    await productConfigService.disableProduct(tenantId, productKey)

    res.json({ product_key: productKey, active: false })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/internal/catalog-products/:slug/status
 * Toggle status de um produto no catálogo via S2S
 * Usado por testes E2E
 */
accessRouter.patch('/catalog-products/:slug/status', async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['ATIVO', 'SUSPENSO', 'EM_BREVE', 'LEGADO', 'INATIVO']
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(`Status inválido. Use: ${validStatuses.join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const product = await prisma.catalogProduct.findFirst({
      where: { slug: req.params.slug },
    })
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await prisma.catalogProduct.update({
      where: { id: product.id },
      data: { status },
    })

    res.json({ id: updated.id, slug: updated.slug, status: updated.status })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/internal/product-permissions
 * Busca definições de permissão configuradas para um produto no tenant
 */
accessRouter.get('/product-permissions', async (req, res, next) => {
  try {
    const parsed = ProductPermissionsSchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const config = await productConfigService.getConfig(
      parsed.data.tenantId,
      parsed.data.productKey
    )

    if (!config) {
      res.json({
        error: 'Permissões deste produto ainda não foram configuradas.',
        canEdit: false,
      })
      return
    }

    res.json({ config: config.config, is_active: config.is_active })
  } catch (err) {
    next(err)
  }
})
