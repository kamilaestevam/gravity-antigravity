/**
 * portalPublic.ts — Rotas publicas do Portal do Fornecedor
 * Acesso via token de resposta (sem login, sem internal key)
 * Para fornecedores que recebem email/whatsapp e respondem pelo link
 *
 * GET  /:token_acesso             Ver detalhes da cotacao via token
 * POST /:token_acesso/responder   Responder cotacao via token
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../middleware/isolamento-tenant.js'
import { AppError } from '../lib/erros.js'

const router = Router()

const ResponderPublicSchema = z.object({
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
  })).optional(),
})

// GET /:token_acesso — Ver cotacao via link publico
router.get('/:token_acesso', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bidRequest = await prisma.bidFreteInternacionalPedidoCotacao.findFirst({
      where: { token_resposta_pedido_cotacao_bid_frete_internacional: req.params.token_acesso } as any,
      include: {
        cotacao: {
          select: {
            id_cotacao_bid_frete_internacional: true, numero_cotacao_bid_frete_internacional: true, modal_cotacao_bid_frete_internacional: true, modalidade_cotacao_bid_frete_internacional: true,
            origem_nome_cotacao_bid_frete_internacional: true, origem_pais_cotacao_bid_frete_internacional: true,
            destino_nome_cotacao_bid_frete_internacional: true, destino_pais_cotacao_bid_frete_internacional: true,
            descricao_mercadoria_cotacao_bid_frete_internacional: true, ncm_cotacao_bid_frete_internacional: true, incoterm_cotacao_bid_frete_internacional: true,
            quantidade_cotacao_bid_frete_internacional: true, tipo_container_cotacao_bid_frete_internacional: true, peso_kg_cotacao_bid_frete_internacional: true, cubagem_m3_cotacao_bid_frete_internacional: true,
            data_limite_resposta_cotacao_bid_frete_internacional: true, anonima_cotacao_bid_frete_internacional: true,
          },
        },
        fornecedor: { select: { id_fornecedor_bid_frete_internacional: true, nome_fornecedor_bid_frete_internacional: true } },
      },
    } as any)

    if (!bidRequest) throw new AppError('Link invalido ou expirado', 404, 'TOKEN_INVALID')

    // Verificar expiracao do token
    if ((bidRequest as any).data_expiracao_token_pedido_cotacao_bid_frete_internacional && new Date() > new Date((bidRequest as any).data_expiracao_token_pedido_cotacao_bid_frete_internacional)) {
      throw new AppError('Link expirado', 410, 'TOKEN_EXPIRED')
    }

    if ((bidRequest as any).status_pedido_cotacao_bid_frete_internacional === 'RESPONDIDO') {
      throw new AppError('Cotacao ja respondida', 400, 'ALREADY_RESPONDED')
    }

    // Marcar como visualizado
    await prisma.bidFreteInternacionalPedidoCotacao.update({
      where: { id_pedido_cotacao_bid_frete_internacional: (bidRequest as any).id_pedido_cotacao_bid_frete_internacional },
      data: { status_pedido_cotacao_bid_frete_internacional: 'VISUALIZADO', data_visualizacao_pedido_cotacao_bid_frete_internacional: new Date() } as any,
    } as any)

    res.json({ bidRequest })
  } catch (err) {
    next(err)
  }
})

// POST /:token_acesso/responder — Responder via link publico
router.post('/:token_acesso/responder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ResponderPublicSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const bidRequest = await prisma.bidFreteInternacionalPedidoCotacao.findFirst({
      where: { token_resposta_pedido_cotacao_bid_frete_internacional: req.params.token_acesso } as any,
    } as any)

    if (!bidRequest) throw new AppError('Link invalido', 404)
    if ((bidRequest as any).data_expiracao_token_pedido_cotacao_bid_frete_internacional && new Date() > new Date((bidRequest as any).data_expiracao_token_pedido_cotacao_bid_frete_internacional)) {
      throw new AppError('Link expirado', 410)
    }
    if ((bidRequest as any).status_pedido_cotacao_bid_frete_internacional === 'RESPONDIDO') {
      throw new AppError('Cotacao ja respondida', 400)
    }

    const { taxas, ...responseData } = parsed.data
    const valorTotal = responseData.valor_frete_proposta_bid_frete_internacional + responseData.taxas_origem_proposta_bid_frete_internacional + responseData.taxas_destino_proposta_bid_frete_internacional

    const response = await prisma.bidFreteInternacionalProposta.create({
      data: {
        id_organizacao: (bidRequest as any).id_organizacao,
        id_produto_gravity: 'bid-frete-internacional',
        id_pedido_cotacao_bid_frete_internacional: (bidRequest as any).id_pedido_cotacao_bid_frete_internacional,
        id_cotacao_bid_frete_internacional: (bidRequest as any).id_cotacao_bid_frete_internacional,
        id_fornecedor_bid_frete_internacional: (bidRequest as any).id_fornecedor_bid_frete_internacional,
        ...responseData,
        valor_total_proposta_bid_frete_internacional: valorTotal,
        validade_proposta_bid_frete_internacional: new Date(responseData.validade_proposta_bid_frete_internacional),
        via_email_proposta_bid_frete_internacional: true,
      } as any,
    } as any)

    // Criar detalhes
    if (taxas?.length) {
      await prisma.bidFreteInternacionalTaxa.createMany({
        data: taxas.map(t => ({
          id_organizacao: (bidRequest as any).id_organizacao,
          id_proposta_bid_frete_internacional: (response as any).id_proposta_bid_frete_internacional,
          ...t,
        })),
      } as any)
    }

    // Atualizar request
    await prisma.bidFreteInternacionalPedidoCotacao.update({
      where: { id_pedido_cotacao_bid_frete_internacional: (bidRequest as any).id_pedido_cotacao_bid_frete_internacional },
      data: { status_pedido_cotacao_bid_frete_internacional: 'RESPONDIDO', data_resposta_pedido_cotacao_bid_frete_internacional: new Date() } as any,
    } as any)

    res.status(201).json({ success: true, message: 'Cotacao enviada com sucesso' })
  } catch (err) {
    next(err)
  }
})

export { router as cotacoesPublicasRouter }
