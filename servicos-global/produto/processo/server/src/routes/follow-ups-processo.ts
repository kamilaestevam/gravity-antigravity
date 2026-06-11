/**
 * follow-ups-processo.ts — Timeline de follow-ups
 */
import { Router, Request, Response } from 'express'
import type { PrismaClient } from '../../../generated/index.js'
import { createFollowUpBodySchema } from '../contracts/processo-schemas.js'

export const followUpRouter = Router()

const PRODUTO_ID = 'processo'

type ReqComPrisma = Request & { prisma?: PrismaClient }

followUpRouter.get('/processos/:id_processo/follow-ups', async (req: ReqComPrisma, res: Response) => {
  try {
    const prisma = req.prisma!
    const { id_processo } = req.params
    const tipo = req.query.tipo_follow_up_processo as string | undefined
    const categoria = req.query.categoria_follow_up_processo as string | undefined

    const where: Record<string, unknown> = { id_processo }
    if (tipo) where.tipo_follow_up_processo = tipo
    if (categoria) where.categoria_follow_up_processo = categoria

    const data = await prisma.followUpProcesso.findMany({
      where,
      orderBy: { data_criacao_follow_up_processo: 'desc' },
    })

    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar follow-ups'
    res.status(500).json({ error: message })
  }
})

followUpRouter.post('/follow-ups-processo', async (req: ReqComPrisma, res: Response) => {
  const parsed = createFollowUpBodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = req.prisma!
    const idUsuario = req.headers['x-id-usuario'] as string | undefined

    const followUp = await prisma.followUpProcesso.create({
      data: {
        ...parsed.data,
        id_organizacao: req.headers['x-id-organizacao'] as string,
        id_produto_gravity: PRODUTO_ID,
        id_usuario: idUsuario ?? null,
        id_usuario_registro_follow_up_processo: idUsuario ?? null,
      },
    })

    res.status(201).json({ success: true, data: followUp })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar follow-up'
    res.status(500).json({ error: message })
  }
})
