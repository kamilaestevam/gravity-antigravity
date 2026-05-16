/**
 * Testes funcionais — Rotas ExportadorQuandoImportacao
 *
 * Testa a camada HTTP completa:
 * - Validação Zod real
 * - Error handler real
 * - Prisma mockado
 * - requireInternalKey mockado
 *
 * Mandamentos verificados:
 * - 03 (DDD): nomes de campos no response
 * - 06 (Zod): rejeição de payload inválido com 400
 * - 08 (sem fallbacks): 404 quando não encontrado
 * - Isolamento: toda query filtra por id_organizacao
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do Prisma
const mockFindMany = vi.fn()
const mockCount = vi.fn()
const mockFindFirst = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()

vi.mock('../../../servicos-global/cadastros/server/src/lib/prisma', () => ({
  prisma: {
    exportadorQuandoImportacao: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}))

// Mock do middleware de autenticação
vi.mock('../../../servicos-global/cadastros/server/src/middleware/internal-key', () => ({
  requireInternalKey: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

import express from 'express'
import request from 'supertest'
import { exportadoresQuandoImportacaoRouter } from '../../../servicos-global/cadastros/server/src/routes/exportadores-quando-importacao'
import { errorHandler } from '../../../servicos-global/cadastros/server/src/lib/app-error'

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/cadastros/exportadores-quando-importacao', exportadoresQuandoImportacaoRouter)
  app.use(errorHandler)
  return app
}

const HEADERS = { 'x-id-organizacao': 'org_test123' }

const exportadorMock = {
  id_exportador_quando_importacao: 'cuid_exp_001',
  id_organizacao_exportador: 'org_test123',
  id_workspace_exportador: 'ws_001',
  nome_exportador: 'Acme Global',
  endereco_exportador: '123 Main St',
  cidade_exportador: 'New York',
  estado_provincia_exportador: 'NY',
  pais_exportador: 'US',
  zipcode_exportador: '10001',
  criado_em_exportador: new Date('2026-05-16T10:00:00Z'),
  atualizado_em_exportador: new Date('2026-05-16T10:00:00Z'),
}

describe('GET /api/v1/cadastros/exportadores-quando-importacao', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('retorna 400 sem header x-id-organizacao', async () => {
    const app = criarApp()
    const res = await request(app).get('/api/v1/cadastros/exportadores-quando-importacao')
    expect([400, 422]).toContain(res.status)
  })

  it('retorna lista vazia quando não há registros', async () => {
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(0)
    const app = criarApp()
    const res = await request(app)
      .get('/api/v1/cadastros/exportadores-quando-importacao')
      .set(HEADERS)
    expect(res.status).toBe(200)
    expect(res.body.itens).toEqual([])
    expect(res.body.total).toBe(0)
  })

  it('retorna lista com DTO correto (campos DDD)', async () => {
    mockFindMany.mockResolvedValue([exportadorMock])
    mockCount.mockResolvedValue(1)
    const app = criarApp()
    const res = await request(app)
      .get('/api/v1/cadastros/exportadores-quando-importacao')
      .set(HEADERS)
    expect(res.status).toBe(200)
    expect(res.body.itens[0].id_exportador_quando_importacao).toBe('cuid_exp_001')
    expect(res.body.itens[0].id_organizacao).toBe('org_test123')
    expect(res.body.itens[0].nome_exportador).toBe('Acme Global')
    // Campos DDD no DTO (sem sufixo _exportador no id_organizacao)
    expect(res.body.itens[0]).not.toHaveProperty('id_organizacao_exportador')
  })

  it('filtra por id_workspace quando passado como query', async () => {
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(0)
    const app = criarApp()
    await request(app)
      .get('/api/v1/cadastros/exportadores-quando-importacao?id_workspace=ws_001')
      .set(HEADERS)
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id_workspace_exportador: 'ws_001' }),
    }))
  })

  it('filtra por busca textual no nome', async () => {
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(0)
    const app = criarApp()
    await request(app)
      .get('/api/v1/cadastros/exportadores-quando-importacao?busca=Acme')
      .set(HEADERS)
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        nome_exportador: { contains: 'Acme', mode: 'insensitive' },
      }),
    }))
  })
})

describe('GET /api/v1/cadastros/exportadores-quando-importacao/:id', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('retorna 404 quando não encontrado', async () => {
    mockFindFirst.mockResolvedValue(null)
    const app = criarApp()
    const res = await request(app)
      .get('/api/v1/cadastros/exportadores-quando-importacao/inexistente')
      .set(HEADERS)
    expect(res.status).toBe(404)
  })

  it('retorna DTO correto quando encontrado', async () => {
    mockFindFirst.mockResolvedValue(exportadorMock)
    const app = criarApp()
    const res = await request(app)
      .get('/api/v1/cadastros/exportadores-quando-importacao/cuid_exp_001')
      .set(HEADERS)
    expect(res.status).toBe(200)
    expect(res.body.id_exportador_quando_importacao).toBe('cuid_exp_001')
  })

  it('verifica pertencimento à organização (Tenant Isolation)', async () => {
    mockFindFirst.mockResolvedValue(null)
    const app = criarApp()
    await request(app)
      .get('/api/v1/cadastros/exportadores-quando-importacao/cuid_exp_001')
      .set(HEADERS)
    expect(mockFindFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id_organizacao_exportador: 'org_test123',
      }),
    }))
  })
})

describe('POST /api/v1/cadastros/exportadores-quando-importacao', () => {
  beforeEach(() => { vi.clearAllMocks() })

  const payloadCriacao = {
    id_workspace: 'ws_001',
    nome_exportador: 'New Supplier Inc',
    pais_exportador: 'DE',
  }

  it('cria com sucesso e retorna 201', async () => {
    mockCreate.mockResolvedValue({
      ...exportadorMock,
      nome_exportador: 'New Supplier Inc',
      pais_exportador: 'DE',
    })
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/cadastros/exportadores-quando-importacao')
      .set(HEADERS)
      .send(payloadCriacao)
    expect(res.status).toBe(201)
    expect(res.body.nome_exportador).toBe('New Supplier Inc')
  })

  it('rejeita payload inválido com 400 (Zod)', async () => {
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/cadastros/exportadores-quando-importacao')
      .set(HEADERS)
      .send({ nome_exportador: 'X', pais_exportador: 'invalid' })
    expect([400, 422]).toContain(res.status)
  })

  it('rejeita sem id_workspace com 400', async () => {
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/cadastros/exportadores-quando-importacao')
      .set(HEADERS)
      .send({ nome_exportador: 'Test', pais_exportador: 'US' })
    expect([400, 422]).toContain(res.status)
  })
})

describe('PUT /api/v1/cadastros/exportadores-quando-importacao/:id', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('atualiza com sucesso quando registro existe', async () => {
    mockFindFirst.mockResolvedValue(exportadorMock)
    mockUpdate.mockResolvedValue({ ...exportadorMock, nome_exportador: 'Updated Name' })
    const app = criarApp()
    const res = await request(app)
      .put('/api/v1/cadastros/exportadores-quando-importacao/cuid_exp_001')
      .set(HEADERS)
      .send({ nome_exportador: 'Updated Name' })
    expect(res.status).toBe(200)
    expect(res.body.nome_exportador).toBe('Updated Name')
  })

  it('retorna 404 quando registro não pertence à organização', async () => {
    mockFindFirst.mockResolvedValue(null)
    const app = criarApp()
    const res = await request(app)
      .put('/api/v1/cadastros/exportadores-quando-importacao/outro_id')
      .set(HEADERS)
      .send({ nome_exportador: 'Updated' })
    expect(res.status).toBe(404)
  })

  it('rejeita atualização com dados inválidos (Zod)', async () => {
    mockFindFirst.mockResolvedValue(exportadorMock)
    const app = criarApp()
    const res = await request(app)
      .put('/api/v1/cadastros/exportadores-quando-importacao/cuid_exp_001')
      .set(HEADERS)
      .send({ pais_exportador: 'invalid_country' })
    expect([400, 422]).toContain(res.status)
  })
})
