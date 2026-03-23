// server/routes/timers.ts
// Rotas do serviço de Cronômetro.
// Todas as rotas requerem autenticação — tenant_id vem do JWT, nunca do body.

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '../../middleware/withTenantIsolation.js'
import { requireAuth } from '../middleware/auth.js'
import { sseManager, setupSSEConnection } from '../lib/sse.js'

// ---------------------------------------------------------------------------
// Schemas Zod — validação de entrada
// ---------------------------------------------------------------------------

const ParamActivityId = z.object({
  activity_id: z.string().min(1, 'activity_id é obrigatório'),
})

const ParamSessionId = z.object({
  id: z.string().min(1, 'id da sessão é obrigatório'),
})

const ManualEntrySchema = z.object({
  duration_minutes: z
    .number()
    .int('Duração deve ser inteiro')
    .positive('Duração deve ser positivo'),
  subject: z.string().min(1, 'Assunto é obrigatório para lançamentos manuais').max(500),
  linked_type: z.enum(['nf', 'meeting', 'process', 'custom']).optional(),
  linked_id: z.string().optional(),
  linked_label: z.string().max(500).optional(),
  product_id: z.string().optional(),
  started_at: z.string().datetime().optional(), // ISO 8601 — padrão: agora
})

const PatchSessionSchema = z.object({
  subject: z.string().max(500).optional(),
  linked_type: z.enum(['nf', 'meeting', 'process', 'custom']).optional(),
  linked_id: z.string().optional(),
  linked_label: z.string().max(500).optional(),
})

const ReportQuerySchema = z.object({
  user_id: z.string().optional(),
  product_id: z.string().optional(),
  activity_id: z.string().optional(),
  period_start: z.string().datetime({ message: 'period_start deve ser ISO 8601' }),
  period_end: z.string().datetime({ message: 'period_end deve ser ISO 8601' }),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retorna segundos decorridos desde started_at, descontando acumulados antes de pausas */
function calcElapsedSeconds(
  startedAt: Date,
  pausedAt: Date | null,
  accumulatedSeconds: number
): number {
  const reference = pausedAt ?? new Date()
  const elapsed = Math.floor((reference.getTime() - startedAt.getTime()) / 1000)
  return accumulatedSeconds + elapsed
}

/** Converte segundos em minutos inteiros — mínimo 1 para não descartar acidentalmente */
function secondsToMinutes(seconds: number): number {
  return Math.floor(seconds / 60)
}

/** Emite evento SSE para o usuário */
function emitTimerEvent(
  tenantId: string,
  userId: string,
  event: string,
  data: unknown
) {
  sseManager.send(tenantId, userId, { event, data })
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const timersRouter = Router()

// Todas as rotas requerem autenticação
timersRouter.use(requireAuth)

// ---------------------------------------------------------------------------
// GET /api/v1/timers/stream
// SSE — stream de eventos do timer em tempo real para o usuário autenticado.
// ---------------------------------------------------------------------------

timersRouter.get('/stream', (req: Request, res: Response) => {
  const { tenantId, userId } = req.auth
  setupSSEConnection(req, res, tenantId, userId)

  // Envia estado inicial do timer ativo (se houver)
  const db = withTenantIsolation(prisma, tenantId)
  db.timerActive
    .findFirst({ where: { user_id: userId } })
    .then((active) => {
      if (active) {
        const elapsed = calcElapsedSeconds(
          active.started_at,
          active.paused_at,
          active.accumulated_seconds
        )
        sseManager.send(tenantId, userId, {
          event: 'timer:state',
          data: {
            active: true,
            activity_id: active.activity_id,
            elapsed_seconds: elapsed,
            is_paused: !!active.paused_at,
          },
        })
      } else {
        sseManager.send(tenantId, userId, {
          event: 'timer:state',
          data: { active: false },
        })
      }
    })
    .catch(console.error)
})

// ---------------------------------------------------------------------------
// GET /api/v1/timers/active
// Retorna o timer ativo do usuário autenticado (se houver).
// ---------------------------------------------------------------------------

timersRouter.get('/active', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId } = req.auth
    const db = withTenantIsolation(prisma, tenantId)

    const active = await db.timerActive.findFirst({ where: { user_id: userId } })

    if (!active) {
      return res.json({ active: false })
    }

    const elapsed = calcElapsedSeconds(
      active.started_at,
      active.paused_at,
      active.accumulated_seconds
    )

    return res.json({
      active: true,
      id: active.id,
      activity_id: active.activity_id,
      started_at: active.started_at,
      paused_at: active.paused_at,
      accumulated_seconds: active.accumulated_seconds,
      elapsed_seconds: elapsed,
      is_paused: !!active.paused_at,
    })
  } catch (err) {
    return next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/timers/:activity_id
// Lista sessões de uma atividade.
// ---------------------------------------------------------------------------

timersRouter.get('/:activity_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ParamActivityId.safeParse(req.params)
    if (!parsed.success) throw AppError.validation(parsed.error.errors[0].message)

    const { tenantId, userId } = req.auth
    const db = withTenantIsolation(prisma, tenantId)

    const sessions = await db.timerSession.findMany({
      where: {
        activity_id: parsed.data.activity_id,
        user_id: userId,
      },
      orderBy: { started_at: 'desc' },
    })

    const total_minutes = sessions.reduce(
      (acc, s) => acc + (s.duration_minutes ?? 0),
      0
    )

    return res.json({ sessions, total_minutes })
  } catch (err) {
    return next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/timers/:activity_id/start
// Inicia o timer para uma atividade.
// Pausa automaticamente qualquer timer ativo de outro atividade.
// ---------------------------------------------------------------------------

timersRouter.post(
  '/:activity_id/start',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ParamActivityId.safeParse(req.params)
      if (!parsed.success) throw AppError.validation(parsed.error.errors[0].message)

      const { tenantId, userId } = req.auth
      const db = withTenantIsolation(prisma, tenantId)
      const now = new Date()

      // Pausa qualquer timer ativo existente do usuário
      const existingActive = await db.timerActive.findFirst({
        where: { user_id: userId },
      })

      if (existingActive) {
        if (existingActive.activity_id === parsed.data.activity_id) {
          // Timer já ativo nesta atividade — retorna estado atual
          if (!existingActive.paused_at) {
            return res.status(409).json({
              error: { code: 'ALREADY_RUNNING', message: 'Timer já está em execução para esta atividade.' },
            })
          }
          // Estava pausado — retoma em vez de iniciar novo
          const updated = await db.timerActive.update({
            where: { id: existingActive.id },
            data: { paused_at: null },
          })
          emitTimerEvent(tenantId, userId, 'timer:resumed', {
            activity_id: parsed.data.activity_id,
            elapsed_seconds: calcElapsedSeconds(updated.started_at, null, updated.accumulated_seconds),
          })
          return res.json({ message: 'Timer retomado.', timer: updated })
        }

        // Timer em outra atividade — pausar automaticamente antes de iniciar
        const accumulatedBeforePause = calcElapsedSeconds(
          existingActive.started_at,
          existingActive.paused_at,
          existingActive.accumulated_seconds
        )
        await db.timerActive.update({
          where: { id: existingActive.id },
          data: {
            paused_at: now,
            accumulated_seconds: accumulatedBeforePause,
          },
        })
        emitTimerEvent(tenantId, userId, 'timer:paused', {
          activity_id: existingActive.activity_id,
          elapsed_seconds: accumulatedBeforePause,
        })
      }

      // Cria ou recria o timer ativo para esta atividade
      // Upsert via deleteMany + create para garantir unicidade por user_id
      if (existingActive) {
        // Se havia timer ativo em outra atividade, removemos e criamos novo
        await prisma.timerActive.deleteMany({ where: { user_id: userId, tenant_id: tenantId } })
      }

      const newActive = await prisma.timerActive.create({
        data: {
          tenant_id: tenantId,
          user_id: userId,
          activity_id: parsed.data.activity_id,
          started_at: now,
          paused_at: null,
          accumulated_seconds: 0,
        },
      })

      emitTimerEvent(tenantId, userId, 'timer:started', {
        activity_id: parsed.data.activity_id,
        started_at: now,
      })

      return res.status(201).json({ message: 'Timer iniciado.', timer: newActive })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// POST /api/v1/timers/:activity_id/pause
// Pausa o timer ativo.
// ---------------------------------------------------------------------------

timersRouter.post(
  '/:activity_id/pause',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ParamActivityId.safeParse(req.params)
      if (!parsed.success) throw AppError.validation(parsed.error.errors[0].message)

      const { tenantId, userId } = req.auth
      const db = withTenantIsolation(prisma, tenantId)
      const now = new Date()

      const active = await db.timerActive.findFirst({
        where: { user_id: userId, activity_id: parsed.data.activity_id },
      })

      if (!active) throw AppError.notFound('Timer ativo')
      if (active.paused_at) {
        throw new AppError('Timer já está pausado.', 409, 'ALREADY_PAUSED')
      }

      const elapsed = calcElapsedSeconds(active.started_at, null, active.accumulated_seconds)

      const updated = await db.timerActive.update({
        where: { id: active.id },
        data: {
          paused_at: now,
          accumulated_seconds: elapsed,
        },
      })

      emitTimerEvent(tenantId, userId, 'timer:paused', {
        activity_id: parsed.data.activity_id,
        elapsed_seconds: elapsed,
      })

      return res.json({ message: 'Timer pausado.', elapsed_seconds: elapsed, timer: updated })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// POST /api/v1/timers/:activity_id/stop
// Para e salva a sessão. Descarta se < 1 minuto.
// ---------------------------------------------------------------------------

timersRouter.post(
  '/:activity_id/stop',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ParamActivityId.safeParse(req.params)
      if (!parsed.success) throw AppError.validation(parsed.error.errors[0].message)

      const { tenantId, userId } = req.auth
      const db = withTenantIsolation(prisma, tenantId)
      const now = new Date()

      const active = await db.timerActive.findFirst({
        where: { user_id: userId, activity_id: parsed.data.activity_id },
      })

      if (!active) throw AppError.notFound('Timer ativo')

      const totalSeconds = calcElapsedSeconds(
        active.started_at,
        active.paused_at,
        active.accumulated_seconds
      )

      // Descarta sessões com menos de 1 minuto (exceto manuais)
      await prisma.timerActive.deleteMany({
        where: { id: active.id, tenant_id: tenantId },
      })

      const durationMinutes = secondsToMinutes(totalSeconds)

      if (durationMinutes < 1) {
        emitTimerEvent(tenantId, userId, 'timer:stopped', {
          activity_id: parsed.data.activity_id,
          duration_minutes: 0,
          discarded: true,
        })
        return res.json({
          message: 'Sessão descartada (menos de 1 minuto).',
          duration_minutes: 0,
          discarded: true,
        })
      }

      // Cria a sessão salva
      const session = await prisma.timerSession.create({
        data: {
          tenant_id: tenantId,
          user_id: userId,
          activity_id: parsed.data.activity_id,
          product_id: (req.body as { product_id?: string }).product_id ?? null,
          started_at: active.started_at,
          ended_at: now,
          duration_minutes: durationMinutes,
          is_manual: false,
        },
      })

      emitTimerEvent(tenantId, userId, 'timer:stopped', {
        activity_id: parsed.data.activity_id,
        duration_minutes: durationMinutes,
        session_id: session.id,
      })

      return res.json({ message: 'Sessão salva.', session, duration_minutes: durationMinutes })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// POST /api/v1/timers/:activity_id/manual
// Lança tempo manualmente. Assunto obrigatório.
// ---------------------------------------------------------------------------

timersRouter.post(
  '/:activity_id/manual',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramParsed = ParamActivityId.safeParse(req.params)
      if (!paramParsed.success) throw AppError.validation(paramParsed.error.errors[0].message)

      const bodyParsed = ManualEntrySchema.safeParse(req.body)
      if (!bodyParsed.success) throw AppError.validation(bodyParsed.error.errors[0].message)

      const { tenantId, userId } = req.auth
      const { duration_minutes, subject, linked_type, linked_id, linked_label, product_id, started_at } =
        bodyParsed.data

      const startedDate = started_at ? new Date(started_at) : new Date()
      const endedDate = new Date(startedDate.getTime() + duration_minutes * 60 * 1000)

      const session = await prisma.timerSession.create({
        data: {
          tenant_id: tenantId,
          user_id: userId,
          activity_id: paramParsed.data.activity_id,
          product_id: product_id ?? null,
          started_at: startedDate,
          ended_at: endedDate,
          duration_minutes,
          is_manual: true,
          subject,
          linked_type: linked_type ?? null,
          linked_id: linked_id ?? null,
          linked_label: linked_label ?? null,
        },
      })

      return res.status(201).json({ message: 'Sessão manual criada.', session })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// PATCH /api/v1/timers/sessions/:id
// Edita assunto / vínculo de uma sessão existente.
// ---------------------------------------------------------------------------

timersRouter.patch(
  '/sessions/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramParsed = ParamSessionId.safeParse(req.params)
      if (!paramParsed.success) throw AppError.validation(paramParsed.error.errors[0].message)

      const bodyParsed = PatchSessionSchema.safeParse(req.body)
      if (!bodyParsed.success) throw AppError.validation(bodyParsed.error.errors[0].message)

      const { tenantId, userId } = req.auth
      const db = withTenantIsolation(prisma, tenantId)

      const existing = await db.timerSession.findFirst({
        where: { id: paramParsed.data.id, user_id: userId },
      })
      if (!existing) throw AppError.notFound('Sessão')

      const updated = await db.timerSession.update({
        where: { id: paramParsed.data.id },
        data: {
          ...(bodyParsed.data.subject !== undefined && { subject: bodyParsed.data.subject }),
          ...(bodyParsed.data.linked_type !== undefined && { linked_type: bodyParsed.data.linked_type }),
          ...(bodyParsed.data.linked_id !== undefined && { linked_id: bodyParsed.data.linked_id }),
          ...(bodyParsed.data.linked_label !== undefined && { linked_label: bodyParsed.data.linked_label }),
        },
      })

      return res.json({ session: updated })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// DELETE /api/v1/timers/sessions/:id
// Deleta uma sessão.
// ---------------------------------------------------------------------------

timersRouter.delete(
  '/sessions/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramParsed = ParamSessionId.safeParse(req.params)
      if (!paramParsed.success) throw AppError.validation(paramParsed.error.errors[0].message)

      const { tenantId, userId } = req.auth
      const db = withTenantIsolation(prisma, tenantId)

      const existing = await db.timerSession.findFirst({
        where: { id: paramParsed.data.id, user_id: userId },
      })
      if (!existing) throw AppError.notFound('Sessão')

      await db.timerSession.delete({ where: { id: paramParsed.data.id } })

      return res.status(204).send()
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// GET /api/v1/timers/report
// Relatório de horas por período, cliente e projeto.
// NÃO duplica lógica do serviço relatorios — apenas agrega dados de sessões.
// ---------------------------------------------------------------------------

timersRouter.get('/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryParsed = ReportQuerySchema.safeParse(req.query)
    if (!queryParsed.success) throw AppError.validation(queryParsed.error.errors[0].message)

    const { tenantId, userId } = req.auth
    const { user_id, product_id, activity_id, period_start, period_end } = queryParsed.data

    // Usuários comuns só podem ver seu próprio relatório
    const effectiveUserId =
      req.auth.role === 'admin' ? user_id ?? userId : userId

    const db = withTenantIsolation(prisma, tenantId)

    const sessions = await db.timerSession.findMany({
      where: {
        user_id: effectiveUserId,
        ...(product_id ? { product_id } : {}),
        ...(activity_id ? { activity_id } : {}),
        started_at: {
          gte: new Date(period_start),
          lte: new Date(period_end),
        },
        // Apenas sessões concluídas
        duration_minutes: { not: null },
      },
      orderBy: { started_at: 'asc' },
    })

    // Agrega por atividade
    const byActivity: Record<string, { activity_id: string; total_minutes: number; sessions_count: number }> = {}
    let totalMinutes = 0

    for (const session of sessions) {
      totalMinutes += session.duration_minutes ?? 0
      const key = session.activity_id
      if (!byActivity[key]) {
        byActivity[key] = { activity_id: key, total_minutes: 0, sessions_count: 0 }
      }
      byActivity[key].total_minutes += session.duration_minutes ?? 0
      byActivity[key].sessions_count++
    }

    // Agrega por produto (se product_id disponível)
    const byProduct: Record<string, { product_id: string; total_minutes: number }> = {}
    for (const session of sessions) {
      if (!session.product_id) continue
      if (!byProduct[session.product_id]) {
        byProduct[session.product_id] = { product_id: session.product_id, total_minutes: 0 }
      }
      byProduct[session.product_id].total_minutes += session.duration_minutes ?? 0
    }

    return res.json({
      period: { start: period_start, end: period_end },
      user_id: effectiveUserId,
      total_minutes: totalMinutes,
      total_hours: +(totalMinutes / 60).toFixed(2),
      sessions_count: sessions.length,
      by_activity: Object.values(byActivity),
      by_product: Object.values(byProduct),
      sessions,
    })
  } catch (err) {
    return next(err)
  }
})
