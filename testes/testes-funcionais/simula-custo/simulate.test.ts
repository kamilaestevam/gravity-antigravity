// @vitest-environment node
// testes/testes-funcionais/simula-custo/simulate.test.ts
// Testes funcionais — rota POST /api/v1/simula-custo (simulação fiscal)
//
// Estratégia: mock do Prisma, BACEN e CapSolver (sem dependência externa em CI).

import { describe, it, expect, vi, beforeAll } from 'vitest'
import request from 'supertest'
import express from 'express'

// Mock do Prisma
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    $queryRaw: vi.fn().mockResolvedValue([{ ok: 1 }]),
    $disconnect: vi.fn(),
    estimativa: {
      create: vi.fn().mockResolvedValue({ id: 'test-id' }),
      findMany: vi.fn().mockResolvedValue([]),
    },
  }
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  }
})

// Mock BACEN connector
vi.mock('../../../produto/simula-custo/server/src/connectors/bacen', () => ({
  getLatestPtax: vi.fn().mockResolvedValue({ venda: 5.925, compra: 5.91 }),
}))

// Mock token pool (singleton export)
vi.mock('../../../produto/simula-custo/server/src/services/tokenPool', () => ({
  TokenPoolService: vi.fn(),
  tokenPool: {
    getToken: vi.fn().mockResolvedValue('MOCK_HCAPTCHA_TOKEN'),
    start: vi.fn(),
  },
}))

// Mock Siscomex connector (singleton instance)
vi.mock('../../../produto/simula-custo/server/src/connectors/siscomex', () => ({
  siscomex: {
    simularCalculoPublico: vi.fn().mockResolvedValue(null),
    getNcmDetail: vi.fn().mockResolvedValue(null),
  },
  SiscomexConnector: vi.fn(),
}))

import { simulateRouter } from '../../../produto/simula-custo/server/src/routes/simulate'

describe('SimulaCusto — POST /api/v1/simula-custo', () => {
  let app: express.Express

  beforeAll(() => {
    app = express()
    app.use(express.json())

    // Simular middleware de tenant isolation
    app.use((req: any, _res, next) => {
      req.tenantId = 'tenant-teste-001'
      next()
    })

    app.use('/api/v1/simula-custo', simulateRouter)
  })

  const validPayload = {
    ncm: '84713019',
    paisOrigem: 'US',
    dataFatoGerador: '2026-03-22',
    valorProduto: 1000,
    moedaProduto: 'USD',
    freteInter: 0,
    moedaFrete: 'USD',
    seguroInter: 0,
    moedaSeguro: 'USD',
    taxasOrigem: [],
    taxasDestino: [],
    ufDesembaraco: 'SP',
    aliquotaII: 0.16,
    aliquotaIPI: 0,
    aliquotaPIS: 0.021,
    aliquotaCOFINS: 0.0965,
    aliquotaICMS: 0.18,
  }

  it('deve retornar 200 com cálculo fiscal completo', async () => {
    const res = await request(app)
      .post('/api/v1/simula-custo')
      .send(validPayload)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
    expect(res.body.data.landedCostBRL).toBeGreaterThan(0)
    expect(res.body.data.tributos).toBeDefined()
    expect(res.body.data.tributos.ii).toBeDefined()
    expect(res.body.data.tributos.icms).toBeDefined()
  })

  it('deve rejeitar payload sem NCM', async () => {
    const res = await request(app)
      .post('/api/v1/simula-custo')
      .send({ ...validPayload, ncm: undefined })

    expect(res.status).toBe(400)
  })

  it('deve rejeitar payload sem valorProduto', async () => {
    const res = await request(app)
      .post('/api/v1/simula-custo')
      .send({ ...validPayload, valorProduto: undefined })

    expect(res.status).toBe(400)
  })

  it('deve usar fallback local quando Siscomex indisponível', async () => {
    const res = await request(app)
      .post('/api/v1/simula-custo')
      .send(validPayload)

    expect(res.status).toBe(200)
    expect(res.body.source).toBe('local_engine')
  })

  it('deve calcular com redução de II para acordos comerciais', async () => {
    const res = await request(app)
      .post('/api/v1/simula-custo')
      .send({
        ...validPayload,
        paisOrigem: 'AR',
        reducaoII: 1.0,
      })

    expect(res.status).toBe(200)
    expect(res.body.data.tributos.ii.valor).toBe(0)
  })
})
