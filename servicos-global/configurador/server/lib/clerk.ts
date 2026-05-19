// server/lib/clerk.ts
// Clerk backend client — autenticação de usuários
// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()

import { createClerkClient, type ClerkClient } from '@clerk/clerk-sdk-node'

let _clerkClient: ClerkClient | undefined

export function getClerkClient(): ClerkClient {
  if (!_clerkClient) {
    const secretKey = process.env.CLERK_SECRET_KEY
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY não definida no ambiente')
    }
    _clerkClient = createClerkClient({ secretKey })
  }
  return _clerkClient
}

/** @deprecated Use getClerkClient() — mantido para compatibilidade */
export const clerkClient = new Proxy({} as ClerkClient, {
  get(_target, prop) {
    return (getClerkClient() as Record<string | symbol, unknown>)[prop]
  },
})

/**
 * Verifica se um usuário possui role de administrador Gravity (SUPER_ADMIN ou ADMIN).
 * Fonte de verdade: Prisma (banco) — não depende de publicMetadata do Clerk.
 */
export async function isGravityAdmin(clerkUserId: string): Promise<boolean> {
  try {
    const { prisma } = await import('./prisma.js')
    const usuario = await prisma.usuario.findFirst({
      where: { id_clerk_usuario: clerkUserId },
      select: { tipo_usuario: true },
    })
    return usuario?.tipo_usuario === 'SUPER_ADMIN' || usuario?.tipo_usuario === 'ADMIN'
  } catch {
    return false
  }
}
