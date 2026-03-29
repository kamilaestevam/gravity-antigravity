// server/index.ts
// Agente Configurador — Servidor Express
// Porta: 8005 | Banco: configurador-db | Auth: Clerk | Billing: Stripe

import 'dotenv/config'
import express from 'express'
import { correlationMiddleware } from './middleware/correlationId.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authRouter } from './routes/auth.js'
import { tenantsRouter } from './routes/tenants.js'
import { usersRouter } from './routes/users.js'
import { plansRouter } from './routes/plans.js'
import { billingRouter } from './routes/billing.js'
import { accessRouter } from './routes/access.js'
import { adminRouter } from './routes/admin.js'
import { serviceTokenRouter } from './routes/serviceToken.js'
import { adminProductsRouter } from './routes/adminProducts.js'
import { publicCatalogRouter } from './routes/publicCatalog.js'
import { tenantProductsRouter } from './routes/tenantProducts.js'
import { prisma } from './lib/prisma.js'

export const app = express()
const PORT = Number(process.env.PORT ?? 8005)

// ─── Middlewares globais ────────────────────────────────────────────────────

// O webhook do Stripe precisa do body raw — registrar ANTES do json()
app.use('/api/v1/billing/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())
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

// ─── Rotas públicas / protegidas por Clerk ──────────────────────────────────

app.use('/api/v1/webhooks', authRouter)
app.use('/api/v1/tenants', tenantsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/plans', plansRouter)
app.use('/api/v1/billing', billingRouter)

// ─── Rotas internas (x-internal-key obrigatória) ────────────────────────────

app.use('/api/internal', accessRouter)
app.use('/api/internal', serviceTokenRouter)

// ─── Rotas admin (gravity_admin only) ───────────────────────────────────────

import { historicoRouter } from '../../tenant/historico-global/server/routes.js'
app.use('/api/tenant/historico-global', historicoRouter)

app.use('/api/admin', adminRouter)
app.use('/api/admin/products', adminProductsRouter)       // CRUD catálogo (auth chain interna)
app.use('/api/admin/tenants', tenantProductsRouter)        // ativação por tenant (auth chain interna)

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
