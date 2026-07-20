import { describe, expect, it } from 'vitest'
import {
  escolherLeituraRetomarComConferenciaSmartRead,
  leituraTemConferenciaUsuarioSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/escolher-leitura-retomar-com-conferencia-smart-read.ts'

const leituraBase = {
  id_leitura: 'leit-1',
  nome_leitura: 'Teste',
  status_leitura: 'COMPLETED' as const,
  total_arquivos: 1,
  arquivos_processados: 1,
  arquivos: [
    {
      id_arquivo: 'arq-1',
      nome_arquivo: 'Invoice.pdf',
      status_arquivo: 'COMPLETED' as const,
      resultado_extracao: [
        {
          tipo_documento: 'INVOICE',
          dados: { total: '100', porto: 'Shanghai' },
        },
      ],
    },
  ],
}

describe('Smart Read — escolher leitura retomar com conferência', () => {
  it('detecta conferência quando há dados_original', () => {
    const leitura = {
      ...leituraBase,
      arquivos: [
        {
          ...leituraBase.arquivos[0],
          resultado_extracao: [
            {
              tipo_documento: 'INVOICE',
              dados_original: { total: '90' },
              dados: { total: '100' },
            },
          ],
        },
      ],
    }
    expect(leituraTemConferenciaUsuarioSmartRead(leitura)).toBe(true)
  })

  it('prioriza valores editados e tempo do progresso salvo', () => {
    const api = {
      ...leituraBase,
      tempo_processo_total_ms: 10_000,
      arquivos: [
        {
          ...leituraBase.arquivos[0],
          resultado_extracao: [
            {
              tipo_documento: 'INVOICE',
              dados: { total: '90', porto: 'Shenzhen' },
            },
          ],
        },
      ],
    }
    const salva = {
      ...leituraBase,
      tempo_processo_total_ms: 120_000,
      arquivos: [
        {
          ...leituraBase.arquivos[0],
          resultado_extracao: [
            {
              tipo_documento: 'INVOICE',
              dados_original: { total: '90', porto: 'Shenzhen' },
              dados: { total: '100', porto: 'Shanghai' },
            },
          ],
        },
      ],
    }

    const escolhida = escolherLeituraRetomarComConferenciaSmartRead(api, salva)
    const extracao = escolhida?.arquivos[0]?.resultado_extracao?.[0]

    expect(escolhida?.tempo_processo_total_ms).toBe(120_000)
    expect(extracao?.dados).toMatchObject({ total: '100', porto: 'Shanghai' })
    expect(extracao?.dados_original).toBeDefined()
  })
})
