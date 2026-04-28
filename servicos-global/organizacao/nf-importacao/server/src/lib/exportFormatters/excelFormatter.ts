/**
 * excelFormatter.ts — Gera Excel via XML Spreadsheet 2003
 *
 * Formato XML Spreadsheet 2003 (.xls) que Excel, LibreOffice e Google Sheets abrem.
 * Sem dependencia de bibliotecas externas (xlsx, exceljs, etc).
 * Numeros como numeros, datas formatadas, headers em negrito.
 */

import type { ExportRow, LayoutConfig, LayoutCampo, FormatOptions } from './index.js'
import { aplicarTransformacao } from './index.js'

/**
 * Escapa caracteres especiais para XML
 */
function escaparXml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Determina tipo e valor de celula para Excel XML
 */
function resolverCelulaExcel(
  valor: string | number | null,
  tipoDado: string,
  options: FormatOptions
): { tipo: string; valor: string } {
  if (valor === null || valor === undefined) {
    return { tipo: 'String', valor: '' }
  }

  if (tipoDado === 'NUMBER' || typeof valor === 'number') {
    const num = typeof valor === 'number' ? valor : parseFloat(String(valor))
    if (isNaN(num)) {
      return { tipo: 'String', valor: String(valor) }
    }
    const casas = options.casas_decimais_valor ?? 2
    return { tipo: 'Number', valor: num.toFixed(casas) }
  }

  if (tipoDado === 'DATE') {
    return { tipo: 'String', valor: String(valor) }
  }

  return { tipo: 'String', valor: escaparXml(String(valor)) }
}

/**
 * Gera cabecalho XML Spreadsheet 2003
 */
function gerarCabecalhoXls(): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
    '  xmlns:o="urn:schemas-microsoft-com:office:office"',
    '  xmlns:x="urn:schemas-microsoft-com:office:excel"',
    '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '  <Styles>',
    '    <Style ss:ID="Default" ss:Name="Normal">',
    '      <Font ss:FontName="Calibri" ss:Size="11"/>',
    '    </Style>',
    '    <Style ss:ID="Header">',
    '      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>',
    '      <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>',
    '    </Style>',
    '    <Style ss:ID="Number">',
    '      <NumberFormat ss:Format="#,##0.00"/>',
    '    </Style>',
    '  </Styles>',
    '  <Worksheet ss:Name="NF Importacao">',
    '    <Table>',
  ].join('\n')
}

/**
 * Gera rodape XML Spreadsheet 2003
 */
function gerarRodapeXls(): string {
  return [
    '    </Table>',
    '  </Worksheet>',
    '</Workbook>',
  ].join('\n')
}

/**
 * Gera Excel XML com layout customizado
 */
function gerarExcelComLayout(
  rows: ExportRow[],
  layout: LayoutConfig,
  options: FormatOptions
): string {
  const camposOrdenados = [...layout.campos].sort((a, b) => a.ordem - b.ordem)
  const linhas: string[] = []

  linhas.push(gerarCabecalhoXls())

  // Header row
  if (layout.has_header) {
    linhas.push('      <Row>')
    for (const campo of camposOrdenados) {
      const label = escaparXml(campo.label || campo.campo_origem)
      linhas.push(`        <Cell ss:StyleID="Header"><Data ss:Type="String">${label}</Data></Cell>`)
    }
    linhas.push('      </Row>')
  }

  // Data rows
  for (const row of rows) {
    linhas.push('      <Row>')
    for (const campo of camposOrdenados) {
      const valorBruto = row[campo.campo_origem]

      let valorFinal: string | number | null = valorBruto
      if (typeof valorBruto === 'string') {
        valorFinal = aplicarTransformacao(valorBruto, campo.transformacao)
      }
      if (valorFinal === null || valorFinal === undefined) {
        valorFinal = campo.valor_padrao ?? null
      }

      const celula = resolverCelulaExcel(
        valorFinal as string | number | null,
        campo.tipo_dado,
        options
      )

      const styleAttr = celula.tipo === 'Number' ? ' ss:StyleID="Number"' : ''
      linhas.push(`        <Cell${styleAttr}><Data ss:Type="${celula.tipo}">${celula.valor}</Data></Cell>`)
    }
    linhas.push('      </Row>')
  }

  linhas.push(gerarRodapeXls())

  return linhas.join('\n')
}

/**
 * Gera Excel XML sem layout (todas as colunas)
 */
function gerarExcelSemLayout(
  rows: ExportRow[],
  options: FormatOptions
): string {
  const chaves = Object.keys(rows[0])
  const linhas: string[] = []

  linhas.push(gerarCabecalhoXls())

  // Header row
  linhas.push('      <Row>')
  for (const chave of chaves) {
    linhas.push(`        <Cell ss:StyleID="Header"><Data ss:Type="String">${escaparXml(chave)}</Data></Cell>`)
  }
  linhas.push('      </Row>')

  // Data rows
  for (const row of rows) {
    linhas.push('      <Row>')
    for (const chave of chaves) {
      const valor = row[chave]
      const celula = resolverCelulaExcel(valor, typeof valor === 'number' ? 'NUMBER' : 'STRING', options)
      const styleAttr = celula.tipo === 'Number' ? ' ss:StyleID="Number"' : ''
      linhas.push(`        <Cell${styleAttr}><Data ss:Type="${celula.tipo}">${celula.valor}</Data></Cell>`)
    }
    linhas.push('      </Row>')
  }

  linhas.push(gerarRodapeXls())

  return linhas.join('\n')
}

/**
 * Gera Excel XML Spreadsheet 2003
 */
export function formatExcel(
  rows: ExportRow[],
  layout: LayoutConfig | null,
  options: FormatOptions
): string {
  if (rows.length === 0) {
    return [
      gerarCabecalhoXls(),
      gerarRodapeXls(),
    ].join('\n')
  }

  if (layout && layout.campos.length > 0) {
    return gerarExcelComLayout(rows, layout, options)
  }

  return gerarExcelSemLayout(rows, options)
}
