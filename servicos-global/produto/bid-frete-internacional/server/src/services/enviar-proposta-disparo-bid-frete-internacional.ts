/**
 * Cria proposta a partir de um disparo (portal autenticado ou link público).
 */
import type { PrismaClient } from '@prisma/client'
import { snapshotPropostaFromCotacao } from '../lib/snapshot-proposta-bid-frete.js'
import { notificacoesIntegration, historicoIntegration, atividadesIntegration } from './integracoes-tenant.js'

export interface DadosPropostaDisparo {
  moeda_proposta_bid_frete_internacional: string
  valor_frete_proposta_bid_frete_internacional: number
  taxas_origem_proposta_bid_frete_internacional: number
  taxas_destino_proposta_bid_frete_internacional: number
  dias_transito_proposta_bid_frete_internacional: number
  dias_free_time_proposta_bid_frete_internacional?: number
  transbordos_proposta_bid_frete_internacional: number
  escalas_proposta_bid_frete_internacional?: string
  observacoes_proposta_bid_frete_internacional?: string
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
}

export async function enviarPropostaDisparoBidFreteInternacional(
  prisma: PrismaClient,
  id_disparo_cotacao_bid_frete_internacional: string,
  dados: DadosPropostaDisparo,
  opcoes: OpcoesEnvioProposta = {},
) {
  const disparo = await (prisma as any).disparoCotacaoBidFreteInternacional.findFirst({
    where: { id_disparo_cotacao_bid_frete_internacional },
  })

  if (!disparo) {
    throw Object.assign(new Error('Disparo de cotacao nao encontrado'), { statusCode: 404 })
  }
  if (disparo.status_disparo_cotacao_bid_frete_internacional === 'RESPONDIDO') {
    throw Object.assign(new Error('Cotacao ja respondida'), { statusCode: 400 })
  }

  const { taxas, ...responseData } = dados
  const valorTotal =
    responseData.valor_frete_proposta_bid_frete_internacional +
    responseData.taxas_origem_proposta_bid_frete_internacional +
    responseData.taxas_destino_proposta_bid_frete_internacional

  const cotacaoOrigem = await (prisma as any).cotacaoBidFreteInternacional.findFirst({
    where: { id_cotacao_bid_frete_internacional: disparo.id_cotacao_bid_frete_internacional },
    select: { id_workspace: true, id_bid_bid_frete_internacional: true },
  })

  const proposta = await (prisma as any).propostaBidFreteInternacional.create({
    data: {
      id_organizacao: disparo.id_organizacao,
      id_produto_gravity: 'bid-frete-internacional',
      ...(cotacaoOrigem ? snapshotPropostaFromCotacao(cotacaoOrigem) : {}),
      id_usuario: opcoes.id_usuario ?? null,
      id_disparo_cotacao_bid_frete_internacional: disparo.id_disparo_cotacao_bid_frete_internacional,
      id_cotacao_bid_frete_internacional: disparo.id_cotacao_bid_frete_internacional,
      id_fornecedor_bid_frete_internacional: disparo.id_fornecedor_bid_frete_internacional,
      ...responseData,
      valor_total_proposta_bid_frete_internacional: valorTotal,
      validade_proposta_bid_frete_internacional: new Date(responseData.validade_proposta_bid_frete_internacional),
      via_portal_proposta_bid_frete_internacional: opcoes.via_portal_proposta_bid_frete_internacional ?? false,
      via_email_proposta_bid_frete_internacional: opcoes.via_email_proposta_bid_frete_internacional ?? false,
    },
  })

  if (taxas?.length) {
    await (prisma as any).taxaBidFreteInternacional.createMany({
      data: taxas.map((t) => ({
        id_proposta_bid_frete_internacional: proposta.id_proposta_bid_frete_internacional,
        id_organizacao: disparo.id_organizacao,
        ...t,
      })),
    })
  }

  await (prisma as any).disparoCotacaoBidFreteInternacional.update({
    where: { id_disparo_cotacao_bid_frete_internacional: disparo.id_disparo_cotacao_bid_frete_internacional },
    data: {
      status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
      data_resposta_disparo_cotacao_bid_frete_internacional: new Date(),
    },
  })

  const totalRequests = await (prisma as any).disparoCotacaoBidFreteInternacional.count({
    where: { id_cotacao_bid_frete_internacional: disparo.id_cotacao_bid_frete_internacional },
  })
  const totalRespondidos = await (prisma as any).disparoCotacaoBidFreteInternacional.count({
    where: {
      id_cotacao_bid_frete_internacional: disparo.id_cotacao_bid_frete_internacional,
      status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
    },
  })

  const cotacao = await (prisma as any).cotacaoBidFreteInternacional.findFirst({
    where: { id_cotacao_bid_frete_internacional: disparo.id_cotacao_bid_frete_internacional },
  })

  if (cotacao) {
    if (totalRespondidos >= totalRequests) {
      await (prisma as any).cotacaoBidFreteInternacional.update({
        where: { id_cotacao_bid_frete_internacional: disparo.id_cotacao_bid_frete_internacional },
        data: { status_cotacao_bid_frete_internacional: 'AGUARDANDO_APROVACAO' },
      })
      if (opcoes.tenantId) {
        atividadesIntegration.aguardandoAprovacao(opcoes.tenantId, cotacao.id_usuario, {
          numero_cotacao_bid_frete_internacional: cotacao.numero_cotacao_bid_frete_internacional,
          total_respostas: totalRespondidos,
        })
      }
    } else {
      await (prisma as any).cotacaoBidFreteInternacional.update({
        where: { id_cotacao_bid_frete_internacional: disparo.id_cotacao_bid_frete_internacional },
        data: { status_cotacao_bid_frete_internacional: 'EM_COTACAO' },
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

  return proposta
}
