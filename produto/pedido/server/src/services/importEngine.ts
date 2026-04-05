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

// ── Aliases conhecidos de campos para sugestao de mapeamento ─────────────────

export const ALIASES_CAMPOS: Record<string, string[]> = {
  numero_pedido: [
    'po number', 'po no', 'purchase order', 'order number', 'order no', 'pedido',
    'numero pedido', 'num pedido', 'po#', 'so number', 'so no', 'sales order',
    'ref', 'referencia', 'ref pedido', 'num po', 'n pedido', 'n. pedido',
    'purchase order number', 'po num', 'order ref',
  ],
  tipo_operacao: ['type', 'tipo', 'operation', 'operacao', 'import/export'],
  exportador: [
    'supplier', 'vendor', 'fornecedor', 'exportador', 'seller', 'shipper',
    'exporter', 'fabricante', 'manufacturer',
    'nome exportador', 'company', 'empresa', 'nome empresa', 'supply company',
  ],
  fabricante: ['manufacturer', 'fabricante', 'maker', 'brand'],
  incoterm: ['incoterm', 'incoterms', 'delivery terms', 'terms', 'trade terms'],
  moeda_pedido: ['currency', 'moeda', 'cur', 'ccy'],
  data_emissao_pedido: [
    'date', 'order date', 'po date', 'data', 'data pedido', 'issue date',
    'data emissao', 'data emissão',
    'data do pedido', 'data criacao', 'emissao', 'emissão',
  ],
  data_embarque: [
    'ship date', 'shipment date', 'etd', 'eta', 'data embarque',
    'data envio', 'expected ship', 'delivery date',
    'previsao embarque', 'prev embarque', 'ship', 'embarcamento',
  ],
  part_number: [
    'part number', 'part no', 'part#', 'sku', 'item code', 'product code',
    'part', 'codigo', 'codigo produto', 'item number', 'reference',
  ],
  ncm: ['ncm', 'hs code', 'hs', 'harmonized code', 'tariff code', 'classificacao'],
  descricao: [
    'description', 'desc', 'item description', 'product description',
    'descricao', 'descricão', 'nome', 'name', 'product name',
    'descr', 'item', 'produto', 'product', 'goods description',
  ],
  quantidade_inicial_item_pedido: [
    'qty', 'quantity', 'qtd', 'quantidade', 'amount', 'ordered qty',
    'order qty', 'qtde',
    'qtd pedida', 'qtd inicial', 'pcs', 'pieces', 'count',
  ],
  unidade: ['unit', 'uom', 'unidade', 'un', 'measure', 'unit of measure'],
  valor_unitario: [
    'unit price', 'price', 'unit value', 'valor unitario', 'preco unitario',
    'valor unit', 'unit cost', 'preco',
    'vl unitario', 'vl unit', 'valor un', 'preco un',
  ],
  valor_item: [
    'total', 'total value', 'amount', 'line total', 'valor total', 'total item',
    'valor item', 'line amount',
    'vl total', 'vl item', 'valor linha', 'line value',
  ],
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type LinhaArquivo = Record<string, string>

// ── Parser principal ──────────────────────────────────────────────────────────

export async function parseArquivo(
  buffer: Buffer,
  nomeArquivo: string,
  nomePlanilha?: string,
): Promise<LinhaArquivo[]> {
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
      return rows.map(row =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [String(k), String(v ?? '')])
        )
      )
    }

    case 'csv':
    case 'txt': {
      return parseCsv(buffer.toString('utf-8'))
    }

    case 'json': {
      const parsed: unknown = JSON.parse(buffer.toString('utf-8'))
      if (!Array.isArray(parsed)) {
        throw new Error('JSON deve ser um array de objetos')
      }
      return (parsed as Record<string, unknown>[]).map(row =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [String(k), String(v ?? '')])
        )
      )
    }

    case 'xml': {
      return parseXml(buffer.toString('utf-8'))
    }

    case 'pdf': {
      const pdfParse = (await import('pdf-parse')).default
      const result = await pdfParse(buffer)
      return parsePdfText(result.text)
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

// ── Calcular hash SHA256 dos cabecalhos ───────────────────────────────────────

export function calcularHashColunas(cabecalhos: string[]): string {
  const str = cabecalhos.slice().sort().join('|').toLowerCase()
  // Hash simples sem crypto para evitar dependencia de Node crypto no browser
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}
