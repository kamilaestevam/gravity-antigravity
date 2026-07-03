/**
 * Gera manual-pedido-alertas-colunas-dados.ts a partir de ColunasPai/Filho + pills de alerta (SSOT).
 * Uso: npx tsx servicos-global/configurador/scripts/gerar-manual-pedido-alertas-colunas.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hasAlerta } from '../../produto/pedido/client/src/shared/columnBehaviorConfig'
import {
  obterPillsTooltipColuna,
  type RegraPillId,
} from '../../produto/pedido/client/src/shared/pillsTooltipColunaLista'
import { getAlertavelKeys } from '../../produto/pedido/shared/columnAlertConfig'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
const pedidoLista = path.join(repoRoot, 'servicos-global/produto/pedido/client/src/components/lista')
const ptJson = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'nucleo-global/Utilidades/Localization/locales/pt.json'), 'utf8'),
) as { pedido: { lista: { regras_pill: Record<string, string> } } }

const PILLS_ALERTA = new Set<RegraPillId>([
  'alerta_divergencia',
  'alerta_moeda_divergente',
  'alerta_moeda_divergente_entre_itens',
  'alerta_unidade_comercializada_divergente',
  'alerta_unidade_peso_divergente',
])

const ACIONAMENTO_POR_PILL: Record<RegraPillId, string> = {
  alerta_divergencia:
    'Ícone âmbar quando o **pedido** difere de algum **item**, ou quando **itens** têm valores distintos entre si.',
  alerta_moeda_divergente:
    'Ícone âmbar quando itens usam **moedas comerciais diferentes** — o pedido não soma totais até homogeneizar.',
  alerta_moeda_divergente_entre_itens:
    'Ícone âmbar quando a **moeda comercial** dos itens diverge (quantidades sensíveis à moeda).',
  alerta_unidade_comercializada_divergente:
    'Ícone âmbar quando itens usam **unidades comercializadas diferentes** — totais, saldos e transferências não agregam.',
  alerta_unidade_peso_divergente:
    'Ícone âmbar quando itens usam **unidades de peso diferentes** — peso total do pedido não agrega.',
  bloqueado_valor_item: '',
  bloqueado_edicao: '',
  somente_leitura: '',
  editavel_pedido: '',
  editavel_item: '',
  editavel_pedido_numero: '',
  editavel_nos_itens: '',
  replica_itens: '',
  replica_itens_auto: '',
  cond_import_export: '',
  calculado_pedido: '',
  calculado_pedido_qtd_inicial: '',
  calculado_pedido_qtd_pronta: '',
  calculado_pedido_qtd_transferida: '',
  calculado_pedido_qtd_cancelada: '',
  calculado_pedido_saldo: '',
  calculado_pedido_volumes: '',
  calculado_pedido_peso_liquido: '',
  calculado_pedido_peso_bruto: '',
  soma_mesma_unidade: '',
  valor_total_soma_mesma_moeda: '',
  formula_config: '',
  valor_total_item_formula: '',
  espelhado_workspace: '',
  espelhado_importador: '',
  espelhado_logistica_pedido: '',
  espelhado_logistica_item: '',
  espelhado_logistica_bidirecional: '',
  editavel_atualiza_pedido: '',
  itens_bloqueados_pedido: '',
  casas_decimais_config: '',
}

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
  grupo: string
  nivel: 'pedido' | 'item'
}

function mapGrupo(raw: string | undefined): string {
  const MAPA: Record<string, string> = {
    'pedido.item_grupo.identificacao': 'Identificação',
    'pedido.item_grupo.quantidades': 'Quantidades',
    'pedido.item_grupo.dados_fisicos': 'Dados físicos',
    'pedido.item_grupo.duimp_fiscal': 'DUIMP / Fiscal',
  }
  if (!raw) return 'Outros'
  return MAPA[raw] ?? raw
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
    const label = labelM ? resolverCampo(labelM[1]) : key
    const grupo = mapGrupo(grupoM ? resolverCampo(grupoM[1]) : 'Outros')
    cols.push({ key, coluna: label, grupo, nivel })
    pos = blockEnd
  }

  for (const [, campo] of arrayBody.matchAll(/criarColunaDataReplicavel\(t,\s*'([^']+)'/g)) {
    if (cols.some((c) => c.key === campo)) continue
    cols.push({
      key: campo,
      coluna: resolverI18n(`pedido.coluna_pai.${campo}`),
      grupo: 'Datas',
      nivel: 'pedido',
    })
  }

  return cols
}

function pillsAlerta(key: string): RegraPillId[] {
  const res = obterPillsTooltipColuna(key, { modoDinamicoPedidoItem: true })
  const unicas = [...new Set([...res.pedido, ...res.item])]
  return unicas.filter((p) => PILLS_ALERTA.has(p))
}

function nivelExibicao(key: string, nivel: 'pedido' | 'item'): string {
  if (key === 'numero_pedido') return 'Pedido e item'
  const res = obterPillsTooltipColuna(key, { modoDinamicoPedidoItem: true })
  const pedido = res.pedido.some((p) => PILLS_ALERTA.has(p))
  const item = res.item.some((p) => PILLS_ALERTA.has(p))
  if (pedido && item) return 'Pedido e item'
  if (nivel === 'pedido' && pedido) return 'Pedido'
  if (nivel === 'item' && item) return 'Item'
  if (pedido) return 'Pedido'
  if (item) return 'Item'
  return nivel === 'pedido' ? 'Pedido' : 'Item'
}

function montarAcionamento(pills: RegraPillId[], key: string): string {
  if (key === 'part_number') {
    return 'Ícone âmbar na **linha do pedido** quando dois ou mais **itens** compartilham o mesmo Part Number.'
  }
  if (key === 'numero_pedido') {
    return 'Na **linha do pedido**: ícone âmbar quando **Part Numbers se repetem** entre itens. Na **linha do item**: alerta de divergência padrão quando o identificador difere.'
  }
  if (key === 'status') {
    return 'Ícone âmbar quando o **status do pedido** difere do status efetivo de algum item, ou quando **itens** têm statuses distintos (visível mesmo com pedido colapsado).'
  }
  if (pills.length === 0 && hasAlerta(key)) {
    return ACIONAMENTO_POR_PILL.alerta_divergencia
  }
  const textos = pills
    .map((p) => ACIONAMENTO_POR_PILL[p])
    .filter(Boolean)
  return [...new Set(textos)].join(' ')
}

function tipoAlertaLabel(pills: RegraPillId[], key: string): string {
  if (key === 'part_number') return 'Part Number duplicado'
  if (key === 'numero_pedido') return 'Part Number duplicado · Divergência'
  if (key === 'status') return 'Status divergente'
  if (pills.includes('alerta_moeda_divergente')) return 'Moeda comercial'
  if (pills.includes('alerta_moeda_divergente_entre_itens')) return 'Moeda comercial (quantidades)'
  if (pills.includes('alerta_unidade_comercializada_divergente')) return 'Unidade comercializada'
  if (pills.includes('alerta_unidade_peso_divergente')) return 'Unidade de peso'
  return 'Divergência pedido × itens'
}

type LinhaAlerta = {
  key: string
  coluna: string
  nivel: string
  tipoAlerta: string
  acionamento: string
}

function incluirColuna(col: ColunaExtraida, vistos: Set<string>, linhas: LinhaAlerta[]) {
  if (vistos.has(col.key)) return
  const pills = pillsAlerta(col.key)
  const especial = col.key === 'part_number' || col.key === 'status'
  if (!especial && pills.length === 0 && !hasAlerta(col.key)) return
  vistos.add(col.key)
  linhas.push({
    key: col.key,
    coluna: col.coluna,
    nivel: nivelExibicao(col.key, col.nivel),
    tipoAlerta: tipoAlertaLabel(pills, col.key),
    acionamento: montarAcionamento(pills, col.key),
  })
}

const pai = extrairColunas(path.join(pedidoLista, 'ColunasPai.tsx'), 'buildColunasPai', 'pedido')
const filho = extrairColunas(path.join(pedidoLista, 'ColunasFilho.tsx'), 'buildColunasFilho', 'item')

const vistos = new Set<string>()
const linhas: LinhaAlerta[] = []

for (const col of [...pai, ...filho]) {
  incluirColuna(col, vistos, linhas)
}

for (const key of getAlertavelKeys()) {
  if (vistos.has(key)) continue
  const coluna = resolverI18n(`pedido.coluna_pai.${key}`) !== `pedido.coluna_pai.${key}`
    ? resolverI18n(`pedido.coluna_pai.${key}`)
    : resolverI18n(`pedido.coluna_item.${key}`)
  incluirColuna(
    {
      key,
      coluna: coluna.startsWith('pedido.') ? key : coluna,
      grupo: key.startsWith('data_') ? 'Datas' : 'Outros',
      nivel: 'pedido',
    },
    vistos,
    linhas,
  )
}

linhas.push({
  key: '_colunas_usuario',
  coluna: 'Colunas personalizadas',
  nivel: 'Pedido e item',
  tipoAlerta: 'Divergência pedido × itens',
  acionamento:
    'Ícone âmbar quando valores de colunas **customizadas** (texto, número, data, fórmula) divergem entre pedido e itens, ou entre itens.',
})

const ordemGrupos = [
  'Identificação',
  'Partes',
  'Quantidades',
  'Financeiro',
  'Logística',
  'Câmbio',
  'Dados Físicos',
  'Dados físicos',
  'DUIMP / Fiscal',
  'Datas',
  'Outros',
]

function grupoDe(col: ColunaExtraida | undefined, key: string): string {
  if (col) return col.grupo
  if (key.startsWith('data_')) return 'Datas'
  if (key === '_colunas_usuario') return 'Personalizadas'
  return 'Outros'
}

const mapaCol = new Map([...pai, ...filho].map((c) => [c.key, c]))

const gruposMap = new Map<string, LinhaAlerta[]>()
for (const linha of linhas) {
  const grupo = grupoDe(mapaCol.get(linha.key), linha.key)
  if (!gruposMap.has(grupo)) gruposMap.set(grupo, [])
  gruposMap.get(grupo)!.push(linha)
}

const grupos = [...gruposMap.entries()]
  .sort(([a], [b]) => {
    const ia = ordemGrupos.indexOf(a)
    const ib = ordemGrupos.indexOf(b)
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib)
  })
  .map(([titulo, colunas]) => ({
    id: titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    titulo,
    colunas: colunas.sort((a, b) => a.coluna.localeCompare(b.coluna, 'pt-BR')),
  }))

const total = linhas.length

const outPath = path.join(
  repoRoot,
  'servicos-global/configurador/src/pages/university/manual-pedido-alertas-colunas-dados.ts',
)

const conteudo = `/** Gerado por servicos-global/configurador/scripts/gerar-manual-pedido-alertas-colunas.ts — não editar manualmente. */
export type ManualPedidoLinhaAlertaLista = {
  key: string
  coluna: string
  nivel: string
  tipoAlerta: string
  acionamento: string
}

export type ManualPedidoGrupoAlertasLista = {
  id: string
  titulo: string
  colunas: ManualPedidoLinhaAlertaLista[]
}

export const TOTAL_ALERTAS_COLUNAS_PEDIDO_LISTA = ${total}

export const GRUPOS_ALERTAS_COLUNAS_PEDIDO_LISTA: ManualPedidoGrupoAlertasLista[] = ${JSON.stringify(grupos, null, 2)}
`

fs.writeFileSync(outPath, conteudo, 'utf8')
console.log(`OK ${total} colunas com alerta → ${outPath}`)
