/**
 * index.ts — Cotações BCB Express Server
 * Localização canônica: servicos-global/servicos-plataforma/taxas-moeda/server/
 * Porta: 8031
 *
 * Serviço de plataforma — fonte primária do PTAX BCB Olinda.
 * Consumido APENAS pelo Configurador via S2S durante o sync —
 * frontend NÃO deve chamar diretamente. Para a tela do workspace,
 * o Configurador (porta 8005) expõe `/api/v1/taxas-moeda` com
 * dados persistidos do banco prisma.cambio.
 *
 * Endpoints S2S (exigem header x-chave-interna-servico):
 *   GET /api/v1/internal/cotacoes-bcb?moeda=USD             — cotação atual
 *   GET /api/v1/internal/cotacoes-bcb/historico?moeda=X     — histórico
 *
 * Endpoints públicos:
 *   GET /health                                              — healthcheck
 *
 * Camadas (ver skills/arquitetura/servicos-plataforma/SKILL.md):
 *   Camada 1 (este serviço, S2S): /api/v1/internal/cotacoes-bcb
 *   Camada 2 (Configurador, UI):  /api/v1/taxas-moeda
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
import { timingSafeEqual as cryptoTimingSafeEqual } from 'node:crypto'
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

// ── 3. Healthcheck (público — sem auth) ──────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'cotacoes-bcb', port: PORT, ts: new Date().toISOString() })
})

// ── 4. Middleware S2S — exige x-chave-interna-servico ───────────────────────
// Aplicado APENAS no prefixo /api/v1/internal/* — protege o endpoint contra
// abuso de origem externa (sobrecarrega BCB Olinda). /health fica fora.
function requireChaveInternaServico(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.CHAVE_INTERNA_SERVICO
  if (!expected || expected.trim() === '') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'CHAVE_INTERNA_SERVICO nao configurada no servidor.',
    })
    return
  }
  const provided = req.headers['x-chave-interna-servico']
  const providedStr = Array.isArray(provided) ? provided[0] : provided
  if (!providedStr) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Header x-chave-interna-servico ausente. Endpoint S2S.',
    })
    return
  }
  // Comparacao timing-safe
  const a = Buffer.from(providedStr, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length || !cryptoTimingSafeEqual(a, b)) {
    res.status(403).json({ error: 'Forbidden', message: 'Chave interna invalida.' })
    return
  }
  next()
}

// ── 5. Rotas S2S — fonte primária BCB Olinda ────────────────────────────────
app.use('/api/v1/internal/cotacoes-bcb', requireChaveInternaServico, taxasMoedaRouter)

// ── 6. 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada', code: 'NOT_FOUND' })
})

// ── 7. Error handler global ──────────────────────────────────────────────────
app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode ?? 500
  const code   = err.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'ERROR')
  const message = err.message || 'Erro interno'
  if (status >= 500) console.error('[CotacoesBCB/Server]', message, err.stack)
  res.status(status).json({ error: { message, code } })
})

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[CotacoesBCB] Servidor rodando na porta ${PORT}`)
  console.log(`[CotacoesBCB] Health: http://localhost:${PORT}/health`)
  console.log(`[CotacoesBCB] S2S endpoint: http://localhost:${PORT}/api/v1/internal/cotacoes-bcb`)
})
