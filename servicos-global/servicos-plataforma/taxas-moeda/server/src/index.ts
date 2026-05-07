/**
 * index.ts — Taxas de Moeda Express Server
 * Localização canônica: servicos-global/servicos-plataforma/taxas-moeda/server/
 * Porta: 8031
 *
 * Serviço de plataforma — fonte única do PTAX BCB. Consumido por Configurador,
 * bid-câmbio, simula-custo e qualquer outro produto que precise de cotação.
 *
 * Endpoints (públicos — PTAX é dado público do BCB):
 *   GET /api/v1/taxas-moeda?moeda=USD             — cotação atual
 *   GET /api/v1/taxas-moeda/historico?moeda=X     — histórico
 *   GET /health                                    — healthcheck
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dir, '../../../../../.env.local') })
dotenv.config({ path: resolve(__dir, '../../.env') })

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { taxasMoedaRouter } from './routes/taxas-moeda.js'

const app = express()
const PORT = process.env.PORT ?? 8031

// ── 0. Security Headers ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'"],
      connectSrc: ["'self'"],
      objectSrc:  ["'none'"],
      baseUri:    ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// ── 1. CORS ──────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:5179').split(',')
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin.startsWith('http://localhost:') || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`Origin ${origin} not allowed`))
  },
  credentials: true,
}))

// ── 2. Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '512kb' }))

// ── 3. Healthcheck ───────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'taxas-moeda', port: PORT, ts: new Date().toISOString() })
})

// ── 4. Rotas de negócio ──────────────────────────────────────────────────────
app.use('/api/v1/taxas-moeda', taxasMoedaRouter)

// ── 5. 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada', code: 'NOT_FOUND' })
})

// ── 6. Error handler global ──────────────────────────────────────────────────
app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode ?? 500
  const code   = err.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'ERROR')
  const message = err.message || 'Erro interno'
  if (status >= 500) console.error('[TaxasMoeda/Server]', message, err.stack)
  res.status(status).json({ error: { message, code } })
})

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[TaxasMoeda] Servidor rodando na porta ${PORT}`)
  console.log(`[TaxasMoeda] Health: http://localhost:${PORT}/health`)
})
