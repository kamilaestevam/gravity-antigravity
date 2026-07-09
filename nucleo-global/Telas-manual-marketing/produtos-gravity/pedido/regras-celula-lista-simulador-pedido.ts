import type { ItemListaPedidoSimulador, LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'

export type NivelLinhaLista = 'pai' | 'item'

export type TipoEdicaoCelula = 'texto' | 'enum' | 'periodo' | 'calculado' | 'somente_leitura'

export type OpcaoEnumCelula = { valor: string; label: string }

export type EstadoCelulaLista = {
  editavel: boolean
  bloqueada: boolean
  somenteLeitura: boolean
  tipo: TipoEdicaoCelula
  tooltipBloqueado?: string
  opcoes?: OpcaoEnumCelula[]
  alertavel: boolean
}

const CALCULADOS_PEDIDO = new Set([
  'valor_total_pedido',
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
])

const SOMENTE_LEITURA = new Set([
  'status',
  'taxa_cambio_estimada',
  'pais_exportador',
  'estado_exportador',
  'cidade_exportador',
  'endereco_exportador',
  'zip_code_exportador',
])

const LOGISTICA_PEDIDO = new Set([
  'porto_origem',
  'porto_destino',
  'local_de_origem',
  'local_de_destino',
  'aeroporto_origem',
  'aeroporto_destino',
])

const BLOQUEADO_ITEM = new Set([
  'tipo_operacao',
  'id_workspace',
  'nome_importador',
  'porto_origem',
  'porto_destino',
  'local_de_origem',
  'local_de_destino',
  'aeroporto_origem',
  'aeroporto_destino',
  'quantidade_transferida_total',
  'quantidade_cancelada_total_pedido',
  'saldo_itens_do_pedido',
])

const ALERTAVEL = new Set([
  'numero_pedido',
  'incoterm',
  'status',
  'referencia_exportador',
  'referencia_importador',
  'porto_origem',
  'moeda_pedido',
  'moeda_item',
  'unidade_comercializada_pedido',
  'unidade_comercializada_item',
])

const PERIODO = new Set([
  'data_emissao_pedido',
  'data_consolidacao_pedido',
  'data_transferencia_saldo_pedido',
  'data_prevista_pedido_pronto',
  'data_confirmada_pedido_pronto',
  'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido',
  'data_confirmada_inspecao_pedido',
  'data_meta_inspecao_pedido',
  'data_prevista_coleta_pedido',
  'data_confirmada_coleta_pedido',
  'data_meta_coleta_pedido',
])

export const OPCOES_STATUS: OpcaoEnumCelula[] = [
  { valor: 'RASCUNHO', label: 'Rascunho' },
  { valor: 'ABERTO', label: 'Aberto' },
  { valor: 'EM ANDAMENTO', label: 'Em Andamento' },
  { valor: 'TRANSFERIDO', label: 'Transferido' },
  { valor: 'CONSOLIDADO', label: 'Consolidado' },
]

export const OPCOES_TIPO_OPERACAO: OpcaoEnumCelula[] = [
  { valor: 'IMPORTAÇÃO', label: 'Importação' },
  { valor: 'EXPORTAÇÃO', label: 'Exportação' },
]

export const OPCOES_INCOTERM: OpcaoEnumCelula[] = [
  'FOB', 'CIF', 'EXW', 'CFR', 'DDP', 'FCA', 'DAP', 'FAS',
].map((v) => ({ valor: v, label: v }))

export const OPCOES_PORTO: OpcaoEnumCelula[] = [
  'SANTOS', 'PARANAGUÁ', 'ITAJAÍ', 'ROTTERDAM', 'HAMBURG', 'LONDON', 'YOKOHAMA', 'OSLO', 'RECIFE',
].map((v) => ({ valor: v, label: v }))

export const OPCOES_EXPORTADOR: OpcaoEnumCelula[] = [
  'London Metals',
  'Milan Fashion SpA',
  'Felixstowe Importers',
  'Nippon Parts Co.',
  'Rotterdam Supply',
  'Nordic Supply',
  'Midwest Foods US',
].map((v) => ({ valor: v, label: v }))

const TOOLTIPS_BLOQUEADO_ITEM: Record<string, string> = {
  tipo_operacao: 'Tipo de operação é do pedido — altere na linha do pedido',
  id_workspace: 'Workspace é do pedido — altere na linha do pedido',
  nome_importador: 'Importador é do pedido — altere na linha do pedido',
  nome_exportador: 'Exportador definido automaticamente pelo workspace — não editável em Exportação',
  porto_origem: 'Logística é do pedido — altere na linha do pedido',
  porto_destino: 'Logística é do pedido — altere na linha do pedido',
  local_de_origem: 'Logística é do pedido — altere na linha do pedido',
  local_de_destino: 'Logística é do pedido — altere na linha do pedido',
  quantidade_transferida_total: 'Campo calculado — incrementado automaticamente ao executar uma transferência',
  quantidade_cancelada_total_pedido: 'Campo calculado — alterado apenas via cancelamento',
  saldo_itens_do_pedido: 'Saldo derivado da fórmula — não editável diretamente',
}

const TOOLTIPS_BLOQUEADO_PAI: Record<string, string> = {
  valor_total_pedido: 'Valor total é calculado pela soma dos itens',
  quantidade_total_pedido: 'Quantidade total é calculada pela soma dos itens',
  saldo_itens_do_pedido: 'Saldo derivado da fórmula — não editável diretamente',
  quantidade_transferida_total: 'Campo calculado — incrementado automaticamente ao executar uma transferência',
  status: 'Status do pedido é somente leitura nesta linha — edite no item quando necessário',
}

function opcoesEnum(colunaId: string, linha: LinhaListaPedidoSimulador): OpcaoEnumCelula[] | undefined {
  switch (colunaId) {
    case 'status':
      return OPCOES_STATUS
    case 'tipo_operacao':
      return OPCOES_TIPO_OPERACAO
    case 'incoterm':
      return OPCOES_INCOTERM
    case 'porto_origem':
    case 'porto_destino':
      return OPCOES_PORTO
    case 'nome_exportador':
      return OPCOES_EXPORTADOR
    case 'id_workspace':
      return [{ valor: linha.workspace, label: linha.workspace }]
    default:
      return undefined
  }
}

function resolverTipo(colunaId: string, nivel: NivelLinhaLista): TipoEdicaoCelula {
  if (SOMENTE_LEITURA.has(colunaId)) return 'somente_leitura'
  if (nivel === 'pai' && CALCULADOS_PEDIDO.has(colunaId)) return 'calculado'
  if (PERIODO.has(colunaId) || colunaId.startsWith('data_')) return 'periodo'
  if (opcoesEnum(colunaId, { workspace: '' } as LinhaListaPedidoSimulador)) return 'enum'
  return 'texto'
}

export function resolverEstadoCelula(
  colunaId: string,
  nivel: NivelLinhaLista,
  linha: LinhaListaPedidoSimulador,
  item?: ItemListaPedidoSimulador,
): EstadoCelulaLista {
  const tipo = resolverTipo(colunaId, nivel)
  const alertavel = ALERTAVEL.has(colunaId)
  const opcoes = opcoesEnum(colunaId, linha)

  if (nivel === 'item' && item) {
    if (BLOQUEADO_ITEM.has(colunaId)) {
      return {
        editavel: false,
        bloqueada: true,
        somenteLeitura: false,
        tipo,
        tooltipBloqueado: TOOLTIPS_BLOQUEADO_ITEM[colunaId],
        opcoes,
        alertavel,
      }
    }
    if (colunaId === 'nome_exportador' && linha.tipoOperacao === 'EXPORTAÇÃO') {
      return {
        editavel: false,
        bloqueada: true,
        somenteLeitura: false,
        tipo,
        tooltipBloqueado: TOOLTIPS_BLOQUEADO_ITEM.nome_exportador,
        opcoes,
        alertavel,
      }
    }
    if (colunaId === 'status') {
      return {
        editavel: true,
        bloqueada: false,
        somenteLeitura: false,
        tipo: 'enum',
        opcoes: OPCOES_STATUS,
        alertavel: true,
      }
    }
    if (tipo === 'calculado') {
      return {
        editavel: true,
        bloqueada: false,
        somenteLeitura: false,
        tipo: 'texto',
        alertavel,
      }
    }
    if (tipo === 'somente_leitura') {
      return {
        editavel: false,
        bloqueada: false,
        somenteLeitura: true,
        tipo,
        alertavel,
      }
    }
    return {
      editavel: true,
      bloqueada: false,
      somenteLeitura: false,
      tipo,
      opcoes,
      alertavel,
    }
  }

  if (LOGISTICA_PEDIDO.has(colunaId)) {
    return {
      editavel: true,
      bloqueada: false,
      somenteLeitura: false,
      tipo: opcoes ? 'enum' : 'texto',
      opcoes,
      alertavel,
    }
  }

  if (colunaId === 'nome_exportador' && linha.vincularExportador) {
    return {
      editavel: true,
      bloqueada: false,
      somenteLeitura: false,
      tipo: 'enum',
      opcoes: OPCOES_EXPORTADOR,
      alertavel,
    }
  }

  if (tipo === 'calculado' || tipo === 'somente_leitura') {
    const tooltip = TOOLTIPS_BLOQUEADO_PAI[colunaId]
    return {
      editavel: false,
      bloqueada: !!tooltip,
      somenteLeitura: true,
      tipo,
      tooltipBloqueado: tooltip,
      opcoes,
      alertavel,
    }
  }

  return {
    editavel: true,
    bloqueada: false,
    somenteLeitura: false,
    tipo,
    opcoes,
    alertavel,
  }
}

export function celulaTemDivergencia(
  colunaId: string,
  linha: LinhaListaPedidoSimulador,
  item?: ItemListaPedidoSimulador,
): boolean {
  if (!item || !ALERTAVEL.has(colunaId)) return false
  const valorPai = linha.campos[colunaId] ?? null
  const valorItem = item.campos[colunaId] ?? null
  if (valorPai == null || valorItem == null) return false
  return valorPai !== valorItem
}

export function pedidoTemAlertaIncoterm(linha: LinhaListaPedidoSimulador): boolean {
  const incotermPai = linha.campos.incoterm ?? linha.incoterm
  return linha.detalhesItens.some((item) => {
    const incotermItem = item.campos.incoterm
    return incotermItem != null && incotermItem !== incotermPai
  })
}
