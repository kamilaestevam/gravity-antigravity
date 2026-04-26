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
      where: { id_usuario: userId, id_organizacao_usuario: tenantId },
      select: { tipo_usuario: true },
    })

    if (!user) return false

    // 1. Cadeia 1 — Roles Globais (Acesso total)
    if (user.tipo_usuario === 'SUPER_ADMIN' || user.tipo_usuario === 'ADMIN' || user.tipo_usuario === 'MASTER') {
      return true
    }

    // 2. Cadeia 2 — Permissão Granular (STANDARD e SUPPLIER)
    // Se não houver companyId ou productId, não podemos verificar granularidade
    if (!companyId || !productId) return false

    // O código da permissão é composto por resource:action (ex: email:write)
    const permissionKey = `${resource}:${action.toLowerCase()}`

    const permission = await prisma.usuarioPermissao.findFirst({
      where: {
        id_organizacao_usuario_permissao: tenantId,
        id_workspace_usuario_permissao: companyId,
        id_usuario_usuario_permissao: userId,
        id_produto_usuario_permissao: productId,
        permissao_usuario_permissao: permissionKey,
      },
    })

    return !!permission
  },

  /**
   * Lista todas as permissões de um usuário no tenant/workspace
   */
  async getUserPermissions(tenantId: string, userId: string, companyId?: string) {
    const rows = await prisma.usuarioPermissao.findMany({
      where: {
        id_organizacao_usuario_permissao: tenantId,
        id_usuario_usuario_permissao: userId,
        ...(companyId && { id_workspace_usuario_permissao: companyId }),
      },
      select: {
        id_workspace_usuario_permissao: true,
        id_produto_usuario_permissao: true,
        permissao_usuario_permissao: true,
        data_criacao_usuario_permissao: true,
      },
    })
    // DTO: mantém contrato externo (company_id, product_id, permission, created_at)
    return rows.map((r) => ({
      company_id: r.id_workspace_usuario_permissao,
      product_id: r.id_produto_usuario_permissao,
      permission: r.permissao_usuario_permissao,
      created_at: r.data_criacao_usuario_permissao,
    }))
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
          id_organizacao_usuario_permissao: tenantId,
          id_workspace_usuario_permissao: companyId,
          id_usuario_usuario_permissao: userId,
          id_produto_usuario_permissao: productId,
        },
      }),
      // Insere novas
      ...permissions.map((p) =>
        prisma.usuarioPermissao.create({
          data: {
            id_organizacao_usuario_permissao: tenantId,
            id_workspace_usuario_permissao: companyId,
            id_usuario_usuario_permissao: userId,
            id_produto_usuario_permissao: productId,
            permissao_usuario_permissao: p,
            concedido_por_usuario_permissao: grantedBy,
          },
        })
      ),
    ])
  },
}
