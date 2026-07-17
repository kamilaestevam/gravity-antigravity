import {
  PINS_MAPA_SIMULADOR_PEDIDO,
  ROTAS_MAPA_SIMULADOR_PEDIDO,
  type PinMapaSimuladorPedido,
  type RotaMapaSimuladorPedido,
} from '../../../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/dados-mapa-globo-simulador-pedido'

export type StatusPedidoFiltroMapa = 'rascunho' | 'aberto' | 'em_andamento' | 'consolidado'

export type PedidoDemoFiltroMapa = {
  id: string
  operacao: 'importacao' | 'exportacao'
  origemPais: string
  destinoPais: string
  exportador: string
  importador: string
  status: StatusPedidoFiltroMapa
  fromPinId: number
  toPinId: number
}

export type CampoFiltroMapaPedidoId =
  | 'operacao'
  | 'origem'
  | 'destino'
  | 'exportador'
  | 'importador'
  | 'status'

export type EstadoFiltrosMapaPedido = {
  operacoes: Set<'importacao' | 'exportacao'>
  origens: Set<string>
  destinos: Set<string>
  exportadores: Set<string>
  importadores: Set<string>
  statuses: Set<StatusPedidoFiltroMapa>
}

const PINS_BY_ID = new Map<number, PinMapaSimuladorPedido>(
  PINS_MAPA_SIMULADOR_PEDIDO.map((pin) => [pin.id, pin]),
)

export const PEDIDOS_DEMO_FILTROS_MAPA: PedidoDemoFiltroMapa[] = [
  {
    id: 'po-2401',
    operacao: 'importacao',
    origemPais: 'CN',
    destinoPais: 'BR',
    exportador: 'Shenzhen Components',
    importador: 'Filial SC Importador',
    status: 'aberto',
    fromPinId: 2,
    toPinId: 1,
  },
  {
    id: 'po-2402',
    operacao: 'importacao',
    origemPais: 'JP',
    destinoPais: 'BR',
    exportador: 'Asia Pacific Ltd',
    importador: 'Filial SC Importador',
    status: 'em_andamento',
    fromPinId: 3,
    toPinId: 1,
  },
  {
    id: 'po-2403',
    operacao: 'importacao',
    origemPais: 'GB',
    destinoPais: 'BR',
    exportador: 'EuroParts GmbH',
    importador: 'Matriz SP Importador',
    status: 'consolidado',
    fromPinId: 4,
    toPinId: 7,
  },
  {
    id: 'po-2404',
    operacao: 'importacao',
    origemPais: 'NL',
    destinoPais: 'BR',
    exportador: 'Nordic Supply',
    importador: 'Matriz SP Importador',
    status: 'rascunho',
    fromPinId: 8,
    toPinId: 7,
  },
  {
    id: 'po-2405',
    operacao: 'importacao',
    origemPais: 'FR',
    destinoPais: 'BR',
    exportador: 'Nordic Supply',
    importador: 'Importador Ltda',
    status: 'aberto',
    fromPinId: 5,
    toPinId: 1,
  },
  {
    id: 'po-2406',
    operacao: 'importacao',
    origemPais: 'DE',
    destinoPais: 'BR',
    exportador: 'EuroParts GmbH',
    importador: 'Importador Ltda',
    status: 'em_andamento',
    fromPinId: 11,
    toPinId: 1,
  },
  {
    id: 'po-2407',
    operacao: 'exportacao',
    origemPais: 'BR',
    destinoPais: 'US',
    exportador: 'Agro Export PR',
    importador: 'Detroit Motors LLC',
    status: 'consolidado',
    fromPinId: 10,
    toPinId: 6,
  },
  {
    id: 'po-2408',
    operacao: 'exportacao',
    origemPais: 'BR',
    destinoPais: 'BR',
    exportador: 'Agro Export PR',
    importador: 'Santos Trading',
    status: 'aberto',
    fromPinId: 10,
    toPinId: 9,
  },
  {
    id: 'po-2409',
    operacao: 'exportacao',
    origemPais: 'BR',
    destinoPais: 'FR',
    exportador: 'Café Santos Export',
    importador: 'Paris Retail SA',
    status: 'rascunho',
    fromPinId: 9,
    toPinId: 5,
  },
  {
    id: 'po-2410',
    operacao: 'exportacao',
    origemPais: 'BR',
    destinoPais: 'GB',
    exportador: 'Café Santos Export',
    importador: 'London Import Co',
    status: 'em_andamento',
    fromPinId: 9,
    toPinId: 4,
  },
]

export const OPCOES_ORIGEM_FILTRO_MAPA = [
  { codigo: 'CN', rotulo: 'China', flag: '🇨🇳' },
  { codigo: 'JP', rotulo: 'Japão', flag: '🇯🇵' },
  { codigo: 'GB', rotulo: 'Reino Unido', flag: '🇬🇧' },
  { codigo: 'NL', rotulo: 'Países Baixos', flag: '🇳🇱' },
  { codigo: 'FR', rotulo: 'França', flag: '🇫🇷' },
  { codigo: 'DE', rotulo: 'Alemanha', flag: '🇩🇪' },
  { codigo: 'BR', rotulo: 'Brasil', flag: '🇧🇷' },
] as const

export const OPCOES_DESTINO_FILTRO_MAPA = [
  { codigo: 'BR', rotulo: 'Brasil', flag: '🇧🇷' },
  { codigo: 'US', rotulo: 'Estados Unidos', flag: '🇺🇸' },
  { codigo: 'FR', rotulo: 'França', flag: '🇫🇷' },
  { codigo: 'GB', rotulo: 'Reino Unido', flag: '🇬🇧' },
] as const

export const OPCOES_EXPORTADOR_FILTRO_MAPA = [
  'Shenzhen Components',
  'Asia Pacific Ltd',
  'EuroParts GmbH',
  'Nordic Supply',
  'Agro Export PR',
  'Café Santos Export',
] as const

export const OPCOES_IMPORTADOR_FILTRO_MAPA = [
  'Filial SC Importador',
  'Matriz SP Importador',
  'Importador Ltda',
  'Detroit Motors LLC',
  'Santos Trading',
  'Paris Retail SA',
  'London Import Co',
] as const

export const OPCOES_STATUS_FILTRO_MAPA: Array<{ id: StatusPedidoFiltroMapa; rotulo: string; cor: string }> = [
  { id: 'rascunho', rotulo: 'Rascunho', cor: '#94a3b8' },
  { id: 'aberto', rotulo: 'Aberto', cor: '#fbbf24' },
  { id: 'em_andamento', rotulo: 'Em andamento', cor: '#f59e0b' },
  { id: 'consolidado', rotulo: 'Consolidado', cor: '#34d399' },
]

export function filtrosMapaPedidoIniciais(): EstadoFiltrosMapaPedido {
  return {
    operacoes: new Set(['importacao', 'exportacao']),
    origens: new Set(OPCOES_ORIGEM_FILTRO_MAPA.map((o) => o.codigo)),
    destinos: new Set(OPCOES_DESTINO_FILTRO_MAPA.map((o) => o.codigo)),
    exportadores: new Set(OPCOES_EXPORTADOR_FILTRO_MAPA),
    importadores: new Set(OPCOES_IMPORTADOR_FILTRO_MAPA),
    statuses: new Set(OPCOES_STATUS_FILTRO_MAPA.map((s) => s.id)),
  }
}

function pedidoPassaFiltros(pedido: PedidoDemoFiltroMapa, filtros: EstadoFiltrosMapaPedido): boolean {
  if (!filtros.operacoes.has(pedido.operacao)) return false
  if (!filtros.origens.has(pedido.origemPais)) return false
  if (!filtros.destinos.has(pedido.destinoPais)) return false
  if (!filtros.exportadores.has(pedido.exportador)) return false
  if (!filtros.importadores.has(pedido.importador)) return false
  if (!filtros.statuses.has(pedido.status)) return false
  return true
}

export function filtrarPedidosDemoMapa(filtros: EstadoFiltrosMapaPedido): PedidoDemoFiltroMapa[] {
  return PEDIDOS_DEMO_FILTROS_MAPA.filter((pedido) => pedidoPassaFiltros(pedido, filtros))
}

export function montarMapaFiltradoPedido(filtros: EstadoFiltrosMapaPedido): {
  pins: PinMapaSimuladorPedido[]
  rotas: RotaMapaSimuladorPedido[]
  pedidosVisiveis: number
} {
  const pedidos = filtrarPedidosDemoMapa(filtros)
  const pinIds = new Set<number>()
  const rotaChaves = new Set<string>()
  const rotas: RotaMapaSimuladorPedido[] = []

  pedidos.forEach((pedido) => {
    pinIds.add(pedido.fromPinId)
    pinIds.add(pedido.toPinId)
    const chave = `${pedido.fromPinId}|${pedido.toPinId}|${pedido.operacao}`
    if (rotaChaves.has(chave)) return
    rotaChaves.add(chave)
    const existente = ROTAS_MAPA_SIMULADOR_PEDIDO.find(
      (r) => r.fromId === pedido.fromPinId && r.toId === pedido.toPinId && r.mode === pedido.operacao,
    )
    if (existente) {
      rotas.push(existente)
      return
    }
    rotas.push({
      fromId: pedido.fromPinId,
      toId: pedido.toPinId,
      mode: pedido.operacao,
      color: pedido.operacao === 'importacao' ? 'rgba(245, 158, 11, 0.85)' : 'rgba(167, 139, 250, 0.85)',
      heightFactor: 0.18,
    })
  })

  const pins = [...pinIds]
    .map((id) => PINS_BY_ID.get(id))
    .filter((pin): pin is PinMapaSimuladorPedido => pin != null)

  return { pins, rotas, pedidosVisiveis: pedidos.length }
}

const ROTULO_STATUS: Record<StatusPedidoFiltroMapa, string> = {
  rascunho: 'Rascunho',
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  consolidado: 'Consolidado',
}

function rotuloOperacoes(filtros: EstadoFiltrosMapaPedido): string {
  const partes: string[] = []
  if (filtros.operacoes.has('importacao')) partes.push('Importação')
  if (filtros.operacoes.has('exportacao')) partes.push('Exportação')
  return partes.length ? partes.join(' + ') : 'Nenhuma'
}

function rotuloConjunto(
  todos: readonly string[],
  ativos: Set<string>,
  mapa?: Record<string, string>,
): string {
  if (ativos.size === 0) return 'Nenhum'
  if (ativos.size === todos.length) return 'Todos'
  const lista = [...ativos].map((item) => mapa?.[item] ?? item)
  if (lista.length <= 2) return lista.join(', ')
  return `${lista.length} selecionados`
}

export function resolverSelecoesGuiaFiltrosMapa(
  filtros: EstadoFiltrosMapaPedido,
  interagiu: Partial<Record<CampoFiltroMapaPedidoId, boolean>>,
): Array<{ id: CampoFiltroMapaPedidoId; valor: string }> {
  const selecoes: Array<{ id: CampoFiltroMapaPedidoId; valor: string }> = []
  if (interagiu.operacao) {
    selecoes.push({ id: 'operacao', valor: rotuloOperacoes(filtros) })
  }
  if (interagiu.origem) {
    selecoes.push({
      id: 'origem',
      valor: rotuloConjunto(
        OPCOES_ORIGEM_FILTRO_MAPA.map((o) => o.codigo),
        filtros.origens,
        Object.fromEntries(OPCOES_ORIGEM_FILTRO_MAPA.map((o) => [o.codigo, o.rotulo])),
      ),
    })
  }
  if (interagiu.destino) {
    selecoes.push({
      id: 'destino',
      valor: rotuloConjunto(
        OPCOES_DESTINO_FILTRO_MAPA.map((o) => o.codigo),
        filtros.destinos,
        Object.fromEntries(OPCOES_DESTINO_FILTRO_MAPA.map((o) => [o.codigo, o.rotulo])),
      ),
    })
  }
  if (interagiu.exportador) {
    selecoes.push({
      id: 'exportador',
      valor: rotuloConjunto(OPCOES_EXPORTADOR_FILTRO_MAPA, filtros.exportadores),
    })
  }
  if (interagiu.importador) {
    selecoes.push({
      id: 'importador',
      valor: rotuloConjunto(OPCOES_IMPORTADOR_FILTRO_MAPA, filtros.importadores),
    })
  }
  if (interagiu.status) {
    selecoes.push({
      id: 'status',
      valor: rotuloConjunto(
        OPCOES_STATUS_FILTRO_MAPA.map((s) => s.id),
        filtros.statuses as Set<string>,
        ROTULO_STATUS,
      ),
    })
  }
  return selecoes
}

export function resolverExplicacaoFiltrosMapa(
  campo: CampoFiltroMapaPedidoId,
  filtros: EstadoFiltrosMapaPedido,
  pedidosVisiveis: number,
): string {
  const totalPins = montarMapaFiltradoPedido(filtros).pins.length
  switch (campo) {
    case 'operacao':
      return `Com **${rotuloOperacoes(filtros)}** ativos, o mapa exibe **${pedidosVisiveis} pedidos** em **${totalPins} locais**. Desmarque um fluxo para ocultar pins e trilhos daquela direção.`
    case 'origem':
      return `Países de **origem** selecionados recortam de onde os pedidos saem. Combine com destino e status para afunilar rotas em tempo real. Agora **${pedidosVisiveis} pedidos** permanecem visíveis.`
    case 'destino':
      return `O critério de **destino** filtra a chegada dos pedidos. Cruze com origem e exportador para ver só trechos compatíveis. **${totalPins} pins** no mapa após o recorte.`
    case 'exportador':
      return `Lista os **exportadores** do workspace. Ao marcar um nome, o mapa mantém apenas pedidos em que ele participa. Útil para acompanhar um fornecedor específico.`
    case 'importador':
      return `Filtra por **importador** cadastrado. Combine com operação e status para ver a carga de cada filial ou parceiro no globo.`
    case 'status':
      return `**Status do pedido** afunila rascunhos, abertos, em andamento e consolidados. Todos os filtros são cumulativos. **${pedidosVisiveis} pedidos** após as seleções atuais.`
    default:
      return ''
  }
}

export function resumoMapaFiltradoPedido(pedidosVisiveis: number, pins: number): string {
  if (pedidosVisiveis === 0) {
    return 'Nenhum pedido para os filtros ativos'
  }
  return `${pedidosVisiveis} pedidos · ${pins} locais no mapa`
}
