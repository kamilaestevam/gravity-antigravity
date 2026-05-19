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

// ── Schemas V2 (agente com function calling) ───────────────────────────────

export const gabiToolCallLogSchema = z.object({
  tool_id: z.string(),
  sucesso: z.boolean(),
  duracao_ms: z.number(),
  aguardando_confirmacao: z.boolean().optional(),
  nonce: z.string().optional(),
  descricao_acao: z.string().optional(),
})

export type GabiToolCallLog = z.infer<typeof gabiToolCallLogSchema>

export const gabiConfirmacaoPendenteSchema = z.object({
  nonce: z.string(),
  tool_id: z.string(),
  descricao_acao: z.string(),
  classe: z.string(),
  expira_em: z.string(),
})

export type GabiConfirmacaoPendente = z.infer<typeof gabiConfirmacaoPendenteSchema>

export const gabiAgenteChatResponseSchema = z.object({
  response: z.string(),
  modelo: z.string(),
  tokens: z.object({
    input: z.number(),
    output: z.number(),
    cached: z.number(),
  }),
  custo_usd: z.number(),
  tools_chamadas: z.array(gabiToolCallLogSchema),
  dados_alterados: z.boolean(),
  confirmacoes_pendentes: z.array(gabiConfirmacaoPendenteSchema),
  erros_recentes: z.number(),
})

export type GabiAgenteChatResponse = z.infer<typeof gabiAgenteChatResponseSchema>

export const gabiConfirmarAcaoResponseSchema = z.object({
  sucesso: z.boolean(),
  dados: z.unknown().optional(),
})

export type GabiConfirmarAcaoResponse = z.infer<typeof gabiConfirmarAcaoResponseSchema>
