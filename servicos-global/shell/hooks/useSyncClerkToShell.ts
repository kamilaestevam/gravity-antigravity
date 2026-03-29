// shell/hooks/useSyncClerkToShell.ts
// Sincroniza dados do Clerk (auth provider) com o Shell store.
//
// Quando o Clerk carrega e o usuário está autenticado, este hook:
// 1. Lê user.id, email, fullName, imageUrl do Clerk
// 2. Lê organizationMemberships[0] para extrair o tenantId (orgId do Clerk)
// 3. Seta currentUser no ShellStore
//
// Isso garante que todos os componentes que leem useShellStore().currentUser
// terão o contexto correto de tenant, incluindo:
// - useLoadAllowedProducts (filtra sidebar)
// - Produto SimulaCusto (envia x-tenant-id)
// - useUserPreferences (persiste tema/tooltips)

import { useEffect } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { useShellStore } from '../store'

/**
 * Deve ser chamado uma vez no Layout principal (ou App.tsx do Configurador).
 * Requer que esteja dentro de um <ClerkProvider>.
 */
export function useSyncClerkToShell() {
  const { user, isLoaded: userLoaded } = useUser()
  const { orgId } = useAuth()
  const { currentUser, setCurrentUser } = useShellStore()

  useEffect(() => {
    if (!userLoaded || !user) return

    // Extrair tenantId: prioriza orgId do auth, senão pega da primeira membership
    const tenantId =
      orgId ??
      user.organizationMemberships?.[0]?.organization?.id ??
      undefined

    const tenantName =
      user.organizationMemberships?.[0]?.organization?.name ??
      undefined

    // Só atualiza se mudou (evita loop)
    if (
      currentUser.id === user.id &&
      currentUser.tenantId === tenantId
    ) {
      return
    }

    setCurrentUser({
      id: user.id,
      name: user.fullName ?? user.firstName ?? '',
      email: user.emailAddresses?.[0]?.emailAddress ?? '',
      avatarUrl: user.imageUrl ?? undefined,
      tenantId,
      tenantName,
    })
  }, [userLoaded, user, orgId, currentUser.id, currentUser.tenantId, setCurrentUser])
}
