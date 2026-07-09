/**
 * Parse e mapeamento client-side — paridade importEngine + mapearComIA (produto real).
 */

import {
  CAMPO_POR_ALIAS_LEGADO,
  CAMPO_POR_NOME_INTERNO,
  CAMPO_POR_ROTULO_NORMALIZADO,
  normalizarNomeCampo,
  type CampoPedidoDDD,
} from '../../../../servicos-global/produto/pedido/shared/campos-pedido-ddd'
import type {
  ColunaMapeadaSimulador,
  SmartImportLinhaRawSimulador,
  SmartImportLinhaSimulador,
  SmartImportPreviewSimulador,
} from './tipos-smart-import-simulador-pedido'
import {
  aplicarValidacaoLinhasSmartImportSimulador,
} from './validar-linhas-smart-import-simulador-pedido'

type LinhaArquivo = Record<string, string>

type ParseResultado = {
  linhas: LinhaArquivo[]
  extrator_usado: string
  linhas_cabecalho: number
}

function mapearColuna(cabecalho: string, amostra: LinhaArquivo[]): ColunaMapeadaSimulador {
  const exemploValor = amostra
    .map((linha) => linha[cabecalho])
    .find((v) => v !== undefined && v !== null && String(v).trim() !== '')
    ?? null
  const exemploStr = exemploValor ? String(exemploValor).slice(0, 80) : null

  const cabNorm = normalizarNomeCampo(cabecalho)
  let campoEscolhido: CampoPedidoDDD | null = null
  let confianca = 0

  const matchRotulo = CAMPO_POR_ROTULO_NORMALIZADO.get(cabNorm)
  if (matchRotulo && matchRotulo.length > 0) {
    if (matchRotulo.length === 1) {
      campoEscolhido = matchRotulo[0]
      confianca = 99
    } else {
      campoEscolhido = matchRotulo.find((c) => c.nivel === 'pedido') ?? matchRotulo[0]
      confianca = 85
    }
  }

  if (!campoEscolhido) {
    const matchNome = CAMPO_POR_NOME_INTERNO.get(cabNorm)
    if (matchNome) {
      campoEscolhido = matchNome
      confianca = 95
    }
  }

  if (!campoEscolhido) {
    const matchAlias = CAMPO_POR_ALIAS_LEGADO.get(cabNorm)
    if (matchAlias && matchAlias.length > 0) {
      if (matchAlias.length === 1) {
        campoEscolhido = matchAlias[0]
        confianca = 92
      } else {
        campoEscolhido = matchAlias.find((c) => c.nivel === 'pedido') ?? matchAlias[0]
        confianca = 75
      }
    }
  }

  if (!campoEscolhido) {
    const aliasesPossiveis: CampoPedidoDDD[] = []
    for (const [alias, campos] of CAMPO_POR_ALIAS_LEGADO.entries()) {
      if (alias.length < 6) continue
      if (cabNorm.includes(alias) || alias.includes(cabNorm)) {
        aliasesPossiveis.push(...campos)
      }
    }
    const camposUnicos = Array.from(new Set(aliasesPossiveis.map((c) => c.campo)))
    if (camposUnicos.length === 1) {
      campoEscolhido = aliasesPossiveis[0]
      confianca = 70
    }
  }

  const nivel: ColunaMapeadaSimulador['nivel'] =
    confianca >= 90 ? 'auto' :
      confianca >= 70 ? 'confirmado' :
        'ignorado'

  return {
    coluna_arquivo: cabecalho,
    campo_sistema: campoEscolhido?.campo ?? null,
    confianca,
    nivel,
    inferido_por: 'ia',
    valor_exemplo_coluna_pedido: exemploStr,
  }
}

function inferirPorDados(valores: string[]): { campo: string; confianca: number } | null {
  const amostras = valores.filter((v) => v.trim().length > 0).slice(0, 10)
  if (amostras.length === 0) return null

  const incoterms = ['FOB', 'CIF', 'EXW', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP', 'DPU', 'FAS', 'CFR']
  if (amostras.every((v) => incoterms.includes(v.toUpperCase().trim()))) {
    return { campo: 'incoterm_pedido', confianca: 92 }
  }

  const ncmRegex = /^\d{4}[.\s]?\d{2}[.\s]?\d{2}$/
  if (amostras.filter((v) => ncmRegex.test(v.trim())).length >= amostras.length * 0.7) {
    return { campo: 'ncm_item', confianca: 88 }
  }

  const moedas = ['USD', 'EUR', 'BRL', 'GBP', 'CNY', 'JPY', 'AUD', 'CAD']
  if (amostras.every((v) => moedas.includes(v.toUpperCase().trim()))) {
    return { campo: 'moeda_pedido', confianca: 91 }
  }

  const dataRegex = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/
  if (amostras.filter((v) => dataRegex.test(v.trim())).length >= amostras.length * 0.8) {
    return { campo: 'data_emissao_pedido', confianca: 72 }
  }

  return null
}

function mapearColunas(cabecalhos: string[], linhasBrutas: LinhaArquivo[]): ColunaMapeadaSimulador[] {
  const amostra = linhasBrutas.slice(0, 10)
  return cabecalhos.map((cab) => {
    const base = mapearColuna(cab, amostra)
    if (base.campo_sistema || base.confianca >= 80) return base
    const valores = linhasBrutas.slice(0, 20).map((r) => r[cab] ?? '')
    const inferido = inferirPorDados(valores)
    if (!inferido) return base
    return {
      ...base,
      campo_sistema: inferido.campo,
      confianca: Math.max(base.confianca, inferido.confianca),
      nivel: inferido.confianca >= 90 ? 'auto' as const : 'confirmado' as const,
      inferido_por: 'dados' as const,
    }
  })
}

function aplicarMapeamento(
  linha: LinhaArquivo,
  mapeamento: ColunaMapeadaSimulador[],
  numeroLinha: number,
): SmartImportLinhaSimulador {
  const dados: Record<string, unknown> = {}

  for (const col of mapeamento) {
    const valor = linha[col.coluna_arquivo]
    if (col.campo_sistema === '__drop__') continue
    if (col.campo_sistema) {
      if (valor !== undefined) dados[col.campo_sistema] = valor
    }
  }

  return {
    linha_arquivo: numeroLinha,
    numero_pedido: (dados.numero_pedido as string) || null,
    status: 'ok',
    alertas: [],
    dados,
  }
}

function herdarNumeroPedido(linhas: SmartImportLinhaSimulador[]): SmartImportLinhaSimulador[] {
  const temTipoLinha = linhas.some((l) => l.dados.tipo_linha !== undefined)
  if (!temTipoLinha) return linhas

  let ultimoPedido: string | null = null
  return linhas.map((l) => {
    const tipo = String(l.dados.tipo_linha ?? '').trim().toUpperCase()
    if (tipo === 'PEDIDO' && l.numero_pedido) {
      ultimoPedido = l.numero_pedido
      return l
    }
    if (tipo === 'ITEM' && !l.numero_pedido && ultimoPedido) {
      return {
        ...l,
        numero_pedido: ultimoPedido,
        dados: { ...l.dados, numero_pedido: ultimoPedido },
      }
    }
    return l
  })
}

function filtrarItensVazios(linhas: SmartImportLinhaSimulador[]): SmartImportLinhaSimulador[] {
  const estruturais = new Set(['tipo_linha', 'numero_pedido'])
  return linhas.filter((l) => {
    const tipo = String(l.dados.tipo_linha ?? '').trim().toUpperCase()
    if (tipo !== 'ITEM') return true
    return Object.entries(l.dados).some(([k, v]) =>
      !estruturais.has(k) && v !== undefined && v !== null && String(v).trim() !== '',
    )
  })
}

async function parseXlsx(buffer: ArrayBuffer): Promise<ParseResultado> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  const rowsAsArrays = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    blankrows: false,
  }) as unknown[][]

  const row1 = rowsAsArrays[0] ?? []
  const row2 = rowsAsArrays[1] ?? []
  const row1NaoVazios = row1.map((v) => String(v ?? '').trim()).filter((v) => v.length > 0)
  const row2NaoVazios = row2.map((v) => String(v ?? '').trim()).filter((v) => v.length > 0)
  const valoresUnicos = new Set(row1NaoVazios)
  const ehSuperHeader =
    (row1NaoVazios.length >= 1 && row2NaoVazios.length >= 4 && row2NaoVazios.length >= row1NaoVazios.length * 3)
    || (row1NaoVazios.length >= 4 && valoresUnicos.size / row1NaoVazios.length < 0.3)

  const startRange = ehSuperHeader ? 1 : 0
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    range: startRange,
  })

  const linhas = rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [String(k), String(v ?? '')]),
    ),
  ).filter((row) => Object.values(row).some((v) => v.trim() !== ''))

  return {
    linhas,
    extrator_usado: 'xlsx',
    linhas_cabecalho: ehSuperHeader ? 2 : 1,
  }
}

async function parseCsvText(texto: string): Promise<ParseResultado> {
  const linhasTexto = texto.split(/\r?\n/).filter((l) => l.trim())
  if (linhasTexto.length < 2) {
    return { linhas: [], extrator_usado: 'csv', linhas_cabecalho: 1 }
  }
  const sep = linhasTexto[0].includes(';') ? ';' : ','
  const cabecalhos = linhasTexto[0].split(sep).map((c) => c.trim())
  const linhas = linhasTexto.slice(1).map((linha) => {
    const vals = linha.split(sep)
    return Object.fromEntries(cabecalhos.map((cab, i) => [cab, (vals[i] ?? '').trim()]))
  }).filter((row) => Object.values(row).some((v) => v.trim() !== ''))

  return { linhas, extrator_usado: 'csv', linhas_cabecalho: 1 }
}

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

function extrairCamposFlatXml(bloco: string): LinhaArquivo {
  const campos: LinhaArquivo = {}
  const tagRegex = /<(\w+)[^>]*>([^<]*)<\/\1>/g
  let m: RegExpExecArray | null
  while ((m = tagRegex.exec(bloco)) !== null) {
    const valor = m[2].trim()
    if (valor) campos[m[1]] = valor
  }
  return campos
}

function parseXmlSimulador(conteudo: string): LinhaArquivo[] {
  const xml = conteudo
    .replace(/<\?xml[^?]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()

  const tagCounts = new Map<string, number>()
  const tagRegex = /<(\w+)[\s/>]/g
  let m: RegExpExecArray | null
  while ((m = tagRegex.exec(xml)) !== null) {
    tagCounts.set(m[1], (tagCounts.get(m[1]) ?? 0) + 1)
  }

  const candidatos = [...tagCounts.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1])
  const itemTag = candidatos[0]?.[0]

  if (!itemTag) {
    const flat = extrairCamposFlatXml(xml)
    return Object.keys(flat).length > 0 ? [flat] : []
  }

  const blocoRegex = new RegExp(`<${itemTag}[^>]*>([\\s\\S]*?)<\\/${itemTag}>`, 'g')
  const registros: LinhaArquivo[] = []
  while ((m = blocoRegex.exec(xml)) !== null) {
    const campos = extrairCamposFlatXml(m[0])
    if (Object.keys(campos).length > 0) registros.push(campos)
  }

  return registros.length > 0 ? registros : [extrairCamposFlatXml(xml)]
}

function parseJsonSimulador(texto: string): LinhaArquivo[] {
  const parsed: unknown = JSON.parse(texto)
  const rows = Array.isArray(parsed)
    ? parsed as Record<string, unknown>[]
    : (() => {
        const found = encontrarArrayAninhado(parsed as Record<string, unknown>)
        if (!found) throw new Error('JSON sem array de registros')
        return found
      })()
  if (rows.length === 0) throw new Error('JSON vazio')
  return rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [String(k), String(v ?? '')])),
  )
}

export async function parseArquivoSmartImportSimuladorPedido(arquivo: File): Promise<ParseResultado> {
  const ext = arquivo.name.split('.').pop()?.toLowerCase() ?? ''
  const buffer = await arquivo.arrayBuffer()

  if (ext === 'xlsx' || ext === 'xls') {
    return parseXlsx(buffer)
  }
  if (ext === 'csv' || ext === 'txt') {
    const texto = new TextDecoder('utf-8').decode(buffer)
    return parseCsvText(texto)
  }
  if (ext === 'json') {
    const texto = new TextDecoder('utf-8').decode(buffer)
    return { linhas: parseJsonSimulador(texto), extrator_usado: 'json', linhas_cabecalho: 1 }
  }
  if (ext === 'xml') {
    const texto = new TextDecoder('utf-8').decode(buffer)
    return { linhas: parseXmlSimulador(texto), extrator_usado: 'xml', linhas_cabecalho: 1 }
  }
  if (ext === 'pdf') {
    throw new Error('PDF não é aceito no Smart Import — use Smart Docs para leitura de PDF')
  }

  throw new Error(`Formato .${ext} não suportado — use: xlsx, xls, csv, xml, json ou txt`)
}

export function montarPreviewSmartImportSimuladorPedido(
  parseado: ParseResultado,
): SmartImportPreviewSimulador {
  const { linhas: linhasBrutas, extrator_usado, linhas_cabecalho } = parseado

  if (linhasBrutas.length === 0) {
    throw new Error('ARQUIVO_SEM_DADOS')
  }

  const cabecalhos = Object.keys(linhasBrutas[0])
  let mapeamento = mapearColunas(cabecalhos, linhasBrutas)

  const linhasMapeadasBruto = linhasBrutas.map((linha, i) =>
    aplicarMapeamento(linha, mapeamento, i + linhas_cabecalho + 1),
  )
  const linhasComHeranca = herdarNumeroPedido(linhasMapeadasBruto)
  const linhasFiltradas = filtrarItensVazios(linhasComHeranca)
  const linhas = aplicarValidacaoLinhasSmartImportSimulador(linhasFiltradas)

  const temTipoLinha = linhas.some((l) => l.dados.tipo_linha !== undefined)
  const pedidosUnicos = new Set(linhas.map((l) => l.numero_pedido).filter(Boolean) as string[])
  const totalPedidos = temTipoLinha
    ? linhas.filter((l) => String(l.dados.tipo_linha ?? '').trim().toUpperCase() === 'PEDIDO').length
    : pedidosUnicos.size
  const totalItens = temTipoLinha
    ? linhas.filter((l) => String(l.dados.tipo_linha ?? '').trim().toUpperCase() === 'ITEM').length
    : linhasBrutas.length

  const confianca_global = mapeamento.length > 0
    ? Math.round(mapeamento.reduce((s, m) => s + m.confianca, 0) / mapeamento.length)
    : 0

  const dados_brutos: SmartImportLinhaRawSimulador[] = linhasBrutas.map((row, i) => ({
    linha: i + linhas_cabecalho + 1,
    valores: row,
  }))

  return {
    preview_id: `sim-preview-${Date.now()}`,
    total_linhas: linhas.length,
    total_pedidos: totalPedidos,
    total_itens: totalItens,
    mapeamento,
    confianca_global,
    memoria_aplicada: false,
    linhas,
    dados_brutos,
    extrator_usado,
  }
}

/** Reprocessa linhas após alteração manual do mapeamento (etapa 2 → 3). */
export function reprocessarLinhasPreviewSmartImportSimulador(
  preview: SmartImportPreviewSimulador,
  mapeamento: ColunaMapeadaSimulador[],
): SmartImportLinhaSimulador[] {
  if (!preview.dados_brutos?.length) return preview.linhas

  const linhasMapeadas = preview.dados_brutos.map((raw) =>
    aplicarMapeamento(raw.valores, mapeamento, raw.linha),
  )
  const comHeranca = herdarNumeroPedido(linhasMapeadas)
  const filtradas = filtrarItensVazios(comHeranca)
  return aplicarValidacaoLinhasSmartImportSimulador(filtradas)
}
