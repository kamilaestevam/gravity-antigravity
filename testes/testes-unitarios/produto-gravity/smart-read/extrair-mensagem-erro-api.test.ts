import { describe, expect, it } from 'vitest'
import { extrairMensagemErroCorpo } from '../../../../servicos-global/produto/smart-read/client/src/shared/extrair-mensagem-erro-api.js'
import { extrairMensagemErroRespostaConfigurador } from '../../../../servicos-global/produto/smart-read/server/src/lib/extrair-mensagem-erro-resposta.js'

describe('Smart Read — extração de mensagem de erro API', () => {
  it('extrai error.message do formato AppError do Configurador', () => {
    const corpo = {
      error: {
        code: 'ORGANIZACAO_SEM_VINCULO',
        message: 'Organização sem vínculo com o Smart Read legado',
        correlationId: 'abc',
      },
    }
    expect(extrairMensagemErroCorpo(corpo)).toBe('Organização sem vínculo com o Smart Read legado')
    expect(extrairMensagemErroRespostaConfigurador(corpo, 'fallback')).toBe(
      'Organização sem vínculo com o Smart Read legado',
    )
  })

  it('não converte error objeto em [object Object]', () => {
    const corpo = {
      error: {
        code: 'ORGANIZACAO_SEM_VINCULO',
        message: 'Mensagem legível',
      },
    }
    const msg = extrairMensagemErroRespostaConfigurador(corpo, 'fallback')
    expect(msg).not.toContain('[object Object]')
    expect(msg).toBe('Mensagem legível')
  })

  it('aceita error string (proxy legado)', () => {
    expect(extrairMensagemErroCorpo({ error: 'Smart Read service unavailable' })).toBe(
      'Smart Read service unavailable',
    )
  })
})
