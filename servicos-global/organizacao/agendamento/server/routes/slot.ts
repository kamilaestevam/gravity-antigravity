import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { AgendamentoService } from '../../src/services/AgendamentoService.js'

export const slotRouter = Router({ mergeParams: true })

const slotSchema = z.object({
  agenda_id: z.string().min(1).optional(),
  inicio: z.string().datetime(),
  fim: z.string().datetime(),
  capacidade: z.number().int().positive().default(1),
  product_id: z.string().optional().nullable(),
})

const generateSlotsSchema = z.object({
  agenda_id: z.string().min(1).optional(),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
})

// ---- ACL DTO ----
function toSlotDto(s: {
  id_horario_disponivel: string
  id_organizacao_horario_disponivel: string
  id_produto_horario_disponivel: string | null
  id_usuario_horario_disponivel: string | null
  id_agenda_horario_disponivel: string
  inicio_horario_disponivel: Date
  fim_horario_disponivel: Date
  capacidade_horario_disponivel: number
  data_criacao_horario_disponivel: Date
  data_atualizacao_horario_disponivel: Date
}) {
  return {
    id: s.id_horario_disponivel,
    tenant_id: s.id_organizacao_horario_disponivel,
    product_id: s.id_produto_horario_disponivel,
    user_id: s.id_usuario_horario_disponivel,
    agenda_id: s.id_agenda_horario_disponivel,
    inicio: s.inicio_horario_disponivel,
    fim: s.fim_horario_disponivel,
    capacidade: s.capacidade_horario_disponivel,
    created_at: s.data_criacao_horario_disponivel,
    updated_at: s.data_atualizacao_horario_disponivel,
  }
}

slotRouter.post('/', async (req, res, next) => {
  try {
    const data = slotSchema.parse(req.body)
    const { tenantId, userId } = req.auth
    const id_agenda = ((req.params as { id_agenda?: string }).id_agenda) ?? data.agenda_id
    if (!id_agenda) {
      throw new AppError('id_agenda obrigatório', 400)
    }

    const slot = await prisma.horarioDisponivel.create({
      data: {
        id_organizacao_horario_disponivel: tenantId,
        id_usuario_horario_disponivel: userId || null,
        id_produto_horario_disponivel: data.product_id ?? null,
        id_agenda_horario_disponivel: id_agenda,
        inicio_horario_disponivel: new Date(data.inicio),
        fim_horario_disponivel: new Date(data.fim),
        capacidade_horario_disponivel: data.capacidade,
      },
    })
    res.status(201).json(toSlotDto(slot))
  } catch (error) {
    next(error)
  }
})

slotRouter.post('/gerar', async (req, res, next) => {
  try {
    const data = generateSlotsSchema.parse(req.body)
    const id_agenda = ((req.params as { id_agenda?: string }).id_agenda) ?? data.agenda_id
    if (!id_agenda) {
      throw new AppError('id_agenda obrigatório', 400)
    }
    const service = new AgendamentoService()
    const slotsCriados = await service.gerarSlots(
      req.auth.tenantId,
      id_agenda,
      new Date(data.dataInicio),
      new Date(data.dataFim),
    )
    res.status(201).json({ gerados: slotsCriados.length, slots: slotsCriados })
  } catch (error) {
    next(error)
  }
})

slotRouter.get('/', async (req, res, next) => {
  try {
    const { id_agenda } = req.params as { id_agenda: string }
    const { tenantId } = req.auth

    const slots = await prisma.horarioDisponivel.findMany({
      where: {
        id_agenda_horario_disponivel: id_agenda,
        id_organizacao_horario_disponivel: tenantId,
      },
      orderBy: { inicio_horario_disponivel: 'asc' },
    })
    res.json(slots.map(toSlotDto))
  } catch (error) {
    next(error)
  }
})

slotRouter.delete('/:id_horario_disponivel', async (req, res, next) => {
  try {
    const { id_horario_disponivel } = req.params as { id_horario_disponivel: string }
    const { tenantId } = req.auth

    const existing = await prisma.horarioDisponivel.findFirst({
      where: {
        id_horario_disponivel: id_horario_disponivel,
        id_organizacao_horario_disponivel: tenantId,
      },
    })
    if (!existing) {
      throw new AppError('Slot não encontrado', 404)
    }

    await prisma.horarioDisponivel.delete({
      where: { id_horario_disponivel: id_horario_disponivel },
    })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
