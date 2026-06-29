import { describe, expect, it } from 'vitest'
import { gabiAgenteChatWidgetResponseSchema } from '../../../servicos-global/configurador/src/shared/contratos-gabi.js'

describe('gabiAgenteChatWidgetResponseSchema', () => {
  it('aceita resposta do agente v2 com conversationId e suggestions', () => {
    const parsed = gabiAgenteChatWidgetResponseSchema.parse({
      conversationId: 'conv_abc',
      response: 'Olá!',
      suggestions: ['Próximo passo?'],
      modelo: 'gemini-2.5-flash',
      tokens: { input: 1, output: 2, cached: 0 },
      custo_usd: 0,
      tools_chamadas: [],
      dados_alterados: false,
      confirmacoes_pendentes: [],
      erros_recentes: 0,
    })
    expect(parsed.conversationId).toBe('conv_abc')
    expect(parsed.response).toBe('Olá!')
  })
})
