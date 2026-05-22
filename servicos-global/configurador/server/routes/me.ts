// server/routes/me.ts
// Rotas do usuário autenticado (self).
//
// GET    /api/v1/me                                → contexto completo: usuario + organizacao + workspaces + produtos
// GET    /api/v1/me/organizacoes                   → lista todas as organizações (SUPER_ADMIN/ADMIN only)
// PUT    /api/v1/me/organizacao-ativa              → troca a organização ativa do SUPER_ADMIN/ADMIN
// GET    /api/v1/me/preferencias                   → { preferredCompanyId: string | null }
// PUT    /api/v1/me/preferencias                   → atualiza workspace preferido (skip pós-login)
// GET    /api/v1/me/workspaces                     → lista workspaces da organização
// POST   /api/v1/me/workspaces                     → cria workspace
// PATCH  /api/v1/me/workspaces/:id_workspace       → atualiza workspace
// DELETE /api/v1/me/workspaces/:id_workspace       → remove workspace
// GET    /api/v1/me/sugestoes-subdominio           → preview do subdomínio que o sistema atribuiria

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { requireAuth, invalidarCacheRequireAuth } from '../middleware/requireAuth.js'
import { requireConfiguradorMutation } from '../middleware/requireConfiguradorAccess.js'
import { AppError } from '../lib/appError.js'
import { prisma } from '../lib/prisma.js'
import { organizacaoService, proximoSubdominioDisponivel, slugifySubdominio } from '../services/organizacao-service.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'
import {
  compararEstadosHistoricoLog,
  montarDetalheAcaoHistoricoLog,
} from '@nucleo/montar-detalhe-acao-historico-log'

// ─────────────────────────────────────────────────────────────────────────────
// Schema de resposta — contrato exportável para testes e consumidores
// Garante que breaking changes no payload sejam detectados pelo CI
// ─────────────────────────────────────────────────────────────────────────────

export const meOrganizacoesResponseSchema = z.object({
  organizacoes: z.array(z.object({
    id_organizacao:         z.string(),
    nome_organizacao:       z.string(),
    subdominio_organizacao: z.string(),
    status_organizacao:     z.string(),
  })),
})

export type MeOrganizacoesResponse = z.infer<typeof meOrganizacoesResponseSchema>

const trocarOrganizacaoAtivaSchema = z.object({
  id_organizacao: z.string().min(1),
})

export const meResponseSchema = z.object({
  usuario: z.object({
    id_usuario:             z.string(),
    nome_usuario:           z.string(),
    email_usuario:          z.string().email(),
    tipo_usuario:           z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']),
    id_organizacao: z.string(),
    id_workspace_preferido_usuario:   z.string().nullable(),
    /** Auto-vínculo a workspaces futuros (Mand. 04: Master/SAdmin/Admin sempre false). */
    acesso_workspaces_futuros: z.boolean(),
  }),
  organizacao: z.object({
    id_organizacao:                z.string(),
    nome_organizacao:              z.string(),
    subdominio_organizacao:        z.string(),
    status_organizacao:            z.string(),
    /** Flag de organização que hospeda colaboradores da Gravity (decisão dono
     * 2026-05-11). True = a org tem equipe Gravity dentro, false = cliente.
     * Usado pelo frontend para decidir se SAdmin/ADMIN aparecem na whitelist
     * de tipos atribuíveis a usuários desta org. */
    hospeda_colaboradores_gravity: z.boolean(),
  }).nullable(),
  workspaces: z.array(z.object({
    id:             z.string(),
    nome_workspace: z.string(),
    status:         z.string(),
    tipo_usuario:   z.enum(['MASTER', 'PADRAO', 'FORNECEDOR']),
    produtos:       z.array(z.string()),
  })),
})

export type MeResponse = z.infer<typeof meResponseSchema>

export const meRouter = Router()
meRouter.use(requireAuth)

/**
 * GET /api/v1/me
 * Fonte de verdade do frontend — substitui publicMetadata do Clerk.
 * Retorna contexto completo: usuário, organização, workspaces e produtos ativos.
 */
meRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: req.auth.id_usuario },
      select: {
        id_usuario: true,
        nome_usuario: true,
        email_usuario: true,
        tipo_usuario: true,
        id_organizacao: true,
        id_workspace_preferido_usuario: true,
        acesso_workspaces_futuros: true,
        tenant: {
          select: {
            id_organizacao: true,
            nome_organizacao: true,
            subdominio_organizacao: true,
            status_organizacao: true,
            hospeda_colaboradores_gravity: true,
          },
        },
        memberships: {
          where: { ativo_usuario_workspace: true },
          select: {
            tipo_usuario_workspace: true,
            company: {
              select: {
                id_workspace: true,
                nome_workspace: true,
                status_workspace: true,
                company_products: {
                  where: { ativo_produto_gravity_workspace: true },
                  select: { id_produto_gravity: true },
                },
              },
            },
          },
        },
      },
    })

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    // ── Mandamento 04 (LIMBO) — admin Gravity enxerga todos os workspaces ──────
    // SUPER_ADMIN e ADMIN são equipe interna Gravity: têm acesso global a TODOS
    // os workspaces da organização ATIVA, SEM precisar de vínculo em
    // UsuarioWorkspace. Por isso a lista de workspaces deles NÃO pode sair de
    // `memberships` (ficaria vazia, quebrando o seletor de workspace no front e
    // derrubando toda rota autenticada do produto em 503). É buscada direto da
    // tabela Workspace, filtrada por `id_organizacao` — o Configurador é
    // single-schema `public`, então esse filtro é OBRIGATÓRIO (isolamento).
    //
    // O campo `tipo_usuario` de cada item da lista recebe 'MASTER': o admin tem
    // acesso nível-master em qualquer workspace. Isto NÃO rebaixa nem altera o
    // `tipo_usuario` GLOBAL do usuário (que continua SUPER_ADMIN/ADMIN) — é
    // apenas o "papel dentro daquele workspace" no payload do /me.
    // Usuários não-admin (MASTER/PADRAO/FORNECEDOR) seguem via `memberships`.
    const ehAdminGravity =
      usuario.tipo_usuario === 'SUPER_ADMIN' || usuario.tipo_usuario === 'ADMIN'

    let workspacesResposta
    if (ehAdminGravity) {
      const workspacesDaOrg = await prisma.workspace.findMany({
        where: { id_organizacao: usuario.id_organizacao, status_workspace: 'ATIVO' },
        select: {
          id_workspace: true,
          nome_workspace: true,
          status_workspace: true,
          company_products: {
            where: { ativo_produto_gravity_workspace: true },
            select: { id_produto_gravity: true },
          },
        },
        orderBy: { nome_workspace: 'asc' },
      })
      workspacesResposta = workspacesDaOrg.map((w) => ({
        id: w.id_workspace,
        nome_workspace: w.nome_workspace,
        status: w.status_workspace,
        tipo_usuario: 'MASTER' as const,
        produtos: w.company_products.map((p) => p.id_produto_gravity),
      }))
    } else {
      workspacesResposta = usuario.memberships.map((m) => ({
        id: m.company.id_workspace,
        nome_workspace: m.company.nome_workspace,
        status: m.company.status_workspace,
        tipo_usuario: m.tipo_usuario_workspace,
        produtos: m.company.company_products.map((p) => p.id_produto_gravity),
      }))
    }

    res.json({
      usuario: {
        id_usuario: usuario.id_usuario,
        nome_usuario: usuario.nome_usuario,
        email_usuario: usuario.email_usuario,
        tipo_usuario: usuario.tipo_usuario,
        id_organizacao: usuario.id_organizacao,
        id_workspace_preferido_usuario: usuario.id_workspace_preferido_usuario,
        acesso_workspaces_futuros: usuario.acesso_workspaces_futuros,
      },
      organizacao: usuario.tenant
        ? {
            id_organizacao: usuario.tenant.id_organizacao,
            nome_organizacao: usuario.tenant.nome_organizacao,
            subdominio_organizacao: usuario.tenant.subdominio_organizacao,
            status_organizacao: usuario.tenant.status_organizacao,
            hospeda_colaboradores_gravity: usuario.tenant.hospeda_colaboradores_gravity,
          }
        : null,
      workspaces: workspacesResposta,
    })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Organizações — Troca de contexto para SUPER_ADMIN / ADMIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/me/organizacoes
 * Lista todas as organizações do sistema (payload leve para o sidebar).
 * Restrito a SUPER_ADMIN e ADMIN — demais roles recebem 403.
 */
meRouter.get('/organizacoes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN' && req.auth.tipo_usuario !== 'ADMIN') {
      throw new AppError('Acesso restrito a administradores Gravity', 403, 'FORBIDDEN')
    }

    const organizacoes = await prisma.organizacao.findMany({
      select: {
        id_organizacao: true,
        nome_organizacao: true,
        subdominio_organizacao: true,
        status_organizacao: true,
      },
      orderBy: { nome_organizacao: 'asc' },
    })

    res.json({ organizacoes })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/v1/me/organizacao-ativa
 * Troca a organização ativa do usuário SUPER_ADMIN/ADMIN.
 * Atualiza id_organizacao do usuario e limpa workspace preferido (pertence à org anterior).
 */
meRouter.put('/organizacao-ativa', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth.tipo_usuario !== 'SUPER_ADMIN' && req.auth.tipo_usuario !== 'ADMIN') {
      throw new AppError('Acesso restrito a administradores Gravity', 403, 'FORBIDDEN')
    }

    const parsed = trocarOrganizacaoAtivaSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }

    const orgAlvo = await prisma.organizacao.findUnique({
      where: { id_organizacao: parsed.data.id_organizacao },
      select: { id_organizacao: true, nome_organizacao: true, status_organizacao: true },
    })

    if (!orgAlvo) {
      throw new AppError('Organização não encontrada', 404, 'NOT_FOUND')
    }

    await prisma.usuario.update({
      where: { id_usuario: req.auth.id_usuario },
      data: {
        id_organizacao: orgAlvo.id_organizacao,
        id_workspace_preferido_usuario: null,
      },
    })

    invalidarCacheRequireAuth(req.auth.clerkUserId)

    AuditService.log({
      id_organizacao: orgAlvo.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.nome_usuario,
      modulo_historico_log: 'configuracao',
      tipo_recurso_historico_log: 'Organizacao',
      id_recurso_historico_log: orgAlvo.id_organizacao,
      acao_historico_log: 'ATUALIZAR',
      detalhe_acao_historico_log: `Trocou contexto para organização "${orgAlvo.nome_organizacao}"`,
    }).catch(() => {})

    res.json({ id_organizacao: orgAlvo.id_organizacao, nome_organizacao: orgAlvo.nome_organizacao })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Usuario Preferences — Workspace Preferido
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schema do PUT — contrato exportável via z.infer para o frontend.
 * preferredCompanyId nullable: null = desmarcar.
 */
export const updatePreferencesSchema = z.object({
  preferredCompanyId: z.string().cuid().nullable(),
})
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>

/**
 * Valida se o id_workspace_preferido_usuario ainda é válido para o usuário.
 *
 * Duas rotas de validação, dependendo do role:
 *
 * 1. SUPER_ADMIN / ADMIN (admins Gravity — equipe interna):
 *    Não precisam de UsuarioWorkspace — eles supervisionam todos os workspaces
 *    do próprio tenant sem habilitação formal. Basta que a company:
 *      - Exista
 *      - Pertença ao mesmo tenant do usuário (tenant isolation)
 *      - Esteja com status ACTIVE
 *
 * 2. MASTER / STANDARD (clientes):
 *    Precisam de UsuarioWorkspace ATIVA na company — é como o Configurador
 *    controla quem acessa o quê dentro de um tenant cliente.
 *
 * SUPPLIER nunca chega aqui — é bloqueado antes no PUT (403).
 *
 * Retorna true se válido, false caso contrário (frontend/GET usa para fallback).
 */
async function isPreferredCompanyValid(
  id_usuario: string,
  id_organizacao: string,
  id_workspace: string,
  role: string,
): Promise<boolean> {
  // Admins Gravity: acesso via tenant, não via membership
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    const company = await prisma.workspace.findFirst({
      where: {
        id_workspace: id_workspace,
        id_organizacao: id_organizacao,
        status_workspace: 'ATIVO',
      },
      select: { id_workspace: true },
    })
    return company !== null
  }

  // Clientes (MASTER/STANDARD): requer membership ativa
  const membership = await prisma.usuarioWorkspace.findFirst({
    where: {
      id_usuario: id_usuario,
      id_workspace: id_workspace,
      id_organizacao: id_organizacao,
      ativo_usuario_workspace: true,
      company: { status_workspace: 'ATIVO' },
    },
    select: { id_usuario_workspace: true },
  })
  return membership !== null
}

/**
 * GET /api/v1/me/preferencias
 * Retorna o workspace preferido do usuário.
 *
 * Regras:
 *   - Fornecedor (SUPPLIER) SEMPRE recebe null — nunca aplica skip.
 *   - Se id_workspace_preferido_usuario apontar para company inválida (deletada, sem
 *     acesso, ou inativa), o campo é limpo silenciosamente no banco e o
 *     endpoint retorna null (fallback silencioso).
 */
meRouter.get('/preferencias', async (req, res, next) => {
  try {
    // Fornecedor nunca tem preferido
    if (req.auth.tipo_usuario === 'FORNECEDOR') {
      res.json({ data: { preferredCompanyId: null } })
      return
    }

    const user = await prisma.usuario.findUnique({
      where: { id_usuario: req.auth.id_usuario },
      select: { id_workspace_preferido_usuario: true },
    })

    if (!user?.id_workspace_preferido_usuario) {
      res.json({ data: { preferredCompanyId: null } })
      return
    }

    // Double-check de integridade: a FK onDelete:SetNull cobre deleção de company,
    // mas não cobre revogação de membership (is_active=false) ou company INACTIVE.
    const valid = await isPreferredCompanyValid(
      req.auth.id_usuario,
      req.auth.id_organizacao,
      user.id_workspace_preferido_usuario,
      req.auth.tipo_usuario,
    )

    if (!valid) {
      // Fallback silencioso: limpa o campo e retorna null
      await prisma.usuario.update({
        where: { id_usuario: req.auth.id_usuario },
        data: { id_workspace_preferido_usuario: null },
      })
      res.json({ data: { preferredCompanyId: null } })
      return
    }

    res.json({ data: { preferredCompanyId: user.id_workspace_preferido_usuario } })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/v1/me/preferencias
 * Atualiza ou remove o workspace preferido do usuário.
 *
 * Body: { preferredCompanyId: string | null }
 *   - string cuid: define como preferido (valida membership ativa)
 *   - null: desmarca preferido
 *
 * Regras:
 *   - Fornecedor (SUPPLIER) NÃO pode definir preferido — retorna 403.
 *   - Só pode marcar company onde tem membership ATIVA.
 *   - Workspace deve pertencer ao mesmo tenant (cross-tenant bloqueado).
 */
meRouter.put('/preferencias', async (req, res, next) => {
  try {
    // Camada 3 — Autorização: fornecedor não pode marcar preferido
    if (req.auth.tipo_usuario === 'FORNECEDOR') {
      throw new AppError(
        'Fornecedores não podem definir workspace preferido',
        403,
        'FORBIDDEN',
      )
    }

    // Camada 2 — Validação Zod
    const parsed = updatePreferencesSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }

    const { preferredCompanyId } = parsed.data

    // Caso 1: desmarcar — sempre permitido
    if (preferredCompanyId === null) {
      await prisma.usuario.update({
        where: { id_usuario: req.auth.id_usuario },
        data: { id_workspace_preferido_usuario: null },
      })
      res.json({ data: { preferredCompanyId: null } })
      return
    }

    // Caso 2: marcar — valida acesso à company conforme o role
    // (admin Gravity via tenant, cliente via membership — sempre com tenant isolation)
    const valid = await isPreferredCompanyValid(
      req.auth.id_usuario,
      req.auth.id_organizacao,
      preferredCompanyId,
      req.auth.tipo_usuario,
    )

    if (!valid) {
      throw new AppError(
        'Workspace não encontrado ou sem acesso',
        403,
        'FORBIDDEN',
      )
    }

    await prisma.usuario.update({
      where: { id_usuario: req.auth.id_usuario },
      data: { id_workspace_preferido_usuario: preferredCompanyId },
    })

    res.json({ data: { preferredCompanyId } })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Workspaces da organização autenticada
// Schemas Zod e endpoints relocados de organizacoesRouter (decisão DDD 2026-05-03):
// path canonical é /api/v1/me/workspaces — operação sobre os workspaces "do
// usuário/organização atual", o que pertence semanticamente ao meRouter.
// ─────────────────────────────────────────────────────────────────────────────

const CriarWorkspaceSchema = z.object({
  nome_workspace: z.string().min(2),
  subdominio_workspace: z.string().optional(),
  cnpj_workspace: z.string().optional(),
})

// Subdomínio é IMUTÁVEL após criação (decisão 2026-05-03) — URLs já em uso
// por usuários, integrações e webhooks dependem dele. PATCH NÃO aceita
// `subdominio_workspace` no body. Mudanças exigem migração de contas e estão
// fora do escopo desta rota.
const AtualizarWorkspaceSchema = z.object({
  nome_workspace: z.string().min(2).optional(),
  cnpj_workspace: z.string().optional(),
  status_workspace: z.enum(['ATIVO', 'INATIVO']).optional(),
}).strict()

/**
 * GET /api/v1/me/sugestoes-subdominio?base=<slug>
 * Preview do subdomínio que o sistema atribuiria, dado um nome/base.
 * Usado pelo modal de criação para mostrar ao usuário, em tempo real, o
 * subdomínio final antes do `Criar` (o sistema gera, usuário não escolhe).
 *
 * Política de unicidade: cross-tabela (organizacao + workspace).
 * Auto-suffix: -2, -3, ... até disponível.
 */
meRouter.get('/sugestoes-subdominio', async (req, res, next) => {
  try {
    const base = typeof req.query.base === 'string' ? req.query.base : ''
    if (!base.trim()) {
      throw new AppError('Parâmetro `base` obrigatório', 400, 'VALIDATION_ERROR')
    }
    const subdominio_solicitado = slugifySubdominio(base)
    if (!subdominio_solicitado) {
      throw new AppError('Base inválida — informe pelo menos uma letra', 400, 'VALIDATION_ERROR')
    }
    const subdominio_sugerido = await proximoSubdominioDisponivel(base)
    res.json({
      subdominio_solicitado,
      subdominio_sugerido,
      subdominio_ajustado: subdominio_sugerido !== subdominio_solicitado,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/me/workspaces
 * Lista workspaces da organização autenticada.
 */
meRouter.get('/workspaces', async (req, res, next) => {
  try {
    const workspaces = await organizacaoService.getWorkspaces(req.auth.id_organizacao)
    res.json({ workspaces })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/me/workspaces
 * Cria um workspace na organização autenticada.
 */
meRouter.post('/workspaces', requireConfiguradorMutation, async (req, res, next) => {
  try {
    const parsed = CriarWorkspaceSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }
    const created = await organizacaoService.createWorkspace(
      req.auth.id_organizacao,
      parsed.data,
    )
    const { subdominio_solicitado, subdominio_ajustado, ...workspace } = created

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.nome_usuario,
      modulo_historico_log: 'configuracao',
      tipo_recurso_historico_log: 'Workspace',
      id_recurso_historico_log: workspace.id_workspace,
      acao_historico_log: 'CRIAR',
      detalhe_acao_historico_log: `Criou workspace "${workspace.nome_workspace}" (subdomínio ${subdominio_ajustado ? `ajustado de ${subdominio_solicitado} para ${workspace.subdominio_workspace}` : workspace.subdominio_workspace})`,
      estado_posterior_historico_log: workspace,
    }).catch(() => {})

    res.status(201).json({ workspace, subdominio_solicitado, subdominio_ajustado })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/me/workspaces/:id_workspace
 * Atualiza um workspace.
 */
meRouter.patch('/workspaces/:id_workspace', requireConfiguradorMutation, async (req, res, next) => {
  try {
    const parsed = AtualizarWorkspaceSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR',
      )
    }

    // Snapshot ANTES — usado pelo diff X→Y do detalhe da auditoria.
    const estado_anterior = await prisma.workspace.findFirst({
      where: { id_workspace: req.params.id_workspace, id_organizacao: req.auth.id_organizacao },
    })

    const workspace = await organizacaoService.updateWorkspace(
      req.auth.id_organizacao,
      req.params.id_workspace,
      parsed.data,
    )

    // Detalhe humanizado: "Atualizou workspace \"CDE Importador\" — Nome: \"X\" → \"Y\""
    const diff_campos = compararEstadosHistoricoLog(estado_anterior, workspace, 'Workspace')
    const detalhe_acao_historico_log = montarDetalheAcaoHistoricoLog(
      'Atualizou',
      'Workspace',
      workspace.nome_workspace,
      diff_campos,
    )

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.nome_usuario,
      modulo_historico_log: 'configuracao',
      tipo_recurso_historico_log: 'Workspace',
      id_recurso_historico_log: req.params.id_workspace,
      acao_historico_log: 'ATUALIZAR',
      detalhe_acao_historico_log,
      estado_anterior_historico_log: estado_anterior ?? undefined,
      estado_posterior_historico_log: workspace,
    }).catch(() => {})

    res.json({ workspace })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/me/workspaces/:id_workspace
 * Remove um workspace da organização autenticada.
 */
meRouter.delete('/workspaces/:id_workspace', requireConfiguradorMutation, async (req, res, next) => {
  try {
    await organizacaoService.deleteWorkspace(req.auth.id_organizacao, req.params.id_workspace)

    AuditService.log({
      id_organizacao: req.auth.id_organizacao,
      tipo_ator_historico_log: 'USUARIO',
      id_ator_historico_log: req.auth.id_usuario,
      nome_ator_historico_log: req.auth.nome_usuario,
      modulo_historico_log: 'configuracao',
      tipo_recurso_historico_log: 'Workspace',
      id_recurso_historico_log: req.params.id_workspace,
      acao_historico_log: 'EXCLUIR',
      detalhe_acao_historico_log: `Removeu workspace ${req.params.id_workspace}`,
    }).catch(() => {})

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
