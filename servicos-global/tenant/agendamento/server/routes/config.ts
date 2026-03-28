import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '../../../middleware/withTenantIsolation.js'

export const configRouter = Router()

const configSchema = z.object({
  agenda_id: z.string().uuid(),
  horarioInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido. Use HH:mm"),
  horarioFim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato inválido. Use HH:mm"),
  duracaoSlot: z.number().int().positive(),
  intervalo: z.number().int().min(0).default(0),
  diasSemana: z.array(z.number().int().min(0).max(6)),
})

configRouter.post('/', async (req, res, next) => {
  try {
    const data = configSchema.parse(req.body)
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const config = await db.disponibilidadeConfig.create({ data })
    res.status(201).json(config)
  } catch (error) {
    next(error)
  }
})

configRouter.get('/agenda/:agenda_id', async (req, res, next) => {
  try {
    const { agenda_id } = req.params
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const config = await db.disponibilidadeConfig.findFirst({
      where: { agenda_id },
    })
    if (!config) {
      throw new AppError('Configuração não encontrada', 404)
    }
    res.json(config)
  } catch (error) {
    next(error)
  }
})

configRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const data = configSchema.partial().parse(req.body)
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const existing = await db.disponibilidadeConfig.findFirst({ where: { id } })
    if (!existing) {
      throw new AppError('Configuração não encontrada', 404)
    }

    const config = await db.disponibilidadeConfig.update({
      where: { id },
      data,
    })
    res.json(config)
  } catch (error) {
    next(error)
  }
})

configRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const existing = await db.disponibilidadeConfig.findFirst({ where: { id } })
    if (!existing) {
      throw new AppError('Configuração não encontrada', 404)
    }

    await db.disponibilidadeConfig.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
