// testes/conector-erp/conexoes.test.ts
// Testes unitários das rotas de conexões ERP.
// Usa mocks de Prisma e crypto para rodar sem banco real.

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
      conexaoERP: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  })
)

vi.mock(
  '../../servicos-global/tenant/conector-erp/server/lib/crypto.js',
  () => ({
    encrypt: vi.fn().mockReturnValue('iv:authtag:ciphertext'),
    decrypt: vi.fn().mockReturnValue('decrypted-password'),
  })
)

vi.mock(
  '../../servicos-global/tenant/conector-erp/server/services/erp-client.js',
  () => ({
    testarConexao: vi.fn().mockResolvedValue({ ok: true, latencyMs: 42 }),
    executeODataQuery: vi.fn(),
  })
)

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
const { prisma } = await import(
  '../../servicos-global/tenant/conector-erp/server/lib/prisma.js'
)
const { conexoesRouter } = await import(
  '../../servicos-global/tenant/conector-erp/server/routes/conexoes.js'
)
const { errorHandler } = await import(
  '../../servicos-global/tenant/conector-erp/server/middleware/error-handler.js'
)

const app = express()
app.use(express.json())
app.use(conexoesRouter)
app.use(errorHandler)

const mockConexao = {
  id: 'conn-1',
  tenant_id: 'tenant-abc',
  product_id: null,
  system_type: 'SAP',
  protocol: 'odata',
  base_url: 'https://sap.example.com',
  username: 'user',
  sync_frequency: 'manual',
  connection_status: 'untested',
  created_at: new Date().toISOString(),
}

// ---------------------------------------------------------------------------
// Testes
// ---------------------------------------------------------------------------
describe('POST /api/v1/erp/conexoes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('cria conexão com dados válidos', async () => {
    vi.mocked(prisma.conexaoERP.create).mockResolvedValue(mockConexao as never)

    const res = await request(app)
      .post('/api/v1/erp/conexoes')
      .send({
        tenant_id: 'tenant-abc',
        system_type: 'SAP',
        protocol: 'odata',
        base_url: 'https://sap.example.com',
        username: 'user',
        password: 'pass123',
      })

    expect(res.status).toBe(201)
    expect(res.body.ok).toBe(true)
    expect(res.body.data.id).toBe('conn-1')
  })

  it('retorna 400 para dados inválidos (url inválida)', async () => {
    const res = await request(app)
      .post('/api/v1/erp/conexoes')
      .send({
        tenant_id: 'tenant-abc',
        system_type: 'SAP',
        protocol: 'odata',
        base_url: 'not-a-url',
        username: 'user',
        password: 'pass',
      })

    expect(res.status).toBe(400)
    expect(res.body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 se tenant_id ausente', async () => {
    const res = await request(app)
      .post('/api/v1/erp/conexoes')
      .send({
        system_type: 'SAP',
        protocol: 'odata',
        base_url: 'https://sap.example.com',
        username: 'user',
        password: 'pass',
      })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/v1/erp/conexoes', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lista conexões do tenant', async () => {
    vi.mocked(prisma.conexaoERP.findMany).mockResolvedValue([mockConexao] as never)

    const res = await request(app)
      .get('/api/v1/erp/conexoes')
      .query({ tenant_id: 'tenant-abc' })

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.data).toHaveLength(1)
  })

  it('retorna 400 sem tenant_id', async () => {
    const res = await request(app).get('/api/v1/erp/conexoes')
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('MISSING_TENANT_ID')
  })

  it('não solicita credentials_encrypted do banco na listagem', async () => {
    vi.mocked(prisma.conexaoERP.findMany).mockResolvedValue([])

    await request(app)
      .get('/api/v1/erp/conexoes')
      .query({ tenant_id: 'tenant-abc' })

    const callArgs = vi.mocked(prisma.conexaoERP.findMany).mock.calls[0][0]
    expect(callArgs?.select?.credentials_encrypted).toBeUndefined()
  })
})

describe('POST /api/v1/erp/conexoes/testar', () => {
  it('retorna resultado do teste de conexão', async () => {
    const res = await request(app)
      .post('/api/v1/erp/conexoes/testar')
      .send({ tenant_id: 'tenant-abc' })

    expect(res.status).toBe(200)
    expect(res.body.data.ok).toBe(true)
    expect(res.body.data.latencyMs).toBe(42)
  })
})

describe('DELETE /api/v1/erp/conexoes/:id', () => {
  it('remove conexão do tenant correto', async () => {
    vi.mocked(prisma.conexaoERP.findFirst).mockResolvedValue(mockConexao as never)
    vi.mocked(prisma.conexaoERP.delete).mockResolvedValue(mockConexao as never)

    const res = await request(app)
      .delete('/api/v1/erp/conexoes/conn-1')
      .query({ tenant_id: 'tenant-abc' })

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('retorna 404 para conexão de outro tenant', async () => {
    vi.mocked(prisma.conexaoERP.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/erp/conexoes/conn-1')
      .query({ tenant_id: 'outro-tenant' })

    expect(res.status).toBe(404)
  })
})
