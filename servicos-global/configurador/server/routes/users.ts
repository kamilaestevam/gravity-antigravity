// server/routes/users.ts
// Gestão de usuários e permissões no tenant
// GET  /api/v1/users          — listar usuários do tenant
// POST /api/v1/users/invite   — convidar usuário
// POST /api/v1/users/:id/memberships — habilitar em empresa filha
// PATCH /api/v1/users/:id/role — definir role

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { prisma } from '../lib/prisma.js'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'

export const usersRouter = Router()

// Aplica auth em todas as rotas deste roteador
usersRouter.use(requireAuth)

// ─── Schemas ────────────────────────────────────────────────────────────────

const InviteUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['MASTER', 'STANDARD', 'SUPPLIER']).default('STANDARD'),
})

const MembershipSchema = z.object({
  companyId: z.string(),
  role: z.enum(['MASTER', 'STANDARD', 'SUPPLIER']).default('STANDARD'),
})

// ─── Rotas ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/users
 * Lista usuários do tenant autenticado
 */
usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { tenant_id: req.auth.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        memberships: {
          select: {
            id: true,
            company_id: true,
            role: true,
            is_active: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })
    res.json({ users })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/users/invite
 * Convida um usuário para o tenant — dispara e-mail via Clerk
 */
usersRouter.post('/invite', async (req, res, next) => {
  try {
    const parsed = InviteUserSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const { email, name, role } = parsed.data

    // Verifica se usuário já existe no tenant
    const existing = await prisma.user.findFirst({
      where: { tenant_id: req.auth.tenantId, email },
    })
    if (existing) {
      throw new AppError('Usuário já pertence a este tenant', 409, 'CONFLICT')
    }

    // Cria convite via Clerk
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        tenantId: req.auth.tenantId,
        role,
        invitedBy: req.auth.clerkUserId,
      },
    })

    // Cria registro antecipado no banco (será completado no webhook de user.created)
    const user = await prisma.user.create({
      data: {
        tenant_id: req.auth.tenantId,
        clerk_user_id: `pending_${invitation.id}`,
        email,
        name,
        role,
      },
    })

    res.status(201).json({
      message: 'Convite enviado com sucesso',
      user: { id: user.id, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/users/:id/memberships
 * Habilita usuário em uma empresa filha com um papel específico
 */
usersRouter.post('/:id/memberships', async (req, res, next) => {
  try {
    const parsed = MembershipSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const { companyId, role } = parsed.data
    const userId = req.params.id

    // Garante que o usuário pertence ao mesmo tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenant_id: req.auth.tenantId },
    })
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    // Garante que a empresa filha pertence ao mesmo tenant
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenant_id: req.auth.tenantId },
    })
    if (!company) {
      throw new AppError('Empresa filha não encontrada', 404, 'NOT_FOUND')
    }

    const membership = await prisma.userMembership.upsert({
      where: {
        tenant_id_user_id_company_id: {
          tenant_id: req.auth.tenantId,
          user_id: userId,
          company_id: companyId,
        },
      },
      create: {
        tenant_id: req.auth.tenantId,
        user_id: userId,
        company_id: companyId,
        role,
        is_active: true,
      },
      update: { role, is_active: true },
    })

    res.status(201).json({ membership })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/v1/users/:id/role
 * Atualiza o role de um usuário no tenant
 */
usersRouter.patch('/:id/role', async (req, res, next) => {
  try {
    const RoleSchema = z.object({
      role: z.enum(['MASTER', 'STANDARD', 'SUPPLIER']),
    })
    const parsed = RoleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('Role inválido', 400, 'VALIDATION_ERROR')
    }

    const user = await prisma.user.findFirst({
      where: { id: req.params.id, tenant_id: req.auth.tenantId },
    })
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id, tenant_id: req.auth.tenantId },
      data: { role: parsed.data.role },
      select: { id: true, email: true, role: true },
    })
    res.json({ user: updated })
  } catch (err) {
    next(err)
  }
})
