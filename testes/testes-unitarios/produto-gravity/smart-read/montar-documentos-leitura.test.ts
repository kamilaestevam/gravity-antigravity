import { describe, expect, it } from 'vitest'
import { montarDocumentosLeituraLista } from '../../../../servicos-global/produto/smart-read/client/src/shared/montar-documentos-leitura-smart-read.ts'
import type { Leitura } from '../../../../servicos-global/produto/smart-read/client/src/shared/schemas.ts'

describe('Smart Read — montar documentos da lista', () => {
  it('rotula documentos repetidos com sufixo A, B…', () => {
    const leitura: Leitura = {
      id_leitura: 'leitura-1',
      nome_leitura: 'Embarque março',
      status_leitura: 'COMPLETED',
      total_arquivos: 1,
      arquivos_processados: 1,
      arquivos: [
        {
          id_arquivo: 'arq-1',
          nome_arquivo: 'pacote.pdf',
          status_arquivo: 'COMPLETED',
          resultado_extracao: [
            { tipo_documento: 'Invoice', dados: {} },
            { tipo_documento: 'Invoice', dados: {} },
            { tipo_documento: 'Packing List', dados: {} },
          ],
        },
      ],
    }

    const documentos = montarDocumentosLeituraLista(leitura)
    expect(documentos.map((d) => d.nome_documento)).toEqual([
      'Invoice A',
      'Invoice B',
      'Packing List',
    ])
  })

  it('usa nome do arquivo quando ainda não há extração', () => {
    const leitura: Leitura = {
      id_leitura: 'leitura-2',
      nome_leitura: null,
      status_leitura: 'PROCESSING',
      total_arquivos: 1,
      arquivos_processados: 0,
      arquivos: [
        {
          id_arquivo: 'arq-2',
          nome_arquivo: 'BL6.pdf',
          status_arquivo: 'PROCESSING',
          resultado_extracao: null,
        },
      ],
    }

    const documentos = montarDocumentosLeituraLista(leitura)
    expect(documentos).toHaveLength(1)
    expect(documentos[0]?.nome_documento).toBe('BL6.pdf')
  })
})
