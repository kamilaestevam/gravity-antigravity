import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { AgendamentoService } from '../../src/services/AgendamentoService.js'
import { withTenantIsolation } from '../../../middleware/withTenantIsolation.js'

export const reservaRouter = Router()

const reservaSchema = z.object({
  slot_id: z.string().uuid(),
  usuario_id: z.string().min(1),
  nome: z.string().optional(),
  email: z.string().email().optional(),
})

reservaRouter.post('/', async (req, res, next) => {
  try {
    const data = reservaSchema.parse(req.body)
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const slot = await db.slot.findFirst({
      where: { id: data.slot_id },
      include: { reservas: true }
    })

    if (!slot) {
      throw new AppError('Slot não encontrado', 404)
    }

    if (slot.reservas.length >= slot.capacidade) {
      throw new AppError('Slot já está em sua capacidade máxima', 400)
    }

    const reserva = await db.reserva.create({
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

    const service = new AgendamentoService()
    await service.notificarReserva(reserva)

    res.status(201).json(reserva)
  } catch (error) {
    next(error)
  }
})

reservaRouter.get('/', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const reservas = await db.reserva.findMany({ include: { slot: true } })
    res.json(reservas)
  } catch (error) {
    next(error)
  }
})

reservaRouter.get('/usuario/:usuario_id', async (req, res, next) => {
  try {
    const { usuario_id } = req.params
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const reservas = await db.reserva.findMany({
      where: { usuario_id },
      include: { slot: true }
    })
    res.json(reservas)
  } catch (error) {
    next(error)
  }
})

reservaRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = z.object({ status: z.enum(['confirmado', 'cancelado', 'pendente']) }).parse(req.body)
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const existing = await db.reserva.findFirst({ where: { id } })
    if (!existing) {
      throw new AppError('Reserva não encontrada', 404)
    }

    const reserva = await db.reserva.update({
      where: { id },
      data: { status },
    })
    res.json(reserva)
  } catch (error) {
    next(error)
  }
})

reservaRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const existing = await db.reserva.findFirst({ where: { id } })
    if (!existing) {
      throw new AppError('Reserva não encontrada', 404)
    }

    await db.reserva.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
