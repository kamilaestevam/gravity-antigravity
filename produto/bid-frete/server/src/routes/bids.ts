/**
 * bids.ts — Rotas de Disparo de BIDs
 * POST /disparar          Disparar BIDs para fornecedores
 * GET  /cotacao/:id       Listar BidRequests de uma cotacao
 * POST /cotacao-aberta    Disparar para cotacao aberta (todos fornecedores ativos)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { bidEngine } from '../services/bidEngine.js'
import { AppError } from '../lib/errors.js'

const router = Router()

const DispararSchema = z.object({
  cotacao_id: z.string().min(1),
  fornecedor_ids: z.array(z.string()).min(1),
  canais: z.array(z.enum(['EMAIL', 'WHATSAPP'])).min(1),
})

const CotacaoAbertaSchema = z.object({
  cotacao_id: z.string().min(1),
  canais: z.array(z.enum(['EMAIL', 'WHATSAPP'])).min(1),
  tipos_fornecedor: z.array(z.enum(['AGENTE_CARGA', 'ARMADOR', 'CIA_AEREA', 'TRANSPORTADORA'])).optional(),
})

// POST /disparar — Disparar BIDs direcionados
router.post('/disparar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = DispararSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-user-id'] as string
    if (!userId) throw new AppError('x-user-id obrigatorio', 401, 'UNAUTHORIZED')

    const resultado = await bidEngine.disparar(req.prisma!, {
      cotacao_id: parsed.data.cotacao_id,
      fornecedor_ids: parsed.data.fornecedor_ids,
      canais: parsed.data.canais,
      user_id: userId,
      tenant_id: req.tenantId!,
    })

    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

// POST /cotacao-aberta — Disparar para todos os fornecedores ativos
router.post('/cotacao-aberta', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CotacaoAbertaSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Dados invalidos', 400, 'VALIDATION_ERROR')

    const userId = req.headers['x-user-id'] as string
    if (!userId) throw new AppError('x-user-id obrigatorio', 401, 'UNAUTHORIZED')

    // Buscar todos os fornecedores ativos que aceitam cotacao aberta
    const where: Record<string, unknown> = {
      product_id: 'bid-frete',
      status: 'ATIVO',
      aceita_cotacao_aberta: true,
    }
    if (parsed.data.tipos_fornecedor?.length) {
      where.tipo = { in: parsed.data.tipos_fornecedor }
    }

    const fornecedores = await (req.prisma as any).freteIntBidFornecedores.findMany({ where, select: { id: true } })
    const fornecedor_ids = (fornecedores as Array<{ id: string }>).map((f) => f.id)

    if (fornecedor_ids.length === 0) {
      return res.json({ disparos: 0, message: 'Nenhum fornecedor ativo aceita cotacao aberta' })
    }

    const resultado = await bidEngine.disparar(req.prisma!, {
      cotacao_id: parsed.data.cotacao_id,
      fornecedor_ids,
      canais: parsed.data.canais,
      user_id: userId,
      tenant_id: req.tenantId!,
    })

    res.json(resultado)
  } catch (err) {
    next(err)
  }
})

// GET /cotacao/:id — Listar BidRequests de uma cotacao
router.get('/cotacao/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await (req.prisma as any).freteIntBidPedidoCotacoes.findMany({
      where: { cotacao_id: req.params.id },
      include: {
        fornecedor: { select: { id: true, nome: true, tipo: true, email: true, whatsapp: true } },
        response: {
          select: { id: true, valor_total: true, transit_time_dias: true, status: true },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    res.json({ requests })
  } catch (err) {
    next(err)
  }
})

export { router as bidsRouter }
