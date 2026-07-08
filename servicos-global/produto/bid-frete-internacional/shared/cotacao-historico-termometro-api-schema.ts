/**
 * Contrato Zod — histórico do termômetro no GET /cotacoes/:id.
 * Mandamento 06/09 — bilateral com payload do server (cotacoes.ts).
 * Doc: documentos-tecnicos/produtos-gravity/bid-frete-internacional/TERMOMETRO-HISTORICO-COCKPIT-TECNICO.md
 */
import { z } from 'zod'

const valorMonetarioHistoricoTermometroSchema = z.union([z.number(), z.string()])

export const propostaHistoricoTermometroResponseSchema = z.object({
  data_criacao_proposta_bid_frete_internacional: z.union([z.string(), z.date()]).optional().nullable(),
  status_proposta_bid_frete_internacional: z.string().optional().nullable(),
  valor_frete_proposta_bid_frete_internacional: valorMonetarioHistoricoTermometroSchema.optional().nullable(),
  taxas_origem_proposta_bid_frete_internacional: valorMonetarioHistoricoTermometroSchema.optional().nullable(),
  taxas_destino_proposta_bid_frete_internacional: valorMonetarioHistoricoTermometroSchema.optional().nullable(),
  valor_total_proposta_bid_frete_internacional: valorMonetarioHistoricoTermometroSchema.optional().nullable(),
  moeda_proposta_bid_frete_internacional: z.string().optional().nullable(),
})

export const itemHistoricoTermometroResponseSchema = z.object({
  id_cotacao_bid_frete_internacional: z.string(),
  numero_cotacao_bid_frete_internacional: z.string().optional(),
  tipo_operacao_cotacao_bid_frete_internacional: z.string().optional(),
  modal_cotacao_bid_frete_internacional: z.string().optional(),
  origem_codigo_cotacao_bid_frete_internacional: z.string().optional(),
  destino_codigo_cotacao_bid_frete_internacional: z.string().optional(),
  modalidade_cotacao_bid_frete_internacional: z.string().nullable().optional(),
  tipo_container_cotacao_bid_frete_internacional: z.string().nullable().optional(),
  incoterm_cotacao_bid_frete_internacional: z.string().nullable().optional(),
  peso_kg_cotacao_bid_frete_internacional: z.number().nullable().optional(),
  peso_ton_cotacao_bid_frete_internacional: z.number().nullable().optional(),
  cubagem_m3_cotacao_bid_frete_internacional: z.number().nullable().optional(),
  data_criacao_cotacao_bid_frete_internacional: z.union([z.string(), z.date()]).optional(),
  data_aprovacao_cotacao_bid_frete_internacional: z.union([z.string(), z.date()]).nullable().optional(),
  data_limite_resposta_cotacao_bid_frete_internacional: z.union([z.string(), z.date()]).nullable().optional(),
  data_atualizacao_cotacao_bid_frete_internacional: z.union([z.string(), z.date()]).optional(),
  propostas: z.array(propostaHistoricoTermometroResponseSchema).optional(),
  propostas_bid_frete_internacional: z.array(propostaHistoricoTermometroResponseSchema).optional(),
})

export const historicoTermometroListaResponseSchema = z.array(itemHistoricoTermometroResponseSchema)

export type ItemHistoricoTermometroResponse = z.infer<typeof itemHistoricoTermometroResponseSchema>
export type HistoricoTermometroListaResponse = z.infer<typeof historicoTermometroListaResponseSchema>

export function parseHistoricoTermometroListaFromServer(
  raw: unknown,
  campo: 'historico_aprovado' | 'historico_propostas_recebidas',
): HistoricoTermometroListaResponse | undefined {
  if (raw === undefined || raw === null) return undefined
  const parsed = historicoTermometroListaResponseSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(
      `[bid-frete] Campo ${campo} inválido na resposta GET cotação: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
    )
  }
  return parsed.data
}
