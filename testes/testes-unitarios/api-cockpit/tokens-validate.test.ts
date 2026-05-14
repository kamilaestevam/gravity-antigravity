// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFindFirst } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
}))

vi.mock('../../../servicos-global/servicos-plataforma/generated/index.js', () => ({
  PrismaClient: vi.fn(() => ({
    apiToken: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), findFirst: mockFindFirst },
  })),
}))

vi.mock(
  '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/middleware/requireInternalKey.js',
  () => ({
    requireInternalKey: (_req: unknown, _res: unknown, next: () => void) => next(),
  }),
)

vi.mock(
  '../../../servicos-global/servicos-plataforma/middleware/rateLimiter.js',
  () => ({
    rateLimitPresets: { internal: () => (_req: unknown, _res: unknown, next: () => void) => next() },
  }),
)

import express from 'express'
import request from 'supertest'
import { tokensRouter } from '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/routes/tokens.js'

function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/cockpit/api-tokens', tokensRouter)
  app.use((err: Error & { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

describe('GET /api/v1/cockpit/api-tokens/validate', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
  })

  it('retorna 401 quando header Authorization está ausente', async () => {
    const res = await request(app).get('/api/v1/cockpit/api-tokens/validate')
    expect(res.status).toBe(401)
    expect(res.body.valid).toBe(false)
  })

  it('retorna 401 quando token não começa com Bearer', async () => {
    const res = await request(app)
      .get('/api/v1/cockpit/api-tokens/validate')
      .set('Authorization', 'Basic abc123')
    expect(res.status).toBe(401)
    expect(res.body.valid).toBe(false)
  })

  it('retorna 401 quando token não existe no banco (hash não encontrado)', async () => {
    mockFindFirst.mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/cockpit/api-tokens/validate')
      .set('Authorization', 'Bearer gravity_token_api_homologacao_abc123')
    expect(res.status).toBe(401)
    expect(res.body.valid).toBe(false)
    expect(res.body.motivo).toBe('Token nao encontrado')
  })

  it('retorna 401 quando token foi revogado', async () => {
    mockFindFirst.mockResolvedValue({
      id_api_token: 'tok-001',
      id_organizacao: 'org-001',
      escopo_api_token: 'LEITURA',
      revogado_api_token: true,
      data_expiracao_api_token: null,
    })

    const res = await request(app)
      .get('/api/v1/cockpit/api-tokens/validate')
      .set('Authorization', 'Bearer gravity_token_api_homologacao_abc123')
    expect(res.status).toBe(401)
    expect(res.body.valid).toBe(false)
    expect(res.body.motivo).toBe('Token revogado')
  })

  it('retorna 401 quando token está expirado', async () => {
    const dataPassada = new Date(Date.now() - 86_400_000)
    mockFindFirst.mockResolvedValue({
      id_api_token: 'tok-002',
      id_organizacao: 'org-001',
      escopo_api_token: 'ESCRITA',
      revogado_api_token: false,
      data_expiracao_api_token: dataPassada,
    })

    const res = await request(app)
      .get('/api/v1/cockpit/api-tokens/validate')
      .set('Authorization', 'Bearer gravity_token_api_homologacao_xyz789')
    expect(res.status).toBe(401)
    expect(res.body.valid).toBe(false)
    expect(res.body.motivo).toBe('Token expirado')
  })

  it('retorna valid=true com id_organizacao e scopes para token válido sem expiração', async () => {
    mockFindFirst.mockResolvedValue({
      id_api_token: 'tok-003',
      id_organizacao: 'org-abc',
      escopo_api_token: 'LEITURA',
      revogado_api_token: false,
      data_expiracao_api_token: null,
    })

    const res = await request(app)
      .get('/api/v1/cockpit/api-tokens/validate')
      .set('Authorization', 'Bearer gravity_token_api_producao_valido123')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      valid: true,
      id_organizacao: 'org-abc',
      scopes: ['LEITURA'],
    })
  })

  it('retorna valid=true para token com expiração futura', async () => {
    const dataFutura = new Date(Date.now() + 86_400_000)
    mockFindFirst.mockResolvedValue({
      id_api_token: 'tok-004',
      id_organizacao: 'org-xyz',
      escopo_api_token: 'EXCLUSAO',
      revogado_api_token: false,
      data_expiracao_api_token: dataFutura,
    })

    const res = await request(app)
      .get('/api/v1/cockpit/api-tokens/validate')
      .set('Authorization', 'Bearer gravity_token_api_producao_futuro456')
    expect(res.status).toBe(200)
    expect(res.body.valid).toBe(true)
    expect(res.body.id_organizacao).toBe('org-xyz')
    expect(res.body.scopes).toEqual(['EXCLUSAO'])
  })

  it('busca pelo hash SHA-256 do token (não pelo valor em claro)', async () => {
    mockFindFirst.mockResolvedValue(null)

    await request(app)
      .get('/api/v1/cockpit/api-tokens/validate')
      .set('Authorization', 'Bearer gravity_token_api_homologacao_test')

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          hash_api_token: expect.any(String),
        }),
      }),
    )
    const chamada = mockFindFirst.mock.calls[0][0]
    expect(chamada.where.hash_api_token).not.toBe('gravity_token_api_homologacao_test')
    expect(chamada.where.hash_api_token).toHaveLength(64)
  })
})
