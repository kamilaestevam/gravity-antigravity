// server/routes/billing.ts
// Histórico de faturas do tenant via BillingProvider configurado.
// GET  /api/v1/faturas — histórico de faturas do tenant autenticado
//
// Stripe foi descontinuado em 2026-04-29; o webhook /webhook-stripe foi removido.
// Cobrança e NFS-e seguem via Conta Azul (provider OFICIAL — ver docs/BILLING.md).

import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { getBillingProvider } from '../lib/billing/index.js'

export const billingRouter = Router()

/**
 * GET /api/v1/faturas
 * Retorna histórico de faturas do provider configurado para o tenant autenticado.
 */
billingRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const provider = getBillingProvider()
    const result = await provider.listInvoices({
      customer_id: req.auth.id_organizacao,
      limit: 24,
    })

    res.json({
      invoices: result.invoices,
      provider: provider.name,
    })
  } catch (err) {
    next(err)
  }
})
