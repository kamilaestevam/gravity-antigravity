import { describe, expect, it } from 'vitest'
import { CATALOGO_COLUNAS_DOCUMENTO_SMART_READ } from '../../../../servicos-global/produto/smart-read/shared/catalogo-colunas-documento-smart-read.ts'
import {
  aplicarEdicaoPorCaminhoConferenciaSmartRead,
  auditarParidadeEdicaoConferenciaListaSmartRead,
  caminhoEditavelParidadeConferenciaListaSmartRead,
  CATALOGO_PARIDADE_EDICAO_SMART_READ,
  resolverCampoColunaPorCaminhoEdicaoSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/paridade-edicao-conferencia-lista-smart-read.ts'
import { aplicarEdicaoCampoDocumentoListaSmartRead } from '../../../../servicos-global/produto/smart-read/shared/lista-edicao-espelhada-smart-read.ts'

const CATALOGO_MINIMO = [
  {
    key: 'numero_documento',
    tipos: ['INVOICE', 'PACKING_LIST'],
    caminhos: ['document.documentNumber', 'document.number'],
    status: 'mapeado' as const,
  },
  {
    key: 'nome_exportador',
    tipos: ['INVOICE', 'PACKING_LIST'],
    caminhos: ['exporter.name'],
    status: 'mapeado' as const,
  },
]

function leituraComGrupoA() {
  return {
    id_leitura: 'leitura-1',
    arquivos: [
      {
        id_arquivo: 'arq-1',
        resultado_extracao: [
          {
            tipo_documento: 'INVOICE',
            dados: { document: { documentNumber: '100' }, exporter: { name: 'Foo' } },
          },
          {
            tipo_documento: 'INVOICE',
            dados: { document: { documentNumber: '101' }, exporter: { name: 'Foo2' } },
          },
          {
            tipo_documento: 'PACKING_LIST',
            dados: { document: { number: '100' }, exporter: { name: 'Foo' } },
          },
          {
            tipo_documento: 'PACKING_LIST',
            dados: { document: { number: '101' }, exporter: { name: 'Foo2' } },
          },
        ],
      },
    ],
  }
}

describe('Smart Read — paridade conferência × lista', () => {
  it('auditoria do catálogo completo é coerente (caminho ↔ coluna)', () => {
    const relatorio = auditarParidadeEdicaoConferenciaListaSmartRead(CATALOGO_PARIDADE_EDICAO_SMART_READ)
    expect(relatorio.coerente).toBe(true)
    expect(relatorio.colunas_editaveis_lista).toBeGreaterThan(0)
    expect(relatorio.caminhos_sem_resolucao).toHaveLength(0)
  })

  it('resolve caminhos do catálogo gerado para campo_coluna', () => {
    for (const col of CATALOGO_COLUNAS_DOCUMENTO_SMART_READ) {
      if (col.status !== 'mapeado') continue
      const escalares = col.caminhos.filter((c) => !c.includes('['))
      if (escalares.length === 0) continue

      for (const tipo of col.tipos) {
        for (const caminho of escalares) {
          expect(
            caminhoEditavelParidadeConferenciaListaSmartRead(caminho, tipo),
          ).toBe(true)
          expect(resolverCampoColunaPorCaminhoEdicaoSmartRead(caminho, tipo)).toBe(col.key)
        }
      }
    }
  })

  it('rejeita caminhos de array e campos pendentes', () => {
    expect(caminhoEditavelParidadeConferenciaListaSmartRead('items[0].description', 'INVOICE')).toBe(
      false,
    )
    const pendente = CATALOGO_COLUNAS_DOCUMENTO_SMART_READ.find((c) => c.status === 'pendente')
    if (pendente && pendente.caminhos[0] && !pendente.caminhos[0].includes('[')) {
      expect(
        caminhoEditavelParidadeConferenciaListaSmartRead(pendente.caminhos[0], pendente.tipos[0]),
      ).toBe(false)
    }
  })

  it('passo 3 e lista produzem o mesmo resultado com espelhamento (document.documentNumber)', () => {
    const leitura = leituraComGrupoA()

    const viaConferencia = aplicarEdicaoPorCaminhoConferenciaSmartRead({
      leitura,
      id_arquivo: 'arq-1',
      indice_documento: 0,
      caminho: 'document.documentNumber',
      valor: '777',
      catalogo: CATALOGO_MINIMO,
    })

    const viaLista = aplicarEdicaoCampoDocumentoListaSmartRead({
      leitura,
      id_arquivo: 'arq-1',
      indice_documento: 0,
      campo_coluna: 'numero_documento',
      valor: '777',
      catalogo: CATALOGO_MINIMO,
    })

    expect(viaConferencia).toEqual(viaLista)
  })

  it('passo 3 espelha exporter.name igual à lista', () => {
    const leitura = leituraComGrupoA()
    const editada = aplicarEdicaoPorCaminhoConferenciaSmartRead({
      leitura,
      id_arquivo: 'arq-1',
      indice_documento: 2,
      caminho: 'exporter.name',
      valor: 'Acme',
      catalogo: CATALOGO_MINIMO,
    })

    const invoiceA = editada.arquivos[0]?.resultado_extracao?.[0]?.dados as Record<string, unknown>
    const packingA = editada.arquivos[0]?.resultado_extracao?.[2]?.dados as Record<string, unknown>
    expect((invoiceA.exporter as Record<string, unknown>).name).toBe('Acme')
    expect((packingA.exporter as Record<string, unknown>).name).toBe('Acme')
  })
})
