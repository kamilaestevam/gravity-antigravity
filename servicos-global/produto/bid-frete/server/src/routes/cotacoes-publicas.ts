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
import { prisma } from '../middleware/tenantIsolation.js'
import { AppError } from '../lib/errors.js'

const router = Router()

const ResponderPublicSchema = z.object({
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

// GET /:token_acesso — Ver cotacao via link publico
router.get('/:token_acesso', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bidRequest = await prisma.freteIntBidPedidoCotacoes.findFirst({
      where: { token_resposta: req.params.token_acesso } as any,
      include: {
        cotacao: {
          select: {
            id: true, numero: true, modal: true, modalidade: true,
            origem_nome: true, origem_pais: true,
            destino_nome: true, destino_pais: true,
            descricao_mercadoria: true, ncm: true, incoterm: true,
            quantidade: true, tipo_container: true, peso_kg: true, cubagem_m3: true,
            data_limite_resposta: true, ocultar_nome_empresa: true,
          },
        },
        fornecedor: { select: { id: true, nome: true } },
      },
    } as any)

    if (!bidRequest) throw new AppError('Link invalido ou expirado', 404, 'TOKEN_INVALID')

    // Verificar expiracao do token
    if ((bidRequest as any).token_expira_em && new Date() > new Date((bidRequest as any).token_expira_em)) {
      throw new AppError('Link expirado', 410, 'TOKEN_EXPIRED')
    }

    if ((bidRequest as any).status === 'RESPONDIDO') {
      throw new AppError('Cotacao ja respondida', 400, 'ALREADY_RESPONDED')
    }

    // Marcar como visualizado
    await prisma.freteIntBidPedidoCotacoes.update({
      where: { id: (bidRequest as any).id },
      data: { status: 'VISUALIZADO', visualizado_em: new Date() } as any,
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

    const bidRequest = await prisma.freteIntBidPedidoCotacoes.findFirst({
      where: { token_resposta: req.params.token_acesso } as any,
    } as any)

    if (!bidRequest) throw new AppError('Link invalido', 404)
    if ((bidRequest as any).token_expira_em && new Date() > new Date((bidRequest as any).token_expira_em)) {
      throw new AppError('Link expirado', 410)
    }
    if ((bidRequest as any).status === 'RESPONDIDO') {
      throw new AppError('Cotacao ja respondida', 400)
    }

    const { detalhes_taxas, ...responseData } = parsed.data
    const valorTotal = responseData.valor_frete + responseData.taxas_origem + responseData.taxas_destino

    const response = await prisma.freteIntBidPropostas.create({
      data: {
        id_organizacao: (bidRequest as any).id_organizacao,
        product_id: 'bid-frete',
        bid_request_id: (bidRequest as any).id,
        cotacao_id: (bidRequest as any).cotacao_id,
        fornecedor_id: (bidRequest as any).fornecedor_id,
        ...responseData,
        valor_total: valorTotal,
        validade_cotacao: new Date(responseData.validade_cotacao),
        via_email: true,
      } as any,
    } as any)

    // Criar detalhes
    if (detalhes_taxas?.length) {
      await prisma.freteIntBidPropostasTaxasCambio.createMany({
        data: detalhes_taxas.map(t => ({
          id_organizacao: (bidRequest as any).id_organizacao,
          response_id: (response as any).id,
          ...t,
        })),
      } as any)
    }

    // Atualizar request
    await prisma.freteIntBidPedidoCotacoes.update({
      where: { id: (bidRequest as any).id },
      data: { status: 'RESPONDIDO', respondido_em: new Date() } as any,
    } as any)

    res.status(201).json({ success: true, message: 'Cotacao enviada com sucesso' })
  } catch (err) {
    next(err)
  }
})

export { router as cotacoesPublicasRouter }
