// server/services/convidar-usuario-service.ts
//
// Serviço compartilhado para CONVITE DE USUÁRIO.
//
// Consumido por:
//   • POST /api/v1/usuarios/convidar            (rota regular Master/Admin/SAdmin
//                                                 — alvo = própria organização do ator)
//   • POST /api/v1/admin/usuarios/convidar      (rota admin cross-org — apenas SUPER_ADMIN,
//                                                 alvo = id_organizacao_alvo do body)
//
// Razão de existir: a rota admin estava hardcodando `req.auth.id_organizacao`
// como destino, ignorando qualquer parâmetro de organização alvo (P0 — convite
// cross-org silenciosamente criava o usuário na HQ do ator). Extrair a lógica
// para um service unifica as duas rotas e tira esse buraco da cabeça da rota.
//
// Validações (9, ordem importa):
//   1. Organização alvo existe e está ATIVA (404 ORG_NOT_FOUND)
//   2. Regra Gravity-interna — SUPER_ADMIN/ADMIN só em org que hospeda
//      colaboradores Gravity. CHECAGEM NA ORG ALVO (não na do ator, como
//      estava errado em admin.ts:1582).
//   3. Pré-existência na org alvo (409 CONFLICT)
//   4. PADRAO/FORNECEDOR exigem workspaces_alvo (400 VALIDATION_ERROR)
//   5. Anti-IDOR — workspaces_alvo devem pertencer à org alvo (403
//      WORKSPACE_FORA_DA_ORG_ALVO)
//   6. Compute acesso_workspaces_futuros (apenas PADRAO/FORNECEDOR + 'all')
//   7. Cria invitation no Clerk
//   8. Transação atômica Usuario + UsuarioWorkspace[]
//   9. Try/catch revogando Clerk se o DB falhar (não deixa convite órfão)
//
// Pós-transação (best-effort):
//   • Portão 3 auto-sync (aoVincularUsuarioAoWorkspace) por workspace
//   • Audit log via AuditService.log (id_organizacao = ORG ALVO; ID do ator
//     vai em metadata para rastreio cross-org)

import { prisma } from '../lib/prisma.js'
import { clerkClient } from '../lib/clerk.js'
import { AppError } from '../lib/appError.js'
import { aoVincularUsuarioAoWorkspace } from './sincronizar-acesso-usuario-produtos-service.js'
import { AuditService } from '../../../servicos-plataforma/historico-global/server/services/audit.service.js'
import { AcaoExecutadaPor } from '../../../servicos-plataforma/generated/index.js'

export type TipoUsuarioConvidado = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR'

export interface ConvidarUsuarioArgs {
  ator: {
    id_usuario: string
    id_organizacao: string
    tipo_usuario: string
    nome_usuario: string
    clerkUserId: string
    ip?: string
  }
  /** Organização ONDE o usuário será criado (pode ser diferente da org do ator no fluxo admin cross-org). */
  id_organizacao_alvo: string
  email_usuario: string
  nome_usuario: string
  tipo_usuario: TipoUsuarioConvidado
  /**
   * Workspaces a vincular:
   *   • undefined         → MASTER/SAdmin/ADMIN (bypass implícito, nenhum vínculo)
   *                          ou erro se PADRAO/FORNECEDOR
   *   • 'all'             → todos os ATIVOs da org alvo
   *   • string[]          → conjunto explícito (validado contra a org alvo)
   */
  workspaces_alvo?: 'all' | string[]
}

export interface ConvidarUsuarioResult {
  id_usuario: string
  email_usuario: string
  tipo_usuario: TipoUsuarioConvidado
  acesso_workspaces_futuros: boolean
  workspaces_vinculados: number
}

export async function convidarUsuarioService(
  args: ConvidarUsuarioArgs,
): Promise<ConvidarUsuarioResult> {
  const {
    ator,
    id_organizacao_alvo,
    email_usuario,
    nome_usuario,
    tipo_usuario,
    workspaces_alvo,
  } = args

  // ─── 1. Org alvo existe e está ATIVA ────────────────────────────────────
  const orgAlvo = await prisma.organizacao.findUnique({
    where: { id_organizacao: id_organizacao_alvo },
    select: { status_organizacao: true, hospeda_colaboradores_gravity: true },
  })
  if (!orgAlvo || orgAlvo.status_organizacao !== 'ATIVO') {
    throw new AppError('Organização não encontrada ou inativa', 404, 'ORG_NOT_FOUND')
  }

  // ─── 2. Regra Gravity-interna — checada na ORG ALVO ─────────────────────
  // SUPER_ADMIN/ADMIN só podem ser criados em organizações que hospedam
  // colaboradores da Gravity. Bug original em admin.ts:1582 checava a flag
  // na org do ATOR, o que estava errado quando o ator e o alvo são orgs
  // diferentes (fluxo SUPER_ADMIN cross-org).
  if (tipo_usuario === 'SUPER_ADMIN' || tipo_usuario === 'ADMIN') {
    if (!orgAlvo.hospeda_colaboradores_gravity) {
      throw new AppError(
        'SUPER_ADMIN/ADMIN só podem ser criados em organizações que hospedam colaboradores Gravity',
        403,
        'TIPO_GRAVITY_EXIGE_ORG_GRAVITY',
      )
    }
  }

  // ─── 3. Pré-existência na org ALVO ──────────────────────────────────────
  const existente = await prisma.usuario.findFirst({
    where: { id_organizacao: id_organizacao_alvo, email_usuario },
    select: { id_usuario: true },
  })
  if (existente) {
    throw new AppError(
      'Já existe um usuário com esse e-mail nesta organização',
      409,
      'CONFLICT',
    )
  }

  // ─── 4. PADRAO/FORNECEDOR exigem workspaces_alvo ────────────────────────
  if ((tipo_usuario === 'PADRAO' || tipo_usuario === 'FORNECEDOR') && workspaces_alvo === undefined) {
    throw new AppError(
      'Standard/Fornecedor exige pelo menos um workspace',
      400,
      'VALIDATION_ERROR',
    )
  }

  // ─── 5. Anti-IDOR — workspaces pertencem à org alvo ─────────────────────
  let workspacesParaVincular: { id_workspace: string }[] = []

  // MASTER/SAdmin/ADMIN sem workspaces_alvo → bypass, sem vínculos formais.
  // Quando o ator passa 'all' para esses tipos, ainda vinculamos a todos
  // (preserva comportamento histórico da rota regular: usuario.ts:291-295).
  if (tipo_usuario === 'MASTER' || workspaces_alvo === 'all') {
    workspacesParaVincular = await prisma.workspace.findMany({
      where: { id_organizacao: id_organizacao_alvo, status_workspace: 'ATIVO' },
      select: { id_workspace: true },
    })
  } else if (Array.isArray(workspaces_alvo) && workspaces_alvo.length > 0) {
    workspacesParaVincular = await prisma.workspace.findMany({
      where: {
        id_workspace: { in: workspaces_alvo },
        id_organizacao: id_organizacao_alvo,
        status_workspace: 'ATIVO',
      },
      select: { id_workspace: true },
    })
    if (workspacesParaVincular.length !== workspaces_alvo.length) {
      throw new AppError(
        'Um ou mais workspaces não pertencem à organização alvo',
        403,
        'WORKSPACE_FORA_DA_ORG_ALVO',
      )
    }
  }
  // SUPER_ADMIN/ADMIN sem workspaces_alvo → workspacesParaVincular = []
  // (acesso global por Mand. 04, sem necessidade de vínculo formal).

  // ─── 6. Compute acesso_workspaces_futuros ──────────────────────────────
  const acesso_workspaces_futuros =
    workspaces_alvo === 'all' && (tipo_usuario === 'PADRAO' || tipo_usuario === 'FORNECEDOR')

  // ─── 7. Cria invitation no Clerk ───────────────────────────────────────
  const APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:8000'
  const invitation = await clerkClient.invitations.createInvitation({
    emailAddress: email_usuario,
    redirectUrl: `${APP_BASE_URL}/cadastro/continuar`,
  })

  // ─── 8/9. Transação atômica + rollback do Clerk se o DB falhar ─────────
  let usuarioCriado: { id_usuario: string; email_usuario: string; tipo_usuario: string; acesso_workspaces_futuros: boolean }
  try {
    usuarioCriado = await prisma.$transaction(async (tx) => {
      const criado = await tx.usuario.create({
        data: {
          id_organizacao: id_organizacao_alvo,
          id_clerk_usuario: `pending_${invitation.id}`,
          email_usuario,
          nome_usuario,
          tipo_usuario,
          acesso_workspaces_futuros,
        },
        select: { id_usuario: true, email_usuario: true, tipo_usuario: true, acesso_workspaces_futuros: true },
      })

      if (workspacesParaVincular.length > 0) {
        await tx.usuarioWorkspace.createMany({
          data: workspacesParaVincular.map((w) => ({
            id_organizacao: id_organizacao_alvo,
            id_usuario: criado.id_usuario,
            id_workspace: w.id_workspace,
            tipo_usuario_workspace: tipo_usuario === 'PADRAO' || tipo_usuario === 'FORNECEDOR' || tipo_usuario === 'MASTER'
              ? tipo_usuario
              : 'PADRAO', // SUPER_ADMIN/ADMIN não usam tipo_usuario_workspace; valor inerte
            ativo_usuario_workspace: true,
          })),
          skipDuplicates: true,
        })
      }

      return criado
    })
  } catch (dbErr) {
    // Banco falhou → revoga convite Clerk para não deixar invitation órfão.
    // Não bloqueia o re-throw se a revogação também falhar (rastro só por log).
    try {
      await clerkClient.invitations.revokeInvitation(invitation.id)
    } catch {
      // Fire-and-forget — invitation órfão é detectável pela ausência
      // do usuário no banco (workflow de limpeza periódica resolve).
    }
    throw dbErr
  }

  // ─── Pós-transação (best-effort, fora do try/catch) ─────────────────────

  // CP6 auto-sync — propaga chaves Portão 3 para cada workspace vinculado.
  // Espelha usuario.ts:352-360. Apenas PADRAO/FORNECEDOR recebem (Mand. 04).
  if (
    workspacesParaVincular.length > 0
    && (tipo_usuario === 'PADRAO' || tipo_usuario === 'FORNECEDOR')
  ) {
    for (const w of workspacesParaVincular) {
      aoVincularUsuarioAoWorkspace({
        id_organizacao: id_organizacao_alvo,
        id_workspace: w.id_workspace,
        id_usuario: usuarioCriado.id_usuario,
      }).catch(() => { /* best-effort */ })
    }
  }

  // Audit log — id_organizacao = ORG ALVO (registra na organização afetada);
  // metadata_ator_historico_log carrega a id da org do ATOR para rastreio
  // de ações cross-org pelo Super Admin.
  AuditService.log({
    id_organizacao: id_organizacao_alvo,
    tipo_ator_historico_log: AcaoExecutadaPor.USUARIO,
    id_ator_historico_log: ator.id_usuario,
    nome_ator_historico_log: ator.nome_usuario,
    ip_ator_historico_log: ator.ip,
    metadata_ator_historico_log: {
      id_organizacao_ator: ator.id_organizacao,
      tipo_usuario_ator: ator.tipo_usuario,
      cross_org: ator.id_organizacao !== id_organizacao_alvo,
    },
    modulo_historico_log: 'usuarios',
    tipo_recurso_historico_log: 'Usuario',
    id_recurso_historico_log: usuarioCriado.id_usuario,
    acao_historico_log: 'CONVIDAR',
    detalhe_acao_historico_log: `Convite enviado — tipo_usuario=${tipo_usuario}, workspaces_vinculados=${workspacesParaVincular.length}`,
    estado_posterior_historico_log: {
      email_usuario: usuarioCriado.email_usuario,
      tipo_usuario: usuarioCriado.tipo_usuario,
      acesso_workspaces_futuros: usuarioCriado.acesso_workspaces_futuros,
    },
    status_historico_log: 'SUCESSO',
  }).catch(() => { /* fire-and-forget */ })

  return {
    id_usuario: usuarioCriado.id_usuario,
    email_usuario: usuarioCriado.email_usuario,
    tipo_usuario: usuarioCriado.tipo_usuario as TipoUsuarioConvidado,
    acesso_workspaces_futuros: usuarioCriado.acesso_workspaces_futuros,
    workspaces_vinculados: workspacesParaVincular.length,
  }
}
