// server/routes/produto-gravity.ts
// GET /api/v1/produtos — Catálogo público de produtos (leitura)
// CRUD exclusivo de admin via /api/v1/admin/produtos-gravity (adminProducts.ts)

import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const productsRouter = Router()

/**
 * GET /api/v1/produtos
 * Retorna produtos ATIVO e EM_BREVE — mesma fonte que o Admin (tabela ProdutoGravity)
 */
productsRouter.get('/', async (_req, res) => {
  try {
    const rows = await prisma.produtoGravity.findMany({
      where: { status_produto_gravity: { in: ['ATIVO', 'EM_BREVE'] as any[] } },
      select: {
        id_produto_gravity: true,
        nome_produto_gravity: true,
        slug_produto_gravity: true,
        descricao_produto_gravity: true,
        status_produto_gravity: true,
        preco_unitario_produto_gravity: true,
        moeda_unitario_produto_gravity: true,
        modulo_backend_produto_gravity: true,
        tipo_cobranca_produto_gravity: true,
      },
      orderBy: { nome_produto_gravity: 'asc' }
    })
    // DTO: ProdutoGravity rename → contrato legado público
    res.json({
      products: rows.map(p => ({
        id: p.id_produto_gravity,
        name: p.nome_produto_gravity,
        slug: p.slug_produto_gravity,
        description: p.descricao_produto_gravity,
        status: p.status_produto_gravity,
        unit_price: p.preco_unitario_produto_gravity,
        unit_currency: p.moeda_unitario_produto_gravity,
        backend_module: p.modulo_backend_produto_gravity,
        billing_type: p.tipo_cobranca_produto_gravity,
        type_billing: p.tipo_cobranca_produto_gravity ?? null,
        currency: p.moeda_unitario_produto_gravity ?? 'BRL',
      }))
    })
  } catch {
    res.json({ products: [] })
  }
})
