/**
 * index.ts — LPCO Express Server
 * Porta: 8027
 * Skill: antigravity-criar-produto (Passo 12 — 11 middlewares na ordem correta)
 */

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { dashboardWidgetsRouter } from './routes/dashboard.routes.js'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware, prisma } from './middleware/tenantIsolation.js'
import { lpcoRouter } from './routes/lpco.js'
import { lpcoItemRouter } from './routes/lpcoItem.js'
import { lpcoExigenciaRouter } from './routes/lpcoExigencia.js'
import { lpcoVinculoRouter } from './routes/lpcoVinculo.js'
import { lpcoDocumentoRouter } from './routes/lpcoDocumento.js'
import { lpcoHistoricoRouter } from './routes/lpcoHistorico.js'
import { simuladorTARouter } from './routes/simuladorTA.js'
import { lpcoPortalRouter } from './routes/lpcoPortal.js'
import { credenciaisRouter } from './routes/credenciais.js'
import { apiObservability } from '../../../../servicos-global/tenant/middleware/apiObservability.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ?? 8027

// --- 0. Security Headers ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "ws://localhost:*"],
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
    'http://localhost:5182',
    process.env.CLIENT_URL ?? '',
    process.env.CONFIGURATOR_URL ?? '',
  ].filter(Boolean)

  const origin = _req.headers.origin ?? ''
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-key, x-tenant-id, x-user-id, x-correlation-id')
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
    res.json({ status: 'ok', service: 'lpco', port: PORT, db: 'connected' })
  } catch {
    res.status(503).json({ status: 'down', service: 'lpco', db: 'disconnected' })
  }
})

// --- 5. Rate Limiting ---
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.headers['x-tenant-id'] as string || req.ip || 'unknown',
  message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisicoes' } },
})
app.use('/api/', apiLimiter)

// --- 6. requireInternalKey — protege todas as rotas abaixo ---
app.use('/api/', requireInternalKey)

// --- 7. Tenant Isolation — injeta req.prisma com filtro por tenant_id ---
app.use(tenantIsolationMiddleware)

// --- 7.1. Observabilidade — captura metricas para API Cockpit ---
app.use(apiObservability('lpco'))

// --- 8. Rotas do Produto (protegidas) ---
app.use('/api/v1/lpcos', lpcoRouter)
app.use('/api/v1/lpcos', lpcoItemRouter)
app.use('/api/v1/lpcos', lpcoExigenciaRouter)
app.use('/api/v1/lpcos', lpcoVinculoRouter)
app.use('/api/v1/lpcos', lpcoDocumentoRouter)
app.use('/api/v1/lpcos', lpcoHistoricoRouter)
app.use('/api/v1/lpcos', lpcoPortalRouter)
app.use('/api/v1/credenciais', credenciaisRouter)
app.use('/api/v1/simulador-ta', simuladorTARouter)
app.use('/api/v1/lpcos/dashboard', dashboardWidgetsRouter)

// --- 9. SPA Fallback (producao) ---
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(join(__dirname, '..', '..', 'client', 'dist', 'index.html'))
})

// --- 10. Global Error Handler ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[LPCO Error] ${err.message}`)
  const statusCode = (err as { statusCode?: number }).statusCode || 500
  const code = (err as { code?: string }).code || 'INTERNAL_ERROR'
  res.status(statusCode).json({
    error: {
      code,
      message: err.message || 'Erro interno do servidor',
    },
  })
})

app.listen(PORT, () => console.log(`lpco server on :${PORT}`))
