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
  app.use('/api/v1/admin', adminRouter)

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

// ─── GET /admin/testes ───────────────────────────────────────────

describe('GET /api/v1/admin/testes', () => {
  it('retorna 200 com array de logs', async () => {
    const res = await request.get('/api/v1/admin/testes')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('logs')
    expect(Array.isArray(res.body.logs)).toBe(true)
  })
})

// ─── POST /admin/testes ──────────────────────────────────────────

describe('POST /api/v1/admin/testes', () => {
  it('aceita batch válido e retorna 201', async () => {
    const res = await request
      .post('/api/v1/admin/testes')
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
      .post('/api/v1/admin/testes')
      .send({})
    expect(res.status).toBe(400)
  })

  it('rejeita resultado inválido', async () => {
    const res = await request
      .post('/api/v1/admin/testes')
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

// ─── POST /admin/planos-teste/gerar ─────────────────────────────────────────

describe('POST /api/v1/admin/planos-teste/gerar', () => {
  it('gera plano e retorna 201', async () => {
    const res = await request
      .post('/api/v1/admin/planos-teste/gerar')
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
      .post('/api/v1/admin/planos-teste/gerar')
      .send({ escopo: 'CONFIG' })
    expect(res.status).toBe(400)
  })
})

// ─── POST /admin/planos-teste/extrair-testids ───────────────────────────────

describe('POST /api/v1/admin/planos-teste/extrair-testids', () => {
  it('extrai testids e retorna mapeamento', async () => {
    const res = await request
      .post('/api/v1/admin/planos-teste/extrair-testids')
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
      .post('/api/v1/admin/planos-teste/extrair-testids')
      .send({ escopo: 'CONFIG' })
    expect(res.status).toBe(400)
  })
})

// ─── POST /admin/testes/:id/reanalisar ───────────────────────────

describe('POST /api/v1/admin/testes/:id/reanalisar', () => {
  it('retorna 404 quando log entry não existe', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const res = await request
      .post('/api/v1/admin/testes/inexistente/reanalisar')
    expect(res.status).toBe(404)
  })

  it('retorna análise quando entry existe e falhou', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readdirSync).mockReturnValue(['2026-04-15.json'] as unknown as ReturnType<typeof readdirSync>)
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify([
      { id: 'log-123', result: 'REPROVADO', error_log: 'Error', test_name: 'teste', module: 'config' },
    ]))

    const res = await request
      .post('/api/v1/admin/testes/log-123/reanalisar')
    expect(res.status).toBe(200)
    expect(res.body.analysis).toBeDefined()
    expect(res.body.analysis.categoria).toBe('TESTE_DESATUALIZADO')
  })
})

// ─── POST /admin/testes/:id/rejeitar ──────────────────────────────

describe('POST /api/v1/admin/testes/:id/rejeitar', () => {
  it('rejeita sem motivo', async () => {
    const res = await request
      .post('/api/v1/admin/testes/log-123/rejeitar')
      .send({})
    expect(res.status).toBe(400)
  })

  it('rejeita motivo curto demais', async () => {
    const res = await request
      .post('/api/v1/admin/testes/log-123/rejeitar')
      .send({ motivo: 'curto' })
    expect(res.status).toBe(400)
  })

  it('retorna 404 quando entry não existe', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const res = await request
      .post('/api/v1/admin/testes/inexistente/rejeitar')
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
      .post('/api/v1/admin/testes/log-456/rejeitar')
      .send({ motivo: 'A análise está incorreta, o bug é no backend não no frontend' })
    expect(res.status).toBe(200)
    expect(res.body.rejected).toBe(true)
  })
})

// ─── GET /admin/metricas-llm ────────────────────────────────────────────────

describe('GET /api/v1/admin/metricas-llm', () => {
  it('retorna métricas de cache e diárias', async () => {
    const res = await request.get('/api/v1/admin/metricas-llm')
    expect(res.status).toBe(200)
    expect(res.body.cache).toBeDefined()
    expect(res.body.cache.cacheSize).toBe(5)
    expect(res.body.cache.hitRate).toBe(77)
    expect(res.body.daily).toBeDefined()
    expect(Array.isArray(res.body.daily)).toBe(true)
  })
})

// ─── CRUD /admin/agendamentos-teste ─────────────────────────────────────────

describe('CRUD /api/v1/admin/agendamentos-teste', () => {
  it('GET lista schedules (vazio)', async () => {
    const res = await request.get('/api/v1/admin/agendamentos-teste')
    expect(res.status).toBe(200)
    expect(res.body.schedules).toBeDefined()
  })

  it('POST cria schedule e retorna 201', async () => {
    const res = await request
      .post('/api/v1/admin/agendamentos-teste')
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
      .post('/api/v1/admin/agendamentos-teste')
      .send({ cron: '0 3 * * *' })
    expect(res.status).toBe(400)
  })
})

// ─── POST /admin/testes/pentest ──────────────────────────────────────

describe('POST /api/v1/admin/testes/pentest', () => {
  it('aceita URL válida e retorna started', async () => {
    const res = await request
      .post('/api/v1/admin/testes/pentest')
      .send({ targetUrl: 'https://app.gravity.test', scanType: 'baseline' })
    expect(res.status).toBe(200)
    expect(res.body.started).toBe(true)
    expect(res.body.scanType).toBe('baseline')
  })

  it('rejeita URL inválida', async () => {
    const res = await request
      .post('/api/v1/admin/testes/pentest')
      .send({ targetUrl: 'nao-e-url' })
    expect(res.status).toBe(400)
  })

  it('rejeita scanType inválido', async () => {
    const res = await request
      .post('/api/v1/admin/testes/pentest')
      .send({ targetUrl: 'https://app.test', scanType: 'ultra' })
    expect(res.status).toBe(400)
  })
})

// ─── GET /admin/planos-teste ────────────────────────────────────────────────

describe('GET /api/v1/admin/planos-teste', () => {
  it('retorna lista de planos', async () => {
    const res = await request.get('/api/v1/admin/planos-teste')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('planos')
  })
})
