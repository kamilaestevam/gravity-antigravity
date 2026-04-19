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
 * Verifica se um usuário possui role de administrador Gravity (SUPER_ADMIN ou ADMIN).
 * Fonte de verdade: Prisma (banco) — não depende de publicMetadata do Clerk.
 */
export async function isGravityAdmin(clerkUserId: string): Promise<boolean> {
  try {
    const { prisma } = await import('./prisma.js')
    const usuario = await prisma.usuario.findFirst({
      where: { clerk_user_id: clerkUserId },
      select: { role: true },
    })
    return usuario?.role === 'SUPER_ADMIN' || usuario?.role === 'ADMIN'
  } catch {
    return false
  }
}
