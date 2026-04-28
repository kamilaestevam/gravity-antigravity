/**
 * avaliacoes.ts — Rotas de Avaliacao de Fornecedores
 * POST /                    Avaliar fornecedor (manual)
 * GET  /fornecedor/:id      Rating de um fornecedor
 * GET  /ranking             Ranking global de fornecedores
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ratingEngine } from '../services/ratingEngine.js'
import { AppError } from '../lib/errors.js'
import { historicoIntegration } from '../services/tenantIntegrations.js'
import { prisma as basePrisma } from '../middleware/tenantIsolation.js'

const router = Router()

const AvaliarSchema = z.object({
  fornecedor_id: z.string().min(1),
  cotacao_id: z.string().optional(),
  nota_frete: z.number().int().min(1).max(5).optional(),
  nota_atendimento: z.number().int().min(1).max(5).optional(),
  nota_resposta: z.number().int().min(1).max(5).optional(),
  nota_confiabilidade: z.number().int().min(1).max(5).optional(),
  comentario: z.string().optional(),
})

// POST / — Avaliar fornecedor
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AvaliarSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-user-id'] as string
    if (!userId) throw new AppError('x-user-id obrigatorio', 401)

    // Calcular nota geral
    const notas = [parsed.data.nota_frete, parsed.data.nota_atendimento, parsed.data.nota_resposta, parsed.data.nota_confiabilidade]
      .filter((n): n is number => n != null)
    const notaGeral = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null

    const avaliacao = await (req.prisma as any).freteIntBidFornecedoresAvaliacoes.create({
      data: {
        ...parsed.data,
        product_id: 'bid-frete',
        user_id: userId,
        nota_geral: notaGeral,
      },
    })

    // Recalcular rating global
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.findFirst({
      where: { id: parsed.data.fornecedor_id },
      select: { email: true },
    })

    if (fornecedor) {
      // ratingEngine precisa de acesso cross-tenant para calcular ratings globais
      // Usar basePrisma (sem filtro de tenant) em vez de req.prisma (filtrado)
      await ratingEngine.recalcular(basePrisma, fornecedor.email)

      // Historico
      const tenantId = (req as any).tenantId
      if (tenantId && notaGeral) {
        historicoIntegration.fornecedorAvaliado(tenantId, userId, { id: parsed.data.fornecedor_id, nome: fornecedor.email }, notaGeral)
      }
    }

    res.status(201).json({ avaliacao })
  } catch (err) {
    next(err)
  }
})

// GET /fornecedor/:id — Rating de um fornecedor
router.get('/fornecedor/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.findFirst({
      where: { id: req.params.id },
      select: { email: true, nome: true },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    const [rating, avaliacoes] = await Promise.all([
      (req.prisma as any).freteIntBidClassificacaoFornecedores.findUnique({ where: { fornecedor_email: fornecedor.email } }).catch(() => null),
      (req.prisma as any).freteIntBidFornecedoresAvaliacoes.findMany({
        where: { fornecedor_id: req.params.id },
        orderBy: { created_at: 'desc' },
        take: 20,
      }),
    ])

    res.json({ fornecedor_nome: fornecedor.nome, rating, avaliacoes })
  } catch (err) {
    next(err)
  }
})

// GET /ranking — Ranking global de fornecedores
router.get('/ranking', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo, limit = '20' } = req.query as { tipo?: string; limit?: string }

    const where: Record<string, unknown> = {}
    if (tipo) where.tipo = tipo

    const fornecedores = await (req.prisma as any).freteIntBidFornecedores.findMany({
      where: { ...where, product_id: 'bid-frete', status: 'ATIVO' },
      select: { id: true, nome: true, tipo: true, email: true },
    })

    // Buscar ratings globais
    type FornecedorLite = { id: string; nome: string; tipo: string; email: string }
    type RatingLite = Record<string, unknown> & { fornecedor_email: string }
    const fornecedoresList = fornecedores as FornecedorLite[]
    const emails = fornecedoresList.map((f) => f.email)
    let ratings: RatingLite[] = []
    try {
      ratings = await (req.prisma as any).freteIntBidClassificacaoFornecedores.findMany({
        where: { fornecedor_email: { in: emails } },
        orderBy: { rating_global: 'desc' },
        take: Number(limit),
      })
    } catch { /* */ }

    const ranking = ratings.map((r: RatingLite, idx: number) => {
      const forn = fornecedoresList.find((f) => f.email === r.fornecedor_email)
      return {
        posicao: idx + 1,
        fornecedor_id: forn?.id,
        fornecedor_nome: forn?.nome,
        fornecedor_tipo: forn?.tipo,
        ...r,
      }
    })

    res.json({ ranking })
  } catch (err) {
    next(err)
  }
})

export { router as avaliacoesRouter }
