import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { AgendamentoService } from '../../src/services/AgendamentoService.js'
import { withTenantIsolation } from '../../../middleware/withTenantIsolation.js'

export const slotRouter = Router()

const slotSchema = z.object({
  agenda_id: z.string().uuid(),
  inicio: z.string().datetime(),
  fim: z.string().datetime(),
  capacidade: z.number().int().positive().default(1),
})

const generateSlotsSchema = z.object({
  agenda_id: z.string().uuid(),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
})

slotRouter.post('/', async (req, res, next) => {
  try {
    const data = slotSchema.parse(req.body)
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const slot = await db.slot.create({
      data: {
        ...data,
        inicio: new Date(data.inicio),
        fim: new Date(data.fim),
      },
    })
    res.status(201).json(slot)
  } catch (error) {
    next(error)
  }
})

slotRouter.post('/gerar', async (req, res, next) => {
  try {
    const data = generateSlotsSchema.parse(req.body)
    const service = new AgendamentoService()
    const slotsCriados = await service.gerarSlots(
      req.auth.tenantId,
      data.agenda_id,
      new Date(data.dataInicio),
      new Date(data.dataFim)
    )
    res.status(201).json({ gerados: slotsCriados.length, slots: slotsCriados })
  } catch (error) {
    next(error)
  }
})

slotRouter.get('/agenda/:agenda_id', async (req, res, next) => {
  try {
    const { agenda_id } = req.params
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const slots = await db.slot.findMany({
      where: { agenda_id },
      orderBy: { inicio: 'asc' },
    })
    res.json(slots)
  } catch (error) {
    next(error)
  }
})

slotRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const existing = await db.slot.findFirst({ where: { id } })
    if (!existing) {
      throw new AppError('Slot não encontrado', 404)
    }

    await db.slot.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
