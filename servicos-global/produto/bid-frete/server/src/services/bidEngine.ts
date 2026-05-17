/**
 * bidEngine.ts — Motor de Disparo de BIDs
 * Responsavel por:
 * 1. Criar BidRequests para cada fornecedor selecionado
 * 2. Disparar via Email (Resend) e/ou WhatsApp (Meta Cloud API)
 * 3. Gerar tokens publicos para resposta sem login
 * 4. Verificar tabelas de preco para cotacao automatica
 * 5. Despachar para connectors de APIs externas
 */

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import axios from 'axios'

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL ?? 'http://localhost:8022'
const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL ?? 'http://localhost:3001'
const ATIVIDADES_SERVICE_URL = process.env.ATIVIDADES_SERVICE_URL ?? 'http://localhost:3001'
const NOTIFICACOES_SERVICE_URL = process.env.NOTIFICACOES_SERVICE_URL ?? 'http://localhost:3001'
const HISTORICO_SERVICE_URL = process.env.HISTORICO_SERVICE_URL ?? 'http://localhost:3001'
const INTERNAL_KEY = process.env.CHAVE_INTERNA_SERVICO ?? ''
const APP_URL = process.env.APP_URL ?? 'http://localhost:5175'

interface DispararBidOptions {
  cotacao_id: string
  fornecedor_ids: string[]
  canais: ('EMAIL' | 'WHATSAPP')[]
  user_id: string
  id_organizacao: string
}

export const bidEngine = {
  /**
   * Dispara BIDs para fornecedores selecionados
   */
  async disparar(prisma: PrismaClient, options: DispararBidOptions) {
    const { cotacao_id, fornecedor_ids, canais, user_id, id_organizacao } = options

    // Buscar cotacao
    const cotacao = await (prisma as any).freteIntBidCotacoes.findFirst({ where: { id: cotacao_id } })
    if (!cotacao) throw new Error('Cotacao nao encontrada')

    // Buscar fornecedores
    const fornecedores = await (prisma as any).freteIntBidFornecedores.findMany({
      where: { id: { in: fornecedor_ids }, status: 'ATIVO' },
    })

    const results: Array<{ fornecedor_id: string; canal: string; bid_request_id: string }> = []

    for (const fornecedor of fornecedores) {
      // Verificar tabela de preco padrao (cotacao automatica)
      const tabelaMatch = await this.verificarTabelaPadrao(prisma, cotacao, fornecedor)

      for (const canal of canais) {
        const token = randomUUID()
        const tokenExpira = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

        // Criar BidRequest
        const bidRequest = await (prisma as any).freteIntBidPedidoCotacoes.create({
          data: {
            product_id: 'bid-frete',
            user_id,
            cotacao_id,
            fornecedor_id: fornecedor.id,
            canal,
            status: 'PENDENTE',
            token_resposta: token,
            token_expira_em: tokenExpira,
          },
        })

        // Disparar pelo canal
        try {
          if (canal === 'EMAIL') {
            await this.dispararEmail(cotacao, fornecedor, token, id_organizacao)
          } else if (canal === 'WHATSAPP') {
            await this.dispararWhatsApp(cotacao, fornecedor, token, id_organizacao)
          }

          await (prisma as any).freteIntBidPedidoCotacoes.update({
            where: { id: bidRequest.id },
            data: { status: 'ENVIADO', enviado_em: new Date() },
          })
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err)
          await (prisma as any).freteIntBidPedidoCotacoes.update({
            where: { id: bidRequest.id },
            data: { status: 'ERRO_ENVIO', erro_envio: errorMessage },
          })
        }

        results.push({ fornecedor_id: fornecedor.id, canal, bid_request_id: bidRequest.id })
      }

      // Se tem tabela padrao e cotacao automatica ativada, gerar resposta automatica
      if (tabelaMatch && fornecedor.cotacao_automatica) {
        await this.gerarRespostaAutomatica(prisma, cotacao, fornecedor, tabelaMatch)
      }
    }

    // Atualizar status da cotacao
    await (prisma as any).freteIntBidCotacoes.update({
      where: { id: cotacao_id },
      data: { status: 'ENVIADA_FORNECEDORES' },
    })

    return { disparos: results.length, results }
  },

  /**
   * Verifica se fornecedor tem tabela de precos compativel com a cotacao
   */
  async verificarTabelaPadrao(prisma: PrismaClient, _cotacao: Record<string, unknown>, _fornecedor: Record<string, unknown>) {
    // Cast interno: Cotacao/Fornecedor têm shape dinâmico vindo do Prisma
    const cotacao = _cotacao as any
    const fornecedor = _fornecedor as any
    const agora = new Date()

    const tabela = await (prisma as any).freteIntBidTabelasProntas.findFirst({
      where: {
        fornecedor_id: fornecedor.id,
        origem_codigo: cotacao.origem_codigo,
        destino_codigo: cotacao.destino_codigo,
        modal: cotacao.modal,
        ativa: true,
        validade_inicio: { lte: agora },
        validade_fim: { gte: agora },
      },
      orderBy: { valor_total: 'asc' },
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
    const bidRequest = await (prisma as any).freteIntBidPedidoCotacoes.findFirst({
      where: { cotacao_id: cotacao.id, fornecedor_id: fornecedor.id },
      orderBy: { created_at: 'desc' },
    })

    if (!bidRequest) return null

    const response = await (prisma as any).freteIntBidPropostas.create({
      data: {
        product_id: 'bid-frete',
        bid_request_id: bidRequest.id,
        cotacao_id: cotacao.id,
        fornecedor_id: fornecedor.id,
        moeda: tabela.moeda,
        valor_frete: tabela.valor_frete,
        taxas_origem: tabela.taxas_origem,
        taxas_destino: tabela.taxas_destino,
        valor_total: tabela.valor_total,
        transit_time_dias: tabela.transit_time_dias,
        free_time_dias: tabela.free_time_dias,
        validade_cotacao: tabela.validade_fim,
        via_tabela_padrao: true,
      },
    })

    // Atualizar bidRequest como respondido
    await (prisma as any).freteIntBidPedidoCotacoes.update({
      where: { id: bidRequest.id },
      data: { status: 'RESPONDIDO', respondido_em: new Date() },
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
      to: fornecedor.email,
      subject: `Solicitacao de Cotacao de Frete - ${cotacao.numero}`,
      html: `
        <h2>Solicitacao de Cotacao de Frete Internacional</h2>
        <p>Prezado(a) ${fornecedor.nome},</p>
        <p>Recebemos uma solicitacao de cotacao com os seguintes dados:</p>
        <ul>
          <li><strong>Numero:</strong> ${cotacao.numero}</li>
          <li><strong>Modal:</strong> ${cotacao.modal}</li>
          <li><strong>Origem:</strong> ${cotacao.origem_nome} (${cotacao.origem_pais})</li>
          <li><strong>Destino:</strong> ${cotacao.destino_nome} (${cotacao.destino_pais})</li>
          <li><strong>Mercadoria:</strong> ${cotacao.descricao_mercadoria}</li>
          <li><strong>Incoterm:</strong> ${cotacao.incoterm}</li>
          ${cotacao.tipo_container ? `<li><strong>Container:</strong> ${cotacao.quantidade}x ${cotacao.tipo_container}</li>` : ''}
          ${cotacao.peso_kg ? `<li><strong>Peso:</strong> ${cotacao.peso_kg} kg</li>` : ''}
          ${cotacao.data_limite_resposta ? `<li><strong>Prazo de Resposta:</strong> ${new Date(cotacao.data_limite_resposta).toLocaleDateString('pt-BR')}</li>` : ''}
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
      console.warn(`[BidEngine] Falha ao enviar email para ${fornecedor.email}`)
    })
  },

  /**
   * Dispara WhatsApp via tenant/whatsapp (Meta Cloud API)
   */
  async dispararWhatsApp(_cotacao: Record<string, unknown>, _fornecedor: Record<string, unknown>, token: string, tenantId: string) {
    const cotacao = _cotacao as any
    const fornecedor = _fornecedor as any
    if (!fornecedor.whatsapp) return

    const linkResposta = `${APP_URL}/portal/responder/${token}`

    const body = {
      phone_number: fornecedor.whatsapp,
      text: `*Solicitacao de Cotacao - ${cotacao.numero}*\n\n` +
        `Modal: ${cotacao.modal}\n` +
        `Origem: ${cotacao.origem_nome}\n` +
        `Destino: ${cotacao.destino_nome}\n` +
        `Mercadoria: ${cotacao.descricao_mercadoria}\n` +
        `Incoterm: ${cotacao.incoterm}\n\n` +
        `Responda pelo link: ${linkResposta}`,
    }

    await axios.post(`${WHATSAPP_SERVICE_URL}/api/v1/whatsapp/send`, body, {
      headers: {
        'x-internal-key': INTERNAL_KEY,
        'x-id-organizacao': tenantId,
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      console.warn(`[BidEngine] Falha ao enviar WhatsApp para ${fornecedor.whatsapp}`)
    })
  },
}
