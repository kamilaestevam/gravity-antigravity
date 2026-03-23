// @vitest-environment node
// testes/testes-funcionais/configurador/tenants.test.ts
// Testes funcionais — rotas do Configurador: tenants e companies
//
// POST /api/v1/tenants
// GET  /api/v1/tenants/me
// GET  /api/v1/tenants/companies
// POST /api/v1/tenants/companies
//
// Estratégia: mock do Prisma e dos middlewares de auth (sem banco real em CI).
// O banco real é obrigatório apenas em testes de integração de staging.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { tenantsRouter } from '../../../servicos-global/configurador/server/routes/tenants.js'
import { errorHandler } from '../../../servicos-global/configurador/server/middleware/errorHandler.js'

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../../servicos-global/configurador/server/services/tenantService.js', () => ({
  tenantService: {
    createTenant: vi.fn(),
    getTenantById: vi.fn(),
    getCompanies: vi.fn(),
    createCompany: vi.fn(),
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req: { auth: { tenantId: string; clerkUserId: string } },
    _res: unknown,
    next: () => void
  ) => {
    req.auth = { tenantId: 'tenant-teste-001', clerkUserId: 'clerk-user-001' }
    next()
  },
}))

import { tenantService } from '../../../servicos-global/configurador/server/services/tenantService.js'

// ─── App de teste isolado ────────────────────────────────────────────────────

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/tenants', tenantsRouter)
  app.use(errorHandler)
  return app
}

// ─── Suites ─────────────────────────────────────────────────────────────────

describe('POST /api/v1/tenants — criar tenant', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('201 — cria tenant com dados válidos', async () => {
    const mockTenant = {
      id: 'tenant-001',
      name: 'Empresa Teste',
      slug: 'empresa-teste',
      status: 'PENDING_SETUP',
    }
    vi.mocked(tenantService.createTenant).mockResolvedValueOnce(mockTenant as never)

    const response = await request(app)
      .post('/api/v1/tenants')
      .send({
        name: 'Empresa Teste',
        slug: 'empresa-teste',
        clerkUserId: 'clerk-user-001',
        owner: { email: 'owner@empresa.com', name: 'Dono' },
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('tenant')
    expect(response.body.tenant.slug).toBe('empresa-teste')
    expect(tenantService.createTenant).toHaveBeenCalledTimes(1)
  })

  it('400 — slug com caracteres inválidos (espaço / maiúsculas)', async () => {
    const response = await request(app)
      .post('/api/v1/tenants')
      .send({
        name: 'Empresa Teste',
        slug: 'Empresa Teste', // inválido — maiúsculas e espaço
        clerkUserId: 'clerk-user-001',
        owner: { email: 'owner@empresa.com', name: 'Dono' },
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(tenantService.createTenant).not.toHaveBeenCalled()
  })

  it('400 — email do owner inválido', async () => {
    const response = await request(app)
      .post('/api/v1/tenants')
      .send({
        name: 'Empresa Teste',
        slug: 'empresa-teste',
        clerkUserId: 'clerk-user-001',
        owner: { email: 'nao-e-email', name: 'Dono' },
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('400 — nome com menos de 2 caracteres', async () => {
    const response = await request(app)
      .post('/api/v1/tenants')
      .send({
        name: 'X',
        slug: 'empresa-teste',
        clerkUserId: 'clerk-user-001',
        owner: { email: 'owner@empresa.com', name: 'Dono' },
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('400 — body completamente vazio', async () => {
    const response = await request(app).post('/api/v1/tenants').send({})

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})

describe('GET /api/v1/tenants/me — dados do tenant autenticado', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna tenant do usuário autenticado', async () => {
    const mockTenant = {
      id: 'tenant-teste-001',
      name: 'Empresa Teste',
      slug: 'empresa-teste',
      status: 'ACTIVE',
    }
    vi.mocked(tenantService.getTenantById).mockResolvedValueOnce(mockTenant as never)

    const response = await request(app).get('/api/v1/tenants/me')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('tenant')
    expect(response.body.tenant.id).toBe('tenant-teste-001')
    expect(tenantService.getTenantById).toHaveBeenCalledWith('tenant-teste-001')
  })

  it('404 — tenant não encontrado', async () => {
    vi.mocked(tenantService.getTenantById).mockResolvedValueOnce(null as never)

    const response = await request(app).get('/api/v1/tenants/me')

    expect(response.status).toBe(404)
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND')
  })
})

describe('GET /api/v1/tenants/companies — listar empresas filhas', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna lista de empresas do tenant', async () => {
    const mockCompanies = [
      { id: 'company-001', name: 'Filial SP', tenant_id: 'tenant-teste-001' },
      { id: 'company-002', name: 'Filial RJ', tenant_id: 'tenant-teste-001' },
    ]
    vi.mocked(tenantService.getCompanies).mockResolvedValueOnce(mockCompanies as never)

    const response = await request(app).get('/api/v1/tenants/companies')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('companies')
    expect(response.body.companies).toHaveLength(2)
    expect(tenantService.getCompanies).toHaveBeenCalledWith('tenant-teste-001')
  })

  it('200 — retorna lista vazia quando não há empresas', async () => {
    vi.mocked(tenantService.getCompanies).mockResolvedValueOnce([] as never)

    const response = await request(app).get('/api/v1/tenants/companies')

    expect(response.status).toBe(200)
    expect(response.body.companies).toHaveLength(0)
  })
})

describe('POST /api/v1/tenants/companies — criar empresa filha', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('201 — cria empresa filha com dados válidos', async () => {
    const mockCompany = {
      id: 'company-003',
      name: 'Nova Filial',
      tenant_id: 'tenant-teste-001',
      status: 'ACTIVE',
    }
    vi.mocked(tenantService.createCompany).mockResolvedValueOnce(mockCompany as never)

    const response = await request(app)
      .post('/api/v1/tenants/companies')
      .send({ name: 'Nova Filial', subdomain: 'nova-filial', cnpj: '12345678000195' })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('company')
    expect(response.body.company.name).toBe('Nova Filial')
    expect(tenantService.createCompany).toHaveBeenCalledWith(
      'tenant-teste-001',
      expect.objectContaining({ name: 'Nova Filial' })
    )
  })

  it('201 — cria empresa filha apenas com nome (subdomain e cnpj opcionais)', async () => {
    const mockCompany = { id: 'company-004', name: 'Só Nome', tenant_id: 'tenant-teste-001' }
    vi.mocked(tenantService.createCompany).mockResolvedValueOnce(mockCompany as never)

    const response = await request(app)
      .post('/api/v1/tenants/companies')
      .send({ name: 'Só Nome' })

    expect(response.status).toBe(201)
  })

  it('400 — nome com menos de 2 caracteres', async () => {
    const response = await request(app)
      .post('/api/v1/tenants/companies')
      .send({ name: 'X' })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(tenantService.createCompany).not.toHaveBeenCalled()
  })

  it('400 — body sem campo name', async () => {
    const response = await request(app)
      .post('/api/v1/tenants/companies')
      .send({ subdomain: 'sem-nome' })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})
