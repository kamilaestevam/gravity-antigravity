/**
 * exportUtils.ts — Utilitários de exportação compartilhados
 * @nucleo/export-utils — usado por todos os produtos Gravity
 *
 * Formatos: Excel (.xlsx via ExcelJS dinâmico), CSV, TXT, XML, JSON.
 * GTAcaoExport.onClick: () => void — sem parâmetros, dados via closure.
 */

export interface ColunasExport {
  header: string
  key:    string
  largura?: number
}

export interface OpcoesExport {
  nomeArquivo?: string
  titulo?:      string
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function baixarBlob(conteudo: string | ArrayBuffer, nome: string, tipo: string) {
  const blob = typeof conteudo === 'string'
    ? new Blob(['\uFEFF' + conteudo], { type: tipo })
    : new Blob([conteudo],            { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = nome; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

function linhas<T extends Record<string, unknown>>(dados: T[], colunas: ColunasExport[]): string[][] {
  return dados.map(row => colunas.map(c => String(row[c.key] ?? '')))
}

// ─── Excel (.xlsx via ExcelJS) ────────────────────────────────────────────────

export async function exportarExcel<T extends Record<string, unknown>>(
  dados: T[], colunas: ColunasExport[], opcoes: OpcoesExport = {}
) {
  const nome   = opcoes.nomeArquivo ?? 'exportacao'
  const titulo = opcoes.titulo      ?? nome
  const rows   = linhas(dados, colunas)

  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Gravity Platform'; wb.created = new Date()

  const ws = wb.addWorksheet(titulo, { views: [{ showGridLines: true }] })

  ws.columns = colunas.map((c, i) => {
    const maxData = rows.length > 0 ? Math.max(...rows.map(r => (r[i] ?? '').length)) : 0
    return { key: c.key, width: c.largura ?? Math.min(Math.max(c.header.length, maxData) + 4, 50) }
  })

  const headerRow = ws.addRow(colunas.map(c => c.header))
  headerRow.height = 22
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3256' } }
    cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FF38bdf8' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF38bdf8' } } }
  })

  rows.forEach((rowValues, idx) => {
    const dr = ws.addRow(rowValues)
    dr.height = 18
    dr.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 1 ? 'FFf1f5f9' : 'FFFFFFFF' } }
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1e293b' } }
      cell.alignment = {
        vertical: 'middle',
        horizontal: (!isNaN(Number(rowValues[colIdx - 1])) && rowValues[colIdx - 1] !== '') ? 'center' : 'left',
      }
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FFe2e8f0' } },
        right:  { style: 'hair', color: { argb: 'FFe2e8f0' } },
      }
    })
  })

  const buf = await wb.xlsx.writeBuffer()
  baixarBlob(buf as ArrayBuffer, `${nome}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

export function exportarCSV<T extends Record<string, unknown>>(
  dados: T[], colunas: ColunasExport[], opcoes: OpcoesExport = {}
) {
  const nome = opcoes.nomeArquivo ?? 'exportacao'
  const header = colunas.map(c => `"${c.header}"`).join(',')
  const rows = linhas(dados, colunas).map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
  baixarBlob(header + '\n' + rows, `${nome}.csv`, 'text/csv;charset=utf-8;')
}

// ─── TXT (tab-separated) ─────────────────────────────────────────────────────

export function exportarTXT<T extends Record<string, unknown>>(
  dados: T[], colunas: ColunasExport[], opcoes: OpcoesExport = {}
) {
  const nome = opcoes.nomeArquivo ?? 'exportacao'
  const header = colunas.map(c => c.header).join('\t')
  const rows = linhas(dados, colunas).map(r => r.join('\t')).join('\n')
  baixarBlob(header + '\n' + rows, `${nome}.txt`, 'text/plain;charset=utf-8;')
}

// ─── XML ──────────────────────────────────────────────────────────────────────

export function exportarXML<T extends Record<string, unknown>>(
  dados: T[], colunas: ColunasExport[], opcoes: OpcoesExport = {}
) {
  const nome = opcoes.nomeArquivo ?? 'exportacao'
  const tag  = nome.replace(/[^a-zA-Z0-9_]/g, '_')
  const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  const rows = dados.map(row => {
    const campos = colunas.map(c => {
      const tagCampo = c.key.replace(/[^a-zA-Z0-9_]/g, '_')
      return `    <${tagCampo}>${esc(String(row[c.key] ?? ''))}</${tagCampo}>`
    }).join('\n')
    return `  <item>\n${campos}\n  </item>`
  }).join('\n')
  baixarBlob(`<?xml version="1.0" encoding="UTF-8"?>\n<${tag}>\n${rows}\n</${tag}>`, `${nome}.xml`, 'application/xml;charset=utf-8;')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

export function exportarJSON<T extends Record<string, unknown>>(
  dados: T[], colunas: ColunasExport[], opcoes: OpcoesExport = {}
) {
  const nome = opcoes.nomeArquivo ?? 'exportacao'
  const resultado = dados.map(row => Object.fromEntries(colunas.map(c => [c.key, row[c.key] ?? null])))
  baixarBlob(JSON.stringify(resultado, null, 2), `${nome}.json`, 'application/json;charset=utf-8;')
}

// ─── PDF (jspdf + autotable — importados dinamicamente) ──────────────────────

export async function exportarPDF<T extends Record<string, unknown>>(
  dados: T[], colunas: ColunasExport[], opcoes: OpcoesExport = {}
) {
  const nome   = opcoes.nomeArquivo ?? 'exportacao'
  const titulo = opcoes.titulo      ?? nome

  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFontSize(16); doc.setTextColor(30, 41, 59)
  doc.text(titulo, 14, 16)
  doc.setFontSize(8); doc.setTextColor(100, 116, 139)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [colunas.map(c => c.header)],
    body: linhas(dados, colunas),
    styles:     { fontSize: 8, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, overflow: 'linebreak' },
    headStyles: { fillColor: [15, 23, 42], textColor: [56, 189, 248], fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  })

  const totalPag = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let i = 1; i <= totalPag; i++) {
    doc.setPage(i)
    doc.setFontSize(7); doc.setTextColor(148, 163, 184)
    doc.text(`Página ${i} de ${totalPag}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 8, { align: 'right' })
  }

  doc.save(`${nome}.pdf`)
}
