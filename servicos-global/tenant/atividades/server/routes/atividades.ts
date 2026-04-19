// server/routes/atividades.ts
// CRUD completo para Atividades (Minhas Atividades — Tasks Board)
// Portado do Journey tasks-board.js — suporta Kanban, participantes, timer e filtros.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '@tenant/middleware/withTenantIsolation.js'

const router = Router()

// ---------------------------------------------------------------------------
// Constantes (espelham o Journey)
// ---------------------------------------------------------------------------

const KANBAN_STATUSES = ['A Fazer', 'Em Andamento', 'Concluída', 'Cancelada'] as const
const PRIORIDADES     = ['baixa', 'média', 'alta', 'urgente'] as const
const TIPOS           = ['Comentário', 'Reunião', 'Chamados HD', 'Chamados CS', 'Ação necessária', 'Tarefa', 'Outros'] as const

// ---------------------------------------------------------------------------
// Schemas Zod
// ---------------------------------------------------------------------------

const participanteSchema = z.object({
  user_id:   z.string().min(1),
  user_nome: z.string().optional(),
})

const createSchema = z.object({
  titulo:                 z.string().min(1).max(300),
  descricao:              z.string().optional(),
  tipo:                   z.enum(TIPOS).default('Tarefa'),
  status:                 z.enum(KANBAN_STATUSES).default('A Fazer'),
  prioridade:             z.enum(PRIORIDADES).optional(),
  data_atividade:         z.string().datetime().optional(),
  data_vencimento:        z.string().datetime().optional(),
  proximo_passo_titulo:   z.string().optional(),
  proximo_passo_data:     z.string().datetime().optional(),
  lembrete_em:            z.string().datetime().optional(),
  lembrete_email:         z.boolean().default(false),
  lembrete_whatsapp:      z.boolean().default(false),
  notificar_ao_atribuir:  z.boolean().default(false),
  processo_id:            z.string().optional(),
  participantes:          z.array(participanteSchema).default([]),
})

const updateSchema = createSchema.partial()

const listQuerySchema = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(200).default(100),
  busca:      z.string().optional(),
  status:     z.enum(KANBAN_STATUSES).optional(),
  tipo:       z.enum(TIPOS).optional(),
  prioridade: z.enum(PRIORIDADES).optional(),
  assignee:   z.literal('me').optional(), // filtrar pelo usuário logado (criador ou participante)
  prazo:      z.enum(['atrasado', 'hoje', 'futuro', 'sem_prazo']).optional(),
  data_de:    z.string().optional(),
  data_ate:   z.string().optional(),
})

const timerSessaoSchema = z.object({
  iniciado_em: z.string().datetime(),
  duracao_min: z.number().int().min(1),
  assunto:     z.string().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/v1/atividades
// ---------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const q = listQuerySchema.safeParse(req.query)
    if (!q.success) throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')

    const { page, limit, busca, status, tipo, prioridade, assignee, prazo, data_de, data_ate } = q.data
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    // Filtro base
    const where = {} as Record<string, unknown>

    // assignee=me : atividades criadas pelo usuário OU onde é participante
    if (assignee === 'me' && req.auth.userId) {
      where.OR = [
        { user_id: req.auth.userId },
        { participantes: { some: { user_id: req.auth.userId } } },
      ]
    }

    if (busca) {
      where.OR = [
        ...(where.OR ?? []),
        { titulo:    { contains: busca, mode: 'insensitive' } },
        { descricao: { contains: busca, mode: 'insensitive' } },
      ]
    }

    if (status)     where.status     = status
    if (tipo)       where.tipo       = tipo
    if (prioridade) where.prioridade = prioridade

    // Filtros de prazo
    if (prazo) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

      if (prazo === 'sem_prazo')  where.data_atividade = null
      if (prazo === 'atrasado')   where.data_atividade = { lt: today }
      if (prazo === 'hoje')       where.data_atividade = { gte: today, lt: tomorrow }
      if (prazo === 'futuro')     where.data_atividade = { gte: tomorrow }
    }

    // Filtro de intervalo de datas
    if (data_de || data_ate) {
      where.data_atividade = where.data_atividade ?? {}
      if (data_de)  where.data_atividade.gte = new Date(data_de + 'T00:00:00')
      if (data_ate) where.data_atividade.lte = new Date(data_ate + 'T23:59:59')
    }

    const [total, atividades] = await Promise.all([
      db.atividadesDados.count({ where }),
      db.atividadesDados.findMany({
        where,
        include: {
          participantes: true,
          sessoes_timer: { orderBy: { iniciado_em: 'desc' }, take: 20 },
        },
        orderBy: [{ created_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.json({
      data: atividades,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/atividades/:id
// ---------------------------------------------------------------------------

router.get('/:id', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const atividade = await db.atividadesDados.findFirst({
      where: { id: req.params.id },
      include: {
        participantes: true,
        sessoes_timer: { orderBy: { iniciado_em: 'desc' } },
      },
    })
    if (!atividade) throw new AppError('AtividadesDados não encontrada', 404, 'NOT_FOUND')
    res.json(atividade)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/atividades
// ---------------------------------------------------------------------------

router.post('/', async (req, res, next) => {
  try {
    const result = createSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: result.error.flatten() },
      })
    }

    const { participantes, ...data } = result.data
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const atividade = await db.atividadesDados.create({
      data: {
        ...data,
        user_id: req.auth.userId,
        participantes: {
          create: participantes.map(p => ({
            user_id:   p.user_id,
            user_nome: p.user_nome,
          })),
        },
      },
      include: { participantes: true, sessoes_timer: true },
    })

    res.status(201).json(atividade)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/atividades/:id
// ---------------------------------------------------------------------------

router.patch('/:id', async (req, res, next) => {
  try {
    const result = updateSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: result.error.flatten() },
      })
    }

    const { participantes, ...data } = result.data
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const existing = await db.atividadesDados.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('AtividadesDados não encontrada', 404, 'NOT_FOUND')

    const atividade = await db.atividadesDados.update({
      where: { id: req.params.id },
      data: {
        ...data,
        // Substitui participantes se enviados
        ...(participantes !== undefined && {
          participantes: {
            deleteMany: {},
            create: participantes.map(p => ({
              user_id:   p.user_id,
              user_nome: p.user_nome,
            })),
          },
        }),
      },
      include: { participantes: true, sessoes_timer: true },
    })

    res.json(atividade)
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/atividades/:id
// ---------------------------------------------------------------------------

router.delete('/:id', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const existing = await db.atividadesDados.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('AtividadesDados não encontrada', 404, 'NOT_FOUND')
    await db.atividadesDados.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/atividades/:id/timer — registra sessão de tempo
// ---------------------------------------------------------------------------

router.post('/:id/timer', async (req, res, next) => {
  try {
    const result = timerSessaoSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: result.error.flatten() },
      })
    }

    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const existing = await db.atividadesDados.findFirst({ where: { id: req.params.id } })
    if (!existing) throw new AppError('AtividadesDados não encontrada', 404, 'NOT_FOUND')

    // Registra a sessão e incrementa o total acumulado
    const [sessao] = await Promise.all([
      db.atividadesTempo.create({
        data: {
          atividade_id: req.params.id,
          iniciado_em:  new Date(result.data.iniciado_em),
          duracao_min:  result.data.duracao_min,
          assunto:      result.data.assunto,
        },
      }),
      db.atividadesDados.update({
        where: { id: req.params.id },
        data: { tempo_gasto_minutos: { increment: result.data.duracao_min } },
      }),
    ])

    res.status(201).json(sessao)
  } catch (err) {
    next(err)
  }
})

export { router as atividadesRouter }
