/**
 * Contexto público para contratos da Plataforma (identificação eletrônica do fornecedor).
 *
 * GET /contexto?tipo=fechamento|proposta&slug=...&token_disparo=...&token_aceite=...
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../middleware/isolamento-tenant.js'
import { AppError } from '../lib/erros.js'
import {
  montarContextoIdentificacaoFornecedorContratoBidFreteInternacional,
} from '../lib/contexto-identificacao-contrato-bid-frete-internacional.js'
import { lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional } from '../lib/snapshot-empresa-pagadora-taxa-fechamento-cotacao-bid-frete-internacional.js'
import {
  calcularHashDocumentoContratoFechamentoPlataformaBidFreteInternacional,
  calcularHashDocumentoContratoPropostaPlataformaBidFreteInternacional,
} from '../lib/hash-contrato-plataforma-bid-frete-internacional.js'
import {
  resolverDocumentoContratoFechamentoPorSlug,
  VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
  DATA_VIGENCIA_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
} from '../../../shared/contrato-fechamento-plataforma-bid-frete-internacional.js'
import {
  resolverDocumentoContratoPropostaPorSlug,
  VERSAO_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL,
  DATA_VIGENCIA_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL,
} from '../../../shared/contrato-proposta-plataforma-bid-frete-internacional.js'

const router = Router()

const querySchema = z.object({
  tipo: z.enum(['fechamento', 'proposta']),
  slug: z.enum(['pagamento-fornecedor', 'pagamento-contratante-gravity']),
  token_disparo: z.string().trim().min(1).optional(),
  token_aceite: z.string().trim().min(1).optional(),
})

async function resolverDadosPorToken(params: {
  token_disparo?: string
  token_aceite?: string
}) {
  if (params.token_aceite) {
    const proposta = await (prisma as any).propostaBidFreteInternacional.findFirst({
      where: { token_aceite_aprovacao_proposta_bid_frete_internacional: params.token_aceite },
      include: {
        fornecedor: {
          select: {
            nome_fornecedor_bid_frete_internacional: true,
            email_fornecedor_bid_frete_internacional: true,
            cnpj_fornecedor_bid_frete_internacional: true,
          },
        },
        cotacao: {
          select: {
            id_cotacao_bid_frete_internacional: true,
            numero_cotacao_bid_frete_internacional: true,
          },
        },
        disparo_cotacao: {
          select: {
            token_resposta_disparo_cotacao_bid_frete_internacional: true,
          },
        },
      },
    })
    if (!proposta) return null
    return {
      fornecedor: proposta.fornecedor,
      cotacao: proposta.cotacao,
      id_cotacao: proposta.id_cotacao_bid_frete_internacional as string,
      token_disparo: proposta.disparo_cotacao?.token_resposta_disparo_cotacao_bid_frete_internacional ?? null,
      token_aceite: params.token_aceite,
    }
  }

  if (params.token_disparo) {
    const disparo = await prisma.disparoCotacaoBidFreteInternacional.findFirst({
      where: { token_resposta_disparo_cotacao_bid_frete_internacional: params.token_disparo } as any,
      include: {
        fornecedor: {
          select: {
            nome_fornecedor_bid_frete_internacional: true,
            email_fornecedor_bid_frete_internacional: true,
            cnpj_fornecedor_bid_frete_internacional: true,
          },
        },
        cotacao: {
          select: {
            id_cotacao_bid_frete_internacional: true,
            numero_cotacao_bid_frete_internacional: true,
          },
        },
      },
    } as any)
    if (!disparo) return null
    return {
      fornecedor: (disparo as any).fornecedor,
      cotacao: (disparo as any).cotacao,
      id_cotacao: (disparo as any).id_cotacao_bid_frete_internacional as string,
      token_disparo: params.token_disparo,
      token_aceite: null,
    }
  }

  return null
}

router.get('/contexto', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = querySchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const { tipo, slug, token_disparo, token_aceite } = parsed.data
    const dados = await resolverDadosPorToken({ token_disparo, token_aceite })

    const contexto = dados
      ? montarContextoIdentificacaoFornecedorContratoBidFreteInternacional({
          fornecedor: dados.fornecedor,
          cotacao: dados.cotacao,
          token_disparo: dados.token_disparo,
          token_aceite: dados.token_aceite,
        })
      : null

    const pagador = lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(dados?.id_cotacao)

    if (tipo === 'fechamento') {
      const documento = resolverDocumentoContratoFechamentoPorSlug(slug, contexto)
      if (!documento) {
        throw new AppError('Contrato não encontrado', 404, 'CONTRATO_NAO_ENCONTRADO')
      }
      return res.json({
        contexto,
        documento,
        versao: VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
        data_vigencia: DATA_VIGENCIA_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,
        hash_contrato: calcularHashDocumentoContratoFechamentoPlataformaBidFreteInternacional(pagador, contexto),
        empresa_pagadora_taxa_fechamento_plataforma_gravity: pagador,
      })
    }

    const documento = resolverDocumentoContratoPropostaPorSlug(slug, contexto)
    if (!documento) {
      throw new AppError('Contrato não encontrado', 404, 'CONTRATO_NAO_ENCONTRADO')
    }
    return res.json({
      contexto,
      documento,
      versao: VERSAO_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL,
      data_vigencia: DATA_VIGENCIA_CONTRATO_PROPOSTA_PLATAFORMA_BID_FRETE_INTERNACIONAL,
      hash_contrato: calcularHashDocumentoContratoPropostaPlataformaBidFreteInternacional(pagador, contexto),
      empresa_pagadora_taxa_fechamento_plataforma_gravity: pagador,
    })
  } catch (err) {
    next(err)
  }
})

export { router as contratoPlataformaBidFreteInternacionalPublicoRouter }
