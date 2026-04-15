// server/lib/billing/itauProvider.ts
// Skeleton BillingProvider para Itaú — API de Cobrança (Boleto Registrado + Pix).
//
// STATUS: Esqueleto não-funcional. Implementação real bloqueada pelos seguintes pré-requisitos:
//
// 1. Conta PJ Itaú ativa + convênio de cobrança contratado (agência/gerente).
//    → Gera os campos: carteira, nosso_numero_prefixo, convenio_id.
//
// 2. Cadastro da aplicação no DevPortal Itaú (https://devportal.itau.com.br).
//    → Gera client_id + client_secret.
//
// 3. Certificado mTLS emitido pelo Itaú (NÃO é o A1 genérico — é um cert mTLS específico).
//    → Baixado do próprio DevPortal após homologação.
//
// 4. Homologação em sandbox (obrigatória antes de produção).
//
// 5. Liberação em produção pelo gerente de conta.
//
// Env vars necessárias (adicionar ao .env.example quando implementar):
//   ITAU_CLIENT_ID
//   ITAU_CLIENT_SECRET
//   ITAU_MTLS_CERT_PATH       (caminho do .crt)
//   ITAU_MTLS_KEY_PATH        (caminho do .key)
//   ITAU_CONVENIO_ID
//   ITAU_CARTEIRA             (ex: '109')
//   ITAU_ENVIRONMENT          ('sandbox' | 'production')
//
// Docs oficiais:
//   https://devportal.itau.com.br/
//   https://developer.itau.com.br/apis/api-cash/

import type {
  BillingProvider,
  BillingProviderName,
  CreateInvoiceParams,
  GravityInvoice,
  ListInvoicesParams,
  ListInvoicesResult,
  VoidInvoiceParams,
} from './types.js'

export class ItauProvider implements BillingProvider {
  readonly name: BillingProviderName = 'itau'

  async isAvailable(): Promise<boolean> {
    // Retorna false enquanto não houver credenciais configuradas
    const required = [
      'ITAU_CLIENT_ID',
      'ITAU_CLIENT_SECRET',
      'ITAU_MTLS_CERT_PATH',
      'ITAU_MTLS_KEY_PATH',
      'ITAU_CONVENIO_ID',
    ] as const
    return required.every(key => !!process.env[key])
  }

  async listInvoices(_params: ListInvoicesParams): Promise<ListInvoicesResult> {
    throw new Error(
      'ItauProvider não implementado. Ver server/lib/billing/itauProvider.ts para checklist de ativação.',
    )
  }

  async getInvoice(_id: string): Promise<GravityInvoice | null> {
    throw new Error('ItauProvider.getInvoice não implementado')
  }

  async createInvoice(_params: CreateInvoiceParams): Promise<GravityInvoice> {
    throw new Error('ItauProvider.createInvoice não implementado')
  }

  async voidInvoice(_params: VoidInvoiceParams): Promise<GravityInvoice> {
    throw new Error('ItauProvider.voidInvoice não implementado')
  }

  async sendInvoice(_id: string): Promise<GravityInvoice> {
    throw new Error('ItauProvider.sendInvoice não implementado')
  }
}
