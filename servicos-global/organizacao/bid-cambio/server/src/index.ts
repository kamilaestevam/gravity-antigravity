/**
 * index.ts — BID Cambio Express Server
 * Localizacao canonica: produto/bid-cambio/server/
 * Porta: 8025
 * Skill: antigravity-criar-produto (Passo 7 — middlewares na ordem correta)
 */

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware, prisma } from './middleware/tenantIsolation.js'
import { moedasRouter } from './routes/moedas.js'
import { tiposLiquidacaoRouter } from './routes/tipos-liquidacao.js'
import { metodosVencimentoRouter } from './routes/metodos-vencimento.js'
import { cotacoesPtaxRouter } from './routes/cotacoes-ptax.js'
import { cambiosRouter } from './routes/cambios.js'
import { cotacoesRouter } from './routes/cotacoes.js'
import { bidsRouter } from './routes/bids.js'
import { comparativoRouter } from './routes/comparativo.js'
import { corretorasRouter } from './routes/corretoras.js'
import { portalRouter } from './routes/portal.js'
import { portalPublicRouter } from './routes/portalPublic.js'
import { avaliacoesRouter } from './routes/avaliacoes.js'
import { dashboardRouter } from './routes/dashboard.js'
import { dashboardWidgetsRouter } from './routes/dashboard.routes.js'
import { preferenciasRouter } from './routes/preferencias.js'
import { startCronJobs } from './services/cronJobs.js'
import { apiObservability } from '../../../../../servicos-global/tenant/middleware/apiObservability.js'
import { createProductAuditPlugin } from '../../../../../servicos-global/tenant/historico-global/src/product-audit-plugin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ?? 8025

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
    'http://localhost:5176',  // client comprador dev
    'http://localhost:5177',  // client corretora dev
    'http://localhost:8003',  // configurador
    process.env.CLIENT_URL ?? '',
    process.env.PORTAL_CORRETORA_URL ?? '',
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
    res.json({ status: 'ok', service: 'bid-cambio', port: PORT, db: 'connected' })
  } catch {
    res.status(503).json({ status: 'down', service: 'bid-cambio', db: 'disconnected' })
  }
})

// --- 5. Master Data — SEM autenticacao (moedas, PTAX sao dados publicos) ---
// DDD: rotas top-level (4 routers split de masterData.ts em Gamma-3)
app.use('/api/v1', moedasRouter)
app.use('/api/v1', tiposLiquidacaoRouter)
app.use('/api/v1', metodosVencimentoRouter)
app.use('/api/v1', cotacoesPtaxRouter)

// --- 6. Portal Publico da Corretora — SEM internal key (usa token de resposta) ---
app.use('/api/v1/bid-cambio/portal/public', portalPublicRouter)

// --- 7. requireInternalKey — protege todas as rotas abaixo ---
app.use(requireInternalKey)

// --- 8. Tenant Isolation — injeta req.prisma com filtro por tenant_id ---
app.use(tenantIsolationMiddleware)

// --- 8.1. Observabilidade — captura metricas para API Cockpit ---
app.use(apiObservability('bid-cambio'))
app.use(createProductAuditPlugin({
  product_id: 'bid-cambio',
  module: 'bid-cambio',
  getActorFromReq: (req) => {
    const tenant_id = req.headers['x-tenant-id'] as string | undefined
    const actor_id  = req.headers['x-user-id']   as string | undefined
    if (!tenant_id || !actor_id) return null
    return { tenant_id, actor_id, actor_name: actor_id, actor_type: 'USER' }
  },
}))

// --- 9. Rotas do Produto (protegidas) ---

// Pilar 1 — Gestao de Cambio
app.use('/api/v1/bid-cambio/cambios', cambiosRouter)
app.use('/api/v1/bid-cambio/preferencias', preferenciasRouter)

// Pilar 2 — Marketplace
app.use('/api/v1/bid-cambio/cotacoes', cotacoesRouter)
app.use('/api/v1/bid-cambio/bids', bidsRouter)
app.use('/api/v1/bid-cambio/comparativo', comparativoRouter)
app.use('/api/v1/bid-cambio/corretoras', corretorasRouter)
app.use('/api/v1/bid-cambio/portal', portalRouter)
app.use('/api/v1/bid-cambio/avaliacoes', avaliacoesRouter)
app.use('/api/v1/bid-cambio/dashboard', dashboardRouter)
app.use('/api/v1/bid-cambio/dashboard', dashboardWidgetsRouter)

// --- 10. SPA Fallback ---
app.get('*', (_req: Request, res: Response) => {
  const indexPath = join(__dirname, '..', '..', 'client', 'dist', 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).json({ error: 'Client build nao encontrado. Execute npm run build no /client.' })
  })
})

// --- 11. Error Handler Global ---
app.use((err: Error & { statusCode?: number; code?: string }, req: Request, res: Response, _next: NextFunction) => {
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code ?? 'BAD_REQUEST',
        message: err.message,
      },
    })
  }
  console.error(`[BidCambio][INTERNAL_ERROR] correlation:${req.headers['x-correlation-id'] ?? 'none'}`, err.message)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
    },
  })
})

// --- 12. Inicializacao ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[BidCambio] Servidor rodando na porta ${PORT}`)
    startCronJobs()
  })
}

export { app }
