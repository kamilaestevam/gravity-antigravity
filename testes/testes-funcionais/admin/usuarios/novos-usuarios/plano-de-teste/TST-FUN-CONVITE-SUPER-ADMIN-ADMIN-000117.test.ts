// TST-FUN-CONVITE-SUPER-ADMIN-ADMIN-000117 — POST /api/v1/admin/usuarios/convidar (TASK-000302)
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
      id_organizacao: 'org_ator',
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

beforeEach(() => {
  vi.clearAllMocks()
  delete (globalThis as Record<string, unknown>)['__testAuth']
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

describe('TST-FUN-CONVITE-SUPER-ADMIN-ADMIN-000117 — POST /usuarios/convidar', () => {
  it('F01 — SUPER_ADMIN convidado → usa resolverIdOrganizacaoGravity e retorna 201', async () => {
    const res = await request(app)
      .post('/api/v1/admin/usuarios/convidar')
      .send({
        id_organizacao_alvo: 'org_errada_do_front',
        email_usuario: 'novo@exemplo.com',
        nome_usuario: 'Novo Super',
        tipo_usuario: 'SUPER_ADMIN',
      })

    expect(res.status).toBe(201)
    expect(mockResolverIdOrganizacaoGravity).toHaveBeenCalledTimes(1)
    expect(mockConvidarUsuarioService).toHaveBeenCalledWith(
      expect.objectContaining({
        id_organizacao_alvo: ORG_GRAVITY,
        tipo_usuario: 'SUPER_ADMIN',
      }),
    )
    expect(res.body.usuario.tipo_usuario).toBe('SUPER_ADMIN')
  })

  it('F02 — ADMIN ator → 403 ADMIN_SOMENTE_LEITURA', async () => {
    ;(globalThis as Record<string, unknown>)['__testAuth'] = {
      id_usuario: 'usr_ad',
      id_organizacao: 'org_gravity',
      tipo_usuario: 'ADMIN',
      nome_usuario: 'Admin',
      clerkUserId: 'clerk_ad',
    }

    const res = await request(app)
      .post('/api/v1/admin/usuarios/convidar')
      .send({
        id_organizacao_alvo: ORG_GRAVITY,
        email_usuario: 'x@y.com',
        nome_usuario: 'X',
        tipo_usuario: 'MASTER',
      })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('ADMIN_SOMENTE_LEITURA')
  })

  it('F03 — id_organizacao_alvo vazio → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/v1/admin/usuarios/convidar')
      .send({
        id_organizacao_alvo: '',
        email_usuario: 'novo@exemplo.com',
        nome_usuario: 'Novo',
        tipo_usuario: 'MASTER',
      })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})
