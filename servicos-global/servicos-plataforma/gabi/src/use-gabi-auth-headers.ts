/**
 * Bearer Clerk para chamadas browser → /api/v1/gabi quando o mount não injeta headers.
 * Em produção o proxy requireAuth exige Authorization; x-id-* vêm do JWT no servidor.
 */

import { useAuth } from '@clerk/clerk-react'
import { useCallback } from 'react'

export function useGabiAuthHeaders() {
  const { getToken, isSignedIn } = useAuth()

  const obterGabiAuthHeaders = useCallback(async (): Promise<Record<string, string> | undefined> => {
    if (!isSignedIn) return undefined
    const token = await getToken()
    if (!token) return undefined
    return { Authorization: `Bearer ${token}` }
  }, [getToken, isSignedIn])

  return obterGabiAuthHeaders
}
