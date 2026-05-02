import { Prisma } from '../../../generated/index.js'
import type { Request } from 'express'

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'STANDARD' | 'SUPPLIER'

export interface AuthUser {
  id: string
  role: UserRole
  id_organizacao: string
}

/**
 * Constrói o filtro de visibilidade baseado no role do usuário.
 *
 * SUPER_ADMIN / ADMIN → veem tudo (sem filtro de organização)
 * MASTER              → veem toda a organização (filtro por id_organizacao)
 * STANDARD / SUPPLIER → veem apenas os próprios registros (id_organizacao + id_usuario)
 */
export function buildVisibilityFilter(user: AuthUser): Prisma.HistoricoLogWhereInput {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return {}
  }

  if (user.role === 'MASTER') {
    return { id_organizacao: user.id_organizacao }
  }

  return { id_organizacao: user.id_organizacao, id_usuario: user.id }
}

export function extractAuthUser(req: Request): AuthUser | null {
  const auth = req.auth
  if (!auth?.id_usuario || !auth?.id_organizacao) return null

  return {
    id: auth.id_usuario,
    role: (auth.tipo_usuario ?? 'STANDARD') as UserRole,
    id_organizacao: auth.id_organizacao,
  }
}
