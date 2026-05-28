/**
 * bids-frete-internacional.ts — CRUD de BID (conjunto de pedidos de cotação)
 */
import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/erros.js'
import {
  gerarNumeroBidFreteInternacional,
  sincronizarResumoBid,
} from '../services/agregar-resumo-bid-frete-internacional.js'

const router = Router()

const CriarBidSchema = z.object({
  referencia_interna_bid_bid_frete_internacional: z.string().optional(),
  status_bid_bid_frete_internacional: z.enum([
    'RASCUNHO',
    'EM_ANDAMENTO',
    'PARCIALMENTE_CONCLUIDO',
    'CONCLUIDO',
    'CANCELADO',
  ]).optional(),
  ids_cotacao_bid_frete_internacional: z.array(z.string().min(1)).optional(),
})

const AtualizarBidSchema = z.object({
  referencia_interna_bid_bid_frete_internacional: z.string().nullable().optional(),
  status_bid_bid_frete_internacional: z.enum([
    'RASCUNHO',
    'EM_ANDAMENTO',
    'PARCIALMENTE_CONCLUIDO',
    'CONCLUIDO',
    'CANCELADO',
  ]).optional(),
})

const VincularCotacoesSchema = z.object({
  ids_cotacao_bid_frete_internacional: z.array(z.string().min(1)).min(1),
})

const includeCotacoesLista = {
  cotacoes: {
    orderBy: { data_criacao_cotacao_bid_frete_internacional: 'desc' as const },
    include: {
      propostas: {
        select: {
          id_proposta_bid_frete_internacional: true,
          id_fornecedor_bid_frete_internacional: true,
          valor_total_proposta_bid_frete_internacional: true,
          dias_transito_proposta_bid_frete_internacional: true,
          status_proposta_bid_frete_internacional: true,
          classificacao_valor_proposta_bid_frete_internacional: true,
          classificacao_transito_proposta_bid_frete_internacional: true,
        },
      },
    },
  },
}

function resolverIdWorkspace(req: Request): string | undefined {
  const header = req.headers['x-id-workspace'] as string | undefined
  const id = header?.trim()
  return id || undefined
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bids = await (req.prisma as any).bidFreteInternacional.findMany({
      where: { id_produto_gravity: 'bid-frete-internacional' },
      orderBy: { data_criacao_bid_bid_frete_internacional: 'desc' },
      include: includeCotacoesLista,
    })
    res.json({ bids_frete_internacional: bids })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bid = await (req.prisma as any).bidFreteInternacional.findFirst({
      where: { id_bid_bid_frete_internacional: req.params.id },
      include: includeCotacoesLista,
    })
    if (!bid) throw new AppError('BID nao encontrado', 404, 'NOT_FOUND')
    res.json({ bid_frete_internacional: bid })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CriarBidSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const userId = req.headers['x-id-usuario'] as string
    if (!userId) throw new AppError('x-id-usuario obrigatorio', 401, 'UNAUTHORIZED')

    const idWorkspace = resolverIdWorkspace(req)

    const bid = await (req.prisma as any).bidFreteInternacional.create({
      data: {
        id_produto_gravity: 'bid-frete-internacional',
        id_usuario: userId,
        ...(idWorkspace ? { id_workspace: idWorkspace } : {}),
        numero_bid_bid_frete_internacional: gerarNumeroBidFreteInternacional(),
        referencia_interna_bid_bid_frete_internacional: parsed.data.referencia_interna_bid_bid_frete_internacional ?? null,
        status_bid_bid_frete_internacional: parsed.data.status_bid_bid_frete_internacional ?? 'RASCUNHO',
      },
    })

    if (parsed.data.ids_cotacao_bid_frete_internacional?.length) {
      await (req.prisma as any).cotacaoBidFreteInternacional.updateMany({
        where: {
          id_cotacao_bid_frete_internacional: { in: parsed.data.ids_cotacao_bid_frete_internacional },
          id_bid_bid_frete_internacional: null,
        },
        data: { id_bid_bid_frete_internacional: bid.id_bid_bid_frete_internacional },
      })
      await sincronizarResumoBid(req.prisma, bid.id_bid_bid_frete_internacional)
    }

    const completo = await (req.prisma as any).bidFreteInternacional.findFirst({
      where: { id_bid_bid_frete_internacional: bid.id_bid_bid_frete_internacional },
      include: includeCotacoesLista,
    })

    res.status(201).json({ bid_frete_internacional: completo })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AtualizarBidSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const existing = await (req.prisma as any).bidFreteInternacional.findFirst({
      where: { id_bid_bid_frete_internacional: req.params.id },
    })
    if (!existing) throw new AppError('BID nao encontrado', 404, 'NOT_FOUND')

    const bid = await (req.prisma as any).bidFreteInternacional.update({
      where: { id_bid_bid_frete_internacional: req.params.id },
      data: parsed.data,
      include: includeCotacoesLista,
    })

    res.json({ bid_frete_internacional: bid })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/cotacoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = VincularCotacoesSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const existing = await (req.prisma as any).bidFreteInternacional.findFirst({
      where: { id_bid_bid_frete_internacional: req.params.id },
    })
    if (!existing) throw new AppError('BID nao encontrado', 404, 'NOT_FOUND')

    const result = await (req.prisma as any).cotacaoBidFreteInternacional.updateMany({
      where: {
        id_cotacao_bid_frete_internacional: { in: parsed.data.ids_cotacao_bid_frete_internacional },
        OR: [{ id_bid_bid_frete_internacional: null }, { id_bid_bid_frete_internacional: req.params.id }],
      },
      data: { id_bid_bid_frete_internacional: req.params.id },
    })

    await sincronizarResumoBid(req.prisma, req.params.id)

    const bid = await (req.prisma as any).bidFreteInternacional.findFirst({
      where: { id_bid_bid_frete_internacional: req.params.id },
      include: includeCotacoesLista,
    })

    res.json({ bid_frete_internacional: bid, vinculadas: result.count })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/cancelar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await (req.prisma as any).bidFreteInternacional.findFirst({
      where: { id_bid_bid_frete_internacional: req.params.id },
    })
    if (!existing) throw new AppError('BID nao encontrado', 404, 'NOT_FOUND')

    await (req.prisma as any).$transaction([
      (req.prisma as any).bidFreteInternacional.update({
        where: { id_bid_bid_frete_internacional: req.params.id },
        data: { status_bid_bid_frete_internacional: 'CANCELADO' },
      }),
      (req.prisma as any).cotacaoBidFreteInternacional.updateMany({
        where: { id_bid_bid_frete_internacional: req.params.id },
        data: { status_cotacao_bid_frete_internacional: 'CANCELADA' },
      }),
    ])

    const bid = await (req.prisma as any).bidFreteInternacional.findFirst({
      where: { id_bid_bid_frete_internacional: req.params.id },
      include: includeCotacoesLista,
    })

    res.json({ bid_frete_internacional: bid })
  } catch (err) {
    next(err)
  }
})

export { router as bidsFreteInternacionalRouter }
