/**
 * Preferências de notificação — BID Frete Internacional (persistidas por usuário).
 */
import { z } from 'zod'

export const NOME_PAINEL_META_NOTIFICACOES_BID_FRETE =
  '__meta_notificacoes_bid_frete_v1__' as const

export type PreferenciasNotificacaoBidFrete = {
  _v: 1
  /** Sininho ao comprador quando fornecedor altera proposta já enviada */
  avisar_alteracao_proposta_fornecedor: boolean
  /** E-mail ao comprador quando a solicitação é enviada aos fornecedores */
  email_envio_solicitacao_cotacao: boolean
  /** E-mail ao comprador quando fornecedor envia ou atualiza proposta */
  email_resposta_fornecedor: boolean
  /** E-mail ao comprador quando o ganhador confirma aceite da aprovação */
  email_confirmacao_fornecedor_vencedor: boolean
}

export const PREFERENCIAS_NOTIFICACAO_BID_FRETE_PADRAO: PreferenciasNotificacaoBidFrete = {
  _v: 1,
  avisar_alteracao_proposta_fornecedor: true,
  email_envio_solicitacao_cotacao: false,
  email_resposta_fornecedor: true,
  email_confirmacao_fornecedor_vencedor: true,
}

const preferenciasNotificacaoBidFreteInputSchema = z.object({
  _v: z.literal(1).optional(),
  avisar_alteracao_proposta_fornecedor: z.boolean().optional(),
  email_envio_solicitacao_cotacao: z.boolean().optional(),
  email_resposta_fornecedor: z.boolean().optional(),
  email_confirmacao_fornecedor_vencedor: z.boolean().optional(),
  /** Legado — mapeado para email_resposta_fornecedor */
  resposta_fornecedor: z.boolean().optional(),
  nova_cotacao: z.boolean().optional(),
  cotacao_expirada: z.boolean().optional(),
})

export const preferenciasNotificacaoBidFreteSchema = preferenciasNotificacaoBidFreteInputSchema.transform(
  (input) => normalizarPreferenciasNotificacaoBidFrete(input),
)

export function normalizarPreferenciasNotificacaoBidFrete(
  input: unknown,
): PreferenciasNotificacaoBidFrete {
  const parsed = preferenciasNotificacaoBidFreteInputSchema.safeParse(input)
  const raw = parsed.success ? parsed.data : {}
  const padrao = PREFERENCIAS_NOTIFICACAO_BID_FRETE_PADRAO

  return {
    _v: 1,
    avisar_alteracao_proposta_fornecedor:
      raw.avisar_alteracao_proposta_fornecedor ?? padrao.avisar_alteracao_proposta_fornecedor,
    email_envio_solicitacao_cotacao:
      raw.email_envio_solicitacao_cotacao ?? padrao.email_envio_solicitacao_cotacao,
    email_resposta_fornecedor:
      raw.email_resposta_fornecedor
      ?? raw.resposta_fornecedor
      ?? padrao.email_resposta_fornecedor,
    email_confirmacao_fornecedor_vencedor:
      raw.email_confirmacao_fornecedor_vencedor ?? padrao.email_confirmacao_fornecedor_vencedor,
  }
}

export function serializarPreferenciasNotificacaoBidFrete(
  prefs: PreferenciasNotificacaoBidFrete,
): string {
  return JSON.stringify(normalizarPreferenciasNotificacaoBidFrete(prefs))
}

export function parsearPreferenciasNotificacaoBidFrete(
  raw: string,
): PreferenciasNotificacaoBidFrete {
  try {
    const json: unknown = JSON.parse(raw)
    return normalizarPreferenciasNotificacaoBidFrete(json)
  } catch {
    return PREFERENCIAS_NOTIFICACAO_BID_FRETE_PADRAO
  }
}
