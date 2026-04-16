// server/__tests__/admin-test-endpoints.test.ts
// Testes funcionais para os endpoints de teste em admin.ts
// Usa supertest para testar rotas HTTP reais

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import express from 'express'
import { adminRouter } from '../routes/admin.js'
import supertest from 'supertest'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'

// Mock fs para controlar arquivos de test-logs
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn().mockReturnValue('[]'),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
  }
})

// Mock child_process (para run-tests e pentest)
vi.mock('child_process', () => ({
  spawn: vi.fn().mockReturnValue({
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
    on: vi.fn(),
  }),
}))

// Mock gemini modules
vi.mock('../lib/gemini-test-analyzer.js', () => ({
  analyzeTestFailure: vi.fn().mockResolvedValue({
    erroResumo: 'Botão não encontrado',
    motivo: 'O seletor não casa mais com o elemento renderizado no componente da tela.',
    sugestaoCorrecao: 'Atualizar o seletor para o novo testid',
    arquivo: 'test.spec.ts:10',
    codigoDiff: null,
    categoria: 'TESTE_DESATUALIZADO',
    confianca: 'media',
    commitSuspeito: null,
  }),
  getMetrics: vi.fn().mockReturnValue({
    cacheSize: 5,
    cacheHits: 10,
    cacheMisses: 3,
    hitRate: 77,
  }),
}))

vi.mock('../lib/agente-plano-teste.js', () => ({
  generateTestPlan: vi.fn().mockResolvedValue({
    id: 'TST-E2E-CONFIG-000099',
    passos: [{ numero: 1, acao: 'teste' }],
    coberturaPercentual: 90,
  }),
  expandTestPlan: vi.fn().mockResolvedValue({
    id: 'TST-E2E-CONFIG-000001',
    passos: [{ numero: 1 }, { numero: 2 }],
    coberturaPercentual: 95,
  }),
}))

vi.mock('../lib/gerador-specs.js', () => ({
  generateAndSaveSpec: vi.fn().mockReturnValue('testes/testes-e2e/config/test.spec.ts'),
}))

vi.mock('../lib/extrator-testids.js', () => ({
  generateTestidMapping: vi.fn().mockReturnValue({
    componente: 'src/pages/Org.tsx',
    extraidoEm: '2026-04-15T14:30:00Z',
    elementos: {},
  }),
}))

// ─── Setup ───────────────────────────────────────────────────────────────────

let app: express.Express
let request: ReturnType<typeof supertest>

beforeAll(() => {
  app = express()
  app.use(express.json())

  // Simula middleware de auth (já mockado no setup.ts)
  app.use('/api/admin', adminRouter)

  // Error handler
  app.use((err: { statusCode?: number; code?: string; message: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.statusCode ?? 500).json({
      error: { code: err.code ?? 'INTERNAL', message: err.message },
    })
  })

  request = supertest(app)
})

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── GET /admin/testes-gerais/logs ───────────────────────────────────────────

describe('GET /api/admin/testes-gerais/logs', () => {
  it('retorna 200 com array de logs', async () => {
    const res = await request.get('/api/admin/testes-gerais/logs')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('logs')
    expect(Array.isArray(res.body.logs)).toBe(true)
  })
})

// ─── POST /admin/testes-gerais/logs ──────────────────────────────────────────

describe('POST /api/admin/testes-gerais/logs', () => {
  it('aceita batch válido e retorna 201', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/logs')
      .send({
        entries: [{
          type: 'E2E',
          module: 'configurador',
          test_name: 'Teste de login',
          result: 'APROVADO',
          duration: '150ms',
        }],
      })
    expect(res.status).toBe(201)
    expect(res.body.ok).toBe(true)
    expect(res.body.saved).toBe(1)
  })

  it('rejeita payload sem entries', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/logs')
      .send({})
    expect(res.status).toBe(400)
  })

  it('rejeita resultado inválido', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/logs')
      .send({
        entries: [{
          type: 'E2E',
          module: 'test',
          test_name: 'x',
          result: 'INVALIDO',
          duration: '0ms',
        }],
      })
    expect(res.status).toBe(400)
  })
})

// ─── POST /admin/testes-gerais/plans/generate ───────────────────────────────

describe('POST /api/admin/testes-gerais/plans/generate', () => {
  it('gera plano e retorna 201', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/plans/generate')
      .send({
        escopo: 'CONFIG',
        sublocal: 'TestGeracao',
        tela: 'Teste Geração',
        rota: '/workspace/teste',
        componenteFilePath: 'src/pages/Teste.tsx',
        criticidade: 'alta',
      })
    expect(res.status).toBe(201)
    expect(res.body.plan).toBeDefined()
    expect(res.body.plan.id).toBe('TST-E2E-CONFIG-000099')
  })

  it('rejeita payload incompleto', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/plans/generate')
      .send({ escopo: 'CONFIG' })
    expect(res.status).toBe(400)
  })
})

// ─── POST /admin/testes-gerais/plans/extract-testids ────────────────────────

describe('POST /api/admin/testes-gerais/plans/extract-testids', () => {
  it('extrai testids e retorna mapeamento', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/plans/extract-testids')
      .send({
        componenteFilePath: 'src/pages/Org.tsx',
        escopo: 'CONFIG',
        sublocal: 'Organizacao',
      })
    expect(res.status).toBe(200)
    expect(res.body.mapping).toBeDefined()
    expect(res.body.mapping.componente).toBe('src/pages/Org.tsx')
  })

  it('rejeita sem componenteFilePath', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/plans/extract-testids')
      .send({ escopo: 'CONFIG' })
    expect(res.status).toBe(400)
  })
})

// ─── POST /admin/testes-gerais/logs/:id/reanalyze ───────────────────────────

describe('POST /api/admin/testes-gerais/logs/:id/reanalyze', () => {
  it('retorna 404 quando log entry não existe', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const res = await request
      .post('/api/admin/testes-gerais/logs/inexistente/reanalyze')
    expect(res.status).toBe(404)
  })

  it('retorna análise quando entry existe e falhou', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readdirSync).mockReturnValue(['2026-04-15.json'] as unknown as ReturnType<typeof readdirSync>)
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify([
      { id: 'log-123', result: 'REPROVADO', error_log: 'Error', test_name: 'teste', module: 'config' },
    ]))

    const res = await request
      .post('/api/admin/testes-gerais/logs/log-123/reanalyze')
    expect(res.status).toBe(200)
    expect(res.body.analysis).toBeDefined()
    expect(res.body.analysis.categoria).toBe('TESTE_DESATUALIZADO')
  })
})

// ─── POST /admin/testes-gerais/logs/:id/reject ──────────────────────────────

describe('POST /api/admin/testes-gerais/logs/:id/reject', () => {
  it('rejeita sem motivo', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/logs/log-123/reject')
      .send({})
    expect(res.status).toBe(400)
  })

  it('rejeita motivo curto demais', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/logs/log-123/reject')
      .send({ motivo: 'curto' })
    expect(res.status).toBe(400)
  })

  it('retorna 404 quando entry não existe', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const res = await request
      .post('/api/admin/testes-gerais/logs/inexistente/reject')
      .send({ motivo: 'A análise está incorreta, o bug é no backend não no front' })
    expect(res.status).toBe(404)
  })

  it('aceita rejeição válida', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readdirSync).mockReturnValue(['2026-04-15.json'] as unknown as ReturnType<typeof readdirSync>)
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify([
      { id: 'log-456', result: 'REPROVADO', test_name: 'teste', module: 'config' },
    ]))

    const res = await request
      .post('/api/admin/testes-gerais/logs/log-456/reject')
      .send({ motivo: 'A análise está incorreta, o bug é no backend não no frontend' })
    expect(res.status).toBe(200)
    expect(res.body.rejected).toBe(true)
  })
})

// ─── GET /admin/testes-gerais/gemini-metrics ────────────────────────────────

describe('GET /api/admin/testes-gerais/gemini-metrics', () => {
  it('retorna métricas de cache e diárias', async () => {
    const res = await request.get('/api/admin/testes-gerais/gemini-metrics')
    expect(res.status).toBe(200)
    expect(res.body.cache).toBeDefined()
    expect(res.body.cache.cacheSize).toBe(5)
    expect(res.body.cache.hitRate).toBe(77)
    expect(res.body.daily).toBeDefined()
    expect(Array.isArray(res.body.daily)).toBe(true)
  })
})

// ─── CRUD /admin/testes-gerais/schedules ────────────────────────────────────

describe('CRUD /api/admin/testes-gerais/schedules', () => {
  it('GET lista schedules (vazio)', async () => {
    const res = await request.get('/api/admin/testes-gerais/schedules')
    expect(res.status).toBe(200)
    expect(res.body.schedules).toBeDefined()
  })

  it('POST cria schedule e retorna 201', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/schedules')
      .send({
        name: 'Diário 3h',
        cron: '0 3 * * *',
        modulos: ['e2e'],
        ambientes: ['Local'],
        ativo: true,
        notificar: true,
      })
    expect(res.status).toBe(201)
  })

  it('POST rejeita sem name', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/schedules')
      .send({ cron: '0 3 * * *' })
    expect(res.status).toBe(400)
  })
})

// ─── POST /admin/testes-gerais/pentest ──────────────────────────────────────

describe('POST /api/admin/testes-gerais/pentest', () => {
  it('aceita URL válida e retorna started', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/pentest')
      .send({ targetUrl: 'https://app.gravity.test', scanType: 'baseline' })
    expect(res.status).toBe(200)
    expect(res.body.started).toBe(true)
    expect(res.body.scanType).toBe('baseline')
  })

  it('rejeita URL inválida', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/pentest')
      .send({ targetUrl: 'nao-e-url' })
    expect(res.status).toBe(400)
  })

  it('rejeita scanType inválido', async () => {
    const res = await request
      .post('/api/admin/testes-gerais/pentest')
      .send({ targetUrl: 'https://app.test', scanType: 'ultra' })
    expect(res.status).toBe(400)
  })
})

// ─── GET /admin/testes-gerais/plans ─────────────────────────────────────────

describe('GET /api/admin/testes-gerais/plans', () => {
  it('retorna lista de planos', async () => {
    const res = await request.get('/api/admin/testes-gerais/plans')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('plans')
  })
})
