// @vitest-environment node
// Testes do cache do Dashboard — verifica que:
//   1. Cache evicta entradas expiradas no get
//   2. Cache evicta entradas mais antigas quando max size atingido
//   3. Cache retorna null para entradas expiradas

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock do Prisma BEFORE imports (cache importa MetricaSnapshot type)
// ---------------------------------------------------------------------------
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(),
}))

import { getCachedKpis, setCachedKpis } from '../../../../servicos-global/tenant/dashboard/server/lib/cache'

beforeEach(() => {
  vi.clearAllMocks()
  // Restaurar Date.now real entre testes
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Suite 1 — Cache retorna null para entradas expiradas
// ---------------------------------------------------------------------------

describe('Cache — entradas expiradas', () => {
  it('retorna null quando a entrada do cache esta expirada', () => {
    const now = Date.now()

    // Seta o cache com timestamp "agora"
    vi.spyOn(Date, 'now').mockReturnValue(now)
    setCachedKpis('tenant-a', undefined, [{ metric: 'revenue', value: 100 }])

    // Avanca 6 minutos (TTL = 5 min)
    vi.spyOn(Date, 'now').mockReturnValue(now + 6 * 60 * 1000)

    const result = getCachedKpis('tenant-a')
    expect(result).toBeNull()
  })

  it('retorna dados quando a entrada nao expirou', () => {
    const now = Date.now()

    vi.spyOn(Date, 'now').mockReturnValue(now)
    setCachedKpis('tenant-b', undefined, [{ metric: 'users', value: 50 }])

    // Avanca 2 minutos (dentro do TTL de 5 min)
    vi.spyOn(Date, 'now').mockReturnValue(now + 2 * 60 * 1000)

    const result = getCachedKpis('tenant-b')
    expect(result).toEqual([{ metric: 'users', value: 50 }])
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — Cache evicta entradas expiradas no get
// ---------------------------------------------------------------------------

describe('Cache — eviction de expiradas no get', () => {
  it('evicta entradas expiradas de outros tenants ao buscar', () => {
    const now = Date.now()

    // Insere entrada para tenant-old
    vi.spyOn(Date, 'now').mockReturnValue(now)
    setCachedKpis('tenant-old', undefined, [{ metric: 'old', value: 1 }])

    // Avanca 6 minutos — tenant-old agora expirou
    vi.spyOn(Date, 'now').mockReturnValue(now + 6 * 60 * 1000)

    // Insere uma nova para tenant-new (disparando evictExpired internamente)
    setCachedKpis('tenant-new', undefined, [{ metric: 'new', value: 2 }])

    // tenant-old deve retornar null (foi evictada)
    const resultOld = getCachedKpis('tenant-old')
    expect(resultOld).toBeNull()

    // tenant-new deve retornar dados
    const resultNew = getCachedKpis('tenant-new')
    expect(resultNew).toEqual([{ metric: 'new', value: 2 }])
  })
})

// ---------------------------------------------------------------------------
// Suite 3 — Cache evicta entradas mais antigas quando max size atingido
// ---------------------------------------------------------------------------

describe('Cache — eviction por tamanho maximo', () => {
  it('evicta entradas mais antigas quando excede CACHE_MAX_SIZE', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    // CACHE_MAX_SIZE = 1000
    // Insere 1001 entradas (cada tenant com productId unico para gerar chave diferente)
    for (let i = 0; i < 1001; i++) {
      setCachedKpis(`tenant-${i}`, `product-${i}`, [{ v: i }])
    }

    // As primeiras entradas devem ter sido evictadas (pelo menos a entrada 0)
    const resultFirst = getCachedKpis('tenant-0', 'product-0')
    expect(resultFirst).toBeNull()

    // A ultima entrada deve existir
    const resultLast = getCachedKpis('tenant-1000', 'product-1000')
    expect(resultLast).toEqual([{ v: 1000 }])
  })
})
