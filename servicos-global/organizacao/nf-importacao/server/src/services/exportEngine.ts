/**
 * exportEngine.ts — Orquestrador de exportacao multi-formato
 *
 * Carrega NF com todas as relacoes, resolve layout customizado,
 * transforma dados em linhas achatadas e delega para o formatador correto.
 *
 * Formatos: XML, TXT, CSV, EXCEL, JSON, PDF
 * Skill: antigravity-nf-importacao (secao 7 — Exportacao)
 */

import { PrismaClient } from '@prisma/client'
import { AppError } from './nfStatusEngine.js'
import {
  formatJson,
  formatCsv,
  formatTxtFixed,
  formatXml,
  formatExcel,
} from '../lib/exportFormatters/index.js'
import type {
  ExportRow,
  LayoutConfig,
  LayoutCampo,
  FormatOptions,
} from '../lib/exportFormatters/index.js'

// --- Interfaces publicas ---

interface ExportOptions {
  nfId: string
  tenantId: string
  companyId: string
  formato: string        // XML | TXT | CSV | EXCEL | JSON | PDF
  layoutId?: string      // Custom layout ID (opcional)
}

interface ExportResult {
  conteudo: string | Buffer
  nome_arquivo: string
  mime_type: string
  tamanho: number
}

interface PreviewResult {
  conteudo: string
  linhas: number
}

// --- Tipos internos para dados do banco ---

interface NfImportacaoRaw {
  id: string
  id_organizacao: string
  company_id: string
  status: string
  numero_nf: string | null
  numero_duimp: string | null
  data_registro: Date | null
  importador_nome: string | null
  importador_cnpj: string | null
  exportador_nome: string | null
  exportador_pais: string | null
  moeda: string | null
  taxa_cambio: number | null
  valor_total_fob: number | null
  valor_total_cif: number | null
  valor_total_tributos: number | null
  casas_decimais_valor: number | null
  casas_decimais_qtd: number | null
}

interface NfItemRaw {
  id: string
  numero_item: number | null
  descricao: string | null
  ncm: string | null
  cfop: string | null
  quantidade: number | null
  unidade: string | null
  peso_liquido: number | null
  peso_bruto: number | null
  valor_fob: number | null
  valor_cif: number | null
  valor_ii: number | null
  aliquota_ii: number | null
  valor_ipi: number | null
  aliquota_ipi: number | null
  valor_pis: number | null
  aliquota_pis: number | null
  valor_cofins: number | null
  aliquota_cofins: number | null
  valor_icms: number | null
  aliquota_icms: number | null
  cst_ipi: string | null
  cst_pis: string | null
  cst_cofins: string | null
  cst_icms: string | null
}

interface NfDespesaRaw {
  id: string
  tipo: string
  nome: string | null
  valor_total: number | null
  metodo_rateio: string | null
}

interface NfRateioRaw {
  id: string
  nf_despesa_id: string
  nf_item_id: string
  valor_rateado: number | null
  percentual: number | null
  metodo: string | null
}

interface ExportLayoutRaw {
  id: string
  nome: string
  formato: string
  separador: string | null
  codificacao: string
  has_header: boolean
  has_footer: boolean
  header_template: string | null
  footer_template: string | null
}

interface ExportLayoutCampoRaw {
  id: string
  campo_origem: string
  label: string
  ordem: number
  tipo_dado: string
  formato: string | null
  tamanho_fixo: number | null
  posicao_inicio: number | null
  alinhamento: string
  preenchimento: string | null
  valor_padrao: string | null
  transformacao: string | null
}

// --- Formatos suportados ---

const FORMATOS_VALIDOS = ['XML', 'TXT', 'CSV', 'EXCEL', 'JSON', 'PDF'] as const
type FormatoValido = typeof FORMATOS_VALIDOS[number]

const MIME_TYPES: Record<FormatoValido, string> = {
  XML: 'application/xml',
  TXT: 'text/plain',
  CSV: 'text/csv',
  EXCEL: 'application/vnd.ms-excel',
  JSON: 'application/json',
  PDF: 'application/pdf',
}

const EXTENSOES: Record<FormatoValido, string> = {
  XML: '.xml',
  TXT: '.txt',
  CSV: '.csv',
  EXCEL: '.xls',
  JSON: '.json',
  PDF: '.pdf',
}

// --- Funcoes internas ---

/**
 * Carrega NF + itens + despesas + rateios com todos os dados necessarios
 */
async function carregarDadosNf(
  prisma: PrismaClient,
  nfId: string,
  tenantId: string,
  companyId: string
): Promise<{
  nf: NfImportacaoRaw
  itens: NfItemRaw[]
  despesas: NfDespesaRaw[]
  rateios: NfRateioRaw[]
}> {
  const nf = await prisma.nFImportacao.findFirst({
    where: { id: nfId, id_organizacao: tenantId, company_id: companyId },
  }) as NfImportacaoRaw | null

  if (!nf) {
    throw new AppError('NF Importacao nao encontrada', 404, 'NOT_FOUND')
  }

  const [itens, despesas, rateios] = await Promise.all([
    prisma.nFImportacaoItens.findMany({
      where: { nf_importacao_id: nfId, id_organizacao: tenantId },
      orderBy: { numero_item: 'asc' },
    }) as Promise<NfItemRaw[]>,

    prisma.nFImportacaoDespesas.findMany({
      where: { nf_importacao_id: nfId, id_organizacao: tenantId },
    }) as Promise<NfDespesaRaw[]>,

    prisma.nFImportacaoRateio.findMany({
      where: {
        id_organizacao: tenantId,
        nf_despesa: {
          nf_importacao_id: nfId,
          id_organizacao: tenantId,
        },
      },
    }) as Promise<NfRateioRaw[]>,
  ])

  return { nf, itens, despesas, rateios }
}

/**
 * Carrega layout + campos ordenados por ordem
 */
async function resolverLayout(
  prisma: PrismaClient,
  layoutId: string,
  tenantId: string,
  companyId: string
): Promise<LayoutConfig> {
  const layout = await prisma.nFImportacaoExportarLayout.findFirst({
    where: { id: layoutId, id_organizacao: tenantId, company_id: companyId },
  }) as ExportLayoutRaw | null

  if (!layout) {
    throw new AppError('Layout de exportacao nao encontrado', 404, 'LAYOUT_NOT_FOUND')
  }

  const campos = await prisma.nFImportacaoLayoutCampos.findMany({
    where: { export_layout_id: layoutId, id_organizacao: tenantId },
    orderBy: { ordem: 'asc' },
  }) as ExportLayoutCampoRaw[]

  return {
    formato: layout.formato,
    separador: layout.separador ?? undefined,
    codificacao: layout.codificacao,
    has_header: layout.has_header,
    has_footer: layout.has_footer,
    header_template: layout.header_template ?? undefined,
    footer_template: layout.footer_template ?? undefined,
    campos: campos.map((c): LayoutCampo => ({
      campo_origem: c.campo_origem,
      label: c.label,
      ordem: c.ordem,
      tipo_dado: c.tipo_dado,
      formato: c.formato ?? undefined,
      tamanho_fixo: c.tamanho_fixo ?? undefined,
      posicao_inicio: c.posicao_inicio ?? undefined,
      alinhamento: c.alinhamento,
      preenchimento: c.preenchimento ?? undefined,
      valor_padrao: c.valor_padrao ?? undefined,
      transformacao: c.transformacao ?? undefined,
    })),
  }
}

/**
 * Transforma dados do banco em linhas achatadas para exportacao.
 * Cada linha = um item da NF com campos da NF (cabecalho) + campos do item +
 * campos de despesas rateadas (despesa.[nome] = valor rateado para aquele item)
 */
function montarDadosExportacao(
  nf: NfImportacaoRaw,
  itens: NfItemRaw[],
  despesas: NfDespesaRaw[],
  rateios: NfRateioRaw[]
): ExportRow[] {
  // Index rateios por item_id para lookup rapido
  const rateiosPorItem = new Map<string, Map<string, number>>()
  for (const rateio of rateios) {
    if (!rateiosPorItem.has(rateio.nf_item_id)) {
      rateiosPorItem.set(rateio.nf_item_id, new Map())
    }
    rateiosPorItem.get(rateio.nf_item_id)!.set(
      rateio.nf_despesa_id,
      Number(rateio.valor_rateado) || 0
    )
  }

  // Index despesas por id para buscar nome
  const despesaPorId = new Map<string, NfDespesaRaw>()
  for (const d of despesas) {
    despesaPorId.set(d.id, d)
  }

  return itens.map((item): ExportRow => {
    const row: ExportRow = {}

    // Campos do cabecalho (NF)
    row['nf_numero'] = nf.numero_nf
    row['nf_duimp'] = nf.numero_duimp
    row['nf_data_registro'] = nf.data_registro
      ? nf.data_registro.toISOString().slice(0, 10)
      : null
    row['importador_nome'] = nf.importador_nome
    row['importador_cnpj'] = nf.importador_cnpj
    row['exportador_nome'] = nf.exportador_nome
    row['exportador_pais'] = nf.exportador_pais
    row['moeda'] = nf.moeda
    row['taxa_cambio'] = nf.taxa_cambio !== null ? Number(nf.taxa_cambio) : null

    // Campos do item
    row['item_numero'] = item.numero_item !== null ? Number(item.numero_item) : null
    row['item_descricao'] = item.descricao
    row['item_ncm'] = item.ncm
    row['item_cfop'] = item.cfop
    row['item_quantidade'] = item.quantidade !== null ? Number(item.quantidade) : null
    row['item_unidade'] = item.unidade
    row['item_peso_liquido'] = item.peso_liquido !== null ? Number(item.peso_liquido) : null
    row['item_peso_bruto'] = item.peso_bruto !== null ? Number(item.peso_bruto) : null
    row['item_valor_fob'] = item.valor_fob !== null ? Number(item.valor_fob) : null
    row['item_valor_cif'] = item.valor_cif !== null ? Number(item.valor_cif) : null
    row['item_valor_ii'] = item.valor_ii !== null ? Number(item.valor_ii) : null
    row['item_aliquota_ii'] = item.aliquota_ii !== null ? Number(item.aliquota_ii) : null
    row['item_valor_ipi'] = item.valor_ipi !== null ? Number(item.valor_ipi) : null
    row['item_aliquota_ipi'] = item.aliquota_ipi !== null ? Number(item.aliquota_ipi) : null
    row['item_valor_pis'] = item.valor_pis !== null ? Number(item.valor_pis) : null
    row['item_aliquota_pis'] = item.aliquota_pis !== null ? Number(item.aliquota_pis) : null
    row['item_valor_cofins'] = item.valor_cofins !== null ? Number(item.valor_cofins) : null
    row['item_aliquota_cofins'] = item.aliquota_cofins !== null ? Number(item.aliquota_cofins) : null
    row['item_valor_icms'] = item.valor_icms !== null ? Number(item.valor_icms) : null
    row['item_aliquota_icms'] = item.aliquota_icms !== null ? Number(item.aliquota_icms) : null
    row['item_cst_ipi'] = item.cst_ipi
    row['item_cst_pis'] = item.cst_pis
    row['item_cst_cofins'] = item.cst_cofins
    row['item_cst_icms'] = item.cst_icms

    // Campos dinamicos de despesas rateadas: despesa.[nome] = valor rateado
    const rateiosDoItem = rateiosPorItem.get(item.id)
    for (const [despesaId, despesa] of despesaPorId) {
      const nomeChave = `despesa.${(despesa.nome ?? despesa.tipo).replace(/\s+/g, '_').toLowerCase()}`
      row[nomeChave] = rateiosDoItem?.get(despesaId) ?? 0
    }

    // Total de despesas rateadas para este item
    let totalDespesasItem = 0
    if (rateiosDoItem) {
      for (const valor of rateiosDoItem.values()) {
        totalDespesasItem += valor
      }
    }
    row['item_total_despesas_rateadas'] = totalDespesasItem

    return row
  })
}

/**
 * Gera nome de arquivo com base no numero da NF e formato
 */
function gerarNomeArquivo(nf: NfImportacaoRaw, formato: FormatoValido): string {
  const identificador = nf.numero_nf ?? nf.numero_duimp ?? nf.id
  const dataStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const nomeBase = `NF_${identificador}_${dataStr}`
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .replace(/_+/g, '_')
  return `${nomeBase}${EXTENSOES[formato]}`
}

/**
 * Delega para o formatador correto com base no formato
 */
function executarFormatacao(
  rows: ExportRow[],
  layout: LayoutConfig | null,
  formato: FormatoValido,
  options: FormatOptions
): string {
  switch (formato) {
    case 'JSON':
      return formatJson(rows, layout, options)
    case 'CSV':
      return formatCsv(rows, layout, options)
    case 'TXT':
      return formatTxtFixed(rows, layout, options)
    case 'XML':
      return formatXml(rows, layout, options)
    case 'EXCEL':
      return formatExcel(rows, layout, options)
    case 'PDF':
      throw new AppError(
        'Formato PDF ainda nao suportado — use EXCEL ou CSV como alternativa',
        501,
        'FORMAT_NOT_IMPLEMENTED'
      )
    default:
      throw new AppError(
        `Formato "${String(formato)}" nao reconhecido`,
        400,
        'INVALID_FORMAT'
      )
  }
}

/**
 * Valida formato e retorna tipo seguro
 */
function validarFormato(formato: string): FormatoValido {
  const upper = formato.toUpperCase()
  if (!FORMATOS_VALIDOS.includes(upper as FormatoValido)) {
    throw new AppError(
      `Formato "${formato}" invalido. Formatos aceitos: ${FORMATOS_VALIDOS.join(', ')}`,
      400,
      'INVALID_FORMAT'
    )
  }
  return upper as FormatoValido
}

// --- Funcoes publicas ---

/**
 * Gera exportacao completa: carrega dados, resolve layout, formata e retorna resultado
 */
export async function gerarExportacao(
  prisma: PrismaClient,
  options: ExportOptions
): Promise<ExportResult> {
  const formato = validarFormato(options.formato)

  const { nf, itens, despesas, rateios } = await carregarDadosNf(
    prisma,
    options.nfId,
    options.tenantId,
    options.companyId
  )

  if (itens.length === 0) {
    throw new AppError(
      'NF nao possui itens para exportar',
      422,
      'NO_ITEMS_TO_EXPORT'
    )
  }

  // Resolve layout customizado (se fornecido)
  let layout: LayoutConfig | null = null
  if (options.layoutId) {
    layout = await resolverLayout(
      prisma,
      options.layoutId,
      options.tenantId,
      options.companyId
    )
  }

  const rows = montarDadosExportacao(nf, itens, despesas, rateios)

  const formatOptions: FormatOptions = {
    codificacao: layout?.codificacao ?? 'UTF-8',
    casas_decimais_valor: nf.casas_decimais_valor !== null
      ? Number(nf.casas_decimais_valor)
      : 2,
    casas_decimais_qtd: nf.casas_decimais_qtd !== null
      ? Number(nf.casas_decimais_qtd)
      : 4,
  }

  const conteudo = executarFormatacao(rows, layout, formato, formatOptions)
  const nomeArquivo = gerarNomeArquivo(nf, formato)

  return {
    conteudo,
    nome_arquivo: nomeArquivo,
    mime_type: MIME_TYPES[formato],
    tamanho: Buffer.byteLength(conteudo, 'utf-8'),
  }
}

/**
 * Preview de exportacao: retorna conteudo como string + contagem de linhas
 * Mesma logica que gerarExportacao mas sem transitar status
 */
export async function previewExportacao(
  prisma: PrismaClient,
  options: ExportOptions
): Promise<PreviewResult> {
  const formato = validarFormato(options.formato)

  const { nf, itens, despesas, rateios } = await carregarDadosNf(
    prisma,
    options.nfId,
    options.tenantId,
    options.companyId
  )

  if (itens.length === 0) {
    return { conteudo: '', linhas: 0 }
  }

  let layout: LayoutConfig | null = null
  if (options.layoutId) {
    layout = await resolverLayout(
      prisma,
      options.layoutId,
      options.tenantId,
      options.companyId
    )
  }

  const rows = montarDadosExportacao(nf, itens, despesas, rateios)

  const formatOptions: FormatOptions = {
    codificacao: layout?.codificacao ?? 'UTF-8',
    casas_decimais_valor: nf.casas_decimais_valor !== null
      ? Number(nf.casas_decimais_valor)
      : 2,
    casas_decimais_qtd: nf.casas_decimais_qtd !== null
      ? Number(nf.casas_decimais_qtd)
      : 4,
  }

  const conteudo = executarFormatacao(rows, layout, formato, formatOptions)
  const linhas = conteudo.split('\n').length

  return { conteudo, linhas }
}
