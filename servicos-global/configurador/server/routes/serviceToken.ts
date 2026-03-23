// server/routes/serviceToken.ts
// Emissão de machine tokens para S2S assíncrono (Fluxo 2 S2S)
// POST /api/internal/service-token — emite token de serviço

import { Router } from 'express'
import { z } from 'zod'
import { createHash, randomBytes } from 'crypto'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const serviceTokenRouter = Router()

serviceTokenRouter.use(requireInternalKey)

const ServiceTokenSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  scope: z.enum(['SERVICE', 'WEBHOOK', 'CRON']).default('SERVICE'),
  expiresInHours: z.number().min(1).max(720).default(24),
})

/**
 * POST /api/internal/service-token
 * Emite um machine token de longa duração para chamadas S2S assíncronas.
 * Retorna o token em texto puro — apenas uma vez.
 * O sistema armazena apenas o hash.
 */
serviceTokenRouter.post('/service-token', async (req, res, next) => {
  try {
    const parsed = ServiceTokenSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const { tenantId, userId, scope, expiresInHours } = parsed.data

    // Gera token aleatório seguro
    const rawToken = `svc_${randomBytes(32).toString('hex')}`
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + expiresInHours)

    await prisma.serviceToken.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        token_hash: tokenHash,
        scope,
        expires_at: expiresAt,
        revoked: false,
      },
    })

    // Retorna o token em texto puro — só desta vez
    res.status(201).json({
      token: rawToken,
      expiresAt: expiresAt.toISOString(),
      scope,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/internal/service-token/verify
 * Verifica se um service token é válido (chamado pelos serviços de tenant)
 */
serviceTokenRouter.post('/service-token/verify', async (req, res, next) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.body)

    const tokenHash = createHash('sha256').update(token).digest('hex')

    const serviceToken = await prisma.serviceToken.findUnique({
      where: { token_hash: tokenHash },
    })

    if (!serviceToken || serviceToken.revoked) {
      res.json({ valid: false, reason: 'TOKEN_INVALID_OR_REVOKED' })
      return
    }

    if (serviceToken.expires_at && serviceToken.expires_at < new Date()) {
      res.json({ valid: false, reason: 'TOKEN_EXPIRED' })
      return
    }

    res.json({
      valid: true,
      tenantId: serviceToken.tenant_id,
      userId: serviceToken.user_id,
      scope: serviceToken.scope,
    })
  } catch (err) {
    next(err)
  }
})
