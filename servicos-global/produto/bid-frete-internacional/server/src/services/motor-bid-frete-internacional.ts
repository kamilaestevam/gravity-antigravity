/**
 * motor-bid.ts — Motor de Disparo de BIDs
 * Responsável por:
 * 1. Criar Pedidos de Cotação (BidRequests) para cada fornecedor selecionado
 * 2. Disparar via Email (Resend) e/ou WhatsApp (Meta Cloud API)
 * 3. Gerar tokens públicos para resposta sem login
 * 4. Verificar tabelas de valor para cotação automática
 * 5. Despachar para connectors de APIs externas
 */

import { PrismaClient } from '../generated/client/index.js'
import { randomUUID } from 'crypto'
import axios from 'axios'
import {
  montarAssuntoEmailDisparo,
  montarHtmlEmailDisparo,
  montarLinkRespostaDisparo,
} from './motor-bid-disparo-utils.js'
import { snapshotPropostaFromCotacao } from '../lib/snapshot-proposta-bid-frete.js'

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8022'
const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'
const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''
const APP_URL = process.env.APP_URL ?? 'http://localhost:8000'

type CanalDisparoMotor = 'EMAIL' | 'WHATSAPP'
type TipoFornecedorMotor = 'AGENTE_CARGA' | 'ARMADOR' | 'CIA_AEREA' | 'TRANSPORTADORA'

interface DispararBidOptions {
  id_cotacao_bid_frete_internacional: string
  fornecedor_ids: string[]
  canais: CanalDisparoMotor[]
  id_usuario: string
  id_organizacao: string
}

interface DispararCotacaoAbertaOptions {
  id_cotacao_bid_frete_internacional: string
  canais: CanalDisparoMotor[]
  id_usuario: string
  id_organizacao: string
  tipos_fornecedor?: TipoFornecedorMotor[]
}

export const motorBid = {
  /**
   * Dispara BIDs para fornecedores selecionados
   */
  async disparar(prisma: PrismaClient, options: DispararBidOptions) {
    const { id_cotacao_bid_frete_internacional, fornecedor_ids, canais, id_usuario, id_organizacao } = options

    // Buscar cotacao
    const cotacao = await (prisma as any).cotacaoBidFreteInternacional.findFirst({ where: { id_cotacao_bid_frete_internacional } })
    if (!cotacao) throw new Error('Cotacao nao encontrada')

    // Buscar fornecedores
    const fornecedores = await (prisma as any).fornecedorBidFreteInternacional.findMany({
      where: {
        id_fornecedor_bid_frete_internacional: { in: fornecedor_ids },
        status_fornecedor_bid_frete_internacional: 'ATIVO',
      },
    })

    const results: Array<{ id_fornecedor_bid_frete_internacional: string; canal_disparo_cotacao_bid_frete_internacional: string; id_disparo_cotacao_bid_frete_internacional: string }> = []
    let algumDisparoEnviado = false

    for (const fornecedor of fornecedores) {
      // Verificar tabela de preco padrao (cotacao automatica)
      const tabelaMatch = await this.verificarTabelaPadrao(prisma, cotacao, fornecedor)

      for (const canal_disparo_cotacao_bid_frete_internacional of canais) {
        const token = randomUUID()
        const tokenExpira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

        // Criar BidRequest (Pedido de Cotacao)
        const bidRequest = await (prisma as any).disparoCotacaoBidFreteInternacional.create({
          data: {
            id_produto_gravity: 'bid-frete-internacional',
            id_usuario,
            id_organizacao,
            id_cotacao_bid_frete_internacional,
            id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
            canal_disparo_cotacao_bid_frete_internacional,
            status_disparo_cotacao_bid_frete_internacional: 'PENDENTE',
            token_resposta_disparo_cotacao_bid_frete_internacional: token,
            data_expiracao_token_disparo_cotacao_bid_frete_internacional: tokenExpira,
          },
        })

        // Disparar pelo canal correspondente
        try {
          let idMensagem: string | null = null
          if (canal_disparo_cotacao_bid_frete_internacional === 'EMAIL') {
            idMensagem = await this.dispararEmail(cotacao, fornecedor, token, id_organizacao, id_usuario)
          } else if (canal_disparo_cotacao_bid_frete_internacional === 'WHATSAPP') {
            await this.dispararWhatsApp(cotacao, fornecedor, token, id_organizacao)
          }

          await (prisma as any).disparoCotacaoBidFreteInternacional.update({
            where: { id_disparo_cotacao_bid_frete_internacional: bidRequest.id_disparo_cotacao_bid_frete_internacional },
            data: {
              status_disparo_cotacao_bid_frete_internacional: 'ENVIADO',
              data_envio_disparo_cotacao_bid_frete_internacional: new Date(),
              ...(idMensagem ? { id_mensagem_disparo_cotacao_bid_frete_internacional: idMensagem } : {}),
            },
          })
          algumDisparoEnviado = true
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          await (prisma as any).disparoCotacaoBidFreteInternacional.update({
            where: { id_disparo_cotacao_bid_frete_internacional: bidRequest.id_disparo_cotacao_bid_frete_internacional },
            data: {
              status_disparo_cotacao_bid_frete_internacional: 'ERRO_ENVIO',
              erro_envio_disparo_cotacao_bid_frete_internacional: errorMessage,
            },
          })
        }

        results.push({
          id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
          canal_disparo_cotacao_bid_frete_internacional,
          id_disparo_cotacao_bid_frete_internacional: bidRequest.id_disparo_cotacao_bid_frete_internacional,
        })
      }

      // Se tem tabela padrao e cotacao automatica ativada, gerar resposta automatica
      if (tabelaMatch && fornecedor.cotacao_automatica_fornecedor_bid_frete_internacional) {
        await this.gerarRespostaAutomatica(prisma, cotacao, fornecedor, tabelaMatch)
      }
    }

    if (algumDisparoEnviado) {
      await (prisma as any).cotacaoBidFreteInternacional.update({
        where: { id_cotacao_bid_frete_internacional },
        data: { status_cotacao_bid_frete_internacional: 'ENVIADA_FORNECEDORES' },
      })
    }

    return { disparos: results.length, enviados: algumDisparoEnviado, results }
  },

  async dispararCotacaoAberta(prisma: PrismaClient, options: DispararCotacaoAbertaOptions) {
    const where: Record<string, unknown> = {
      id_produto_gravity: 'bid-frete-internacional',
      status_fornecedor_bid_frete_internacional: 'ATIVO',
      aceita_cotacao_aberta_fornecedor_bid_frete_internacional: true,
    }
    if (options.tipos_fornecedor?.length) {
      where.tipo_fornecedor_bid_frete_internacional = { in: options.tipos_fornecedor }
    }

    const fornecedores = await (prisma as any).fornecedorBidFreteInternacional.findMany({
      where,
      select: { id_fornecedor_bid_frete_internacional: true },
    })

    const fornecedor_ids = (fornecedores as Array<{ id_fornecedor_bid_frete_internacional: string }>).map(
      (f) => f.id_fornecedor_bid_frete_internacional,
    )

    if (fornecedor_ids.length === 0) {
      return { disparos: 0, results: [], message: 'Nenhum fornecedor ativo aceita cotacao aberta' }
    }

    return this.disparar(prisma, {
      id_cotacao_bid_frete_internacional: options.id_cotacao_bid_frete_internacional,
      fornecedor_ids,
      canais: options.canais,
      id_usuario: options.id_usuario,
      id_organizacao: options.id_organizacao,
    })
  },

  /**
   * Verifica se fornecedor tem tabela de precos compativel com a cotacao
   */
  async verificarTabelaPadrao(prisma: PrismaClient, _cotacao: Record<string, unknown>, _fornecedor: Record<string, unknown>) {
    const cotacao = _cotacao as any
    const fornecedor = _fornecedor as any
    const agora = new Date()

    const tabela = await (prisma as any).tabelaBidFreteInternacional.findFirst({
      where: {
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
        origem_codigo_tabela_bid_frete_internacional: cotacao.origem_codigo_cotacao_bid_frete_internacional,
        destino_codigo_tabela_bid_frete_internacional: cotacao.destino_codigo_cotacao_bid_frete_internacional,
        modal_tabela_bid_frete_internacional: cotacao.modal_cotacao_bid_frete_internacional,
        ativa_tabela_bid_frete_internacional: true,
        validade_inicio_tabela_bid_frete_internacional: { lte: agora },
        validade_fim_tabela_bid_frete_internacional: { gte: agora },
      },
      orderBy: { valor_total_tabela_bid_frete_internacional: 'asc' },
    })

    return tabela
  },

  /**
   * Gera BidResponse automatica a partir da tabela de precos
   */
  async gerarRespostaAutomatica(prisma: PrismaClient, _cotacao: Record<string, unknown>, _fornecedor: Record<string, unknown>, _tabela: Record<string, unknown>) {
    const cotacao = _cotacao as any
    const fornecedor = _fornecedor as any
    const tabela = _tabela as any

    // Buscar o bidRequest correspondente
    const bidRequest = await (prisma as any).disparoCotacaoBidFreteInternacional.findFirst({
      where: {
        id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
      },
      orderBy: { data_criacao_disparo_cotacao_bid_frete_internacional: 'desc' },
    })

    if (!bidRequest) return null

    const snapshotProposta = snapshotPropostaFromCotacao(cotacao)

    const response = await (prisma as any).propostaBidFreteInternacional.create({
      data: {
        id_produto_gravity: 'bid-frete-internacional',
        id_organizacao: cotacao.id_organizacao,
        ...snapshotProposta,
        id_disparo_cotacao_bid_frete_internacional: bidRequest.id_disparo_cotacao_bid_frete_internacional,
        id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
        moeda_proposta_bid_frete_internacional: tabela.moeda_tabela_bid_frete_internacional,
        valor_frete_proposta_bid_frete_internacional: tabela.valor_frete_tabela_bid_frete_internacional,
        taxas_origem_proposta_bid_frete_internacional: tabela.taxas_origem_tabela_bid_frete_internacional,
        taxas_destino_proposta_bid_frete_internacional: tabela.taxas_destino_tabela_bid_frete_internacional,
        valor_total_proposta_bid_frete_internacional: tabela.valor_total_tabela_bid_frete_internacional,
        dias_transito_proposta_bid_frete_internacional: tabela.dias_transito_tabela_bid_frete_internacional,
        dias_free_time_proposta_bid_frete_internacional: tabela.dias_free_time_tabela_bid_frete_internacional,
        validade_proposta_bid_frete_internacional: tabela.validade_fim_tabela_bid_frete_internacional,
        via_tabela_proposta_bid_frete_internacional: true,
      },
    })

    // Atualizar bidRequest como respondido
    await (prisma as any).disparoCotacaoBidFreteInternacional.update({
      where: { id_disparo_cotacao_bid_frete_internacional: bidRequest.id_disparo_cotacao_bid_frete_internacional },
      data: {
        status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO',
        data_resposta_disparo_cotacao_bid_frete_internacional: new Date(),
      },
    })

    return response
  },

  async dispararEmail(
    _cotacao: Record<string, unknown>,
    _fornecedor: Record<string, unknown>,
    token: string,
    id_organizacao: string,
    id_usuario: string,
  ): Promise<string | null> {
    const cotacao = _cotacao as Record<string, any>
    const fornecedor = _fornecedor as Record<string, any>
    const email = fornecedor.email_fornecedor_bid_frete_internacional as string | undefined
    if (!email) {
      throw new Error(`Fornecedor ${fornecedor.nome_fornecedor_bid_frete_internacional ?? ''} sem e-mail cadastrado`)
    }

    const linkResposta = montarLinkRespostaDisparo(APP_URL, token)
    const bodyHtml = montarHtmlEmailDisparo({
      nomeFornecedor: fornecedor.nome_fornecedor_bid_frete_internacional,
      numeroCotacao: cotacao.numero_cotacao_bid_frete_internacional,
      modal: cotacao.modal_cotacao_bid_frete_internacional,
      origemNome: cotacao.origem_nome_cotacao_bid_frete_internacional,
      origemPais: cotacao.origem_pais_cotacao_bid_frete_internacional,
      destinoNome: cotacao.destino_nome_cotacao_bid_frete_internacional,
      destinoPais: cotacao.destino_pais_cotacao_bid_frete_internacional,
      mercadoria: cotacao.descricao_mercadoria_cotacao_bid_frete_internacional,
      incoterm: cotacao.incoterm_cotacao_bid_frete_internacional,
      tipoContainer: cotacao.tipo_container_cotacao_bid_frete_internacional,
      quantidade: cotacao.quantidade_cotacao_bid_frete_internacional,
      pesoKg: cotacao.peso_kg_cotacao_bid_frete_internacional,
      dataLimiteResposta: cotacao.data_limite_resposta_cotacao_bid_frete_internacional,
      linkResposta,
    })

    const response = await axios.post(
      `${EMAIL_SERVICE_URL}/api/v1/envios-email`,
      {
        to: email,
        subject: montarAssuntoEmailDisparo(cotacao.numero_cotacao_bid_frete_internacional),
        body_html: bodyHtml,
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
      },
    )

    if (response.status < 200 || response.status >= 300) {
      const msg = (response.data as { error?: { message?: string }; message?: string })?.error?.message
        ?? (response.data as { message?: string })?.message
        ?? `HTTP ${response.status}`
      throw new Error(`Falha ao enviar e-mail: ${msg}`)
    }

    return (response.data as { resend_id?: string | null })?.resend_id ?? null
  },

  async dispararWhatsApp(
    _cotacao: Record<string, unknown>,
    _fornecedor: Record<string, unknown>,
    token: string,
    id_organizacao: string,
  ) {
    const cotacao = _cotacao as Record<string, any>
    const fornecedor = _fornecedor as Record<string, any>
    const whatsapp = fornecedor.whatsapp_fornecedor_bid_frete_internacional as string | undefined
    if (!whatsapp) {
      throw new Error(`Fornecedor ${fornecedor.nome_fornecedor_bid_frete_internacional ?? ''} sem WhatsApp cadastrado`)
    }

    const linkResposta = montarLinkRespostaDisparo(APP_URL, token)

    const response = await axios.post(
      `${WHATSAPP_SERVICE_URL}/api/v1/whatsapp/send`,
      {
        phone_number: whatsapp,
        text:
          `*Solicitação de Cotação — ${cotacao.numero_cotacao_bid_frete_internacional}*\n\n` +
          `Modal: ${cotacao.modal_cotacao_bid_frete_internacional}\n` +
          `Origem: ${cotacao.origem_nome_cotacao_bid_frete_internacional}\n` +
          `Destino: ${cotacao.destino_nome_cotacao_bid_frete_internacional}\n` +
          `Mercadoria: ${cotacao.descricao_mercadoria_cotacao_bid_frete_internacional}\n` +
          `Incoterm: ${cotacao.incoterm_cotacao_bid_frete_internacional}\n\n` +
          `Responda pelo link: ${linkResposta}`,
      },
      {
        headers: {
          'x-chave-interna-servico': INTERNAL_KEY,
          'x-id-organizacao': id_organizacao,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      },
    )

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Falha ao enviar WhatsApp: HTTP ${response.status}`)
    }
  },
}
