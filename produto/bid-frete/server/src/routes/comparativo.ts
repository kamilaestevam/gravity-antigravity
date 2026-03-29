/**
 * comparativo.ts — Rotas de Comparativo e Aprovacao
 * GET  /:cotacaoId           Ranking comparativo
 * POST /:cotacaoId/aprovar   Aprovar cotacao (2 cliques)
 * POST /:cotacaoId/reprovar  Reprovar cotacao
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { comparativoEngine } from '../services/comparativoEngine.js'
import { AppError } from '../lib/errors.js'
import { notificacoesIntegration, historicoIntegration, gabiIntegration } from '../services/tenantIntegrations.js'

const router = Router()

// GET /:cotacaoId — Ranking comparativo
router.get('/:cotacaoId', async (req: Request & { prisma?: any }, res: Response, next: NextFunction) => {
  try {
    const resultado = await comparativoEngine.ranquear(req.prisma, req.params.cotacaoId)
    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

// POST /:cotacaoId/aprovar — Aprovar em 2 cliques
router.post('/:cotacaoId/aprovar', async (req: Request & { prisma?: any }, res: Response, next: NextFunction) => {
  try {
    const { response_id } = req.body
    if (!response_id) throw new AppError('response_id obrigatorio', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-user-id'] as string
    if (!userId) throw new AppError('x-user-id obrigatorio', 401, 'UNAUTHORIZED')

    const resultado = await comparativoEngine.aprovar(req.prisma, req.params.cotacaoId, response_id, userId)

    // Integrações S2S (fire-and-forget)
    const tenantId = (req as any).tenantId
    if (tenantId) {
      notificacoesIntegration.cotacaoAprovada(tenantId, userId, { cotacao_numero: req.params.cotacaoId, fornecedor_nome: response_id })
      historicoIntegration.cotacaoAprovada(tenantId, userId, { id: req.params.cotacaoId, numero: req.params.cotacaoId }, response_id, 0)
    }

    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

// POST /:cotacaoId/reprovar — Reprovar cotacao com justificativa
router.post('/:cotacaoId/reprovar', async (req: Request & { prisma?: any }, res: Response, next: NextFunction) => {
  try {
    const { motivo } = req.body

    await req.prisma.cotacao.update({
      where: { id: req.params.cotacaoId },
      data: {
        status: 'REPROVADA',
        motivo_reprovacao: motivo ?? null,
      },
    })

    // Marcar todas as respostas como reprovadas
    await req.prisma.bidResponse.updateMany({
      where: { cotacao_id: req.params.cotacaoId },
      data: { status: 'REPROVADA' },
    })

    // Integrações S2S
    const tenantId = (req as any).tenantId
    const userId = req.headers['x-user-id'] as string
    if (tenantId) {
      historicoIntegration.cotacaoReprovada(tenantId, userId, { id: req.params.cotacaoId, numero: req.params.cotacaoId }, motivo)
    }

    res.json({ reprovada: true })
  } catch (err) {
    next(err)
  }
})

// GET /:cotacaoId/analise-ia — Análise Gabi AI das propostas
router.get('/:cotacaoId/analise-ia', async (req: Request & { prisma?: any; tenantId?: string }, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string
    if (!userId) throw new AppError('x-user-id obrigatorio', 401)

    // Buscar ranking
    const resultado = await comparativoEngine.ranquear(req.prisma, req.params.cotacaoId)

    if (resultado.ranking.length === 0) {
      return res.json({ analise: null, motivo: 'Nenhuma resposta para analisar' })
    }

    const analise = await gabiIntegration.analisarPropostas(
      req.tenantId!,
      userId,
      {
        cotacao_numero: resultado.cotacao.numero,
        origem: resultado.cotacao.origem_nome,
        destino: resultado.cotacao.destino_nome,
        respostas: resultado.ranking.map(r => ({
          fornecedor: r.fornecedor_nome,
          valor_total: r.valor_total,
          transit_time: r.transit_time_dias,
          rating: r.rating_global ?? 0,
        })),
      }
    )

    res.json({ analise, ranking_resumo: resultado.ranking.slice(0, 3).map(r => ({ fornecedor: r.fornecedor_nome, valor: r.valor_total, transit: r.transit_time_dias })) })
  } catch (err) {
    next(err)
  }
})

export { router as comparativoRouter }
