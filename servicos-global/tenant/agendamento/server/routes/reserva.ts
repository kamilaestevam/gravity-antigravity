import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { AgendamentoService } from '../../src/services/AgendamentoService.js'

export const reservaRouter = Router()

const reservaSchema = z.object({
  slot_id: z.string().min(1),
  usuario_id: z.string().min(1),
  nome: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  product_id: z.string().optional().nullable(),
})

// ---- ACL DTO ----
function toReservaDto(r: {
  id_reserva_agenda: string
  id_organizacao_reserva_agenda: string
  id_produto_reserva_agenda: string | null
  id_usuario_reserva_agenda: string | null
  id_horario_reserva_agenda: string
  id_reservante_reserva_agenda: string
  nome_reservante_reserva_agenda: string | null
  email_reservante_reserva_agenda: string | null
  status_reserva_agenda: string
  data_criacao_reserva_agenda: Date
  data_atualizacao_reserva_agenda: Date
}) {
  return {
    id: r.id_reserva_agenda,
    tenant_id: r.id_organizacao_reserva_agenda,
    product_id: r.id_produto_reserva_agenda,
    user_id: r.id_usuario_reserva_agenda,
    slot_id: r.id_horario_reserva_agenda,
    usuario_id: r.id_reservante_reserva_agenda,
    nome: r.nome_reservante_reserva_agenda,
    email: r.email_reservante_reserva_agenda,
    status: r.status_reserva_agenda,
    created_at: r.data_criacao_reserva_agenda,
    updated_at: r.data_atualizacao_reserva_agenda,
  }
}

reservaRouter.post('/', async (req, res, next) => {
  try {
    const data = reservaSchema.parse(req.body)
    const { tenantId, userId } = req.auth

    const slot = await prisma.horarioDisponivel.findFirst({
      where: {
        id_horario_disponivel: data.slot_id,
        id_organizacao_horario_disponivel: tenantId,
      },
      include: { reservas_horario_disponivel: true },
    })

    if (!slot) {
      throw new AppError('Slot não encontrado', 404)
    }

    if (slot.reservas_horario_disponivel.length >= slot.capacidade_horario_disponivel) {
      throw new AppError('Slot já está em sua capacidade máxima', 400)
    }

    const reserva = await prisma.reservaAgenda.create({
      data: {
        id_organizacao_reserva_agenda: tenantId,
        id_usuario_reserva_agenda: userId || null,
        id_produto_reserva_agenda: data.product_id ?? null,
        id_horario_reserva_agenda: data.slot_id,
        id_reservante_reserva_agenda: data.usuario_id,
        nome_reservante_reserva_agenda: data.nome ?? null,
        email_reservante_reserva_agenda: data.email ?? null,
        status_reserva_agenda: 'confirmado',
      },
      include: {
        horario_reserva_agenda: {
          include: {
            agenda_horario_disponivel: true,
          },
        },
      },
    })

    const service = new AgendamentoService()
    await service.notificarReserva(reserva)

    res.status(201).json(toReservaDto(reserva))
  } catch (error) {
    next(error)
  }
})

reservaRouter.get('/', async (req, res, next) => {
  try {
    const { tenantId } = req.auth
    const reservas = await prisma.reservaAgenda.findMany({
      where: { id_organizacao_reserva_agenda: tenantId },
      include: { horario_reserva_agenda: true },
      orderBy: { data_criacao_reserva_agenda: 'desc' },
    })
    res.json(reservas.map(toReservaDto))
  } catch (error) {
    next(error)
  }
})

reservaRouter.get('/usuario/:usuario_id', async (req, res, next) => {
  try {
    const { usuario_id } = req.params
    const { tenantId } = req.auth

    const reservas = await prisma.reservaAgenda.findMany({
      where: {
        id_reservante_reserva_agenda: usuario_id,
        id_organizacao_reserva_agenda: tenantId,
      },
      include: { horario_reserva_agenda: true },
    })
    res.json(reservas.map(toReservaDto))
  } catch (error) {
    next(error)
  }
})

reservaRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = z
      .object({ status: z.enum(['confirmado', 'cancelado', 'pendente']) })
      .parse(req.body)
    const { tenantId } = req.auth

    const existing = await prisma.reservaAgenda.findFirst({
      where: {
        id_reserva_agenda: id,
        id_organizacao_reserva_agenda: tenantId,
      },
    })
    if (!existing) {
      throw new AppError('Reserva não encontrada', 404)
    }

    const reserva = await prisma.reservaAgenda.update({
      where: { id_reserva_agenda: id },
      data: { status_reserva_agenda: status },
    })
    res.json(toReservaDto(reserva))
  } catch (error) {
    next(error)
  }
})

reservaRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { tenantId } = req.auth

    const existing = await prisma.reservaAgenda.findFirst({
      where: {
        id_reserva_agenda: id,
        id_organizacao_reserva_agenda: tenantId,
      },
    })
    if (!existing) {
      throw new AppError('Reserva não encontrada', 404)
    }

    await prisma.reservaAgenda.delete({ where: { id_reserva_agenda: id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
