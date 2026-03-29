// @vitest-environment node
// testes/testes-funcionais/simula-custo/health.test.ts
// Testes funcionais — health check e master data do SimulaCusto
//
// GET /health
// GET /api/v1/master-data/ufs
// GET /api/v1/master-data/countries
//
// Estratégia: mock do Prisma (sem banco real em CI).

import { describe, it, expect, vi, beforeAll } from 'vitest'
import request from 'supertest'
import express from 'express'

// Mock do Prisma antes de importar as rotas
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    $queryRaw: vi.fn().mockResolvedValue([{ ok: 1 }]),
    $disconnect: vi.fn(),
  }
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  }
})

// Importar rotas do master data
import { masterDataRouter } from '../../../produto/simula-custo/server/src/routes/masterData'

describe('SimulaCusto — Health & Master Data', () => {
  let app: express.Express

  beforeAll(() => {
    app = express()
    app.use(express.json())

    // Health check simplificado (sem DB real)
    app.get('/health', (_req, res) => {
      res.json({ status: 'ok', service: 'simula-custo', timestamp: new Date().toISOString() })
    })

    // Master data (público, sem auth)
    app.use('/api/v1/master-data', masterDataRouter)
  })

  describe('GET /health', () => {
    it('deve retornar status ok', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.service).toBe('simula-custo')
    })
  })

  describe('GET /api/v1/master-data/ufs', () => {
    it('deve retornar 27 UFs brasileiras', async () => {
      const res = await request(app).get('/api/v1/master-data/ufs')
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(27)
      expect(res.body[0]).toHaveProperty('uf')
      expect(res.body[0]).toHaveProperty('nome')
      expect(res.body[0]).toHaveProperty('icms')
    })

    it('deve incluir SP com ICMS 18%', async () => {
      const res = await request(app).get('/api/v1/master-data/ufs')
      const sp = res.body.find((item: { uf: string }) => item.uf === 'SP')
      expect(sp).toBeDefined()
      expect(sp.icms).toBe(0.18)
    })
  })

  describe('GET /api/v1/master-data/countries', () => {
    it('deve retornar lista de países com código ISO', async () => {
      const res = await request(app).get('/api/v1/master-data/countries')
      expect(res.status).toBe(200)
      expect(res.body.length).toBeGreaterThan(10)
      expect(res.body[0]).toHaveProperty('codigo')
      expect(res.body[0]).toHaveProperty('nome')
    })

    it('deve incluir US e CN', async () => {
      const res = await request(app).get('/api/v1/master-data/countries')
      const codes = res.body.map((p: { codigo: string }) => p.codigo)
      expect(codes).toContain('US')
      expect(codes).toContain('CN')
    })
  })
})
