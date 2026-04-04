import { Router } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'
import { AppError } from '../lib/errors.js'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { tenantId: string; userId: string }
    prisma?: PrismaClient
  }
}

const alertRouter = Router()

const createAlertSchema = z.object({
  dashboard_id: z.string().min(1),
  widget_id: z.string().optional(),
  metric_key: z.string().min(1),
  condition: z.enum(['gt', 'lt', 'gte', 'lte', 'eq', 'change_pct']),
  threshold: z.union([
    z.number(),
    z.object({ value: z.number(), pct: z.number() }),
  ]),
  channels: z.array(z.enum(['in_app', 'email', 'whatsapp'])).default(['in_app']),
})

const updateAlertSchema = z.object({
  condition: z.enum(['gt', 'lt', 'gte', 'lte', 'eq', 'change_pct']).optional(),
  threshold: z
    .union([z.number(), z.object({ value: z.number(), pct: z.number() })])
    .optional(),
  channels: z.array(z.enum(['in_app', 'email', 'whatsapp'])).optional(),
  is_active: z.boolean().optional(),
})

const listAlertQuerySchema = z.object({
  dashboard_id: z.string().optional(),
  is_active: z
    .string()
    .optional()
    .transform((v) => {
      if (v === 'true') return true
      if (v === 'false') return false
      return undefined
    }),
})

// GET / — lista alertas do usuário
alertRouter.get('/', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { dashboard_id, is_active } = listAlertQuerySchema.parse(req.query)

    const where: Record<string, unknown> = { user_id: userId }
    if (dashboard_id) {
      where.dashboard_id = dashboard_id
    }
    if (is_active !== undefined) {
      where.is_active = is_active
    }

    const alerts = await req.prisma!.dashboardAlert.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    res.json({ data: alerts })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// POST / — cria alerta
alertRouter.post('/', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const body = createAlertSchema.parse(req.body)

    // Valida que o dashboard pertence ao tenant+user
    const dashboard = await req.prisma!.dashboardConfig.findFirst({
      where: { id: body.dashboard_id, user_id: userId },
    })

    if (!dashboard) {
      throw new AppError('Dashboard não encontrado', 404, 'NOT_FOUND')
    }

    const alert = await req.prisma!.dashboardAlert.create({
      data: {
        user_id: userId,
        dashboard_id: body.dashboard_id,
        widget_id: body.widget_id ?? null,
        metric_key: body.metric_key,
        condition: body.condition,
        threshold: body.threshold as object,
        channels: body.channels,
        is_active: true,
      },
    })

    res.status(201).json({ data: alert })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// PUT /:id — atualiza alerta
alertRouter.put('/:id', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { id } = req.params
    const body = updateAlertSchema.parse(req.body)

    const existing = await req.prisma!.dashboardAlert.findFirst({
      where: { id, user_id: userId },
    })

    if (!existing) {
      throw new AppError('Alerta não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await req.prisma!.dashboardAlert.update({
      where: { id },
      data: {
        ...(body.condition !== undefined && { condition: body.condition }),
        ...(body.threshold !== undefined && { threshold: body.threshold as object }),
        ...(body.channels !== undefined && { channels: body.channels }),
        ...(body.is_active !== undefined && { is_active: body.is_active }),
        updated_at: new Date(),
      },
    })

    res.json({ data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// DELETE /:id — deleta alerta
alertRouter.delete('/:id', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { id } = req.params

    const existing = await req.prisma!.dashboardAlert.findFirst({
      where: { id, user_id: userId },
    })

    if (!existing) {
      throw new AppError('Alerta não encontrado', 404, 'NOT_FOUND')
    }

    await req.prisma!.dashboardAlert.delete({ where: { id } })

    res.json({ message: 'Alerta deletado com sucesso' })
  } catch (error) {
    next(error)
  }
})

// POST /:id/test — testa alerta manualmente
alertRouter.post('/:id/test', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { id } = req.params

    const alert = await req.prisma!.dashboardAlert.findFirst({
      where: { id, user_id: userId },
    })

    if (!alert) {
      throw new AppError('Alerta não encontrado', 404, 'NOT_FOUND')
    }

    const alertData = alert as Record<string, unknown>
    const condition = alertData.condition as string
    const threshold = alertData.threshold as number | { value: number; pct: number }
    const metricKey = alertData.metric_key as string

    // Executa verificação do alerta: busca último snapshot da métrica
    const latestSnapshot = await req.prisma!.metricaSnapshot.findFirst({
      where: { metric_key: metricKey },
      orderBy: { captured_at: 'desc' },
    })

    let wouldFire = false
    let currentValue: number | null = null
    let reason = 'Nenhum snapshot encontrado para a métrica'

    if (latestSnapshot) {
      const snapshotData = latestSnapshot as Record<string, unknown>
      currentValue = snapshotData.value as number

      const thresholdValue = typeof threshold === 'number' ? threshold : threshold.value

      switch (condition) {
        case 'gt':
          wouldFire = currentValue > thresholdValue
          break
        case 'lt':
          wouldFire = currentValue < thresholdValue
          break
        case 'gte':
          wouldFire = currentValue >= thresholdValue
          break
        case 'lte':
          wouldFire = currentValue <= thresholdValue
          break
        case 'eq':
          wouldFire = currentValue === thresholdValue
          break
        case 'change_pct':
          if (typeof threshold !== 'number') {
            const pct = threshold.pct
            const previousSnapshot = await req.prisma!.metricaSnapshot.findFirst({
              where: {
                metric_key: metricKey,
                captured_at: { lt: snapshotData.captured_at as Date },
              },
              orderBy: { captured_at: 'desc' },
            })
            if (previousSnapshot) {
              const prevData = previousSnapshot as Record<string, unknown>
              const prevValue = prevData.value as number
              if (prevValue !== 0) {
                const changePct = Math.abs((currentValue - prevValue) / prevValue) * 100
                wouldFire = changePct >= pct
              }
            }
          }
          break
      }

      reason = wouldFire
        ? `Condição satisfeita: ${currentValue} ${condition} ${JSON.stringify(threshold)}`
        : `Condição não satisfeita: ${currentValue} ${condition} ${JSON.stringify(threshold)}`
    }

    res.json({
      data: {
        would_fire: wouldFire,
        current_value: currentValue,
        condition,
        threshold,
        reason,
        tested_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    next(error)
  }
})

export { alertRouter }
