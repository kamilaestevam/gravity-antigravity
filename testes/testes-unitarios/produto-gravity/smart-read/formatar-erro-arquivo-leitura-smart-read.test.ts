import { describe, expect, it } from 'vitest'
import {
  AVISO_SEM_COBRANCA_ERRO_ARQUIVO_LEITURA_SMART_READ,
  interpretarErroArquivoLeituraSmartRead,
  TITULO_ERRO_ARQUIVO_LEITURA_SMART_READ,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/formatar-erro-arquivo-leitura-smart-read.js'

describe('Smart Read — interpretar erro arquivo Nova Leitura', () => {
  it('mapeia soffice ausente para mensagem amigável e aviso de não cobrança', () => {
    const erro = interpretarErroArquivoLeituraSmartRead(
      'Smart Read legado respondeu 422: {"message":"Error to convert Excel to PDF: Error: Could not find soffice binary"}',
    )
    expect(erro.titulo).toBe(TITULO_ERRO_ARQUIVO_LEITURA_SMART_READ)
    expect(erro.motivo).toContain('Excel')
    expect(erro.aviso_sem_cobranca).toBe(AVISO_SEM_COBRANCA_ERRO_ARQUIVO_LEITURA_SMART_READ)
    expect(erro.motivo).not.toContain('soffice')
  })

  it('mapeia xls inválido como zip', () => {
    const erro = interpretarErroArquivoLeituraSmartRead(
      "Smart Read legado respondeu 422: Can't find end of central directory : is this a zip file",
    )
    expect(erro.motivo).toContain('.xls')
  })

  it('mapeia 403 xml', () => {
    const erro = interpretarErroArquivoLeituraSmartRead(
      'Smart Read legado respondeu 403: <html><title>403 Forbidden</title></html>',
    )
    expect(erro.motivo).toContain('XML')
  })
})
