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
  id_corretora_bid_cambio: z.string(),
  id_cotacao_bid_cambio: z.string().optional(),
  nota_taxa_avaliacao_corretora_bid_cambio: z.number().int().min(1).max(5),
  nota_agilidade_avaliacao_corretora_bid_cambio: z.number().int().min(1).max(5),
  nota_atendimento_avaliacao_corretora_bid_cambio: z.number().int().min(1).max(5),
  nota_confiabilidade_avaliacao_corretora_bid_cambio: z.number().int().min(1).max(5),
  comentario_avaliacao_corretora_bid_cambio: z.string().optional(),
})

// --- POST /api/v1/bid-cambio/avaliacoes ---
avaliacoesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = criarAvaliacaoSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    // Verificar corretora existe
    const corretora = await (prisma as any).bidCambioCorretora.findFirst({
      where: { id_corretora_bid_cambio: input.id_corretora_bid_cambio },
    })
    if (!corretora) throw new AppError('Corretora nao encontrada', 404, 'NOT_FOUND')

    const avaliacao = await (prisma as any).bidCambioAvaliacaoCorretora.create({
      data: {
        id_corretora_bid_cambio: input.id_corretora_bid_cambio,
        id_cotacao_bid_cambio: input.id_cotacao_bid_cambio ?? null,
        id_usuario: userId,
        nota_taxa_avaliacao_corretora_bid_cambio: input.nota_taxa_avaliacao_corretora_bid_cambio,
        nota_agilidade_avaliacao_corretora_bid_cambio: input.nota_agilidade_avaliacao_corretora_bid_cambio,
        nota_atendimento_avaliacao_corretora_bid_cambio: input.nota_atendimento_avaliacao_corretora_bid_cambio,
        nota_confiabilidade_avaliacao_corretora_bid_cambio: input.nota_confiabilidade_avaliacao_corretora_bid_cambio,
        comentario_avaliacao_corretora_bid_cambio: input.comentario_avaliacao_corretora_bid_cambio ?? null,
      },
    })

    const notaGeral = (input.nota_taxa_avaliacao_corretora_bid_cambio + input.nota_agilidade_avaliacao_corretora_bid_cambio + input.nota_atendimento_avaliacao_corretora_bid_cambio + input.nota_confiabilidade_avaliacao_corretora_bid_cambio) / 4

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'AVALIAR_CORRETORA',
      entidade: 'BidCambioAvaliacaoCorretora',
      entidade_id: avaliacao.id_avaliacao_corretora_bid_cambio,
      detalhes: {
        id_corretora_bid_cambio: input.id_corretora_bid_cambio,
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

    const corretora = await (prisma as any).bidCambioCorretora.findFirst({
      where: { id_corretora_bid_cambio: req.params.id },
      select: { id_corretora_bid_cambio: true, nome_fantasia_corretora_bid_cambio: true, razao_social_corretora_bid_cambio: true },
    })
    if (!corretora) throw new AppError('Corretora nao encontrada', 404, 'NOT_FOUND')

    const where = { id_corretora_bid_cambio: req.params.id }

    const [avaliacoes, total, agregado] = await Promise.all([
      (prisma as any).bidCambioAvaliacaoCorretora.findMany({
        where,
        orderBy: { data_criacao_avaliacao_corretora_bid_cambio: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).bidCambioAvaliacaoCorretora.count({ where }),
      (prisma as any).bidCambioAvaliacaoCorretora.aggregate({
        where,
        _avg: {
          nota_taxa_avaliacao_corretora_bid_cambio: true,
          nota_agilidade_avaliacao_corretora_bid_cambio: true,
          nota_atendimento_avaliacao_corretora_bid_cambio: true,
          nota_confiabilidade_avaliacao_corretora_bid_cambio: true,
        },
      }),
    ])

    res.json({
      corretora,
      medias: {
        taxa: agregado._avg?.nota_taxa_avaliacao_corretora_bid_cambio ?? null,
        agilidade: agregado._avg?.nota_agilidade_avaliacao_corretora_bid_cambio ?? null,
        atendimento: agregado._avg?.nota_atendimento_avaliacao_corretora_bid_cambio ?? null,
        confiabilidade: agregado._avg?.nota_confiabilidade_avaliacao_corretora_bid_cambio ?? null,
        geral: agregado._avg ? ((agregado._avg.nota_taxa_avaliacao_corretora_bid_cambio + agregado._avg.nota_agilidade_avaliacao_corretora_bid_cambio + agregado._avg.nota_atendimento_avaliacao_corretora_bid_cambio + agregado._avg.nota_confiabilidade_avaliacao_corretora_bid_cambio) / 4) : null,
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

    const corretoras = await (prisma as any).bidCambioCorretora.findMany({
      where: { status_corretora_bid_cambio: 'ATIVA' },
      orderBy: { razao_social_corretora_bid_cambio: 'asc' },
      take: limit,
      select: {
        id_corretora_bid_cambio: true,
        razao_social_corretora_bid_cambio: true,
        nome_fantasia_corretora_bid_cambio: true,
        tipo_corretora_bid_cambio: true,
        email_corretora_bid_cambio: true,
        moedas_operadas_corretora_bid_cambio: true,
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
