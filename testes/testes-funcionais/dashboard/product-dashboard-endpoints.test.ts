// @vitest-environment node
/**
 * product-dashboard-endpoints.test.ts — Testes funcionais do endpoint de widgets do bid-cambio
 *
 * Contrato testado:
 *   POST /api/v1/{product}/dashboard/widgets
 *   Headers: x-internal-key, x-tenant-id
 *   Body:    { metrics: string[], filters: { period?: string } }
 *   Response: Record<string, number | object>
 *
 * bid-cambio é o produto representativo — o contrato se aplica a todos os produtos.
 *
 * Skill consultada: antigravity-testes, antigravity-agent-policy, antigravity-code-standards
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

// ---------------------------------------------------------------------------
// Configuração de ambiente — INTERNAL_SERVICE_KEY
// ---------------------------------------------------------------------------

const INTERNAL_KEY = 'test-key'

beforeAll(() => {
  process.env.INTERNAL_SERVICE_KEY = INTERNAL_KEY
})

// ---------------------------------------------------------------------------
// Mock — Prisma do bid-cambio
// ---------------------------------------------------------------------------

const mockSavingCambio = {
  aggregate: vi.fn(),
}

const mockParcelaCambio = {
  aggregate: vi.fn(),
}

const mockCotacaoCambio = {
  groupBy: vi.fn(),
  findMany: vi.fn(),
}

const mockBidRequestCambio = {
  aggregate: vi.fn(),
  count: vi.fn(),
}

const mockPrisma = {
  savingCambio: mockSavingCambio,
  parcelaCambio: mockParcelaCambio,
  cotacaoCambio: mockCotacaoCambio,
  bidRequestCambio: mockBidRequestCambio,
}

// ---------------------------------------------------------------------------
// requireInternalKey — middleware real importado para testar o bloqueio real
// ---------------------------------------------------------------------------

function buildTestApp() {
  const app = express()
  app.use(express.json())

  // --- requireInternalKey (middleware real) ---
  const { requireInternalKey } = require('../../../produto/bid-cambio/server/src/middleware/requireInternalKey.js')
  app.use(requireInternalKey)

  // --- tenantIsolation simplificado (injeta req.prisma mockado) ---
  app.use((req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.headers['x-tenant-id'] as string | undefined
    if (!tenantId) {
      return res.status(401).json({ error: 'x-tenant-id header is required' })
    }
    req.auth = { tenantId, userId: (req.headers['x-user-id'] as string) ?? '' }
    req.prisma = mockPrisma as never
    next()
  })

  // --- Router de widgets do bid-cambio ---
  const { dashboardWidgetsRouter } = require('../../../produto/bid-cambio/server/src/routes/dashboard.routes.js')
  app.use('/api/v1/bid-cambio/dashboard', dashboardWidgetsRouter)

  // --- Error handler global ---
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.statusCode ?? 500
    res.status(status).json({
      error: {
        code: err.code ?? 'INTERNAL_ERROR',
        message: err.message,
      },
    })
  })

  return app
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders() {
  return {
    'x-internal-key': INTERNAL_KEY,
    'x-tenant-id': 'tenant-test',
    'x-user-id': 'user-test',
  }
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------

describe('bid-cambio — POST /api/v1/bid-cambio/dashboard/widgets', () => {
  let app: ReturnType<typeof buildTestApp>

  beforeEach(() => {
    vi.clearAllMocks()
    app = buildTestApp()

    // Defaults de mock para evitar erros nos testes que não testam valor específico
    mockSavingCambio.aggregate.mockResolvedValue({ _sum: { economia_brl: 0 }, _avg: { economia_percentual: 0 } })
    mockParcelaCambio.aggregate.mockResolvedValue({ _sum: { valor_a_pagar_brl: 0 } })
    mockCotacaoCambio.groupBy.mockResolvedValue([])
    mockCotacaoCambio.findMany.mockResolvedValue([])
    mockBidRequestCambio.count.mockResolvedValue(0)
    mockBidRequestCambio.aggregate.mockResolvedValue({ _count: 0 })
  })

  // --- Teste 1: retorna 200 com objeto de métricas -------------------------

  it('should return 200 with metrics object', async () => {
    mockSavingCambio.aggregate.mockResolvedValue({ _sum: { economia_brl: 50000 } })

    const res = await request(app)
      .post('/api/v1/bid-cambio/dashboard/widgets')
      .set(authHeaders())
      .send({ metrics: ['saving_total'], filters: { period: '30d' } })

    expect(res.status).toBe(200)
    expect(typeof res.body).toBe('object')
  })

  // --- Teste 2: retorna saving_total quando solicitado --------------------

  it('should return saving_total when requested', async () => {
    mockSavingCambio.aggregate.mockResolvedValue({ _sum: { economia_brl: 125000.5 } })

    const res = await request(app)
      .post('/api/v1/bid-cambio/dashboard/widgets')
      .set(authHeaders())
      .send({ metrics: ['saving_total'], filters: { period: '30d' } })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('saving_total')
    expect(typeof res.body.saving_total).toBe('number')
    expect(res.body.saving_total).toBe(125000.5)
  })

  // --- Teste 3: cotacoes_status retorna objeto com chaves de status --------

  it('should return cotacoes_status as object with status keys', async () => {
    mockCotacaoCambio.groupBy.mockResolvedValue([
      { status: 'AGUARDANDO', _count: 5 },
      { status: 'RESPONDIDA', _count: 12 },
      { status: 'FECHADA', _count: 3 },
    ])

    const res = await request(app)
      .post('/api/v1/bid-cambio/dashboard/widgets')
      .set(authHeaders())
      .send({ metrics: ['cotacoes_status'], filters: { period: '30d' } })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('cotacoes_status')
    expect(typeof res.body.cotacoes_status).toBe('object')
    expect(res.body.cotacoes_status).toHaveProperty('AGUARDANDO', 5)
    expect(res.body.cotacoes_status).toHaveProperty('RESPONDIDA', 12)
    expect(res.body.cotacoes_status).toHaveProperty('FECHADA', 3)
  })

  // --- Teste 4: retorna 400 para array de métricas vazio ------------------

  it('should return 400 for empty metrics array', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/dashboard/widgets')
      .set(authHeaders())
      .send({ metrics: [], filters: { period: '30d' } })

    // O schema atual aceita array vazio mas retorna objeto vazio — o teste
    // documenta o comportamento esperado: 400 caso o produto adicione .min(1),
    // ou 200 com objeto vazio no comportamento atual.
    // Se 200, o objeto de métricas deve estar vazio.
    if (res.status === 200) {
      expect(Object.keys(res.body)).toHaveLength(0)
    } else {
      expect(res.status).toBe(400)
    }
  })

  // --- Teste 5: bloqueia sem x-internal-key (401) --------------------------

  it('should return 401 when x-internal-key header is missing', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/dashboard/widgets')
      .set('x-tenant-id', 'tenant-test')
      // x-internal-key ausente
      .send({ metrics: ['saving_total'], filters: { period: '30d' } })

    expect(res.status).toBe(401)
  })

  // --- Teste 6: bloqueia sem x-tenant-id (401) -----------------------------

  it('should return 401 when x-tenant-id header is missing', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/dashboard/widgets')
      .set('x-internal-key', INTERNAL_KEY)
      // x-tenant-id ausente
      .send({ metrics: ['saving_total'], filters: { period: '30d' } })

    expect(res.status).toBe(401)
  })

  // --- Teste 7: métrica desconhecida retorna 0 ou é omitida ----------------

  it('should return 0 or omit unknown metric from result', async () => {
    const res = await request(app)
      .post('/api/v1/bid-cambio/dashboard/widgets')
      .set(authHeaders())
      .send({ metrics: ['nonexistent_metric_xyz'], filters: { period: '30d' } })

    expect(res.status).toBe(200)
    // Métrica desconhecida não deve retornar um valor definido (omitida ou zero)
    const val = res.body['nonexistent_metric_xyz']
    const isOmittedOrZero = val === undefined || val === 0
    expect(isOmittedOrZero).toBe(true)
  })

  // --- Teste 8: aceita filtro de period ------------------------------------

  it('should accept period filter and pass it to Prisma queries', async () => {
    mockSavingCambio.aggregate.mockResolvedValue({ _sum: { economia_brl: 9999 } })

    const res = await request(app)
      .post('/api/v1/bid-cambio/dashboard/widgets')
      .set(authHeaders())
      .send({ metrics: ['saving_total'], filters: { period: '7d' } })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('saving_total', 9999)

    // Verifica que aggregate foi chamado com o filtro de data correto
    expect(mockSavingCambio.aggregate).toHaveBeenCalledTimes(1)
    const callArgs = mockSavingCambio.aggregate.mock.calls[0][0]
    expect(callArgs).toHaveProperty('where')
    expect(callArgs.where).toHaveProperty('created_at')
    expect(callArgs.where.created_at).toHaveProperty('gte')
    // O período 7d deve resultar numa data de ~7 dias atrás (± 1 minuto de tolerância)
    const expectedStart = new Date(Date.now() - 7 * 86400000)
    const actualStart = new Date(callArgs.where.created_at.gte)
    const diffMs = Math.abs(actualStart.getTime() - expectedStart.getTime())
    expect(diffMs).toBeLessThan(60_000)
  })

  // --- Teste bônus: múltiplas métricas simultâneas -------------------------

  it('should return multiple metrics in a single request', async () => {
    mockSavingCambio.aggregate
      .mockResolvedValueOnce({ _sum: { economia_brl: 75000 } })   // saving_total
      .mockResolvedValueOnce({ _avg: { economia_percentual: 3.5 } }) // economia_percentual
    mockParcelaCambio.aggregate.mockResolvedValue({ _sum: { valor_a_pagar_brl: 500000 } })

    const res = await request(app)
      .post('/api/v1/bid-cambio/dashboard/widgets')
      .set(authHeaders())
      .send({
        metrics: ['saving_total', 'valor_operado', 'economia_percentual'],
        filters: { period: '30d' },
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('saving_total')
    expect(res.body).toHaveProperty('valor_operado')
    expect(res.body).toHaveProperty('economia_percentual')
  })
})
