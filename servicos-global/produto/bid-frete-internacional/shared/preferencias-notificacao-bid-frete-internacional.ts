/**
 * Preferências de notificação — BID Frete Internacional (persistidas por usuário).
 */
import { z } from 'zod'

export const NOME_PAINEL_META_NOTIFICACOES_BID_FRETE =
  '__meta_notificacoes_bid_frete_v1__' as const

export const preferenciasNotificacaoBidFreteSchema = z.object({
  _v: z.literal(1),
  /** Sininho/e-mail ao comprador quando fornecedor altera proposta já enviada */
  avisar_alteracao_proposta_fornecedor: z.boolean(),
  resposta_fornecedor: z.boolean().optional(),
  nova_cotacao: z.boolean().optional(),
  cotacao_expirada: z.boolean().optional(),
})

export type PreferenciasNotificacaoBidFrete = z.infer<
  typeof preferenciasNotificacaoBidFreteSchema
>

export const PREFERENCIAS_NOTIFICACAO_BID_FRETE_PADRAO: PreferenciasNotificacaoBidFrete = {
  _v: 1,
  avisar_alteracao_proposta_fornecedor: true,
  resposta_fornecedor: true,
  nova_cotacao: true,
  cotacao_expirada: true,
}

export function serializarPreferenciasNotificacaoBidFrete(
  prefs: PreferenciasNotificacaoBidFrete,
): string {
  return JSON.stringify(preferenciasNotificacaoBidFreteSchema.parse(prefs))
}

export function parsearPreferenciasNotificacaoBidFrete(
  raw: string,
): PreferenciasNotificacaoBidFrete {
  try {
    const json: unknown = JSON.parse(raw)
    const parsed = preferenciasNotificacaoBidFreteSchema.safeParse(json)
    if (parsed.success) return parsed.data
  } catch {
    /* fallback */
  }
  return PREFERENCIAS_NOTIFICACAO_BID_FRETE_PADRAO
}
