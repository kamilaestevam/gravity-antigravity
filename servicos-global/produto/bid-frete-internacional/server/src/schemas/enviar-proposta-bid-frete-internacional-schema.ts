import { z } from 'zod'
import { faixaValorFreteKgsPropostaBidFreteInternacionalSchema } from '../../../shared/tipo-valor-frete-bid-frete-internacional.js'

/** Aceita ISO datetime ou data do input type="date" (YYYY-MM-DD). */
const validadePropostaBidFreteInternacionalSchema = z
  .string()
  .min(1)
  .refine(
    (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isNaN(Date.parse(value)),
    { message: 'Data de validade invalida' },
  )
  .transform((value) => (value.includes('T') ? value : `${value}T23:59:59.000Z`))

export function formatarErroValidacaoPropostaEnviarProposta(error: z.ZodError): string {
  return `Dados invalidos: ${error.issues.map((issue) => `[${issue.path.join('.')}] ${issue.message}`).join('; ')}`
}

const periodoArmazenagemPropostaSchema = z.object({
  ordem_periodo_armazenagem_proposta_bid_frete_internacional: z.number().int().positive(),
  dias_periodo_armazenagem_proposta_bid_frete_internacional: z.number().int().positive(),
  tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: z.enum([
    'REAIS',
    'PERCENTUAL_MERCADORIA',
  ]),
  valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional: z.number().positive(),
  minimo_reais_periodo_armazenagem_proposta_bid_frete_internacional: z.number().min(0),
}).superRefine((p, ctx) => {
  if (
    p.tipo_tarifa_periodo_armazenagem_proposta_bid_frete_internacional === 'PERCENTUAL_MERCADORIA'
    && p.valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional > 100
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Percentual sobre mercadoria nao pode exceder 100',
      path: ['valor_tarifa_periodo_armazenagem_proposta_bid_frete_internacional'],
    })
  }
})

export const EnviarPropostaSchema = z.object({
  moeda_proposta_bid_frete_internacional: z.string().default('USD'),
  tipo_valor_frete_proposta_bid_frete_internacional: z.enum(['TOTAL', 'FAIXA_PESO']).default('TOTAL'),
  faixas_valor_frete_kgs_proposta_bid_frete_internacional: z
    .array(faixaValorFreteKgsPropostaBidFreteInternacionalSchema)
    .min(1)
    .nullish(),
  valor_frete_proposta_bid_frete_internacional: z.number().positive().optional(),
  taxas_origem_proposta_bid_frete_internacional: z.number().min(0).default(0),
  taxas_destino_proposta_bid_frete_internacional: z.number().min(0).default(0),
  dias_transito_proposta_bid_frete_internacional: z.number().int().positive(),
  dias_free_time_proposta_bid_frete_internacional: z.number().int().min(0).nullish(),
  dias_prazo_pagamento_proposta_bid_frete_internacional: z.number().int().min(0),
  transbordos_proposta_bid_frete_internacional: z.number().int().min(0).default(0),
  escalas_proposta_bid_frete_internacional: z
    .union([z.string().regex(/^\d+$/), z.number().int().min(0).transform(String)])
    .nullish(),
  codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: z.string().min(1).optional(),
  codigo_porto_aeroporto_destino_proposta_bid_frete_internacional: z.string().min(1).optional(),
  observacoes_proposta_bid_frete_internacional: z.string().nullish(),
  periodos_armazenagem_proposta_bid_frete_internacional: z
    .array(periodoArmazenagemPropostaSchema)
    .min(1)
    .nullish(),
  validade_proposta_bid_frete_internacional: validadePropostaBidFreteInternacionalSchema,
  taxas: z.array(z.object({
    tipo_taxa_bid_frete_internacional: z.enum(['origem', 'destino', 'frete']),
    nome_taxa_bid_frete_internacional: z.string(),
    valor_taxa_bid_frete_internacional: z.number(),
    moeda_taxa_bid_frete_internacional: z.string().default('USD'),
    id_taxa_origem_destino: z.string().nullable().optional(),
  })).optional(),
}).superRefine((data, ctx) => {
  if (data.tipo_valor_frete_proposta_bid_frete_internacional === 'FAIXA_PESO') {
    if (!data.faixas_valor_frete_kgs_proposta_bid_frete_internacional?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe ao menos uma faixa com tarifa',
        path: ['faixas_valor_frete_kgs_proposta_bid_frete_internacional'],
      })
    }
    return
  }
  if (
    data.valor_frete_proposta_bid_frete_internacional == null
    || data.valor_frete_proposta_bid_frete_internacional <= 0
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Valor do frete base obrigatorio',
      path: ['valor_frete_proposta_bid_frete_internacional'],
    })
  }
})
