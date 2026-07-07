import {
  DOCUMENTOS_EXTRAIDOS_DEMO,
  type DocumentoSimulador,
  type TipoDocumentoSimulador,
} from './documentos-preview-simulador-smart-doc'

export type ArquivoDemoSimulador = {
  id: string
  nome: string
  tipoArquivo: TipoDocumentoSimulador
  status: 'anexado' | 'analisando' | 'completo'
  documentosIdentificados: DocumentoSimulador[]
  expandido: boolean
}

const PREFIXOS_INVOICE = ['invoice', 'inv', 'commercial_invoice', 'ci'] as const
const PREFIXOS_PACKING = ['packing_list', 'packing-list', 'pl', 'packlist'] as const
const PREFIXOS_BOL = ['bill_of_lading', 'bol', 'bl', 'hbl', 'mbl'] as const
const SUFIXOS_PO = ['po', 'ped', 'order', 'ref'] as const

function numeroAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function escolher<T>(lista: readonly T[]): T {
  return lista[Math.floor(Math.random() * lista.length)]
}

function gerarNomeArquivoAleatorio(tipo: TipoDocumentoSimulador): string {
  const po = numeroAleatorio(1000, 9999)
  const ref = numeroAleatorio(10, 99)
  const ano = numeroAleatorio(24, 26)

  if (tipo === 'invoice') {
    const prefixo = escolher(PREFIXOS_INVOICE)
    const sufixoPo = escolher(SUFIXOS_PO)
    const variantes = [
      `${prefixo}_${sufixoPo}${po}.pdf`,
      `${prefixo}-${po}-${ref}.pdf`,
      `${prefixo}_shipment_${po}_v${ref}.pdf`,
      `${prefixo}_20${ano}_${po}.pdf`,
    ]
    return escolher(variantes)
  }

  if (tipo === 'packing-list') {
    const prefixo = escolher(PREFIXOS_PACKING)
    const variantes = [
      `${prefixo}_${po}.pdf`,
      `${prefixo}-${po}-${ref}.pdf`,
      `${prefixo}_export_${po}.pdf`,
      `${prefixo}_20${ano}_${ref}${po}.pdf`,
    ]
    return escolher(variantes)
  }

  const prefixo = escolher(PREFIXOS_BOL)
  const bl = numeroAleatorio(100000, 999999)
  const variantes = [
    `${prefixo}_${bl}.pdf`,
    `${prefixo}-${po}.pdf`,
    `${prefixo}_msc_${bl}.pdf`,
    `${prefixo}_20${ano}_${ref}.pdf`,
  ]
  return escolher(variantes)
}

function documentosIdentificadosParaTipo(tipo: TipoDocumentoSimulador): DocumentoSimulador[] {
  const documento = DOCUMENTOS_EXTRAIDOS_DEMO.find((item) => item.tipo === tipo)
  return documento ? [documento] : []
}

export function gerarArquivosDemoIniciais(): ArquivoDemoSimulador[] {
  const tipos: TipoDocumentoSimulador[] = ['invoice', 'packing-list', 'bill-of-lading']
  const sufixo = `${Date.now()}-${numeroAleatorio(100, 999)}`

  return tipos.map((tipo, indice) => ({
    id: `arq-${indice + 1}-${sufixo}`,
    nome: gerarNomeArquivoAleatorio(tipo),
    tipoArquivo: tipo,
    status: 'anexado',
    documentosIdentificados: [],
    expandido: false,
  }))
}

export function marcarArquivoDemoAnaliseCompleta(arquivo: ArquivoDemoSimulador): ArquivoDemoSimulador {
  return {
    ...arquivo,
    status: 'completo',
    documentosIdentificados: documentosIdentificadosParaTipo(arquivo.tipoArquivo),
    expandido: true,
  }
}

export function resolverDocumentoPadraoArquivoDemo(arquivo: ArquivoDemoSimulador): DocumentoSimulador {
  return (
    DOCUMENTOS_EXTRAIDOS_DEMO.find((item) => item.tipo === arquivo.tipoArquivo) ??
    DOCUMENTOS_EXTRAIDOS_DEMO[0]
  )
}

export function gerarNumeroLeituraAleatorio(): string {
  return `Leitura ${numeroAleatorio(101, 999)}`
}
