// server/lib/billing/contaAzulProvider.ts
// Skeleton BillingProvider para Conta Azul — API OAuth2 REST.
// Cobre cobrança recorrente (boleto/Pix/cartão) + emissão de NFS-e integrada.
//
// DECISÃO DE PRODUTO (2026-04-15): Conta Azul é o provider OFICIAL do Gravity
// para faturamento e emissão fiscal. Stripe fica como fallback de desenvolvimento
// e Itaú/Santander/ABRASF são skeletons alternativos documentados.
//
// ─── CHECKLIST DE ATIVAÇÃO ─────────────────────────────────────────────────
//
// Pré-requisitos burocráticos:
//
//   1. Assinatura Conta Azul Pro ou Enterprise (plano básico NÃO tem API).
//      Verificar em: https://contaazul.com/planos
//
//   2. CNPJ do Gravity cadastrado no Conta Azul com:
//      - Inscrição Municipal ativa em Florianópolis
//      - Certificado Digital A1 uploaded no painel (Configurações → Empresa → Certificado)
//      - Código de serviço municipal configurado (ex: "1.05" processamento de dados)
//      - Alíquota ISS definida (conforme contábil)
//
//   3. Cobrança Azul (produto de recorrência) contratado dentro do Conta Azul
//      se quiser cobrança automática mensal.
//
// Pré-requisitos técnicos:
//
//   4. Cadastro de aplicação no DevPortal Conta Azul:
//      https://developers.contaazul.com/
//      → Gera: CONTA_AZUL_CLIENT_ID, CONTA_AZUL_CLIENT_SECRET
//
//   5. Fluxo OAuth2 Authorization Code (feito UMA VEZ):
//      a. Abrir URL de autorização:
//         https://api.contaazul.com/auth/authorize?
//           client_id={id}&
//           redirect_uri={callback}&
//           scope=sales&
//           state={random}&
//           response_type=code
//      b. Admin Gravity autoriza manualmente
//      c. Conta Azul redireciona para {callback} com ?code={auth_code}
//      d. Gravity troca auth_code por access_token + refresh_token via POST
//         https://api.contaazul.com/oauth2/token
//      e. Armazenar refresh_token em DB (tabela OAuthCredential ou env var em dev)
//      f. Daqui pra frente, usa refresh_token pra renovar access_token (expira ~2h)
//
//   6. Endpoint de callback OAuth no Gravity — criar em
//      server/routes/billing.ts:
//      GET /api/v1/financeiro/conta-azul/oauth-callback
//
// ─── Env vars necessárias ───────────────────────────────────────────────────
//
//   CONTA_AZUL_CLIENT_ID
//   CONTA_AZUL_CLIENT_SECRET
//   CONTA_AZUL_REDIRECT_URI         (ex: https://configurador.gravity.com.br/api/v1/financeiro/conta-azul/oauth-callback)
//   CONTA_AZUL_REFRESH_TOKEN        (obtido no fluxo OAuth — armazenar em DB depois)
//   CONTA_AZUL_ENVIRONMENT          ('sandbox' | 'production')
//
// ─── Endpoints que este provider usa ────────────────────────────────────────
//
//   GET  /v1/sales                  → listInvoices
//   POST /v1/sales                  → createInvoice (venda + nota fiscal de serviço)
//   GET  /v1/sales/{id}             → getInvoice
//   DELETE /v1/sales/{id}           → voidInvoice (cancelamento)
//   POST /v1/sales/{id}/send-email  → sendInvoice
//
//   POST /v1/notas-fiscais/servico  → emissão de NFS-e (disparado após pagamento)
//
// ─── Mapping Gravity ↔ Conta Azul ───────────────────────────────────────────
//
//   GravityInvoice         ↔ Conta Azul Venda (sale)
//   GravityInvoice.status  ↔ situacao: 'PENDENTE' | 'PAGA' | 'CANCELADA'
//   GravityInvoice.customer.id ↔ cliente.id (Conta Azul Cliente — é necessário
//                                 pré-cadastrar ou criar on-the-fly via /v1/clientes)
//   GravityInvoice.line_items ↔ servicos[] ou produtos[]
//   GravityInvoice.due_date ↔ data_vencimento
//   GravityInvoice.documents ↔ depois da NF-e emitida, URL fica em
//                               nota_fiscal.url_pdf e url_xml
//
// ─── Fluxo esperado após ativação ───────────────────────────────────────────
//
//   1. Admin Gravity clica "Lançar Fatura" na tela
//   2. POST /api/v1/admin/faturas → createInvoice()
//   3. ContaAzulProvider.createInvoice:
//      a. Acha ou cria o cliente no Conta Azul (via CNPJ do tenant)
//      b. Cria a venda com o item
//      c. Opcional: finaliza (gera boleto/link de pagamento)
//   4. Cliente recebe email com link de pagamento
//   5. Cliente paga
//   6. Conta Azul envia webhook pra Gravity (POST /api/v1/faturas/webhook-conta-azul)
//   7. Webhook handler detecta tipo "sale_paid" e dispara emissão de NF-e
//   8. NF-e fica disponível no Conta Azul e é puxada pelo getInvoice() seguinte
//
// Docs oficiais:
//   https://developers.contaazul.com/reference/introduction
//   https://developers.contaazul.com/docs/autenticacao

import type {
  BillingProvider,
  BillingProviderName,
  CreateInvoiceParams,
  GravityInvoice,
  ListInvoicesParams,
  ListInvoicesResult,
  VoidInvoiceParams,
} from './types.js'

export class ContaAzulProvider implements BillingProvider {
  readonly name: BillingProviderName = 'conta_azul'

  async isAvailable(): Promise<boolean> {
    const required = [
      'CONTA_AZUL_CLIENT_ID',
      'CONTA_AZUL_CLIENT_SECRET',
      'CONTA_AZUL_REFRESH_TOKEN',
    ] as const
    return required.every(key => !!process.env[key])
  }

  async listInvoices(_params: ListInvoicesParams): Promise<ListInvoicesResult> {
    throw new Error(
      'ContaAzulProvider não implementado. Ver server/lib/billing/contaAzulProvider.ts ' +
      'para checklist de ativação. Precisa: plano Pro, OAuth2 configurado, refresh token.',
    )
  }

  async getInvoice(_id: string): Promise<GravityInvoice | null> {
    throw new Error('ContaAzulProvider.getInvoice não implementado')
  }

  async createInvoice(_params: CreateInvoiceParams): Promise<GravityInvoice> {
    throw new Error('ContaAzulProvider.createInvoice não implementado')
  }

  async voidInvoice(_params: VoidInvoiceParams): Promise<GravityInvoice> {
    throw new Error('ContaAzulProvider.voidInvoice não implementado')
  }

  async sendInvoice(_id: string): Promise<GravityInvoice> {
    throw new Error('ContaAzulProvider.sendInvoice não implementado')
  }
}
