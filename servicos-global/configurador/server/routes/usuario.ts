// server/routes/usuario.ts
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
import { requireUserManagementRole } from '../middleware/requireUserManagementRole.js'
import { prisma } from '../lib/prisma.js'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { securityAudit } from '../../../servicos-plataforma/historico-global/server/lib/securityAuditLogger.js'
import {
  servicoPermissaoUsuario,
  permissaoStringSchema,
  PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS,
} from '../services/permissao-usuario-servico.js'

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
  // Mand. 04 garante que MASTER/SAdmin/ADMIN são bloqueados na rota com 400
  // ('tipo_usuario não vincula a workspaces'). Para PADRAO/FORNECEDOR, array
  // vazio é estado válido — significa "revogar acesso a todos os workspaces"
  // sem alterar o tipo do usuário (decisão dono 2026-05-05, padrão Assinaturas).
  workspaces: z
    .array(z.string().cuid())
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Workspaces duplicados não são permitidos',
    }),
})

// PATCH /patente aceita o conjunto completo de tipos. A whitelist por ator
// (SAdmin pode tudo, Admin não pode promover a SAdmin, etc.) é validada em
// runtime para preservar mensagens específicas.
const TipoUsuarioPatenteEnum = z.enum(['SUPER_ADMIN', 'ADMIN', 'MASTER', 'PADRAO', 'FORNECEDOR'])

const AlterarTipoUsuarioSchema = z.object({
  tipo_usuario: TipoUsuarioPatenteEnum,
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
  acesso_workspaces_futuros: z.boolean(),
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
    acesso_workspaces_futuros: z.boolean(),
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
    tipo_usuario: TipoUsuarioPatenteEnum,
    acesso_workspaces_futuros: z.boolean(),
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
        acesso_workspaces_futuros: true,
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

    // Cria convite via Clerk — sem publicMetadata (Mandamento 01: Clerk só autentica).
    // `redirectUrl` faz o link do e-mail apontar para a tela Gravity-styled
    // /cadastro/continuar em vez do Account Portal hospedado em *.accounts.dev.
    const APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:8000'
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email_usuario,
      redirectUrl: `${APP_BASE_URL}/cadastro/continuar`,
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

    // Auto-vínculo a workspaces futuros (decisão arquitetural 2026-05-05).
    // Quando o admin convida com 'all', o usuário também recebe vínculo automático
    // a workspaces criados depois (F3). MASTER tem bypass por Mand. 04 — flag false.
    const acesso_workspaces_futuros =
      workspaces_alvo === 'all' && (tipo_usuario === 'PADRAO' || tipo_usuario === 'FORNECEDOR')

    // Cria usuário + vínculos atomicamente — se o createMany falhar, o usuário não é criado
    const usuario = await prisma.$transaction(async (tx) => {
      const criado = await tx.usuario.create({
        data: {
          id_organizacao: req.auth.id_organizacao,
          id_clerk_usuario: `pending_${invitation.id}`,
          email_usuario,
          nome_usuario,
          tipo_usuario,
          acesso_workspaces_futuros,
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
        acesso_workspaces_futuros: usuario.acesso_workspaces_futuros,
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
 * Substitui atomicamente os workspaces vinculados a um usuário PADRAO/FORNECEDOR.
 *
 * Autorização: SUPER_ADMIN (escopo global), ADMIN/MASTER (escopo da própria
 * id_organizacao). Anti-escalada — ator não pode editar próprios vínculos.
 */
usersRouter.put('/:id_usuario/workspaces', requireUserManagementRole, async (req, res, next) => {
  try {
    const parsed = SubstituirWorkspacesUsuarioSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const { workspaces: workspaceIds } = parsed.data
    const id_usuario = req.params.id_usuario

    // Anti-escalada: ator não altera os próprios vínculos
    if (id_usuario === req.auth.id_usuario) {
      throw new AppError(
        'Você não pode alterar os próprios vínculos de workspace',
        403,
        'FORBIDDEN_SELF_EDIT',
      )
    }

    // SUPER_ADMIN tem escopo global; demais limitam à própria organização
    const usuario = req.auth.tipo_usuario === 'SUPER_ADMIN'
      ? await prisma.usuario.findFirst({
          where: { id_usuario },
          select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
        })
      : await prisma.usuario.findFirst({
          where: { id_usuario, id_organizacao: req.auth.id_organizacao },
          select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
        })

    if (!usuario) throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')

    if (usuario.tipo_usuario === 'MASTER') {
      throw new AppError('Usuário Master tem acesso a todos os workspaces automaticamente', 400, 'INVALID_OPERATION')
    }
    // SUPER_ADMIN/ADMIN também não passam por vínculo formal — bloqueio defensivo
    if (usuario.tipo_usuario !== 'PADRAO' && usuario.tipo_usuario !== 'FORNECEDOR') {
      throw new AppError('Tipo de usuário não vincula a workspaces', 400, 'INVALID_OPERATION')
    }

    // Validação dos workspaces: SUPER_ADMIN usa a organização do alvo,
    // demais usam a própria organização do ator (já é a mesma do alvo).
    const idOrganizacaoAlvo = usuario.id_organizacao
    await validarWorkspacesDoTenant(idOrganizacaoAlvo, workspaceIds)

    const antesIds = await prisma.usuarioWorkspace
      .findMany({
        where: { id_organizacao: idOrganizacaoAlvo, id_usuario },
        select: { id_workspace: true },
      })
      .then((ws) => ws.map((w) => w.id_workspace))

    await substituirWorkspacesAtomicamente(idOrganizacaoAlvo, id_usuario, workspaceIds, usuario.tipo_usuario)

    const adicionados = workspaceIds.filter((id) => !antesIds.includes(id))
    const removidos = antesIds.filter((id) => !workspaceIds.includes(id))
    if (adicionados.length > 0 || removidos.length > 0) {
      securityAudit.permissionChanged(idOrganizacaoAlvo, req.auth.id_usuario, {
        id_usuario_alvo: id_usuario,
        nome_permissao:  'workspace_access',
        acao_permissao:  adicionados.length > 0 ? 'GRANTED' : 'REVOKED',
      }, req.auth.nome_usuario).catch(() => {})
    }

    res.json({ workspaces: workspaceIds })
  } catch (err) {
    next(err)
  }
})

// ─── PATCH /:id_usuario/patente — regras de autorização ─────────────────────
// Documentadas em skills/seguranca/permissoes/SKILL.md. Resumo:
// - SUPER_ADMIN: edita qualquer um para qualquer valor (escopo global)
// - ADMIN: edita qualquer um exceto SUPER_ADMIN; não promove a SUPER_ADMIN
// - MASTER: edita usuários da própria id_organizacao exceto outros MASTERs;
//   pode promover PADRAO/FORNECEDOR para MASTER; só seta MASTER/PADRAO/FORNECEDOR
// - Ator ≠ alvo (anti-escalada)
// - Último MASTER da org NÃO pode ser rebaixado (anti-bricking) — checagem
//   serializada via $transaction(isolationLevel: Serializable)
// - Cross-organização → 404 (não vaza existência)

type TipoUsuarioPatente = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR'

function autorizarAlteracaoPatente(
  ator: { id_usuario: string; tipo_usuario: string; id_organizacao: string },
  alvo: { id_usuario: string; tipo_usuario: string; id_organizacao: string },
  novoTipo: TipoUsuarioPatente,
): void {
  // Anti-escalada: ninguém edita o próprio tipo
  if (ator.id_usuario === alvo.id_usuario) {
    throw new AppError(
      'Você não pode alterar o próprio tipo de usuário',
      403,
      'FORBIDDEN_SELF_EDIT',
    )
  }

  // Regra ε (skill `seguranca/permissoes`): SUPER_ADMIN e ADMIN são tipos
  // internos da Equipe Gravity e só podem ser atribuídos via seed do banco.
  // Aplica-se a TODOS os atores (inclusive SAdmin) — é regra absoluta de
  // negócio, não relativa à patente do ator. Posicionada após a anti-escalada
  // e ANTES dos blocks de ator específicos para garantir que toda tentativa
  // de promoção a Gravity-tier é rejeitada de forma uniforme.
  if (novoTipo === 'SUPER_ADMIN' || novoTipo === 'ADMIN') {
    throw new AppError(
      'SUPER_ADMIN/ADMIN são tipos internos da Gravity e só podem ser atribuídos via seed do banco',
      403,
      'FORBIDDEN_PROMOTE_GRAVITY_TIER',
    )
  }

  if (ator.tipo_usuario === 'SUPER_ADMIN') {
    // SUPER_ADMIN tem escopo global e pode atribuir qualquer tipo não-Gravity
    return
  }

  if (ator.tipo_usuario === 'ADMIN') {
    // ADMIN não pode mexer em SUPER_ADMIN nem em outro ADMIN
    // (promoção a SUPER_ADMIN/ADMIN já bloqueada pelo guard regra ε acima)
    if (alvo.tipo_usuario === 'SUPER_ADMIN') {
      throw new AppError(
        'Admin não pode editar Super Admin',
        403,
        'FORBIDDEN_ADMIN_VS_SUPER_ADMIN',
      )
    }
    return
  }

  if (ator.tipo_usuario === 'MASTER') {
    // MASTER tem escopo da própria organização (já validado pelo findFirst)
    if (alvo.tipo_usuario === 'MASTER') {
      throw new AppError(
        'Master não pode editar outro Master',
        403,
        'FORBIDDEN_MASTER_VS_MASTER',
      )
    }
    if (alvo.tipo_usuario === 'SUPER_ADMIN' || alvo.tipo_usuario === 'ADMIN') {
      throw new AppError(
        'Master não pode editar usuários Gravity (Super Admin/Admin)',
        403,
        'FORBIDDEN_MASTER_VS_GRAVITY',
      )
    }
    if (novoTipo !== 'MASTER' && novoTipo !== 'PADRAO' && novoTipo !== 'FORNECEDOR') {
      throw new AppError(
        'Master só pode atribuir Master, Standard ou Fornecedor',
        403,
        'FORBIDDEN_MASTER_INVALID_TARGET_TYPE',
      )
    }
    return
  }

  // Defesa em profundidade — middleware já bloqueou, mas evita falso positivo
  throw new AppError(
    'Tipo de usuário do ator não permite gestão',
    403,
    'FORBIDDEN',
  )
}

/**
 * PATCH /api/v1/usuarios/:id_usuario/patente
 * Atualiza a patente (tipo_usuario) de um usuário.
 *
 * Autorização: ver `autorizarAlteracaoPatente`.
 * Anti-bricking: rebaixar o último MASTER da organização é proibido — checagem
 * dentro de $transaction Serializable para evitar race condition entre dois
 * Masters se rebaixando simultaneamente.
 */
usersRouter.patch('/:id_usuario/patente', requireUserManagementRole, async (req, res, next) => {
  try {
    const parsed = AlterarTipoUsuarioSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(
        parsed.error.errors[0]?.message ?? 'Tipo de usuário inválido',
        400,
        'VALIDATION_ERROR',
      )
    }

    const novoTipo = parsed.data.tipo_usuario as TipoUsuarioPatente

    // Busca alvo. Para MASTER/ADMIN o filtro inclui id_organizacao; para
    // SUPER_ADMIN o escopo é global (qualquer organização).
    const alvo = req.auth.tipo_usuario === 'SUPER_ADMIN'
      ? await prisma.usuario.findFirst({
          where: { id_usuario: req.params.id_usuario },
          select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
        })
      : await prisma.usuario.findFirst({
          where: {
            id_usuario: req.params.id_usuario,
            id_organizacao: req.auth.id_organizacao,
          },
          select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
        })

    if (!alvo) {
      // 404 sem vazar existência cross-org (IDOR defense)
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    autorizarAlteracaoPatente(
      {
        id_usuario: req.auth.id_usuario,
        tipo_usuario: req.auth.tipo_usuario,
        id_organizacao: req.auth.id_organizacao,
      },
      alvo,
      novoTipo,
    )

    // Atualização + check anti-bricking dentro de transação Serializable.
    // Se duas requisições rebaixarem dois Masters distintos da mesma org
    // simultaneamente, a serialização garante que a 2ª vê o estado pós-1ª.
    const atualizado = await prisma.$transaction(async (tx) => {
      // Anti-bricking só se aplica quando o alvo é MASTER e o novo tipo deixa
      // de ser MASTER, dentro da MESMA organização do alvo.
      if (alvo.tipo_usuario === 'MASTER' && novoTipo !== 'MASTER') {
        const totalMasters = await tx.usuario.count({
          where: {
            id_organizacao: alvo.id_organizacao,
            tipo_usuario: 'MASTER',
          },
        })
        if (totalMasters <= 1) {
          throw new AppError(
            'Não é possível rebaixar o último Master da organização',
            409,
            'CONFLICT_LAST_MASTER',
          )
        }
      }

      // Mand. 04 + F4 — quando promove para tipo com bypass (MASTER/SAdmin/Admin),
      // limpa `acesso_workspaces_futuros` para false. A flag só faz sentido em
      // PADRAO/FORNECEDOR; mantê-la em master/admin gera lixo lógico no F3.
      const limpaAcessoFuturos = novoTipo === 'MASTER' || novoTipo === 'SUPER_ADMIN' || novoTipo === 'ADMIN'

      return tx.usuario.update({
        where: { id_usuario: alvo.id_usuario },
        data: limpaAcessoFuturos
          ? { tipo_usuario: novoTipo, acesso_workspaces_futuros: false }
          : { tipo_usuario: novoTipo },
        select: { id_usuario: true, email_usuario: true, tipo_usuario: true, acesso_workspaces_futuros: true },
      })
    }, {
      isolationLevel: 'Serializable',
    })

    securityAudit.roleChanged(req.auth.id_organizacao, req.auth.id_usuario, {
      id_usuario_alvo:        alvo.id_usuario,
      tipo_usuario_anterior:  alvo.tipo_usuario,
      tipo_usuario_novo:      novoTipo,
    }, req.auth.nome_usuario).catch(() => {})

    res.json({ usuario: atualizado })
  } catch (err) {
    next(err)
  }
})

// ─── Permissões granulares (formato canônico <slug>:<secao>:<acao>) ──────────

export const SetPermissoesUsuarioSchema = z.object({
  id_workspace: z.string().cuid(),
  id_produto_gravity: z.string().cuid(),
  permissoes: z
    .array(permissaoStringSchema)
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Permissões duplicadas não são permitidas',
    }),
})

export const permissaoUsuarioItemSchema = z.object({
  id_organizacao: z.string(),
  id_workspace: z.string(),
  id_usuario: z.string(),
  id_produto_gravity: z.string(),
  permissao_usuario: permissaoStringSchema,
  permissao_usuario_concedido_por: z.string(),
  data_criacao_permissao_usuario: z.coerce.date(),
})

export const permissoesResponseSchema = z.object({
  permissoes: z.array(permissaoUsuarioItemSchema),
})

/**
 * GET /api/v1/usuarios/:id_usuario/permissoes
 * Lista permissões granulares de um usuário (opcionalmente filtradas por workspace).
 *
 * Autorização: SUPER_ADMIN (escopo global), ADMIN/MASTER (mesma id_organizacao do alvo).
 * STANDARD/FORNECEDOR não acessam — bloqueado por requireUserManagementRole.
 */
usersRouter.get('/:id_usuario/permissoes', requireUserManagementRole, async (req, res, next) => {
  try {
    const id_usuario = req.params.id_usuario
    const id_workspace = typeof req.query.id_workspace === 'string' ? req.query.id_workspace : undefined

    // SUPER_ADMIN tem escopo global; demais limitam à própria organização
    const alvo = req.auth.tipo_usuario === 'SUPER_ADMIN'
      ? await prisma.usuario.findFirst({
          where: { id_usuario },
          select: { id_organizacao: true },
        })
      : await prisma.usuario.findFirst({
          where: { id_usuario, id_organizacao: req.auth.id_organizacao },
          select: { id_organizacao: true },
        })

    if (!alvo) throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')

    const permissoes = await servicoPermissaoUsuario.listarPermissoesUsuario(
      alvo.id_organizacao,
      id_usuario,
      id_workspace,
    )

    res.json({ permissoes })
  } catch (err) {
    next(err)
  }
})

/**
 * PUT /api/v1/usuarios/:id_usuario/permissoes
 * Substitui atomicamente as permissões granulares de um usuário em UM produto/workspace.
 *
 * Body: { id_workspace, id_produto_gravity, permissoes: string[] }
 * Cada string segue o formato canônico `<slug>:<secao>:<acao>` (Mandamento 06).
 *
 * Autorização: SUPER_ADMIN (global), ADMIN/MASTER (mesma id_organizacao).
 * Anti-escalada — ator não pode editar próprias permissões.
 *
 * Bypass de alvo: se o alvo for SUPER_ADMIN/ADMIN/MASTER, retorna 400 — esses tipos
 * têm acesso global (Mandamento 04) e não devem ter linhas em UsuarioPermissao.
 */
usersRouter.put('/:id_usuario/permissoes', requireUserManagementRole, async (req, res, next) => {
  try {
    const parsed = SetPermissoesUsuarioSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const id_usuario = req.params.id_usuario

    // Anti-escalada: ator não altera as próprias permissões
    if (id_usuario === req.auth.id_usuario) {
      throw new AppError('Você não pode alterar as próprias permissões', 403, 'FORBIDDEN_SELF_EDIT')
    }

    // SUPER_ADMIN tem escopo global; demais limitam à própria organização
    const alvo = req.auth.tipo_usuario === 'SUPER_ADMIN'
      ? await prisma.usuario.findFirst({
          where: { id_usuario },
          select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
        })
      : await prisma.usuario.findFirst({
          where: { id_usuario, id_organizacao: req.auth.id_organizacao },
          select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
        })

    if (!alvo) throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')

    // Mandamento 04 — alvos com bypass não recebem permissões granulares
    if (alvo.tipo_usuario === 'SUPER_ADMIN' || alvo.tipo_usuario === 'ADMIN' || alvo.tipo_usuario === 'MASTER') {
      throw new AppError(
        `Usuário ${alvo.tipo_usuario} tem acesso global automático — não recebe permissões granulares`,
        400,
        'INVALID_OPERATION',
      )
    }

    // Valida workspace pertence à organização do alvo (defesa IDOR)
    const ws = await prisma.workspace.findFirst({
      where: { id_workspace: parsed.data.id_workspace, id_organizacao: alvo.id_organizacao },
      select: { id_workspace: true },
    })
    if (!ws) throw new AppError('Workspace não pertence à organização do usuário', 403, 'FORBIDDEN_WORKSPACE')

    // Valida produto está no Set de "permissões implementadas" (defesa contra
    // gravar permissões para produtos que ainda não têm UI/middleware)
    const produto = await prisma.produtoGravity.findUnique({
      where: { id_produto_gravity: parsed.data.id_produto_gravity },
      select: { slug_produto_gravity: true, status_produto_gravity: true },
    })
    if (!produto) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND')
    if (!PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has(produto.slug_produto_gravity)) {
      throw new AppError(
        `Produto "${produto.slug_produto_gravity}" ainda não tem permissões granulares implementadas`,
        400,
        'PRODUCT_PERMISSIONS_NOT_IMPLEMENTED',
      )
    }

    const result = await servicoPermissaoUsuario.configurarPermissoes({
      id_organizacao: alvo.id_organizacao,
      id_workspace: parsed.data.id_workspace,
      id_usuario,
      id_produto_gravity: parsed.data.id_produto_gravity,
      permissoes: parsed.data.permissoes,
      concedido_por_clerk_id: req.auth.clerkUserId,
    })

    securityAudit.permissionChanged(alvo.id_organizacao, req.auth.id_usuario, {
      id_usuario_alvo: id_usuario,
      nome_permissao:  `${produto.slug_produto_gravity}:${parsed.data.id_workspace}`,
      acao_permissao:  result.total_inseridas >= result.total_removidas ? 'GRANTED' : 'REVOKED',
    }, req.auth.nome_usuario).catch(() => {})

    res.json({
      permissoes: parsed.data.permissoes,
      total_inseridas: result.total_inseridas,
      total_removidas: result.total_removidas,
    })
  } catch (err) {
    next(err)
  }
})

// ─── F4 — PATCH /:id_usuario/acesso-workspaces-futuros ────────────────────
// Alterna a flag de auto-vínculo a workspaces futuros (Mand. 04 — só PADRAO/FORNECEDOR).

export const AlternarAcessoWorkspacesFuturosSchema = z.object({
  acesso_workspaces_futuros: z.boolean(),
})

/**
 * PATCH /api/v1/usuarios/:id_usuario/acesso-workspaces-futuros
 * Liga/desliga a flag para usuário PADRAO/FORNECEDOR. Operação idempotente.
 *
 * Defesas:
 *   • requireUserManagementRole (SAdmin/Admin/Master)
 *   • Anti-escalada (FORBIDDEN_SELF_EDIT)
 *   • IDOR cross-org (404 NOT_FOUND para alvo de outra org sem privilégio global)
 *   • Mand. 04 — alvo MASTER/SAdmin/Admin retorna 400 INVALID_OPERATION
 *
 * Comportamento:
 *   • NÃO faz backfill retroativo (a flag só afeta workspaces FUTUROS).
 *     Para vincular aos workspaces atuais, usar `PUT /:id/workspaces` ou o
 *     botão "Vincular aos atuais agora" da F5 do frontend.
 */
usersRouter.patch('/:id_usuario/acesso-workspaces-futuros', requireUserManagementRole, async (req, res, next) => {
  try {
    const parsed = AlternarAcessoWorkspacesFuturosSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400, 'VALIDATION_ERROR')
    }

    const id_usuario = req.params.id_usuario

    // Anti-escalada
    if (id_usuario === req.auth.id_usuario) {
      throw new AppError(
        'Você não pode alterar a própria configuração de auto-vínculo',
        403,
        'FORBIDDEN_SELF_EDIT',
      )
    }

    // SUPER_ADMIN tem escopo global; demais limitam à própria organização
    const alvo = req.auth.tipo_usuario === 'SUPER_ADMIN'
      ? await prisma.usuario.findFirst({
          where: { id_usuario },
          select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
        })
      : await prisma.usuario.findFirst({
          where: { id_usuario, id_organizacao: req.auth.id_organizacao },
          select: { id_usuario: true, id_organizacao: true, tipo_usuario: true },
        })

    if (!alvo) throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')

    // Mand. 04 — alvos com bypass não recebem flag (lixo lógico no F3)
    if (alvo.tipo_usuario === 'SUPER_ADMIN' || alvo.tipo_usuario === 'ADMIN' || alvo.tipo_usuario === 'MASTER') {
      throw new AppError(
        `Usuário ${alvo.tipo_usuario} tem acesso global automático — flag de auto-vínculo não se aplica`,
        400,
        'INVALID_OPERATION',
      )
    }

    const atualizado = await prisma.usuario.update({
      where: { id_usuario: alvo.id_usuario },
      data: { acesso_workspaces_futuros: parsed.data.acesso_workspaces_futuros },
      select: { id_usuario: true, tipo_usuario: true, acesso_workspaces_futuros: true },
    })

    securityAudit.permissionChanged(alvo.id_organizacao, req.auth.id_usuario, {
      id_usuario_alvo: alvo.id_usuario,
      nome_permissao:  'workspace_futuros_auto_vinculo',
      acao_permissao:  parsed.data.acesso_workspaces_futuros ? 'GRANTED' : 'REVOKED',
    }, req.auth.nome_usuario).catch(() => {})

    res.json({ usuario: atualizado })
  } catch (err) {
    next(err)
  }
})
