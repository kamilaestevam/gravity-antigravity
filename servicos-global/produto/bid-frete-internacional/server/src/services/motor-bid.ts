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

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8022'
const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'
const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''
const APP_URL = process.env.APP_URL ?? 'http://localhost:5175'

interface DispararBidOptions {
  id_cotacao_bid_frete_internacional: string
  fornecedor_ids: string[]
  canais: ('EMAIL' | 'WHATSAPP')[]
  id_usuario: string
  id_organizacao: string
}

export const motorBid = {
  /**
   * Dispara BIDs para fornecedores selecionados
   */
  async disparar(prisma: PrismaClient, options: DispararBidOptions) {
    const { id_cotacao_bid_frete_internacional, fornecedor_ids, canais, id_usuario, id_organizacao } = options

    // Buscar cotacao
    const cotacao = await (prisma as any).bidFreteInternacionalCotacao.findFirst({ where: { id_cotacao_bid_frete_internacional } })
    if (!cotacao) throw new Error('Cotacao nao encontrada')

    // Buscar fornecedores
    const fornecedores = await (prisma as any).bidFreteInternacionalFornecedor.findMany({
      where: {
        id_fornecedor_bid_frete_internacional: { in: fornecedor_ids },
        status_fornecedor_bid_frete_internacional: 'ATIVO',
      },
    })

    const results: Array<{ id_fornecedor_bid_frete_internacional: string; canal_pedido_cotacao_bid_frete_internacional: string; id_pedido_cotacao_bid_frete_internacional: string }> = []

    for (const fornecedor of fornecedores) {
      // Verificar tabela de preco padrao (cotacao automatica)
      const tabelaMatch = await this.verificarTabelaPadrao(prisma, cotacao, fornecedor)

      for (const canal_pedido_cotacao_bid_frete_internacional of canais) {
        const token = randomUUID()
        const tokenExpira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

        // Criar BidRequest (Pedido de Cotacao)
        const bidRequest = await (prisma as any).bidFreteInternacionalPedidoCotacao.create({
          data: {
            id_produto_gravity: 'bid-frete-internacional',
            id_usuario,
            id_organizacao,
            id_cotacao_bid_frete_internacional,
            id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
            canal_pedido_cotacao_bid_frete_internacional,
            status_pedido_cotacao_bid_frete_internacional: 'PENDENTE',
            token_resposta_pedido_cotacao_bid_frete_internacional: token,
            data_expiracao_token_pedido_cotacao_bid_frete_internacional: tokenExpira,
          },
        })

        // Disparar pelo canal correspondente
        try {
          if (canal_pedido_cotacao_bid_frete_internacional === 'EMAIL') {
            await this.dispararEmail(cotacao, fornecedor, token, id_organizacao)
          } else if (canal_pedido_cotacao_bid_frete_internacional === 'WHATSAPP') {
            await this.dispararWhatsApp(cotacao, fornecedor, token, id_organizacao)
          }

          await (prisma as any).bidFreteInternacionalPedidoCotacao.update({
            where: { id_pedido_cotacao_bid_frete_internacional: bidRequest.id_pedido_cotacao_bid_frete_internacional },
            data: {
              status_pedido_cotacao_bid_frete_internacional: 'ENVIADO',
              data_envio_pedido_cotacao_bid_frete_internacional: new Date(),
            },
          })
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          await (prisma as any).bidFreteInternacionalPedidoCotacao.update({
            where: { id_pedido_cotacao_bid_frete_internacional: bidRequest.id_pedido_cotacao_bid_frete_internacional },
            data: {
              status_pedido_cotacao_bid_frete_internacional: 'ERRO_ENVIO',
              erro_envio_pedido_cotacao_bid_frete_internacional: errorMessage,
            },
          })
        }

        results.push({
          id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
          canal_pedido_cotacao_bid_frete_internacional,
          id_pedido_cotacao_bid_frete_internacional: bidRequest.id_pedido_cotacao_bid_frete_internacional,
        })
      }

      // Se tem tabela padrao e cotacao automatica ativada, gerar resposta automatica
      if (tabelaMatch && fornecedor.cotacao_automatica_fornecedor_bid_frete_internacional) {
        await this.gerarRespostaAutomatica(prisma, cotacao, fornecedor, tabelaMatch)
      }
    }

    // Atualizar status da cotacao
    await (prisma as any).bidFreteInternacionalCotacao.update({
      where: { id_cotacao_bid_frete_internacional },
      data: { status_cotacao_bid_frete_internacional: 'ENVIADA_FORNECEDORES' },
    })

    return { disparos: results.length, results }
  },

  /**
   * Verifica se fornecedor tem tabela de precos compativel com a cotacao
   */
  async verificarTabelaPadrao(prisma: PrismaClient, _cotacao: Record<string, unknown>, _fornecedor: Record<string, unknown>) {
    const cotacao = _cotacao as any
    const fornecedor = _fornecedor as any
    const agora = new Date()

    const tabela = await (prisma as any).bidFreteInternacionalTabelaValor.findFirst({
      where: {
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
        origem_codigo_tabela_valor_bid_frete_internacional: cotacao.origem_codigo_cotacao_bid_frete_internacional,
        destino_codigo_tabela_valor_bid_frete_internacional: cotacao.destino_codigo_cotacao_bid_frete_internacional,
        modal_tabela_valor_bid_frete_internacional: cotacao.modal_cotacao_bid_frete_internacional,
        ativa_tabela_valor_bid_frete_internacional: true,
        validade_inicio_tabela_valor_bid_frete_internacional: { lte: agora },
        validade_fim_tabela_valor_bid_frete_internacional: { gte: agora },
      },
      orderBy: { valor_total_tabela_valor_bid_frete_internacional: 'asc' },
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
    const bidRequest = await (prisma as any).bidFreteInternacionalPedidoCotacao.findFirst({
      where: {
        id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
      },
      orderBy: { data_criacao_pedido_cotacao_bid_frete_internacional: 'desc' },
    })

    if (!bidRequest) return null

    const response = await (prisma as any).bidFreteInternacionalProposta.create({
      data: {
        id_produto_gravity: 'bid-frete-internacional',
        id_organizacao: cotacao.id_organizacao,
        id_pedido_cotacao_bid_frete_internacional: bidRequest.id_pedido_cotacao_bid_frete_internacional,
        id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
        moeda_proposta_bid_frete_internacional: tabela.moeda_tabela_valor_bid_frete_internacional,
        valor_frete_proposta_bid_frete_internacional: tabela.valor_frete_tabela_valor_bid_frete_internacional,
        taxas_origem_proposta_bid_frete_internacional: tabela.taxas_origem_tabela_valor_bid_frete_internacional,
        taxas_destino_proposta_bid_frete_internacional: tabela.taxas_destino_tabela_valor_bid_frete_internacional,
        valor_total_proposta_bid_frete_internacional: tabela.valor_total_tabela_valor_bid_frete_internacional,
        dias_transito_proposta_bid_frete_internacional: tabela.dias_transito_tabela_valor_bid_frete_internacional,
        dias_free_time_proposta_bid_frete_internacional: tabela.dias_free_time_tabela_valor_bid_frete_internacional,
        validade_proposta_bid_frete_internacional: tabela.validade_fim_tabela_valor_bid_frete_internacional,
        via_tabela_valor_proposta_bid_frete_internacional: true,
      },
    })

    // Atualizar bidRequest como respondido
    await (prisma as any).bidFreteInternacionalPedidoCotacao.update({
      where: { id_pedido_cotacao_bid_frete_internacional: bidRequest.id_pedido_cotacao_bid_frete_internacional },
      data: {
        status_pedido_cotacao_bid_frete_internacional: 'RESPONDIDO',
        data_resposta_pedido_cotacao_bid_frete_internacional: new Date(),
      },
    })

    return response
  },

  /**
   * Dispara email via tenant/email (Resend)
   */
  async dispararEmail(_cotacao: Record<string, unknown>, _fornecedor: Record<string, unknown>, token: string, tenantId: string) {
    const cotacao = _cotacao as any
    const fornecedor = _fornecedor as any
    const linkResposta = `${APP_URL}/portal/responder/${token}`

    const body = {
      to: fornecedor.email_fornecedor_bid_frete_internacional,
      subject: `Solicitacao de Cotacao de Frete - ${cotacao.numero_cotacao_bid_frete_internacional}`,
      html: `
        <h2>Solicitacao de Cotacao de Frete Internacional</h2>
        <p>Prezado(a) ${fornecedor.nome_fornecedor_bid_frete_internacional},</p>
        <p>Recebemos uma solicitacao de cotacao com os seguintes dados:</p>
        <ul>
          <li><strong>Numero:</strong> ${cotacao.numero_cotacao_bid_frete_internacional}</li>
          <li><strong>Modal:</strong> ${cotacao.modal_cotacao_bid_frete_internacional}</li>
          <li><strong>Origem:</strong> ${cotacao.origem_nome_cotacao_bid_frete_internacional} (${cotacao.origem_pais_cotacao_bid_frete_internacional})</li>
          <li><strong>Destino:</strong> ${cotacao.destino_nome_cotacao_bid_frete_internacional} (${cotacao.destino_pais_cotacao_bid_frete_internacional})</li>
          <li><strong>Mercadoria:</strong> ${cotacao.descricao_mercadoria_cotacao_bid_frete_internacional}</li>
          <li><strong>Incoterm:</strong> ${cotacao.incoterm_cotacao_bid_frete_internacional}</li>
          ${cotacao.tipo_container_cotacao_bid_frete_internacional ? `<li><strong>Container:</strong> ${cotacao.quantidade_cotacao_bid_frete_internacional}x ${cotacao.tipo_container_cotacao_bid_frete_internacional}</li>` : ''}
          ${cotacao.peso_kg_cotacao_bid_frete_internacional ? `<li><strong>Peso:</strong> ${cotacao.peso_kg_cotacao_bid_frete_internacional} kg</li>` : ''}
          ${cotacao.data_limite_resposta_cotacao_bid_frete_internacional ? `<li><strong>Prazo de Resposta:</strong> ${new Date(cotacao.data_limite_resposta_cotacao_bid_frete_internacional).toLocaleDateString('pt-BR')}</li>` : ''}
        </ul>
        <p><a href="${linkResposta}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">Responder Cotacao</a></p>
        <p>Ou acesse o portal para ver todas as cotacoes pendentes.</p>
      `,
    }

    await axios.post(`${EMAIL_SERVICE_URL}/api/v1/envios-email`, body, {
      headers: {
        'x-internal-key': INTERNAL_KEY,
        'x-id-organizacao': tenantId,
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      // Fallback: log para retry
      console.warn(`[BidEngine] Falha ao enviar email para ${fornecedor.email_fornecedor_bid_frete_internacional}`)
    })
  },

  /**
   * Dispara WhatsApp via tenant/whatsapp (Meta Cloud API)
   */
  async dispararWhatsApp(_cotacao: Record<string, unknown>, _fornecedor: Record<string, unknown>, token: string, tenantId: string) {
    const cotacao = _cotacao as any
    const fornecedor = _fornecedor as any
    if (!fornecedor.whatsapp_fornecedor_bid_frete_internacional) return

    const linkResposta = `${APP_URL}/portal/responder/${token}`

    const body = {
      phone_number: fornecedor.whatsapp_fornecedor_bid_frete_internacional,
      text: `*Solicitacao de Cotacao - ${cotacao.numero_cotacao_bid_frete_internacional}*\n\n` +
        `Modal: ${cotacao.modal_cotacao_bid_frete_internacional}\n` +
        `Origem: ${cotacao.origem_nome_cotacao_bid_frete_internacional}\n` +
        `Destino: ${cotacao.destino_nome_cotacao_bid_frete_internacional}\n` +
        `Mercadoria: ${cotacao.descricao_mercadoria_cotacao_bid_frete_internacional}\n` +
        `Incoterm: ${cotacao.incoterm_cotacao_bid_frete_internacional}\n\n` +
        `Responda pelo link: ${linkResposta}`,
    }

    await axios.post(`${WHATSAPP_SERVICE_URL}/api/v1/whatsapp/send`, body, {
      headers: {
        'x-internal-key': INTERNAL_KEY,
        'x-id-organizacao': tenantId,
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      console.warn(`[BidEngine] Falha ao enviar WhatsApp para ${fornecedor.whatsapp_fornecedor_bid_frete_internacional}`)
    })
  },
}
