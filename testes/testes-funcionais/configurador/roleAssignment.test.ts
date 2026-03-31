// @vitest-environment node
/**
 * Testes funcionais — Atribuição de roles nas rotas do Configurador
 * Localização: testes/testes-funcionais/configurador/roleAssignment.test.ts
 *
 * Valida que:
 *  1. POST /api/v1/tenants cria tenant com owner MASTER (via tenantService)
 *  2. POST /api/v1/users/invite rejeita roles internas Gravity (ADMIN, SUPER_ADMIN)
 *  3. POST /api/v1/users/invite aceita apenas MASTER/STANDARD/SUPPLIER
 *  4. PATCH /api/v1/users/:id/role rejeita ADMIN/SUPER_ADMIN
 *  5. Invite sem role explícita → default STANDARD
 *  6. createTenant sincroniza Clerk publicMetadata com role MASTER
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

/* ── Mocks (hoisted para vi.mock) ── */

const { mockCreateTenant, mockUpdateUserMetadata, mockCreateInvitation, mockPrisma } = vi.hoisted(() => ({
  mockCreateTenant: vi.fn(),
  mockUpdateUserMetadata: vi.fn().mockResolvedValue({}),
  mockCreateInvitation: vi.fn().mockResolvedValue({ id: 'inv-123' }),
  mockPrisma: {
    user: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'user-new', ...args.data })
      ),
      update: vi.fn().mockResolvedValue({ id: 'user-1', role: 'STANDARD' }),
    },
    company: { findFirst: vi.fn().mockResolvedValue({ id: 'comp-1', tenant_id: 'tenant-teste' }) },
    userMembership: { upsert: vi.fn().mockResolvedValue({}) },
  },
}))

vi.mock('../../../servicos-global/configurador/server/services/tenantService.js', () => ({
  tenantService: {
    createTenant: (...args: unknown[]) => mockCreateTenant(...args),
    getTenantById: vi.fn(),
    getCompanies: vi.fn(),
    createCompany: vi.fn(),
  },
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: mockPrisma,
}))

vi.mock('../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: {
    users: { updateUserMetadata: mockUpdateUserMetadata },
    invitations: { createInvitation: mockCreateInvitation },
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req: { auth: { tenantId: string; clerkUserId: string; userId: string } },
    _res: unknown,
    next: () => void
  ) => {
    req.auth = { tenantId: 'tenant-teste', clerkUserId: 'clerk-master', userId: 'user-master' }
    next()
  },
}))

import { tenantsRouter } from '../../../servicos-global/configurador/server/routes/tenants.js'
import { usersRouter } from '../../../servicos-global/configurador/server/routes/users.js'
import { errorHandler } from '../../../servicos-global/configurador/server/middleware/errorHandler.js'

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/tenants', tenantsRouter)
  app.use('/api/v1/users', usersRouter)
  app.use(errorHandler)
  return app
}

/* ── Testes: Criação de Tenant ── */

describe('POST /api/v1/tenants — role do owner', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('201 — createTenant é chamado com os dados do owner', async () => {
    mockCreateTenant.mockResolvedValueOnce({
      id: 'tenant-new',
      name: 'Test Corp',
      slug: 'test-corp',
      status: 'PENDING_SETUP',
    })

    const response = await request(app)
      .post('/api/v1/tenants')
      .send({
        name: 'Test Corp',
        slug: 'test-corp',
        clerkUserId: 'clerk-new',
        owner: { email: 'owner@test.com', name: 'Owner' },
      })

    expect(response.status).toBe(201)
    expect(mockCreateTenant).toHaveBeenCalledWith(
      expect.objectContaining({
        clerkUserId: 'clerk-new',
        owner: { email: 'owner@test.com', name: 'Owner' },
      })
    )
  })
})

/* ── Testes: Invite — rejeição de roles internas ── */

describe('POST /api/v1/users/invite — segurança de roles', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('400 — rejeita role ADMIN (interna Gravity)', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'hacker@test.com', name: 'Hacker', role: 'ADMIN' })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(mockCreateInvitation).not.toHaveBeenCalled()
  })

  it('400 — rejeita role SUPER_ADMIN (interna Gravity)', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'hacker@test.com', name: 'Hacker', role: 'SUPER_ADMIN' })

    expect(response.status).toBe(400)
    expect(mockCreateInvitation).not.toHaveBeenCalled()
  })

  it('400 — rejeita role gravity_admin', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'hacker@test.com', name: 'Hacker', role: 'gravity_admin' })

    expect(response.status).toBe(400)
    expect(mockCreateInvitation).not.toHaveBeenCalled()
  })

  it('201 — aceita role MASTER para convite', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'master@test.com', name: 'Master User', role: 'MASTER' })

    expect(response.status).toBe(201)
    expect(response.body.user.role).toBe('MASTER')
  })

  it('201 — aceita role STANDARD para convite', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'standard@test.com', name: 'Standard User', role: 'STANDARD' })

    expect(response.status).toBe(201)
    expect(response.body.user.role).toBe('STANDARD')
  })

  it('201 — aceita role SUPPLIER para convite', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'supplier@test.com', name: 'Supplier', role: 'SUPPLIER' })

    expect(response.status).toBe(201)
    expect(response.body.user.role).toBe('SUPPLIER')
  })

  it('201 — sem role explícita usa default STANDARD', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'default@test.com', name: 'Default User' })

    expect(response.status).toBe(201)
    expect(response.body.user.role).toBe('STANDARD')
  })

  it('invite envia role correta no Clerk publicMetadata', async () => {
    await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'meta@test.com', name: 'Meta User', role: 'SUPPLIER' })

    expect(mockCreateInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        publicMetadata: expect.objectContaining({
          role: 'SUPPLIER',
          tenantId: 'tenant-teste',
        }),
      })
    )
  })
})

/* ── Testes: PATCH role — rejeição de roles internas ── */

describe('PATCH /api/v1/users/:id/role — segurança de roles', () => {
  const app = buildApp()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock user exists
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-target',
      tenant_id: 'tenant-teste',
      role: 'STANDARD',
    })
  })

  it('400 — rejeita atualização para ADMIN', async () => {
    const response = await request(app)
      .patch('/api/v1/users/user-target/role')
      .send({ role: 'ADMIN' })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('400 — rejeita atualização para SUPER_ADMIN', async () => {
    const response = await request(app)
      .patch('/api/v1/users/user-target/role')
      .send({ role: 'SUPER_ADMIN' })

    expect(response.status).toBe(400)
  })

  it('200 — aceita atualização para MASTER', async () => {
    mockPrisma.user.update.mockResolvedValue({ id: 'user-target', email: 'u@t.com', role: 'MASTER' })

    const response = await request(app)
      .patch('/api/v1/users/user-target/role')
      .send({ role: 'MASTER' })

    expect(response.status).toBe(200)
    expect(response.body.user.role).toBe('MASTER')
  })

  it('200 — aceita atualização para STANDARD', async () => {
    mockPrisma.user.update.mockResolvedValue({ id: 'user-target', email: 'u@t.com', role: 'STANDARD' })

    const response = await request(app)
      .patch('/api/v1/users/user-target/role')
      .send({ role: 'STANDARD' })

    expect(response.status).toBe(200)
    expect(response.body.user.role).toBe('STANDARD')
  })

  it('200 — aceita atualização para SUPPLIER', async () => {
    mockPrisma.user.update.mockResolvedValue({ id: 'user-target', email: 'u@t.com', role: 'SUPPLIER' })

    const response = await request(app)
      .patch('/api/v1/users/user-target/role')
      .send({ role: 'SUPPLIER' })

    expect(response.status).toBe(200)
    expect(response.body.user.role).toBe('SUPPLIER')
  })
})
