/**
 * importEngine.ts — Parser multi-formato de arquivos de pedido
 *
 * Formatos suportados:
 *   - xlsx / xls (SheetJS)
 *   - csv (auto-detecta separador: , ; \t |)
 *   - xml (simples, tag por linha)
 *   - json
 *   - txt (tabulado)
 *   - pdf (demonstracao — parsing real requer biblioteca adicional)
 *
 * Retorna sempre Array<Record<string, string>> — cabecalhos como chaves.
 */

import { createHash } from 'node:crypto'

// ── Aliases conhecidos de campos para sugestao de mapeamento ─────────────────

export const ALIASES_CAMPOS: Record<string, string[]> = {
  numero_pedido: [
    'po number', 'po no', 'purchase order', 'order number', 'order no',
    'numero pedido', 'num pedido', 'po#', 'so number', 'so no', 'sales order',
    'referencia', 'ref pedido', 'num po', 'n pedido', 'n. pedido',
    'purchase order number', 'po num', 'order ref',
    'your ref', 'internal ref', 'buyer ref', 'zbuyer ref', 'po ref',
  ],
  tipo_operacao: ['type', 'tipo', 'operation', 'operacao', 'import/export'],
  exportador: [
    'supplier', 'vendor', 'fornecedor', 'exportador', 'seller', 'shipper',
    'exporter', 'nome exportador', 'company', 'empresa', 'nome empresa', 'supply company',
    'vendor name', 'supplier name', 'zvendor name',
  ],
  // fabricante NÃO é alias de exportador — campos distintos
  fabricante: ['manufacturer', 'fabricante', 'maker', 'brand', 'produced by', 'factory'],
  incoterm: ['incoterm', 'incoterms', 'delivery terms', 'trade terms', 'zincoterms'],
  data_emissao_pedido: [
    'order date', 'po date', 'issue date',
    'data emissao', 'data emissão', 'data pedido',
    'data do pedido', 'data criacao', 'emissao', 'emissão', 'data emissao pedido',
    'doc date', 'zdoc date', 'docdate', 'invoice date',
  ],
  data_embarque: [
    'ship date', 'shipment date', 'etd', 'eta', 'data embarque',
    'data envio', 'expected ship', 'delivery date',
    'previsao embarque', 'prev embarque', 'embarcamento',
  ],
  part_number: [
    'part number', 'part no', 'part#', 'sku', 'item code', 'product code',
    'codigo', 'codigo produto', 'item number', 'reference', 'part num',
    'ref', 'material', 'zmatnr', 'sku no', 'mat no', 'mat number',
  ],
  ncm: [
    'ncm', 'hs code', 'hs', 'harmonized code', 'tariff code', 'classificacao',
    'customs tariff', 'tariff', 'h.s. code', 'tariff no', 'zwaers',
  ],
  descricao_item: [
    'description', 'desc', 'item description', 'product description',
    'descricao', 'descricão', 'product name',
    'descr', 'produto', 'product', 'goods description',
    'article', 'item desc', 'zmaktx', 'text', 'goods', 'item name',
  ],
  quantidade_inicial_pedido: [
    'qty', 'quantity', 'qtd', 'quantidade', 'ordered qty',
    'order qty', 'qtde',
    'qtd pedida', 'qtd inicial', 'pcs', 'pieces', 'count',
    'quantidade inicial item pedido',
    'zmenge', 'menge', 'no of pcs', 'number of pcs',
  ],
  moeda_pedido: [
    'currency', 'moeda', 'curr', 'curr code', 'currency code',
    'moeda pedido', 'moeda da compra', 'coin',
    'ccy', 'zcurr',
  ],
  valor_por_unidade_item: [
    'unit price', 'unit value', 'valor unitario', 'preco unitario',
    'price', 'unit cost', 'valor por unidade', 'valor unit',
    'unit amt', 'unit amount', 'preco unit',
    'net price', 'netprice', 'price per unit', 'priceperunit',
    'price unit', 'priceunit', 'unit rate',
    'znetpr', 'netpr',
    'fob usd', 'eur/pc', 'eur/set', 'eur/un', 'eur/pcs', 'usd/pc', 'usd/un',
  ],
  valor_total_item: [
    'total value', 'total amount', 'valor total', 'total price',
    'amount', 'line total', 'ext price', 'extended price',
    'total item', 'item total', 'valor total item',
    'linetotal', 'linevalue', 'line value', 'zwrbtr', 'wrbtr',
    'total', 'value', 'fob total', 'fob value',
  ],
  unidade_comercializada_item: [
    'unit', 'uom', 'unit of measure', 'unidade', 'und', 'um',
    'unit measure', 'unid', 'unidade comercializada',
    'zmeins', 'packing unit',
  ],
  peso_liquido_unitario: [
    'weight', 'weight kg', 'net weight', 'net weight kg', 'netweightkg',
    'peso', 'peso liquido', 'peso liq', 'peso unitario',
    'znetgw', 'netgw', 'gross weight', 'gw kg',
  ],
  sequencia_item: [
    'line', 'line no', 'lineno', 'line number', 'no', 'seq', 'item no',
    'item number', 'seq item', 'sequencia', '#',
  ],
  numero_invoice: [
    'invoice no', 'invoice number', 'inv no', 'inv number', 'numero invoice', 'nf',
  ],
  referencia_exportador: [
    'seller ref', 'supplier ref', 'vendor ref', 'your invoice',
    'our ref', 'our inv', 'our invoice', 'ref exportador',
    'id', 'record id', 'rec id', 'erp id', 'sap id',
  ],
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type LinhaArquivo = Record<string, string>

export interface ParseResultado {
  linhas: LinhaArquivo[]
  extrator_usado: string
}

// ── Parser principal ──────────────────────────────────────────────────────────

export async function parseArquivo(
  buffer: Buffer,
  nomeArquivo: string,
  nomePlanilha?: string,
): Promise<ParseResultado> {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''

  switch (ext) {
    case 'xlsx':
    case 'xls': {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = nomePlanilha && workbook.SheetNames.includes(nomePlanilha)
        ? nomePlanilha
        : workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
      return {
        linhas: rows.map(row =>
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [String(k), String(v ?? '')])
          )
        ),
        extrator_usado: ext,
      }
    }

    case 'csv': {
      return { linhas: parseCsv(buffer.toString('utf-8')), extrator_usado: ext }
    }

    case 'txt': {
      return { linhas: parseTxt(buffer.toString('utf-8')), extrator_usado: 'txt' }
    }

    case 'json': {
      const parsed: unknown = JSON.parse(buffer.toString('utf-8'))
      const rows = Array.isArray(parsed)
        ? parsed as Record<string, unknown>[]
        : (() => {
            const found = encontrarArrayAninhado(parsed as Record<string, unknown>)
            if (!found) throw new Error('JSON não contém array de objetos')
            return found
          })()
      return {
        linhas: rows.map(row => {
          const flat = aplainarCampos(row as Record<string, unknown>)
          return Object.fromEntries(
            Object.entries(flat).map(([k, v]) => [String(k), String(v ?? '')])
          )
        }),
        extrator_usado: 'json',
      }
    }

    case 'xml': {
      return { linhas: parseXml(buffer.toString('utf-8')), extrator_usado: 'xml' }
    }

    case 'pdf': {
      // Tentar extração via Gemini (GEMINI_PDF_ENABLED=true no .env)
      try {
        const { extrairPdfComGemini } = await import('./geminiPdfExtractor.js')
        const gemini = await extrairPdfComGemini(buffer)
        if (gemini) return { linhas: gemini.linhas, extrator_usado: 'gemini' }
      } catch (geminiImportErr: unknown) {
        const msg = geminiImportErr instanceof Error ? geminiImportErr.message : String(geminiImportErr)
        console.warn(`[PDF] Falha ao carregar extrator Gemini (${msg}) — tentando parser local`)
      }

      // Fallback: parser local de texto
      try {
        const { PDFParse } = await import('pdf-parse')
        const parser = new PDFParse({ data: buffer })
        // parser.load() é private — getText() o chama internamente
        const result = await parser.getText()
        return { linhas: parsePdfText(result.text), extrator_usado: 'pdf-parse' }
      } catch (pdfErr: unknown) {
        const msg = pdfErr instanceof Error ? pdfErr.message : String(pdfErr)
        console.warn(`[PDF] Parser local falhou (${msg}) — retornando aviso`)
        return {
          linhas: [{
            _aviso: 'PDF nao pode ser lido automaticamente. Use Excel ou CSV para melhores resultados.',
            _conteudo: `Erro: ${msg}`,
          }],
          extrator_usado: 'pdf-erro',
        }
      }
    }

    default:
      throw new Error(`Formato .${ext} nao suportado`)
  }
}

// ── Listar abas de workbook Excel ─────────────────────────────────────────────

export async function listarPlanilhas(buffer: Buffer, nomeArquivo: string): Promise<string[]> {
  const ext = nomeArquivo.split('.').pop()?.toLowerCase() ?? ''
  if (ext !== 'xlsx' && ext !== 'xls') return []
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  return workbook.SheetNames
}

// ── Parser CSV — auto-detecta separador ──────────────────────────────────────

function parseCsv(conteudo: string): LinhaArquivo[] {
  const linhas = conteudo.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (linhas.length < 2) return []

  // Detectar separador pela primeira linha
  const primeiraLinha = linhas[0]
  const separador = detectarSeparador(primeiraLinha)

  const cabecalhos = splitLinha(primeiraLinha, separador)
  const resultado: LinhaArquivo[] = []

  for (let i = 1; i < linhas.length; i++) {
    const valores = splitLinha(linhas[i], separador)
    if (valores.every(v => v.trim() === '')) continue
    const obj: LinhaArquivo = {}
    cabecalhos.forEach((cab, idx) => {
      obj[cab.trim()] = (valores[idx] ?? '').trim()
    })
    resultado.push(obj)
  }

  return resultado
}

function detectarSeparador(linha: string): string {
  const candidatos = [';', ',', '\t', '|']
  let melhor = ','
  let melhorCount = 0
  for (const sep of candidatos) {
    const count = (linha.match(new RegExp(`\\${sep}`, 'g')) ?? []).length
    if (count > melhorCount) { melhorCount = count; melhor = sep }
  }
  return melhor
}

function splitLinha(linha: string, sep: string): string[] {
  // Respeita aspas duplas
  const resultado: string[] = []
  let atual = ''
  let dentroAspas = false
  for (const ch of linha) {
    if (ch === '"') { dentroAspas = !dentroAspas; continue }
    if (ch === sep && !dentroAspas) { resultado.push(atual); atual = ''; continue }
    atual += ch
  }
  resultado.push(atual)
  return resultado
}

// ── Helper JSON — achata objetos aninhados em 1 nível (ex: SAP fields) ────────

function aplainarCampos(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(row)) {
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      // Merge sub-object keys into parent (ex: {fields: {ZMATNR: ...}} → {ZMATNR: ...})
      for (const [sk, sv] of Object.entries(v as Record<string, unknown>)) {
        result[sk] = sv
      }
    } else {
      result[k] = v
    }
  }
  return result
}

// ── Helper JSON — busca recursiva pelo primeiro array de objetos ──────────────

function encontrarArrayAninhado(obj: Record<string, unknown>): Record<string, unknown>[] | null {
  for (const val of Object.values(obj)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      return val as Record<string, unknown>[]
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const found = encontrarArrayAninhado(val as Record<string, unknown>)
      if (found) return found
    }
  }
  return null
}

// ── Parser XML — suporte a múltiplos níveis de aninhamento ───────────────────

function parseXml(conteudo: string): LinhaArquivo[] {
  const xml = conteudo
    .replace(/<\?xml[^?]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()

  // Contar ocorrências de cada tag para encontrar a tag de item repetida
  const tagCounts = new Map<string, number>()
  const tagRegex = /<(\w+)[\s/>]/g
  let m: RegExpExecArray | null
  while ((m = tagRegex.exec(xml)) !== null) {
    tagCounts.set(m[1], (tagCounts.get(m[1]) ?? 0) + 1)
  }

  // Tag com mais repetições (>1) = item de linha
  const candidatos = [...tagCounts.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1])
  const itemTag = candidatos[0]?.[0]

  if (!itemTag) {
    // XML sem repetição — trata como 1 registro flat
    const flat = extrairCamposFlat(xml)
    return Object.keys(flat).length > 0 ? [flat] : []
  }

  // Extrair todos os blocos <itemTag>...</itemTag>
  const blocoRegex = new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, 'g')
  const registros: LinhaArquivo[] = []
  while ((m = blocoRegex.exec(xml)) !== null) {
    const campos = extrairCamposFlat(m[0])
    if (Object.keys(campos).length > 0) registros.push(campos)
  }

  return registros.length > 0 ? registros : [extrairCamposFlat(xml)]
}

function extrairCamposFlat(bloco: string): LinhaArquivo {
  const resultado: LinhaArquivo = {}
  const fieldRegex = /<(\w+)[^>]*>([^<]+)<\/\1>/g
  let m: RegExpExecArray | null
  while ((m = fieldRegex.exec(bloco)) !== null) {
    const tag = m[1]
    const valor = m[2].trim()
    if (valor && !resultado[tag]) resultado[tag] = valor
  }
  return resultado
}

// ── Parser PDF — extrai texto e tenta interpretar como tabela ────────────────
//
// PDFs gerados por Excel/planilhas costumam ter linhas com separacao por espacos
// ou tabulacoes. A estrategia:
//  1. Divide o texto em linhas nao-vazias
//  2. Detecta o separador da primeira linha (tab > multiplos espacos > espaco)
//  3. A primeira linha e tratada como cabecalho
//
// Limitacao: PDFs escaneados (imagem) nao geram texto — retorna linha com aviso.

export function parsePdfText(texto: string): LinhaArquivo[] {
  const linhas = texto
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0)

  if (linhas.length < 2) {
    // PDF sem texto estruturado (provavelmente escaneado)
    return [{
      _aviso: 'PDF sem texto estruturado. Use Excel ou CSV para melhores resultados.',
      _conteudo: texto.slice(0, 500).trim(),
    }]
  }

  // Detectar separador: tab primeiro, depois 2+ espacos, depois espaco simples
  const primeiraLinha = linhas[0]
  const separador = primeiraLinha.includes('\t')
    ? '\t'
    : /  +/.test(primeiraLinha)
      ? '__MULTI_SPACE__'
      : ' '

  function splitPdf(linha: string): string[] {
    if (separador === '__MULTI_SPACE__') {
      return linha.split(/  +/).map(v => v.trim()).filter((_, i, arr) => i < arr.length)
    }
    return linha.split(separador).map(v => v.trim())
  }

  const cabecalhos = splitPdf(primeiraLinha)
  if (cabecalhos.length < 2) {
    // Nao conseguiu identificar colunas — retorna linhas brutas para mapeamento manual
    return linhas.slice(1).map((l, i) => ({ linha: String(i + 2), conteudo: l }))
  }

  const resultado: LinhaArquivo[] = []
  for (let i = 1; i < linhas.length; i++) {
    const valores = splitPdf(linhas[i])
    if (valores.every(v => v === '')) continue
    const obj: LinhaArquivo = {}
    cabecalhos.forEach((cab, idx) => {
      obj[cab] = valores[idx] ?? ''
    })
    resultado.push(obj)
  }

  return resultado
}

// ── Parser TXT blocos numerados — formato [N] Ref: PART | Description ────────
//
// Detecta documentos aduaneiros europeus com itens no formato:
//   [1] Ref: PART-CODE  | Item Description
//       Key1: val1   Key2: val2   KEY3/unit: val3
//
// Normaliza chaves "CURR/unit" (EUR/pc, USD/un) para "Unit Price".

function parseTxtBlocos(texto: string): LinhaArquivo[] | null {
  const linhas = texto.split(/\r?\n/)
  const blocoRegex = /^\[\d+\]\s+Ref:\s*(.+?)(?:\s*\|\s*(.*))?$/
  const items: LinhaArquivo[] = []

  for (let i = 0; i < linhas.length; i++) {
    const m = linhas[i].trim().match(blocoRegex)
    if (!m) continue

    const item: LinhaArquivo = {
      'Ref': m[1].trim(),
      'Description': (m[2] ?? '').trim(),
    }

    // Linha de continuação indentada (4+ espaços ou tab)
    if (i + 1 < linhas.length && /^[ \t]{4,}/.test(linhas[i + 1])) {
      const fieldLine = linhas[i + 1].trim()
      const parts = fieldLine.split(/\s{2,}/)
      for (const part of parts) {
        const colonIdx = part.indexOf(':')
        if (colonIdx > 0) {
          const key = part.slice(0, colonIdx).trim()
          const val = part.slice(colonIdx + 1).trim()
          if (key && val) {
            // Normalizar "EUR/pc", "USD/un", "EUR/SET" → "Unit Price"
            const normKey = /^[A-Z]{2,4}\//.test(key) ? 'Unit Price' : key
            item[normKey] = val
          }
        }
      }
    }

    items.push(item)
  }

  return items.length >= 2 ? items : null
}

// ── Parser TXT dedicado — detecta 4 formatos ─────────────────────────────────
//
// Formatos suportados:
//   0. Blocos numerados: [N] Ref: PART | Description (aduaneiro europeu)
//   1. Tabela com pipe | (ex: "PO | SKU | Qty")
//   2. Pares key: value (ex: "PO Number : PO-2026-030")
//   3. Fallback: múltiplos espaços/tab (mesmo do parsePdfText)

function parseTxt(texto: string): LinhaArquivo[] {
  const todasLinhas = texto.split(/\r?\n/).map(l => l.trim())
  const ehSeparador = (l: string) => /^[-=|*\s]{3,}$/.test(l)
  const linhas = todasLinhas.filter(l => l.length > 0 && !ehSeparador(l))

  if (linhas.length < 2) return [{ _conteudo: texto.slice(0, 500) }]

  // 0. Blocos numerados: [N] Ref: PART | Description
  const blocos = parseTxtBlocos(texto)
  if (blocos) return blocos

  // 1. Tabela com pipe |
  const linhasComPipe = linhas.filter(l => (l.match(/\|/g) ?? []).length >= 2)
  if (linhasComPipe.length >= 2) {
    const cabecalhos = linhasComPipe[0].split('|').map(v => v.trim()).filter(Boolean)
    if (cabecalhos.length >= 2) {
      return linhasComPipe.slice(1).map(l => {
        const vals = l.split('|').map(v => v.trim()).filter(Boolean)
        const obj: LinhaArquivo = {}
        cabecalhos.forEach((h, i) => { obj[h] = vals[i] ?? '' })
        return obj
      }).filter(obj => Object.values(obj).some(v => v !== ''))
    }
  }

  // 2. Formato key: value (ex: "PO Number : PO-2026-030")
  const linhasKeyValue = linhas.filter(l => /^[^:]{1,40}:\s*.+/.test(l))
  if (linhasKeyValue.length >= 3) {
    const cabecalho: LinhaArquivo = {}
    linhasKeyValue.forEach(l => {
      const idx = l.indexOf(':')
      const k = l.slice(0, idx).trim()
      const v = l.slice(idx + 1).trim()
      if (k && v) cabecalho[k] = v
    })
    return [cabecalho]
  }

  // 3. Fallback: múltiplos espaços/tab (mesmo do parsePdfText)
  return parsePdfText(texto)
}

// ── Calcular hash dos cabecalhos (SHA-256 via Node crypto) ───────────────────

export function calcularHashColunas(cabecalhos: string[]): string {
  const str = cabecalhos.slice().sort().join('|').toLowerCase()
  return createHash('sha256').update(str).digest('hex').slice(0, 16)
}
