import { z } from 'zod'

const produtoWorkspaceCatalogoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  status: z.string(),
}).nullable()

const produtoWorkspaceItemSchema = z.object({
  id: z.string(),
  product_key: z.string().min(1),
  is_active: z.boolean(),
  activated_at: z.union([z.string(), z.date()]),
  catalog: produtoWorkspaceCatalogoSchema,
})

/** Contrato GET /api/v1/workspaces/:id_workspace/produtos-gravity (Configurador). */
export const produtosWorkspaceResponseSchema = z.object({
  products: z.array(produtoWorkspaceItemSchema),
})

export type ProdutosWorkspaceResponse = z.infer<typeof produtosWorkspaceResponseSchema>
