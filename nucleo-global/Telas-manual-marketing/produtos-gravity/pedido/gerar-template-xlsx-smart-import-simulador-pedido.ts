/**
 * Gera e baixa a planilha modelo (.xlsx) do Smart Import — paridade visual
 * com GET /api/v1/pedidos/importacoes-inteligentes/template (produto real).
 * SSOT de campos: servicos-global/produto/pedido/shared/campos-pedido-ddd.ts
 */

import type ExcelJS from 'exceljs'
import {
  CAMPOS_ITEM_DDD,
  CAMPOS_PEDIDO_DDD,
  FORMATO_EXCEL_POR_TIPO,
  prioridadeDeCampo,
  type CampoPedidoDDD,
} from '../../../../servicos-global/produto/pedido/shared/campos-pedido-ddd'
import {
  PRIMEIRA_LINHA_DADOS_TEMPLATE,
  ULTIMA_LINHA_DADOS_TEMPLATE,
} from '../../../../servicos-global/produto/pedido/shared/smart-import-limites'
import {
  CAMPOS_BLOQ_PARA_ITEM,
  CAMPOS_BLOQ_PARA_PEDIDO,
  templateCampoPreservaSelectOuDropdown,
} from '../../../../servicos-global/produto/pedido/shared/smart-import-template-bloqueio'

export type OpcoesGeracaoTemplateSmartImportSimulador = {
  /** Preenche linhas 3 (PEDIDO) e 4 (ITEM) com dados de demonstração. */
  preencherExemploDemonstracao?: boolean
}

const LINHA_PEDIDO_EXEMPLO = PRIMEIRA_LINHA_DADOS_TEMPLATE
const LINHA_ITEM_EXEMPLO = PRIMEIRA_LINHA_DADOS_TEMPLATE + 1

const DADOS_PEDIDO_EXEMPLO: Record<string, string | number> = {
  tipo_linha: 'PEDIDO',
  numero_pedido: 'PEDIDO1',
  tipo_operacao_pedido: 'importacao',
  nome_exportador: 'EXPORTADOR',
  nome_importador: 'IMPORTADOR',
  nome_fabricante: 'FABRICANTE',
  incoterm: 'FOB',
  moeda_pedido: 'USD — Dólar Americano',
  valor_total_pedido: 1000,
  quantidade_total_pedido: 100,
  unidade_comercializada_pedido: 'UN — Unidade',
}

/** Item sem part_number — reproduz o aviso do produto real (linha 4 com COM AVISO). */
const DADOS_ITEM_EXEMPLO: Record<string, string | number> = {
  tipo_linha: 'ITEM',
  descricao_item: 'Item de demonstração — simulador marketplace',
  quantidade_inicial_item: 100,
  valor_por_unidade_item: 10,
  valor_total_item: 1000,
  ncm_item: '84713019',
  moeda_item: 'USD — Dólar Americano',
  unidade_comercializada_item: 'UN — Unidade',
}

function preencherLinhaExemplo(
  ws: ExcelJS.Worksheet,
  camposOrdenados: CampoPedidoDDD[],
  row: number,
  dados: Record<string, string | number>,
): void {
  for (const [campo, valor] of Object.entries(dados)) {
    const idx = camposOrdenados.findIndex((c) => c.campo === campo)
    if (idx < 0) continue
    ws.getCell(row, idx + 1).value = valor
  }
}

const TEMPLATE_VERSAO = '4.1'

const OPCOES_MOEDA_TEMPLATE_SIMULADOR = [
  'USD — Dólar Americano',
  'EUR — Euro',
  'BRL — Real Brasileiro',
  'GBP — Libra Esterlina',
  'CNY — Yuan Chinês',
  'JPY — Iene Japonês',
]

const OPCOES_UNIDADE_TEMPLATE_SIMULADOR = [
  'UN — Unidade',
  'KG — Quilograma',
  'MT — Metro',
  'PC — Peça',
  'CX — Caixa',
  'PAR — Par',
]

const ordemPrioridade = { critica: 0, principal: 1, secundaria: 2 } as const

function sortPorPrioridade(a: CampoPedidoDDD, b: CampoPedidoDDD): number {
  const pa = ordemPrioridade[prioridadeDeCampo(a)]
  const pb = ordemPrioridade[prioridadeDeCampo(b)]
  if (pa !== pb) return pa - pb
  if (pa === ordemPrioridade.principal) {
    if (a.nivel === 'item' && b.nivel === 'pedido') return -1
    if (a.nivel === 'pedido' && b.nivel === 'item') return 1
  }
  return 0
}

function ordenarCamposTemplate(): CampoPedidoDDD[] {
  const todos = [...CAMPOS_PEDIDO_DDD, ...CAMPOS_ITEM_DDD]
  const camposOPE = todos.filter((c) => c.grupo === 'OPE')
  const camposNaoOPE = todos.filter((c) => c.grupo !== 'OPE').sort(sortPorPrioridade)
  return [...camposNaoOPE, ...camposOPE]
}

function dispararDownloadBuffer(buf: ArrayBuffer, nomeArquivo: string): void {
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export async function gerarBufferTemplateXlsxSmartImportSimuladorPedido(
  opcoes?: OpcoesGeracaoTemplateSmartImportSimulador,
): Promise<ArrayBuffer> {
  const ExcelJS = (await import('exceljs')).default
  const camposOrdenados = ordenarCamposTemplate()
  const totalColunas = camposOrdenados.length
  const camposNaoOPE = camposOrdenados.filter((c) => c.grupo !== 'OPE')
  const totalEssenciais = camposNaoOPE.filter((c) => prioridadeDeCampo(c) !== 'secundaria').length
  const totalDetalhes = camposNaoOPE.length - totalEssenciais
  const totalOPE = camposOrdenados.filter((c) => c.grupo === 'OPE').length

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Gravity Platform'
  wb.created = new Date()
  wb.title = `Template Importacao Pedidos v${TEMPLATE_VERSAO}`
  wb.description = `Gravity Pedido Template v${TEMPLATE_VERSAO} — simulador marketplace`
  wb.subject = 'Smart Import - Pedido'
  wb.company = 'Gravity'

  const ws = wb.addWorksheet('Pedidos', {
    views: [{ showGridLines: true, state: 'frozen', xSplit: 2, ySplit: 2 }],
  })

  ws.columns = camposOrdenados.map((c) => ({
    width: Math.max(c.rotulo.length + 4, 18),
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
    ws.mergeCells(1, totalEssenciais + 1, 1, totalEssenciais + totalDetalhes)
    const cellDetalhes = ws.getCell(1, totalEssenciais + 1)
    cellDetalhes.value = 'DETALHES  ·  expanda apenas se necessario'
    cellDetalhes.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }
    cellDetalhes.font = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FFCBD5E1' } }
    cellDetalhes.alignment = { horizontal: 'center', vertical: 'middle' }
    cellDetalhes.border = { right: { style: 'thin', color: { argb: 'FF1E293B' } } }
  }

  if (totalOPE > 0) {
    const inicioOPE = totalEssenciais + totalDetalhes + 1
    ws.mergeCells(1, inicioOPE, 1, totalColunas)
    const cellOPE = ws.getCell(1, inicioOPE)
    cellOPE.value = 'OPE  ·  Operador Estrangeiro (Receita Federal)'
    cellOPE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92400E' } }
    cellOPE.font = { name: 'Calibri', bold: true, size: 12, color: { argb: 'FFFEF3C7' } }
    cellOPE.alignment = { horizontal: 'center', vertical: 'middle' }
  }

  const linha2 = ws.getRow(2)
  linha2.height = 26
  camposOrdenados.forEach((c, i) => {
    const cell = linha2.getCell(i + 1)
    const ehItem = c.nivel === 'item'
    const ehOPE = c.grupo === 'OPE'
    const ehObrigatorio = c.obrigatorio === true
    cell.value = ehObrigatorio ? `* ${c.rotulo}` : c.rotulo

    const cores = ehOPE
      ? { fill: 'FF451A03', text: 'FFFCD34D', borda: 'FFD97706' }
      : ehItem
        ? { fill: 'FF2E1065', text: 'FFC4B5FD', borda: 'FF7C3AED' }
        : { fill: 'FF1E3A5F', text: 'FF93C5FD', borda: 'FF3B82F6' }

    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cores.fill } }
    cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: cores.text } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = { bottom: { style: 'thin', color: { argb: cores.borda } } }
  })

  const NUMFMT_NCM = '0000"."00"."00'
  camposOrdenados.forEach((c, idx) => {
    const ehNcm = c.campo === 'ncm_item' || c.campo === 'ncm_duimp'
    const numFmt = ehNcm ? NUMFMT_NCM : FORMATO_EXCEL_POR_TIPO[c.tipo]
    if (numFmt) ws.getColumn(idx + 1).numFmt = numFmt
  })

  camposOrdenados.forEach((c, idx) => {
    if (c.tipo === 'select' && c.opcoesSelect && c.opcoesSelect.length > 0) {
      const colLetter = ws.getColumn(idx + 1).letter
      for (let row = PRIMEIRA_LINHA_DADOS_TEMPLATE; row <= ULTIMA_LINHA_DADOS_TEMPLATE; row++) {
        ws.getCell(`${colLetter}${row}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [`"${c.opcoesSelect.join(',')}"`],
          showErrorMessage: true,
          errorStyle: 'error',
          errorTitle: 'Valor invalido',
          error: `Valores aceitos: ${c.opcoesSelect.join(', ')}`,
        }
      }
    }
  })

  const wsListas = wb.addWorksheet('_Listas', { state: 'veryHidden' })
  OPCOES_MOEDA_TEMPLATE_SIMULADOR.forEach((cod, i) => {
    wsListas.getCell(i + 1, 1).value = cod
  })
  OPCOES_UNIDADE_TEMPLATE_SIMULADOR.forEach((cod, i) => {
    wsListas.getCell(i + 1, 2).value = cod
  })
  const rangeMoeda = `'_Listas'!$A$1:$A$${OPCOES_MOEDA_TEMPLATE_SIMULADOR.length}`
  const rangeUnidade = `'_Listas'!$B$1:$B$${OPCOES_UNIDADE_TEMPLATE_SIMULADOR.length}`

  camposOrdenados.forEach((c, idx) => {
    if (!c.dropdownDinamico) return
    const ref = c.dropdownDinamico === 'moeda' ? rangeMoeda
      : c.dropdownDinamico === 'unidade' ? rangeUnidade
        : null
    if (!ref) return
    const colLetter = ws.getColumn(idx + 1).letter
    for (let row = PRIMEIRA_LINHA_DADOS_TEMPLATE; row <= ULTIMA_LINHA_DADOS_TEMPLATE; row++) {
      ws.getCell(`${colLetter}${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [ref],
        showErrorMessage: true,
        errorStyle: 'warning',
        errorTitle: 'Valor nao encontrado',
        error: `Valor nao corresponde a nenhuma ${c.dropdownDinamico} ativa no Cadastros.`,
      }
    }
  })

  camposOrdenados.forEach((c, idx) => {
    if (c.campo !== 'ncm_duimp' && c.campo !== 'ncm_item') return
    const colLetter = ws.getColumn(idx + 1).letter
    for (let row = PRIMEIRA_LINHA_DADOS_TEMPLATE; row <= ULTIMA_LINHA_DADOS_TEMPLATE; row++) {
      ws.getCell(`${colLetter}${row}`).dataValidation = {
        type: 'custom',
        allowBlank: true,
        formulae: [`OR(LEN(SUBSTITUTE(SUBSTITUTE(${colLetter}${row},".","")," ",""))=8,${colLetter}${row}="")`],
        showErrorMessage: true,
        errorStyle: 'stop',
        errorTitle: 'Formato NCM invalido',
        error: 'NCM deve ter exatamente 8 digitos numericos (ex: 84713019 ou 8471.30.19).',
      }
    }
  })

  const colTipoLinha = ws.getColumn(1).letter
  camposOrdenados.forEach((c, idx) => {
    const colLetter = ws.getColumn(idx + 1).letter
    const ehBloqItem = CAMPOS_BLOQ_PARA_ITEM.has(c.campo)
    const ehBloqPedido = CAMPOS_BLOQ_PARA_PEDIDO.has(c.campo)
    if (!ehBloqItem && !ehBloqPedido) return
    const preservarSelect = templateCampoPreservaSelectOuDropdown(c)
    for (let row = PRIMEIRA_LINHA_DADOS_TEMPLATE; row <= ULTIMA_LINHA_DADOS_TEMPLATE; row++) {
      const cell = ws.getCell(`${colLetter}${row}`)
      if (ehBloqItem) {
        if (!preservarSelect) {
          cell.dataValidation = {
            type: 'custom',
            allowBlank: true,
            formulae: [`$${colTipoLinha}${row}<>"ITEM"`],
            showErrorMessage: true,
            errorStyle: 'stop',
            errorTitle: 'Campo exclusivo de PEDIDO',
            error: 'Este campo pertence ao Pedido (linha pai). Nao pode ser preenchido em linhas de ITEM.',
          }
        }
      } else if (ehBloqPedido) {
        if (!preservarSelect) {
          cell.dataValidation = {
            type: 'custom',
            allowBlank: true,
            formulae: [`$${colTipoLinha}${row}<>"PEDIDO"`],
            showErrorMessage: true,
            errorStyle: 'stop',
            errorTitle: 'Campo exclusivo de ITEM',
            error: 'Este campo pertence ao Item (linha filha). Nao pode ser preenchido em linhas de PEDIDO.',
          }
        }
      }
    }
  })

  const estiloBloqueado: ExcelJS.ConditionalFormattingRule['style'] = {
    fill: { type: 'pattern' as const, pattern: 'solid' as const, bgColor: { argb: 'FF1E293B' } },
    font: { color: { argb: 'FF475569' } },
  }
  camposOrdenados.forEach((c, idx) => {
    const colLetter = ws.getColumn(idx + 1).letter
    const ehBloqItem = CAMPOS_BLOQ_PARA_ITEM.has(c.campo)
    const ehBloqPedido = CAMPOS_BLOQ_PARA_PEDIDO.has(c.campo)
    if (!ehBloqItem && !ehBloqPedido) return
    const ref = `${colLetter}${PRIMEIRA_LINHA_DADOS_TEMPLATE}:${colLetter}${ULTIMA_LINHA_DADOS_TEMPLATE}`
    const formula = ehBloqItem
      ? `$${colTipoLinha}${PRIMEIRA_LINHA_DADOS_TEMPLATE}="ITEM"`
      : `$${colTipoLinha}${PRIMEIRA_LINHA_DADOS_TEMPLATE}="PEDIDO"`
    ws.addConditionalFormatting({
      ref,
      rules: [{ type: 'expression', formulae: [formula], style: estiloBloqueado, priority: 1 }],
    })
  })

  const linhaPedidoExemplo = ws.getRow(LINHA_PEDIDO_EXEMPLO)
  linhaPedidoExemplo.height = 20
  linhaPedidoExemplo.font = { name: 'Calibri', bold: true, size: 11 }

  const linhaItemExemplo = ws.getRow(LINHA_ITEM_EXEMPLO)
  linhaItemExemplo.height = 18
  linhaItemExemplo.font = { name: 'Calibri', bold: false, size: 11 }

  if (opcoes?.preencherExemploDemonstracao) {
    preencherLinhaExemplo(ws, camposOrdenados, LINHA_PEDIDO_EXEMPLO, DADOS_PEDIDO_EXEMPLO)
    preencherLinhaExemplo(ws, camposOrdenados, LINHA_ITEM_EXEMPLO, DADOS_ITEM_EXEMPLO)
  }

  return wb.xlsx.writeBuffer() as Promise<ArrayBuffer>
}

export async function baixarTemplateXlsxSmartImportSimuladorPedido(): Promise<void> {
  const buf = await gerarBufferTemplateXlsxSmartImportSimuladorPedido()
  dispararDownloadBuffer(buf, 'template-importacao-pedidos.xlsx')
}
