/**
 * portal.ts — Portal Autenticado da Corretora (Pilar 2 — Marketplace)
 * Dashboard, cotacoes pendentes, respostas, desempenho — acesso autenticado
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { historicoIntegration, notificacoesIntegration } from '../services/tenantIntegrations.js'

export const portalRouter = Router()

// --- Schemas Zod ---

const responderSchema = z.object({
  taxa_oferecida_resposta_cotacao_bid_cambio: z.number().positive('Taxa deve ser positiva'),
  spread_resposta_cotacao_bid_cambio: z.number().min(0, 'Spread deve ser >= 0'),
  validade_minutos_resposta_cotacao_bid_cambio: z.number().int().min(1).max(1440).default(60),
  liquidacao_proposta_resposta_cotacao_bid_cambio: z.enum(['D0', 'D1', 'D2']).default('D2'),
  condicoes_resposta_cotacao_bid_cambio: z.string().optional(),
})

// --- GET /api/v1/bid-cambio/portal/dashboard ---
portalRouter.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const corretoraId = req.headers['x-corretora-id'] as string
    if (!corretoraId) throw new AppError('Header x-corretora-id obrigatorio', 400, 'MISSING_CORRETORA')

    const [pendentes, respondidas, aprovadas, totalOperacoes] = await Promise.all([
      (prisma as any).bidCambioDisparoCotacao.count({
        where: { id_corretora_bid_cambio: corretoraId, status_disparo_cotacao_bid_cambio: 'ENVIADO' },
      }),
      (prisma as any).bidCambioRespostaCotacao.count({
        where: { id_corretora_bid_cambio: corretoraId },
      }),
      (prisma as any).bidCambioRespostaCotacao.count({
        where: { id_corretora_bid_cambio: corretoraId, status_resposta_cotacao_bid_cambio: 'APROVADA' },
      }),
      (prisma as any).bidCambioRespostaCotacao.count({
        where: { id_corretora_bid_cambio: corretoraId },
      }),
    ])

    const corretora = await (prisma as any).bidCambioCorretora.findFirst({
      where: { id_corretora_bid_cambio: corretoraId },
      select: { id_corretora_bid_cambio: true, nome_fantasia_corretora_bid_cambio: true, razao_social_corretora_bid_cambio: true, status_corretora_bid_cambio: true },
    })

    res.json({
      corretora,
      metricas: {
        cotacoes_pendentes: pendentes,
        total_respondidas: respondidas,
        total_aprovadas: aprovadas,
        taxa_aprovacao: respondidas > 0 ? ((aprovadas / respondidas) * 100).toFixed(1) : '0.0',
        total_operacoes: totalOperacoes,
      },
    })
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/portal/cotacoes-pendentes ---
portalRouter.get('/cotacoes-pendentes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const corretoraId = req.headers['x-corretora-id'] as string
    if (!corretoraId) throw new AppError('Header x-corretora-id obrigatorio', 400, 'MISSING_CORRETORA')

    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)

    const where = {
      id_corretora_bid_cambio: corretoraId,
      status_disparo_cotacao_bid_cambio: 'ENVIADO',
      token_expiracao_disparo_cotacao_bid_cambio: { gt: new Date() },
    }

    const [bidRequests, total] = await Promise.all([
      (prisma as any).bidCambioDisparoCotacao.findMany({
        where,
        include: {
          cotacao: {
            select: {
              id_cotacao_bid_cambio: true, moeda_cotacao_bid_cambio: true, valor_cotacao_bid_cambio: true, tipo_operacao_cotacao_bid_cambio: true,
              modalidade_cotacao_bid_cambio: true, liquidacao_cotacao_bid_cambio: true, data_expiracao_cotacao_bid_cambio: true,
            },
          },
        },
        orderBy: { data_criacao_disparo_cotacao_bid_cambio: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).bidCambioDisparoCotacao.count({ where }),
    ])

    res.json({
      data: bidRequests,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/portal/minhas-respostas ---
portalRouter.get('/minhas-respostas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const corretoraId = req.headers['x-corretora-id'] as string
    if (!corretoraId) throw new AppError('Header x-corretora-id obrigatorio', 400, 'MISSING_CORRETORA')

    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const status = req.query.status as string | undefined

    const where: Record<string, unknown> = { id_corretora_bid_cambio: corretoraId }
    if (status) where.status_resposta_cotacao_bid_cambio = status

    const [respostas, total] = await Promise.all([
      (prisma as any).bidCambioRespostaCotacao.findMany({
        where,
        include: {
          cotacao: {
            select: { id_cotacao_bid_cambio: true, moeda_cotacao_bid_cambio: true, valor_cotacao_bid_cambio: true, tipo_operacao_cotacao_bid_cambio: true, status_cotacao_bid_cambio: true },
          },
        },
        orderBy: { data_criacao_resposta_cotacao_bid_cambio: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).bidCambioRespostaCotacao.count({ where }),
    ])

    res.json({
      data: respostas,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/portal/responder/:bidRequestId ---
portalRouter.post('/responder/:bidRequestId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = responderSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const corretoraId = req.headers['x-corretora-id'] as string
    if (!corretoraId) throw new AppError('Header x-corretora-id obrigatorio', 400, 'MISSING_CORRETORA')

    const bidRequest = await (prisma as any).bidCambioDisparoCotacao.findFirst({
      where: { id_disparo_cotacao_bid_cambio: req.params.bidRequestId, id_corretora_bid_cambio: corretoraId },
      include: { cotacao: true },
    })
    if (!bidRequest) throw new AppError('Solicitacao nao encontrada', 404, 'NOT_FOUND')
    if (bidRequest.status_disparo_cotacao_bid_cambio !== 'ENVIADO') {
      throw new AppError('Esta solicitacao ja foi respondida', 400, 'ALREADY_RESPONDED')
    }
    if (new Date() > new Date(bidRequest.token_expiracao_disparo_cotacao_bid_cambio)) {
      throw new AppError('Token expirado', 400, 'TOKEN_EXPIRED')
    }

    const validoAte = new Date()
    validoAte.setMinutes(validoAte.getMinutes() + input.validade_minutos_resposta_cotacao_bid_cambio)

    const cotacaoValor = Number(bidRequest.cotacao?.valor_cotacao_bid_cambio ?? 0)
    const iofPercentual = 0.38
    const valorTotalBrl = cotacaoValor * input.taxa_oferecida_resposta_cotacao_bid_cambio
    const iofValor = valorTotalBrl * (iofPercentual / 100)

    const resposta = await (prisma as any).bidCambioRespostaCotacao.create({
      data: {
        id_cotacao_bid_cambio: bidRequest.id_cotacao_bid_cambio,
        id_disparo_cotacao_bid_cambio: bidRequest.id_disparo_cotacao_bid_cambio,
        id_corretora_bid_cambio: corretoraId,
        taxa_oferecida_resposta_cotacao_bid_cambio: input.taxa_oferecida_resposta_cotacao_bid_cambio,
        spread_resposta_cotacao_bid_cambio: input.spread_resposta_cotacao_bid_cambio,
        valor_total_brl_resposta_cotacao_bid_cambio: Math.round(valorTotalBrl * 100) / 100,
        iof_percentual_resposta_cotacao_bid_cambio: iofPercentual,
        iof_valor_resposta_cotacao_bid_cambio: Math.round(iofValor * 100) / 100,
        validade_minutos_resposta_cotacao_bid_cambio: input.validade_minutos_resposta_cotacao_bid_cambio,
        validade_ate_resposta_cotacao_bid_cambio: validoAte,
        liquidacao_proposta_resposta_cotacao_bid_cambio: input.liquidacao_proposta_resposta_cotacao_bid_cambio,
        condicoes_resposta_cotacao_bid_cambio: input.condicoes_resposta_cotacao_bid_cambio ?? null,
        status_resposta_cotacao_bid_cambio: 'RECEBIDA',
      },
    })

    // Atualizar status do bid request
    await (prisma as any).bidCambioDisparoCotacao.update({
      where: { id_disparo_cotacao_bid_cambio: req.params.bidRequestId },
      data: { status_disparo_cotacao_bid_cambio: 'RESPONDIDO', respondido_em_disparo_cotacao_bid_cambio: new Date() },
    })

    // Notificar o solicitante
    const corretora = await (prisma as any).bidCambioCorretora.findFirst({
      where: { id_corretora_bid_cambio: corretoraId },
      select: { nome_fantasia_corretora_bid_cambio: true },
    })

    notificacoesIntegration.cotacaoRespondida(tenantId, bidRequest.cotacao?.id_usuario ?? '', {
      corretora_nome: corretora?.nome_fantasia_corretora_bid_cambio ?? 'Corretora',
      id_cotacao_bid_cambio: bidRequest.id_cotacao_bid_cambio,
    })

    historicoIntegration.registrar(tenantId, corretoraId, {
      acao: 'RESPONDER_COTACAO',
      entidade: 'BidCambioRespostaCotacao',
      entidade_id: resposta.id_resposta_cotacao_bid_cambio,
      detalhes: {
        id_cotacao_bid_cambio: bidRequest.id_cotacao_bid_cambio,
        taxa: input.taxa_oferecida_resposta_cotacao_bid_cambio,
        spread: input.spread_resposta_cotacao_bid_cambio,
      },
    })

    res.status(201).json(resposta)
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/portal/meu-desempenho ---
portalRouter.get('/meu-desempenho', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const corretoraId = req.headers['x-corretora-id'] as string
    if (!corretoraId) throw new AppError('Header x-corretora-id obrigatorio', 400, 'MISSING_CORRETORA')

    const [totalRespostas, aprovadas, reprovadas, avaliacoes] = await Promise.all([
      (prisma as any).bidCambioRespostaCotacao.count({ where: { id_corretora_bid_cambio: corretoraId } }),
      (prisma as any).bidCambioRespostaCotacao.count({ where: { id_corretora_bid_cambio: corretoraId, status_resposta_cotacao_bid_cambio: 'APROVADA' } }),
      (prisma as any).bidCambioRespostaCotacao.count({ where: { id_corretora_bid_cambio: corretoraId, status_resposta_cotacao_bid_cambio: 'REPROVADA' } }),
      (prisma as any).bidCambioAvaliacaoCorretora.aggregate({
        where: { id_corretora_bid_cambio: corretoraId },
        _avg: {
          nota_taxa_avaliacao_corretora_bid_cambio: true,
          nota_agilidade_avaliacao_corretora_bid_cambio: true,
          nota_atendimento_avaliacao_corretora_bid_cambio: true,
          nota_confiabilidade_avaliacao_corretora_bid_cambio: true,
        },
        _count: true,
      }),
    ])

    const corretora = await (prisma as any).bidCambioCorretora.findFirst({
      where: { id_corretora_bid_cambio: corretoraId },
      select: { id_corretora_bid_cambio: true, nome_fantasia_corretora_bid_cambio: true, razao_social_corretora_bid_cambio: true },
    })

    res.json({
      corretora,
      desempenho: {
        total_respostas: totalRespostas,
        aprovadas,
        reprovadas,
        pendentes: totalRespostas - aprovadas - reprovadas,
        taxa_aprovacao: totalRespostas > 0 ? ((aprovadas / totalRespostas) * 100).toFixed(1) : '0.0',
      },
      avaliacoes: {
        total: avaliacoes._count,
        media_taxa: avaliacoes._avg?.nota_taxa_avaliacao_corretora_bid_cambio ?? null,
        media_agilidade: avaliacoes._avg?.nota_agilidade_avaliacao_corretora_bid_cambio ?? null,
        media_atendimento: avaliacoes._avg?.nota_atendimento_avaliacao_corretora_bid_cambio ?? null,
        media_confiabilidade: avaliacoes._avg?.nota_confiabilidade_avaliacao_corretora_bid_cambio ?? null,
      },
    })
  } catch (err) { next(err) }
})
