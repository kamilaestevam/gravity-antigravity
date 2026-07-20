/**
 * dashboard-queries-zod-estimativa-custo.ts — Contratos Zod das queries de dashboard.
 */
import { z } from 'zod'

export const METRICAS_DASHBOARD_ESTIMATIVA_CUSTO = [
  'custo_nacionalizado_medio',
  'estimativas_ativas',
  'total_tributos_medio',
  'tributos_breakdown',
  'ptax_media',
  'volume_mensal',
] as const

export const WidgetsDashboardEstimativaCustoSchema = z.object({
  metricas: z.array(z.enum(METRICAS_DASHBOARD_ESTIMATIVA_CUSTO)).min(1),
  filtros: z.object({ periodo: z.string().default('30d') }).default({ periodo: '30d' }),
})
