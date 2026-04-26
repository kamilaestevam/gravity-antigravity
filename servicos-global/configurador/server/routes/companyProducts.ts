// server/routes/companyProducts.ts
// Gestão de produtos habilitados por workspace (Workspace)
// GET    /api/v1/companies/:companyId/products              — Listar produtos do workspace
// POST   /api/v1/companies/:companyId/products              — Ativar produto no workspace
// DELETE /api/v1/companies/:companyId/products/:productKey  — Desativar produto no workspace

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
 * GET /api/v1/companies/:companyId/products
 * Lista produtos habilitados no workspace
 */
companyProductsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { companyId } = req.params

    // Verifica se o workspace pertence ao tenant
    const company = await prisma.empresa.findFirst({
      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.tenantId },
    })
    if (!company) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }

    const [companyProducts, tenantConfigs] = await Promise.all([
      prisma.produtoGravityWorkspace.findMany({
        where: {
          id_workspace_produto_gravity_workspace: companyId,
          id_organizacao_produto_gravity_workspace: req.auth.tenantId,
        },
        orderBy: { data_criacao_produto_gravity_workspace: 'desc' },
      }),
      // Fallback: produtos contratados no tenant mas ainda não ativados no workspace
      prisma.configuracaoProduto.findMany({
        where: {
          id_organizacao_config_produto_gravity: req.auth.tenantId,
          ativo_config_produto_gravity: true,
        },
      }),
    ])

    // Merge: prefere companyProduct; preenche com productConfig se não existir
    const companyKeys = new Set(
      companyProducts.map(cp => cp.chave_produto_produto_gravity_workspace),
    )
    const fallbackConfigs = tenantConfigs.filter(
      tc => !companyKeys.has(tc.chave_produto_config_produto_gravity),
    )

    const allKeys = [
      ...companyProducts.map(cp => cp.chave_produto_produto_gravity_workspace),
      ...fallbackConfigs.map(tc => tc.chave_produto_config_produto_gravity),
    ]

    // Enriquece com dados do catálogo
    const catalog = await prisma.produtoGravity.findMany({
      where: { slug: { in: allKeys } },
    })
    const catalogMap = new Map(catalog.map(p => [p.slug, p]))

    // DTO: ProdutoGravityWorkspace + ConfiguracaoProduto rename → contrato legado
    const products = [
      ...companyProducts.map(cp => ({
        id: cp.id_produto_gravity_workspace,
        product_key: cp.chave_produto_produto_gravity_workspace,
        is_active: cp.ativo_produto_gravity_workspace,
        activated_at: cp.data_criacao_produto_gravity_workspace,
        catalog: catalogMap.get(cp.chave_produto_produto_gravity_workspace) ?? null,
      })),
      ...fallbackConfigs.map(tc => ({
        id: tc.id_config_produto_gravity,
        product_key: tc.chave_produto_config_produto_gravity,
        is_active: true,
        activated_at: tc.data_criacao_config_produto_gravity,
        catalog: catalogMap.get(tc.chave_produto_config_produto_gravity) ?? null,
      })),
    ]

    res.json({ products })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/companies/:companyId/products
 * Ativa um produto no workspace (o tenant já precisa ter contratado o produto)
 */
companyProductsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { companyId } = req.params
    const parsed = EnableProductSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('product_key é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const { product_key } = parsed.data

    // Verifica se o workspace pertence ao tenant
    const company = await prisma.empresa.findFirst({
      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.tenantId },
    })
    if (!company) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }

    // Verifica se o tenant contratou o produto
    const tenantProduct = await prisma.configuracaoProduto.findUnique({
      where: {
        id_organizacao_config_produto_gravity_chave_produto_config_produto_gravity: {
          id_organizacao_config_produto_gravity: req.auth.tenantId,
          chave_produto_config_produto_gravity: product_key,
        },
      },
    })
    if (!tenantProduct || !tenantProduct.ativo_config_produto_gravity) {
      throw new AppError(
        'Produto não contratado pelo tenant. Contrate primeiro via Store.',
        403,
        'PRODUCT_NOT_SUBSCRIBED'
      )
    }

    // Ativa ou reativa no workspace
    const companyProduct = await prisma.produtoGravityWorkspace.upsert({
      where: {
        id_workspace_produto_gravity_workspace_chave_produto_produto_gravity_workspace: {
          id_workspace_produto_gravity_workspace: companyId,
          chave_produto_produto_gravity_workspace: product_key,
        },
      },
      create: {
        id_organizacao_produto_gravity_workspace: req.auth.tenantId,
        id_workspace_produto_gravity_workspace: companyId,
        chave_produto_produto_gravity_workspace: product_key,
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
        tenant_id: companyProduct.id_organizacao_produto_gravity_workspace,
        company_id: companyProduct.id_workspace_produto_gravity_workspace,
        product_key: companyProduct.chave_produto_produto_gravity_workspace,
        is_active: companyProduct.ativo_produto_gravity_workspace,
        created_at: companyProduct.data_criacao_produto_gravity_workspace,
        updated_at: companyProduct.data_atualizacao_produto_gravity_workspace,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/companies/:companyId/products/:productKey
 * Desativa um produto no workspace (soft delete)
 */
companyProductsRouter.delete('/:productKey', requireAuth, async (req, res, next) => {
  try {
    const { companyId, productKey } = req.params

    await prisma.produtoGravityWorkspace.updateMany({
      where: {
        id_workspace_produto_gravity_workspace: companyId,
        chave_produto_produto_gravity_workspace: productKey,
        id_organizacao_produto_gravity_workspace: req.auth.tenantId,
      },
      data: { ativo_produto_gravity_workspace: false },
    })

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
