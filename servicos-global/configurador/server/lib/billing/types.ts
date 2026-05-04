// server/lib/billing/types.ts
// Contratos estáveis da camada de billing.
// Todo provider (Conta Azul, ASAAS, Inter, manual, etc.) implementa o mesmo
// BillingProvider e mapeia sua resposta para o shape GravityInvoice.
//
// O frontend só conhece GravityInvoice — nunca tipos específicos do SDK do provider.
// Isso permite trocar de provider sem reescrever tela.

export type GravityInvoiceStatus =
  | 'DRAFT'       // rascunho — ainda não enviado ao cliente
  | 'OPEN'        // enviado, aguardando pagamento
  | 'PAID'        // pago
  | 'VOID'        // anulado
  | 'OVERDUE'     // em atraso (status derivado)
  | 'UNCOLLECTIBLE' // escrito como perda

export interface GravityInvoiceLineItem {
  description: string
  amount_cents: number
  quantity: number
  currency: string
}

export interface GravityInvoiceDocument {
  type: 'boleto' | 'nfe' | 'receipt' | 'pdf' | 'other'
  name: string
  url: string
  size_bytes?: number
}

export interface GravityInvoiceCustomer {
  id: string          // id do tenant no Gravity (ou id externo do provider quando órfão)
  name: string
  email: string | null
  tenant_id: string | null
}

export interface GravityInvoice {
  id: string                       // id único do provider
  number: string | null            // número legível (ex: 0001-0123)
  status: GravityInvoiceStatus
  customer: GravityInvoiceCustomer
  amount_due_cents: number
  amount_paid_cents: number
  currency: string                 // ISO-4217 minúsculo (ex: 'brl', 'usd')
  due_date: string | null          // ISO 8601 (ex: '2026-04-30T23:59:59Z')
  competencia: string | null       // 'YYYY-MM' (derivado de due_date ou created)
  description: string              // legível, agregando line_items quando necessário
  line_items: GravityInvoiceLineItem[]
  documents: GravityInvoiceDocument[]
  hosted_url: string | null        // página web do provider
  created_at: string               // ISO 8601
  provider: BillingProviderName
  provider_id: string              // id cru do provider (igual a id na maioria dos casos)
}

export interface ListInvoicesParams {
  cursor?: string                  // paginação cursor-based
  limit?: number                   // default 50, max 100
  status?: GravityInvoiceStatus
  customer_id?: string             // filtra por tenant
}

export interface ListInvoicesResult {
  invoices: GravityInvoice[]
  has_more: boolean
  next_cursor: string | null
}

export interface CreateInvoiceParams {
  customer_tenant_id: string       // obrigatório — tenant dono da fatura
  description: string
  line_items: Array<{
    description: string
    amount_cents: number
    quantity: number
  }>
  due_date?: string                // ISO — se omitido, provider decide
  currency?: string                // default 'brl'
  metadata?: Record<string, string>
  auto_finalize?: boolean          // se true, finaliza draft após criar
}

export interface VoidInvoiceParams {
  id: string
  reason?: string
}

// ─── BillingProvider — contrato que todos os providers implementam ──────────

export type BillingProviderName =
  | 'manual'
  | 'gravity'
  | 'conta_azul'
  | 'asaas'
  | 'iugu'
  | 'inter'
  | 'itau'
  | 'santander'

export interface BillingProvider {
  readonly name: BillingProviderName

  /**
   * Lista invoices. Usa cursor-based pagination.
   */
  listInvoices(params: ListInvoicesParams): Promise<ListInvoicesResult>

  /**
   * Busca uma invoice específica. Retorna null se não encontrada.
   */
  getInvoice(id: string): Promise<GravityInvoice | null>

  /**
   * Cria uma nova invoice. Se auto_finalize=true, já envia pro cliente.
   */
  createInvoice(params: CreateInvoiceParams): Promise<GravityInvoice>

  /**
   * Anula uma invoice. O comportamento depende do provider:
   * - Conta Azul: cancelamento (DELETE /v1/sales/{id})
   * - Manual: soft-delete + status=VOID
   */
  voidInvoice(params: VoidInvoiceParams): Promise<GravityInvoice>

  /**
   * Envia a invoice para o cliente (email). Alguns providers enviam
   * automaticamente ao finalizar — nesse caso esta chamada é idempotente.
   */
  sendInvoice(id: string): Promise<GravityInvoice>

  /**
   * Indica se o provider está operacional (env vars OK, credenciais válidas).
   * Usado pelo factory para fallback.
   */
  isAvailable(): Promise<boolean>
}
