/**
 * processos.ts — CRUD Routes for Processo
 * GET /            — List with pagination, tenant isolated
 * GET /:id         — Detail with all includes
 * POST /           — Create new processo
 * PATCH /:id       — Update existing processo
 *
 * Skill: antigravity-criar-produto (Passo 7)
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'

export const processosRouter = Router()

// --- Schemas de Validacao -----------------------------------------------------

const CreateProcessoSchema = z.object({
  numero: z.string().min(1),
  referencia_interna: z.string().optional(),
  referencia_dati: z.string().optional(),
  tipo: z.enum(['importacao', 'exportacao']),
  status: z.string().optional(),
  responsavel_id: z.string().optional(),
  vendedor_id: z.string().optional(),
  setor_responsavel: z.string().optional(),
  product_id: z.string().optional(),
})

const UpdateProcessoSchema = z.object({
  numero: z.string().min(1).optional(),
  referencia_interna: z.string().nullable().optional(),
  referencia_dati: z.string().nullable().optional(),
  tipo: z.enum(['importacao', 'exportacao']).optional(),
  status: z.string().optional(),
  responsavel_id: z.string().nullable().optional(),
  vendedor_id: z.string().nullable().optional(),
  setor_responsavel: z.string().nullable().optional(),
})

/**
 * GET /api/v1/processos
 * Lista processos com paginacao. Tenant isolado via middleware.
 */
processosRouter.get('/', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit

    const status = req.query.status as string | undefined
    const tipo = req.query.tipo as string | undefined
    const search = req.query.search as string | undefined

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (tipo) where.tipo = tipo
    if (search) {
      where.OR = [
        { numero: { contains: search, mode: 'insensitive' } },
        { referencia_interna: { contains: search, mode: 'insensitive' } },
        { referencia_dati: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      prisma.processoGravity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          etapas: { orderBy: { data_prevista: 'asc' } },
        },
      }),
      prisma.processoGravity.count({ where }),
    ])

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar processos'
    res.status(500).json({ error: message })
  }
})

/**
 * GET /api/v1/processos/:id_processo
 * Detalhe completo do processo com todas as relacoes.
 */
processosRouter.get('/:id_processo', async (req: Request, res: Response) => {
  try {
    const prisma = (req as any).prisma
    const { id_processo } = req.params

    const processo = await prisma.processoGravity.findFirst({
      where: { id: id_processo },
      include: {
        etapas: { orderBy: { data_prevista: 'asc' } },
        pedidos: {
          include: {
            itens: true,
          },
        },
        followUps: { orderBy: { created_at: 'desc' } },
        documentos: { orderBy: { created_at: 'desc' } },
        estimativaCusto: true,
        dadosTecnicos: true,
      },
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

/**
 * POST /api/v1/processos
 * Cria novo processo.
 */
processosRouter.post('/', async (req: Request, res: Response) => {
  const parsed = CreateProcessoSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = (req as any).prisma
    const userId = req.headers['x-id-usuario'] as string | undefined

    const processo = await prisma.processoGravity.create({
      data: {
        ...parsed.data,
        user_id: userId,
      },
    })

    res.status(201).json({ success: true, data: processo })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar processo'
    res.status(500).json({ error: message })
  }
})

/**
 * PATCH /api/v1/processos/:id_processo
 * Atualiza processo existente.
 */
processosRouter.patch('/:id_processo', async (req: Request, res: Response) => {
  const parsed = UpdateProcessoSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({ error: 'Payload invalido', detalhes: parsed.error.flatten() })
  }

  try {
    const prisma = (req as any).prisma
    const { id_processo } = req.params

    // Verifica se existe (tenant isolado)
    const existing = await prisma.processoGravity.findFirst({ where: { id: id_processo } })
    if (!existing) {
      return res.status(404).json({ error: 'Processo nao encontrado' })
    }

    const processo = await prisma.processoGravity.update({
      where: { id: id_processo },
      data: parsed.data,
    })

    res.json({ success: true, data: processo })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar processo'
    res.status(500).json({ error: message })
  }
})
