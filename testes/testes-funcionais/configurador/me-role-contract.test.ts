// @vitest-environment node
// TST-FUN-CONFIG-ME-001 — GET /api/v1/me contrato de role (complementar a me-contract.test.ts)
// BUG DETECTION: ME-005 documenta que banco com role='USUÁRIO' viola meResponseSchema
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockFindUnique,
  mockEmpresaFindFirst,
  mockWsFindFirst,
  mockUsuarioUpdate,
  mockRequireAuth,
} = vi.hoisted(() => ({
  mockFindUnique:       vi.fn(),
  mockEmpresaFindFirst: vi.fn(),
  mockWsFindFirst:      vi.fn(),
  mockUsuarioUpdate:    vi.fn(),
  mockRequireAuth:      vi.fn(),
}))

vi.mock('../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:          { findUnique: mockFindUnique, update: mockUsuarioUpdate },
    empresa:          { findFirst: mockEmpresaFindFirst },
    usuarioWorkspace: { findFirst: mockWsFindFirst },
  },
}))

vi.mock('../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (
    req:  Record<string, unknown>,
    res:  Record<string, unknown>,
    next: () => void,
  ) => mockRequireAuth(req, res, next),
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import {
  meRouter,
  meResponseSchema,
} from '../../../servicos-global/configurador/server/routes/me.js'
import { AppError } from '../../../servicos-global/configurador/server/lib/appError.js'

// ─── App de teste ─────────────────────────────────────────────────────────────
const app = express()
app.use(express.json())
app.use('/api/v1/me', meRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } })
})

// ─── Auth helpers ─────────────────────────────────────────────────────────────
type AuthPayload = { userId: string; tenantId: string; role: string }

function injectAuth(auth: AuthPayload = { userId: 'usr_contract_01', tenantId: 'ten_contract_01', role: 'MASTER' }) {
  mockRequireAuth.mockImplementation((req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = auth
    next()
  })
}

function rejectAuth(code = 'UNAUTHORIZED', status = 401) {
  mockRequireAuth.mockImplementation(
    (_req: unknown, res: Record<string, unknown>, _next: unknown) => {
      (res as Response).status(status).json({ error: { code } })
    },
  )
}

// ─── Fixture ─────────────────────────────────────────────────────────────────
function makeUsuario(role: string) {
  return {
    id_usuario:           'usr_contract_01',
    name:                 'Contract Tester',
    email:                'contract@gravity.com.br',
    role,
    tenant_id:            'ten_contract_01',
    preferred_company_id: null,
    organizacao: {
      id_organizacao: 'ten_contract_01',
      name:           'Empresa Contract Ltda',
      slug:           'empresa-contract',
      status:         'ACTIVE',
    },
    memberships: [
      {
        role: 'MASTER',
        company: {
          id:               'ws_contract_01',
          name:             'Workspace Alpha',
          status:           'ACTIVE',
          company_products: [{ product_key: 'pedido' }],
        },
      },
    ],
  }
}

// ─── Setup / Teardown ────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks()
  injectAuth()
})

// ─── ME-004 / ME-005 / ME-006 — tipo_usuario enum guard ──────────────────────
describe('GET /api/v1/me — tipo_usuario enum guard', () => {
  it('ME-004: tipo_usuario nunca é "USUÁRIO" — é sempre um dos 5 valores válidos', async () => {
    mockFindUnique.mockResolvedValue(makeUsuario('MASTER'))

    const res = await request(app).get('/api/v1/me')

    expect(res.status).toBe(200)
    const VALID = ['SUPER_ADMIN', 'ADMIN', 'MASTER', 'STANDARD', 'SUPPLIER']
    expect(VALID).toContain(res.body.usuario.tipo_usuario)
    expect(res.body.usuario.tipo_usuario).not.toBe('USUÁRIO')
  })

  // BUG DETECTION: banco com role legado → meResponseSchema detecta violação
  // Este teste PASSA com a implementação atual (documenta o bug, não o corrige)
  it('ME-005 [BUG DETECTION]: banco com role="USUÁRIO" → meResponseSchema.safeParse falha (contrato violado)', async () => {
    mockFindUnique.mockResolvedValue(makeUsuario('USUÁRIO'))

    const res = await request(app).get('/api/v1/me')

    // A rota não valida o output — o valor legado escapa para o cliente
    expect(res.body.usuario?.tipo_usuario).toBe('USUÁRIO')
    // O schema exportado é o contrato que detecta a violação:
    const parsed = meResponseSchema.safeParse(res.body)
    expect(parsed.success).toBe(false)
  })

  it.each([
    ['SUPER_ADMIN'],
    ['ADMIN'],
    ['MASTER'],
    ['STANDARD'],
    ['SUPPLIER'],
  ] as const)(
    'ME-006: tipo_usuario="%s" → retorna corretamente no payload e passa no schema',
    async (role) => {
      mockFindUnique.mockResolvedValue(makeUsuario(role))

      const res = await request(app).get('/api/v1/me')

      expect(res.status).toBe(200)
      expect(res.body.usuario.tipo_usuario).toBe(role)
      const parsed = meResponseSchema.safeParse(res.body)
      expect(parsed.success).toBe(true)
    },
  )
})

// ─── ME-008 / ME-009 — Autenticação ──────────────────────────────────────────
describe('GET /api/v1/me — autenticação', () => {
  it('ME-008: sem header Authorization → 401 com error.code definido', async () => {
    rejectAuth('UNAUTHORIZED', 401)

    const res = await request(app).get('/api/v1/me')

    expect(res.status).toBe(401)
    expect(res.body.error?.code).toBeDefined()
  })

  it('ME-009: token inválido → 401 sem stack trace no body', async () => {
    rejectAuth('UNAUTHORIZED', 401)

    const res = await request(app)
      .get('/api/v1/me')
      .set('Authorization', 'Bearer token-invalido')

    expect(res.status).toBe(401)
    expect(res.body.error?.stack).toBeUndefined()
  })
})

// ─── ME-011 — Erro de banco ───────────────────────────────────────────────────
describe('GET /api/v1/me — erros de banco', () => {
  it('ME-011: DB falha (Prisma rejeita) → 500 sem stack trace exposto', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB connection lost'))

    const res = await request(app).get('/api/v1/me')

    expect(res.status).toBe(500)
    expect(res.body.error?.stack).toBeUndefined()
    expect(res.body.error?.code).toBeDefined()
  })
})

// ─── ME-012 — GET /preferences SUPPLIER ──────────────────────────────────────
describe('GET /api/v1/me/preferences — SUPPLIER guard', () => {
  it('ME-012: SUPPLIER → retorna { data: { preferredCompanyId: null } } sem chamar o banco', async () => {
    injectAuth({ userId: 'usr_supplier', tenantId: 'ten_contract_01', role: 'SUPPLIER' })

    const res = await request(app).get('/api/v1/me/preferences')

    expect(res.status).toBe(200)
    expect(res.body.data.preferredCompanyId).toBeNull()
    expect(mockFindUnique).not.toHaveBeenCalled()
  })
})

// ─── ME-013 / ME-014 — PUT /preferences ──────────────────────────────────────
describe('PUT /api/v1/me/preferences — autorização e validação', () => {
  it('ME-013: SUPPLIER → 403 FORBIDDEN', async () => {
    injectAuth({ userId: 'usr_supplier', tenantId: 'ten_contract_01', role: 'SUPPLIER' })

    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: 'cjld2cjxh0000qzrmn831i7rn' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
  })

  it('ME-014: preferredCompanyId não-cuid → 400 VALIDATION_ERROR', async () => {
    injectAuth({ userId: 'usr_master', tenantId: 'ten_contract_01', role: 'MASTER' })

    const res = await request(app)
      .put('/api/v1/me/preferences')
      .send({ preferredCompanyId: 'nao-um-cuid' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

// ─── ME-015 — GET /preferences fallback silencioso ───────────────────────────
describe('GET /api/v1/me/preferences — fallback silencioso (membership revogada)', () => {
  it('ME-015: preferred_company_id inválido (membership revogada) → null + usuario.update chamado', async () => {
    injectAuth({ userId: 'usr_contract_01', tenantId: 'ten_contract_01', role: 'MASTER' })
    mockFindUnique.mockResolvedValue({ preferred_company_id: 'cjld2cjxh0000qzrmn831i7rn' })
    mockWsFindFirst.mockResolvedValue(null)
    mockUsuarioUpdate.mockResolvedValue({})

    const res = await request(app).get('/api/v1/me/preferences')

    expect(res.status).toBe(200)
    expect(res.body.data.preferredCompanyId).toBeNull()
    expect(mockUsuarioUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { preferred_company_id: null } }),
    )
  })
})
