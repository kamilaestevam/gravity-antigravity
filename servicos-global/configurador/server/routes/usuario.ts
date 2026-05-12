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
  ehPermissaoAcessoUsuarioProdutoGravity,
} from '../services/permissao-usuario-servico.js'
import {
  aoVincularUsuarioAoWorkspace,
  aoDesvincularUsuarioDoWorkspace,
} from '../services/sincronizar-acesso-usuario-produtos-service.js'
import { convidarUsuarioService } from '../services/convidar-usuario-service.js'

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
}).strict().refine(
  // .strict() (QA P2 fix 2026-05-12): rejeita campos desconhecidos no body,
  // incluindo tentativa de injetar `id_organizacao_alvo` na rota regular
  // (essa rota força alvo = req.auth.id_organizacao, então o campo seria
  // ignorado em silêncio — viola Mand. 06/09).
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
        // id_clerk_usuario é lido APENAS para derivar status_usuario.
        // NÃO é exposto no DTO (informação mínima — Clerk = autenticação interna,
        // Mand. 01). Frontend só recebe o status derivado.
        id_clerk_usuario: true,
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
    //
    // Deriva status_usuario:
    //   - 'CONVIDADO': id_clerk_usuario começa com 'pending_' (convite Clerk pendente)
    //   - 'ATIVO': cadastro Clerk completo (id_clerk_usuario = user_*)
    // A transição CONVIDADO → ATIVO acontece automaticamente no primeiro login,
    // via fallback do requireAuth.ts (Clerk getUser por email).
    // INATIVO é estado UI-only, sem persistência (toggle local apenas).
    const dto = usuarios.map(({ memberships, id_clerk_usuario, ...rest }) => ({
      ...rest,
      status_usuario: (id_clerk_usuario.startsWith('pending_') ? 'CONVIDADO' : 'ATIVO') as 'CONVIDADO' | 'ATIVO',
      usuario_workspaces: memberships,
    }))
    res.json({ usuarios: dto })
  } catch (err) {
    next(err)
  }
})

/**
 * DELETE /api/v1/usuarios/:id_usuario/convite
 * Cancela convite pendente: deleta o registro Usuario do banco e revoga o
 * convite Clerk. Aceita apenas usuários em status CONVIDADO (id_clerk_usuario
 * começa com 'pending_'). Requer MASTER (intra-org) ou SUPER_ADMIN (cross-org).
 *
 * Mand. 04 — SAdmin cross-org permitido; Master limitado à própria org.
 * Mand. 08 — falha alto se status já não for CONVIDADO (evita deletar
 * ATIVO acidentalmente).
 */
usersRouter.delete('/:id_usuario/convite', requireUserManagementRole, async (req, res, next) => {
  try {
    // Busca com escopo de organização (MASTER/ADMIN intra-org; SAdmin global)
    const alvo = req.auth.tipo_usuario === 'SUPER_ADMIN'
      ? await prisma.usuario.findFirst({
          where: { id_usuario: req.params.id_usuario },
          select: { id_usuario: true, id_organizacao: true, email_usuario: true, id_clerk_usuario: true },
        })
      : await prisma.usuario.findFirst({
          where: { id_usuario: req.params.id_usuario, id_organizacao: req.auth.id_organizacao },
          select: { id_usuario: true, id_organizacao: true, email_usuario: true, id_clerk_usuario: true },
        })

    if (!alvo) {
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    // Só permite cancelar se ainda é convite pendente (Mand. 08 — falha alta)
    if (!alvo.id_clerk_usuario.startsWith('pending_')) {
      throw new AppError(
        'Convite já foi aceito — não é possível cancelar. Use a ação de inativar usuário.',
        409,
        'CONVITE_JA_ACEITO',
      )
    }

    // Extrai invitation_id do prefixo `pending_${invitationId}`
    const invitationId = alvo.id_clerk_usuario.replace(/^pending_/, '')

    // 1. Revoga convite no Clerk (fire-and-forget — se já expirou, segue)
    try {
      await clerkClient.invitations.revokeInvitation(invitationId)
    } catch {
      // Convite pode ter expirado/já revogado no Clerk — não bloqueia delete
    }

    // 2. Deleta Usuario do banco (cascade via @relation cuida de UsuarioWorkspace/UsuarioPermissao)
    await prisma.usuario.delete({ where: { id_usuario: alvo.id_usuario } })

    securityAudit.permissionChanged(alvo.id_organizacao, req.auth.id_usuario, {
      id_usuario_alvo: alvo.id_usuario,
      nome_permissao: 'convite_cancelado',
      acao_permissao: 'REVOKED',
    }, req.auth.nome_usuario).catch(() => { /* fire-and-forget */ })

    res.status(204).end()
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

    // Rota regular: alvo = própria organização do ator (intra-org).
    // A rota admin (/admin/usuarios/convidar) usa o mesmo service mas
    // passa id_organizacao_alvo do body (cross-org, SUPER_ADMIN only).
    const resultado = await convidarUsuarioService({
      ator: {
        id_usuario: req.auth.id_usuario,
        id_organizacao: req.auth.id_organizacao,
        tipo_usuario: req.auth.tipo_usuario,
        nome_usuario: req.auth.nome_usuario,
        clerkUserId: req.auth.clerkUserId,
        ip: req.ip,
      },
      id_organizacao_alvo: req.auth.id_organizacao,
      email_usuario: parsed.data.email_usuario,
      nome_usuario: parsed.data.nome_usuario,
      tipo_usuario: parsed.data.tipo_usuario,
      workspaces_alvo: parsed.data.workspaces_alvo,
    })

    res.status(201).json({
      message: 'Convite enviado com sucesso',
      usuario: {
        id_usuario: resultado.id_usuario,
        email_usuario: resultado.email_usuario,
        tipo_usuario: resultado.tipo_usuario,
        acesso_workspaces_futuros: resultado.acesso_workspaces_futuros,
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

    // PORTÃO 3 auto-sync — usuário vinculado ganha chaves de todos os produtos
    // habilitados no workspace (best-effort).
    aoVincularUsuarioAoWorkspace({
      id_organizacao: req.auth.id_organizacao,
      id_workspace,
      id_usuario,
    }).catch(() => { /* best-effort */ })

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
  // Snapshot do estado ANTES da transação — usado pelo auto-sync Portão 3
  // para identificar workspaces removidos (limpar permissões) e adicionados.
  const anteriores = await prisma.usuarioWorkspace.findMany({
    where: { id_organizacao, id_usuario },
    select: { id_workspace: true },
  })
  const workspacesAntes = new Set(anteriores.map(a => a.id_workspace))
  const workspacesDepois = new Set(workspaceIds)

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

  // PORTÃO 3 auto-sync (Interpretação 1) — best-effort, fora da transação.
  // Workspaces REMOVIDOS → limpa todas as permissões do user lá.
  // Workspaces ADICIONADOS → cria chaves Portão 3 para produtos do workspace.
  for (const id_workspace of workspacesAntes) {
    if (!workspacesDepois.has(id_workspace)) {
      aoDesvincularUsuarioDoWorkspace({ id_organizacao, id_workspace, id_usuario })
        .catch(() => { /* best-effort */ })
    }
  }
  if (tipo_usuario_workspace !== 'MASTER') {
    for (const id_workspace of workspacesDepois) {
      if (!workspacesAntes.has(id_workspace)) {
        aoVincularUsuarioAoWorkspace({ id_organizacao, id_workspace, id_usuario })
          .catch(() => { /* best-effort */ })
      }
    }
  }
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
        'EDICAO_PROPRIA_NAO_PERMITIDA',
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

/**
 * Matriz de autorização (decisão dono 2026-05-11 — substitui regra ε universal):
 *
 * - SUPER_ADMIN: pode editar qualquer alvo (inclusive o próprio — Interpretação B).
 *   Pode atribuir SAdmin/ADMIN APENAS se alvo está em org com
 *   `hospeda_colaboradores_gravity = true`. Para alvos cliente, só MASTER/
 *   PADRAO/FORNECEDOR. Anti-bricking último SAdmin verificado na rota
 *   (dentro da transação Serializable) — não aqui.
 *
 * - ADMIN: read-only global. Não pode editar tipo_usuario de ninguém.
 *   Já é bloqueado em `requireUserManagementRole`, mas mantemos guard aqui
 *   por defesa em profundidade.
 *
 * - MASTER: pode editar dentro da própria org, só atribui MASTER/PADRAO/
 *   FORNECEDOR. Regras existentes preservadas.
 *
 * - PADRAO/FORNECEDOR: bloqueados em `requireUserManagementRole`.
 */
function autorizarAlteracaoPatente(
  ator: { id_usuario: string; tipo_usuario: string; id_organizacao: string },
  alvo: { id_usuario: string; tipo_usuario: string; id_organizacao: string; organizacao_hospeda_colaboradores_gravity: boolean },
  novoTipo: TipoUsuarioPatente,
): void {
  // Anti-escalada ATOR ≠ ALVO — aplica-se a ADMIN e MASTER.
  // SUPER_ADMIN pode editar o próprio tipo (Interpretação B do dono em 2026-05-11),
  // mas anti-bricking último SAdmin é verificado na rota dentro de transação.
  if (ator.id_usuario === alvo.id_usuario && ator.tipo_usuario !== 'SUPER_ADMIN') {
    throw new AppError(
      'Você não pode alterar o próprio tipo de usuário',
      403,
      'EDICAO_PROPRIA_NAO_PERMITIDA',
    )
  }

  if (ator.tipo_usuario === 'SUPER_ADMIN') {
    // SUPER_ADMIN tem escopo global. Pode atribuir SAdmin/ADMIN APENAS
    // se alvo está em organização que hospeda colaboradores da Gravity.
    if ((novoTipo === 'SUPER_ADMIN' || novoTipo === 'ADMIN') && !alvo.organizacao_hospeda_colaboradores_gravity) {
      throw new AppError(
        'SUPER_ADMIN/ADMIN só podem ser atribuídos a usuários de organizações que hospedam colaboradores da Gravity',
        403,
        'TIPO_GRAVITY_EXIGE_ORG_GRAVITY',
      )
    }
    return
  }

  if (ator.tipo_usuario === 'ADMIN') {
    // ADMIN é read-only global (skill `seguranca/permissoes`: visualiza tudo,
    // edita só com permissão explícita do SAdmin — e edição de tipo_usuario
    // NÃO é uma das permissões delegáveis). Defesa em profundidade — middleware
    // já bloqueou em `requireUserManagementRole`, mas garantia explícita aqui.
    throw new AppError(
      'ADMIN não pode alterar tipo_usuario de nenhum usuário (read-only global)',
      403,
      'ADMIN_SOMENTE_LEITURA',
    )
  }

  if (ator.tipo_usuario === 'MASTER') {
    // MASTER tem escopo da própria organização (já validado pelo findFirst)
    if (alvo.tipo_usuario === 'MASTER') {
      throw new AppError(
        'Master não pode editar outro Master',
        403,
        'MASTER_NAO_EDITA_MASTER',
      )
    }
    if (alvo.tipo_usuario === 'SUPER_ADMIN' || alvo.tipo_usuario === 'ADMIN') {
      throw new AppError(
        'Master não pode editar usuários Gravity (Super Admin/Admin)',
        403,
        'MASTER_NAO_EDITA_GRAVITY',
      )
    }
    if (novoTipo !== 'MASTER' && novoTipo !== 'PADRAO' && novoTipo !== 'FORNECEDOR') {
      throw new AppError(
        'Master só pode atribuir Master, Standard ou Fornecedor',
        403,
        'MASTER_TIPO_DESTINO_INVALIDO',
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

    // Busca alvo. Para MASTER o filtro inclui id_organizacao; para SUPER_ADMIN
    // o escopo é global (qualquer organização). ADMIN é bloqueado em
    // `requireUserManagementRole` — não chega aqui.
    // Inclui flag `hospeda_colaboradores_gravity` da org do alvo para a regra
    // condicional de SAdmin/ADMIN (decisão dono 2026-05-11).
    const alvoRaw = req.auth.tipo_usuario === 'SUPER_ADMIN'
      ? await prisma.usuario.findFirst({
          where: { id_usuario: req.params.id_usuario },
          select: {
            id_usuario: true,
            id_organizacao: true,
            tipo_usuario: true,
            tenant: { select: { hospeda_colaboradores_gravity: true } },
          },
        })
      : await prisma.usuario.findFirst({
          where: {
            id_usuario: req.params.id_usuario,
            id_organizacao: req.auth.id_organizacao,
          },
          select: {
            id_usuario: true,
            id_organizacao: true,
            tipo_usuario: true,
            tenant: { select: { hospeda_colaboradores_gravity: true } },
          },
        })

    if (!alvoRaw) {
      // 404 sem vazar existência cross-org (IDOR defense)
      throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND')
    }

    const alvo = {
      id_usuario: alvoRaw.id_usuario,
      id_organizacao: alvoRaw.id_organizacao,
      tipo_usuario: alvoRaw.tipo_usuario,
      organizacao_hospeda_colaboradores_gravity: alvoRaw.tenant.hospeda_colaboradores_gravity,
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

    // Atualização + checks anti-bricking dentro de transação Serializable.
    // Se duas requisições rebaixarem dois Masters/SAdmins simultaneamente,
    // a serialização garante que a 2ª vê o estado pós-1ª.
    const atualizado = await prisma.$transaction(async (tx) => {
      // Anti-bricking MASTER: rebaixar o último MASTER da organização é
      // proibido (organização sem MASTER perde gestão local).
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
            'ULTIMO_MASTER_ORGANIZACAO',
          )
        }
      }

      // Anti-bricking SUPER_ADMIN (decisão dono 2026-05-11 — Interpretação B):
      // SAdmin pode editar próprio tipo, mas rebaixar o último SAdmin do
      // sistema deixa a plataforma sem admin global — bloqueia. Escopo é
      // GLOBAL (não por org), pois SAdmin é singular no sistema, não na org.
      if (alvo.tipo_usuario === 'SUPER_ADMIN' && novoTipo !== 'SUPER_ADMIN') {
        const totalSuperAdmins = await tx.usuario.count({
          where: { tipo_usuario: 'SUPER_ADMIN' },
        })
        if (totalSuperAdmins <= 1) {
          throw new AppError(
            'Não é possível rebaixar o último Super Admin do sistema',
            409,
            'ULTIMO_SUPER_ADMIN_SISTEMA',
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
      throw new AppError('Você não pode alterar as próprias permissões', 403, 'EDICAO_PROPRIA_NAO_PERMITIDA')
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
    if (!ws) throw new AppError('Workspace não pertence à organização do usuário', 403, 'WORKSPACE_FORA_DA_ORGANIZACAO')

    // Valida produto está no Set de "permissões implementadas" (defesa contra
    // gravar permissões para produtos que ainda não têm UI/middleware).
    //
    // EXCEÇÃO Portão 3: chaves `<slug>:acesso_usuario_produtos_gravity:permitido`
    // são válidas para QUALQUER produto, não exigem whitelist (controlam apenas
    // ABERTURA do produto, não ações granulares dentro dele). Decisão dono
    // 2026-05-12 — todo produto deve poder ter Portão 3, independente da Cadeia 2
    // fina estar implementada.
    const produto = await prisma.produtoGravity.findUnique({
      where: { id_produto_gravity: parsed.data.id_produto_gravity },
      select: { slug_produto_gravity: true, status_produto_gravity: true },
    })
    if (!produto) throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND')

    const temPermissaoGranular = parsed.data.permissoes.some(
      (p) => !ehPermissaoAcessoUsuarioProdutoGravity(p),
    )
    if (temPermissaoGranular && !PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has(produto.slug_produto_gravity)) {
      throw new AppError(
        `Produto "${produto.slug_produto_gravity}" ainda não tem permissões granulares implementadas — apenas Portão 3 (acesso ao produto) é aceito`,
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
 *   • Anti-escalada (EDICAO_PROPRIA_NAO_PERMITIDA)
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
        'EDICAO_PROPRIA_NAO_PERMITIDA',
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
