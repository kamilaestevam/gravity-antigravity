// server/routes/users.ts
// Gestão de usuários e permissões no tenant
// GET  /api/v1/usuarios          — listar usuários do tenant
// POST /api/v1/usuarios/invite   — convidar usuário
// POST /api/v1/usuarios/:id/memberships — habilitar em empresa filha
// PATCH /api/v1/usuarios/:id/role — definir role

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireMasterRole } from '../middleware/requireMasterRole.js'
import { prisma } from '../lib/prisma.js'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { securityAudit } from '../../../tenant/historico-global/server/lib/securityAuditLogger.js'
import { syncRoleToClerk } from '../lib/syncRole.js'

export const usersRouter = Router()

// Aplica auth em todas as rotas deste roteador
usersRouter.use(requireAuth)

// ─── Schemas ────────────────────────────────────────────────────────────────

const InviteUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(200),
  role: z.enum(['MASTER', 'STANDARD', 'SUPPLIER']).default('STANDARD'),
  workspaces: z.union([z.literal('all'), z.array(z.string().cuid()).min(1)]).optional(),
}).refine(
  (data) => data.role === 'MASTER' || data.workspaces !== undefined,
  { message: 'Selecione os workspaces para este tipo de usuário', path: ['workspaces'] },
)

const MembershipSchema = z.object({
  companyId: z.string(),
  role: z.enum(['MASTER', 'STANDARD', 'SUPPLIER']).default('STANDARD'),
})

// ─── Rotas ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/usuarios
 * Lista usuários do tenant autenticado
 */
usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await prisma.usuario.findMany({
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
 * POST /api/v1/usuarios/invite
 * Convida um usuário para o tenant — dispara e-mail via Clerk
 */
usersRouter.post('/invite', requireMasterRole, async (req, res, next) => {
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
    const existing = await prisma.usuario.findFirst({
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

    // Pré-computa empresas fora da transação — evita lock de longa duração em reads
    const workspacesPayload = parsed.data.workspaces
    let empresasParaVincular: { id: string }[] = []

    if (role === 'MASTER' || workspacesPayload === 'all') {
      empresasParaVincular = await prisma.empresa.findMany({
        where: { tenant_id: req.auth.tenantId, status: 'ACTIVE' },
        select: { id: true },
      })
    } else if (Array.isArray(workspacesPayload) && workspacesPayload.length > 0) {
      // IDOR prevention: valida que todos os IDs pertencem ao tenant antes do insert
      empresasParaVincular = await prisma.empresa.findMany({
        where: {
          id: { in: workspacesPayload },
          tenant_id: req.auth.tenantId,
          status: 'ACTIVE',
        },
        select: { id: true },
      })
      if (empresasParaVincular.length !== workspacesPayload.length) {
        throw new AppError(
          'Um ou mais workspaces não pertencem a esta organização',
          403,
          'FORBIDDEN',
        )
      }
    }

    // Cria usuário + vínculos atomicamente — se o createMany falhar, o usuário não é criado
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.usuario.create({
        data: {
          tenant_id: req.auth.tenantId,
          clerk_user_id: `pending_${invitation.id}`,
          email,
          name,
          role,
        },
      })

      if (empresasParaVincular.length > 0) {
        await tx.usuarioWorkspace.createMany({
          data: empresasParaVincular.map((e) => ({
            tenant_id: req.auth.tenantId,
            user_id: created.id,
            company_id: e.id,
            role,
            is_active: true,
          })),
          skipDuplicates: true,
        })
      }

      return created
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
 * POST /api/v1/usuarios/:id/memberships
 * Habilita usuário em uma empresa filha com um papel específico
 */
usersRouter.post('/:id/memberships', requireMasterRole, async (req, res, next) => {
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
    const user = await prisma.usuario.findFirst({
      where: { id: userId, tenant_id: req.auth.tenantId },
    })
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    // Garante que a empresa filha pertence ao mesmo tenant
    const company = await prisma.empresa.findFirst({
      where: { id: companyId, tenant_id: req.auth.tenantId },
    })
    if (!company) {
      throw new AppError('Empresa filha não encontrada', 404, 'NOT_FOUND')
    }

    const membership = await prisma.usuarioWorkspace.upsert({
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
 * PATCH /api/v1/usuarios/:id/role
 * Atualiza o role de um usuário no tenant
 */
usersRouter.patch('/:id/role', requireMasterRole, async (req, res, next) => {
  try {
    const RoleSchema = z.object({
      role: z.enum(['MASTER', 'STANDARD', 'SUPPLIER']),
    })
    const parsed = RoleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('Role inválido', 400, 'VALIDATION_ERROR')
    }

    const user = await prisma.usuario.findFirst({
      where: { id: req.params.id, tenant_id: req.auth.tenantId },
      select: { id: true, clerk_user_id: true, role: true },
    })
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await prisma.usuario.update({
      where: { id: req.params.id, tenant_id: req.auth.tenantId },
      data: { role: parsed.data.role },
      select: { id: true, email: true, role: true },
    })

    securityAudit.roleChanged(req.auth.tenantId, req.auth.userId, {
      targetUserId: req.params.id,
      oldRole: user.role,
      newRole: parsed.data.role,
    }).catch(() => {})

    // Sincroniza o novo role para o Clerk (badge e useSyncClerkToShell leem daqui)
    if (user.clerk_user_id && !user.clerk_user_id.startsWith('pending_')) {
      syncRoleToClerk(user.clerk_user_id, req.auth.tenantId, parsed.data.role).catch((err) => {
        console.error('[users.patch.role] syncRoleToClerk falhou:', err)
      })
    }

    res.json({ user: updated })
  } catch (err) {
    next(err)
  }
})
