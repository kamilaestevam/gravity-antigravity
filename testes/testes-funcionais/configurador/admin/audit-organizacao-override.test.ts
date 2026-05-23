// @vitest-environment node
// TST-FUNC-CONF-AUDIT-OVERRIDE-001 — POST /api/v1/internal/admin/audit-organizacao-override
//
// Endpoint S2S chamado pelo middleware do SDK quando admin Gravity aceita
// override de organização (Pendência #4, fase 7). Valida:
//   - 401 quando x-chave-interna-servico ausente/errada
//   - 400 quando body é malformado (Zod)
//   - 400 quando id_organizacao_origem === id_organizacao_destino (no-op)
//   - 201 + grava em AuditLogAdmin com campos corretos no caso feliz

/// <reference types="vitest/globals" />

// ─── Mocks hoistados ─────────────────────────────────────────────────────────
const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }))

vi.mock('../../../../servicos-global/configurador/server/lib/prisma.js', () => ({
  prisma: {
    auditLogAdmin: { create: mockCreate },
  },
}))

import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { adminOrganizacaoOverrideAuditRouter } from '../../../../servicos-global/configurador/server/routes/admin-organizacao-override-audit.js'
import { AppError } from '../../../../servicos-global/configurador/server/lib/appError.js'

const CHAVE = 'super-secret-internal-key-32chars!!'

// ─── App de teste ─────────────────────────────────────────────────────────────
function makeApp() {
  process.env.CHAVE_INTERNA_SERVICO = CHAVE
  const app = express()
  app.use(express.json())
  app.use('/api/v1/internal/admin', adminOrganizacaoOverrideAuditRouter)
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
      return
    }
    if (err && typeof err === 'object' && 'issues' in (err as Record<string, unknown>)) {
      // Zod error
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Body inválido' } })
      return
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: String(err) } })
  })
  return app
}

const BODY_OK = {
  id_usuario_ator:        'cusuarioteste0000000aaaaa',
  tipo_usuario_ator:      'SUPER_ADMIN' as const,
  id_organizacao_origem:  'cgravityorigem0000000aaaa',
  id_organizacao_destino: 'cclientexyzdestino000bbbb',
  ip_origem:              '198.51.100.42',
  correlation_id:         'corr-test-001',
}

beforeEach(() => {
  mockCreate.mockReset()
  mockCreate.mockResolvedValue({ id_audit_log_admin: 'caudit0000000000000000000' })
})

describe('POST /api/v1/internal/admin/audit-organizacao-override', () => {
  it('rejeita request sem x-chave-interna-servico (401 UNAUTHORIZED)', async () => {
    const app = makeApp()
    const res = await request(app)
      .post('/api/v1/internal/admin/audit-organizacao-override')
      .send(BODY_OK)
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejeita chave errada (401 UNAUTHORIZED)', async () => {
    const app = makeApp()
    const res = await request(app)
      .post('/api/v1/internal/admin/audit-organizacao-override')
      .set('x-chave-interna-servico', 'chave-errada-mesmo-tamanho-q-original-')
      .send(BODY_OK)
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejeita body malformado (CUID inválido)', async () => {
    const app = makeApp()
    const res = await request(app)
      .post('/api/v1/internal/admin/audit-organizacao-override')
      .set('x-chave-interna-servico', CHAVE)
      .send({ ...BODY_OK, id_organizacao_destino: 'nao-cuid' })
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejeita tipo_usuario_ator fora do enum', async () => {
    const app = makeApp()
    const res = await request(app)
      .post('/api/v1/internal/admin/audit-organizacao-override')
      .set('x-chave-interna-servico', CHAVE)
      .send({ ...BODY_OK, tipo_usuario_ator: 'MASTER' })
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejeita origem === destino com 400 OVERRIDE_AUDIT_NOOP', async () => {
    const app = makeApp()
    const res = await request(app)
      .post('/api/v1/internal/admin/audit-organizacao-override')
      .set('x-chave-interna-servico', CHAVE)
      .send({
        ...BODY_OK,
        id_organizacao_origem:  BODY_OK.id_organizacao_destino,
        id_organizacao_destino: BODY_OK.id_organizacao_destino,
      })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('OVERRIDE_AUDIT_NOOP')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('grava em AuditLogAdmin com campos corretos (201)', async () => {
    const app = makeApp()
    const res = await request(app)
      .post('/api/v1/internal/admin/audit-organizacao-override')
      .set('x-chave-interna-servico', CHAVE)
      .send(BODY_OK)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ ok: true })
    expect(mockCreate).toHaveBeenCalledTimes(1)

    const dataArg = mockCreate.mock.calls[0]?.[0] as { data: Record<string, unknown> }
    expect(dataArg.data).toEqual({
      id_usuario_audit_log_admin:     BODY_OK.id_usuario_ator,
      tipo_usuario_audit_log_admin:   'SUPER_ADMIN',
      acao_audit_log_admin:           'admin.organizacao_override.trocar',
      recurso_audit_log_admin:        'organizacao',
      filtros_audit_log_admin: {
        id_organizacao_origem:  BODY_OK.id_organizacao_origem,
        id_organizacao_destino: BODY_OK.id_organizacao_destino,
        cross_org:              true,
      },
      qtd_resultados_audit_log_admin: 1,
      ip_origem_audit_log_admin:      BODY_OK.ip_origem,
      correlation_id_audit_log_admin: BODY_OK.correlation_id,
    })
  })

  it('aceita tipo_usuario_ator=ADMIN também', async () => {
    const app = makeApp()
    const res = await request(app)
      .post('/api/v1/internal/admin/audit-organizacao-override')
      .set('x-chave-interna-servico', CHAVE)
      .send({ ...BODY_OK, tipo_usuario_ator: 'ADMIN' })
    expect(res.status).toBe(201)
    const dataArg = mockCreate.mock.calls[0]?.[0] as { data: Record<string, unknown> }
    expect(dataArg.data.tipo_usuario_audit_log_admin).toBe('ADMIN')
  })
})
