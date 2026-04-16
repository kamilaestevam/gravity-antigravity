// server/__tests__/setup.ts
// Setup file para vitest — configura env vars e mocks globais

// Env vars já definidas no vitest.config.ts.env
// Este arquivo é para mocks que precisam existir antes dos imports.

// Mock do Prisma — evita conexão real em testes unitários
import { vi } from 'vitest'

vi.mock('../lib/prisma.js', () => ({
  prisma: {
    testLog: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
    testSchedule: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    testPlan: { findMany: vi.fn().mockResolvedValue([]) },
    tenant: { findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), update: vi.fn() },
    user: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}))

// Mock do Clerk
vi.mock('../lib/clerk.js', () => ({
  clerkClient: {
    users: { updateUserMetadata: vi.fn() },
    invitations: { createInvitation: vi.fn().mockResolvedValue({ id: 'inv_test' }) },
  },
}))

// Mock do AuditService — fire-and-forget
vi.mock('../../../tenant/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock('../../../tenant/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: { roleChanged: vi.fn().mockResolvedValue(undefined) },
}))

// Mock do billing
vi.mock('../lib/billing/index.js', () => ({
  getBillingProvider: vi.fn().mockReturnValue({
    name: 'mock',
    listInvoices: vi.fn().mockResolvedValue({ invoices: [], has_more: false }),
    getInvoice: vi.fn(),
    createInvoice: vi.fn(),
    voidInvoice: vi.fn(),
    sendInvoice: vi.fn(),
  }),
}))

// Mock do deploy log service
vi.mock('../services/deployLogService.js', () => ({
  deployLogService: {
    list: vi.fn().mockResolvedValue({ deploys: [], pagination: {} }),
    create: vi.fn(),
    getById: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock do rate limiter
vi.mock('../middleware/rateLimiter.js', () => ({
  rateLimitPresets: {
    admin: () => (_req: unknown, _res: unknown, next: () => void) => next(),
  },
}))

// Mock requireAuth e requireGravityAdmin
vi.mock('../middleware/requireAuth.js', () => ({
  requireAuth: (_req: unknown, _res: unknown, next: () => void) => {
    const req = _req as Record<string, unknown>
    req.auth = {
      userId: 'user-test-id',
      clerkUserId: 'clerk_test',
      tenantId: 'tenant-test-id',
      role: 'SUPER_ADMIN',
    }
    next()
  },
}))

vi.mock('../middleware/requireGravityAdmin.js', () => ({
  requireGravityAdmin: (_req: unknown, _res: unknown, next: () => void) => next(),
}))
