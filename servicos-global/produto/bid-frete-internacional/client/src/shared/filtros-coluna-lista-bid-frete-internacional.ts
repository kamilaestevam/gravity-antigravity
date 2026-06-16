/**
 * Filtros de coluna da Lista BID Frete — paridade com Pedido (client-side).
 */
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import { detectarTipoColuna as detectarTipoColunaCore } from '@nucleo/tabela-virtual-global'
import type { FiltroTipo } from '@nucleo/tabela-virtual-global'
import type { Cotacao } from './types'
import { STATUS_LABELS, MODAL_LABELS, OPERACAO_LABELS, MODALIDADE_LABELS } from './types'
import type { FiltrosAtivosMap } from '../components/lista/filtros'
import {
  formatValorExportColuna,
  fmtData,
  type OpcoesColunasLista,
} from '../pages/colunas-lista-bid-frete-internacional'

export const FILTRO_TIPO_OVERRIDES_BID_FRETE: Record<string, FiltroTipo> = {
  status_cotacao_bid_frete_internacional: 'enum',
  tipo_operacao_cotacao_bid_frete_internacional: 'enum',
  id_workspace: 'enum',
  incoterm_cotacao_bid_frete_internacional: 'enum',
  valor_meta_cotacao_bid_frete_internacional: 'numero',
  ganho_valor_cotacao_bid_frete_internacional: 'numero',
  ganho_percentual_cotacao_bid_frete_internacional: 'numero',
  quantidade_cotacao_bid_frete_internacional: 'numero',
  peso_kg_cotacao_bid_frete_internacional: 'numero',
  cubagem_m3_cotacao_bid_frete_internacional: 'numero',
}

/** Só colunas de texto longo usam Buscar… livre; IDs/números e portos mantêm lista de valores. */
export const CHAVES_FILTRO_TEXTO_LIVRE_BID_FRETE = new Set<string>([
  'descricao_mercadoria_cotacao_bid_frete_internacional',
  'endereco_origem_cotacao_bid_frete_internacional',
  'endereco_destino_cotacao_bid_frete_internacional',
  'observacoes_carga_perigosa_cotacao_bid_frete_internacional',
  'motivo_reprovacao_cotacao_bid_frete_internacional',
  'motivo_cancelamento_cotacao_bid_frete_internacional',
  'nome_tecnico_embarque_cotacao_bid_frete_internacional',
  'nome_cliente_operacao_cotacao_bid_frete_internacional',
  'nome_usuario_solicitante_bid_frete_internacional',
])

export const CHAVE_NUMERO_COTACAO_LISTA_BID_FRETE =
  'numero_cotacao_bid_frete_internacional'

export function detectarTipoColunaBidFrete(col: GTColuna<Cotacao>): FiltroTipo {
  if (col.opcoes && col.opcoes.length > 0) return 'enum'
  return detectarTipoColunaCore(col, FILTRO_TIPO_OVERRIDES_BID_FRETE)
}

/** Colunas texto usam campo Buscar… (substring), não lista de checkboxes. */
export function deveUsarFiltroTextoLivreBidFrete(
  col: GTColuna<Cotacao>,
  colunasPersonalizadasPorChave?: Map<string, ColunaUsuarioBidFreteLista>,
): boolean {
  const key = String(col.key ?? '')
  if (!key) return false
  if (FILTRO_TIPO_OVERRIDES_BID_FRETE[key] === 'enum') return false
  if (col.opcoes && col.opcoes.length > 0) return false
  if (colunasPersonalizadasPorChave?.has(key)) return false
  return CHAVES_FILTRO_TEXTO_LIVRE_BID_FRETE.has(key)
}

export function resolverValoresUnicosPopoverBidFrete(
  col: GTColuna<Cotacao>,
  valoresUnicosPorCampo: Record<string, string[]>,
  colunasPersonalizadasPorChave?: Map<string, ColunaUsuarioBidFreteLista>,
): string[] {
  const key = String(col.key ?? '')
  if (!key || deveUsarFiltroTextoLivreBidFrete(col, colunasPersonalizadasPorChave)) return []
  return valoresUnicosPorCampo[key] ?? []
}

export interface LabelsFiltroBidFreteContext {
  statusOpcoes?: Array<{ valor: string; label: string }>
}

export function getLabelsFiltroBidFrete(
  campo: string,
  ctx: LabelsFiltroBidFreteContext = {},
): Record<string, string> {
  if (campo === 'status_cotacao_bid_frete_internacional') {
    if (ctx.statusOpcoes?.length) {
      const map: Record<string, string> = {}
      for (const o of ctx.statusOpcoes) map[o.valor] = o.label
      return map
    }
    return { ...STATUS_LABELS }
  }
  if (campo === 'tipo_operacao_cotacao_bid_frete_internacional') {
    return { ...OPERACAO_LABELS }
  }
  if (campo === 'modal_cotacao_bid_frete_internacional') {
    return { ...MODAL_LABELS }
  }
  if (campo === 'modalidade_cotacao_bid_frete_internacional') {
    return { ...MODALIDADE_LABELS }
  }
  if (campo === 'visibilidade_cotacao_bid_frete_internacional') {
    return { ABERTA: 'Aberta', DIRECIONADA: 'Direcionada' }
  }
  if (campo === 'anonima_cotacao_bid_frete_internacional') {
    return { true: 'Sim', false: 'Não' }
  }
  if (campo === 'id_produto_gravity') {
    return { 'bid-frete-internacional': 'BID Frete Internacional' }
  }
  return {}
}

export function getLabelsFiltroInversoBidFrete(
  campo: string,
  ctx: LabelsFiltroBidFreteContext = {},
): Record<string, string> {
  const map = getLabelsFiltroBidFrete(campo, ctx)
  return Object.fromEntries(Object.entries(map).map(([raw, label]) => [label, raw]))
}

/** Label canônica para lista de filtro enum — evita RASCUNHO + Rascunho duplicados. */
export function resolverLabelFiltroBidFrete(
  campo: string,
  raw: string,
  ctx: LabelsFiltroBidFreteContext = {},
): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const labelMap = getLabelsFiltroBidFrete(campo, ctx)
  if (Object.keys(labelMap).length === 0) return trimmed
  if (trimmed in labelMap) return labelMap[trimmed]
  const upper = trimmed
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
  if (upper in labelMap) return labelMap[upper]
  const lower = trimmed.toLowerCase()
  for (const [key, label] of Object.entries(labelMap)) {
    if (label.toLowerCase() === lower) return label
    if (key.toLowerCase() === lower) return label
  }
  return trimmed
}

export function obterValorRawColunaCotacao(
  cotacao: Cotacao,
  campo: string,
  colunasPersonalizadasPorChave?: Map<string, ColunaUsuarioBidFreteLista>,
): unknown {
  const custom = colunasPersonalizadasPorChave?.get(campo)
  if (custom) {
    const valores = (cotacao as Record<string, unknown>)['_colunas_usuario'] as
      Record<string, string> | undefined
    return valores?.[custom.id] ?? ''
  }
  return (cotacao as Record<string, unknown>)[campo]
}

export function obterValorExibicaoFiltroColuna(
  cotacao: Cotacao,
  col: GTColuna<Cotacao>,
  opcoes: OpcoesColunasLista = {},
  ctx: LabelsFiltroBidFreteContext = {},
): string {
  const campo = String(col.key)
  if (col.findDisplay) {
    const display = col.findDisplay(cotacao)
    if (display != null && display !== '' && display !== '—') {
      const asString = String(display)
      if (FILTRO_TIPO_OVERRIDES_BID_FRETE[campo] === 'enum') {
        return resolverLabelFiltroBidFrete(campo, asString, ctx)
      }
      return asString
    }
  }
  if (
    campo === 'id_organizacao' ||
    campo === 'id_usuario' ||
    campo === 'id_workspace' ||
    campo === 'id_produto_gravity'
  ) {
    return formatValorExportColuna(campo, cotacao, opcoes)
  }
  const raw = obterValorRawColunaCotacao(cotacao, campo)
  if (col.tipo === 'periodo' && raw) return fmtData(String(raw))
  if (raw == null || raw === '') return ''
  const rawStr = String(raw).trim()
  if (FILTRO_TIPO_OVERRIDES_BID_FRETE[campo] === 'enum') {
    return resolverLabelFiltroBidFrete(campo, rawStr, ctx)
  }
  return rawStr
}

export function cotacaoPassaFiltrosColuna(
  cotacao: Cotacao,
  filtros: FiltrosAtivosMap,
  colunasPorCampo: Map<string, GTColuna<Cotacao>>,
  opcoes: OpcoesColunasLista,
  ctx: LabelsFiltroBidFreteContext = {},
  colunasPersonalizadasPorChave?: Map<string, ColunaUsuarioBidFreteLista>,
): boolean {
  for (const [campo, filtro] of Object.entries(filtros)) {
    const col = colunasPorCampo.get(campo)
    const rawVal = String(
      obterValorRawColunaCotacao(cotacao, campo, colunasPersonalizadasPorChave) ?? '',
    )
    const strVal = col
      ? obterValorExibicaoFiltroColuna(cotacao, col, opcoes, ctx)
      : rawVal

    if (filtro.tipo === 'texto') {
      if (!strVal.toLowerCase().includes(filtro.valor.toLowerCase())) return false
    } else if (filtro.tipo === 'enum') {
      const inverso = getLabelsFiltroInversoBidFrete(campo, ctx)
      const rawSet = Object.keys(inverso).length
        ? new Set(Array.from(filtro.valor).map(l => inverso[l] ?? l))
        : filtro.valor
      if (rawSet.size > 0 && !rawSet.has(rawVal) && !rawSet.has(strVal)) return false
    } else if (filtro.tipo === 'numero') {
      const n = Number(
        obterValorRawColunaCotacao(cotacao, campo, colunasPersonalizadasPorChave),
      )
      if (filtro.valor.min != null && n < filtro.valor.min) return false
      if (filtro.valor.max != null && n > filtro.valor.max) return false
    }
  }
  return true
}

export function calcularValoresUnicosPorCampoBidFrete(
  cotacoes: Cotacao[],
  colunas: GTColuna<Cotacao>[],
  opcoes: OpcoesColunasLista,
  ctx: LabelsFiltroBidFreteContext = {},
  colunasPersonalizadasPorChave?: Map<string, ColunaUsuarioBidFreteLista>,
  numerosBidLista?: string[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  for (const col of colunas) {
    if (!col.filtravel || !col.key) continue
    const key = String(col.key)
    if (detectarTipoColunaBidFrete(col) === 'numero') continue
    if (deveUsarFiltroTextoLivreBidFrete(col, colunasPersonalizadasPorChave)) continue

    if (key === 'id_workspace' && opcoes.workspacesMap) {
      const nomes = [...opcoes.workspacesMap.values()].map(w => w.nome).filter(Boolean)
      if (nomes.length > 0) result[key] = [...new Set(nomes)].sort()
      continue
    }
    if (key === 'id_organizacao' && opcoes.organizacoesMap) {
      const nomes = [...opcoes.organizacoesMap.values()].filter(Boolean)
      if (nomes.length > 0) result[key] = [...new Set(nomes)].sort()
      continue
    }
    if (key === 'id_usuario' && opcoes.usuariosMap) {
      const nomes = [...opcoes.usuariosMap.values()].filter(Boolean)
      if (nomes.length > 0) result[key] = [...new Set(nomes)].sort()
      continue
    }

    const labelMap = getLabelsFiltroBidFrete(key, ctx)
    const vals = new Set<string>()
    for (const cotacao of cotacoes) {
      const raw = String(
        obterValorRawColunaCotacao(cotacao, key, colunasPersonalizadasPorChave) ?? '',
      ).trim()
      if (!raw || raw === 'undefined' || raw === 'null') continue
      if (Object.keys(labelMap).length > 0) {
        vals.add(resolverLabelFiltroBidFrete(key, raw, ctx))
      } else {
        vals.add(obterValorExibicaoFiltroColuna(cotacao, col, opcoes, ctx) || raw)
      }
    }
    if (key === CHAVE_NUMERO_COTACAO_LISTA_BID_FRETE && numerosBidLista?.length) {
      for (const numero of numerosBidLista) {
        const n = numero.trim()
        if (n) vals.add(n)
      }
    }
    if (vals.size > 0) result[key] = Array.from(vals).sort()
  }

  return result
}

/** Garante ícone de filtro no header — padrão Pedido. */
export function garantirFiltravelColunaBidFrete<T>(col: GTColuna<T>): GTColuna<T> {
  if (col.filtravel === false) return col
  if (col.oculta && col.filtravel !== true) return col
  return { ...col, filtravel: true }
}

/** Colunas criadas pelo usuário devem usar este mapper ao entrar na lista. */
export interface ColunaUsuarioBidFreteLista {
  id: string
  chave: string
  nome: string
  tipo: string
  escopo?: 'pedido' | 'item' | 'ambos'
  descricao?: string
  ativo?: boolean
}

export function mapColunaUsuarioBidFreteParaGTColuna(
  col: ColunaUsuarioBidFreteLista,
): GTColuna<Cotacao> {
  const opcoesSelect = col.tipo === 'select' && Array.isArray((col as { opcoes?: string[] }).opcoes)
    ? (col as { opcoes: string[] }).opcoes.map(v => ({ valor: v, label: v }))
    : undefined

  const editavel = col.tipo !== 'formula'

  return garantirFiltravelColunaBidFrete({
    key: col.chave as keyof Cotacao,
    label: col.nome,
    tipo:
      col.tipo === 'numero' || col.tipo === 'percentual' || col.tipo === 'formula'
        ? 'numero'
        : col.tipo === 'data'
          ? 'periodo'
          : col.tipo === 'select'
            ? 'texto'
            : 'texto',
    ...(opcoesSelect ? { opcoes: opcoesSelect } : {}),
    oculta: true,
    filtravel: true,
    editavel,
    tooltipTitulo: col.nome,
    tooltipDescricao: col.descricao,
    getValorEditar: (row: Cotacao) => {
      const valores = (row as Record<string, unknown>)['_colunas_usuario'] as
        Record<string, string> | undefined
      const raw = valores?.[col.id]
      if (raw == null) return col.tipo === 'numero' || col.tipo === 'percentual' ? 0 : ''
      if (col.tipo === 'numero' || col.tipo === 'percentual') return Number(raw) || 0
      return raw
    },
    render: (_val: unknown, row: Cotacao) => {
      const valores = (row as Record<string, unknown>)['_colunas_usuario'] as
        Record<string, string> | undefined
      const valor = valores?.[col.id]
      if (valor == null || valor === '') return '—'
      if (col.tipo === 'checkbox') return valor === 'true' ? '✓' : valor === 'false' ? '✗' : '—'
      return valor
    },
    findDisplay: (row: Cotacao) => {
      const valores = (row as Record<string, unknown>)['_colunas_usuario'] as
        Record<string, string> | undefined
      const valor = valores?.[col.id]
      if (valor == null || valor === '') return '—'
      if (col.tipo === 'checkbox') return valor === 'true' ? 'Sim' : valor === 'false' ? 'Não' : '—'
      return valor
    },
  })
}
