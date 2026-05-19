// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFindMany, mockCreate, mockFindFirst, mockUpdate, mockDelete, mockLogCreate } = vi.hoisted(() => ({
  mockFindMany:  vi.fn(),
  mockCreate:    vi.fn(),
  mockFindFirst: vi.fn(),
  mockUpdate:    vi.fn(),
  mockDelete:    vi.fn(),
  mockLogCreate: vi.fn(),
}))

vi.mock('../../../servicos-global/servicos-plataforma/generated/index.js', () => ({
  PrismaClient: vi.fn(() => ({
    webhookConfiguracao: {
      findMany:  mockFindMany,
      create:    mockCreate,
      findFirst: mockFindFirst,
      update:    mockUpdate,
      delete:    mockDelete,
    },
    webhookLog: {
      findMany: mockFindMany,
      create:   mockLogCreate,
    },
  })),
}))

vi.mock(
  '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/middleware/requireInternalKey.js',
  () => ({
    requireInternalKey: (_req: unknown, _res: unknown, next: () => void) => next(),
  }),
)

vi.mock(
  '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/crypto.js',
  () => ({
    generateWebhookSecret: () => 'segredo_mock_hex_64chars_0000000000000000000000000000000000',
    generateHMACSignature: () => 'hmac_mock',
  }),
)

import express from 'express'
import request from 'supertest'
import { webhooksRouter } from '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/routes/webhooks.js'

function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/cockpit/webhooks', webhooksRouter)
  app.use((err: Error & { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

const ORG_A = 'org-aaa'
const ORG_B = 'org-bbb'

const webhookFixture = {
  id_webhook_configuracao:               'whk-001',
  id_organizacao:                        ORG_A,
  id_produto_gravity:                    null,
  id_usuario:                            'usr-001',
  url_webhook_configuracao:              'https://exemplo.com/hook',
  segredo_webhook_configuracao:          'segredo123',
  eventos_webhook_configuracao:          ['pedido.criado'],
  ativo_webhook_configuracao:            true,
  data_criacao_webhook_configuracao:     new Date().toISOString(),
  data_atualizacao_webhook_configuracao: new Date().toISOString(),
}

describe('GET /api/v1/cockpit/webhooks', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
  })

  it('retorna 400 quando id_organizacao ausente na query', async () => {
    const res = await request(app).get('/api/v1/cockpit/webhooks')
    expect(res.status).toBe(400)
    expect(res.body.erro).toBe('Query invalida')
  })

  it('retorna lista de webhooks filtrada por id_organizacao', async () => {
    mockFindMany.mockResolvedValue([webhookFixture])

    const res = await request(app)
      .get('/api/v1/cockpit/webhooks')
      .query({ id_organizacao: ORG_A })

    expect(res.status).toBe(200)
    expect(res.body.webhooks).toHaveLength(1)
    expect(res.body.webhooks[0].id_organizacao).toBe(ORG_A)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_organizacao: ORG_A },
      }),
    )
  })

  it('retorna array vazio quando organizacao nao tem webhooks', async () => {
    mockFindMany.mockResolvedValue([])

    const res = await request(app)
      .get('/api/v1/cockpit/webhooks')
      .query({ id_organizacao: ORG_B })

    expect(res.status).toBe(200)
    expect(res.body.webhooks).toEqual([])
  })
})

describe('POST /api/v1/cockpit/webhooks', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
  })

  it('retorna 400 quando body esta vazio', async () => {
    const res = await request(app)
      .post('/api/v1/cockpit/webhooks')
      .send({})
    expect(res.status).toBe(400)
    expect(res.body.erro).toBe('Body invalido')
  })

  it('retorna 400 quando url invalida', async () => {
    const res = await request(app)
      .post('/api/v1/cockpit/webhooks')
      .send({
        id_organizacao: ORG_A,
        url_webhook_configuracao: 'nao-e-url',
        eventos_webhook_configuracao: ['pedido.criado'],
      })
    expect(res.status).toBe(400)
  })

  it('retorna 400 quando eventos vazio', async () => {
    const res = await request(app)
      .post('/api/v1/cockpit/webhooks')
      .send({
        id_organizacao: ORG_A,
        url_webhook_configuracao: 'https://exemplo.com/hook',
        eventos_webhook_configuracao: [],
      })
    expect(res.status).toBe(400)
  })

  it('cria webhook com segredo e retorna 201', async () => {
    const criado = { ...webhookFixture, segredo_webhook_configuracao: 'segredo_mock_hex_64chars_0000000000000000000000000000000000' }
    mockCreate.mockResolvedValue(criado)

    const res = await request(app)
      .post('/api/v1/cockpit/webhooks')
      .send({
        id_organizacao: ORG_A,
        url_webhook_configuracao: 'https://exemplo.com/hook',
        eventos_webhook_configuracao: ['pedido.criado'],
      })

    expect(res.status).toBe(201)
    expect(res.body.segredo_webhook_configuracao).toBeTruthy()
    expect(res.body.id_organizacao).toBe(ORG_A)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id_organizacao: ORG_A,
          url_webhook_configuracao: 'https://exemplo.com/hook',
          eventos_webhook_configuracao: ['pedido.criado'],
          ativo_webhook_configuracao: true,
        }),
      }),
    )
  })
})

describe('PUT /api/v1/cockpit/webhooks/:id_webhook_configuracao', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
  })

  it('retorna 404 quando webhook nao existe para a organizacao', async () => {
    mockFindFirst.mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/cockpit/webhooks/whk-inexistente')
      .send({ id_organizacao: ORG_A, ativo_webhook_configuracao: false })

    expect(res.status).toBe(404)
    expect(res.body.erro).toBe('Webhook nao encontrado')
  })

  it('atualiza webhook existente e retorna dados atualizados', async () => {
    mockFindFirst.mockResolvedValue(webhookFixture)
    const atualizado = { ...webhookFixture, ativo_webhook_configuracao: false }
    mockUpdate.mockResolvedValue(atualizado)

    const res = await request(app)
      .put('/api/v1/cockpit/webhooks/whk-001')
      .send({ id_organizacao: ORG_A, ativo_webhook_configuracao: false })

    expect(res.status).toBe(200)
    expect(res.body.ativo_webhook_configuracao).toBe(false)
  })

  it('impede atualizar webhook de outra organizacao (isolamento)', async () => {
    mockFindFirst.mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/cockpit/webhooks/whk-001')
      .send({ id_organizacao: ORG_B, ativo_webhook_configuracao: false })

    expect(res.status).toBe(404)
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id_webhook_configuracao: 'whk-001',
          id_organizacao: ORG_B,
        },
      }),
    )
  })
})

describe('DELETE /api/v1/cockpit/webhooks/:id_webhook_configuracao', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
  })

  it('retorna 400 quando id_organizacao ausente no body', async () => {
    const res = await request(app)
      .delete('/api/v1/cockpit/webhooks/whk-001')
      .send({})
    expect(res.status).toBe(400)
  })

  it('retorna 404 quando webhook nao pertence a organizacao', async () => {
    mockFindFirst.mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/cockpit/webhooks/whk-001')
      .send({ id_organizacao: ORG_B })

    expect(res.status).toBe(404)
  })

  it('exclui webhook e retorna 204', async () => {
    mockFindFirst.mockResolvedValue(webhookFixture)
    mockDelete.mockResolvedValue(webhookFixture)

    const res = await request(app)
      .delete('/api/v1/cockpit/webhooks/whk-001')
      .send({ id_organizacao: ORG_A })

    expect(res.status).toBe(204)
    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_webhook_configuracao: 'whk-001' },
      }),
    )
  })
})

describe('Isolamento cross-organizacao', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()
    app = createApp()
  })

  it('GET filtra exclusivamente por id_organizacao enviado', async () => {
    mockFindMany.mockResolvedValue([])

    await request(app)
      .get('/api/v1/cockpit/webhooks')
      .query({ id_organizacao: ORG_A })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_organizacao: ORG_A },
      }),
    )
  })

  it('POST grava com id_organizacao do body (nao de outra fonte)', async () => {
    mockCreate.mockResolvedValue(webhookFixture)

    await request(app)
      .post('/api/v1/cockpit/webhooks')
      .send({
        id_organizacao: ORG_A,
        url_webhook_configuracao: 'https://exemplo.com/hook',
        eventos_webhook_configuracao: ['pedido.criado'],
      })

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id_organizacao: ORG_A,
        }),
      }),
    )
  })
})
