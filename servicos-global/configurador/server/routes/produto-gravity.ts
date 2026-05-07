// server/routes/produto-gravity.ts
// GET /api/v1/produtos-gravity       — Catálogo público de produtos (lista compacta)
// GET /api/v1/produtos-gravity/:slug  — Produto COMPLETO read-only (espelho do admin
//                               com faixas de preço e negociações da org)
// CRUD exclusivo de admin via /api/v1/admin/produtos-gravity (adminProducts.ts)

import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { AppError } from '../lib/appError.js'

export const productsRouter = Router()

/**
 * GET /api/v1/produtos-gravity
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

/**
 * GET /api/v1/produtos-gravity/:slug
 *
 * Retorna o produto COMPLETO em read-only para o modal "Configurar
 * Assinatura" do workspace — espelho fiel do que o admin vê em
 * /admin/produtos-gravity, sem permitir edição.
 *
 * Inclui:
 *   - Todos os campos do produto (dados básicos, setup, valor, usuários,
 *     help-desk, tokens GABI)
 *   - Faixas de preço por volume (ProdutoGravityFaixaPreco[])
 *   - Negociações especiais APENAS da organização autenticada
 *     (privacidade — orgs não veem acordos de outras)
 *
 * Auth: qualquer usuário autenticado da organização. Sem checagem de papel
 * porque é read-only e tudo aqui já é metadado de produto contratável.
 */
productsRouter.get('/:slug', requireAuth, async (req, res, next) => {
  try {
    const { slug } = req.params
    const id_organizacao = req.auth.id_organizacao

    const produto = await prisma.produtoGravity.findUnique({
      where: { slug_produto_gravity: slug },
      include: {
        faixas_preco_produto_gravity: {
          orderBy: { faixa_de_faixa_preco_produto_gravity: 'asc' },
        },
        negociacoes_especiais: {
          where: { id_organizacao },
          orderBy: { data_criacao_negociacao_especial: 'desc' },
        },
      },
    })

    if (!produto || produto.data_remocao_produto_gravity) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    res.json({ produto })
  } catch (err) {
    next(err)
  }
})
