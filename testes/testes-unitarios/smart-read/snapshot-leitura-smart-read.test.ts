import { describe, expect, it } from 'vitest'
import {
  leituraDeRegistroSnapshot,
  leituraElegivelParaSnapshot,
} from '../../../servicos-global/produto/smart-read/server/src/lib/snapshot-leitura-smart-read.ts'
import type { Leitura } from '../../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read.ts'

const leituraCompleta: Leitura = {
  id_leitura: 'leitura-teste-001',
  nome_leitura: 'Invoice teste',
  status_leitura: 'COMPLETED',
  total_arquivos: 1,
  arquivos_processados: 1,
  arquivos: [
    {
      id_arquivo: 'arq-1',
      nome_arquivo: 'invoice.pdf',
      status_arquivo: 'COMPLETED',
      resultado_extracao: [{ tipo_documento: 'invoice', dados: { numero: '123' } }],
    },
  ],
}

describe('snapshot-leitura-smart-read', () => {
  it('leituraElegivelParaSnapshot aceita COMPLETED com extracao', () => {
    expect(leituraElegivelParaSnapshot(leituraCompleta)).toBe(true)
  })

  it('leituraElegivelParaSnapshot rejeita PROCESSING sem extracao', () => {
    expect(
      leituraElegivelParaSnapshot({
        ...leituraCompleta,
        status_leitura: 'PROCESSING',
        arquivos: [{ ...leituraCompleta.arquivos[0], resultado_extracao: null }],
      }),
    ).toBe(false)
  })

  it('leituraDeRegistroSnapshot valida payload JSON', () => {
    const leitura = leituraDeRegistroSnapshot({
      dados_extracao_snapshot_leitura_smart_read: leituraCompleta,
      data_envio_snapshot_leitura_smart_read: new Date('2026-06-23T12:00:00.000Z'),
      origem_leitura_snapshot_leitura_smart_read: 'INTERFACE',
      mensagem_erro_snapshot_leitura_smart_read: null,
    })
    expect(leitura?.id_leitura).toBe('leitura-teste-001')
  })
})
