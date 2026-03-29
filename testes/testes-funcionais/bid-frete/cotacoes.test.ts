// @vitest-environment node
/**
 * Testes funcionais v2 — BID Frete / Rotas de Cotacoes
 * POST   /api/v1/bid-frete/cotacoes
 * GET    /api/v1/bid-frete/cotacoes
 * GET    /api/v1/bid-frete/cotacoes/:id
 * PUT    /api/v1/bid-frete/cotacoes/:id
 * PATCH  /api/v1/bid-frete/cotacoes/:id/status
 * DELETE /api/v1/bid-frete/cotacoes/:id
 * POST   /api/v1/bid-frete/cotacoes/bloco
 *
 * Estrategia: mock do Prisma e middlewares (sem banco real em CI)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// ---------------------------------------------------------------------------
// Mocks globais
// ---------------------------------------------------------------------------

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }), get: vi.fn().mockResolvedValue({ data: {} }) },
}))

vi.mock('../../../produto/bid-frete/server/src/services/tenantIntegrations.js', () => ({
  atividadesIntegration: { cotacaoCriada: vi.fn(), faltaInformacao: vi.fn(), aguardandoAprovacao: vi.fn() },
  historicoIntegration: { cotacaoCriada: vi.fn(), bidsDisparados: vi.fn(), cotacaoAprovada: vi.fn(), cotacaoReprovada: vi.fn(), registrar: vi.fn() },
  notificacoesIntegration: { fornecedorRespondeu: vi.fn(), cotacaoAprovada: vi.fn() },
}))

const mockCotacao = {
  create: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
}

vi.mock('../../../produto/bid-frete/server/src/middleware/tenantIsolation.js', () => ({
  tenantIsolationMiddleware: (req: any, _res: any, next: any) => {
    req.tenantId = 'tenant-test-001'
    req.prisma = { cotacao: mockCotacao }
    next()
  },
  prisma: { $queryRaw: vi.fn().mockResolvedValue([1]) },
}))

vi.mock('../../../produto/bid-frete/server/src/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: any, _res: any, next: any) => next(),
}))

import { cotacoesRouter } from '../../../produto/bid-frete/server/src/routes/cotacoes.js'

// ---------------------------------------------------------------------------
// App de testes
// ---------------------------------------------------------------------------

function buildApp() {
  const app = express()
  app.use(express.json({ limit: '10mb' }))
  app.use((req: any, _res: any, next: any) => {
    req.tenantId = 'tenant-test-001'
    req.prisma = { cotacao: mockCotacao }
    req.headers['x-user-id'] = 'user-test-001'
    req.headers['x-internal-key'] = 'test-key'
    req.headers['x-tenant-id'] = 'tenant-test-001'
    next()
  })
  app.use('/api/v1/bid-frete/cotacoes', cotacoesRouter)
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.statusCode ?? 500).json({ error: err.message })
  })
  return app
}

// ---------------------------------------------------------------------------
// Dados base
// ---------------------------------------------------------------------------

const cotacaoValida = {
  tipo_operacao: 'IMPORTACAO',
  modal: 'MARITIMO',
  modalidade: 'FCL',
  origem_codigo: 'CNSHA',
  origem_nome: 'Shanghai',
  origem_pais: 'China',
  destino_codigo: 'BRSSZ',
  destino_nome: 'Santos',
  destino_pais: 'Brasil',
  descricao_mercadoria: 'Auto Parts',
  incoterm: 'FOB',
}

// ===========================================================================
// POST /api/v1/bid-frete/cotacoes — criar cotacao
// ===========================================================================

describe('POST /api/v1/bid-frete/cotacoes — criar cotacao', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('201 — cria cotacao com dados validos (campos minimos)', async () => {
    const mockResult = { id: 'cot-001', numero: 'BID-20260329-0001', ...cotacaoValida, status: 'RASCUNHO' }
    mockCotacao.create.mockResolvedValue(mockResult)

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes')
      .send(cotacaoValida)

    expect(res.status).toBe(201)
    expect(res.body.cotacao).toHaveProperty('id', 'cot-001')
    expect(res.body.cotacao).toHaveProperty('numero')
    expect(res.body.cotacao.status).toBe('RASCUNHO')
    expect(mockCotacao.create).toHaveBeenCalledTimes(1)
  })

  it('201 — cria cotacao com campos opcionais completos', async () => {
    const payload = {
      ...cotacaoValida,
      referencia_interna: 'REF-001',
      ncm: '87089990',
      quantidade: 2,
      tipo_container: '40HC',
      peso_kg: 18000,
      cubagem_m3: 60,
      valor_target: 3500,
      moeda_target: 'USD',
      visibilidade: 'ABERTA',
      ocultar_nome_empresa: true,
      data_limite_resposta: '2026-04-15T00:00:00.000Z',
      fornecedor_ids: ['f-001', 'f-002'],
    }
    mockCotacao.create.mockResolvedValue({ id: 'cot-002', ...payload, status: 'RASCUNHO' })

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes')
      .send(payload)

    expect(res.status).toBe(201)
    expect(mockCotacao.create).toHaveBeenCalledTimes(1)
  })

  it('400 — rejeita sem campos obrigatorios', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes')
      .send({ tipo_operacao: 'IMPORTACAO' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('400 — rejeita modal invalido', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes')
      .send({ ...cotacaoValida, modal: 'ESPACIAL' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita modalidade incompativel', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes')
      .send({ ...cotacaoValida, modalidade: 'INEXISTENTE' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita tipo_operacao invalido', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes')
      .send({ ...cotacaoValida, tipo_operacao: 'CABOTAGEM' })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita descricao_mercadoria vazia', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes')
      .send({ ...cotacaoValida, descricao_mercadoria: '' })

    expect(res.status).toBe(400)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/cotacoes — listar cotacoes
// ===========================================================================

describe('GET /api/v1/bid-frete/cotacoes — listar cotacoes', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — lista cotacoes com paginacao padrao', async () => {
    mockCotacao.findMany.mockResolvedValue([
      { id: 'cot-001', numero: 'BID-20260329-0001', status: 'RASCUNHO', bid_requests: [], bid_responses: [] },
      { id: 'cot-002', numero: 'BID-20260329-0002', status: 'APROVADA', bid_requests: [], bid_responses: [] },
    ])
    mockCotacao.count.mockResolvedValue(2)

    const res = await request(app).get('/api/v1/bid-frete/cotacoes')

    expect(res.status).toBe(200)
    expect(res.body.cotacoes).toHaveLength(2)
    expect(res.body.pagination).toHaveProperty('total', 2)
    expect(res.body.pagination).toHaveProperty('page', 1)
    expect(res.body.pagination).toHaveProperty('pages', 1)
  })

  it('200 — paginacao com page e limit', async () => {
    mockCotacao.findMany.mockResolvedValue([])
    mockCotacao.count.mockResolvedValue(50)

    const res = await request(app)
      .get('/api/v1/bid-frete/cotacoes')
      .query({ page: 3, limit: 10 })

    expect(res.status).toBe(200)
    expect(res.body.pagination.page).toBe(3)
    expect(res.body.pagination.pages).toBe(5)
  })

  it('200 — filtra por status', async () => {
    mockCotacao.findMany.mockResolvedValue([])
    mockCotacao.count.mockResolvedValue(0)

    await request(app).get('/api/v1/bid-frete/cotacoes').query({ status: 'APROVADA' })

    expect(mockCotacao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'APROVADA' }),
      })
    )
  })

  it('200 — filtra por modal', async () => {
    mockCotacao.findMany.mockResolvedValue([])
    mockCotacao.count.mockResolvedValue(0)

    await request(app).get('/api/v1/bid-frete/cotacoes').query({ modal: 'AEREO' })

    expect(mockCotacao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ modal: 'AEREO' }),
      })
    )
  })

  it('200 — filtra por tipo_operacao', async () => {
    mockCotacao.findMany.mockResolvedValue([])
    mockCotacao.count.mockResolvedValue(0)

    await request(app).get('/api/v1/bid-frete/cotacoes').query({ tipo_operacao: 'EXPORTACAO' })

    expect(mockCotacao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tipo_operacao: 'EXPORTACAO' }),
      })
    )
  })

  it('200 — retorna array vazio quando nenhuma cotacao', async () => {
    mockCotacao.findMany.mockResolvedValue([])
    mockCotacao.count.mockResolvedValue(0)

    const res = await request(app).get('/api/v1/bid-frete/cotacoes')

    expect(res.status).toBe(200)
    expect(res.body.cotacoes).toHaveLength(0)
    expect(res.body.pagination.total).toBe(0)
  })
})

// ===========================================================================
// GET /api/v1/bid-frete/cotacoes/:id — detalhe
// ===========================================================================

describe('GET /api/v1/bid-frete/cotacoes/:id — detalhe', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna detalhe da cotacao com bid_requests e bid_responses', async () => {
    mockCotacao.findFirst.mockResolvedValue({
      id: 'cot-001', numero: 'BID-20260329-0001', status: 'EM_COTACAO',
      bid_requests: [{ id: 'br-001', fornecedor: { id: 'f-001', nome: 'Asia Shipping' } }],
      bid_responses: [{ id: 'resp-001', valor_total: 2500, fornecedor: { id: 'f-001' } }],
    })

    const res = await request(app).get('/api/v1/bid-frete/cotacoes/cot-001')

    expect(res.status).toBe(200)
    expect(res.body.cotacao).toHaveProperty('id', 'cot-001')
    expect(res.body.cotacao.bid_requests).toHaveLength(1)
    expect(res.body.cotacao.bid_responses).toHaveLength(1)
  })

  it('404 — cotacao nao encontrada', async () => {
    mockCotacao.findFirst.mockResolvedValue(null)

    const res = await request(app).get('/api/v1/bid-frete/cotacoes/nao-existe')

    expect(res.status).toBe(404)
    expect(res.body.error).toContain('nao encontrada')
  })
})

// ===========================================================================
// PUT /api/v1/bid-frete/cotacoes/:id — atualizar cotacao
// ===========================================================================

describe('PUT /api/v1/bid-frete/cotacoes/:id — atualizar cotacao', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — atualiza cotacao em RASCUNHO', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'RASCUNHO' })
    mockCotacao.update.mockResolvedValue({ id: 'cot-001', descricao_mercadoria: 'Electronics', status: 'RASCUNHO' })

    const res = await request(app)
      .put('/api/v1/bid-frete/cotacoes/cot-001')
      .send({ descricao_mercadoria: 'Electronics' })

    expect(res.status).toBe(200)
    expect(res.body.cotacao.descricao_mercadoria).toBe('Electronics')
  })

  it('200 — atualiza cotacao com FALTA_INFORMACAO', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'FALTA_INFORMACAO' })
    mockCotacao.update.mockResolvedValue({ id: 'cot-001', ncm: '87089990', status: 'FALTA_INFORMACAO' })

    const res = await request(app)
      .put('/api/v1/bid-frete/cotacoes/cot-001')
      .send({ ncm: '87089990' })

    expect(res.status).toBe(200)
  })

  it('400 — nao permite editar cotacao em EM_COTACAO', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'EM_COTACAO' })

    const res = await request(app)
      .put('/api/v1/bid-frete/cotacoes/cot-001')
      .send({ descricao_mercadoria: 'tentativa' })

    expect(res.status).toBe(400)
  })

  it('400 — nao permite editar cotacao APROVADA', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'APROVADA' })

    const res = await request(app)
      .put('/api/v1/bid-frete/cotacoes/cot-001')
      .send({ descricao_mercadoria: 'tentativa' })

    expect(res.status).toBe(400)
  })

  it('404 — cotacao nao encontrada para update', async () => {
    mockCotacao.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/bid-frete/cotacoes/nao-existe')
      .send({ descricao_mercadoria: 'teste' })

    expect(res.status).toBe(404)
  })
})

// ===========================================================================
// PATCH /api/v1/bid-frete/cotacoes/:id/status — aprovar/reprovar/cancelar
// ===========================================================================

describe('PATCH /api/v1/bid-frete/cotacoes/:id/status — transicoes de status', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — aprova cotacao com fornecedor vencedor', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'AGUARDANDO_APROVACAO' })
    mockCotacao.update.mockResolvedValue({ id: 'cot-001', status: 'APROVADA', fornecedor_vencedor_id: 'f-001' })

    const res = await request(app)
      .patch('/api/v1/bid-frete/cotacoes/cot-001/status')
      .send({ status: 'APROVADA', fornecedor_vencedor_id: 'f-001' })

    expect(res.status).toBe(200)
    expect(res.body.cotacao.status).toBe('APROVADA')
  })

  it('200 — reprova com motivo', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'AGUARDANDO_APROVACAO' })
    mockCotacao.update.mockResolvedValue({ id: 'cot-001', status: 'REPROVADA', motivo_reprovacao: 'Acima do target' })

    const res = await request(app)
      .patch('/api/v1/bid-frete/cotacoes/cot-001/status')
      .send({ status: 'REPROVADA', motivo_reprovacao: 'Acima do target' })

    expect(res.status).toBe(200)
    expect(res.body.cotacao.status).toBe('REPROVADA')
  })

  it('200 — cancela cotacao com motivo', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'EM_COTACAO' })
    mockCotacao.update.mockResolvedValue({ id: 'cot-001', status: 'CANCELADA' })

    const res = await request(app)
      .patch('/api/v1/bid-frete/cotacoes/cot-001/status')
      .send({ status: 'CANCELADA', motivo_cancelamento: 'Cliente desistiu' })

    expect(res.status).toBe(200)
    expect(res.body.cotacao.status).toBe('CANCELADA')
  })

  it('400 — status invalido', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-frete/cotacoes/cot-001/status')
      .send({ status: 'INVALIDO' })

    expect(res.status).toBe(400)
  })

  it('400 — body vazio', async () => {
    const res = await request(app)
      .patch('/api/v1/bid-frete/cotacoes/cot-001/status')
      .send({})

    expect(res.status).toBe(400)
  })

  it('404 — cotacao nao encontrada ao mudar status', async () => {
    mockCotacao.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .patch('/api/v1/bid-frete/cotacoes/nao-existe/status')
      .send({ status: 'APROVADA' })

    expect(res.status).toBe(404)
  })
})

// ===========================================================================
// DELETE /api/v1/bid-frete/cotacoes/:id — excluir rascunho
// ===========================================================================

describe('DELETE /api/v1/bid-frete/cotacoes/:id — excluir rascunho', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('200 — exclui cotacao em RASCUNHO', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'RASCUNHO' })
    mockCotacao.delete.mockResolvedValue({})

    const res = await request(app).delete('/api/v1/bid-frete/cotacoes/cot-001')

    expect(res.status).toBe(200)
    expect(res.body.deleted).toBe(true)
    expect(mockCotacao.delete).toHaveBeenCalledWith({ where: { id: 'cot-001' } })
  })

  it('400 — nao permite excluir cotacao EM_COTACAO', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'EM_COTACAO' })

    const res = await request(app).delete('/api/v1/bid-frete/cotacoes/cot-001')

    expect(res.status).toBe(400)
    expect(mockCotacao.delete).not.toHaveBeenCalled()
  })

  it('400 — nao permite excluir cotacao APROVADA', async () => {
    mockCotacao.findFirst.mockResolvedValue({ id: 'cot-001', status: 'APROVADA' })

    const res = await request(app).delete('/api/v1/bid-frete/cotacoes/cot-001')

    expect(res.status).toBe(400)
  })

  it('404 — cotacao nao encontrada para exclusao', async () => {
    mockCotacao.findFirst.mockResolvedValue(null)

    const res = await request(app).delete('/api/v1/bid-frete/cotacoes/nao-existe')

    expect(res.status).toBe(404)
  })
})

// ===========================================================================
// POST /api/v1/bid-frete/cotacoes/bloco — importacao em bloco
// ===========================================================================

describe('POST /api/v1/bid-frete/cotacoes/bloco — importacao em bloco', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  const itemValido = {
    tipo_operacao: 'IMPORTACAO',
    modal: 'MARITIMO',
    modalidade: 'FCL',
    origem_codigo: 'CNSHA', origem_nome: 'Shanghai', origem_pais: 'China',
    destino_codigo: 'BRSSZ', destino_nome: 'Santos', destino_pais: 'Brasil',
    descricao_mercadoria: 'Auto Parts',
    incoterm: 'FOB',
  }

  it('201 — cria multiplas cotacoes', async () => {
    mockCotacao.create
      .mockResolvedValueOnce({ id: 'cot-001', numero: 'BID-001' })
      .mockResolvedValueOnce({ id: 'cot-002', numero: 'BID-002' })

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [itemValido, { ...itemValido, destino_nome: 'Paranagua', destino_codigo: 'BRPNG' }] })

    expect(res.status).toBe(201)
    expect(res.body.total).toBe(2)
    expect(res.body.criadas).toBe(2)
    expect(res.body.erros).toBe(0)
    expect(mockCotacao.create).toHaveBeenCalledTimes(2)
  })

  it('201 — reporta erros parciais', async () => {
    mockCotacao.create
      .mockResolvedValueOnce({ id: 'cot-001', numero: 'BID-001' })
      .mockRejectedValueOnce(new Error('DB error'))

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [itemValido, itemValido] })

    expect(res.status).toBe(201)
    expect(res.body.criadas).toBe(1)
    expect(res.body.erros).toBe(1)
    expect(res.body.results[1].status).toBe('erro')
  })

  it('400 — rejeita array vazio', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita itens com dados invalidos', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [{ tipo_operacao: 'INVALIDO' }] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita sem propriedade itens', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ data: [itemValido] })

    expect(res.status).toBe(400)
  })
})
