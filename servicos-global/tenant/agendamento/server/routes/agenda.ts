import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { withTenantIsolation } from '../../../middleware/withTenantIsolation.js'

export const agendaRouter = Router()

const agendaSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional(),
  tipo: z.string().min(1),
})

agendaRouter.post('/', async (req, res, next) => {
  try {
    const data = agendaSchema.parse(req.body)
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const agenda = await db.agenda.create({ data })
    res.status(201).json(agenda)
  } catch (error) {
    next(error)
  }
})

agendaRouter.get('/', async (req, res, next) => {
  try {
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const agendas = await db.agenda.findMany()
    res.json(agendas)
  } catch (error) {
    next(error)
  }
})

agendaRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const db = withTenantIsolation(prisma, req.auth.tenantId)
    const agenda = await db.agenda.findFirst({ where: { id } })
    if (!agenda) {
      throw new AppError('Agenda não encontrada', 404)
    }
    res.json(agenda)
  } catch (error) {
    next(error)
  }
})

agendaRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const data = agendaSchema.partial().parse(req.body)
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const existing = await db.agenda.findFirst({ where: { id } })
    if (!existing) {
      throw new AppError('Agenda não encontrada', 404)
    }

    const agenda = await db.agenda.update({ where: { id }, data })
    res.json(agenda)
  } catch (error) {
    next(error)
  }
})

agendaRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const db = withTenantIsolation(prisma, req.auth.tenantId)

    const existing = await db.agenda.findFirst({ where: { id } })
    if (!existing) {
      throw new AppError('Agenda não encontrada', 404)
    }

    await db.agenda.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
