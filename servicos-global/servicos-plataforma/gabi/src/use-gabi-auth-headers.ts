/**
 * Bearer Clerk para chamadas browser → /api/v1/gabi quando o mount não injeta headers.
 * Em produção o proxy requireAuth exige Authorization; x-id-* vêm do JWT no servidor.
 */

import { useAuth } from '@clerk/clerk-react'
import { useEffect, useMemo, useState } from 'react'

export function useGabiAuthHeaders(): Record<string, string> | undefined {
  const { getToken, isSignedIn } = useAuth()
  const [bearer, setBearer] = useState<string | undefined>()

  useEffect(() => {
    if (!isSignedIn) {
      setBearer(undefined)
      return
    }
    let cancelado = false
    void getToken().then((token) => {
      if (!cancelado) {
        setBearer(token ?? undefined)
      }
    })
    return () => {
      cancelado = true
    }
  }, [getToken, isSignedIn])

  return useMemo(() => {
    if (!bearer) return undefined
    return { Authorization: `Bearer ${bearer}` }
  }, [bearer])
}
