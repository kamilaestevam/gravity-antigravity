/**
 * lista-card-schemas.ts — Contrato Zod GET /api/v1/pedidos/lista/kpis
 */

import { z } from 'zod'

export const alertasBreakdownSchema = z.object({
  part_number_duplicado_item: z.number(),
  part_number_duplicado_resumo: z.number(),
  numero_pedido_duplicado: z.number(),
  divergencia_campos: z.number(),
  valor_total_divergente: z.number(),
  quantidade_total_divergente: z.number(),
  quantidade_pronta_divergente: z.number(),
  peso_liquido_divergente: z.number(),
  peso_bruto_divergente: z.number(),
  cubagem_divergente: z.number(),
})

export type AlertasBreakdownKpis = z.infer<typeof alertasBreakdownSchema>

export const listaCardKpisSchema = z.object({
  period: z.string(),
  total_pedidos: z.number(),
  total_itens: z.number(),
  valor_total: z.number(),
  valor_total_brl: z.number(),
  qtd_total: z.number(),
  qtd_atual_total: z.number(),
  itens_prontos: z.number(),
  qtd_transferida_total: z.number(),
  qtd_inicial_total: z.number(),
  valor_itens_total: z.number(),
  pedidos_atrasados: z.number(),
  pedidos_abertos: z.number(),
  pedidos_em_andamento: z.number(),
  cobertura_pendente: z.number(),
  alertas_total: z.number(),
  alertas_pedido: z.number(),
  alertas_item: z.number(),
  alertas_breakdown: alertasBreakdownSchema.optional(),
})

export type ListaCardKpis = z.infer<typeof listaCardKpisSchema>

export type CardPeriodoCodigo = '7d' | '30d' | '6m' | '1a' | 'tudo'

export const CARD_PERIODOS: CardPeriodoCodigo[] = ['7d', '30d', '6m', '1a', 'tudo']
