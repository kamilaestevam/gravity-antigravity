/**
 * Datas no template Excel e na leitura da planilha — formato dd/mm/aaaa.
 */
import type { CampoImportacaoBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'

export const FORMATO_EXCEL_DATA_IMPORTACAO_BID = 'dd/mm/yyyy'

export const CAMPOS_DATA_IMPORTACAO_BID: ReadonlySet<CampoImportacaoBidFreteInternacional> = new Set([
  'data_limite_resposta_cotacao_bid_frete_internacional',
  'data_aprovacao_cotacao_bid_frete_internacional',
  'data_cancelamento_cotacao_bid_frete_internacional',
])

export function ehCampoDataImportacaoBid(
  campo: CampoImportacaoBidFreteInternacional,
): boolean {
  return CAMPOS_DATA_IMPORTACAO_BID.has(campo)
}

/** Converte texto ou serial Excel em Date (meia-noite local). */
export function parseDataTextoPlanilhaImportacaoBid(valor: string): Date | undefined {
  const bruto = (valor ?? '').trim()
  if (!bruto) return undefined

  if (/^\d+(\.\d+)?$/.test(bruto)) {
    const serial = Number(bruto)
    if (Number.isFinite(serial) && serial > 0) {
      const epoch = new Date(Date.UTC(1899, 11, 30))
      epoch.setUTCDate(epoch.getUTCDate() + Math.floor(serial))
      return new Date(epoch.getUTCFullYear(), epoch.getUTCMonth(), epoch.getUTCDate())
    }
  }

  const iso = bruto.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const ano = Number(iso[1])
    const mes = Number(iso[2])
    const dia = Number(iso[3])
    if (mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31) {
      return new Date(ano, mes - 1, dia)
    }
  }

  const br = bruto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (br) {
    const dia = Number(br[1])
    const mes = Number(br[2])
    const ano = Number(br[3])
    if (mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31) {
      return new Date(ano, mes - 1, dia)
    }
  }

  if (bruto.includes('T') && !Number.isNaN(Date.parse(bruto))) {
    const d = new Date(bruto)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  return undefined
}

export function formatarDataPlanilhaImportacaoBid(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  return `${dia}/${mes}/${ano}`
}

export function celulaExcelParaTextoDataImportacaoBid(valor: unknown): string {
  if (valor instanceof Date) {
    return formatarDataPlanilhaImportacaoBid(valor)
  }
  if (typeof valor === 'number' && Number.isFinite(valor)) {
    const data = parseDataTextoPlanilhaImportacaoBid(String(valor))
    return data ? formatarDataPlanilhaImportacaoBid(data) : String(valor)
  }
  return typeof valor === 'string' ? valor : String(valor ?? '')
}
