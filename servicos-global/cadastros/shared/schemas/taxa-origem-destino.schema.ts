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

/** Importações legadas usam prefixo LEG_ no código (ex.: LEG_1000_DESTINO). */
export function ehTaxaOrigemDestinoLegada(item: {
  legado_taxa_origem_destino?: boolean
  codigo_taxa_origem_destino?: string | null
}): boolean {
  if (item.legado_taxa_origem_destino === true) return true
  const codigo = (item.codigo_taxa_origem_destino ?? '').trim().toUpperCase()
  return codigo.startsWith('LEG_')
}
