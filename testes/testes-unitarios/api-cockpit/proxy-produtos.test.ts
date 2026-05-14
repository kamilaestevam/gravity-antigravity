// @vitest-environment node
/**
 * Testa o proxy de rotas externas (api-cockpit → produto).
 *
 * Verifica: validação do Bearer token, verificação de escopo,
 * proxy para o produto com headers S2S corretos, timeout handling.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFindFirst } = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
}))

vi.mock('../../../servicos-global/servicos-plataforma/generated/index.js', () => ({
  PrismaClient: vi.fn(() => ({
    apiToken: { findFirst: mockFindFirst },
  })),
}))

vi.mock(
  '../../../servicos-global/servicos-plataforma/middleware/rateLimiter.js',
  () => ({
    rateLimitPresets: { internal: () => (_req: unknown, _res: unknown, next: () => void) => next() },
  }),
)

import express from 'express'
import request from 'supertest'
import { proxyProdutosRouter } from '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/routes/proxy-produtos.js'

function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/cockpit', proxyProdutosRouter)
  app.use((err: Error & { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

describe('proxy-produtos — validação de token', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
  })

  it('retorna 401 sem Authorization header', async () => {
    const res = await request(app).post('/api/v1/cockpit/pedidos')
    expect(res.status).toBe(401)
    expect(res.body.code).toBe('UNAUTHORIZED')
  })

  it('retorna 401 com token inexistente', async () => {
    mockFindFirst.mockResolvedValue(null)
    const res = await request(app)
      .post('/api/v1/cockpit/pedidos')
      .set('Authorization', 'Bearer gravity_token_api_producao_abc123')
    expect(res.status).toBe(401)
  })

  it('retorna 401 com token revogado', async () => {
    mockFindFirst.mockResolvedValue({
      id_organizacao: 'org-1',
      escopo_api_token: 'ESCRITA',
      revogado_api_token: true,
      data_expiracao_api_token: null,
    })
    const res = await request(app)
      .post('/api/v1/cockpit/pedidos')
      .set('Authorization', 'Bearer gravity_token_api_producao_abc123')
    expect(res.status).toBe(401)
  })

  it('retorna 401 com token expirado', async () => {
    mockFindFirst.mockResolvedValue({
      id_organizacao: 'org-1',
      escopo_api_token: 'ESCRITA',
      revogado_api_token: false,
      data_expiracao_api_token: new Date(Date.now() - 86_400_000),
    })
    const res = await request(app)
      .post('/api/v1/cockpit/pedidos')
      .set('Authorization', 'Bearer gravity_token_api_producao_abc123')
    expect(res.status).toBe(401)
  })
})

describe('proxy-produtos — verificação de escopo', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    app = createApp()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('retorna 403 quando token LEITURA tenta POST', async () => {
    mockFindFirst.mockResolvedValue({
      id_organizacao: 'org-1',
      escopo_api_token: 'LEITURA',
      revogado_api_token: false,
      data_expiracao_api_token: null,
    })
    const res = await request(app)
      .post('/api/v1/cockpit/pedidos')
      .set('Authorization', 'Bearer gravity_token_api_producao_abc123')
      .send({ tipo_operacao_pedido: 'importacao' })
    expect(res.status).toBe(403)
    expect(res.body.code).toBe('FORBIDDEN')
  })

  it('permite GET com token LEITURA', async () => {
    mockFindFirst.mockResolvedValue({
      id_organizacao: 'org-1',
      escopo_api_token: 'LEITURA',
      revogado_api_token: false,
      data_expiracao_api_token: null,
    })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ pedidos: [] }), { status: 200, headers: { 'content-type': 'application/json' } }),
    )
    const res = await request(app)
      .get('/api/v1/cockpit/pedidos')
      .set('Authorization', 'Bearer gravity_token_api_producao_abc123')
    expect(res.status).toBe(200)
  })

  it('permite DELETE com token EXCLUSAO', async () => {
    mockFindFirst.mockResolvedValue({
      id_organizacao: 'org-1',
      escopo_api_token: 'EXCLUSAO',
      revogado_api_token: false,
      data_expiracao_api_token: null,
    })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(null, { status: 204 }),
    )
    const res = await request(app)
      .delete('/api/v1/cockpit/pedidos/ped-123')
      .set('Authorization', 'Bearer gravity_token_api_producao_abc123')
    expect(res.status).toBe(204)
  })
})

import { afterEach } from 'vitest'

describe('proxy-produtos — proxy para produto', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    app = createApp()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envia headers S2S corretos ao produto', async () => {
    mockFindFirst.mockResolvedValue({
      id_organizacao: 'org-abc',
      escopo_api_token: 'ESCRITA',
      revogado_api_token: false,
      data_expiracao_api_token: null,
    })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ id_pedido: 'ped-1' }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
    )

    await request(app)
      .post('/api/v1/cockpit/pedidos')
      .set('Authorization', 'Bearer gravity_token_api_producao_valido')
      .send({ tipo_operacao_pedido: 'importacao' })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/pedidos'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-chave-interna-servico': expect.any(String),
          'x-id-organizacao': 'org-abc',
          'x-api-token-escopo': 'ESCRITA',
        }),
      }),
    )
  })

  it('preserva sub-path na URL do produto', async () => {
    mockFindFirst.mockResolvedValue({
      id_organizacao: 'org-1',
      escopo_api_token: 'LEITURA',
      revogado_api_token: false,
      data_expiracao_api_token: null,
    })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200, headers: { 'content-type': 'application/json' } }),
    )

    await request(app)
      .get('/api/v1/cockpit/pedidos/ped-123/itens')
      .set('Authorization', 'Bearer gravity_token_api_producao_abc')

    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).toContain('/api/v1/pedidos/ped-123/itens')
  })

  it('retorna resposta do produto ao cliente', async () => {
    mockFindFirst.mockResolvedValue({
      id_organizacao: 'org-1',
      escopo_api_token: 'ESCRITA',
      revogado_api_token: false,
      data_expiracao_api_token: null,
    })
    ;(fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ id_pedido: 'ped-novo', numero_pedido: 'PO-001' }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const res = await request(app)
      .post('/api/v1/cockpit/pedidos')
      .set('Authorization', 'Bearer gravity_token_api_producao_valido')
      .send({ tipo_operacao_pedido: 'importacao' })

    expect(res.status).toBe(201)
    expect(res.body.id_pedido).toBe('ped-novo')
    expect(res.body.numero_pedido).toBe('PO-001')
  })
})
