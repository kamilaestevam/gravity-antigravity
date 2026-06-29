import { z } from 'zod'

/** Contrato mínimo POST /api/v1/gabi/chats (S2S Pedido insights Fase 3). */
export const gabiChatS2sResponseSchema = z.object({
  response: z.string(),
})

export type GabiChatS2sResponse = z.infer<typeof gabiChatS2sResponseSchema>

/** Contrato POST /api/v1/gabi/ajuda-campo (field icon ✦). */
export const gabiFieldHelpResponseSchema = z.object({
  titulo: z.string().optional(),
  texto: z.string(),
  exemplo: z.string().optional(),
  quota: z
    .object({
      tokens_usados: z.number(),
      tokens_contratados: z.number(),
      tokens_saldo: z.number(),
      quota_mensal: z.number(),
      percentual: z.number(),
      mes_ref: z.string(),
    })
    .optional(),
})

export type GabiFieldHelpResponse = z.infer<typeof gabiFieldHelpResponseSchema>
