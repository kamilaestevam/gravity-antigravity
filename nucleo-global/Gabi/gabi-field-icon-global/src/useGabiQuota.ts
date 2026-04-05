import { useState, useCallback, useEffect } from 'react'
import type { UseGabiQuotaResult, QuotaInfo } from './tipos'

export function useGabiQuota(quotaEndpoint: string): UseGabiQuotaResult {
  const [quota,      setQuota]      = useState<QuotaInfo | null>(null)
  const [carregando, setCarregando] = useState(false)

  const recarregar = useCallback(async () => {
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

  useEffect(() => { void recarregar() }, [recarregar])

  return { quota, carregando, recarregar }
}
