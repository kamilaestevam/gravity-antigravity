// server/routes/access.ts
// Verificação de permissões entre serviços (S2S) — montado em /api/v1/internal
// GET  /api/v1/internal/permissoes-acesso/verificar             — verificar permissão
// GET  /api/v1/internal/permissoes-acesso/produtos-permitidos   — produtos permitidos
// GET  /api/v1/internal/organizacao-produtos                    — listar produtos da organização
// POST /api/v1/internal/organizacao-produtos/ativar             — ativar produto S2S
// POST /api/v1/internal/organizacao-produtos/desativar          — desativar produto S2S
// PATCH /api/v1/internal/produtos-gravity/:id_produto_gravity/status — toggle status

import { Router } from 'express'
import { z } from 'zod'
import { requireInternalKey } from '../middleware/requireInternalKey.js'
import { prisma } from '../lib/prisma.js'
import { productConfigService } from '../services/productConfigService.js'
import { permissionsService } from '../services/permissionsService.js'
import { AppError } from '../lib/appError.js'

export const accessRouter = Router()

// Aplica x-internal-key em todas as rotas deste roteador
accessRouter.use(requireInternalKey)

const CheckAccessSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  productId: z.string().optional(),
  companyId: z.string().optional(),
  productKey: z.string(),
  resource: z.string().optional(),
  action: z.string().optional(),
})

const ProductPermissionsSchema = z.object({
  tenantId: z.string(),
  productKey: z.string(),
})

/**
 * GET /api/v1/internal/permissoes-acesso/verificar
 * Chamado por produtos para verificar se a organização tem acesso a um produto
 * e se o usuário tem permissão para uma ação específica (opcional)
 * Requer: x-internal-key no header
 */
accessRouter.get('/permissoes-acesso/verificar', async (req, res, next) => {
  try {
    const parsed = CheckAccessSchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Parâmetros inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const { tenantId: id_organizacao, userId: id_usuario, productId, companyId: id_workspace, productKey, resource, action } = parsed.data

    // 1. Verifica se a organização está ativa
    const tenant = await prisma.organizacao.findUnique({
      where: { id_organizacao },
      select: { status_organizacao: true },
    })
    if (!tenant || tenant.status_organizacao !== 'ATIVO') {
      res.json({ allowed: false, reason: 'TENANT_INACTIVE' })
      return
    }

    // 2. Verifica se o produto está habilitado para a organização
    const productConfig = await productConfigService.getConfig(id_organizacao, productKey)
    if (!productConfig?.ativo_configuracao_produto_gravity) {
      res.json({ allowed: false, reason: 'PRODUCT_NOT_ENABLED' })
      return
    }

    // 3. Verifica permissão granular (se solicitado)
    if (productId && resource && action) {
      const hasPermission = await permissionsService.checkPermission({
        id_organizacao: id_organizacao,
        id_usuario: id_usuario,
        id_produto: productId,
        id_workspace: id_workspace,
        resource,
        action: action || '',
      })
      if (!hasPermission) {
        res.json({ allowed: false, reason: 'PERMISSION_DENIED' })
        return
      }
    }

    res.json({
      allowed: true,
      productConfig: productConfig.configuracao_config_produto_gravity,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/internal/organizacao-produtos
 * Retorna TODOS os produtos habilitados para uma organização.
 * Usado pelo Shell para filtrar o sidebar dinamicamente.
 */
accessRouter.get('/organizacao-produtos', async (req, res, next) => {
  try {
    const id_organizacao = req.query.tenantId as string
    if (!id_organizacao) {
      throw new AppError('tenantId é obrigatório', 400, 'VALIDATION_ERROR')
    }

    const products = await productConfigService.listActiveProducts(id_organizacao)

    // Retorna também os inativos para que o Shell saiba o que esconder
    const allConfigs = await prisma.produtoGravityConfiguracao.findMany({
      where: { id_organizacao_configuracao_produto_gravity: id_organizacao },
      select: {
        chave_produto_configuracao_produto_gravity: true,
        ativo_configuracao_produto_gravity: true,
        configuracao_config_produto_gravity: true,
        data_atualizacao_configuracao_produto_gravity: true,
      },
    })

    res.json({ tenant_id: id_organizacao, products: allConfigs })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/internal/organizacao-produtos/ativar
 * Ativa um produto para uma organização via S2S (sem Clerk auth)
 * Usado por testes E2E e serviços internos
 */
accessRouter.post('/organizacao-produtos/ativar', async (req, res, next) => {
  try {
    const { tenantId: id_organizacao, productKey, config: productConfig } = req.body
    if (!id_organizacao || !productKey) {
      throw new AppError('tenantId e productKey são obrigatórios', 400, 'VALIDATION_ERROR')
    }

    const result = await productConfigService.upsertConfig(
      id_organizacao,
      productKey,
      productConfig ?? {},
      true
    )

    res.json({ product_key: productKey, active: true, config: result })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/internal/organizacao-produtos/desativar
 * Desativa um produto para uma organização via S2S (sem Clerk auth)
 */
accessRouter.post('/organizacao-produtos/desativar', async (req, res, next) => {
  try {
    const { tenantId: id_organizacao, productKey } = req.body
    if (!id_organizacao || !productKey) {
      throw new AppError('tenantId e productKey são obrigatórios', 400, 'VALIDATION_ERROR')
    }

    await productConfigService.disableProduct(id_organizacao, productKey)

    res.json({ product_key: productKey, active: false })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/internal/produtos-gravity/:id_produto_gravity/status
 * Toggle status de um produto no catálogo via S2S
 * Usado por testes E2E
 */
accessRouter.patch('/produtos-gravity/:id_produto_gravity/status', async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['ATIVO', 'SUSPENSO', 'EM_BREVE', 'LEGADO', 'INATIVO']
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(`Status inválido. Use: ${validStatuses.join(', ')}`, 400, 'VALIDATION_ERROR')
    }

    const product = await prisma.produtoGravity.findFirst({
      where: { slug_produto_gravity: req.params.id_produto_gravity },
    })
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await prisma.produtoGravity.update({
      where: { id_produto_gravity: product.id_produto_gravity },
      data: { status_produto_gravity: status },
    })

    res.json({
      id: updated.id_produto_gravity,
      slug: updated.slug_produto_gravity,
      status: updated.status_produto_gravity,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/internal/permissoes-acesso/produtos-permitidos
 * Busca definições de permissão configuradas para um produto na organização
 */
accessRouter.get('/permissoes-acesso/produtos-permitidos', async (req, res, next) => {
  try {
    const parsed = ProductPermissionsSchema.safeParse(req.query)
    if (!parsed.success) {
      throw new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR')
    }

    const config = await productConfigService.getConfig(
      parsed.data.tenantId,
      parsed.data.productKey
    )

    if (!config) {
      res.json({
        error: 'Permissões deste produto ainda não foram configuradas.',
        canEdit: false,
      })
      return
    }

    // DTO: ConfiguracaoProduto rename → contrato legado
    res.json({
      config: config.configuracao_config_produto_gravity,
      is_active: config.ativo_configuracao_produto_gravity,
    })
  } catch (err) {
    next(err)
  }
})
