// @vitest-environment node
// TST-FUN-CONFIG-AOPC-001..010 — PATCH /api/v1/admin/organizacoes/:id_organizacao
// Endpoint usado pelo Admin Panel para atualizar dados cadastrais da organização.
//
// Histórico: até 2026-05-06, a rota só persistia status/nome/subdomínio —
// cnpj/estado/cidade/segmento/tipo_organizacao eram silenciosamente descartados
// (Zod + Prisma update + API client + handler todos quebrados). UI mostrava
// "salvo com sucesso" mas dados nunca persistiam. Bug detectado pelo dono
// e este teste foi adicionado pra evitar regressão.
//
// Cobre:
//   • PATCH com 5 campos cadastrais → 200 + Prisma update chamado com todos
//   • Campo vazio ("") na request → vira NULL no banco (limpar)
//   • CNPJ inválido (regex) → 400 VALIDATION_ERROR
//   • Estado em lowercase → 400 VALIDATION_ERROR
//   • Estado com mais de 2 chars → 400 VALIDATION_ERROR
//   • AuditService.log recebe diff completo dos campos alterados
//   • Org não encontrada → 404 NOT_FOUND
//   • Auto-edição da própria org HQ bloqueada → 403 FORBIDDEN (regra antiga preservada)
//   • PADRAO bloqueado por requireGravityAdmin → 403
//
/// <reference types="vitest/globals" />

import { vi, describe, it, expect, beforeEach } from 'vitest'

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const {
  mockOrganizacaoFindUnique,
  mockOrganizacaoUpdate,
  mockAuditServiceLog,
} = vi.hoisted(() => ({
  mockOrganizacaoFindUnique: vi.fn(),
  mockOrganizacaoUpdate:     vi.fn(),
  mockAuditServiceLog:       vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    organizacao: {
      findUnique: mockOrganizacaoFindUnique,
      findMany:   vi.fn(),
      update:     mockOrganizacaoUpdate,
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

// Mocks de dependencias laterais do admin.ts
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
  AuditService: { log: mockAuditServiceLog },
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
type AuthShape = {
  id_usuario:     string
  id_organizacao: string
  tipo_usuario:   string
  nome_usuario:   string
  clerkUserId:    string
}
function setAuth(auth: AuthShape) {
  ;(globalThis as Record<string, unknown>)['__testAuth'] = auth
}

const ATOR_SUPER_ADMIN: AuthShape = {
  id_usuario:     'usr_sa',
  id_organizacao: 'org_gravity',
  tipo_usuario:   'SUPER_ADMIN',
  nome_usuario:   'Super Admin',
  clerkUserId:    'clerk_sa',
}
const ATOR_PADRAO: AuthShape = {
  id_usuario:     'usr_pa',
  id_organizacao: 'org_cliente',
  tipo_usuario:   'PADRAO',
  nome_usuario:   'Usuario Padrao',
  clerkUserId:    'clerk_pa',
}

const ID_ORG_ALVO = 'cld8n2b0j0000mhog1234or01'

// "Estado antes" — org que vem do banco antes da atualização
const ORG_ANTES = {
  id_organizacao:         ID_ORG_ALVO,
  nome_organizacao:       'TESTE 03',
  subdominio_organizacao: 'teste-03',
  status_organizacao:     'ATIVO',
  cnpj_organizacao:       null,
  estado_organizacao:     null,
  cidade_organizacao:     null,
  segmento_organizacao:   null,
  tipo_organizacao:       null,
}

beforeEach(() => {
  vi.clearAllMocks()
  setAuth(ATOR_SUPER_ADMIN)
  mockOrganizacaoFindUnique.mockResolvedValue(ORG_ANTES)
})

// ─── TST-FUN-CONFIG-AOPC-001..010 ────────────────────────────────────────────
describe('TST-FUN-CONFIG-AOPC — PATCH /api/v1/admin/organizacoes/:id_organizacao (dados cadastrais)', () => {
  it('1. PATCH com 5 campos cadastrais → 200 + Prisma recebe todos os campos', async () => {
    mockOrganizacaoUpdate.mockResolvedValue({
      ...ORG_ANTES,
      cnpj_organizacao:     '12.345.678/0001-99',
      estado_organizacao:   'SP',
      cidade_organizacao:   'São Paulo',
      segmento_organizacao: 'Logística',
      tipo_organizacao:     'Importador',
    })

    const res = await request(app)
      .patch(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}`)
      .send({
        cnpj_organizacao:     '12.345.678/0001-99',
        estado_organizacao:   'SP',
        cidade_organizacao:   'São Paulo',
        segmento_organizacao: 'Logística',
        tipo_organizacao:     'Importador',
      })

    expect(res.status).toBe(200)
    expect(res.body.organizacao.cnpj_organizacao).toBe('12.345.678/0001-99')
    expect(res.body.organizacao.estado_organizacao).toBe('SP')
    expect(res.body.organizacao.cidade_organizacao).toBe('São Paulo')
    expect(res.body.organizacao.segmento_organizacao).toBe('Logística')
    expect(res.body.organizacao.tipo_organizacao).toBe('Importador')

    // Verifica que TODOS os 5 campos foram passados para o Prisma update
    expect(mockOrganizacaoUpdate).toHaveBeenCalledTimes(1)
    const updateData = mockOrganizacaoUpdate.mock.calls[0][0].data
    expect(updateData.cnpj_organizacao).toBe('12.345.678/0001-99')
    expect(updateData.estado_organizacao).toBe('SP')
    expect(updateData.cidade_organizacao).toBe('São Paulo')
    expect(updateData.segmento_organizacao).toBe('Logística')
    expect(updateData.tipo_organizacao).toBe('Importador')
  })

  it('2. PATCH com campo "" → grava NULL no banco (limpar)', async () => {
    mockOrganizacaoFindUnique.mockResolvedValue({
      ...ORG_ANTES,
      estado_organizacao: 'SP',  // tinha valor antes
    })
    mockOrganizacaoUpdate.mockResolvedValue({
      ...ORG_ANTES,
      estado_organizacao: null,
    })

    await request(app)
      .patch(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}`)
      .send({ estado_organizacao: '' })

    const updateData = mockOrganizacaoUpdate.mock.calls[0][0].data
    expect(updateData.estado_organizacao).toBeNull()
  })

  it('3. CNPJ formato inválido → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}`)
      .send({ cnpj_organizacao: '12345678000199' }) // sem máscara

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockOrganizacaoUpdate).not.toHaveBeenCalled()
  })

  it('4. Estado em lowercase → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}`)
      .send({ estado_organizacao: 'sp' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockOrganizacaoUpdate).not.toHaveBeenCalled()
  })

  it('5. Estado com 3 chars → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}`)
      .send({ estado_organizacao: 'SPA' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockOrganizacaoUpdate).not.toHaveBeenCalled()
  })

  it('6. AuditService.log recebe diff completo dos campos alterados', async () => {
    mockOrganizacaoUpdate.mockResolvedValue({
      ...ORG_ANTES,
      estado_organizacao: 'SP',
      cidade_organizacao: 'São Paulo',
    })

    await request(app)
      .patch(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}`)
      .send({
        estado_organizacao: 'SP',
        cidade_organizacao: 'São Paulo',
      })

    expect(mockAuditServiceLog).toHaveBeenCalledTimes(1)
    const logArg = mockAuditServiceLog.mock.calls[0][0]
    expect(logArg.estado_anterior_historico_log).toEqual({
      estado_organizacao: null,
      cidade_organizacao: null,
    })
    expect(logArg.estado_posterior_historico_log).toEqual({
      estado_organizacao: 'SP',
      cidade_organizacao: 'São Paulo',
    })
    expect(logArg.tipo_recurso_historico_log).toBe('Organização')
    expect(logArg.id_recurso_historico_log).toBe(ID_ORG_ALVO)
  })

  it('7. Org não encontrada → 404 NOT_FOUND', async () => {
    mockOrganizacaoFindUnique.mockResolvedValue(null)

    const res = await request(app)
      .patch(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}`)
      .send({ estado_organizacao: 'SP' })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
    expect(mockOrganizacaoUpdate).not.toHaveBeenCalled()
  })

  it('8. PADRAO bloqueado por requireGravityAdmin → 403', async () => {
    setAuth(ATOR_PADRAO)

    const res = await request(app)
      .patch(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}`)
      .send({ estado_organizacao: 'SP' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
    expect(mockOrganizacaoUpdate).not.toHaveBeenCalled()
  })

  it('9. SUPER_ADMIN editando própria org HQ via status → 403 (regra preservada)', async () => {
    setAuth(ATOR_SUPER_ADMIN)
    // path id === auth.id_organizacao
    const res = await request(app)
      .patch(`/api/v1/admin/organizacoes/${ATOR_SUPER_ADMIN.id_organizacao}`)
      .send({ status_organizacao: 'SUSPENSO' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN')
  })

  it('10. PATCH sem nenhum campo válido → ainda passa Zod (todos optional) e dispara update vazio', async () => {
    mockOrganizacaoUpdate.mockResolvedValue(ORG_ANTES)

    const res = await request(app)
      .patch(`/api/v1/admin/organizacoes/${ID_ORG_ALVO}`)
      .send({})

    expect(res.status).toBe(200)
    // Prisma é chamado com data: {} — não quebra, mas também não muda nada
    expect(mockOrganizacaoUpdate).toHaveBeenCalledTimes(1)
    const updateData = mockOrganizacaoUpdate.mock.calls[0][0].data
    expect(Object.keys(updateData)).toHaveLength(0)
  })
})
