import { Router } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'
import { AppError } from '../lib/errors.js'
import { sharingEngine } from '../lib/sharing-engine.js'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { tenantId: string; userId: string }
    prisma?: PrismaClient
  }
}

const shareRouter = Router()

const createShareSchema = z.object({
  dashboard_id: z.string().min(1),
  channel: z.enum(['link', 'email', 'whatsapp']),
  recipient_email: z.string().email().optional(),
  recipient_phone: z.string().optional(),
  expires_in_hours: z.number().min(1).max(720).optional(),
  include_snapshot: z.boolean().default(false),
})

// GET /public/:token — rota PÚBLICA (sem auth)
shareRouter.get('/public/:token', async (req, res, next) => {
  try {
    // req.prisma pode não estar disponível aqui pois não há tenant no contexto público
    // O sharingEngine lida com a busca pelo token usando o prisma global
    const { token } = req.params

    const share = await sharingEngine.findByToken(token)

    if (!share) {
      throw new AppError('Link de compartilhamento não encontrado ou expirado', 404, 'NOT_FOUND')
    }

    const shareData = share as Record<string, unknown>

    // Verifica expiração
    const expiresAt = shareData.expires_at as Date | null
    if (expiresAt && new Date() > new Date(expiresAt)) {
      throw new AppError('Este link de compartilhamento expirou', 410, 'SHARE_EXPIRED')
    }

    const snapshotData = shareData.snapshot_data

    if (!snapshotData) {
      throw new AppError('Snapshot não disponível para este compartilhamento', 404, 'NO_SNAPSHOT')
    }

    res.json({
      data: {
        snapshot_data: snapshotData,
        shared_at: shareData.created_at,
        expires_at: expiresAt,
      },
    })
  } catch (error) {
    next(error)
  }
})

// POST / — cria compartilhamento
shareRouter.post('/', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const body = createShareSchema.parse(req.body)

    // Valida que o dashboard pertence ao tenant+user
    const dashboard = await req.prisma!.dashboardConfig.findFirst({
      where: { id: body.dashboard_id, user_id: userId },
    })

    if (!dashboard) {
      throw new AppError('Dashboard não encontrado', 404, 'NOT_FOUND')
    }

    if (body.channel === 'email' && !body.recipient_email) {
      throw new AppError(
        'recipient_email é obrigatório para compartilhamento via email',
        400,
        'VALIDATION_ERROR',
      )
    }

    if (body.channel === 'whatsapp' && !body.recipient_phone) {
      throw new AppError(
        'recipient_phone é obrigatório para compartilhamento via whatsapp',
        400,
        'VALIDATION_ERROR',
      )
    }

    const share = await sharingEngine.create({
      tenantId,
      userId,
      dashboardId: body.dashboard_id,
      channel: body.channel,
      recipientEmail: body.recipient_email,
      recipientPhone: body.recipient_phone,
      expiresInHours: body.expires_in_hours,
      includeSnapshot: body.include_snapshot,
      prisma: req.prisma!,
    })

    res.status(201).json({ data: share })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// GET / — lista shares do usuário
shareRouter.get('/', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!

    const shares = await req.prisma!.dashboardShare.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    })

    res.json({ data: shares })
  } catch (error) {
    next(error)
  }
})

// DELETE /:id — revoga share
shareRouter.delete('/:id', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { id } = req.params

    const existing = await req.prisma!.dashboardShare.findFirst({
      where: { id, user_id: userId },
    })

    if (!existing) {
      throw new AppError('Compartilhamento não encontrado', 404, 'NOT_FOUND')
    }

    await req.prisma!.dashboardShare.delete({ where: { id } })

    res.json({ message: 'Compartilhamento revogado com sucesso' })
  } catch (error) {
    next(error)
  }
})

export { shareRouter }
