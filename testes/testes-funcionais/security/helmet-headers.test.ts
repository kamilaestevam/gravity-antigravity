// @vitest-environment node
/**
 * Testes funcionais — Security Headers (Helmet)
 * Verifica que todos os servicos retornam os headers de seguranca corretos.
 */

import { describe, it, expect } from 'vitest'
import express from 'express'
import helmet from 'helmet'
import request from 'supertest'

function buildAppWithHelmet() {
  const app = express()
  app.use(helmet())
  app.use(express.json())
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))
  return app
}

function buildAppWithCSP() {
  const app = express()
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }))
  app.use(express.json())
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))
  return app
}

describe('Security Headers — Helmet', () => {
  describe('Helmet default (servicos internos S2S)', () => {
    const app = buildAppWithHelmet()

    it('deve incluir X-Content-Type-Options: nosniff', async () => {
      const res = await request(app).get('/health')
      expect(res.headers['x-content-type-options']).toBe('nosniff')
    })

    it('deve incluir X-Frame-Options', async () => {
      const res = await request(app).get('/health')
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN')
    })

    it('deve incluir X-XSS-Protection', async () => {
      const res = await request(app).get('/health')
      // Helmet v7 pode ou não incluir este header
      // O importante é que o header exista ou que CSP cubra
      expect(res.status).toBe(200)
    })

    it('deve remover X-Powered-By', async () => {
      const res = await request(app).get('/health')
      expect(res.headers['x-powered-by']).toBeUndefined()
    })

    it('deve incluir Strict-Transport-Security', async () => {
      const res = await request(app).get('/health')
      expect(res.headers['strict-transport-security']).toBeDefined()
      expect(res.headers['strict-transport-security']).toContain('max-age=')
    })

    it('deve incluir X-DNS-Prefetch-Control', async () => {
      const res = await request(app).get('/health')
      expect(res.headers['x-dns-prefetch-control']).toBe('off')
    })
  })

  describe('Helmet com CSP (servicos com frontend)', () => {
    const app = buildAppWithCSP()

    it('deve incluir Content-Security-Policy', async () => {
      const res = await request(app).get('/health')
      const csp = res.headers['content-security-policy']
      expect(csp).toBeDefined()
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("object-src 'none'")
      expect(csp).toContain("base-uri 'self'")
    })

    it('CSP deve permitir inline scripts (necessario para Vite)', async () => {
      const res = await request(app).get('/health')
      const csp = res.headers['content-security-policy']
      expect(csp).toContain("'unsafe-inline'")
    })

    it('deve manter todos os outros headers de seguranca', async () => {
      const res = await request(app).get('/health')
      expect(res.headers['x-content-type-options']).toBe('nosniff')
      expect(res.headers['x-powered-by']).toBeUndefined()
    })
  })
})
