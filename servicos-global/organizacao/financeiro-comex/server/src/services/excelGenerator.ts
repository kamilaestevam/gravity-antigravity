/**
 * excelGenerator.ts — Gerador de planilha custos_processo (Rateio)
 *
 * Gera o arquivo Excel no formato exato da planilha custos_processo
 * usado pelos analistas de importacao.
 */

import ExcelJS from 'exceljs'
import { calcularRateio } from './rateioEngine.js'
import type { ItemRateio } from './rateioEngine.js'

export interface LancamentoRateio {
  id: string
  categoria_nome: string
  moeda: string
  valor: number
  valor_brl: number
  grupo_custo: string
}

export interface ItemProcesso {
  id: string
  ncm?: string
  descricao: string
  peso_liquido: number
  peso_bruto: number
  valor_cif: number
  valor_fob: number
  quantidade: number
  valor_ii: number
}

export interface DadosProcesso {
  referencia: string
  tipo_operacao: string
  data_geracao: Date
}

/**
 * Gera planilha Excel de rateio de custos do processo
 */
export async function gerarPlanilhaRateio(
  processo: DadosProcesso,
  lancamentos: LancamentoRateio[],
  itens: ItemProcesso[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Gravity — Financeiro Comex'
  workbook.created = processo.data_geracao

  const sheet = workbook.addWorksheet('Custos do Processo', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  })

  // ── Cabecalho do Processo ──────────────────────────────────────────────────

  sheet.mergeCells('A1:H1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = `Custos do Processo — ${processo.referencia}`
  titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(1).height = 30

  sheet.getCell('A2').value = 'Processo:'
  sheet.getCell('B2').value = processo.referencia
  sheet.getCell('C2').value = 'Tipo:'
  sheet.getCell('D2').value = processo.tipo_operacao === 'IMPORTACAO' ? 'Importacao' : 'Exportacao'
  sheet.getCell('E2').value = 'Gerado em:'
  sheet.getCell('F2').value = processo.data_geracao.toLocaleDateString('pt-BR')
  sheet.getRow(2).font = { size: 10 }

  sheet.addRow([]) // linha em branco

  // ── Cabecalho da Tabela ────────────────────────────────────────────────────

  const COLUNAS_FIXAS = ['NCM', 'Descricao', 'Qtde', 'Peso Liq (kg)', 'Peso Bruto (kg)', 'Valor FOB (USD)', 'Valor CIF (BRL)']
  const COLUNAS_CUSTOS = lancamentos.map(l => `${l.categoria_nome} (${l.moeda})`)
  const TODAS_COLUNAS = [...COLUNAS_FIXAS, ...COLUNAS_CUSTOS, 'Total Custos (BRL)']

  const headerRow = sheet.addRow(TODAS_COLUNAS)
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16213E' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    }
  })
  headerRow.height = 35

  // ── Dados por Item ─────────────────────────────────────────────────────────

  const itensRateio: ItemRateio[] = itens.map(i => ({
    id: i.id,
    peso_liquido: i.peso_liquido,
    peso_bruto: i.peso_bruto,
    valor_cif: i.valor_cif,
    valor_fob: i.valor_fob,
    quantidade: i.quantidade,
    valor_ii: i.valor_ii,
  }))

  // Calcular rateio de cada lancamento pelos itens (metodo CIF por padrao)
  const mapaRateio: Map<string, Map<string, number>> = new Map()
  for (const lanc of lancamentos) {
    const resultado = calcularRateio('VALOR_CIF', lanc.valor_brl, itensRateio)
    const porItem = new Map<string, number>()
    for (const r of resultado.itens) {
      porItem.set(r.itemId, r.valor_rateado)
    }
    mapaRateio.set(lanc.id, porItem)
  }

  let isAlternate = false
  for (const item of itens) {
    const rowData: (string | number)[] = [
      item.ncm ?? '',
      item.descricao,
      item.quantidade,
      item.peso_liquido,
      item.peso_bruto,
      item.valor_fob,
      item.valor_cif,
    ]

    let totalCustosItem = 0
    for (const lanc of lancamentos) {
      const valorRateado = mapaRateio.get(lanc.id)?.get(item.id) ?? 0
      rowData.push(valorRateado)
      totalCustosItem += valorRateado
    }
    rowData.push(Math.round(totalCustosItem * 100) / 100)

    const dataRow = sheet.addRow(rowData)
    const bgColor = isAlternate ? 'FFF5F5F5' : 'FFFFFFFF'
    dataRow.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
      cell.border = {
        top: { style: 'hair' }, bottom: { style: 'hair' },
        left: { style: 'thin' }, right: { style: 'thin' },
      }
      if (colNumber > 2) cell.numFmt = '#,##0.00'
      cell.alignment = { vertical: 'middle' }
    })
    isAlternate = !isAlternate
  }

  // ── Linha de Totais ────────────────────────────────────────────────────────

  const totalRow: (string | number)[] = ['', 'TOTAL', '', '', '', '', '']
  let grandTotal = 0
  for (const lanc of lancamentos) {
    totalRow.push(lanc.valor_brl)
    grandTotal += lanc.valor_brl
  }
  totalRow.push(Math.round(grandTotal * 100) / 100)

  const totaisRow = sheet.addRow(totalRow)
  totaisRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } }
    cell.border = {
      top: { style: 'medium' }, bottom: { style: 'medium' },
      left: { style: 'thin' }, right: { style: 'thin' },
    }
    if (colNumber > 2) cell.numFmt = '#,##0.00'
  })

  // Ajustar largura das colunas
  sheet.columns.forEach((col, idx) => {
    if (idx < 2) col.width = 30
    else if (idx < 7) col.width = 16
    else col.width = 22
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
