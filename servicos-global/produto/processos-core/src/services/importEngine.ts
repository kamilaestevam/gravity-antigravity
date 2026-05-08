/**
 * importEngine.ts — Parser multi-formato para importacao de pedidos
 *
 * Formatos suportados: Excel (.xlsx, .xls), CSV, XML, TXT, JSON
 * Fluxo: Upload -> Parse -> Normalize -> Preview -> Confirmacao
 *
 * Dependencias externas:
 *   - xlsx (SheetJS) para Excel
 *   - csv-parse para CSV (ou parse manual)
 *   - xml2js para XML (ou parse manual)
 *
 * Este engine faz parse basico sem dependencias externas pesadas.
 * Para producao, instalar xlsx e csv-parse.
 */

import { AppError } from './saldo-pedido.js'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface PedidoImportado {
  numero_pedido: string
  tipo_operacao: 'importacao' | 'exportacao'
  exportador?: string
  fabricante?: string
  incoterm?: string
  moeda_pedido?: string
  referencia_importador?: string
  referencia_exportador?: string
  referencia_fabricante?: string
  numero_proforma?: string
  numero_invoice?: string
  data_emissao_pedido?: string
  itens: ItemImportado[]
}

export interface ItemImportado {
  part_number: string
  ncm: string
  descricao_item: string
  quantidade_inicial_pedido: number
  unidade_comercializada_item?: string
  valor_unitario_item?: number
  valor_total_itens?: number
}

interface MapeamentoColunas {
  [campo_interno: string]: string // campo_interno -> nome_coluna_arquivo
}

// ── Mapeamento padrao (nomes mais comuns em arquivos COMEX) ────────────────────

const MAPEAMENTO_PADRAO: MapeamentoColunas = {
  numero_pedido: 'numero_pedido|pedido|po|po_number|purchase_order|order_number|numero',
  tipo_operacao: 'tipo_operacao|tipo|operacao|type',
  exportador: 'exportador|fornecedor|supplier|exporter|vendor',
  fabricante: 'fabricante|manufacturer|factory|fabrica',
  incoterm: 'incoterm|incoterms|termo',
  moeda_pedido: 'moeda|moeda_pedido|currency|coin',
  referencia_importador: 'ref_importador|referencia_importador|buyer_ref',
  referencia_exportador: 'ref_exportador|referencia_exportador|seller_ref|supplier_ref',
  referencia_fabricante: 'ref_fabricante|referencia_fabricante|manufacturer_ref',
  numero_proforma: 'proforma|numero_proforma|proforma_number|pi_number',
  numero_invoice: 'invoice|numero_invoice|invoice_number|ci_number',
  data_emissao_pedido: 'data|data_pedido|data_emissao|date|po_date|order_date',
  part_number: 'part_number|sku|codigo|code|item_code|produto',
  ncm: 'ncm|hs_code|hts|tariff|classificacao',
  descricao_item: 'descricao|description|desc|produto|product|item',
  quantidade_inicial_pedido: 'quantidade|qty|quantity|qtd|quantidade_inicial_pedido',
  unidade_comercializada_item: 'unidade|uom|unit|um|medida',
  valor_unitario_item: 'valor_unitario_item|unit_price|preco|price|unit_value',
  valor_total_itens: 'valor_total|total|valor_item|total_value|amount',
}

// ── Engine ────────────────────────────────────────────────────────────────────

export const importEngine = {
  /**
   * Detectar formato e parsear arquivo para array de rows generico
   */
  async parseArquivo(buffer: Buffer, nomeArquivo: string): Promise<Record<string, unknown>[]> {
    const ext = nomeArquivo.split('.').pop()?.toLowerCase()

    switch (ext) {
      case 'json':
        return parseJSON(buffer)
      case 'csv':
        return parseCSV(buffer)
      case 'txt':
        return parseTXT(buffer)
      case 'xml':
        return parseXML(buffer)
      case 'xlsx':
      case 'xls':
        return parseExcel(buffer)
      default:
        throw new AppError(400, `Formato .${ext} nao suportado. Use: Excel, CSV, XML, TXT ou JSON.`)
    }
  },

  /**
   * Normalizar rows genéricos em PedidoImportado[] usando mapeamento de colunas
   */
  normalizar(
    rows: Record<string, unknown>[],
    mapeamento?: MapeamentoColunas,
  ): PedidoImportado[] {
    if (rows.length === 0) return []

    const map = mapeamento ?? detectarMapeamento(rows[0])
    const pedidosMap = new Map<string, PedidoImportado>()

    for (const row of rows) {
      const numPedido = resolverCampo(row, map, 'numero_pedido')
      if (!numPedido) continue

      const key = String(numPedido)

      if (!pedidosMap.has(key)) {
        pedidosMap.set(key, {
          numero_pedido: key,
          tipo_operacao: resolverTipoOperacao(resolverCampo(row, map, 'tipo_operacao')),
          exportador: asString(resolverCampo(row, map, 'exportador')),
          fabricante: asString(resolverCampo(row, map, 'fabricante')),
          incoterm: asString(resolverCampo(row, map, 'incoterm')),
          moeda_pedido: asString(resolverCampo(row, map, 'moeda_pedido')) || 'USD',
          referencia_importador: asString(resolverCampo(row, map, 'referencia_importador')),
          referencia_exportador: asString(resolverCampo(row, map, 'referencia_exportador')),
          referencia_fabricante: asString(resolverCampo(row, map, 'referencia_fabricante')),
          numero_proforma: asString(resolverCampo(row, map, 'numero_proforma')),
          numero_invoice: asString(resolverCampo(row, map, 'numero_invoice')),
          data_emissao_pedido: asString(resolverCampo(row, map, 'data_emissao_pedido')),
          itens: [],
        })
      }

      const partNumber = resolverCampo(row, map, 'part_number')
      const descricaoItem = resolverCampo(row, map, 'descricao_item')
      const ncm = resolverCampo(row, map, 'ncm')
      const quantidade = resolverCampo(row, map, 'quantidade_inicial_pedido')

      if (partNumber || descricaoItem) {
        pedidosMap.get(key)!.itens.push({
          part_number: asString(partNumber) || 'SEM-SKU',
          ncm: asString(ncm) || '0000.00.00',
          descricao_item: asString(descricaoItem) || 'Sem descricao',
          quantidade_inicial_pedido: asNumber(quantidade) || 0,
          unidade_comercializada_item: asString(resolverCampo(row, map, 'unidade_comercializada_item')) || 'UN',
          valor_unitario_item: asNumber(resolverCampo(row, map, 'valor_unitario_item')),
          valor_total_itens: asNumber(resolverCampo(row, map, 'valor_total_itens')),
        })
      }
    }

    return Array.from(pedidosMap.values())
  },

  /**
   * Pipeline completo: parse + normalizar
   */
  async processarArquivo(
    buffer: Buffer,
    nomeArquivo: string,
    mapeamento?: MapeamentoColunas,
  ): Promise<PedidoImportado[]> {
    const rows = await this.parseArquivo(buffer, nomeArquivo)
    if (rows.length === 0) {
      throw new AppError(400, 'Arquivo vazio ou sem dados reconheciveis')
    }
    return this.normalizar(rows, mapeamento)
  },
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseJSON(buffer: Buffer): Record<string, unknown>[] {
  const text = buffer.toString('utf-8').trim()
  const parsed = JSON.parse(text)
  if (Array.isArray(parsed)) return parsed
  if (parsed.data && Array.isArray(parsed.data)) return parsed.data
  if (parsed.pedidos && Array.isArray(parsed.pedidos)) return parsed.pedidos
  throw new AppError(400, 'JSON deve conter um array de objetos ou { data: [...] }')
}

function parseCSV(buffer: Buffer): Record<string, unknown>[] {
  const text = buffer.toString('utf-8').trim()
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) throw new AppError(400, 'CSV deve ter pelo menos header + 1 linha de dados')

  const separador = detectarSeparador(lines[0])
  const headers = lines[0].split(separador).map((h) => h.trim().replace(/^"|"$/g, ''))

  return lines.slice(1).map((line) => {
    const valores = line.split(separador).map((v) => v.trim().replace(/^"|"$/g, ''))
    const row: Record<string, unknown> = {}
    headers.forEach((h, i) => {
      row[h] = valores[i] ?? null
    })
    return row
  })
}

function parseTXT(buffer: Buffer): Record<string, unknown>[] {
  // TXT usa mesmo parser que CSV (tab-separated ou pipe-separated)
  return parseCSV(buffer)
}

function parseXML(buffer: Buffer): Record<string, unknown>[] {
  const text = buffer.toString('utf-8').trim()

  // Parser XML simples — extrai tags <row> ou <pedido> ou <item>
  const rows: Record<string, unknown>[] = []
  const rowRegex = /<(?:row|pedido|item|record)[^>]*>([\s\S]*?)<\/(?:row|pedido|item|record)>/gi
  let match: RegExpExecArray | null

  while ((match = rowRegex.exec(text)) !== null) {
    const row: Record<string, unknown> = {}
    const fieldRegex = /<(\w+)>(.*?)<\/\1>/g
    let fieldMatch: RegExpExecArray | null

    while ((fieldMatch = fieldRegex.exec(match[1])) !== null) {
      row[fieldMatch[1]] = fieldMatch[2]
    }

    if (Object.keys(row).length > 0) {
      rows.push(row)
    }
  }

  if (rows.length === 0) {
    throw new AppError(400, 'XML deve conter elementos <row>, <pedido>, <item> ou <record>')
  }

  return rows
}

function parseExcel(_buffer: Buffer): Record<string, unknown>[] {
  // Em producao, usar biblioteca `xlsx` (SheetJS):
  //   import * as XLSX from 'xlsx'
  //   const workbook = XLSX.read(buffer, { type: 'buffer' })
  //   const sheet = workbook.Sheets[workbook.SheetNames[0]]
  //   return XLSX.utils.sheet_to_json(sheet)
  //
  // Por ora, retorna erro pedindo instalacao
  throw new AppError(400,
    'Parser Excel requer a biblioteca xlsx (SheetJS). ' +
    'Instale com: npm install xlsx. ' +
    'Enquanto isso, use formato CSV ou JSON.'
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectarSeparador(headerLine: string): string {
  const contagem: Record<string, number> = {
    ',': (headerLine.match(/,/g) || []).length,
    ';': (headerLine.match(/;/g) || []).length,
    '\t': (headerLine.match(/\t/g) || []).length,
    '|': (headerLine.match(/\|/g) || []).length,
  }
  return Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0]
}

function detectarMapeamento(primeiraRow: Record<string, unknown>): MapeamentoColunas {
  const colunas = Object.keys(primeiraRow)
  const map: MapeamentoColunas = {}

  for (const [campoInterno, aliases] of Object.entries(MAPEAMENTO_PADRAO)) {
    const possiveisNomes = aliases.split('|').map((a) => a.toLowerCase().trim())
    const colunaEncontrada = colunas.find((col) =>
      possiveisNomes.includes(col.toLowerCase().trim().replace(/\s+/g, '_'))
    )
    if (colunaEncontrada) {
      map[campoInterno] = colunaEncontrada
    }
  }

  return map
}

function resolverCampo(
  row: Record<string, unknown>,
  map: MapeamentoColunas,
  campo: string,
): unknown {
  const coluna = map[campo]
  if (!coluna) return undefined
  return row[coluna]
}

function resolverTipoOperacao(valor: unknown): 'importacao' | 'exportacao' {
  const str = String(valor ?? 'importacao').toLowerCase().trim()
  if (str.includes('export')) return 'exportacao'
  return 'importacao'
}

function asString(valor: unknown): string | undefined {
  if (valor === null || valor === undefined) return undefined
  return String(valor)
}

function asNumber(valor: unknown): number | undefined {
  if (valor === null || valor === undefined) return undefined
  const num = Number(String(valor).replace(/[^\d.,\-]/g, '').replace(',', '.'))
  return isNaN(num) ? undefined : num
}
