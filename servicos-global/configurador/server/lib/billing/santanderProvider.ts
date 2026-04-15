// server/lib/billing/santanderProvider.ts
// Skeleton BillingProvider para Santander — API de Cobrança (Boleto Registrado + Pix).
//
// STATUS: Esqueleto não-funcional. Implementação real bloqueada pelos seguintes pré-requisitos:
//
// 1. Conta PJ Santander ativa + convênio de cobrança contratado (agência/gerente).
//    → Gera os campos: convenio, carteira, workspace_id.
//
// 2. Cadastro da aplicação no DevPortal Santander
//    (https://developer.santander.com.br).
//    → Gera client_id + client_secret.
//
// 3. Certificado digital A1 do CNPJ emitido (Serasa/Certisign/Valid).
//    → Usado para assinar requisições OAuth2.
//
// 4. Ambiente: sandbox → produção. Homologação obrigatória.
//
// 5. Aviso de qualidade: a API do Santander tem fama de lentidão e SLA inferior.
//    Se possível, prefira Itaú ou Inter. Este skeleton existe para cobrir o caso
//    em que Gravity já tem conta só no Santander.
//
// Env vars necessárias:
//   SANTANDER_CLIENT_ID
//   SANTANDER_CLIENT_SECRET
//   SANTANDER_CERT_PATH          (A1 .p12 ou .pfx)
//   SANTANDER_CERT_PASSWORD
//   SANTANDER_CONVENIO
//   SANTANDER_WORKSPACE_ID
//   SANTANDER_ENVIRONMENT        ('sandbox' | 'production')
//
// Docs oficiais:
//   https://developer.santander.com.br/api/documentacao/cobranca-titulos

import type {
  BillingProvider,
  BillingProviderName,
  CreateInvoiceParams,
  GravityInvoice,
  ListInvoicesParams,
  ListInvoicesResult,
  VoidInvoiceParams,
} from './types.js'

export class SantanderProvider implements BillingProvider {
  readonly name: BillingProviderName = 'santander'

  async isAvailable(): Promise<boolean> {
    const required = [
      'SANTANDER_CLIENT_ID',
      'SANTANDER_CLIENT_SECRET',
      'SANTANDER_CERT_PATH',
      'SANTANDER_CERT_PASSWORD',
      'SANTANDER_CONVENIO',
    ] as const
    return required.every(key => !!process.env[key])
  }

  async listInvoices(_params: ListInvoicesParams): Promise<ListInvoicesResult> {
    throw new Error(
      'SantanderProvider não implementado. Ver server/lib/billing/santanderProvider.ts para checklist de ativação.',
    )
  }

  async getInvoice(_id: string): Promise<GravityInvoice | null> {
    throw new Error('SantanderProvider.getInvoice não implementado')
  }

  async createInvoice(_params: CreateInvoiceParams): Promise<GravityInvoice> {
    throw new Error('SantanderProvider.createInvoice não implementado')
  }

  async voidInvoice(_params: VoidInvoiceParams): Promise<GravityInvoice> {
    throw new Error('SantanderProvider.voidInvoice não implementado')
  }

  async sendInvoice(_id: string): Promise<GravityInvoice> {
    throw new Error('SantanderProvider.sendInvoice não implementado')
  }
}
