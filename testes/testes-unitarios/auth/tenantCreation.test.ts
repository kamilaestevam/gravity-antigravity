// @vitest-environment node
// testes/testes-unitarios/auth/tenantCreation.test.ts
// Testes unitarios para tenantService.createTenant
// Valida que a criacao usa $transaction e rejeita slugs duplicados

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => {
  const mockTx = {
    tenant: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
    },
  }

  return {
    prisma: {
      $transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
        return fn(mockTx)
      }),
      __mockTx: mockTx,
    },
  }
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('tenantService.createTenant — $transaction e slug duplicado', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  const validInput = {
    name: 'Acme Corp',
    slug: 'acme-corp',
    clerkUserId: 'clerk_user_abc',
    owner: { email: 'owner@acme.com', name: 'Owner Name' },
  }

  // -------------------------------------------------------------------------
  // Usa $transaction
  // -------------------------------------------------------------------------

  it('deve usar $transaction para criacao atomica do tenant', async () => {
    const { prisma } = await import(
      '../../../servicos-global/configurador/server/lib/prisma.js'
    )
    const mockTx = (prisma as any).__mockTx

    // Nenhum conflito
    mockTx.tenant.findUnique.mockResolvedValue(null)
    mockTx.user.findFirst.mockResolvedValue(null)
    mockTx.tenant.create.mockResolvedValue({
      id: 'tenant-new-id',
      name: validInput.name,
      slug: validInput.slug,
      status: 'PENDING_SETUP',
    })
    mockTx.user.create.mockResolvedValue({ id: 'user-new-id' })
    mockTx.subscription.create.mockResolvedValue({ id: 'sub-new-id' })

    const { tenantService } = await import(
      '../../../servicos-global/configurador/server/services/tenantService.js'
    )

    const result = await tenantService.createTenant(validInput)

    // $transaction deve ter sido chamado
    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function))

    // Dentro da transacao: tenant, user e subscription devem ser criados
    expect(mockTx.tenant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: validInput.name,
        slug: validInput.slug,
        status: 'PENDING_SETUP',
      }),
    })

    expect(mockTx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenant_id: 'tenant-new-id',
        clerk_user_id: validInput.clerkUserId,
        email: validInput.owner.email,
        role: 'MASTER',
      }),
    })

    expect(mockTx.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenant_id: 'tenant-new-id',
        plan: 'STARTER',
        status: 'TRIALING',
      }),
    })

    expect(result.id).toBe('tenant-new-id')
  })

  // -------------------------------------------------------------------------
  // Rejeita slug duplicado
  // -------------------------------------------------------------------------

  it('deve rejeitar criacao quando slug ja existe', async () => {
    const { prisma } = await import(
      '../../../servicos-global/configurador/server/lib/prisma.js'
    )
    const mockTx = (prisma as any).__mockTx

    // Slug ja existe
    mockTx.tenant.findUnique.mockResolvedValue({
      id: 'existing-tenant',
      slug: validInput.slug,
    })

    const { tenantService } = await import(
      '../../../servicos-global/configurador/server/services/tenantService.js'
    )

    await expect(tenantService.createTenant(validInput)).rejects.toThrow(
      'Este slug já está em uso'
    )

    // Nenhuma criacao deve ter ocorrido
    expect(mockTx.tenant.create).not.toHaveBeenCalled()
    expect(mockTx.user.create).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // Rejeita usuario duplicado
  // -------------------------------------------------------------------------

  it('deve rejeitar criacao quando clerk_user_id ja possui tenant', async () => {
    const { prisma } = await import(
      '../../../servicos-global/configurador/server/lib/prisma.js'
    )
    const mockTx = (prisma as any).__mockTx

    mockTx.tenant.findUnique.mockResolvedValue(null) // slug livre
    mockTx.user.findFirst.mockResolvedValue({
      id: 'existing-user',
      clerk_user_id: validInput.clerkUserId,
    })

    const { tenantService } = await import(
      '../../../servicos-global/configurador/server/services/tenantService.js'
    )

    await expect(tenantService.createTenant(validInput)).rejects.toThrow(
      'Usuário já possui um tenant'
    )

    expect(mockTx.tenant.create).not.toHaveBeenCalled()
  })
})
