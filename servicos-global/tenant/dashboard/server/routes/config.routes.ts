import { Router } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'
import { AppError } from '../lib/errors.js'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { tenantId: string; userId: string }
    prisma?: PrismaClient
  }
}

const configRouter = Router()

const createConfigSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  product_id: z.string().optional(),
  mode: z.enum(['PRODUCT', 'GENERAL']),
  layout: z.unknown().optional(),
  filters: z.unknown().optional(),
})

const updateConfigSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  layout: z.unknown().optional(),
  filters: z.unknown().optional(),
  is_default: z.boolean().optional(),
})

const listConfigQuerySchema = z.object({
  product_id: z.string().optional(),
})

// GET / — lista configs do usuário
configRouter.get('/', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { product_id } = listConfigQuerySchema.parse(req.query)

    const where: Record<string, unknown> = { user_id: userId }
    if (product_id) {
      where.product_id = product_id
    }

    const configs = await req.prisma!.dashboardConfig.findMany({
      where,
      orderBy: [{ is_default: 'desc' }, { updated_at: 'desc' }],
    })

    res.json({ data: configs })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// POST / — cria novo dashboard config
configRouter.post('/', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const body = createConfigSchema.parse(req.body)

    // Se is_default vier como true no futuro, já preparamos o campo
    // Por ora, o primeiro config criado para um product_id+user vira default automaticamente
    const existingCount = await req.prisma!.dashboardConfig.findMany({
      where: {
        user_id: userId,
        product_id: body.product_id ?? null,
      },
    })

    const shouldBeDefault = existingCount.length === 0

    const config = await req.prisma!.dashboardConfig.create({
      data: {
        user_id: userId,
        product_id: body.product_id ?? null,
        mode: body.mode,
        name: body.name ?? (body.mode === 'GENERAL' ? 'Meu Dashboard' : 'Dashboard'),
        layout: (body.layout as object) ?? {},
        filters: (body.filters as object) ?? {},
        is_default: shouldBeDefault,
      },
    })

    res.status(201).json({ data: config })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// GET /:id — busca config por id
configRouter.get('/:id', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { id } = req.params

    const config = await req.prisma!.dashboardConfig.findFirst({
      where: { id, user_id: userId },
      include: { widgets: true },
    })

    if (!config) {
      throw new AppError('Dashboard config não encontrado', 404, 'NOT_FOUND')
    }

    res.json({ data: config })
  } catch (error) {
    next(error)
  }
})

// PUT /:id — atualiza layout/name/filters/is_default
configRouter.put('/:id', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { id } = req.params
    const body = updateConfigSchema.parse(req.body)

    const existing = await req.prisma!.dashboardConfig.findFirst({
      where: { id, user_id: userId },
    })

    if (!existing) {
      throw new AppError('Dashboard config não encontrado', 404, 'NOT_FOUND')
    }

    // Se is_default=true, remove default dos outros configs do mesmo user+product_id
    if (body.is_default === true) {
      await req.prisma!.dashboardConfig.updateMany({
        where: {
          tenant_id: tenantId,
          user_id: userId,
          product_id: (existing as Record<string, unknown>).product_id as string | undefined,
          id: { not: id },
        },
        data: { is_default: false },
      })
    }

    const updated = await req.prisma!.dashboardConfig.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.layout !== undefined && { layout: body.layout as object }),
        ...(body.filters !== undefined && { filters: body.filters as object }),
        ...(body.is_default !== undefined && { is_default: body.is_default }),
        updated_at: new Date(),
      },
    })

    res.json({ data: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Dados inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// DELETE /:id — deleta (soft delete: só deleta se não for is_default ou for o único)
configRouter.delete('/:id', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { id } = req.params

    const existing = await req.prisma!.dashboardConfig.findFirst({
      where: { id, user_id: userId },
    })

    if (!existing) {
      throw new AppError('Dashboard config não encontrado', 404, 'NOT_FOUND')
    }

    const productId = (existing as Record<string, unknown>).product_id as string | null
    const allConfigs = await req.prisma!.dashboardConfig.findMany({
      where: { user_id: userId, product_id: productId },
    })

    const isDefault = (existing as Record<string, unknown>).is_default as boolean
    const isOnly = allConfigs.length === 1

    if (isDefault && !isOnly) {
      throw new AppError(
        'Não é possível deletar o dashboard padrão. Defina outro como padrão antes.',
        400,
        'DELETE_DEFAULT_FORBIDDEN',
      )
    }

    await req.prisma!.dashboardConfig.delete({ where: { id } })

    res.json({ message: 'Dashboard config deletado com sucesso' })
  } catch (error) {
    next(error)
  }
})

export { configRouter }
