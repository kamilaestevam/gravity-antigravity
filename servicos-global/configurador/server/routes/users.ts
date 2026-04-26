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

export const usersRouter = Router()

// Aplica auth em todas as rotas deste roteador
usersRouter.use(requireAuth)

// ─── Schemas ────────────────────────────────────────────────────────────────

const InviteUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(200),
  role: z.enum(['MASTER', 'PADRAO', 'FORNECEDOR']).default('PADRAO'),
  workspaces: z.union([z.literal('all'), z.array(z.string().cuid()).min(1)]).optional(),
}).refine(
  (data) => data.role === 'MASTER' || data.workspaces !== undefined,
  { message: 'Selecione os workspaces para este tipo de usuário', path: ['workspaces'] },
)

const MembershipSchema = z.object({
  companyId: z.string(),
  role: z.enum(['MASTER', 'PADRAO', 'FORNECEDOR']).default('PADRAO'),
})

export const UpdateWorkspacesSchema = z.object({
  workspaces: z
    .array(z.string().cuid())
    .min(1, 'Selecione pelo menos um workspace')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Workspaces duplicados não são permitidos',
    }),
})

// ─── Rotas ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/usuarios
 * Lista usuários do tenant autenticado
 */
usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await prisma.usuario.findMany({
      where: { id_organizacao_usuario: req.auth.tenantId },
      select: {
        id_usuario: true,
        nome_usuario: true,
        email_usuario: true,
        tipo_usuario: true,
        data_criacao_usuario: true,
        memberships: {
          select: {
            id_usuario_workspace: true,
            id_workspace_usuario_workspace: true,
            tipo_usuario_workspace: true,
            ativo_usuario_workspace: true,
          },
        },
      },
      orderBy: { data_criacao_usuario: 'desc' },
    })
    // DTO DDD: Prisma `role` → `tipo_usuario`, `data_criacao_usuario` → `created_at`, `email_usuario` → `email`
    const usuarios = users.map(({ memberships, data_criacao_usuario, email_usuario, nome_usuario, id_usuario, ...rest }) => ({
      ...rest,
      id: id_usuario,
      created_at: data_criacao_usuario,
      email: email_usuario,
      name: nome_usuario,
      // DTO: UsuarioWorkspace rename → contrato externo legado
      memberships: memberships.map((m) => ({
        id: m.id_usuario_workspace,
        company_id: m.id_workspace_usuario_workspace,
        tipo_usuario: m.tipo_usuario_workspace,
        is_active: m.ativo_usuario_workspace,
      })),
    }))
    res.json({ users: usuarios })
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
      where: { id_organizacao_usuario: req.auth.tenantId, email_usuario: email },
    })
    if (existing) {
      throw new AppError('Usuário já pertence a este tenant', 409, 'CONFLICT')
    }

    // Cria convite via Clerk — sem publicMetadata (Mandamento 01: Clerk só autentica)
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
    })

    // Pré-computa empresas fora da transação — evita lock de longa duração em reads
    const workspacesPayload = parsed.data.workspaces
    let empresasParaVincular: { id_workspace: string }[] = []

    if (role === 'MASTER' || workspacesPayload === 'all') {
      empresasParaVincular = await prisma.empresa.findMany({
        where: { id_organizacao_workspace: req.auth.tenantId, status_workspace: 'ATIVO' },
        select: { id_workspace: true },
      })
    } else if (Array.isArray(workspacesPayload) && workspacesPayload.length > 0) {
      // IDOR prevention: valida que todos os IDs pertencem ao tenant antes do insert
      empresasParaVincular = await prisma.empresa.findMany({
        where: {
          id_workspace: { in: workspacesPayload },
          id_organizacao_workspace: req.auth.tenantId,
          status_workspace: 'ATIVO',
        },
        select: { id_workspace: true },
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
          id_organizacao_usuario: req.auth.tenantId,
          clerk_user_id: `pending_${invitation.id}`,
          email_usuario: email,
          nome_usuario:  name,
          tipo_usuario: role,
        },
      })

      if (empresasParaVincular.length > 0) {
        await tx.usuarioWorkspace.createMany({
          data: empresasParaVincular.map((e) => ({
            id_organizacao_usuario_workspace: req.auth.tenantId,
            id_usuario_usuario_workspace: created.id_usuario,
            id_workspace_usuario_workspace: e.id_workspace,
            tipo_usuario_workspace: role,
            ativo_usuario_workspace: true,
          })),
          skipDuplicates: true,
        })
      }

      return created
    })

    res.status(201).json({
      message: 'Convite enviado com sucesso',
      user: { id: user.id_usuario, email: user.email_usuario, tipo_usuario: user.tipo_usuario },
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
      where: { id_usuario: userId, id_organizacao_usuario: req.auth.tenantId },
    })
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    // Garante que a empresa filha pertence ao mesmo tenant
    const company = await prisma.empresa.findFirst({
      where: { id_workspace: companyId, id_organizacao_workspace: req.auth.tenantId },
    })
    if (!company) {
      throw new AppError('Empresa filha não encontrada', 404, 'NOT_FOUND')
    }

    const membership = await prisma.usuarioWorkspace.upsert({
      where: {
        id_organizacao_usuario_workspace_id_usuario_usuario_workspace_id_workspace_usuario_workspace: {
          id_organizacao_usuario_workspace: req.auth.tenantId,
          id_usuario_usuario_workspace: userId,
          id_workspace_usuario_workspace: companyId,
        },
      },
      create: {
        id_organizacao_usuario_workspace: req.auth.tenantId,
        id_usuario_usuario_workspace: userId,
        id_workspace_usuario_workspace: companyId,
        tipo_usuario_workspace: role,
        ativo_usuario_workspace: true,
      },
      update: { tipo_usuario_workspace: role, ativo_usuario_workspace: true },
    })

    // DTO: UsuarioWorkspace rename → contrato externo legado
    const membershipDto = {
      id: membership.id_usuario_workspace,
      tenant_id: membership.id_organizacao_usuario_workspace,
      user_id: membership.id_usuario_usuario_workspace,
      company_id: membership.id_workspace_usuario_workspace,
      role: membership.tipo_usuario_workspace,
      is_active: membership.ativo_usuario_workspace,
      created_at: membership.data_criacao_usuario_workspace,
      updated_at: membership.data_atualizacao_usuario_workspace,
    }
    res.status(201).json({ membership: membershipDto })
  } catch (err) {
    next(err)
  }
})

// ─── Helpers privados para PUT /:id/workspaces ──────────────────────────────

async function validarWorkspacesDoTenant(
  tenantId: string,
  workspaceIds: string[],
): Promise<void> {
  const empresas = await prisma.empresa.findMany({
    where: { id_workspace: { in: workspaceIds }, id_organizacao_workspace: tenantId, status_workspace: 'ATIVO' },
    select: { id_workspace: true },
  })
  if (empresas.length !== workspaceIds.length) {
    throw new AppError(
      'Um ou mais workspaces não pertencem a esta organização',
      403,
      'FORBIDDEN',
    )
  }
}

async function substituirWorkspacesAtomicamente(
  tenantId: string,
  userId: string,
  workspaceIds: string[],
  role: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.usuarioWorkspace.deleteMany({
      where: {
        id_organizacao_usuario_workspace: tenantId,
        id_usuario_usuario_workspace: userId,
      },
    })
    await tx.usuarioWorkspace.createMany({
      // tipo_usuario_workspace é o enum TipoUsuarioEmpresa — cast para preservar a baseline pré-onda
      data: workspaceIds.map((companyId) => ({
        id_organizacao_usuario_workspace: tenantId,
        id_usuario_usuario_workspace: userId,
        id_workspace_usuario_workspace: companyId,
        tipo_usuario_workspace: role as 'MASTER' | 'PADRAO' | 'FORNECEDOR',
        ativo_usuario_workspace: true,
      })),
      skipDuplicates: true,
    })
  })
}

/**
 * PUT /api/v1/usuarios/:id/workspaces
 * Substitui atomicamente os workspaces vinculados a um usuário STANDARD/SUPPLIER
 */
usersRouter.put('/:id/workspaces', requireMasterRole, async (req, res, next) => {
  try {
    const parsed = UpdateWorkspacesSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { workspaces: workspaceIds } = parsed.data
    const userId = req.params.id

    const user = await prisma.usuario.findFirst({
      where: { id_usuario: userId, id_organizacao_usuario: req.auth.tenantId },
      select: { id_usuario: true, tipo_usuario: true },
    })
    if (!user) throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    if (user.tipo_usuario === 'MASTER') {
      throw new AppError('Usuário Master tem acesso a todos os workspaces automaticamente', 400, 'INVALID_OPERATION')
    }

    await validarWorkspacesDoTenant(req.auth.tenantId, workspaceIds)

    const antesIds = await prisma.usuarioWorkspace
      .findMany({
        where: {
          id_organizacao_usuario_workspace: req.auth.tenantId,
          id_usuario_usuario_workspace: userId,
        },
        select: { id_workspace_usuario_workspace: true },
      })
      .then((ws) => ws.map((w) => w.id_workspace_usuario_workspace))

    await substituirWorkspacesAtomicamente(req.auth.tenantId, userId, workspaceIds, user.tipo_usuario)

    const adicionados = workspaceIds.filter((id) => !antesIds.includes(id))
    const removidos = antesIds.filter((id) => !workspaceIds.includes(id))
    if (adicionados.length > 0 || removidos.length > 0) {
      securityAudit.permissionChanged(req.auth.tenantId, req.auth.userId, {
        targetUserId: userId,
        permission: 'workspace_access',
        action: adicionados.length > 0 ? 'GRANTED' : 'REVOKED',
      }).catch(() => {})
    }

    res.json({ workspaces: workspaceIds })
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
      role: z.enum(['MASTER', 'PADRAO', 'FORNECEDOR']),
    })
    const parsed = RoleSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('Role inválido', 400, 'VALIDATION_ERROR')
    }

    const user = await prisma.usuario.findFirst({
      where: { id_usuario: req.params.id, id_organizacao_usuario: req.auth.tenantId },
      select: { id_usuario: true, clerk_user_id: true, tipo_usuario: true },
    })
    if (!user) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const updated = await prisma.usuario.update({
      where: { id_usuario: req.params.id, id_organizacao_usuario: req.auth.tenantId },
      data: { tipo_usuario: parsed.data.role },
      select: { id_usuario: true, email_usuario: true, tipo_usuario: true },
    })

    securityAudit.roleChanged(req.auth.tenantId, req.auth.userId, {
      targetUserId: req.params.id,
      oldRole: user.tipo_usuario,
      newRole: parsed.data.role,
    }).catch(() => {})

    // DTO DDD: Prisma `email_usuario` → `email`, `id_usuario` → `id`
    const { email_usuario, id_usuario, ...rest } = updated
    res.json({ user: { ...rest, id: id_usuario, email: email_usuario } })
  } catch (err) {
    next(err)
  }
})
