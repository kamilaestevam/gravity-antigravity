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
 * Estado inicial — tudo selecionado (padrão demo): desmarcar um item restringe o mapa.
 * Operação mantém opt-out (ambas ligadas = todas as rotas visíveis).
 */
export function criarFiltrosRefinarMapaIniciais(
  opcoes?: OpcoesRefinarMapaSimuladorPedido,
): FiltrosRefinarMapaSimuladorPedido {
  if (!opcoes) {
    return {
      operacoes: new Set(OPERACOES_REFINAR_MAPA_SIMULADOR_PEDIDO),
      origens: new Set(),
      destinos: new Set(),
      exportadores: new Set(),
      importadores: new Set(),
      status: new Set(),
    }
  }

  return {
    operacoes: new Set(OPERACOES_REFINAR_MAPA_SIMULADOR_PEDIDO),
    origens: new Set(opcoes.origens.map((item) => item.codigo)),
    destinos: new Set(opcoes.destinos.map((item) => item.codigo)),
    exportadores: new Set(opcoes.exportadores),
    importadores: new Set(opcoes.importadores),
    status: new Set(opcoes.status.map((item) => item.id)),
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

function conjuntoRestringe(conjunto: Set<unknown>, totalOpcoes: number): boolean {
  return totalOpcoes > 0 && conjunto.size < totalOpcoes
}

function todasOperacoesRefinarAtivas(filtros: FiltrosRefinarMapaSimuladorPedido): boolean {
  return OPERACOES_REFINAR_MAPA_SIMULADOR_PEDIDO.every((operacao) => filtros.operacoes.has(operacao))
}

function rotaPassaFiltros(
  rota: RotaMapaSimuladorPedido,
  meta: MetadadosRotaRefinarMapaSimuladorPedido | undefined,
  filtros: FiltrosRefinarMapaSimuladorPedido,
  opcoes: OpcoesRefinarMapaSimuladorPedido,
): boolean {
  if (!meta) return true

  if (!todasOperacoesRefinarAtivas(filtros) && !filtros.operacoes.has(meta.operacao)) return false
  if (conjuntoRestringe(filtros.origens, opcoes.origens.length) && !filtros.origens.has(meta.origemPais)) return false
  if (conjuntoRestringe(filtros.destinos, opcoes.destinos.length) && !filtros.destinos.has(meta.destinoPais)) return false
  if (conjuntoRestringe(filtros.exportadores, opcoes.exportadores.length) && !filtros.exportadores.has(meta.exportador)) return false
  if (conjuntoRestringe(filtros.importadores, opcoes.importadores.length) && !filtros.importadores.has(meta.importador)) return false
  if (conjuntoRestringe(filtros.status, opcoes.status.length) && !filtros.status.has(meta.status)) return false

  return true
}

export function filtrarMapaRefinarSimuladorPedido(
  mapa: MapaPedidoEmpresaSimulador,
  metadados: Map<string, MetadadosRotaRefinarMapaSimuladorPedido>,
  filtros: FiltrosRefinarMapaSimuladorPedido,
  opcoes: OpcoesRefinarMapaSimuladorPedido,
): MapaPedidoEmpresaSimulador {
  const rotas = mapa.rotas.filter((rota) =>
    rotaPassaFiltros(rota, metadados.get(chaveRota(rota)), filtros, opcoes),
  )

  const pinIds = new Set<number>()
  for (const rota of rotas) {
    pinIds.add(rota.fromId)
    pinIds.add(rota.toId)
  }

  const pins = mapa.pins.filter((pin) => pinIds.has(pin.id))

  return { pins, rotas }
}

export function contarFiltrosRefinarMapaAtivos(
  filtros: FiltrosRefinarMapaSimuladorPedido,
  opcoes: OpcoesRefinarMapaSimuladorPedido,
): number {
  const operacoesDesligadas = OPERACOES_REFINAR_MAPA_SIMULADOR_PEDIDO.filter(
    (operacao) => !filtros.operacoes.has(operacao),
  ).length

  const itensDesmarcados = (selecionados: number, total: number) =>
    total > 0 && selecionados < total ? total - selecionados : 0

  return (
    operacoesDesligadas +
    itensDesmarcados(filtros.origens.size, opcoes.origens.length) +
    itensDesmarcados(filtros.destinos.size, opcoes.destinos.length) +
    itensDesmarcados(filtros.exportadores.size, opcoes.exportadores.length) +
    itensDesmarcados(filtros.importadores.size, opcoes.importadores.length) +
    itensDesmarcados(filtros.status.size, opcoes.status.length)
  )
}

function somarPedidosMapa(mapa: MapaPedidoEmpresaSimulador): number {
  return mapa.pins.reduce((total, pin) => total + pin.pedidosCount, 0)
}

export function formatarResumoRefinarMapaSimuladorPedido(
  mapaBase: MapaPedidoEmpresaSimulador,
  mapaFiltrado: MapaPedidoEmpresaSimulador,
  totalFiltrosAtivos: number,
): string {
  const contadores = calcularContadoresRefinarMapaSimuladorPedido(mapaBase, mapaFiltrado, totalFiltrosAtivos)
  if (contadores.modo === 'todos') {
    return `Exibindo todos — ${contadores.terminais} terminais — ${contadores.rotas} rotas`
  }
  return `${contadores.terminais}/${contadores.terminaisBase} terminais — ${contadores.rotas}/${contadores.rotasBase} rotas — ${contadores.filtrosAtivos} filtro(s)`
}

export function formatarResumoRefinarMapaTelaCheiaSimuladorPedido(
  mapaBase: MapaPedidoEmpresaSimulador,
  mapaFiltrado: MapaPedidoEmpresaSimulador,
  totalFiltrosAtivos: number,
): string {
  const contadores = calcularContadoresRefinarMapaSimuladorPedido(mapaBase, mapaFiltrado, totalFiltrosAtivos)
  if (contadores.modo === 'todos') {
    return `Exibindo todos · ${contadores.pedidos} pedidos · ${contadores.locais} locais · ${contadores.rotas} rotas`
  }
  return `${contadores.pedidos}/${contadores.pedidosBase} pedidos · ${contadores.locais}/${contadores.locaisBase} locais · ${contadores.rotas}/${contadores.rotasBase} rotas · ${contadores.filtrosAtivos} filtro(s)`
}

export type ContadoresRefinarMapaSimuladorPedido = {
  modo: 'todos' | 'filtrado'
  terminais: number
  terminaisBase: number
  locais: number
  locaisBase: number
  pedidos: number
  pedidosBase: number
  rotas: number
  rotasBase: number
  filtrosAtivos: number
}

export function calcularContadoresRefinarMapaSimuladorPedido(
  mapaBase: MapaPedidoEmpresaSimulador,
  mapaFiltrado: MapaPedidoEmpresaSimulador,
  totalFiltrosAtivos: number,
): ContadoresRefinarMapaSimuladorPedido {
  return {
    modo: totalFiltrosAtivos === 0 ? 'todos' : 'filtrado',
    terminais: mapaFiltrado.pins.length,
    terminaisBase: mapaBase.pins.length,
    locais: mapaFiltrado.pins.length,
    locaisBase: mapaBase.pins.length,
    pedidos: somarPedidosMapa(mapaFiltrado),
    pedidosBase: somarPedidosMapa(mapaBase),
    rotas: mapaFiltrado.rotas.length,
    rotasBase: mapaBase.rotas.length,
    filtrosAtivos: totalFiltrosAtivos,
  }
}

export function prepararContextoRefinarMapaSimuladorPedido(empresas: PerfilEmpresaSimulador[]) {
  const mapaBase = agregarMapaPedidosEmpresasSimulador(empresas)
  const linhas = listarPedidosEmpresasSimulador(empresas)
  const metadados = construirMetadadosRotasRefinarMapa(mapaBase, linhas)
  const opcoes = montarOpcoesRefinarMapaSimuladorPedido(empresas, mapaBase, linhas, metadados)
  return { mapaBase, linhas, metadados, opcoes }
}
