// @vitest-environment node
// TST-FUN-CONFIG-MEWS-001 — GET /api/v1/me/workspaces
// Valida que o endpoint retorna TODOS os workspaces da organização (ATIVO + INATIVO),
// permitindo que o frontend decida a exibição por contexto.
//
// Cobre:
//   • Retorna workspaces ATIVO e INATIVO juntos → 200
//   • Org sem workspaces → 200 + array vazio
//   • Cada workspace contém status_workspace no payload
/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const { mockGetWorkspaces } = vi.hoisted(() => ({
  mockGetWorkspaces: vi.fn(),
}))

vi.mock('@nucleo/montar-detalhe-acao-historico-log', () => ({
  compararEstadosHistoricoLog: vi.fn().mockReturnValue(''),
  montarDetalheAcaoHistoricoLog: vi.fn().mockReturnValue(''),
}))

vi.mock('../../../../servicos-global/configurador/server/services/organizacao-service.js', () => ({
  organizacaoService: { getWorkspaces: mockGetWorkspaces },
  proximoSubdominioDisponivel: vi.fn(),
  slugifySubdominio: vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    usuario:          { findUnique: vi.fn(), update: vi.fn() },
    workspace:        { findFirst: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn() },
    usuarioWorkspace: { findFirst: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn() },
    organizacao:      { findUnique: vi.fn() },
    fatura:           { findMany: vi.fn() },
    $transaction:     vi.fn(),
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth'] ?? {
      id_usuario:     'usr_test',
      id_organizacao: 'org_test',
      tipo_usuario:   'MASTER',
      nome_usuario:   'Teste',
      clerkUserId:    'clerk_test',
    }
    next()
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireConfiguradorMutation.js', () => ({
  requireConfiguradorMutation: (_req: unknown, _res: unknown, next: () => void) => next(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { invitations: { createInvitation: vi.fn() } },
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
import { meRouter } from '../../../../servicos-global/configurador/server/routes/me.js'
import { AppError } from '../../../../servicos-global/configurador/server/lib/appError.js'

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

// ─── Fixtures ────────────────────────────────────────────────────────────────
const WS_ATIVO = {
  id_workspace: 'ws_ativo_01',
  nome_workspace: 'Workspace Ativo',
  subdominio_workspace: 'ws-ativo',
  cnpj_workspace: null,
  status_workspace: 'ATIVO',
  data_criacao_workspace: new Date('2026-01-01'),
  quantidade_usuarios_workspace: 2,
  _count: { vinculos_workspace: 2 },
}

const WS_INATIVO = {
  id_workspace: 'ws_inativo_01',
  nome_workspace: 'Workspace Suspenso',
  subdominio_workspace: 'ws-suspenso',
  cnpj_workspace: null,
  status_workspace: 'INATIVO',
  data_criacao_workspace: new Date('2026-02-01'),
  quantidade_usuarios_workspace: 1,
  _count: { vinculos_workspace: 1 },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetWorkspaces.mockResolvedValue([WS_ATIVO, WS_INATIVO])
})

// ─── Testes ──────────────────────────────────────────────────────────────────
describe('GET /api/v1/me/workspaces — lista workspaces da organização', () => {
  it('retorna workspaces ATIVO e INATIVO juntos', async () => {
    const res = await request(app).get('/api/v1/me/workspaces')

    expect(res.status).toBe(200)
    expect(res.body.workspaces).toHaveLength(2)

    const statuses = res.body.workspaces.map((w: { status_workspace: string }) => w.status_workspace)
    expect(statuses).toContain('ATIVO')
    expect(statuses).toContain('INATIVO')
  })

  it('workspace INATIVO contém todos os campos esperados', async () => {
    const res = await request(app).get('/api/v1/me/workspaces')

    const suspenso = res.body.workspaces.find(
      (w: { status_workspace: string }) => w.status_workspace === 'INATIVO',
    )
    expect(suspenso).toBeDefined()
    expect(suspenso.id_workspace).toBe('ws_inativo_01')
    expect(suspenso.nome_workspace).toBe('Workspace Suspenso')
    expect(suspenso.subdominio_workspace).toBe('ws-suspenso')
  })

  it('org sem workspaces → 200 + array vazio', async () => {
    mockGetWorkspaces.mockResolvedValue([])

    const res = await request(app).get('/api/v1/me/workspaces')

    expect(res.status).toBe(200)
    expect(res.body.workspaces).toHaveLength(0)
  })

  it('chama organizacaoService.getWorkspaces com id_organizacao do auth', async () => {
    await request(app).get('/api/v1/me/workspaces')

    expect(mockGetWorkspaces).toHaveBeenCalledWith('org_test')
    expect(mockGetWorkspaces).toHaveBeenCalledTimes(1)
  })
})
