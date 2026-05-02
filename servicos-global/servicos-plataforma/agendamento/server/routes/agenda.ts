import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

export const agendaRouter = Router({ mergeParams: true })

const agendaSchema = z.object({
  nome: z.string().min(1),
  descricao: z.string().optional().nullable(),
  tipo: z.string().min(1),
  product_id: z.string().optional().nullable(),
})

// ---- ACL DTO ----
function toAgendaDto(a: {
  id_agenda_usuario: string
  id_organizacao_agenda_usuario: string
  id_produto_agenda_usuario: string | null
  id_usuario_agenda_usuario: string | null
  nome_agenda_usuario: string
  descricao_agenda_usuario: string | null
  tipo_agenda_usuario: string
  data_criacao_agenda_usuario: Date
  data_atualizacao_agenda_usuario: Date
}) {
  return {
    id: a.id_agenda_usuario,
    tenant_id: a.id_organizacao_agenda_usuario,
    product_id: a.id_produto_agenda_usuario,
    user_id: a.id_usuario_agenda_usuario,
    nome: a.nome_agenda_usuario,
    descricao: a.descricao_agenda_usuario,
    tipo: a.tipo_agenda_usuario,
    created_at: a.data_criacao_agenda_usuario,
    updated_at: a.data_atualizacao_agenda_usuario,
  }
}

agendaRouter.post('/', async (req, res, next) => {
  try {
    const data = agendaSchema.parse(req.body)
    const { id_organizacao: tenantId, id_usuario: userId } = req.auth

    const agenda = await prisma.usuarioAgenda.create({
      data: {
        id_organizacao_agenda_usuario: tenantId,
        id_usuario_agenda_usuario: userId || null,
        id_produto_agenda_usuario: data.product_id ?? null,
        nome_agenda_usuario: data.nome,
        descricao_agenda_usuario: data.descricao ?? null,
        tipo_agenda_usuario: data.tipo,
      },
    })
    res.status(201).json(toAgendaDto(agenda))
  } catch (error) {
    next(error)
  }
})

agendaRouter.get('/', async (req, res, next) => {
  try {
    const { id_organizacao: tenantId } = req.auth
    const agendas = await prisma.usuarioAgenda.findMany({
      where: { id_organizacao_agenda_usuario: tenantId },
      orderBy: { data_criacao_agenda_usuario: 'desc' },
    })
    res.json(agendas.map(toAgendaDto))
  } catch (error) {
    next(error)
  }
})

agendaRouter.get('/:id_agenda', async (req, res, next) => {
  try {
    const { id_agenda } = req.params
    const { id_organizacao: tenantId } = req.auth
    const agenda = await prisma.usuarioAgenda.findFirst({
      where: { id_agenda_usuario: id_agenda, id_organizacao_agenda_usuario: tenantId },
    })
    if (!agenda) {
      throw new AppError('Agenda não encontrada', 404)
    }
    res.json(toAgendaDto(agenda))
  } catch (error) {
    next(error)
  }
})

agendaRouter.put('/:id_agenda', async (req, res, next) => {
  try {
    const { id_agenda } = req.params
    const data = agendaSchema.partial().parse(req.body)
    const { id_organizacao: tenantId } = req.auth

    const existing = await prisma.usuarioAgenda.findFirst({
      where: { id_agenda_usuario: id_agenda, id_organizacao_agenda_usuario: tenantId },
    })
    if (!existing) {
      throw new AppError('Agenda não encontrada', 404)
    }

    const update: Record<string, unknown> = {}
    if (data.nome !== undefined) update.nome_agenda_usuario = data.nome
    if (data.descricao !== undefined) update.descricao_agenda_usuario = data.descricao
    if (data.tipo !== undefined) update.tipo_agenda_usuario = data.tipo
    if (data.product_id !== undefined) update.id_produto_agenda_usuario = data.product_id

    const agenda = await prisma.usuarioAgenda.update({
      where: { id_agenda_usuario: id_agenda },
      data: update,
    })
    res.json(toAgendaDto(agenda))
  } catch (error) {
    next(error)
  }
})

agendaRouter.delete('/:id_agenda', async (req, res, next) => {
  try {
    const { id_agenda } = req.params
    const { id_organizacao: tenantId } = req.auth

    const existing = await prisma.usuarioAgenda.findFirst({
      where: { id_agenda_usuario: id_agenda, id_organizacao_agenda_usuario: tenantId },
    })
    if (!existing) {
      throw new AppError('Agenda não encontrada', 404)
    }

    await prisma.usuarioAgenda.delete({ where: { id_agenda_usuario: id_agenda } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
