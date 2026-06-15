/**
 * Lê CSV ou XLSX e normaliza para texto delimitado (;) consumido pelo parser.
 * XLSX: ignora super-header (linha 1) e usa rótulos legíveis da linha 2 como cabeçalho.
 */

import type ExcelJS from 'exceljs'
import { detectarLinhaCabecalhoImportacaoBid } from './campos-importacao-bid-frete-internacional'

function celulaParaTexto(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'object' && v !== null) {
    if ('richText' in v && Array.isArray((v as { richText?: unknown[] }).richText)) {
      return (v as { richText: { text?: string }[] }).richText
        .map(part => part.text ?? '')
        .join('')
    }
    if ('text' in v) {
      const text = (v as { text?: unknown }).text
      if (text != null && typeof text === 'object') return celulaParaTexto(text)
      return String(text ?? '')
    }
    if ('result' in v) return celulaParaTexto((v as { result: unknown }).result)
  }
  if (v instanceof Date) {
    return v.toISOString().slice(0, 10)
  }
  return String(v)
}

function linhaParaCellsDensa(row: ExcelJS.Row, totalColunas: number): string[] {
  const cells: string[] = []
  for (let col = 1; col <= totalColunas; col++) {
    cells.push(celulaParaTexto(row.getCell(col).value))
  }
  return cells
}

function validarMagicBytesExcel(buffer: BufferLike, ext: string): void {
  if (ext !== 'xlsx') return
  const view = buffer instanceof Buffer
    ? buffer.subarray(0, 4)
    : new Uint8Array(buffer.slice(0, 4))
  const ehZip = view[0] === 0x50 && view[1] === 0x4B
  if (!ehZip) {
    throw new Error('Arquivo Excel inválido — confira se baixou o template .xlsx corretamente')
  }
}

type BufferLike = ArrayBuffer | Buffer

export async function lerBufferImportacaoComoCsv(
  input: BufferLike,
  ext: string,
): Promise<string> {
  const extNorm = ext.toLowerCase()

  if (extNorm === 'csv') {
    if (input instanceof Buffer) return input.toString('utf-8')
    return new TextDecoder('utf-8').decode(input)
  }

  if (extNorm === 'xlsx' || extNorm === 'xls') {
    validarMagicBytesExcel(input, extNorm)
    const ExcelJSModule = (await import('exceljs')).default
    const wb = new ExcelJSModule.Workbook()
    await wb.xlsx.load(input as ArrayBuffer)
    const ws = wb.getWorksheet('Cotações') ?? wb.worksheets[0]
    if (!ws) return ''

    const totalColunas = Math.max(ws.columnCount, ws.actualColumnCount ?? 0, 1)
    const matrix: string[][] = []
    ws.eachRow(row => {
      const cells = linhaParaCellsDensa(row, totalColunas).map(c => (c ?? '').replace(/;/g, ','))
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
      if (cells.every(c => (c ?? '').trim().length === 0)) continue
      linhas.push(cells.join(';'))
    }

    return linhas.join('\n')
  }

  throw new Error('Formato não suportado')
}

export async function lerArquivoImportacaoComoCsv(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return lerBufferImportacaoComoCsv(await file.arrayBuffer(), ext)
}
