export type TipoDocumentoSimulador = 'invoice' | 'packing-list' | 'bill-of-lading'

export type DocumentoSimulador = {
  id: string
  rotulo: string
  tipo: TipoDocumentoSimulador
  quantidadeItens: number
}

export type ItemLinhaInvoiceSimulador = {
  linha: number
  partNumber: string
  descricao: string
  ncm: string
  quantidade: number
  unidade: string
  precoUnitario: number
  total: number
}

export type ItemLinhaPackingSimulador = {
  linha: number
  partNumber: string
  descricao: string
  quantidade: number
  caixas: number
  pesoLiquidoKg: number
  pesoBrutoKg: number
}

export type ItemLinhaBolSimulador = {
  linha: number
  container: string
  selo: string
  tipo: string
  volumes: number
  pesoKg: number
  medida: string
}

export const DOCUMENTOS_EXTRAIDOS_DEMO: DocumentoSimulador[] = [
  { id: 'doc-1', rotulo: 'Invoice #INV-9821', tipo: 'invoice', quantidadeItens: 100 },
  { id: 'doc-2', rotulo: 'Packing List', tipo: 'packing-list', quantidadeItens: 10 },
  { id: 'doc-3', rotulo: 'Bill of Lading', tipo: 'bill-of-lading', quantidadeItens: 10 },
]

const DESCRICOES = [
  'Industrial valve assembly',
  'Stainless steel flange DN80',
  'Hydraulic pump cartridge',
  'Precision bearing set',
  'Control panel module',
  'Heat exchanger gasket kit',
  'Pneumatic actuator 24V',
  'Flow meter sensor',
  'Electric motor 2.2kW',
  'Coupling flexible type A',
] as const

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatarPeso(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function gerarItensInvoiceSimulador(quantidade: number): ItemLinhaInvoiceSimulador[] {
  return Array.from({ length: quantidade }, (_, indice) => {
    const linha = indice + 1
    const descricao = DESCRICOES[indice % DESCRICOES.length]
    const quantidadeItem = 10 + (linha % 7) * 5
    const precoUnitario = 42.5 + (linha % 11) * 8.75
    return {
      linha,
      partNumber: `PN-${9821}-${String(linha).padStart(3, '0')}`,
      descricao,
      ncm: `8481.${String(30 + (linha % 5)).padStart(2, '0')}.${String(10 + (linha % 9)).padStart(2, '0')}`,
      quantidade: quantidadeItem,
      unidade: 'UN',
      precoUnitario,
      total: quantidadeItem * precoUnitario,
    }
  })
}

export function gerarItensPackingSimulador(quantidade: number): ItemLinhaPackingSimulador[] {
  return Array.from({ length: quantidade }, (_, indice) => {
    const linha = indice + 1
    const quantidadeItem = 20 + linha * 4
    const pesoLiquido = quantidadeItem * (1.2 + (linha % 3) * 0.35)
    return {
      linha,
      partNumber: `PN-${9821}-${String(linha).padStart(3, '0')}`,
      descricao: DESCRICOES[indice % DESCRICOES.length],
      quantidade: quantidadeItem,
      caixas: 1 + (linha % 4),
      pesoLiquidoKg: pesoLiquido,
      pesoBrutoKg: pesoLiquido * 1.08,
    }
  })
}

export function gerarItensBolSimulador(quantidade: number): ItemLinhaBolSimulador[] {
  return Array.from({ length: quantidade }, (_, indice) => {
    const linha = indice + 1
    return {
      linha,
      container: `MSCU${7200000 + linha}`,
      selo: `SL${448200 + linha}`,
      tipo: linha % 2 === 0 ? '40HC' : '20GP',
      volumes: 12 + linha,
      pesoKg: 8400 + linha * 320,
      medida: linha % 2 === 0 ? '12.032 m³' : '33.200 m³',
    }
  })
}

export function calcularTotalInvoice(itens: ItemLinhaInvoiceSimulador[]): number {
  return itens.reduce((acc, item) => acc + item.total, 0)
}

export function resolverDocumentoPadraoArquivo(nomeArquivo: string): DocumentoSimulador {
  const nome = nomeArquivo.toLowerCase()
  if (nome.includes('packing')) return DOCUMENTOS_EXTRAIDOS_DEMO[1]
  if (nome.includes('bill_of_lading') || nome.includes('bl')) return DOCUMENTOS_EXTRAIDOS_DEMO[2]
  return DOCUMENTOS_EXTRAIDOS_DEMO[0]
}

export function obterDocumentoSimuladorPorId(id: string): DocumentoSimulador | null {
  return DOCUMENTOS_EXTRAIDOS_DEMO.find((doc) => doc.id === id) ?? null
}
