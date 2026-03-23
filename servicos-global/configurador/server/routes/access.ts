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
  productKey: z.string(),
  resource: z.string().optional(),
  action: z.enum(['READ', 'WRITE', 'DELETE', 'MANAGE']).optional(),
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

    const { tenantId, userId, productKey, resource, action } = parsed.data

    // 1. Verifica se o tenant está ativo
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { status: true },
    })
    if (!tenant || tenant.status !== 'ACTIVE') {
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
    if (resource && action) {
      const hasPermission = await permissionsService.checkPermission({
        tenantId,
        userId,
        resource,
        action,
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
