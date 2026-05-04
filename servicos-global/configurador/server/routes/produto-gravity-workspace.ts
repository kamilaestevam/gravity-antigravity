// server/routes/companyProducts.ts
// Gestão de produtos habilitados por workspace
// GET    /api/v1/workspaces/:id_workspace/produtos                       — Listar produtos do workspace
// POST   /api/v1/workspaces/:id_workspace/produtos                       — Ativar produto no workspace
// DELETE /api/v1/workspaces/:id_workspace/produtos/:id_produto_gravity   — Desativar produto no workspace

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const companyProductsRouter = Router({ mergeParams: true })

const EnableProductSchema = z.object({
  product_key: z.string().min(1),
})

/**
 * GET /api/v1/workspaces/:id_workspace/produtos
 * Lista produtos habilitados no workspace
 */
companyProductsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { id_workspace } = req.params

    // Verifica se o workspace pertence ao tenant
    const company = await prisma.workspace.findFirst({
      where: { id_workspace: id_workspace, id_organizacao: req.auth.id_organizacao },
    })
    if (!company) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }

    const [companyProducts, tenantConfigs] = await Promise.all([
      prisma.produtoGravityWorkspace.findMany({
        where: {
          id_workspace: id_workspace,
          id_organizacao: req.auth.id_organizacao,
        },
        include: { produto: true },
        orderBy: { data_contratacao_produto_gravity_workspace: 'desc' },
      }),
      // Fallback: produtos contratados no tenant mas ainda não ativados no workspace
      prisma.produtoGravityConfiguracao.findMany({
        where: {
          id_organizacao_configuracao_produto_gravity: req.auth.id_organizacao,
          ativo_configuracao_produto_gravity: true,
        },
      }),
    ])

    // Merge: prefere companyProduct; preenche com productConfig se não existir
    const companyProductSlugs = new Set(
      companyProducts.map(cp => cp.produto.slug_produto_gravity),
    )
    const fallbackConfigs = tenantConfigs.filter(
      tc => !companyProductSlugs.has(tc.chave_produto_configuracao_produto_gravity),
    )

    const allKeys = [
      ...companyProducts.map(cp => cp.produto.slug_produto_gravity),
      ...fallbackConfigs.map(tc => tc.chave_produto_configuracao_produto_gravity),
    ]

    // Enriquece com dados do catálogo
    const catalogRows = await prisma.produtoGravity.findMany({
      where: { slug_produto_gravity: { in: allKeys } },
    })
    // DTO: ProdutoGravity rename → contrato legado
    const catalog = catalogRows.map(p => ({
      id: p.id_produto_gravity,
      name: p.nome_produto_gravity,
      slug: p.slug_produto_gravity,
      description: p.descricao_produto_gravity,
      status: p.status_produto_gravity,
    }))
    const catalogMap = new Map(catalog.map(p => [p.slug, p]))

    // DTO: ProdutoGravityWorkspace + ConfiguracaoProduto rename → contrato legado
    const products = [
      ...companyProducts.map(cp => ({
        id: cp.id_produto_gravity_workspace,
        product_key: cp.produto.slug_produto_gravity,
        is_active: cp.ativo_produto_gravity_workspace,
        activated_at: cp.data_contratacao_produto_gravity_workspace,
        catalog: catalogMap.get(cp.produto.slug_produto_gravity) ?? null,
      })),
      ...fallbackConfigs.map(tc => ({
        id: tc.id_configuracao_produto_gravity,
        product_key: tc.chave_produto_configuracao_produto_gravity,
        is_active: true,
        activated_at: tc.data_criacao_configuracao_produto_gravity,
        catalog: catalogMap.get(tc.chave_produto_configuracao_produto_gravity) ?? null,
      })),
    ]

    res.json({ products })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/workspaces/:id_workspace/produtos
 * Ativa um produto no workspace (a organização já precisa ter contratado o produto)
 */
companyProductsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { id_workspace } = req.params
    const parsed = EnableProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('product_key é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const { product_key } = parsed.data

    // Verifica se o workspace pertence ao tenant
    const company = await prisma.workspace.findFirst({
      where: { id_workspace: id_workspace, id_organizacao: req.auth.id_organizacao },
    })
    if (!company) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }

    // Verifica se o tenant contratou o produto
    const tenantProduct = await prisma.produtoGravityConfiguracao.findUnique({
      where: {
        id_organizacao_configuracao_produto_gravity_chave_produto_configuracao_produto_gravity: {
          id_organizacao_configuracao_produto_gravity: req.auth.id_organizacao,
          chave_produto_configuracao_produto_gravity: product_key,
        },
      },
    })
    if (!tenantProduct || !tenantProduct.ativo_configuracao_produto_gravity) {
      throw new AppError(
        'Produto não contratado pelo tenant. Contrate primeiro via Store.',
        403,
        'PRODUCT_NOT_SUBSCRIBED'
      )
    }

    // Resolve product_key (slug) → id_produto_gravity
    const produtoCatalogo = await prisma.produtoGravity.findUnique({
      where: { slug_produto_gravity: product_key },
      select: { id_produto_gravity: true, slug_produto_gravity: true },
    })
    if (!produtoCatalogo) {
      throw new AppError('Produto não encontrado no catálogo', 404, 'NOT_FOUND')
    }

    // Ativa ou reativa no workspace
    const companyProduct = await prisma.produtoGravityWorkspace.upsert({
      where: {
        id_workspace_id_produto_gravity: {
          id_workspace: id_workspace,
          id_produto_gravity: produtoCatalogo.id_produto_gravity,
        },
      },
      create: {
        id_organizacao: req.auth.id_organizacao,
        id_workspace: id_workspace,
        id_produto_gravity: produtoCatalogo.id_produto_gravity,
        ativo_produto_gravity_workspace: true,
      },
      update: {
        ativo_produto_gravity_workspace: true,
      },
    })

    // DTO: ProdutoGravityWorkspace rename → contrato legado
    res.status(201).json({
      companyProduct: {
        id: companyProduct.id_produto_gravity_workspace,
        tenant_id: companyProduct.id_organizacao,
        company_id: companyProduct.id_workspace,
        product_key: produtoCatalogo.slug_produto_gravity,
        is_active: companyProduct.ativo_produto_gravity_workspace,
        created_at: companyProduct.data_contratacao_produto_gravity_workspace,
        updated_at: companyProduct.data_atualizacao_produto_gravity_workspace,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/workspaces/:id_workspace/produtos/:id_produto_gravity
 * Desativa um produto no workspace (soft delete)
 */
companyProductsRouter.delete('/:id_produto_gravity', requireAuth, async (req, res, next) => {
  try {
    const { id_workspace, id_produto_gravity: productKey } = req.params

    // Resolve slug → id_produto_gravity
    const produtoCatalogo = await prisma.produtoGravity.findUnique({
      where: { slug_produto_gravity: productKey },
      select: { id_produto_gravity: true },
    })
    if (!produtoCatalogo) {
      res.json({ ok: true })
      return
    }

    await prisma.produtoGravityWorkspace.updateMany({
      where: {
        id_workspace: id_workspace,
        id_produto_gravity: produtoCatalogo.id_produto_gravity,
        id_organizacao: req.auth.id_organizacao,
      },
      data: { ativo_produto_gravity_workspace: false },
    })

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
