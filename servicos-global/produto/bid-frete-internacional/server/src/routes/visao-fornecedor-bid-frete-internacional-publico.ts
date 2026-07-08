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
  avaliarAcessoDisparoCarregado,
} from '../services/enviar-proposta-disparo-bid-frete-internacional.js'
import {
  EnviarPropostaSchema,
  formatarErroValidacaoPropostaEnviarProposta,
} from '../schemas/enviar-proposta-bid-frete-internacional-schema.js'
import {
  COTACAO_SELECT_RESPOSTA_FORNECEDOR,
  enriquecerDisparoRespostaFornecedor,
} from '../lib/enriquecer-disparo-resposta-fornecedor-bid-frete-internacional.js'
import { carregarUltimoRegistroAlteracaoProposta } from '../lib/serializar-registro-alteracao-proposta-bid-frete-internacional.js'

const router = Router()

const includeDisparoPublico = {
  proposta: {
    include: {
      taxas_origem: true,
      taxas_destino: true,
    },
  },
  cotacao: {
    select: COTACAO_SELECT_RESPOSTA_FORNECEDOR,
  },
  fornecedor: {
    select: {
      id_fornecedor_bid_frete_internacional: true,
      nome_fornecedor_bid_frete_internacional: true,
    },
  },
}

async function carregarDisparoPorToken(token: string) {
  const disparo = await prisma.disparoCotacaoBidFreteInternacional.findFirst({
    where: { token_resposta_disparo_cotacao_bid_frete_internacional: token } as any,
    include: includeDisparoPublico,
  } as any)

  if (!disparo) {
    return { disparo: null, acesso: avaliarAcessoDisparoCarregado(
      { proposta: null, status_disparo_cotacao_bid_frete_internacional: 'PENDENTE', cotacao: null },
      { token_valido: false, token_expirado: false },
    ) }
  }

  const tokenExpirado =
    (disparo as any).data_expiracao_token_disparo_cotacao_bid_frete_internacional != null
    && new Date() > new Date((disparo as any).data_expiracao_token_disparo_cotacao_bid_frete_internacional)

  const acesso = avaliarAcessoDisparoCarregado(disparo as any, { token_valido: true, token_expirado: tokenExpirado })
  return { disparo, acesso }
}

router.get('/:token_resposta_disparo_cotacao_bid_frete_internacional', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { disparo, acesso } = await carregarDisparoPorToken(
      req.params.token_resposta_disparo_cotacao_bid_frete_internacional,
    )

    if (!disparo) {
      throw new AppError('Link invalido ou expirado', 404, 'TOKEN_INVALID')
    }

    const podeVisualizarFormulario =
      acesso.modo_acesso_resposta_disparo_bid_frete_internacional === 'criar'
      || acesso.modo_acesso_resposta_disparo_bid_frete_internacional === 'editar'

    if (podeVisualizarFormulario) {
      const statusAtual = (disparo as any).status_disparo_cotacao_bid_frete_internacional
      if (statusAtual === 'ENVIADO' || statusAtual === 'PENDENTE') {
        await prisma.disparoCotacaoBidFreteInternacional.update({
          where: { id_disparo_cotacao_bid_frete_internacional: (disparo as any).id_disparo_cotacao_bid_frete_internacional },
          data: {
            status_disparo_cotacao_bid_frete_internacional: 'VISUALIZADO',
            data_visualizacao_disparo_cotacao_bid_frete_internacional: new Date(),
          } as any,
        } as any)
      }
    }

    const disparoEnriquecido = await enriquecerDisparoRespostaFornecedor(disparo)
    const propostaRaw = (disparoEnriquecido as Record<string, unknown>).proposta as Record<string, unknown> | undefined
    if (propostaRaw?.id_proposta_bid_frete_internacional) {
      const ultimoRegistro = await carregarUltimoRegistroAlteracaoProposta(
        prisma,
        String(propostaRaw.id_proposta_bid_frete_internacional),
      )
      ;(disparoEnriquecido as Record<string, unknown>).proposta = {
        ...propostaRaw,
        ultimo_registro_alteracao_proposta_bid_frete_internacional: ultimoRegistro,
      }
    }

    res.json({
      visao_fornecedor_bid_frete_internacional_publico: {
        disparo_cotacao_bid_frete_internacional: disparoEnriquecido,
        modo_acesso_resposta_disparo_bid_frete_internacional:
          acesso.modo_acesso_resposta_disparo_bid_frete_internacional,
        codigo_bloqueio_resposta_disparo_bid_frete_internacional:
          acesso.codigo_bloqueio_resposta_disparo_bid_frete_internacional,
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

    const { disparo, acesso } = await carregarDisparoPorToken(
      req.params.token_resposta_disparo_cotacao_bid_frete_internacional,
    )

    if (!disparo) {
      throw new AppError('Link invalido ou expirado', 404, 'TOKEN_INVALID')
    }

    if (acesso.modo_acesso_resposta_disparo_bid_frete_internacional === 'bloqueado') {
      const codigo = acesso.codigo_bloqueio_resposta_disparo_bid_frete_internacional ?? 'ACESSO_NEGADO'
      throw new AppError(
        mensagemBloqueioPublico(codigo),
        403,
        codigo,
      )
    }

    const tokenExpirado =
      (disparo as any).data_expiracao_token_disparo_cotacao_bid_frete_internacional != null
      && new Date() > new Date((disparo as any).data_expiracao_token_disparo_cotacao_bid_frete_internacional)

    const proposta = await enviarPropostaDisparoBidFreteInternacional(
      prisma,
      (disparo as any).id_disparo_cotacao_bid_frete_internacional,
      parsed.data,
      {
        via_email_proposta_bid_frete_internacional: true,
        token_expirado: tokenExpirado,
        tenantId: (disparo as any).id_organizacao,
      },
    )

    const modo = acesso.modo_acesso_resposta_disparo_bid_frete_internacional
    const mensagem =
      modo === 'editar'
        ? 'Proposta atualizada com sucesso'
        : 'Proposta enviada com sucesso'

    res.status(modo === 'editar' ? 200 : 201).json({
      visao_fornecedor_bid_frete_internacional_publico: {
        sucesso_envio_proposta_visao_fornecedor_bid_frete_internacional: true,
        mensagem_visao_fornecedor_bid_frete_internacional_publico: mensagem,
        modo_acesso_resposta_disparo_bid_frete_internacional: modo,
        proposta_bid_frete_internacional: proposta,
      },
    })
  } catch (err) {
    if (err instanceof Error && 'statusCode' in err && 'code' in err) {
      const e = err as Error & { statusCode: number; code: string }
      next(new AppError(e.message, e.statusCode, e.code))
      return
    }
    if (err instanceof Error && 'statusCode' in err) {
      next(new AppError(err.message, (err as Error & { statusCode: number }).statusCode))
      return
    }
    next(err)
  }
})

function mensagemBloqueioPublico(codigo: string): string {
  const map: Record<string, string> = {
    TOKEN_EXPIRED: 'Link expirado',
    COTACAO_APROVADA: 'Cotacao ja aprovada — proposta nao pode ser alterada',
    COTACAO_REPROVADA: 'Cotacao reprovada — proposta nao pode ser alterada',
    COTACAO_CANCELADA: 'Cotacao cancelada',
    COTACAO_EXPIRADA: 'Cotacao expirada',
    PROPOSTA_APROVADA: 'Proposta aprovada — nao pode ser alterada',
    PROPOSTA_REPROVADA: 'Proposta reprovada — nao pode ser alterada',
    PRAZO_RESPOSTA_ENCERRADO: 'Prazo de resposta encerrado',
    EDICAO_PROPOSTA_NAO_PERMITIDA: 'Esta cotacao nao permite alterar a proposta apos o envio',
  }
  return map[codigo] ?? 'Nao e possivel alterar esta proposta'
}

export { router as visaoFornecedorBidFreteInternacionalPublicoRouter }
