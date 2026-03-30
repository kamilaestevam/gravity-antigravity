// server/index.ts
// Agente Configurador — Servidor Express
// Porta: 8005 | Banco: configurador-db | Auth: Clerk | Billing: Stripe

import 'dotenv/config'

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
import { authRouter } from './routes/auth.js'
import { tenantsRouter } from './routes/tenants.js'
import { usersRouter } from './routes/users.js'
import { plansRouter } from './routes/plans.js'
import { billingRouter } from './routes/billing.js'
import { accessRouter } from './routes/access.js'
import { adminRouter } from './routes/admin.js'
import { productsRouter } from './routes/products.js'
import { tenantProductsRouter } from './routes/tenantProducts.js'
import { companyProductsRouter } from './routes/companyProducts.js'
import { serviceTokenRouter } from './routes/serviceToken.js'
import { adminProductsRouter } from './routes/adminProducts.js'
import { publicCatalogRouter } from './routes/publicCatalog.js'
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
  origin: process.env.FRONTEND_URL || 'http://localhost:8003',
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
app.use('/api/v1/plans', rateLimitPresets.public())
app.use('/api/catalog', rateLimitPresets.public())

// ─── Rotas públicas / protegidas por Clerk ──────────────────────────────────

app.use('/api/v1/webhooks', authRouter)
app.use('/api/v1/tenants', tenantsRouter)
app.use('/api/v1/billing', billingRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/tenants/products', tenantProductsRouter)
app.use('/api/v1/companies/:companyId/products', companyProductsRouter)
app.use('/api/v1/service-tokens', serviceTokenRouter)

// ─── Rotas internas (x-internal-key obrigatória) ────────────────────────────

app.use('/api/internal', accessRouter)
app.use('/api/internal', serviceTokenRouter)

// ─── Rotas admin (gravity_admin only) ───────────────────────────────────────

import { historicoRouter } from '../../tenant/historico-global/server/routes.js'
app.use('/api/tenant/historico-global', historicoRouter)

app.use('/api/admin', adminRouter)
app.use('/api/admin/products', adminProductsRouter)       // CRUD catálogo (auth chain interna)
app.use('/api/admin/tenants', tenantProductsRouter)        // ativação por tenant (auth chain interna)

import { adminSecurityRouter } from './routes/adminSecurity.js'
app.use('/api/admin/security', adminSecurityRouter)        // painel de seguranca (gravity_admin only)

// ─── Catálogo público (sem auth — usado pelo Store/Marketplace) ─────────────

app.use('/api/v1/catalog', publicCatalogRouter)

// ─── Handler de erros global ─────────────────────────────────────────────────

app.use(errorHandler)

// ─── Start (apenas quando executado diretamente, não em testes) ──────────────

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[configurador] Servidor rodando na porta ${PORT}`)
  })
}

export default app
