import { describe, expect, it } from 'vitest'
import { gabiChatS2sResponseSchema } from '../../../../servicos-global/produto/pedido/server/src/contracts/gabi-responses.js'

describe('gabiChatS2sResponseSchema', () => {
  it('aceita response do POST /api/v1/gabi/chats', () => {
    const parsed = gabiChatS2sResponseSchema.parse({
      response: 'Há 12 pedidos atrasados.',
      suggestions: [],
      model: 'gemini-2.5-flash',
      tokens: { input: 10, output: 20, cached: 0 },
      cost_usd: 0.001,
      actions_performed: [],
      data_changed: false,
    })
    expect(parsed.response).toBe('Há 12 pedidos atrasados.')
  })

  it('rejeita payload legado mensagem/resposta', () => {
    const parsed = gabiChatS2sResponseSchema.safeParse({ resposta: 'texto' })
    expect(parsed.success).toBe(false)
  })
})
