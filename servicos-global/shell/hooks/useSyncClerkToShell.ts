// shell/hooks/useSyncClerkToShell.ts
// Sincroniza dados do Clerk (auth provider) com o Shell store.
//
// Fonte única de verdade para multi-tenancy: publicMetadata do Clerk.
// NÃO usamos o sistema de Organizations nativo do Clerk — o tenantId
// é gerenciado inteiramente via Prisma e gravado no publicMetadata.
//
// Quando o Clerk carrega e o usuário está autenticado, este hook:
// 1. Lê user.id, email, fullName, imageUrl do Clerk
// 2. Lê tenantId e role do publicMetadata (fonte de verdade)
// 3. Seta currentUser no ShellStore
//
// Isso garante que todos os componentes que leem useShellStore().currentUser
// terão o contexto correto de tenant, incluindo:
// - useLoadAllowedProducts (filtra sidebar)
// - Produto SimulaCusto (envia x-tenant-id)
// - useUserPreferences (persiste tema/tooltips)

import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useShellStore } from '../store'

const ROLE_LABELS: Record<string, string> = {
  gravity_admin: 'Admin',
  SUPER_ADMIN:   'Super Admin',
  ADMIN:         'Admin',
  MASTER:        'Master',
  STANDARD:      'Standard',
  SUPPLIER:      'Fornecedor',
}

function resolveRole(raw: string): string {
  return ROLE_LABELS[raw] ?? (raw || 'Standard')
}

/**
 * Deve ser chamado uma vez no Layout principal (ou App.tsx do Configurador).
 * Requer que esteja dentro de um <ClerkProvider>.
 */
export function useSyncClerkToShell() {
  const { user, isLoaded: userLoaded } = useUser()
  const { currentUser, setCurrentUser } = useShellStore()

  useEffect(() => {
    if (!userLoaded || !user) return

    // Fonte única de verdade: publicMetadata gerenciado pelo Prisma
    const tenantId = user.publicMetadata?.tenantId as string | undefined
    const role     = resolveRole((user.publicMetadata?.role as string) ?? '')

    // Guard: publicMetadata vazio durante refresh transitório do Clerk não deve derrubar
    // role OU tenantId já definidos. Sem isso, uma navegação SPA que dispara um refresh
    // transitório do Clerk zera currentUser.tenantId e quebra chamadas de API dos filhos.
    if (!user.publicMetadata?.role && currentUser.role) return
    if (!user.publicMetadata?.tenantId && currentUser.tenantId) return

    // Só atualiza se mudou (evita loop)
    if (
      currentUser.id === user.id &&
      currentUser.tenantId === tenantId &&
      currentUser.role === role
    ) {
      return
    }

    setCurrentUser({
      id:       user.id,
      name:     user.fullName ?? user.firstName ?? '',
      email:    user.emailAddresses?.[0]?.emailAddress ?? '',
      avatarUrl: user.imageUrl ?? undefined,
      tenantId,
      role,
    })
  }, [userLoaded, user, currentUser.id, currentUser.tenantId, currentUser.role, setCurrentUser])
}
