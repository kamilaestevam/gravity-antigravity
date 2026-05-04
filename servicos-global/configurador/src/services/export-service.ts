// exceljs (~2.5MB) e jspdf (~1.5MB) são importados dinamicamente nas funções que os usam

// ─── Tipos Genéricos ──────────────────────────────────────────────────────────

export interface ColunasExport {
  header: string   // Cabeçalho visível
  key: string      // Chave no objeto de dados
  largura?: number // largura de coluna em caracteres (opcional)
}

export interface OpcoesExport {
  nomeArquivo?: string   // sem extensão
  titulo?: string        // usado no PDF e como aba do Excel
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function baixarBlob(conteudo: string | ArrayBuffer, nome: string, tipo: string) {
  const blob = typeof conteudo === 'string'
    ? new Blob(['\uFEFF' + conteudo], { type: tipo }) // BOM para UTF-8 no Excel/Notepad
    : new Blob([conteudo], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

function linhas<T extends Record<string, unknown>>(dados: T[], colunas: ColunasExport[]): string[][] {
  return dados.map(row => colunas.map(c => String(row[c.key] ?? '')))
}

// ─── Cores Gravity Design System ──────────────────────────────────────────────
//  Header:  fundo #1e3256 (navy), texto #38bdf8 (sky-400), negrito, centralizado
//  Dados:   fundo branco / #f8fafc alternado, texto #1e293b
//  Bordas:  #e2e8f0 (slate-200), finas

const COR_HEADER_BG  = '1e3256'  // navy escuro
const COR_HEADER_FG  = '38bdf8'  // sky-400
const COR_ROW_ALT    = 'f1f5f9'  // slate-100
const COR_BORDA      = 'e2e8f0'  // slate-200
const COR_TEXTO      = '1e293b'  // slate-900

// ─── Excel (.xlsx real via ExcelJS — com estilos completos) ──────────────────

export async function exportarExcel<T extends Record<string, unknown>>(
  dados: T[],
  colunas: ColunasExport[],
  opcoes: OpcoesExport = {}
) {
  const nome  = opcoes.nomeArquivo ?? 'exportacao'
  const titulo = opcoes.titulo     ?? nome
  const rows   = linhas(dados, colunas)

  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator  = 'Gravity Platform'
  wb.created  = new Date()
  wb.modified = new Date()

  const ws = wb.addWorksheet(titulo, { views: [{ showGridLines: true }] })

  // ── Larguras das colunas ──────────────────────────────────────────────────
  ws.columns = colunas.map((c, i) => {
    const maxData = rows.length > 0 ? Math.max(...rows.map(r => (r[i] ?? '').length)) : 0
    const width = c.largura ?? Math.min(Math.max(c.header.length, maxData) + 4, 50)
    return { key: c.key, width }
  })

  // ── Linha de cabeçalho ────────────────────────────────────────────────────
  const headerRow = ws.addRow(colunas.map(c => c.header))
  headerRow.height = 22

  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + COR_HEADER_BG },
    }
    cell.font = {
      name: 'Calibri',
      bold: true,
      size: 11,
      color: { argb: 'FF' + COR_HEADER_FG },
    }
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
    }
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF' + COR_HEADER_FG } },
    }
  })

  // ── Linhas de dados ───────────────────────────────────────────────────────
  rows.forEach((rowValues, rowIndex) => {
    const dataRow = ws.addRow(rowValues)
    dataRow.height = 18

    const isAlt = rowIndex % 2 === 1
    dataRow.eachCell({ includeEmpty: true }, (cell, colIdx) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isAlt ? 'FF' + COR_ROW_ALT : 'FFFFFFFF' },
      }
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF' + COR_TEXTO } }
      cell.alignment = {
        vertical: 'middle',
        // Centraliza colunas numéricas detectando pelo conteúdo
        horizontal: (!isNaN(Number(rowValues[colIdx - 1])) && rowValues[colIdx - 1] !== '') ? 'center' : 'left',
      }
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'FF' + COR_BORDA } },
        right:  { style: 'hair', color: { argb: 'FF' + COR_BORDA } },
      }
    })
  })

  // ── Gera o buffer e dispara o download ────────────────────────────────────
  const buf = await wb.xlsx.writeBuffer()
  baixarBlob(buf as ArrayBuffer, `${nome}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

export function exportarCSV<T extends Record<string, unknown>>(
  dados: T[],
  colunas: ColunasExport[],
  opcoes: OpcoesExport = {}
) {
  const nome = opcoes.nomeArquivo ?? 'exportacao'
  const header = colunas.map(c => `"${c.header}"`).join(',')
  const rows = linhas(dados, colunas).map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
  baixarBlob(header + '\n' + rows, `${nome}.csv`, 'text/csv;charset=utf-8;')
}

// ─── TXT (tab-separated) ─────────────────────────────────────────────────────

export function exportarTXT<T extends Record<string, unknown>>(
  dados: T[],
  colunas: ColunasExport[],
  opcoes: OpcoesExport = {}
) {
  const nome = opcoes.nomeArquivo ?? 'exportacao'
  const header = colunas.map(c => c.header).join('\t')
  const rows = linhas(dados, colunas).map(r => r.join('\t')).join('\n')
  baixarBlob(header + '\n' + rows, `${nome}.txt`, 'text/plain;charset=utf-8;')
}

// ─── XML ─────────────────────────────────────────────────────────────────────

export function exportarXML<T extends Record<string, unknown>>(
  dados: T[],
  colunas: ColunasExport[],
  opcoes: OpcoesExport = {}
) {
  const nome = opcoes.nomeArquivo ?? 'exportacao'
  const tag = nome.replace(/[^a-zA-Z0-9_]/g, '_')

  const rows = dados.map(row => {
    const campos = colunas.map(c => {
      const valor = String(row[c.key] ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
      const tagCampo = c.key.replace(/[^a-zA-Z0-9_]/g, '_')
      return `    <${tagCampo}>${valor}</${tagCampo}>`
    }).join('\n')
    return `  <item>\n${campos}\n  </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${tag}>\n${rows}\n</${tag}>`
  baixarBlob(xml, `${nome}.xml`, 'application/xml;charset=utf-8;')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

export function exportarJSON<T extends Record<string, unknown>>(
  dados: T[],
  colunas: ColunasExport[],
  opcoes: OpcoesExport = {}
) {
  const nome = opcoes.nomeArquivo ?? 'exportacao'
  const resultado = dados.map(row =>
    Object.fromEntries(colunas.map(c => [c.key, row[c.key] ?? null]))
  )
  baixarBlob(JSON.stringify(resultado, null, 2), `${nome}.json`, 'application/json;charset=utf-8;')
}

// ─── PDF (jspdf + autotable) ──────────────────────────────────────────────────

export async function exportarPDF<T extends Record<string, unknown>>(
  dados: T[],
  colunas: ColunasExport[],
  opcoes: OpcoesExport = {}
) {
  const nome = opcoes.nomeArquivo ?? 'exportacao'
  const titulo = opcoes.titulo ?? nome

  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Cabeçalho
  doc.setFontSize(16)
  doc.setTextColor(30, 41, 59)   // slate-800
  doc.text(titulo, 14, 16)

  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139) // slate-500
  const agora = new Date().toLocaleString('pt-BR')
  doc.text(`Gerado em: ${agora}`, 14, 22)

  // Tabela
  autoTable(doc, {
    startY: 28,
    head: [colunas.map(c => c.header)],
    body: linhas(dados, colunas),
    styles: {
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [15, 23, 42],    // slate-900
      textColor: [56, 189, 248],  // sky-400
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [241, 245, 249], // slate-100
    },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  })

  // Rodapé com número de páginas
  const totalPag = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let i = 1; i <= totalPag; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184) // slate-400
    doc.text(`Página ${i} de ${totalPag}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 8, { align: 'right' })
  }

  doc.save(`${nome}.pdf`)
}
