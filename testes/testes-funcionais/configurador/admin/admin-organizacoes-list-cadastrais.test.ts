// @vitest-environment node
// TST-FUN-CONFIG-AOLC-001..003 — GET /api/v1/admin/organizacoes
// Garante que a listagem retorna os 5 campos cadastrais (cnpj/estado/
// cidade/segmento/tipo_organizacao) no `select` do findMany.
//
// Histórico (2026-05-06): GET listagem usava `select` restrito sem os
// 5 campos. Modal de edição abria com valores vazios mesmo se o usuário
// tivesse editado via PATCH /me. Bug irmão do já corrigido em
// admin-organizacao-patch-cadastrais.test.ts.
/// <reference types="vitest/globals" />

import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockOrganizacaoFindMany,
  mockOrganizacaoCount,
} = vi.hoisted(() => ({
  mockOrganizacaoFindMany: vi.fn(),
  mockOrganizacaoCount:    vi.fn(),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    organizacao: {
      findUnique: vi.fn(),
      findMany:   mockOrganizacaoFindMany,
      count:      mockOrganizacaoCount,
      update:     vi.fn(),
      create:     vi.fn(),
    },
    workspace:   { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    usuario:     { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    fatura:      { findMany: vi.fn() },
    deployLog:   { findMany: vi.fn(), create: vi.fn() },
    analiseTeste:{ findMany: vi.fn(), create: vi.fn() },
    painelVisaoGeral: { findFirst: vi.fn(), upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('../../../../servicos-global/configurador/server/middleware/requireAuth.js', () => ({
  requireAuth: (req: Record<string, unknown>, _res: unknown, next: () => void) => {
    req['auth'] = (globalThis as Record<string, unknown>)['__testAuth'] ?? {
      id_usuario:     'usr_default',
      id_organizacao: 'org_default',
      tipo_usuario:   'SUPER_ADMIN',
      nome_usuario:   'Default',
      clerkUserId:    'clerk_default',
    }
    next()
  },
}))

// Mocks de dependencias laterais
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

beforeEach(() => {
  vi.clearAllMocks()
  // Default: SUPER_ADMIN
  ;(globalThis as Record<string, unknown>)['__testAuth'] = {
    id_usuario:     'usr_sa',
    id_organizacao: 'org_gravity',
    tipo_usuario:   'SUPER_ADMIN',
    nome_usuario:   'Super Admin',
    clerkUserId:    'clerk_sa',
  }
  mockOrganizacaoFindMany.mockResolvedValue([
    {
      id_organizacao:         'org_a',
      nome_organizacao:       'Org A',
      subdominio_organizacao: 'org-a',
      status_organizacao:     'ATIVO',
      cnpj_organizacao:       '12.345.678/0001-99',
      estado_organizacao:     'SP',
      cidade_organizacao:     'São Paulo',
      segmento_organizacao:   'Logística',
      tipo_organizacao:       'Importador',
      data_criacao_organizacao: new Date('2026-01-01'),
      _count: { users_organizacao: 5, companies_organizacao: 2 },
      companies_organizacao: [],
    },
  ])
  mockOrganizacaoCount.mockResolvedValue(1)
})

describe('TST-FUN-CONFIG-AOLC — GET /api/v1/admin/organizacoes (campos cadastrais)', () => {
  it('1. Select do findMany pede os 5 campos cadastrais', async () => {
    await request(app).get('/api/v1/admin/organizacoes')

    expect(mockOrganizacaoFindMany).toHaveBeenCalledTimes(1)
    const select = mockOrganizacaoFindMany.mock.calls[0][0].select
    expect(select.cnpj_organizacao).toBe(true)
    expect(select.estado_organizacao).toBe(true)
    expect(select.cidade_organizacao).toBe(true)
    expect(select.segmento_organizacao).toBe(true)
    expect(select.tipo_organizacao).toBe(true)
  })

  it('2. Response inclui os 5 campos cadastrais no DTO', async () => {
    const res = await request(app).get('/api/v1/admin/organizacoes')

    expect(res.status).toBe(200)
    expect(res.body.organizacoes).toHaveLength(1)
    const org = res.body.organizacoes[0]
    expect(org.cnpj_organizacao).toBe('12.345.678/0001-99')
    expect(org.estado_organizacao).toBe('SP')
    expect(org.cidade_organizacao).toBe('São Paulo')
    expect(org.segmento_organizacao).toBe('Logística')
    expect(org.tipo_organizacao).toBe('Importador')
  })

  it('3. Org com campos null retorna null (não omite) - tolerância a orgs antigas', async () => {
    mockOrganizacaoFindMany.mockResolvedValue([
      {
        id_organizacao:         'org_legacy',
        nome_organizacao:       'Legacy Org',
        subdominio_organizacao: 'legacy',
        status_organizacao:     'ATIVO',
        cnpj_organizacao:       null,
        estado_organizacao:     null,
        cidade_organizacao:     null,
        segmento_organizacao:   null,
        tipo_organizacao:       null,
        data_criacao_organizacao: new Date('2024-01-01'),
        _count: { users_organizacao: 0, companies_organizacao: 0 },
        companies_organizacao: [],
      },
    ])

    const res = await request(app).get('/api/v1/admin/organizacoes')
    expect(res.status).toBe(200)
    const org = res.body.organizacoes[0]
    expect(org.cnpj_organizacao).toBeNull()
    expect(org.estado_organizacao).toBeNull()
    expect(org.cidade_organizacao).toBeNull()
    expect(org.segmento_organizacao).toBeNull()
    expect(org.tipo_organizacao).toBeNull()
  })
})
