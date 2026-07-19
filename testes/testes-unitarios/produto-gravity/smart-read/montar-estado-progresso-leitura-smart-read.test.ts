import { describe, expect, it } from 'vitest'
import {
  diagnosticarEstadoProgressoLeituraSmartRead,
  montarEstadoProgressoLeituraSmartRead,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/montar-estado-progresso-leitura-smart-read.ts'
import type { ArquivoLocalNovaLeitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/tipo-arquivo-nova-leitura-smart-read.ts'

function arquivoAnalisando(idLeitura: string): ArquivoLocalNovaLeitura {
  return {
    id_arquivo_local: 'local-1',
    arquivo: new File(['x'], 'invoice.pdf'),
    status_arquivo_local: 'analisando',
    id_leitura: idLeitura,
    id_arquivo: 'arq-1',
    leitura: null,
    mensagem_erro: null,
    expandido: false,
  }
}

function arquivoCompleto(idLeitura: string): ArquivoLocalNovaLeitura {
  return {
    id_arquivo_local: 'local-1',
    arquivo: new File(['x'], 'invoice.pdf'),
    status_arquivo_local: 'completo',
    id_leitura: idLeitura,
    id_arquivo: 'arq-1',
    leitura: {
      id_leitura: idLeitura,
      nome_leitura: 'Leitura 950',
      status_leitura: 'COMPLETED',
      total_arquivos: 1,
      arquivos_processados: 1,
      arquivos: [
        {
          id_arquivo: 'arq-1',
          nome_arquivo: 'invoice.pdf',
          status_arquivo: 'COMPLETED',
          resultado_extracao: [{ tipo_documento: 'INVOICE', dados: { numero: '1' } }],
        },
      ],
    },
    mensagem_erro: null,
    expandido: true,
  }
}

describe('montarEstadoProgressoLeituraSmartRead', () => {
  it('persiste passo 2 com upload em andamento (sem analise completa)', () => {
    const estado = montarEstadoProgressoLeituraSmartRead({
      arquivos: [arquivoAnalisando('leitura-950')],
      passo: 2,
      nomeLeitura: 'Leitura 950',
      idLeituraExistente: null,
    })
    expect(estado?.passo).toBe(2)
    expect(estado?.leitura.id_leitura).toBe('leitura-950')
    expect(estado?.leitura.arquivos).toHaveLength(1)
    expect(estado?.leitura.status_leitura).toBe('PROCESSING')
  })

  it('nao monta passo 2 sem id_leitura nos arquivos', () => {
    const estado = montarEstadoProgressoLeituraSmartRead({
      arquivos: [
        {
          ...arquivoAnalisando('leitura-950'),
          id_leitura: null,
          id_arquivo: null,
          status_arquivo_local: 'anexado',
        },
      ],
      passo: 2,
      nomeLeitura: 'Leitura 950',
      idLeituraExistente: null,
    })
    expect(estado).toBeNull()
  })

  it('diagnostica passo 3 sem extracao', () => {
    const semExtracao: ArquivoLocalNovaLeitura = {
      ...arquivoCompleto('leitura-950'),
      leitura: {
        ...arquivoCompleto('leitura-950').leitura!,
        arquivos: [
          {
            id_arquivo: 'arq-1',
            nome_arquivo: 'invoice.pdf',
            status_arquivo: 'COMPLETED',
            resultado_extracao: null,
          },
        ],
      },
    }
    expect(
      diagnosticarEstadoProgressoLeituraSmartRead({
        arquivos: [semExtracao],
        passo: 3,
        nomeLeitura: 'Leitura 950',
        idLeituraExistente: null,
      }),
    ).toBe('sem_extracao')
  })

  it('monta passo 3 com extracao util', () => {
    const estado = montarEstadoProgressoLeituraSmartRead({
      arquivos: [arquivoCompleto('leitura-950')],
      passo: 3,
      nomeLeitura: 'Leitura 950',
      idLeituraExistente: null,
    })
    expect(estado?.passo).toBe(3)
    expect(estado?.leitura.arquivos[0]?.resultado_extracao).toHaveLength(1)
  })
})
