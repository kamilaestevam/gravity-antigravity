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
  emails_por_fornecedor: z.record(z.string(), z.string().email()).optional(),
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
      emails_por_fornecedor: parsed.data.emails_por_fornecedor,
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

    const resultado = await motorBid.dispararCotacaoAberta(req.prisma!, {
      id_cotacao_bid_frete_internacional: parsed.data.id_cotacao_bid_frete_internacional,
      canais: parsed.data.canais,
      id_usuario: userId,
      id_organizacao: req.tenantId!,
      tipos_fornecedor: parsed.data.tipos_fornecedor,
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
