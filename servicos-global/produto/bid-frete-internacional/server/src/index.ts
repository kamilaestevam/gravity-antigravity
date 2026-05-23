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
import { requireInternalKey } from './middleware/validar-chave-interna.js'
import { tenantIsolationMiddleware, prisma } from './middleware/isolamento-tenant.js'
import { portosRouter } from './routes/portos.js'
import { incotermsRouter } from './routes/incoterms.js'
import { modaisRouter } from './routes/modais.js'
import { moedasRouter } from './routes/moedas.js'
import { containersRouter } from './routes/containers.js'
import { paisesRouter } from './routes/paises.js'
import { aeroportosRouter } from './routes/aeroportos.js'
import { cotacoesRouter } from './routes/cotacoes.js'
import { fornecedoresRouter } from './routes/fornecedores.js'
import { pedidosCotacaoRouter } from './routes/pedidos-cotacao.js'
import { comparativoRouter } from './routes/comparativo.js'
import { portalRouter } from './routes/portal.js'
import { cotacoesPublicasRouter } from './routes/cotacoes-publicas.js'
import { avaliacoesRouter } from './routes/avaliacoes.js'
import { dashboardRouter } from './routes/dashboard.js'
import { dashboardWidgetsRouter } from './routes/dashboard.routes.js'
import { dashboardPaineisRouter } from './routes/dashboard-paineis.js'
import { startCronJobs } from './services/tarefas-agendadas.js'
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
    res.json({ status: 'ok', service: 'bid-frete-internacional', port: PORT, db: 'connected' })
  } catch {
    res.status(503).json({ status: 'down', service: 'bid-frete-internacional', db: 'disconnected' })
  }
})

// --- 5. Master Data — SEM autenticacao (portos, NCMs, incoterms sao dados publicos) ---
app.use('/api/v1/bid-frete-internacional/dados-mestre', rateLimitPresets.public(), portosRouter)
app.use('/api/v1/bid-frete-internacional/dados-mestre', rateLimitPresets.public(), incotermsRouter)
app.use('/api/v1/bid-frete-internacional/dados-mestre', rateLimitPresets.public(), modaisRouter)
app.use('/api/v1/bid-frete-internacional/dados-mestre', rateLimitPresets.public(), moedasRouter)
app.use('/api/v1/bid-frete-internacional/dados-mestre', rateLimitPresets.public(), paisesRouter)
app.use('/api/v1/bid-frete-internacional/dados-mestre', rateLimitPresets.public(), aeroportosRouter)
app.use('/api/v1/bid-frete-internacional/dados-mestre', rateLimitPresets.public(), containersRouter)

// --- 6. Portal Publico do Fornecedor — SEM internal key (usa token de resposta) ---
app.use('/api/v1/bid-frete-internacional/portal/publico', rateLimitPresets.public(), cotacoesPublicasRouter)

// --- 7. requireInternalKey — protege todas as rotas abaixo ---
app.use(requireInternalKey)

// --- 8. Tenant Isolation — injeta req.prisma com filtro por id_organizacao ---
app.use(tenantIsolationMiddleware)

// --- 8.1. Observabilidade — captura metricas para API Cockpit ---
app.use(apiObservability('bid-frete-internacional'))
app.use(createProductAuditPlugin({
  id_produto_historico_log: 'bid-frete-internacional',
  modulo_historico_log: 'bid-frete-internacional',
  getActorFromReq: (req) => {
    const id_organizacao = req.headers['x-id-organizacao'] as string | undefined
    const actor_id  = req.headers['x-id-usuario']   as string | undefined
    if (!id_organizacao || !actor_id) return null
    return {
      id_organizacao,
      id_ator_historico_log: actor_id,
      nome_ator_historico_log: actor_id,
      tipo_ator_historico_log: 'USUARIO'
    }
  },
}))

// --- 9. Rotas do Produto (protegidas) ---
app.use('/api/v1/bid-frete-internacional/cotacoes', cotacoesRouter)
app.use('/api/v1/bid-frete-internacional/fornecedores', fornecedoresRouter)
app.use('/api/v1/bid-frete-internacional/pedidos-cotacao', pedidosCotacaoRouter)
app.use('/api/v1/bid-frete-internacional/comparativo', comparativoRouter)
app.use('/api/v1/bid-frete-internacional/portal', portalRouter)
app.use('/api/v1/bid-frete-internacional/avaliacoes', avaliacoesRouter)
app.use('/api/v1/bid-frete-internacional/dashboard', dashboardRouter)
app.use('/api/v1/bid-frete-internacional/dashboard', dashboardWidgetsRouter)
app.use('/api/v1/bid-frete-internacional/dashboard', dashboardPaineisRouter)

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
    console.log(`[BidFrete] Servidor rodando na porta ${PORT} (local)`)
    startCronJobs()
  })
}

export { app }
