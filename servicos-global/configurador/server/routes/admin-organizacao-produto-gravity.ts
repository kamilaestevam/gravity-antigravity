// server/routes/admin-organizacao-produto-gravity.ts
// Admin (gravity_admin only): ativar/desativar/listar produtos por organização.
// Mount: /api/v1/admin/organizacoes
//
// Endpoints:
//   GET  /:id_organizacao/produtos                                    Lista produtos contratados pela org
//   POST /:id_organizacao/produtos/:id_produto_gravity/ativar         Ativa produto para a org
//   POST /:id_organizacao/produtos/:id_produto_gravity/desativar      Desativa produto

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireGravityAdmin } from '../middleware/requireGravityAdmin.js'
import { productConfigService } from '../services/produto-gravity-configuracao-service.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

export const adminOrganizacaoProdutoGravityRouter = Router()

const ActivateProductSchema = z.object({
  config: z.record(z.unknown()).optional().default({}),
})

/**
 * GET /api/v1/admin/organizacoes/:id_organizacao/produtos
 * Lista produtos ativados para uma organização específica
 */
adminOrganizacaoProdutoGravityRouter.get(
  '/:id_organizacao/produtos',
  requireAuth,
  requireGravityAdmin,
  async (req, res, next) => {
    try {
      const { id_organizacao } = req.params
      const organizacao = await prisma.organizacao.findUnique({
        where: { id_organizacao },
        select: { id_organizacao: true, nome_organizacao: true },
      })
      if (!organizacao) {
        throw new AppError('Organizacao não encontrada', 404, 'NOT_FOUND')
      }

      const configuracoes = await prisma.produtoGravityConfiguracao.findMany({
        where: { id_organizacao_configuracao_produto_gravity: id_organizacao },
        orderBy: { data_criacao_configuracao_produto_gravity: 'desc' },
      })

      // DTO em DDD canônico
      const produtos_organizacao = configuracoes.map((c) => ({
        id_configuracao_produto_gravity: c.id_configuracao_produto_gravity,
        id_organizacao_configuracao_produto_gravity:
          c.id_organizacao_configuracao_produto_gravity,
        chave_produto_configuracao_produto_gravity:
          c.chave_produto_configuracao_produto_gravity,
        configuracao_config_produto_gravity: c.configuracao_config_produto_gravity,
        ativo_configuracao_produto_gravity: c.ativo_configuracao_produto_gravity,
        data_criacao_configuracao_produto_gravity:
          c.data_criacao_configuracao_produto_gravity,
        data_atualizacao_configuracao_produto_gravity:
          c.data_atualizacao_configuracao_produto_gravity,
      }))

      res.json({
        id_organizacao: organizacao.id_organizacao,
        nome_organizacao: organizacao.nome_organizacao,
        produtos_organizacao,
      })
    } catch (err) {
      next(err)
    }
  },
)

/**
 * POST /api/v1/admin/organizacoes/:id_organizacao/produtos/:id_produto_gravity/ativar
 */
adminOrganizacaoProdutoGravityRouter.post(
  '/:id_organizacao/produtos/:id_produto_gravity/ativar',
  requireAuth,
  requireGravityAdmin,
  async (req, res, next) => {
    try {
      const parsed = ActivateProductSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new AppError(
          parsed.error.errors[0]?.message ?? 'Dados inválidos',
          400,
          'VALIDATION_ERROR',
        )
      }

      const { id_organizacao, id_produto_gravity } = req.params

      const organizacao = await prisma.organizacao.findUnique({
        where: { id_organizacao },
      })
      if (!organizacao) {
        throw new AppError('Organizacao não encontrada', 404, 'NOT_FOUND')
      }

      const configuracao = await productConfigService.upsertConfig(
        id_organizacao,
        id_produto_gravity,
        parsed.data.config,
        true,
      )

      console.info(
        `[admin] produto ativado id_organizacao=${id_organizacao} id_produto_gravity=${id_produto_gravity}`,
      )

      res.json({ ativado: true, configuracao })
    } catch (err) {
      next(err)
    }
  },
)

/**
 * POST /api/v1/admin/organizacoes/:id_organizacao/produtos/:id_produto_gravity/desativar
 */
adminOrganizacaoProdutoGravityRouter.post(
  '/:id_organizacao/produtos/:id_produto_gravity/desativar',
  requireAuth,
  requireGravityAdmin,
  async (req, res, next) => {
    try {
      const { id_organizacao, id_produto_gravity } = req.params

      const organizacao = await prisma.organizacao.findUnique({
        where: { id_organizacao },
      })
      if (!organizacao) {
        throw new AppError('Organizacao não encontrada', 404, 'NOT_FOUND')
      }

      await productConfigService.disableProduct(id_organizacao, id_produto_gravity)

      console.info(
        `[admin] produto desativado id_organizacao=${id_organizacao} id_produto_gravity=${id_produto_gravity}`,
      )

      res.json({ desativado: true })
    } catch (err) {
      next(err)
    }
  },
)
