/**
 * useGabiRequestHeaders — Headers para chamadas browser → /api/v1/gabi
 *
 * O proxy Express injeta identidade a partir do JWT (requireAuth), mas o Bearer
 * precisa vir do browser. Headers x-id-* reforçam o contrato em dev (Vite proxy).
 */

import { useAuth } from '@clerk/clerk-react'
import { useEffect, useMemo, useState } from 'react'
import { useCarregarTipoUsuario } from './use-carregar-tipo-usuario'

export function useGabiRequestHeaders(): Record<string, string> | undefined {
  const { getToken, isSignedIn } = useAuth()
  const { tipoUsuario, idUsuarioPrisma, idOrganizacao, pronto } = useCarregarTipoUsuario()
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
  }, [getToken, isSignedIn, pronto])

  return useMemo(() => {
    if (!bearer || !pronto) return undefined

    const headers: Record<string, string> = {
      Authorization: `Bearer ${bearer}`,
    }
    if (idOrganizacao) headers['x-id-organizacao'] = idOrganizacao
    if (idUsuarioPrisma) headers['x-id-usuario'] = idUsuarioPrisma
    if (tipoUsuario) headers['x-tipo-usuario'] = tipoUsuario
    return headers
  }, [bearer, pronto, idOrganizacao, idUsuarioPrisma, tipoUsuario])
}
