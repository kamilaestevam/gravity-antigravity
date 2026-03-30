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
  taxa_oferecida: z.number().positive('Taxa deve ser positiva'),
  spread: z.number().min(0, 'Spread deve ser >= 0'),
  validade_minutos: z.number().int().min(1).max(1440).default(60),
  liquidacao_proposta: z.enum(['D0', 'D1', 'D2']).default('D2'),
  condicoes: z.string().optional(),
})

// --- GET /api/v1/bid-cambio/portal/dashboard ---
portalRouter.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!
    const corretoraId = req.headers['x-corretora-id'] as string
    if (!corretoraId) throw new AppError('Header x-corretora-id obrigatorio', 400, 'MISSING_CORRETORA')

    const [pendentes, respondidas, aprovadas, totalOperacoes] = await Promise.all([
      (prisma as any).bidRequestCambio.count({
        where: { corretora_id: corretoraId, status: 'ENVIADO' },
      }),
      (prisma as any).bidResponseCambio.count({
        where: { corretora_id: corretoraId },
      }),
      (prisma as any).bidResponseCambio.count({
        where: { corretora_id: corretoraId, status: 'APROVADA' },
      }),
      (prisma as any).bidResponseCambio.count({
        where: { corretora_id: corretoraId },
      }),
    ])

    const corretora = await (prisma as any).corretora.findFirst({
      where: { id: corretoraId },
      select: { id: true, nome_fantasia: true, razao_social: true, status: true },
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
      corretora_id: corretoraId,
      status: 'ENVIADO',
      token_expiracao: { gt: new Date() },
    }

    const [bidRequests, total] = await Promise.all([
      (prisma as any).bidRequestCambio.findMany({
        where,
        include: {
          cotacao: {
            select: {
              id: true, moeda: true, valor: true, tipo_operacao: true,
              modalidade: true, liquidacao: true, data_expiracao: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).bidRequestCambio.count({ where }),
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

    const where: any = { corretora_id: corretoraId }
    if (status) where.status = status

    const [respostas, total] = await Promise.all([
      (prisma as any).bidResponseCambio.findMany({
        where,
        include: {
          cotacao: {
            select: { id: true, moeda: true, valor: true, tipo_operacao: true, status: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      (prisma as any).bidResponseCambio.count({ where }),
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

    const bidRequest = await (prisma as any).bidRequestCambio.findFirst({
      where: { id: req.params.bidRequestId, corretora_id: corretoraId },
      include: { cotacao: true },
    })
    if (!bidRequest) throw new AppError('Solicitacao nao encontrada', 404, 'NOT_FOUND')
    if (bidRequest.status !== 'ENVIADO') {
      throw new AppError('Esta solicitacao ja foi respondida', 400, 'ALREADY_RESPONDED')
    }
    if (new Date() > new Date(bidRequest.token_expiracao)) {
      throw new AppError('Token expirado', 400, 'TOKEN_EXPIRED')
    }

    const validoAte = new Date()
    validoAte.setMinutes(validoAte.getMinutes() + input.validade_minutos)

    const cotacaoValor = Number(bidRequest.cotacao?.valor ?? 0)
    const iofPercentual = 0.38
    const valorTotalBrl = cotacaoValor * input.taxa_oferecida
    const iofValor = valorTotalBrl * (iofPercentual / 100)

    const resposta = await (prisma as any).bidResponseCambio.create({
      data: {
        cotacao_id: bidRequest.cotacao_id,
        bid_request_id: bidRequest.id,
        corretora_id: corretoraId,
        taxa_oferecida: input.taxa_oferecida,
        spread: input.spread,
        valor_total_brl: Math.round(valorTotalBrl * 100) / 100,
        iof_percentual: iofPercentual,
        iof_valor: Math.round(iofValor * 100) / 100,
        validade_minutos: input.validade_minutos,
        validade_ate: validoAte,
        liquidacao_proposta: input.liquidacao_proposta,
        condicoes: input.condicoes ?? null,
        status: 'RECEBIDA',
      },
    })

    // Atualizar status do bid request
    await (prisma as any).bidRequestCambio.update({
      where: { id: req.params.bidRequestId },
      data: { status: 'RESPONDIDO', respondido_em: new Date() },
    })

    // Notificar o solicitante
    const corretora = await (prisma as any).corretora.findFirst({
      where: { id: corretoraId },
      select: { nome_fantasia: true },
    })

    notificacoesIntegration.cotacaoRespondida(tenantId, bidRequest.cotacao?.user_id ?? '', {
      corretora_nome: corretora?.nome_fantasia ?? 'Corretora',
      cotacao_id: bidRequest.cotacao_id,
    })

    historicoIntegration.registrar(tenantId, corretoraId, {
      acao: 'RESPONDER_COTACAO',
      entidade: 'BidResponseCambio',
      entidade_id: resposta.id,
      detalhes: {
        cotacao_id: bidRequest.cotacao_id,
        taxa: input.taxa_oferecida,
        spread: input.spread,
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
      (prisma as any).bidResponseCambio.count({ where: { corretora_id: corretoraId } }),
      (prisma as any).bidResponseCambio.count({ where: { corretora_id: corretoraId, status: 'APROVADA' } }),
      (prisma as any).bidResponseCambio.count({ where: { corretora_id: corretoraId, status: 'REPROVADA' } }),
      (prisma as any).avaliacaoCorretora.aggregate({
        where: { corretora_id: corretoraId },
        _avg: {
          nota_taxa: true,
          nota_agilidade: true,
          nota_atendimento: true,
          nota_confiabilidade: true,
        },
        _count: true,
      }),
    ])

    const corretora = await (prisma as any).corretora.findFirst({
      where: { id: corretoraId },
      select: { id: true, nome_fantasia: true, razao_social: true },
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
        media_taxa: avaliacoes._avg?.nota_taxa ?? null,
        media_agilidade: avaliacoes._avg?.nota_agilidade ?? null,
        media_atendimento: avaliacoes._avg?.nota_atendimento ?? null,
        media_confiabilidade: avaliacoes._avg?.nota_confiabilidade ?? null,
      },
    })
  } catch (err) { next(err) }
})
