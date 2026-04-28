/**
 * avaliacoes.ts — Rotas de Avaliacao de Corretoras (Pilar 2 — Marketplace)
 * Rating manual por criterio, historico de avaliacoes, ranking geral
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { historicoIntegration } from '../services/tenantIntegrations.js'

export const avaliacoesRouter = Router()

// --- Schemas Zod ---

const criarAvaliacaoSchema = z.object({
  corretora_id: z.string(),
  cotacao_id: z.string().optional(),
  nota_taxa: z.number().int().min(1).max(5),
  nota_agilidade: z.number().int().min(1).max(5),
  nota_atendimento: z.number().int().min(1).max(5),
  nota_confiabilidade: z.number().int().min(1).max(5),
  comentario: z.string().optional(),
})

// --- POST /api/v1/bid-cambio/avaliacoes ---
avaliacoesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = criarAvaliacaoSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    // Verificar corretora existe
    const corretora = await (prisma as any).corretora.findFirst({
      where: { id: input.corretora_id },
    })
    if (!corretora) throw new AppError('Corretora nao encontrada', 404, 'NOT_FOUND')

    const avaliacao = await (prisma as any).avaliacaoCorretora.create({
      data: {
        corretora_id: input.corretora_id,
        cotacao_id: input.cotacao_id ?? null,
        user_id: userId,
        nota_taxa: input.nota_taxa,
        nota_agilidade: input.nota_agilidade,
        nota_atendimento: input.nota_atendimento,
        nota_confiabilidade: input.nota_confiabilidade,
        comentario: input.comentario ?? null,
      },
    })

    const notaGeral = (input.nota_taxa + input.nota_agilidade + input.nota_atendimento + input.nota_confiabilidade) / 4

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'AVALIAR_CORRETORA',
      entidade: 'AvaliacaoCorretora',
      entidade_id: avaliacao.id,
      detalhes: {
        corretora_id: input.corretora_id,
        nota_geral: notaGeral,
      },
    })

    res.status(201).json(avaliacao)
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/avaliacoes/corretora/:id ---
avaliacoesRouter.get('/corretora/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)

    const corretora = await (prisma as any).corretora.findFirst({
      where: { id: req.params.id },
      select: { id: true, nome_fantasia: true, razao_social: true },
    })
    if (!corretora) throw new AppError('Corretora nao encontrada', 404, 'NOT_FOUND')

    const where = { corretora_id: req.params.id }

    const [avaliacoes, total, agregado] = await Promise.all([
      (prisma as any).avaliacaoCorretora.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).avaliacaoCorretora.count({ where }),
      (prisma as any).avaliacaoCorretora.aggregate({
        where,
        _avg: {
          nota_taxa: true,
          nota_agilidade: true,
          nota_atendimento: true,
          nota_confiabilidade: true,
        },
      }),
    ])

    res.json({
      corretora,
      medias: {
        taxa: agregado._avg?.nota_taxa ?? null,
        agilidade: agregado._avg?.nota_agilidade ?? null,
        atendimento: agregado._avg?.nota_atendimento ?? null,
        confiabilidade: agregado._avg?.nota_confiabilidade ?? null,
        geral: agregado._avg ? ((agregado._avg.nota_taxa + agregado._avg.nota_agilidade + agregado._avg.nota_atendimento + agregado._avg.nota_confiabilidade) / 4) : null,
      },
      avaliacoes: {
        data: avaliacoes,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    })
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/avaliacoes/ranking ---
avaliacoesRouter.get('/ranking', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const criterio = (req.query.criterio as string) || 'rating'

    const corretoras = await (prisma as any).corretora.findMany({
      where: { status: 'ATIVA' },
      orderBy: { razao_social: 'asc' },
      take: limit,
      select: {
        id: true,
        razao_social: true,
        nome_fantasia: true,
        tipo: true,
        email: true,
        moedas_operadas: true,
        _count: { select: { bid_responses: true, avaliacoes: true } },
      },
    })

    res.json({
      ranking: corretoras.map((c: Record<string, unknown>, index: number) => ({
        posicao: index + 1,
        ...c,
      })),
      criterio,
      total: corretoras.length,
    })
  } catch (err) { next(err) }
})
