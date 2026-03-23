import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

export const agendaRouter = Router()

const agendaSchema = z.object({
  tenant_id: z.string().uuid(),
  nome: z.string().min(1),
  descricao: z.string().optional(),
  tipo: z.string().min(1),
})

agendaRouter.post('/', async (req, res, next) => {
  try {
    const data = agendaSchema.parse(req.body)
    const agenda = await prisma.agenda.create({
      data,
    })
    res.status(201).json(agenda)
  } catch (error) {
    next(error)
  }
})

agendaRouter.get('/:tenant_id', async (req, res, next) => {
  try {
    const { tenant_id } = req.params
    const agendas = await prisma.agenda.findMany({
      where: { tenant_id },
    })
    res.json(agendas)
  } catch (error) {
    next(error)
  }
})

agendaRouter.get('/:tenant_id/:id', async (req, res, next) => {
  try {
    const { tenant_id, id } = req.params
    const agenda = await prisma.agenda.findUnique({
      where: { id },
    })
    if (!agenda || agenda.tenant_id !== tenant_id) {
      throw new AppError('Agenda não encontrada', 404)
    }
    res.json(agenda)
  } catch (error) {
    next(error)
  }
})

agendaRouter.put('/:tenant_id/:id', async (req, res, next) => {
  try {
    const { tenant_id, id } = req.params
    const data = agendaSchema.partial().parse(req.body)
    
    const existing = await prisma.agenda.findUnique({ where: { id } })
    if (!existing || existing.tenant_id !== tenant_id) {
      throw new AppError('Agenda não encontrada', 404)
    }

    const agenda = await prisma.agenda.update({
      where: { id },
      data,
    })
    res.json(agenda)
  } catch (error) {
    next(error)
  }
})

agendaRouter.delete('/:tenant_id/:id', async (req, res, next) => {
  try {
    const { tenant_id, id } = req.params
    const existing = await prisma.agenda.findUnique({ where: { id } })
    if (!existing || existing.tenant_id !== tenant_id) {
      throw new AppError('Agenda não encontrada', 404)
    }
    await prisma.agenda.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
