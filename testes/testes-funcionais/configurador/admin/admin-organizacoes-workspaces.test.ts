// @vitest-environment node
// TST-FUN-CONFIG-AOWS-001 — GET /api/v1/admin/organizacoes/:id_organizacao/workspaces
// Endpoint usado pelo Admin Panel para lazy-load do editor de vínculos
// (decisão dono 2026-05-05 — opção α: apenas SUPER_ADMIN edita; ADMIN tem
// acesso de leitura ao endpoint via requireGravityAdmin).
//
// Cobre:
//   • SUPER_ADMIN lista workspaces de qualquer org → 200
//   • ADMIN lista workspaces de qualquer org → 200 (leitura é livre por requireGravityAdmin)
//   • PADRAO/MASTER/FORNECEDOR → 403 (bloqueado por requireGravityAdmin)
//   • Org inexistente → 404 NOT_FOUND
//   • Org sem workspaces ATIVOs → 200 + array vazio
//   • Workspaces filtrados por status_workspace = 'ATIVO' (não vaza inativos/cancelados)
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockOrganizacaoFindUnique,
  mockWorkspaceFindMany,
} = vi.hoisted(() => ({
  mockOrganizacaoFindUnique: vi.fn(),
  mockWorkspaceFindMany:     vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    organizacao: { findUnique: mockOrganizacaoFindUnique, findMany: vi.fn(), update: vi.fn(), create: vi.fn() },
    workspace:   { findMany: mockWorkspaceFindMany, findUnique: vi.fn(), update: vi.fn() },
    usuario:     { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    fatura:      { findMany: vi.fn() },
    deployLog:   { findMany: vi.fn(), create: vi.fn() },
    analiseTeste:{ findMany: vi.fn(), create: vi.fn() },
    painelVisaoGeral: { findFirst: vi.fn(), upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}))

// requireAuth dinâmico — cada teste seta seu próprio `auth` antes de chamar request(app)
vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth'] ?? {
      id_usuario:     'usr_default',
      id_organizacao: 'org_default',
      tipo_usuario:   'SUPER_ADMIN',
      clerkUserId:    'clerk_default',
    }
    next()
  },
}))

// requireGravityAdmin REAL — queremos validar o gate de fato
// (não fazemos mock, deixamos o middleware real rodar lendo do req.auth)

// Outras dependências do admin.ts que não vamos exercitar mas precisam existir
vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { invitations: { createInvitation: vi.fn() } },
}))
vi.mock('../../../../servicos-global/configurador/server/lib/billing/index.js', () => ({
  getBillingProvider: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/services/organizacao-service.js', () => ({
  proximoSubdominioDisponivel: vi.fn(),
  slugifySubdominio: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/services/deploy-log-service.js', () => ({
  deployLogService: { append: vi.fn(), list: vi.fn() },
}))
vi.mock('../../../../servicos-global/configurador/server/utils/playwright-parser.js', () => ({
  walkSuite: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/lib/gemini-test-analyzer.js', () => ({
  analyzeTestFailure: vi.fn(),
  getMetrics: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/lib/agente-plano-teste.js', () => ({
  generateTestPlan: vi.fn(),
  expandTestPlan: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/lib/gerador-specs.js', () => ({
  generateAndSaveSpec: vi.fn(),
}))
vi.mock('../../../../servicos-global/configurador/server/lib/extrator-testids.js', () => ({
  generateTestidMapping: vi.fn(),
}))
vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/middleware/audit.js', () => ({
  auditMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}))
vi.mock('../../../../servicos-global/servicos-plataforma/generated/index.js', () => ({
  AcaoExecutadaPor: { USUARIO: 'USUARIO', SISTEMA: 'SISTEMA' },
}))
vi.mock('../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: {
    roleChanged:       vi.fn().mockResolvedValue(undefined),
    permissionChanged: vi.fn().mockResolvedValue(undefined),
  },
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { adminRouter } from '../../../../servicos-global/configurador/server/routes/admin.js'
import { AppError } from '../../../../servicos-global/configurador/server/lib/appError.js'

const app = express()
app.use(express.json())
app.use('/api/v1/admin', adminRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }
  const e = err as { statusCode?: number; code?: string; message?: string }
  res.status(e.statusCode ?? 500).json({ error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Erro interno' } })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
type AuthShape = { id_usuario: string; id_organizacao: string; tipo_usuario: string; clerkUserId: string }
function setAuth(auth: AuthShape) {
  ;(globalThis as Record<string, unknown>)['__testAuth'] = auth
}

const ATOR_SUPER_ADMIN: AuthShape = { id_usuario: 'usr_sa', id_organizacao: 'org_gravity', tipo_usuario: 'SUPER_ADMIN', clerkUserId: 'clerk_sa' }
const ATOR_ADMIN:       AuthShape = { id_usuario: 'usr_ad', id_organizacao: 'org_gravity', tipo_usuario: 'ADMIN',       clerkUserId: 'clerk_ad' }
const ATOR_MASTER:      AuthShape = { id_usuario: 'usr_ma', id_organizacao: 'org_a',       tipo_usuario: 'MASTER',      clerkUserId: 'clerk_ma' }
const ATOR_PADRAO:      AuthShape = { id_usuario: 'usr_pa', id_organizacao: 'org_a',       tipo_usuario: 'PADRAO',      clerkUserId: 'clerk_pa' }

const ID_ORG_ALVO = 'cld8n2b0j0000mhog1234or01'
const WORKSPACE_A = {
  id_workspace: 'cld8n2b0j0000mhog1234ws01',
  nome_workspace: 'Workspace A',
  subdominio_workspace: 'ws-a',
  status_workspace: 'ATIVO',
  data_criacao_workspace: new Date('2026-01-01'),
}
const WORKSPACE_B = {
  id_workspace: 'cld8n2b0j0001mhog1234ws02',
  nome_workspace: 'Workspace B',
  subdominio_workspace: 'ws-b',
  status_workspace: 'ATIVO',
  data_criacao_workspace: new Date('2026-02-01'),
}

beforeEach(() => {
  vi.clearAllMocks()
  setAuth(ATOR_SUPER_ADMIN)
  // Defaults benignos — testes individuais sobrescrevem
  mockOrganizacaoFindUnique.mockResolvedValue({ id_organizacao: ID_ORG_ALVO })
  mockWorkspaceFindMany.mockResolvedValue([WORKSPACE_A, WORKSPACE_B])
})

// ─── TST-FUN-CONFIG-AOWS-001..006 ────────────────────────────────────────────
describe('TST-FUN-CONFIG-AOWS-001..006 — GET /api/v1/admin/organizacoes/:id_organizacao/workspaces', () => {
  it('1. SAdmin lista workspaces de qualquer org → 200 + array', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    const res = await request(app).get(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}/workspaces`)
    expect(res.status).toBe(200)
    expect(res.body.workspaces).toHaveLength(2)
    expect(res.body.workspaces[0].id_workspace).toBe(WORKSPACE_A.id_workspace)
  })

  it('2. ADMIN também lista workspaces (leitura aberta via requireGravityAdmin) → 200', async () => {
    setAuth(ATOR_ADMIN)
    const res = await request(app).get(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}/workspaces`)
    expect(res.status).toBe(200)
    expect(res.body.workspaces).toHaveLength(2)
  })

  it('3. MASTER → 403 FORBIDDEN (bloqueado por requireGravityAdmin)', async () => {
    setAuth(ATOR_MASTER)
    const res = await request(app).get(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}/workspaces`)
    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockOrganizacaoFindUnique).not.toHaveBeenCalled()
  })

  it('4. PADRAO → 403 FORBIDDEN', async () => {
    setAuth(ATOR_PADRAO)
    const res = await request(app).get(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}/workspaces`)
    expect(res.status).toBe(403)
    expect(mockOrganizacaoFindUnique).not.toHaveBeenCalled()
  })

  it('5. Org inexistente → 404 NOT_FOUND', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockOrganizacaoFindUnique.mockResolvedValueOnce(null)
    const res = await request(app).get(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}/workspaces`)
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockWorkspaceFindMany).not.toHaveBeenCalled()
  })

  it('6. Org sem workspaces ATIVOs → 200 + array vazio', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    mockWorkspaceFindMany.mockResolvedValueOnce([])
    const res = await request(app).get(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}/workspaces`)
    expect(res.status).toBe(200)
    expect(res.body.workspaces).toEqual([])
  })

  it('7. workspace.findMany filtra por id_organizacao + status_workspace=ATIVO', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    await request(app).get(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}/workspaces`)
    expect(mockWorkspaceFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id_organizacao: ID_ORG_ALVO,
          status_workspace: 'ATIVO',
        }),
      }),
    )
  })
})
