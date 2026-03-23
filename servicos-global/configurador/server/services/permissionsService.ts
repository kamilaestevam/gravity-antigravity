// server/services/permissionsService.ts
// Gestão granular de permissões por tenant + usuário + recurso

import { prisma } from '../lib/prisma.js'

interface CheckPermissionInput {
  tenantId: string
  userId: string
  resource: string
  action: 'READ' | 'WRITE' | 'DELETE' | 'MANAGE'
}

export const permissionsService = {
  /**
   * Verifica se o usuário tem permissão para uma ação em um recurso
   * Usuários com role OWNER têm acesso irrestrito
   */
  async checkPermission(input: CheckPermissionInput): Promise<boolean> {
    const { tenantId, userId, resource, action } = input

    // Owner e Admin têm acesso total
    const user = await prisma.user.findFirst({
      where: { id: userId, tenant_id: tenantId },
      select: { role: true },
    })

    if (!user) return false

    if (user.role === 'OWNER' || user.role === 'ADMIN') return true

    // Verifica permissão granular
    const permission = await prisma.permission.findFirst({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        resource,
        action,
      },
    })

    return !!permission
  },

  /**
   * Lista todas as permissões de um usuário no tenant
   */
  async getUserPermissions(tenantId: string, userId: string) {
    return prisma.permission.findMany({
      where: { tenant_id: tenantId, user_id: userId },
      select: { resource: true, action: true, created_at: true },
    })
  },

  /**
   * Define permissões de um usuário (upsert em lote)
   */
  async setPermissions(
    tenantId: string,
    userId: string,
    permissions: Array<{ resource: string; action: string }>
  ) {
    // Remove permissões existentes e reinsere
    await prisma.$transaction([
      prisma.permission.deleteMany({ where: { tenant_id: tenantId, user_id: userId } }),
      ...permissions.map((p) =>
        prisma.permission.create({
          data: {
            tenant_id: tenantId,
            user_id: userId,
            resource: p.resource,
            action: p.action as 'READ' | 'WRITE' | 'DELETE' | 'MANAGE',
          },
        })
      ),
    ])
  },
}
