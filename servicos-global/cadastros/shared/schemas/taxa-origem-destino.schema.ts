import { z } from 'zod'

export const tipoTaxaOrigemDestinoEnum = z.enum(['ORIGEM', 'DESTINO', 'FRETE'])

export const taxaOrigemDestinoSchema = z.object({
  id_taxa_origem_destino: z.string().min(1),
  nome_taxa_origem_destino: z.string().min(1),
  descricao_taxa_origem_destino: z.string().nullable().optional(),
  tipo_taxa_origem_destino: tipoTaxaOrigemDestinoEnum,
  codigo_taxa_origem_destino: z.string().nullable().optional(),
  ativo_taxa_origem_destino: z.boolean(),
})

export const listaTaxasOrigemDestinoSchema = z.object({
  itens: z.array(taxaOrigemDestinoSchema),
  total: z.number(),
})

export type TaxaOrigemDestino = z.infer<typeof taxaOrigemDestinoSchema>
