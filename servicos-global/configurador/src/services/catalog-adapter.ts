// services/catalogAdapter.ts
//
// Adapter entre o formato da API (ProductApi com nomes legados em inglês) e o
// formato frontend (ProdutoCatalogo com nomes DDD Prisma). Existe enquanto o
// backend não retornar Paridade Absoluta — quando isso acontecer, este arquivo
// pode ser deletado e os componentes consomem ProductApi (=Prisma) direto.

import { adminProductsApi, type ProductApi, type FaixaPrecoApi } from './api-client'
import type {
  ProdutoCatalogo,
  NegociacaoEspecial,
  StatusGlobal,
  FaixaPreco,
  TipoCobrancaGravity,
  ProdutoGravityLimiteUsuario,
} from '../types/entidades'

// ─── Conversão API → UI ─────────────────────────────────────────────────────

function apiToFaixaPreco(t: FaixaPrecoApi): FaixaPreco {
  return {
    id_faixa_preco_produto_gravity:        t.id,
    id_produto_gravity_faixa_preco:        t.product_id,
    faixa_de_faixa_preco_produto_gravity:  t.range_from,
    faixa_ate_faixa_preco_produto_gravity: t.range_to,
    preco_faixa_preco_produto_gravity:     t.price,
    moeda_faixa_preco_produto_gravity:     t.currency,
  }
}

function apiToUi(p: ProductApi): ProdutoCatalogo {
  return {
    id_produto_gravity:               p.id,
    nome_produto_gravity:             p.name,
    slug_produto_gravity:             p.slug,
    descricao_produto_gravity:        p.description,
    status_produto_gravity:           p.status as StatusGlobal,
    data_lancamento_produto_gravity:  p.launch_date,

    possui_setup_produto_gravity: p.has_setup,
    preco_setup_produto_gravity:  p.setup_price,
    moeda_setup_produto_gravity:  p.setup_currency,

    tipo_cobranca_produto_gravity:  p.billing_type as TipoCobrancaGravity,
    preco_unitario_produto_gravity: p.unit_price,
    moeda_unitario_produto_gravity: p.unit_currency,
    preco_minimo_produto_gravity:   p.minimum_price,
    moeda_minimo_produto_gravity:   p.minimum_currency,
    preco_total_produto_gravity:    p.total_price,
    moeda_total_produto_gravity:    p.total_currency,

    tipo_limite_usuario_produto_gravity: p.user_limit_type as ProdutoGravityLimiteUsuario,
    qtd_usuarios_base_produto_gravity:   p.base_users_qty,
    preco_usuario_extra_produto_gravity: p.extra_user_price,
    moeda_usuario_extra_produto_gravity: p.extra_user_currency,

    horas_helpdesk_produto_gravity:   p.helpdesk_hours,
    preco_hora_extra_produto_gravity: p.extra_hour_price,
    moeda_hora_extra_produto_gravity: p.extra_hour_currency,

    quota_gabi_mensal_produto_gravity: p.gabi_quota_mensal ?? 0,

    modulo_backend_produto_gravity: p.backend_module,
    publico_alvo_produto_gravity:   p.target_audience,

    faixas_preco_produto_gravity: p.price_tiers?.map(apiToFaixaPreco),
  }
}

// ─── Input para criação/edição (UI → API) ──────────────────────────────────
// Espera os mesmos nomes Prisma do ProdutoCatalogo (subset editável).
export type ProdutoInput = Omit<ProdutoCatalogo, 'id_produto_gravity'> & { id_produto_gravity?: string }

/** Converte string Decimal "1.234,56" ou "1234.56" → number 1234.56. */
function decimalToNumber(val: string | null | undefined): number {
  if (!val) return 0
  const normalized = val.includes(',')
    ? val.replace(/\./g, '').replace(',', '.')
    : val
  const n = parseFloat(normalized)
  return isNaN(n) ? 0 : n
}

function uiToApi(p: ProdutoInput): Record<string, unknown> {
  return {
    name:            p.nome_produto_gravity,
    slug:            p.slug_produto_gravity,
    description:     p.descricao_produto_gravity,
    status:          p.status_produto_gravity,
    launch_date:     p.data_lancamento_produto_gravity
                       ? new Date(p.data_lancamento_produto_gravity).toISOString()
                       : undefined,

    has_setup:       p.possui_setup_produto_gravity,
    setup_price:     p.possui_setup_produto_gravity ? decimalToNumber(p.preco_setup_produto_gravity) : undefined,
    setup_currency:  p.moeda_setup_produto_gravity,

    billing_type:    p.tipo_cobranca_produto_gravity,
    unit_price:      decimalToNumber(p.preco_unitario_produto_gravity),
    unit_currency:   p.moeda_unitario_produto_gravity,
    minimum_price:   decimalToNumber(p.preco_minimo_produto_gravity),
    minimum_currency: p.moeda_minimo_produto_gravity,
    total_price:     p.preco_total_produto_gravity ? decimalToNumber(p.preco_total_produto_gravity) : undefined,
    total_currency:  p.moeda_total_produto_gravity,

    user_limit_type:    p.tipo_limite_usuario_produto_gravity,
    base_users_qty:     p.qtd_usuarios_base_produto_gravity ?? undefined,
    extra_user_price:   p.preco_usuario_extra_produto_gravity ? decimalToNumber(p.preco_usuario_extra_produto_gravity) : undefined,
    extra_user_currency: p.moeda_usuario_extra_produto_gravity,

    helpdesk_hours:     p.horas_helpdesk_produto_gravity,
    extra_hour_price:   p.preco_hora_extra_produto_gravity ? decimalToNumber(p.preco_hora_extra_produto_gravity) : undefined,
    extra_hour_currency: p.moeda_hora_extra_produto_gravity,

    backend_module:    p.modulo_backend_produto_gravity ?? undefined,
    target_audience:   p.publico_alvo_produto_gravity ?? undefined,
    gabi_quota_mensal: p.quota_gabi_mensal_produto_gravity,

    price_tiers: p.faixas_preco_produto_gravity?.map(f => ({
      range_from: f.faixa_de_faixa_preco_produto_gravity,
      range_to:   f.faixa_ate_faixa_preco_produto_gravity ?? undefined,
      price:      decimalToNumber(f.preco_faixa_preco_produto_gravity),
      currency:   f.moeda_faixa_preco_produto_gravity,
    })),
  }
}

// ─── Service adaptado ───────────────────────────────────────────────────────

export interface ListProdutosParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export interface ListProdutosResult {
  produtos: ProdutoCatalogo[]
  total: number
  page: number
  pages: number
}

export const catalogApiService = {
  async listProdutos(params?: ListProdutosParams): Promise<ListProdutosResult> {
    const { products, pagination } = await adminProductsApi.list(params)
    return {
      produtos: products.map(apiToUi),
      total:    pagination.total,
      page:     pagination.page,
      pages:    pagination.pages,
    }
  },

  async getProdutos(): Promise<ProdutoCatalogo[]> {
    const result = await this.listProdutos({ limit: 100 })
    return result.produtos
  },

  /**
   * Catálogo público — não requer autenticação Gravity admin.
   * Usado pela tela /workspace/assinaturas (Master/Standard) e Store.
   * Endpoint: GET /api/v1/catalogo/produtos
   */
  async getCatalogoPublico(): Promise<ProdutoCatalogo[]> {
    const res = await fetch('/api/v1/catalogo/produtos')
    if (!res.ok) {
      throw new Error(`Falha ao carregar catálogo público (HTTP ${res.status})`)
    }
    const body = (await res.json()) as { products: ProductApi[] }
    return (body.products ?? []).map(apiToUi)
  },

  /**
   * Cria (isNew=true) ou atualiza (isNew=false) um produto.
   * A detecção "novo vs edição" agora é explícita — não há heurística frágil.
   */
  async saveProduto(
    produto: ProdutoInput,
    opts: { isNew: boolean },
  ): Promise<void> {
    const data = uiToApi(produto)
    if (opts.isNew) {
      await adminProductsApi.create(data)
    } else {
      if (!produto.id_produto_gravity) {
        throw new Error('id_produto_gravity é obrigatório para atualização')
      }
      await adminProductsApi.update(produto.id_produto_gravity, data)
    }
  },

  async toggleProdutoStatus(id_produto_gravity: string): Promise<void> {
    await adminProductsApi.toggleStatus(id_produto_gravity)
  },

  async deleteProduto(
    id_produto_gravity: string,
    opts?: { force?: boolean; ackNegotiations?: boolean },
  ): Promise<void> {
    await adminProductsApi.delete(id_produto_gravity, opts)
  },

  async getNegociacoes(): Promise<NegociacaoEspecial[]> {
    const { products } = await adminProductsApi.list()
    const negs: NegociacaoEspecial[] = []
    for (const p of products) {
      if (p.negotiations) {
        // NegotiationApi já vem com nomes Prisma (ver apiClient.ts) — pass-through direto.
        for (const n of p.negotiations) negs.push(n)
      }
    }
    return negs
  },

  async getSlugsDisponiveis(): Promise<string[]> {
    const { available } = await adminProductsApi.getAvailableSlugs()
    return available
  },
}
