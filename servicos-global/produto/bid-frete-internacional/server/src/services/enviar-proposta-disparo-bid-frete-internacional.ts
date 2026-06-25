/**
 * Cria ou atualiza proposta a partir de um disparo (portal autenticado ou link público).
 */
import type { PrismaClient } from '@prisma/client'
import {
  avaliarAcessoRespostaDisparoBidFreteInternacional,
  exigePropostaExistenteParaSalvar,
  type ResultadoAcessoRespostaDisparoBidFreteInternacional,
} from '../lib/acesso-resposta-disparo-bid-frete-internacional.js'
import { validarPropostaEnvioModalidadeCotacaoBidFreteInternacional } from '../lib/validar-proposta-envio-modalidade-cotacao-bid-frete-internacional.js'
import { snapshotPropostaFromCotacao } from '../lib/snapshot-proposta-bid-frete.js'
import { persistirTaxasProposta, type TaxaInputProposta } from '../lib/persistir-taxas-proposta.js'
import { sincronizarStatusCotacaoAposRespostaFornecedorBidFreteInternacional } from '../lib/sincronizar-status-cotacao-apos-resposta-fornecedor-bid-frete-internacional.js'
import { notificacoesIntegration, historicoIntegration, atividadesIntegration } from './integracoes-tenant.js'

export interface DadosPropostaDisparo {
  moeda_proposta_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
  dias_free_time_proposta_bid_frete_internacional?: number | null
  dias_prazo_pagamento_proposta_bid_frete_internacional: number
  transbordos_proposta_bid_frete_internacional: number
  escalas_proposta_bid_frete_internacional?: string
  observacoes_proposta_bid_frete_internacional?: string
  periodos_armazenagem_proposta_bid_frete_internacional?: Array<{
    ordem_periodo_armazenagem_proposta_bid_frete_internacional: number
    dias_periodo_armazenagem_proposta_bid_frete_internacional: number
    tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: 'REAIS' | 'PERCENTUAL_MERCADORIA'
    valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: number
    minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional: number
  }> | null
  validade_proposta_bid_frete_internacional: string
  taxas?: Array<{
    tipo_taxa_bid_frete_internacional: 'origem' | 'destino' | 'frete'
    nome_taxa_bid_frete_internacional: string
    valor_taxa_bid_frete_internacional: number
    moeda_taxa_bid_frete_internacional: string
    id_taxa_origem_destino?: string | null
  }>
}

export interface OpcoesEnvioProposta {
  id_usuario?: string | null
  via_portal_proposta_bid_frete_internacional?: boolean
  via_email_proposta_bid_frete_internacional?: boolean
  tenantId?: string
  /** Quando informado (link público), valida expiração do token. */
  token_expirado?: boolean
}

export function avaliarAcessoDisparoCarregado(disparo: {
  proposta?: { status_proposta_bid_frete_internacional?: string } | null
  status_disparo_cotacao_bid_frete_internacional?: string
  cotacao?: { status_cotacao_bid_frete_internacional?: string; data_limite_resposta_cotacao_bid_frete_internacional?: Date | string | null } | null
  data_expiracao_token_disparo_cotacao_bid_frete_internacional?: Date | string | null
}, opcoes: { token_valido?: boolean; token_expirado?: boolean } = {}): ResultadoAcessoRespostaDisparoBidFreteInternacional {
  const tokenExpirado =
    opcoes.token_expirado
    ?? (
      disparo.data_expiracao_token_disparo_cotacao_bid_frete_internacional != null
      && new Date() > new Date(disparo.data_expiracao_token_disparo_cotacao_bid_frete_internacional)
    )

  return avaliarAcessoRespostaDisparoBidFreteInternacional({
    token_valido: opcoes.token_valido ?? true,
    token_expirado: tokenExpirado,
    status_cotacao_bid_frete_internacional: disparo.cotacao?.status_cotacao_bid_frete_internacional,
    status_proposta_bid_frete_internacional: disparo.proposta?.status_proposta_bid_frete_internacional,
    possui_proposta: disparo.proposta != null,
    disparo_respondido: disparo.status_disparo_cotacao_bid_frete_internacional === 'RESPONDIDO',
    data_limite_resposta_cotacao_bid_frete_internacional:
      disparo.cotacao?.data_limite_resposta_cotacao_bid_frete_internacional,
  })
}

function erroAcesso(codigo: string, message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode, code: codigo })
}

export async function enviarPropostaDisparoBidFreteInternacional(
  prisma: PrismaClient,
  id_disparo_cotacao_bid_frete_internacional: string,
  dados: DadosPropostaDisparo,
  opcoes: OpcoesEnvioProposta = {},
) {
  const disparo = await (prisma as any).disparoCotacaoBidFreteInternacional.findFirst({
    where: { id_disparo_cotacao_bid_frete_internacional },
    include: {
      proposta: true,
      cotacao: {
        select: {
          id_cotacao_bid_frete_internacional: true,
          id_workspace: true,
          id_bid_bid_frete_internacional: true,
          id_usuario: true,
          numero_cotacao_bid_frete_internacional: true,
          status_cotacao_bid_frete_internacional: true,
          data_limite_resposta_cotacao_bid_frete_internacional: true,
          modalidade_cotacao_bid_frete_internacional: true,
          incluir_armazenagem_cotacao_bid_frete_internacional: true,
        },
      },
    },
  })

  if (!disparo) {
    throw Object.assign(new Error('Disparo de cotacao nao encontrado'), { statusCode: 404, code: 'NOT_FOUND' })
  }

  const acesso = avaliarAcessoDisparoCarregado(disparo, { token_expirado: opcoes.token_expirado })
  if (acesso.modo_acesso_resposta_disparo_bid_frete_internacional === 'bloqueado') {
    const codigo = acesso.codigo_bloqueio_resposta_disparo_bid_frete_internacional ?? 'ACESSO_NEGADO'
    throw erroAcesso(codigo, mensagemErroCodigoBloqueio(codigo), 403)
  }

  const erroModalidade = validarPropostaEnvioModalidadeCotacaoBidFreteInternacional(
    dados,
    disparo.cotacao as {
      modalidade_cotacao_bid_frete_internacional?: string | null
      incluir_armazenagem_cotacao_bid_frete_internacional?: boolean | null
    } | null,
  )
  if (erroModalidade) {
    throw erroAcesso('VALIDATION_ERROR', erroModalidade, 400)
  }

  const modo = acesso.modo_acesso_resposta_disparo_bid_frete_internacional
  const propostaExistente = disparo.proposta as { id_proposta_bid_frete_internacional: string } | null

  if (exigePropostaExistenteParaSalvar(modo) && !propostaExistente) {
    throw erroAcesso('PROPOSTA_NAO_ENCONTRADA', 'Proposta nao encontrada para atualizacao', 404)
  }

  const { taxas, ...responseData } = dados
  const valorTotal =
    responseData.valor_frete_proposta_bid_frete_internacional +
    responseData.taxas_origem_proposta_bid_frete_internacional +
    responseData.taxas_destino_proposta_bid_frete_internacional

  const dadosProposta = {
    ...responseData,
    valor_total_proposta_bid_frete_internacional: valorTotal,
    validade_proposta_bid_frete_internacional: new Date(responseData.validade_proposta_bid_frete_internacional),
  }

  let proposta: { id_proposta_bid_frete_internacional: string }

  if (modo === 'editar' && propostaExistente) {
    proposta = await (prisma as any).propostaBidFreteInternacional.update({
      where: { id_proposta_bid_frete_internacional: propostaExistente.id_proposta_bid_frete_internacional },
      data: dadosProposta,
    })

    if (taxas !== undefined) {
      await (prisma as any).taxaOrigemBidFreteInternacional.deleteMany({
        where: { id_proposta_bid_frete_internacional: propostaExistente.id_proposta_bid_frete_internacional },
      })
      await (prisma as any).taxaDestinoBidFreteInternacional.deleteMany({
        where: { id_proposta_bid_frete_internacional: propostaExistente.id_proposta_bid_frete_internacional },
      })
      if (taxas.length > 0) {
        await persistirTaxasProposta(prisma, {
          id_organizacao: disparo.id_organizacao,
          id_proposta_bid_frete_internacional: propostaExistente.id_proposta_bid_frete_internacional,
          taxas: taxas as TaxaInputProposta[],
        })
      }
    }

    await (prisma as any).disparoCotacaoBidFreteInternacional.update({
      where: { id_disparo_cotacao_bid_frete_internacional: disparo.id_disparo_cotacao_bid_frete_internacional },
      data: {
        status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
        data_resposta_disparo_cotacao_bid_frete_internacional: new Date(),
      },
    })

    await posRespostaFornecedorSincronizarCotacao(prisma, disparo, valorTotal, opcoes)

    return proposta
  }

  const cotacaoOrigem = disparo.cotacao

  proposta = await (prisma as any).propostaBidFreteInternacional.create({
    data: {
      id_organizacao: disparo.id_organizacao,
      id_produto_gravity: 'bid-frete-internacional',
      ...(cotacaoOrigem ? snapshotPropostaFromCotacao(cotacaoOrigem) : {}),
      id_usuario: opcoes.id_usuario ?? null,
      id_disparo_cotacao_bid_frete_internacional: disparo.id_disparo_cotacao_bid_frete_internacional,
      id_cotacao_bid_frete_internacional: disparo.id_cotacao_bid_frete_internacional,
      id_fornecedor_bid_frete_internacional: disparo.id_fornecedor_bid_frete_internacional,
      ...dadosProposta,
      via_portal_proposta_bid_frete_internacional: opcoes.via_portal_proposta_bid_frete_internacional ?? false,
      via_email_proposta_bid_frete_internacional: opcoes.via_email_proposta_bid_frete_internacional ?? false,
    },
  })

  if (taxas?.length) {
    await persistirTaxasProposta(prisma, {
      id_organizacao: disparo.id_organizacao,
      id_proposta_bid_frete_internacional: proposta.id_proposta_bid_frete_internacional,
      taxas: taxas as TaxaInputProposta[],
    })
  }

  await (prisma as any).disparoCotacaoBidFreteInternacional.update({
    where: { id_disparo_cotacao_bid_frete_internacional: disparo.id_disparo_cotacao_bid_frete_internacional },
    data: {
      status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
      data_resposta_disparo_cotacao_bid_frete_internacional: new Date(),
    },
  })

  await posRespostaFornecedorSincronizarCotacao(prisma, disparo, valorTotal, opcoes)

  return proposta
}

async function posRespostaFornecedorSincronizarCotacao(
  prisma: PrismaClient,
  disparo: {
    id_cotacao_bid_frete_internacional: string
    id_fornecedor_bid_frete_internacional: string
    cotacao?: {
      id_cotacao_bid_frete_internacional: string
      id_usuario: string
      numero_cotacao_bid_frete_internacional: string
      status_cotacao_bid_frete_internacional?: string | null
    } | null
  },
  valorTotal: number,
  opcoes: OpcoesEnvioProposta,
): Promise<void> {
  const cotacao = disparo.cotacao
  if (!cotacao) return

  const proximoStatus = await sincronizarStatusCotacaoAposRespostaFornecedorBidFreteInternacional(
    prisma,
    disparo.id_cotacao_bid_frete_internacional,
    cotacao.status_cotacao_bid_frete_internacional,
  )

  if (proximoStatus === 'AGUARDANDO_APROVACAO' && opcoes.tenantId) {
    const totalRespondidos = await (prisma as any).disparoCotacaoBidFreteInternacional.count({
      where: {
        id_cotacao_bid_frete_internacional: disparo.id_cotacao_bid_frete_internacional,
        status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
      },
    })
    atividadesIntegration.aguardandoAprovacao(opcoes.tenantId, cotacao.id_usuario, {
      numero_cotacao_bid_frete_internacional: cotacao.numero_cotacao_bid_frete_internacional,
      total_respostas: totalRespondidos,
    })
    notificacoesIntegration.aguardandoAprovacao(opcoes.tenantId, cotacao.id_usuario, {
      cotacao_numero: cotacao.numero_cotacao_bid_frete_internacional,
      total_respostas: totalRespondidos,
      id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
    })
  }

  if (opcoes.tenantId) {
    const fornecedor = await (prisma as any).fornecedorBidFreteInternacional.findFirst({
      where: { id_fornecedor_bid_frete_internacional: disparo.id_fornecedor_bid_frete_internacional },
      select: { nome_fornecedor_bid_frete_internacional: true },
    })
    notificacoesIntegration.fornecedorRespondeu(opcoes.tenantId, cotacao.id_usuario, {
      cotacao_numero: cotacao.numero_cotacao_bid_frete_internacional,
      fornecedor_nome: fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'Fornecedor',
      id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
    })
    historicoIntegration.fornecedorRespondeu(
      opcoes.tenantId,
      fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'Fornecedor',
      {
        id: cotacao.id_cotacao_bid_frete_internacional,
        numero_cotacao_bid_frete_internacional: cotacao.numero_cotacao_bid_frete_internacional,
      },
      valorTotal,
    )
  }
}

function mensagemErroCodigoBloqueio(codigo: string): string {
  const mensagens: Record<string, string> = {
    TOKEN_INVALID: 'Link invalido ou expirado',
    TOKEN_EXPIRED: 'Link expirado',
    COTACAO_APROVADA: 'Cotacao ja aprovada — proposta nao pode ser alterada',
    COTACAO_REPROVADA: 'Cotacao reprovada — proposta nao pode ser alterada',
    COTACAO_CANCELADA: 'Cotacao cancelada — proposta nao pode ser alterada',
    COTACAO_EXPIRADA: 'Cotacao expirada — proposta nao pode ser alterada',
    PROPOSTA_APROVADA: 'Proposta aprovada — nao pode ser alterada',
    PROPOSTA_REPROVADA: 'Proposta reprovada — nao pode ser alterada',
    PRAZO_RESPOSTA_ENCERRADO: 'Prazo de resposta encerrado',
  }
  return mensagens[codigo] ?? 'Acesso negado para alterar proposta'
}
