/**
 * visao-fornecedor-bid-frete-internacional-publico.ts — Link público (sem login)
 *
 * GET  /:token_resposta_disparo_cotacao_bid_frete_internacional
 * POST /:token_resposta_disparo_cotacao_bid_frete_internacional/responder
 */

import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../middleware/isolamento-tenant.js'
import { AppError } from '../lib/erros.js'
import {
  enviarPropostaDisparoBidFreteInternacional,
} from '../services/enviar-proposta-disparo-bid-frete-internacional.js'
import {
  EnviarPropostaSchema,
  formatarErroValidacaoPropostaEnviarProposta,
} from '../schemas/enviar-proposta-bid-frete-internacional-schema.js'

const router = Router()

async function buscarDisparoPorToken(token: string) {
  const disparo = await prisma.disparoCotacaoBidFreteInternacional.findFirst({
    where: { token_resposta_disparo_cotacao_bid_frete_internacional: token } as any,
    include: {
      cotacao: {
        select: {
          id_cotacao_bid_frete_internacional: true,
          numero_cotacao_bid_frete_internacional: true,
          modal_cotacao_bid_frete_internacional: true,
          modalidade_cotacao_bid_frete_internacional: true,
          origem_nome_cotacao_bid_frete_internacional: true,
          origem_pais_cotacao_bid_frete_internacional: true,
          destino_nome_cotacao_bid_frete_internacional: true,
          destino_pais_cotacao_bid_frete_internacional: true,
          descricao_mercadoria_cotacao_bid_frete_internacional: true,
          ncm_cotacao_bid_frete_internacional: true,
          incoterm_cotacao_bid_frete_internacional: true,
          quantidade_cotacao_bid_frete_internacional: true,
          tipo_container_cotacao_bid_frete_internacional: true,
          peso_kg_cotacao_bid_frete_internacional: true,
          cubagem_m3_cotacao_bid_frete_internacional: true,
          data_limite_resposta_cotacao_bid_frete_internacional: true,
          anonima_cotacao_bid_frete_internacional: true,
        },
      },
      fornecedor: {
        select: {
          id_fornecedor_bid_frete_internacional: true,
          nome_fornecedor_bid_frete_internacional: true,
        },
      },
    },
  } as any)

  if (!disparo) throw new AppError('Link invalido ou expirado', 404, 'TOKEN_INVALID')

  if (
    (disparo as any).data_expiracao_token_disparo_cotacao_bid_frete_internacional &&
    new Date() > new Date((disparo as any).data_expiracao_token_disparo_cotacao_bid_frete_internacional)
  ) {
    throw new AppError('Link expirado', 410, 'TOKEN_EXPIRED')
  }

  if ((disparo as any).status_disparo_cotacao_bid_frete_internacional === 'RESPONDIDO') {
    throw new AppError('Cotacao ja respondida', 400, 'ALREADY_RESPONDED')
  }

  return disparo
}

router.get('/:token_resposta_disparo_cotacao_bid_frete_internacional', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disparo = await buscarDisparoPorToken(req.params.token_resposta_disparo_cotacao_bid_frete_internacional)

    await prisma.disparoCotacaoBidFreteInternacional.update({
      where: { id_disparo_cotacao_bid_frete_internacional: (disparo as any).id_disparo_cotacao_bid_frete_internacional },
      data: {
        status_disparo_cotacao_bid_frete_internacional: 'VISUALIZADO',
        data_visualizacao_disparo_cotacao_bid_frete_internacional: new Date(),
      } as any,
    } as any)

    res.json({
      visao_fornecedor_bid_frete_internacional_publico: {
        disparo_cotacao_bid_frete_internacional: disparo,
      },
    })
  } catch (err) {
    next(err)
  }
})

router.post('/:token_resposta_disparo_cotacao_bid_frete_internacional/responder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = EnviarPropostaSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError(formatarErroValidacaoPropostaEnviarProposta(parsed.error), 400, 'VALIDATION_ERROR')

    const disparo = await buscarDisparoPorToken(req.params.token_resposta_disparo_cotacao_bid_frete_internacional)

    await enviarPropostaDisparoBidFreteInternacional(
      prisma,
      (disparo as any).id_disparo_cotacao_bid_frete_internacional,
      parsed.data,
      { via_email_proposta_bid_frete_internacional: true },
    )

    res.status(201).json({
      visao_fornecedor_bid_frete_internacional_publico: {
        sucesso_envio_proposta_visao_fornecedor_bid_frete_internacional: true,
        mensagem_visao_fornecedor_bid_frete_internacional_publico: 'Proposta enviada com sucesso',
      },
    })
  } catch (err) {
    if (err instanceof Error && 'statusCode' in err) {
      next(new AppError(err.message, (err as Error & { statusCode: number }).statusCode))
      return
    }
    next(err)
  }
})

export { router as visaoFornecedorBidFreteInternacionalPublicoRouter }
