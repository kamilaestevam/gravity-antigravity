/**
 * filtro-visibilidade-colunas-personalizadas-smart-read.ts
 * Paridade Pedido › colunasUsuarioService.listar (visibilidade todos | roles | privado).
 */

import type { ColunaPersonalizadaSmartRead } from '../components/ModalNovaColunaSmartRead'

export type VisibilidadeColunaSmartRead = 'todos' | 'roles' | 'privado'

export type ContextoVisibilidadeColunaSmartRead = {
  id_usuario: string
  tipo_usuario?: string
}

const VISIBILIDADES_VALIDAS = new Set<VisibilidadeColunaSmartRead>(['todos', 'roles', 'privado'])

export function normalizarVisibilidadeColunaSmartRead(
  raw: unknown,
): VisibilidadeColunaSmartRead {
  if (typeof raw === 'string' && VISIBILIDADES_VALIDAS.has(raw as VisibilidadeColunaSmartRead)) {
    return raw as VisibilidadeColunaSmartRead
  }
  return 'todos'
}

export function colunaPersonalizadaVisivelParaUsuario(
  col: ColunaPersonalizadaSmartRead,
  ctx: ContextoVisibilidadeColunaSmartRead,
): boolean {
  const vis = col.visibilidade ?? 'todos'
  if (vis === 'todos') return true
  if (vis === 'privado') {
    if (!col.id_usuario_criador) return false
    return col.id_usuario_criador === ctx.id_usuario
  }
  if (vis === 'roles') {
    const patentes = col.roles_permitidas ?? []
    if (patentes.length === 0 || !ctx.tipo_usuario) return false
    return patentes.includes(ctx.tipo_usuario)
  }
  return true
}

export function filtrarColunasPersonalizadasVisiveis(
  colunas: ColunaPersonalizadaSmartRead[],
  ctx: ContextoVisibilidadeColunaSmartRead,
): ColunaPersonalizadaSmartRead[] {
  return colunas.filter((col) => colunaPersonalizadaVisivelParaUsuario(col, ctx))
}

export function rotuloVisibilidadeColunaSmartRead(
  visibilidade: VisibilidadeColunaSmartRead | undefined,
): string {
  if (visibilidade === 'privado') return 'Somente eu'
  if (visibilidade === 'roles') return 'Por patente'
  return 'Todos'
}

export function resolverRolesPermitidasNovaColunaSmartRead(params: {
  visibilidade: VisibilidadeColunaSmartRead
  tipo_usuario?: string
  rolesExistentes?: string[]
}): string[] | undefined {
  if (params.visibilidade !== 'roles') return undefined
  if (params.rolesExistentes?.length) return [...params.rolesExistentes]
  if (params.tipo_usuario) return [params.tipo_usuario]
  return []
}
