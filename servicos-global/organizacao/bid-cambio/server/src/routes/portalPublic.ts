/**
 * portalPublic.ts — Portal Publico da Corretora (Token-based, sem auth)
 * Acesso via token_publico gerado no disparo de BID
 * Nao requer x-internal-key nem autenticacao
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { prisma as basePrisma } from '../middleware/tenantIsolation.js'

export const portalPublicRouter = Router()

// --- Schemas Zod ---

const responderPublicoSchema = z.object({
  taxa_oferecida: z.number().positive('Taxa deve ser positiva'),
  spread: z.number().min(0, 'Spread deve ser >= 0'),
  validade_minutos: z.number().int().min(1).max(1440).default(60),
  liquidacao_proposta: z.enum(['D0', 'D1', 'D2']).default('D2'),
  condicoes: z.string().optional(),
})

// --- GET /api/v1/bid-cambio/portal-publico/cotacao/:token ---
portalPublicRouter.get('/cotacao/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = basePrisma
    const token = req.params.token

    const bidRequest = await (prisma as any).bidRequestCambio.findFirst({
      where: { token_publico: token },
      include: {
        cotacao: {
          select: {
            id: true,
            moeda: true,
            valor: true,
            tipo_operacao: true,
            modalidade: true,
            liquidacao: true,
            data_expiracao: true,
            status: true,
          },
        },
        corretora: {
          select: { id: true, nome_fantasia: true },
        },
      },
    })

    if (!bidRequest) {
      throw new AppError('Token invalido ou cotacao nao encontrada', 404, 'INVALID_TOKEN')
    }

    if (new Date() > new Date(bidRequest.token_expiracao)) {
      throw new AppError('Este link expirou', 410, 'TOKEN_EXPIRED')
    }

    const jaRespondida = bidRequest.status === 'RESPONDIDO'

    let respostaExistente = null
    if (jaRespondida) {
      respostaExistente = await (prisma as any).bidResponseCambio.findFirst({
        where: { bid_request_id: bidRequest.id },
        select: {
          taxa_oferecida: true,
          spread: true,
          validade_minutos: true,
          liquidacao_proposta: true,
          condicoes: true,
          status: true,
          created_at: true,
        },
      })
    }

    res.json({
      cotacao: bidRequest.cotacao,
      corretora: bidRequest.corretora,
      status: bidRequest.status,
      expira_em: bidRequest.token_expiracao,
      ja_respondida: jaRespondida,
      resposta: respostaExistente,
      expira_em_iso: bidRequest.token_expiracao?.toISOString() ?? null,
    })
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/portal-publico/responder/:token ---
portalPublicRouter.post('/responder/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = responderPublicoSchema.parse(req.body)
    const prisma = basePrisma
    const token = req.params.token

    const bidRequest = await (prisma as any).bidRequestCambio.findFirst({
      where: { token_publico: token },
      include: { cotacao: true, corretora: true },
    })

    if (!bidRequest) {
      throw new AppError('Token invalido', 404, 'INVALID_TOKEN')
    }

    if (new Date() > new Date(bidRequest.token_expiracao)) {
      throw new AppError('Este link expirou', 410, 'TOKEN_EXPIRED')
    }

    if (bidRequest.status === 'RESPONDIDO') {
      throw new AppError('Esta cotacao ja foi respondida', 400, 'ALREADY_RESPONDED')
    }

    const validoAte = new Date()
    validoAte.setMinutes(validoAte.getMinutes() + input.validade_minutos)

    const cotacaoValor = Number(bidRequest.cotacao?.valor ?? 0)
    const iofPercentual = 0.38 // IOF cambio comercial padrao
    const valorTotalBrl = cotacaoValor * input.taxa_oferecida
    const iofValor = valorTotalBrl * (iofPercentual / 100)

    const resposta = await (prisma as any).bidResponseCambio.create({
      data: {
        tenant_id: bidRequest.tenant_id,
        cotacao_id: bidRequest.cotacao_id,
        bid_request_id: bidRequest.id,
        corretora_id: bidRequest.corretora_id,
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

    // Atualizar bid request
    await (prisma as any).bidRequestCambio.update({
      where: { id: bidRequest.id },
      data: { status: 'RESPONDIDO', respondido_em: new Date() },
    })

    res.status(201).json({
      sucesso: true,
      mensagem: 'Proposta enviada com sucesso',
      resposta: {
        id: resposta.id,
        taxa_oferecida: resposta.taxa_oferecida,
        spread: resposta.spread,
        validade_ate: resposta.validade_ate,
      },
    })
  } catch (err) { next(err) }
})
