/**
 * followup.ts — Routes for FollowUp (timeline events)
 * GET /processo/:processoId  — List followups with filters
 * POST /                     — Create new followup entry
 *
 * Skill: antigravity-criar-produto (Passo 7)
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'

export const followUpRouter = Router()

const CreateFollowUpSchema = z.object({
  processo_id: z.string().min(1),
  titulo: z.string().min(1),
  descricao: z.string().optional(),
  tipo: z.enum(['info', 'desvio', 'atualizacao', 'documento']).optional(),
  categoria: z.enum(['exportador', 'logistica', 'despachante', 'financeiro', 'sistema']).optional(),
  usuario_nome: z.string().optional(),
  product_id: z.string().optional(),
})

/**
 * GET /api/v1/processos/:id_processo/follow-ups
 * Lista follow-ups de um processo com filtros opcionais.
 */
followUpRouter.get('/processos/:id_processo/follow-ups', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma
    const { id_processo } = req.params
    const tipo = req.query.tipo as string | undefined
    const categoria = req.query.categoria as string | undefined

    const where: Record<string, unknown> = { processo_id: id_processo }
    if (tipo) where.tipo = tipo
    if (categoria) where.categoria = categoria

    const data = await prisma.processoFollowup.findMany({
      where,
      orderBy: { created_at: 'desc' },
    })

    res.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar follow-ups'
    res.status(500).json({ error: message })
  }
})

/**
 * POST /api/v1/follow-ups-processo
 * Cria nova entrada de follow-up.
 */
followUpRouter.post('/follow-ups-processo', async (req: Request, res: Response) => {
  const parsed = CreateFollowUpSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = (req as any).prisma
    const userId = req.headers['x-id-usuario'] as string | undefined

    const followUp = await prisma.processoFollowup.create({
      data: {
        ...parsed.data,
        usuario_id: userId,
        user_id: userId,
      },
    })

    res.status(201).json({ success: true, data: followUp })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar follow-up'
    res.status(500).json({ error: message })
  }
})
