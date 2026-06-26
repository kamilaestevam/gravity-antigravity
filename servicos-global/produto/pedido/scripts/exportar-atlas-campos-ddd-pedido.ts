/**
 * Gera ATLAS-CAMPOS-DDD-PEDIDO.csv — banco/prisma/back/front/tela (importar no Google Sheets).
 *
 * Fontes SSOT (paridade obrigatória):
 *   - prisma/fragment.prisma (Pedido + PedidoItem — só colunas escalares)
 *   - shared/campos-pedido-ddd.ts (rótulos DDD)
 *   - shared/camposJsonPedidoLista.ts (JSON pedido)
 *   - shared/mapaPropagacaoPedidoItem.ts (propagação pai→item)
 *   - processos-core/routes/pedidos.ts — mapPedido / mapItem / publicToDddItem (aliases API)
 *   - client/.../ColunasPai.tsx + ColunasFilho.tsx (chaves da lista GTV)
 *
 * Uso: npx tsx servicos-global/produto/pedido/scripts/exportar-atlas-campos-ddd-pedido.ts
 */
import { readFile, writeFile, copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CAMPOS_JSON_PEDIDO_LISTA } from '../shared/camposJsonPedidoLista.js'
import { MAPA_PROPAGACAO_PEDIDO_ITEM } from '../shared/mapaPropagacaoPedidoItem.js'
import { CAMPOS_PEDIDO_DDD_TODOS, ROTULO_POR_CAMPO } from '../shared/campos-pedido-ddd.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const REPO = join(__dir, '../../../..')
const FRAGMENT = join(__dir, '../prisma/fragment.prisma')
const COLUMN_BEHAVIOR = join(__dir, '../client/src/shared/columnBehaviorConfig.ts')
const COLUNAS_PAI = join(__dir, '../client/src/components/lista/ColunasPai.tsx')
const COLUNAS_FILHO = join(__dir, '../client/src/components/lista/ColunasFilho.tsx')
const TYPES_TS = join(__dir, '../client/src/shared/types.ts')
const PT_JSON = join(REPO, 'nucleo-global/Utilidades/Localization/locales/pt.json')
const SAIDA = join(REPO, 'documentos-tecnicos/produtos-gravity/pedido/ATLAS-CAMPOS-DDD-PEDIDO.csv')
const DOWNLOADS = join(process.env.USERPROFILE ?? process.env.HOME ?? '', 'Downloads', 'ATLAS-CAMPOS-DDD-PEDIDO.csv')

const TABELA_PG: Record<string, string> = {
  Pedido: 'pedido',
  PedidoItem: 'pedido_item',
}

const PRISMA_ESCALARES = new Set(['String', 'Int', 'Boolean', 'DateTime', 'Decimal', 'Json', 'Float', 'BigInt'])

/** Aliases do contrato JSON público → coluna Prisma Pedido (sync mapPedido). */
const MAPA_API_PEDIDO: Readonly<Record<string, string>> = {
  id: 'id_pedido',
  tenant_id: 'id_organizacao',
  company_id: 'id_workspace',
  tipo_operacao: 'tipo_operacao_pedido',
  status: 'status_pedido',
  status_id: 'id_status_pedido',
  importacao_exportador_id: 'id_importacao_exportador_pedido',
  exportacao_importador_id: 'id_exportacao_importador_pedido',
  fabricante_id: 'id_fabricante_pedido',
  incoterm: 'incoterm_pedido',
  condicao_pagamento: 'condicao_pagamento_pedido',
  condicao_pagamento_siscomex: 'condicao_pagamento_siscomex_pedido',
  cobertura_cambial: 'cobertura_cambial_pedido',
  numero_proforma: 'numero_proforma_pedido',
  numero_invoice: 'numero_invoice_pedido',
  referencia_importador: 'referencia_importador_pedido',
  referencia_exportador: 'referencia_exportador_pedido',
  referencia_fabricante: 'referencia_fabricante_pedido',
  taxa_cambio_estimada: 'taxa_cambio_estimada_pedido',
  cnpj_importador: 'cnpj_importador_pedido',
  deleted_at: 'data_exclusao_pedido',
  created_at: 'data_criacao_pedido',
  updated_at: 'data_atualizacao_pedido',
  data_proforma_invoice: 'data_documento_proforma_pedido',
  data_invoice: 'data_documento_invoice_pedido',
  data_documento_proforma: 'data_documento_proforma_pedido',
  data_documento_invoice: 'data_documento_invoice_pedido',
  data_prevista_recebimento_rascunho_pedido: 'data_previsao_recebimento_rascunho_pedido',
  data_confirmada_recebimento_rascunho_pedido: 'data_confirmacao_recebimento_rascunho_pedido',
  data_prevista_aprovacao_rascunho_pedido: 'data_previsao_aprovacao_rascunho_pedido',
  data_confirmada_aprovacao_rascunho_pedido: 'data_confirmacao_aprovacao_rascunho_pedido',
  data_prevista_recebimento_rascunho_proforma: 'data_previsao_recebimento_rascunho_proforma_pedido',
  data_confirmada_recebimento_rascunho_proforma: 'data_confirmacao_recebimento_rascunho_proforma_pedido',
  data_meta_recebimento_rascunho_proforma: 'data_meta_recebimento_rascunho_proforma_pedido',
  data_prevista_aprovacao_rascunho_proforma: 'data_previsao_aprovacao_rascunho_proforma_pedido',
  data_confirmada_aprovacao_rascunho_proforma: 'data_confirmacao_aprovacao_rascunho_proforma_pedido',
  data_meta_aprovacao_rascunho_proforma: 'data_meta_aprovacao_rascunho_proforma_pedido',
  data_prevista_envio_original_proforma: 'data_previsao_envio_original_proforma_pedido',
  data_confirmada_envio_original_proforma: 'data_confirmacao_envio_original_proforma_pedido',
  data_meta_envio_original_proforma: 'data_meta_envio_original_proforma_pedido',
  data_prevista_recebimento_original_proforma: 'data_previsao_recebimento_original_proforma_pedido',
  data_confirmada_recebimento_original_proforma: 'data_confirmacao_recebimento_original_proforma_pedido',
  data_meta_recebimento_original_proforma: 'data_meta_recebimento_original_proforma_pedido',
  data_prevista_recebimento_rascunho_invoice: 'data_previsao_recebimento_rascunho_invoice_pedido',
  data_confirmada_recebimento_rascunho_invoice: 'data_confirmacao_recebimento_rascunho_invoice_pedido',
  data_meta_recebimento_rascunho_invoice: 'data_meta_recebimento_rascunho_invoice_pedido',
  data_prevista_aprovacao_rascunho_invoice: 'data_previsao_aprovacao_rascunho_invoice_pedido',
  data_confirmada_aprovacao_rascunho_invoice: 'data_confirmacao_aprovacao_rascunho_invoice_pedido',
  data_meta_aprovacao_rascunho_invoice: 'data_meta_aprovacao_rascunho_invoice_pedido',
  data_prevista_envio_original_invoice: 'data_previsao_envio_original_invoice_pedido',
  data_confirmada_envio_original_invoice: 'data_confirmacao_envio_original_invoice_pedido',
  data_meta_envio_original_invoice: 'data_meta_envio_original_invoice_pedido',
  data_prevista_recebimento_original_invoice: 'data_previsao_recebimento_original_invoice_pedido',
  data_confirmada_recebimento_original_invoice: 'data_confirmacao_recebimento_original_invoice_pedido',
  data_meta_recebimento_original_invoice: 'data_meta_recebimento_original_invoice_pedido',
  pedidos_origem_id: 'ids_origem_consolidacao_pedido',
  campos_custom: 'dados_extras_importacao_pedido',
  detalhes_operacionais: 'detalhes_operacionais_pedido',
}

/** Aliases do contrato JSON público → coluna Prisma PedidoItem (sync publicToDddItem / mapItem). */
const MAPA_API_ITEM: Readonly<Record<string, string>> = {
  id: 'id_item',
  tenant_id: 'id_organizacao',
  company_id: 'id_workspace',
  pedido_id: 'id_pedido',
  sequencia_item: 'sequencia_item_pedido',
  part_number: 'part_number_item',
  ncm: 'ncm_item',
  tipo_operacao: 'tipo_operacao_item',
  quantidade_inicial_pedido: 'quantidade_inicial_item',
  quantidade_atual_pedido: 'quantidade_atual_item',
  quantidade_transferida_pedido: 'quantidade_transferida_item',
  quantidade_cancelada_pedido: 'quantidade_cancelada_item',
  valor_total_cambio_pedido: 'valor_total_cambio_item_pedido',
  nome_exportador: 'nome_exportador_item',
  nome_importador: 'nome_importador_item',
  nome_fabricante: 'nome_fabricante_item',
  referencia_importador: 'referencia_importador_item',
  referencia_exportador: 'referencia_exportador_item',
  referencia_fabricante: 'referencia_fabricante_item',
  numero_proforma: 'numero_proforma_item',
  numero_invoice: 'numero_invoice_item',
  incoterm: 'incoterm_item',
  condicao_pagamento: 'condicao_pagamento_item',
  condicao_pagamento_siscomex: 'condicao_pagamento_siscomex_item',
  data_emissao_pedido: 'data_emissao_item',
  cobertura_cambial: 'cobertura_cambial_item',
  moeda_cambio_pedido: 'moeda_cambio_item_pedido',
  peso_liquido_unitario: 'peso_liquido_unitario_item',
  peso_bruto_unitario: 'peso_bruto_unitario_item',
  cubagem_unitaria: 'cubagem_unitaria_item',
  campos_custom: 'dados_extras_importacao_item',
  created_at: 'data_criacao_item',
  updated_at: 'data_atualizacao_item',
}

const CAMPOS_VIRTUAIS_PEDIDO = new Set([
  'quantidade_pronta_itens_pedido_total',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'saldo_itens_do_pedido',
  'ncm_valor_unico',
  'ncm_divergente',
  'ncms_distintos_count',
  'descricao_item_valor_unico',
  'cobertura_cambial_valor_unico',
  'cobertura_cambial_divergente',
  'moeda_cambio_pedido_valor_unico',
  'moeda_cambio_pedido_divergente',
  'condicao_pagamento_divergente',
  'condicao_pagamento_siscomex_divergente',
  'tipo_operacao_divergente',
  'status_divergente',
  'status_itens_snapshot',
  'enviou_transferencia',
  'recebeu_transferencia',
  'descricao_item',
  'valor_item',
])

const CAMPOS_SNAPSHOT_DERIVADO_PEDIDO = new Set([
  'nome_exportador',
  'nome_importador',
  'nome_fabricante',
  'cnpj_exportador',
])

/** Colunas de anexo — persistem em `anexo_pedido` (model PedidoAnexo), não no Pedido. */
const CHAVES_COLUNA_ANEXO = new Set([
  'anexo_pedido',
  'anexo_proforma',
  'anexo_invoice',
  'anexo_lpco',
])

/** Colunas pai que espelham/agregam dados dos itens (ghost — não coluna Prisma no Pedido). */
const CAMPOS_GHOST_PEDIDO_DE_ITENS = new Set([
  'ncm',
  'descricao_item',
  'valor_por_unidade_item',
])
/** Coluna lista composta — exibe outros campos (não é chave de persistência). */
const COLUNAS_VIRTUAL_UI: Readonly<Record<string, string>> = {
  quantidade_unidade_estatistica: 'quantidade_unidade_estatistica_duimp+unidade_estatistica_duimp',
  valor_item: 'valor_por_unidade_item×quantidade_inicial_pedido',
}

const MAPA_PROPAGACAO_ITEM_PARA_PEDIDO: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(MAPA_PROPAGACAO_PEDIDO_ITEM).map(([pedido, item]) => [item, pedido]),
)

type CampoPrisma = { model: string; tabela_pg: string; campo: string; tipo: string }

type ColunaLista = {
  key: string
  nivel: 'pedido' | 'item'
  labelKey?: string
  tooltipTituloKey?: string
  grupo?: string
}

type Linha = Record<string, string>

function escCsv(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

function isTipoEscalarPrisma(tipo: string): boolean {
  const base = tipo.replace(/\?$/, '').replace(/\[\]$/, '')
  return PRISMA_ESCALARES.has(base)
}

function extrairSecaoReturnArray(conteudo: string, nomeFuncao: string): string {
  const inicioFn = conteudo.indexOf(`function ${nomeFuncao}`)
  if (inicioFn < 0) return ''
  const trechoFn = conteudo.slice(inicioFn)

  const returnIdx = trechoFn.indexOf('return [')
  const constIdx = Math.min(
    trechoFn.indexOf('const colunas:') >= 0 ? trechoFn.indexOf('const colunas:') : Infinity,
    trechoFn.indexOf('const colunas =') >= 0 ? trechoFn.indexOf('const colunas =') : Infinity,
  )

  let sliceStart = -1
  if (returnIdx >= 0 && returnIdx < constIdx) {
    sliceStart = returnIdx + 'return '.length
  } else if (constIdx < Infinity) {
    const trechoConst = trechoFn.slice(constIdx)
    const eqArray = trechoConst.indexOf('= [')
    if (eqArray < 0) return ''
    sliceStart = constIdx + eqArray + 2
  }
  if (sliceStart < 0) return ''

  const slice = trechoFn.slice(sliceStart)
  let depth = 0
  for (let i = 0; i < slice.length; i++) {
    const ch = slice[i]
    if (ch === '[') depth++
    if (ch === ']') {
      depth--
      if (depth === 0) return slice.slice(0, i + 1)
    }
  }
  return ''
}

function extrairColunasLista(secaoArray: string, nivel: 'pedido' | 'item'): ColunaLista[] {
  const blocos = secaoArray.split(/\{\s*\n\s*key:\s*'/).slice(1)
  const saida: ColunaLista[] = []
  const vistos = new Set<string>()
  for (const bloco of blocos) {
    const fimObj = bloco.search(/\n\s*\},?\s*\n/)
    const corpo = fimObj >= 0 ? bloco.slice(0, fimObj) : bloco
    const key = corpo.split("'")[0]
    if (!key || vistos.has(key)) continue
    vistos.add(key)
    const labelMatch = corpo.match(/label:\s*t\('([^']+)'\)/)
    const tooltipMatch = corpo.match(/tooltipTitulo:\s*t\('([^']+)'\)/)
    const grupoMatch = corpo.match(/grupo:\s*t\('([^']+)'\)/) ?? corpo.match(/grupo:\s*'([^']+)'/)
    saida.push({
      key,
      nivel,
      labelKey: labelMatch?.[1],
      tooltipTituloKey: tooltipMatch?.[1],
      grupo: grupoMatch?.[1],
    })
  }
  return saida
}

function extrairModelsPrisma(conteudo: string): CampoPrisma[] {
  const campos: CampoPrisma[] = []
  const modelRegex = /model\s+(\w+)\s*\{([^}]*)\}/gs
  let m: RegExpExecArray | null
  while ((m = modelRegex.exec(conteudo)) !== null) {
    const model = m[1]
    if (model !== 'Pedido' && model !== 'PedidoItem') continue
    const corpo = m[2]
    const linhaRegex = /^\s+([a-z][a-z0-9_]*)\s+([A-Za-z?[\].]+)/gm
    let l: RegExpExecArray | null
    while ((l = linhaRegex.exec(corpo)) !== null) {
      const campo = l[1]
      const tipo = l[2].replace(/\?$/, '')
      if (campo.startsWith('@@')) continue
      if (!isTipoEscalarPrisma(tipo)) continue
      campos.push({
        model,
        tabela_pg: TABELA_PG[model] ?? model.toLowerCase(),
        campo,
        tipo,
      })
    }
  }
  return campos
}

function extrairColumnConfig(conteudo: string): Map<string, string> {
  const mapa = new Map<string, string>()
  const re = /^\s+([a-z0-9_]+):\s+\{\s*tipo:\s*'([^']+)'/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(conteudo)) !== null) {
    mapa.set(m[1], m[2])
  }
  return mapa
}

function flattenI18n(obj: Record<string, unknown>, prefix = ''): Map<string, string> {
  const mapa = new Map<string, string>()
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [sk, sv] of flattenI18n(v as Record<string, unknown>, path)) {
        mapa.set(sk, sv)
      }
    } else if (typeof v === 'string') {
      mapa.set(path, v)
    }
  }
  return mapa
}

function extrairCamposInterface(conteudo: string, nomeInterface: string): Set<string> {
  const inicio = conteudo.indexOf(`export interface ${nomeInterface}`)
  if (inicio < 0) return new Set()
  const fim = conteudo.indexOf('\n}', inicio)
  const bloco = conteudo.slice(inicio, fim)
  const campos = new Set<string>()
  const re = /^\s+([a-z][a-z0-9_]*)\??:/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(bloco)) !== null) campos.add(m[1])
  return campos
}

function resolverPrismaPedido(apiKey: string, prismaPedido: Set<string>): string | null {
  if (prismaPedido.has(apiKey)) return apiKey
  const alias = MAPA_API_PEDIDO[apiKey]
  if (alias && prismaPedido.has(alias)) return alias
  const comSufixo = `${apiKey}_pedido`
  if (prismaPedido.has(comSufixo)) return comSufixo
  return null
}

function resolverPrismaItem(apiKey: string, prismaItem: Set<string>): string | null {
  if (prismaItem.has(apiKey)) return apiKey
  const alias = MAPA_API_ITEM[apiKey]
  if (alias && prismaItem.has(alias)) return alias
  const comSufixo = `${apiKey}_item`
  if (prismaItem.has(comSufixo)) return comSufixo
  return null
}

type Resolucao = {
  campo_prisma_pedido: string
  campo_prisma_item: string
  armazenamento: string
  back_patch_campo: string
  alerta?: string
}

function resolverChaveLista(
  key: string,
  nivel: 'pedido' | 'item',
  prismaPedido: Set<string>,
  prismaItem: Set<string>,
  camposItemTypes: Set<string>,
): Resolucao {
  if (COLUNAS_VIRTUAL_UI[key]) {
    return {
      campo_prisma_pedido: '',
      campo_prisma_item: '',
      armazenamento: 'coluna_virtual_ui',
      back_patch_campo: COLUNAS_VIRTUAL_UI[key],
    }
  }

  if (CHAVES_COLUNA_ANEXO.has(key)) {
    const categoria = key.startsWith('anexo_') ? key.slice('anexo_'.length) : key
    return {
      campo_prisma_pedido: '',
      campo_prisma_item: '',
      armazenamento: 'tabela_anexo_pedido',
      back_patch_campo: `categoria_anexo_pedido=${categoria}`,
    }
  }

  if (nivel === 'pedido' && CAMPOS_GHOST_PEDIDO_DE_ITENS.has(key)) {
    const itemCampo = resolverPrismaItem(key, prismaItem) ?? key
    return {
      campo_prisma_pedido: '',
      campo_prisma_item: itemCampo,
      armazenamento: 'ghost_agregado_ou_unico_itens',
      back_patch_campo: itemCampo,
    }
  }

  if (nivel === 'pedido') {
    if (CAMPOS_VIRTUAIS_PEDIDO.has(key)) {
      return {
        campo_prisma_pedido: '',
        campo_prisma_item: '',
        armazenamento: 'virtual_mapPedido',
        back_patch_campo: key,
      }
    }
    if (CAMPOS_SNAPSHOT_DERIVADO_PEDIDO.has(key)) {
      return {
        campo_prisma_pedido: '',
        campo_prisma_item: '',
        armazenamento: 'snapshot_empresa_ou_json_ou_item',
        back_patch_campo: key,
      }
    }
    if ((CAMPOS_JSON_PEDIDO_LISTA as readonly string[]).includes(key)) {
      return {
        campo_prisma_pedido: '',
        campo_prisma_item: '',
        armazenamento: 'json_extras_ou_detalhes_operacionais',
        back_patch_campo: key,
      }
    }
    const prisma = resolverPrismaPedido(key, prismaPedido)
    if (prisma) {
      return {
        campo_prisma_pedido: prisma,
        campo_prisma_item: '',
        armazenamento: 'coluna_pedido',
        back_patch_campo: prisma,
      }
    }
  } else {
    const prisma = resolverPrismaItem(key, prismaItem)
    if (prisma) {
      return {
        campo_prisma_pedido: '',
        campo_prisma_item: prisma,
        armazenamento: 'coluna_pedido_item',
        back_patch_campo: prisma,
      }
    }
    if (camposItemTypes.has(key) && !prismaItem.has(key)) {
      return {
        campo_prisma_pedido: '',
        campo_prisma_item: 'dados_extras_importacao_item',
        armazenamento: 'json_chave_dados_extras_importacao_item',
        back_patch_campo: key,
      }
    }
  }

  return {
    campo_prisma_pedido: '',
    campo_prisma_item: '',
    armazenamento: 'nao_resolvido',
    back_patch_campo: key,
    alerta: 'revisar_manualmente',
  }
}

async function main() {
  const [fragment, behaviorSrc, colunasPaiSrc, colunasFilhoSrc, typesSrc, ptRaw] = await Promise.all([
    readFile(FRAGMENT, 'utf8'),
    readFile(COLUMN_BEHAVIOR, 'utf8'),
    readFile(COLUNAS_PAI, 'utf8'),
    readFile(COLUNAS_FILHO, 'utf8'),
    readFile(TYPES_TS, 'utf8'),
    readFile(PT_JSON, 'utf8'),
  ])

  const prismaCampos = extrairModelsPrisma(fragment)
  const prismaPedido = new Set(prismaCampos.filter((c) => c.model === 'Pedido').map((c) => c.campo))
  const prismaItem = new Set(prismaCampos.filter((c) => c.model === 'PedidoItem').map((c) => c.campo))
  const prismaPorCampo = new Map(prismaCampos.map((c) => [`${c.model}:${c.campo}`, c]))
  const camposItemTypes = extrairCamposInterface(typesSrc, 'PedidoItem')

  const secaoPai = extrairSecaoReturnArray(colunasPaiSrc, 'buildColunasPai')
  const secaoFilho = extrairSecaoReturnArray(colunasFilhoSrc, 'buildColunasFilho')
  const colunasPai = extrairColunasLista(secaoPai, 'pedido')
  const colunasFilho = extrairColunasLista(secaoFilho, 'item')
  const colunasLista = [...colunasPai, ...colunasFilho]

  const tiposColuna = extrairColumnConfig(behaviorSrc)
  const pt = JSON.parse(ptRaw) as Record<string, unknown>
  const i18n = flattenI18n((pt.pedido as Record<string, unknown>) ?? {}, 'pedido')

  const linhas: Linha[] = []
  const chavesLista = new Set<string>()
  const alertas: string[] = []

  for (const col of colunasLista) {
    const idLista = `${col.nivel}:${col.key}`
    if (chavesLista.has(idLista)) continue
    chavesLista.add(idLista)

    const res = resolverChaveLista(col.key, col.nivel, prismaPedido, prismaItem, camposItemTypes)
    if (res.alerta) alertas.push(`${idLista} → ${res.armazenamento}`)

    const metaPedido = res.campo_prisma_pedido ? prismaPorCampo.get(`Pedido:${res.campo_prisma_pedido}`) : null
    const metaItem = res.campo_prisma_item ? prismaPorCampo.get(`PedidoItem:${res.campo_prisma_item}`) : null
    const dddCampo = res.campo_prisma_pedido || res.campo_prisma_item || col.key
    const propagacao =
      res.campo_prisma_item && MAPA_PROPAGACAO_ITEM_PARA_PEDIDO[res.campo_prisma_item]
        ? MAPA_PROPAGACAO_ITEM_PARA_PEDIDO[res.campo_prisma_item]
        : res.campo_prisma_pedido && MAPA_PROPAGACAO_PEDIDO_ITEM[res.campo_prisma_pedido]
          ? MAPA_PROPAGACAO_PEDIDO_ITEM[res.campo_prisma_pedido]
          : ''

    const tabelaFallback =
      res.armazenamento === 'json_chave_dados_extras_importacao_item'
        ? 'pedido_item'
        : res.armazenamento.includes('json') || res.armazenamento.includes('snapshot')
          ? 'pedido'
          : res.armazenamento === 'tabela_anexo_pedido'
            ? 'anexo_pedido'
            : ''

    linhas.push({
      chave_coluna_lista: col.key,
      nivel_linha: col.nivel,
      campo_api_frontend: col.key,
      campo_prisma_pedido: res.campo_prisma_pedido,
      campo_prisma_item: res.campo_prisma_item,
      campo_propagacao_pai: propagacao,
      tabela_postgres: metaPedido?.tabela_pg ?? metaItem?.tabela_pg ?? tabelaFallback,
      tipo_prisma: metaPedido?.tipo ?? metaItem?.tipo ?? '',
      tipo_comportamento_lista: tiposColuna.get(col.key) ?? '',
      grupo_coluna_lista: col.grupo ? (i18n.get(col.grupo) ?? col.grupo) : '',
      label_cabecalho_tela: col.labelKey
        ? (i18n.get(col.labelKey) ?? ROTULO_POR_CAMPO[dddCampo] ?? '')
        : (ROTULO_POR_CAMPO[dddCampo] ?? ''),
      tooltip_titulo_tela: col.tooltipTituloKey ? (i18n.get(col.tooltipTituloKey) ?? '') : '',
      armazenamento_banco: res.armazenamento,
      back_patch_campo: res.back_patch_campo,
      origem_dado: 'lista_gtv',
    })
  }

  const prismaJaListado = new Set<string>()
  for (const l of linhas) {
    if (l.campo_prisma_pedido) prismaJaListado.add(`Pedido:${l.campo_prisma_pedido}`)
    if (l.campo_prisma_item && l.campo_prisma_item !== 'dados_extras_importacao_item') {
      prismaJaListado.add(`PedidoItem:${l.campo_prisma_item}`)
    }
  }

  for (const c of prismaCampos) {
    const chave = `${c.model}:${c.campo}`
    if (prismaJaListado.has(chave)) continue
    linhas.push({
      chave_coluna_lista: '',
      nivel_linha: c.model === 'PedidoItem' ? 'item' : 'pedido',
      campo_api_frontend: '',
      campo_prisma_pedido: c.model === 'Pedido' ? c.campo : '',
      campo_prisma_item: c.model === 'PedidoItem' ? c.campo : '',
      campo_propagacao_pai:
        c.model === 'Pedido' && MAPA_PROPAGACAO_PEDIDO_ITEM[c.campo]
          ? MAPA_PROPAGACAO_PEDIDO_ITEM[c.campo]
          : c.model === 'PedidoItem' && MAPA_PROPAGACAO_ITEM_PARA_PEDIDO[c.campo]
            ? MAPA_PROPAGACAO_ITEM_PARA_PEDIDO[c.campo]
            : '',
      tabela_postgres: c.tabela_pg,
      tipo_prisma: c.tipo,
      tipo_comportamento_lista: '',
      grupo_coluna_lista: '',
      label_cabecalho_tela: ROTULO_POR_CAMPO[c.campo] ?? i18n.get(`pedido.massa_campos.${c.campo}`) ?? '',
      tooltip_titulo_tela: '',
      armazenamento_banco: 'coluna_prisma_sem_lista',
      back_patch_campo: c.campo,
      origem_dado: 'somente_prisma',
    })
  }

  for (const jsonCampo of CAMPOS_JSON_PEDIDO_LISTA) {
    if (chavesLista.has(`pedido:${jsonCampo}`)) continue
    linhas.push({
      chave_coluna_lista: jsonCampo,
      nivel_linha: 'pedido',
      campo_api_frontend: jsonCampo,
      campo_prisma_pedido: '',
      campo_prisma_item: '',
      campo_propagacao_pai: '',
      tabela_postgres: 'pedido',
      tipo_prisma: 'Json',
      tipo_comportamento_lista: tiposColuna.get(jsonCampo) ?? '',
      grupo_coluna_lista: '',
      label_cabecalho_tela: ROTULO_POR_CAMPO[jsonCampo] ?? i18n.get(`pedido.massa_campos.${jsonCampo}`) ?? '',
      tooltip_titulo_tela: '',
      armazenamento_banco: 'json_extras_ou_detalhes_operacionais',
      back_patch_campo: jsonCampo,
      origem_dado: 'json_superficie_lista',
    })
  }

  linhas.sort((a, b) =>
    `${a.nivel_linha}:${a.chave_coluna_lista || a.campo_prisma_pedido || a.campo_prisma_item}`.localeCompare(
      `${b.nivel_linha}:${b.chave_coluna_lista || b.campo_prisma_pedido || b.campo_prisma_item}`,
    ),
  )

  const header = [
    'chave_coluna_lista',
    'nivel_linha',
    'campo_api_frontend',
    'campo_prisma_pedido',
    'campo_prisma_item',
    'campo_propagacao_pai',
    'tabela_postgres',
    'tipo_prisma',
    'tipo_comportamento_lista',
    'grupo_coluna_lista',
    'label_cabecalho_tela',
    'tooltip_titulo_tela',
    'armazenamento_banco',
    'back_patch_campo',
    'origem_dado',
  ]

  const csv = [
    header.join(','),
    ...linhas.map((l) => header.map((h) => escCsv(l[h] ?? '')).join(',')),
  ].join('\n')

  await writeFile(SAIDA, `\uFEFF${csv}`, 'utf8')
  try {
    await copyFile(SAIDA, DOWNLOADS)
    console.log(`Copiado: ${DOWNLOADS}`)
  } catch {
    console.warn(`Não foi possível copiar para Downloads: ${DOWNLOADS}`)
  }

  const naoResolvidos = linhas.filter((l) => l.armazenamento_banco === 'nao_resolvido')
  console.log(`Gerado: ${SAIDA}`)
  console.log(`Linhas: ${linhas.length}`)
  console.log(`Colunas lista: ${colunasLista.length}`)
  console.log(`Não resolvidos: ${naoResolvidos.length}`)
  if (naoResolvidos.length > 0) {
    console.warn('Campos não resolvidos:')
    for (const l of naoResolvidos) {
      console.warn(`  - ${l.nivel_linha}:${l.chave_coluna_lista}`)
    }
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
