// server/routes/negociacao-especial.ts
// Lista as negociações especiais de preço da organização autenticada.
//
// Mount: /api/v1/organizacoes/me/negociacao-especial
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

export const negociacaoEspecialRouter = Router()

/**
 * GET /api/v1/organizacoes/me/negociacao-especial
 *
 * Devolve todas as negociações especiais (acordos comerciais) vigentes da
 * organização do usuário autenticado, em todos os produtos. Filtragem por
 * org SOMENTE no backend — frontend nunca deve receber dados de outras orgs.
 */
negociacaoEspecialRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const id_organizacao = req.auth.id_organizacao
    if (!id_organizacao) {
      res.json({ negociacao_especial: [] })
      return
    }

    const rows = await prisma.produtoGravityNegociacaoEspecial.findMany({
      where: { id_organizacao },
      orderBy: { data_criacao_negociacao_especial: 'desc' },
    })

    res.json({
      negociacao_especial: rows.map(n => ({
        id_negociacao_especial:               n.id_negociacao_especial,
        id_produto_gravity:                   n.id_produto_gravity,
        id_organizacao:                       n.id_organizacao,
        nome_organizacao_negociacao_especial: n.nome_organizacao_negociacao_especial,
        acordo_negociacao_especial:           n.acordo_negociacao_especial,
        valor_unitario_negociacao_especial:   n.valor_unitario_negociacao_especial?.toString() ?? null,
        moeda_negociacao_especial:            n.moeda_negociacao_especial,
        data_inicio_negociacao_especial:      n.data_inicio_negociacao_especial?.toISOString() ?? null,
        data_fim_negociacao_especial:         n.data_fim_negociacao_especial?.toISOString() ?? null,
        ilimitado_prazo_negociacao_especial:  n.ilimitado_prazo_negociacao_especial,
      })),
    })
  } catch (err) {
    next(err)
  }
})
