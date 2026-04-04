/**
 * index.ts — Pedido Express Server
 * Localização canônica: produto/pedido/server/
 * Porta: 8026
 * Skill: antigravity-criar-produto (Passo 7 — middlewares na ordem correta)
 *
 * Rotas:
 *   /api/v1/pedidos/dashboard/widgets   — persistência de configuração de widgets
 *   /api/v1/analytics/pedido/*          — integração Power BI (OData v4)
 *   /health                             — healthcheck
 */

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware } from './middleware/tenantIsolation.js'
import { analyticsRouter } from './routes/analytics.js'
import { dashboardWidgetsRouter } from './routes/dashboardWidgets.js'
import { consolidarRouter } from './routes/consolidar.js'
import { transferirRouter, transferirHistoricoRouter } from './routes/transferir.js'
import { edicaoEmMassaRouter } from './routes/edicaoEmMassa.js'
import { smartImportRouter } from './routes/smartImport.js'
import { duplicarExcluirRouter } from './routes/duplicarExcluir.js'
import { colunasUsuarioRouter } from './routes/colunasUsuario.js'
import { anexosRouter } from './routes/anexos.js'
import { pdfRouter } from './routes/pdf.js'
import { loteRouter } from './routes/lote.js'
import { apiObservability } from '../../../../servicos-global/tenant/middleware/apiObservability.js'
import { openapiRouter } from './routes/openapi.js'
import { createProductAuditPlugin } from '../../../../servicos-global/tenant/historico-global/src/product-audit-plugin.js'

const app = express()
const PORT = process.env.PORT ?? 8026

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

// ── 1. CORS — apenas origens autorizadas ─────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5179').split(',')

app.use(cors({
  origin: (origin, cb) => {
    // Permite requests sem origin (curl, Power BI service, etc.) e origens na lista
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error(`Origin ${origin} not allowed`))
  },
  credentials: true,
}))

// ── 2. Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))

// ── 3. Healthcheck (sem auth) ────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'pedido', port: PORT, ts: new Date().toISOString() })
})

// ── 4. Internal key validation (antes do tenant isolation) ───────────────────
// Analytics tem sua própria autenticação via Bearer token (analyticsAuth middleware)
app.use(requireInternalKey)

// ── 5. Analytics — Power BI integration (auth própria dentro do router) ──────
app.use('/api/v1/analytics/pedido', analyticsRouter)

// ── 6. Tenant isolation (para rotas internas após este ponto) ─────────────────
app.use(tenantIsolationMiddleware)

// ── 7. Observabilidade — captura métricas de uso por tenant/produto ───────────
app.use(apiObservability('pedido'))

// ── 7.1. Audit — registra mutações no histórico global ────────────────────────
app.use(createProductAuditPlugin({
  product_id: 'pedido',
  module: 'pedido',
  getActorFromReq: (req) => {
    const tenant_id = req.headers['x-tenant-id'] as string | undefined
    const actor_id  = req.headers['x-user-id']   as string | undefined
    if (!tenant_id || !actor_id) return null
    return { tenant_id, actor_id, actor_name: actor_id, actor_type: 'USER' }
  },
}))

// ── 8. Rotas de negócio ───────────────────────────────────────────────────────
app.use('/api/v1/pedidos/openapi.json', openapiRouter)
app.use('/api/v1/pedidos/dashboard/widgets', dashboardWidgetsRouter)
app.use('/api/v1/pedidos/consolidar', consolidarRouter)
app.use('/api/v1/pedidos/transferir', transferirRouter)
app.use('/api/v1/pedidos/edicao-em-massa', edicaoEmMassaRouter)
app.use('/api/v1/pedidos/smart-import', smartImportRouter)
app.use('/api/v1/pedidos/colunas-usuario', colunasUsuarioRouter)
app.use('/api/v1/pedidos/anexos', anexosRouter)
app.use('/api/v1/pedidos/pdf', pdfRouter)
app.use('/api/v1/pedidos/lote', loteRouter)
app.use('/api/v1/pedidos', duplicarExcluirRouter)
// Rotas com parâmetro dinâmico ficam APÓS as rotas estáticas para evitar conflitos
app.use('/api/v1/pedidos/:id/transferencias', transferirHistoricoRouter)

// ── 9. 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota nao encontrada', code: 'NOT_FOUND' })
})

// ── 10. Error handler global ─────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Pedido/Server]', err.message)
  res.status(500).json({ error: 'Erro interno', code: 'INTERNAL_ERROR' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Pedido] Servidor rodando na porta ${PORT}`)
  console.log(`[Pedido] Power BI endpoint: http://localhost:${PORT}/api/v1/analytics/pedido`)
  console.log(`[Pedido] Health: http://localhost:${PORT}/health`)
})
