/**
 * config-status.ts — CRUD StatusCotacaoConfigBidFreteInternacional (kanban)
 */
import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/erros.js'
import { seedStatusPadrao } from '../services/seedStatusPadrao.js'

const router = Router()

const CriarStatusSchema = z.object({
  nome_status_cotacao_config_bid_frete_internacional: z.string().min(1).max(50),
  rotulo_status_cotacao_config_bid_frete_internacional: z.string().min(1).max(100),
  cor_status_cotacao_config_bid_frete_internacional: z.string().min(4).max(9),
  icone_status_cotacao_config_bid_frete_internacional: z.string().max(50).optional(),
})

const EditarStatusSchema = z.object({
  rotulo_status_cotacao_config_bid_frete_internacional: z.string().min(1).max(100).optional(),
  cor_status_cotacao_config_bid_frete_internacional: z.string().min(4).max(9).optional(),
  icone_status_cotacao_config_bid_frete_internacional: z.string().max(50).nullable().optional(),
  gerenciado_sistema_status_cotacao_config_bid_frete_internacional: z.boolean().optional(),
})

const ReordenarStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    const count = await (req.prisma as any).statusCotacaoConfigBidFreteInternacional.count({
      where: { id_organizacao: idOrganizacao },
    })

    if (count === 0) {
      await seedStatusPadrao(req.prisma as any, idOrganizacao)
    }

    const statusList = await (req.prisma as any).statusCotacaoConfigBidFreteInternacional.findMany({
      where: { id_organizacao: idOrganizacao },
      orderBy: { ordem_status_cotacao_config_bid_frete_internacional: 'asc' },
    })

    res.json({ status: statusList })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CriarStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    const ultimo = await (req.prisma as any).statusCotacaoConfigBidFreteInternacional.findFirst({
      where: { id_organizacao: idOrganizacao },
      orderBy: { ordem_status_cotacao_config_bid_frete_internacional: 'desc' },
      select: { ordem_status_cotacao_config_bid_frete_internacional: true },
    })
    const proximaOrdem = (ultimo?.ordem_status_cotacao_config_bid_frete_internacional ?? 0) + 1

    const status = await (req.prisma as any).statusCotacaoConfigBidFreteInternacional.create({
      data: {
        id_organizacao: idOrganizacao,
        ...parsed.data,
        icone_status_cotacao_config_bid_frete_internacional: parsed.data.icone_status_cotacao_config_bid_frete_internacional ?? null,
        ordem_status_cotacao_config_bid_frete_internacional: proximaOrdem,
        padrao_status_cotacao_config_bid_frete_internacional: false,
        gerenciado_sistema_status_cotacao_config_bid_frete_internacional: false,
      },
    })

    res.status(201).json({ status })
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as { code?: string }).code === 'P2002') {
      return next(new AppError('Ja existe um status com esse nome nesta organizacao', 409, 'DUPLICATE'))
    }
    next(err)
  }
})

router.patch('/reordenar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ReordenarStatusSchema.safeParse(req.body)
    if (!parsed.success) throw new AppError('Lista de IDs invalida', 400, 'VALIDATION_ERROR')

    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    const updates = parsed.data.ids.map((id, index) =>
      (req.prisma as any).statusCotacaoConfigBidFreteInternacional.updateMany({
        where: { id_status_cotacao_config_bid_frete_internacional: id, id_organizacao: idOrganizacao },
        data: { ordem_status_cotacao_config_bid_frete_internacional: index + 1 },
      }),
    )

    await (req.prisma as any).$transaction(updates)

    const statusList = await (req.prisma as any).statusCotacaoConfigBidFreteInternacional.findMany({
      where: { id_organizacao: idOrganizacao },
      orderBy: { ordem_status_cotacao_config_bid_frete_internacional: 'asc' },
    })

    res.json({ status: statusList })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = EditarStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    const existing = await (req.prisma as any).statusCotacaoConfigBidFreteInternacional.findFirst({
      where: { id_status_cotacao_config_bid_frete_internacional: req.params.id, id_organizacao: idOrganizacao },
    })
    if (!existing) throw new AppError('Status nao encontrado', 404, 'NOT_FOUND')

    const status = await (req.prisma as any).statusCotacaoConfigBidFreteInternacional.update({
      where: { id_status_cotacao_config_bid_frete_internacional: req.params.id },
      data: parsed.data,
    })

    res.json({ status })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    const existing = await (req.prisma as any).statusCotacaoConfigBidFreteInternacional.findFirst({
      where: { id_status_cotacao_config_bid_frete_internacional: req.params.id, id_organizacao: idOrganizacao },
    })
    if (!existing) throw new AppError('Status nao encontrado', 404, 'NOT_FOUND')

    if (existing.gerenciado_sistema_status_cotacao_config_bid_frete_internacional) {
      throw new AppError('Status gerenciado pelo sistema nao pode ser excluido', 400, 'SYSTEM_STATUS')
    }

    await (req.prisma as any).statusCotacaoConfigBidFreteInternacional.delete({
      where: { id_status_cotacao_config_bid_frete_internacional: req.params.id },
    })

    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

export { router as configStatusRouter }
