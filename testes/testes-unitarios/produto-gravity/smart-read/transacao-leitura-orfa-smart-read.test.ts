import { describe, expect, it } from 'vitest'
import { transacaoLeituraEhOrfaSmartRead } from '../../../../servicos-global/produto/smart-read/shared/transacao-leitura-orfa-smart-read'

describe('transacaoLeituraEhOrfaSmartRead', () => {
  it('identifica órfã pura (0 arquivos, 0 documentos, 0 campos)', () => {
    expect(
      transacaoLeituraEhOrfaSmartRead({
        total_arquivos: 0,
        total_documentos: 0,
        total_campos_extraidos: 0,
      }),
    ).toBe(true)
  })

  it('não classifica leitura com documentos extraídos como órfã', () => {
    expect(
      transacaoLeituraEhOrfaSmartRead({
        total_arquivos: 0,
        total_documentos: 2,
        total_campos_extraidos: 61,
      }),
    ).toBe(false)
  })

  it('não classifica leitura com arquivo como órfã', () => {
    expect(
      transacaoLeituraEhOrfaSmartRead({
        total_arquivos: 1,
        total_documentos: 0,
        total_campos_extraidos: 0,
      }),
    ).toBe(false)
  })
})
