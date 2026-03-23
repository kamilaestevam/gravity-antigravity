// @vitest-environment node
// testes/testes-unitarios/auth/checkAccess.test.ts
// AGENTE AUTH FLOW — ONDA 4
// Testes unitários para o endpoint GET /api/check-access

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import express, { Express } from 'express'

// ---------------------------------------------------------------------------
// Setup: cria app de teste isolado sem autenticar via INTERNAL_API_KEY real
// ---------------------------------------------------------------------------

const VALID_INTERNAL_KEY = 'test-internal-key-auth-flow'

async function buildTestApp(): Promise<Express> {
  // Garante key configurada antes de importar as rotas
  process.env.INTERNAL_API_KEY = VALID_INTERNAL_KEY

  const { checkAccessRouter } = await import(
    '../../../servicos-global/tenant/configurador/server/routes/checkAccess.js'
  )

  const app = express()
  app.use(express.json())
  app.use('/api', checkAccessRouter)
  return app
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/check-access', () => {
  let app: Express

  beforeEach(async () => {
    vi.resetModules()
    process.env.INTERNAL_API_KEY = VALID_INTERNAL_KEY
    app = await buildTestApp()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // -------------------------------------------------------------------------
  // Autenticação interna
  // -------------------------------------------------------------------------

  it('deve retornar 403 quando x-internal-key está ausente', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .query({ tenant_id: 't1', product_id: 'agendamento', user_id: 'u1' })

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ error: 'Forbidden' })
  })

  it('deve retornar 403 quando x-internal-key é inválida', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .set('x-internal-key', 'chave-errada')
      .query({ tenant_id: 't1', product_id: 'agendamento', user_id: 'u1' })

    expect(res.status).toBe(403)
    expect(res.body).toMatchObject({ error: 'Forbidden' })
  })

  // -------------------------------------------------------------------------
  // Validação de parâmetros
  // -------------------------------------------------------------------------

  it('deve retornar 400 quando tenant_id está ausente', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .query({ product_id: 'agendamento', user_id: 'u1' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ error: 'Bad Request' })
  })

  it('deve retornar 400 quando product_id está ausente', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .query({ tenant_id: 't1', user_id: 'u1' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ error: 'Bad Request' })
  })

  it('deve retornar 400 quando user_id está ausente', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .query({ tenant_id: 't1', product_id: 'agendamento' })

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ error: 'Bad Request' })
  })

  // -------------------------------------------------------------------------
  // Lógica de acesso: produto conhecido
  // -------------------------------------------------------------------------

  it('deve retornar allowed=true com permissões para produto "agendamento"', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .query({ tenant_id: 'tenant-abc', product_id: 'agendamento', user_id: 'user-123' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      allowed: true,
      permissions: expect.arrayContaining(['agendamento:read', 'agendamento:write']),
      tenant_id: 'tenant-abc',
      product_id: 'agendamento',
      user_id: 'user-123',
    })
  })

  it('deve retornar allowed=true com permissões para produto "dashboard"', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .query({ tenant_id: 'tenant-xyz', product_id: 'dashboard', user_id: 'user-456' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      allowed: true,
      permissions: expect.arrayContaining(['dashboard:read']),
    })
  })

  it('deve retornar allowed=true com permissões para produto "whatsapp"', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .query({ tenant_id: 'tenant-xyz', product_id: 'whatsapp', user_id: 'user-456' })

    expect(res.status).toBe(200)
    expect(res.body.allowed).toBe(true)
    expect(res.body.permissions).toContain('whatsapp:send')
  })

  // -------------------------------------------------------------------------
  // Lógica de acesso: produto desconhecido
  // -------------------------------------------------------------------------

  it('deve retornar allowed=false e permissões vazias para produto desconhecido', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .query({ tenant_id: 't1', product_id: 'produto-inexistente', user_id: 'u1' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      allowed: false,
      permissions: [],
    })
  })

  // -------------------------------------------------------------------------
  // Estrutura da resposta
  // -------------------------------------------------------------------------

  it('deve incluir checked_at no formato ISO na resposta', async () => {
    const res = await request(app)
      .get('/api/check-access')
      .set('x-internal-key', VALID_INTERNAL_KEY)
      .query({ tenant_id: 't1', product_id: 'gabi', user_id: 'u1' })

    expect(res.status).toBe(200)
    expect(res.body.checked_at).toBeDefined()
    expect(new Date(res.body.checked_at).toISOString()).toBe(res.body.checked_at)
  })

  it('deve retornar todos os produtos conhecidos com allowed=true', async () => {
    const products = [
      'agendamento', 'dashboard', 'whatsapp', 'relatorios',
      'notificacoes', 'historico', 'helpdesk', 'api-cockpit',
      'gabi', 'conector-erp', 'cronometro', 'atividades',
    ]

    for (const product_id of products) {
      const res = await request(app)
        .get('/api/check-access')
        .set('x-internal-key', VALID_INTERNAL_KEY)
        .query({ tenant_id: 't1', product_id, user_id: 'u1' })

      expect(res.status).toBe(200)
      expect(res.body.allowed).toBe(true)
    }
  })
})
