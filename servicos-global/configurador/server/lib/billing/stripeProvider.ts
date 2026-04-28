// server/lib/billing/stripeProvider.ts
// Implementação BillingProvider para Stripe.
// Usa a lib já existente em server/lib/stripe.ts.

import type Stripe from 'stripe'
import { stripe } from '../stripe.js'
import { prisma } from '../prisma.js'
import { logger } from '../logger.js'
import { AppError } from '../appError.js'
import type {
  BillingProvider,
  BillingProviderName,
  CreateInvoiceParams,
  GravityInvoice,
  GravityInvoiceStatus,
  ListInvoicesParams,
  ListInvoicesResult,
  VoidInvoiceParams,
} from './types.js'

const log = logger.child({ module: 'billing-stripe' })

const STRIPE_STATUS_MAP: Record<string, GravityInvoiceStatus> = {
  draft: 'DRAFT',
  open: 'OPEN',
  paid: 'PAID',
  void: 'VOID',
  uncollectible: 'UNCOLLECTIBLE',
  deleted: 'VOID',
}

function isOverdue(inv: Stripe.Invoice): boolean {
  if (inv.status !== 'open') return false
  if (!inv.due_date) return false
  return inv.due_date * 1000 < Date.now()
}

function toCompetencia(epoch: number | null): string | null {
  if (!epoch) return null
  const d = new Date(epoch * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function resolveCustomer(inv: Stripe.Invoice) {
  const stripeCustomerId = typeof inv.customer === 'string' ? inv.customer : inv.customer?.id ?? null

  if (!stripeCustomerId) {
    return {
      id: 'unknown',
      name: 'Desconhecido',
      email: null,
      tenant_id: null,
    }
  }

  // Tenta casar com tenant do Gravity
  const tenant = await prisma.organizacao.findFirst({
    where: { stripe_customer_id: stripeCustomerId },
    select: { id_organizacao: true, nome_organizacao: true },
  })

  // Stripe pode ter customer email direto
  let email: string | null = null
  if (typeof inv.customer_email === 'string') {
    email = inv.customer_email
  } else if (typeof inv.customer !== 'string' && inv.customer && 'email' in inv.customer) {
    email = (inv.customer as Stripe.Customer).email ?? null
  }

  return {
    id: tenant?.id_organizacao ?? stripeCustomerId,
    name: tenant?.nome_organizacao ?? (typeof inv.customer !== 'string' && inv.customer && 'name' in inv.customer
      ? (inv.customer as Stripe.Customer).name ?? 'Sem nome'
      : 'Órfão (Stripe)'),
    email,
    tenant_id: tenant?.id_organizacao ?? null,
  }
}

async function mapStripeToGravity(inv: Stripe.Invoice): Promise<GravityInvoice> {
  const status: GravityInvoiceStatus = isOverdue(inv)
    ? 'OVERDUE'
    : STRIPE_STATUS_MAP[inv.status ?? 'draft'] ?? 'DRAFT'

  const documents: GravityInvoice['documents'] = []
  if (inv.invoice_pdf) {
    documents.push({ type: 'pdf', name: `Fatura ${inv.number ?? inv.id}.pdf`, url: inv.invoice_pdf })
  }
  // NF-e emitida via integração externa seria armazenada em metadata.nfe_url
  if (inv.metadata?.nfe_url) {
    documents.push({ type: 'nfe', name: 'NF-e', url: inv.metadata.nfe_url })
  }
  if (inv.metadata?.boleto_url) {
    documents.push({ type: 'boleto', name: 'Boleto', url: inv.metadata.boleto_url })
  }

  const customer = await resolveCustomer(inv)

  return {
    id: inv.id,
    number: inv.number ?? null,
    status,
    customer,
    amount_due_cents: inv.amount_due,
    amount_paid_cents: inv.amount_paid,
    currency: inv.currency,
    due_date: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
    competencia: toCompetencia(inv.due_date ?? inv.created),
    description: inv.description ?? (inv.lines.data.map(l => l.description).filter(Boolean).join(' · ') || '—'),
    line_items: inv.lines.data.map(l => ({
      description: l.description ?? '—',
      amount_cents: l.amount,
      quantity: l.quantity ?? 1,
      currency: l.currency,
    })),
    documents,
    hosted_url: inv.hosted_invoice_url ?? null,
    created_at: new Date(inv.created * 1000).toISOString(),
    provider: 'stripe' as const,
    provider_id: inv.id,
  }
}

/**
 * Detecta chaves Stripe placeholder do `.env.example` (ex: "sk_test_...lder")
 * que só existem em dev sem integração real configurada.
 */
function isPlaceholderKey(key: string | undefined): boolean {
  if (!key) return true
  if (key.length < 20) return true               // chaves reais têm 100+ chars
  if (/\.{3,}/.test(key)) return true            // contém "..."
  if (/placeholder/i.test(key)) return true
  return false
}

function isStripeAuthError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const rec = err as { type?: string; statusCode?: number }
  return rec.type === 'StripeAuthenticationError' || rec.statusCode === 401
}

export class StripeProvider implements BillingProvider {
  readonly name: BillingProviderName = 'stripe'

  async isAvailable(): Promise<boolean> {
    if (isPlaceholderKey(process.env.STRIPE_SECRET_KEY)) return false
    try {
      // Ping leve — lista 1 invoice pra garantir credenciais OK
      await stripe.invoices.list({ limit: 1 })
      return true
    } catch (err) {
      log.warn('stripe availability check failed', { error: err instanceof Error ? err.message : String(err) })
      return false
    }
  }

  async listInvoices(params: ListInvoicesParams): Promise<ListInvoicesResult> {
    // Em dev com chave placeholder, retorna vazio graciosamente em vez de 500
    if (isPlaceholderKey(process.env.STRIPE_SECRET_KEY)) {
      log.warn('listInvoices: STRIPE_SECRET_KEY placeholder — retornando vazio')
      return { invoices: [], has_more: false, next_cursor: null }
    }

    const limit = Math.min(params.limit ?? 50, 100)

    const listParams: Stripe.InvoiceListParams = { limit }
    if (params.cursor) listParams.starting_after = params.cursor
    if (params.customer_id) {
      // customer_id DEVE ser tenant_id do Gravity — valida existência antes de
      // passar pro Stripe, impedindo enumeration cross-tenant e evitando que
      // IDs Stripe crus sejam injetados via query string.
      const tenant = await prisma.organizacao.findUnique({
        where: { id_organizacao: params.customer_id },
        select: { stripe_customer_id: true },
      })
      if (!tenant) {
        throw new AppError('Organizacao não encontrado', 404, 'TENANT_NOT_FOUND')
      }
      if (!tenant.stripe_customer_id) {
        // Organizacao existe mas nunca teve fatura — retorna vazio em vez de erro
        return { invoices: [], has_more: false, next_cursor: null }
      }
      listParams.customer = tenant.stripe_customer_id
    }
    if (params.status && params.status !== 'OVERDUE') {
      const statusMap: Record<GravityInvoiceStatus, Stripe.Invoice.Status | undefined> = {
        DRAFT: 'draft',
        OPEN: 'open',
        PAID: 'paid',
        VOID: 'void',
        UNCOLLECTIBLE: 'uncollectible',
        OVERDUE: undefined,
      }
      const stripeStatus = statusMap[params.status]
      if (stripeStatus) listParams.status = stripeStatus
    }

    try {
      const page = await stripe.invoices.list(listParams)
      const invoices = await Promise.all(page.data.map(mapStripeToGravity))

      // Filtro client-side de OVERDUE (Stripe não tem esse status nativo)
      const filtered = params.status === 'OVERDUE'
        ? invoices.filter(i => i.status === 'OVERDUE')
        : invoices

      return {
        invoices: filtered,
        has_more: page.has_more,
        next_cursor: page.has_more && page.data.length > 0 ? page.data[page.data.length - 1].id : null,
      }
    } catch (err) {
      if (isStripeAuthError(err)) {
        log.warn('stripe auth error na listagem — retornando vazio', {
          error: err instanceof Error ? err.message : String(err),
        })
        return { invoices: [], has_more: false, next_cursor: null }
      }
      throw err
    }
  }

  async getInvoice(id: string): Promise<GravityInvoice | null> {
    try {
      const inv = await stripe.invoices.retrieve(id, { expand: ['customer'] })
      return await mapStripeToGravity(inv)
    } catch (err) {
      if (err instanceof Error && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404) {
        return null
      }
      throw err
    }
  }

  async createInvoice(params: CreateInvoiceParams): Promise<GravityInvoice> {
    // 1. Resolver stripe_customer_id do tenant
    const tenant = await prisma.organizacao.findUnique({
      where: { id_organizacao: params.customer_tenant_id },
      select: { id_organizacao: true, nome_organizacao: true, stripe_customer_id: true },
    })

    if (!tenant) {
      throw new AppError('Organizacao não encontrado', 404, 'TENANT_NOT_FOUND')
    }

    let stripeCustomerId = tenant.stripe_customer_id
    if (!stripeCustomerId) {
      // Cria customer on-the-fly se o tenant não tinha
      const created = await stripe.customers.create({
        name: tenant.nome_organizacao,
        metadata: { tenant_id: tenant.id_organizacao },
      })
      stripeCustomerId = created.id
      await prisma.organizacao.update({
        where: { id_organizacao: tenant.id_organizacao },
        data: { stripe_customer_id: stripeCustomerId },
      })
      log.info('stripe customer created', { tenant_id: tenant.id_organizacao, stripe_customer_id: stripeCustomerId })
    }

    const currency = params.currency?.toLowerCase() ?? 'brl'

    // 2. Criar InvoiceItems para cada line
    for (const line of params.line_items) {
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        amount: line.amount_cents * line.quantity,
        currency,
        description: line.description,
      })
    }

    // 3. Criar a Invoice
    const createParams: Stripe.InvoiceCreateParams = {
      customer: stripeCustomerId,
      description: params.description,
      collection_method: 'send_invoice',
      days_until_due: params.due_date ? undefined : 14,
      metadata: params.metadata,
    }
    if (params.due_date) {
      createParams.due_date = Math.floor(new Date(params.due_date).getTime() / 1000)
    }
    const invoice = await stripe.invoices.create(createParams)

    // 4. Opcionalmente finalizar
    const finalInvoice = params.auto_finalize
      ? await stripe.invoices.finalizeInvoice(invoice.id)
      : invoice

    log.info('invoice created', {
      stripe_invoice_id: finalInvoice.id,
      tenant_id: tenant.id_organizacao,
      amount_due: finalInvoice.amount_due,
      auto_finalized: !!params.auto_finalize,
    })

    return mapStripeToGravity(finalInvoice)
  }

  async voidInvoice(params: VoidInvoiceParams): Promise<GravityInvoice> {
    const voided = await stripe.invoices.voidInvoice(params.id)
    log.info('invoice voided', { stripe_invoice_id: params.id, reason: params.reason })
    return mapStripeToGravity(voided)
  }

  async sendInvoice(id: string): Promise<GravityInvoice> {
    const sent = await stripe.invoices.sendInvoice(id)
    log.info('invoice sent', { stripe_invoice_id: id })
    return mapStripeToGravity(sent)
  }
}
