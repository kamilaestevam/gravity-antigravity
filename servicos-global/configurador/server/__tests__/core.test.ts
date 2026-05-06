// server/__tests__/core.test.ts
// Testes do agregador /api/v1/core/* — KPIs e processos recentes do dashboard.
// Cobre:
//   - Bridge de auth (Clerk JWT in → x-internal-key out)
//   - Isolamento cross-organização (gate Coordenador #4 / Mandamento 03)
//   - Resiliência via Promise.allSettled (upstream caiu não derruba endpoint)
//   - Shape final do contrato (slots null para produtos sem dados reais)
//   - Mapeamento de campos da listagem de Pedido para o contrato do /core

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express, { type Request, type Response, type NextFunction } from 'express'
import supertest from 'supertest'

// ─── Mocks ──────────────────────────────────────────────────────────────────

// Mock requireAuth — injeta req.auth com id_organizacao do auth (banco), não
// do header. Espelha o comportamento real do middleware.
const defaultAuth = {
  id_usuario: 'user-001',
  clerkUserId: 'clerk_001',
  id_organizacao: 'tenant-001',
  tipo_usuario: 'ADMIN',
}

let authOverride: typeof defaultAuth | null = null

vi.mock('../middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req.auth = authOverride ?? defaultAuth
    next()
  },
}))

// Mock fetch global — capturamos os headers enviados ao Pedido.
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

// ─── App setup ──────────────────────────────────────────────────────────────

let app: express.Express
let request: ReturnType<typeof supertest>

beforeAll(async () => {
  const { coreRouter } = await import('../routes/core.js')

  app = express()
  app.use(express.json())
  app.use('/api/v1/core', coreRouter)

  interface HttpError extends Error {
    statusCode?: number
    code?: string
  }
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({
      error: { code: err.code ?? 'INTERNAL', message: err.message },
    })
  })

  request = supertest(app)
})

beforeEach(() => {
  vi.clearAllMocks()
  authOverride = null
})

// ─── GET /api/v1/core/kpis ──────────────────────────────────────────────────

describe('GET /api/v1/core/kpis', () => {
  it('retorna shape completo com pedido populado e slots null', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pedidos_em_andamento: 7 }),
    })

    const res = await request.get('/api/v1/core/kpis')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      pedido: { em_andamento: 7 },
      simula_custo: null,
      nf_importacao: null,
      gabi: null,
    })
  })

  it('passa x-id-organizacao do auth para o Pedido (não do header injetado)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pedidos_em_andamento: 7 }),
    })

    // Tenta injetar id_organizacao malicioso via header — DEVE ser ignorado.
    await request.get('/api/v1/core/kpis').set('x-id-organizacao', 'tenant-malicious')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const headers = (fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers
    expect(headers['x-id-organizacao']).toBe('tenant-001')
    expect(headers['x-id-organizacao']).not.toBe('tenant-malicious')
  })

  it('tenant diferente recebe dados isolados (cross-org)', async () => {
    authOverride = { ...defaultAuth, id_organizacao: 'tenant-999' }
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pedidos_em_andamento: 42 }),
    })

    const res = await request.get('/api/v1/core/kpis')

    expect(res.status).toBe(200)
    const headers = (fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers
    expect(headers['x-id-organizacao']).toBe('tenant-999')
    expect(res.body.pedido).toEqual({ em_andamento: 42 })
  })

  it('propaga x-id-workspace para o Pedido quando presente', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pedidos_em_andamento: 5 }),
    })

    await request.get('/api/v1/core/kpis').set('x-id-workspace', 'workspace-abc')

    const headers = (fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers
    expect(headers['x-id-workspace']).toBe('workspace-abc')
  })

  it('omite x-id-workspace quando não enviado', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pedidos_em_andamento: 5 }),
    })

    await request.get('/api/v1/core/kpis')

    const headers = (fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers
    expect(headers['x-id-workspace']).toBeUndefined()
  })

  it('retorna pedido: null quando upstream falha — não 5xx (resiliência)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('upstream down'))

    const res = await request.get('/api/v1/core/kpis')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      pedido: null,
      simula_custo: null,
      nf_importacao: null,
      gabi: null,
    })
  })

  it('retorna pedido: null quando upstream responde 500', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })

    const res = await request.get('/api/v1/core/kpis')

    expect(res.status).toBe(200)
    expect(res.body.pedido).toBeNull()
  })

  it('retorna pedido: null quando upstream responde shape inesperado', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ outro_campo: 999 }),
    })

    const res = await request.get('/api/v1/core/kpis')

    expect(res.status).toBe(200)
    expect(res.body.pedido).toBeNull()
  })
})

// ─── GET /api/v1/core/processos-recentes ────────────────────────────────────

describe('GET /api/v1/core/processos-recentes', () => {
  it('mapeia campos do Pedido para o shape do contrato /core', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'p1',
            numero_pedido: 'IMP-001',
            status: 'EM_ANDAMENTO',
            incoterm: 'CIF',
            valor_total_pedido: 100000,
            moeda_pedido: 'USD',
            peso_bruto_total_pedido: 1500,
            nome_exportador: 'Acme Imports',
            nome_importador: 'Buyer Ltd',
            updated_at: '2026-05-01T00:00:00Z',
          },
        ],
      }),
    })

    const res = await request.get('/api/v1/core/processos-recentes')

    expect(res.status).toBe(200)
    expect(res.body.processos).toHaveLength(1)
    expect(res.body.processos[0]).toEqual({
      id: 'p1',
      numero: 'IMP-001',
      status: 'EM_ANDAMENTO',
      incoterm: 'CIF',
      valor: 100000,
      moeda: 'USD',
      peso_bruto: 1500,
      nome_exportador: 'Acme Imports',
      nome_importador: 'Buyer Ltd',
      atualizado_em: '2026-05-01T00:00:00Z',
    })
  })

  it('aceita valor/peso como string e converte para number', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 'p2',
            numero_pedido: 'IMP-002',
            valor_total_pedido: '2500.50',
            peso_bruto_total_pedido: '750.25',
          },
        ],
      }),
    })

    const res = await request.get('/api/v1/core/processos-recentes')

    expect(res.body.processos[0].valor).toBe(2500.5)
    expect(res.body.processos[0].peso_bruto).toBe(750.25)
  })

  it('passa x-id-organizacao do auth (não do header injetado)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })

    await request
      .get('/api/v1/core/processos-recentes')
      .set('x-id-organizacao', 'tenant-malicious')

    const headers = (fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers
    expect(headers['x-id-organizacao']).toBe('tenant-001')
  })

  it('tenant diferente recebe dados isolados (cross-org)', async () => {
    authOverride = { ...defaultAuth, id_organizacao: 'tenant-888' }
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 'pX', numero_pedido: 'OTHER-001' }],
      }),
    })

    const res = await request.get('/api/v1/core/processos-recentes')

    expect(res.status).toBe(200)
    const headers = (fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers
    expect(headers['x-id-organizacao']).toBe('tenant-888')
    expect(res.body.processos[0].numero).toBe('OTHER-001')
  })

  it('propaga x-id-workspace ao Pedido quando presente', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })

    await request
      .get('/api/v1/core/processos-recentes')
      .set('x-id-workspace', 'workspace-xyz')

    const headers = (fetchMock.mock.calls[0][1] as { headers: Record<string, string> }).headers
    expect(headers['x-id-workspace']).toBe('workspace-xyz')
  })

  it('aplica ?limite= como query param limit no upstream (cap em 10)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })

    await request.get('/api/v1/core/processos-recentes?limite=5')

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('limit=5')
    expect(url).toContain('sort=updated_at')
    expect(url).toContain('dir=desc')
  })

  it('limita ?limite= a no máximo 10', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })

    await request.get('/api/v1/core/processos-recentes?limite=999')

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('limit=10')
  })

  it('default ?limite= ausente é 3', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })

    await request.get('/api/v1/core/processos-recentes')

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toContain('limit=3')
  })

  it('retorna processos: [] quando upstream falha — não 5xx (resiliência)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('upstream down'))

    const res = await request.get('/api/v1/core/processos-recentes')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ processos: [] })
  })

  it('retorna processos: [] quando upstream responde shape inesperado', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ outro_envelope: [] }),
    })

    const res = await request.get('/api/v1/core/processos-recentes')

    expect(res.status).toBe(200)
    expect(res.body.processos).toEqual([])
  })
})
