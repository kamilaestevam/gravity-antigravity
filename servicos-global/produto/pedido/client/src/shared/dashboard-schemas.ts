/**
 * dashboard-schemas.ts — Schemas Zod das respostas da API de dashboard do Pedido
 *
 * Mandamentos 06 + 09: toda resposta de API consumida pelo dashboard passa por
 * schema.parse() antes de virar tipo. Schema é o contrato bilateral — se o
 * backend mudar payload, atualizar AQUI no mesmo commit.
 *
 * Origem dos campos: servicos-global/produto/pedido/server/src/routes/dashboard-pedido-dados.ts
 *
 * Endpoints cobertos:
 *   GET /api/v1/pedidos/dashboard/bundle          -> dashboardBundleResponseSchema
 *   GET /api/v1/pedidos/dashboard/kpis          -> dashboardKpisSchema
 *   GET /api/v1/pedidos/dashboard/tendencia     -> dashboardTrendResponseSchema
 *   GET /api/v1/pedidos/dashboard/distribuicao  -> dashboardDistributionResponseSchema
 *   GET /api/v1/pedidos/dashboard/insights      -> dashboardInsightsResponseSchema
 */

import { z } from 'zod'

// ── /kpis ─────────────────────────────────────────────────────────────────────

export const dashboardKpisSchema = z
  .object({
    period: z.string(),

    // Contagens por status
    total_pedidos:           z.number(),
    pedidos_abertos:         z.number(),
    pedidos_em_andamento:    z.number(),
    pedidos_consolidados:    z.number(),
    pedidos_cancelados:      z.number(),
    pedidos_rascunho:        z.number(),
    pedidos_atrasados:       z.number(),
    pedidos_sem_exportador:  z.number(),
    pedidos_importacao:      z.number(),
    pedidos_exportacao:      z.number(),

    // Financeiro
    valor_total:        z.number(),
    valor_total_brl:    z.number(),
    moedas_sem_taxa:    z.array(z.string()),
    cobertura_pendente: z.number(),
    qtd_total:          z.number(),
    ticket_medio:       z.number(),

    // Itens (agregados de PedidoItem)
    itens_prontos:         z.number(),
    qtd_inicial_total:     z.number(),
    qtd_atual_total:       z.number(),
    qtd_transferida_total: z.number(),
    valor_itens_total:     z.number(),

    // Derivadas pré-computadas
    taxa_atraso:          z.number(),
    taxa_conclusao_itens: z.number(),
    exposicao_financeira: z.number(),
    taxa_transferencia:   z.number(),

    // Completude documental
    pedidos_sem_incoterm:   z.number(),
    pedidos_sem_fabricante: z.number(),
    pedidos_sem_proforma:   z.number(),
    pedidos_sem_invoice:    z.number(),
    pedidos_sem_ref_imp:    z.number(),

    // Moedas e logística
    moedas_distintas: z.number(),
    peso_bruto_total: z.number(),
    cubagem_total:    z.number(),

    // Itens — cobertura cambial e cancelamentos
    itens_sem_cobertura: z.number(),
    qtd_cancelada_total: z.number(),
  })
  // Campos extras (ex: derivados futuros) tolerados sem quebrar parse.
  // Mantém compatível com o `[key: string]: number | string | string[]` da interface DashboardKpis.
  .passthrough()

export type DashboardKpisParsed = z.infer<typeof dashboardKpisSchema>

// ── /tendencia ────────────────────────────────────────────────────────────────

export const dashboardTrendBucketSchema = z
  .object({
    month:              z.string(),
    label:              z.string(),
    total_pedidos:      z.number(),
    valor_total:        z.number(),
    cobertura_pendente: z.number(),
    valor_itens_total:  z.number(),
  })
  .passthrough()

export const dashboardTrendResponseSchema = z.object({
  period:      z.string(),
  granularity: z.string(),
  value:       z.array(dashboardTrendBucketSchema),
})

export type DashboardTrendResponseParsed = z.infer<typeof dashboardTrendResponseSchema>

// ── /bundle ───────────────────────────────────────────────────────────────────

export const dashboardBundleResponseSchema = z.object({
  period:      z.string(),
  kpis:        dashboardKpisSchema,
  prev_kpis:   dashboardKpisSchema.nullable(),
  trend:       dashboardTrendResponseSchema,
  cached:      z.boolean(),
  computed_at: z.string(),
})

export type DashboardBundleResponseParsed = z.infer<typeof dashboardBundleResponseSchema>

// ── /distribuicao ─────────────────────────────────────────────────────────────

export const dashboardDistributionGroupSchema = z.object({
  status:      z.string(),
  count:       z.number(),
  valor_total: z.number(),
})

export const dashboardDistributionResponseSchema = z.object({
  period: z.string(),
  value:  z.array(dashboardDistributionGroupSchema),
})

export type DashboardDistributionResponseParsed = z.infer<typeof dashboardDistributionResponseSchema>

// ── /insights ─────────────────────────────────────────────────────────────────

export const gabiInsightItemSchema = z.object({
  id:        z.string(),
  variante:  z.enum(['default', 'warn']),
  tag:       z.string(),
  texto:     z.string(),
  stat:      z.object({ label: z.string(), valor: z.string() }).optional(),
  textoLink: z.string().optional(),
  rota:      z.string().optional(),
})

export const dashboardInsightsResponseSchema = z.object({
  period:   z.string(),
  role:     z.string(),
  insights: z.array(gabiInsightItemSchema),
})

export type DashboardInsightsResponseParsed = z.infer<typeof dashboardInsightsResponseSchema>
