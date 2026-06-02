import { z } from 'zod'

export const visaoGeralAgregadoResponseSchema = z.object({
  data: z.object({
    total: z.number(),
    kpis: z.object({
      andamento_count: z.number(),
      andamento_valor: z.number(),
      concluido_count: z.number(),
      concluido_valor: z.number(),
      valor_total: z.number(),
      ticket_medio: z.number(),
      taxa_atraso_pct: z.number(),
      atrasados_count: z.number(),
    }),
    aprovacao: z.object({
      percentual_em_tempo: z.number(),
      percentual_atraso: z.number(),
      nao_respondidas: z.number(),
    }),
    mensal: z.array(z.object({
      mes: z.string(),
      aprovadas: z.number(),
      andamento: z.number(),
      recusadas: z.number(),
    })),
    modal: z.array(z.object({
      key: z.string(),
      label: z.string(),
      count: z.number(),
      pct: z.number(),
      cor: z.string(),
    })),
    funil: z.array(z.object({
      label: z.string(),
      count: z.number(),
      color: z.string(),
    })),
    incoterms: z.array(z.object({
      incoterm: z.string(),
      count: z.number(),
      pct: z.number(),
    })),
    alertas: z.array(z.object({
      tipo: z.string(),
      count: z.number(),
      cor: z.string(),
    })),
    moedas: z.array(z.object({
      codigo: z.string(),
      quantidade: z.number(),
      pct: z.number(),
    })),
    sparkAndamento: z.array(z.number()),
    sparkConcluido: z.array(z.number()),
    maiorPedido: z.object({
      numero: z.string(),
      valor: z.number(),
      moeda: z.string(),
    }).nullable(),
  }),
})

export type VisaoGeralAgregadoPayload = z.infer<typeof visaoGeralAgregadoResponseSchema>['data']
