// server/routes/negociacao-especial-preco-produto-gravity.ts
// Lista as negociações especiais de preço da organização autenticada.
//
// Mount: /api/v1/organizacoes/me/negociacoes-especiais-preco-produto-gravity
//
// Mandamentos:
//   01 — autorização vem do Prisma (req.auth.id_organizacao), não do Clerk publicMetadata
//   06 — resposta validável via schema bilateral
//   09 — qualquer rename aqui exige rename do schema Zod NO MESMO commit
//
// Por que rota dedicada (vs. consumir /api/v1/produtos-gravity/:slug N vezes)?
//   - Tela "Produtos & Valores" do FinanceiroWorkspace renderiza N produtos do
//     catálogo e precisa saber qual deles tem negociação ATIVA para a org logada.
//   - Buscar tudo em 1 request (read-mostly, pequena cardinalidade) é mais eficiente.

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { prisma } from '../lib/prisma.js'

export const negociacaoEspecialPrecoProdutoGravityRouter = Router()

/**
 * GET /api/v1/organizacoes/me/negociacoes-especiais-preco-produto-gravity
 *
 * Devolve todas as negociações especiais (acordos comerciais) vigentes da
 * organização do usuário autenticado, em todos os produtos. Filtragem por
 * org SOMENTE no backend — frontend nunca deve receber dados de outras orgs.
 */
negociacaoEspecialPrecoProdutoGravityRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const id_organizacao = req.auth.id_organizacao
    if (!id_organizacao) {
      res.json({ negociacoes_produto_gravity: [] })
      return
    }

    const rows = await prisma.produtoGravityNegociacaoEspecial.findMany({
      where: { id_organizacao },
      orderBy: { data_criacao_negociacao_especial_preco_produto_gravity: 'desc' },
    })

    res.json({
      negociacoes_produto_gravity: rows.map(n => ({
        id_negociacao_especial_preco_produto_gravity:               n.id_negociacao_especial_preco_produto_gravity,
        id_produto_gravity:                                         n.id_produto_gravity,
        id_organizacao:                                             n.id_organizacao,
        nome_organizacao_negociacao_especial_preco_produto_gravity: n.nome_organizacao_negociacao_especial_preco_produto_gravity,
        acordo_negociacao_especial_preco_produto_gravity:           n.acordo_negociacao_especial_preco_produto_gravity,
        data_inicio_negociacao_especial_preco_produto_gravity:      n.data_inicio_negociacao_especial_preco_produto_gravity?.toISOString() ?? null,
        data_fim_negociacao_especial_preco_produto_gravity:         n.data_fim_negociacao_especial_preco_produto_gravity?.toISOString() ?? null,
        ilimitado_negociacao_especial_preco_produto_gravity:        n.ilimitado_negociacao_especial_preco_produto_gravity,
      })),
    })
  } catch (err) {
    next(err)
  }
})
