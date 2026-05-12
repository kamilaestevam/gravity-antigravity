// Schemas Zod compartilhados — contrato bilateral (Mandamento 09)
import { z } from 'zod'

export const gabiChatResponseSchema = z.object({
  response: z.string(),
  suggestions: z.array(z.string()),
  model: z.string(),
  tokens: z.object({
    input: z.number(),
    output: z.number(),
    cached: z.number(),
  }),
  cost_usd: z.number(),
  actions_performed: z.array(z.object({
    tool: z.string(),
    success: z.boolean(),
    id: z.string().optional(),
  })),
  data_changed: z.boolean(),
})

export type GabiChatResponse = z.infer<typeof gabiChatResponseSchema>

export const gabiChatStreamEventSchema = z.object({
  type: z.string(),
  content: z.string().optional(),
  suggestions: z.array(z.string()).optional(),
  model: z.string().optional(),
  cost: z.number().optional(),
  cached_tokens: z.number().optional(),
  actions_performed: z.array(z.object({
    tool: z.string(),
    success: z.boolean(),
    id: z.string().optional(),
  })).optional(),
  data_changed: z.boolean().optional(),
  error: z.string().optional(),
})

export type GabiChatStreamEvent = z.infer<typeof gabiChatStreamEventSchema>
