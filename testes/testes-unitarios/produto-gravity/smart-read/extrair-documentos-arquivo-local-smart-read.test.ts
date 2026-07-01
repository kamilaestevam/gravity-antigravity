import { describe, expect, it } from 'vitest'
import {
  extrairDocumentosArquivoLocal,
  pollAtualizacaoArquivoEquivalente,
  type ArquivoLocalNovaLeitura,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/tipo-arquivo-nova-leitura-smart-read'
import type { Leitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/schemas'

function arquivoComExtracao(extracao: Leitura['arquivos'][number]['resultado_extracao']): ArquivoLocalNovaLeitura {
  const leitura = {
    id_leitura: 'leit-1',
    nome_leitura: 'Leitura teste',
    status_leitura: 'PROCESSING',
    arquivos: [
      {
        id_arquivo: 'arq-1',
        nome_arquivo: 'invoices.pdf',
        status_arquivo: 'PROCESSING',
        resultado_extracao: extracao,
      },
    ],
  } satisfies Leitura

  return {
    id_arquivo_local: 'local-1',
    arquivo: new File([], 'invoices.pdf'),
    status_arquivo_local: 'analisando',
    id_leitura: 'leit-1',
    id_arquivo: 'arq-1',
    leitura,
    mensagem_erro: null,
    expandido: true,
  }
}

describe('extrairDocumentosArquivoLocal — rótulos duplicados', () => {
  it('numera INVOICE repetidos na sidebar', () => {
    const item = arquivoComExtracao([
      { tipo_documento: 'INVOICE', dados: { n: 1 } },
      { tipo_documento: 'INVOICE', dados: { n: 2 } },
      { tipo_documento: 'INVOICE', dados: { n: 3 } },
    ])
    const docs = extrairDocumentosArquivoLocal(item)
    expect(docs.map((d) => d.tipo_documento)).toEqual(['INVOICE 1', 'INVOICE 2', 'INVOICE 3'])
    expect(docs.map((d) => d.indice)).toEqual([0, 1, 2])
  })
})

describe('pollAtualizacaoArquivoEquivalente', () => {
  it('ignora poll quando status e quantidade de documentos não mudaram', () => {
    const atual = arquivoComExtracao([{ tipo_documento: 'INVOICE', dados: {} }])
    const patch = {
      leitura: {
        ...atual.leitura!,
        status_leitura: 'PROCESSING' as const,
      },
    }
    expect(pollAtualizacaoArquivoEquivalente(atual, patch)).toBe(true)
  })

  it('detecta novo documento identificado no poll', () => {
    const atual = arquivoComExtracao([{ tipo_documento: 'INVOICE', dados: {} }])
    const patch = {
      leitura: {
        ...atual.leitura!,
        arquivos: [
          {
            ...atual.leitura!.arquivos[0],
            resultado_extracao: [
              { tipo_documento: 'INVOICE', dados: {} },
              { tipo_documento: 'INVOICE', dados: { novo: true } },
            ],
          },
        ],
      },
    }
    expect(pollAtualizacaoArquivoEquivalente(atual, patch)).toBe(false)
  })
})
