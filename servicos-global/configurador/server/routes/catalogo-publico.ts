// server/routes/catalogo-publico.ts
// Catálogo público de produtos — sem autenticação
// Usado pelo Store, Marketplace e landing pages
// GET /api/v1/catalogo/produtos-gravity — lista produtos disponíveis

import { Router } from 'express'
import { produtoGravityCatalogoServico } from '../services/produto-gravity-catalogo-service.js'

export const publicCatalogRouter = Router()

/**
 * GET /api/v1/catalogo/produtos-gravity
 * Lista produtos ativos/em breve para exibição pública
 */
publicCatalogRouter.get('/produtos-gravity', async (_req, res, next) => {
  try {
    const products = await produtoGravityCatalogoServico.listarPublico()
    res.json({ products })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/catalogo/produtos-gravity/:id_produto_gravity
 * Detalhes de um produto pelo slug (para página de produto)
 */
publicCatalogRouter.get('/produtos-gravity/:id_produto_gravity', async (req, res, next) => {
  try {
    const { id_produto_gravity: slug } = req.params
    const product = await produtoGravityCatalogoServico.getBySlug(slug)
    if (!product || !['ATIVO', 'EM_BREVE'].includes(product.status)) {
      res.status(404).json({ error: 'Produto não encontrado' })
      return
    }
    res.json({ product })
  } catch (err) {
    next(err)
  }
})
