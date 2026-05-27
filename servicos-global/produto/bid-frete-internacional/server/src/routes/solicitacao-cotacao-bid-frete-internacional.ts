/**
 * solicitacao-cotacao-bid-frete-internacional.ts — Disparo de solicitação de cotação
 * POST /disparar          Disparar para fornecedores selecionados
 * GET  /cotacao/:id       Listar disparos de uma cotação
 * POST /cotacao-aberta    Disparar para todos fornecedores ativos (cotação aberta)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { motorBid } from '../services/motor-bid-frete-internacional.js'
import { AppError } from '../lib/erros.js'

const router = Router()

const DispararSchema = z.object({
  id_cotacao_bid_frete_internacional: z.string().min(1),
  fornecedor_ids: z.array(z.string()).min(1),
  canais: z.array(z.enum(['EMAIL', 'WHATSAPP'])).min(1),
})

const CotacaoAbertaSchema = z.object({
  id_cotacao_bid_frete_internacional: z.string().min(1),
  canais: z.array(z.enum(['EMAIL', 'WHATSAPP'])).min(1),
  tipos_fornecedor: z.array(z.enum(['AGENTE_CARGA', 'ARMADOR', 'CIA_AEREA', 'TRANSPORTADORA'])).optional(),
})

router.post('/disparar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = DispararSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')

    const resultado = await motorBid.disparar(req.prisma!, {
      id_cotacao_bid_frete_internacional: parsed.data.id_cotacao_bid_frete_internacional,
      fornecedor_ids: parsed.data.fornecedor_ids,
      canais: parsed.data.canais,
      id_usuario: userId,
      id_organizacao: req.tenantId!,
    })

    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

router.post('/cotacao-aberta', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CotacaoAbertaSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')

    const where: Record<string, unknown> = {
      id_produto_gravity: 'bid-frete-internacional',
      status_fornecedor_bid_frete_internacional: 'ATIVO',
      aceita_cotacao_aberta_fornecedor_bid_frete_internacional: true,
    }
    if (parsed.data.tipos_fornecedor?.length) {
      where.tipo_fornecedor_bid_frete_internacional = { in: parsed.data.tipos_fornecedor }
    }

    const fornecedores = await (req.prisma as any).fornecedorBidFreteInternacional.findMany({
      where,
      select: { id_fornecedor_bid_frete_internacional: true },
    })
    const fornecedor_ids = (fornecedores as Array<{ id_fornecedor_bid_frete_internacional: string }>).map(
      (f) => f.id_fornecedor_bid_frete_internacional,
    )

    if (fornecedor_ids.length === 0) {
      return res.json({ disparos: 0, message: 'Nenhum fornecedor ativo aceita cotacao aberta' })
    }

    const resultado = await motorBid.disparar(req.prisma!, {
      id_cotacao_bid_frete_internacional: parsed.data.id_cotacao_bid_frete_internacional,
      fornecedor_ids,
      canais: parsed.data.canais,
      id_usuario: userId,
      id_organizacao: req.tenantId!,
    })

    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

router.get('/cotacao/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disparo_cotacao_bid_frete_internacional = await (req.prisma as any).disparoCotacaoBidFreteInternacional.findMany({
      where: { id_cotacao_bid_frete_internacional: req.params.id },
      include: {
        fornecedor: {
          select: {
            id_fornecedor_bid_frete_internacional: true,
            nome_fornecedor_bid_frete_internacional: true,
            tipo_fornecedor_bid_frete_internacional: true,
            email_fornecedor_bid_frete_internacional: true,
            whatsapp_fornecedor_bid_frete_internacional: true,
          },
        },
        proposta: {
          select: {
            id_proposta_bid_frete_internacional: true,
            valor_total_proposta_bid_frete_internacional: true,
            dias_transito_proposta_bid_frete_internacional: true,
            status_proposta_bid_frete_internacional: true,
          },
        },
      },
      orderBy: { data_criacao_disparo_cotacao_bid_frete_internacional: 'desc' },
    })

    res.json({ disparo_cotacao_bid_frete_internacional })
  } catch (err) {
    next(err)
  }
})

export { router as solicitacaoCotacaoBidFreteInternacionalRouter }
