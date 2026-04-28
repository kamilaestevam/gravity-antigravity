// shell/hooks/useLoadAllowedProducts.ts
// Carrega os produtos habilitados para o tenant atual ao montar o Shell.
// Chama GET /api/v1/internal/organizacao-produtos para obter TODOS os ProductConfigs da organização.

import { useEffect } from 'react'
import { useShellStore } from '../store'

const CONFIGURADOR_URL = import.meta.env.VITE_CONFIGURADOR_URL ?? ''
const INTERNAL_KEY = import.meta.env.VITE_INTERNAL_SERVICE_KEY ?? ''

/**
 * Hook que busca os produtos ativos do tenant e popula o store do Shell.
 * Deve ser chamado uma vez no Layout principal.
 *
 * Fluxo:
 * 1. Lê tenantId do currentUser no store
 * 2. Chama GET /api/v1/internal/organizacao-produtos?tenantId=X
 * 3. Popula allowedProducts no store
 * 4. Sidebar filtra automaticamente via isProductAllowed()
 */
export function useLoadAllowedProducts() {
  const { currentUser, setAllowedProducts, productsLoaded } = useShellStore()

  useEffect(() => {
    const tenantId = currentUser.tenantId
    if (!tenantId || productsLoaded) return

    let cancelled = false

    async function loadProducts() {
      try {
        const baseUrl = CONFIGURADOR_URL || ''
        const res = await fetch(
          `${baseUrl}/api/v1/internal/organizacao-produtos?tenantId=${encodeURIComponent(tenantId!)}`,
          {
            headers: {
              'x-internal-key': INTERNAL_KEY,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!res.ok) {
          console.warn('[Shell] Falha ao carregar produtos permitidos:', res.status)
          return
        }

        const data = await res.json()

        if (!cancelled && data.products) {
          setAllowedProducts(
            data.products.map((p: { product_key: string; is_active: boolean }) => ({
              product_key: p.product_key,
              is_active: p.is_active,
            }))
          )
        }
      } catch (err) {
        console.warn('[Shell] Erro ao carregar produtos permitidos:', err)
        // Em caso de erro, não bloqueia — permite tudo (graceful degradation)
      }
    }

    loadProducts()
    return () => { cancelled = true }
  }, [currentUser.tenantId, productsLoaded, setAllowedProducts])
}
