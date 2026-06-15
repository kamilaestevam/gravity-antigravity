/**
 * Schemas Zod — GET /api/v1/bid-frete-internacional/dashboard/insights (GABI Fase 1)
 */

import { z } from 'zod'

export const gabiInsightItemSchema = z.object({
  id: z.string(),
  variante: z.enum(['default', 'warn']),
  tag: z.string(),
  texto: z.string(),
  stat: z.object({ label: z.string(), valor: z.string() }).optional(),
  textoLink: z.string().optional(),
  rota: z.string().optional(),
})

export const dashboardInsightsResponseSchema = z.object({
  period: z.string(),
  role: z.string(),
  insights: z.array(gabiInsightItemSchema),
})

export type DashboardInsightsResponseParsed = z.infer<typeof dashboardInsightsResponseSchema>
