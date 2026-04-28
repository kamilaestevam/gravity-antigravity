import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { generateTokenAPIKey, hashToken } from '../crypto'
import { requireAuth, requireInternalKey, tenantIsolation } from '../../../middleware/src'

// Using process.env explicitly for types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENCRYPTION_KEY: string
    }
  }
}

export const tokensRouter = Router()
const prisma = new PrismaClient()

const createTokenSchema = z.object({
  name: z.string().min(1).max(100),
  scope: z.enum(['READ', 'WRITE', 'DELETE']).optional(),
  expiration: z.enum(['NEVER', 'DAYS_30', 'DAYS_90', 'CUSTOM']).optional(),
  rate_limit: z.number().optional()
})

tokensRouter.use(requireAuth)
tokensRouter.use(tenantIsolation)

tokensRouter.get('/', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const tokens = await prisma.aPIToken.findMany({
      where: { tenant_id: tenantId, is_revoked: false },
      select: {
        id: true,
        name: true,
        prefix: true,
        scope: true,
        expiration: true,
        expires_at: true,
        rate_limit: true,
        created_at: true
      }
    })
    res.json(tokens)
  } catch (error) {
    next(error)
  }
})

tokensRouter.post('/', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const data = createTokenSchema.parse(req.body)

    const prefix = process.env.NODE_ENV === 'production' ? 'gv_live_sk_' : 'gv_test_sk_'
    const { token, hash } = generateTokenAPIKey(prefix)

    let expiresAt = null
    if (data.expiration === 'DAYS_30') {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    } else if (data.expiration === 'DAYS_90') {
      expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    }

    const created = await prisma.aPIToken.create({
      data: {
        tenant_id: tenantId,
        name: data.name,
        hash,
        prefix,
        scope: data.scope || 'READ',
        expiration: data.expiration || 'NEVER',
        expires_at: expiresAt,
        rate_limit: data.rate_limit || 60
      }
    })

    // Return the actual token ONLY ONCE. 
    res.status(201).json({
      id: created.id,
      name: created.name,
      token, // Important! Show only once
      scope: created.scope,
      expiration: created.expiration
    })
  } catch (error) {
    next(error)
  }
})

tokensRouter.delete('/:id_api_token', async (req, res, next) => {
  try {
    const tenantId = (req as any).tenantId
    const { id_api_token } = req.params

    const token = await prisma.aPIToken.findFirst({
      where: { id: id_api_token, tenant_id: tenantId }
    })

    if (!token) {
      return res.status(404).json({ error: 'Token not found' })
    }

    await prisma.aPIToken.update({
      where: { id: id_api_token },
      data: { is_revoked: true, revoked_at: new Date() }
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
