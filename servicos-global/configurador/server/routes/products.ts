// server/routes/products.ts
// Gestão do Catálogo Global de Produtos da Gravity
// GET    /api/v1/products     — Listar todos os produtos reais
// POST   /api/v1/products     — Cadastrar novo produto
// PUT    /api/v1/products/:id — Editar produto existente
// DELETE /api/v1/products/:id — Remover do catálogo

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const productsRouter = Router()

const ProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.string().default('Ativo'),
  type_billing: z.string().optional(),
  setup_price: z.number().optional(),
  unit_price: z.number().optional(),
  min_price: z.number().optional(),
  total_price: z.number().optional(),
  currency: z.string().default('BRL'),
  limit_users: z.string().default('limitada'),
  base_users: z.number().optional(),
  help_desk_hours: z.number().optional(),
  backend_module: z.string().optional(),
})

/**
 * GET /api/v1/products
 * Retorna o catálogo oficial vindo do Railway (SSOT)
 */
productsRouter.get('/', async (_req, res) => {
  try {
    const products = await prisma.globalProduct.findMany({
      orderBy: { name: 'asc' }
    })
    // Se a tabela existe mas está vazia, cai para o fallback
    if (products.length > 0) {
      res.json({ products })
      return
    }
  } catch {
    // Tabela GlobalProduct não existe — continua para fallback
  }

  // Fallback: usa a tabela Product (seed inicial)
  try {
    const products = await prisma.product.findMany({
      where: { status: { in: ['ACTIVE', 'COMING_SOON'] as any[] } },
      select: {
        id: true, name: true, slug: true, description: true, status: true,
        unit_price: true, unit_currency: true, backend_module: true,
      },
      orderBy: { name: 'asc' }
    })
    res.json({
      products: products.map(p => ({
        ...p,
        type_billing: null,
        currency: p.unit_currency ?? 'BRL',
      }))
    })
  } catch {
    res.json({ products: [] })
  }
})

/**
 * POST /api/v1/products
 * Cadastra um novo produto no catálogo (Apenas Admins)
 */
productsRouter.post('/', requireAuth, requireGravityAdmin, async (req, res, next) => {
  try {
    const parsed = ProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('Dados inválidos para o produto', 400, 'VALIDATION_ERROR')
    }

    const slug = parsed.data.name.toLowerCase().replace(/\s+/g, '-')
    
    const product = await prisma.globalProduct.create({
      data: {
        ...parsed.data,
        slug,
      }
    })

    res.status(201).json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/v1/products/:id
 * Atualiza um produto existente no catálogo (Apenas Admins)
 */
productsRouter.put('/:id', requireAuth, requireGravityAdmin, async (req, res, next) => {
  try {
    const parsed = ProductSchema.partial().safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('Dados inválidos para o produto', 400, 'VALIDATION_ERROR')
    }

    const data: Record<string, unknown> = { ...parsed.data }
    if (parsed.data.name) {
      data.slug = parsed.data.name.toLowerCase().replace(/\s+/g, '-')
    }

    const product = await prisma.globalProduct.update({
      where: { id: req.params.id },
      data,
    })

    res.json({ product })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/products/:id
 * Remove um produto do catálogo (Apenas Admins)
 */
productsRouter.delete('/:id', requireAuth, requireGravityAdmin, async (req, res, next) => {
  try {
    await prisma.globalProduct.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
