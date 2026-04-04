// @vitest-environment node
// Testes unitários do DashboardQueryEngine
// Cobre: permissões, cache, agregação, parcialidade, fetch e chartType

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock do módulo catalog ANTES dos imports que dependem dele
// ---------------------------------------------------------------------------
vi.mock(
  '../../../servicos-global/tenant/dashboard/server/lib/catalog.js',
  async (importOriginal) => {
    const original = await importOriginal<
      typeof import('../../../servicos-global/tenant/dashboard/server/lib/catalog.js')
    >()
    return {
      ...original,
      resolveCatalogField: vi.fn((key: string) => {
        if (key === 'bid-cambio.saving_total') {
          return {
            key: 'bid-cambio.saving_total',
            label: 'Saving Total (R$)',
            productId: 'bid-cambio',
            productPort: 8025,
            type: 'currency',
            aggregations: ['sum', 'avg'],
            permission: 'bid-cambio:read',
            chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
          }
        }
        if (key === 'bid-frete.saving_total') {
          return {
            key: 'bid-frete.saving_total',
            label: 'Saving Total Frete (R$)',
            productId: 'bid-frete',
            productPort: 8023,
            type: 'currency',
            aggregations: ['sum', 'avg'],
            permission: 'bid-frete:read',
            chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
          }
        }
        return undefined
      }),
    }
  }
)

import {
  DashboardQueryEngine,
  queryEngine,
} from '../../../servicos-global/tenant/dashboard/server/lib/query-engine.js'
import type { WidgetQuerySpec } from '../../../servicos-global/tenant/dashboard/server/lib/catalog.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSpec(overrides: Partial<WidgetQuerySpec> = {}): WidgetQuerySpec {
  return {
    fields: ['bid-cambio.saving_total'],
    operation: 'sum',
    filters: { period: '30d' },
    ...overrides,
  }
}

function makeFetchOk(data: Record<string, unknown> = { saving_total: 150000 }) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

function makeFetchFail() {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: () => Promise.resolve({}),
  })
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.restoreAllMocks()
  // Limpa cache entre testes usando um tenantId único por teste ou clearCache()
})

// ---------------------------------------------------------------------------
// Suite 1 — Verificação de permissões
// ---------------------------------------------------------------------------

describe('DashboardQueryEngine — permissões', () => {
  it('deve lançar AppError 403 quando o usuário não tem permissão para o campo', async () => {
    vi.stubGlobal('fetch', makeFetchOk())

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({ fields: ['bid-cambio.saving_total'] })

    // usuário sem a permissão bid-cambio:read
    await expect(
      engine.execute('tenant-perm-test', [], spec)
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN_FIELD',
    })
  })

  it('deve executar com sucesso quando o usuário tem a permissão correta', async () => {
    vi.stubGlobal('fetch', makeFetchOk())

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({ fields: ['bid-cambio.saving_total'] })

    const result = await engine.execute(
      'tenant-perm-ok',
      ['bid-cambio:read'],
      spec
    )

    expect(result).toBeDefined()
    expect(result.partial).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — Cache
// ---------------------------------------------------------------------------

describe('DashboardQueryEngine — cache', () => {
  it('deve retornar cached:true na segunda chamada com mesma spec', async () => {
    vi.stubGlobal('fetch', makeFetchOk())

    const engine = new DashboardQueryEngine()
    const tenantId = 'tenant-cache-hit'
    const spec = makeSpec({ fields: ['bid-cambio.saving_total'] })

    // Primeira chamada — sem cache
    const first = await engine.execute(tenantId, ['bid-cambio:read'], spec)
    expect(first.cached).toBe(false)

    // Segunda chamada — deve vir do cache
    const second = await engine.execute(tenantId, ['bid-cambio:read'], spec)
    expect(second.cached).toBe(true)
  })

  it('clearCache deve remover entradas do tenant', async () => {
    vi.stubGlobal('fetch', makeFetchOk())

    const engine = new DashboardQueryEngine()
    const tenantId = 'tenant-cache-clear'
    const spec = makeSpec({ fields: ['bid-cambio.saving_total'] })

    // Popula cache
    await engine.execute(tenantId, ['bid-cambio:read'], spec)

    // Limpa cache
    engine.clearCache(tenantId)

    // Próxima chamada deve buscar de novo (cached:false)
    const mockFetch = makeFetchOk()
    vi.stubGlobal('fetch', mockFetch)

    const result = await engine.execute(tenantId, ['bid-cambio:read'], spec)
    expect(result.cached).toBe(false)
    expect(mockFetch).toHaveBeenCalledOnce()
  })

  it('clearCache não deve afetar cache de outros tenants', async () => {
    const mockFetch = makeFetchOk()
    vi.stubGlobal('fetch', mockFetch)

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({ fields: ['bid-cambio.saving_total'] })

    // Popula cache para dois tenants
    await engine.execute('tenant-a', ['bid-cambio:read'], spec)
    await engine.execute('tenant-b', ['bid-cambio:read'], spec)

    // Limpa apenas tenant-a
    engine.clearCache('tenant-a')

    // tenant-b ainda deve ter cache
    const resultB = await engine.execute('tenant-b', ['bid-cambio:read'], spec)
    expect(resultB.cached).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Suite 3 — Agregação de múltiplos produtos
// ---------------------------------------------------------------------------

describe('DashboardQueryEngine — agregação', () => {
  it('deve agregar dados de múltiplos produtos', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ saving_total: 150000 }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({
      fields: ['bid-cambio.saving_total', 'bid-frete.saving_total'],
    })

    const result = await engine.execute(
      'tenant-multi',
      ['bid-cambio:read', 'bid-frete:read'],
      spec
    )

    expect(result).toBeDefined()
    expect(result.data).toHaveProperty('bid-cambio.saving_total')
    expect(result.data).toHaveProperty('bid-frete.saving_total')
  })

  it('deve definir partial:true quando um produto retorna ok:false', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ saving_total: 100 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      })
    vi.stubGlobal('fetch', mockFetch)

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({
      fields: ['bid-cambio.saving_total', 'bid-frete.saving_total'],
    })

    const result = await engine.execute(
      'tenant-partial',
      ['bid-cambio:read', 'bid-frete:read'],
      spec
    )

    expect(result.partial).toBe(true)
  })

  it('deve tratar erros de rede graciosamente (partial:true)', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
    vi.stubGlobal('fetch', mockFetch)

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({ fields: ['bid-cambio.saving_total'] })

    // Não deve lançar exceção — deve retornar com partial:true
    const result = await engine.execute(
      'tenant-network-err',
      ['bid-cambio:read'],
      spec
    )

    expect(result.partial).toBe(true)
    expect(result.data).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// Suite 4 — Chamada fetch com URL e headers corretos
// ---------------------------------------------------------------------------

describe('DashboardQueryEngine — fetch', () => {
  it('deve chamar fetch com URL e headers corretos para bid-cambio', async () => {
    const mockFetch = makeFetchOk()
    vi.stubGlobal('fetch', mockFetch)

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({ fields: ['bid-cambio.saving_total'] })

    await engine.execute('tenant-fetch-check', ['bid-cambio:read'], spec)

    expect(mockFetch).toHaveBeenCalledOnce()

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('localhost:8025')
    expect(url).toContain('/bid-cambio/dashboard/widgets')
    expect(options.method).toBe('POST')
    expect((options.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json'
    )
    expect((options.headers as Record<string, string>)['x-tenant-id']).toBe(
      'tenant-fetch-check'
    )
  })

  it('deve incluir header x-internal-key na chamada', async () => {
    const mockFetch = makeFetchOk()
    vi.stubGlobal('fetch', mockFetch)

    // Seta variável de ambiente
    const originalKey = process.env.INTERNAL_SERVICE_KEY
    process.env.INTERNAL_SERVICE_KEY = 'test-internal-key-123'

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({ fields: ['bid-cambio.saving_total'] })

    await engine.execute('tenant-auth-check', ['bid-cambio:read'], spec)

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((options.headers as Record<string, string>)['x-internal-key']).toBe(
      'test-internal-key-123'
    )

    // Restaura
    if (originalKey === undefined) {
      delete process.env.INTERNAL_SERVICE_KEY
    } else {
      process.env.INTERNAL_SERVICE_KEY = originalKey
    }
  })
})

// ---------------------------------------------------------------------------
// Suite 5 — chartType
// ---------------------------------------------------------------------------

describe('DashboardQueryEngine — chartType', () => {
  it('deve usar o chartType fornecido no spec quando especificado', async () => {
    vi.stubGlobal('fetch', makeFetchOk())

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({
      fields: ['bid-cambio.saving_total'],
      chartType: 'BAR',
    })

    const result = await engine.execute(
      'tenant-chart-explicit',
      ['bid-cambio:read'],
      spec
    )

    expect(result.chartType).toBe('BAR')
  })

  it('deve sugerir chartType automaticamente quando spec.chartType não é fornecido', async () => {
    vi.stubGlobal('fetch', makeFetchOk())

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({
      fields: ['bid-cambio.saving_total'],
      // sem chartType
    })

    const result = await engine.execute(
      'tenant-chart-suggested',
      ['bid-cambio:read'],
      spec
    )

    expect(result.chartType).toBeDefined()
    const validTypes = new Set([
      'KPI_CARD', 'LINE', 'BAR', 'BAR_HORIZONTAL', 'DONUT',
      'HISTOGRAM', 'FUNNEL', 'GAUGE', 'MAP', 'TABLE', 'AREA',
    ])
    expect(validTypes.has(result.chartType)).toBe(true)
  })

  it('deve incluir computed_at como string ISO no resultado', async () => {
    vi.stubGlobal('fetch', makeFetchOk())

    const engine = new DashboardQueryEngine()
    const spec = makeSpec({ fields: ['bid-cambio.saving_total'] })

    const result = await engine.execute(
      'tenant-computed-at',
      ['bid-cambio:read'],
      spec
    )

    expect(typeof result.computed_at).toBe('string')
    expect(() => new Date(result.computed_at)).not.toThrow()
    expect(new Date(result.computed_at).toString()).not.toBe('Invalid Date')
  })
})

// ---------------------------------------------------------------------------
// Suite 6 — Singleton queryEngine
// ---------------------------------------------------------------------------

describe('queryEngine singleton', () => {
  it('deve ser uma instância de DashboardQueryEngine', () => {
    expect(queryEngine).toBeInstanceOf(DashboardQueryEngine)
  })
})
