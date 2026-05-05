// server/routes/assinatura-produto-gravity.ts
// Self-service: assinaturas da organização autenticada.
// Mount: /api/v1/organizacoes/me/assinaturas
//
// Mandamentos:
//   06 — Zod em todo body
//   08 — sem fallback silencioso (parse strict)
//   09 — payload bate com schema Prisma (DDD canônico)
//
// Endpoints:
//   GET    /                                                  Listar assinaturas + catálogo + workspaces habilitados
//   POST   /assinar-produto                                   Contratar produto (cria assinatura + configuracao)
//   PATCH  /:slug_produto_gravity                             Suspender/Reativar (status ATIVA|SUSPENSA|EM_TESTE)
//   DELETE /:slug_produto_gravity                             Cancelar assinatura (status CANCELADA + ativo=false)
//   PUT    /:slug_produto_gravity/workspaces/:id_workspace    Habilitar/suspender workspace nesta assinatura
//   DELETE /:slug_produto_gravity/workspaces/:id_workspace    Remover vínculo do workspace

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'
import {
  StatusProdutoGravity,
  StatusAssinaturaProdutoGravity,
} from '../../../../configurador/generated/index.js'

export const assinaturaProdutoGravityRouter = Router()

// ─── Schemas ────────────────────────────────────────────────────────────────

const AssinarProdutoSchema = z.object({
  slug_produto_gravity: z.string().min(1),
})

const ToggleWorkspaceSchema = z.object({
  ativo_produto_gravity_workspace: z.boolean(),
})

// PATCH muda status comercial (Suspender/Reativar/etc).
// Aceita ATIVA, SUSPENSA, EM_TESTE — NÃO aceita CANCELADA (use DELETE).
const PatchStatusSchema = z.object({
  status_assinatura_produto_gravity: z.enum(['ATIVA', 'SUSPENSA', 'EM_TESTE']),
})

// ─── GET / — listar assinaturas ─────────────────────────────────────────────

/**
 * GET /api/v1/organizacoes/me/assinaturas
 * Lista assinaturas da organização autenticada com JOIN no catálogo
 * e nas habilitações por workspace.
 */
assinaturaProdutoGravityRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const id_organizacao = req.auth.id_organizacao

    const assinaturas = await prisma.produtoGravityAssinatura.findMany({
      where: { id_organizacao },
      orderBy: { data_criacao_assinatura_produto_gravity: 'desc' },
      include: {
        produto: {
          include: { faixas_preco_produto_gravity: true },
        },
      },
    })

    // Configurações (config técnica + flag ativo) por chave
    const configuracoes = await prisma.produtoGravityConfiguracao.findMany({
      where: { id_organizacao_configuracao_produto_gravity: id_organizacao },
    })
    const configByChave = new Map(
      configuracoes.map((c) => [c.chave_produto_configuracao_produto_gravity, c]),
    )

    // Habilitações por workspace
    const ativacoes = await prisma.produtoGravityWorkspace.findMany({
      where: { id_organizacao },
      include: {
        company: {
          select: { id_workspace: true, nome_workspace: true, subdominio_workspace: true },
        },
      },
    })
    const ativacoesByProduto = new Map<string, typeof ativacoes>()
    for (const a of ativacoes) {
      const arr = ativacoesByProduto.get(a.id_produto_gravity) ?? []
      arr.push(a)
      ativacoesByProduto.set(a.id_produto_gravity, arr)
    }

    const payload = assinaturas.map((a) => {
      const cfg = configByChave.get(a.produto.slug_produto_gravity) ?? null
      const workspaces = ativacoesByProduto.get(a.id_produto_gravity) ?? []
      return {
        id_assinatura_produto_gravity: a.id_assinatura_produto_gravity,
        id_produto_gravity: a.id_produto_gravity,
        status_assinatura_produto_gravity: a.status_assinatura_produto_gravity,
        data_fim_teste_assinatura_produto_gravity: a.data_fim_teste_assinatura_produto_gravity,
        data_inicio_periodo_assinatura_produto_gravity:
          a.data_inicio_periodo_assinatura_produto_gravity,
        data_fim_periodo_assinatura_produto_gravity:
          a.data_fim_periodo_assinatura_produto_gravity,
        data_cancelamento_assinatura_produto_gravity:
          a.data_cancelamento_assinatura_produto_gravity,
        data_criacao_assinatura_produto_gravity: a.data_criacao_assinatura_produto_gravity,
        produto: {
          id_produto_gravity: a.produto.id_produto_gravity,
          slug_produto_gravity: a.produto.slug_produto_gravity,
          nome_produto_gravity: a.produto.nome_produto_gravity,
          descricao_produto_gravity: a.produto.descricao_produto_gravity,
          tipo_cobranca_produto_gravity: a.produto.tipo_cobranca_produto_gravity,
          preco_unitario_produto_gravity: a.produto.preco_unitario_produto_gravity.toString(),
          moeda_unitario_produto_gravity: a.produto.moeda_unitario_produto_gravity,
          status_produto_gravity: a.produto.status_produto_gravity,
        },
        configuracao: cfg
          ? {
              ativo_configuracao_produto_gravity: cfg.ativo_configuracao_produto_gravity,
              configuracao_config_produto_gravity: cfg.configuracao_config_produto_gravity,
            }
          : null,
        ativacoes_produto_gravity: workspaces.map((w) => ({
          id_produto_gravity_workspace: w.id_produto_gravity_workspace,
          id_workspace: w.id_workspace,
          ativo_produto_gravity_workspace: w.ativo_produto_gravity_workspace,
          workspace: {
            nome_workspace: w.company.nome_workspace,
            subdominio_workspace: w.company.subdominio_workspace,
          },
        })),
      }
    })

    res.json({ assinaturas: payload })
  } catch (err) {
    next(err)
  }
})

// ─── POST /assinar-produto ──────────────────────────────────────────────────

/**
 * POST /api/v1/organizacoes/me/assinaturas/assinar-produto
 * Body: { slug_produto_gravity }
 *
 * Cria assinatura (status EM_TESTE) + configuracao (JSON vazio + ativo=true)
 * em transação. Se já existir, reativa.
 */
assinaturaProdutoGravityRouter.post('/assinar-produto', requireAuth, async (req, res, next) => {
  try {
    const parsed = AssinarProdutoSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'slug_produto_gravity é obrigatório',
        400,
        'VALIDATION_ERROR',
      )
    }
    const { slug_produto_gravity } = parsed.data
    const id_organizacao = req.auth.id_organizacao

    // 1. Localiza produto no catálogo
    const produto = await prisma.produtoGravity.findFirst({
      where: {
        slug_produto_gravity,
        status_produto_gravity: { in: [StatusProdutoGravity.ATIVO] },
      },
    })
    if (!produto) {
      throw new AppError('Produto não encontrado ou inativo', 404, 'NOT_FOUND')
    }

    // 2. Transação: cria/reativa assinatura + configuracao
    const resultado = await prisma.$transaction(async (tx) => {
      const assinatura = await tx.produtoGravityAssinatura.upsert({
        where: {
          id_organizacao_id_produto_gravity: {
            id_organizacao,
            id_produto_gravity: produto.id_produto_gravity,
          },
        },
        create: {
          id_organizacao,
          id_produto_gravity: produto.id_produto_gravity,
          // Self-service: assinatura comeca ATIVA por default. EM_TESTE eh
          // reservado para teste manual do produto antes do fechamento
          // contratual (atribuicao explicita por admin, nunca automatica).
          status_assinatura_produto_gravity: StatusAssinaturaProdutoGravity.ATIVA,
          data_inicio_periodo_assinatura_produto_gravity: new Date(),
        },
        update: {
          // Reativacao limpa cancelamento e marca como ATIVA novamente.
          status_assinatura_produto_gravity: StatusAssinaturaProdutoGravity.ATIVA,
          data_cancelamento_assinatura_produto_gravity: null,
          data_inicio_periodo_assinatura_produto_gravity: new Date(),
        },
        include: { produto: true },
      })

      const configuracao = await tx.produtoGravityConfiguracao.upsert({
        where: {
          id_organizacao_configuracao_produto_gravity_chave_produto_configuracao_produto_gravity: {
            id_organizacao_configuracao_produto_gravity: id_organizacao,
            chave_produto_configuracao_produto_gravity: slug_produto_gravity,
          },
        },
        create: {
          id_organizacao_configuracao_produto_gravity: id_organizacao,
          chave_produto_configuracao_produto_gravity: slug_produto_gravity,
          configuracao_config_produto_gravity: {},
          ativo_configuracao_produto_gravity: true,
        },
        update: {
          ativo_configuracao_produto_gravity: true,
        },
      })

      return { assinatura, configuracao }
    })

    res.status(201).json(resultado)
  } catch (err) {
    next(err)
  }
})

// ─── PATCH /:slug_produto_gravity — muda status (Suspender/Reativar) ────────

/**
 * PATCH /api/v1/organizacoes/me/assinaturas/:slug_produto_gravity
 * Body: { status_assinatura_produto_gravity: 'ATIVA' | 'SUSPENSA' | 'EM_TESTE' }
 *
 * Usado pelo botão "Suspender" / "Reativar" da tela. Não cancela —
 * cancelamento é via DELETE separado, que vira CANCELADA.
 *
 * Sincroniza tambem `ativo_configuracao_produto_gravity`:
 *   ATIVA / EM_TESTE -> ativo=true
 *   SUSPENSA         -> ativo=false
 */
assinaturaProdutoGravityRouter.patch('/:slug_produto_gravity', requireAuth, async (req, res, next) => {
  try {
    const parsed = PatchStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'status_assinatura_produto_gravity inválido',
        400,
        'VALIDATION_ERROR',
      )
    }
    const { slug_produto_gravity } = req.params
    const id_organizacao = req.auth.id_organizacao
    const novoStatus = parsed.data.status_assinatura_produto_gravity

    const produto = await prisma.produtoGravity.findUnique({
      where: { slug_produto_gravity },
      select: { id_produto_gravity: true },
    })
    if (!produto) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    const ativoNaConfig = novoStatus !== 'SUSPENSA'

    const resultado = await prisma.$transaction(async (tx) => {
      const assinatura = await tx.produtoGravityAssinatura.update({
        where: {
          id_organizacao_id_produto_gravity: {
            id_organizacao,
            id_produto_gravity: produto.id_produto_gravity,
          },
        },
        data: {
          status_assinatura_produto_gravity: novoStatus,
          // Saiu de cancelada limpa data_cancelamento
          data_cancelamento_assinatura_produto_gravity: null,
        },
      })

      await tx.produtoGravityConfiguracao.updateMany({
        where: {
          id_organizacao_configuracao_produto_gravity: id_organizacao,
          chave_produto_configuracao_produto_gravity: slug_produto_gravity,
        },
        data: { ativo_configuracao_produto_gravity: ativoNaConfig },
      })

      return assinatura
    })

    res.json({ assinatura: resultado })
  } catch (err) {
    next(err)
  }
})

// ─── DELETE /:slug_produto_gravity — cancelar assinatura ────────────────────

/**
 * DELETE /api/v1/organizacoes/me/assinaturas/:slug_produto_gravity
 * Cancela: status CANCELADA + data_cancelamento + ativo=false na configuracao.
 * Não apaga linha — soft-cancel preserva histórico.
 */
assinaturaProdutoGravityRouter.delete('/:slug_produto_gravity', requireAuth, async (req, res, next) => {
  try {
    const { slug_produto_gravity } = req.params
    const id_organizacao = req.auth.id_organizacao

    const produto = await prisma.produtoGravity.findUnique({
      where: { slug_produto_gravity },
      select: { id_produto_gravity: true },
    })
    if (!produto) {
      throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
    }

    await prisma.$transaction(async (tx) => {
      await tx.produtoGravityAssinatura.update({
        where: {
          id_organizacao_id_produto_gravity: {
            id_organizacao,
            id_produto_gravity: produto.id_produto_gravity,
          },
        },
        data: {
          status_assinatura_produto_gravity: StatusAssinaturaProdutoGravity.CANCELADA,
          data_cancelamento_assinatura_produto_gravity: new Date(),
        },
      }).catch(() => null) // pode não existir se nunca foi criada

      await tx.produtoGravityConfiguracao.updateMany({
        where: {
          id_organizacao_configuracao_produto_gravity: id_organizacao,
          chave_produto_configuracao_produto_gravity: slug_produto_gravity,
        },
        data: { ativo_configuracao_produto_gravity: false },
      })
    })

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// ─── PUT /:slug/workspaces/:id_workspace — habilitar/suspender workspace ────

/**
 * PUT /api/v1/organizacoes/me/assinaturas/:slug_produto_gravity/workspaces/:id_workspace
 * Body: { ativo_produto_gravity_workspace: boolean }
 * Cria ou atualiza linha em produto_gravity_workspace.
 */
assinaturaProdutoGravityRouter.put(
  '/:slug_produto_gravity/workspaces/:id_workspace',
  requireAuth,
  async (req, res, next) => {
    try {
      const parsed = ToggleWorkspaceSchema.safeParse(req.body)
      if (!parsed.success) {
        throw new AppError(
          parsed.error.errors[0]?.message ?? 'ativo_produto_gravity_workspace é obrigatório',
          400,
          'VALIDATION_ERROR',
        )
      }
      const { slug_produto_gravity, id_workspace } = req.params
      const id_organizacao = req.auth.id_organizacao

      const produto = await prisma.produtoGravity.findUnique({
        where: { slug_produto_gravity },
        select: { id_produto_gravity: true },
      })
      if (!produto) {
        throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
      }

      // Garante que o workspace pertence à organização
      const workspace = await prisma.workspace.findFirst({
        where: { id_workspace, id_organizacao },
        select: { id_workspace: true },
      })
      if (!workspace) {
        throw new AppError('Workspace não encontrado nesta organização', 404, 'NOT_FOUND')
      }

      const ativacao = await prisma.produtoGravityWorkspace.upsert({
        where: {
          id_workspace_id_produto_gravity: {
            id_workspace,
            id_produto_gravity: produto.id_produto_gravity,
          },
        },
        create: {
          id_organizacao,
          id_workspace,
          id_produto_gravity: produto.id_produto_gravity,
          ativo_produto_gravity_workspace: parsed.data.ativo_produto_gravity_workspace,
        },
        update: {
          ativo_produto_gravity_workspace: parsed.data.ativo_produto_gravity_workspace,
        },
      })

      res.json({ ativacao })
    } catch (err) {
      next(err)
    }
  },
)

// ─── DELETE /:slug/workspaces/:id_workspace — remover vínculo ───────────────

/**
 * DELETE /api/v1/organizacoes/me/assinaturas/:slug_produto_gravity/workspaces/:id_workspace
 * Apaga a linha em produto_gravity_workspace (vínculo removido).
 */
assinaturaProdutoGravityRouter.delete(
  '/:slug_produto_gravity/workspaces/:id_workspace',
  requireAuth,
  async (req, res, next) => {
    try {
      const { slug_produto_gravity, id_workspace } = req.params
      const id_organizacao = req.auth.id_organizacao

      const produto = await prisma.produtoGravity.findUnique({
        where: { slug_produto_gravity },
        select: { id_produto_gravity: true },
      })
      if (!produto) {
        throw new AppError('Produto não encontrado', 404, 'NOT_FOUND')
      }

      await prisma.produtoGravityWorkspace.deleteMany({
        where: {
          id_organizacao,
          id_workspace,
          id_produto_gravity: produto.id_produto_gravity,
        },
      })

      res.json({ ok: true })
    } catch (err) {
      next(err)
    }
  },
)
