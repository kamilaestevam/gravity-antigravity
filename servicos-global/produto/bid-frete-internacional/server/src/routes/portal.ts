/**
 * portal.ts — Portal do Fornecedor (autenticado via x-internal-key + x-id-usuario)
 * Rotas para fornecedores logados no Gravity (role SUPPLIER)
 *
 * GET  /dashboard           Dashboard do fornecedor
 * GET  /cotacoes-pendentes  Cotacoes pendentes para resposta
 * GET  /respostas           Historico de respostas
 * POST /responder/:bidRequestId  Responder cotacao
 * GET  /desempenho          Metricas e rating
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { motorClassificacao } from '../services/motor-classificacao-bid-frete-internacional.js'
import { AppError } from '../lib/erros.js'
import { snapshotPropostaFromCotacao } from '../lib/snapshot-proposta-bid-frete.js'
import { notificacoesIntegration, historicoIntegration, atividadesIntegration } from '../services/integracoes-tenant.js'
import { monetizacao } from '../services/monetizacao.js'

const router = Router()

const ResponderSchema = z.object({
  moeda_proposta_bid_frete_internacional: z.string().default('USD'),
  valor_frete_proposta_bid_frete_internacional: z.number().positive(),
  taxas_origem_proposta_bid_frete_internacional: z.number().min(0).default(0),
  taxas_destino_proposta_bid_frete_internacional: z.number().min(0).default(0),
  dias_transito_proposta_bid_frete_internacional: z.number().int().positive(),
  dias_free_time_proposta_bid_frete_internacional: z.number().int().optional(),
  transbordos_proposta_bid_frete_internacional: z.number().int().min(0).default(0),
  escalas_proposta_bid_frete_internacional: z.string().optional(),
  observacoes_proposta_bid_frete_internacional: z.string().optional(),
  validade_proposta_bid_frete_internacional: z.string().datetime(),
  taxas: z.array(z.object({
    tipo_taxa_bid_frete_internacional: z.enum(['origem', 'destino', 'frete']),
    nome_taxa_bid_frete_internacional: z.string(),
    valor_taxa_bid_frete_internacional: z.number(),
    moeda_taxa_bid_frete_internacional: z.string().default('USD'),
    id_taxa_origem_destino: z.string().nullable().optional(),
  })).optional(),
})

// GET /dashboard — Dashboard do fornecedor
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401)

    // Buscar fornecedor vinculado a este user
    const fornecedor = await (req.prisma as any).fornecedorBidFreteInternacional.findFirst({
      where: { id_clerk_usuario: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado para este usuario', 404)

    const [pendentes, respondidas, aprovadas, totalRequests] = await Promise.all([
      (req.prisma as any).disparoCotacaoBidFreteInternacional.count({
        where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional, status_disparo_cotacao_bid_frete_internacional: { in: ['ENVIADO', 'VISUALIZADO'] } },
      }),
      (req.prisma as any).propostaBidFreteInternacional.count({
        where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional },
      }),
      (req.prisma as any).propostaBidFreteInternacional.count({
        where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional, status_proposta_bid_frete_internacional: 'APROVADA' },
      }),
      (req.prisma as any).disparoCotacaoBidFreteInternacional.count({
        where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional },
      }),
    ])

    // Rating global
    let rating = null
    try {
      rating = await (req.prisma as any).classificacaoBidFreteInternacional.findUnique({
        where: { email_fornecedor_classificacao_bid_frete_internacional: fornecedor.email_fornecedor_bid_frete_internacional },
      })
    } catch { /* pode nao existir */ }

    res.json({
      fornecedor: { id: fornecedor.id_fornecedor_bid_frete_internacional, nome: fornecedor.nome_fornecedor_bid_frete_internacional, tipo: fornecedor.tipo_fornecedor_bid_frete_internacional },
      metricas: {
        cotacoes_pendentes: pendentes,
        cotacoes_respondidas: respondidas,
        cotacoes_aprovadas: aprovadas,
        total_recebidas: totalRequests,
        taxa_resposta: totalRequests > 0 ? (respondidas / totalRequests * 100).toFixed(1) : '0',
        taxa_aprovacao: respondidas > 0 ? (aprovadas / respondidas * 100).toFixed(1) : '0',
      },
      rating,
    })
  } catch (err) {
    next(err)
  }
})

// GET /cotacoes-pendentes — Cotacoes aguardando resposta
router.get('/cotacoes-pendentes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-id-usuario'] as string
    const fornecedor = await (req.prisma as any).fornecedorBidFreteInternacional.findFirst({
      where: { id_clerk_usuario: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    const requests = await (req.prisma as any).disparoCotacaoBidFreteInternacional.findMany({
      where: {
        id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional,
        status_disparo_cotacao_bid_frete_internacional: { in: ['ENVIADO', 'VISUALIZADO', 'PENDENTE'] },
      },
      include: {
        cotacao: {
          select: {
            id_cotacao_bid_frete_internacional: true, numero_cotacao_bid_frete_internacional: true, modal_cotacao_bid_frete_internacional: true, modalidade_cotacao_bid_frete_internacional: true,
            origem_nome_cotacao_bid_frete_internacional: true, origem_pais_cotacao_bid_frete_internacional: true,
            destino_nome_cotacao_bid_frete_internacional: true, destino_pais_cotacao_bid_frete_internacional: true,
            descricao_mercadoria_cotacao_bid_frete_internacional: true, ncm_cotacao_bid_frete_internacional: true, incoterm_cotacao_bid_frete_internacional: true,
            quantidade_cotacao_bid_frete_internacional: true, tipo_container_cotacao_bid_frete_internacional: true, peso_kg_cotacao_bid_frete_internacional: true,
            data_limite_resposta_cotacao_bid_frete_internacional: true, anonima_cotacao_bid_frete_internacional: true,
            valor_meta_cotacao_bid_frete_internacional: true,
          },
        },
      },
      orderBy: { data_criacao_disparo_cotacao_bid_frete_internacional: 'desc' },
    })

    // Marcar como visualizado
    const pendentesIds = (requests as any[])
      .filter((r) => r.status_disparo_cotacao_bid_frete_internacional === 'ENVIADO' || r.status_disparo_cotacao_bid_frete_internacional === 'PENDENTE')
      .map((r) => r.id_disparo_cotacao_bid_frete_internacional)

    if (pendentesIds.length > 0) {
      await (req.prisma as any).disparoCotacaoBidFreteInternacional.updateMany({
        where: { id_disparo_cotacao_bid_frete_internacional: { in: pendentesIds } },
        data: { status_disparo_cotacao_bid_frete_internacional: 'VISUALIZADO', data_visualizacao_disparo_cotacao_bid_frete_internacional: new Date() },
      })
    }

    res.json({ disparo_cotacao_bid_frete_internacional: requests })
  } catch (err) {
    next(err)
  }
})

// GET /propostas — Historico de propostas
router.get('/propostas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-id-usuario'] as string
    const fornecedor = await (req.prisma as any).fornecedorBidFreteInternacional.findFirst({
      where: { id_clerk_usuario: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string }
    const skip = (Number(page) - 1) * Number(limit)

    const [respostas, total] = await Promise.all([
      (req.prisma as any).propostaBidFreteInternacional.findMany({
        where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional },
        include: {
          cotacao: {
            select: { id_cotacao_bid_frete_internacional: true, numero_cotacao_bid_frete_internacional: true, origem_nome_cotacao_bid_frete_internacional: true, destino_nome_cotacao_bid_frete_internacional: true, modal_cotacao_bid_frete_internacional: true, status_cotacao_bid_frete_internacional: true },
          },
          taxas: true,
        },
        orderBy: { data_criacao_proposta_bid_frete_internacional: 'desc' },
        skip,
        take: Number(limit),
      }),
      (req.prisma as any).propostaBidFreteInternacional.count({ where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional } }),
    ])

    res.json({
      propostas_bid_frete_internacional: respostas,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    })
  } catch (err) {
    next(err)
  }
})

// POST /responder/:bidRequestId — Responder cotacao
router.post('/responder/:bidRequestId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ResponderSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string

    const bidRequest = await (req.prisma as any).disparoCotacaoBidFreteInternacional.findFirst({
      where: { id_disparo_cotacao_bid_frete_internacional: req.params.bidRequestId },
    })

    if (!bidRequest) throw new AppError('Disparo de cotacao nao encontrado', 404)
    if (bidRequest.status_disparo_cotacao_bid_frete_internacional === 'RESPONDIDO') throw new AppError('Cotacao ja respondida', 400)

    const { taxas, ...responseData } = parsed.data

    // Calcular valor total
    const valorTotal = responseData.valor_frete_proposta_bid_frete_internacional + responseData.taxas_origem_proposta_bid_frete_internacional + responseData.taxas_destino_proposta_bid_frete_internacional

    const cotacaoOrigem = await (req.prisma as any).cotacaoBidFreteInternacional.findFirst({
      where: { id_cotacao_bid_frete_internacional: bidRequest.id_cotacao_bid_frete_internacional },
      select: { id_workspace: true, id_bid_bid_frete_internacional: true },
    })

    // Criar BidResponse
    const response = await (req.prisma as any).propostaBidFreteInternacional.create({
      data: {
        id_organizacao: bidRequest.id_organizacao,
        id_produto_gravity: 'bid-frete-internacional',
        ...(cotacaoOrigem ? snapshotPropostaFromCotacao(cotacaoOrigem) : {}),
        id_usuario: userId,
        id_disparo_cotacao_bid_frete_internacional: bidRequest.id_disparo_cotacao_bid_frete_internacional,
        id_cotacao_bid_frete_internacional: bidRequest.id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: bidRequest.id_fornecedor_bid_frete_internacional,
        ...responseData,
        valor_total_proposta_bid_frete_internacional: valorTotal,
        validade_proposta_bid_frete_internacional: new Date(responseData.validade_proposta_bid_frete_internacional),
        via_portal_proposta_bid_frete_internacional: true,
      },
    })

    // Criar detalhes de taxas
    if (taxas?.length) {
      await (req.prisma as any).taxaBidFreteInternacional.createMany({
        data: taxas.map(t => ({
          id_proposta_bid_frete_internacional: response.id_proposta_bid_frete_internacional,
          id_organizacao: bidRequest.id_organizacao,
          ...t,
        })),
      })
    }

    // Atualizar BidRequest
    await (req.prisma as any).disparoCotacaoBidFreteInternacional.update({
      where: { id_disparo_cotacao_bid_frete_internacional: bidRequest.id_disparo_cotacao_bid_frete_internacional },
      data: { status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO', data_resposta_disparo_cotacao_bid_frete_internacional: new Date() },
    })

    // Verificar se todas as respostas chegaram
    const totalRequests = await (req.prisma as any).disparoCotacaoBidFreteInternacional.count({
      where: { id_cotacao_bid_frete_internacional: bidRequest.id_cotacao_bid_frete_internacional },
    })
    const totalRespondidos = await (req.prisma as any).disparoCotacaoBidFreteInternacional.count({
      where: { id_cotacao_bid_frete_internacional: bidRequest.id_cotacao_bid_frete_internacional, status_disparo_cotacao_bid_frete_internacional: 'RESPONDIDO' },
    })

    // Buscar cotacao para dados de notificação
    const cotacao = await (req.prisma as any).cotacaoBidFreteInternacional.findFirst({ where: { id_cotacao_bid_frete_internacional: bidRequest.id_cotacao_bid_frete_internacional } })

    if (totalRespondidos >= totalRequests) {
      await (req.prisma as any).cotacaoBidFreteInternacional.update({
        where: { id_cotacao_bid_frete_internacional: bidRequest.id_cotacao_bid_frete_internacional },
        data: { status_cotacao_bid_frete_internacional: 'AGUARDANDO_APROVACAO' },
      })
      // Notificar que todas as respostas chegaram
      if (cotacao) {
        const tenantId = (req as any).tenantId
        atividadesIntegration.aguardandoAprovacao(tenantId, cotacao.id_usuario, {
          numero_cotacao_bid_frete_internacional: cotacao.numero_cotacao_bid_frete_internacional,
          total_respostas: totalRespondidos,
        })
      }
    } else {
      await (req.prisma as any).cotacaoBidFreteInternacional.update({
        where: { id_cotacao_bid_frete_internacional: bidRequest.id_cotacao_bid_frete_internacional },
        data: { status_cotacao_bid_frete_internacional: 'EM_COTACAO' },
      })
    }

    // Integrações S2S — notificar cliente que fornecedor respondeu
    if (cotacao) {
      const tenantId = (req as any).tenantId
      const fornecedor = await (req.prisma as any).fornecedorBidFreteInternacional.findFirst({ where: { id_fornecedor_bid_frete_internacional: bidRequest.id_fornecedor_bid_frete_internacional }, select: { nome_fornecedor_bid_frete_internacional: true } })
      notificacoesIntegration.fornecedorRespondeu(tenantId, cotacao.id_usuario, {
        cotacao_numero: cotacao.numero_cotacao_bid_frete_internacional,
        fornecedor_nome: fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'Fornecedor',
        id_cotacao_bid_frete_internacional: cotacao.id_cotacao_bid_frete_internacional,
      })
      historicoIntegration.fornecedorRespondeu(tenantId, fornecedor?.nome_fornecedor_bid_frete_internacional ?? 'Fornecedor', {
        id: cotacao.id_cotacao_bid_frete_internacional,
        numero_cotacao_bid_frete_internacional: cotacao.numero_cotacao_bid_frete_internacional,
      }, valorTotal)
    }

    res.status(201).json({ response })
  } catch (err) {
    next(err)
  }
})

// GET /desempenho — Rating e metricas do fornecedor
router.get('/desempenho', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-id-usuario'] as string
    const fornecedor = await (req.prisma as any).fornecedorBidFreteInternacional.findFirst({
      where: { id_clerk_usuario: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    // Recalcular rating
    const rating = await motorClassificacao.recalcular(req.prisma!, fornecedor.email_fornecedor_bid_frete_internacional)

    // Avaliacoes recentes
    const avaliacoes = await (req.prisma as any).avaliacaoBidFreteInternacional.findMany({
      where: { id_fornecedor_bid_frete_internacional: fornecedor.id_fornecedor_bid_frete_internacional },
      orderBy: { data_criacao_avaliacao_bid_frete_internacional: 'desc' },
      take: 20,
    })

    res.json({ rating, avaliacoes })
  } catch (err) {
    next(err)
  }
})

// GET /meu-billing — Resumo de cobranças do fornecedor
router.get('/meu-billing', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-id-usuario'] as string
    const fornecedor = await (req.prisma as any).fornecedorBidFreteInternacional.findFirst({
      where: { id_clerk_usuario: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    const resumo = await monetizacao.resumoFornecedor(req.prisma!, fornecedor.id_fornecedor_bid_frete_internacional)
    res.json(resumo)
  } catch (err) {
    next(err)
  }
})

export { router as portalRouter }
