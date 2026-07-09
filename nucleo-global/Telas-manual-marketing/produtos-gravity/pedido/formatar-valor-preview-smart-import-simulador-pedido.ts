/**
 * Formatação de valores no preview — paridade com EtapaPreview.formatarValor (produto real).
 */
import { ehCampoNcm, formatarNcm } from '../../../../servicos-global/produto/pedido/shared/formatadores'
import {
  aplicarMaskCnpj,
  aplicarMaskCpf,
  aplicarMaskTelefone,
  casasDecimaisDefault,
  kindUiDeCampo,
} from '../../../../servicos-global/produto/pedido/shared/kind-ui-pedido'

function fmtDecimalBr(n: number, casas: number): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

function fmtDataBr(s: string): string {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  return s
}

export function formatarValorPreviewSmartImportSimulador(campo: string, valor: unknown): string {
  const str = String(valor ?? '')
  if (!str.trim()) return str
  if (ehCampoNcm(campo)) return formatarNcm(str)

  const kind = kindUiDeCampo(campo)
  switch (kind) {
    case 'ncm':
      return formatarNcm(str)
    case 'cnpj':
      return aplicarMaskCnpj(str)
    case 'cpf':
      return aplicarMaskCpf(str)
    case 'telefone':
      return aplicarMaskTelefone(str)
    case 'data':
      return fmtDataBr(str)
    case 'tipo_operacao':
      if (str === 'importacao') return 'Importação'
      if (str === 'exportacao') return 'Exportação'
      return str
    case 'decimal_quantidade':
    case 'decimal_valor':
    case 'decimal_peso':
    case 'decimal_cubagem':
    case 'decimal_taxa':
    case 'inteiro': {
      const n = parseFloat(str.replace(/\./g, '').replace(',', '.'))
      if (Number.isNaN(n)) return str
      const casas = casasDecimaisDefault(kind, {})
      return fmtDecimalBr(n, casas)
    }
    default:
      return str
  }
}
