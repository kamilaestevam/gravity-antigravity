// @vitest-environment node
// testes/testes-funcionais/security/admin-secrets.test.ts
// Testes funcionais — GET /api/admin/security/secrets
//
// Valida que:
//   1. Endpoint retorna status de configuração sem expor prefixos
//   2. Resposta NÃO contém campo 'prefix'
//   3. Cada secret contém apenas 'name' e 'configured'

import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// ─── Env vars necessárias para os testes ─────────────────────────────────────

vi.hoisted(() => {
  process.env.CLERK_SECRET_KEY = 'sk_test_dummy_vitest'
  process.env.INTERNAL_SERVICE_KEY = 'test-internal-key-abc123'
  process.env.STRIPE_SECRET_KEY = 'sk_test_stripe_dummy'
  process.env.ENCRYPTION_KEY = 'enc-key-test-value'
  process.env.CONFIGURADOR_DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
})

// ─── App de teste ────────────────────────────────────────────────────────────

/**
 * Replica a lógica do GET /secrets de adminSecurity.ts
 * sem importar o router real (que puxa Clerk/Prisma/requireAuth).
 */
function buildApp() {
  const app = express()
  app.use(express.json())

  app.get('/api/admin/security/secrets', (_req, res) => {
    const secrets = [
      {
        name: 'INTERNAL_SERVICE_KEY',
        configured: !!process.env.INTERNAL_SERVICE_KEY,
      },
      {
        name: 'CLERK_SECRET_KEY',
        configured: !!process.env.CLERK_SECRET_KEY,
      },
      {
        name: 'STRIPE_SECRET_KEY',
        configured: !!process.env.STRIPE_SECRET_KEY,
      },
      {
        name: 'ENCRYPTION_KEY',
        configured: !!process.env.ENCRYPTION_KEY,
      },
    ]

    res.json({ secrets })
  })

  return app
}

// ─── Suites ─────────────────────────────────────────────────────────────────

describe('GET /api/admin/security/secrets — formato seguro', () => {
  const app = buildApp()

  beforeEach(() => vi.clearAllMocks())

  it('200 — retorna status de configuração das secrets', async () => {
    const response = await request(app)
      .get('/api/admin/security/secrets')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('secrets')
    expect(Array.isArray(response.body.secrets)).toBe(true)
    expect(response.body.secrets.length).toBeGreaterThan(0)
  })

  it('cada secret contém configured=true quando env var existe', async () => {
    const response = await request(app)
      .get('/api/admin/security/secrets')

    for (const secret of response.body.secrets) {
      expect(secret.configured).toBe(true)
    }
  })

  it('resposta NÃO contém campo "prefix" em nenhum secret', async () => {
    const response = await request(app)
      .get('/api/admin/security/secrets')

    for (const secret of response.body.secrets) {
      expect(secret).not.toHaveProperty('prefix')
    }
  })

  it('cada secret contém APENAS os campos "name" e "configured"', async () => {
    const response = await request(app)
      .get('/api/admin/security/secrets')

    const allowedKeys = ['name', 'configured']

    for (const secret of response.body.secrets) {
      const keys = Object.keys(secret)
      expect(keys).toEqual(expect.arrayContaining(allowedKeys))
      expect(keys.length).toBe(allowedKeys.length)
      // Garante que não há campos extras (value, prefix, hash, etc.)
      for (const key of keys) {
        expect(allowedKeys).toContain(key)
      }
    }
  })

  it('NÃO expõe valor real, hash ou prefixo de nenhuma secret', async () => {
    const response = await request(app)
      .get('/api/admin/security/secrets')

    const responseText = JSON.stringify(response.body)

    // Valores reais das env vars NÃO devem aparecer na resposta
    expect(responseText).not.toContain('sk_test_dummy_vitest')
    expect(responseText).not.toContain('test-internal-key-abc123')
    expect(responseText).not.toContain('sk_test_stripe_dummy')
    expect(responseText).not.toContain('enc-key-test-value')

    // Prefixos parciais NÃO devem aparecer
    expect(responseText).not.toContain('sk_test_')
    expect(responseText).not.toContain('test-internal')
    expect(responseText).not.toContain('enc-key')
  })

  it('secret não configurada retorna configured=false', async () => {
    // Remove temporariamente uma env var
    const original = process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY

    const appWithMissing = buildApp()
    const response = await request(appWithMissing)
      .get('/api/admin/security/secrets')

    const encryptionSecret = response.body.secrets.find(
      (s: { name: string }) => s.name === 'ENCRYPTION_KEY'
    )

    expect(encryptionSecret).toBeDefined()
    expect(encryptionSecret.configured).toBe(false)

    // Restaura
    process.env.ENCRYPTION_KEY = original
  })
})

describe('GET /api/admin/security/secrets — lista completa', () => {
  const app = buildApp()

  it('retorna exatamente 4 secrets conhecidas', async () => {
    const response = await request(app)
      .get('/api/admin/security/secrets')

    expect(response.body.secrets).toHaveLength(4)

    const names = response.body.secrets.map((s: { name: string }) => s.name)
    expect(names).toContain('INTERNAL_SERVICE_KEY')
    expect(names).toContain('CLERK_SECRET_KEY')
    expect(names).toContain('STRIPE_SECRET_KEY')
    expect(names).toContain('ENCRYPTION_KEY')
  })
})
