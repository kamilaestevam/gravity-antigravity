// server/services/billingService.ts
// Lógica de cobrança — Stripe Checkout Session e sync de assinaturas

import Stripe from 'stripe'
import { stripe } from '../lib/stripe.js'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/appError.js'

const PLAN_PRICE_MAP: Record<string, string> = {
  STARTER: process.env.STRIPE_PRICE_STARTER ?? '',
  PROFESSIONAL: process.env.STRIPE_PRICE_PROFESSIONAL ?? '',
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE ?? '',
}

interface CreateCheckoutInput {
  tenantId: string
  planKey: string
  successUrl: string
  cancelUrl: string
}

export const billingService = {
  /**
   * Cria uma sessão de Checkout no Stripe
   * Se o tenant já tem stripe_customer_id, reutiliza o customer
   */
  async createCheckoutSession(input: CreateCheckoutInput) {
    const { tenantId, planKey, successUrl, cancelUrl } = input

    const priceId = PLAN_PRICE_MAP[planKey]
    if (!priceId) {
      throw new AppError(
        `Preço do Stripe não configurado para o plano ${planKey}`,
        500,
        'CONFIG_ERROR'
      )
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { stripe_customer_id: true, name: true },
    })

    if (!tenant) {
      throw new AppError('Tenant não encontrado', 404, 'NOT_FOUND')
    }

    // Cria ou reutiliza o customer do Stripe
    let customerId = tenant.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: tenant.name,
        metadata: { tenantId },
      })
      customerId = customer.id
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripe_customer_id: customer.id },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: { tenantId, planKey },
      locale: 'pt-BR',
    })

    return session
  },

  /**
   * Processa eventos do Stripe recebidos via webhook
   */
  async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { tenantId, planKey } = session.metadata ?? {}
        if (!tenantId || !planKey) {
          console.error(
            `[billing] checkout.session.completed missing metadata — tenantId: ${tenantId ?? 'MISSING'}, planKey: ${planKey ?? 'MISSING'}, sessionId: ${session.id}`
          )
          break
        }

        // Atualiza assinatura e status do tenant
        await prisma.$transaction([
          prisma.subscription.updateMany({
            where: { tenant_id: tenantId },
            data: {
              plan: planKey as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE',
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
