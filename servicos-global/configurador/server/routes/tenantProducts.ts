// server/routes/tenantProducts.ts
// Ativação/desativação de produtos por tenant — gravity_admin only
// Montado em /api/admin/tenants pelo index.ts
// Ex: POST /api/admin/tenants/:tenantId/products/:productKey/activate

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { productConfigService } from '../services/productConfigService.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const tenantProductsRouter = Router()

// Cadeia obrigatória: auth → gravity_admin check
tenantProductsRouter.use(requireAuth, requireGravityAdmin)

const ActivateProductSchema = z.object({
  config: z.record(z.unknown()).optional().default({}),
})

/**
 * GET /api/admin/tenants/:tenantId/products
 * Lista produtos ativados para um tenant específico
 */
tenantProductsRouter.get('/:tenantId/products', async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.tenantId },
      select: { id: true, name: true },
    })
    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404, 'NOT_FOUND')
    }

    const configs = await prisma.productConfig.findMany({
      where: { tenant_id: req.params.tenantId },
      orderBy: { created_at: 'desc' },
    })

    res.json({ tenant_id: tenant.id, tenant_name: tenant.name, products: configs })
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

      const tenant = await prisma.tenant.findUnique({
        where: { id: req.params.tenantId },
      })
      if (!tenant) {
        throw new AppError('Tenant não encontrado', 404, 'NOT_FOUND')
      }

      const config = await productConfigService.upsertConfig(
        req.params.tenantId,
        req.params.productKey,
        parsed.data.config,
        true
      )

      console.log(
        `[admin] Produto "${req.params.productKey}" ativado para tenant "${tenant.name}" por ${req.auth.clerkUserId}`
      )

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
  async (req, res, next) => {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: req.params.tenantId },
      })
      if (!tenant) {
        throw new AppError('Tenant não encontrado', 404, 'NOT_FOUND')
      }

      await productConfigService.disableProduct(
        req.params.tenantId,
        req.params.productKey
      )

      console.log(
        `[admin] Produto "${req.params.productKey}" desativado para tenant "${tenant.name}" por ${req.auth.clerkUserId}`
      )

      res.json({ deactivated: true })
    } catch (err) {
      next(err)
    }
  }
)
