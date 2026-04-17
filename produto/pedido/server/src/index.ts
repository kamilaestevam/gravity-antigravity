/**
 * index.ts — Pedido Express Server
 * Localização canônica: produto/pedido/server/
 * Porta: 8030
 * Skill: antigravity-criar-produto (Passo 7 — middlewares na ordem correta)
 *
 * Rotas CRUD (processos-core):
 *   /api/v1/pedidos                     — CRUD de Pedido e PedidoItem
 *   /api/v1/pedidos/config              — Status e colunas de configuração
 *   /api/v1/pedidos/importar            — Upload + parse + preview de arquivos
 *
 * Rotas de features (produto/pedido/server):
 *   /api/v1/pedidos/dashboard/widgets   — persistência de configuração de widgets
 *   /api/v1/analytics/pedido/*          — integração Power BI (OData v4)
 *   /health                             — healthcheck
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Chaves globais (GEMINI_API_KEY, INTERNAL_SERVICE_KEY) vêm do .env.local da raiz
dotenv.config({ path: resolve(__dir, '../../../../.env.local') })
// Chaves específicas do serviço vêm do .env local
dotenv.config({ path: resolve(__dir, '../../../.env') })

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { requireInternalKey } from './middleware/requireInternalKey.js'
import { tenantIsolationMiddleware } from './middleware/tenantIsolation.js'
import { analyticsRouter } from './routes/analytics.js'
import { dashboardWidgetsRouter } from './routes/dashboardWidgets.js'
import { dashboardDataRouter } from './routes/dashboardData.js'
import { dashboardPaineisRouter } from './routes/dashboardPaineis.js'
import { consolidarRouter } from './routes/consolidar.js'
import { transferirRouter, transferirHistoricoRouter } from './routes/transferir.js'
import { edicaoEmMassaRouter } from './routes/edicaoEmMassa.js'
import { smartImportRouter } from './routes/smartImport.js'
import { duplicarExcluirRouter } from './routes/duplicarExcluir.js'
import { colunasUsuarioRouter } from './routes/colunasUsuario.js'
import { gabiProxyRouter } from './routes/gabiProxy.js'
import { behaviorTrackingRouter } from './routes/behaviorTracking.js'
import { anexosRouter } from './routes/anexos.js'
import { pdfRouter } from './routes/pdf.js'
import { loteRouter } from './routes/lote.js'
import { kanbanPreferenciasRouter } from './routes/kanbanPreferencias.js'
import { casasDecimaisRouter } from './routes/casasDecimais.js'
import { saldoFormulaRouter } from './routes/saldoFormula.js'
import { initRouter } from './routes/init.js'
import { taxaCambioRouter } from './routes/taxaCambio.js'
import { pedidosRouter } from '../../../../servicos-global/tenant/processos-core/src/routes/pedidos.js'
import { pedidosConfigRouter } from '../../../../servicos-global/tenant/processos-core/src/routes/pedidos-config.js'
import { importacaoRouter } from '../../../../servicos-global/tenant/processos-core/src/routes/importacao.js'
import { apiObservability } from '../../../../servicos-global/tenant/middleware/apiObservability.js'
import { openapiRouter } from './routes/openapi.js'
import { createProductAuditPlugin } from '../../../../servicos-global/tenant/historico-global/src/product-audit-plugin.js'

const app = express()
const PORT = process.env.PORT ?? 8030

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
    // Permite requests sem origin (curl, Power BI service, etc.), localhost (dev) e origens na lista
    if (!origin || origin.startsWith('http://localhost:') || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
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

// ── 5.1. Taxa de câmbio — proxy público para o Configurador ──────────────────
app.use('/api/v1/taxa-cambio', taxaCambioRouter)

// ── 6. Tenant isolation (para rotas internas após este ponto) ─────────────────
app.use(tenantIsolationMiddleware)

// ── 7. Observabilidade — captura métricas de uso por tenant/produto ───────────
app.use(apiObservability('pedido'))

// ── 7.1. Audit — registra mutações no histórico global ────────────────────────
app.use(createProductAuditPlugin({
  product_id: 'pedido',
  module: 'pedido',
  getActorFromReq: (req) => {
    const tenant_id  = req.headers['x-tenant-id']  as string | undefined
    const actor_id   = req.headers['x-user-id']    as string | undefined
    const actor_name = req.headers['x-user-name']  as string | undefined
    if (!tenant_id || !actor_id) return null
    return { tenant_id, actor_id, actor_name: actor_name || actor_id, actor_type: 'USER' }
  },
}))

// ── 8. Rotas de negócio ───────────────────────────────────────────────────────
// Ordem: rotas estáticas específicas ANTES das genéricas (evita conflitos com /:id)
app.use('/api/v1/pedidos/openapi.json',      openapiRouter)
app.use('/api/v1/pedidos/init',              initRouter)           // GET /init — agrega pedidos+status+prefs+colunas em 1 request
app.use('/api/v1/pedidos/dashboard/widgets', dashboardWidgetsRouter)
app.use('/api/v1/pedidos/dashboard',         dashboardPaineisRouter)
app.use('/api/v1/pedidos/dashboard',         dashboardDataRouter)
app.use('/api/v1/pedidos/consolidar',        consolidarRouter)
app.use('/api/v1/pedidos/transferir',        transferirRouter)
app.use('/api/v1/pedidos/edicao-em-massa',   edicaoEmMassaRouter)
app.use('/api/v1/pedidos/smart-import',      smartImportRouter)
app.use('/api/v1/pedidos/colunas-usuario',   colunasUsuarioRouter)
app.use(gabiProxyRouter)
app.use(behaviorTrackingRouter)
app.use('/api/v1/pedidos/anexos',            anexosRouter)
app.use('/api/v1/pedidos/pdf',               pdfRouter)
app.use('/api/v1/pedidos/lote',              loteRouter)
app.use('/api/v1/pedidos/kanban',            kanbanPreferenciasRouter)
app.use('/api/v1/pedidos/configuracoes',     casasDecimaisRouter)
app.use('/api/v1/pedidos/configuracoes',     saldoFormulaRouter)
app.use('/api/v1/pedidos/config',            pedidosConfigRouter)
app.use('/api/v1/pedidos',                   importacaoRouter)   // POST /importar, POST /importar/confirmar, POST /exportar
app.use('/api/v1/pedidos',                   duplicarExcluirRouter)
// CRUD principal — deve vir após os routers de sub-rotas estáticas
app.use('/api/v1/pedidos',                   pedidosRouter)      // GET /, POST /, GET /:id, PUT /:id, DELETE /:id, etc.
// Parâmetros dinâmicos após todos os estáticos
app.use('/api/v1/pedidos/:id/transferencias', transferirHistoricoRouter)

// ── 9. 404 catch-all ─────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota nao encontrada', code: 'NOT_FOUND' })
})

// ── 10. Error handler global ─────────────────────────────────────────────────
app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
  // Traduzir erros conhecidos do Prisma para HTTP semântico
  const prismaCode = (err as unknown as { code?: string }).code
  if (prismaCode === 'P2002') {
    // Unique constraint — ex: numero_pedido duplicado no mesmo tenant
    return res.status(409).json({ error: { message: 'Já existe um pedido com este número neste workspace. Use um número diferente.', code: 'DUPLICATE_NUMERO_PEDIDO' } })
  }
  if (prismaCode === 'P2025') {
    // Record not found
    return res.status(404).json({ error: { message: 'Registro não encontrado.', code: 'NOT_FOUND' } })
  }

  const status = err.statusCode ?? 500
  const code   = err.code ?? (status === 500 ? 'INTERNAL_ERROR' : 'ERROR')
  // Garante message mesmo se err não for instância de Error
  const message = err.message || (err as unknown as { toString(): string }).toString?.() || 'Erro interno'
  if (status >= 500) console.error('[Pedido/Server]', message, err.stack)
  res.status(status).json({ error: { message, code } })
})

// ── Start ─────────────────────────────────────────────────────────────────────
// Validações de ambiente obrigatórias — falham antes de aceitar qualquer request
if (!process.env.INTERNAL_SERVICE_KEY) {
  console.error('[Pedido] FATAL: INTERNAL_SERVICE_KEY não configurada. Encerrando.')
  process.exit(1)
}

app.listen(PORT, () => {
  console.log(`[Pedido] Servidor rodando na porta ${PORT}`)
  console.log(`[Pedido] Power BI endpoint: http://localhost:${PORT}/api/v1/analytics/pedido`)
  console.log(`[Pedido] Health: http://localhost:${PORT}/health`)
})
