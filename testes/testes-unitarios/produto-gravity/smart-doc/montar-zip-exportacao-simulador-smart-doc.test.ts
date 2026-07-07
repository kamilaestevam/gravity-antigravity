import { describe, expect, it } from 'vitest'
import type { ArquivoDemoSimulador } from '../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/arquivos-demo-simulador-smart-doc'
import {
  montarArquivosZipExportacaoSimulador,
  montarNomeZipExportacaoSimulador,
} from '../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/smart-doc/montar-zip-exportacao-simulador-smart-doc'

const arquivoInvoice: ArquivoDemoSimulador = {
  id: 'arq-1',
  nome: 'INVOICE77.pdf',
  tipoArquivo: 'invoice',
  status: 'completo',
  expandido: false,
  documentosIdentificados: [
    { id: 'doc-pl', rotulo: 'Packing List', tipo: 'packing-list', quantidadeItens: 10 },
    { id: 'doc-inv', rotulo: 'Invoice', tipo: 'invoice', quantidadeItens: 100 },
  ],
}

describe('montar-zip-exportacao-simulador-smart-doc', () => {
  it('monta estrutura DATI com pasta do PDF, documentos numerados e original', () => {
    const arquivos = montarArquivosZipExportacaoSimulador([arquivoInvoice])
    const nomes = arquivos.map((a) => a.nome).sort()

    expect(nomes).toEqual([
      'INVOICE77/1-PACKING_LIST.json',
      'INVOICE77/1-PACKING_LIST.pdf',
      'INVOICE77/1-PACKING_LIST.txt',
      'INVOICE77/1-PACKING_LIST.xlsx',
      'INVOICE77/2-INVOICE.json',
      'INVOICE77/2-INVOICE.pdf',
      'INVOICE77/2-INVOICE.txt',
      'INVOICE77/2-INVOICE.xlsx',
      'INVOICE77/INVOICE77.pdf',
    ])
  })

  it('nomeia ZIP individual como {arquivo}-dati.zip', () => {
    expect(montarNomeZipExportacaoSimulador([arquivoInvoice], 'Leitura 448')).toBe('INVOICE77.pdf-dati.zip')
  })
})
