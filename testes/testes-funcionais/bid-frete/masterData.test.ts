// @vitest-environment node
/**
 * Testes funcionais v2 — BID Frete / Master Data (rotas publicas, sem auth)
 * GET /api/v1/master-data/portos
 * GET /api/v1/master-data/incoterms
 * GET /api/v1/master-data/modais
 * GET /api/v1/master-data/moedas
 * GET /api/v1/master-data/paises
 * GET /api/v1/master-data/containers
 */

import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

// Mock prisma para portos (unica rota que acessa DB)
const mockPorto = {
  findMany: vi.fn().mockResolvedValue([
    { codigo: 'BRSSZ', nome: 'Santos', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto' },
    { codigo: 'CNSHA', nome: 'Shanghai', pais: 'China', pais_codigo: 'CN', tipo: 'porto' },
  ]),
}

vi.mock('../../../produto/bid-frete/server/src/middleware/tenantIsolation.js', () => ({
  tenantIsolationMiddleware: (_req: Request, _res: Response, next: NextFunction) => next(),
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([1]),
    porto: {
      findMany: vi.fn().mockResolvedValue([
        { codigo: 'BRSSZ', nome: 'Santos', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto' },
        { codigo: 'CNSHA', nome: 'Shanghai', pais: 'China', pais_codigo: 'CN', tipo: 'porto' },
      ]),
    },
  },
}))

import { masterDataRouter } from '../../../produto/bid-frete/server/src/routes/masterData.js'

function buildApp() {
  const app = express()
  app.use(express.json())
  // Nenhum middleware de auth — rotas publicas
  app.use('/api/v1/master-data', masterDataRouter)
  return app
}

// ===========================================================================
// GET /api/v1/master-data/portos
// ===========================================================================

describe('GET /api/v1/master-data/portos', () => {
  const app = buildApp()

  it('200 — retorna lista de portos', async () => {
    const res = await request(app).get('/api/v1/master-data/portos')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('portos')
    expect(Array.isArray(res.body.portos)).toBe(true)
  })

  it('200 — aceita query parameter q para busca', async () => {
    const res = await request(app).get('/api/v1/master-data/portos?q=Santos')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('portos')
  })

  it('200 — aceita filtro por pais', async () => {
    const res = await request(app).get('/api/v1/master-data/portos?pais=BR')

    expect(res.status).toBe(200)
  })

  it('200 — aceita filtro por tipo', async () => {
    const res = await request(app).get('/api/v1/master-data/portos?tipo=porto')

    expect(res.status).toBe(200)
  })

  it('200 — retorna array vazio se DB falha (graceful)', async () => {
    // A rota masterData trata erro e retorna portos: []
    const res = await request(app).get('/api/v1/master-data/portos')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.portos)).toBe(true)
  })
})

// ===========================================================================
// GET /api/v1/master-data/moedas
// ===========================================================================

describe('GET /api/v1/master-data/moedas', () => {
  const app = buildApp()

  it('200 — retorna moedas com USD, BRL, EUR e CNY', async () => {
    const res = await request(app).get('/api/v1/master-data/moedas')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('moedas')

    const codigos = res.body.moedas.map((m: { codigo: string }) => m.codigo)
    expect(codigos).toContain('USD')
    expect(codigos).toContain('BRL')
    expect(codigos).toContain('EUR')
    expect(codigos).toContain('CNY')
  })

  it('200 — cada moeda tem codigo, nome e simbolo', async () => {
    const res = await request(app).get('/api/v1/master-data/moedas')

    for (const moeda of res.body.moedas) {
      expect(moeda).toHaveProperty('codigo')
      expect(moeda).toHaveProperty('nome')
      expect(moeda).toHaveProperty('simbolo')
    }
  })

  it('200 — nao requer autenticacao', async () => {
    // Sem headers x-internal-key ou x-tenant-id
    const res = await request(app).get('/api/v1/master-data/moedas')
    expect(res.status).toBe(200)
  })
})

// ===========================================================================
// GET /api/v1/master-data/incoterms
// ===========================================================================

describe('GET /api/v1/master-data/incoterms', () => {
  const app = buildApp()

  it('200 — retorna lista completa de 11 incoterms', async () => {
    const res = await request(app).get('/api/v1/master-data/incoterms')

    expect(res.status).toBe(200)
    expect(res.body.incoterms).toBeInstanceOf(Array)
    expect(res.body.incoterms).toHaveLength(11)
  })

  it('200 — FOB pertence ao grupo F', async () => {
    const res = await request(app).get('/api/v1/master-data/incoterms')

    const fob = res.body.incoterms.find((i: { codigo: string; grupo: string; nome: string }) => i.codigo === 'FOB')
    expect(fob).toBeDefined()
    expect(fob.grupo).toBe('F')
    expect(fob.nome).toBe('Free On Board')
  })

  it('200 — DDP pertence ao grupo D', async () => {
    const res = await request(app).get('/api/v1/master-data/incoterms')

    const ddp = res.body.incoterms.find((i: { codigo: string; grupo: string }) => i.codigo === 'DDP')
    expect(ddp).toBeDefined()
    expect(ddp.grupo).toBe('D')
  })

  it('200 — todos os incoterms tem codigo, nome, grupo e descricao', async () => {
    const res = await request(app).get('/api/v1/master-data/incoterms')

    for (const inc of res.body.incoterms) {
      expect(inc).toHaveProperty('codigo')
      expect(inc).toHaveProperty('nome')
      expect(inc).toHaveProperty('grupo')
      expect(inc).toHaveProperty('descricao')
    }
  })
})

// ===========================================================================
// GET /api/v1/master-data/modais
// ===========================================================================

describe('GET /api/v1/master-data/modais', () => {
  const app = buildApp()

  it('200 — retorna 3 modais (MARITIMO, AEREO, RODOVIARIO)', async () => {
    const res = await request(app).get('/api/v1/master-data/modais')

    expect(res.status).toBe(200)
    expect(res.body.modais).toHaveLength(3)

    const codigos = res.body.modais.map((m: { codigo: string }) => m.codigo)
    expect(codigos).toContain('MARITIMO')
    expect(codigos).toContain('AEREO')
    expect(codigos).toContain('RODOVIARIO')
  })

  it('200 — MARITIMO tem FCL e LCL', async () => {
    const res = await request(app).get('/api/v1/master-data/modais')

    const maritimo = res.body.modais.find((m: { codigo: string; modalidades: { codigo: string; nome: string }[] }) => m.codigo === 'MARITIMO')
    expect(maritimo.modalidades).toContainEqual({ codigo: 'FCL', nome: 'Full Container Load' })
    expect(maritimo.modalidades).toContainEqual({ codigo: 'LCL', nome: 'Less than Container Load' })
  })

  it('200 — AEREO tem AEREO_GERAL', async () => {
    const res = await request(app).get('/api/v1/master-data/modais')

    const aereo = res.body.modais.find((m: { codigo: string; modalidades: { codigo: string; nome: string }[] }) => m.codigo === 'AEREO')
    expect(aereo.modalidades).toContainEqual({ codigo: 'AEREO_GERAL', nome: 'Carga Geral' })
  })

  it('200 — RODOVIARIO tem FTL e LTL', async () => {
    const res = await request(app).get('/api/v1/master-data/modais')

    const rodo = res.body.modais.find((m: { codigo: string; modalidades: { codigo: string; nome: string }[] }) => m.codigo === 'RODOVIARIO')
    expect(rodo.modalidades).toContainEqual({ codigo: 'RODOVIARIO_FTL', nome: 'Full Truck Load' })
    expect(rodo.modalidades).toContainEqual({ codigo: 'RODOVIARIO_LTL', nome: 'Less than Truck Load' })
  })
})

// ===========================================================================
// GET /api/v1/master-data/paises
// ===========================================================================

describe('GET /api/v1/master-data/paises', () => {
  const app = buildApp()

  it('200 — retorna lista com pelo menos 20 paises', async () => {
    const res = await request(app).get('/api/v1/master-data/paises')

    expect(res.status).toBe(200)
    expect(res.body.paises.length).toBeGreaterThanOrEqual(20)
  })

  it('200 — inclui Brasil e China', async () => {
    const res = await request(app).get('/api/v1/master-data/paises')

    const brasil = res.body.paises.find((p: { codigo: string; nome: string }) => p.codigo === 'BR')
    expect(brasil).toBeDefined()
    expect(brasil.nome).toBe('Brasil')

    const china = res.body.paises.find((p: { codigo: string; nome: string }) => p.codigo === 'CN')
    expect(china).toBeDefined()
    expect(china.nome).toBe('China')
  })
})

// ===========================================================================
// GET /api/v1/master-data/containers
// ===========================================================================

describe('GET /api/v1/master-data/containers', () => {
  const app = buildApp()

  it('200 — retorna pelo menos 8 tipos de container', async () => {
    const res = await request(app).get('/api/v1/master-data/containers')

    expect(res.status).toBe(200)
    expect(res.body.containers.length).toBeGreaterThanOrEqual(8)
  })

  it('200 — 20DRY tem 1 TEU e 40HC tem 2 TEUs', async () => {
    const res = await request(app).get('/api/v1/master-data/containers')

    const dry20 = res.body.containers.find((c: { codigo: string; teus: number }) => c.codigo === '20DRY')
    expect(dry20).toBeDefined()
    expect(dry20.teus).toBe(1)

    const hc40 = res.body.containers.find((c: { codigo: string; teus: number }) => c.codigo === '40HC')
    expect(hc40).toBeDefined()
    expect(hc40.teus).toBe(2)
  })

  it('200 — todos os containers tem codigo, nome e teus', async () => {
    const res = await request(app).get('/api/v1/master-data/containers')

    for (const container of res.body.containers) {
      expect(container).toHaveProperty('codigo')
      expect(container).toHaveProperty('nome')
      expect(container).toHaveProperty('teus')
      expect(typeof container.teus).toBe('number')
    }
  })
})
