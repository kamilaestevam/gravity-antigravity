// server/routes/atividades.ts
// CRUD completo para Atividades (Minhas Atividades — Tasks Board)
// Portado do Journey tasks-board.js — suporta Kanban, participantes, timer e filtros.
//
// Onda 26 (DDD Servicos): bypass withTenantIsolation — o middleware injeta `tenant_id`,
// mas a coluna física agora é `id_organizacao_atividades_dados`. Usamos prisma direto
// com filtro explícito + ACL/DTO map nas bordas para preservar o contrato externo.

import { Router } from 'express'
import { z } from 'zod'
import { prisma as prismaDefault } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
// O singleton em lib/prisma.ts importa do @prisma/client (compat para outros routers
// que ainda dependem do schema legado via @prisma/client + withTenantIsolation).
// Aqui re-tipamos para o client gerado em tenant/generated/, único que expõe os
// fields DDD (id_organizacao_atividades_dados, etc.) renomeados nesta onda.
import type { PrismaClient as TenantPrismaClient } from '../../../generated/index.js'
const prisma = prismaDefault as unknown as TenantPrismaClient

const router = Router()

// ---------------------------------------------------------------------------
// Constantes (espelham o Journey)
// ---------------------------------------------------------------------------

const KANBAN_STATUSES = ['A Fazer', 'Em Andamento', 'Concluída', 'Cancelada'] as const
const PRIORIDADES     = ['baixa', 'média', 'alta', 'urgente'] as const
const TIPOS           = ['Comentário', 'Reunião', 'Chamados HD', 'Chamados CS', 'Ação necessária', 'Tarefa', 'Outros'] as const

// ---------------------------------------------------------------------------
// Schemas Zod (contrato externo permanece com chaves curtas)
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
// ACL helpers — DTO mapping (Prisma row → contrato legado)
// ---------------------------------------------------------------------------

type ParticipanteRow = {
  id_atividades_participantes: string
  id_atividades_dados_atividades_participantes: string
  id_usuario_atividades_participantes: string
  nome_usuario_atividades_participantes: string | null
}

type SessaoTimerRow = {
  id_atividades_tempo: string
  id_atividades_dados_atividades_tempo: string
  iniciado_em_atividades_tempo: Date
  duracao_min_atividades_tempo: number
  assunto_atividades_tempo: string | null
}

type AtividadeRow = {
  id_atividades_dados: string
  id_organizacao_atividades_dados: string
  id_usuario_atividades_dados: string | null
  titulo_atividades_dados: string
  descricao_atividades_dados: string | null
  tipo_atividades_dados: string
  status_atividades_dados: string
  prioridade_atividades_dados: string | null
  data_atividade_atividades_dados: Date | null
  data_vencimento_atividades_dados: Date | null
  tempo_gasto_minutos_atividades_dados: number
  proximo_passo_titulo_atividades_dados: string | null
  proximo_passo_data_atividades_dados: Date | null
  lembrete_em_atividades_dados: Date | null
  lembrete_email_atividades_dados: boolean
  lembrete_whatsapp_atividades_dados: boolean
  notificar_ao_atribuir_atividades_dados: boolean
  id_processo_atividades_dados: string | null
  data_criacao_atividades_dados: Date
  data_atualizacao_atividades_dados: Date
  participantes_atividades_dados?: ParticipanteRow[]
  sessoes_timer_atividades_dados?: SessaoTimerRow[]
}

function toParticipanteDto(p: ParticipanteRow) {
  return {
    id:           p.id_atividades_participantes,
    atividade_id: p.id_atividades_dados_atividades_participantes,
    user_id:      p.id_usuario_atividades_participantes,
    user_nome:    p.nome_usuario_atividades_participantes,
  }
}

function toSessaoTimerDto(s: SessaoTimerRow) {
  return {
    id:           s.id_atividades_tempo,
    atividade_id: s.id_atividades_dados_atividades_tempo,
    iniciado_em:  s.iniciado_em_atividades_tempo,
    duracao_min:  s.duracao_min_atividades_tempo,
    assunto:      s.assunto_atividades_tempo,
  }
}

function toAtividadeDto(row: AtividadeRow) {
  return {
    id:                    row.id_atividades_dados,
    tenant_id:             row.id_organizacao_atividades_dados,
    user_id:               row.id_usuario_atividades_dados,
    titulo:                row.titulo_atividades_dados,
    descricao:             row.descricao_atividades_dados,
    tipo:                  row.tipo_atividades_dados,
    status:                row.status_atividades_dados,
    prioridade:            row.prioridade_atividades_dados,
    data_atividade:        row.data_atividade_atividades_dados,
    data_vencimento:       row.data_vencimento_atividades_dados,
    tempo_gasto_minutos:   row.tempo_gasto_minutos_atividades_dados,
    proximo_passo_titulo:  row.proximo_passo_titulo_atividades_dados,
    proximo_passo_data:    row.proximo_passo_data_atividades_dados,
    lembrete_em:           row.lembrete_em_atividades_dados,
    lembrete_email:        row.lembrete_email_atividades_dados,
    lembrete_whatsapp:     row.lembrete_whatsapp_atividades_dados,
    notificar_ao_atribuir: row.notificar_ao_atribuir_atividades_dados,
    processo_id:           row.id_processo_atividades_dados,
    created_at:            row.data_criacao_atividades_dados,
    updated_at:            row.data_atualizacao_atividades_dados,
    participantes: row.participantes_atividades_dados?.map(toParticipanteDto) ?? [],
    sessoes_timer: row.sessoes_timer_atividades_dados?.map(toSessaoTimerDto) ?? [],
  }
}

// Inclusão padrão para retornar sub-relações
const ATIVIDADE_INCLUDE = {
  participantes_atividades_dados: true,
  sessoes_timer_atividades_dados: { orderBy: { iniciado_em_atividades_tempo: 'desc' as const } },
}

// ---------------------------------------------------------------------------
// GET /api/v1/atividades
// ---------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const q = listQuerySchema.safeParse(req.query)
    if (!q.success) throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')

    const { page, limit, busca, status, tipo, prioridade, assignee, prazo, data_de, data_ate } = q.data
    const tenantId = req.auth.id_organizacao

    // Filtro base — sempre filtra por tenant via campo físico DDD
    const where: Record<string, unknown> = {
      id_organizacao_atividades_dados: tenantId,
    }

    // assignee=me : atividades criadas pelo usuário OU onde é participante
    if (assignee === 'me' && req.auth.id_usuario) {
      where.OR = [
        { id_usuario_atividades_dados: req.auth.id_usuario },
        { participantes_atividades_dados: { some: { id_usuario_atividades_participantes: req.auth.id_usuario } } },
      ]
    }

    if (busca) {
      const orList = (where.OR as Array<Record<string, unknown>> | undefined) ?? []
      where.OR = [
        ...orList,
        { titulo_atividades_dados:    { contains: busca, mode: 'insensitive' } },
        { descricao_atividades_dados: { contains: busca, mode: 'insensitive' } },
      ]
    }

    if (status)     where.status_atividades_dados     = status
    if (tipo)       where.tipo_atividades_dados       = tipo
    if (prioridade) where.prioridade_atividades_dados = prioridade

    // Filtros de prazo
    if (prazo) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

      if (prazo === 'sem_prazo')  where.data_atividade_atividades_dados = null
      if (prazo === 'atrasado')   where.data_atividade_atividades_dados = { lt: today }
      if (prazo === 'hoje')       where.data_atividade_atividades_dados = { gte: today, lt: tomorrow }
      if (prazo === 'futuro')     where.data_atividade_atividades_dados = { gte: tomorrow }
    }

    // Filtro de intervalo de datas
    if (data_de || data_ate) {
      const range = (where.data_atividade_atividades_dados as Record<string, Date> | undefined) ?? {}
      if (data_de)  range.gte = new Date(data_de + 'T00:00:00')
      if (data_ate) range.lte = new Date(data_ate + 'T23:59:59')
      where.data_atividade_atividades_dados = range
    }

    const [total, rows] = await Promise.all([
      prisma.atividadeDados.count({ where }),
      prisma.atividadeDados.findMany({
        where,
        include: {
          participantes_atividades_dados: true,
          sessoes_timer_atividades_dados: { orderBy: { iniciado_em_atividades_tempo: 'desc' }, take: 20 },
        },
        orderBy: [{ data_criacao_atividades_dados: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    res.json({
      data: rows.map(toAtividadeDto),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// GET /api/v1/atividades/:id_atividade
// ---------------------------------------------------------------------------

router.get('/:id_atividade', async (req, res, next) => {
  try {
    const tenantId = req.auth.id_organizacao
    const row = await prisma.atividadeDados.findFirst({
      where: {
        id_atividades_dados: req.params.id_atividade,
        id_organizacao_atividades_dados: tenantId,
      },
      include: ATIVIDADE_INCLUDE,
    })
    if (!row) throw new AppError('AtividadeDados não encontrada', 404, 'NOT_FOUND')
    res.json(toAtividadeDto(row))
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
    const tenantId = req.auth.id_organizacao

    const row = await prisma.atividadeDados.create({
      data: {
        id_organizacao_atividades_dados:           tenantId,
        id_usuario_atividades_dados:               req.auth.id_usuario,
        titulo_atividades_dados:                   data.titulo,
        descricao_atividades_dados:                data.descricao,
        tipo_atividades_dados:                     data.tipo,
        status_atividades_dados:                   data.status,
        prioridade_atividades_dados:               data.prioridade,
        data_atividade_atividades_dados:           data.data_atividade ? new Date(data.data_atividade) : undefined,
        data_vencimento_atividades_dados:          data.data_vencimento ? new Date(data.data_vencimento) : undefined,
        proximo_passo_titulo_atividades_dados:     data.proximo_passo_titulo,
        proximo_passo_data_atividades_dados:       data.proximo_passo_data ? new Date(data.proximo_passo_data) : undefined,
        lembrete_em_atividades_dados:              data.lembrete_em ? new Date(data.lembrete_em) : undefined,
        lembrete_email_atividades_dados:           data.lembrete_email,
        lembrete_whatsapp_atividades_dados:        data.lembrete_whatsapp,
        notificar_ao_atribuir_atividades_dados:    data.notificar_ao_atribuir,
        id_processo_atividades_dados:              data.processo_id,
        participantes_atividades_dados: {
          create: participantes.map(p => ({
            id_usuario_atividades_participantes:   p.user_id,
            nome_usuario_atividades_participantes: p.user_nome,
          })),
        },
      },
      include: ATIVIDADE_INCLUDE,
    })

    res.status(201).json(toAtividadeDto(row))
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/atividades/:id_atividade
// ---------------------------------------------------------------------------

router.patch('/:id_atividade', async (req, res, next) => {
  try {
    const result = updateSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: result.error.flatten() },
      })
    }

    const { participantes, ...data } = result.data
    const tenantId = req.auth.id_organizacao

    const existing = await prisma.atividadeDados.findFirst({
      where: { id_atividades_dados: req.params.id_atividade, id_organizacao_atividades_dados: tenantId },
    })
    if (!existing) throw new AppError('AtividadeDados não encontrada', 404, 'NOT_FOUND')

    // updateMany com where composto evita update cross-tenant; depois lemos o registro.
    await prisma.atividadeDados.update({
      where: { id_atividades_dados: req.params.id_atividade },
      data: {
        ...(data.titulo !== undefined &&                { titulo_atividades_dados: data.titulo }),
        ...(data.descricao !== undefined &&             { descricao_atividades_dados: data.descricao }),
        ...(data.tipo !== undefined &&                  { tipo_atividades_dados: data.tipo }),
        ...(data.status !== undefined &&                { status_atividades_dados: data.status }),
        ...(data.prioridade !== undefined &&            { prioridade_atividades_dados: data.prioridade }),
        ...(data.data_atividade !== undefined &&        { data_atividade_atividades_dados: data.data_atividade ? new Date(data.data_atividade) : null }),
        ...(data.data_vencimento !== undefined &&       { data_vencimento_atividades_dados: data.data_vencimento ? new Date(data.data_vencimento) : null }),
        ...(data.proximo_passo_titulo !== undefined &&  { proximo_passo_titulo_atividades_dados: data.proximo_passo_titulo }),
        ...(data.proximo_passo_data !== undefined &&    { proximo_passo_data_atividades_dados: data.proximo_passo_data ? new Date(data.proximo_passo_data) : null }),
        ...(data.lembrete_em !== undefined &&           { lembrete_em_atividades_dados: data.lembrete_em ? new Date(data.lembrete_em) : null }),
        ...(data.lembrete_email !== undefined &&        { lembrete_email_atividades_dados: data.lembrete_email }),
        ...(data.lembrete_whatsapp !== undefined &&     { lembrete_whatsapp_atividades_dados: data.lembrete_whatsapp }),
        ...(data.notificar_ao_atribuir !== undefined && { notificar_ao_atribuir_atividades_dados: data.notificar_ao_atribuir }),
        ...(data.processo_id !== undefined &&           { id_processo_atividades_dados: data.processo_id }),
        // Substitui participantes se enviados
        ...(participantes !== undefined && {
          participantes_atividades_dados: {
            deleteMany: {},
            create: participantes.map(p => ({
              id_usuario_atividades_participantes:   p.user_id,
              nome_usuario_atividades_participantes: p.user_nome,
            })),
          },
        }),
      },
    })

    const fresh = await prisma.atividadeDados.findUnique({
      where: { id_atividades_dados: req.params.id_atividade },
      include: ATIVIDADE_INCLUDE,
    })
    if (!fresh) throw new AppError('AtividadeDados não encontrada após update', 500, 'INTERNAL')

    res.json(toAtividadeDto(fresh))
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/atividades/:id_atividade
// ---------------------------------------------------------------------------

router.delete('/:id_atividade', async (req, res, next) => {
  try {
    const tenantId = req.auth.id_organizacao
    const existing = await prisma.atividadeDados.findFirst({
      where: { id_atividades_dados: req.params.id_atividade, id_organizacao_atividades_dados: tenantId },
    })
    if (!existing) throw new AppError('AtividadeDados não encontrada', 404, 'NOT_FOUND')
    await prisma.atividadeDados.delete({ where: { id_atividades_dados: req.params.id_atividade } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// ---------------------------------------------------------------------------
// POST /api/v1/atividades/:id_atividade/cronometro/alternar — registra sessão de tempo
// ---------------------------------------------------------------------------

router.post('/:id_atividade/cronometro/alternar', async (req, res, next) => {
  try {
    const result = timerSessaoSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: result.error.flatten() },
      })
    }

    const tenantId = req.auth.id_organizacao
    const existing = await prisma.atividadeDados.findFirst({
      where: { id_atividades_dados: req.params.id_atividade, id_organizacao_atividades_dados: tenantId },
    })
    if (!existing) throw new AppError('AtividadeDados não encontrada', 404, 'NOT_FOUND')

    // Registra a sessão e incrementa o total acumulado
    const [sessao] = await Promise.all([
      prisma.usuariosAtividadesTempo.create({
        data: {
          id_atividades_dados_atividades_tempo: req.params.id_atividade,
          iniciado_em_atividades_tempo:         new Date(result.data.iniciado_em),
          duracao_min_atividades_tempo:         result.data.duracao_min,
          assunto_atividades_tempo:             result.data.assunto,
        },
      }),
      prisma.atividadeDados.update({
        where: { id_atividades_dados: req.params.id_atividade },
        data: { tempo_gasto_minutos_atividades_dados: { increment: result.data.duracao_min } },
      }),
    ])

    res.status(201).json(toSessaoTimerDto(sessao))
  } catch (err) {
    next(err)
  }
})

export { router as atividadesRouter }
