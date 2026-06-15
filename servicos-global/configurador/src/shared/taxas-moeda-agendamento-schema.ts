import { z } from 'zod'

/** Espelho de `taxaMoedaAgendamentoResponseSchema` no backend (Mandamento 09). */
export const taxaMoedaAgendamentoResponseSchema = z.object({
  tipo: z.enum(['ptax', 'focus']),
  ativo: z.boolean(),
  frequencia: z.enum(['Manual', 'Diario', 'Semanal']),
  hora: z.number(),
  minuto: z.number(),
  alertas: z.array(z.object({
    id: z.string(),
    nome: z.string(),
    contato: z.string(),
    condicao: z.string(),
    canal: z.string(),
  })),
  ultima_execucao: z.string().nullable(),
  atualizado_em: z.string(),
  horarios_ptax_brt: z.array(z.number()).optional(),
})

export type TaxaMoedaAgendamentoResponse = z.infer<typeof taxaMoedaAgendamentoResponseSchema>

/** Horários fixos BCB/PTAX — não configuráveis pelo usuário. */
export const PTAX_HORARIOS_BRT_UI = [10, 11, 12, 13] as const
export const PTAX_MINUTO_BRT_UI = 3
