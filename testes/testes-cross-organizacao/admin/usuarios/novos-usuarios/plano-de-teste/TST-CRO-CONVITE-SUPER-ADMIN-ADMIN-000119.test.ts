// @vitest-environment node
// TST-CRO-CONVITE-SUPER-ADMIN-ADMIN-000119 — override org Gravity vs payload cross-org (TASK-000302)
/// <reference types="vitest/globals" />

import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockConvidarUsuarioService = vi.hoisted(() => vi.fn())
const mockResolverIdOrganizacaoGravity = vi.hoisted(() => vi.fn())

vi.mock('../../../../../../servicos-global/configurador/server/services/convidar-usuario-service.js', () => ({
  convidarUsuarioService: mockConvidarUsuarioService,
}))

vi.mock('../../../../../../servicos-global/configurador/server/services/prestador-fornecedor-vinculo-service.js', () => ({
  resolverIdOrganizacaoGravity: mockResolverIdOrganizacaoGravity,
}))

vi.mock('../../../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    organizacao: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), create: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
    workspace: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    usuario: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    testeFavoritoUsuario: { findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    testeAgendamento: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('../../../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth'] ?? {
      id_usuario: 'usr_sa',
      id_organizacao: 'org_cliente_A',
      tipo_usuario: 'SUPER_ADMIN',
      nome_usuario: 'Super Admin',
      clerkUserId: 'clerk_sa',
    }
    next()
  },
}))

vi.mock('../../../../../../servicos-global/configurador/server/lib/clerk.js', () => ({
  clerkClient: { invitations: { createInvitation: vi.fn() } },
}))
vi.mock('../../../../../../servicos-global/configurador/server/lib/billing/index.js', () => ({
  getBillingProvider: vi.fn(),
}))
vi.mock('../../../../../../servicos-global/configurador/server/services/organizacao-service.js', () => ({
  proximoSubdominioDisponivel: vi.fn(),
  slugifySubdominio: vi.fn(),
}))
vi.mock('../../../../../../servicos-global/configurador/server/services/deploy-log-service.js', () => ({
  deployLogService: { append: vi.fn(), list: vi.fn() },
}))
vi.mock('../../../../../../servicos-global/configurador/server/utils/playwright-parser.js', () => ({
  walkSuite: vi.fn(),
}))
vi.mock('../../../../../../servicos-global/configurador/server/lib/gemini-test-analyzer.js', () => ({
  analyzeTestFailure: vi.fn(),
  getMetrics: vi.fn(),
}))
vi.mock('../../../../../../servicos-global/configurador/server/lib/agente-plano-teste.js', () => ({
  generateTestPlan: vi.fn(),
  expandTestPlan: vi.fn(),
}))
vi.mock('../../../../../../servicos-global/configurador/server/lib/gerador-specs.js', () => ({
  generateAndSaveSpec: vi.fn(),
}))
vi.mock('../../../../../../servicos-global/configurador/server/lib/extrator-testids.js', () => ({
  generateTestidMapping: vi.fn(),
}))
vi.mock('../../../../../../servicos-global/servicos-plataforma/historico-global/server/services/audit.service.js', () => ({
  AuditService: { log: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('../../../../../../servicos-global/servicos-plataforma/historico-global/server/middleware/audit.js', () => ({
  auditMiddleware: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}))
vi.mock('../../../../../../servicos-global/servicos-plataforma/generated/index.js', () => ({
  AcaoExecutadaPor: { USUARIO: 'USUARIO', SISTEMA: 'SISTEMA' },
}))
vi.mock('../../../../../../servicos-global/servicos-plataforma/historico-global/server/lib/securityAuditLogger.js', () => ({
  securityAudit: {
    roleChanged: vi.fn().mockResolvedValue(undefined),
    permissionChanged: vi.fn().mockResolvedValue(undefined),
  },
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { adminRouter } from '../../../../../../servicos-global/configurador/server/routes/admin.js'
import { AppError } from '../../../../../../servicos-global/configurador/server/lib/appError.js'

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

const ORG_GRAVITY = 'cmo6henln0000ly9mwvx3zbia'
const ORG_CLIENTE_A = 'org_cliente_A'
const ORG_CLIENTE_B = 'org_cliente_B'
const ORG_CLIENTE_C = 'org_cliente_C'
const ORG_CLIENTE_D = 'org_cliente_D'

beforeEach(() => {
  vi.clearAllMocks()
  delete (globalThis as Record<string, unknown>)['__testAuth']
  ;(globalThis as Record<string, unknown>)['__testAuth'] = {
    id_usuario: 'usr_sa',
    id_organizacao: ORG_CLIENTE_A,
    tipo_usuario: 'SUPER_ADMIN',
    nome_usuario: 'Super Admin',
    clerkUserId: 'clerk_sa',
  }
  mockResolverIdOrganizacaoGravity.mockResolvedValue(ORG_GRAVITY)
  mockConvidarUsuarioService.mockResolvedValue({
    id_usuario: 'usr_novo',
    email_usuario: 'novo@exemplo.com',
    tipo_usuario: 'SUPER_ADMIN',
    acesso_workspaces_futuros: true,
    workspaces_vinculados: 0,
    nome_fornecedor: null,
  })
})

describe('TST-CRO-CONVITE-SUPER-ADMIN-ADMIN-000119 — fronteira cross-org convite admin', () => {
  it('C01 — ator org A + payload org B + SUPER_ADMIN → serviço usa ORG_GRAVITY', async () => {
    const res = await request(app)
      .post('/api/v1/admin/usuarios/convidar')
      .send({
        id_organizacao_alvo: ORG_CLIENTE_B,
        email_usuario: 'sa1@exemplo.com',
        nome_usuario: 'SA Um',
        tipo_usuario: 'SUPER_ADMIN',
      })

    expect(res.status).toBe(201)
    expect(mockConvidarUsuarioService).toHaveBeenCalledWith(
      expect.objectContaining({ id_organizacao_alvo: ORG_GRAVITY }),
    )
  })

  it('C02 — payload org C diferente → ainda ORG_GRAVITY', async () => {
    await request(app)
      .post('/api/v1/admin/usuarios/convidar')
      .send({
        id_organizacao_alvo: ORG_CLIENTE_C,
        email_usuario: 'sa2@exemplo.com',
        nome_usuario: 'SA Dois',
        tipo_usuario: 'SUPER_ADMIN',
      })

    expect(mockConvidarUsuarioService).toHaveBeenLastCalledWith(
      expect.objectContaining({ id_organizacao_alvo: ORG_GRAVITY }),
    )
  })

  it('C03 — MASTER respeita org D do payload (sem override Gravity)', async () => {
    mockConvidarUsuarioService.mockResolvedValueOnce({
      id_usuario: 'usr_master',
      email_usuario: 'master@exemplo.com',
      tipo_usuario: 'MASTER',
      acesso_workspaces_futuros: true,
      workspaces_vinculados: 0,
      nome_fornecedor: null,
    })

    const res = await request(app)
      .post('/api/v1/admin/usuarios/convidar')
      .send({
        id_organizacao_alvo: ORG_CLIENTE_D,
        email_usuario: 'master@exemplo.com',
        nome_usuario: 'Master Cliente',
        tipo_usuario: 'MASTER',
      })

    expect(res.status).toBe(201)
    expect(mockResolverIdOrganizacaoGravity).not.toHaveBeenCalled()
    expect(mockConvidarUsuarioService).toHaveBeenCalledWith(
      expect.objectContaining({ id_organizacao_alvo: ORG_CLIENTE_D }),
    )
  })

  it('C04 — ADMIN ator → 403 cross-org bloqueado', async () => {
    ;(globalThis as Record<string, unknown>)['__testAuth'] = {
      id_usuario: 'usr_ad',
      id_organizacao: ORG_GRAVITY,
      tipo_usuario: 'ADMIN',
      nome_usuario: 'Admin',
      clerkUserId: 'clerk_ad',
    }

    const res = await request(app)
      .post('/api/v1/admin/usuarios/convidar')
      .send({
        id_organizacao_alvo: ORG_CLIENTE_D,
        email_usuario: 'x@y.com',
        nome_usuario: 'X',
        tipo_usuario: 'MASTER',
      })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('ADMIN_SOMENTE_LEITURA')
    expect(mockConvidarUsuarioService).not.toHaveBeenCalled()
  })
})
