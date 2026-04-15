// @vitest-environment node
// testes/testes-funcionais/configurador/mePreferences.test.ts
// Testes funcionais — GET e PUT /api/v1/me/preferences
//
// Valida o contrato HTTP dos endpoints que persistem o workspace preferido
// do usuário (feature: skip pós-login).
//
// Regras de negócio cobertas:
//   - Fornecedor (SUPPLIER) NUNCA pode usar a feature (403 no PUT, null no GET)
//   - Só pode marcar workspace onde tem membership ATIVA
//   - Fallback silencioso quando preferido se torna inválido
//   - Desmarcar (null) sempre permitido para Master/Standard

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { meRouter } from '../../../servicos-global/configurador/server/routes/me.js'
import { errorHandler } from '../../../servicos-global/configurador/server/middleware/errorHandler.js'

// ─── Mocks ──────────────────────────────────────────────────────────────────

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'STANDARD' | 'SUPPLIER'
let mockAuthRole: Role = 'MASTER'
vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req: { auth: { tenantId: string; userId: string; clerkUserId: string; role: string } },
    _res: unknown,
    next: () => void
  ) => {
    req.auth = { tenantId: 'tenant-001', userId: 'user-001', clerkUserId: 'clerk-001', role: mockAuthRole }
    next()
  },
}))

const mockUserFindUnique = vi.fn()
const mockUserUpdate = vi.fn()
const mockMembershipFindFirst = vi.fn()
const mockCompanyFindFirst = vi.fn()
vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    userMembership: {
      findFirst: (...args: unknown[]) => mockMembershipFindFirst(...args),
    },
    company: {
      findFirst: (...args: unknown[]) => mockCompanyFindFirst(...args),
    },
  },
}))

// ─── App de teste ───────────────────────────────────────────────────────────

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/me', meRouter)
  app.use(errorHandler)
  return app
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const VALID_CUID = 'clxxxxxxxxx0000abcdefghij' // 25 chars, starts with c

beforeEach(() => {
  vi.clearAllMocks()
  mockAuthRole = 'MASTER'
  mockUserFindUnique.mockResolvedValue({ preferred_company_id: null })
  mockUserUpdate.mockResolvedValue({})
  mockMembershipFindFirst.mockResolvedValue({ id: 'mem-1' })
  mockCompanyFindFirst.mockResolvedValue({ id: 'comp-1' })
})

// ─── GET /api/v1/me/preferences ─────────────────────────────────────────────

describe('GET /api/v1/me/preferences', () => {
  it('retorna null quando usuário não tem preferido definido', async () => {
    mockUserFindUnique.mockResolvedValue({ preferred_company_id: null })

    const app = buildApp()
    const res = await request(app).get('/api/v1/me/preferences')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: { preferredCompanyId: null } })
  })

  it('retorna o id quando usuário tem preferido válido com membership ativa', async () => {
    mockUserFindUnique.mockResolvedValue({ preferred_company_id: VALID_CUID })
    mockMembershipFindFirst.mockResolvedValue({ id: 'mem-1' })

    const app = buildApp()
    const res = await request(app).get('/api/v1/me/preferences')

    expect(res.status).toBe(200)
    expect(res.body.data.preferredCompanyId).toBe(VALID_CUID)
  })

  it('retorna null e limpa no banco quando preferido não tem mais membership ativa', async () => {
    mockUserFindUnique.mockResolvedValue({ preferred_company_id: VALID_CUID })
    mockMembershipFindFirst.mockResolvedValue(null) // membership revogada

    const app = buildApp()
    const res = await request(app).get('/api/v1/me/preferences')

    expect(res.status).toBe(200)
    expect(res.body.data.preferredCompanyId).toBeNull()
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-001' },
      data: { preferred_company_id: null },
    })
  })

  it('retorna sempre null quando role=SUPPLIER (fornecedor ignora feature)', async () => {
    mockAuthRole = 'SUPPLIER'
    mockUserFindUnique.mockResolvedValue({ preferred_company_id: VALID_CUID })

    const app = buildApp()
    const res = await request(app).get('/api/v1/me/preferences')

    expect(res.status).toBe(200)
    expect(res.body.data.preferredCompanyId).toBeNull()
    // Sequer consulta banco quando é SUPPLIER
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })
})

// ─── PUT /api/v1/me/preferences ─────────────────────────────────────────────

describe('PUT /api/v1/me/preferences', () => {
  it('salva preferido com sucesso quando usuário tem membership ativa', async () => {
    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: VALID_CUID })

    expect(res.status).toBe(200)
    expect(res.body.data.preferredCompanyId).toBe(VALID_CUID)
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-001' },
      data: { preferred_company_id: VALID_CUID },
    })
  })

  it('desmarca preferido (null) sem validar membership', async () => {
    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: null })

    expect(res.status).toBe(200)
    expect(res.body.data.preferredCompanyId).toBeNull()
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 'user-001' },
      data: { preferred_company_id: null },
    })
    // Desmarcar não valida membership
    expect(mockMembershipFindFirst).not.toHaveBeenCalled()
  })

  it('retorna 400 VALIDATION_ERROR quando preferredCompanyId é string inválida (não-cuid)', async () => {
    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: 'not-a-cuid' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('retorna 400 quando body não tem o campo obrigatório', async () => {
    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 403 FORBIDDEN quando usuário não tem membership ativa na company', async () => {
    mockMembershipFindFirst.mockResolvedValue(null)

    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: VALID_CUID })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('retorna 403 FORBIDDEN quando role=SUPPLIER (fornecedor bloqueado)', async () => {
    mockAuthRole = 'SUPPLIER'

    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: VALID_CUID })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockUserUpdate).not.toHaveBeenCalled()
    expect(mockMembershipFindFirst).not.toHaveBeenCalled()
  })

  it('valida membership filtrando por tenant_id do JWT (tenant isolation)', async () => {
    const app = buildApp()
    await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: VALID_CUID })

    // O where da query de validação precisa conter tenant_id
    expect(mockMembershipFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenant_id: 'tenant-001',
          user_id: 'user-001',
          company_id: VALID_CUID,
          is_active: true,
        }),
      })
    )
  })

  // ─── Admin Gravity (SUPER_ADMIN / ADMIN) ──────────────────────────────────
  // Admins Gravity não têm UserMembership — acesso é via tenant.

  it('SUPER_ADMIN salva preferido sem precisar de UserMembership', async () => {
    mockAuthRole = 'SUPER_ADMIN'
    mockMembershipFindFirst.mockResolvedValue(null) // não tem membership
    mockCompanyFindFirst.mockResolvedValue({ id: 'comp-1' }) // mas a company existe no tenant

    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: VALID_CUID })

    expect(res.status).toBe(200)
    expect(res.body.data.preferredCompanyId).toBe(VALID_CUID)
    expect(mockUserUpdate).toHaveBeenCalled()
    // SUPER_ADMIN nunca deveria nem ser consultado no membership
    expect(mockMembershipFindFirst).not.toHaveBeenCalled()
  })

  it('ADMIN salva preferido sem precisar de UserMembership', async () => {
    mockAuthRole = 'ADMIN'
    mockMembershipFindFirst.mockResolvedValue(null)
    mockCompanyFindFirst.mockResolvedValue({ id: 'comp-1' })

    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: VALID_CUID })

    expect(res.status).toBe(200)
    expect(mockMembershipFindFirst).not.toHaveBeenCalled()
  })

  it('SUPER_ADMIN recebe 403 se company não existe no tenant (tenant isolation)', async () => {
    mockAuthRole = 'SUPER_ADMIN'
    mockCompanyFindFirst.mockResolvedValue(null) // company não está no tenant do admin

    const app = buildApp()
    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: VALID_CUID })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('SUPER_ADMIN: validação de company filtra por tenant_id + status ACTIVE', async () => {
    mockAuthRole = 'SUPER_ADMIN'

    const app = buildApp()
    await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: VALID_CUID })

    expect(mockCompanyFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: VALID_CUID,
          tenant_id: 'tenant-001',
          status: 'ACTIVE',
        }),
      })
    )
  })
})
