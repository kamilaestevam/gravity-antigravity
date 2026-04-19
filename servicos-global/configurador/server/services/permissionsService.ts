// server/services/permissionsService.ts
// Gestão granular de permissões por tenant + usuário + recurso

import { prisma } from '../lib/prisma.js'

interface CheckPermissionInput {
  tenantId: string
  userId: string
  productId?: string
  companyId?: string
  resource: string
  action: string
}

export const permissionsService = {
  /**
   * Verifica se o usuário tem permissão para uma ação em um recurso
   * Master e Admins Gravity têm acesso total (Cadeia 1)
   */
  async checkPermission(input: CheckPermissionInput): Promise<boolean> {
    const { tenantId, userId, resource, action, companyId, productId } = input

    // Busca usuário e sua role global
    const user = await prisma.usuario.findFirst({
      where: { id: userId, tenant_id: tenantId },
      select: { role: true },
    })

    if (!user) return false

    // 1. Cadeia 1 — Roles Globais (Acesso total)
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'MASTER') {
      return true
    }

    // 2. Cadeia 2 — Permissão Granular (STANDARD e SUPPLIER)
    // Se não houver companyId ou productId, não podemos verificar granularidade
    if (!companyId || !productId) return false

    // O código da permissão é composto por resource:action (ex: email:write)
    const permissionKey = `${resource}:${action.toLowerCase()}`

    const permission = await prisma.usuarioPermissao.findFirst({
      where: {
        tenant_id: tenantId,
        company_id: companyId,
        user_id: userId,
        product_id: productId,
        permission: permissionKey,
      },
    })

    return !!permission
  },

  /**
   * Lista todas as permissões de um usuário no tenant/workspace
   */
  async getUserPermissions(tenantId: string, userId: string, companyId?: string) {
    return prisma.usuarioPermissao.findMany({
      where: {
        tenant_id: tenantId,
        user_id: userId,
        ...(companyId && { company_id: companyId }),
      },
      select: {
        company_id: true,
        product_id: true,
        permission: true,
        created_at: true,
      },
    })
  },

  /**
   * Define permissões de um usuário (UPSERT)
   */
  async setPermissions(
    tenantId: string,
    companyId: string,
    userId: string,
    productId: string,
    permissions: string[], // ex: ['email:read', 'email:write']
    grantedBy: string
  ) {
    await prisma.$transaction([
      // Limpa permissões antigas do produto neste workspace
      prisma.usuarioPermissao.deleteMany({
        where: {
          tenant_id: tenantId,
          company_id: companyId,
          user_id: userId,
          product_id: productId,
        },
      }),
      // Insere novas
      ...permissions.map((p) =>
        prisma.usuarioPermissao.create({
          data: {
            tenant_id: tenantId,
            company_id: companyId,
            user_id: userId,
            product_id: productId,
            permission: p,
            granted_by: grantedBy,
          },
        })
      ),
    ])
  },
}
