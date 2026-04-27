import { Router } from 'express'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'
import { AppError } from '../lib/errors.js'
import { getCatalogForUser, getCatalogByProduct } from '../lib/catalog.js'
import { getWidgetsForUser } from '../lib/widget-registry.js'
import { suggestChartTypes } from '../lib/chart-advisor.js'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: { tenantId: string; userId: string }
    prisma?: PrismaClient
  }
}

const catalogRouter = Router()

const fieldsQuerySchema = z.object({
  product_id: z.string().optional(),
})

const widgetsQuerySchema = z.object({
  product_id: z.string().optional(),
})

const suggestQuerySchema = z.object({
  fields: z.string().min(1),
  operation: z.string().min(1),
})

// GET /campos — retorna campos do Data Catalog filtrados pelas permissões do usuário
catalogRouter.get('/campos', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { product_id } = fieldsQuerySchema.parse(req.query)

    const userPermissions = (req.headers['x-user-permissions'] as string || '')
      .split(',')
      .filter(Boolean)

    let fields: unknown[]

    if (product_id) {
      fields = await getCatalogByProduct(tenantId, product_id, userPermissions)
    } else {
      fields = await getCatalogForUser(tenantId, userId, userPermissions)
    }

    res.json({ data: fields })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// GET /widgets — retorna widgets pré-construídos disponíveis para o usuário (catálogo)
catalogRouter.get('/widgets', async (req, res, next) => {
  try {
    const { tenantId, userId } = req.auth!
    const { product_id } = widgetsQuerySchema.parse(req.query)

    const userPermissions = (req.headers['x-user-permissions'] as string || '')
      .split(',')
      .filter(Boolean)

    const widgets = await getWidgetsForUser(tenantId, userId, userPermissions, product_id)

    res.json({ data: widgets })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

// GET /sugestoes — sugere tipos de gráfico para campos selecionados
catalogRouter.get('/sugestoes', async (req, res, next) => {
  try {
    const { fields: fieldsRaw, operation } = suggestQuerySchema.parse(req.query)

    let fields: string[]
    try {
      fields = JSON.parse(fieldsRaw) as string[]
      if (!Array.isArray(fields) || fields.some((f) => typeof f !== 'string')) {
        throw new Error('fields deve ser um array de strings')
      }
    } catch {
      throw new AppError(
        'O parâmetro "fields" deve ser um JSON array de strings',
        400,
        'VALIDATION_ERROR',
      )
    }

    if (fields.length === 0) {
      throw new AppError('Ao menos um field é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const suggestions = await suggestChartTypes(fields, operation)

    res.json({ data: suggestions })
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))
    } else {
      next(error)
    }
  }
})

export { catalogRouter }
