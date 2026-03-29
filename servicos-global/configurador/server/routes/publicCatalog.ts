// server/routes/publicCatalog.ts
// Catálogo público de produtos — sem autenticação
// Usado pelo Store, Marketplace e landing pages
// GET /api/v1/catalog/products — lista produtos disponíveis

import { Router } from 'express'
import { productCatalogService } from '../services/productCatalogService.js'

export const publicCatalogRouter = Router()

/**
 * GET /api/v1/catalog/products
 * Lista produtos ativos/em breve para exibição pública
 */
publicCatalogRouter.get('/products', async (_req, res, next) => {
  try {
    const products = await productCatalogService.listPublic()
    res.json({ products })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/catalog/products/:slug
 * Detalhes de um produto pelo slug (para página de produto)
 */
publicCatalogRouter.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await productCatalogService.getBySlug(req.params.slug)
    if (!product || !['ACTIVE', 'COMING_SOON'].includes(product.status)) {
      res.status(404).json({ error: 'Produto não encontrado' })
      return
    }
    res.json({ product })
  } catch (err) {
    next(err)
  }
})
