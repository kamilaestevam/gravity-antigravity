/**
 * index.ts — BID Frete Internacional Express Server
 * Localizacao canonica: servicos-global/produto/bid-frete/server/
 * Porta: 8023
 * Skill: antigravity-criar-produto (Passo 7 — 11 middlewares na ordem correta)
 */

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware, prisma } from './middleware/tenantIsolation.js'
import { portosRouter } from './routes/portos.js'
import { incotermsRouter } from './routes/incoterms.js'
import { modaisRouter } from './routes/modais.js'
import { moedasRouter } from './routes/moedas.js'
import { containersRouter } from './routes/containers.js'
import { cotacoesRouter } from './routes/cotacoes.js'
import { fornecedoresRouter } from './routes/fornecedores.js'
import { bidsRouter } from './routes/bids.js'
import { comparativoRouter } from './routes/comparativo.js'
import { portalRouter } from './routes/portal.js'
import { cotacoesPublicasRouter } from './routes/cotacoes-publicas.js'
import { avaliacoesRouter } from './routes/avaliacoes.js'
import { dashboardRouter } from './routes/dashboard.js'
import { dashboardWidgetsRouter } from './routes/dashboard.routes.js'
import { startCronJobs } from './services/cronJobs.js'
import { rateLimitPresets } from '../../../../servicos-plataforma/middleware/rateLimiter.js'
import { apiObservability } from '../../../../servicos-plataforma/middleware/apiObservability.js'
import { createProductAuditPlugin } from '../../../../servicos-plataforma/historico-global/src/product-audit-plugin.js'

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-key, x-id-organizacao, x-id-usuario, x-correlation-id')
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
app.use('/api/v1', rateLimitPresets.public(), portosRouter)
app.use('/api/v1', rateLimitPresets.public(), incotermsRouter)
app.use('/api/v1', rateLimitPresets.public(), modaisRouter)
app.use('/api/v1', rateLimitPresets.public(), moedasRouter)
// paisesRouter removido — fonte única em Cadastros (/api/v1/cadastros/paises).
// Bid-frete não tinha consumers reais desse endpoint.
app.use('/api/v1', rateLimitPresets.public(), containersRouter)

// --- 6. Portal Publico do Fornecedor — SEM internal key (usa token de resposta) ---
app.use('/api/v1/cotacoes-publicas', rateLimitPresets.public(), cotacoesPublicasRouter)

// --- 7. requireInternalKey — protege todas as rotas abaixo ---
app.use(requireInternalKey)

// --- 8. Tenant Isolation — injeta req.prisma com filtro por id_organizacao ---
app.use(tenantIsolationMiddleware)

// --- 8.1. Observabilidade — captura metricas para API Cockpit ---
app.use(apiObservability('bid-frete'))
app.use(createProductAuditPlugin({
  product_id: 'bid-frete',
  module: 'bid-frete',
  getActorFromReq: (req) => {
    const id_organizacao = req.headers['x-id-organizacao'] as string | undefined
    const actor_id  = req.headers['x-id-usuario']   as string | undefined
    if (!id_organizacao || !actor_id) return null
    return { id_organizacao, actor_id, actor_name: actor_id, actor_type: 'USER' }
  },
}))

// --- 9. Rotas do Produto (protegidas) ---
app.use('/api/v1/bid-frete/cotacoes', cotacoesRouter)
app.use('/api/v1/bid-frete/fornecedores', fornecedoresRouter)
app.use('/api/v1/bid-frete/bids', bidsRouter)
app.use('/api/v1/bid-frete/comparativo', comparativoRouter)
app.use('/api/v1/bid-frete/portal', portalRouter)
app.use('/api/v1/bid-frete/avaliacoes', avaliacoesRouter)
app.use('/api/v1/bid-frete/dashboard', dashboardRouter)
app.use('/api/v1/bid-frete/dashboard', dashboardWidgetsRouter)

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
