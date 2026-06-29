import { z } from 'zod'

/** Contrato widget Hub — POST /api/v1/gabi/agente/chat (bilateral com agente.ts). */
export const gabiAgenteChatWidgetResponseSchema = z.object({
  conversationId: z.string().optional(),
  response: z.string(),
  suggestions: z.array(z.string()).optional(),
  modelo: z.string().optional(),
  tokens: z
    .object({
      input: z.number(),
      output: z.number(),
      cached: z.number(),
    })
    .optional(),
  custo_usd: z.number().optional(),
  tools_chamadas: z.array(z.unknown()).optional(),
  dados_alterados: z.boolean().optional(),
  confirmacoes_pendentes: z.array(z.unknown()).optional(),
  erros_recentes: z.number().optional(),
})

export type GabiAgenteChatWidgetResponse = z.infer<typeof gabiAgenteChatWidgetResponseSchema>
