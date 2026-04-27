/**
 * ecosystemNodes.ts — Builders específicos do configurador (tenant/admin).
 *
 * Os nós estáticos (HUB, CORE, CONFIGURADOR, ADMIN, STORE) e o builder
 * unificado `buildEcosystemNodes` vivem em `@nucleo/localizador-global` —
 * este arquivo apenas re-exporta para compatibilidade e adiciona builders
 * que dependem de APIs do configurador (produtos tenant/admin).
 */
import { getProdutoMeta } from '@nucleo/logo-produtos'
import type { EcosystemNode } from '@nucleo/localizador-global'

// Re-exports da fonte única de verdade
export {
  HUB_NODE,
  CORE_NODE,
  CONFIGURADOR_NODE,
  ADMIN_NODE,
  HUB_STORE_NODE,
  buildEcosystemNodes,
} from '@nucleo/localizador-global'
export type { BuildEcosystemNodesOptions } from '@nucleo/localizador-global'

// ── Tipos de dados da API ─────────────────────────────────────────────────────

/** Produto retornado por GET /api/v1/workspaces/:id_workspace/produtos */
export interface CompanyProductItem {
  product_key: string
  is_active: boolean
  catalog?: { name: string; slug: string } | null
}

/** Produto retornado por GET /api/v1/admin/produtos-gravity */
export interface AdminProductItem {
  slug: string
  name: string
  status: 'ATIVO' | 'SUSPENSO' | 'EM_BREVE' | 'LEGADO' | 'INATIVO'
}

// ── Builders de nós de produto ────────────────────────────────────────────────

/**
 * Constrói nós de produto para telas de tenant (Core, produto).
 * Usa a resposta de /api/v1/workspaces/:id_workspace/produtos:
 *   - is_active = true  → accessible
 *   - is_active = false → locked
 */
export function buildTenantProductNodes(
  companyProducts: CompanyProductItem[],
  currentProductId?: string,
): EcosystemNode[] {
  return companyProducts.map(p => {
    const slug = p.catalog?.slug ?? p.product_key
    const meta = getProdutoMeta(slug)
    return {
      id:       slug,
      label:    p.catalog?.name ?? slug,
      sublabel: meta.sublabel,
      color:    meta.color,
      type:     'produto' as const,
      status:   slug === currentProductId
                  ? 'current'
                  : p.is_active
                    ? 'accessible'
                    : 'locked',
    }
  })
}

/**
 * Constrói nós de produto para o painel Admin.
 * Usa a resposta de /api/v1/admin/produtos-gravity:
 *   - ATIVO   → accessible
 *   - demais   → locked
 */
export function buildAdminProductNodes(
  products: AdminProductItem[],
  currentProductId?: string,
): EcosystemNode[] {
  return products.map(p => {
    const meta = getProdutoMeta(p.slug)
    return {
      id:       p.slug,
      label:    p.name,
      sublabel: meta.sublabel,
      color:    meta.color,
      type:     'produto' as const,
      status:   p.slug === currentProductId
                  ? 'current'
                  : p.status === 'ATIVO'
                    ? 'accessible'
                    : 'locked',
    }
  })
}
