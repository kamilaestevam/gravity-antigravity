/**
 * Contrato Zod bilateral — respostas de /dashboard/paineis (BID Frete Internacional).
 */
import { z } from 'zod'

export const dashboardPainelSchema = z.object({
  id:           z.string(),
  tenant_id:    z.string(),
  user_id:      z.string(),
  nome:         z.string(),
  ordem:        z.coerce.number(),
  is_visivel:   z.coerce.boolean(),
  widgets_json: z.string(),
  created_at:   z.union([z.string(), z.coerce.string()]),
  updated_at:   z.union([z.string(), z.coerce.string()]),
})

export const dashboardPainelListResponseSchema = z.object({
  data: z.array(dashboardPainelSchema),
})

export const dashboardPainelItemResponseSchema = z.object({
  data: dashboardPainelSchema,
})

export const dashboardPainelReordenarResponseSchema = z.object({
  data: z.object({ reordenado: z.boolean() }),
})

export const dashboardPainelDeletarResponseSchema = z.object({
  data: z.object({ deletado: z.boolean() }),
})

export type DashboardPainelApi = z.infer<typeof dashboardPainelSchema>
