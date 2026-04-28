/**
 * useProductMenu — Hook que monta a seção "Produtos Gravity" do menu lateral.
 *
 * Fluxo:
 * 1. Busca catálogo global (GET /api/v1/products)
 * 2. Busca produtos habilitados na company atual (GET /api/v1/companies/:id/products)
 * 3. Categoriza cada produto:
 *    - Ativo (company tem o produto)   → link direto para /produto/:slug
 *    - Contratar (catálogo ativo, company não tem) → link para /store
 *    - Em Breve (mockados na Store)    → desabilitado com label "Em Breve"
 */
import { useEffect, useState } from 'react'

export interface ProductMenuItem {
  slug: string
  name: string
  status: 'active' | 'contract' | 'coming_soon'
}

// Produtos mockados na Gravity Store (ainda não existem no catálogo real)
const MOCKED_SLUGS = new Map<string, string>([
  ['smart-read', 'Smart Read'],
  ['bid-frete-internacional', 'BID Frete Internacional'],
  ['bid-cambio', 'BID Câmbio'],
])

export function useProductMenu(): { products: ProductMenuItem[]; loading: boolean } {
  const [products, setProducts] = useState<ProductMenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const companyId = sessionStorage.getItem('gravity_company_id')

        // Busca catálogo e produtos da company em paralelo
        const [catRes, compRes] = await Promise.all([
          fetch('/api/v1/produtos').catch(() => null),
          companyId
            ? fetch(`/api/v1/workspaces/${companyId}/produtos`, {
                headers: { 'x-id-organizacao': sessionStorage.getItem('gravity_tenant_id') ?? '' },
              }).catch(() => null)
            : Promise.resolve(null),
        ])

        if (cancelled) return

        // Parse catálogo (produtos ativos no DB)
        const catalogProducts: { slug: string; name: string; status: string }[] = []
        if (catRes && catRes.ok) {
          const data = await catRes.json()
          ;(data.products ?? []).forEach((p: { slug: string; name: string; status: string }) => {
            if (p.status === 'Ativo') {
              catalogProducts.push({ slug: p.slug, name: p.name, status: p.status })
            }
          })
        }

        // Parse produtos habilitados na company
        const companyKeys = new Set<string>()
        if (compRes && compRes.ok) {
          const data = await compRes.json()
          ;(data.products ?? []).forEach((p: { product_key: string; is_active: boolean }) => {
            if (p.is_active) companyKeys.add(p.product_key)
          })
        }

        // Monta lista final
        const items: ProductMenuItem[] = []

        // 1. Produtos do catálogo
        for (const cp of catalogProducts) {
          items.push({
            slug: cp.slug,
            name: cp.name,
            status: companyKeys.has(cp.slug) ? 'active' : 'contract',
          })
        }

        // 2. Produtos mockados ("Em Breve")
        for (const [slug, name] of MOCKED_SLUGS) {
          // Não duplicar se por acaso já existe no catálogo
          if (!items.some(i => i.slug === slug)) {
            items.push({ slug, name, status: 'coming_soon' })
          }
        }

        if (!cancelled) setProducts(items)
      } catch (err) {
        console.error('[useProductMenu] Erro ao carregar produtos:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { products, loading }
}
