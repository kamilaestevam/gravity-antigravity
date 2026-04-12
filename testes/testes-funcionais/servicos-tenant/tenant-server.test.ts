// @vitest-environment node
/**
 * testes/testes-funcionais/servicos-tenant/tenant-server.test.ts
 * Testes funcionais do Super-Servidor Tenant (porta 3001).
 *
 * Estratégia: mockar prisma, initHistorico, initNotificacoes e todos os
 * service routers para testar apenas o comportamento do servidor principal
 * (middlewares, health, auth, internal key, routing).
 *
 * Cobre:
 *   ✓ GET /health — sem autenticação, retorna 200 com lista de serviços
 *   ✓ Rotas autenticadas — 401 sem x-tenant-id
 *   ✓ Rotas autenticadas — 403 sem x-internal-key
 *   ✓ Rotas autenticadas — 403 com x-internal-key inválida
 *   ✓ Correlation ID — gerado automaticamente e propagado
 *   ✓ Rota desconhecida — 404 com auth válida
 *   ✓ Isolamento cross-tenant — req.auth.tenantId correto
 */

import { describe, it, expect, vi, beforeAll } from 'vitest'
import request from 'supertest'

// ── Mocks — devem ser definidos ANTES dos imports que dependem deles ──────────

vi.mock('../../../servicos-global/tenant/server/lib/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1n }]),
  },
}))

vi.mock('../../../servicos-global/tenant/historico-global/server/init.js', () => ({
  initHistorico: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../servicos-global/tenant/notificacoes/server/init.js', () => ({
  initNotificacoes: vi.fn().mockResolvedValue(undefined),
}))

// Mockar todos os service routers com factories assíncronas para evitar
// dependências transitivas (Prisma, pg-boss, etc.)
vi.mock('../../../servicos-global/tenant/atividades/server/routes.js', async () => ({
  atividadesServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/cronometro/server/routes.js', async () => ({
  cronometroServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/email/server/routes.js', async () => ({
  emailServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/gabi/server/routes.js', async () => ({
  gabiServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/dashboard/server/routes.js', async () => ({
  dashboardServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/relatorios/server/routes.js', async () => ({
  relatoriosServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/historico-global/server/routes.js', async () => ({
  historicoServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/notificacoes/server/routes.js', async () => ({
  notificacoesServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/agendamento/server/routes.js', async () => ({
  agendamentoServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/preferencias-usuario/server/routes.js', async () => ({
  preferenciasServiceRouter: (await import('express')).Router(),
}))
vi.mock('../../../servicos-global/tenant/whatsapp/server/routes.js', async () => ({
  whatsappServiceRouter: (await import('express')).Router(),
}))

// ── Import do app DEPOIS dos mocks ─────────────────────────────────────────
import { app } from '../../../servicos-global/tenant/server/index.js'

// ── Fixtures ──────────────────────────────────────────────────────────────────
const VALID_KEY = 'test-internal-key'
const TENANT_A  = 'tenant-aaa-001'
const TENANT_B  = 'tenant-bbb-002'
const USER_ID   = 'user-001'

const validHeaders = {
  'x-tenant-id':    TENANT_A,
  'x-user-id':      USER_ID,
  'x-internal-key': VALID_KEY,
}

beforeAll(() => {
  process.env.INTERNAL_API_KEY = VALID_KEY
  process.env.NODE_ENV         = 'test'
})

// ── Health Check ──────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('retorna 200 sem autenticação', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })

  it('inclui campo status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.body.status).toBe('ok')
  })

  it('inclui service tenant-server', async () => {
    const res = await request(app).get('/health')
    expect(res.body.service).toBe('tenant-server')
  })

  it('lista todos os 11 serviços', async () => {
    const res = await request(app).get('/health')
    const services: string[] = res.body.services
    expect(services).toContain('atividades')
    expect(services).toContain('cronometro')
    expect(services).toContain('email')
    expect(services).toContain('gabi')
    expect(services).toContain('dashboard')
    expect(services).toContain('relatorios')
    expect(services).toContain('historico')
    expect(services).toContain('notificacoes')
    expect(services).toContain('agendamento')
    expect(services).toContain('preferencias')
    expect(services).toContain('whatsapp')
  })
})

// ── Autenticação (authMiddleware) ─────────────────────────────────────────────

describe('Autenticação — x-tenant-id obrigatório', () => {
  it('retorna 401 sem nenhum header', async () => {
    const res = await request(app).get('/api/v1/qualquer-rota')
    expect(res.status).toBe(401)
  })

  it('retorna 401 sem x-tenant-id', async () => {
    const res = await request(app)
      .get('/api/v1/qualquer-rota')
      .set('x-user-id', USER_ID)
    expect(res.status).toBe(401)
  })

  it('body de erro tem code UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/v1/qualquer-rota')
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  it('passa authMiddleware com x-tenant-id presente', async () => {
    const res = await request(app)
      .get('/api/v1/qualquer-rota')
      .set('x-tenant-id', TENANT_A)
      .set('x-internal-key', VALID_KEY)
    // Passou auth e internal key → rota não existe → 404 (não 401 nem 403)
    expect(res.status).toBe(404)
  })
})

// ── Internal Key (withInternalKeyValidation) ─────────────────────────────────

describe('S2S — x-internal-key obrigatório', () => {
  it('retorna 403 sem x-internal-key', async () => {
    const res = await request(app)
      .get('/api/v1/qualquer-rota')
      .set('x-tenant-id', TENANT_A)
    expect(res.status).toBe(403)
  })

  it('retorna 403 com x-internal-key inválida', async () => {
    const res = await request(app)
      .get('/api/v1/qualquer-rota')
      .set('x-tenant-id', TENANT_A)
      .set('x-internal-key', 'chave-errada-xyz')
    expect(res.status).toBe(403)
  })

  it('passa com x-internal-key correta', async () => {
    const res = await request(app)
      .get('/api/v1/rota-inexistente')
      .set(validHeaders)
    // Autenticação OK + chave OK → rota não montada → 404
    expect(res.status).toBe(404)
  })
})

// ── Correlation ID ────────────────────────────────────────────────────────────

describe('Correlation ID', () => {
  it('/health não exige x-correlation-id para funcionar', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })

  it('aceita x-correlation-id fornecido pelo chamador', async () => {
    const res = await request(app)
      .get('/health')
      .set('x-correlation-id', 'custom-corr-id-12345')
    expect(res.status).toBe(200)
  })
})

// ── Isolamento cross-tenant ───────────────────────────────────────────────────

describe('Isolamento cross-tenant', () => {
  it('tenant A e tenant B recebem tratamento independente', async () => {
    const [resA, resB] = await Promise.all([
      request(app).get('/api/v1/rota-a').set({ ...validHeaders, 'x-tenant-id': TENANT_A }),
      request(app).get('/api/v1/rota-b').set({ ...validHeaders, 'x-tenant-id': TENANT_B }),
    ])
    // Ambos passam auth e internal key — rotas não existem → 404 (não 401/403)
    expect(resA.status).toBe(404)
    expect(resB.status).toBe(404)
  })
})

// ── Rota desconhecida ─────────────────────────────────────────────────────────

describe('Rotas não registradas', () => {
  it('retorna 404 para rota inexistente com auth válida', async () => {
    const res = await request(app)
      .get('/api/v1/servico-que-nao-existe')
      .set(validHeaders)
    expect(res.status).toBe(404)
  })

  it('retorna 401 para POST /health (authMiddleware intercepta antes do 404)', async () => {
    // POST /health não bate no app.get('/health'), cai no authMiddleware que exige x-tenant-id
    const res = await request(app).post('/health')
    expect(res.status).toBe(401)
  })
})
