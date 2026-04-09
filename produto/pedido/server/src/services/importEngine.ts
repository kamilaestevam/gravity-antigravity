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
  ],
  tipo_operacao: ['type', 'tipo', 'operation', 'operacao', 'import/export'],
  exportador: [
    'supplier', 'vendor', 'fornecedor', 'exportador', 'seller', 'shipper',
    'exporter', 'nome exportador', 'company', 'empresa', 'nome empresa', 'supply company',
  ],
  // fabricante NÃO é alias de exportador — campos distintos
  fabricante: ['manufacturer', 'fabricante', 'maker', 'brand', 'produced by'],
  incoterm: ['incoterm', 'incoterms', 'delivery terms', 'trade terms'],
  data_emissao_pedido: [
    'order date', 'po date', 'issue date',
    'data emissao', 'data emissão', 'data pedido',
    'data do pedido', 'data criacao', 'emissao', 'emissão', 'data emissao pedido',
  ],
  data_embarque: [
    'ship date', 'shipment date', 'etd', 'eta', 'data embarque',
    'data envio', 'expected ship', 'delivery date',
    'previsao embarque', 'prev embarque', 'embarcamento',
  ],
  part_number: [
    'part number', 'part no', 'part#', 'sku', 'item code', 'product code',
    'codigo', 'codigo produto', 'item number', 'reference', 'part num',
  ],
  ncm: ['ncm', 'hs code', 'hs', 'harmonized code', 'tariff code', 'classificacao', 'customs tariff'],
  descricao_item: [
    'description', 'desc', 'item description', 'product description',
    'descricao', 'descricão', 'product name',
    'descr', 'produto', 'product', 'goods description',
  ],
  quantidade_inicial_item_pedido: [
    'qty', 'quantity', 'qtd', 'quantidade', 'ordered qty',
    'order qty', 'qtde',
    'qtd pedida', 'qtd inicial', 'pcs', 'pieces', 'count',
    'quantidade inicial item pedido',
  ],
  moeda_pedido: [
    'currency', 'moeda', 'curr', 'curr code', 'currency code',
    'moeda pedido', 'moeda da compra', 'coin',
  ],
  valor_unitario_item: [
    'unit price', 'unit value', 'valor unitario', 'preco unitario',
    'price', 'unit cost', 'valor por unidade', 'valor unit',
    'unit amt', 'unit amount', 'preco unit',
  ],
  valor_total_itens: [
    'total value', 'total amount', 'valor total', 'total price',
    'amount', 'line total', 'ext price', 'extended price',
    'total item', 'item total', 'valor total item',
  ],
  unidade_comercializada_item: [
    'unit', 'uom', 'unit of measure', 'unidade', 'und', 'um',
    'unit measure', 'unid', 'unidade comercializada',
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

    case 'csv':
    case 'txt': {
      return { linhas: parseCsv(buffer.toString('utf-8')), extrator_usado: ext }
    }

    case 'json': {
      const parsed: unknown = JSON.parse(buffer.toString('utf-8'))
      if (!Array.isArray(parsed)) {
        throw new Error('JSON deve ser um array de objetos')
      }
      return {
        linhas: (parsed as Record<string, unknown>[]).map(row =>
          Object.fromEntries(
            Object.entries(row).map(([k, v]) => [String(k), String(v ?? '')])
          )
        ),
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

// ── Parser XML simplificado ───────────────────────────────────────────────────

function parseXml(conteudo: string): LinhaArquivo[] {
  // Detecta tags de linha (primeiro nivel depois do root)
  const tagRegex = /<(\w+)>([\s\S]*?)<\/\1>/g
  const rootMatch = conteudo.match(/<(\w+)>[\s\S]*<\/\1>/)
  if (!rootMatch) return []

  // Pegar registros dentro do root
  const rootTag = rootMatch[1]
  const innerRegex = new RegExp(`<${rootTag}[^>]*>([\\s\\S]*?)<\\/${rootTag}>`, 'g')
  const registros: LinhaArquivo[] = []

  let rootContent = conteudo
  // Pula o root externo se existir (ex: <pedidos><pedido>...)
  const wrapMatch = conteudo.match(/<\w+>([\s\S]*)<\/\w+>/)
  if (wrapMatch) rootContent = wrapMatch[1]

  const itemRegex = /<(\w+)>([\s\S]*?)<\/\1>/g
  let grupoMatch: RegExpExecArray | null

  // Agrupar tags como registros (simples — um nivel)
  const linhaTemp: LinhaArquivo = {}
  let hasItems = false

  while ((grupoMatch = itemRegex.exec(rootContent)) !== null) {
    const tag = grupoMatch[1]
    const valor = grupoMatch[2].trim()
    if (!valor.includes('<')) {
      linhaTemp[tag] = valor
      hasItems = true
    }
  }

  if (hasItems) registros.push({ ...linhaTemp })

  return registros.length > 0 ? registros : []
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

function parsePdfText(texto: string): LinhaArquivo[] {
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

// ── Calcular hash dos cabecalhos (SHA-256 via Node crypto) ───────────────────

export function calcularHashColunas(cabecalhos: string[]): string {
  const str = cabecalhos.slice().sort().join('|').toLowerCase()
  return createHash('sha256').update(str).digest('hex').slice(0, 16)
}
