// server/routes/me.ts
// Rotas do usuário autenticado (self).
//
// GET  /api/v1/me                → contexto completo: user + tenant + workspaces + produtos
// GET  /api/v1/me/preferences    → { preferredCompanyId: string | null }
// PUT  /api/v1/me/preferences    → atualiza workspace preferido (skip pós-login)

import { Router, type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { AppError } from '../lib/appError.js'
import { prisma } from '../lib/prisma.js'

// ─────────────────────────────────────────────────────────────────────────────
// Schema de resposta — contrato exportável para testes e consumidores
// Garante que breaking changes no payload sejam detectados pelo CI
// ─────────────────────────────────────────────────────────────────────────────

export const meResponseSchema = z.object({
  usuario: z.object({
    id_usuario:             z.string(),
    nome_usuario:           z.string(),
    email_usuario:          z.string().email(),
    tipo_usuario:           z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']),
    id_organizacao_usuario: z.string(),
    preferred_company_id:   z.string().nullable(),
  }),
  organizacao: z.object({
    id_organizacao:         z.string(),
    nome_organizacao:       z.string(),
    subdominio_organizacao: z.string(),
    status_organizacao:     z.string(),
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
      where: { id: req.auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenant_id: true,
        preferred_company_id: true,
        tenant: {
          select: {
            id: true,
            nome_organizacao: true,
            subdominio_organizacao: true,
            status_organizacao: true,
          },
        },
        memberships: {
          where: { is_active: true },
          select: {
            role: true,
            company: {
              select: {
                id: true,
                name: true,
                status: true,
                company_products: {
                  where: { is_active: true },
                  select: { product_key: true },
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

    res.json({
      usuario: {
        id_usuario: usuario.id,
        nome_usuario: usuario.name,
        email_usuario: usuario.email,
        tipo_usuario: usuario.role,
        id_organizacao_usuario: usuario.tenant_id,
        preferred_company_id: usuario.preferred_company_id,
      },
      organizacao: usuario.tenant
        ? {
            id_organizacao: usuario.tenant.id,
            nome_organizacao: usuario.tenant.nome_organizacao,
            subdominio_organizacao: usuario.tenant.subdominio_organizacao,
            status_organizacao: usuario.tenant.status_organizacao,
          }
        : null,
      workspaces: usuario.memberships.map((m) => ({
        id: m.company.id,
        nome_workspace: m.company.name,
        status: m.company.status,
        tipo_usuario: m.role,
        produtos: m.company.company_products.map((p) => p.product_key),
      })),
    })
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
 * Valida se o preferred_company_id ainda é válido para o usuário.
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
  userId: string,
  tenantId: string,
  companyId: string,
  role: string,
): Promise<boolean> {
  // Admins Gravity: acesso via tenant, não via membership
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    const company = await prisma.empresa.findFirst({
      where: {
        id: companyId,
        tenant_id: tenantId,
        status: 'ATIVO',
      },
      select: { id: true },
    })
    return company !== null
  }

  // Clientes (MASTER/STANDARD): requer membership ativa
  const membership = await prisma.usuarioWorkspace.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
      tenant_id: tenantId,
      is_active: true,
      company: { status: 'ATIVO' },
    },
    select: { id: true },
  })
  return membership !== null
}

/**
 * GET /api/v1/me/preferences
 * Retorna o workspace preferido do usuário.
 *
 * Regras:
 *   - Fornecedor (SUPPLIER) SEMPRE recebe null — nunca aplica skip.
 *   - Se preferred_company_id apontar para company inválida (deletada, sem
 *     acesso, ou inativa), o campo é limpo silenciosamente no banco e o
 *     endpoint retorna null (fallback silencioso).
 */
meRouter.get('/preferences', async (req, res, next) => {
  try {
    // Fornecedor nunca tem preferido
    if (req.auth.role === 'FORNECEDOR') {
      res.json({ data: { preferredCompanyId: null } })
      return
    }

    const user = await prisma.usuario.findUnique({
      where: { id: req.auth.userId },
      select: { preferred_company_id: true },
    })

    if (!user?.preferred_company_id) {
      res.json({ data: { preferredCompanyId: null } })
      return
    }

    // Double-check de integridade: a FK onDelete:SetNull cobre deleção de company,
    // mas não cobre revogação de membership (is_active=false) ou company INACTIVE.
    const valid = await isPreferredCompanyValid(
      req.auth.userId,
      req.auth.tenantId,
      user.preferred_company_id,
      req.auth.role,
    )

    if (!valid) {
      // Fallback silencioso: limpa o campo e retorna null
      await prisma.usuario.update({
        where: { id: req.auth.userId },
        data: { preferred_company_id: null },
      })
      res.json({ data: { preferredCompanyId: null } })
      return
    }

    res.json({ data: { preferredCompanyId: user.preferred_company_id } })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/v1/me/preferences
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
meRouter.put('/preferences', async (req, res, next) => {
  try {
    // Camada 3 — Autorização: fornecedor não pode marcar preferido
    if (req.auth.role === 'FORNECEDOR') {
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
        where: { id: req.auth.userId },
        data: { preferred_company_id: null },
      })
      res.json({ data: { preferredCompanyId: null } })
      return
    }

    // Caso 2: marcar — valida acesso à company conforme o role
    // (admin Gravity via tenant, cliente via membership — sempre com tenant isolation)
    const valid = await isPreferredCompanyValid(
      req.auth.userId,
      req.auth.tenantId,
      preferredCompanyId,
      req.auth.role,
    )

    if (!valid) {
      throw new AppError(
        'Workspace não encontrado ou sem acesso',
        403,
        'FORBIDDEN',
      )
    }

    await prisma.usuario.update({
      where: { id: req.auth.userId },
      data: { preferred_company_id: preferredCompanyId },
    })

    res.json({ data: { preferredCompanyId } })
  } catch (err) {
    next(err)
  }
})
