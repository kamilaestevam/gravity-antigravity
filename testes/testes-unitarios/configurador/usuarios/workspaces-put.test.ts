// @vitest-environment node
// TST-UNIT-CONFIG-WSUP-001 — UpdateWorkspacesSchema (Zod) + computarDiff (lógica pura)
// Plano: testes/testes-unitarios/configurador/_planos/users-workspaces-put.plan.json
/// <reference types="vitest/globals" />

// Mocks necessários para isolar a importação do módulo users.ts
// (evita side-effects de clerk.ts, prisma.ts, securityAuditLogger.ts ao carregar o módulo)
vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { invitations: { createInvitation: vi.fn() } },
}))
vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario: {}, empresa: {}, usuarioWorkspace: {}, $transaction: vi.fn(),
  },
}))
vi.mock('../../../../servicos-global/configurador/server/lib/syncRole.js', () => ({
  syncRoleToClerk: vi.fn(),
}))
vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: { roleChanged: vi.fn(), permissionChanged: vi.fn() },
}))
vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/middleware/requireMasterRole.js', () => ({
  requireMasterRole: vi.fn(),
}))

import { UpdateWorkspacesSchema } from '../../../../servicos-global/configurador/server/routes/users.js'

const CUID_A = 'cld8n2b0j0000mhog1234ws01'
const CUID_B = 'cld8n2b0j0001mhog1234ws02'
const CUID_C = 'cld8n2b0j0002mhog1234ws03'

// ─── UpdateWorkspacesSchema: Happy Path ──────────────────────────────────────
describe('TST-UNIT-CONFIG-WSUP-001..002 — UpdateWorkspacesSchema: happy path', () => {

  it('array de 1 CUID válido → success: true', () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: [CUID_A] })
    expect(result.success).toBe(true)
  })

  it('array de 3 CUIDs únicos válidos → success: true', () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: [CUID_A, CUID_B, CUID_C] })
    expect(result.success).toBe(true)
  })
})

// ─── UpdateWorkspacesSchema: Sad Path ────────────────────────────────────────
describe('TST-UNIT-CONFIG-WSUP-003..007 — UpdateWorkspacesSchema: sad path', () => {

  it('array vazio [] → success: false com mensagem "pelo menos um workspace"', () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain('pelo menos um workspace')
    }
  })

  it('campo workspaces ausente → success: false', () => {
    const result = UpdateWorkspacesSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('workspaces: "all" (string) → success: false', () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: 'all' })
    expect(result.success).toBe(false)
  })

  it('workspaces: null → success: false', () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: null })
    expect(result.success).toBe(false)
  })

  it('workspaces: número 42 → success: false', () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: 42 })
    expect(result.success).toBe(false)
  })
})

// ─── UpdateWorkspacesSchema: Edge Cases ──────────────────────────────────────
describe('TST-UNIT-CONFIG-WSUP-008..010 — UpdateWorkspacesSchema: edge cases', () => {

  it('CUIDs duplicados no array → success: false com "Workspaces duplicados não são permitidos"', () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: [CUID_A, CUID_A] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0]?.message).toBe('Workspaces duplicados não são permitidos')
    }
  })

  it('UUID v4 (não-CUID) no array → success: false', () => {
    const uuidV4 = '550e8400-e29b-41d4-a716-446655440000'
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: [uuidV4] })
    expect(result.success).toBe(false)
  })

  it('string "invalid-cuid-format" → success: false', () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: ['invalid-cuid-format'] })
    expect(result.success).toBe(false)
  })
})

// ─── UpdateWorkspacesSchema: Adversarial ─────────────────────────────────────
describe('TST-UNIT-CONFIG-WSUP-011..012 — UpdateWorkspacesSchema: adversarial', () => {

  it('<script>alert(1)</script> como workspace ID → CUID rejeita, success: false', () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: ['<script>alert(1)</script>'] })
    expect(result.success).toBe(false)
  })

  it("' OR 1=1-- como workspace ID → CUID rejeita, success: false", () => {
    const result = UpdateWorkspacesSchema.safeParse({ workspaces: ["' OR 1=1--"] })
    expect(result.success).toBe(false)
  })
})

// ─── computarDiff: lógica pura de diff ───────────────────────────────────────
// Extração da lógica inline do handler PUT /:id/workspaces para teste isolado

function computarDiff(
  antes: string[],
  depois: string[],
): { adicionados: string[]; removidos: string[] } {
  return {
    adicionados: depois.filter((id) => !antes.includes(id)),
    removidos:   antes.filter((id)  => !depois.includes(id)),
  }
}

describe('TST-UNIT-CONFIG-WSUP-013..018 — computarDiff: lógica pura', () => {

  it('adicionar workspace novo → adicionados=[novo], removidos=[]', () => {
    const { adicionados, removidos } = computarDiff([CUID_A], [CUID_A, CUID_B])
    expect(adicionados).toEqual([CUID_B])
    expect(removidos).toEqual([])
  })

  it('remover workspace → adicionados=[], removidos=[removido]', () => {
    const { adicionados, removidos } = computarDiff([CUID_A, CUID_B], [CUID_A])
    expect(adicionados).toEqual([])
    expect(removidos).toEqual([CUID_B])
  })

  it('substituição completa → adicionados=[C], removidos=[A]', () => {
    const { adicionados, removidos } = computarDiff([CUID_A], [CUID_C])
    expect(adicionados).toEqual([CUID_C])
    expect(removidos).toEqual([CUID_A])
  })

  it('sem mudança (antes === depois) → adicionados=[], removidos=[]', () => {
    const { adicionados, removidos } = computarDiff([CUID_A, CUID_B], [CUID_A, CUID_B])
    expect(adicionados).toEqual([])
    expect(removidos).toEqual([])
  })

  it('antes vazio → todos os IDs são adicionados', () => {
    const { adicionados, removidos } = computarDiff([], [CUID_A, CUID_B])
    expect(adicionados).toEqual([CUID_A, CUID_B])
    expect(removidos).toEqual([])
  })

  it('depois vazio → todos os IDs são removidos (edge: bloqueado por min(1) em produção)', () => {
    const { adicionados, removidos } = computarDiff([CUID_A, CUID_B], [])
    expect(adicionados).toEqual([])
    expect(removidos).toEqual([CUID_A, CUID_B])
  })
})
