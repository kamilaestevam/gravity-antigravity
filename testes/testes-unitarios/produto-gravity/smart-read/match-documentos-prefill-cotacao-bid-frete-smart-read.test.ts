import { describe, expect, it } from 'vitest'
import {
  filtrarLeituraPorDocumentosMatchPrefill,
  listarDocumentosMatchPrefillCotacaoBidFrete,
  sugerirGruposMatchPrefillCotacaoBidFrete,
} from '../../../../servicos-global/produto/smart-read/shared/match-documentos-prefill-cotacao-bid-frete-smart-read.ts'
import { sugerirHubLogisticoPorPaisPrefillBidFrete } from '../../../../servicos-global/produto/smart-read/shared/sugerir-hub-logistico-por-pais-prefill-bid-frete.ts'
import { converterLeituraParaCotacaoBidFreteInternacional } from '../../../../servicos-global/produto/smart-read/shared/converter-leitura-para-cotacao-bid-frete-internacional-smart-read.ts'

describe('match documentos prefill BID Frete', () => {
  const leitura = {
    id_leitura: 'L1',
    arquivos: [
      {
        resultado_extracao: [
          {
            tipo_documento: 'INVOICE',
            dados: {
              document: { invoiceNumber: 'INV-10', originCountry: 'CN' },
              importer: { country: 'BR', address: 'Santos SP' },
              exporter: { country: 'CN', address: 'Shanghai' },
            },
          },
          {
            tipo_documento: 'PACKING LIST',
            dados: {
              document: { invoiceNumber: 'INV-10' },
              totals: { packages: 4 },
            },
          },
          {
            tipo_documento: 'INVOICE',
            dados: {
              document: { invoiceNumber: 'INV-99', originCountry: 'AE' },
              importer: { country: 'BR' },
            },
          },
        ],
      },
    ],
  }

  it('lista documentos e agrupa invoice+packing pela mesma referencia', () => {
    const docs = listarDocumentosMatchPrefillCotacaoBidFrete(leitura)
    expect(docs).toHaveLength(3)
    const grupos = sugerirGruposMatchPrefillCotacaoBidFrete(docs)
    expect(grupos).toHaveLength(2)
    expect(grupos[0]?.ids_documentos).toHaveLength(2)
    expect(grupos[1]?.ids_documentos).toHaveLength(1)
  })

  it('filtra leitura por ids do grupo', () => {
    const docs = listarDocumentosMatchPrefillCotacaoBidFrete(leitura)
    const filtrada = filtrarLeituraPorDocumentosMatchPrefill(leitura, [docs[2]!.id_documento])
    expect(filtrada.arquivos[0]?.resultado_extracao).toHaveLength(1)
    expect(filtrada.arquivos[0]?.resultado_extracao?.[0]?.tipo_documento).toBe('INVOICE')
  })
})

describe('hub logistico por pais', () => {
  it('sugere Santos/GRU para BR e Jebel Ali/DXB para AE', () => {
    expect(sugerirHubLogisticoPorPaisPrefillBidFrete('BR')?.porto_unlocode).toBe('BRSSZ')
    expect(sugerirHubLogisticoPorPaisPrefillBidFrete('ae')?.aeroporto_iata).toBe('DXB')
  })
})

describe('converter prefill hub por endereco/pais', () => {
  it('sugere porto origem/destino quando ausente no documento', () => {
    const conversao = converterLeituraParaCotacaoBidFreteInternacional({
      id_leitura: 'L2',
      arquivos: [
        {
          resultado_extracao: [
            {
              tipo_documento: 'INVOICE',
              dados: {
                exporter: { country: 'CN', address: 'Shanghai Rd 1' },
                importer: { country: 'BR', address: 'Av Brasil 100' },
                shipmentDetails: { transportMode: 'SEA' },
              },
            },
          ],
        },
      ],
    })
    expect(conversao.prefill.porto_origem_cotacao_bid_frete_internacional).toBe('CNSHA')
    expect(conversao.prefill.porto_destino_cotacao_bid_frete_internacional).toBe('BRSSZ')
    expect(conversao.prefill.endereco_origem_cotacao_bid_frete_internacional).toContain('Shanghai')
    expect(
      conversao.detalhe_mapeamento.campos.some(
        (c) =>
          c.campo_destino === 'porto_origem_cotacao_bid_frete_internacional'
          && c.status_mapeamento === 'sugerido',
      ),
    ).toBe(true)
  })
})
