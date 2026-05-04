// server/lib/billing/provedorFaturaProdutoGravity.ts
// Implementação local do contrato BillingProvider — usa o banco do Configurador
// como fonte da verdade (model ProdutoGravityFatura). Adapter fininho que delega
// para faturaProdutoGravityServico. Sem integração externa.

import { faturaProdutoGravityServico } from '../../services/faturaProdutoGravityServico.js'
import type {
  BillingProvider,
  BillingProviderName,
  CreateInvoiceParams,
  GravityInvoice,
  ListInvoicesParams,
  ListInvoicesResult,
  VoidInvoiceParams,
} from './types.js'

export class ProvedorFaturaProdutoGravity implements BillingProvider {
  readonly name: BillingProviderName = 'gravity'

  async isAvailable(): Promise<boolean> {
    // Banco local sempre disponível, ao contrário dos providers externos
    // que dependem de OAuth/credenciais.
    return true
  }

  async listInvoices(params: ListInvoicesParams): Promise<ListInvoicesResult> {
    return faturaProdutoGravityServico.listar(params)
  }

  async getInvoice(id: string): Promise<GravityInvoice | null> {
    return faturaProdutoGravityServico.obterPorId(id)
  }

  async createInvoice(params: CreateInvoiceParams): Promise<GravityInvoice> {
    return faturaProdutoGravityServico.criar(params)
  }

  async voidInvoice(params: VoidInvoiceParams): Promise<GravityInvoice> {
    return faturaProdutoGravityServico.anular(params.id, params.reason)
  }

  async sendInvoice(id: string): Promise<GravityInvoice> {
    return faturaProdutoGravityServico.enviar(id)
  }
}
