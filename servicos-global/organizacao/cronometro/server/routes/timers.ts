// server/routes/timers.ts
// Rotas do serviço de Cronômetro.
// Todas as rotas requerem autenticação — tenant_id vem do JWT, nunca do body.
//
// Onda 27 (DDD Servicos): bypass withTenantIsolation — colunas físicas agora
// usam id_organizacao_<table>. Filtragem explícita + ACL/DTO map nas bordas.
//
// Onda API-1 (DDD nomes de rota): paths em PT-BR sob dois grupos lógicos:
//   - /api/v1/atividades/:id_atividade/cronometro/...   (sub-recurso da atividade)
//   - /api/v1/cronometros/...                            (recursos top-level)
// O router é montado em '/api/v1' (ver index.ts/routes.ts) e usa paths absolutos
// internamente para suportar os dois grupos a partir de um único Router.

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma as prismaDefault } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { requireAuth } from '../middleware/auth.js'
import { sseManager, setupSSEConnection } from '../lib/sse.js'
import type { PrismaClient as TenantPrismaClient } from '../../../generated/index.js'
const prisma = prismaDefault as unknown as TenantPrismaClient

// ---------------------------------------------------------------------------
// Schemas Zod — validação de entrada (contrato externo permanece curto)
// ---------------------------------------------------------------------------

const ParamActivityId = z.object({
  id_atividade: z.string().min(1, 'id_atividade é obrigatório'),
})

const ParamSessionId = z.object({
  id_sessao_cronometro: z.string().min(1, 'id_sessao_cronometro é obrigatório'),
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
// ACL helpers (DTO mapping)
// ---------------------------------------------------------------------------

type SessionRow = {
  id_atividades_cronometro: string
  id_organizacao_atividades_cronometro: string
  id_produto_atividades_cronometro: string | null
  id_usuario_atividades_cronometro: string
  id_atividade_atividades_cronometro: string
  data_inicio_atividades_cronometro: Date
  data_fim_atividades_cronometro: Date | null
  duracao_minutos_atividades_cronometro: number | null
  manual_atividades_cronometro: boolean
  assunto_atividades_cronometro: string | null
  tipo_vinculo_atividades_cronometro: string | null
  id_vinculo_atividades_cronometro: string | null
  rotulo_vinculo_atividades_cronometro: string | null
  data_criacao_atividades_cronometro: Date
  data_atualizacao_atividades_cronometro: Date
}

type TimerRow = {
  id_atividades_timer: string
  id_organizacao_atividades_timer: string
  id_usuario_atividades_timer: string
  id_atividade_atividades_timer: string
  data_inicio_atividades_timer: Date
  data_pausa_atividades_timer: Date | null
  segundos_acumulados_atividades_timer: number
  data_criacao_atividades_timer: Date
  data_atualizacao_atividades_timer: Date
}

function toSessionDto(s: SessionRow) {
  return {
    id:                s.id_atividades_cronometro,
    tenant_id:         s.id_organizacao_atividades_cronometro,
    product_id:        s.id_produto_atividades_cronometro,
    user_id:           s.id_usuario_atividades_cronometro,
    activity_id:       s.id_atividade_atividades_cronometro,
    started_at:        s.data_inicio_atividades_cronometro,
    ended_at:          s.data_fim_atividades_cronometro,
    duration_minutes:  s.duracao_minutos_atividades_cronometro,
    is_manual:         s.manual_atividades_cronometro,
    subject:           s.assunto_atividades_cronometro,
    linked_type:       s.tipo_vinculo_atividades_cronometro,
    linked_id:         s.id_vinculo_atividades_cronometro,
    linked_label:      s.rotulo_vinculo_atividades_cronometro,
    created_at:        s.data_criacao_atividades_cronometro,
    updated_at:        s.data_atualizacao_atividades_cronometro,
  }
}

function toTimerDto(t: TimerRow) {
  return {
    id:                  t.id_atividades_timer,
    tenant_id:           t.id_organizacao_atividades_timer,
    user_id:             t.id_usuario_atividades_timer,
    activity_id:         t.id_atividade_atividades_timer,
    started_at:          t.data_inicio_atividades_timer,
    paused_at:           t.data_pausa_atividades_timer,
    accumulated_seconds: t.segundos_acumulados_atividades_timer,
    created_at:          t.data_criacao_atividades_timer,
    updated_at:          t.data_atualizacao_atividades_timer,
  }
}

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
// GET /api/v1/cronometros/stream
// SSE — stream de eventos do timer em tempo real para o usuário autenticado.
// ---------------------------------------------------------------------------

timersRouter.get('/cronometros/stream', (req: Request, res: Response) => {
  const { tenantId, userId } = req.auth
  setupSSEConnection(req, res, tenantId, userId)

  // Envia estado inicial do timer ativo (se houver)
  prisma.usuarioStatusCronometro
    .findFirst({ where: { id_organizacao_atividades_timer: tenantId, id_usuario_atividades_timer: userId } })
    .then((active) => {
      if (active) {
        const elapsed = calcElapsedSeconds(
          active.data_inicio_atividades_timer,
          active.data_pausa_atividades_timer,
          active.segundos_acumulados_atividades_timer
        )
        sseManager.send(tenantId, userId, {
          event: 'timer:state',
          data: {
            active: true,
            activity_id: active.id_atividade_atividades_timer,
            elapsed_seconds: elapsed,
            is_paused: !!active.data_pausa_atividades_timer,
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
// GET /api/v1/cronometros/ativo
// Retorna o timer ativo do usuário autenticado (se houver).
// ---------------------------------------------------------------------------

timersRouter.get('/cronometros/ativo', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, userId } = req.auth

    const active = await prisma.usuarioStatusCronometro.findFirst({
      where: { id_organizacao_atividades_timer: tenantId, id_usuario_atividades_timer: userId },
    })

    if (!active) {
      return res.json({ active: false })
    }

    const elapsed = calcElapsedSeconds(
      active.data_inicio_atividades_timer,
      active.data_pausa_atividades_timer,
      active.segundos_acumulados_atividades_timer
    )

    return res.json({
      active: true,
      id: active.id_atividades_timer,
      activity_id: active.id_atividade_atividades_timer,
      started_at: active.data_inicio_atividades_timer,
      paused_at: active.data_pausa_atividades_timer,
      accumulated_seconds: active.segundos_acumulados_atividades_timer,
      elapsed_seconds: elapsed,
      is_paused: !!active.data_pausa_atividades_timer,
    })
  } catch (err) {
    return next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/atividades/:id_atividade/cronometro
// Lista sessões de uma atividade.
// ---------------------------------------------------------------------------

timersRouter.get('/atividades/:id_atividade/cronometro', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ParamActivityId.safeParse(req.params)
    if (!parsed.success) throw AppError.validation(parsed.error.errors[0].message)

    const { tenantId, userId } = req.auth

    const sessions = await prisma.usuarioHistoricoCronometro.findMany({
      where: {
        id_organizacao_atividades_cronometro: tenantId,
        id_atividade_atividades_cronometro: parsed.data.id_atividade,
        id_usuario_atividades_cronometro: userId,
      },
      orderBy: { data_inicio_atividades_cronometro: 'desc' },
    })

    const total_minutes = sessions.reduce(
      (acc, s) => acc + (s.duracao_minutos_atividades_cronometro ?? 0),
      0
    )

    return res.json({ sessions: sessions.map(toSessionDto), total_minutes })
  } catch (err) {
    return next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/atividades/:id_atividade/cronometro/iniciar
// Inicia o timer para uma atividade.
// Pausa automaticamente qualquer timer ativo de outra atividade.
// ---------------------------------------------------------------------------

timersRouter.post(
  '/atividades/:id_atividade/cronometro/iniciar',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ParamActivityId.safeParse(req.params)
      if (!parsed.success) throw AppError.validation(parsed.error.errors[0].message)

      const { tenantId, userId } = req.auth
      const now = new Date()

      // Pausa qualquer timer ativo existente do usuário
      const existingActive = await prisma.usuarioStatusCronometro.findFirst({
        where: { id_organizacao_atividades_timer: tenantId, id_usuario_atividades_timer: userId },
      })

      if (existingActive) {
        if (existingActive.id_atividade_atividades_timer === parsed.data.id_atividade) {
          // Timer já ativo nesta atividade — retorna estado atual
          if (!existingActive.data_pausa_atividades_timer) {
            return res.status(409).json({
              error: { code: 'ALREADY_RUNNING', message: 'Timer já está em execução para esta atividade.' },
            })
          }
          // Estava pausado — retoma em vez de iniciar novo
          const updated = await prisma.usuarioStatusCronometro.update({
            where: { id_atividades_timer: existingActive.id_atividades_timer },
            data: { data_pausa_atividades_timer: null },
          })
          emitTimerEvent(tenantId, userId, 'timer:resumed', {
            activity_id: parsed.data.id_atividade,
            elapsed_seconds: calcElapsedSeconds(
              updated.data_inicio_atividades_timer,
              null,
              updated.segundos_acumulados_atividades_timer
            ),
          })
          return res.json({ message: 'Timer retomado.', timer: toTimerDto(updated) })
        }

        // Timer em outra atividade — pausar automaticamente antes de iniciar
        const accumulatedBeforePause = calcElapsedSeconds(
          existingActive.data_inicio_atividades_timer,
          existingActive.data_pausa_atividades_timer,
          existingActive.segundos_acumulados_atividades_timer
        )
        await prisma.usuarioStatusCronometro.update({
          where: { id_atividades_timer: existingActive.id_atividades_timer },
          data: {
            data_pausa_atividades_timer: now,
            segundos_acumulados_atividades_timer: accumulatedBeforePause,
          },
        })
        emitTimerEvent(tenantId, userId, 'timer:paused', {
          activity_id: existingActive.id_atividade_atividades_timer,
          elapsed_seconds: accumulatedBeforePause,
        })
      }

      // Cria ou recria o timer ativo para esta atividade
      // Upsert via deleteMany + create em transação para garantir unicidade por user_id
      const newActive = await prisma.$transaction(async (tx) => {
        if (existingActive) {
          // Se havia timer ativo em outra atividade, removemos e criamos novo
          await tx.usuarioStatusCronometro.deleteMany({
            where: {
              id_organizacao_atividades_timer: tenantId,
              id_usuario_atividades_timer: userId,
            },
          })
        }

        return tx.usuarioStatusCronometro.create({
          data: {
            id_organizacao_atividades_timer:      tenantId,
            id_usuario_atividades_timer:          userId,
            id_atividade_atividades_timer:        parsed.data.id_atividade,
            data_inicio_atividades_timer:         now,
            data_pausa_atividades_timer:          null,
            segundos_acumulados_atividades_timer: 0,
          },
        })
      })

      emitTimerEvent(tenantId, userId, 'timer:started', {
        activity_id: parsed.data.id_atividade,
        started_at: now,
      })

      return res.status(201).json({ message: 'Timer iniciado.', timer: toTimerDto(newActive) })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// POST /api/v1/atividades/:id_atividade/cronometro/pausar
// Pausa o timer ativo.
// ---------------------------------------------------------------------------

timersRouter.post(
  '/atividades/:id_atividade/cronometro/pausar',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ParamActivityId.safeParse(req.params)
      if (!parsed.success) throw AppError.validation(parsed.error.errors[0].message)

      const { tenantId, userId } = req.auth
      const now = new Date()

      const active = await prisma.usuarioStatusCronometro.findFirst({
        where: {
          id_organizacao_atividades_timer: tenantId,
          id_usuario_atividades_timer: userId,
          id_atividade_atividades_timer: parsed.data.id_atividade,
        },
      })

      if (!active) throw AppError.notFound('Timer ativo')
      if (active.data_pausa_atividades_timer) {
        throw new AppError('Timer já está pausado.', 409, 'ALREADY_PAUSED')
      }

      const elapsed = calcElapsedSeconds(
        active.data_inicio_atividades_timer,
        null,
        active.segundos_acumulados_atividades_timer
      )

      const updated = await prisma.usuarioStatusCronometro.update({
        where: { id_atividades_timer: active.id_atividades_timer },
        data: {
          data_pausa_atividades_timer:          now,
          segundos_acumulados_atividades_timer: elapsed,
        },
      })

      emitTimerEvent(tenantId, userId, 'timer:paused', {
        activity_id: parsed.data.id_atividade,
        elapsed_seconds: elapsed,
      })

      return res.json({ message: 'Timer pausado.', elapsed_seconds: elapsed, timer: toTimerDto(updated) })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// POST /api/v1/atividades/:id_atividade/cronometro/parar
// Para e salva a sessão. Descarta se < 1 minuto.
// ---------------------------------------------------------------------------

timersRouter.post(
  '/atividades/:id_atividade/cronometro/parar',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ParamActivityId.safeParse(req.params)
      if (!parsed.success) throw AppError.validation(parsed.error.errors[0].message)

      const { tenantId, userId } = req.auth
      const now = new Date()

      const active = await prisma.usuarioStatusCronometro.findFirst({
        where: {
          id_organizacao_atividades_timer: tenantId,
          id_usuario_atividades_timer: userId,
          id_atividade_atividades_timer: parsed.data.id_atividade,
        },
      })

      if (!active) throw AppError.notFound('Timer ativo')

      const totalSeconds = calcElapsedSeconds(
        active.data_inicio_atividades_timer,
        active.data_pausa_atividades_timer,
        active.segundos_acumulados_atividades_timer
      )

      // Descarta sessões com menos de 1 minuto (exceto manuais)
      await prisma.usuarioStatusCronometro.deleteMany({
        where: { id_atividades_timer: active.id_atividades_timer },
      })

      const durationMinutes = secondsToMinutes(totalSeconds)

      if (durationMinutes < 1) {
        emitTimerEvent(tenantId, userId, 'timer:stopped', {
          activity_id: parsed.data.id_atividade,
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
      const session = await prisma.usuarioHistoricoCronometro.create({
        data: {
          id_organizacao_atividades_cronometro:  tenantId,
          id_usuario_atividades_cronometro:      userId,
          id_atividade_atividades_cronometro:    parsed.data.id_atividade,
          id_produto_atividades_cronometro:      (req.body as { product_id?: string }).product_id ?? null,
          data_inicio_atividades_cronometro:     active.data_inicio_atividades_timer,
          data_fim_atividades_cronometro:        now,
          duracao_minutos_atividades_cronometro: durationMinutes,
          manual_atividades_cronometro:          false,
        },
      })

      emitTimerEvent(tenantId, userId, 'timer:stopped', {
        activity_id: parsed.data.id_atividade,
        duration_minutes: durationMinutes,
        session_id: session.id_atividades_cronometro,
      })

      return res.json({ message: 'Sessão salva.', session: toSessionDto(session), duration_minutes: durationMinutes })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// POST /api/v1/atividades/:id_atividade/cronometro/lancar-manual
// Lança tempo manualmente. Assunto obrigatório.
// ---------------------------------------------------------------------------

timersRouter.post(
  '/atividades/:id_atividade/cronometro/lancar-manual',
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

      const session = await prisma.usuarioHistoricoCronometro.create({
        data: {
          id_organizacao_atividades_cronometro:  tenantId,
          id_usuario_atividades_cronometro:      userId,
          id_atividade_atividades_cronometro:    paramParsed.data.id_atividade,
          id_produto_atividades_cronometro:      product_id ?? null,
          data_inicio_atividades_cronometro:     startedDate,
          data_fim_atividades_cronometro:        endedDate,
          duracao_minutos_atividades_cronometro: duration_minutes,
          manual_atividades_cronometro:          true,
          assunto_atividades_cronometro:         subject,
          tipo_vinculo_atividades_cronometro:    linked_type ?? null,
          id_vinculo_atividades_cronometro:      linked_id ?? null,
          rotulo_vinculo_atividades_cronometro:  linked_label ?? null,
        },
      })

      return res.status(201).json({ message: 'Sessão manual criada.', session: toSessionDto(session) })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// PATCH /api/v1/cronometros/sessoes/:id_sessao_cronometro
// Edita assunto / vínculo de uma sessão existente.
// ---------------------------------------------------------------------------

timersRouter.patch(
  '/cronometros/sessoes/:id_sessao_cronometro',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramParsed = ParamSessionId.safeParse(req.params)
      if (!paramParsed.success) throw AppError.validation(paramParsed.error.errors[0].message)

      const bodyParsed = PatchSessionSchema.safeParse(req.body)
      if (!bodyParsed.success) throw AppError.validation(bodyParsed.error.errors[0].message)

      const { tenantId, userId } = req.auth

      const existing = await prisma.usuarioHistoricoCronometro.findFirst({
        where: {
          id_atividades_cronometro:             paramParsed.data.id_sessao_cronometro,
          id_organizacao_atividades_cronometro: tenantId,
          id_usuario_atividades_cronometro:     userId,
        },
      })
      if (!existing) throw AppError.notFound('Sessão')

      const updated = await prisma.usuarioHistoricoCronometro.update({
        where: { id_atividades_cronometro: paramParsed.data.id_sessao_cronometro },
        data: {
          ...(bodyParsed.data.subject !== undefined &&      { assunto_atividades_cronometro: bodyParsed.data.subject }),
          ...(bodyParsed.data.linked_type !== undefined &&  { tipo_vinculo_atividades_cronometro: bodyParsed.data.linked_type }),
          ...(bodyParsed.data.linked_id !== undefined &&    { id_vinculo_atividades_cronometro: bodyParsed.data.linked_id }),
          ...(bodyParsed.data.linked_label !== undefined && { rotulo_vinculo_atividades_cronometro: bodyParsed.data.linked_label }),
        },
      })

      return res.json({ session: toSessionDto(updated) })
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// DELETE /api/v1/cronometros/sessoes/:id_sessao_cronometro
// Deleta uma sessão.
// ---------------------------------------------------------------------------

timersRouter.delete(
  '/cronometros/sessoes/:id_sessao_cronometro',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paramParsed = ParamSessionId.safeParse(req.params)
      if (!paramParsed.success) throw AppError.validation(paramParsed.error.errors[0].message)

      const { tenantId, userId } = req.auth

      const existing = await prisma.usuarioHistoricoCronometro.findFirst({
        where: {
          id_atividades_cronometro:             paramParsed.data.id_sessao_cronometro,
          id_organizacao_atividades_cronometro: tenantId,
          id_usuario_atividades_cronometro:     userId,
        },
      })
      if (!existing) throw AppError.notFound('Sessão')

      await prisma.usuarioHistoricoCronometro.delete({ where: { id_atividades_cronometro: paramParsed.data.id_sessao_cronometro } })

      return res.status(204).send()
    } catch (err) {
      return next(err)
    }
  }
)

// ---------------------------------------------------------------------------
// GET /api/v1/cronometros/relatorio
// Relatório de horas por período, cliente e projeto.
// NÃO duplica lógica do serviço relatorios — apenas agrega dados de sessões.
// ---------------------------------------------------------------------------

timersRouter.get('/cronometros/relatorio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryParsed = ReportQuerySchema.safeParse(req.query)
    if (!queryParsed.success) throw AppError.validation(queryParsed.error.errors[0].message)

    const { tenantId, userId } = req.auth
    const { user_id, product_id, activity_id, period_start, period_end } = queryParsed.data

    // Usuários comuns só podem ver seu próprio relatório
    const effectiveUserId =
      req.auth.role === 'admin' ? user_id ?? userId : userId

    const sessions = await prisma.usuarioHistoricoCronometro.findMany({
      where: {
        id_organizacao_atividades_cronometro: tenantId,
        id_usuario_atividades_cronometro:     effectiveUserId,
        ...(product_id ?  { id_produto_atividades_cronometro: product_id } : {}),
        ...(activity_id ? { id_atividade_atividades_cronometro: activity_id } : {}),
        data_inicio_atividades_cronometro: {
          gte: new Date(period_start),
          lte: new Date(period_end),
        },
        // Apenas sessões concluídas
        duracao_minutos_atividades_cronometro: { not: null },
      },
      orderBy: { data_inicio_atividades_cronometro: 'asc' },
    })

    // Agrega por atividade
    const byActivity: Record<string, { activity_id: string; total_minutes: number; sessions_count: number }> = {}
    let totalMinutes = 0

    for (const session of sessions) {
      const dur = session.duracao_minutos_atividades_cronometro ?? 0
      totalMinutes += dur
      const key = session.id_atividade_atividades_cronometro
      if (!byActivity[key]) {
        byActivity[key] = { activity_id: key, total_minutes: 0, sessions_count: 0 }
      }
      byActivity[key].total_minutes += dur
      byActivity[key].sessions_count++
    }

    // Agrega por produto (se id_produto disponível)
    const byProduct: Record<string, { product_id: string; total_minutes: number }> = {}
    for (const session of sessions) {
      const prdId = session.id_produto_atividades_cronometro
      if (!prdId) continue
      if (!byProduct[prdId]) {
        byProduct[prdId] = { product_id: prdId, total_minutes: 0 }
      }
      byProduct[prdId].total_minutes += session.duracao_minutos_atividades_cronometro ?? 0
    }

    return res.json({
      period: { start: period_start, end: period_end },
      user_id: effectiveUserId,
      total_minutes: totalMinutes,
      total_hours: +(totalMinutes / 60).toFixed(2),
      sessions_count: sessions.length,
      by_activity: Object.values(byActivity),
      by_product: Object.values(byProduct),
      sessions: sessions.map(toSessionDto),
    })
  } catch (err) {
    return next(err)
  }
})
