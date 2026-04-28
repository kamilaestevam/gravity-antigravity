import { useState, useCallback, useEffect } from 'react'
import type { UseGabiQuotaResult, QuotaInfo } from './tipos'

/**
 * Conditional fetching estilo SWR: passe `null` no quotaEndpoint enquanto
 * pré-requisitos (ex: tenantId do store) não estiverem prontos. O hook só
 * dispara o fetch quando recebe uma string de endpoint.
 *
 * O segundo argumento `fetchOptions` permite ao chamador injetar headers
 * de autenticação (x-tenant-id, x-user-id, x-internal-key, etc.). Sem ele,
 * o fetch sai sem qualquer contexto e o backend retorna 400.
 */
export function useGabiQuota(
  quotaEndpoint: string | null,
  fetchOptions?: RequestInit,
): UseGabiQuotaResult {
  const [quota,      setQuota]      = useState<QuotaInfo | null>(null)
  const [carregando, setCarregando] = useState(false)

  const recarregar = useCallback(async () => {
    if (!quotaEndpoint) return
    setCarregando(true)
    try {
      const res = await fetch(quotaEndpoint, fetchOptions)
      if (res.ok) {
        const data = await res.json()
        setQuota(data)
      }
    } catch {
      // silencia — badge simplesmente não atualiza
    } finally {
      setCarregando(false)
    }
  }, [quotaEndpoint, fetchOptions])

  useEffect(() => {
    if (!quotaEndpoint) return
    void recarregar()
  }, [recarregar, quotaEndpoint])

  return { quota, carregando, recarregar }
}
