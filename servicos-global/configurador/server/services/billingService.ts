// server/services/billingService.ts
// Lógica de cobrança — Stripe Checkout Session, sync de assinaturas
// e disparo de emissão de NFS-e quando uma fatura é paga.

import Stripe from 'stripe'
import { stripe } from '../lib/stripe.js'
import { prisma } from '../lib/prisma.js'
import { logger } from '../lib/logger.js'
import { getNfseProvider } from '../lib/nfse/index.js'

const log = logger.child({ module: 'billing-service' })

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
          log.error('checkout.session.completed missing tenantId metadata', { session_id: session.id })
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

      case 'invoice.paid': {
        const inv = event.data.object as Stripe.Invoice
        await handleInvoicePaid(inv)
        break
      }

      default:
        log.debug('stripe event not handled', { type: event.type })
    }
  },
}

/**
 * Quando uma fatura é paga no Stripe, dispara a emissão de NFS-e
 * via provider configurado (se houver). Falha silenciosa — emissão
 * pode ser retomada manualmente via POST /admin/billing/invoices/:id/nfe-retry.
 */
async function handleInvoicePaid(inv: Stripe.Invoice): Promise<void> {
  const stripeCustomerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id
  if (!stripeCustomerId) {
    log.warn('invoice.paid without customer id', { invoice_id: inv.id })
    return
  }

  const tenant = await prisma.tenant.findFirst({
    where: { stripe_customer_id: stripeCustomerId },
    select: { id: true, name: true, cnpj: true },
  })
  if (!tenant) {
    log.warn('invoice.paid — tenant não encontrado pelo stripe_customer_id', {
      invoice_id: inv.id,
      stripe_customer_id: stripeCustomerId,
    })
    return
  }

  const nfseProvider = await getNfseProvider()
  if (!nfseProvider) {
    // Sem provider configurado — NF-e é emitida externamente ou adiada
    log.info('invoice.paid — NFS-e skipped (no provider)', {
      invoice_id: inv.id,
      tenant_id: tenant.id,
    })
    return
  }

  if (!tenant.cnpj) {
    log.warn('invoice.paid — NFS-e não emitida: tenant sem CNPJ', {
      invoice_id: inv.id,
      tenant_id: tenant.id,
    })
    return
  }

  const competencia = inv.due_date
    ? new Date(inv.due_date * 1000).toISOString().slice(0, 7)
    : new Date(inv.created * 1000).toISOString().slice(0, 7)

  try {
    const result = await nfseProvider.emit({
      reference_id: inv.id,
      tomador: {
        cnpj_cpf: tenant.cnpj.replace(/\D/g, ''),
        razao_social: tenant.name,
        email: inv.customer_email ?? undefined,
      },
      servico: {
        codigo_servico: process.env.NFSE_FLORIPA_CODIGO_SERVICO ?? '1.05',
        descricao: inv.description ?? `Servicos Gravity ${competencia}`,
        valor_cents: inv.amount_paid,
      },
      competencia,
    })
    log.info('nfse emitted', {
      invoice_id: inv.id,
      tenant_id: tenant.id,
      nfse_id: result.id,
      nfse_status: result.status,
    })
  } catch (err) {
    log.error('nfse emission failed', {
      invoice_id: inv.id,
      tenant_id: tenant.id,
      error: err instanceof Error ? err.message : String(err),
    })
    // Não relança — retry manual via rota dedicada
  }
}
