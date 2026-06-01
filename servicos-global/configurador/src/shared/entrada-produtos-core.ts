/**
 * entrada-produtos-core.ts — cards do /core e Hub (BID operacional vs visão fornecedor).
 */

import type { ProdutoWorkspaceItem } from '../services/api-client'
import { nomeExibicaoProdutoGravity } from '../data/product-meta'
import {
  ehSlugProdutoBidFrete,
  temBypassPermissao,
  usuarioTemPermissaoGranularProduto,
  usuarioTemPermissaoCotarFrete,
  type TipoUsuarioBypass,
} from '../../shared/index.js'
import { ROTA_ENTRADA_BID_FRETE_FORNECEDOR } from './verificar-cotar-bid-frete-internacional'

export type { VarianteCardProdutoCore } from './cards-produtos-core-types.js'
import type { VarianteCardProdutoCore } from './cards-produtos-core-types.js'

export interface CardProdutoCoreExibicao {
  key: string
  produto: ProdutoWorkspaceItem
  slug: string
  nome: string
  rota: string
  variant: VarianteCardProdutoCore
}

export function usuarioTemBypassPermissoesUi(tipo_usuario: TipoUsuarioBypass | null | undefined): boolean {
  return temBypassPermissao({ tipo_usuario })
}

interface PermissoesResponse {
  permissoes: Array<{ permissao_usuario: string }>
}

export async function carregarPermissoesUsuarioWorkspace(
  getToken: () => Promise<string | null>,
  idUsuario: string,
  idWorkspace: string,
): Promise<Set<string>> {
  const token = await getToken()
  if (!token) throw new Error('Sem token de autenticação')

  const url = `/api/v1/usuarios/${encodeURIComponent(idUsuario)}/permissoes?id_workspace=${encodeURIComponent(idWorkspace)}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`HTTP ${res.status} ao carregar permissões`)

  const data = (await res.json()) as PermissoesResponse
  const set = new Set<string>()
  for (const p of data.permissoes) {
    set.add(p.permissao_usuario)
  }
  return set
}

/**
 * Expande produtos do workspace em cards do Core/Hub.
 * BID pode gerar até dois cards: operacional (grade) e visão fornecedor (cotar).
 */
export function expandirCardsProdutosCore(
  products: ProdutoWorkspaceItem[],
  permissoes: ReadonlySet<string> | null,
  bypassPermissoes: boolean,
  t: (key: string, defaultValue?: string) => string,
): CardProdutoCoreExibicao[] {
  const cards: CardProdutoCoreExibicao[] = []

  for (const p of products.filter(prod => prod.is_active)) {
    const slug = p.catalog?.slug ?? p.product_key

    if (ehSlugProdutoBidFrete(slug)) {
      const temOperacional = bypassPermissoes
        || (permissoes != null && usuarioTemPermissaoGranularProduto(permissoes, slug))
      const temFornecedor = bypassPermissoes
        || (permissoes != null && usuarioTemPermissaoCotarFrete(permissoes, slug))

      if (temOperacional) {
        cards.push({
          key: `${p.product_key}:operacional`,
          produto: p,
          slug,
          nome: nomeExibicaoProdutoGravity(slug, p.catalog?.name ?? p.product_key, t),
          rota: `/produto/${slug}`,
          variant: 'bid_operacional',
        })
      }

      if (temFornecedor) {
        cards.push({
          key: `${p.product_key}:fornecedor`,
          produto: p,
          slug,
          nome: t(
            'hub.produto_bid_frete_internacional_fornecedor',
            'Bid Frete Internacional - Fornecedor',
          ),
          rota: ROTA_ENTRADA_BID_FRETE_FORNECEDOR,
          variant: 'bid_fornecedor',
        })
      }

      continue
    }

    cards.push({
      key: p.product_key,
      produto: p,
      slug,
      nome: nomeExibicaoProdutoGravity(slug, p.catalog?.name ?? p.product_key, t),
      rota: `/produto/${slug}`,
      variant: 'padrao',
    })
  }

  return cards
}

export type { AgrupamentoCardsProdutosCore } from './agrupamento-cards-produtos-core.js'
export { agruparCardsProdutosCore, temDuasZonasProdutosCore } from './agrupamento-cards-produtos-core.js'
