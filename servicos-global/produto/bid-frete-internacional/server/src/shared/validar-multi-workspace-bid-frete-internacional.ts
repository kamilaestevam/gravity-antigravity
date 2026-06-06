/**
 * Validação multi-workspace — paridade Pedido (S2S Configurador).
 * Mand. 08 — falha ruidosa quando IDs solicitados não estão habilitados.
 */
import type { Request } from 'express'
import { obterWorkspacesHabilitadosDoUsuario } from '@gravity/resolver-organizacao'
import { AppError } from '../lib/erros.js'
import { parseIdsWorkspacesQuery } from './workspace-filtro-bid-frete-internacional.js'

export async function validarMultiWorkspaceBidFreteInternacional(
  ctx: { idOrganizacao: string; idUsuario: string },
  idsSolicitados: string[],
): Promise<{ valido: true } | { valido: false; bloqueados: string[] }> {
  const baseUrl = process.env.CONFIGURATOR_URL ?? 'http://127.0.0.1:8005'
  const chave = process.env.CHAVE_INTERNA_SERVICO
  if (!chave) {
    throw new AppError(
      'Configuração ausente: CHAVE_INTERNA_SERVICO',
      500,
      'CONFIG_ERROR',
    )
  }

  const { workspacesHabilitados } = await obterWorkspacesHabilitadosDoUsuario({
    configuradorBaseUrl: baseUrl,
    chaveInterna: chave,
    idOrganizacao: ctx.idOrganizacao,
    idUsuario: ctx.idUsuario,
  })

  const habilitadosSet = new Set(workspacesHabilitados)
  const bloqueados = idsSolicitados.filter(id => !habilitadosSet.has(id))
  if (bloqueados.length > 0) return { valido: false, bloqueados }
  return { valido: true }
}

export async function assertWorkspacesAutorizadosNoRequest(req: Request): Promise<void> {
  const ids = parseIdsWorkspacesQuery(req)
  if (!ids?.length) return

  const idOrganizacao = req.headers['x-id-organizacao'] as string | undefined
  const idUsuario = req.headers['x-id-usuario'] as string | undefined
  if (!idOrganizacao || !idUsuario) {
    throw new AppError('x-id-organizacao e x-id-usuario obrigatórios', 401, 'UNAUTHORIZED')
  }

  const validacao = await validarMultiWorkspaceBidFreteInternacional(
    { idOrganizacao, idUsuario },
    ids,
  )
  if (!validacao.valido) {
    throw new AppError(
      `${validacao.bloqueados.length} workspace(s) não autorizado(s) para este usuário`,
      403,
      'WORKSPACE_NAO_AUTORIZADO',
    )
  }
}

export async function assertIdsWorkspacesEscopoAutorizados(
  ctx: { idOrganizacao: string; idUsuario: string },
  ids: string[],
): Promise<void> {
  if (ids.length === 0) return
  const validacao = await validarMultiWorkspaceBidFreteInternacional(ctx, ids)
  if (!validacao.valido) {
    throw new AppError(
      `${validacao.bloqueados.length} workspace(s) não autorizado(s) para este usuário`,
      403,
      'WORKSPACE_NAO_AUTORIZADO',
    )
  }
}
