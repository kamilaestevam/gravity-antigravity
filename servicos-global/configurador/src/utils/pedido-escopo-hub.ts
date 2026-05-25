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
  suprimir_aviso_escopo_hub_pedido: z.boolean().optional(),
}).nullable()

const preferenciaPedidoResponseSchema = z.object({
  data: preferenciaPedidoDataSchema,
})

export type PreferenciaPedidoEscopo = z.infer<typeof preferenciaPedidoDataSchema>

export interface ContextoPedidoHub {
  idOrganizacao: string
  idUsuario: string
}

export interface PreferenciaEscopoHubPedido {
  idsEscopo: string[] | null
  suprimirAvisoEscopoHub: boolean
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

function chaveSuprimirAvisoLocal(ctx: ContextoPedidoHub): string {
  return `pedido:suprimir_aviso_escopo_hub:${ctx.idOrganizacao}:${ctx.idUsuario}`
}

export function lerSuprimirAvisoEscopoHubLocal(ctx: ContextoPedidoHub): boolean {
  try {
    return localStorage.getItem(chaveSuprimirAvisoLocal(ctx)) === '1'
  } catch {
    return false
  }
}

function gravarSuprimirAvisoEscopoHubLocal(ctx: ContextoPedidoHub, suprimir: boolean): void {
  try {
    const chave = chaveSuprimirAvisoLocal(ctx)
    if (suprimir) localStorage.setItem(chave, '1')
    else localStorage.removeItem(chave)
  } catch {
    /* quota / private mode */
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

async function buscarPreferenciaPedidoHub(
  token: string,
  ctx: ContextoPedidoHub,
): Promise<PreferenciaPedidoEscopo> {
  const res = await fetch(PREFERENCIA_PEDIDO_URL, {
    headers: montarHeadersPedidoHub(token, ctx),
    signal: AbortSignal.timeout(8_000),
  })

  if (!res.ok) return null

  const raw: unknown = await res.json()
  const parsed = preferenciaPedidoResponseSchema.safeParse(raw)
  if (!parsed.success) return null
  return parsed.data.data
}

/** Backend primeiro; sessionStorage do Pedido como fallback para escopo. */
export async function obterPreferenciaEscopoHubPedido(
  token: string,
  ctx: ContextoPedidoHub,
): Promise<PreferenciaEscopoHubPedido> {
  const preferencia = await buscarPreferenciaPedidoHub(token, ctx)
  const suprimirBackend = preferencia?.suprimir_aviso_escopo_hub_pedido === true
  const suprimirLocal = lerSuprimirAvisoEscopoHubLocal(ctx)

  if (suprimirBackend) gravarSuprimirAvisoEscopoHubLocal(ctx, true)

  const idsBackend = preferencia?.ids_workspaces_escopo
  const idsEscopo = (idsBackend && idsBackend.length > 0)
    ? idsBackend
    : lerEscopoPedidoSessionStorage()

  return {
    idsEscopo,
    suprimirAvisoEscopoHub: suprimirBackend || suprimirLocal,
  }
}

export async function salvarSuprimirAvisoEscopoHubPedido(
  token: string,
  ctx: ContextoPedidoHub,
): Promise<boolean> {
  gravarSuprimirAvisoEscopoHubLocal(ctx, true)

  const res = await fetch(PREFERENCIA_PEDIDO_URL, {
    method: 'PUT',
    headers: montarHeadersPedidoHub(token, ctx, true),
    body: JSON.stringify({ suprimir_aviso_escopo_hub_pedido: true }),
    signal: AbortSignal.timeout(8_000),
  })

  return res.ok
}
