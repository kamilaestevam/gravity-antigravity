// server/index.ts
// Agente Configurador — Servidor Express
// Porta: 8005 | Banco: configurador-db | Auth: Clerk | Billing: Stripe

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
// Chaves globais (GEMINI_API_KEY, INTERNAL_SERVICE_KEY) vêm do .env.local da raiz
dotenv.config({ path: resolve(__dir, '../../../.env.local') })
// Chaves específicas do serviço vêm do .env na raiz do pacote (configurador/)
// ATENÇÃO: __dir aponta para server/ — por isso '../.env' e não '.env'
dotenv.config({ path: resolve(__dir, '../.env') })

// Fail-fast: validar env vars criticas antes de qualquer import
const requiredEnvVars = ['CONFIGURADOR_DATABASE_URL', 'CLERK_SECRET_KEY', 'INTERNAL_SERVICE_KEY'] as const
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`[Configurador] Variavel de ambiente obrigatoria ausente: ${envVar}`)
  }
}

import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { correlationMiddleware } from './middleware/correlationId.js'
import { rateLimitPresets } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requireAuth } from './middleware/requireAuth.js'
import { requireGravityAdmin } from './middleware/requireGravityAdmin.js'
import { authRouter } from './routes/auth.js'
import { tenantsRouter } from './routes/tenants.js'
import { usersRouter } from './routes/users.js'
import { billingRouter } from './routes/billing.js'
import { accessRouter } from './routes/access.js'
import { adminRouter } from './routes/admin.js'
import { productsRouter } from './routes/products.js'
import { tenantProductsRouter } from './routes/tenantProducts.js'
import { companyProductsRouter } from './routes/companyProducts.js'
import { serviceTokenRouter } from './routes/serviceToken.js'
import { adminProductsRouter } from './routes/adminProducts.js'
import { publicCatalogRouter } from './routes/publicCatalog.js'
import { hubRouter } from './routes/hubInit.js'
import { meRouter } from './routes/me.js'
import { taxaCambioRouter } from './routes/taxaCambio.js'
import { historicoOrganizacaoRouter } from './routes/historicoOrganizacao.js'
import { prisma } from './lib/prisma.js'

export const app = express()
const PORT = Number(process.env.PORT ?? 8005)

// ─── Middlewares globais ────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://*.clerk.accounts.dev", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*.clerk.com", "https://img.clerk.com"],
      connectSrc: ["'self'", "https://*.clerk.accounts.dev", "https://api.stripe.com", "ws://localhost:*"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://*.clerk.accounts.dev"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// O webhook do Stripe precisa do body raw — registrar ANTES do json()
app.use('/api/v1/billing/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:8000', 'http://localhost:8003', 'http://localhost:5000'],
  credentials: true
}))
app.use(correlationMiddleware)

// ─── Health check ───────────────────────────────────────────────────────────

app.get('/health', async (_req, res) => {
  let dbStatus: 'ok' | 'error' = 'ok'
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    dbStatus = 'error'
  }

  const httpStatus = dbStatus === 'ok' ? 200 : 503
  res.status(httpStatus).json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    service: 'configurador',
    port: PORT,
    db: dbStatus,
    timestamp: new Date().toISOString(),
  })
})

// ─── Rate Limiting (endpoints publicos e webhooks) ─────────────────────────
app.use('/api/v1/webhooks', rateLimitPresets.webhook())
app.use('/api/v1/billing/webhook', rateLimitPresets.webhook())
app.use('/api/catalog', rateLimitPresets.public())
app.use('/api/v1/admin', rateLimitPresets.admin())
app.use('/api/admin', rateLimitPresets.admin())

// ─── Rotas públicas / protegidas por Clerk ──────────────────────────────────

app.use('/api/v1/webhooks', authRouter)
app.use('/api/v1/me', meRouter)
app.use('/api/v1/hub', hubRouter)
app.use('/api/v1/organizacao', tenantsRouter)
app.use('/api/v1/financeiro', billingRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/assinaturas', tenantProductsRouter)
app.use('/api/v1/companies/:companyId/products', companyProductsRouter)
app.use('/api/v1/usuarios', usersRouter)
app.use('/api/v1/service-tokens', serviceTokenRouter)

// ─── Rotas internas (x-internal-key obrigatória) ────────────────────────────

app.use('/api/internal', accessRouter)
app.use('/api/internal', serviceTokenRouter)

// ─── Rotas admin (gravity_admin only) ───────────────────────────────────────

import { historicoRouter } from '../../tenant/historico-global/server/routes.js'
// Middleware obrigatório: rate limit + auth Clerk + role check (SUPER_ADMIN/ADMIN)
// Sem isso, /api/tenant/historico-global/* ficou exposto publicamente — todas as 12 rotas
// do histórico (incluindo POST /logs de ingestão) eram chamáveis sem token.
app.use('/api/admin/historico-global', rateLimitPresets.admin(), requireAuth, requireGravityAdmin, historicoRouter)

import { apiRoutes as notificacoesRouter } from '../../tenant/notificacoes/server/routes/api.js'
// Middleware obrigatório: rate limit + auth Clerk. O router interno tem seu
// próprio `checkAuth` que valida x-tenant-id/x-user-id (passados pelo Shell),
// mas sem requireAuth as rotas ficam públicas — qualquer caller anônimo
// podia spammar o endpoint e receber 401 ruidoso que aparecia como 500 na UI.
app.use('/api/tenant/notificacoes', rateLimitPresets.internal(), requireAuth, notificacoesRouter)

import { apiRoutes as preferenciasRouter } from '../../tenant/preferencias-usuario/server/routes/api.js'
// Middleware obrigatório: rate limit + auth Clerk. O router interno tem seu
// próprio `checkAuth` que valida x-tenant-id/x-user-id headers, mas sem
// requireAuth externo as rotas ficavam públicas — mesmo padrão do histórico
// global e notificacoes. Auditoria da sessão do detetive api-cockpit encontrou.
app.use('/api/tenant/preferencias', rateLimitPresets.internal(), requireAuth, preferenciasRouter)

app.use('/api/admin', adminRouter)
app.use('/api/admin/produtos-gravity', adminProductsRouter)       // CRUD catálogo (auth chain interna)
app.use('/api/admin/tenants', tenantProductsRouter)        // ativação por tenant (auth chain interna)

import { adminSecurityRouter, adminSecurityInternalRouter } from './routes/adminSecurity.js'
app.use('/api/admin/seguranca-admin', adminSecurityRouter)        // painel de seguranca (gravity_admin only)
// Rota interna S2S para ingestão de eventos de segurança (chamada pelo
// securityAuditLogger do historico-global). Antes: POST /admin/security/events
// estava atrás de requireAuth+requireGravityAdmin mas o caller usava
// x-internal-key, resultando em 401 silencioso — audit trail quebrado.
app.use('/api/internal/security', adminSecurityInternalRouter)

// Ponto Cego 2 — captura 401/403 que ocorrem antes dos route handlers
import { authErrorLogger } from '../../tenant/historico-global/server/middleware/auth-error-logger.js'
app.use(authErrorLogger)

import { apiCockpitRouter, apiCockpitAdminRouter } from './routes/apiCockpit.js'
import { adminNcmIntegracaoRouter } from './routes/adminNcmIntegracao.js'
app.use('/api/v1/api-cockpit', apiCockpitRouter)             // workspace: observabilidade por tenant
app.use('/api/admin/api-cockpit', apiCockpitAdminRouter)       // admin: observabilidade global
app.use('/api/admin/ncm-integracao', adminNcmIntegracaoRouter) // admin: sincronização NCM Siscomex

// ─── Taxa de câmbio PTAX — sem auth (dados públicos do BCB) ─────────────────

app.use('/api/v1/taxa-cambio', taxaCambioRouter)

// ─── Histórico da organização — workspace page (requireAuth interno) ────────

app.use('/api/v1/historico-organizacao', historicoOrganizacaoRouter)

// ─── Catálogo público (sem auth — usado pelo Store/Marketplace) ─────────────

app.use('/api/v1/catalog', publicCatalogRouter)

// ─── Handler de erros global ─────────────────────────────────────────────────

app.use(errorHandler)

// ─── Start (apenas quando executado diretamente, não em testes) ──────────────

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`[configurador] Servidor rodando na porta ${PORT}`)

    // Sincronizar catálogo de produtos com a lista canônica a cada startup
    try {
      const { productCatalogService } = await import('./services/productCatalogService.js')
      await productCatalogService.ensureMissingProducts()
      console.log('[configurador] Catálogo de produtos sincronizado')
    } catch (err) {
      console.error('[configurador] Falha ao sincronizar catálogo de produtos:', err)
    }

    // Inicializar pg-boss e worker de audit logs
    const tenantDbUrl = process.env.TENANT_DATABASE_URL
    if (tenantDbUrl) {
      try {
        const { initPgBoss } = await import('../../tenant/historico-global/server/queue/pg-boss.js')
        const { startAuditWorker } = await import('../../tenant/historico-global/server/queue/audit-worker.js')
        const { startExportWorker } = await import('../../tenant/historico-global/server/queue/export-worker.js')
        const { startIntegrityCheckWorker } = await import('../../tenant/historico-global/server/queue/integrity-check-worker.js')
        const { startPartitionWorker } = await import('../../tenant/historico-global/server/queue/partition-worker.js')
        const { startGabiQuotaResetWorker } = await import('./queue/gabiQuotaResetWorker.js')
        await initPgBoss(tenantDbUrl)
        await startAuditWorker()
        await startExportWorker()
        await startIntegrityCheckWorker()
        await startPartitionWorker()
        await startGabiQuotaResetWorker()

        // Taxa de câmbio — sync automático 4x/dia (10h / 11h / 12h / 13h BRT)
        const { startTaxaCambioSyncWorker } = await import('./queue/taxaCambioSyncWorker.js')
        startTaxaCambioSyncWorker()
      } catch (err) {
        console.error('[configurador] Falha ao inicializar pg-boss/audit-worker:', err)
      }
    } else {
      console.warn('[configurador] TENANT_DATABASE_URL ausente — audit logs desativados')
    }
  })
}

export default app
