// server/services/billingService.ts
// Lógica de cobrança — Stripe Checkout Session e sync de assinaturas

import Stripe from 'stripe'
import { stripe } from '../lib/stripe.js'
import { prisma } from '../lib/prisma.js'

export const billingService = {
  /**
   * Processa eventos do Stripe recebidos via webhook
   */
  async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { tenantId } = session.metadata ?? {}
        if (!tenantId) {
          console.error(
            `[billing] checkout.session.completed missing tenantId metadata — sessionId: ${session.id}`
          )
          break
        }

        // Atualiza assinatura e status do tenant
        await prisma.$transaction([
          prisma.subscription.updateMany({
            where: { tenant_id: tenantId },
            data: {
              status: 'ACTIVE',
              stripe_subscription_id: session.subscription as string,
            },
          }),
          prisma.tenant.update({
            where: { id: tenantId },
            data: { status: 'ACTIVE' },
          }),
        ])
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const tenantRow = await prisma.tenant.findFirst({
          where: { stripe_customer_id: sub.customer as string },
        })
        if (!tenantRow) break

        await prisma.subscription.updateMany({
          where: {
            tenant_id: tenantRow.id,
            stripe_subscription_id: sub.id,
          },
          data: {
            status: sub.status.toUpperCase() as 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING' | 'INCOMPLETE',
            current_period_start: new Date(sub.current_period_start * 1000),
            current_period_end: new Date(sub.current_period_end * 1000),
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const tenantRow = await prisma.tenant.findFirst({
          where: { stripe_customer_id: sub.customer as string },
        })
        if (!tenantRow) break

        await prisma.$transaction([
          prisma.subscription.updateMany({
            where: { tenant_id: tenantRow.id, stripe_subscription_id: sub.id },
            data: { status: 'CANCELLED', cancelled_at: new Date() },
          }),
          prisma.tenant.update({
            where: { id: tenantRow.id },
            data: { status: 'SUSPENDED' },
          }),
        ])
        break
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice
        const tenantRow = await prisma.tenant.findFirst({
          where: { stripe_customer_id: inv.customer as string },
        })
        if (!tenantRow) break

        await prisma.subscription.updateMany({
          where: { tenant_id: tenantRow.id },
          data: { status: 'PAST_DUE' },
        })
        break
      }

      default:
        console.log(`[billing] Evento Stripe não tratado: ${event.type}`)
    }
  },
}
