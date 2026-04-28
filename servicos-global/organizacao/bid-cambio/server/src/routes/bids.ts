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
  cotacao_id: z.string(),
  corretora_ids: z.array(z.string()).min(1, 'Selecione ao menos uma corretora'),
  mensagem_personalizada: z.string().optional(),
})

const cotacaoAbertaSchema = z.object({
  cotacao_id: z.string(),
  mensagem_personalizada: z.string().optional(),
})

// --- POST /api/v1/bid-cambio/bids/disparar ---
bidsRouter.post('/disparar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = dispararSchema.parse(req.body)
    const prisma = req.prisma!
    const tenantId = req.tenantId!
    const userId = req.headers['x-user-id'] as string

    const cotacao = await (prisma as any).cotacaoCambio.findFirst({
      where: { id: input.cotacao_id },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (!['RASCUNHO', 'ENVIADA_CORRETORAS'].includes(cotacao.status)) {
      throw new AppError('Cotacao nao pode ser disparada neste status', 400, 'INVALID_STATUS')
    }

    const corretoras = await (prisma as any).corretora.findMany({
      where: { id: { in: input.corretora_ids }, status: 'ATIVA' },
    })
    if (corretoras.length === 0) {
      throw new AppError('Nenhuma corretora ativa encontrada', 400, 'NO_ACTIVE_CORRETORAS')
    }

    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + 7)

    const bidRequests = await Promise.all(
      corretoras.map(async (corretora: { id: string; email?: string; nome_fantasia?: string; [key: string]: unknown }) => {
        const tokenPublico = crypto.randomUUID()

        const bidRequest = await (prisma as any).bidRequestCambio.create({
          data: {
            cotacao_id: input.cotacao_id,
            corretora_id: corretora.id,
            token_publico: tokenPublico,
            token_expiracao: expiraEm,
            status: 'ENVIADO',
            enviado_em: new Date(),
          },
        })

        // Fire-and-forget: enviar email para corretora
        if (corretora.email) {
          emailIntegration.enviar(tenantId, {
            para: corretora.email,
            assunto: `Nova cotacao de cambio — ${cotacao.moeda} ${cotacao.valor}`,
            corpo_html: `
              <h2>Voce recebeu uma solicitacao de cotacao de cambio</h2>
              <p><strong>Moeda:</strong> ${cotacao.moeda}</p>
              <p><strong>Valor:</strong> ${cotacao.valor}</p>
              <p><strong>Tipo:</strong> ${cotacao.tipo_operacao}</p>
              <p><strong>Modalidade:</strong> ${cotacao.modalidade}</p>
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
    await (prisma as any).cotacaoCambio.update({
      where: { id: input.cotacao_id },
      data: { status: 'ENVIADA_CORRETORAS' },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'DISPARAR_BID',
      entidade: 'CotacaoCambio',
      entidade_id: input.cotacao_id,
      detalhes: {
        corretoras_count: corretoras.length,
        corretora_ids: input.corretora_ids,
      },
    })

    res.status(201).json({
      cotacao_id: input.cotacao_id,
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
    const userId = req.headers['x-user-id'] as string

    const cotacao = await (prisma as any).cotacaoCambio.findFirst({
      where: { id: input.cotacao_id },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')
    if (!['RASCUNHO', 'ENVIADA_CORRETORAS'].includes(cotacao.status)) {
      throw new AppError('Cotacao nao pode ser aberta neste status', 400, 'INVALID_STATUS')
    }

    // Disparar para TODAS as corretoras ativas
    const corretoras = await (prisma as any).corretora.findMany({
      where: { status: 'ATIVA' },
    })
    if (corretoras.length === 0) {
      throw new AppError('Nenhuma corretora ativa cadastrada', 400, 'NO_ACTIVE_CORRETORAS')
    }

    const expiraEm = new Date()
    expiraEm.setDate(expiraEm.getDate() + 7)

    const bidRequests = await Promise.all(
      corretoras.map(async (corretora: { id: string; email?: string; nome_fantasia?: string; [key: string]: unknown }) => {
        const tokenPublico = crypto.randomUUID()

        const bidRequest = await (prisma as any).bidRequestCambio.create({
          data: {
            cotacao_id: input.cotacao_id,
            corretora_id: corretora.id,
            token_publico: tokenPublico,
            token_expiracao: expiraEm,
            status: 'ENVIADO',
            enviado_em: new Date(),
          },
        })

        if (corretora.email) {
          emailIntegration.enviar(tenantId, {
            para: corretora.email,
            assunto: `Cotacao aberta de cambio — ${cotacao.moeda} ${cotacao.valor}`,
            corpo_html: `
              <h2>Cotacao aberta de cambio disponivel</h2>
              <p><strong>Moeda:</strong> ${cotacao.moeda}</p>
              <p><strong>Valor:</strong> ${cotacao.valor}</p>
              <p><a href="${process.env.PORTAL_PUBLIC_URL ?? 'http://localhost:5001'}/portal/${tokenPublico}">Responder Cotacao</a></p>
            `,
          })
        }

        return bidRequest
      })
    )

    await (prisma as any).cotacaoCambio.update({
      where: { id: input.cotacao_id },
      data: { status: 'ENVIADA_CORRETORAS' },
    })

    historicoIntegration.registrar(tenantId, userId, {
      acao: 'COTACAO_ABERTA',
      entidade: 'CotacaoCambio',
      entidade_id: input.cotacao_id,
      detalhes: { corretoras_count: corretoras.length },
    })

    res.status(201).json({
      cotacao_id: input.cotacao_id,
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

    const bidRequests = await (prisma as any).bidRequestCambio.findMany({
      where: { cotacao_id: req.params.id },
      include: {
        corretora: { select: { id: true, nome_fantasia: true, email: true, status: true } },
      },
      orderBy: { created_at: 'desc' },
    })

    const cotacao = await (prisma as any).cotacaoCambio.findFirst({
      where: { id: req.params.id },
      select: { id: true, moeda: true, valor: true, status: true },
    })
    if (!cotacao) throw new AppError('Cotacao nao encontrada', 404, 'NOT_FOUND')

    res.json({
      cotacao,
      bid_requests: bidRequests,
      total: bidRequests.length,
      respondidos: bidRequests.filter((b: { status: string }) => b.status === 'RESPONDIDO').length,
      pendentes: bidRequests.filter((b: { status: string }) => b.status === 'ENVIADO').length,
    })
  } catch (err) { next(err) }
})
