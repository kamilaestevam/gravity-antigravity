/**
 * Gera manual-pedido-catalogo-colunas-dados.ts a partir de ColunasPai/Filho + SSOT de comportamento.
 * Uso: npx tsx scripts/gerar-manual-pedido-catalogo-colunas.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getEditavel,
  getEditavelItem,
  getTipoCampo,
  isSomavel,
} from '../../produto/pedido/client/src/shared/columnBehaviorConfig'
import { obterPillsTooltipColuna } from '../../produto/pedido/client/src/shared/pillsTooltipColunaLista'
import { isPropagavel } from '../../produto/pedido/shared/mapaPropagacaoPedidoItem'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
const pedidoLista = path.join(repoRoot, 'servicos-global/produto/pedido/client/src/components/lista')
const ptJson = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'nucleo-global/Utilidades/Localization/locales/pt.json'), 'utf8'),
) as { pedido: { lista: { regras_pill: Record<string, string> } } }

const ROTULOS_PILL = ptJson.pedido.lista.regras_pill

const MAPA_I18N_GRUPO: Record<string, string> = {
  'pedido.item_grupo.identificacao': 'Identificação',
  'pedido.item_grupo.quantidades': 'Quantidades',
  'pedido.item_grupo.dados_fisicos': 'Dados físicos',
  'pedido.item_grupo.duimp_fiscal': 'DUIMP / Fiscal',
}

const MAPA_FORMATO_GTV: Record<string, string> = {
  texto: 'Texto',
  numero: 'Número',
  periodo: 'Data',
  badge: 'Pill',
  enum: 'Lista',
  checkbox: 'Checkbox',
  percentual: 'Percentual',
  formula: 'Fórmula',
}

const PILLS_SOMA = new Set([
  'calculado_pedido',
  'calculado_pedido_qtd_inicial',
  'calculado_pedido_qtd_pronta',
  'calculado_pedido_qtd_transferida',
  'calculado_pedido_qtd_cancelada',
  'calculado_pedido_saldo',
  'calculado_pedido_volumes',
  'calculado_pedido_peso_liquido',
  'calculado_pedido_peso_bruto',
  'soma_mesma_unidade',
  'valor_total_soma_mesma_moeda',
  'formula_config',
  'valor_total_item_formula',
])

const PILLS_ESPELHA = new Set([
  'replica_itens',
  'replica_itens_auto',
  'espelhado_workspace',
  'espelhado_importador',
  'espelhado_logistica_pedido',
  'espelhado_logistica_item',
  'espelhado_logistica_bidirecional',
  'editavel_atualiza_pedido',
  'itens_bloqueados_pedido',
])

function resolverI18n(chave: string): string {
  if (!chave.startsWith('pedido.')) return chave
  const partes = chave.split('.')
  let cur: unknown = ptJson.pedido
  for (let i = 1; i < partes.length; i++) {
    cur = (cur as Record<string, unknown>)?.[partes[i]]
    if (cur == null) return chave
  }
  return typeof cur === 'string' ? cur : chave
}

function mapGrupo(raw: string | undefined): string {
  if (!raw) return 'Outros'
  if (MAPA_I18N_GRUPO[raw]) return MAPA_I18N_GRUPO[raw]
  return raw
}

function resolverCampo(raw: string): string {
  if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1)
  const tm = raw.match(/^t\('([^']+)'\)$/)
  return tm ? resolverI18n(tm[1]) : raw
}

function extrairArrayColunas(src: string, fnNome: string): string {
  const fnStart = src.indexOf(`function ${fnNome}`)
  const constMark = src.indexOf('const colunas:', fnStart)
  const returnMark = src.indexOf('return [', fnStart)
  let openBracket = -1
  if (constMark >= 0 && (returnMark < 0 || constMark < returnMark)) {
    openBracket = src.indexOf('= [', constMark)
    if (openBracket >= 0) openBracket += 2
  } else if (returnMark >= 0) {
    openBracket = returnMark + 'return '.length
  }
  if (openBracket < 0) throw new Error(`Array de colunas não encontrado em ${fnNome}`)
  let depth = 0
  let end = openBracket
  for (let i = openBracket; i < src.length; i++) {
    if (src[i] === '[') depth++
    else if (src[i] === ']') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  return src.slice(openBracket + 1, end)
}

type ColunaExtraida = {
  key: string
  coluna: string
  descricao: string
  grupo: string
  tipoGtv: string
  nivel: 'pedido' | 'item'
}

function extrairColunas(arquivo: string, fnNome: string, nivel: 'pedido' | 'item'): ColunaExtraida[] {
  const src = fs.readFileSync(arquivo, 'utf8')
  const arrayBody = extrairArrayColunas(src, fnNome)
  const cols: ColunaExtraida[] = []
  let pos = 0
  while (pos < arrayBody.length) {
    const keyIdx = arrayBody.indexOf("key: '", pos)
    if (keyIdx < 0) break
    const keyEnd = arrayBody.indexOf("'", keyIdx + 6)
    const key = arrayBody.slice(keyIdx + 6, keyEnd)
    const nextObj = arrayBody.indexOf('\n  {', keyEnd)
    const blockEnd = nextObj > 0 ? nextObj : arrayBody.length
    const block = arrayBody.slice(keyIdx, blockEnd)
    const labelM = block.match(/label:\s*(t\('[^']+'\)|'[^']*')/)
    const grupoM = block.match(/grupo:\s*(t\('[^']+'\)|'[^']*')/)
    const tipM =
      block.match(/tooltipDescricao:\s*(t\('[^']+'\)|'[^']{4,200}')/) ??
      block.match(/tooltipTitulo:\s*(t\('[^']+'\)|'[^']{3,120}')/)
    const tipoM = block.match(/tipo:\s*'([^']+)'/)
    const label = labelM ? resolverCampo(labelM[1]) : key
    const grupo = mapGrupo(grupoM ? resolverCampo(grupoM[1]) : 'Outros')
    const descricao = tipM ? resolverCampo(tipM[1]) : ''
    const tipoGtv = tipoM?.[1] ?? inferirTipoGtv(key)
    cols.push({ key, coluna: label, descricao, grupo, tipoGtv, nivel })
    pos = blockEnd
  }

  for (const [, campo] of arrayBody.matchAll(/criarColunaDataReplicavel\(t,\s*'([^']+)'/g)) {
    if (cols.some((c) => c.key === campo)) continue
    cols.push({
      key: campo,
      coluna: resolverI18n(`pedido.coluna_pai.${campo}`),
      descricao: resolverI18n(`pedido.coluna_pai.${campo}_desc`),
      grupo: 'Datas',
      tipoGtv: 'periodo',
      nivel: 'pedido',
    })
  }

  return cols
}

function inferirTipoGtv(key: string): string {
  if (key.startsWith('data_')) return 'periodo'
  if (key.startsWith('anexo_')) return 'texto'
  if (key.includes('quantidade') || key.includes('valor') || key.includes('peso') || key.includes('cubagem')) {
    return 'numero'
  }
  return 'texto'
}

function formatarEdicaoPedido(key: string): string {
  const editavel = getEditavel(key)
  if (typeof editavel === 'function') return 'Condicional'
  return editavel ? 'Sim' : 'Não'
}

function formatarEdicaoItem(key: string, nivel: 'pedido' | 'item'): string {
  if (nivel === 'item' && !getTipoCampo(key) && !getEditavelItem(key)) {
    const blockEditavel = getEditavelItem(key)
    return blockEditavel ? 'Sim' : 'Não'
  }
  return getEditavelItem(key) ? 'Sim' : 'Não'
}

function rotuloPill(id: string): string {
  return ROTULOS_PILL[id] ?? id
}

function montarMetadados(key: string, nivel: 'pedido' | 'item', tipoGtv: string) {
  const pillsRes = obterPillsTooltipColuna(key, { modoDinamicoPedidoItem: true })
  const pillsUnicas = [...new Set([...pillsRes.pedido, ...pillsRes.item])]

  const somaLabels = pillsUnicas
    .filter((p) => PILLS_SOMA.has(p))
    .map(rotuloPill)
  if (isSomavel(key) && !somaLabels.length) {
    somaLabels.push('Soma dos itens')
  }
  const tipoCampo = getTipoCampo(key)
  if (tipoCampo === 'saldo' && !somaLabels.some((s) => s.toLowerCase().includes('saldo'))) {
    somaLabels.push('Saldo (fórmula)')
  }

  const espelhaLabels = pillsUnicas
    .filter((p) => PILLS_ESPELHA.has(p))
    .map(rotuloPill)
  if (isPropagavel(key) && !espelhaLabels.some((e) => e.toLowerCase().includes('replica') || e.toLowerCase().includes('itens'))) {
    espelhaLabels.unshift('Replica pedido → item')
  }

  let formatacao = MAPA_FORMATO_GTV[tipoGtv] ?? 'Texto'
  if (key.startsWith('anexo_')) formatacao = 'Anexo'
  if (tipoCampo === 'calculado' && formatacao === 'Texto') formatacao = 'Número'

  const edicaoPedido = nivel === 'item' && !pillsRes.dual && pillsRes.pedido.length === 0
    ? '—'
    : formatarEdicaoPedido(key)
  const edicaoItem = formatarEdicaoItem(key, nivel)

  return {
    formatacao,
    edicaoPedido,
    edicaoItem,
    soma: somaLabels.length ? somaLabels.join(' · ') : '—',
    espelha: espelhaLabels.length ? espelhaLabels.join(' · ') : '—',
  }
}

function agrupar(colunas: ColunaExtraida[], prefixoId: string) {
  const mapa = new Map<string, {
    id: string
    titulo: string
    nivel: 'pedido' | 'item'
    colunas: Array<ColunaExtraida & ReturnType<typeof montarMetadados> & { ordem: number; fixa?: boolean }>
  }>()

  for (const col of colunas) {
    if (!mapa.has(col.grupo)) {
      mapa.set(col.grupo, {
        id: `${prefixoId}-${col.grupo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        titulo: col.grupo,
        nivel: col.nivel,
        colunas: [],
      })
    }
    const meta = montarMetadados(col.key, col.nivel, col.tipoGtv)
    mapa.get(col.grupo)!.colunas.push({
      ordem: 0,
      coluna: col.coluna,
      descricao: col.descricao || `Campo nativo do ${col.nivel === 'pedido' ? 'pedido' : 'item'}.`,
      fixa: col.key === 'numero_pedido',
      ...meta,
    })
  }

  return [...mapa.values()].map((g, gi) => ({
    ...g,
    colunas: g.colunas.map((c, ci) => ({ ...c, ordem: gi * 100 + ci + 1 })),
  }))
}

const pai = extrairColunas(path.join(pedidoLista, 'ColunasPai.tsx'), 'buildColunasPai', 'pedido')
const filho = extrairColunas(path.join(pedidoLista, 'ColunasFilho.tsx'), 'buildColunasFilho', 'item')

const ordemGruposPai = ['Identificação', 'Partes', 'Quantidades', 'Financeiro', 'Logística', 'Câmbio', 'Dados Físicos', 'Datas']
const ordemGruposFilho = ['Identificação', 'Quantidades', 'Dados físicos', 'DUIMP / Fiscal']

function ordenar<T extends { titulo: string }>(grupos: T[], ordem: string[]): T[] {
  return [...grupos].sort((a, b) => {
    const ia = ordem.indexOf(a.titulo)
    const ib = ordem.indexOf(b.titulo)
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
  })
}

const grupos = [
  ...ordenar(agrupar(pai, 'pai'), ordemGruposPai),
  ...ordenar(agrupar(filho, 'filho'), ordemGruposFilho),
]

const total = grupos.reduce((acc, g) => acc + g.colunas.length, 0)

const outPath = path.join(repoRoot, 'servicos-global/configurador/src/pages/university/manual-pedido-catalogo-colunas-dados.ts')
const conteudo = `/** Gerado por scripts/gerar-manual-pedido-catalogo-colunas.ts — não editar manualmente. */
export type ManualPedidoColunaCatalogo = {
  ordem: number
  coluna: string
  descricao: string
  formatacao?: string
  edicaoPedido?: string
  edicaoItem?: string
  soma?: string
  espelha?: string
  fixa?: boolean
}

export type ManualPedidoGrupoCatalogoColunas = {
  id: string
  titulo: string
  nivel: 'pedido' | 'item'
  colunas: ManualPedidoColunaCatalogo[]
}

export const TOTAL_COLUNAS_CATALOGO_PEDIDO = ${total}

export const GRUPOS_CATALOGO_COLUNAS_PEDIDO: ManualPedidoGrupoCatalogoColunas[] = ${JSON.stringify(grupos, null, 2)} as ManualPedidoGrupoCatalogoColunas[]
`

fs.writeFileSync(outPath, conteudo, 'utf8')
console.log(`Gerado ${outPath} — ${total} colunas (${pai.length} pai + ${filho.length} filho) em ${grupos.length} grupos`)
