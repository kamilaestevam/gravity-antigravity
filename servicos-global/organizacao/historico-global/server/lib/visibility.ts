import { Prisma } from '../../../generated/index.js'
import type { Request } from 'express'

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'STANDARD' | 'SUPPLIER'

export interface AuthUser {
  id: string
  role: UserRole
  tenant_id: string
}

/**
 * Constrói o filtro de visibilidade baseado no role do usuário.
 *
 * SUPER_ADMIN / ADMIN → veem tudo (sem filtro de tenant)
 * MASTER              → veem toda a organização (filtro por tenant_id)
 * STANDARD / SUPPLIER → veem apenas os próprios registros (tenant_id + user_id)
 */
export function buildVisibilityFilter(user: AuthUser): Prisma.HistoricoLogWhereInput {
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return {}
  }

  if (user.role === 'MASTER') {
    return { tenant_id: user.tenant_id }
  }

  return { tenant_id: user.tenant_id, user_id: user.id }
}

export function extractAuthUser(req: Request): AuthUser | null {
  const auth = req.auth
  if (!auth?.userId || !auth?.tenantId) return null

  return {
    id: auth.userId,
    role: auth.role ?? 'STANDARD',
    tenant_id: auth.tenantId,
  }
}
