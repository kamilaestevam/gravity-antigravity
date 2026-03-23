import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { AgendamentoService } from '../../src/services/AgendamentoService.js'

export const slotRouter = Router()

const slotSchema = z.object({
  tenant_id: z.string().uuid(),
  agenda_id: z.string().uuid(),
  inicio: z.string().datetime(),
  fim: z.string().datetime(),
  capacidade: z.number().int().positive().default(1),
})

const generateSlotsSchema = z.object({
  tenant_id: z.string().uuid(),
  agenda_id: z.string().uuid(),
  dataInicio: z.string().datetime(),
  dataFim: z.string().datetime(),
})

slotRouter.post('/', async (req, res, next) => {
  try {
    const data = slotSchema.parse(req.body)
    const slot = await prisma.slot.create({
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

// Gerar slots automaticamente com base na configuração
slotRouter.post('/gerar', async (req, res, next) => {
  try {
    const data = generateSlotsSchema.parse(req.body)
    const service = new AgendamentoService()
    const slotsCriados = await service.gerarSlots(
      data.tenant_id,
      data.agenda_id,
      new Date(data.dataInicio),
      new Date(data.dataFim)
    )
    res.status(201).json({ gerados: slotsCriados.length, slots: slotsCriados })
  } catch (error) {
    next(error)
  }
})

slotRouter.get('/:tenant_id/agenda/:agenda_id', async (req, res, next) => {
  try {
    const { tenant_id, agenda_id } = req.params
    const slots = await prisma.slot.findMany({
      where: { tenant_id, agenda_id },
      orderBy: { inicio: 'asc' },
    })
    res.json(slots)
  } catch (error) {
    next(error)
  }
})

slotRouter.delete('/:tenant_id/:id', async (req, res, next) => {
  try {
    const { tenant_id, id } = req.params
    const existing = await prisma.slot.findUnique({ where: { id } })
    if (!existing || existing.tenant_id !== tenant_id) {
      throw new AppError('Slot não encontrado', 404)
    }
    await prisma.slot.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
