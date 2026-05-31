import { z } from 'zod'

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

export const EnviarPropostaSchema = z.object({
  moeda_proposta_bid_frete_internacional: z.string().default('USD'),
  valor_frete_proposta_bid_frete_internacional: z.number().positive(),
  taxas_origem_proposta_bid_frete_internacional: z.number().min(0).default(0),
  taxas_destino_proposta_bid_frete_internacional: z.number().min(0).default(0),
  dias_transito_proposta_bid_frete_internacional: z.number().int().positive(),
  dias_free_time_proposta_bid_frete_internacional: z.number().int().nullish(),
  transbordos_proposta_bid_frete_internacional: z.number().int().min(0).default(0),
  escalas_proposta_bid_frete_internacional: z
    .union([z.string().regex(/^\d+$/), z.number().int().min(0).transform(String)])
    .nullish(),
  observacoes_proposta_bid_frete_internacional: z.string().nullish(),
  validade_proposta_bid_frete_internacional: validadePropostaBidFreteInternacionalSchema,
  taxas: z.array(z.object({
    tipo_taxa_bid_frete_internacional: z.enum(['origem', 'destino', 'frete']),
    nome_taxa_bid_frete_internacional: z.string(),
    valor_taxa_bid_frete_internacional: z.number(),
    moeda_taxa_bid_frete_internacional: z.string().default('USD'),
    id_taxa_origem_destino: z.string().nullable().optional(),
  })).optional(),
})
