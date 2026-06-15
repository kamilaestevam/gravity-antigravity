/**
 * Lê CSV ou XLSX e normaliza para texto delimitado (;) consumido pelo parser.
 * XLSX: ignora super-header (linha 1) e usa rótulos legíveis da linha 2 como cabeçalho.
 */

import { detectarLinhaCabecalhoImportacaoBid } from './campos-importacao-bid-frete-internacional'

function celulaParaTexto(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'object' && v !== null && 'text' in v) {
    return String((v as { text?: string }).text ?? '')
  }
  if (v instanceof Date) {
    return v.toISOString().slice(0, 10)
  }
  return String(v)
}

function linhaParaCells(row: { values?: unknown[] }): string[] {
  const valores = row.values as unknown[] | undefined
  if (!valores) return []
  return valores.slice(1).map(celulaParaTexto)
}

export async function lerArquivoImportacaoComoCsv(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''

  if (ext === 'csv') {
    return file.text()
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(await file.arrayBuffer())
    const ws = wb.getWorksheet('Cotações') ?? wb.worksheets[0]
    if (!ws) return ''

    const matrix: string[][] = []
    ws.eachRow(row => {
      const cells = linhaParaCells(row).map(c => c.replace(/;/g, ','))
      if (cells.some(c => c.trim().length > 0)) {
        matrix.push(cells)
      }
    })

    if (matrix.length === 0) return ''

    const headerIdx = detectarLinhaCabecalhoImportacaoBid(matrix)
    const cabecalhos = matrix[headerIdx] ?? []
    const linhas: string[] = [cabecalhos.join(';')]

    for (let i = headerIdx + 1; i < matrix.length; i++) {
      const cells = matrix[i]
      if (cells.every(c => c.trim().length === 0)) continue
      linhas.push(cells.join(';'))
    }

    return linhas.join('\n')
  }

  throw new Error('Formato não suportado')
}
