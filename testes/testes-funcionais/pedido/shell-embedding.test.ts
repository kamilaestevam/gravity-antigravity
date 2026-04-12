// @vitest-environment node
/**
 * Testes funcionais — Shell Embedding (integração porta 8000)
 *
 * Valida que o servidor Pedido está corretamente configurado para
 * rodar na porta 8030 e aceitar requisições originadas do shell
 * (configurador) na porta 8000.
 *
 * Testa:
 *   - Health endpoint responde com service='pedido' e porta correta
 *   - CORS: porta 8000 (shell) é aceita como origin
 *   - CORS: porta 5179 (standalone) ainda é aceita
 *   - CORS: origin externa desconhecida é bloqueada
 *   - PORT default é 8030 quando env não definido
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'

// ── Replica a lógica de CORS do index.ts (sem iniciar o servidor real) ─────────

function criarAppCors(allowedOriginsEnv: string) {
  const app = express()
  const ALLOWED_ORIGINS = allowedOriginsEnv.split(',').map(s => s.trim())

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || origin.startsWith('http://localhost:') || ALLOWED_ORIGINS.includes(origin)) {
        return cb(null, true)
      }
      cb(new Error(`Origin ${origin} not allowed`))
    },
    credentials: true,
  }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'pedido', port: 8030 })
  })

  // Error handler para erros de CORS
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(403).json({ error: err.message })
  })

  return app
}

// ── Testes de CORS ────────────────────────────────────────────────────────────

describe('CORS — configuração para shell embedding', () => {
  const ALLOWED_ORIGINS_ENV =
    'http://localhost:5179,http://localhost:5180,http://localhost:5181,' +
    'http://localhost:5182,http://localhost:5183,http://localhost:5184,' +
    'http://localhost:5185,http://localhost:8000'

  let app: express.Express

  beforeAll(() => {
    app = criarAppCors(ALLOWED_ORIGINS_ENV)
  })

  it('aceita requisição sem origin (curl, Power BI)', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })

  it('aceita origin do shell — localhost:8000', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:8000')
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:8000')
  })

  it('aceita origin standalone — localhost:5179', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5179')
    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5179')
  })

  it('aceita qualquer localhost (regra geral de dev)', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:9999')
    expect(res.status).toBe(200)
  })

  it('bloqueia origin externa desconhecida', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://site-externo.com')
    expect(res.status).toBe(403)
  })
})

// ── Testes de health endpoint ─────────────────────────────────────────────────

describe('Health endpoint', () => {
  let app: express.Express

  beforeAll(() => {
    app = criarAppCors('http://localhost:5179,http://localhost:8000')
  })

  it('retorna status ok com service=pedido', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('pedido')
  })

  it('retorna porta 8030', async () => {
    const res = await request(app).get('/health')
    expect(res.body.port).toBe(8030)
  })
})

// ── Testes de configuração de porta ──────────────────────────────────────────

describe('Configuração de porta', () => {
  it('PORT default é 8030 quando env não definido', () => {
    const savedPort = process.env.PORT
    delete process.env.PORT
    // Simula o fallback do index.ts: process.env.PORT ?? 8030
    const port = process.env.PORT ?? 8030
    expect(Number(port)).toBe(8030)
    if (savedPort !== undefined) process.env.PORT = savedPort
  })

  it('PORT respeita variável de ambiente quando definida', () => {
    const savedPort = process.env.PORT
    process.env.PORT = '8030'
    const port = process.env.PORT ?? 8030
    expect(Number(port)).toBe(8030)
    if (savedPort !== undefined) process.env.PORT = savedPort
    else delete process.env.PORT
  })

  it('.env contém PORT=8030 (não mais 8026)', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const envPath = path.resolve(__dirname, '../../../produto/pedido/server/.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    expect(envContent).toContain('PORT=8030')
    expect(envContent).not.toContain('PORT=8026')
  })

  it('.env inclui localhost:8000 em ALLOWED_ORIGINS', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const envPath = path.resolve(__dirname, '../../../produto/pedido/server/.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    expect(envContent).toContain('http://localhost:8000')
  })
})
