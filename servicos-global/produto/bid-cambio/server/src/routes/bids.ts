/**
 * bids.ts — Rotas de Disparo de BIDs para Corretoras (Pilar 2 — Marketplace)
 * Disparo de cotacoes, geracao de tokens publicos, envio de email
 */

import { Router, Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { emailIntegration, historicoIntegration, notificacoesIntegration } from '../services/tenantIntegrations.js'

export const bidsRouter = Router()

// --- Schemas Zod ---

const dispararSchema = z.object({
  id_cotacao_bid_cambio: z.string(),
  corretora_ids: z.array(z.string()).min(1, 'Selecione ao menos uma corretora'),
  mensagem_personalizada: z.string().optional(),
})

const cotacaoAbertaSchema = z.object({
  id_cotacao_bid_cambio: z.string(),
  mensagem_personalizada: z.string().optional(),
})

// --- POST /api/v1/bid-cambio/bids/disparar ---
bidsRouter.post('/disparar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = dispararSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    const cotacao = await (prisma as any).bidCambioCotacao.findFirst({
      where: { id_cotacao_bid_cambio: input.id_cotacao_bid_cambio },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (!['RASCUNHO', 'ENVIADA_CORRETORAS'].includes(cotacao.status_cotacao_bid_cambio)) {
      throw new AppError('Cotacao nao pode ser disparada neste status', 400, 'INVALID_STATUS')
    }

    const corretoras = await (prisma as any).bidCambioCorretora.findMany({
      where: { id_corretora_bid_cambio: { in: input.corretora_ids }, status_corretora_bid_cambio: 'ATIVA' },
    })
    if (corretoras.length === 0) {
      throw new AppError('Nenhuma corretora ativa encontrada', 400, 'NO_ACTIVE_CORRETORAS')
    }

    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + 7)

    const bidRequests = await Promise.all(
      corretoras.map(async (corretora: { id_corretora_bid_cambio: string; email_corretora_bid_cambio?: string; nome_fantasia_corretora_bid_cambio?: string; [key: string]: unknown }) => {
        const tokenPublico = crypto.randomUUID()

        const bidRequest = await (prisma as any).bidCambioDisparoCotacao.create({
          data: {
            id_cotacao_bid_cambio: input.id_cotacao_bid_cambio,
            id_corretora_bid_cambio: corretora.id_corretora_bid_cambio,
            token_publico_disparo_cotacao_bid_cambio: tokenPublico,
            token_expiracao_disparo_cotacao_bid_cambio: expiraEm,
            status_disparo_cotacao_bid_cambio: 'ENVIADO',
            enviado_em_disparo_cotacao_bid_cambio: new Date(),
          },
        })

        // Fire-and-forget: enviar email para corretora
        if (corretora.email_corretora_bid_cambio) {
          emailIntegration.enviar(tenantId, {
            para: corretora.email_corretora_bid_cambio,
            assunto: `Nova cotacao de cambio — ${cotacao.moeda_cotacao_bid_cambio} ${cotacao.valor_cotacao_bid_cambio}`,
            corpo_html: `
              <h2>Voce recebeu uma solicitacao de cotacao de cambio</h2>
              <p><strong>Moeda:</strong> ${cotacao.moeda_cotacao_bid_cambio}</p>
              <p><strong>Valor:</strong> ${cotacao.valor_cotacao_bid_cambio}</p>
              <p><strong>Tipo:</strong> ${cotacao.tipo_operacao_cotacao_bid_cambio}</p>
              <p><strong>Modalidade:</strong> ${cotacao.modalidade_cotacao_bid_cambio}</p>
              ${input.mensagem_personalizada ? `<p><strong>Mensagem:</strong> ${input.mensagem_personalizada}</p>` : ''}
              <p>Acesse o portal para enviar sua proposta:</p>
              <p><a href="${process.env.PORTAL_PUBLIC_URL ?? 'http://localhost:5001'}/portal/${tokenPublico}">Responder Cotacao</a></p>
              <p><em>Este link expira em 7 dias.</em></p>
            `,
          })
        }

        return bidRequest
      })
    )

    // Atualizar status da cotacao
    await (prisma as any).bidCambioCotacao.update({
      where: { id_cotacao_bid_cambio: input.id_cotacao_bid_cambio },
      data: { status_cotacao_bid_cambio: 'ENVIADA_CORRETORAS' },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'DISPARAR_BID',
      entidade: 'BidCambioCotacao',
      entidade_id: input.id_cotacao_bid_cambio,
      detalhes: {
        corretoras_count: corretoras.length,
        corretora_ids: input.corretora_ids,
      },
    })

    res.status(201).json({
      id_cotacao_bid_cambio: input.id_cotacao_bid_cambio,
      bid_requests: bidRequests,
      total_disparados: bidRequests.length,
      expira_em: expiraEm.toISOString(),
    })
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/bids/cotacao-aberta ---
bidsRouter.post('/cotacao-aberta', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = cotacaoAbertaSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-id-usuario'] as string

    const cotacao = await (prisma as any).bidCambioCotacao.findFirst({
      where: { id_cotacao_bid_cambio: input.id_cotacao_bid_cambio },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (!['RASCUNHO', 'ENVIADA_CORRETORAS'].includes(cotacao.status_cotacao_bid_cambio)) {
      throw new AppError('Cotacao nao pode ser aberta neste status', 400, 'INVALID_STATUS')
    }

    // Disparar para TODAS as corretoras ativas
    const corretoras = await (prisma as any).bidCambioCorretora.findMany({
      where: { status_corretora_bid_cambio: 'ATIVA' },
    })
    if (corretoras.length === 0) {
      throw new AppError('Nenhuma corretora ativa cadastrada', 400, 'NO_ACTIVE_CORRETORAS')
    }

    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + 7)

    const bidRequests = await Promise.all(
      corretoras.map(async (corretora: { id_corretora_bid_cambio: string; email_corretora_bid_cambio?: string; nome_fantasia_corretora_bid_cambio?: string; [key: string]: unknown }) => {
        const tokenPublico = crypto.randomUUID()

        const bidRequest = await (prisma as any).bidCambioDisparoCotacao.create({
          data: {
            id_cotacao_bid_cambio: input.id_cotacao_bid_cambio,
            id_corretora_bid_cambio: corretora.id_corretora_bid_cambio,
            token_publico_disparo_cotacao_bid_cambio: tokenPublico,
            token_expiracao_disparo_cotacao_bid_cambio: expiraEm,
            status_disparo_cotacao_bid_cambio: 'ENVIADO',
            enviado_em_disparo_cotacao_bid_cambio: new Date(),
          },
        })

        if (corretora.email_corretora_bid_cambio) {
          emailIntegration.enviar(tenantId, {
            para: corretora.email_corretora_bid_cambio,
            assunto: `Cotacao aberta de cambio — ${cotacao.moeda_cotacao_bid_cambio} ${cotacao.valor_cotacao_bid_cambio}`,
            corpo_html: `
              <h2>Cotacao aberta de cambio disponivel</h2>
              <p><strong>Moeda:</strong> ${cotacao.moeda_cotacao_bid_cambio}</p>
              <p><strong>Valor:</strong> ${cotacao.valor_cotacao_bid_cambio}</p>
              <p><a href="${process.env.PORTAL_PUBLIC_URL ?? 'http://localhost:5001'}/portal/${tokenPublico}">Responder Cotacao</a></p>
            `,
          })
        }

        return bidRequest
      })
    )

    await (prisma as any).bidCambioCotacao.update({
      where: { id_cotacao_bid_cambio: input.id_cotacao_bid_cambio },
      data: { status_cotacao_bid_cambio: 'ENVIADA_CORRETORAS' },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'COTACAO_ABERTA',
      entidade: 'BidCambioCotacao',
      entidade_id: input.id_cotacao_bid_cambio,
      detalhes: { corretoras_count: corretoras.length },
    })

    res.status(201).json({
      id_cotacao_bid_cambio: input.id_cotacao_bid_cambio,
      bid_requests: bidRequests,
      total_disparados: bidRequests.length,
      expira_em: expiraEm.toISOString(),
    })
  } catch (err) { next(err) }
})

// --- GET /api/v1/bid-cambio/bids/cotacao/:id ---
bidsRouter.get('/cotacao/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = req.prisma!

    const bidRequests = await (prisma as any).bidCambioDisparoCotacao.findMany({
      where: { id_cotacao_bid_cambio: req.params.id },
      include: {
        corretora: { select: { id_corretora_bid_cambio: true, nome_fantasia_corretora_bid_cambio: true, email_corretora_bid_cambio: true, status_corretora_bid_cambio: true } },
      },
      orderBy: { data_criacao_disparo_cotacao_bid_cambio: 'desc' },
    })

    const cotacao = await (prisma as any).bidCambioCotacao.findFirst({
      where: { id_cotacao_bid_cambio: req.params.id },
      select: { id_cotacao_bid_cambio: true, moeda_cotacao_bid_cambio: true, valor_cotacao_bid_cambio: true, status_cotacao_bid_cambio: true },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    res.json({
      cotacao,
      bid_requests: bidRequests,
      total: bidRequests.length,
      respondidos: bidRequests.filter((b: { status_disparo_cotacao_bid_cambio: string }) => b.status_disparo_cotacao_bid_cambio === 'RESPONDIDO').length,
      pendentes: bidRequests.filter((b: { status_disparo_cotacao_bid_cambio: string }) => b.status_disparo_cotacao_bid_cambio === 'ENVIADO').length,
    })
  } catch (err) { next(err) }
})
