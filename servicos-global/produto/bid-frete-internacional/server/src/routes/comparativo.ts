/**
 * comparativo.ts — Rotas de Comparativo e Aprovacao
 * GET  /:cotacaoId           Ranking comparativo
 * POST /:cotacaoId/aprovar   Aprovar cotacao (2 cliques)
 * POST /:cotacaoId/reprovar  Reprovar cotacao
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { motorComparativo } from '../services/motor-comparativo.js'
import { AppError } from '../lib/erros.js'
import { notificacoesIntegration, historicoIntegration, gabiIntegration } from '../services/integracoes-tenant.js'

const router = Router()

// GET /:cotacaoId/classificacao — Ranking comparativo
router.get('/:cotacaoId/classificacao', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await motorComparativo.ranquear(req.prisma!, req.params.cotacaoId)
    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

// POST /:cotacaoId/aprovar — Aprovar em 2 cliques
router.post('/:cotacaoId/aprovar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_proposta_bid_frete_internacional } = req.body
    if (!id_proposta_bid_frete_internacional) throw new AppError('id_proposta_bid_frete_internacional obrigatorio', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')

    await motorComparativo.aprovar(req.prisma!, req.params.cotacaoId, id_proposta_bid_frete_internacional, userId)

    // Fetch the updated cotacao with relations
    const cotacao = await (req.prisma as any).bidFreteInternacionalCotacao.findFirst({
      where: { id_cotacao_bid_frete_internacional: req.params.cotacaoId },
      include: {
        pedidos_cotacao: {
          include: {
            fornecedor: { select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true, tipo_fornecedor_bid_frete_internacional: true, email_fornecedor_bid_frete_internacional: true } },
          },
        },
        propostas: {
          include: {
            fornecedor: { select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true, tipo_fornecedor_bid_frete_internacional: true, email_fornecedor_bid_frete_internacional: true } },
            taxas: true,
          },
          orderBy: { valor_total_proposta_bid_frete_internacional: 'asc' },
        },
      },
    })

    // Integrações S2S (fire-and-forget)
    const tenantId = (req as any).tenantId
    if (tenantId) {
      notificacoesIntegration.cotacaoAprovada(tenantId, userId, { cotacao_numero: req.params.cotacaoId, fornecedor_nome: id_proposta_bid_frete_internacional })
      historicoIntegration.cotacaoAprovada(tenantId, userId, { id: req.params.cotacaoId, numero_cotacao_bid_frete_internacional: req.params.cotacaoId }, id_proposta_bid_frete_internacional, 0)
    }

    res.json({ cotacao })
  } catch (err) {
    next(err)
  }
})

// POST /:cotacaoId/reprovar — Reprovar cotacao com justificativa
router.post('/:cotacaoId/reprovar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { motivo } = req.body

    await (req.prisma as any).bidFreteInternacionalCotacao.update({
      where: { id_cotacao_bid_frete_internacional: req.params.cotacaoId },
      data: {
        status_cotacao_bid_frete_internacional: 'REPROVADA',
        motivo_reprovacao_cotacao_bid_frete_internacional: motivo ?? null,
      },
    })

    // Marcar todas as respostas como reprovadas
    await (req.prisma as any).bidFreteInternacionalProposta.updateMany({
      where: { id_cotacao_bid_frete_internacional: req.params.cotacaoId },
      data: { status_proposta_bid_frete_internacional: 'REPROVADA' },
    })

    // Fetch the updated cotacao with relations
    const cotacao = await (req.prisma as any).bidFreteInternacionalCotacao.findFirst({
      where: { id_cotacao_bid_frete_internacional: req.params.cotacaoId },
      include: {
        pedidos_cotacao: {
          include: {
            fornecedor: { select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true, tipo_fornecedor_bid_frete_internacional: true, email_fornecedor_bid_frete_internacional: true } },
          },
        },
        propostas: {
          include: {
            fornecedor: { select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true, tipo_fornecedor_bid_frete_internacional: true, email_fornecedor_bid_frete_internacional: true } },
            taxas: true,
          },
          orderBy: { valor_total_proposta_bid_frete_internacional: 'asc' },
        },
      },
    })

    // Integrações S2S
    const tenantId = (req as any).tenantId
    const userId = req.headers['x-id-usuario'] as string
    if (tenantId) {
      historicoIntegration.cotacaoReprovada(tenantId, userId, { id: req.params.cotacaoId, numero_cotacao_bid_frete_internacional: req.params.cotacaoId }, motivo)
    }

    res.json({ cotacao })
  } catch (err) {
    next(err)
  }
})

// GET /:cotacaoId/analise-ia — Análise Gabi AI das propostas
router.get('/:cotacaoId/analise-ia', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401)

    // Buscar ranking
    const resultado = await motorComparativo.ranquear(req.prisma!, req.params.cotacaoId)

    if (resultado.ranking.length === 0) {
      return res.json({ analise: null, motivo: 'Nenhuma resposta para analisar' })
    }

    const analise = await gabiIntegration.analisarPropostas(
      req.tenantId!,
      userId,
      {
        cotacao_numero: resultado.cotacao.numero_cotacao_bid_frete_internacional,
        origem: resultado.cotacao.origem_nome_cotacao_bid_frete_internacional,
        destino: resultado.cotacao.destino_nome_cotacao_bid_frete_internacional,
        respostas: resultado.ranking.map(r => ({
          fornecedor: r.fornecedor_nome,
          valor_total_proposta_bid_frete_internacional: r.valor_total_proposta_bid_frete_internacional,
          dias_transito: r.dias_transito_proposta_bid_frete_internacional,
          nota_global: r.nota_global_classificacao_bid_frete_internacional ?? 0,
        })),
      }
    )

    res.json({ analise, ranking_resumo: resultado.ranking.slice(0, 3).map(r => ({ fornecedor: r.fornecedor_nome, valor: r.valor_total_proposta_bid_frete_internacional, transit: r.dias_transito_proposta_bid_frete_internacional })) })
  } catch (err) {
    next(err)
  }
})

export { router as comparativoRouter }
