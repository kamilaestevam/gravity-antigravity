/**
 * useGabiRequestHeaders — Headers para chamadas browser → /api/v1/gabi
 *
 * O proxy Express injeta identidade a partir do JWT (requireAuth), mas o Bearer
 * precisa vir do browser. Headers x-id-* reforçam o contrato em dev (Vite proxy).
 * Bearer é obtido fresco em cada chamada (JWT Clerk expira em ~60s).
 */

import { useAuth } from '@clerk/clerk-react'
import { useCallback, useMemo } from 'react'
import { useCarregarTipoUsuario } from './use-carregar-tipo-usuario'

export function useGabiRequestHeaders() {
  const { getToken, isSignedIn } = useAuth()
  const { tipoUsuario, idUsuarioPrisma, idOrganizacao, pronto } = useCarregarTipoUsuario()

  const headersContexto = useMemo((): Record<string, string> | undefined => {
    if (!pronto) return undefined

    const headers: Record<string, string> = {}
    if (idOrganizacao) headers['x-id-organizacao'] = idOrganizacao
    if (idUsuarioPrisma) headers['x-id-usuario'] = idUsuarioPrisma
    if (tipoUsuario) headers['x-tipo-usuario'] = tipoUsuario
    return Object.keys(headers).length > 0 ? headers : undefined
  }, [pronto, idOrganizacao, idUsuarioPrisma, tipoUsuario])

  const obterGabiRequestHeaders = useCallback(async (): Promise<Record<string, string> | undefined> => {
    if (!isSignedIn || !pronto) return undefined

    const token = await getToken()
    if (!token) return undefined

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    }
    if (idOrganizacao) headers['x-id-organizacao'] = idOrganizacao
    if (idUsuarioPrisma) headers['x-id-usuario'] = idUsuarioPrisma
    if (tipoUsuario) headers['x-tipo-usuario'] = tipoUsuario
    return headers
  }, [getToken, isSignedIn, pronto, idOrganizacao, idUsuarioPrisma, tipoUsuario])

  return { obterGabiRequestHeaders, headersContexto, contextoPronto: isSignedIn && pronto }
}
