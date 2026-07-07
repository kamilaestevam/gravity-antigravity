import type { TipoDocumentoSimulador } from './documentos-preview-simulador-smart-doc'

export type StatusCampoConferenciaSimulador = 'preenchido' | 'vazio-obrig' | 'vazio-opc'

export type CampoConferenciaSimulador = {
  chave: string
  rotulo: string
  valor: string | null
  status: StatusCampoConferenciaSimulador
}

export type SecaoConferenciaSimulador = {
  id: string
  titulo: string
  campos: CampoConferenciaSimulador[]
}

const SECOES_INVOICE: SecaoConferenciaSimulador[] = [
  {
    id: 'dados-gerais',
    titulo: 'Dados gerais',
    campos: [
      { chave: 'invoiceNo', rotulo: 'Invoice No.', valor: 'INV-2026-4482', status: 'preenchido' },
      { chave: 'invoiceDate', rotulo: 'Invoice Date', valor: '18/06/2026', status: 'preenchido' },
      { chave: 'poReference', rotulo: 'PO Reference', valor: 'PO-9821', status: 'preenchido' },
      { chave: 'currency', rotulo: 'Currency', valor: 'USD', status: 'preenchido' },
      { chave: 'incoterm', rotulo: 'Incoterm', valor: 'FOB Hamburg', status: 'preenchido' },
    ],
  },
  {
    id: 'importador',
    titulo: 'Importador',
    campos: [
      { chave: 'consignee', rotulo: 'Consignee', valor: 'IMPORTADORA GLOBAL LTDA', status: 'preenchido' },
      { chave: 'cnpj', rotulo: 'CNPJ', valor: '47.829.103/0001-56', status: 'preenchido' },
      { chave: 'endereco', rotulo: 'Address', valor: 'Av. das Palmeiras 1200 — São Paulo/SP', status: 'preenchido' },
    ],
  },
  {
    id: 'mercadoria',
    titulo: 'Mercadoria',
    campos: [
      { chave: 'netWeight', rotulo: 'Net Weight', valor: '18.420,00 KG', status: 'vazio-obrig' },
      { chave: 'grossWeight', rotulo: 'Gross Weight', valor: '19.120,00 KG', status: 'preenchido' },
      { chave: 'descricao', rotulo: 'Goods Description', valor: 'Industrial machinery parts', status: 'preenchido' },
    ],
  },
]

const SECOES_PACKING: SecaoConferenciaSimulador[] = [
  {
    id: 'embalagem',
    titulo: 'Embalagem',
    campos: [
      { chave: 'totalPackages', rotulo: 'Total Packages', valor: '24', status: 'preenchido' },
      { chave: 'netWeight', rotulo: 'Net Weight', valor: '8.420,00 KG', status: 'preenchido' },
      { chave: 'grossWeight', rotulo: 'Gross Weight', valor: '9.050,00 KG', status: 'preenchido' },
    ],
  },
]

const SECOES_BOL: SecaoConferenciaSimulador[] = [
  {
    id: 'embarque',
    titulo: 'Embarque',
    campos: [
      { chave: 'blNumber', rotulo: 'B/L Number', valor: 'HBL4492', status: 'preenchido' },
      { chave: 'vessel', rotulo: 'Vessel', valor: 'MSC BRASILIA VII', status: 'preenchido' },
      { chave: 'portLoading', rotulo: 'Port of Loading', valor: 'Hamburg, DE', status: 'preenchido' },
      { chave: 'portDischarge', rotulo: 'Port of Discharge', valor: 'Santos, BR', status: 'preenchido' },
    ],
  },
]

export function obterSecoesConferenciaSimulador(tipo: TipoDocumentoSimulador): SecaoConferenciaSimulador[] {
  if (tipo === 'packing-list') return SECOES_PACKING
  if (tipo === 'bill-of-lading') return SECOES_BOL
  return SECOES_INVOICE
}

export function calcularEstatisticasConferenciaSimulador(secoes: SecaoConferenciaSimulador[]) {
  const campos = secoes.flatMap((s) => s.campos)
  const total = campos.length
  const preenchidos = campos.filter((c) => c.status === 'preenchido').length
  const vazios = campos.filter((c) => c.status !== 'preenchido').length
  const percentual = total > 0 ? Math.round((preenchidos / total) * 100) : 0
  return { total, preenchidos, vazios, preenchidosAlterados: 0, percentual }
}
