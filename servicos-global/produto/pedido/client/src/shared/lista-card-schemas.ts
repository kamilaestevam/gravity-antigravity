/**
 * lista-card-schemas.ts — Contrato Zod GET /api/v1/pedidos/lista/kpis
 */

import { z } from 'zod'

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
})

export type ListaCardKpis = z.infer<typeof listaCardKpisSchema>

export type CardPeriodoCodigo = '7d' | '30d' | '6m' | '1a' | 'tudo'

export const CARD_PERIODOS: CardPeriodoCodigo[] = ['7d', '30d', '6m', '1a', 'tudo']
