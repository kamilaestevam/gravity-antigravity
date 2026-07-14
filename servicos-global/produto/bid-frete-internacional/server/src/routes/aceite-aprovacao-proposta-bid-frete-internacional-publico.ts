/**

 * aceite-aprovacao-proposta-bid-frete-internacional-publico.ts — Aceite do ganhador (sem login)

 *

 * GET  /:token_aceite_aprovacao_proposta_bid_frete_internacional

 * POST /:token_aceite_aprovacao_proposta_bid_frete_internacional/confirmar

 */



import { Router, Request, Response, NextFunction } from 'express'

import { z } from 'zod'

import { prisma } from '../middleware/isolamento-tenant.js'

import { AppError } from '../lib/erros.js'

import { DIAS_VALIDADE_TOKEN_ACEITE_APROVACAO_BID_FRETE_INTERNACIONAL } from '../../../shared/aceite-aprovacao-proposta-bid-frete-internacional.js'

import { processarPosAceiteAprovacaoBidFreteInternacional } from '../services/processar-pos-aceite-aprovacao-bid-frete-internacional.js'

import { lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional } from '../lib/snapshot-empresa-pagadora-taxa-fechamento-cotacao-bid-frete-internacional.js'

import { empresaPagadoraTaxaFechamentoPlataformaGravitySchema } from '../../../shared/empresa-pagadora-taxa-fechamento-plataforma-bid-frete-internacional.js'

import {

  montarContextoIdentificacaoFornecedorContratoBidFreteInternacional,

  extrairIpRequisicaoBidFreteInternacional,

  extrairUserAgentRequisicaoBidFreteInternacional,

} from '../lib/contexto-identificacao-contrato-bid-frete-internacional.js'

import {

  calcularHashDocumentoContratoFechamentoPlataformaBidFreteInternacional,

} from '../lib/hash-contrato-plataforma-bid-frete-internacional.js'

import {

  resolverDocumentoContratoFechamentoPlataformaBidFreteInternacional,

  VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,

} from '../../../shared/contrato-fechamento-plataforma-bid-frete-internacional.js'

import {

  montarRegistroAceiteFromContexto,

  montarSnapshotPropostaFechadaBidFreteInternacional,

} from '../lib/registrar-aceite-contrato-plataforma-bid-frete-internacional.js'

import { carregarUltimoRegistroAlteracaoProposta } from '../lib/serializar-registro-alteracao-proposta-bid-frete-internacional.js'



const router = Router()



const confirmarAceiteBodySchema = z.object({

  aceite_contrato_li_e_aceito: z.literal(true),

  hash_contrato_fechamento_plataforma_bid_frete_internacional: z.string().length(64),

})



const propostaAceiteResponseSchema = z.object({

  proposta: z.object({

    id_proposta_bid_frete_internacional: z.string(),

    status_proposta_bid_frete_internacional: z.string(),

    nome_fornecedor_bid_frete_internacional: z.string(),

    numero_cotacao_bid_frete_internacional: z.string(),

    valor_total_proposta_bid_frete_internacional: z.number(),

    moeda_proposta_bid_frete_internacional: z.string(),

    data_aceite_aprovacao_proposta_bid_frete_internacional: z.string().nullable(),

  }),

  pode_confirmar: z.boolean(),

  token_expirado: z.boolean(),

  ja_confirmado: z.boolean(),

  empresa_pagadora_taxa_fechamento_plataforma_gravity: empresaPagadoraTaxaFechamentoPlataformaGravitySchema,

  hash_contrato_fechamento_plataforma_bid_frete_internacional: z.string(),

  versao_contrato_fechamento_plataforma_bid_frete_internacional: z.string(),

})



const confirmarAceiteResponseSchema = z.object({

  status_proposta_bid_frete_internacional: z.literal('APROVACAO_RECEBIDA'),

  data_aceite_aprovacao_proposta_bid_frete_internacional: z.string(),

})



function calcularExpiracaoAceite(dataAprovacao: Date | null | undefined): Date | null {

  if (!dataAprovacao) return null

  const exp = new Date(dataAprovacao)

  exp.setDate(exp.getDate() + DIAS_VALIDADE_TOKEN_ACEITE_APROVACAO_BID_FRETE_INTERNACIONAL)

  return exp

}



async function carregarPropostaPorToken(token: string) {

  return (prisma as any).propostaBidFreteInternacional.findFirst({

    where: { token_aceite_aprovacao_proposta_bid_frete_internacional: token },

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

          data_aprovacao_cotacao_bid_frete_internacional: true,

          status_cotacao_bid_frete_internacional: true,

        },

      },

      disparo_cotacao: {

        select: {

          token_resposta_disparo_cotacao_bid_frete_internacional: true,

        },

      },

    },

  })

}



function montarContextoAceite(proposta: Record<string, any>, tokenAceite: string) {

  return montarContextoIdentificacaoFornecedorContratoBidFreteInternacional({

    fornecedor: proposta.fornecedor,

    cotacao: proposta.cotacao,

    token_disparo: proposta.disparo_cotacao?.token_resposta_disparo_cotacao_bid_frete_internacional,

    token_aceite: tokenAceite,

  })

}



function montarPayloadAceite(proposta: Record<string, any>, tokenAceite: string, opts: {

  pode_confirmar: boolean

  token_expirado: boolean

  ja_confirmado: boolean

}) {

  const idCotacao = String(proposta.id_cotacao_bid_frete_internacional ?? '')

  const pagador = lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(idCotacao)

  const contexto = montarContextoAceite(proposta, tokenAceite)

  const hash = calcularHashDocumentoContratoFechamentoPlataformaBidFreteInternacional(pagador, contexto)



  return {

    proposta: {

      id_proposta_bid_frete_internacional: proposta.id_proposta_bid_frete_internacional,

      status_proposta_bid_frete_internacional: proposta.status_proposta_bid_frete_internacional,

      nome_fornecedor_bid_frete_internacional:

        proposta.fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'Fornecedor',

      numero_cotacao_bid_frete_internacional:

        proposta.cotacao?.numero_cotacao_bid_frete_internacional ?? '',

      valor_total_proposta_bid_frete_internacional: Number(

        proposta.valor_total_proposta_bid_frete_internacional ?? 0,

      ),

      moeda_proposta_bid_frete_internacional: String(proposta.moeda_proposta_bid_frete_internacional ?? 'USD'),

      data_aceite_aprovacao_proposta_bid_frete_internacional:

        proposta.data_aceite_aprovacao_proposta_bid_frete_internacional

          ? new Date(proposta.data_aceite_aprovacao_proposta_bid_frete_internacional).toISOString()

          : null,

    },

    empresa_pagadora_taxa_fechamento_plataforma_gravity: pagador,

    hash_contrato_fechamento_plataforma_bid_frete_internacional: hash,

    versao_contrato_fechamento_plataforma_bid_frete_internacional:

      VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,

    ...opts,

  }

}



router.get('/:token_aceite_aprovacao_proposta_bid_frete_internacional', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const token = req.params.token_aceite_aprovacao_proposta_bid_frete_internacional

    const proposta = await carregarPropostaPorToken(token)

    if (!proposta) {

      throw new AppError('Link inválido ou expirado', 404, 'TOKEN_INVALID')

    }



    const dataAprovacao = proposta.cotacao?.data_aprovacao_cotacao_bid_frete_internacional

      ? new Date(proposta.cotacao.data_aprovacao_cotacao_bid_frete_internacional)

      : null

    const expiracao = calcularExpiracaoAceite(dataAprovacao)

    const tokenExpirado = expiracao != null && new Date() > expiracao

    const jaConfirmado = proposta.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA'

    const statusValido =

      proposta.status_proposta_bid_frete_internacional === 'APROVADA'

      || jaConfirmado

    const cotacaoAprovada = proposta.cotacao?.status_cotacao_bid_frete_internacional === 'APROVADA'

    const podeConfirmar = statusValido && cotacaoAprovada && !tokenExpirado && !jaConfirmado



    const payload = montarPayloadAceite(proposta, token, {

      pode_confirmar: podeConfirmar,

      token_expirado: tokenExpirado,

      ja_confirmado: jaConfirmado,

    })

    propostaAceiteResponseSchema.parse(payload)

    res.json(payload)

  } catch (err) {

    next(err)

  }

})



router.post('/:token_aceite_aprovacao_proposta_bid_frete_internacional/confirmar', async (req: Request, res: Response, next: NextFunction) => {

  try {

    const token = req.params.token_aceite_aprovacao_proposta_bid_frete_internacional

    const bodyParsed = confirmarAceiteBodySchema.safeParse(req.body ?? {})

    if (!bodyParsed.success) {

      throw new AppError('Aceite do contrato é obrigatório', 400, 'ACEITE_CONTRATO_OBRIGATORIO')

    }



    const proposta = await carregarPropostaPorToken(token)

    if (!proposta) {

      throw new AppError('Link inválido ou expirado', 404, 'TOKEN_INVALID')

    }



    if (proposta.status_proposta_bid_frete_internacional === 'APROVACAO_RECEBIDA') {

      const payload = {

        status_proposta_bid_frete_internacional: 'APROVACAO_RECEBIDA' as const,

        data_aceite_aprovacao_proposta_bid_frete_internacional: new Date(

          proposta.data_aceite_aprovacao_proposta_bid_frete_internacional ?? Date.now(),

        ).toISOString(),

      }

      confirmarAceiteResponseSchema.parse(payload)

      return res.json(payload)

    }



    if (proposta.status_proposta_bid_frete_internacional !== 'APROVADA') {

      throw new AppError('Proposta não está aguardando aceite', 409, 'ACEITE_INDISPONIVEL')

    }



    if (proposta.cotacao?.status_cotacao_bid_frete_internacional !== 'APROVADA') {

      throw new AppError('Cotação não está aprovada', 409, 'COTACAO_NAO_APROVADA')

    }



    const expiracao = calcularExpiracaoAceite(

      proposta.cotacao?.data_aprovacao_cotacao_bid_frete_internacional

        ? new Date(proposta.cotacao.data_aprovacao_cotacao_bid_frete_internacional)

        : null,

    )

    if (expiracao != null && new Date() > expiracao) {

      throw new AppError('Link expirado', 410, 'TOKEN_EXPIRADO')

    }



    const idCotacao = String(proposta.id_cotacao_bid_frete_internacional ?? '')

    const pagador = lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(idCotacao)

    const contexto = montarContextoAceite(proposta, token)

    const hashEsperado = calcularHashDocumentoContratoFechamentoPlataformaBidFreteInternacional(pagador, contexto)

    if (bodyParsed.data.hash_contrato_fechamento_plataforma_bid_frete_internacional !== hashEsperado) {

      throw new AppError('Versão do contrato desatualizada — recarregue a página', 409, 'HASH_CONTRATO_INVALIDO')

    }



    const agora = new Date()

    await (prisma as any).propostaBidFreteInternacional.update({

      where: { id_proposta_bid_frete_internacional: proposta.id_proposta_bid_frete_internacional },

      data: {

        status_proposta_bid_frete_internacional: 'APROVACAO_RECEBIDA',

        data_aceite_aprovacao_proposta_bid_frete_internacional: agora,

      },

    })



    const ultimoRegistro = await carregarUltimoRegistroAlteracaoProposta(

      prisma,

      String(proposta.id_proposta_bid_frete_internacional),

    )

    const documento = resolverDocumentoContratoFechamentoPlataformaBidFreteInternacional(pagador, contexto)



    montarRegistroAceiteFromContexto({

      tipo_evento: 'ACEITE_FECHAMENTO',

      tipo_contrato: 'FECHAMENTO',

      data_hora_aceite_utc: agora,

      contexto,

      endereco_ip: extrairIpRequisicaoBidFreteInternacional(req),

      user_agent: extrairUserAgentRequisicaoBidFreteInternacional(req),

      versao_contrato: VERSAO_CONTRATO_FECHAMENTO_PLATAFORMA_BID_FRETE_INTERNACIONAL,

      hash_contrato: hashEsperado,

      slug_pagador: documento.slug,

      empresa_pagadora: pagador,

      id_proposta_bid_frete_internacional: String(proposta.id_proposta_bid_frete_internacional),

      id_cotacao_bid_frete_internacional: idCotacao,

      snapshot_proposta: montarSnapshotPropostaFechadaBidFreteInternacional(proposta, ultimoRegistro),

    })



    void processarPosAceiteAprovacaoBidFreteInternacional({

      prisma,

      id_proposta_bid_frete_internacional: proposta.id_proposta_bid_frete_internacional,

      data_aceite: agora,

    }).catch((err: unknown) => {

      console.warn(

        '[Aceite] Falha pós-aceite (notificação/e-mail):',

        err instanceof Error ? err.message : err,

      )

    })



    const payload = {

      status_proposta_bid_frete_internacional: 'APROVACAO_RECEBIDA' as const,

      data_aceite_aprovacao_proposta_bid_frete_internacional: agora.toISOString(),

    }

    confirmarAceiteResponseSchema.parse(payload)

    res.json(payload)

  } catch (err) {

    next(err)

  }

})



export { router as aceiteAprovacaoPropostaBidFreteInternacionalPublicoRouter }


