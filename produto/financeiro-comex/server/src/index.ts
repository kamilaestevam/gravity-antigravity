/**
 * index.ts — Financeiro Comex Express Server
 * Porta: 8029
 */

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware, prisma } from './middleware/tenantIsolation.js'
import { dashboardRouter } from './routes/dashboard.js'
import { dashboardWidgetsRouter } from './routes/dashboard.routes.js'
import { lancamentosRouter } from './routes/lancamentos.js'
import { importarRouter } from './routes/importar.js'
import { numerarioRouter } from './routes/numerario.js'
import { rateioRouter } from './routes/rateio.js'
import { historicoRouter } from './routes/historico.js'
import { configRouter } from './routes/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ?? 8029

// --- 0. Security Headers ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'ws://localhost:*'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// --- 1. Body Parser ---
app.use(express.json({ limit: '10mb' }))

// --- 2. CORS ---
app.use((_req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:5184',
    process.env.CLIENT_URL ?? '',
    process.env.CONFIGURATOR_URL ?? '',
  ].filter(Boolean)

  const origin = _req.headers.origin ?? ''
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-key, x-tenant-id, x-user-id, x-company-id, x-correlation-id')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  if (_req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// --- 3. Arquivos Estaticos (client build) ---
app.use(express.static(join(__dirname, '..', '..', 'client', 'dist')))

// --- 4. Health Check — SEM autenticacao ---
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', service: 'financeiro-comex', port: PORT, db: 'connected' })
  } catch {
    res.status(503).json({ status: 'down', service: 'financeiro-comex', db: 'disconnected' })
  }
})

// --- 5. Rate Limiting ---
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => (req.headers['x-tenant-id'] as string) || req.ip || 'unknown',
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisicoes' } },
})
app.use('/api/', apiLimiter)

// --- 6. requireInternalKey ---
app.use('/api/', requireInternalKey)

// --- 7. Tenant Isolation ---
app.use(tenantIsolationMiddleware)

// --- 8. Rotas do Produto ---
app.use('/api/v1/financeiro', dashboardRouter)
app.use('/api/v1/financeiro/dashboard', dashboardWidgetsRouter)
app.use('/api/v1/financeiro', lancamentosRouter)
app.use('/api/v1/financeiro', importarRouter)
app.use('/api/v1/financeiro', numerarioRouter)
app.use('/api/v1/financeiro', rateioRouter)
app.use('/api/v1/financeiro', historicoRouter)
app.use('/api/v1/financeiro/config', configRouter)

// --- 9. SPA Fallback ---
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, '..', '..', 'client', 'dist', 'index.html'))
})

// --- 10. Global Error Handler ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Financeiro-Comex Error] ${err.message}`)
  const statusCode = (err as { statusCode?: number }).statusCode || 500
  const code = (err as { code?: string }).code || 'INTERNAL_ERROR'
  res.status(statusCode).json({
    error: {
      code,
      message: err.message || 'Erro interno do servidor',
    },
  })
})

app.listen(PORT, () => console.log(`financeiro-comex server on :${PORT}`))
