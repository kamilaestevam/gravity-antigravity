import { z } from 'zod'

/** Item do GET /api/v1/produtos-gravity (contrato legado público). */
export const storeCatalogoItemApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  type_billing: z.string().nullable().optional(),
  unit_price: z.union([z.number(), z.string()]),
  currency: z.string(),
  backend_module: z.string().nullable().optional(),
})

export const storeCatalogoRespostaApiSchema = z.object({
  products: z.array(storeCatalogoItemApiSchema),
})

export type StoreCatalogoItemApi = z.infer<typeof storeCatalogoItemApiSchema>

/** Mesmo filtro do Admin: publicados ATIVO + EM_BREVE (case-insensitive). */
export function filtrarProdutosPublicadosStore(products: StoreCatalogoItemApi[]): StoreCatalogoItemApi[] {
  return products.filter((p) => {
    const status = (p.status ?? '').toUpperCase()
    return status === 'ATIVO' || status === 'EM_BREVE'
  })
}

/** Assinaturas — subset mínimo para contadores da Store (evita quebrar se campo extra mudar). */
export const storeAssinaturasRespostaSchema = z.object({
  assinaturas: z.array(
    z.object({
      produto: z.object({ slug_produto_gravity: z.string() }),
      configuracao: z
        .object({ ativo_configuracao_produto_gravity: z.boolean() })
        .nullable(),
    }),
  ),
})
