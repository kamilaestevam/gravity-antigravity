// services/catalogAdapter.ts
// Adapter que converte entre o formato da API (ProductApi) e o formato
// frontend (ProdutoCatalogo) usado pelos componentes existentes.

import { adminProductsApi, type ProductApi } from './apiClient'
import type { ProdutoCatalogo, NegociacaoEspecial, StatusGlobal, FaixaPreco } from '../types/entidades'

// ─── Mapas de conversão ─────────────────────────────────────────────────────

const STATUS_API_TO_UI: Record<string, StatusGlobal> = {
  ATIVO: 'Ativo',
  SUSPENSO: 'Suspenso',
  EM_BREVE: 'Em Breve',
  LEGADO: 'Legado',
  INATIVO: 'Inativo',
}

const STATUS_UI_TO_API: Record<string, string> = {
  Ativo: 'ATIVO',
  Suspenso: 'SUSPENSO',
  'Em Breve': 'EM_BREVE',
  Legado: 'LEGADO',
  Inativo: 'INATIVO',
}

const BILLING_API_TO_UI: Record<string, string> = {
  MENSAL: 'Mensalidade',
  POR_PROCESSO: 'Por Processo',
  POR_DOCUMENTO: 'Por Documento',
  POR_ESTIMATIVA: 'Por Estimativa',
  POR_DI_DUIMP: 'Por DI/DUIMP',
  POR_DUE: 'Por DUE',
  POR_PRODUTO: 'Por Produto',
  POR_FLUXO: 'Por Fluxo',
  POR_LPCO: 'Por LPCO',
}

const BILLING_UI_TO_API: Record<string, string> = Object.fromEntries(
  Object.entries(BILLING_API_TO_UI).map(([k, v]) => [v, k]),
)

/** Converte Decimal string "10.99" → display "10,99" */
function decimalToDisplay(val: string | null | undefined): string {
  if (!val) return '0,00'
  const num = parseFloat(val)
  if (isNaN(num)) return '0,00'
  return num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Converte display "1.234,56" → number 1234.56 */
function displayToNumber(val: string): number {
  if (!val) return 0
  return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0
}

// ─── Conversões ─────────────────────────────────────────────────────────────

function apiToUi(p: ProductApi): ProdutoCatalogo {
  return {
    id: p.id,
    nome: p.name,
    descricao: p.description,
    slug: p.slug,
    status: STATUS_API_TO_UI[p.status] ?? 'Inativo',
    dataLancamento: p.launch_date?.split('T')[0],
    temSetup: p.has_setup,
    precoSetup: p.has_setup && p.setup_price
      ? { valor: decimalToDisplay(p.setup_price), moeda: p.setup_currency }
      : undefined,
    tipoCobranca: BILLING_API_TO_UI[p.billing_type] ?? p.billing_type,
    precoUnitario: { valor: decimalToDisplay(p.unit_price), moeda: p.unit_currency },
    precoMinimo: { valor: decimalToDisplay(p.minimum_price), moeda: p.minimum_currency },
    precoTotal: p.total_price
      ? { valor: decimalToDisplay(p.total_price), moeda: p.total_currency }
      : undefined,
    limiteUsuarios: p.user_limit_type === 'LIMITADO' ? 'limitada' : 'ilimitada',
    qtdUsuariosBase: p.base_users_qty ?? undefined,
    precoUsuarioAdicional: p.extra_user_price
      ? { valor: decimalToDisplay(p.extra_user_price), moeda: p.extra_user_currency }
      : undefined,
    horasHelpDesk: p.helpdesk_hours,
    precoHoraAdicional: p.extra_hour_price
      ? { valor: decimalToDisplay(p.extra_hour_price), moeda: p.extra_hour_currency }
      : undefined,
    moduloBackend: p.backend_module ?? undefined,
    publicoAlvo: p.target_audience ?? undefined,
    faixasPreco: p.price_tiers?.length
      ? p.price_tiers.map(t => ({
          id: t.id,
          de: t.range_from,
          ate: t.range_to ?? undefined,
          valor: decimalToDisplay(t.price),
          moeda: t.currency,
        }))
      : undefined,
    gabiQuotaMensal: p.gabi_quota_mensal ?? 0,
  }
}

export interface ProdutoInput {
  nome: string
  descricao: string
  slug: string
  status: string
  dataLancamento?: string
  temSetup: boolean
  precoSetup?: { valor: string; moeda: string }
  tipoCobranca: string
  precoUnitario: { valor: string; moeda: string }
  precoMinimo: { valor: string; moeda: string }
  precoTotal?: { valor: string; moeda: string }
  limiteUsuarios: 'ilimitada' | 'limitada'
  qtdUsuariosBase?: number
  precoUsuarioAdicional?: { valor: string; moeda: string }
  horasHelpDesk: number
  precoHoraAdicional?: { valor: string; moeda: string }
  moduloBackend?: string
  publicoAlvo?: string
  faixasPreco?: FaixaPreco[]
  gabiQuotaMensal?: number
}

function uiToApi(p: ProdutoInput): Record<string, unknown> {
  return {
    name: p.nome,
    slug: p.slug,
    description: p.descricao,
    status: STATUS_UI_TO_API[p.status] ?? 'ATIVO',
    launch_date: p.dataLancamento ? new Date(p.dataLancamento).toISOString() : undefined,
    has_setup: p.temSetup,
    setup_price: p.temSetup ? displayToNumber(p.precoSetup?.valor ?? '0') : undefined,
    setup_currency: p.precoSetup?.moeda ?? 'BRL',
    billing_type: BILLING_UI_TO_API[p.tipoCobranca] ?? 'MENSAL',
    unit_price: displayToNumber(p.precoUnitario.valor),
    unit_currency: p.precoUnitario.moeda,
    minimum_price: displayToNumber(p.precoMinimo.valor),
    minimum_currency: p.precoMinimo.moeda,
    total_price: p.precoTotal ? displayToNumber(p.precoTotal.valor) : undefined,
    total_currency: p.precoTotal?.moeda ?? 'BRL',
    user_limit_type: p.limiteUsuarios === 'limitada' ? 'LIMITADO' : 'ILIMITADO',
    base_users_qty: p.qtdUsuariosBase ?? undefined,
    extra_user_price: p.precoUsuarioAdicional ? displayToNumber(p.precoUsuarioAdicional.valor) : undefined,
    extra_user_currency: p.precoUsuarioAdicional?.moeda ?? 'BRL',
    helpdesk_hours: p.horasHelpDesk,
    extra_hour_price: p.precoHoraAdicional ? displayToNumber(p.precoHoraAdicional.valor) : undefined,
    extra_hour_currency: p.precoHoraAdicional?.moeda ?? 'BRL',
    backend_module: p.moduloBackend ?? undefined,
    target_audience: p.publicoAlvo ?? undefined,
    gabi_quota_mensal: p.gabiQuotaMensal ?? 0,
    price_tiers: p.faixasPreco?.map(f => ({
      range_from: f.de,
      range_to: f.ate ?? undefined,
      price: displayToNumber(f.valor),
      currency: f.moeda,
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
      total: pagination.total,
      page: pagination.page,
      pages: pagination.pages,
    }
  },

  async getProdutos(): Promise<ProdutoCatalogo[]> {
    const result = await this.listProdutos({ limit: 100 })
    return result.produtos
  },

  /**
   * Cria (isNew=true) ou atualiza (isNew=false) um produto.
   * A detecção "novo vs edição" agora é explícita — não há heurística frágil.
   */
  async saveProduto(
    produto: ProdutoInput & { id?: string },
    opts: { isNew: boolean },
  ): Promise<void> {
    const data = uiToApi(produto)
    if (opts.isNew) {
      await adminProductsApi.create(data)
    } else {
      if (!produto.id) {
        throw new Error('ID do produto é obrigatório para atualização')
      }
      await adminProductsApi.update(produto.id, data)
    }
  },

  async toggleProdutoStatus(id: string): Promise<void> {
    await adminProductsApi.toggleStatus(id)
  },

  async deleteProduto(
    id: string,
    opts?: { force?: boolean; ackNegotiations?: boolean },
  ): Promise<void> {
    await adminProductsApi.delete(id, opts)
  },

  async getNegociacoes(): Promise<NegociacaoEspecial[]> {
    const { products } = await adminProductsApi.list()
    const negs: NegociacaoEspecial[] = []
    for (const p of products) {
      if (p.negotiations) {
        for (const n of p.negotiations) {
          negs.push({
            id: n.id,
            produtoId: n.product_id,
            tenantId: n.tenant_id,
            tenantNome: n.tenant_name,
            acordo: n.agreement,
            inicio: n.starts_at?.split('T')[0],
            fim: n.ends_at?.split('T')[0],
            ilimitada: n.is_unlimited,
          })
        }
      }
    }
    return negs
  },

  async getSlugsDisponiveis(): Promise<string[]> {
    const { available } = await adminProductsApi.getAvailableSlugs()
    return available
  },
}
