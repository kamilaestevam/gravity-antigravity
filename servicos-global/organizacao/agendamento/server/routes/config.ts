import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'

export const configRouter = Router({ mergeParams: true })

const configSchema = z.object({
  agenda_id: z.string().min(1).optional(),
  horarioInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido. Use HH:mm'),
  horarioFim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido. Use HH:mm'),
  duracaoSlot: z.number().int().positive(),
  intervalo: z.number().int().min(0).default(0),
  diasSemana: z.array(z.number().int().min(0).max(6)),
  product_id: z.string().optional().nullable(),
})

// ---- ACL DTO ----
function toConfigDto(c: {
  id_config_disponibilidade_agenda: string
  id_organizacao_config_disponibilidade_agenda: string
  id_produto_config_disponibilidade_agenda: string | null
  id_usuario_config_disponibilidade_agenda: string | null
  id_agenda_config_disponibilidade_agenda: string
  horario_inicio_config_disponibilidade_agenda: string
  horario_fim_config_disponibilidade_agenda: string
  duracao_slot_config_disponibilidade_agenda: number
  intervalo_config_disponibilidade_agenda: number
  dias_semana_config_disponibilidade_agenda: number[]
  data_criacao_config_disponibilidade_agenda: Date
  data_atualizacao_config_disponibilidade_agenda: Date
}) {
  return {
    id: c.id_config_disponibilidade_agenda,
    tenant_id: c.id_organizacao_config_disponibilidade_agenda,
    product_id: c.id_produto_config_disponibilidade_agenda,
    user_id: c.id_usuario_config_disponibilidade_agenda,
    agenda_id: c.id_agenda_config_disponibilidade_agenda,
    horarioInicio: c.horario_inicio_config_disponibilidade_agenda,
    horarioFim: c.horario_fim_config_disponibilidade_agenda,
    duracaoSlot: c.duracao_slot_config_disponibilidade_agenda,
    intervalo: c.intervalo_config_disponibilidade_agenda,
    diasSemana: c.dias_semana_config_disponibilidade_agenda,
    created_at: c.data_criacao_config_disponibilidade_agenda,
    updated_at: c.data_atualizacao_config_disponibilidade_agenda,
  }
}

configRouter.post('/', async (req, res, next) => {
  try {
    const data = configSchema.parse(req.body)
    const { tenantId, userId } = req.auth
    const id_agenda = ((req.params as { id_agenda?: string }).id_agenda) ?? data.agenda_id
    if (!id_agenda) {
      throw new AppError('id_agenda obrigatório', 400)
    }

    const config = await prisma.usuarioConfiguracaoAgenda.create({
      data: {
        id_organizacao_config_disponibilidade_agenda: tenantId,
        id_usuario_config_disponibilidade_agenda: userId || null,
        id_produto_config_disponibilidade_agenda: data.product_id ?? null,
        id_agenda_config_disponibilidade_agenda: id_agenda,
        horario_inicio_config_disponibilidade_agenda: data.horarioInicio,
        horario_fim_config_disponibilidade_agenda: data.horarioFim,
        duracao_slot_config_disponibilidade_agenda: data.duracaoSlot,
        intervalo_config_disponibilidade_agenda: data.intervalo,
        dias_semana_config_disponibilidade_agenda: data.diasSemana,
      },
    })
    res.status(201).json(toConfigDto(config))
  } catch (error) {
    next(error)
  }
})

configRouter.get('/', async (req, res, next) => {
  try {
    const { id_agenda } = req.params as { id_agenda: string }
    const { tenantId } = req.auth

    const config = await prisma.usuarioConfiguracaoAgenda.findFirst({
      where: {
        id_agenda_config_disponibilidade_agenda: id_agenda,
        id_organizacao_config_disponibilidade_agenda: tenantId,
      },
    })
    if (!config) {
      throw new AppError('Configuração não encontrada', 404)
    }
    res.json(toConfigDto(config))
  } catch (error) {
    next(error)
  }
})

configRouter.put('/:id_configuracao_disponibilidade', async (req, res, next) => {
  try {
    const { id_configuracao_disponibilidade } = req.params as { id_configuracao_disponibilidade: string }
    const data = configSchema.partial().parse(req.body)
    const { tenantId } = req.auth

    const existing = await prisma.usuarioConfiguracaoAgenda.findFirst({
      where: {
        id_config_disponibilidade_agenda: id_configuracao_disponibilidade,
        id_organizacao_config_disponibilidade_agenda: tenantId,
      },
    })
    if (!existing) {
      throw new AppError('Configuração não encontrada', 404)
    }

    const update: Record<string, unknown> = {}
    if (data.agenda_id !== undefined) update.id_agenda_config_disponibilidade_agenda = data.agenda_id
    if (data.horarioInicio !== undefined) update.horario_inicio_config_disponibilidade_agenda = data.horarioInicio
    if (data.horarioFim !== undefined) update.horario_fim_config_disponibilidade_agenda = data.horarioFim
    if (data.duracaoSlot !== undefined) update.duracao_slot_config_disponibilidade_agenda = data.duracaoSlot
    if (data.intervalo !== undefined) update.intervalo_config_disponibilidade_agenda = data.intervalo
    if (data.diasSemana !== undefined) update.dias_semana_config_disponibilidade_agenda = data.diasSemana
    if (data.product_id !== undefined) update.id_produto_config_disponibilidade_agenda = data.product_id

    const config = await prisma.usuarioConfiguracaoAgenda.update({
      where: { id_config_disponibilidade_agenda: id_configuracao_disponibilidade },
      data: update,
    })
    res.json(toConfigDto(config))
  } catch (error) {
    next(error)
  }
})

configRouter.delete('/:id_configuracao_disponibilidade', async (req, res, next) => {
  try {
    const { id_configuracao_disponibilidade } = req.params as { id_configuracao_disponibilidade: string }
    const { tenantId } = req.auth

    const existing = await prisma.usuarioConfiguracaoAgenda.findFirst({
      where: {
        id_config_disponibilidade_agenda: id_configuracao_disponibilidade,
        id_organizacao_config_disponibilidade_agenda: tenantId,
      },
    })
    if (!existing) {
      throw new AppError('Configuração não encontrada', 404)
    }

    await prisma.usuarioConfiguracaoAgenda.delete({
      where: { id_config_disponibilidade_agenda: id_configuracao_disponibilidade },
    })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
