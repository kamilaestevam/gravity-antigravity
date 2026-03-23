// server/lib/clerk.ts
// Clerk backend client — autenticação de usuários

import { createClerkClient } from '@clerk/clerk-sdk-node'

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY não definida no ambiente')
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

/**
 * Verifica se um usuário do Clerk possui o role gravity_admin
 * (gerenciado via Clerk publicMetadata.role)
 */
export async function isGravityAdmin(clerkUserId: string): Promise<boolean> {
  try {
    const user = await clerkClient.users.getUser(clerkUserId)
    const meta = user.publicMetadata as Record<string, unknown>
    return meta?.role === 'gravity_admin'
  } catch {
    return false
  }
}
