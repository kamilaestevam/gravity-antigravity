import { describe, expect, it } from 'vitest'
import {
  caminhoEhCampoPortoConferenciaLeituraSmartRead,
  valoresEquivalentesCampoConferenciaLeituraSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/equivalencias-campo-conferencia-leitura-smart-read.ts'
import { normalizarValorComparacaoCampoLeituraSmartRead } from '../../../../servicos-global/produto/smart-read/shared/normalizar-valor-comparacao-campo-leitura-smart-read.ts'

describe('Smart Read — equivalências campo conferência', () => {
  it('normaliza acento e caixa', () => {
    expect(normalizarValorComparacaoCampoLeituraSmartRead('  Itajaí ')).toBe('itajai')
  })

  it('reconhece caminho de porto', () => {
    expect(caminhoEhCampoPortoConferenciaLeituraSmartRead('shipment.port_of_destination')).toBe(true)
    expect(caminhoEhCampoPortoConferenciaLeituraSmartRead('exporter.name')).toBe(false)
  })

  it('equivalencia ITJ e Itajaí no mesmo grupo', () => {
    expect(
      valoresEquivalentesCampoConferenciaLeituraSmartRead(
        'shipment.port_of_destination',
        'ITJ',
        'Itajaí',
      ),
    ).toBe(true)
  })

  it('não equivale portos diferentes', () => {
    expect(
      valoresEquivalentesCampoConferenciaLeituraSmartRead(
        'shipment.port_of_destination',
        'ITJ',
        'Santos',
      ),
    ).toBe(false)
  })
})
