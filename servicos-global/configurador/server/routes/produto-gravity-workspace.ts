// server/routes/produto-gravity-workspace.ts
// Gestão de produtos habilitados por workspace
// GET    /api/v1/workspaces/:id_workspace/produtos-gravity                       — Listar produtos do workspace
// POST   /api/v1/workspaces/:id_workspace/produtos-gravity                       — Ativar produto no workspace
// DELETE /api/v1/workspaces/:id_workspace/produtos-gravity/:id_produto_gravity   — Desativar produto no workspace

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireConfiguradorMutation } from '../middleware/requireConfiguradorAccess.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import { listarSlugsProdutosAcessiveis } from '../services/produtos-acessiveis-service.js'
import {
  aoHabilitarProdutoNoWorkspace,
  aoDesabilitarProdutoNoWorkspace,
} from '../services/sincronizar-acesso-usuario-produtos-service.js'

export const companyProductsRouter = Router({ mergeParams: true })

const EnableProductSchema = z.object({
  product_key: z.string().min(1),
})

/**
 * GET /api/v1/workspaces/:id_workspace/produtos-gravity
 * Lista produtos habilitados no workspace
 */
companyProductsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { id_workspace } = req.params

    // ADMIN/SUPER_ADMIN têm visibilidade cross-org (admin panel global) — não
    // podem ficar travados no próprio id_organizacao do JWT. Para os demais
    // (MASTER/PADRAO/FORNECEDOR), mantém o portão tenant-safe (Mand. — isolamento).
    // Decisão dono 2026-05-12 / bug Admin modal "Editar Usuário" → "Falha ao
    // carregar produtos contratados" quando o workspace alvo era de outra org.
    const ehAdminGlobal =
      req.auth.tipo_usuario === 'SUPER_ADMIN' || req.auth.tipo_usuario === 'ADMIN'

    // Verifica se o workspace existe (cross-org pra admin, intra-org pros demais)
    const company = await prisma.workspace.findFirst({
      where: ehAdminGlobal
        ? { id_workspace: id_workspace }
        : { id_workspace: id_workspace, id_organizacao: req.auth.id_organizacao },
    })
    if (!company) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }

    // Fonte única: SSOT em produtos-acessiveis-service (Mand. 09 — sem drift Hub↔Core).
    // Aplica os 3 portões conforme tipo_usuario:
    //   - Master/SAdmin/Admin: Portões 1+2 (assinatura ATIVA + workspace habilitou)
    //   - Standard/Fornecedor: Portões 1+2+3 (+ chave acesso_usuario_produtos_gravity)
    //
    // Admin cross-org: o serviço busca o usuário pelo par (id_usuario, id_organizacao)
    // e o ator-admin não existe na org do workspace alvo (vive em Gravity HQ).
    // Para esse cenário, aplica direto Portões 1+2 contra a org do workspace
    // (admin tem bypass por natureza — Mand. 04 REGRA LIMBO).
    const idOrgEfetivo = ehAdminGlobal ? company.id_organizacao : req.auth.id_organizacao
    const slugsAcessiveis = ehAdminGlobal
      ? new Set(
          (await prisma.produtoGravityWorkspace.findMany({
            where: {
              id_organizacao: idOrgEfetivo,
              id_workspace,
              ativo_produto_gravity_workspace: true,
              produto: {
                assinaturas_produto_gravity: {
                  some: {
                    id_organizacao: idOrgEfetivo,
                    status_assinatura_produto_gravity: { in: ['ATIVA', 'EM_TESTE'] },
                  },
                },
              },
            },
            select: { produto: { select: { slug_produto_gravity: true } } },
          })).map(r => r.produto.slug_produto_gravity),
        )
      : await listarSlugsProdutosAcessiveis(
          idOrgEfetivo,
          req.auth.id_usuario,
          id_workspace,
        )

    const companyProducts = await prisma.produtoGravityWorkspace.findMany({
      where: {
        id_workspace: id_workspace,
        id_organizacao: idOrgEfetivo,
        ativo_produto_gravity_workspace: true,
        produto: { slug_produto_gravity: { in: [...slugsAcessiveis] } },
      },
      include: { produto: true },
      orderBy: { data_contratacao_produto_gravity_workspace: 'desc' },
    })

    // Enriquece com dados do catálogo
    const slugs = companyProducts.map(cp => cp.produto.slug_produto_gravity)
    const catalogRows = await prisma.produtoGravity.findMany({
      where: { slug_produto_gravity: { in: slugs } },
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

    // DTO: ProdutoGravityWorkspace rename → contrato legado
    const products = companyProducts.map(cp => ({
      id: cp.id_produto_gravity_workspace,
      product_key: cp.produto.slug_produto_gravity,
      is_active: cp.ativo_produto_gravity_workspace,
      activated_at: cp.data_contratacao_produto_gravity_workspace,
      catalog: catalogMap.get(cp.produto.slug_produto_gravity) ?? null,
    }))

    res.json({ products })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/workspaces/:id_workspace/produtos-gravity
 * Ativa um produto no workspace (a organização já precisa ter contratado o produto)
 */
companyProductsRouter.post('/', requireAuth, requireConfiguradorMutation, async (req, res, next) => {
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

    // PORTÃO 3 auto-sync (Interpretação 1, dono 2026-05-12) — best-effort,
    // não bloqueia a resposta. Cria chaves Portão 3 para todos PADRAO/FORN
    // ativos no workspace (idempotente via skipDuplicates).
    aoHabilitarProdutoNoWorkspace({
      id_organizacao: req.auth.id_organizacao,
      id_workspace,
      id_produto_gravity: produtoCatalogo.id_produto_gravity,
      slug_produto: produtoCatalogo.slug_produto_gravity,
    }).catch(() => { /* já logado dentro do service */ })

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
 * DELETE /api/v1/workspaces/:id_workspace/produtos-gravity/:id_produto_gravity
 * Desativa um produto no workspace (soft delete)
 */
companyProductsRouter.delete('/:id_produto_gravity', requireAuth, requireConfiguradorMutation, async (req, res, next) => {
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

    // PORTÃO 3 auto-sync: limpa TODAS as permissões (Portão 3 + granulares)
    // do produto neste workspace (de qualquer usuário). Idempotente.
    aoDesabilitarProdutoNoWorkspace({
      id_organizacao: req.auth.id_organizacao,
      id_workspace,
      id_produto_gravity: produtoCatalogo.id_produto_gravity,
    }).catch(() => { /* já logado dentro do service */ })

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
