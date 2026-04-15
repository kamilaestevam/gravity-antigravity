// server/lib/nfse/contaAzulNfse.ts
// Skeleton NfseProvider para emissão de NFS-e via Conta Azul.
//
// DECISÃO DE PRODUTO (2026-04-15): Conta Azul é o provider OFICIAL para
// emissão fiscal do Gravity. A mesma autenticação OAuth2 do ContaAzulProvider
// (billing) é usada aqui.
//
// ─── CHECKLIST DE ATIVAÇÃO ─────────────────────────────────────────────────
//
// Pré-requisitos (maioria se sobrepõe ao ContaAzulProvider de billing):
//
//   1. Assinatura Conta Azul Pro/Enterprise ativa
//   2. CNPJ do Gravity cadastrado no Conta Azul com:
//      - Inscrição Municipal ativa em Florianópolis
//      - Certificado Digital A1 uploaded no painel Conta Azul
//      - Código de serviço municipal configurado (ex: "1.05")
//      - Alíquota ISS definida
//   3. Homologação fiscal concluída no Conta Azul (eles validam com a prefeitura)
//   4. Mesmas credenciais OAuth2 do ContaAzulProvider (refresh_token compartilhado)
//
// ─── Env vars ───────────────────────────────────────────────────────────────
//
// Compartilha as mesmas do ContaAzulProvider + opcionalmente:
//   NFSE_PROVIDER=conta_azul
//
// Não há env específica de NFS-e — o Conta Azul já tem a config fiscal no dashboard.
//
// ─── Endpoints ──────────────────────────────────────────────────────────────
//
//   POST /v1/notas-fiscais/servico       → emissão
//   GET  /v1/notas-fiscais/servico/{id}  → status
//   POST /v1/notas-fiscais/servico/{id}/cancelar → cancelamento
//
// ─── Fluxo ──────────────────────────────────────────────────────────────────
//
// Nota: quando usando ContaAzulProvider no billing, a NFS-e já pode ser emitida
// automaticamente junto com a venda (campo `emitir_nfse=true` no POST /v1/sales).
// Esta classe existe para casos em que a emissão é disparada manualmente OU
// via webhook invoice.paid quando o provider de billing é outro (ex: Stripe).
//
// Docs:
//   https://developers.contaazul.com/reference/notas-fiscais

import type {
  EmitNfseParams,
  NfseProvider,
  NfseProviderName,
  NfseResult,
} from './types.js'

export class ContaAzulNfseProvider implements NfseProvider {
  readonly name: NfseProviderName = 'conta_azul'

  async isAvailable(): Promise<boolean> {
    // Usa as mesmas credenciais do ContaAzulProvider (billing)
    const required = [
      'CONTA_AZUL_CLIENT_ID',
      'CONTA_AZUL_CLIENT_SECRET',
      'CONTA_AZUL_REFRESH_TOKEN',
    ] as const
    return required.every(key => !!process.env[key])
  }

  async emit(_params: EmitNfseParams): Promise<NfseResult> {
    throw new Error(
      'ContaAzulNfseProvider.emit não implementado. Ver server/lib/nfse/contaAzulNfse.ts ' +
      'para checklist de ativação. Requer: plano Conta Azul Pro + A1 uploaded + IM Floripa + ' +
      'código serviço configurado no dashboard do Conta Azul.',
    )
  }

  async getStatus(_id: string): Promise<NfseResult | null> {
    throw new Error('ContaAzulNfseProvider.getStatus não implementado')
  }

  async cancel(_id: string, _reason: string): Promise<NfseResult> {
    throw new Error('ContaAzulNfseProvider.cancel não implementado')
  }
}
