/**
 * Tipo do valor do frete — modal Aéreo (cotação e proposta).
 *
 * Prisma (fragment.prisma):
 * - Enum BidFreteInternacionalTipoValorFrete: TOTAL | FAIXA_PESO
 * - Enum BidFreteInternacionalUnidadeFaixaValorFreteKgs: KG | M3 (itens JSON)
 *
 * Cotação: tipo_valor_frete_cotacao_bid_frete_internacional + faixas_valor_frete_kgs_cotacao_bid_frete_internacional
 * Proposta: tipo_valor_frete_proposta_bid_frete_internacional + faixas_valor_frete_kgs_proposta_bid_frete_internacional
 *
 * UI: «Frete total» vs «Faixa de peso»; faixas livres (sem +45/+100 fixos).
 */
import { z } from 'zod'

export const TIPOS_VALOR_FRETE_BID_FRETE_INTERNACIONAL = [
  'TOTAL',
  'FAIXA_PESO',
] as const

export type TipoValorFreteBidFreteInternacional =
  (typeof TIPOS_VALOR_FRETE_BID_FRETE_INTERNACIONAL)[number]

export const UNIDADES_FAIXA_VALOR_FRETE_KGS_BID_FRETE_INTERNACIONAL = [
  'KG',
  'M3',
] as const

export type UnidadeFaixaValorFreteKgsBidFreteInternacional =
  (typeof UNIDADES_FAIXA_VALOR_FRETE_KGS_BID_FRETE_INTERNACIONAL)[number]

export const tipoValorFreteBidFreteInternacionalSchema = z.enum(
  TIPOS_VALOR_FRETE_BID_FRETE_INTERNACIONAL,
)

export const unidadeFaixaValorFreteKgsBidFreteInternacionalSchema = z.enum(
  UNIDADES_FAIXA_VALOR_FRETE_KGS_BID_FRETE_INTERNACIONAL,
)

export const ROTULOS_TIPO_VALOR_FRETE_BID_FRETE_INTERNACIONAL: Record<
  TipoValorFreteBidFreteInternacional,
  string
> = {
  TOTAL: 'Frete total',
  FAIXA_PESO: 'Faixa de peso',
}

export const ROTULOS_UNIDADE_FAIXA_VALOR_FRETE_KGS_BID_FRETE_INTERNACIONAL: Record<
  UnidadeFaixaValorFreteKgsBidFreteInternacional,
  string
> = {
  KG: 'Por kg',
  M3: 'Por m³',
}

export const SIGLAS_UNIDADE_FAIXA_VALOR_FRETE_KGS_BID_FRETE_INTERNACIONAL: Record<
  UnidadeFaixaValorFreteKgsBidFreteInternacional,
  string
> = {
  KG: 'kg',
  M3: 'm³',
}

export const faixaValorFreteKgsCotacaoBidFreteInternacionalSchema = z.object({
  ordem_faixa_valor_frete_kgs_cotacao_bid_frete_internacional: z.number().int().positive(),
  limite_inferior_kg_faixa_valor_frete_kgs_cotacao_bid_frete_internacional: z.number().nonnegative(),
  valor_unitario_faixa_valor_frete_kgs_cotacao_bid_frete_internacional: z.number().positive(),
  unidade_faixa_valor_frete_kgs_cotacao_bid_frete_internacional:
    unidadeFaixaValorFreteKgsBidFreteInternacionalSchema,
  moeda_faixa_valor_frete_kgs_cotacao_bid_frete_internacional: z.string().min(1).optional(),
})

export const faixaValorFreteKgsPropostaBidFreteInternacionalSchema = z.object({
  ordem_faixa_valor_frete_kgs_proposta_bid_frete_internacional: z.number().int().positive(),
  limite_inferior_kg_faixa_valor_frete_kgs_proposta_bid_frete_internacional: z.number().nonnegative(),
  valor_unitario_faixa_valor_frete_kgs_proposta_bid_frete_internacional: z.number().positive(),
  unidade_faixa_valor_frete_kgs_proposta_bid_frete_internacional:
    unidadeFaixaValorFreteKgsBidFreteInternacionalSchema,
  moeda_faixa_valor_frete_kgs_proposta_bid_frete_internacional: z.string().min(1).optional(),
})

export type FaixaValorFreteKgsCotacaoBidFreteInternacional = z.infer<
  typeof faixaValorFreteKgsCotacaoBidFreteInternacionalSchema
>

export type FaixaValorFreteKgsPropostaBidFreteInternacional = z.infer<
  typeof faixaValorFreteKgsPropostaBidFreteInternacionalSchema
>

export const faixasValorFreteKgsCotacaoBidFreteInternacionalSchema = z.array(
  faixaValorFreteKgsCotacaoBidFreteInternacionalSchema,
).min(1)

export const faixasValorFreteKgsPropostaBidFreteInternacionalSchema = z.array(
  faixaValorFreteKgsPropostaBidFreteInternacionalSchema,
).min(1)

export function normalizarTipoValorFreteBidFreteInternacional(
  input: unknown,
): TipoValorFreteBidFreteInternacional | null {
  const parsed = tipoValorFreteBidFreteInternacionalSchema.safeParse(input)
  return parsed.success ? parsed.data : null
}
