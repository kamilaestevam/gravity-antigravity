// @vitest-environment node
// testes/testes-funcionais/configurador/users.test.ts
// Testes funcionais — rotas do Configurador: usuários e memberships
//
// GET   /api/v1/users
// POST  /api/v1/users/invite
// POST  /api/v1/users/:id/memberships
// PATCH /api/v1/users/:id/role
//
// Estratégia: mock do Prisma e do Clerk para isolamento total.
// Cross-tenant: garantido pela injeção do tenant_id via mock de requireAuth.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { usersRouter } from '../../../servicos-global/configurador/server/routes/users.js'
import { errorHandler } from '../../../servicos-global/configurador/server/middleware/errorHandler.js'

// ─── Mocks ──────────────────────────────────────────────────────────────────
const mockPrisma = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  company: {
    findFirst: vi.fn(),
  },
  userMembership: {
    upsert: vi.fn(),
  },
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: mockPrisma,
}))
const mockClerkClient = vi.hoisted(() => ({
  invitations: {
    createInvitation: vi.fn(),
  },
}))

vi.mock('../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: mockClerkClient,
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req: { auth: { tenantId: string; clerkUserId: string } },
    _res: unknown,
    next: () => void
  ) => {
    req.auth = { tenantId: 'tenant-abc', clerkUserId: 'clerk-abc' }
    next()
  },
}))

// ─── App de teste isolado ────────────────────────────────────────────────────

function buildApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/v1/users', usersRouter)
  app.use(errorHandler)
  return app
}

// ─── Suites ─────────────────────────────────────────────────────────────────

describe('GET /api/v1/users — listar usuários do tenant', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna apenas usuários do tenant autenticado', async () => {
    const mockUsers = [
      { id: 'user-1', name: 'Ana', email: 'ana@emp.com', role: 'OWNER', created_at: new Date(), memberships: [] },
      { id: 'user-2', name: 'Bruno', email: 'bruno@emp.com', role: 'MEMBER', created_at: new Date(), memberships: [] },
    ]
    mockPrisma.user.findMany.mockResolvedValueOnce(mockUsers)

    const response = await request(app).get('/api/v1/users')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('users')
    expect(response.body.users).toHaveLength(2)
    // Garante que o filtro por tenant_id foi aplicado
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenant_id: 'tenant-abc' } })
    )
  })

  it('200 — isolamento cross-tenant: findMany filtra por tenant_id injetado pelo auth', async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([])

    await request(app).get('/api/v1/users')

    const call = mockPrisma.user.findMany.mock.calls[0][0]
    expect(call.where.tenant_id).toBe('tenant-abc')
    // Nunca deve usar tenant_id diferente do injetado pelo auth
    expect(call.where.tenant_id).not.toBe('outro-tenant')
  })

  it('200 — lista vazia quando tenant não tem usuários', async () => {
    mockPrisma.user.findMany.mockResolvedValueOnce([])

    const response = await request(app).get('/api/v1/users')

    expect(response.status).toBe(200)
    expect(response.body.users).toHaveLength(0)
  })
})

describe('POST /api/v1/users/invite — convidar usuário', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('201 — convite enviado com sucesso', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce(null) // não existe ainda
    mockClerkClient.invitations.createInvitation.mockResolvedValueOnce({
      id: 'inv-001',
    })
    mockPrisma.user.create.mockResolvedValueOnce({
      id: 'user-novo',
      email: 'novo@empresa.com',
      role: 'MEMBER',
    })

    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'novo@empresa.com', name: 'Novo Usuário', role: 'MEMBER' })

    expect(response.status).toBe(201)
    expect(response.body.message).toContain('sucesso')
    expect(response.body.user.email).toBe('novo@empresa.com')
    expect(mockClerkClient.invitations.createInvitation).toHaveBeenCalledTimes(1)
  })

  it('409 — conflito quando usuário já pertence ao tenant', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-existente' })

    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'existente@empresa.com', name: 'Já Existe' })

    expect(response.status).toBe(409)
    expect(response.body.error).toHaveProperty('code', 'CONFLICT')
    expect(mockClerkClient.invitations.createInvitation).not.toHaveBeenCalled()
  })

  it('400 — email inválido', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'nao-e-email', name: 'Teste' })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled()
  })

  it('400 — nome vazio', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'teste@empresa.com', name: '' })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('400 — role inválido rejeitado pelo Zod', async () => {
    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'teste@empresa.com', name: 'Teste', role: 'SUPER_ADMIN' })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })

  it('convidar com role VIEWER — aceito', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce(null)
    mockClerkClient.invitations.createInvitation.mockResolvedValueOnce({ id: 'inv-002' })
    mockPrisma.user.create.mockResolvedValueOnce({
      id: 'user-viewer',
      email: 'viewer@empresa.com',
      role: 'VIEWER',
    })

    const response = await request(app)
      .post('/api/v1/users/invite')
      .send({ email: 'viewer@empresa.com', name: 'Viewer', role: 'VIEWER' })

    expect(response.status).toBe(201)
    expect(response.body.user.role).toBe('VIEWER')
  })
})

describe('POST /api/v1/users/:id/memberships — habilitar em empresa filha', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('201 — membership criado com sucesso', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-1', tenant_id: 'tenant-abc' })
    mockPrisma.company.findFirst.mockResolvedValueOnce({ id: 'company-1', tenant_id: 'tenant-abc' })
    mockPrisma.userMembership.upsert.mockResolvedValueOnce({
      id: 'membership-1',
      tenant_id: 'tenant-abc',
      user_id: 'user-1',
      company_id: 'company-1',
      role: 'STANDARD',
      is_active: true,
    })

    const response = await request(app)
      .post('/api/v1/users/user-1/memberships')
      .send({ companyId: 'company-1', role: 'STANDARD' })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('membership')
    expect(response.body.membership.role).toBe('STANDARD')
  })

  it('404 — usuário não pertence ao tenant (cross-tenant bloqueado)', async () => {
    // Simula usuário de outro tenant — findFirst retorna null (filtro tenant_id)
    mockPrisma.user.findFirst.mockResolvedValueOnce(null)

    const response = await request(app)
      .post('/api/v1/users/user-outro-tenant/memberships')
      .send({ companyId: 'company-1', role: 'STANDARD' })

    expect(response.status).toBe(404)
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND')
    // Garante que não consultou company nem criou membership
    expect(mockPrisma.company.findFirst).not.toHaveBeenCalled()
    expect(mockPrisma.userMembership.upsert).not.toHaveBeenCalled()
  })

  it('404 — empresa filha não pertence ao tenant (cross-tenant bloqueado)', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-1', tenant_id: 'tenant-abc' })
    mockPrisma.company.findFirst.mockResolvedValueOnce(null) // empresa de outro tenant

    const response = await request(app)
      .post('/api/v1/users/user-1/memberships')
      .send({ companyId: 'company-outro-tenant', role: 'STANDARD' })

    expect(response.status).toBe(404)
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND')
    expect(mockPrisma.userMembership.upsert).not.toHaveBeenCalled()
  })

  it('400 — role de membership inválido', async () => {
    const response = await request(app)
      .post('/api/v1/users/user-1/memberships')
      .send({ companyId: 'company-1', role: 'ADMIN' }) // ADMIN não existe em UserMembershipRole

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
  })
})

describe('PATCH /api/v1/users/:id/role — atualizar role do usuário', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — role atualizado com sucesso', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-1', tenant_id: 'tenant-abc' })
    mockPrisma.user.update.mockResolvedValueOnce({
      id: 'user-1',
      email: 'ana@empresa.com',
      role: 'ADMIN',
    })

    const response = await request(app)
      .patch('/api/v1/users/user-1/role')
      .send({ role: 'ADMIN' })

    expect(response.status).toBe(200)
    expect(response.body.user.role).toBe('ADMIN')
  })

  it('404 — usuário não encontrado no tenant (cross-tenant bloqueado)', async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce(null)

    const response = await request(app)
      .patch('/api/v1/users/user-inexistente/role')
      .send({ role: 'ADMIN' })

    expect(response.status).toBe(404)
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND')
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  it('400 — role inválido rejeitado pelo Zod', async () => {
    const response = await request(app)
      .patch('/api/v1/users/user-1/role')
      .send({ role: 'SUPER_ADMIN' })

    expect(response.status).toBe(400)
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR')
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled()
  })
})
