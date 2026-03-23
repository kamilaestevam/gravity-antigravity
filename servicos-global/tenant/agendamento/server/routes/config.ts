import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

export const configRouter = Router()

const configSchema = z.object({
  tenant_id: z.string().uuid(),
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
    const config = await prisma.disponibilidadeConfig.create({
      data,
    })
    res.status(201).json(config)
  } catch (error) {
    next(error)
  }
})

configRouter.get('/:tenant_id/agenda/:agenda_id', async (req, res, next) => {
  try {
    const { tenant_id, agenda_id } = req.params
    const config = await prisma.disponibilidadeConfig.findUnique({
      where: { agenda_id },
    })
    if (!config || config.tenant_id !== tenant_id) {
      throw new AppError('Configuração não encontrada', 404)
    }
    res.json(config)
  } catch (error) {
    next(error)
  }
})

configRouter.put('/:tenant_id/:id', async (req, res, next) => {
  try {
    const { tenant_id, id } = req.params
    const data = configSchema.partial().parse(req.body)
    
    const existing = await prisma.disponibilidadeConfig.findUnique({ where: { id } })
    if (!existing || existing.tenant_id !== tenant_id) {
      throw new AppError('Configuração não encontrada', 404)
    }

    const config = await prisma.disponibilidadeConfig.update({
      where: { id },
      data,
    })
    res.json(config)
  } catch (error) {
    next(error)
  }
})

configRouter.delete('/:tenant_id/:id', async (req, res, next) => {
  try {
    const { tenant_id, id } = req.params
    const existing = await prisma.disponibilidadeConfig.findUnique({ where: { id } })
    if (!existing || existing.tenant_id !== tenant_id) {
      throw new AppError('Configuração não encontrada', 404)
    }
    await prisma.disponibilidadeConfig.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
