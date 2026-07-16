/**
 * Tipo do valor do frete base — modal Aéreo (proposta do fornecedor).
 *
 * Prisma (fragment.prisma → compose-schema.js):
 * - Enum BidFreteInternacionalTipoValorFreteProposta: TOTAL | FAIXA_PESO
 * - Coluna tipo_valor_frete_proposta_bid_frete_internacional @default(TOTAL)
 * - Coluna faixas_valor_frete_kgs_proposta_bid_frete_internacional Json? (quando FAIXA_PESO)
 * - Enum BidFreteInternacionalUnidadeFaixaValorFreteKgsProposta: KG | M3 (itens do JSON)
 *
 * UI: «Frete total» vs «Faixa de peso». Em faixa de peso o fornecedor adiciona linhas
 * (limites e tarifas livres — sem faixas fixas pré-preenchidas).
 */
import { z } from 'zod'

export const TIPOS_VALOR_FRETE_PROPOSTA_BID_FRETE_INTERNACIONAL = [
  'TOTAL',
  'FAIXA_PESO',
] as const

export type TipoValorFretePropostaBidFreteInternacional =
  (typeof TIPOS_VALOR_FRETE_PROPOSTA_BID_FRETE_INTERNACIONAL)[number]

export const UNIDADES_FAIXA_VALOR_FRETE_KGS_PROPOSTA_BID_FRETE_INTERNACIONAL = [
  'KG',
  'M3',
] as const

export type UnidadeFaixaValorFreteKgsPropostaBidFreteInternacional =
  (typeof UNIDADES_FAIXA_VALOR_FRETE_KGS_PROPOSTA_BID_FRETE_INTERNACIONAL)[number]

export const tipoValorFretePropostaBidFreteInternacionalSchema = z.enum(
  TIPOS_VALOR_FRETE_PROPOSTA_BID_FRETE_INTERNACIONAL,
)

export const unidadeFaixaValorFreteKgsPropostaBidFreteInternacionalSchema = z.enum(
  UNIDADES_FAIXA_VALOR_FRETE_KGS_PROPOSTA_BID_FRETE_INTERNACIONAL,
)

export const faixaValorFreteKgsPropostaBidFreteInternacionalSchema = z.object({
  ordem_faixa_valor_frete_kgs_proposta_bid_frete_internacional: z.number().int().positive(),
  /** Limite inferior da faixa em kg (ex.: 45 para «+45 kg»). Fornecedor informa. */
  limite_inferior_kg_faixa_valor_frete_kgs_proposta_bid_frete_internacional: z.number().nonnegative(),
  valor_unitario_faixa_valor_frete_kgs_proposta_bid_frete_internacional: z.number().positive(),
  unidade_faixa_valor_frete_kgs_proposta_bid_frete_internacional:
    unidadeFaixaValorFreteKgsPropostaBidFreteInternacionalSchema,
  moeda_faixa_valor_frete_kgs_proposta_bid_frete_internacional: z.string().min(1).optional(),
})

export type FaixaValorFreteKgsPropostaBidFreteInternacional = z.infer<
  typeof faixaValorFreteKgsPropostaBidFreteInternacionalSchema
>

export const faixasValorFreteKgsPropostaBidFreteInternacionalSchema = z.array(
  faixaValorFreteKgsPropostaBidFreteInternacionalSchema,
).min(1)

export const ROTULOS_TIPO_VALOR_FRETE_PROPOSTA_BID_FRETE_INTERNACIONAL: Record<
  TipoValorFretePropostaBidFreteInternacional,
  string
> = {
  TOTAL: 'Frete total',
  FAIXA_PESO: 'Faixa de peso',
}

export const ROTULOS_UNIDADE_FAIXA_VALOR_FRETE_KGS_PROPOSTA_BID_FRETE_INTERNACIONAL: Record<
  UnidadeFaixaValorFreteKgsPropostaBidFreteInternacional,
  string
> = {
  KG: 'Por kg',
  M3: 'Por m³',
}

export const SIGLAS_UNIDADE_FAIXA_VALOR_FRETE_KGS_PROPOSTA_BID_FRETE_INTERNACIONAL: Record<
  UnidadeFaixaValorFreteKgsPropostaBidFreteInternacional,
  string
> = {
  KG: 'kg',
  M3: 'm³',
}

export function normalizarTipoValorFretePropostaBidFreteInternacional(
  input: unknown,
): TipoValorFretePropostaBidFreteInternacional | null {
  const parsed = tipoValorFretePropostaBidFreteInternacionalSchema.safeParse(input)
  return parsed.success ? parsed.data : null
}

export function normalizarFaixasValorFreteKgsPropostaBidFreteInternacional(
  input: unknown,
): FaixaValorFreteKgsPropostaBidFreteInternacional[] | null {
  const parsed = faixasValorFreteKgsPropostaBidFreteInternacionalSchema.safeParse(input)
  return parsed.success ? parsed.data : null
}
