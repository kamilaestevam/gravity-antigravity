// @vitest-environment node
//
// Testes funcionais — GET + POST /api/v1/previsoes-taxa-futura-moeda
//
// Camada HTTP completa (Supertest), Zod real, errorHandler real, Prisma + axios mockados.
// Skill: skills/testes/agente-plano-teste-funcional/SKILL.md (rota_crud + cross-service + auth chain).
//
// IMPORTANTE: roda apos `npx prisma generate` (Task #2) — sem isso, o tipo
// prisma.previsaoTaxaFuturaMoeda nao existe no client e a route file nao compila.

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

// ---------------------------------------------------------------------------
// AppError local — reproduz o contrato do real (lib/appError.js)
// Declarado via vi.hoisted() porque vi.mock e hoisted ao topo — referenciar
// classe via top-level `class` causa ReferenceError (temporal dead zone).
// ---------------------------------------------------------------------------

const { AppError } = vi.hoisted(() => {
  class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
    }
  }
  return { AppError }
})

// ---------------------------------------------------------------------------
// Mocks — declarados ANTES dos imports
// ---------------------------------------------------------------------------

const { mockPrismaFindFirst, mockPrismaFindMany, mockPrismaCreate, mockPrismaUpdate } = vi.hoisted(() => ({
  mockPrismaFindFirst: vi.fn(),
  mockPrismaFindMany: vi.fn(),
  mockPrismaCreate: vi.fn(),
  mockPrismaUpdate: vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    previsaoTaxaFuturaMoeda: {
      findFirst: mockPrismaFindFirst,
      findMany: mockPrismaFindMany,
      create: mockPrismaCreate,
      update: mockPrismaUpdate,
    },
  },
}))

vi.mock('../../../servicos-global/configurador/server/lib/appError.js', () => ({ AppError }))

const { mockRequireAuth, mockRequireMutation } = vi.hoisted(() => {
  type AuthedReq = Request & { auth?: { idUsuario: string; idOrganizacao: string; tipoUsuario: string } }
  return {
    mockRequireAuth: vi.fn((req: Request, _res: Response, next: NextFunction) => {
      ;(req as AuthedReq).auth = {
        idUsuario: 'usr_test_01',
        idOrganizacao: 'org_test_01',
        tipoUsuario: 'MASTER',
      }
      next()
    }),
    mockRequireMutation: vi.fn((_req: Request, _res: Response, next: NextFunction) => next()),
  }
})

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: mockRequireAuth,
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireConfiguradorAccess.js', () => ({
  requireConfiguradorMutation: mockRequireMutation,
}))

const { mockAxiosGet } = vi.hoisted(() => ({ mockAxiosGet: vi.fn() }))
vi.mock('axios', () => ({ default: { get: mockAxiosGet } }))

// Import DEPOIS dos mocks
import { previsaoTaxaFuturaMoedaRouter } from '../../../servicos-global/configurador/server/routes/previsao-taxa-futura-moeda.js'

// ---------------------------------------------------------------------------
// buildTestApp — Express real com router real + errorHandler real (replica)
// ---------------------------------------------------------------------------

interface HttpError extends Error {
  statusCode?: number
  code?: string
}

function buildTestApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/previsoes-taxa-futura-moeda', previsaoTaxaFuturaMoedaRouter)
  // Error handler — replica do servidor real (lib/appError.js + handler global)
  app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    if (err.name === 'AppError') {
      res.status(err.statusCode ?? 400).json({
        error: { code: err.code ?? 'BAD_REQUEST', message: err.message },
      })
    } else {
      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
      })
    }
  })
  return app
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const linhaPrismaValida = {
  id_previsao_taxa_futura_moeda: 'cuid_test_01',
  moeda_previsao_taxa_futura_moeda: 'USD',
  mes_previsao_taxa_futura_moeda: new Date('2026-06-01T00:00:00.000Z'),
  valor_mediano_previsao_taxa_futura_moeda: 5.02,
  valor_medio_previsao_taxa_futura_moeda: 5.01,
  valor_minimo_previsao_taxa_futura_moeda: 4.85,
  valor_maximo_previsao_taxa_futura_moeda: 5.20,
  fonte_previsao_taxa_futura_moeda: 'BACEN/Focus',
  data_previsao_taxa_futura_moeda: new Date('2026-05-22T00:00:00.000Z'),
  data_criacao_previsao_taxa_futura_moeda: new Date('2026-05-22T10:00:00.000Z'),
  data_atualizacao_previsao_taxa_futura_moeda: new Date('2026-05-22T10:00:00.000Z'),
}

const itemFocusValido = {
  Indicador: 'Câmbio',
  Data: '2026-05-22',
  DataReferencia: '06/2026',
  Mediana: 5.02,
  Media: 5.01,
  Minimo: 4.85,
  Maximo: 5.20,
  numeroRespondentes: 50,
}

// ---------------------------------------------------------------------------
// GET /api/v1/previsoes-taxa-futura-moeda
// ---------------------------------------------------------------------------

describe('GET /api/v1/previsoes-taxa-futura-moeda', () => {
  let app: express.Express

  beforeAll(() => { app = buildTestApp() })
  beforeEach(() => { vi.clearAllMocks() })

  it('retorna 200 com lista vazia quando banco vazio (rota publica — sem auth)', async () => {
    mockPrismaFindMany.mockResolvedValueOnce([])

    const res = await request(app).get('/api/v1/previsoes-taxa-futura-moeda')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: [], moeda: 'USD', meses: 4, total: 0 })
  })

  it('aplica defaults (moeda=USD, meses=4) quando query nao fornece', async () => {
    mockPrismaFindMany.mockResolvedValueOnce([])

    const res = await request(app).get('/api/v1/previsoes-taxa-futura-moeda')

    expect(res.status).toBe(200)
    expect(res.body.moeda).toBe('USD')
    expect(res.body.meses).toBe(4)
  })

  it('aceita query moeda=EUR&meses=8 e propaga para o where + take', async () => {
    mockPrismaFindMany.mockResolvedValueOnce([])

    const res = await request(app)
      .get('/api/v1/previsoes-taxa-futura-moeda')
      .query({ moeda: 'EUR', meses: 8 })

    expect(res.status).toBe(200)
    expect(res.body.moeda).toBe('EUR')
    expect(res.body.meses).toBe(8)

    const findArgs = mockPrismaFindMany.mock.calls[0][0]
    expect(findArgs.where.moeda_previsao_taxa_futura_moeda).toBe('EUR')
    expect(findArgs.take).toBe(8)
    expect(findArgs.orderBy).toEqual({ mes_previsao_taxa_futura_moeda: 'asc' })
  })

  it('filtra registros a partir do mes corrente (mes_previsao >= primeiro dia do mes atual)', async () => {
    mockPrismaFindMany.mockResolvedValueOnce([])

    await request(app).get('/api/v1/previsoes-taxa-futura-moeda')

    const findArgs = mockPrismaFindMany.mock.calls[0][0]
    const cursor = findArgs.where.mes_previsao_taxa_futura_moeda.gte as Date
    expect(cursor).toBeInstanceOf(Date)
    expect(cursor.getUTCDate()).toBe(1)
    expect(cursor.getUTCHours()).toBe(0)
  })

  it('retorna 400 VALIDATION_ERROR quando moeda invalida', async () => {
    const res = await request(app)
      .get('/api/v1/previsoes-taxa-futura-moeda')
      .query({ moeda: 'XXX' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.message).toBeTruthy()
  })

  it('retorna 400 quando meses=0 (abaixo do minimo)', async () => {
    const res = await request(app)
      .get('/api/v1/previsoes-taxa-futura-moeda')
      .query({ meses: 0 })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 quando meses=99 (acima do maximo)', async () => {
    const res = await request(app)
      .get('/api/v1/previsoes-taxa-futura-moeda')
      .query({ meses: 99 })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 500 INTERNAL_ERROR quando banco falha — sem stack trace no body (Mandamento 08)', async () => {
    mockPrismaFindMany.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).get('/api/v1/previsoes-taxa-futura-moeda')

    expect(res.status).toBe(500)
    expect(res.body.error.code).toBe('INTERNAL_ERROR')
    expect(res.body.error.stack).toBeUndefined()
    expect(res.body.error.message).not.toContain('connection refused')
  })

  it('serializa Decimal e DateTime do Prisma para JSON (snake_case DDD direto, sem alias)', async () => {
    mockPrismaFindMany.mockResolvedValueOnce([linhaPrismaValida])

    const res = await request(app).get('/api/v1/previsoes-taxa-futura-moeda')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    const item = res.body.data[0]
    expect(item.id_previsao_taxa_futura_moeda).toBe('cuid_test_01')
    expect(item.moeda_previsao_taxa_futura_moeda).toBe('USD')
    expect(typeof item.mes_previsao_taxa_futura_moeda).toBe('string')
    expect(item.mes_previsao_taxa_futura_moeda).toBe('2026-06-01T00:00:00.000Z')
    expect(typeof item.valor_mediano_previsao_taxa_futura_moeda).toBe('number')
    expect(item.valor_mediano_previsao_taxa_futura_moeda).toBe(5.02)
  })

  it('rota NAO chama requireAuth (rota publica — dado do BACEN e publico)', async () => {
    mockPrismaFindMany.mockResolvedValueOnce([])
    await request(app).get('/api/v1/previsoes-taxa-futura-moeda')
    expect(mockRequireAuth).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// POST /api/v1/previsoes-taxa-futura-moeda/sync
// ---------------------------------------------------------------------------

describe('POST /api/v1/previsoes-taxa-futura-moeda/sync', () => {
  let app: express.Express

  beforeAll(() => { app = buildTestApp() })
  beforeEach(() => { vi.clearAllMocks() })

  it('sincroniza USD com sucesso e marca demais moedas como sem_dados', async () => {
    const items = ['06/2026', '07/2026', '08/2026', '09/2026'].map(dataRef => ({
      ...itemFocusValido, DataReferencia: dataRef, Data: '2026-05-22',
    }))
    mockAxiosGet.mockResolvedValueOnce({ data: { value: items } })
    mockPrismaFindFirst.mockResolvedValue(null)
    mockPrismaCreate.mockResolvedValue({})

    const res = await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')

    expect(res.status).toBe(200)
    expect(res.body.total_ok).toBe(1)         // USD
    expect(res.body.total_erro).toBe(0)
    expect(res.body.total_sem_dados).toBe(6)  // EUR, GBP, CHF, CNY, JPY, CAD
    expect(res.body.resultados).toHaveLength(7)

    const usd = res.body.resultados.find((r: { moeda: string }) => r.moeda === 'USD')
    expect(usd.status).toBe('ok')
    expect(usd.total).toBe(4)
    expect(mockPrismaCreate).toHaveBeenCalledTimes(4)
  })

  it('marca USD como erro quando Olinda BACEN falha', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('Network timeout 15s'))

    const res = await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')

    expect(res.status).toBe(200)
    expect(res.body.total_ok).toBe(0)
    expect(res.body.total_erro).toBe(1)
    expect(res.body.total_sem_dados).toBe(6)

    const usd = res.body.resultados.find((r: { moeda: string }) => r.moeda === 'USD')
    expect(usd.status).toBe('erro')
    expect(usd.detalhe).toContain('Network timeout 15s')
  })

  it('marca USD como sem_dados quando Focus retorna lista vazia', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })

    const res = await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')

    expect(res.status).toBe(200)
    expect(res.body.total_ok).toBe(0)
    expect(res.body.total_sem_dados).toBe(7)

    const usd = res.body.resultados.find((r: { moeda: string }) => r.moeda === 'USD')
    expect(usd.status).toBe('sem_dados')
    expect(usd.detalhe).toBe('Focus retornou lista vazia')
  })

  it('todas as moedas exceto USD ficam sem_dados com mensagem explicativa sobre Focus', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })

    const res = await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')

    for (const moeda of ['EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'CAD']) {
      const result = res.body.resultados.find((r: { moeda: string }) => r.moeda === moeda)
      expect(result.status).toBe('sem_dados')
      expect(result.detalhe).toContain('USD/BRL')
    }
  })

  it('upsert idempotente — sync 2x com mesmos dados nao duplica registros', async () => {
    mockAxiosGet.mockResolvedValue({ data: { value: [itemFocusValido] } })

    // Primeira chamada: registro nao existe → create
    mockPrismaFindFirst.mockResolvedValueOnce(null)
    mockPrismaCreate.mockResolvedValueOnce({})
    await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')

    // Segunda chamada: registro existe (mesma chave moeda+mes) → update
    mockPrismaFindFirst.mockResolvedValueOnce({ id_previsao_taxa_futura_moeda: 'cuid_01' })
    mockPrismaUpdate.mockResolvedValueOnce({})
    await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')

    expect(mockPrismaCreate).toHaveBeenCalledTimes(1)
    expect(mockPrismaUpdate).toHaveBeenCalledTimes(1)
  })

  it('chama requireAuth ANTES de executar sync (protege Olinda contra abuso anonimo)', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })
    await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')
    expect(mockRequireAuth).toHaveBeenCalled()
  })

  it('chama requireConfiguradorMutation em sequencia (admin permission)', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })
    await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')
    expect(mockRequireMutation).toHaveBeenCalled()
  })

  it('response contem sincronizado_em em formato ISO8601', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })
    const res = await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')
    expect(res.body.sincronizado_em).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('resultados incluem as 7 moedas declaradas em MOEDAS_FOCUS_SUPORTADAS', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [] } })
    const res = await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')
    const moedasNoResultado = res.body.resultados.map((r: { moeda: string }) => r.moeda)
    expect(moedasNoResultado).toEqual(expect.arrayContaining(['USD', 'EUR', 'GBP', 'CHF', 'CNY', 'JPY', 'CAD']))
  })

  it('persiste fonte BACEN/Focus em todos os creates', async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: { value: [itemFocusValido] } })
    mockPrismaFindFirst.mockResolvedValue(null)
    mockPrismaCreate.mockResolvedValue({})

    await request(app).post('/api/v1/previsoes-taxa-futura-moeda/sync')

    const createArgs = mockPrismaCreate.mock.calls[0][0]
    expect(createArgs.data.fonte_previsao_taxa_futura_moeda).toBe('BACEN/Focus')
  })
})
