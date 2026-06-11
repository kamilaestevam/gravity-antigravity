/**
 * processos.ts — CRUD Processo (modelo híbrido DDD)
 */
import { Router, Request, Response } from 'express'
import type { PrismaClient } from '../../../generated/index.js'
import {
  createProcessoBodySchema,
  updateProcessoBodySchema,
  mudarStatusProcessoBodySchema,
} from '../contracts/processo-schemas.js'
import { gerarNumeroProcesso } from '../services/gerar-numero-processo.js'

export const processosRouter = Router()

const PRODUTO_ID = 'processo'

type ReqComPrisma = Request & { prisma?: PrismaClient }

const includeDetalhe = {
  status_atual: true,
  logistica: true,
  dados: true,
  cambio: true,
  estimativa: true,
  documentos: { orderBy: { data_criacao_documento_processo: 'desc' as const } },
  follow_ups: { orderBy: { data_criacao_follow_up_processo: 'desc' as const } },
  containers: true,
}

processosRouter.get('/', async (req: ReqComPrisma, res: Response) => {
  try {
    const prisma = req.prisma!
    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20))
    const skip = (page - 1) * limit

    const idStatus = req.query.id_status_atual_processo as string | undefined
    const tipo = req.query.tipo_operacao_processo as string | undefined
    const search = req.query.search as string | undefined

    const where: Record<string, unknown> = {}
    if (idStatus) where.id_status_atual_processo = idStatus
    if (tipo) where.tipo_operacao_processo = tipo
    if (search) {
      where.OR = [
        { numero_processo: { contains: search, mode: 'insensitive' } },
        { referencia_interna_processo: { contains: search, mode: 'insensitive' } },
        { referencia_importador_processo: { contains: search, mode: 'insensitive' } },
        { referencia_exportador_processo: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      prisma.processo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data_criacao_processo: 'desc' },
        include: { status_atual: true },
      }),
      prisma.processo.count({ where }),
    ])

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar processos'
    res.status(500).json({ error: message })
  }
})

processosRouter.get('/:id_processo', async (req: ReqComPrisma, res: Response) => {
  try {
    const prisma = req.prisma!
    const { id_processo } = req.params

    const processo = await prisma.processo.findFirst({
      where: { id_processo },
      include: includeDetalhe,
    })

    if (!processo) {
      return res.status(404).json({ error: 'Processo nao encontrado' })
    }

    res.json({ success: true, data: processo })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar processo'
    res.status(500).json({ error: message })
  }
})

processosRouter.post('/', async (req: ReqComPrisma, res: Response) => {
  const parsed = createProcessoBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = req.prisma!
    const idUsuario = req.headers['x-id-usuario'] as string | undefined
    const idOrganizacao = req.headers['x-id-organizacao'] as string
    const numero =
      parsed.data.numero_processo ??
      (await gerarNumeroProcesso(prisma, idOrganizacao))

    const nestedBase = { id_organizacao: idOrganizacao, id_produto_gravity: PRODUTO_ID }

    const processo = await prisma.processo.create({
      data: {
        ...parsed.data,
        id_organizacao: idOrganizacao,
        numero_processo: numero,
        id_usuario: idUsuario ?? null,
        id_produto_gravity: PRODUTO_ID,
        logistica: { create: nestedBase },
        dados: { create: nestedBase },
        cambio: { create: nestedBase },
        estimativa: { create: nestedBase },
      },
      include: includeDetalhe,
    })

    res.status(201).json({ success: true, data: processo })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar processo'
    res.status(500).json({ error: message })
  }
})

processosRouter.patch('/:id_processo', async (req: ReqComPrisma, res: Response) => {
  const parsed = updateProcessoBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = req.prisma!
    const { id_processo } = req.params

    const existing = await prisma.processo.findFirst({ where: { id_processo } })
    if (!existing) {
      return res.status(404).json({ error: 'Processo nao encontrado' })
    }

    const processo = await prisma.processo.update({
      where: { id_processo },
      data: parsed.data,
      include: includeDetalhe,
    })

    res.json({ success: true, data: processo })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar processo'
    res.status(500).json({ error: message })
  }
})

processosRouter.post('/:id_processo/mudar-status', async (req: ReqComPrisma, res: Response) => {
  const parsed = mudarStatusProcessoBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = req.prisma!
    const { id_processo } = req.params
    const idUsuario = req.headers['x-id-usuario'] as string | undefined

    const existing = await prisma.processo.findFirst({ where: { id_processo } })
    if (!existing) {
      return res.status(404).json({ error: 'Processo nao encontrado' })
    }

    const novoStatus = await prisma.processoStatus.findFirst({
      where: { id_processo_status: parsed.data.id_status_novo_processo },
    })
    if (!novoStatus) {
      return res.status(400).json({ error: 'Status nao encontrado' })
    }

    const [processo] = await prisma.$transaction([
      prisma.processo.update({
        where: { id_processo },
        data: { id_status_atual_processo: parsed.data.id_status_novo_processo },
        include: includeDetalhe,
      }),
      prisma.historicoStatusProcesso.create({
        data: {
          id_organizacao: req.headers['x-id-organizacao'] as string,
          id_processo,
          id_produto_gravity: PRODUTO_ID,
          id_status_anterior_processo: existing.id_status_atual_processo,
          id_status_novo_processo: parsed.data.id_status_novo_processo,
          id_usuario_mudanca_status_processo: idUsuario ?? null,
          observacao_mudanca_status_processo: parsed.data.observacao_mudanca_status_processo ?? null,
        },
      }),
    ])

    res.json({ success: true, data: processo })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao mudar status'
    res.status(500).json({ error: message })
  }
})

processosRouter.get('/:id_processo/historico-status', async (req: ReqComPrisma, res: Response) => {
  try {
    const prisma = req.prisma!
    const { id_processo } = req.params

    const data = await prisma.historicoStatusProcesso.findMany({
      where: { id_processo },
      orderBy: { data_mudanca_status_processo: 'desc' },
      include: {
        status_anterior: true,
        status_novo: true,
      },
    })

    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar historico'
    res.status(500).json({ error: message })
  }
})
