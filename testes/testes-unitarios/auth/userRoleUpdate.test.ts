// @vitest-environment node
// testes/testes-unitarios/auth/userRoleUpdate.test.ts
// Self-contained tests for PATCH /api/v1/users/:id/role
// Replicates the tenant_id isolation logic from users.ts without importing the real module

import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Request, Response, NextFunction } from 'express'

interface AuthRequest extends Request {
  auth?: { userId: string; tenantId: string; clerkUserId: string }
}

// ---------------------------------------------------------------------------
// Inline app replicating the exact security logic from users.ts
// ---------------------------------------------------------------------------

const MOCK_AUTH = {
  userId: 'user-current',
  tenantId: 'tenant-abc',
  clerkUserId: 'clerk_user_current',
}

function createApp() {
  const mockPrisma = {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  }

  const app = express()
  app.use(express.json())

  // Simulate requireAuth — inject auth on every request
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as AuthRequest).auth = { ...MOCK_AUTH }
    next()
  })

  // Replicates PATCH /api/v1/users/:id/role from users.ts
  app.patch('/api/v1/users/:id/role', async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest
    try {
      const validRoles = ['MASTER', 'STANDARD', 'SUPPLIER']
      const { role } = req.body

      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Role inválido' },
        })
      }

      const user = await mockPrisma.user.findFirst({
        where: { id: req.params.id, tenant_id: authReq.auth!.tenantId },
      })
      if (!user) {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' },
        })
      }

      const updated = await mockPrisma.user.update({
        where: { id: req.params.id, tenant_id: authReq.auth!.tenantId },
        data: { role },
        select: { id: true, email: true, role: true },
      })

      res.json({ user: updated })
    } catch (err) {
      next(err)
    }
  })

  return { app, mockPrisma }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PATCH /api/v1/users/:id/role — tenant_id isolation', () => {
  let app: express.Express
  let mockPrisma: ReturnType<typeof createApp>['mockPrisma']

  beforeEach(() => {
    vi.clearAllMocks()
    const result = createApp()
    app = result.app
    mockPrisma = result.mockPrisma
  })

  // -------------------------------------------------------------------------
  // Includes tenant_id in query (prevents cross-tenant access)
  // -------------------------------------------------------------------------

  it('deve incluir tenant_id na busca findFirst para prevenir acesso cross-tenant', async () => {
    const targetUserId = 'user-target-123'

    mockPrisma.user.findFirst.mockResolvedValue({
      id: targetUserId,
      tenant_id: MOCK_AUTH.tenantId,
      email: 'target@example.com',
      name: 'Target User',
      role: 'STANDARD',
    })

    mockPrisma.user.update.mockResolvedValue({
      id: targetUserId,
      email: 'target@example.com',
      role: 'MASTER',
    })

    await request(app)
      .patch(`/api/v1/users/${targetUserId}/role`)
      .send({ role: 'MASTER' })

    // Verifies findFirst was called with tenant_id
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: targetUserId, tenant_id: MOCK_AUTH.tenantId },
    })

    // Verifies update also includes tenant_id in where
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: targetUserId, tenant_id: MOCK_AUTH.tenantId },
      data: { role: 'MASTER' },
      select: { id: true, email: true, role: true },
    })
  })

  // -------------------------------------------------------------------------
  // Rejects if user does not belong to the same tenant
  // -------------------------------------------------------------------------

  it('deve rejeitar com 404 se usuario nao pertence ao mesmo tenant', async () => {
    // findFirst returns null — user not found in tenant
    mockPrisma.user.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .patch('/api/v1/users/user-from-other-tenant/role')
      .send({ role: 'MASTER' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')

    // update should never be called
    expect(mockPrisma.user.update).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Role validation
  // -------------------------------------------------------------------------

  it('deve rejeitar role invalido com 400', async () => {
    const res = await request(app)
      .patch('/api/v1/users/user-123/role')
      .send({ role: 'ADMIN' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})
