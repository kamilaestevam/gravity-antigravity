// testes/conector-erp/mapeamentos.test.ts
// Testes unitários das rotas de mapeamentos de campos ERP.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock(
  '../../servicos-global/tenant/conector-erp/server/lib/prisma.js',
  () => ({
    prisma: {
      mapeamentoCampo: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  })
)

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
const { prisma } = await import(
  '../../servicos-global/tenant/conector-erp/server/lib/prisma.js'
)
const { mapeamentosRouter } = await import(
  '../../servicos-global/tenant/conector-erp/server/routes/mapeamentos.js'
)
const { errorHandler } = await import(
  '../../servicos-global/tenant/conector-erp/server/middleware/error-handler.js'
)

const app = express()
app.use(express.json())
app.use(mapeamentosRouter)
app.use(errorHandler)

const mockMapeamento = {
  id: 'map-1',
  tenant_id: 'tenant-abc',
  product_id: null,
  conexao_id: 'conn-1',
  entidade: 'GoodsMovementSet',
  campo_erp: 'MaterialDocumentItem',
  campo_interno: 'item_id',
  tipo_dados: 'string',
  transformacao: null,
  obrigatorio: false,
  valor_padrao: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------
describe('POST /api/v1/erp/mapeamentos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cria mapeamento com dados válidos', async () => {
    vi.mocked(prisma.mapeamentoCampo.create).mockResolvedValue(mockMapeamento as never)

    const res = await request(app)
      .post('/api/v1/erp/mapeamentos')
      .send({
        tenant_id: 'tenant-abc',
        conexao_id: 'conn-1',
        entidade: 'GoodsMovementSet',
        campo_erp: 'MaterialDocumentItem',
        campo_interno: 'item_id',
      })

    expect(res.status).toBe(201)
    expect(res.body.ok).toBe(true)
    expect(res.body.data.campo_erp).toBe('MaterialDocumentItem')
  })

  it('retorna 400 se campo_erp estiver ausente', async () => {
    const res = await request(app)
      .post('/api/v1/erp/mapeamentos')
      .send({
        tenant_id: 'tenant-abc',
        conexao_id: 'conn-1',
        entidade: 'GoodsMovementSet',
        campo_interno: 'item_id',
      })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })
})

describe('GET /api/v1/erp/mapeamentos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lista mapeamentos do tenant', async () => {
    vi.mocked(prisma.mapeamentoCampo.findMany).mockResolvedValue([mockMapeamento] as never)

    const res = await request(app)
      .get('/api/v1/erp/mapeamentos')
      .query({ tenant_id: 'tenant-abc' })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })

  it('filtra por entidade', async () => {
    vi.mocked(prisma.mapeamentoCampo.findMany).mockResolvedValue([] as never)

    const res = await request(app)
      .get('/api/v1/erp/mapeamentos')
      .query({ tenant_id: 'tenant-abc', entidade: 'PurchaseOrderSet' })

    expect(res.status).toBe(200)
    expect(prisma.mapeamentoCampo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ entidade: 'PurchaseOrderSet' }),
      })
    )
  })

  it('retorna 400 sem tenant_id', async () => {
    const res = await request(app).get('/api/v1/erp/mapeamentos')
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/v1/erp/mapeamentos/:id', () => {
  it('remove mapeamento do tenant correto', async () => {
    vi.mocked(prisma.mapeamentoCampo.findFirst).mockResolvedValue(mockMapeamento as never)
    vi.mocked(prisma.mapeamentoCampo.delete).mockResolvedValue(mockMapeamento as never)

    const res = await request(app)
      .delete('/api/v1/erp/mapeamentos/map-1')
      .query({ tenant_id: 'tenant-abc' })

    expect(res.status).toBe(200)
  })

  it('retorna 404 para id de outro tenant', async () => {
    vi.mocked(prisma.mapeamentoCampo.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/erp/mapeamentos/map-1')
      .query({ tenant_id: 'outro-tenant' })

    expect(res.status).toBe(404)
  })
})
