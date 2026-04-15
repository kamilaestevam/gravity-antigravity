// server/routes/me.ts
// Rotas do usuário autenticado (self).
//
// GET  /api/v1/me                → dados canônicos do usuário (id, tenantId, role)
// GET  /api/v1/me/preferences    → { preferredCompanyId: string | null }
// PUT  /api/v1/me/preferences    → atualiza workspace preferido (skip pós-login)

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { AppError } from '../lib/appError.js'
import { prisma } from '../lib/prisma.js'

export const meRouter = Router()
meRouter.use(requireAuth)

/**
 * GET /api/v1/me
 * Retorna o role canônico do banco — fonte de verdade para autorização no frontend.
 * req.auth já foi populado pelo requireAuth (consulta ao banco com cache).
 */
meRouter.get('/', (req, res) => {
  res.json({
    user: {
      id: req.auth.userId,
      tenantId: req.auth.tenantId,
      role: req.auth.role,
    },
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// User Preferences — Workspace Preferido
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
 *    Não precisam de UserMembership — eles supervisionam todos os workspaces
 *    do próprio tenant sem habilitação formal. Basta que a company:
 *      - Exista
 *      - Pertença ao mesmo tenant do usuário (tenant isolation)
 *      - Esteja com status ACTIVE
 *
 * 2. MASTER / STANDARD (clientes):
 *    Precisam de UserMembership ATIVA na company — é como o Configurador
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
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        tenant_id: tenantId,
        status: 'ACTIVE',
      },
      select: { id: true },
    })
    return company !== null
  }

  // Clientes (MASTER/STANDARD): requer membership ativa
  const membership = await prisma.userMembership.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
      tenant_id: tenantId,
      is_active: true,
      company: { status: 'ACTIVE' },
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
    if (req.auth.role === 'SUPPLIER') {
      res.json({ data: { preferredCompanyId: null } })
      return
    }

    const user = await prisma.user.findUnique({
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
      await prisma.user.update({
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
 *   - Company deve pertencer ao mesmo tenant (cross-tenant bloqueado).
 */
meRouter.put('/preferences', async (req, res, next) => {
  try {
    // Camada 3 — Autorização: fornecedor não pode marcar preferido
    if (req.auth.role === 'SUPPLIER') {
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
      await prisma.user.update({
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

    await prisma.user.update({
      where: { id: req.auth.userId },
      data: { preferred_company_id: preferredCompanyId },
    })

    res.json({ data: { preferredCompanyId } })
  } catch (err) {
    next(err)
  }
})
