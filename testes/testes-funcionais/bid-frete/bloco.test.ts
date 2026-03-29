// @vitest-environment node
/**
 * Testes funcionais v2 — BID Frete / Importacao em Bloco
 * POST /api/v1/bid-frete/cotacoes/bloco
 *
 * Testa cenarios especificos de importacao em massa:
 * - Multiplos itens
 * - Erros parciais
 * - Limites de batch
 * - Campos opcionais por item
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

vi.mock('axios', () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }), get: vi.fn() },
}))

vi.mock('../../../produto/bid-frete/server/src/services/tenantIntegrations.js', () => ({
  atividadesIntegration: { cotacaoCriada: vi.fn() },
  historicoIntegration: { cotacaoCriada: vi.fn(), registrar: vi.fn() },
  notificacoesIntegration: { fornecedorRespondeu: vi.fn() },
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

const itemValido = {
  tipo_operacao: 'IMPORTACAO',
  modal: 'MARITIMO',
  modalidade: 'FCL',
  origem_codigo: 'CNSHA', origem_nome: 'Shanghai', origem_pais: 'China',
  destino_codigo: 'BRSSZ', destino_nome: 'Santos', destino_pais: 'Brasil',
  descricao_mercadoria: 'Auto Parts',
  incoterm: 'FOB',
}

// ===========================================================================
// POST /api/v1/bid-frete/cotacoes/bloco — importacao em bloco
// ===========================================================================

describe('POST /api/v1/bid-frete/cotacoes/bloco — importacao em bloco', () => {
  const app = buildApp()
  beforeEach(() => vi.clearAllMocks())

  it('201 — cria multiplas cotacoes com sucesso', async () => {
    mockCotacao.create
      .mockResolvedValueOnce({ id: 'cot-001', numero: 'BID-20260329-0001' })
      .mockResolvedValueOnce({ id: 'cot-002', numero: 'BID-20260329-0002' })
      .mockResolvedValueOnce({ id: 'cot-003', numero: 'BID-20260329-0003' })

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({
        itens: [
          itemValido,
          { ...itemValido, destino_nome: 'Paranagua', destino_codigo: 'BRPNG' },
          { ...itemValido, modal: 'AEREO', modalidade: 'AEREO_GERAL' },
        ],
      })

    expect(res.status).toBe(201)
    expect(res.body.total).toBe(3)
    expect(res.body.criadas).toBe(3)
    expect(res.body.erros).toBe(0)
    expect(res.body.results).toHaveLength(3)
    expect(res.body.results.every((r: any) => r.status === 'ok')).toBe(true)
    expect(mockCotacao.create).toHaveBeenCalledTimes(3)
  })

  it('201 — reporta erros parciais sem falhar todo o lote', async () => {
    mockCotacao.create
      .mockResolvedValueOnce({ id: 'cot-001', numero: 'BID-001' })
      .mockRejectedValueOnce(new Error('DB constraint violation'))
      .mockResolvedValueOnce({ id: 'cot-003', numero: 'BID-003' })

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [itemValido, itemValido, itemValido] })

    expect(res.status).toBe(201)
    expect(res.body.criadas).toBe(2)
    expect(res.body.erros).toBe(1)
    expect(res.body.results[0].status).toBe('ok')
    expect(res.body.results[1].status).toBe('erro')
    expect(res.body.results[1].erro).toBeDefined()
    expect(res.body.results[2].status).toBe('ok')
  })

  it('201 — todos os itens falham no DB (mas bloco retorna 201 com erros)', async () => {
    mockCotacao.create.mockRejectedValue(new Error('DB unavailable'))

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [itemValido, itemValido] })

    expect(res.status).toBe(201)
    expect(res.body.criadas).toBe(0)
    expect(res.body.erros).toBe(2)
  })

  it('201 — aceita itens com campos opcionais diferentes', async () => {
    mockCotacao.create.mockResolvedValue({ id: 'cot-x', numero: 'BID-X' })

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({
        itens: [
          { ...itemValido, ncm: '87089990', peso_kg: 5000 },
          { ...itemValido, referencia_interna: 'REF-002', valor_target: 2500 },
        ],
      })

    expect(res.status).toBe(201)
    expect(res.body.criadas).toBe(2)
  })

  it('201 — itens recebem numero sequencial (results contam linhas)', async () => {
    mockCotacao.create
      .mockResolvedValueOnce({ id: 'c1', numero: 'BID-1' })
      .mockResolvedValueOnce({ id: 'c2', numero: 'BID-2' })

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [itemValido, itemValido] })

    expect(res.body.results[0].linha).toBe(1)
    expect(res.body.results[1].linha).toBe(2)
  })

  it('400 — rejeita array vazio', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita itens invalidos (modal errado)', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [{ ...itemValido, modal: 'FERROVIARIO' }] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita payload sem campo itens', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ rows: [itemValido] })

    expect(res.status).toBe(400)
  })

  it('400 — rejeita item com campo obrigatorio faltando', async () => {
    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({ itens: [{ tipo_operacao: 'IMPORTACAO' }] })

    expect(res.status).toBe(400)
  })

  it('201 — aceita visibilidade e data_limite_resposta globais', async () => {
    mockCotacao.create.mockResolvedValue({ id: 'c-global', numero: 'BID-G' })

    const res = await request(app)
      .post('/api/v1/bid-frete/cotacoes/bloco')
      .send({
        itens: [itemValido],
        visibilidade: 'ABERTA',
        data_limite_resposta: '2026-05-01T00:00:00.000Z',
      })

    expect(res.status).toBe(201)
    expect(res.body.criadas).toBe(1)
  })
})
