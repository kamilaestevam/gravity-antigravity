/**
 * csvFormatter.ts — Gera CSV/TXT delimitado
 *
 * Suporta separadores: "|", ";", ",", TAB
 * Suporta codificacao: UTF-8, ISO-8859-1
 * Header row opcional (layout.has_header)
 * Formatacao de campos conforme config do layout
 */

import type { ExportRow, LayoutConfig, FormatOptions } from './index.js'
import { resolverValorCelula } from './index.js'

const SEPARADORES: Record<string, string> = {
  '|': '|',
  ';': ';',
  ',': ',',
  'TAB': '\t',
}

/**
 * Escapa um valor para CSV — envolve em aspas se contem separador, aspas ou quebra de linha
 */
function escaparCsv(valor: string, separador: string): string {
  if (
    valor.includes(separador) ||
    valor.includes('"') ||
    valor.includes('\n') ||
    valor.includes('\r')
  ) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}

/**
 * Substitui placeholders em template de header/footer
 * Placeholders: {data}, {hora}, {total_linhas}, {nome_arquivo}
 */
function resolverTemplate(template: string, totalLinhas: number): string {
  const agora = new Date()
  return template
    .replace(/\{data\}/g, agora.toISOString().slice(0, 10))
    .replace(/\{hora\}/g, agora.toISOString().slice(11, 19))
    .replace(/\{total_linhas\}/g, String(totalLinhas))
}

/**
 * Gera CSV/TXT delimitado
 */
export function formatCsv(
  rows: ExportRow[],
  layout: LayoutConfig | null,
  options: FormatOptions
): string {
  if (rows.length === 0) {
    return ''
  }

  const separador = layout?.separador
    ? (SEPARADORES[layout.separador] ?? layout.separador)
    : ';'

  const linhas: string[] = []

  // Header template customizado
  if (layout?.has_header && layout.header_template) {
    linhas.push(resolverTemplate(layout.header_template, rows.length))
  }

  // Sem layout: usa chaves da primeira row
  if (!layout || layout.campos.length === 0) {
    const chaves = Object.keys(rows[0])

    // Header com nomes das colunas
    linhas.push(chaves.map((k) => escaparCsv(k, separador)).join(separador))

    for (const row of rows) {
      const valores = chaves.map((k) => {
        const val = row[k]
        if (val === null || val === undefined) return ''
        return escaparCsv(String(val), separador)
      })
      linhas.push(valores.join(separador))
    }

    return linhas.join('\r\n')
  }

  const camposOrdenados = [...layout.campos].sort((a, b) => a.ordem - b.ordem)

  // Header com labels dos campos
  if (layout.has_header && !layout.header_template) {
    const headers = camposOrdenados.map((c) =>
      escaparCsv(c.label || c.campo_origem, separador)
    )
    linhas.push(headers.join(separador))
  }

  // Linhas de dados
  for (const row of rows) {
    const valores = camposOrdenados.map((campo) => {
      const valorStr = resolverValorCelula(row, campo, options)
      return escaparCsv(valorStr, separador)
    })
    linhas.push(valores.join(separador))
  }

  // Footer template customizado
  if (layout.has_footer && layout.footer_template) {
    linhas.push(resolverTemplate(layout.footer_template, rows.length))
  }

  return linhas.join('\r\n')
}
