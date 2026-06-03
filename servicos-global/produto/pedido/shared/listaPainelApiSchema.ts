/**
 * Contrato Zod bilateral — respostas de /lista/paineis (Pedido).
 */
import { z } from 'zod'

export const listaPainelSchema = z.object({
  id:                 z.string(),
  tenant_id:          z.string(),
  user_id:            z.string(),
  id_produto_gravity: z.string(),
  nome:               z.string(),
  ordem:              z.number(),
  is_visivel:         z.boolean(),
  config_json:        z.string(),
  created_at:         z.union([z.string(), z.coerce.string()]),
  updated_at:         z.union([z.string(), z.coerce.string()]),
})

export const listaPainelListResponseSchema = z.object({
  data: z.array(listaPainelSchema),
})

export const listaPainelItemResponseSchema = z.object({
  data: listaPainelSchema,
})

export const listaPainelReordenarResponseSchema = z.object({
  data: z.object({ reordenado: z.literal(true) }),
})

export const listaPainelDeletarResponseSchema = z.object({
  data: z.object({ deletado: z.literal(true) }),
})

export type ListaPainel = z.infer<typeof listaPainelSchema>
