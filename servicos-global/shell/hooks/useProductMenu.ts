/**
 * useProductMenu — Hook que monta a seção "Produtos Gravity" do menu lateral.
 *
 * Fluxo:
 * 1. Busca catálogo global (GET /api/v1/produtos-gravity)
 * 2. Busca produtos habilitados no workspace atual (GET /api/v1/workspaces/:id_workspace/produtos-gravity)
 * 3. Categoriza cada produto:
 *    - Ativo (workspace tem o produto)           → link direto para /produto/:slug
 *    - Contratar (catálogo ativo, workspace não) → link para /store
 *    - Em Breve (mockados na Store)              → desabilitado com label "Em Breve"
 *
 * REGRA 06 — respostas das duas APIs são validadas com Zod antes de uso.
 * REGRA 08 — falhas de parse são logadas (console.warn), não engolidas.
 */
import { useEffect, useState } from 'react'
import { z } from 'zod'

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

// ─── Schemas Zod (REGRA 06) ─────────────────────────────────────────────────

// GET /api/v1/produtos-gravity — catálogo público
const catalogoItemSchema = z.object({
  slug: z.string(),
  name: z.string(),
  status: z.string(),
})
const catalogoResponseSchema = z.object({
  products: z.array(catalogoItemSchema),
})

// GET /api/v1/workspaces/:id_workspace/produtos-gravity — habilitados no workspace
const produtoWorkspaceItemSchema = z.object({
  product_key: z.string(),
  is_active: z.boolean(),
})
const produtosWorkspaceResponseSchema = z.object({
  products: z.array(produtoWorkspaceItemSchema),
})

export function useProductMenu(): { products: ProductMenuItem[]; loading: boolean } {
  const [products, setProducts] = useState<ProductMenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const id_workspace = sessionStorage.getItem('gravity_company_id')

        // Busca catálogo e produtos do workspace em paralelo
        const [catRes, wsRes] = await Promise.all([
          fetch('/api/v1/produtos-gravity').catch(() => null),
          id_workspace
            ? fetch(`/api/v1/workspaces/${id_workspace}/produtos-gravity`, {
                headers: { 'x-id-organizacao': sessionStorage.getItem('gravity_tenant_id') ?? '' },
              }).catch(() => null)
            : Promise.resolve(null),
        ])

        if (cancelled) return

        // Parse catálogo (Zod)
        const catalogProducts: { slug: string; name: string }[] = []
        if (catRes && catRes.ok) {
          try {
            const raw = await catRes.json()
            const parsed = catalogoResponseSchema.parse(raw)
            for (const p of parsed.products) {
              if (p.status === 'Ativo') {
                catalogProducts.push({ slug: p.slug, name: p.name })
              }
            }
          } catch (parseErr) {
            console.warn('[useProductMenu] Resposta do catálogo fora do schema esperado:', parseErr)
          }
        }

        // Parse produtos do workspace (Zod)
        const workspaceKeys = new Set<string>()
        if (wsRes && wsRes.ok) {
          try {
            const raw = await wsRes.json()
            const parsed = produtosWorkspaceResponseSchema.parse(raw)
            for (const p of parsed.products) {
              if (p.is_active) workspaceKeys.add(p.product_key)
            }
          } catch (parseErr) {
            console.warn('[useProductMenu] Resposta de produtos do workspace fora do schema esperado:', parseErr)
          }
        }

        // Monta lista final
        const items: ProductMenuItem[] = []

        // 1. Produtos do catálogo
        for (const cp of catalogProducts) {
          items.push({
            slug: cp.slug,
            name: cp.name,
            status: workspaceKeys.has(cp.slug) ? 'active' : 'contract',
          })
        }

        // 2. Produtos mockados ("Em Breve")
        for (const [slug, name] of MOCKED_SLUGS) {
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
