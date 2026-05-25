/**
 * pedido-escopo-hub.ts — Divergência entre workspace do Hub e escopo salvo no Pedido.
 *
 * Usado no clique "Entrar no Workspace" para avisar quando o filtro do menu lateral
 * do Pedido difere do workspace selecionado no Hub.
 */

import { z } from 'zod'

/** Mesma chave usada em useEscopoWorkspacesPedido (produto Pedido). */
export const PEDIDO_SESSION_KEY_ESCOPO = 'pedido:workspaces_escopo'

const preferenciaPedidoDataSchema = z.object({
  colunas_visiveis: z.array(z.string()).optional(),
  colunas_largura: z.record(z.number()).optional(),
  ids_workspaces_escopo: z.array(z.string()).optional(),
}).nullable()

const preferenciaPedidoResponseSchema = z.object({
  data: preferenciaPedidoDataSchema,
})

export type PreferenciaPedidoEscopo = z.infer<typeof preferenciaPedidoDataSchema>

export interface ContextoPedidoHub {
  idOrganizacao: string
  idUsuario: string
}

const PREFERENCIA_PEDIDO_URL = '/api/v1/pedidos/config/preferencia-usuario-coluna-pedido'

function montarHeadersPedidoHub(
  token: string,
  ctx: ContextoPedidoHub,
  comJson = false,
): Record<string, string> {
  return {
    ...(comJson ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
    'x-id-organizacao': ctx.idOrganizacao,
    'x-id-usuario': ctx.idUsuario,
  }
}

/** Escopo salvo difere de "apenas este workspace". */
export function escopoPedidoDivergeDoWorkspace(
  idWorkspaceAlvo: string,
  idsEscopoSalvos: readonly string[],
): boolean {
  if (idsEscopoSalvos.length === 0) return false
  return idsEscopoSalvos.length !== 1 || idsEscopoSalvos[0] !== idWorkspaceAlvo
}

export function formatarResumoWorkspacesEscopo(
  ids: readonly string[],
  resolverNome: (id: string) => string,
  maxNomesVisiveis = 3,
): string {
  if (ids.length === 0) return ''
  if (ids.length === 1) return resolverNome(ids[0]!)

  const nomes = ids.map(resolverNome)
  if (nomes.length <= maxNomesVisiveis) return nomes.join(', ')

  const visiveis = nomes.slice(0, maxNomesVisiveis).join(', ')
  const restantes = nomes.length - maxNomesVisiveis
  return `${visiveis} +${restantes}`
}

export function lerEscopoPedidoSessionStorage(): string[] | null {
  try {
    const raw = sessionStorage.getItem(PEDIDO_SESSION_KEY_ESCOPO)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const ids = parsed.filter((id): id is string => typeof id === 'string' && id.length > 0)
    return ids.length > 0 ? ids : null
  } catch {
    return null
  }
}

export async function buscarEscopoPedidoSalvo(
  token: string,
  ctx: ContextoPedidoHub,
): Promise<string[] | null> {
  const res = await fetch(PREFERENCIA_PEDIDO_URL, {
    headers: montarHeadersPedidoHub(token, ctx),
    signal: AbortSignal.timeout(8_000),
  })

  if (!res.ok) return null

  const raw: unknown = await res.json()
  const parsed = preferenciaPedidoResponseSchema.safeParse(raw)
  if (!parsed.success) return null

  const ids = parsed.data.data?.ids_workspaces_escopo
  if (!ids || ids.length === 0) return null
  return ids
}

/** Backend primeiro; sessionStorage do Pedido como fallback (escopo ainda não persistido). */
export async function obterEscopoPedidoSalvo(
  token: string,
  ctx: ContextoPedidoHub,
): Promise<string[] | null> {
  const doBackend = await buscarEscopoPedidoSalvo(token, ctx)
  if (doBackend && doBackend.length > 0) return doBackend
  return lerEscopoPedidoSessionStorage()
}

export async function salvarEscopoPedidoApenasWorkspace(
  token: string,
  ctx: ContextoPedidoHub,
  idWorkspace: string,
): Promise<boolean> {
  const res = await fetch(PREFERENCIA_PEDIDO_URL, {
    method: 'PUT',
    headers: montarHeadersPedidoHub(token, ctx, true),
    body: JSON.stringify({ ids_workspaces_escopo: [idWorkspace] }),
    signal: AbortSignal.timeout(8_000),
  })

  if (!res.ok) return false

  try {
    sessionStorage.setItem(PEDIDO_SESSION_KEY_ESCOPO, JSON.stringify([idWorkspace]))
  } catch {
    /* quota / private mode */
  }

  return true
}
