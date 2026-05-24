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
import { ratingEngine } from '../services/ratingEngine.js'
import { AppError } from '../lib/errors.js'
import { notificacoesIntegration, historicoIntegration, atividadesIntegration } from '../services/tenantIntegrations.js'
import { monetizacao } from '../services/monetizacao.js'

const router = Router()

const ResponderSchema = z.object({
  moeda: z.string().default('USD'),
  valor_frete: z.number().positive(),
  taxas_origem: z.number().min(0).default(0),
  taxas_destino: z.number().min(0).default(0),
  transit_time_dias: z.number().int().positive(),
  free_time_dias: z.number().int().optional(),
  transbordos: z.number().int().min(0).default(0),
  escalas: z.string().optional(),
  observacoes: z.string().optional(),
  validade_cotacao: z.string().datetime(),
  detalhes_taxas: z.array(z.object({
    tipo: z.enum(['origem', 'destino', 'frete']),
    nome: z.string(),
    valor: z.number(),
    moeda: z.string().default('USD'),
  })).optional(),
})

// GET /dashboard — Dashboard do fornecedor
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401)

    // Buscar fornecedor vinculado a este user
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.findFirst({
      where: { clerk_user_id: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado para este usuario', 404)

    const [pendentes, respondidas, aprovadas, totalRequests] = await Promise.all([
      (req.prisma as any).freteIntBidPedidoCotacoes.count({
        where: { fornecedor_id: fornecedor.id, status: { in: ['ENVIADO', 'VISUALIZADO'] } },
      }),
      (req.prisma as any).freteIntBidPropostas.count({
        where: { fornecedor_id: fornecedor.id },
      }),
      (req.prisma as any).freteIntBidPropostas.count({
        where: { fornecedor_id: fornecedor.id, status: 'APROVADA' },
      }),
      (req.prisma as any).freteIntBidPedidoCotacoes.count({
        where: { fornecedor_id: fornecedor.id },
      }),
    ])

    // Rating global
    let rating = null
    try {
      rating = await (req.prisma as any).freteIntBidClassificacaoFornecedores.findUnique({
        where: { fornecedor_email: fornecedor.email },
      })
    } catch { /* pode nao existir */ }

    res.json({
      fornecedor: { id: fornecedor.id, nome: fornecedor.nome, tipo: fornecedor.tipo },
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
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.findFirst({
      where: { clerk_user_id: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    const requests = await (req.prisma as any).freteIntBidPedidoCotacoes.findMany({
      where: {
        fornecedor_id: fornecedor.id,
        status: { in: ['ENVIADO', 'VISUALIZADO', 'PENDENTE'] },
      },
      include: {
        cotacao: {
          select: {
            id_cotacao_bid_frete: true, numero_cotacao_bid_frete: true, modal: true, modalidade: true,
            // TODO: lookup from Cadastros
            pais_origem_cotacao_bid_frete: true,
            // TODO: lookup from Cadastros
            pais_destino_cotacao_bid_frete: true,
            descricao_mercadoria_cotacao_bid_frete: true, ncm_cotacao_bid_frete: true, incoterm_cotacao_bid_frete: true,
            quantidade_volumes_cotacao_bid_frete: true, tipo_container: true, peso_kg_cotacao_bid_frete: true,
            data_limite_resposta_cotacao_bid_frete: true, anonima_cotacao_bid_frete: true,
            valor_alvo_cotacao_bid_frete: true,
          },
        },
      },
      orderBy: { criado_em_cotacao_bid_frete: 'desc' },
    })

    // Marcar como visualizado
    type RequestRow = { id: string; status: string }
    const pendentesIds = (requests as RequestRow[])
      .filter((r) => r.status === 'ENVIADO' || r.status === 'PENDENTE')
      .map((r) => r.id)

    if (pendentesIds.length > 0) {
      await (req.prisma as any).freteIntBidPedidoCotacoes.updateMany({
        where: { id: { in: pendentesIds } },
        data: { status: 'VISUALIZADO', visualizado_em: new Date() },
      })
    }

    res.json({ requests })
  } catch (err) {
    next(err)
  }
})

// GET /respostas — Historico de respostas
router.get('/respostas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-id-usuario'] as string
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.findFirst({
      where: { clerk_user_id: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string }
    const skip = (Number(page) - 1) * Number(limit)

    const [respostas, total] = await Promise.all([
      (req.prisma as any).freteIntBidPropostas.findMany({
        where: { fornecedor_id: fornecedor.id },
        include: {
          cotacao: {
            select: { id_cotacao_bid_frete: true, numero_cotacao_bid_frete: true, modal: true, status_cotacao_bid_frete: true },
            // TODO: lookup from Cadastros for porto names
          },
          detalhes_taxas: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      (req.prisma as any).freteIntBidPropostas.count({ where: { fornecedor_id: fornecedor.id } }),
    ])

    res.json({ respostas, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } })
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

    const bidRequest = await (req.prisma as any).freteIntBidPedidoCotacoes.findFirst({
      where: { id: req.params.bidRequestId },
    })

    if (!bidRequest) throw new AppError('BidRequest nao encontrado', 404)
    if (bidRequest.status === 'RESPONDIDO') throw new AppError('Cotacao ja respondida', 400)

    const { detalhes_taxas, ...responseData } = parsed.data

    // Calcular valor total
    const valorTotal = responseData.valor_frete + responseData.taxas_origem + responseData.taxas_destino

    // Criar BidResponse
    const response = await (req.prisma as any).freteIntBidPropostas.create({
      data: {
        product_id: 'bid-frete',
        user_id: userId,
        bid_request_id: bidRequest.id,
        cotacao_id: bidRequest.cotacao_id,
        fornecedor_id: bidRequest.fornecedor_id,
        ...responseData,
        valor_total: valorTotal,
        validade_cotacao: new Date(responseData.validade_cotacao),
        via_portal: true,
      },
    })

    // Criar detalhes de taxas
    if (detalhes_taxas?.length) {
      await (req.prisma as any).freteIntBidPropostasTaxasCambio.createMany({
        data: detalhes_taxas.map(t => ({
          response_id: response.id,
          ...t,
        })),
      })
    }

    // Atualizar BidRequest
    await (req.prisma as any).freteIntBidPedidoCotacoes.update({
      where: { id: bidRequest.id },
      data: { status: 'RESPONDIDO', respondido_em: new Date() },
    })

    // Verificar se todas as respostas chegaram
    const totalRequests = await (req.prisma as any).freteIntBidPedidoCotacoes.count({
      where: { cotacao_id: bidRequest.cotacao_id },
    })
    const totalRespondidos = await (req.prisma as any).freteIntBidPedidoCotacoes.count({
      where: { cotacao_id: bidRequest.cotacao_id, status: 'RESPONDIDO' },
    })

    // Buscar cotacao para dados de notificação
    const cotacao = await (req.prisma as any).freteIntBidCotacoes.findFirst({ where: { id_cotacao_bid_frete: bidRequest.cotacao_id } })

    if (totalRespondidos >= totalRequests) {
      await (req.prisma as any).freteIntBidCotacoes.update({
        where: { id_cotacao_bid_frete: bidRequest.cotacao_id },
        data: { status_cotacao_bid_frete: 'AGUARDANDO_APROVACAO' },
      })
      // Notificar que todas as respostas chegaram
      if (cotacao) {
        const tenantId = (req as any).tenantId
        atividadesIntegration.aguardandoAprovacao(tenantId, cotacao.id_usuario, {
          numero: cotacao.numero_cotacao_bid_frete,
          total_respostas: totalRespondidos,
        })
      }
    } else {
      await (req.prisma as any).freteIntBidCotacoes.update({
        where: { id_cotacao_bid_frete: bidRequest.cotacao_id },
        data: { status_cotacao_bid_frete: 'EM_COTACAO' },
      })
    }

    // Integrações S2S — notificar cliente que fornecedor respondeu
    if (cotacao) {
      const tenantId = (req as any).tenantId
      const fornecedor = await (req.prisma as any).freteIntBidFornecedores.findFirst({ where: { id: bidRequest.fornecedor_id }, select: { nome: true } })
      notificacoesIntegration.fornecedorRespondeu(tenantId, cotacao.id_usuario, {
        cotacao_numero: cotacao.numero_cotacao_bid_frete,
        fornecedor_nome: fornecedor?.nome ?? 'Fornecedor',
        cotacao_id: cotacao.id_cotacao_bid_frete,
      })
      historicoIntegration.fornecedorRespondeu(tenantId, fornecedor?.nome ?? 'Fornecedor', {
        id_cotacao_bid_frete: cotacao.id_cotacao_bid_frete,
        numero_cotacao_bid_frete: cotacao.numero_cotacao_bid_frete,
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
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.findFirst({
      where: { clerk_user_id: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    // Recalcular rating
    const rating = await ratingEngine.recalcular(req.prisma!, fornecedor.email)

    // Avaliacoes recentes
    const avaliacoes = await (req.prisma as any).freteIntBidFornecedoresAvaliacoes.findMany({
      where: { fornecedor_id: fornecedor.id },
      orderBy: { created_at: 'desc' },
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
    const fornecedor = await (req.prisma as any).freteIntBidFornecedores.findFirst({
      where: { clerk_user_id: userId },
    })

    if (!fornecedor) throw new AppError('Fornecedor nao encontrado', 404)

    const resumo = await monetizacao.resumoFornecedor(req.prisma!, fornecedor.id)
    res.json(resumo)
  } catch (err) {
    next(err)
  }
})

export { router as portalRouter }
