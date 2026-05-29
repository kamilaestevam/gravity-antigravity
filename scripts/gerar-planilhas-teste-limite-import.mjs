/**
 * Gera planilhas CSV + .xlsx para teste do limite de 1.000 linhas no Smart Import.
 *
 * Uso: node scripts/gerar-planilhas-teste-limite-import.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '_tmp-import-limite')

const CABECALHO = [
  'Tipo Linha',
  'Numero do Pedido',
  'Part Number',
  'Quantidade Inicial',
  'NCM',
  'Descricao do Item',
]

function linha(tipo, numeroPedido, partNumber, qtd) {
  return [
    tipo,
    numeroPedido,
    partNumber,
    qtd === '' ? '' : String(qtd),
    '84713019',
    partNumber ? `Item teste ${partNumber}` : 'Item teste ',
  ]
}

function gerarLinhas(totalLinhas) {
  const rows = [CABECALHO]
  rows.push(linha('PEDIDO', 'PO-LIMITE-TEST', '', ''))
  for (let i = 1; i < totalLinhas; i++) {
    rows.push(linha('ITEM', 'PO-LIMITE-TEST', `PN-${String(i).padStart(5, '0')}`, 1))
  }
  return rows
}

function paraCsv(rows) {
  return rows.map((r) => r.join(';')).join('\n')
}

async function paraXlsx(rows, caminho) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Pedidos')
  for (const row of rows) {
    ws.addRow(row)
  }
  ws.getRow(1).font = { bold: true }
  await wb.xlsx.writeFile(caminho)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  for (const total of [1000, 1001]) {
    const rows = gerarLinhas(total)
    const base = `import-limite-${total}-linhas`
    await writeFile(join(OUT_DIR, `${base}.csv`), paraCsv(rows), 'utf8')
    await paraXlsx(rows, join(OUT_DIR, `${base}.xlsx`))
    console.log(`[ok] ${base}.csv + ${base}.xlsx (${total} linhas)`)
  }

  console.log('\nPasta:', OUT_DIR)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
