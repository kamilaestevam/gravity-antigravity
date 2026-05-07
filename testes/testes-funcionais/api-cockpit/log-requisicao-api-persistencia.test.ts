// @vitest-environment node
// TST-FUNC-APICOCKPIT-PERSISTENCIA — Fluxo completo de persistencia de log_requisicao_api
//
// Valida:
//   1. POST /ingestao aceita payload e adiciona ao buffer (Mandamento 06 — Zod)
//   2. Buffer flush dispara prisma.logRequisicaoApi.createMany com payload correto
//   3. GET /logs consulta prisma.logRequisicaoApi.findMany e devolve payload com sufixo DDD novo
//   4. id_correlacao e id_api_token sao preservados no roundtrip (incluindo null)
/// <reference types="vitest/globals" />

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// ─── Mocks hoistados ─────────────────────────────────────────────────────────

const { createManyMock, findManyMock, countMock } = vi.hoisted(() => ({
  createManyMock: vi.fn(),
  findManyMock:   vi.fn(),
  countMock:      vi.fn(),
}))

vi.mock('../../../servicos-global/servicos-plataforma/generated/index.js', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    logRequisicaoApi: {
      createMany: createManyMock,
      findMany:   findManyMock,
      count:      countMock,
    },
  })),
}))

// Bypass requireInternalKey — testa a logica de persistencia, nao a autenticacao S2S
vi.mock('../../../servicos-global/servicos-plataforma/api-cockpit/server/src/middleware/requireInternalKey.js', () => ({
  requireInternalKey: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

// Logger silencioso
vi.mock('../../../servicos-global/servicos-plataforma/middleware/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

// Importacao do router APOS os mocks
const { monitoramentoApiRouter } = await import(
  '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/routes/monitoramento-api'
)

// ─── Setup do app de teste ──────────────────────────────────────────────────

let app: express.Express

beforeAll(() => {
  app = express()
  app.use(express.json())
  app.use(monitoramentoApiRouter)
})

beforeEach(() => {
  createManyMock.mockReset()
  findManyMock.mockReset()
  countMock.mockReset()
})

// ─── Helpers ────────────────────────────────────────────────────────────────

const entradaValida = (over: Partial<Record<string, unknown>> = {}) => ({
  id_organizacao:                          'org_abc',
  id_produto_gravity:                      'gravity-pedido',
  id_usuario:                              'usr_xyz',
  id_api_token:                            'tk_001',
  endpoint_log_requisicao_api:             '/api/v1/pedidos',
  metodo_http_log_requisicao_api:          'POST',
  codigo_resposta_http_log_requisicao_api: 201,
  latencia_ms_log_requisicao_api:          120,
  id_correlacao:                           'corr-uuid-001',
  data_criacao_log_requisicao_api:         '2026-05-07T14:30:00.000Z',
  ...over,
})

// ─── POST /ingestao ─────────────────────────────────────────────────────────

describe('POST /ingestao', () => {
  it('aceita payload valido e responde com quantidade_ingerida + tamanho_buffer', async () => {
    createManyMock.mockResolvedValue({ count: 1 })

    const res = await request(app)
      .post('/ingestao')
      .send({ entries: [entradaValida()] })

    expect(res.status).toBe(200)
    expect(res.body.quantidade_ingerida).toBe(1)
    expect(typeof res.body.tamanho_buffer).toBe('number')
  })

  it('rejeita payload sem id_organizacao com 400 (Zod)', async () => {
    const entrada = entradaValida()
    delete (entrada as Record<string, unknown>).id_organizacao

    const res = await request(app)
      .post('/ingestao')
      .send({ entries: [entrada] })

    expect(res.status).toBe(400)
    expect(res.body.erro).toBe('Payload invalido')
    expect(res.body.issues).toBeDefined()
  })

  it('aceita id_api_token=null (chamadas internas S2S sem token)', async () => {
    createManyMock.mockResolvedValue({ count: 1 })

    const res = await request(app)
      .post('/ingestao')
      .send({ entries: [entradaValida({ id_api_token: null })] })

    expect(res.status).toBe(200)
  })

  it('aceita id_correlacao=null', async () => {
    createManyMock.mockResolvedValue({ count: 1 })

    const res = await request(app)
      .post('/ingestao')
      .send({ entries: [entradaValida({ id_correlacao: null })] })

    expect(res.status).toBe(200)
  })

  it('flush imediato quando >=100 entradas: chama prisma.createMany com payload mapeado', async () => {
    // Marca para identificar somente as entradas deste teste no batch enviado.
    // O buffer e compartilhado entre testes (modulo singleton), entao podem
    // existir leftovers de testes anteriores — verificamos pelo marcador.
    const marcador = `marker-${Date.now()}`
    createManyMock.mockResolvedValue({ count: 100 })
    const entries = Array.from({ length: 100 }, (_, i) =>
      entradaValida({ endpoint_log_requisicao_api: `/api/v1/${marcador}/${i}` })
    )

    await request(app).post('/ingestao').send({ entries })

    // Aguarda o microtask do flush (e fire-and-forget)
    await new Promise((r) => setTimeout(r, 50))

    expect(createManyMock).toHaveBeenCalled()
    const arg = createManyMock.mock.calls[0][0]
    // Pelo menos os 100 deste teste devem estar no batch
    const desteTeste = arg.data.filter((d: { endpoint_log_requisicao_api: string }) =>
      d.endpoint_log_requisicao_api.includes(marcador)
    )
    expect(desteTeste).toHaveLength(100)
    // Verifica que campos foram mapeados corretamente (Date, sufixo DDD, correlacao)
    expect(desteTeste[0].data_criacao_log_requisicao_api).toBeInstanceOf(Date)
    expect(desteTeste[0].endpoint_log_requisicao_api).toBe(`/api/v1/${marcador}/0`)
    expect(desteTeste[0].id_correlacao).toBe('corr-uuid-001')
  })
})

// ─── GET /logs ──────────────────────────────────────────────────────────────

describe('GET /logs', () => {
  it('consulta prisma.findMany e mapeia campos com sufixo novo + derivados (data, hora, resultado)', async () => {
    countMock.mockResolvedValue(1)
    findManyMock.mockResolvedValue([
      {
        id_log_requisicao_api:                   'lreq_abc',
        id_organizacao:                          'org_abc',
        id_produto_gravity:                      'gravity-pedido',
        id_usuario:                              'usr_xyz',
        id_api_token:                            'tk_001',
        id_correlacao:                           'corr-uuid-001',
        endpoint_log_requisicao_api:             '/api/v1/pedidos',
        metodo_http_log_requisicao_api:          'POST',
        codigo_resposta_http_log_requisicao_api: 201,
        latencia_ms_log_requisicao_api:          120,
        data_criacao_log_requisicao_api:         new Date('2026-05-07T14:30:45.123Z'),
      },
    ])

    const res = await request(app).get('/logs')

    expect(res.status).toBe(200)
    expect(res.body.logs).toHaveLength(1)
    const log = res.body.logs[0]

    // Campos persistidos com sufixo novo
    expect(log.id_log_requisicao_api).toBe('lreq_abc')
    expect(log.endpoint_log_requisicao_api).toBe('/api/v1/pedidos')
    expect(log.codigo_resposta_http_log_requisicao_api).toBe(201)

    // Derivados pre-computados
    expect(log.data_log_requisicao_api).toBe('2026-05-07')
    expect(log.hora_log_requisicao_api).toBe('14:30:45')
    expect(log.resultado_log_requisicao_api).toBe('SUCESSO')

    // Paginacao
    expect(res.body.paginacao).toEqual({
      pagina:  1,
      limite:  50,
      total:   1,
      paginas: 1,
    })
  })

  it('classifica codigo HTTP em SUCESSO / ERRO_CLIENTE / ERRO_SERVIDOR', async () => {
    countMock.mockResolvedValue(3)
    findManyMock.mockResolvedValue([
      { id_log_requisicao_api: 'l1', codigo_resposta_http_log_requisicao_api: 200, data_criacao_log_requisicao_api: new Date('2026-05-07T14:30:00Z'), id_organizacao: 'o', id_produto_gravity: null, id_usuario: null, id_api_token: null, id_correlacao: null, endpoint_log_requisicao_api: '/a', metodo_http_log_requisicao_api: 'GET', latencia_ms_log_requisicao_api: 10 },
      { id_log_requisicao_api: 'l2', codigo_resposta_http_log_requisicao_api: 404, data_criacao_log_requisicao_api: new Date('2026-05-07T14:30:00Z'), id_organizacao: 'o', id_produto_gravity: null, id_usuario: null, id_api_token: null, id_correlacao: null, endpoint_log_requisicao_api: '/a', metodo_http_log_requisicao_api: 'GET', latencia_ms_log_requisicao_api: 10 },
      { id_log_requisicao_api: 'l3', codigo_resposta_http_log_requisicao_api: 500, data_criacao_log_requisicao_api: new Date('2026-05-07T14:30:00Z'), id_organizacao: 'o', id_produto_gravity: null, id_usuario: null, id_api_token: null, id_correlacao: null, endpoint_log_requisicao_api: '/a', metodo_http_log_requisicao_api: 'GET', latencia_ms_log_requisicao_api: 10 },
    ])

    const res = await request(app).get('/logs')

    expect(res.body.logs[0].resultado_log_requisicao_api).toBe('SUCESSO')
    expect(res.body.logs[1].resultado_log_requisicao_api).toBe('ERRO_CLIENTE')
    expect(res.body.logs[2].resultado_log_requisicao_api).toBe('ERRO_SERVIDOR')
  })

  it('aplica filtro id_organizacao na query', async () => {
    countMock.mockResolvedValue(0)
    findManyMock.mockResolvedValue([])

    await request(app).get('/logs?id_organizacao=org_xyz')

    const arg = findManyMock.mock.calls[0][0]
    expect(arg.where.id_organizacao).toBe('org_xyz')
  })

  it('aplica filtro de faixa HTTP (codigo_resposta_http_minimo/maximo)', async () => {
    countMock.mockResolvedValue(0)
    findManyMock.mockResolvedValue([])

    await request(app).get('/logs?codigo_resposta_http_minimo=400&codigo_resposta_http_maximo=499')

    const arg = findManyMock.mock.calls[0][0]
    expect(arg.where.codigo_resposta_http_log_requisicao_api).toEqual({ gte: 400, lte: 499 })
  })

  it('paginacao: pagina=2 limite=25 traduz pra skip=25 take=25', async () => {
    countMock.mockResolvedValue(0)
    findManyMock.mockResolvedValue([])

    await request(app).get('/logs?pagina=2&limite=25')

    const arg = findManyMock.mock.calls[0][0]
    expect(arg.skip).toBe(25)
    expect(arg.take).toBe(25)
  })
})
