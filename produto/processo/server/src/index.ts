/**
 * index.ts — Processo Express Server
 * Localizacao canonica: produto/processo/server/
 * Porta: 8025
 * Skill: antigravity-criar-produto (Passo 7 — 11 middlewares na ordem correta)
 */

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { processosRouter } from './routes/processos.js'
import { followUpRouter } from './routes/followup.js'
import { documentosRouter } from './routes/documentos.js'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware, prisma } from './middleware/tenantIsolation.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ?? 8025

// --- 0. Security Headers -------------------------------------------------------
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

// --- 1. Body Parser -----------------------------------------------------------
app.use(express.json())

// --- 2. CORS (Configurador, Shell Gravity) ------------------------------------
app.use((_req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:5174', // client dev
    'http://localhost:8003', // configurador
    process.env.CLIENT_URL ?? '',
  ].filter(Boolean)

  const origin = _req.headers.origin ?? ''
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-key, x-tenant-id')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  if (_req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// --- 3. Arquivos Estaticos (client build) -------------------------------------
app.use(express.static(join(__dirname, '..', '..', 'client', 'dist')))

// --- 4. Health Check — SEM autenticacao (UptimeRobot) -------------------------
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', service: 'processo', port: PORT, db: 'connected' })
  } catch {
    res.status(503).json({ status: 'down', service: 'processo', db: 'disconnected' })
  }
})

// --- 5. (Reservado para rotas publicas — nenhuma neste produto) ---------------

// --- 6. requireInternalKey — protege todas as rotas abaixo --------------------
//    Skill: antigravity-autenticacao-s2s
//    Em dev: INTERNAL_SERVICE_KEY=dev-key no .env
app.use(requireInternalKey)

// --- 7. Tenant Isolation — injeta req.prisma com filtro por tenant_id ---------
//    tenant_id vem do header x-tenant-id propagado pelo Gateway (JWT)
//    NUNCA vem do body da requisicao
app.use(tenantIsolationMiddleware)

// --- 8. Rotas do Produto ------------------------------------------------------
app.use('/api/v1/processos', processosRouter)
app.use('/api/v1/follow-up', followUpRouter)
app.use('/api/v1/documentos', documentosRouter)

// --- 9. SPA Fallback (serve o client React para qualquer rota nao-API) --------
app.get('*', (_req: Request, res: Response) => {
  const indexPath = join(__dirname, '..', '..', 'client', 'dist', 'index.html')
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).json({ error: 'Client build nao encontrado. Execute npm run build no /client.' })
  })
})

// --- 10. Error Handler Global -------------------------------------------------
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Processo] Erro nao tratado:', err.message)
  res.status(500).json({ error: err.message || 'Erro interno' })
})

// --- 11. Inicializacao --------------------------------------------------------
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Processo] Servidor canonico rodando na porta ${PORT}`)
  })
}

export { app }
