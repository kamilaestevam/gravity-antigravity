/**
 * index.ts — SimulaCusto Express Server
 * Localização canônica: produto/simula-custo/server/
 * Porta: 8020
 * Skill: antigravity-criar-produto (Passo 7 — 11 middlewares na ordem correta)
 */

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { simulateRouter } from './routes/simulate.js'
import { estimativasRouter } from './routes/estimativas.js'
import { masterDataRouter } from './routes/masterData.js'
import { dashboardRouter } from './routes/dashboard.js'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware, prisma } from './middleware/tenantIsolation.js'
import { tokenPool } from './services/tokenPool.js'
import { apiObservability } from '../../../../servicos-global/tenant/middleware/apiObservability.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ?? 8020

// ─── 0. Security Headers ──────────────────────────────────────────────────────
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

// ─── 1. Body Parser ────────────────────────────────────────────────────────────
app.use(express.json())

// ─── 2. CORS (Configurador, Shell Gravity) ────────────────────────────────────
app.use((_req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:8001', // client dev
    'http://localhost:8000', // configurador
    process.env.CLIENT_URL ?? '',
  ].filter(Boolean)

  const origin = _req.headers.origin ?? ''
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-key, x-tenant-id')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (_req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// ─── 3. Arquivos Estáticos (client build) ─────────────────────────────────────
app.use(express.static(join(__dirname, '..', '..', 'client', 'dist')))

// ─── 4. Health Check — SEM autenticação (UptimeRobot) ─────────────────────────
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', service: 'simula-custo', port: PORT, db: 'connected' })
  } catch {
    res.status(503).json({ status: 'down', service: 'simula-custo', db: 'disconnected' })
  }
})

// ─── 5. Master Data — SEM autenticação (NCM, UFs, Países são dados públicos) ──
app.use('/api/v1/master-data', masterDataRouter)

// ─── 6. requireInternalKey — protege todas as rotas abaixo ────────────────────
//    Skill: antigravity-autenticacao-s2s
//    Em dev: INTERNAL_SERVICE_KEY=dev-key no .env
app.use(requireInternalKey)

// ─── 7. Tenant Isolation — injeta req.prisma com filtro por tenant_id ─────────
//    tenant_id vem do header x-tenant-id propagado pelo Gateway (JWT)
//    NUNCA vem do body da requisição
app.use(tenantIsolationMiddleware)

// ─── 7.1. Observabilidade — captura metricas para API Cockpit ─────────────────
app.use(apiObservability('simula-custo'))

// ─── 8. Rotas do Produto ───────────────────────────────────────────────────────
app.use('/api/v1/simula-custo', simulateRouter)
app.use('/api/v1/simula-custo/estimativas', estimativasRouter)
app.use('/api/v1/dashboard', dashboardRouter)

// ─── 9. SPA Fallback (serve o client React para qualquer rota não-API) ─────────
app.get('*', (_req: Request, res: Response) => {
  const indexPath = join(__dirname, '..', '..', 'client', 'dist', 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).json({ error: 'Client build não encontrado. Execute npm run build no /client.' })
  })
})

// ─── 10. Error Handler Global ─────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SimulaCusto] Erro não tratado:', err.message)
  res.status(500).json({ error: err.message || 'Erro interno' })
})

// ─── 11. Inicialização ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[SimulaCusto] ✅ Servidor canônico rodando na porta ${PORT}`)
    tokenPool.start()
  })
}

export { app }
