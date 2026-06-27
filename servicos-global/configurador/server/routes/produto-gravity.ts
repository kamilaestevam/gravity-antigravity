// server/routes/produto-gravity.ts
// GET /api/v1/produtos-gravity       — Catálogo público de produtos (lista compacta)
// GET /api/v1/produtos-gravity/:slug  — Produto COMPLETO read-only (espelho do admin
//                               com faixas de preço e negociações da org)
// CRUD exclusivo de admin via /api/v1/admin/produtos-gravity (adminProducts.ts)

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { AppError } from '../lib/appError.js'
import { produtoGravityCatalogoServico } from '../services/produto-gravity-catalogo-service.js'
import { slugCanonicoProdutoGravityServidor } from '../services/catalogo-vitrine-produto-gravity.js'
import { SLUG_PRODUTO_SMART_READ } from '../lib/resolver-vinculo-smart-read-legado.js'

const idProdutoGravityQuerySchema = z.object({
  id_produto_gravity: z.string().min(1).optional(),
})

export const productsRouter = Router()

/**
 * GET /api/v1/produtos-gravity
 * Retorna produtos ATIVO e EM_BREVE — mesma fonte que o Admin (tabela ProdutoGravity)
 */
productsRouter.get('/', async (_req, res) => {
  try {
    const rows = await produtoGravityCatalogoServico.listarPublico()
    // Mesmo serviço/DTO do Admin — contrato legado público da Store
    res.json({
      products: rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        status: p.status,
        unit_price: p.unit_price,
        unit_currency: p.unit_currency,
        backend_module: p.backend_module,
        billing_type: p.billing_type,
        type_billing: p.billing_type ?? null,
        currency: p.unit_currency ?? 'BRL',
      })),
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
const includeProdutoCompleto = (id_organizacao: string) => ({
  faixas_preco_produto_gravity: {
    orderBy: { faixa_de_faixa_preco_produto_gravity: 'asc' as const },
  },
  negociacoes_especiais: {
    where: { id_organizacao },
    orderBy: { data_criacao_negociacao_especial: 'desc' as const },
  },
})

function produtoGravityAtivo(
  produto: { data_remocao_produto_gravity: Date | null } | null,
): produto is NonNullable<typeof produto> {
  return produto != null && produto.data_remocao_produto_gravity == null
}

productsRouter.get('/:slug', requireAuth, async (req, res, next) => {
  try {
    const { slug } = req.params
    const id_organizacao = req.auth.id_organizacao
    const query = idProdutoGravityQuerySchema.parse(req.query)
    const slugNormalizado = slugCanonicoProdutoGravityServidor(slug)

    let produto = await prisma.produtoGravity.findUnique({
      where: { slug_produto_gravity: slugNormalizado },
      include: includeProdutoCompleto(id_organizacao),
    })

    if (!produtoGravityAtivo(produto) && query.id_produto_gravity) {
      const porId = await prisma.produtoGravity.findUnique({
        where: { id_produto_gravity: query.id_produto_gravity },
        include: includeProdutoCompleto(id_organizacao),
      })
      if (produtoGravityAtivo(porId)) {
        produto = porId
      }
    }

    if (!produtoGravityAtivo(produto) && slugNormalizado === SLUG_PRODUTO_SMART_READ) {
      produto = await prisma.produtoGravity.findFirst({
        where: {
          slug_produto_gravity: SLUG_PRODUTO_SMART_READ,
          data_remocao_produto_gravity: null,
        },
        include: includeProdutoCompleto(id_organizacao),
      })
    }

    if (!produtoGravityAtivo(produto)) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    res.json({ produto })
  } catch (err) {
    next(err)
  }
})
