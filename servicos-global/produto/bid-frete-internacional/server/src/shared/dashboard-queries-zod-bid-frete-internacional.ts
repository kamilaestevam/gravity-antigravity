/**
 * Schemas Zod — query params das rotas dashboard Insights (BID Frete Internacional).
 */

import { z } from 'zod'

export const statusCotacaoCanonicoBidFreteSchema = z.enum([
  'RASCUNHO',
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'REPROVADA',
  'CANCELADA',
  'FALTA_INFORMACAO',
  'EXPIRADA',
])

const dataReferenciaIsoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'data_referencia deve ser YYYY-MM-DD')

export const dashboardKpisQuerySchema = z.object({
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  status_slug_kpi_andamento: statusCotacaoCanonicoBidFreteSchema.optional(),
})

export const insightsAlertasQuerySchema = z.object({
  data_referencia: dataReferenciaIsoSchema.optional(),
})

export const insightsDetalheQuerySchema = z.object({
  contexto: z.enum(['vence_hoje', 'resposta', 'aprovacao', 'nova', 'rota']),
  codigo_origem: z.string().trim().max(20).optional(),
  codigo_destino: z.string().trim().max(20).optional(),
  modal_cotacao_bid_frete_internacional: z.enum(['MARITIMO', 'AEREO', 'RODOVIARIO']).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  data_referencia: dataReferenciaIsoSchema.optional(),
  status_slugs: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((valor) => {
      if (!valor) return undefined
      const slugs = valor
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length <= 50)
      return slugs.length > 0 ? slugs : undefined
    }),
})

export function parseDataReferenciaInsights(dataReferencia?: string): Date {
  if (dataReferencia) {
    const referencia = new Date(`${dataReferencia}T12:00:00`)
    if (!Number.isNaN(referencia.getTime())) return referencia
  }
  return new Date()
}
