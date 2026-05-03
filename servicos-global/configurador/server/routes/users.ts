// server/routes/users.ts
// Gestão de usuários e vínculos com workspaces da organização autenticada.
// Contrato em DDD puro (PT-BR) — chaves espelham o schema Prisma; respostas exportam
// schemas Zod (Mand. 09) para validação bilateral no frontend.
//
// GET   /api/v1/usuarios                              → listar usuários da organização
// POST  /api/v1/usuarios/convidar                     → convidar usuário (Master)
// POST  /api/v1/usuarios/:id_usuario/vinculos         → habilitar em workspace (Master)
// PUT   /api/v1/usuarios/:id_usuario/workspaces       → substituir vínculos (Master)
// PATCH /api/v1/usuarios/:id_usuario/patente          → alterar tipo_usuario (Master)

import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireMasterRole } from '../middleware/requireMasterRole.js'
import { prisma } from '../lib/prisma.js'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { securityAudit } from '../../../servicos-plataforma/historico-global/server/lib/securityAuditLogger.js'

export const usersRouter = Router()

// Aplica auth em todas as rotas deste roteador
usersRouter.use(requireAuth)

// ─── Schemas Zod (Mand. 06 e 09 — contratos bilaterais) ─────────────────────

const TipoUsuarioEnum = z.enum(['MASTER', 'PADRAO', 'FORNECEDOR'])

export const ConvidarUsuarioSchema = z.object({
  email_usuario: z.string().email().max(255),
  nome_usuario: z.string().min(1).max(200),
  tipo_usuario: TipoUsuarioEnum.default('PADRAO'),
  // workspaces_alvo: lista de workspaces a vincular OU 'all' (todos os ATIVOs).
  // Obrigatório para PADRAO/FORNECEDOR; ignorado para MASTER (acesso implícito a todos).
  workspaces_alvo: z.union([z.literal('all'), z.array(z.string().cuid()).min(1)]).optional(),
}).refine(
  (data) => data.tipo_usuario === 'MASTER' || data.workspaces_alvo !== undefined,
  { message: 'Selecione os workspaces para este tipo de usuário', path: ['workspaces_alvo'] },
)

const VincularUsuarioWorkspaceSchema = z.object({
  id_workspace: z.string(),
  tipo_usuario_workspace: TipoUsuarioEnum.default('PADRAO'),
})

export const SubstituirWorkspacesUsuarioSchema = z.object({
  workspaces: z
    .array(z.string().cuid())
    .min(1, 'Selecione pelo menos um workspace')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Workspaces duplicados não são permitidos',
    }),
})

const AlterarTipoUsuarioSchema = z.object({
  tipo_usuario: TipoUsuarioEnum,
})

// ─── Schemas Zod de resposta (Mand. 09) ─────────────────────────────────────
// Exportados para uso no frontend (.parse) e em testes de contrato.

export const usuarioWorkspaceItemSchema = z.object({
  id_usuario_workspace: z.string(),
  id_workspace: z.string(),
  tipo_usuario_workspace: TipoUsuarioEnum,
  ativo_usuario_workspace: z.boolean(),
})

export const usuarioListItemSchema = z.object({
  id_usuario: z.string(),
  nome_usuario: z.string(),
  email_usuario: z.string().email(),
  tipo_usuario: z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR']),
  data_criacao_usuario: z.union([z.string(), z.date()]),
  usuario_workspaces: z.array(usuarioWorkspaceItemSchema),
})

export const listarUsuariosResponseSchema = z.object({
  usuarios: z.array(usuarioListItemSchema),
})

export const convidarUsuarioResponseSchema = z.object({
  message: z.string(),
  usuario: z.object({
    id_usuario: z.string(),
    email_usuario: z.string().email(),
    tipo_usuario: TipoUsuarioEnum,
  }),
})

export const usuarioWorkspaceResponseSchema = z.object({
  usuario_workspace: z.object({
    id_usuario_workspace: z.string(),
    id_organizacao: z.string(),
    id_usuario: z.string(),
    id_workspace: z.string(),
    tipo_usuario_workspace: TipoUsuarioEnum,
    ativo_usuario_workspace: z.boolean(),
    data_criacao_usuario_workspace: z.union([z.string(), z.date()]),
    data_atualizacao_usuario_workspace: z.union([z.string(), z.date()]),
  }),
})

export const alterarTipoUsuarioResponseSchema = z.object({
  usuario: z.object({
    id_usuario: z.string(),
    email_usuario: z.string().email(),
    tipo_usuario: TipoUsuarioEnum,
  }),
})

export const substituirWorkspacesResponseSchema = z.object({
  workspaces: z.array(z.string()),
})

// ─── Rotas ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/usuarios
 * Lista usuários da organização autenticada.
 * Contrato em DDD puro: envelope `{ usuarios }`, relation Prisma `memberships`
 * renomeada para `usuario_workspaces` no DTO (schema é intocável — Mand. 02).
 */
usersRouter.get('/', async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { id_organizacao: req.auth.id_organizacao },
      select: {
        id_usuario: true,
        nome_usuario: true,
        email_usuario: true,
        tipo_usuario: true,
        data_criacao_usuario: true,
        memberships: {
          select: {
            id_usuario_workspace: true,
            id_workspace: true,
            tipo_usuario_workspace: true,
            ativo_usuario_workspace: true,
          },
        },
      },
      orderBy: { data_criacao_usuario: 'desc' },
    })
    // Renomeia relation Prisma `memberships` → `usuario_workspaces` no DTO (campo do
    // schema é intocável — Mand. 02). Demais campos passam direto (paridade Prisma↔DTO).
    const dto = usuarios.map(({ memberships, ...rest }) => ({
      ...rest,
      usuario_workspaces: memberships,
    }))
    res.json({ usuarios: dto })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/usuarios/convidar
 * Convida um usuário para a organização — dispara e-mail via Clerk
 */
usersRouter.post('/convidar', requireMasterRole, async (req, res, next) => {
  try {
    const parsed = ConvidarUsuarioSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const { email_usuario, nome_usuario, tipo_usuario, workspaces_alvo } = parsed.data

    // Verifica se usuário já existe na organização
    const existente = await prisma.usuario.findFirst({
      where: { id_organizacao: req.auth.id_organizacao, email_usuario },
    })
    if (existente) {
      throw new AppError('Usuário já pertence a esta organização', 409, 'CONFLICT')
    }

    // Cria convite via Clerk — sem publicMetadata (Mandamento 01: Clerk só autentica)
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email_usuario,
    })

    // Pré-computa workspaces fora da transação — evita lock de longa duração em reads
    let workspacesParaVincular: { id_workspace: string }[] = []

    if (tipo_usuario === 'MASTER' || workspaces_alvo === 'all') {
      workspacesParaVincular = await prisma.workspace.findMany({
        where: { id_organizacao: req.auth.id_organizacao, status_workspace: 'ATIVO' },
        select: { id_workspace: true },
      })
    } else if (Array.isArray(workspaces_alvo) && workspaces_alvo.length > 0) {
      // IDOR prevention: valida que todos os IDs pertencem à organização antes do insert
      workspacesParaVincular = await prisma.workspace.findMany({
        where: {
          id_workspace: { in: workspaces_alvo },
          id_organizacao: req.auth.id_organizacao,
          status_workspace: 'ATIVO',
        },
        select: { id_workspace: true },
      })
      if (workspacesParaVincular.length !== workspaces_alvo.length) {
        throw new AppError(
          'Um ou mais workspaces não pertencem a esta organização',
          403,
          'FORBIDDEN',
        )
      }
    }

    // Cria usuário + vínculos atomicamente — se o createMany falhar, o usuário não é criado
    const usuario = await prisma.$transaction(async (tx) => {
      const criado = await tx.usuario.create({
        data: {
          id_organizacao: req.auth.id_organizacao,
          id_clerk_usuario: `pending_${invitation.id}`,
          email_usuario,
          nome_usuario,
          tipo_usuario,
        },
      })

      if (workspacesParaVincular.length > 0) {
        await tx.usuarioWorkspace.createMany({
          data: workspacesParaVincular.map((w) => ({
            id_organizacao: req.auth.id_organizacao,
            id_usuario: criado.id_usuario,
            id_workspace: w.id_workspace,
            tipo_usuario_workspace: tipo_usuario,
            ativo_usuario_workspace: true,
          })),
          skipDuplicates: true,
        })
      }

      return criado
    })

    res.status(201).json({
      message: 'Convite enviado com sucesso',
      usuario: {
        id_usuario: usuario.id_usuario,
        email_usuario: usuario.email_usuario,
        tipo_usuario: usuario.tipo_usuario,
      },
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/v1/usuarios/:id_usuario/vinculos
 * Habilita usuário em um workspace com um papel específico
 */
usersRouter.post('/:id_usuario/vinculos', requireMasterRole, async (req, res, next) => {
  try {
    const parsed = VincularUsuarioWorkspaceSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Dados inválidos',
        400,
        'VALIDATION_ERROR'
      )
    }

    const { id_workspace, tipo_usuario_workspace } = parsed.data
    const id_usuario = req.params.id_usuario

    // Garante que o usuário pertence à mesma organização
    const usuario = await prisma.usuario.findFirst({
      where: { id_usuario, id_organizacao: req.auth.id_organizacao },
    })
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    // Garante que o workspace pertence à mesma organização
    const workspace = await prisma.workspace.findFirst({
      where: { id_workspace, id_organizacao: req.auth.id_organizacao },
    })
    if (!workspace) {
      throw new AppError('Workspace não encontrado', 404, 'NOT_FOUND')
    }

    const usuarioWorkspace = await prisma.usuarioWorkspace.upsert({
      where: {
        id_organizacao_id_usuario_id_workspace: {
          id_organizacao: req.auth.id_organizacao,
          id_usuario,
          id_workspace,
        },
      },
      create: {
        id_organizacao: req.auth.id_organizacao,
        id_usuario,
        id_workspace,
        tipo_usuario_workspace,
        ativo_usuario_workspace: true,
      },
      update: { tipo_usuario_workspace, ativo_usuario_workspace: true },
    })

    res.status(201).json({ usuario_workspace: usuarioWorkspace })
  } catch (err) {
    next(err)
  }
})

// ─── Helpers privados para PUT /:id/workspaces ──────────────────────────────

async function validarWorkspacesDoTenant(
  id_organizacao: string,
  workspaceIds: string[],
): Promise<void> {
  const empresas = await prisma.workspace.findMany({
    where: { id_workspace: { in: workspaceIds }, id_organizacao: id_organizacao, status_workspace: 'ATIVO' },
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
  id_organizacao: string,
  id_usuario: string,
  workspaceIds: string[],
  tipo_usuario_workspace: 'MASTER' | 'PADRAO' | 'FORNECEDOR',
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.usuarioWorkspace.deleteMany({
      where: { id_organizacao, id_usuario },
    })
    await tx.usuarioWorkspace.createMany({
      data: workspaceIds.map((id_workspace) => ({
        id_organizacao,
        id_usuario,
        id_workspace,
        tipo_usuario_workspace,
        ativo_usuario_workspace: true,
      })),
      skipDuplicates: true,
    })
  })
}

/**
 * PUT /api/v1/usuarios/:id_usuario/workspaces
 * Substitui atomicamente os workspaces vinculados a um usuário STANDARD/SUPPLIER
 */
usersRouter.put('/:id_usuario/workspaces', requireMasterRole, async (req, res, next) => {
  try {
    const parsed = SubstituirWorkspacesUsuarioSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { workspaces: workspaceIds } = parsed.data
    const id_usuario = req.params.id_usuario

    const usuario = await prisma.usuario.findFirst({
      where: { id_usuario, id_organizacao: req.auth.id_organizacao },
      select: { id_usuario: true, tipo_usuario: true },
    })
    if (!usuario) throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    if (usuario.tipo_usuario === 'MASTER') {
      throw new AppError('Usuário Master tem acesso a todos os workspaces automaticamente', 400, 'INVALID_OPERATION')
    }
    // SUPER_ADMIN/ADMIN também não passam por vínculo formal — bloqueio defensivo
    if (usuario.tipo_usuario !== 'PADRAO' && usuario.tipo_usuario !== 'FORNECEDOR') {
      throw new AppError('Tipo de usuário não vincula a workspaces', 400, 'INVALID_OPERATION')
    }

    await validarWorkspacesDoTenant(req.auth.id_organizacao, workspaceIds)

    const antesIds = await prisma.usuarioWorkspace
      .findMany({
        where: {
          id_organizacao: req.auth.id_organizacao,
          id_usuario,
        },
        select: { id_workspace: true },
      })
      .then((ws) => ws.map((w) => w.id_workspace))

    await substituirWorkspacesAtomicamente(req.auth.id_organizacao, id_usuario, workspaceIds, usuario.tipo_usuario)

    const adicionados = workspaceIds.filter((id) => !antesIds.includes(id))
    const removidos = antesIds.filter((id) => !workspaceIds.includes(id))
    if (adicionados.length > 0 || removidos.length > 0) {
      securityAudit.permissionChanged(req.auth.id_organizacao, req.auth.id_usuario, {
        targetUserId: id_usuario,
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
 * PATCH /api/v1/usuarios/:id_usuario/patente
 * Atualiza a patente (tipo_usuario) de um usuário na organização.
 */
usersRouter.patch('/:id_usuario/patente', requireMasterRole, async (req, res, next) => {
  try {
    const parsed = AlterarTipoUsuarioSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Tipo de usuário inválido',
        400,
        'VALIDATION_ERROR',
      )
    }

    const usuario = await prisma.usuario.findFirst({
      where: { id_usuario: req.params.id_usuario, id_organizacao: req.auth.id_organizacao },
      select: { id_usuario: true, id_clerk_usuario: true, tipo_usuario: true },
    })
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const atualizado = await prisma.usuario.update({
      where: { id_usuario: req.params.id_usuario, id_organizacao: req.auth.id_organizacao },
      data: { tipo_usuario: parsed.data.tipo_usuario },
      select: { id_usuario: true, email_usuario: true, tipo_usuario: true },
    })

    securityAudit.roleChanged(req.auth.id_organizacao, req.auth.id_usuario, {
      targetUserId: req.params.id_usuario,
      oldRole: usuario.tipo_usuario,
      newRole: parsed.data.tipo_usuario,
    }).catch(() => {})

    res.json({ usuario: atualizado })
  } catch (err) {
    next(err)
  }
})
