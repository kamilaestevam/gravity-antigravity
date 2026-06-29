import { describe, expect, it } from 'vitest'
import { normalizarHistoricoGemini } from '../../../servicos-global/servicos-plataforma/gabi/server/lib/historico-gemini.js'

describe('normalizarHistoricoGemini', () => {
  it('remove turnos model iniciais e mapeia assistant para model', () => {
    const result = normalizarHistoricoGemini([
      { role: 'assistant', content: 'resposta orfa' },
      { role: 'user', content: 'ola' },
      { role: 'assistant', content: 'oi' },
    ])

    expect(result).toEqual([
      { role: 'user', parts: [{ text: 'ola' }] },
      { role: 'model', parts: [{ text: 'oi' }] },
    ])
  })

  it('ignora mensagens system', () => {
    const result = normalizarHistoricoGemini([
      { role: 'system', content: 'ctx' },
      { role: 'user', content: 'pergunta' },
    ])

    expect(result).toEqual([{ role: 'user', parts: [{ text: 'pergunta' }] }])
  })
})
