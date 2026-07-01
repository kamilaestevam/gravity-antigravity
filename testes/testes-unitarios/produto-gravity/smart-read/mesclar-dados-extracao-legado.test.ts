import { describe, expect, it } from 'vitest'
import {
  mesclarDadosExtracaoLegado,
  normalizarLinhaItemInvoiceConferencia,
  prepararDadosConferenciaLeitura,
  valorCampoExtracaoLegadoPreenchido,
} from '../../../../servicos-global/produto/smart-read/shared/mesclar-dados-extracao-legado-smart-read.ts'

describe('mesclar-dados-extracao-legado-smart-read', () => {
  it('trata placeholder literal "ncm" como vazio', () => {
    expect(valorCampoExtracaoLegadoPreenchido('ncm')).toBe(false)
    expect(valorCampoExtracaoLegadoPreenchido('8413.9100')).toBe(true)
  })

  it('preenche items[].ncm vazio a partir do processingResult (IA)', () => {
    const final = {
      document: { documentNumber: '2250090' },
      items: [{ partNumber: '3100N025201DK19', ncm: '', manufacturer: '' }],
    }
    const ia = {
      document: { documentNumber: '2250090' },
      items: [
        {
          partNumber: '3100N025201DK19',
          ncm: '8413.9100',
          manufacturer: 'PERONI POMPE SpA',
          originCountry: 'ITALY',
        },
      ],
    }

    const mesclado = mesclarDadosExtracaoLegado(final, ia)
    const item = (mesclado.items as Record<string, unknown>[])[0]
    expect(item?.ncm).toBe('8413.9100')
    expect(item?.manufacturer).toBe('PERONI POMPE SpA')
    expect(item?.originCountry).toBe('ITALY')
  })

  it('copia hsCode para ncm quando ncm ausente (paridade DATI)', () => {
    const linha = normalizarLinhaItemInvoiceConferencia({
      partNumber: '3100N025201DK19',
      hsCode: '8413.9100',
    })
    expect(linha.ncm).toBe('8413.9100')
  })

  it('prepararDadosConferenciaLeitura normaliza todos os itens', () => {
    const preparado = prepararDadosConferenciaLeitura({
      items: [{ ncm: 'ncm', hsCode: '8413.9100' }],
    })
    const item = (preparado.items as Record<string, unknown>[])[0]
    expect(item?.ncm).toBe('8413.9100')
  })
})
