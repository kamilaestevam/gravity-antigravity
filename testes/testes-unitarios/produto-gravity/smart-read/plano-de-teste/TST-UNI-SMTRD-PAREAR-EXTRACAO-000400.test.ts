// TST-UNI-SMTRD-PAREAR-EXTRACAO-000400
// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parearResultadoExtracaoLegado } from '../../../../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read.ts'

describe('TST-UNI-SMTRD-PAREAR-EXTRACAO-000400', () => {
  it('U01: usa processingResult quando não há finalProcessingResult', () => {
    const resultado = parearResultadoExtracaoLegado({
      processingResult: [
        {
          id: 1,
          fileType: 'Invoice',
          data: { document: { documentNumber: 'CI-2026' }, exporter: { name: 'ABC' } },
        },
      ],
    })

    expect(resultado).toHaveLength(1)
    expect(resultado?.[0]?.dados).toEqual({
      document: { documentNumber: 'CI-2026' },
      exporter: { name: 'ABC' },
    })
    expect(resultado?.[0]?.dados_original).toBeUndefined()
  })

  it('U02: mescla final vazio com IA (items[].ncm preenchido)', () => {
    const resultado = parearResultadoExtracaoLegado({
      processingResult: [
        {
          id: 1,
          fileType: 'Invoice',
          data: {
            document: { documentNumber: '2250090' },
            items: [{ partNumber: 'PRM-8842-A', ncm: '8471.30.19', manufacturer: 'Fab IA' }],
          },
        },
      ],
      finalProcessingResult: [
        {
          id: 1,
          fileType: 'Invoice',
          data: {
            document: { documentNumber: '2250090' },
            items: [{ partNumber: 'PRM-8842-A', ncm: '', manufacturer: '' }],
          },
        },
      ],
    })

    const item = resultado?.[0]
    expect(item?.dados).toMatchObject({
      items: [{ partNumber: 'PRM-8842-A', ncm: '8471.30.19', manufacturer: 'Fab IA' }],
    })
    expect(item?.dados_original).toEqual({
      document: { documentNumber: '2250090' },
      items: [{ partNumber: 'PRM-8842-A', ncm: '8471.30.19', manufacturer: 'Fab IA' }],
    })
  })

  it('U03: retorna null sem resultados', () => {
    expect(parearResultadoExtracaoLegado({})).toBeNull()
  })
})
