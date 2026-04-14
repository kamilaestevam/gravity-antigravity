// server/lib/syncRole.ts
// Sincroniza o role do banco para o publicMetadata do Clerk.
// Deve ser chamado toda vez que o role de um usuário muda no banco.

import { clerkClient } from './clerk.js'

/**
 * Escreve o role no publicMetadata do Clerk para o usuário especificado.
 * Fire-and-forget seguro: o chamador pode usar .catch() para logar falhas sem bloquear a resposta.
 *
 * Proteção contra downgrade: se o usuário já tem SUPER_ADMIN no Clerk, nunca sobrescreve com role inferior.
 */
export async function syncRoleToClerk(
  clerkUserId: string,
  tenantId: string,
  newRole: string
): Promise<void> {
  const clerkUser = await clerkClient.users.getUser(clerkUserId)
  const currentMeta = clerkUser.publicMetadata as Record<string, unknown>

  // Anti-downgrade: SUPER_ADMIN não pode ser rebaixado por esta rota
  if (currentMeta?.role === 'SUPER_ADMIN' && newRole !== 'SUPER_ADMIN') {
    return
  }

  await clerkClient.users.updateUser(clerkUserId, {
    publicMetadata: {
      ...currentMeta,
      tenantId,
      role: newRole,
    },
  })
}
