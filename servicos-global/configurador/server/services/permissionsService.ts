// server/services/permissionsService.ts
// Gestão granular de permissões por tenant + usuário + recurso

import { prisma } from '../lib/prisma.js'

interface CheckPermissionInput {
  id_organizacao: string
  id_usuario: string
  id_produto?: string
  id_workspace?: string
  resource: string
  action: string
}

export const permissionsService = {
  /**
   * Verifica se o usuário tem permissão para uma ação em um recurso
   * Master e Admins Gravity têm acesso total (Cadeia 1)
   */
  async checkPermission(input: CheckPermissionInput): Promise<boolean> {
    const { id_organizacao, id_usuario, resource, action, id_workspace, id_produto } = input

    // Busca usuário e sua role global
    const user = await prisma.usuario.findFirst({
      where: { id_usuario: id_usuario, id_organizacao_usuario: id_organizacao },
      select: { tipo_usuario: true },
    })

    if (!user) return false

    // 1. Cadeia 1 — Roles Globais (Acesso total)
    if (user.tipo_usuario === 'SUPER_ADMIN' || user.tipo_usuario === 'ADMIN' || user.tipo_usuario === 'MASTER') {
      return true
    }

    // 2. Cadeia 2 — Permissão Granular (STANDARD e SUPPLIER)
    // Se não houver id_workspace ou id_produto, não podemos verificar granularidade
    if (!id_workspace || !id_produto) return false

    // O código da permissão é composto por resource:action (ex: email:write)
    const permissionKey = `${resource}:${action.toLowerCase()}`

    const permission = await prisma.usuarioPermissao.findFirst({
      where: {
        id_organizacao_usuario_permissao: id_organizacao,
        id_workspace_usuario_permissao: id_workspace,
        id_usuario_usuario_permissao: id_usuario,
        id_produto_usuario_permissao: id_produto,
        permissao_usuario_permissao: permissionKey,
      },
    })

    return !!permission
  },

  /**
   * Lista todas as permissões de um usuário no tenant/workspace
   */
  async getUserPermissions(id_organizacao: string, id_usuario: string, id_workspace?: string) {
    const rows = await prisma.usuarioPermissao.findMany({
      where: {
        id_organizacao_usuario_permissao: id_organizacao,
        id_usuario_usuario_permissao: id_usuario,
        ...(id_workspace && { id_workspace_usuario_permissao: id_workspace }),
      },
      select: {
        id_workspace_usuario_permissao: true,
        id_produto_usuario_permissao: true,
        permissao_usuario_permissao: true,
        data_criacao_usuario_permissao: true,
      },
    })
    // DTO: contrato externo (id_workspace, id_produto, permission, created_at)
    return rows.map((r) => ({
      id_workspace: r.id_workspace_usuario_permissao,
      id_produto: r.id_produto_usuario_permissao,
      permission: r.permissao_usuario_permissao,
      created_at: r.data_criacao_usuario_permissao,
    }))
  },

  /**
   * Define permissões de um usuário (UPSERT)
   */
  async setPermissions(
    id_organizacao: string,
    id_workspace: string,
    id_usuario: string,
    id_produto: string,
    permissions: string[], // ex: ['email:read', 'email:write']
    grantedBy: string
  ) {
    await prisma.$transaction([
      // Limpa permissões antigas do produto neste workspace
      prisma.usuarioPermissao.deleteMany({
        where: {
          id_organizacao_usuario_permissao: id_organizacao,
          id_workspace_usuario_permissao: id_workspace,
          id_usuario_usuario_permissao: id_usuario,
          id_produto_usuario_permissao: id_produto,
        },
      }),
      // Insere novas
      ...permissions.map((p) =>
        prisma.usuarioPermissao.create({
          data: {
            id_organizacao_usuario_permissao: id_organizacao,
            id_workspace_usuario_permissao: id_workspace,
            id_usuario_usuario_permissao: id_usuario,
            id_produto_usuario_permissao: id_produto,
            permissao_usuario_permissao: p,
            concedido_por_usuario_permissao: grantedBy,
          },
        })
      ),
    ])
  },
}
