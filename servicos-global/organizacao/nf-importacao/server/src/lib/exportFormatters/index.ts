/**
 * exportFormatters/index.ts — Barrel export para todos os formatadores
 *
 * Cada formatador recebe linhas achatadas + config de layout
 * e retorna o conteudo formatado (string ou Buffer).
 */

export { formatJson } from './jsonFormatter.js'
export { formatCsv } from './csvFormatter.js'
export { formatTxtFixed } from './txtFixedFormatter.js'
export { formatXml } from './xmlFormatter.js'
export { formatExcel } from './excelFormatter.js'

// --- Tipos compartilhados entre formatadores ---

export interface ExportRow {
  [campo: string]: string | number | null
}

export interface LayoutCampo {
  campo_origem: string
  label: string
  ordem: number
  tipo_dado: string        // STRING | NUMBER | DATE | BOOLEAN
  formato?: string         // ex: "DD/MM/YYYY", "#.##0,00"
  tamanho_fixo?: number    // para TXT posicao fixa
  posicao_inicio?: number  // para TXT posicao fixa
  alinhamento: string      // LEFT | RIGHT | CENTER
  preenchimento?: string   // caractere de padding (espaco ou "0")
  valor_padrao?: string    // valor quando campo e null
  transformacao?: string   // UPPERCASE | LOWERCASE | TRIM | NONE
}

export interface LayoutConfig {
  formato: string          // XML | TXT | CSV | EXCEL | JSON | PDF
  separador?: string       // "|" | ";" | "," | "TAB"
  codificacao: string      // UTF-8 | ISO-8859-1
  has_header: boolean
  has_footer: boolean
  header_template?: string
  footer_template?: string
  campos: LayoutCampo[]
}

export interface FormatOptions {
  codificacao?: string
  casas_decimais_valor?: number
  casas_decimais_qtd?: number
}

/**
 * Aplica transformacao textual a um valor string
 */
export function aplicarTransformacao(valor: string, transformacao?: string): string {
  if (!transformacao || transformacao === 'NONE') return valor
  switch (transformacao) {
    case 'UPPERCASE':
      return valor.toUpperCase()
    case 'LOWERCASE':
      return valor.toLowerCase()
    case 'TRIM':
      return valor.trim()
    default:
      return valor
  }
}

/**
 * Formata um valor numerico com casas decimais especificas
 */
export function formatarNumero(valor: number, casasDecimais: number): string {
  return valor.toFixed(casasDecimais)
}

/**
 * Resolve o valor de uma celula com base no campo de layout
 */
export function resolverValorCelula(
  row: ExportRow,
  campo: LayoutCampo,
  options: FormatOptions
): string {
  const valorBruto = row[campo.campo_origem]

  if (valorBruto === null || valorBruto === undefined) {
    return campo.valor_padrao ?? ''
  }

  if (typeof valorBruto === 'number') {
    const casas = campo.tipo_dado === 'NUMBER'
      ? (options.casas_decimais_valor ?? 2)
      : 2
    return formatarNumero(valorBruto, casas)
  }

  const valorStr = String(valorBruto)
  return aplicarTransformacao(valorStr, campo.transformacao)
}
