/**
 * Envia e-mails de resultado da aprovação (ganhador + perdedores) via serviço de e-mail.
 */

import axios from 'axios'
import type { PrismaClient } from '../generated/client/index.js'
import { motorComparativo } from './motor-comparativo-bid-frete-internacional.js'
import { buscarFornecedorCadastrosParaDisparo } from './buscar-fornecedor-cadastros-disparo.js'
import {
  resolverEmailsDisparoBidFrete,
  type FornecedorEspelhoBidDisparo,
} from './resolver-contatos-disparo-bid-frete-internacional.js'
import { extrairMensagemErroDisparo } from './motor-bid-disparo-utils.js'
import { resolverNomeClienteEmailAprovacaoBidFreteInternacional } from '../lib/resolver-nome-cliente-cotacao-resposta-bid-frete-internacional.js'
import { lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional } from '../lib/snapshot-empresa-pagadora-taxa-fechamento-cotacao-bid-frete-internacional.js'
import {
  derivarQuantidadeEscalaPropostaColocacaoEmail,
  type PropostaColocacaoEmailBidFreteInternacional,
} from '../../../shared/colocacao-eixos-aprovacao-bid-frete-internacional.js'
import {
  montarAssuntoEmailAprovacaoProposta,
  montarHtmlEmailAprovacaoProposta,
  montarTextoPlanoEmailAprovacaoProposta,
  type ParametrosEmailAprovacaoPropostaBidFreteInternacional,
} from '../../../shared/formatar-email-aprovacao-proposta-bid-frete-internacional.js'
import { montarLinkAceiteAprovacaoPropostaBidFreteInternacional } from '../../../shared/aceite-aprovacao-proposta-bid-frete-internacional.js'

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8008'
const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''
const APP_URL = process.env.APP_URL ?? process.env.BID_FRETE_APP_URL ?? 'http://localhost:8023'
const DISPARO_HTTP_TIMEOUT_MS = 25_000

type PropostaRow = Record<string, unknown> & {
  id_proposta_bid_frete_internacional: string
  id_fornecedor_bid_frete_internacional: string
  status_proposta_bid_frete_internacional: string
  token_aceite_aprovacao_proposta_bid_frete_internacional?: string | null
  fornecedor?: {
    id_fornecedor_bid_frete_internacional?: string
    nome_fornecedor_bid_frete_internacional?: string
    email_fornecedor_bid_frete_internacional?: string
  } | null
}

function espelhoFromFornecedor(fornecedor: NonNullable<PropostaRow['fornecedor']>): FornecedorEspelhoBidDisparo {
  return {
    id_fornecedor_bid_frete_internacional: String(fornecedor.id_fornecedor_bid_frete_internacional ?? ''),
    nome_fornecedor_bid_frete_internacional: fornecedor.nome_fornecedor_bid_frete_internacional,
    email_fornecedor_bid_frete_internacional: fornecedor.email_fornecedor_bid_frete_internacional,
  }
}

function mapPropostaColocacaoEmail(
  row: PropostaRow,
  rankingGeral: number,
): PropostaColocacaoEmailBidFreteInternacional {
  const fornecedorNome =
    row.fornecedor?.nome_fornecedor_bid_frete_internacional?.trim() || 'Fornecedor'
  return {
    id_proposta_bid_frete_internacional: row.id_proposta_bid_frete_internacional,
    fornecedor_nome: fornecedorNome,
    valor_total_proposta_bid_frete_internacional: Number(row.valor_total_proposta_bid_frete_internacional ?? 0),
    valor_frete_proposta_bid_frete_internacional: Number(row.valor_frete_proposta_bid_frete_internacional ?? 0),
    taxas_origem_proposta_bid_frete_internacional: Number(row.taxas_origem_proposta_bid_frete_internacional ?? 0),
    taxas_destino_proposta_bid_frete_internacional: Number(row.taxas_destino_proposta_bid_frete_internacional ?? 0),
    moeda_proposta_bid_frete_internacional: String(row.moeda_proposta_bid_frete_internacional ?? 'USD'),
    dias_transito_proposta_bid_frete_internacional: Number(row.dias_transito_proposta_bid_frete_internacional ?? 0),
    dias_prazo_pagamento_proposta_bid_frete_internacional:
      row.dias_prazo_pagamento_proposta_bid_frete_internacional != null
        ? Number(row.dias_prazo_pagamento_proposta_bid_frete_internacional)
        : null,
    quantidade_escala_proposta_bid_frete_internacional: derivarQuantidadeEscalaPropostaColocacaoEmail({
      quantidade_escala_proposta_bid_frete_internacional:
        row.quantidade_escala_proposta_bid_frete_internacional as number | null | undefined,
      escalas_proposta_bid_frete_internacional:
        row.escalas_proposta_bid_frete_internacional as string | null | undefined,
    }),
    quantidade_transbordo_proposta_bid_frete_internacional: Number(
      row.quantidade_transbordo_proposta_bid_frete_internacional
        ?? row.transbordos_proposta_bid_frete_internacional
        ?? 0,
    ),
    ranking_geral: rankingGeral,
  }
}

async function enviarEmailAprovacao(
  params: ParametrosEmailAprovacaoPropostaBidFreteInternacional,
  email: string,
  id_organizacao: string,
  id_usuario: string,
): Promise<void> {
  const response = await axios.post(
    `${EMAIL_SERVICE_URL}/api/v1/envios-email`,
    {
      to: email,
      subject: montarAssuntoEmailAprovacaoProposta(params),
      body_html: montarHtmlEmailAprovacaoProposta(params),
      body: montarTextoPlanoEmailAprovacaoProposta(params),
      product_id: 'bid-frete-internacional',
    },
    {
      headers: {
        'x-chave-interna-servico': INTERNAL_KEY,
        'x-id-organizacao': id_organizacao,
        'x-id-usuario': id_usuario,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
      timeout: DISPARO_HTTP_TIMEOUT_MS,
    },
  )

  if (response.status < 200 || response.status >= 300) {
    const msg = (response.data as { error?: { message?: string }; message?: string })?.error?.message
      ?? (response.data as { message?: string })?.message
      ?? `HTTP ${response.status}`
    throw new Error(`Falha ao enviar e-mail: ${msg}`)
  }
}

export async function enviarEmailsResultadoAprovacaoBidFreteInternacional(input: {
  prisma: PrismaClient
  id_cotacao_bid_frete_internacional: string
  id_proposta_ganhadora: string
  id_organizacao: string
  id_usuario: string
  nome_usuario_aprovacao: string | null
}): Promise<{ enviados: number; erros: string[] }> {
  const { prisma, id_cotacao_bid_frete_internacional, id_proposta_ganhadora, id_organizacao, id_usuario } = input
  const nomeAprovador = input.nome_usuario_aprovacao?.trim() || 'Equipe Gravity'
  const erros: string[] = []
  let enviados = 0

  const cotacao = await (prisma as any).cotacaoBidFreteInternacional.findFirst({
    where: { id_cotacao_bid_frete_internacional },
  })
  if (!cotacao) {
    throw new Error('Cotação não encontrada para envio de e-mail de aprovação')
  }

  const propostasDb = await (prisma as any).propostaBidFreteInternacional.findMany({
    where: { id_cotacao_bid_frete_internacional },
    include: {
      fornecedor: {
        select: {
          id_fornecedor_bid_frete_internacional: true,
          nome_fornecedor_bid_frete_internacional: true,
          email_fornecedor_bid_frete_internacional: true,
        },
      },
    },
  }) as PropostaRow[]

  if (propostasDb.length === 0) return { enviados: 0, erros: ['Nenhuma proposta para notificar'] }

  const { ranking } = await motorComparativo.ranquear(prisma, id_cotacao_bid_frete_internacional)
  const rankPorId = new Map(ranking.map((r, idx) => [r.id, idx + 1]))

  const propostasTodas = propostasDb.map((p) =>
    mapPropostaColocacaoEmail(p, rankPorId.get(p.id_proposta_bid_frete_internacional) ?? 999),
  )

  const ganhadoraDb = propostasDb.find((p) => p.id_proposta_bid_frete_internacional === id_proposta_ganhadora)
  const ganhadoraColocacao = propostasTodas.find((p) => p.id_proposta_bid_frete_internacional === id_proposta_ganhadora)
  if (!ganhadoraDb || !ganhadoraColocacao) {
    throw new Error('Proposta ganhadora não encontrada para e-mail de aprovação')
  }

  const nomeCliente = await resolverNomeClienteEmailAprovacaoBidFreteInternacional({
    id_workspace: cotacao.id_workspace as string | null | undefined,
  })

  const dataAprovacao =
    cotacao.data_aprovacao_cotacao_bid_frete_internacional
    ?? new Date()

  const pagador = lerEmpresaPagadoraTaxaFechamentoCotacaoBidFreteInternacional(
    id_cotacao_bid_frete_internacional,
  )

  const baseParams = {
    numeroCotacao: String(cotacao.numero_cotacao_bid_frete_internacional ?? id_cotacao_bid_frete_internacional),
    nomeCliente,
    nomeAprovador,
    dataAprovacao,
    modal: String(cotacao.modal_cotacao_bid_frete_internacional ?? ''),
    modalidade: cotacao.modalidade_cotacao_bid_frete_internacional as string | null | undefined,
    origemNome: String(cotacao.origem_nome_cotacao_bid_frete_internacional ?? ''),
    origemPais: String(cotacao.origem_pais_cotacao_bid_frete_internacional ?? ''),
    destinoNome: String(cotacao.destino_nome_cotacao_bid_frete_internacional ?? ''),
    destinoPais: String(cotacao.destino_pais_cotacao_bid_frete_internacional ?? ''),
    mercadoria: String(cotacao.descricao_mercadoria_cotacao_bid_frete_internacional ?? ''),
    incoterm: String(cotacao.incoterm_cotacao_bid_frete_internacional ?? ''),
    propostasTodas,
    nomeFornecedorGanhador: ganhadoraColocacao.fornecedor_nome,
    valorTotalGanhador: ganhadoraColocacao.valor_total_proposta_bid_frete_internacional,
    moedaGanhador: ganhadoraColocacao.moeda_proposta_bid_frete_internacional,
    empresaPagadoraTaxaFechamentoPlataformaGravity: pagador,
  }

  const cadastrosCache = new Map<string, Awaited<ReturnType<typeof buscarFornecedorCadastrosParaDisparo>>>()

  for (const propostaDb of propostasDb) {
    if (!propostaDb.fornecedor?.id_fornecedor_bid_frete_internacional) continue

    const ehGanhador = propostaDb.id_proposta_bid_frete_internacional === id_proposta_ganhadora
    const propostaColocacao = propostasTodas.find(
      (p) => p.id_proposta_bid_frete_internacional === propostaDb.id_proposta_bid_frete_internacional,
    )
    if (!propostaColocacao) continue

    const idFornecedor = String(propostaDb.fornecedor.id_fornecedor_bid_frete_internacional)
    if (!cadastrosCache.has(idFornecedor)) {
      cadastrosCache.set(
        idFornecedor,
        await buscarFornecedorCadastrosParaDisparo(idFornecedor, id_organizacao),
      )
    }

    const emails = resolverEmailsDisparoBidFrete(
      espelhoFromFornecedor(propostaDb.fornecedor),
      cadastrosCache.get(idFornecedor),
    )
    if (emails.length === 0) {
      erros.push(
        `Fornecedor ${propostaDb.fornecedor.nome_fornecedor_bid_frete_internacional ?? idFornecedor} sem e-mail válido`,
      )
      continue
    }

    const tokenAceite = propostaDb.token_aceite_aprovacao_proposta_bid_frete_internacional
    const linkAceite =
      ehGanhador && tokenAceite
        ? montarLinkAceiteAprovacaoPropostaBidFreteInternacional(APP_URL, tokenAceite)
        : undefined

    const params: ParametrosEmailAprovacaoPropostaBidFreteInternacional = {
      ...baseParams,
      ehGanhador,
      nomeFornecedor: propostaDb.fornecedor.nome_fornecedor_bid_frete_internacional?.trim() || 'Fornecedor',
      proposta: propostaColocacao,
      linkAceite,
    }

    for (const email of emails) {
      try {
        await enviarEmailAprovacao(params, email, id_organizacao, id_usuario)
        enviados += 1
      } catch (err: unknown) {
        const msg = extrairMensagemErroDisparo(err, EMAIL_SERVICE_URL)
        erros.push(`${email}: ${msg}`)
        console.warn('[Aprovacao] Falha ao enviar e-mail de resultado:', msg)
      }
    }
  }

  return { enviados, erros }
}
