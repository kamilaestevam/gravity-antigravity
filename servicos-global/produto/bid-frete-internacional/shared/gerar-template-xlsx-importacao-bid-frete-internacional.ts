/**
 * Gera planilha modelo (.xlsx) — Planilha Base Gravity
 * Selects + numFmt paridade Pedido Smart Import.
 */

import type ExcelJS from 'exceljs'
import {
  CAMPOS_TEMPLATE_GRAVITY_META,
  rotuloTemplateImportacaoBid,
  type CampoImportacaoBidMeta,
} from './campos-importacao-bid-frete-internacional'
import { LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID } from './parsear-planilha-importacao-bid-frete-internacional'
import {
  FORMATO_EXCEL_CAMPO_BID,
  listasCadastrosPadraoTemplateBid,
  SELECT_TEMPLATE_BID,
  type ConfigSelectTemplateBid,
  type ListasCadastrosTemplateBid,
} from './template-importacao-config-bid-frete-internacional'
import {
  PRIMEIRA_LINHA_DADOS_TEMPLATE_BID,
  TEMPLATE_BID_VERSAO,
  ULTIMA_LINHA_DADOS_TEMPLATE_BID,
} from './template-importacao-limites-bid-frete-internacional'
import type { CampoImportacaoBidFreteInternacional } from './tipos-importacao-bid-frete-internacional'

const VALORES_ACEITOS: Partial<Record<CampoImportacaoBidFreteInternacional, string>> = {
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO | EXPORTACAO',
  status_cotacao_bid_frete_internacional: 'RASCUNHO, ENVIADA_FORNECEDORES, EM_COTACAO, …',
  modal_cotacao_bid_frete_internacional: 'MARITIMO | AEREO | RODOVIARIO',
  modalidade_cotacao_bid_frete_internacional: 'FCL | LCL | AEREO_GERAL | RODOVIARIO_FTL | RODOVIARIO_LTL',
  porto_origem_cotacao_bid_frete_internacional: 'Lista Cadastros — UN/LOCODE',
  porto_destino_cotacao_bid_frete_internacional: 'Lista Cadastros — UN/LOCODE',
  aeroporto_origem_cotacao_bid_frete_internacional: 'Lista Cadastros — IATA',
  aeroporto_destino_cotacao_bid_frete_internacional: 'Lista Cadastros — IATA',
  origem_pais_cotacao_bid_frete_internacional: 'Lista Cadastros — ISO alpha-2',
  destino_pais_cotacao_bid_frete_internacional: 'Lista Cadastros — ISO alpha-2',
  tipo_container_cotacao_bid_frete_internacional: 'Lista Cadastros — ISO container',
  incoterm_cotacao_bid_frete_internacional: 'EXW, FCA, FOB, CIF, …',
  quantidade_volume_cotacao_bid_frete_internacional: 'Número inteiro > 0',
  ncm_cotacao_bid_frete_internacional: '8 dígitos — ex: 8708.99.90',
  peso_kg_cotacao_bid_frete_internacional: 'Número decimal',
  cubagem_m3_cotacao_bid_frete_internacional: 'Número decimal (m³)',
  valor_meta_cotacao_bid_frete_internacional: 'Número decimal',
  moeda_meta_cotacao_bid_frete_internacional: 'USD, EUR, BRL, GBP, CNY',
  visibilidade_cotacao_bid_frete_internacional: 'DIRECIONADA | ABERTA',
  anonima_cotacao_bid_frete_internacional: 'Sim | Nao',
  data_limite_resposta_cotacao_bid_frete_internacional: 'Data — dd/mm/aaaa',
  data_aprovacao_cotacao_bid_frete_internacional: 'Data — dd/mm/aaaa',
  data_cancelamento_cotacao_bid_frete_internacional: 'Data — dd/mm/aaaa',
}

type RangeLista = Partial<Record<keyof ListasCadastrosTemplateBid, string>>

function valorCelulaExemplo(
  campo: CampoImportacaoBidFreteInternacional,
  raw: string,
): string | number | undefined {
  if (!raw) return undefined
  const fmt = FORMATO_EXCEL_CAMPO_BID[campo]
  if (fmt === '#,##0' || fmt === '#,##0.00' || fmt === '#,##0.000') {
    const n = Number(String(raw).replace(/\./g, '').replace(',', '.'))
    return Number.isFinite(n) ? n : raw
  }
  return raw
}

function preencherAbaListas(
  wb: ExcelJS.Workbook,
  listas: ListasCadastrosTemplateBid,
): RangeLista {
  const ranges: RangeLista = {}
  const chaves = ['portos', 'aeroportos', 'paises', 'containers', 'moedas'] as const
  const temAlguma = chaves.some(k => listas[k].length > 0)
  if (!temAlguma) return ranges

  const wsListas = wb.addWorksheet('_Listas', { state: 'veryHidden' })
  let colAtual = 1

  for (const chave of chaves) {
    const itens = listas[chave]
    if (itens.length === 0) continue
    itens.forEach((valor, i) => {
      wsListas.getCell(i + 1, colAtual).value = valor
    })
    const colLetra = wsListas.getColumn(colAtual).letter
    ranges[chave] = `'_Listas'!$${colLetra}$1:$${colLetra}$${itens.length}`
    colAtual++
  }

  return ranges
}

function aplicarValidacaoSelect(
  ws: ExcelJS.Worksheet,
  colLetter: string,
  config: ConfigSelectTemplateBid,
  ranges: RangeLista,
  allowBlank: boolean,
  rotulo: string,
): void {
  let formulae: string[]
  if (config.tipo === 'inline') {
    formulae = [`"${config.opcoes.join(',')}"`]
  } else {
    const ref = ranges[config.chave]
    if (!ref) return
    formulae = [ref]
  }

  for (let row = PRIMEIRA_LINHA_DADOS_TEMPLATE_BID; row <= ULTIMA_LINHA_DADOS_TEMPLATE_BID; row++) {
    ws.getCell(`${colLetter}${row}`).dataValidation = {
      type: 'list',
      allowBlank,
      formulae,
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Valor inválido',
      error: `Selecione um valor válido para ${rotulo}.`,
    }
  }
}

function aplicarFormatosColuna(
  ws: ExcelJS.Worksheet,
  campos: readonly CampoImportacaoBidMeta[],
): void {
  campos.forEach((meta, idx) => {
    const numFmt = FORMATO_EXCEL_CAMPO_BID[meta.campo]
    if (numFmt) {
      ws.getColumn(idx + 1).numFmt = numFmt
    }
  })
}

function aplicarValidacoesSelect(
  ws: ExcelJS.Worksheet,
  campos: readonly CampoImportacaoBidMeta[],
  ranges: RangeLista,
): void {
  campos.forEach((meta, idx) => {
    const config = SELECT_TEMPLATE_BID[meta.campo]
    if (!config) return
    const colLetter = ws.getColumn(idx + 1).letter
    aplicarValidacaoSelect(ws, colLetter, config, ranges, !meta.obrigatorio, meta.rotulo)
  })
}

export async function gerarBufferTemplateXlsxGravity(
  listasEntrada?: ListasCadastrosTemplateBid,
): Promise<ArrayBuffer> {
  const listas = listasEntrada ?? listasCadastrosPadraoTemplateBid()
  const ExcelJSModule = (await import('exceljs')).default
  const wb = new ExcelJSModule.Workbook()
  wb.creator = 'Gravity Platform'
  wb.created = new Date()
  wb.title = `Template Importacao BID Frete v${TEMPLATE_BID_VERSAO}`
  wb.description = `Gravity BID Frete Template v${TEMPLATE_BID_VERSAO} — selects e formatos paridade Pedido.`
  wb.subject = 'Smart Import - BID Frete Internacional'
  wb.company = 'Gravity'

  const campos = CAMPOS_TEMPLATE_GRAVITY_META
  const totalColunas = campos.length
  const totalEssenciais = campos.filter(c => c.grupo === 'essencial').length
  const totalDetalhes = totalColunas - totalEssenciais

  const ws = wb.addWorksheet('Cotações', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 2 }],
  })

  ws.columns = campos.map(meta => ({
    width: Math.max(meta.rotulo.length + 6, 18),
  }))

  const linha1 = ws.getRow(1)
  linha1.height = 28

  ws.mergeCells(1, 1, 1, totalEssenciais)
  const cellEssencial = ws.getCell(1, 1)
  cellEssencial.value = 'ESSENCIAL  ·  preencha este bloco'
  cellEssencial.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E7490' } }
  cellEssencial.font = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FFE0F2FE' } }
  cellEssencial.alignment = { horizontal: 'center', vertical: 'middle' }
  cellEssencial.border = { right: { style: 'thin', color: { argb: 'FF1E293B' } } }

  if (totalDetalhes > 0) {
    ws.mergeCells(1, totalEssenciais + 1, 1, totalColunas)
    const cellDetalhes = ws.getCell(1, totalEssenciais + 1)
    cellDetalhes.value = 'DETALHES  ·  expanda apenas se necessario'
    cellDetalhes.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
    cellDetalhes.font = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FFCBD5E1' } }
    cellDetalhes.alignment = { horizontal: 'center', vertical: 'middle' }
  }

  const linha2 = ws.getRow(2)
  linha2.height = 26
  campos.forEach((meta, idx) => {
    const cell = linha2.getCell(idx + 1)
    const ehDetalhes = meta.grupo === 'detalhes'
    cell.value = rotuloTemplateImportacaoBid(meta)
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: ehDetalhes ? 'FF334155' : 'FF1E3A5F' },
    }
    cell.font = {
      name: 'Calibri',
      bold: true,
      size: 11,
      color: { argb: ehDetalhes ? 'FFCBD5E1' : 'FF93C5FD' },
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = { bottom: { style: 'thin', color: { argb: ehDetalhes ? 'FF64748B' : 'FF3B82F6' } } }
  })

  for (let row = PRIMEIRA_LINHA_DADOS_TEMPLATE_BID; row <= ULTIMA_LINHA_DADOS_TEMPLATE_BID; row++) {
    campos.forEach((meta, idx) => {
      const cell = ws.getCell(row, idx + 1)
      if (row === PRIMEIRA_LINHA_DADOS_TEMPLATE_BID) {
        const exemplo = LINHA_EXEMPLO_TEMPLATE_IMPORTACAO_BID[meta.campo]
        if (exemplo) cell.value = valorCelulaExemplo(meta.campo, exemplo)
      }
    })
    if (row === PRIMEIRA_LINHA_DADOS_TEMPLATE_BID) {
      ws.getRow(row).font = {
        name: 'Calibri',
        italic: true,
        size: 10,
        color: { argb: 'FF64748B' },
      }
    }
  }

  aplicarFormatosColuna(ws, campos)
  const ranges = preencherAbaListas(wb, listas)
  aplicarValidacoesSelect(ws, campos, ranges)

  const wsInfo = wb.addWorksheet('Instruções')
  wsInfo.getColumn(1).width = 36
  wsInfo.getColumn(2).width = 44
  wsInfo.getColumn(3).width = 12
  wsInfo.getColumn(4).width = 48

  const headerFill = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FF312E81' },
  }
  const headerFont = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FFFFFFFF' } }

  ;['Campo (cabeçalho)', 'Nome interno', 'Obrigatório', 'Valores aceitos'].forEach((titulo, idx) => {
    const cell = wsInfo.getCell(1, idx + 1)
    cell.value = titulo
    cell.fill = headerFill
    cell.font = headerFont
  })

  campos.forEach((meta, rowIdx) => {
    const row = rowIdx + 2
    wsInfo.getCell(row, 1).value = rotuloTemplateImportacaoBid(meta)
    wsInfo.getCell(row, 2).value = meta.campo
    wsInfo.getCell(row, 3).value = meta.obrigatorio ? 'Sim' : 'Não'
    wsInfo.getCell(row, 4).value = VALORES_ACEITOS[meta.campo] ?? 'Texto livre'
  })

  const buf = await wb.xlsx.writeBuffer()
  return buf as ArrayBuffer
}

function dispararDownloadBuffer(buf: ArrayBuffer, nomeArquivo: string): void {
  const blob = new Blob(
    [buf],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function baixarTemplateXlsxGravity(
  listasEntrada?: ListasCadastrosTemplateBid,
): Promise<void> {
  const buf = await gerarBufferTemplateXlsxGravity(listasEntrada)
  dispararDownloadBuffer(buf, 'template-importacao-bid-frete.xlsx')
}
