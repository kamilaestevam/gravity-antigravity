import {
  DATA_CATALOG,
  resolveCatalogField,
  type ChartType,
  type QueryFilters,
  type WidgetQuerySpec,
  type WidgetData,
  type WidgetDataValue,
  type WidgetResult,
  type CatalogField,
} from './catalog.js'
import { suggestChartTypes } from './chart-advisor.js'
import { AppError } from './errors.js'

// ---------------------------------------------------------------------------
// Mapeamento de produto → porta (alinhado com contracts.json)
// ---------------------------------------------------------------------------

const PRODUCT_PORTS: Record<string, number> = {
  'simula-custo': 8020,
  'bid-frete': 8023,
  'bid-cambio': 8025,
  pedido: 8026,
  processo: 8026,
  lpco: 8027,
  'nf-importacao': 8028,
  'financeiro-comex': 8029,
}

// Exceções de path por produto (conforme spec)
const PRODUCT_PATH_OVERRIDES: Record<string, string> = {
  'financeiro-comex': '/api/v1/financeiro/dashboard/widgets',
  pedido: '/api/v1/pedidos/dashboard/widgets',
  processo: '/api/v1/processos/dashboard/widgets',
  lpco: '/api/v1/lpcos/dashboard/widgets',
}

function getProductWidgetUrl(productId: string): string {
  const port = PRODUCT_PORTS[productId]
  if (!port) {
    throw new AppError(`Produto desconhecido: ${productId}`, 400, 'UNKNOWN_PRODUCT')
  }
  const path =
    PRODUCT_PATH_OVERRIDES[productId] ??
    `/api/v1/${productId}/dashboard/widgets`
  return `http://localhost:${port}${path}`
}

// ---------------------------------------------------------------------------
// Cache in-memory com TTL de 5 minutos
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 5 * 60 * 1000

const cache = new Map<string, { data: WidgetResult; expiry: number }>()

function cacheKey(tenantId: string, spec: WidgetQuerySpec): string {
  return `dashboard:widget:${tenantId}:${JSON.stringify(spec)}`
}

function getFromCache(key: string): WidgetResult | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setInCache(key: string, data: WidgetResult): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS })
}

// ---------------------------------------------------------------------------
// Helpers de agrupamento e prefixo
// ---------------------------------------------------------------------------

/**
 * Extrai o productId e o nome local de um campo no formato "productId.metricName".
 * Campos sem prefixo são tratados como globais (sem produto específico).
 */
function parseFieldName(field: string): { productId: string | null; localName: string } {
  const dotIndex = field.indexOf('.')
  if (dotIndex === -1) return { productId: null, localName: field }
  return {
    productId: field.slice(0, dotIndex),
    localName: field.slice(dotIndex + 1),
  }
}

/** Agrupa campos por productId. Retorna Map<productId, localNames[]> */
function groupFieldsByProduct(fields: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  for (const field of fields) {
    const { productId, localName } = parseFieldName(field)
    const key = productId ?? '__global__'
    const existing = groups.get(key) ?? []
    existing.push(localName)
    groups.set(key, existing)
  }
  return groups
}

// ---------------------------------------------------------------------------
// Chamada a produto via REST com timeout de 5s
// ---------------------------------------------------------------------------

interface ProductWidgetResponse {
  [metricName: string]: WidgetDataValue
}

async function fetchProductWidgets(
  productId: string,
  metrics: string[],
  tenantId: string,
  filters: QueryFilters
): Promise<{ data: ProductWidgetResponse; ok: boolean }> {
  const url = getProductWidgetUrl(productId)
  const internalKey = process.env.INTERNAL_SERVICE_KEY

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': internalKey ?? '',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({ metrics, filters }),
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(
        `[DASHBOARD_QUERY] Produto ${productId} retornou HTTP ${response.status}`
      )
      return { data: {}, ok: false }
    }

    const data = (await response.json()) as ProductWidgetResponse
    return { data, ok: true }
  } catch (err) {
    clearTimeout(timeoutId)
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[DASHBOARD_QUERY] Falha ao chamar produto ${productId}: ${message}`)
    return { data: {}, ok: false }
  }
}

/** Reprefixa as chaves da resposta do produto com "productId." */
function prefixProductData(
  productId: string,
  raw: ProductWidgetResponse
): WidgetData {
  const result: WidgetData = {}
  for (const [key, value] of Object.entries(raw)) {
    result[`${productId}.${key}`] = value
  }
  return result
}

// ---------------------------------------------------------------------------
// Verificação de permissões
// ---------------------------------------------------------------------------

function assertFieldPermissions(
  fields: string[],
  userPermissions: string[],
  tenantId: string
): void {
  const permSet = new Set(userPermissions)

  for (const field of fields) {
    const catalogField = resolveCatalogField(field)
    if (!catalogField) continue // campo não catalogado → ignora (produto pode lidar)

    if (!permSet.has(catalogField.permission)) {
      console.error(
        `[DASHBOARD_QUERY] tenant=${tenantId} sem permissão ${catalogField.permission} para campo ${field}`
      )
      throw new AppError(
        `Sem permissão para acessar o campo: ${field}`,
        403,
        'FORBIDDEN_FIELD'
      )
    }
  }
}

// ---------------------------------------------------------------------------
// DashboardQueryEngine
// ---------------------------------------------------------------------------

export class DashboardQueryEngine {
  /**
   * Executa uma query de widget:
   * 1. Verifica permissões dos campos
   * 2. Retorna do cache se disponível
   * 3. Agrupa campos por produto e chama cada produto via REST
   * 4. Agrega resultados com Promise.allSettled (resiliência)
   * 5. Armazena resultado em cache por 5 min
   */
  async execute(
    tenantId: string,
    userPermissions: string[],
    spec: WidgetQuerySpec
  ): Promise<WidgetResult> {
    // 1. Permissões
    assertFieldPermissions(spec.fields, userPermissions, tenantId)

    // 2. Cache
    const key = cacheKey(tenantId, spec)
    const cached = getFromCache(key)
    if (cached) {
      return { ...cached, cached: true }
    }

    // 3. Agrupar por produto
    const groups = groupFieldsByProduct(spec.fields)
    const productIds = [...groups.keys()].filter((k) => k !== '__global__')

    // 4. Chamar produtos em paralelo, com tolerância a falhas
    const productCalls = productIds.map((productId) => {
      const metrics = groups.get(productId) ?? []
      return fetchProductWidgets(productId, metrics, tenantId, spec.filters).then(
        (result) => ({ productId, ...result })
      )
    })

    const settled = await Promise.allSettled(productCalls)

    let partial = false
    const aggregated: WidgetData = {}

    for (const outcome of settled) {
      if (outcome.status === 'rejected') {
        partial = true
        continue
      }
      const { productId, data, ok } = outcome.value
      if (!ok) {
        partial = true
        continue
      }
      const prefixed = prefixProductData(productId, data)
      Object.assign(aggregated, prefixed)
    }

    // 5. chartType: usa o que veio no spec ou sugere baseado nos campos catalogados e operação
    const catalogFields = spec.fields
      .map((f) => resolveCatalogField(f))
      .filter((f): f is CatalogField => f !== undefined)

    const suggestedTypes = suggestChartTypes(
      catalogFields.length > 0 ? catalogFields : DATA_CATALOG.slice(0, 1),
      spec.operation
    )
    const resolvedChartType: ChartType = spec.chartType ?? suggestedTypes[0] ?? 'KPI_CARD'

    const result: WidgetResult = {
      data: aggregated,
      chartType: resolvedChartType,
      partial,
      cached: false,
      computed_at: new Date().toISOString(),
    }

    setInCache(key, result)

    return result
  }

  /** Remove todas as entradas de cache de um tenant específico */
  clearCache(tenantId: string): void {
    const prefix = `dashboard:widget:${tenantId}:`
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key)
      }
    }
  }
}

export const queryEngine = new DashboardQueryEngine()
