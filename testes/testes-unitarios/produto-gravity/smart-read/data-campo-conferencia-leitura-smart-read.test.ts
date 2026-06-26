import { describe, expect, it } from 'vitest'
import {
  ehCampoDataConferenciaSmartRead,
  formatarDataConferenciaSmartRead,
  normalizarValorDataConferenciaParaIso,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/data-campo-conferencia-leitura-smart-read.ts'

describe('Smart Read — data campo conferência', () => {
  it('detecta chaves de data pelo sufixo Date', () => {
    expect(ehCampoDataConferenciaSmartRead('document.documentDate')).toBe(true)
    expect(ehCampoDataConferenciaSmartRead('document.shippedOnBoardDate')).toBe(true)
    expect(ehCampoDataConferenciaSmartRead('document.documentNumber')).toBe(false)
  })

  it('normaliza ISO e formatos comuns para yyyy-mm-dd', () => {
    expect(normalizarValorDataConferenciaParaIso('2026-06-25')).toBe('2026-06-25')
    expect(normalizarValorDataConferenciaParaIso('25/06/2026')).toBe('2026-06-25')
    expect(normalizarValorDataConferenciaParaIso('25.06.2026')).toBe('2026-06-25')
    expect(normalizarValorDataConferenciaParaIso('2026-06-25T12:00:00.000Z')).toBe('2026-06-25')
  })

  it('exibe data em pt-BR sem deslocamento de fuso', () => {
    expect(formatarDataConferenciaSmartRead('2026-06-25')).toBe('25/06/2026')
    expect(formatarDataConferenciaSmartRead('25/06/2026')).toBe('25/06/2026')
  })
})
