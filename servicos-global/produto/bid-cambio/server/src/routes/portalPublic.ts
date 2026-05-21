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
  taxa_oferecida_resposta_cotacao_bid_cambio: z.number().positive('Taxa deve ser positiva'),
  spread_resposta_cotacao_bid_cambio: z.number().min(0, 'Spread deve ser >= 0'),
  validade_minutos_resposta_cotacao_bid_cambio: z.number().int().min(1).max(1440).default(60),
  liquidacao_proposta_resposta_cotacao_bid_cambio: z.enum(['D0', 'D1', 'D2']).default('D2'),
  condicoes_resposta_cotacao_bid_cambio: z.string().optional(),
})

// --- GET /api/v1/bid-cambio/portal-publico/cotacao/:token ---
portalPublicRouter.get('/cotacao/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prisma = basePrisma
    const token = req.params.token

    const bidRequest = await (prisma as any).bidCambioDisparoCotacao.findFirst({
      where: { token_publico_disparo_cotacao_bid_cambio: token },
      include: {
        cotacao: {
          select: {
            id_cotacao_bid_cambio: true,
            moeda_cotacao_bid_cambio: true,
            valor_cotacao_bid_cambio: true,
            tipo_operacao_cotacao_bid_cambio: true,
            modalidade_cotacao_bid_cambio: true,
            liquidacao_cotacao_bid_cambio: true,
            data_expiracao_cotacao_bid_cambio: true,
            status_cotacao_bid_cambio: true,
          },
        },
        corretora: {
          select: { id_corretora_bid_cambio: true, nome_fantasia_corretora_bid_cambio: true },
        },
      },
    })

    if (!bidRequest) {
      throw new AppError('Token invalido ou cotacao nao encontrada', 404, 'INVALID_TOKEN')
    }

    if (new Date() > new Date(bidRequest.token_expiracao_disparo_cotacao_bid_cambio)) {
      throw new AppError('Este link expirou', 410, 'TOKEN_EXPIRED')
    }

    const jaRespondida = bidRequest.status_disparo_cotacao_bid_cambio === 'RESPONDIDO'

    let respostaExistente = null
    if (jaRespondida) {
      respostaExistente = await (prisma as any).bidCambioRespostaCotacao.findFirst({
        where: { id_disparo_cotacao_bid_cambio: bidRequest.id_disparo_cotacao_bid_cambio },
        select: {
          taxa_oferecida_resposta_cotacao_bid_cambio: true,
          spread_resposta_cotacao_bid_cambio: true,
          validade_minutos_resposta_cotacao_bid_cambio: true,
          liquidacao_proposta_resposta_cotacao_bid_cambio: true,
          condicoes_resposta_cotacao_bid_cambio: true,
          status_resposta_cotacao_bid_cambio: true,
          data_criacao_resposta_cotacao_bid_cambio: true,
        },
      })
    }

    res.json({
      cotacao: bidRequest.cotacao,
      corretora: bidRequest.corretora,
      status: bidRequest.status_disparo_cotacao_bid_cambio,
      expira_em: bidRequest.token_expiracao_disparo_cotacao_bid_cambio,
      ja_respondida: jaRespondida,
      resposta: respostaExistente,
      expira_em_iso: bidRequest.token_expiracao_disparo_cotacao_bid_cambio?.toISOString() ?? null,
    })
  } catch (err) { next(err) }
})

// --- POST /api/v1/bid-cambio/portal-publico/responder/:token ---
portalPublicRouter.post('/responder/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = responderPublicoSchema.parse(req.body)
    const prisma = basePrisma
    const token = req.params.token

    const bidRequest = await (prisma as any).bidCambioDisparoCotacao.findFirst({
      where: { token_publico_disparo_cotacao_bid_cambio: token },
      include: { cotacao: true, corretora: true },
    })

    if (!bidRequest) {
      throw new AppError('Token invalido', 404, 'INVALID_TOKEN')
    }

    if (new Date() > new Date(bidRequest.token_expiracao_disparo_cotacao_bid_cambio)) {
      throw new AppError('Este link expirou', 410, 'TOKEN_EXPIRED')
    }

    if (bidRequest.status_disparo_cotacao_bid_cambio === 'RESPONDIDO') {
      throw new AppError('Esta cotacao ja foi respondida', 400, 'ALREADY_RESPONDED')
    }

    const validoAte = new Date()
    validoAte.setMinutes(validoAte.getMinutes() + input.validade_minutos_resposta_cotacao_bid_cambio)

    const cotacaoValor = Number(bidRequest.cotacao?.valor_cotacao_bid_cambio ?? 0)
    const iofPercentual = 0.38 // IOF cambio comercial padrao
    const valorTotalBrl = cotacaoValor * input.taxa_oferecida_resposta_cotacao_bid_cambio
    const iofValor = valorTotalBrl * (iofPercentual / 100)

    const resposta = await (prisma as any).bidCambioRespostaCotacao.create({
      data: {
        id_organizacao: bidRequest.id_organizacao,
        id_cotacao_bid_cambio: bidRequest.id_cotacao_bid_cambio,
        id_disparo_cotacao_bid_cambio: bidRequest.id_disparo_cotacao_bid_cambio,
        id_corretora_bid_cambio: bidRequest.id_corretora_bid_cambio,
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

    // Atualizar bid request
    await (prisma as any).bidCambioDisparoCotacao.update({
      where: { id_disparo_cotacao_bid_cambio: bidRequest.id_disparo_cotacao_bid_cambio },
      data: { status_disparo_cotacao_bid_cambio: 'RESPONDIDO', respondido_em_disparo_cotacao_bid_cambio: new Date() },
    })

    res.status(201).json({
      sucesso: true,
      mensagem: 'Proposta enviada com sucesso',
      resposta: {
        id_resposta_cotacao_bid_cambio: resposta.id_resposta_cotacao_bid_cambio,
        taxa_oferecida_resposta_cotacao_bid_cambio: resposta.taxa_oferecida_resposta_cotacao_bid_cambio,
        spread_resposta_cotacao_bid_cambio: resposta.spread_resposta_cotacao_bid_cambio,
        validade_ate_resposta_cotacao_bid_cambio: resposta.validade_ate_resposta_cotacao_bid_cambio,
      },
    })
  } catch (err) { next(err) }
})
