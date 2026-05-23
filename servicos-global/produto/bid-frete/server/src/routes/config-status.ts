/**
 * config-status.ts — CRUD de StatusCotacaoBidFrete (Configuração dinâmica)
 * GET    /                 Listar status ativos da organização (lazy seed)
 * POST   /                 Criar status customizado
 * PATCH  /:id              Editar rótulo, cor, ícone
 * DELETE /:id              Excluir status (apenas não-sistema)
 * PATCH  /reordenar        Reordenar todos os status
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/errors.js'
import { seedStatusPadrao } from '../services/seedStatusPadrao.js'

const router = Router()

// --- Schemas de validação (Zod) ---

const CriarStatusSchema = z.object({
  nome_status_cotacao_bid_frete: z.string().min(1).max(50),
  rotulo_status_cotacao_bid_frete: z.string().min(1).max(100),
  cor_status_cotacao_bid_frete: z.string().min(4).max(9),
  icone_status_cotacao_bid_frete: z.string().max(50).optional(),
})

const EditarStatusSchema = z.object({
  rotulo_status_cotacao_bid_frete: z.string().min(1).max(100).optional(),
  cor_status_cotacao_bid_frete: z.string().min(4).max(9).optional(),
  icone_status_cotacao_bid_frete: z.string().max(50).nullable().optional(),
  gerenciado_sistema_status_cotacao_bid_frete: z.boolean().optional(),
})

const ReordenarStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

// --- GET / — Listar status da organização (com lazy seed) ---
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    // Lazy seed: cria os 9 status canônicos se não existir nenhum
    const count = await (req.prisma as any).statusCotacaoBidFrete.count({
      where: { id_organizacao: idOrganizacao },
    })

    if (count === 0) {
      await seedStatusPadrao(req.prisma, idOrganizacao)
    }

    const statusList = await (req.prisma as any).statusCotacaoBidFrete.findMany({
      where: { id_organizacao: idOrganizacao },
      orderBy: { ordem_status_cotacao_bid_frete: 'asc' },
    })

    res.json({ status: statusList })
  } catch (err) {
    next(err)
  }
})

// --- POST / — Criar status customizado ---
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CriarStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    // Pegar a maior ordem atual para colocar no final
    const ultimo = await (req.prisma as any).statusCotacaoBidFrete.findFirst({
      where: { id_organizacao: idOrganizacao },
      orderBy: { ordem_status_cotacao_bid_frete: 'desc' },
      select: { ordem_status_cotacao_bid_frete: true },
    })
    const proximaOrdem = (ultimo?.ordem_status_cotacao_bid_frete ?? 0) + 1

    const status = await (req.prisma as any).statusCotacaoBidFrete.create({
      data: {
        id_organizacao: idOrganizacao,
        nome_status_cotacao_bid_frete: parsed.data.nome_status_cotacao_bid_frete,
        rotulo_status_cotacao_bid_frete: parsed.data.rotulo_status_cotacao_bid_frete,
        cor_status_cotacao_bid_frete: parsed.data.cor_status_cotacao_bid_frete,
        icone_status_cotacao_bid_frete: parsed.data.icone_status_cotacao_bid_frete ?? null,
        ordem_status_cotacao_bid_frete: proximaOrdem,
        padrao_status_cotacao_bid_frete: false,
        gerenciado_sistema_status_cotacao_bid_frete: false,
      },
    })

    res.status(201).json({ status })
  } catch (err: unknown) {
    // Tratar unicidade duplicada
    if (err instanceof Error && 'code' in err && (err as any).code === 'P2002') {
      return next(new AppError('Ja existe um status com esse nome nesta organizacao', 409, 'DUPLICATE'))
    }
    next(err)
  }
})

// --- PATCH /reordenar — Reordenar status (DEVE vir ANTES de /:id) ---
router.patch('/reordenar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ReordenarStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('Lista de IDs invalida', 400, 'VALIDATION_ERROR')
    }

    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    // Atualizar ordem em transação
    const updates = parsed.data.ids.map((id, index) =>
      (req.prisma as any).statusCotacaoBidFrete.updateMany({
        where: { id_status_cotacao_bid_frete: id, id_organizacao: idOrganizacao },
        data: { ordem_status_cotacao_bid_frete: index + 1 },
      })
    )

    await (req.prisma as any).$transaction(updates)

    // Retornar lista atualizada
    const statusList = await (req.prisma as any).statusCotacaoBidFrete.findMany({
      where: { id_organizacao: idOrganizacao },
      orderBy: { ordem_status_cotacao_bid_frete: 'asc' },
    })

    res.json({ status: statusList })
  } catch (err) {
    next(err)
  }
})

// --- PATCH /:id — Editar status ---
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = EditarStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(`Dados invalidos: ${parsed.error.issues.map(i => i.message).join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    const existing = await (req.prisma as any).statusCotacaoBidFrete.findFirst({
      where: { id_status_cotacao_bid_frete: req.params.id, id_organizacao: idOrganizacao },
    })
    if (!existing) throw new AppError('Status nao encontrado', 404, 'NOT_FOUND')

    const status = await (req.prisma as any).statusCotacaoBidFrete.update({
      where: { id_status_cotacao_bid_frete: req.params.id },
      data: parsed.data,
    })

    res.json({ status })
  } catch (err) {
    next(err)
  }
})

// --- DELETE /:id — Excluir status (todos editáveis pelo usuário) ---
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrganizacao = req.headers['x-id-organizacao'] as string
    if (!idOrganizacao) throw new AppError('x-id-organizacao obrigatorio', 401, 'UNAUTHORIZED')

    const existing = await (req.prisma as any).statusCotacaoBidFrete.findFirst({
      where: { id_status_cotacao_bid_frete: req.params.id, id_organizacao: idOrganizacao },
    })
    if (!existing) throw new AppError('Status nao encontrado', 404, 'NOT_FOUND')

    await (req.prisma as any).statusCotacaoBidFrete.delete({
      where: { id_status_cotacao_bid_frete: req.params.id },
    })

    res.json({ deleted: true })
  } catch (err) {
    next(err)
  }
})

export { router as configStatusRouter }
