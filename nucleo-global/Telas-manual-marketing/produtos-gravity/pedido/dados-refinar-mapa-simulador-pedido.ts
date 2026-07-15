import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  agregarMapaPedidosEmpresasSimulador,
  type MapaPedidoEmpresaSimulador,
  type PinMapaSimuladorPedido,
  type RotaMapaSimuladorPedido,
} from './dados-mapa-globo-simulador-pedido'
import {
  listarPedidosEmpresasSimulador,
  type LinhaListaPedidoSimulador,
  type StatusListaPedidoSimulador,
} from './dados-lista-simulador-pedido'

export type SecaoRefinarMapaSimuladorPedido =
  | 'operacao'
  | 'origem'
  | 'destino'
  | 'exportadores'
  | 'importadores'
  | 'status'

export const SECOES_REFINAR_MAPA_SIMULADOR_PEDIDO: SecaoRefinarMapaSimuladorPedido[] = [
  'operacao',
  'origem',
  'destino',
  'exportadores',
  'importadores',
  'status',
]

export const OPERACOES_REFINAR_MAPA_SIMULADOR_PEDIDO = ['importacao', 'exportacao'] as const

export type FiltrosRefinarMapaSimuladorPedido = {
  operacoes: Set<'importacao' | 'exportacao'>
  origens: Set<string>
  destinos: Set<string>
  exportadores: Set<string>
  importadores: Set<string>
  status: Set<StatusListaPedidoSimulador>
}

export type OpcaoPaisRefinarMapa = {
  codigo: string
  nome: string
  flag: string
}

export type OpcaoStatusRefinarMapa = {
  id: StatusListaPedidoSimulador
  rotulo: string
  cor: string
}

export type OpcoesRefinarMapaSimuladorPedido = {
  operacoes: readonly { id: 'importacao' | 'exportacao'; rotulo: string }[]
  origens: OpcaoPaisRefinarMapa[]
  destinos: OpcaoPaisRefinarMapa[]
  exportadores: string[]
  importadores: string[]
  status: OpcaoStatusRefinarMapa[]
}

export type MetadadosRotaRefinarMapaSimuladorPedido = {
  operacao: 'importacao' | 'exportacao'
  origemPais: string
  destinoPais: string
  exportador: string
  importador: string
  status: StatusListaPedidoSimulador
}

const PAIS_NOME: Record<string, string> = {
  BR: 'Brasil',
  US: 'Estados Unidos',
  CN: 'China',
  JP: 'Japão',
  GB: 'Reino Unido',
  NL: 'Países Baixos',
  FR: 'França',
  DE: 'Alemanha',
}

const STATUS_REFINAR_MAPA: OpcaoStatusRefinarMapa[] = [
  { id: 'RASCUNHO', rotulo: 'Rascunho', cor: '#94a3b8' },
  { id: 'ABERTO', rotulo: 'Aberto', cor: '#fbbf24' },
  { id: 'EM ANDAMENTO', rotulo: 'Em andamento', cor: '#f59e0b' },
  { id: 'TRANSFERIDO', rotulo: 'Transferido', cor: '#22d3ee' },
  { id: 'CONSOLIDADO', rotulo: 'Consolidado', cor: '#34d399' },
]

/**
 * Estado inicial — operação é opt-out (BID Frete): aceso = visível no mapa; apagado = oculta.
 * Origem, destino, exportadores, importadores e status são opt-in (vazio = sem restrição).
 */
export function criarFiltrosRefinarMapaIniciais(): FiltrosRefinarMapaSimuladorPedido {
  return {
    operacoes: new Set(OPERACOES_REFINAR_MAPA_SIMULADOR_PEDIDO),
    origens: new Set(),
    destinos: new Set(),
    exportadores: new Set(),
    importadores: new Set(),
    status: new Set(),
  }
}

/** @deprecated Use criarFiltrosRefinarMapaIniciais */
export function criarFiltrosRefinarMapaVazio(): FiltrosRefinarMapaSimuladorPedido {
  return criarFiltrosRefinarMapaIniciais()
}

function chaveRota(rota: RotaMapaSimuladorPedido): string {
  return `${rota.fromId}|${rota.toId}|${rota.mode}`
}

function nomePais(codigo: string): string {
  return PAIS_NOME[codigo] ?? codigo
}

function montarOpcoesPais(
  pins: PinMapaSimuladorPedido[],
  extrair: (pin: PinMapaSimuladorPedido) => string,
): OpcaoPaisRefinarMapa[] {
  const map = new Map<string, OpcaoPaisRefinarMapa>()
  for (const pin of pins) {
    const codigo = extrair(pin)
    if (!codigo || map.has(codigo)) continue
    map.set(codigo, {
      codigo,
      nome: nomePais(codigo),
      flag: pin.flag,
    })
  }
  return [...map.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

function linhaParaMetadados(
  linha: LinhaListaPedidoSimulador | undefined,
  from: PinMapaSimuladorPedido,
  to: PinMapaSimuladorPedido,
  mode: 'importacao' | 'exportacao',
): Pick<MetadadosRotaRefinarMapaSimuladorPedido, 'exportador' | 'importador' | 'status'> {
  const exportador =
    linha && !linha.vincularExportador && linha.exportador !== 'Vincular Exportador'
      ? linha.exportador
      : from.fornecedorPrincipal ?? to.fornecedorPrincipal ?? '—'
  const importador = linha?.workspace ?? (mode === 'importacao' ? to.label : from.label)
  const status = linha?.status ?? 'ABERTO'
  return { exportador, importador, status }
}

export function construirMetadadosRotasRefinarMapa(
  mapa: MapaPedidoEmpresaSimulador,
  linhas: LinhaListaPedidoSimulador[],
): Map<string, MetadadosRotaRefinarMapaSimuladorPedido> {
  const pinPorId = new Map(mapa.pins.map((pin) => [pin.id, pin]))
  const metadados = new Map<string, MetadadosRotaRefinarMapaSimuladorPedido>()

  mapa.rotas.forEach((rota, indice) => {
    const from = pinPorId.get(rota.fromId)
    const to = pinPorId.get(rota.toId)
    if (!from || !to) return

    const linha = linhas[indice % Math.max(linhas.length, 1)]
    const extras = linhaParaMetadados(linha, from, to, rota.mode)

    metadados.set(chaveRota(rota), {
      operacao: rota.mode,
      origemPais: from.country,
      destinoPais: to.country,
      ...extras,
    })
  })

  return metadados
}

export function montarOpcoesRefinarMapaSimuladorPedido(
  empresas: PerfilEmpresaSimulador[],
  mapa: MapaPedidoEmpresaSimulador,
  linhas: LinhaListaPedidoSimulador[],
  metadados: Map<string, MetadadosRotaRefinarMapaSimuladorPedido>,
): OpcoesRefinarMapaSimuladorPedido {
  const pinPorId = new Map(mapa.pins.map((pin) => [pin.id, pin]))
  const origensSet = new Set<string>()
  const destinosSet = new Set<string>()

  for (const rota of mapa.rotas) {
    const from = pinPorId.get(rota.fromId)
    const to = pinPorId.get(rota.toId)
    if (from) origensSet.add(from.country)
    if (to) destinosSet.add(to.country)
  }

  const origens = montarOpcoesPais(
    mapa.pins.filter((pin) => origensSet.has(pin.country)),
    (pin) => pin.country,
  )
  const destinos = montarOpcoesPais(
    mapa.pins.filter((pin) => destinosSet.has(pin.country)),
    (pin) => pin.country,
  )

  const exportadores = [
    ...new Set(
      [...metadados.values()]
        .map((meta) => meta.exportador)
        .filter((nome) => nome && nome !== '—' && nome !== 'Escopo consolidado'),
    ),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'))

  const importadores = [
    ...new Set([
      ...empresas.map((empresa) => empresa.nome),
      ...[...metadados.values()].map((meta) => meta.importador),
      ...linhas.map((linha) => linha.workspace),
    ]),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'))

  return {
    operacoes: [
      { id: 'importacao', rotulo: 'Importação' },
      { id: 'exportacao', rotulo: 'Exportação' },
    ],
    origens,
    destinos,
    exportadores,
    importadores,
    status: STATUS_REFINAR_MAPA,
  }
}

function conjuntoAtivo<T>(conjunto: Set<T>): boolean {
  return conjunto.size > 0
}

function todasOperacoesRefinarAtivas(filtros: FiltrosRefinarMapaSimuladorPedido): boolean {
  return OPERACOES_REFINAR_MAPA_SIMULADOR_PEDIDO.every((operacao) => filtros.operacoes.has(operacao))
}

function rotaPassaFiltros(
  rota: RotaMapaSimuladorPedido,
  meta: MetadadosRotaRefinarMapaSimuladorPedido | undefined,
  filtros: FiltrosRefinarMapaSimuladorPedido,
): boolean {
  if (!meta) return true

  if (!todasOperacoesRefinarAtivas(filtros) && !filtros.operacoes.has(meta.operacao)) return false
  if (conjuntoAtivo(filtros.origens) && !filtros.origens.has(meta.origemPais)) return false
  if (conjuntoAtivo(filtros.destinos) && !filtros.destinos.has(meta.destinoPais)) return false
  if (conjuntoAtivo(filtros.exportadores) && !filtros.exportadores.has(meta.exportador)) return false
  if (conjuntoAtivo(filtros.importadores) && !filtros.importadores.has(meta.importador)) return false
  if (conjuntoAtivo(filtros.status) && !filtros.status.has(meta.status)) return false

  return true
}

export function filtrarMapaRefinarSimuladorPedido(
  mapa: MapaPedidoEmpresaSimulador,
  metadados: Map<string, MetadadosRotaRefinarMapaSimuladorPedido>,
  filtros: FiltrosRefinarMapaSimuladorPedido,
): MapaPedidoEmpresaSimulador {
  const rotas = mapa.rotas.filter((rota) =>
    rotaPassaFiltros(rota, metadados.get(chaveRota(rota)), filtros),
  )

  const pinIds = new Set<number>()
  for (const rota of rotas) {
    pinIds.add(rota.fromId)
    pinIds.add(rota.toId)
  }

  const pins = mapa.pins.filter((pin) => pinIds.has(pin.id))

  return { pins, rotas }
}

export function contarFiltrosRefinarMapaAtivos(filtros: FiltrosRefinarMapaSimuladorPedido): number {
  const operacoesDesligadas = OPERACOES_REFINAR_MAPA_SIMULADOR_PEDIDO.filter(
    (operacao) => !filtros.operacoes.has(operacao),
  ).length

  return (
    operacoesDesligadas +
    filtros.origens.size +
    filtros.destinos.size +
    filtros.exportadores.size +
    filtros.importadores.size +
    filtros.status.size
  )
}

export function formatarResumoRefinarMapaSimuladorPedido(
  mapaBase: MapaPedidoEmpresaSimulador,
  mapaFiltrado: MapaPedidoEmpresaSimulador,
  totalFiltrosAtivos: number,
): string {
  if (totalFiltrosAtivos === 0) {
    return `Exibindo todos — ${mapaBase.pins.length} terminais — ${mapaBase.rotas.length} rotas`
  }
  return `${mapaFiltrado.pins.length} terminais — ${mapaFiltrado.rotas.length} rotas ativas`
}

export function prepararContextoRefinarMapaSimuladorPedido(empresas: PerfilEmpresaSimulador[]) {
  const mapaBase = agregarMapaPedidosEmpresasSimulador(empresas)
  const linhas = listarPedidosEmpresasSimulador(empresas)
  const metadados = construirMetadadosRotasRefinarMapa(mapaBase, linhas)
  const opcoes = montarOpcoesRefinarMapaSimuladorPedido(empresas, mapaBase, linhas, metadados)
  return { mapaBase, linhas, metadados, opcoes }
}
