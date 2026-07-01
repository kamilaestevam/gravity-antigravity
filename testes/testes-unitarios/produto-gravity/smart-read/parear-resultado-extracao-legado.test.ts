import { describe, expect, it } from 'vitest'
import { parearResultadoExtracaoLegado } from '../../../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read.ts'

describe('parearResultadoExtracaoLegado', () => {
  it('mescla campos vazios do final com valores do processingResult', () => {
    const resultado = parearResultadoExtracaoLegado({
      processingResult: [
        {
          id: '1',
          fileType: 'Invoice',
          data: {
            items: [{ partNumber: '3100N025201DK19', ncm: '8413.9100' }],
          },
        },
      ],
      finalProcessingResult: [
        {
          id: '1',
          fileType: 'Invoice',
          data: {
            items: [{ partNumber: '3100N025201DK19', ncm: '' }],
          },
        },
      ],
    })

    expect(resultado?.[0]?.dados.items).toEqual([
      { partNumber: '3100N025201DK19', ncm: '8413.9100' },
    ])
    expect(resultado?.[0]?.dados_original).toBeDefined()
  })
})
