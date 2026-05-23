/**
 * avaliacoes.ts — Rotas de Avaliacao de Fornecedores
 * POST /                    Avaliar fornecedor (manual)
 * GET  /fornecedor/:id      Rating de um fornecedor
 * GET  /ranking             Ranking global de fornecedores
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { motorClassificacao } from '../services/motor-classificacao.js'
import { AppError } from '../lib/erros.js'
import { historicoIntegration } from '../services/integracoes-tenant.js'
import { prisma as basePrisma } from '../middleware/isolamento-tenant.js'

const router = Router()

const AvaliarSchema = z.object({
  id_fornecedor_bid_frete_internacional: z.string().min(1),
  id_cotacao_bid_frete_internacional: z.string().optional(),
  nota_frete_avaliacao_bid_frete_internacional: z.number().int().min(1).max(5).optional(),
  nota_atendimento_avaliacao_bid_frete_internacional: z.number().int().min(1).max(5).optional(),
  nota_resposta_avaliacao_bid_frete_internacional: z.number().int().min(1).max(5).optional(),
  nota_confiabilidade_avaliacao_bid_frete_internacional: z.number().int().min(1).max(5).optional(),
  comentario_avaliacao_bid_frete_internacional: z.string().optional(),
})

// POST / — Avaliar fornecedor
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AvaliarSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401)

    // Calcular nota geral
    const notas = [parsed.data.nota_frete_avaliacao_bid_frete_internacional, parsed.data.nota_atendimento_avaliacao_bid_frete_internacional, parsed.data.nota_resposta_avaliacao_bid_frete_internacional, parsed.data.nota_confiabilidade_avaliacao_bid_frete_internacional]
      .filter((n): n is number => n != null)
    const notaGeral = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null

    const avaliacao = await (req.prisma as any).bidFreteInternacionalAvaliacao.create({
      data: {
        ...parsed.data,
        id_produto_gravity: 'bid-frete-internacional',
        id_usuario: userId,
        nota_geral_avaliacao_bid_frete_internacional: notaGeral,
      },
    })

    // Recalcular rating global
    const fornecedor = await (req.prisma as any).bidFreteInternacionalFornecedor.findFirst({
      where: { id_fornecedor_bid_frete_internacional: parsed.data.id_fornecedor_bid_frete_internacional },
      select: { email_fornecedor_bid_frete_internacional: true },
    })

    if (fornecedor) {
      // ratingEngine precisa de acesso cross-tenant para calcular ratings globais
      // Usar basePrisma (sem filtro de tenant) em vez de req.prisma (filtrado)
      await motorClassificacao.recalcular(basePrisma, fornecedor.email_fornecedor_bid_frete_internacional)

      // Historico
      const tenantId = (req as any).tenantId
      if (tenantId && notaGeral) {
        historicoIntegration.fornecedorAvaliado(tenantId, userId, { id: parsed.data.id_fornecedor_bid_frete_internacional, nome: fornecedor.email_fornecedor_bid_frete_internacional }, notaGeral)
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
    const fornecedor = await (req.prisma as any).bidFreteInternacionalFornecedor.findFirst({
      where: { id_fornecedor_bid_frete_internacional: req.params.id },
      select: { email_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    const [rating, avaliacoes] = await Promise.all([
      (req.prisma as any).bidFreteInternacionalClassificacao.findUnique({ where: { email_fornecedor_classificacao_bid_frete_internacional: fornecedor.email_fornecedor_bid_frete_internacional } }).catch(() => null),
      (req.prisma as any).bidFreteInternacionalAvaliacao.findMany({
        where: { id_fornecedor_bid_frete_internacional: req.params.id },
        orderBy: { data_criacao_avaliacao_bid_frete_internacional: 'desc' },
        take: 20,
      }),
    ])

    res.json({ fornecedor_nome: fornecedor.nome_fornecedor_bid_frete_internacional, rating, avaliacoes })
  } catch (err) {
    next(err)
  }
})

// GET /ranking — Ranking global de fornecedores
router.get('/ranking', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tipo, limit = '20' } = req.query as { tipo?: string; limit?: string }

    const where: Record<string, unknown> = {}
    if (tipo) where.tipo_fornecedor_bid_frete_internacional = tipo

    const fornecedores = await (req.prisma as any).bidFreteInternacionalFornecedor.findMany({
      where: { ...where, id_produto_gravity: 'bid-frete-internacional', status_fornecedor_bid_frete_internacional: 'ATIVO' },
      select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true, tipo_fornecedor_bid_frete_internacional: true, email_fornecedor_bid_frete_internacional: true },
    })

    // Buscar ratings globais
    type FornecedorLite = { id_fornecedor_bid_frete_internacional: string; nome_fornecedor_bid_frete_internacional: string; tipo_fornecedor_bid_frete_internacional: string; email_fornecedor_bid_frete_internacional: string }
    type RatingLite = Record<string, unknown> & { email_fornecedor_classificacao_bid_frete_internacional: string }
    const fornecedoresList = fornecedores as FornecedorLite[]
    const emails = fornecedoresList.map((f) => f.email_fornecedor_bid_frete_internacional)
    let ratings: RatingLite[] = []
    try {
      ratings = await (req.prisma as any).bidFreteInternacionalClassificacao.findMany({
        where: { email_fornecedor_classificacao_bid_frete_internacional: { in: emails } },
        orderBy: { nota_global_classificacao_bid_frete_internacional: 'desc' },
        take: Number(limit),
      })
    } catch { /* */ }

    const ranking = ratings.map((r: RatingLite, idx: number) => {
      const forn = fornecedoresList.find((f) => f.email_fornecedor_bid_frete_internacional === r.email_fornecedor_classificacao_bid_frete_internacional)
      return {
        posicao: idx + 1,
        id_fornecedor_bid_frete_internacional: forn?.id_fornecedor_bid_frete_internacional,
        fornecedor_nome: forn?.nome_fornecedor_bid_frete_internacional,
        fornecedor_tipo: forn?.tipo_fornecedor_bid_frete_internacional,
        ...r,
      }
    })

    res.json({ ranking })
  } catch (err) {
    next(err)
  }
})

export { router as avaliacoesRouter }
