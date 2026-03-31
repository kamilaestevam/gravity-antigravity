/**
 * index.ts — BID Frete Internacional Express Server
 * Localizacao canonica: produto/bid-frete/server/
 * Porta: 8023
 * Skill: antigravity-criar-produto (Passo 7 — 11 middlewares na ordem correta)
 */

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware, prisma } from './middleware/tenantIsolation.js'
import { masterDataRouter } from './routes/masterData.js'
import { cotacoesRouter } from './routes/cotacoes.js'
import { fornecedoresRouter } from './routes/fornecedores.js'
import { bidsRouter } from './routes/bids.js'
import { comparativoRouter } from './routes/comparativo.js'
import { portalRouter } from './routes/portal.js'
import { portalPublicRouter } from './routes/portalPublic.js'
import { avaliacoesRouter } from './routes/avaliacoes.js'
import { dashboardRouter } from './routes/dashboard.js'
import { startCronJobs } from './services/cronJobs.js'
import { rateLimitPresets } from '../../../../servicos-global/tenant/middleware/rateLimiter.js'
import { apiObservability } from '../../../../servicos-global/tenant/middleware/apiObservability.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ?? 8023

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

// --- 2. CORS (Configurador, Shell Gravity) ---
app.use((_req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:5175',  // client dev
    'http://localhost:8003',  // configurador
    process.env.CLIENT_URL ?? '',
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
    res.json({ status: 'ok', service: 'bid-frete', port: PORT, db: 'connected' })
  } catch {
    res.status(503).json({ status: 'down', service: 'bid-frete', db: 'disconnected' })
  }
})

// --- 5. Master Data — SEM autenticacao (portos, NCMs, incoterms sao dados publicos) ---
app.use('/api/v1/master-data', rateLimitPresets.public(), masterDataRouter)

// --- 6. Portal Publico do Fornecedor — SEM internal key (usa token de resposta) ---
app.use('/api/v1/bid-frete/portal/public', rateLimitPresets.public(), portalPublicRouter)

// --- 7. requireInternalKey — protege todas as rotas abaixo ---
app.use(requireInternalKey)

// --- 8. Tenant Isolation — injeta req.prisma com filtro por tenant_id ---
app.use(tenantIsolationMiddleware)

// --- 8.1. Observabilidade — captura metricas para API Cockpit ---
app.use(apiObservability('bid-frete'))

// --- 9. Rotas do Produto (protegidas) ---
app.use('/api/v1/bid-frete/cotacoes', cotacoesRouter)
app.use('/api/v1/bid-frete/fornecedores', fornecedoresRouter)
app.use('/api/v1/bid-frete/bids', bidsRouter)
app.use('/api/v1/bid-frete/comparativo', comparativoRouter)
app.use('/api/v1/bid-frete/portal', portalRouter)
app.use('/api/v1/bid-frete/avaliacoes', avaliacoesRouter)
app.use('/api/v1/bid-frete/dashboard', dashboardRouter)

// --- 10. SPA Fallback ---
app.get('*', (_req: Request, res: Response) => {
  const indexPath = join(__dirname, '..', '..', 'client', 'dist', 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).json({ error: 'Client build nao encontrado. Execute npm run build no /client.' })
  })
})

// --- 11. Error Handler Global ---
app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[BidFrete] Erro:', err.message)
  const status = err.statusCode ?? 500
  res.status(status).json({
    error: err.message || 'Erro interno',
    code: err.code ?? 'INTERNAL_ERROR',
  })
})

// --- 12. Inicializacao ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[BidFrete] Servidor rodando na porta ${PORT}`)
    startCronJobs()
  })
}

export { app }
