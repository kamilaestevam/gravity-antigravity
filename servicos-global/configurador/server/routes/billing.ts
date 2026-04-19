// server/routes/billing.ts
// Assinaturas, checkout e webhook do Stripe
// POST /api/v1/financeiro/webhook   — recebe eventos do Stripe (raw body)
// GET  /api/v1/financeiro/invoices  — histórico de faturas do tenant

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { stripe } from '../lib/stripe.js'
import { prisma } from '../lib/prisma.js'
import { billingService } from '../services/billingService.js'
import { AppError } from '../lib/appError.js'

export const billingRouter = Router()

/**
 * POST /api/v1/financeiro/webhook
 * Endpoint para receber eventos do Stripe
 * Body: raw (buffer) — registrado ANTES do express.json() no index.ts
 */
billingRouter.post('/webhook', async (req, res, next) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new AppError('STRIPE_WEBHOOK_SECRET não configurada', 500, 'CONFIG_ERROR')
    }

    const sig = req.headers['stripe-signature']
    if (!sig) {
      throw new AppError('Assinatura Stripe ausente', 400, 'VALIDATION_ERROR')
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        webhookSecret
      )
    } catch {
      throw new AppError('Assinatura Stripe inválida', 400, 'INVALID_SIGNATURE')
    }

    // TODO: idempotência Stripe — StripeEvent removido do DDD; reimplementar via FaturaProdutosGravity ou Redis

    // Processa o evento
    await billingService.handleStripeEvent(event)

    res.json({ received: true })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/v1/financeiro/invoices
 * Retorna histórico de faturas do Stripe para o tenant autenticado
 */
billingRouter.get('/invoices', requireAuth, async (req, res, next) => {
  try {
    const tenant = await prisma.organizacao.findUnique({
      where: { id: req.auth.tenantId },
      select: { stripe_customer_id: true },
    })

    if (!tenant?.stripe_customer_id) {
      res.json({ invoices: [] })
      return
    }

    const invoiceList = await stripe.invoices.list({
      customer: tenant.stripe_customer_id,
      limit: 24,
    })

    const invoices = invoiceList.data.map((inv) => ({
      id: inv.id,
      status: inv.status,
      amount: inv.amount_paid,
      currency: inv.currency,
      date: inv.created,
      pdf: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }))

    res.json({ invoices })
  } catch (err) {
    next(err)
  }
})
