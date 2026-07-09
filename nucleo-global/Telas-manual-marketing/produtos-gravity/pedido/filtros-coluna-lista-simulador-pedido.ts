import type { GTColuna } from '../../../Tabelas/tabela-virtual-global/src/tipos'
import type { FiltroAtivo, FiltroTipo, FiltrosAtivosMap } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/tipos'
import { detectarTipoColuna } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/detectarTipoColuna'
import { calcularValoresUnicos } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltroChips'
import type { ColunaListaSimuladorPedido } from './colunas-lista-simulador-pedido'
import type { LinhaListaPedidoSimulador, StatusListaPedidoSimulador } from './dados-lista-simulador-pedido'

const FILTRO_TIPO_OVERRIDES: Record<string, FiltroTipo> = {
  status: 'enum',
  tipo_operacao: 'enum',
  incoterm: 'enum',
  id_workspace: 'enum',
  porto_origem: 'enum',
  porto_destino: 'enum',
  local_de_origem: 'enum',
  local_de_destino: 'enum',
  moeda_pedido: 'enum',
  moeda_item: 'enum',
  unidade_comercializada_pedido: 'enum',
  unidade_comercializada_item: 'enum',
  cobertura_cambial: 'enum',
}

const COLUNAS_BADGE = new Set(['status', 'tipo_operacao'])

const COLUNAS_NUMERO = new Set([
  'valor_total_pedido',
  'valor_item',
  'quantidade_total_pedido',
  'quantidade_pronta_itens_pedido_total',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
  'quantidade_volumes_pedido',
  'valor_total_cambio_pedido',
  'saldo_itens_do_pedido',
  'valor_por_unidade_item',
  'taxa_cambio_estimada',
])

const COLUNAS_NAO_FILTRAVEL = new Set([
  'descricao_item',
  'ncm',
])

export const STATUS_LABELS_FILTRO: Record<StatusListaPedidoSimulador, string> = {
  RASCUNHO: 'Rascunho',
  ABERTO: 'Aberto',
  'EM ANDAMENTO': 'Em Andamento',
  TRANSFERIDO: 'Transferido',
  CONSOLIDADO: 'Consolidado',
}

const TIPO_OPERACAO_LABELS: Record<string, string> = {
  IMPORTAÇÃO: 'Importação',
  EXPORTAÇÃO: 'Exportação',
}

function inferirTipoColunaGt(colunaId: string): GTColuna<LinhaListaPedidoSimulador>['tipo'] {
  if (COLUNAS_BADGE.has(colunaId)) return 'badge'
  if (COLUNAS_NUMERO.has(colunaId)) return 'numero'
  return 'texto'
}

export function colunaListaSimuladorFiltravel(colunaId: string): boolean {
  if (colunaId.startsWith('anexo_')) return false
  if (COLUNAS_NAO_FILTRAVEL.has(colunaId)) return false
  return true
}

export function colunaParaGtColuna(col: ColunaListaSimuladorPedido): GTColuna<LinhaListaPedidoSimulador> {
  return {
    key: col.id,
    label: col.label,
    tipo: inferirTipoColunaGt(col.id),
    filtravel: colunaListaSimuladorFiltravel(col.id),
  }
}

export function detectarTipoFiltroColunaSimulador(col: GTColuna<LinhaListaPedidoSimulador>): FiltroTipo {
  return detectarTipoColuna(col, FILTRO_TIPO_OVERRIDES)
}

export function getLabelsFiltroSimulador(campo: string): Record<string, string> {
  if (campo === 'status') {
    return Object.fromEntries(
      Object.entries(STATUS_LABELS_FILTRO).map(([raw, label]) => [raw, label]),
    )
  }
  if (campo === 'tipo_operacao') return { ...TIPO_OPERACAO_LABELS }
  return {}
}

export function getLabelsFiltroInversoSimulador(campo: string): Record<string, string> | undefined {
  const mapa = getLabelsFiltroSimulador(campo)
  if (Object.keys(mapa).length === 0) return undefined
  return Object.fromEntries(Object.entries(mapa).map(([raw, label]) => [label, raw]))
}

export function obterValorCampoPedidoSimulador(
  linha: LinhaListaPedidoSimulador,
  campo: string,
): string | number | null {
  switch (campo) {
    case 'id_workspace':
      return linha.workspace ?? linha.campos.id_workspace ?? null
    case 'nome_exportador':
      return linha.exportador || linha.campos.nome_exportador || null
    case 'numero_pedido':
      return linha.numeroPedido ?? linha.campos.numero_pedido ?? null
    case 'tipo_operacao':
      return linha.tipoOperacao ?? linha.campos.tipo_operacao ?? null
    case 'status':
      return linha.status ?? linha.campos.status ?? null
    case 'incoterm':
      return linha.incoterm ?? linha.campos.incoterm ?? null
    case 'porto_origem':
      return linha.portoOrigem ?? linha.campos.porto_origem ?? null
    default: {
      const bruto = linha.campos[campo]
      if (bruto == null || bruto === '') return null
      if (COLUNAS_NUMERO.has(campo)) {
        const limpo = bruto.replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')
        const n = Number(limpo)
        return Number.isFinite(n) ? n : bruto
      }
      return bruto
    }
  }
}

export function linhaPassaFiltrosColuna(
  linha: LinhaListaPedidoSimulador,
  filtrosAtivos: FiltrosAtivosMap,
): boolean {
  for (const [campo, filtro] of Object.entries(filtrosAtivos)) {
    const val = obterValorCampoPedidoSimulador(linha, campo)
    if (filtro.tipo === 'texto') {
      if (!String(val ?? '').toLowerCase().includes(filtro.valor.toLowerCase())) return false
    } else if (filtro.tipo === 'enum') {
      const strVal = String(val ?? '')
      const inverso = getLabelsFiltroInversoSimulador(campo)
      const rawSet = inverso
        ? new Set(Array.from(filtro.valor).map((label) => inverso[label] ?? label))
        : filtro.valor
      if (rawSet.size > 0 && !rawSet.has(strVal)) return false
    } else if (filtro.tipo === 'numero') {
      const n = typeof val === 'number' ? val : Number(String(val ?? '').replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.'))
      if (!Number.isFinite(n)) return false
      if (filtro.valor.min != null && n < filtro.valor.min) return false
      if (filtro.valor.max != null && n > filtro.valor.max) return false
    }
  }
  return true
}

export function calcularValoresUnicosCampoListaSimulador(
  linhas: LinhaListaPedidoSimulador[],
  campo: string,
  workspacesDisponiveis: string[] = [],
): string[] {
  if (campo === 'id_workspace' && workspacesDisponiveis.length > 0) {
    return Array.from(new Set(workspacesDisponiveis)).sort()
  }
  const labelMap = getLabelsFiltroSimulador(campo)
  const rows = linhas.map((l) => ({ [campo]: obterValorCampoPedidoSimulador(l, campo) }))
  return calcularValoresUnicos(rows, campo, labelMap)
}

export function ordenarLinhasListaSimulador(
  linhas: LinhaListaPedidoSimulador[],
  campo: string | null,
  dir: 'asc' | 'desc' | null,
): LinhaListaPedidoSimulador[] {
  if (!campo || !dir) return linhas
  const fator = dir === 'asc' ? 1 : -1
  return [...linhas].sort((a, b) => {
    const va = obterValorCampoPedidoSimulador(a, campo)
    const vb = obterValorCampoPedidoSimulador(b, campo)
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * fator
    const sa = String(va ?? '').toLowerCase()
    const sb = String(vb ?? '').toLowerCase()
    if (sa < sb) return -1 * fator
    if (sa > sb) return 1 * fator
    return 0
  })
}

export function montarColunasGtListaSimulador(
  colunas: ColunaListaSimuladorPedido[],
): GTColuna<LinhaListaPedidoSimulador>[] {
  return colunas.map(colunaParaGtColuna)
}
