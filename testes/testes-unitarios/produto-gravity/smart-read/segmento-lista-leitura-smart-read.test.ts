import { describe, expect, it } from 'vitest'
import {
  filtrarTransacoesPorSegmento,
  origemLeituraDoSegmento,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/use-transacoes-leitura-smart-read.ts'
import type { TransacaoLeitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/schemas.ts'

function transacao(origem: 'API' | 'INTERFACE'): TransacaoLeitura {
  return {
    id_leitura: `id-${origem}`,
    nome_leitura: 'Teste',
    status_leitura: 'COMPLETED',
    total_arquivos: 1,
    media_acertos: 0.9,
    data_envio: '2026-06-23T12:00:00.000Z',
    origem_leitura: origem,
    nome_arquivo: 'doc.pdf',
    mensagem_erro: null,
    total_documentos: 1,
    total_campos_extraidos: 1,
    total_campos_corretos: 1,
    total_campos_errados: 0,
    tipos_documento: null,
    numeros_documento: null,
    tempo_extracao_ia_ms: null,
    tempo_processo_total_ms: null,
    saving_total_minutos: null,
    saving_total_brl: null,
  }
}

describe('origemLeituraDoSegmento', () => {
  it('retorna API apenas para transacoes-api', () => {
    expect(origemLeituraDoSegmento('transacoes-api')).toBe('API')
    expect(origemLeituraDoSegmento('envios')).toBeUndefined()
  })
})

describe('filtrarTransacoesPorSegmento', () => {
  const lista = [transacao('INTERFACE'), transacao('API')]

  it('filtra somente API na aba transacoes-api', () => {
    const filtrada = filtrarTransacoesPorSegmento(lista, 'transacoes-api')
    expect(filtrada).toHaveLength(1)
    expect(filtrada[0]?.origem_leitura).toBe('API')
  })

  it('mantém todas na visão geral', () => {
    expect(filtrarTransacoesPorSegmento(lista, 'envios')).toHaveLength(2)
  })
})
