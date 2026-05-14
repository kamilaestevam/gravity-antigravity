/**
 * index.ts — Processo Express Server
 * Localizacao canonica: servicos-global/produto/processo/server/
 * Porta: 8025
 * Skill: antigravity-criar-produto (Passo 7 — 11 middlewares na ordem correta)
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Chaves globais (GEMINI_API_KEY, INTERNAL_SERVICE_KEY) vêm do .env.local da raiz
dotenv.config({ path: resolve(__dir, '../../../../../.env.local') })
// Chaves específicas do serviço vêm do .env local
dotenv.config({ path: resolve(__dir, '../../.env') })

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { processosRouter } from './routes/processos.js'
import { followUpRouter } from './routes/follow-ups-processo.js'
import { documentosRouter } from './routes/documentos-processo.js'
import { pedidosRouter } from '../../../processos-core/src/routes/pedidos.js'
import { importacaoRouter } from '../../../processos-core/src/routes/importacao.js'
import { pedidosConfigRouter } from '../../../processos-core/src/routes/pedidos-config.js'
import { pedidosLoteRouter } from '../../../processos-core/src/routes/pedidos-lote.js'
import { dashboardWidgetsRouter } from './routes/widgets-dashboard-processo.js'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware, prisma } from './middleware/tenantIsolation.js'
import { apiObservability } from '../../../../servicos-plataforma/middleware/apiObservability.js'
import { createProductAuditPlugin } from '../../../../servicos-plataforma/historico-global/src/product-audit-plugin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT ?? 8026

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
    'http://localhost:8002', // client dev
    'http://localhost:8000', // configurador
    process.env.CLIENT_URL ?? '',
  ].filter(Boolean)

  const origin = _req.headers.origin ?? ''
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-internal-key, x-id-organizacao')
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

// --- 7. Tenant Isolation — injeta req.prisma com filtro por id_organizacao ---
//    id_organizacao vem do header x-id-organizacao propagado pelo Gateway (JWT)
//    NUNCA vem do body da requisicao
app.use(tenantIsolationMiddleware)

// --- 7.1. Observabilidade — captura metricas para API Cockpit ----------------
app.use(apiObservability('processo'))
app.use(createProductAuditPlugin({
  product_id: 'processo',
  module: 'processo',
  getActorFromReq: (req) => {
    // Nota: o contrato AuditActorContext (historico-global) ainda usa
    // o nome `tenant_id` no payload — preservado intencionalmente.
    const id_organizacao = req.headers['x-id-organizacao'] as string | undefined
    const actor_id       = req.headers['x-id-usuario']    as string | undefined
    if (!id_organizacao || !actor_id) return null
    return { tenant_id: id_organizacao, actor_id, actor_name: actor_id, actor_type: 'USER' }
  },
}))

// --- 8. Rotas do Produto ------------------------------------------------------
app.use('/api/v1/processos', processosRouter)
// followup e documentos: rotas com paths absolutos internos (mistura de prefixos
// /follow-ups-processo, /documentos-processo e /processos/:id_processo/...)
app.use('/api/v1', followUpRouter)
app.use('/api/v1', documentosRouter)
app.use('/api/v1/pedidos', pedidosRouter)
app.use('/api/v1/pedidos', importacaoRouter)
app.use('/api/v1/pedidos/config', pedidosConfigRouter)
app.use('/api/v1/pedidos/lote', pedidosLoteRouter)
app.use('/api/v1/processos/dashboard', dashboardWidgetsRouter)

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
  const server = app.listen(PORT, () => {
    console.log(`[Processo] Servidor rodando na porta ${PORT}`)
  })
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Processo] Porta ${PORT} já em uso. Execute: npm run dev:reset`)
      process.exit(1)
    }
    throw err
  })
}

export { app }
