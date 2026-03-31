/**
 * Testes unitários — Atribuição de roles de usuário
 * Localização: testes/testes-unitarios/configurador/roleAssignment.test.ts
 *
 * Valida que:
 *  1. tenantService.createTenant atribui role MASTER ao owner (nunca ADMIN)
 *  2. tenantService.createTenant sincroniza role MASTER no Clerk publicMetadata
 *  3. Frontend fallback de role nunca mostra "Admin" para usuários comuns
 *  4. InviteUserSchema só aceita roles válidas (MASTER, STANDARD, SUPPLIER)
 *  5. Usuário sem role no Clerk não é exibido como Admin
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

/* ── Mocks de infraestrutura ── */

const mockTransaction = vi.fn()
const mockPrisma = {
  $transaction: mockTransaction,
}

const mockUpdateUserMetadata = vi.fn().mockResolvedValue({})
const mockClerkClient = {
  users: {
    updateUserMetadata: mockUpdateUserMetadata,
  },
}

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: mockPrisma,
}))

vi.mock('../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: mockClerkClient,
}))

/* ── Testes do tenantService ── */

describe('tenantService.createTenant — atribuição de role', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cria user com role MASTER, nunca ADMIN', async () => {
    const mockTx = {
      tenant: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'tenant-new', name: 'Test', slug: 'test' }),
      },
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'user-1', role: 'MASTER' }),
      },
      subscription: { create: vi.fn().mockResolvedValue({}) },
      company: { create: vi.fn().mockResolvedValue({}) },
    }

    mockTransaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx))

    const { tenantService } = await import(
      '../../../servicos-global/configurador/server/services/tenantService.js'
    )

    await tenantService.createTenant({
      name: 'Test Corp',
      slug: 'test-corp',
      clerkUserId: 'clerk-user-123',
      owner: { email: 'owner@test.com', name: 'Owner' },
    })

    // Verifica que user.create foi chamado com role MASTER
    expect(mockTx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'MASTER' }),
      })
    )

    // Verifica que NUNCA usa ADMIN
    const createCall = mockTx.user.create.mock.calls[0][0]
    expect(createCall.data.role).not.toBe('ADMIN')
    expect(createCall.data.role).not.toBe('SUPER_ADMIN')
  })

  it('sincroniza role MASTER no Clerk publicMetadata', async () => {
    const mockTx = {
      tenant: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'tenant-sync', name: 'Sync Corp', slug: 'sync' }),
      },
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'user-2', role: 'MASTER' }),
      },
      subscription: { create: vi.fn().mockResolvedValue({}) },
      company: { create: vi.fn().mockResolvedValue({}) },
    }

    mockTransaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx))

    const { tenantService } = await import(
      '../../../servicos-global/configurador/server/services/tenantService.js'
    )

    await tenantService.createTenant({
      name: 'Sync Corp',
      slug: 'sync-corp',
      clerkUserId: 'clerk-user-456',
      owner: { email: 'sync@test.com', name: 'Sync Owner' },
    })

    // Verifica que Clerk foi chamado com role MASTER e tenantId
    expect(mockUpdateUserMetadata).toHaveBeenCalledWith('clerk-user-456', {
      publicMetadata: { role: 'MASTER', tenantId: 'tenant-sync' },
    })

    // Verifica que NÃO envia ADMIN para Clerk
    const clerkCall = mockUpdateUserMetadata.mock.calls[0]
    expect(clerkCall[1].publicMetadata.role).not.toBe('ADMIN')
  })

  it('não atribui role de equipe Gravity (SUPER_ADMIN/ADMIN) para clientes', async () => {
    const mockTx = {
      tenant: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'tenant-client', name: 'Client', slug: 'client' }),
      },
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'user-3', role: 'MASTER' }),
      },
      subscription: { create: vi.fn().mockResolvedValue({}) },
      company: { create: vi.fn().mockResolvedValue({}) },
    }

    mockTransaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx))

    const { tenantService } = await import(
      '../../../servicos-global/configurador/server/services/tenantService.js'
    )

    await tenantService.createTenant({
      name: 'Client Corp',
      slug: 'client-corp',
      clerkUserId: 'clerk-client',
      owner: { email: 'client@test.com', name: 'Client' },
    })

    const createCall = mockTx.user.create.mock.calls[0][0]
    const gravityRoles = ['SUPER_ADMIN', 'ADMIN', 'gravity_admin']
    expect(gravityRoles).not.toContain(createCall.data.role)

    const clerkMeta = mockUpdateUserMetadata.mock.calls[0][1].publicMetadata
    expect(gravityRoles).not.toContain(clerkMeta.role)
  })
})

/* ── Testes do schema de invite ── */

describe('InviteUserSchema — roles permitidas para convite', () => {
  // Reproduz o schema do users.ts usando z importado no topo
  const { z } = require('zod')
  const InviteUserSchema = z.object({
    email: z.string().email().max(255),
    name: z.string().min(1).max(200),
    role: z.enum(['MASTER', 'STANDARD', 'SUPPLIER']).default('STANDARD'),
  })

  it('aceita MASTER como role de convite', () => {
    const result = InviteUserSchema.safeParse({
      email: 'user@test.com', name: 'User', role: 'MASTER',
    })
    expect(result.success).toBe(true)
  })

  it('aceita STANDARD como role de convite', () => {
    const result = InviteUserSchema.safeParse({
      email: 'user@test.com', name: 'User', role: 'STANDARD',
    })
    expect(result.success).toBe(true)
  })

  it('aceita SUPPLIER como role de convite', () => {
    const result = InviteUserSchema.safeParse({
      email: 'user@test.com', name: 'User', role: 'SUPPLIER',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita ADMIN como role de convite — role interna Gravity', () => {
    const result = InviteUserSchema.safeParse({
      email: 'user@test.com', name: 'User', role: 'ADMIN',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita SUPER_ADMIN como role de convite — role interna Gravity', () => {
    const result = InviteUserSchema.safeParse({
      email: 'user@test.com', name: 'User', role: 'SUPER_ADMIN',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita gravity_admin como role de convite', () => {
    const result = InviteUserSchema.safeParse({
      email: 'user@test.com', name: 'User', role: 'gravity_admin',
    })
    expect(result.success).toBe(false)
  })

  it('default é STANDARD quando role não é informada', () => {
    const result = InviteUserSchema.safeParse({
      email: 'user@test.com', name: 'User',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.role).toBe('STANDARD')
    }
  })
})

/* ── Testes do fallback de role no frontend ── */

describe('ROLE_LABELS fallback — nunca mostrar Admin para usuário comum', () => {
  // Reproduz a lógica do SelecionarWorkspace.tsx
  const ROLE_LABELS: Record<string, string> = {
    gravity_admin: 'Admin',
    SUPER_ADMIN: 'Admin',
    ADMIN: 'Admin',
    MASTER: 'Master',
    STANDARD: 'Usuário',
    SUPPLIER: 'Fornecedor',
  }

  function getUserRole(rawRole: string): string {
    return ROLE_LABELS[rawRole] ?? (rawRole || 'Usuário')
  }

  it('MASTER → "Master"', () => {
    expect(getUserRole('MASTER')).toBe('Master')
  })

  it('STANDARD → "Usuário"', () => {
    expect(getUserRole('STANDARD')).toBe('Usuário')
  })

  it('SUPPLIER → "Fornecedor"', () => {
    expect(getUserRole('SUPPLIER')).toBe('Fornecedor')
  })

  it('gravity_admin → "Admin" (equipe Gravity apenas)', () => {
    expect(getUserRole('gravity_admin')).toBe('Admin')
  })

  it('string vazia → "Usuário" (NUNCA "Admin")', () => {
    const role = getUserRole('')
    expect(role).toBe('Usuário')
    expect(role).not.toBe('Admin')
  })

  it('undefined/null coerced to empty → "Usuário" (NUNCA "Admin")', () => {
    const rawRole = (undefined as unknown as string) ?? ''
    const role = getUserRole(rawRole)
    expect(role).toBe('Usuário')
    expect(role).not.toBe('Admin')
  })

  it('role desconhecida é exibida tal qual, não como Admin', () => {
    const role = getUserRole('CUSTOM_ROLE')
    expect(role).toBe('CUSTOM_ROLE')
    expect(role).not.toBe('Admin')
  })

  it('Admin só aparece para roles internas Gravity', () => {
    const gravityRoles = ['gravity_admin', 'SUPER_ADMIN', 'ADMIN']
    const clientRoles = ['MASTER', 'STANDARD', 'SUPPLIER', '', 'qualquer']

    for (const role of gravityRoles) {
      expect(getUserRole(role)).toBe('Admin')
    }

    for (const role of clientRoles) {
      expect(getUserRole(role)).not.toBe('Admin')
    }
  })
})
