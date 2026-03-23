import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { AgendamentoService } from '../../src/services/AgendamentoService.js'

export const reservaRouter = Router()

const reservaSchema = z.object({
  tenant_id: z.string().uuid(),
  slot_id: z.string().uuid(),
  usuario_id: z.string().min(1),
  nome: z.string().optional(),
  email: z.string().email().optional(),
})

reservaRouter.post('/', async (req, res, next) => {
  try {
    const data = reservaSchema.parse(req.body)

    const slot = await prisma.slot.findUnique({
      where: { id: data.slot_id },
      include: { reservas: true }
    })

    if (!slot || slot.tenant_id !== data.tenant_id) {
      throw new AppError('Slot não encontrado', 404)
    }

    if (slot.reservas.length >= slot.capacidade) {
      throw new AppError('Slot já está em sua capacidade máxima', 400)
    }

    const reserva = await prisma.reserva.create({
      data: {
        ...data,
        status: 'confirmado',
      },
      include: {
        slot: {
          include: {
            agenda: true
          }
        }
      }
    })

    // Enviar notificação de confirmação via serviço
    const service = new AgendamentoService()
    await service.notificarReserva(reserva)

    res.status(201).json(reserva)
  } catch (error) {
    next(error)
  }
})

reservaRouter.get('/:tenant_id', async (req, res, next) => {
  try {
    const { tenant_id } = req.params
    const reservas = await prisma.reserva.findMany({
      where: { tenant_id },
      include: { slot: true }
    })
    res.json(reservas)
  } catch (error) {
    next(error)
  }
})

reservaRouter.get('/:tenant_id/usuario/:usuario_id', async (req, res, next) => {
  try {
    const { tenant_id, usuario_id } = req.params
    const reservas = await prisma.reserva.findMany({
      where: { tenant_id, usuario_id },
      include: { slot: true }
    })
    res.json(reservas)
  } catch (error) {
    next(error)
  }
})

reservaRouter.patch('/:tenant_id/:id/status', async (req, res, next) => {
  try {
    const { tenant_id, id } = req.params
    const { status } = z.object({ status: z.enum(['confirmado', 'cancelado', 'pendente']) }).parse(req.body)
    
    const existing = await prisma.reserva.findUnique({ where: { id } })
    if (!existing || existing.tenant_id !== tenant_id) {
      throw new AppError('Reserva não encontrada', 404)
    }

    const reserva = await prisma.reserva.update({
      where: { id },
      data: { status },
    })
    res.json(reserva)
  } catch (error) {
    next(error)
  }
})

reservaRouter.delete('/:tenant_id/:id', async (req, res, next) => {
  try {
    const { tenant_id, id } = req.params
    const existing = await prisma.reserva.findUnique({ where: { id } })
    if (!existing || existing.tenant_id !== tenant_id) {
      throw new AppError('Reserva não encontrada', 404)
    }
    // Ao deletar, a reserva é removida e o slot é liberado
    await prisma.reserva.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
