import { useState, useCallback, useEffect } from 'react'
import type { UseGabiQuotaResult, QuotaInfo } from './tipos'

/**
 * Conditional fetching estilo SWR: passe `null` no quotaEndpoint enquanto
 * pré-requisitos (ex: tenantId do store) não estiverem prontos. O hook só
 * dispara o fetch quando recebe uma string de endpoint.
 */
export function useGabiQuota(quotaEndpoint: string | null): UseGabiQuotaResult {
  const [quota,      setQuota]      = useState<QuotaInfo | null>(null)
  const [carregando, setCarregando] = useState(false)

  const recarregar = useCallback(async () => {
    if (!quotaEndpoint) return
    setCarregando(true)
    try {
      const res = await fetch(quotaEndpoint)
      if (res.ok) {
        const data = await res.json()
        setQuota(data)
      }
    } catch {
      // silencia — badge simplesmente não atualiza
    } finally {
      setCarregando(false)
    }
  }, [quotaEndpoint])

  useEffect(() => {
    if (!quotaEndpoint) return
    void recarregar()
  }, [recarregar, quotaEndpoint])

  return { quota, carregando, recarregar }
}
