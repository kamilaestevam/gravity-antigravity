import { describe, expect, it } from 'vitest'
import {
  mapearOrigemLeitura,
  mesclarOrigemLeituraTransacao,
  mesclarTransacaoNaLista,
} from '../../../servicos-global/produto/smart-read/server/src/lib/normalizar-transacao-leitura-smart-read.ts'
import type { TransacaoLeitura } from '../../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read.ts'

function transacaoBase(parcial: Partial<TransacaoLeitura> & Pick<TransacaoLeitura, 'id_leitura'>): TransacaoLeitura {
  return {
    id_leitura: parcial.id_leitura,
    nome_leitura: parcial.nome_leitura ?? 'Leitura teste',
    status_leitura: parcial.status_leitura ?? 'COMPLETED',
    total_arquivos: parcial.total_arquivos ?? 1,
    media_acertos: 'media_acertos' in parcial ? parcial.media_acertos ?? null : 0.9,
    data_envio: parcial.data_envio ?? '2026-06-23T12:00:00.000Z',
    origem_leitura: parcial.origem_leitura ?? 'INTERFACE',
    nome_arquivo: parcial.nome_arquivo ?? 'doc.pdf',
    mensagem_erro: parcial.mensagem_erro ?? null,
    total_documentos: parcial.total_documentos ?? 1,
    total_campos_extraidos: parcial.total_campos_extraidos ?? 10,
    total_campos_corretos: parcial.total_campos_corretos ?? 9,
    total_campos_errados: parcial.total_campos_errados ?? 1,
    tipos_documento: parcial.tipos_documento ?? 'Invoice',
    numeros_documento: parcial.numeros_documento ?? 'INV-1',
    tempo_extracao_ia_ms: parcial.tempo_extracao_ia_ms ?? 1000,
    tempo_processo_total_ms: parcial.tempo_processo_total_ms ?? 2000,
    saving_total_minutos: 'saving_total_minutos' in parcial ? parcial.saving_total_minutos ?? null : 5,
    saving_total_brl: 'saving_total_brl' in parcial ? parcial.saving_total_brl ?? null : 50,
  }
}

describe('mapearOrigemLeitura', () => {
  it('mapeia source api e external para API', () => {
    expect(mapearOrigemLeitura('api')).toBe('API')
    expect(mapearOrigemLeitura('API_COCKPIT')).toBe('API')
    expect(mapearOrigemLeitura('external')).toBe('API')
  })

  it('mapeia demais valores para INTERFACE', () => {
    expect(mapearOrigemLeitura('ui')).toBe('INTERFACE')
    expect(mapearOrigemLeitura(undefined)).toBe('INTERFACE')
  })
})

describe('mesclarOrigemLeituraTransacao', () => {
  it('preserva API quando qualquer lado é API', () => {
    expect(mesclarOrigemLeituraTransacao('API', 'INTERFACE')).toBe('API')
    expect(mesclarOrigemLeituraTransacao('INTERFACE', 'API')).toBe('API')
  })
})

describe('mesclarTransacaoNaLista', () => {
  it('mantém origem API ao complementar com snapshot INTERFACE', () => {
    const legado = transacaoBase({ id_leitura: 'abc', origem_leitura: 'API' })
    const snapshot = transacaoBase({
      id_leitura: 'abc',
      origem_leitura: 'INTERFACE',
      total_campos_extraidos: 20,
    })

    const mesclada = mesclarTransacaoNaLista(legado, snapshot)

    expect(mesclada.origem_leitura).toBe('API')
    expect(mesclada.total_campos_extraidos).toBe(20)
  })

  it('preserva saving e deriva media_acertos quando snapshot não traz accuracy', () => {
    const legado = transacaoBase({
      id_leitura: 'abc',
      media_acertos: null,
      saving_total_minutos: null,
      total_documentos: 0,
      total_campos_extraidos: 0,
    })
    const snapshot = transacaoBase({
      id_leitura: 'abc',
      media_acertos: null,
      saving_total_minutos: null,
      total_documentos: 2,
      total_campos_extraidos: 100,
      total_campos_corretos: 88,
      total_campos_errados: 12,
    })

    const mesclada = mesclarTransacaoNaLista(legado, snapshot)

    expect(mesclada.media_acertos).toBeCloseTo(0.88)
    expect(mesclada.saving_total_minutos).toBeGreaterThan(0)
    expect(mesclada.saving_total_brl).toBeGreaterThan(0)
  })

  it('estima saving quando API traz saving zerado mas há documentos concluídos', () => {
    const legado = transacaoBase({
      id_leitura: 'abc',
      saving_total_minutos: 0,
      saving_total_brl: 0,
      total_documentos: 0,
    })
    const snapshot = transacaoBase({
      id_leitura: 'abc',
      saving_total_minutos: 0,
      saving_total_brl: 0,
      total_documentos: 1,
      tipos_documento: 'AWB',
    })

    const mesclada = mesclarTransacaoNaLista(legado, snapshot)

    expect(mesclada.saving_total_minutos).toBeGreaterThan(0)
    expect(mesclada.saving_total_brl).toBeGreaterThan(0)
  })
})
