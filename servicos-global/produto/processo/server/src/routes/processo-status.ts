/**
 * processo-status.ts — Catálogo de status do Processo (tenant)
 */
import { Router, Request, Response } from 'express'
import type { PrismaClient } from '../../../generated/index.js'
import { createProcessoStatusBodySchema } from '../contracts/processo-schemas.js'

export const processoStatusRouter = Router()

const PRODUTO_ID = 'processo'

type ReqComPrisma = Request & { prisma?: PrismaClient }

processoStatusRouter.get('/', async (req: ReqComPrisma, res: Response) => {
  try {
    const prisma = req.prisma!
    const data = await prisma.processoStatus.findMany({
      orderBy: { ordem_status_processo: 'asc' },
    })
    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar status'
    res.status(500).json({ error: message })
  }
})

processoStatusRouter.post('/', async (req: ReqComPrisma, res: Response) => {
  const parsed = createProcessoStatusBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = req.prisma!
    const status = await prisma.processoStatus.create({
      data: {
        ...parsed.data,
        id_organizacao: req.headers['x-id-organizacao'] as string,
        id_produto_gravity: PRODUTO_ID,
        cor_status_processo: parsed.data.cor_status_processo ?? '#6366F1',
        ordem_status_processo: parsed.data.ordem_status_processo ?? 0,
        eh_padrao_status_processo: parsed.data.eh_padrao_status_processo ?? false,
      },
    })
    res.status(201).json({ success: true, data: status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar status'
    res.status(500).json({ error: message })
  }
})
