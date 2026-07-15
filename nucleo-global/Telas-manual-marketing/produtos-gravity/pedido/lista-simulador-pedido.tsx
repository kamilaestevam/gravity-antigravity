import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { EdicaoTextoPopoverGlobal } from '../../../Tabelas/tabela-virtual-global/src/EdicaoTextoPopoverGlobal'
import { FiltroPopoverColuna } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltroPopoverColuna'
import { rotulofiltro } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/rotulofiltro'
import {
  FiltrosConsolidadosListaSimuladorPedido,
  type ItemFiltroConsolidadoListaSimuladorPedido,
} from './filtros-consolidados-lista-simulador-pedido'
import { BotaoCompletoExportar } from '../../../Tabelas/tabela-virtual-global/src/BotaoCompletoExportar'
import type { FiltroAtivo, FiltrosAtivosMap } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/tipos'
import '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltrosColuna.css'
import '../../../Tabelas/tabela-virtual-global/src/botao-completo-exportar.css'
import {
  ArrowCounterClockwise,
  ArrowRight,
  CaretDoubleDown,
  CaretDoubleUp,
  CaretDown,
  CaretRight,
  CurrencyDollar,
  DownloadSimple,
  FilePdf,
  GitMerge,
  LinkSimple,
  MagnifyingGlass,
  Package,
  PencilLine,
  StackPlus,
  Trash,
  Warning,
  X,
} from '@phosphor-icons/react'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  formatarValorListaPedidoSimulador,
  listarPedidosEmpresasSimulador,
  materializarItensLinhaListaSimulador,
  resumirListaPedidosSimulador,
  type ItemListaPedidoSimulador,
  type LinhaListaPedidoSimulador,
  type StatusListaPedidoSimulador,
} from './dados-lista-simulador-pedido'
import {
  criarEstadoColunasListaSimuladorPedido,
  type ColunaListaSimuladorPedido,
} from './colunas-lista-simulador-pedido'
import './lista-simulador-pedido.css'
import '../../../Tabelas/tabela-virtual-global/src/tabela-virtual.css'
import { atualizarCelulaListaSimulador } from './atualizar-celula-lista-simulador-pedido'
import { CelulaEditavelListaSimuladorPedido } from './celula-editavel-lista-simulador-pedido'
import { EdicaoEnumPopoverSimuladorPedido } from './edicao-enum-popover-simulador-pedido'
import {
  resolverEstadoCelula,
  type NivelLinhaLista,
} from './regras-celula-lista-simulador-pedido'
import {
  reordenarColunasListaSimulador,
  resolverLadoDropColuna,
  type LadoDropColuna,
} from './reordenar-colunas-lista-simulador-pedido'
import {
  calcularValoresUnicosCampoListaSimulador,
  colunaListaSimuladorFiltravel,
  detectarTipoFiltroColunaSimulador,
  getLabelsFiltroInversoSimulador,
  linhaPassaFiltrosColuna,
  montarColunasGtListaSimulador,
  ordenarLinhasListaSimulador,
} from './filtros-coluna-lista-simulador-pedido'
import {
  FaixaPaineisListaSimuladorPedido,
  PAINEIS_LISTA_SIMULADOR_INICIAIS,
  type PainelItemSimulador,
} from './faixa-paineis-lista-simulador-pedido'
import {
  calcularHabilitacaoAcoesBarraListaSimulador,
  resolverSelecaoListaSimulador,
  rotuloTransferirListaSimulador,
  tooltipConsolidarListaSimulador,
  tooltipDuplicarListaSimulador,
  tooltipEditarMassaListaSimulador,
  tooltipExcluirListaSimulador,
  tooltipGerarPdfListaSimulador,
  tooltipTransferirListaSimulador,
  type SelecaoListaSimuladorPedido,
} from './regras-acoes-barra-lista-simulador-pedido'
import { MenuNovoListaSimuladorPedido, ToastDemoNovoSimuladorPedido } from './menu-novo-lista-simulador-pedido'
import { ModalNovoPedidoSimulador } from './modal-novo-pedido-simulador'
import { ModalNovoItemSimuladorPedido } from './modal-novo-item-simulador-pedido'
import { ModalDuplicarListaSimuladorPedido, mensagemToastDuplicacao } from './modal-duplicar-lista-simulador-pedido'
import {
  ModalEdicaoMassaListaSimuladorPedido,
  mensagemToastEdicaoMassa,
} from './modal-edicao-massa-lista-simulador-pedido'
import { ModalExcluirListaSimuladorPedido, mensagemToastExclusao } from './modal-excluir-lista-simulador-pedido'
import { ModalConsolidarListaSimuladorPedido } from './modal-consolidar-lista-simulador-pedido'
import {
  mensagemToastConsolidacao,
  celulaDestaqueGuiaPosConsolidacao,
  colunasDestaqueGuiaPosConsolidacaoSimulador,
  type PassoGuiaPosConsolidacaoSimulador,
  type ResumoConsolidacaoListaSimulador,
} from './consolidar-lista-simulador-pedido'
import { ModalTransferirListaSimuladorPedido } from './modal-transferir-lista-simulador-pedido'
import { ModalExplicacaoTransferenciaSimuladorPedido } from './modal-explicacao-transferencia-simulador-pedido'
import './modal-explicacao-transferencia-simulador-pedido.css'
import { GuiaPosTransferenciaSimuladorPedido } from './guia-pos-transferencia-simulador-pedido'
import './guia-pos-transferencia-simulador-pedido.css'
import { GuiaPosConsolidacaoSimuladorPedido } from './guia-pos-consolidacao-simulador-pedido'
import './guia-pos-consolidacao-simulador-pedido.css'
import {
  duplicarSelecaoListaSimulador,
  excluirSelecaoListaSimulador,
  type ResumoDuplicacaoListaSimulador,
} from './duplicar-excluir-lista-simulador-pedido'
import type { NivelEdicaoMassaSimulador } from './campos-edicao-massa-simulador-pedido'
import {
  aplicarEdicaoMassaListaSimulador,
  type CampoEmEdicaoMassaSimulador,
  type ResumoEdicaoMassaListaSimulador,
} from './edicao-massa-lista-simulador-pedido'
import {
  colunasDestaqueGuiaPosTransferenciaSimulador,
  itemDestaqueGuiaPosTransferencia,
  montarMensagemToastTransferencia,
  type CenarioTransferSimulador,
  type PassoGuiaPosTransferenciaSimulador,
  type ResumoTransferenciaListaSimulador,
} from './transferir-lista-simulador-pedido'
import {
  calcularJanelaColunasScrollListaSimulador,
  scrollContainerParaColunaListaSimuladorAposLayout,
  scrollContainerParaLinhaListaSimulador,
} from './janela-colunas-scroll-lista-simulador-pedido'
import { montarLinhaNovoPedidoSimulador } from './montar-linha-novo-pedido-simulador'
import type { EstadoTutorialListaPedido } from './dados-tutorial-opcional-simulador-pedido'
import type { FornecedorSimuladorNovoPedido } from './dados-fornecedores-simulador-novo-pedido'
import type { FormNovoPedidoSimulador, ItemNovoPedidoSimulador } from './regras-modal-novo-pedido-simulador'
import { useConfigSimuladorPedido } from './estado-config-simulador-pedido'
import { CARDS_CATALOGO_SIMULADOR, statusParaListaValor } from './catalogo-config-simulador-pedido'

type FiltroAbaColunas = 'todas' | 'exibidas' | 'ocultas' | 'manuais'

const STATUS_FILTROS_BASE: Array<{ id: string; label: string; cor: string; valor?: StatusListaPedidoSimulador }> = [
  { id: 'todas', label: 'Todos', cor: '#818cf8' },
]

const EXPORTAR_OPCOES = ['Excel (.xlsx)', 'CSV', 'TXT', 'XML', 'JSON', 'PDF']

const ITENS_POR_PAGINA_MIN = 10
const ITENS_POR_PAGINA_MAX = 200
const ALTURA_LINHA_PEDIDO_LISTA_SIMULADOR = 30
const ALTURA_CABECALHO_TABELA_LISTA_SIMULADOR = 34
const TEXTO_CELULA_VAZIA_LISTA_SIMULADOR = '—'

/** Paridade TabelaVirtualGlobal — primeiras/últimas + janela ±2, com reticências. */
function calcularItensPaginacaoRodape(paginaEfetiva: number, totalPaginas: number): Array<number | '...'> {
  if (totalPaginas <= 1) return []
  const show = new Set([1, totalPaginas])
  for (let p = Math.max(1, paginaEfetiva - 2); p <= Math.min(totalPaginas, paginaEfetiva + 2); p += 1) {
    show.add(p)
  }
  const sorted = Array.from(show).sort((a, b) => a - b)
  const items: Array<number | '...'> = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) items.push('...')
    items.push(p)
  })
  return items
}

function montarIdsPedidosExpandidosPosTransferencia(
  resumo: ResumoTransferenciaListaSimulador,
  idsNovosPedidos: readonly string[],
): string[] {
  const ids = new Set<string>(idsNovosPedidos)
  if (resumo.pedidoOrigemId) ids.add(resumo.pedidoOrigemId)
  if (resumo.pedidoDestinoId) ids.add(resumo.pedidoDestinoId)
  return Array.from(ids)
}

function aplicarExpansaoPedidosPosTransferencia(
  prev: Set<string>,
  resumo: ResumoTransferenciaListaSimulador,
  idsNovosPedidos: readonly string[],
): Set<string> {
  const next = new Set(prev)
  for (const id of montarIdsPedidosExpandidosPosTransferencia(resumo, idsNovosPedidos)) {
    next.add(id)
  }
  return next
}

function IconeColunasToolbar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="3" width="5" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="17" y="3" width="4" height="18" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

const STATUS_CORES: Record<StatusListaPedidoSimulador, string> = {
  RASCUNHO: '#94a3b8',
  ABERTO: '#f472b6',
  'EM ANDAMENTO': '#fb923c',
  TRANSFERIDO: '#2dd4bf',
  CONSOLIDADO: '#a78bfa',
}

/** Texto um tom mais claro — melhora leitura das pílulas na tabela (fundo escuro). */
const STATUS_CORES_NITIDO: Record<StatusListaPedidoSimulador, string> = {
  RASCUNHO: '#cbd5e1',
  ABERTO: '#f9a8d4',
  'EM ANDAMENTO': '#fdba74',
  TRANSFERIDO: '#5eead4',
  CONSOLIDADO: '#c4b5fd',
}

const STATUS_LABELS: Record<StatusListaPedidoSimulador, string> = {
  RASCUNHO: 'Rascunho',
  ABERTO: 'Aberto',
  'EM ANDAMENTO': 'Em Andamento',
  TRANSFERIDO: 'Transferido',
  CONSOLIDADO: 'Consolidado',
}

function estiloStatusBadge(status: StatusListaPedidoSimulador): CSSProperties {
  const cor = STATUS_CORES[status]
  const corTexto = STATUS_CORES_NITIDO[status]
  return {
    color: corTexto,
    background: `${cor}28`,
    border: `1px solid ${cor}55`,
    whiteSpace: 'nowrap',
  }
}

function estiloChipStatusFiltro(id: string, cor: string, ativo: boolean): CSSProperties {
  if (id === 'todas') {
    return {
      color: ativo ? '#c7d2fe' : '#94a3b8',
      background: 'transparent',
      borderColor: 'transparent',
    }
  }
  if (ativo) {
    return {
      color: cor,
      background: `${cor}2e`,
      borderColor: `${cor}55`,
      boxShadow: `0 0 0 1px ${cor}22`,
    }
  }
  return {
    color: '#94a3b8',
    background: 'transparent',
    borderColor: 'transparent',
  }
}

type Props = {
  empresasSelecionadas: PerfilEmpresaSimulador[]
  numeroPedidoFoco?: string | null
  colunaIdFoco?: string | null
  onConsumirFocoLista?: () => void
  onConsumirFocoColuna?: () => void
  onAbrirMenuWorkspaces?: () => void
  onEstadoTutorialChange?: (estado: EstadoTutorialListaPedido) => void
}

function ListaNumeradaWorkspacesTooltipSimulador({ nomes }: { nomes: readonly string[] }) {
  if (nomes.length === 1) {
    return <span>{nomes[0]}</span>
  }

  return (
    <ul className="pds-lista-escopo-ws-tooltip-list">
      {nomes.map((nome, indice) => (
        <li key={`${indice}-${nome}`} className="pds-lista-escopo-ws-tooltip-item">
          <span className="pds-lista-escopo-ws-tooltip-num" aria-hidden="true">{indice + 1}</span>
          <span className="pds-lista-escopo-ws-tooltip-nome">{nome}</span>
        </li>
      ))}
    </ul>
  )
}

type LinhaRenderLista =
  | { tipo: 'pai'; linha: LinhaListaPedidoSimulador; ultimoFilho: boolean }
  | { tipo: 'filho'; item: ItemListaPedidoSimulador; pai: LinhaListaPedidoSimulador; ultimoFilho: boolean }

type CelulaEmEdicao = {
  colunaId: string
  label: string
  anchorRect: DOMRect
  nivel: NivelLinhaLista
  linhaId: string
  itemId?: string
}

function chaveCelula(linhaId: string, colunaId: string, itemId?: string): string {
  return itemId ? `${linhaId}:${itemId}:${colunaId}` : `${linhaId}:${colunaId}`
}

export function ListaSimuladorPedido({
  empresasSelecionadas,
  numeroPedidoFoco = null,
  colunaIdFoco = null,
  onConsumirFocoLista,
  onConsumirFocoColuna,
  onAbrirMenuWorkspaces,
  onEstadoTutorialChange,
}: Props) {
  const { config } = useConfigSimuladorPedido()

  const statusFiltros = useMemo(() => {
    const dinamicos = [...config.status]
      .sort((a, b) => a.ordem - b.ordem)
      .map((s) => ({
        id: s.nome,
        label: s.rotulo,
        cor: s.cor,
        valor: statusParaListaValor(s.nome) as StatusListaPedidoSimulador,
      }))
    return [...STATUS_FILTROS_BASE, ...dinamicos]
  }, [config.status])

  const cardsListaVisiveis = useMemo(
    () =>
      [...config.cardsAtivos]
        .filter((c) => c.visivel)
        .sort((a, b) => a.ordem - b.ordem)
        .map((pref) => CARDS_CATALOGO_SIMULADOR.find((c) => c.id === pref.id))
        .filter((c): c is NonNullable<typeof c> => c != null),
    [config.cardsAtivos],
  )

  const [paineisLista, setPaineisLista] = useState<PainelItemSimulador[]>(PAINEIS_LISTA_SIMULADOR_INICIAIS)
  const [painelAtualId, setPainelAtualId] = useState('geral')
  const [statusFiltro, setStatusFiltro] = useState('todas')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [colunas, setColunas] = useState<ColunaListaSimuladorPedido[]>(() => criarEstadoColunasListaSimuladorPedido())
  const [filtroAbaColunas, setFiltroAbaColunas] = useState<FiltroAbaColunas>('todas')
  const [colunasAberto, setColunasAberto] = useState(false)
  const [buscaColuna, setBuscaColuna] = useState('')
  const [linhas, setLinhas] = useState<LinhaListaPedidoSimulador[]>([])
  const [celulaEmEdicao, setCelulaEmEdicao] = useState<CelulaEmEdicao | null>(null)
  const [salvandoEdicao, setSalvandoEdicao] = useState(false)
  const [resultadoEdicao, setResultadoEdicao] = useState<'sucesso' | 'erro' | null>(null)
  const [flashCelulas, setFlashCelulas] = useState<Map<string, 'salvo' | 'erro'>>(new Map())
  const [dragColunaId, setDragColunaId] = useState<string | null>(null)
  const [dragOverColunaId, setDragOverColunaId] = useState<string | null>(null)
  const [ladoDropColuna, setLadoDropColuna] = useState<LadoDropColuna>('after')
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAtivosMap>({})
  const [popoverFiltroAberto, setPopoverFiltroAberto] = useState<string | null>(null)
  const [popoverFiltroPos, setPopoverFiltroPos] = useState({ top: 0, left: 0 })
  const [sortCampo, setSortCampo] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null)
  const [modalNovoPedidoAberto, setModalNovoPedidoAberto] = useState(false)
  const [passoModalNovoPedido, setPassoModalNovoPedido] = useState(1)
  const [modalNovoItemAberto, setModalNovoItemAberto] = useState(false)
  const [modalDuplicarAberto, setModalDuplicarAberto] = useState(false)
  const [modalConsolidarAberto, setModalConsolidarAberto] = useState(false)
  const [passoModalConsolidar, setPassoModalConsolidar] = useState(1)
  const [modalConsolidarConcluido, setModalConsolidarConcluido] = useState(false)
  const [modalEdicaoMassaAberto, setModalEdicaoMassaAberto] = useState(false)
  const [passoModalEdicaoMassa, setPassoModalEdicaoMassa] = useState(1)
  const [menuNovoAberto, setMenuNovoAberto] = useState(false)
  const [cadastroRapidoEmpresaAberto, setCadastroRapidoEmpresaAberto] = useState(false)
  const [modalTransferirAberto, setModalTransferirAberto] = useState(false)
  const [passoModalTransferir, setPassoModalTransferir] = useState(1)
  const [cenarioModalTransferir, setCenarioModalTransferir] = useState<CenarioTransferSimulador | null>(null)
  const [modalTransferirConcluido, setModalTransferirConcluido] = useState(false)
  const [explicacaoTransferencia, setExplicacaoTransferencia] = useState<{
    resumo: ResumoTransferenciaListaSimulador
    idsNovosPedidos: string[]
  } | null>(null)
  const [guiaPosTransferencia, setGuiaPosTransferencia] = useState<{
    passo: PassoGuiaPosTransferenciaSimulador
    resumo: ResumoTransferenciaListaSimulador
    idsNovosPedidos: string[]
  } | null>(null)
  const [idsNovosPedidosRecentes, setIdsNovosPedidosRecentes] = useState<string[]>([])
  const [guiaPosConsolidacao, setGuiaPosConsolidacao] = useState<{
    passo: PassoGuiaPosConsolidacaoSimulador
    resumo: ResumoConsolidacaoListaSimulador
    idPedidoConsolidado: string
  } | null>(null)
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [toastDemo, setToastDemo] = useState<{ titulo: string; mensagem: string } | null>(null)
  const [colunaDestaqueFoco, setColunaDestaqueFoco] = useState<string | null>(null)
  const tabelaWrapRef = useRef<HTMLDivElement>(null)
  const colunasBtnRef = useRef<HTMLButtonElement>(null)
  const colunasDropdownRef = useRef<HTMLDivElement>(null)
  const colunasRef = useRef(colunas)
  const [colunasDropdownPos, setColunasDropdownPos] = useState({ top: 0, left: 0 })
  const [metricasScrollTabela, setMetricasScrollTabela] = useState({ scrollLeft: 0, viewportWidth: 0 })
  const [itensPorPagina, setItensPorPagina] = useState(config.tabela.linhasPorPagina)

  useEffect(() => {
    setItensPorPagina(config.tabela.linhasPorPagina)
  }, [config.tabela.linhasPorPagina])

  useEffect(() => {
    setColunas((prev) => {
      const base = prev.filter((c) => !c.manual)
      const personalizadas: ColunaListaSimuladorPedido[] = config.colunasPersonalizadas
        .filter((c) => c.visivel)
        .map((c) => ({
          id: `custom_${c.chave}`,
          label: c.nome,
          manual: true,
          visivel: true,
        }))
      return [...base, ...personalizadas]
    })
  }, [config.colunasPersonalizadas])

  useEffect(() => {
    colunasRef.current = colunas
  }, [colunas])

  useEffect(() => {
    if (!onEstadoTutorialChange) return
    const linhaListaExpandida = expandidos.size > 0 ? [...expandidos][0] ?? null : null
    onEstadoTutorialChange({
      linhaListaExpandida,
      menuNovoAberto,
      modalNovoPedidoAberto,
      passoModalNovoPedido,
      cadastroRapidoEmpresaAberto,
      modalTransferirAberto,
      passoModalTransferir,
      cenarioModalTransferir,
      modalTransferirConcluido,
      modalNovoItemAberto,
      modalEdicaoMassaAberto,
      passoModalEdicaoMassa,
      modalDuplicarAberto,
      modalExcluirAberto,
      modalConsolidarAberto,
      passoModalConsolidar,
      modalConsolidarConcluido,
      explicacaoTransferenciaAberta: explicacaoTransferencia !== null,
      guiaPosTransferenciaPasso: guiaPosTransferencia?.passo ?? null,
      guiaPosConsolidacaoPasso: guiaPosConsolidacao?.passo ?? null,
      idPedidoConsolidadoDestaque: guiaPosConsolidacao?.idPedidoConsolidado ?? null,
    })
  }, [
    expandidos,
    menuNovoAberto,
    modalNovoPedidoAberto,
    passoModalNovoPedido,
    cadastroRapidoEmpresaAberto,
    modalTransferirAberto,
    passoModalTransferir,
    cenarioModalTransferir,
    modalTransferirConcluido,
    modalNovoItemAberto,
    modalEdicaoMassaAberto,
    passoModalEdicaoMassa,
    modalDuplicarAberto,
    modalExcluirAberto,
    modalConsolidarAberto,
    passoModalConsolidar,
    modalConsolidarConcluido,
    explicacaoTransferencia,
    guiaPosTransferencia,
    guiaPosConsolidacao,
    onEstadoTutorialChange,
  ])

  const sincronizarPosicaoDropdownColunas = useCallback(() => {
    const btn = colunasBtnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const painelLargura = 360
    setColunasDropdownPos({
      top: rect.bottom + 4,
      left: Math.max(8, Math.min(rect.right - painelLargura, window.innerWidth - painelLargura - 8)),
    })
  }, [])

  const toggleColunasAberto = useCallback(() => {
    setColunasAberto((prev) => {
      const next = !prev
      if (next) {
        window.requestAnimationFrame(sincronizarPosicaoDropdownColunas)
      }
      return next
    })
  }, [sincronizarPosicaoDropdownColunas])

  useEffect(() => {
    if (!colunasAberto) return undefined
    sincronizarPosicaoDropdownColunas()
    const reposicionar = () => sincronizarPosicaoDropdownColunas()
    window.addEventListener('resize', reposicionar)
    window.addEventListener('scroll', reposicionar, true)
    return () => {
      window.removeEventListener('resize', reposicionar)
      window.removeEventListener('scroll', reposicionar, true)
    }
  }, [colunasAberto, sincronizarPosicaoDropdownColunas])

  useEffect(() => {
    if (!colunasAberto) return undefined
    function fecharSeClicouFora(e: MouseEvent) {
      const alvo = e.target as Node
      if (colunasDropdownRef.current?.contains(alvo)) return
      if (colunasBtnRef.current?.contains(alvo)) return
      setColunasAberto(false)
    }
    document.addEventListener('mousedown', fecharSeClicouFora)
    return () => document.removeEventListener('mousedown', fecharSeClicouFora)
  }, [colunasAberto])

  const sincronizarMetricasScrollTabela = useCallback(() => {
    const el = tabelaWrapRef.current
    if (!el) return
    setMetricasScrollTabela({ scrollLeft: el.scrollLeft, viewportWidth: el.clientWidth })
  }, [])

  useEffect(() => {
    const el = tabelaWrapRef.current
    if (!el) return undefined
    const sync = () => {
      sincronizarMetricasScrollTabela()
      const thead = el.querySelector('thead')
      const cabecalho = thead?.getBoundingClientRect().height ?? ALTURA_CABECALHO_TABELA_LISTA_SIMULADOR
      const capacidade = Math.floor((el.clientHeight - cabecalho) / ALTURA_LINHA_PEDIDO_LISTA_SIMULADOR)
      const next = Math.min(ITENS_POR_PAGINA_MAX, Math.max(ITENS_POR_PAGINA_MIN, capacidade))
      setItensPorPagina((prev) => (prev === next ? prev : next))
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [sincronizarMetricasScrollTabela, colunas.length])

  const acoesExportacao = useMemo(
    () => EXPORTAR_OPCOES.map((op) => ({
      label: op,
      icone: op.endsWith('PDF')
        ? <FilePdf size={14} weight="duotone" aria-hidden />
        : <DownloadSimple size={14} weight="duotone" aria-hidden />,
      onClick: () => undefined,
    })),
    [],
  )

  const temExpandido = expandidos.size > 0

  const rotuloEscopoWorkspaces = useMemo(() => {
    if (empresasSelecionadas.length === 0) return null
    const nomes = empresasSelecionadas.map((empresa) => empresa.nome)
    if (nomes.length === 1) return nomes[0]
    if (nomes.length === 2) return nomes.join(', ')
    return `${nomes.length} selecionados`
  }, [empresasSelecionadas])

  const filtrosAtivosKeys = useMemo(() => new Set(Object.keys(filtrosAtivos)), [filtrosAtivos])
  const colunasGt = useMemo(() => montarColunasGtListaSimulador(colunas), [colunas])

  const itensFiltrosConsolidados = useMemo((): ItemFiltroConsolidadoListaSimuladorPedido[] => {
    const itens: ItemFiltroConsolidadoListaSimuladorPedido[] = []

    if (rotuloEscopoWorkspaces) {
      const nomes = empresasSelecionadas.map((empresa) => empresa.nome)
      itens.push({
        id: 'workspaces',
        rotulo: 'Workspaces',
        valorResumo: rotuloEscopoWorkspaces,
        detalhe: nomes.length > 2 ? <ListaNumeradaWorkspacesTooltipSimulador nomes={nomes} /> : undefined,
      })
    }

    const termoBusca = busca.trim()
    if (termoBusca) {
      itens.push({
        id: 'busca',
        rotulo: 'Busca',
        valorResumo: termoBusca,
      })
    }

    if (statusFiltro !== 'todas') {
      const status = statusFiltros.find((s) => s.id === statusFiltro)
      if (status) {
        itens.push({
          id: 'status-bar',
          rotulo: 'Status',
          valorResumo: status.label,
        })
      }
    }

    for (const col of colunasGt) {
      const filtro = filtrosAtivos[col.key]
      if (!filtro) continue

      const rotuloColuna = col.rotulo ?? col.label
      const valorResumo = rotulofiltro(filtro, 2)
      let detalhe: ReactNode | undefined

      if (filtro.tipo === 'enum') {
        const valores = Array.from(filtro.valor)
        if (valores.length > 2) {
          detalhe = (
            <ol className="pds-lista-filtros-consolidados-tooltip-enum">
              {valores.map((valor, indice) => (
                <li key={valor} className="pds-lista-filtros-consolidados-tooltip-enum-item">
                  <span className="pds-lista-filtros-consolidados-tooltip-num" aria-hidden="true">
                    {indice + 1}.
                  </span>
                  <span>{valor}</span>
                </li>
              ))}
            </ol>
          )
        }
      }

      itens.push({
        id: col.key,
        rotulo: rotuloColuna,
        valorResumo,
        detalhe,
      })
    }

    return itens
  }, [
    rotuloEscopoWorkspaces,
    empresasSelecionadas,
    busca,
    statusFiltro,
    colunasGt,
    filtrosAtivos,
  ])

  const podeLimparFiltrosConsolidados = useMemo(
    () => busca.trim().length > 0 || statusFiltro !== 'todas' || Object.keys(filtrosAtivos).length > 0,
    [busca, statusFiltro, filtrosAtivos],
  )

  const workspacesNomes = useMemo(
    () => Array.from(new Set(linhas.map((l) => l.workspace).filter(Boolean))).sort(),
    [linhas],
  )

  const valoresUnicosPorCampo = useMemo(() => {
    const result: Record<string, string[]> = {}
    for (const col of colunasGt) {
      if (!col.filtravel) continue
      if (detectarTipoFiltroColunaSimulador(col) === 'numero') continue
      const vals = calcularValoresUnicosCampoListaSimulador(
        linhas,
        col.key,
        col.key === 'id_workspace' ? workspacesNomes : [],
      )
      if (vals.length > 0) result[col.key] = vals
    }
    return result
  }, [colunasGt, linhas, workspacesNomes])

  const aplicarReordenacaoColuna = useCallback((fromId: string, toId: string, lado: LadoDropColuna) => {
    setColunas((prev) => reordenarColunasListaSimulador(prev, fromId, toId, lado))
  }, [])

  const handleColunaDragStart = useCallback((colunaId: string) => {
    setDragColunaId(colunaId)
  }, [])

  const handleColunaDragOver = useCallback((
    e: DragEvent<HTMLElement>,
    colunaId: string,
    horizontal = true,
  ) => {
    e.preventDefault()
    if (!dragColunaId || dragColunaId === colunaId) return
    setDragOverColunaId(colunaId)
    setLadoDropColuna(resolverLadoDropColuna(e, horizontal))
  }, [dragColunaId])

  const handleColunaDrop = useCallback((
    e: DragEvent<HTMLElement>,
    colunaId: string,
    horizontal = true,
  ) => {
    e.preventDefault()
    if (!dragColunaId || dragColunaId === colunaId) {
      setDragColunaId(null)
      setDragOverColunaId(null)
      return
    }
    const lado = resolverLadoDropColuna(e, horizontal)
    aplicarReordenacaoColuna(dragColunaId, colunaId, lado)
    setDragColunaId(null)
    setDragOverColunaId(null)
  }, [aplicarReordenacaoColuna, dragColunaId])

  const handleColunaDragEnd = useCallback(() => {
    setDragColunaId(null)
    setDragOverColunaId(null)
  }, [])

  function classeDropColuna(colunaId: string, horizontal = true): string {
    if (dragOverColunaId !== colunaId || !dragColunaId) return ''
    return horizontal
      ? (ladoDropColuna === 'before' ? 'pds-lista-th-col--drop-before' : 'pds-lista-th-col--drop-after')
      : (ladoDropColuna === 'before' ? 'pds-lista-coluna-item--drop-before' : 'pds-lista-coluna-item--drop-after')
  }

  useEffect(() => {
    setLinhas(listarPedidosEmpresasSimulador(empresasSelecionadas))
    setPagina(1)
    setSelecionados(new Set())
    setExpandidos(new Set())
    setCelulaEmEdicao(null)
    setFiltrosAtivos({})
    setPopoverFiltroAberto(null)
    setSortCampo(null)
    setSortDir(null)
  }, [empresasSelecionadas])

  useEffect(() => {
    if (!numeroPedidoFoco || linhas.length === 0) return
    const linha = linhas.find((l) => l.numeroPedido === numeroPedidoFoco)
    if (!linha) return
    setBusca(numeroPedidoFoco)
    setStatusFiltro('todas')
    setPagina(1)
    setExpandidos(new Set([linha.id]))
    onConsumirFocoLista?.()
  }, [numeroPedidoFoco, linhas, onConsumirFocoLista])

  const linhasBase = linhas

  const linhasFiltradas = useMemo(() => {
    const statusValor = statusFiltros.find((s) => s.id === statusFiltro)?.valor
    const termo = busca.trim().toLowerCase()
    let resultado = linhasBase.filter((l) => {
      if (statusValor && l.status !== statusValor) return false
      if (!termo) return true
      return (
        l.numeroPedido.toLowerCase().includes(termo)
        || l.exportador.toLowerCase().includes(termo)
        || l.workspace.toLowerCase().includes(termo)
        || l.incoterm.toLowerCase().includes(termo)
        || l.detalhesItens.some((item) => item.numeroItem.includes(termo))
        || Object.values(l.campos).some((v) => v?.toLowerCase().includes(termo))
      )
    })
    if (Object.keys(filtrosAtivos).length > 0) {
      resultado = resultado.filter((l) => linhaPassaFiltrosColuna(l, filtrosAtivos))
    }
    return ordenarLinhasListaSimulador(resultado, sortCampo, sortDir)
  }, [linhasBase, statusFiltro, busca, filtrosAtivos, sortCampo, sortDir])

  const resumo = useMemo(() => resumirListaPedidosSimulador(linhasFiltradas), [linhasFiltradas])

  const totalPaginas = Math.max(1, Math.ceil(linhasFiltradas.length / itensPorPagina))
  const paginaAtual = Math.min(pagina, totalPaginas)

  const linhasPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    return linhasFiltradas.slice(inicio, inicio + itensPorPagina)
  }, [linhasFiltradas, paginaAtual, itensPorPagina])

  const itensPaginacaoRodape = useMemo(
    () => calcularItensPaginacaoRodape(paginaAtual, totalPaginas),
    [paginaAtual, totalPaginas],
  )

  const toggleExpandirTodos = useCallback(() => {
    if (temExpandido) {
      setExpandidos(new Set())
      return
    }
    const idsPagina = linhasPagina.filter((l) => l.itens > 0).map((l) => l.id)
    setLinhas((prev) =>
      prev.map((l) => (idsPagina.includes(l.id) ? materializarItensLinhaListaSimulador(l) : l)),
    )
    setExpandidos(new Set(idsPagina))
  }, [temExpandido, linhasPagina])

  const chaveSelecao = useMemo(() => [...selecionados].sort().join('|'), [selecionados])

  const selecaoLista = useMemo(
    () => resolverSelecaoListaSimulador(selecionados, linhas),
    [chaveSelecao, linhas, selecionados],
  )

  const acoesBarra = useMemo(
    () => calcularHabilitacaoAcoesBarraListaSimulador(selecaoLista),
    [selecaoLista],
  )

  const todosPedidosPaginaSelecionados = useMemo(
    () => linhasPagina.length > 0 && linhasPagina.every((l) => selecionados.has(l.id)),
    [linhasPagina, selecionados],
  )

  const tooltipTransferir = useMemo(
    () => tooltipTransferirListaSimulador(selecaoLista),
    [selecaoLista],
  )
  const tooltipEditar = useMemo(
    () => tooltipEditarMassaListaSimulador(selecaoLista),
    [selecaoLista],
  )
  const tooltipConsolidar = useMemo(
    () => tooltipConsolidarListaSimulador(selecaoLista, acoesBarra.totalPedidosConsolidar),
    [selecaoLista, acoesBarra.totalPedidosConsolidar],
  )
  const tooltipPdf = useMemo(
    () => tooltipGerarPdfListaSimulador(selecaoLista),
    [selecaoLista],
  )
  const tooltipDuplicar = useMemo(
    () => tooltipDuplicarListaSimulador(selecaoLista),
    [selecaoLista],
  )
  const tooltipExcluir = useMemo(
    () => tooltipExcluirListaSimulador(selecaoLista),
    [selecaoLista],
  )

  const rotuloTransferir = useMemo(
    () => rotuloTransferirListaSimulador(selecaoLista),
    [selecaoLista],
  )

  const linhasRender = useMemo(() => {
    const resultado: LinhaRenderLista[] = []
    for (const linha of linhasPagina) {
      const aberto = expandidos.has(linha.id)
      const filhos = aberto ? linha.detalhesItens : []
      resultado.push({ tipo: 'pai', linha, ultimoFilho: filhos.length === 0 })
      filhos.forEach((item, idx) => {
        resultado.push({
          tipo: 'filho',
          item,
          pai: linha,
          ultimoFilho: idx === filhos.length - 1,
        })
      })
    }
    return resultado
  }, [linhasPagina, expandidos])

  const colunasVisiveis = useMemo(() => {
    if (guiaPosTransferencia) {
      const idsGuia = new Set(colunasDestaqueGuiaPosTransferenciaSimulador(guiaPosTransferencia.passo))
      return colunas.filter((c) => idsGuia.has(c.id))
    }
    if (guiaPosConsolidacao) {
      const idsGuia = new Set(colunasDestaqueGuiaPosConsolidacaoSimulador(guiaPosConsolidacao.passo))
      return colunas.filter((c) => idsGuia.has(c.id))
    }
    return colunas.filter((c) => c.visivel)
  }, [colunas, guiaPosTransferencia, guiaPosConsolidacao])

  useEffect(() => {
    if (!colunaIdFoco) return undefined
    const indice = colunasVisiveis.findIndex((c) => c.id === colunaIdFoco)
    if (indice < 0) return undefined

    const wrap = tabelaWrapRef.current
    if (!wrap) return undefined

    setColunaDestaqueFoco(colunaIdFoco)
    onConsumirFocoColuna?.()

    const cancelarScroll = scrollContainerParaColunaListaSimuladorAposLayout(
      wrap,
      colunaIdFoco,
      indice,
      () => {
        setMetricasScrollTabela({
          scrollLeft: wrap.scrollLeft,
          viewportWidth: wrap.clientWidth,
        })
      },
    )

    const timerDestaque = window.setTimeout(() => setColunaDestaqueFoco(null), 2800)

    return () => {
      cancelarScroll()
      window.clearTimeout(timerDestaque)
    }
  }, [colunaIdFoco, colunasVisiveis, onConsumirFocoColuna])

  useEffect(() => {
    if (!guiaPosTransferencia) return undefined
    const { resumo } = guiaPosTransferencia
    const alvoItem = resumo.itensDestinoIds[0] ?? resumo.itensOrigemIds[0]
    const wrap = tabelaWrapRef.current
    if (!wrap) return undefined
    wrap.scrollTo({ left: 0, behavior: 'auto' })
    const timer = window.setTimeout(() => {
      if (alvoItem) {
        scrollContainerParaLinhaListaSimulador(wrap, `[data-pds-linha-id="item-${alvoItem}"]`)
      }
    }, 100)
    return () => window.clearTimeout(timer)
  }, [guiaPosTransferencia?.passo, guiaPosTransferencia?.resumo])

  useEffect(() => {
    if (!guiaPosConsolidacao) return undefined
    const { idPedidoConsolidado, passo } = guiaPosConsolidacao
    const wrap = tabelaWrapRef.current
    if (!wrap) return undefined
    wrap.scrollTo({ left: 0, behavior: 'auto' })
    const timer = window.setTimeout(() => {
      if (passo === 2) {
        const pedido = linhas.find((l) => l.id === idPedidoConsolidado)
        const primeiroItem = pedido?.detalhesItens?.[0]
        if (primeiroItem) {
          scrollContainerParaLinhaListaSimulador(wrap, `[data-pds-linha-id="item-${primeiroItem.id}"]`)
          return
        }
      }
      scrollContainerParaLinhaListaSimulador(wrap, `[data-pds-linha-id="${idPedidoConsolidado}"]`)
    }, 100)
    return () => window.clearTimeout(timer)
  }, [guiaPosConsolidacao?.passo, guiaPosConsolidacao?.idPedidoConsolidado, linhas])

  const janelaColunasTabela = useMemo(() => {
    if (guiaPosTransferencia || guiaPosConsolidacao) {
      return {
        inicio: 0,
        fim: colunasVisiveis.length,
        espacoEsquerda: 0,
        espacoDireita: 0,
        usaJanela: false,
      }
    }
    const base = calcularJanelaColunasScrollListaSimulador(
      colunasVisiveis.length,
      metricasScrollTabela.scrollLeft,
      metricasScrollTabela.viewportWidth || 1200,
    )
    return base
  }, [colunasVisiveis, metricasScrollTabela, guiaPosTransferencia, guiaPosConsolidacao])

  const colunasRenderTabela = useMemo(
    () => colunasVisiveis.slice(janelaColunasTabela.inicio, janelaColunasTabela.fim),
    [colunasVisiveis, janelaColunasTabela.inicio, janelaColunasTabela.fim],
  )

  const idColunaTutorialCabecalho = colunasRenderTabela[0]?.id ?? null
  const idColunaTutorialFiltro = useMemo(
    () => colunasRenderTabela.find((c) => colunaListaSimuladorFiltravel(c.id))?.id ?? null,
    [colunasRenderTabela],
  )

  const totalColunas = colunas.length
  const totalExibidas = colunasVisiveis.length
  const totalOcultas = colunas.filter((c) => !c.visivel && !c.manual).length
  const totalManuais = colunas.filter((c) => c.manual).length

  const colunasFiltradas = colunas.filter((c) => {
    const termoColuna = buscaColuna.trim().toLowerCase()
    if (termoColuna && !c.label.toLowerCase().includes(termoColuna)) return false
    if (filtroAbaColunas === 'exibidas') return c.visivel
    if (filtroAbaColunas === 'ocultas') return !c.visivel && !c.manual
    if (filtroAbaColunas === 'manuais') return c.manual
    return true
  })

  const toggleExpansao = (id: string) => {
    setExpandidos((prev) => {
      const abrindo = !prev.has(id)
      if (abrindo) {
        setLinhas((linhas) =>
          linhas.map((l) => (l.id === id ? materializarItensLinhaListaSimulador(l) : l)),
        )
        return new Set(prev).add(id)
      }
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const syncFilhosPedido = (
    linha: LinhaListaPedidoSimulador,
    marcar: boolean,
    next: Set<string>,
  ) => {
    for (const item of linha.detalhesItens) {
      if (marcar) next.add(item.id)
      else next.delete(item.id)
    }
  }

  const toggleSelecaoPedido = (linha: LinhaListaPedidoSimulador) => {
    setSelecionados((prev) => {
      const next = new Set(prev)
      const marcar = !next.has(linha.id)
      if (marcar) next.add(linha.id)
      else next.delete(linha.id)
      syncFilhosPedido(linha, marcar, next)
      return next
    })
  }

  const toggleSelecaoItem = (
    item: ItemListaPedidoSimulador,
    pai: LinhaListaPedidoSimulador,
  ) => {
    setSelecionados((prev) => {
      const next = new Set(prev)
      const marcar = !next.has(item.id)
      if (marcar) next.add(item.id)
      else next.delete(item.id)

      if (!marcar) {
        next.delete(pai.id)
      } else if (pai.detalhesItens.every((i) => next.has(i.id))) {
        next.add(pai.id)
      }

      return next
    })
  }

  const toggleTodos = () => {
    if (todosPedidosPaginaSelecionados) {
      setSelecionados((prev) => {
        const next = new Set(prev)
        for (const linha of linhasPagina) {
          next.delete(linha.id)
          syncFilhosPedido(linha, false, next)
        }
        return next
      })
    } else {
      setSelecionados((prev) => {
        const next = new Set(prev)
        for (const linha of linhasPagina) {
          next.add(linha.id)
          syncFilhosPedido(linha, true, next)
        }
        return next
      })
    }
  }

  const handleAplicarFiltro = useCallback((campo: string, filtro: FiltroAtivo) => {
    setFiltrosAtivos((prev) => ({ ...prev, [campo]: filtro }))
    setPagina(1)
    setPopoverFiltroAberto(null)
  }, [])

  const handleLimparFiltro = useCallback((campo: string) => {
    setFiltrosAtivos((prev) => {
      const next = { ...prev }
      delete next[campo]
      return next
    })
    setPagina(1)
  }, [])

  const handleLimparTodosFiltros = useCallback(() => {
    setFiltrosAtivos({})
    setBusca('')
    setStatusFiltro('todas')
    setPagina(1)
  }, [])

  const handleCriarPainelMenu = useCallback((nome: string) => {
    const trimmed = nome.trim()
    if (!trimmed) return
    const ordem = paineisLista.reduce((max, p) => Math.max(max, p.ordem), -1) + 1
    const criado: PainelItemSimulador = {
      id: `painel-${Date.now()}`,
      nome: trimmed,
      ordem,
    }
    setPaineisLista((prev) => [...prev, criado])
    setPainelAtualId(criado.id)
  }, [paineisLista])

  const handleSalvarNovoPedido = useCallback((
    form: FormNovoPedidoSimulador,
    itens: ItemNovoPedidoSimulador[],
    fornecedores: FornecedorSimuladorNovoPedido[],
  ) => {
    const linha = montarLinhaNovoPedidoSimulador(form, itens, fornecedores, empresasSelecionadas[0])
    setLinhas((prev) => [linha, ...prev])
    setPagina(1)
    setExpandidos((prev) => {
      const next = new Set(prev)
      next.add(linha.id)
      return next
    })
    setToastDemo({
      titulo: 'Pedido criado',
      mensagem: `${form.numero_pedido} adicionado à lista (simulação).`,
    })
  }, [empresasSelecionadas])

  const handleConfirmarDuplicar = useCallback((): ResumoDuplicacaoListaSimulador => {
    const { linhas: proximas, resumo, idsNovosPedidos } = duplicarSelecaoListaSimulador(linhas, selecaoLista)
    setLinhas(proximas)
    setPagina(1)
    setExpandidos((prev) => {
      const next = new Set(prev)
      for (const id of idsNovosPedidos) next.add(id)
      return next
    })
    setToastDemo({
      titulo: 'Duplicação concluída',
      mensagem: mensagemToastDuplicacao(resumo),
    })
    return resumo
  }, [linhas, selecaoLista])

  const handleFecharModalDuplicar = useCallback(() => {
    setModalDuplicarAberto(false)
    setSelecionados(new Set())
  }, [])

  const handleConcluidoConsolidar = useCallback(
    (
      proximas: LinhaListaPedidoSimulador[],
      resumo: ResumoConsolidacaoListaSimulador,
      idNovoPedido: string,
    ) => {
      setLinhas(proximas)
      setPagina(1)
      setExpandidos(new Set([idNovoPedido]))
      setSelecionados(new Set())
      setModalConsolidarAberto(false)
      setPassoModalConsolidar(1)
      setModalConsolidarConcluido(false)
      setGuiaPosConsolidacao({ passo: 1, resumo, idPedidoConsolidado: idNovoPedido })
      setToastDemo({
        titulo: 'Consolidação concluída',
        mensagem: mensagemToastConsolidacao(resumo),
      })
      window.setTimeout(() => {
        const wrap = tabelaWrapRef.current
        if (!wrap) return
        wrap.scrollTo({ left: 0, top: wrap.scrollTop, behavior: 'auto' })
        window.requestAnimationFrame(() => {
          scrollContainerParaLinhaListaSimulador(wrap, `[data-pds-linha-id="${idNovoPedido}"]`)
        })
      }, 240)
    },
    [],
  )

  const encerrarGuiaPosConsolidacao = useCallback(() => {
    setGuiaPosConsolidacao(null)
  }, [])

  const handleProximoGuiaPosConsolidacao = useCallback(() => {
    setGuiaPosConsolidacao((prev) => {
      if (!prev || prev.passo >= 3) return prev
      const nextPasso = (prev.passo + 1) as PassoGuiaPosConsolidacaoSimulador
      return { ...prev, passo: nextPasso }
    })
  }, [])

  const handleConcluirGuiaPosConsolidacao = useCallback(() => {
    encerrarGuiaPosConsolidacao()
  }, [encerrarGuiaPosConsolidacao])

  useEffect(() => {
    if (!guiaPosConsolidacao || guiaPosConsolidacao.passo < 2) return
    setExpandidos(new Set([guiaPosConsolidacao.idPedidoConsolidado]))
  }, [guiaPosConsolidacao?.passo, guiaPosConsolidacao?.idPedidoConsolidado])

  useEffect(() => {
    if (guiaPosConsolidacao?.passo !== 3) return
    const timer = window.setTimeout(() => {
      encerrarGuiaPosConsolidacao()
    }, 20000)
    return () => window.clearTimeout(timer)
  }, [guiaPosConsolidacao?.passo, encerrarGuiaPosConsolidacao])

  const handleFecharModalConsolidar = useCallback(() => {
    setModalConsolidarAberto(false)
    setPassoModalConsolidar(1)
    setModalConsolidarConcluido(false)
    setSelecionados(new Set())
  }, [])

  const handleConfirmarEdicaoMassa = useCallback(
    (payload: {
      nivel: NivelEdicaoMassaSimulador
      campos: CampoEmEdicaoMassaSimulador[]
      selecao: SelecaoListaSimuladorPedido
    }): ResumoEdicaoMassaListaSimulador => {
      const { linhas: proximas, resumo } = aplicarEdicaoMassaListaSimulador(
        linhas,
        payload.selecao,
        payload.nivel,
        payload.campos,
      )
      setLinhas(proximas)
      setToastDemo({
        titulo: 'Edição em massa concluída',
        mensagem: mensagemToastEdicaoMassa(resumo),
      })
      return resumo
    },
    [linhas],
  )

  const handleFecharModalEdicaoMassa = useCallback(() => {
    setModalEdicaoMassaAberto(false)
    setPassoModalEdicaoMassa(1)
    setSelecionados(new Set())
  }, [])

  const handleFecharModalTransferir = useCallback(() => {
    setModalTransferirAberto(false)
    setPassoModalTransferir(1)
    setCenarioModalTransferir(null)
    setModalTransferirConcluido(false)
    setSelecionados(new Set())
  }, [])

  const handleConcluidoTransferir = useCallback(
    (
      proximas: LinhaListaPedidoSimulador[],
      resumo: ResumoTransferenciaListaSimulador,
      idsNovosPedidos: string[],
    ) => {
      setLinhas(proximas)
      setPagina(1)
      setExpandidos((prev) => aplicarExpansaoPedidosPosTransferencia(prev, resumo, idsNovosPedidos))
      setSelecionados(new Set())
      setModalTransferirAberto(false)
      setIdsNovosPedidosRecentes(idsNovosPedidos)
      setExplicacaoTransferencia({ resumo, idsNovosPedidos })
    },
    [],
  )

  const encerrarGuiaPosTransferencia = useCallback(() => {
    setGuiaPosTransferencia(null)
    setIdsNovosPedidosRecentes([])
  }, [])

  const handleEntendiExplicacaoTransferencia = useCallback(() => {
    if (!explicacaoTransferencia) return
    const { resumo, idsNovosPedidos } = explicacaoTransferencia
    setExplicacaoTransferencia(null)
    setExpandidos((prev) => aplicarExpansaoPedidosPosTransferencia(prev, resumo, idsNovosPedidos))
    setGuiaPosTransferencia({ passo: 1, resumo, idsNovosPedidos })
    setToastDemo({
      titulo: 'Transferência concluída',
      mensagem: montarMensagemToastTransferencia(resumo),
    })
    const alvoScroll = idsNovosPedidos[0] ?? resumo.pedidoDestinoId ?? resumo.pedidoOrigemId
    window.setTimeout(() => {
      const wrap = tabelaWrapRef.current
      if (!wrap) return
      wrap.scrollTo({ left: 0, top: wrap.scrollTop, behavior: 'auto' })
      window.requestAnimationFrame(() => {
        scrollContainerParaLinhaListaSimulador(wrap, `[data-pds-linha-id="${alvoScroll}"]`)
      })
    }, 240)
  }, [explicacaoTransferencia])

  useEffect(() => {
    if (!guiaPosTransferencia || guiaPosTransferencia.passo !== 1) return
    const { resumo, idsNovosPedidos } = guiaPosTransferencia
    setExpandidos((prev) => aplicarExpansaoPedidosPosTransferencia(prev, resumo, idsNovosPedidos))
  }, [guiaPosTransferencia])

  const handleProximoGuiaPosTransferencia = useCallback(() => {
    setGuiaPosTransferencia((prev) => {
      if (!prev || prev.passo >= 3) return prev
      const nextPasso = (prev.passo + 1) as PassoGuiaPosTransferenciaSimulador
      return { ...prev, passo: nextPasso }
    })
  }, [])

  const handleConcluirGuiaPosTransferencia = useCallback(() => {
    encerrarGuiaPosTransferencia()
  }, [encerrarGuiaPosTransferencia])

  useEffect(() => {
    if (guiaPosTransferencia?.passo !== 3) return
    const timer = window.setTimeout(() => {
      encerrarGuiaPosTransferencia()
    }, 20000)
    return () => window.clearTimeout(timer)
  }, [guiaPosTransferencia?.passo, encerrarGuiaPosTransferencia])

  const handleConfirmarExcluir = useCallback(() => {
    const { linhas: proximas, resumo } = excluirSelecaoListaSimulador(linhas, selecaoLista)
    setLinhas(proximas)
    setPagina(1)
    setSelecionados(new Set())
    setModalExcluirAberto(false)
    setToastDemo({
      titulo: 'Exclusão concluída',
      mensagem: mensagemToastExclusao(resumo),
    })
  }, [linhas, selecaoLista])

  const handleSalvarNovoItem = useCallback((pedidoId: string, partNumber: string, descricao: string) => {
    setLinhas((prev) =>
      prev.map((linha) => {
        if (linha.id !== pedidoId) return linha
        const seq = linha.detalhesItens.length + 1
        const novoItem: ItemListaPedidoSimulador = {
          id: `${linha.id}-item-${seq}`,
          sequencia: seq,
          numeroItem: `${linha.numeroPedido}-${String(seq).padStart(2, '0')}`,
          alerta: false,
          tipoOperacao: linha.tipoOperacao,
          status: linha.status,
          campos: {
            part_number_item: partNumber,
            descricao_item: descricao,
            ncm_item: '',
            quantidade_inicial_item: '1',
            moeda_item: linha.moeda,
            valor_por_unidade_item: '',
          },
        }
        return {
          ...linha,
          itens: linha.itens + 1,
          detalhesItens: [...linha.detalhesItens, novoItem],
        }
      }),
    )
    setExpandidos((prev) => new Set(prev).add(pedidoId))
    setToastDemo({
      titulo: 'Item adicionado',
      mensagem: `${partNumber} vinculado ao pedido (simulação).`,
    })
  }, [])

  const handleOrdenar = useCallback((campo: string, dir: 'asc' | 'desc') => {
    setSortCampo(campo)
    setSortDir(dir)
    setPagina(1)
    setPopoverFiltroAberto(null)
  }, [])

  const onFiltroColuna = useCallback((key: string, anchor: HTMLElement) => {
    setPopoverFiltroAberto((prev) => (prev === key ? null : key))
    const rect = anchor.getBoundingClientRect()
    setPopoverFiltroPos({
      top: rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 292)),
    })
  }, [])

  const linhaEmEdicao = celulaEmEdicao
    ? linhas.find((l) => l.id === celulaEmEdicao.linhaId)
    : undefined

  const itemEmEdicao = celulaEmEdicao?.itemId
    ? linhaEmEdicao?.detalhesItens.find((i) => i.id === celulaEmEdicao.itemId)
    : undefined

  const valorEmEdicao = useMemo(() => {
    if (!celulaEmEdicao || !linhaEmEdicao) return null
    if (itemEmEdicao) return itemEmEdicao.campos[celulaEmEdicao.colunaId] ?? null
    return linhaEmEdicao.campos[celulaEmEdicao.colunaId] ?? null
  }, [celulaEmEdicao, linhaEmEdicao, itemEmEdicao])

  const estadoEmEdicao = useMemo(() => {
    if (!celulaEmEdicao || !linhaEmEdicao) return null
    return resolverEstadoCelula(
      celulaEmEdicao.colunaId,
      celulaEmEdicao.nivel,
      linhaEmEdicao,
      itemEmEdicao,
    )
  }, [celulaEmEdicao, linhaEmEdicao, itemEmEdicao])

  function registrarFlash(linhaId: string, colunaId: string, itemId: string | undefined, tipo: 'salvo' | 'erro') {
    const chave = chaveCelula(linhaId, colunaId, itemId)
    setFlashCelulas((prev) => new Map(prev).set(chave, tipo))
    window.setTimeout(() => {
      setFlashCelulas((prev) => {
        const next = new Map(prev)
        next.delete(chave)
        return next
      })
    }, 600)
  }

  function handleConfirmarEdicao(valor: string | null) {
    if (!celulaEmEdicao) return
    setSalvandoEdicao(true)
    setResultadoEdicao(null)
    window.setTimeout(() => {
      setLinhas((prev) =>
        atualizarCelulaListaSimulador(
          prev,
          celulaEmEdicao.linhaId,
          celulaEmEdicao.colunaId,
          valor,
          celulaEmEdicao.itemId,
        ),
      )
      setSalvandoEdicao(false)
      setResultadoEdicao('sucesso')
      registrarFlash(celulaEmEdicao.linhaId, celulaEmEdicao.colunaId, celulaEmEdicao.itemId, 'salvo')
      window.setTimeout(() => {
        setCelulaEmEdicao(null)
        setResultadoEdicao(null)
      }, 350)
    }, 180)
  }

  function renderPopoverEdicao() {
    if (!celulaEmEdicao || !estadoEmEdicao) return null
    const { anchorRect, label } = celulaEmEdicao

    if (estadoEmEdicao.tipo === 'enum' && estadoEmEdicao.opcoes?.length) {
      return (
        <EdicaoEnumPopoverSimuladorPedido
          anchorRect={anchorRect}
          label={label.toUpperCase()}
          valor={valorEmEdicao}
          opcoes={estadoEmEdicao.opcoes}
          onConfirmar={handleConfirmarEdicao}
          onCancelar={() => setCelulaEmEdicao(null)}
          salvando={salvandoEdicao}
          resultado={resultadoEdicao}
        />
      )
    }

    return (
      <EdicaoTextoPopoverGlobal
        anchorRect={anchorRect}
        label={label.toUpperCase()}
        valor={valorEmEdicao}
        placeholder={estadoEmEdicao.tipo === 'periodo' ? 'DD/MM/AAAA' : ''}
        onConfirmar={handleConfirmarEdicao}
        onCancelar={() => setCelulaEmEdicao(null)}
        salvando={salvandoEdicao}
        resultado={resultadoEdicao}
      />
    )
  }

  function ehPedidoConsolidadoDestaque(pedidoId: string): boolean {
    return guiaPosConsolidacao?.idPedidoConsolidado === pedidoId
  }

  function celulaDestaquePosConsolidacao(
    pedidoId: string,
    colunaId: string,
    itemId?: string,
  ): boolean {
    if (!guiaPosConsolidacao) return false
    return celulaDestaqueGuiaPosConsolidacao(
      guiaPosConsolidacao.passo,
      guiaPosConsolidacao.idPedidoConsolidado,
      pedidoId,
      colunaId,
      itemId,
    )
  }

  function classeTdDestaqueGuia(
    pedidoId: string,
    colunaId: string,
    itemId?: string,
  ): string | undefined {
    if (colunaDestaqueFoco === colunaId) {
      return 'pds-lista-td--foco-nova-coluna'
    }
    const transf = classeTdDestaquePosTransferencia(pedidoId, colunaId, itemId)
    if (transf) return transf
    if (celulaDestaquePosConsolidacao(pedidoId, colunaId, itemId)) {
      return 'pds-lista-td--destaque-consolidado'
    }
    return undefined
  }

  function classeCelulaDestaqueGuia(
    pedidoId: string,
    colunaId: string,
    itemId?: string,
  ): string | undefined {
    if (colunaDestaqueFoco === colunaId) {
      return 'pds-lista-celula--foco-nova-coluna'
    }
    const transf = classeCelulaDestaquePosTransferencia(pedidoId, colunaId, itemId)
    if (transf) return transf
    if (celulaDestaquePosConsolidacao(pedidoId, colunaId, itemId)) {
      return 'pds-lista-celula--destaque-consolidado'
    }
    return undefined
  }

  function classeDestaqueCabecalhoColuna(colunaId: string): string | undefined {
    if (colunaDestaqueFoco === colunaId) {
      return 'pds-lista-th-col--foco-nova-coluna'
    }
    if (guiaPosTransferencia) {
      return colunasDestaqueGuiaPosTransferenciaSimulador(guiaPosTransferencia.passo).includes(colunaId)
        ? 'pds-lista-th-col--destaque-transferencia'
        : undefined
    }
    if (guiaPosConsolidacao) {
      return colunasDestaqueGuiaPosConsolidacaoSimulador(guiaPosConsolidacao.passo).includes(colunaId)
        ? 'pds-lista-th-col--destaque-consolidacao'
        : undefined
    }
    return undefined
  }

  function ehNovoPedidoPosTransferencia(pedidoId: string): boolean {
    return idsNovosPedidosRecentes.includes(pedidoId)
      || (guiaPosTransferencia?.idsNovosPedidos.includes(pedidoId) ?? false)
  }

  function itemEnvolvidoPosTransferencia(itemId: string): boolean {
    if (!guiaPosTransferencia) return false
    const { resumo } = guiaPosTransferencia
    return resumo.itensOrigemIds.includes(itemId) || resumo.itensDestinoIds.includes(itemId)
  }

  function pedidoEnvolvidoPosTransferencia(pedidoId: string): 'origem' | 'destino' | null {
    if (!guiaPosTransferencia) return null
    const { resumo, idsNovosPedidos } = guiaPosTransferencia
    if (pedidoId === resumo.pedidoOrigemId) return 'origem'
    if (idsNovosPedidos.includes(pedidoId)) return 'destino'
    if (resumo.pedidoDestinoId && pedidoId === resumo.pedidoDestinoId) return 'destino'
    return null
  }

  function celulaDestaquePosTransferencia(
    pedidoId: string,
    colunaId: string,
    itemId?: string,
  ): boolean {
    if (!guiaPosTransferencia) return false

    if (itemId) {
      if (!itemEnvolvidoPosTransferencia(itemId)) return false
      if (!colunasDestaqueGuiaPosTransferenciaSimulador(guiaPosTransferencia.passo).includes(colunaId)) {
        return false
      }
      return itemDestaqueGuiaPosTransferencia(guiaPosTransferencia.passo, guiaPosTransferencia.resumo, itemId)
    }

    if (!colunasDestaqueGuiaPosTransferenciaSimulador(guiaPosTransferencia.passo).includes(colunaId)) {
      return false
    }
    return pedidoEnvolvidoPosTransferencia(pedidoId) !== null
  }

  function resolverTipoDestaqueGuiaPosTransferencia(
    pedidoId: string,
    colunaId: string,
    itemId?: string,
  ): 'origem' | 'destino' | 'neutro' | null {
    if (!celulaDestaquePosTransferencia(pedidoId, colunaId, itemId)) return null
    if (!guiaPosTransferencia) return null
    const { resumo } = guiaPosTransferencia
    if (itemId) {
      if (resumo.itensOrigemIds.includes(itemId)) return 'origem'
      if (resumo.itensDestinoIds.includes(itemId)) return 'destino'
      return null
    }
    const papel = pedidoEnvolvidoPosTransferencia(pedidoId)
    if (papel === 'origem') return 'origem'
    if (papel === 'destino') return 'destino'
    return 'neutro'
  }

  function classeTdDestaquePosTransferencia(
    pedidoId: string,
    colunaId: string,
    itemId?: string,
  ): string | undefined {
    const tipo = resolverTipoDestaqueGuiaPosTransferencia(pedidoId, colunaId, itemId)
    if (!tipo) return undefined
    if (tipo === 'neutro') return 'pds-lista-td--destaque-neutro'
    return `pds-lista-td--destaque-${tipo}`
  }

  function classeCelulaDestaquePosTransferencia(
    pedidoId: string,
    colunaId: string,
    itemId?: string,
  ): string | undefined {
    const tipo = resolverTipoDestaqueGuiaPosTransferencia(pedidoId, colunaId, itemId)
    if (!tipo) return undefined
    if (tipo === 'neutro') return 'pds-lista-celula--destaque-neutro'
    return `pds-lista-celula--destaque-${tipo}`
  }

  const celulaTutorialListaAlvo = useMemo(() => {
    if (guiaPosConsolidacao) {
      for (const entrada of linhasRender) {
        if (entrada.tipo === 'pai') {
          const { linha } = entrada
          for (const c of colunasRenderTabela) {
            if (celulaDestaquePosConsolidacao(linha.id, c.id)) {
              return {
                pedidoId: linha.id,
                itemId: undefined as string | undefined,
                colunaId: c.id,
                exemploEdicao: false,
              }
            }
          }
        } else {
          const { item, pai } = entrada
          for (const c of colunasRenderTabela) {
            if (celulaDestaquePosConsolidacao(pai.id, c.id, item.id)) {
              return {
                pedidoId: pai.id,
                itemId: item.id,
                colunaId: c.id,
                exemploEdicao: false,
              }
            }
          }
        }
      }
      return null
    }

    if (guiaPosTransferencia) {
      for (const entrada of linhasRender) {
        if (entrada.tipo === 'pai') {
          const { linha } = entrada
          for (const c of colunasRenderTabela) {
            if (celulaDestaquePosTransferencia(linha.id, c.id)) {
              return {
                pedidoId: linha.id,
                itemId: undefined as string | undefined,
                colunaId: c.id,
                exemploEdicao: false,
              }
            }
          }
        } else {
          const { item, pai } = entrada
          for (const c of colunasRenderTabela) {
            if (celulaDestaquePosTransferencia(pai.id, c.id, item.id)) {
              return {
                pedidoId: pai.id,
                itemId: item.id,
                colunaId: c.id,
                exemploEdicao: false,
              }
            }
          }
        }
      }
      return null
    }

    const colunaEdicao =
      colunasRenderTabela.find((c) => c.id === 'status')
      ?? colunasRenderTabela.find((c) => c.id === 'incoterm')
      ?? colunasRenderTabela.find((c) => c.id !== 'numero_pedido' && c.id !== 'tipo_operacao')

    if (!colunaEdicao) return null

    const primeiroFilho = linhasRender.find((e) => e.tipo === 'filho')
    if (!primeiroFilho || primeiroFilho.tipo !== 'filho') return null

    return {
      pedidoId: primeiroFilho.pai.id,
      itemId: primeiroFilho.item.id,
      colunaId: colunaEdicao.id,
      exemploEdicao: true,
    }
  }, [linhasRender, colunasRenderTabela, guiaPosTransferencia, guiaPosConsolidacao])

  function resolverTutorialAlvoCelula(
    pedidoId: string,
    colunaId: string,
    itemId?: string,
  ): { dataTutorialAlvo?: string; exemploEdicao?: boolean } {
    if (!celulaTutorialListaAlvo) return {}
    const { pedidoId: alvoPedido, itemId: alvoItem, colunaId: alvoColuna, exemploEdicao } = celulaTutorialListaAlvo
    if (alvoPedido !== pedidoId || alvoColuna !== colunaId) return {}
    if ((alvoItem ?? null) !== (itemId ?? null)) return {}
    return { dataTutorialAlvo: 'pedido-lista-celulas', exemploEdicao }
  }

  function lerValorCampoCelulaLista(
    colunaId: string,
    campos: Record<string, string | null | undefined>,
    item?: ItemListaPedidoSimulador,
  ): string | null | undefined {
    if (item && colunaId === 'quantidade_total_pedido') {
      return campos.quantidade_inicial_item ?? campos.quantidade_total_pedido
    }
    if (item && colunaId === 'saldo_itens_do_pedido') {
      return campos.saldo_itens_do_pedido ?? campos.quantidade_inicial_item ?? campos.quantidade_total_pedido
    }
    if (item && colunaId === 'quantidade_transferida_total') {
      return campos.quantidade_transferida_total ?? '0'
    }
    return campos[colunaId]
  }

  function renderCelulaConteudo(
    colunaId: string,
    linha: LinhaListaPedidoSimulador,
    item?: ItemListaPedidoSimulador,
  ) {
    const campos = item?.campos ?? linha.campos
    const valor = lerValorCampoCelulaLista(colunaId, campos, item)

    if (colunaId === 'numero_pedido') {
      if (item) {
        const itemDestino = guiaPosTransferencia?.resumo.itensDestinoIds.includes(item.id) ?? false
        return (
          <span className={`pds-lista-numero pds-lista-numero--filho${itemEnvolvidoPosTransferencia(item.id) ? ' pds-lista-numero--item-transferencia' : ''}`}>
            <span className="pds-lista-sequencia">{item.sequencia}</span>
            {itemDestino && <span className="pds-lista-badge-item-transferido">Transferido</span>}
            <span className="pds-lista-item-id">{item.numeroItem}</span>
            {item.alerta && <Warning size={12} weight="fill" className="pds-lista-alerta" aria-hidden />}
          </span>
        )
      }
      return (
        <span className={`pds-lista-numero${ehNovoPedidoPosTransferencia(linha.id) ? ' pds-lista-numero--novo-pedido' : ''}`}>
          {ehNovoPedidoPosTransferencia(linha.id) && (
            <span className="pds-lista-badge-novo-pedido">Novo pedido</span>
          )}
          {linha.numeroPedido}
          {(linha.numeroPedido.startsWith('PO-CONS') || linha.alertaIncoterm) && (
            <Warning size={12} weight="fill" className="pds-lista-alerta" aria-hidden />
          )}
        </span>
      )
    }

    if (colunaId === 'tipo_operacao' && valor) {
      const importacao = valor === 'IMPORTAÇÃO'
      return (
        <StatusBadgeGlobal
          valor={importacao ? 'Importação' : 'Exportação'}
          genero="feminino"
          style={importacao
            ? { color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', whiteSpace: 'nowrap' }
            : { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', whiteSpace: 'nowrap' }
          }
        />
      )
    }

    if (colunaId === 'status' && valor) {
      const status = valor as StatusListaPedidoSimulador
      return (
        <StatusBadgeGlobal
          valor={STATUS_LABELS[status] ?? valor}
          genero="masculino"
          style={estiloStatusBadge(status)}
        />
      )
    }

    if (colunaId === 'nome_exportador') {
      if (linha.vincularExportador && !item) {
        return <button type="button" className="pds-lista-vincular">Vincular Exportador</button>
      }
      if (!valor) return <span className="pds-lista-vazio">{TEXTO_CELULA_VAZIA_LISTA_SIMULADOR}</span>
      return (
        <span className="pds-lista-exportador">
          <LinkSimple size={12} weight="bold" aria-hidden />
          {valor}
        </span>
      )
    }

    if (colunaId === 'incoterm') {
      const alertaPai = linha.alertaIncoterm && !item
      return (
        <span className="pds-lista-incoterm">
          {valor ?? TEXTO_CELULA_VAZIA_LISTA_SIMULADOR}
          {alertaPai && (
            <Warning size={12} weight="fill" className="pds-lista-alerta" aria-hidden />
          )}
        </span>
      )
    }

    if (colunaId.startsWith('anexo_') && valor) {
      return <span className="pds-lista-anexo">{valor}</span>
    }

    return <span className={valor ? '' : 'pds-lista-vazio'}>{valor ?? TEXTO_CELULA_VAZIA_LISTA_SIMULADOR}</span>
  }

  function renderCelula(
    coluna: ColunaListaSimuladorPedido,
    linha: LinhaListaPedidoSimulador,
    item?: ItemListaPedidoSimulador,
    opcoesTutorialCelula?: { dataTutorialAlvo?: string; exemploEdicao?: boolean },
  ) {
    const nivel: NivelLinhaLista = item ? 'item' : 'pai'
    const flash = flashCelulas.get(chaveCelula(linha.id, coluna.id, item?.id))
    const classeDestaque = classeCelulaDestaqueGuia(linha.id, coluna.id, item?.id)

    return (
      <CelulaEditavelListaSimuladorPedido
        colunaId={coluna.id}
        nivel={nivel}
        linha={linha}
        item={item}
        labelColuna={coluna.label}
        flashSalvo={flash === 'salvo'}
        flashErro={flash === 'erro'}
        classeDestaqueGuia={classeDestaque}
        dataTutorialAlvo={opcoesTutorialCelula?.dataTutorialAlvo}
        exemploEdicao={opcoesTutorialCelula?.exemploEdicao}
        onIniciarEdicao={setCelulaEmEdicao}
      >
        {renderCelulaConteudo(coluna.id, linha, item)}
      </CelulaEditavelListaSimuladorPedido>
    )
  }

  return (
    <div className="pds-lista">
      <div className="lp-stats-row">
        <div className="lp-cards" data-sds-tutorial-alvo="pedido-lista-cards">
          {cardsListaVisiveis.length > 0 ? (
            cardsListaVisiveis.map((card) => (
              <CardBasicoGlobal
                key={card.id}
                titulo={card.nome}
                icone={<Package weight="duotone" size={16} style={{ color: card.cor }} />}
                valor={card.id === 'valor_total' ? formatarValorListaPedidoSimulador(resumo.valorTotal) : resumo.totalPedidos}
                subtexto={card.descricao}
              />
            ))
          ) : (
            <>
              <CardBasicoGlobal
                titulo="Valor Total"
                icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
                valor={formatarValorListaPedidoSimulador(resumo.valorTotal)}
                variante="sucesso"
                subtexto="Soma dos pedidos filtrados"
              />
              <CardBasicoGlobal
                titulo="Total de Pedidos"
                icone={<Package weight="duotone" size={16} style={{ color: 'var(--pds-accent)' }} />}
                valor={resumo.totalPedidos}
                subtexto={`${resumo.totalItens} total de itens`}
              />
            </>
          )}
        </div>
      </div>

      <div className="pds-lista-chrome">
      <div className="pds-lista-faixa">
      <FaixaPaineisListaSimuladorPedido
        paineis={paineisLista}
        painelAtualId={painelAtualId}
        onPaineisChange={setPaineisLista}
        onPainelAtualIdChange={setPainelAtualId}
      />

      <div className="pds-lista-status-bar" data-sds-tutorial-alvo="pedido-lista-status-pills">
        <span className="pds-lista-status-label">Status</span>
        <div className="pds-lista-status-pills">
        {statusFiltros.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`pds-lista-status-chip ${statusFiltro === s.id ? 'pds-lista-status-chip--ativo' : ''}`}
            style={estiloChipStatusFiltro(s.id, s.cor, statusFiltro === s.id)}
            onClick={() => { setStatusFiltro(s.id); setPagina(1) }}
          >
            <span className="pds-lista-status-dot" style={{ background: s.cor }} />
            {s.label}
          </button>
        ))}
        </div>
      </div>
      </div>

      <div className="pds-lista-toolbar gtv-toolbar" data-sds-tutorial-alvo="pedido-lista-toolbar">
        <div className="pds-lista-toolbar-esq gtv-toolbar-esquerda">
          <div className="gtv-busca-wrapper" data-sds-tutorial-alvo="pedido-lista-busca">
            <span className="gtv-busca-icone"><MagnifyingGlass size={14} aria-hidden /></span>
            <input
              type="search"
              className="gtv-busca-input pds-lista-busca-input"
              placeholder="Buscar"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1) }}
            />
          </div>
          <TooltipGlobal
            descricao={temExpandido ? 'Recolher todos os itens' : 'Expandir todos os itens'}
          >
            <button
              type="button"
              className="pds-lista-expandir-todos"
              data-sds-tutorial-alvo="pedido-lista-expandir-todos"
              onClick={toggleExpandirTodos}
              aria-label={temExpandido ? 'Recolher todos os itens' : 'Expandir todos os itens'}
            >
              {temExpandido
                ? <CaretDoubleUp size={12} weight="bold" aria-hidden />
                : <CaretDoubleDown size={12} weight="bold" aria-hidden />}
            </button>
          </TooltipGlobal>
          <MenuNovoListaSimuladorPedido
            onAbrirNovoPedidoManual={() => setModalNovoPedidoAberto(true)}
            onAbrirNovoItemManual={() => setModalNovoItemAberto(true)}
            onCriarPainel={handleCriarPainelMenu}
            onDemoAcao={(titulo, mensagem) => setToastDemo({ titulo, mensagem })}
            onMenuAbertoChange={setMenuNovoAberto}
          />
          <span className="pds-lista-toolbar-divisor" aria-hidden="true" />
          <TooltipGlobal titulo={tooltipTransferir.titulo} descricao={tooltipTransferir.descricao}>
            <span data-sds-tutorial-alvo="pedido-lista-transferir" className="pds-lista-btn-transferir-wrap">
              <BotaoGlobal
                className="pds-lista-btn-transferir"
                variante="secundario"
                tamanho="pequeno"
                icone={<ArrowRight size={14} weight="duotone" />}
                disabled={!acoesBarra.podeTransferir}
                onClick={() => setModalTransferirAberto(true)}
              >
                {rotuloTransferir}
              </BotaoGlobal>
            </span>
          </TooltipGlobal>
          <TooltipGlobal titulo={tooltipConsolidar.titulo} descricao={tooltipConsolidar.descricao}>
            <span data-sds-tutorial-alvo="pedido-lista-consolidar" className="pds-lista-btn-consolidar-wrap" style={{ display: 'inline-flex' }}>
            <BotaoGlobal
              className="pds-lista-btn-consolidar"
              variante="secundario"
              tamanho="pequeno"
              icone={<GitMerge size={14} weight="duotone" />}
              disabled={!acoesBarra.podeConsolidar}
              aria-label={tooltipConsolidar.titulo}
              onClick={() => setModalConsolidarAberto(true)}
            />
            </span>
          </TooltipGlobal>
          <TooltipGlobal titulo={tooltipEditar.titulo} descricao={tooltipEditar.descricao}>
            <span data-sds-tutorial-alvo="pedido-lista-edicao-massa" className="pds-lista-btn-edicao-massa-wrap" style={{ display: 'inline-flex' }}>
            <BotaoGlobal
              className="pds-lista-btn-edicao-massa"
              variante="secundario"
              tamanho="pequeno"
              icone={<PencilLine size={14} weight="duotone" />}
              disabled={!acoesBarra.podeEditarMassa}
              aria-label={tooltipEditar.titulo}
              onClick={() => setModalEdicaoMassaAberto(true)}
            />
            </span>
          </TooltipGlobal>
          <TooltipGlobal titulo={tooltipDuplicar.titulo} descricao={tooltipDuplicar.descricao}>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              icone={<StackPlus size={14} weight="duotone" />}
              disabled={!acoesBarra.podeDuplicar}
              aria-label={tooltipDuplicar.titulo}
              onClick={() => setModalDuplicarAberto(true)}
            />
          </TooltipGlobal>
          <TooltipGlobal titulo={tooltipPdf.titulo} descricao={tooltipPdf.descricao}>
            <span data-sds-tutorial-alvo="pedido-lista-gerar-documento" className="pds-lista-btn-gerar-documento-wrap" style={{ display: 'inline-flex' }}>
            <BotaoGlobal
              className="pds-lista-btn-gerar-documento"
              variante="secundario"
              tamanho="pequeno"
              icone={<FilePdf size={14} weight="duotone" />}
              disabled={!acoesBarra.podeGerarPdf}
              aria-label={tooltipPdf.titulo}
            />
            </span>
          </TooltipGlobal>
          <TooltipGlobal titulo={tooltipExcluir.titulo} descricao={tooltipExcluir.descricao}>
            <span data-sds-tutorial-alvo="pedido-lista-excluir" className="pds-lista-btn-excluir-wrap" style={{ display: 'inline-flex' }}>
            <BotaoGlobal
              className="pds-lista-btn-excluir"
              variante="perigo"
              tamanho="pequeno"
              icone={<Trash size={14} weight="duotone" />}
              disabled={!acoesBarra.podeExcluir}
              aria-label={tooltipExcluir.titulo}
              onClick={() => setModalExcluirAberto(true)}
            />
            </span>
          </TooltipGlobal>
          {itensFiltrosConsolidados.length > 0 ? (
            <FiltrosConsolidadosListaSimuladorPedido
              dataTutorialAlvo="pedido-lista-filtros"
              itens={itensFiltrosConsolidados}
              onLimparTodos={handleLimparTodosFiltros}
              podeLimparTodos={podeLimparFiltrosConsolidados}
            />
          ) : null}
        </div>
        <div className="pds-lista-toolbar-dir gtv-toolbar-direita">
          <div className="pds-lista-dropdown-wrap">
            <button
              ref={colunasBtnRef}
              type="button"
              className={`gtv-btn${colunasAberto ? ' gtv-btn--ativo' : ''}`}
              data-sds-tutorial-alvo="pedido-lista-colunas"
              onClick={toggleColunasAberto}
              aria-label="Gerenciar colunas"
              aria-expanded={colunasAberto}
              title="Colunas"
            >
              <IconeColunasToolbar />
              Colunas
            </button>
          </div>
          <span data-sds-tutorial-alvo="pedido-lista-exportar" style={{ display: 'inline-flex' }}>
          <BotaoCompletoExportar acoes={acoesExportacao} />
          </span>
        </div>
      </div>

      <div
        className={`pds-lista-tabela-wrap${
          guiaPosTransferencia
            ? ' pds-lista-tabela-wrap--guia-pos-transferencia'
            : guiaPosConsolidacao
              ? ' pds-lista-tabela-wrap--guia-pos-consolidacao'
              : ''
        }`}
        data-sds-tutorial-alvo="pedido-lista-tabela"
        ref={tabelaWrapRef}
        onScroll={sincronizarMetricasScrollTabela}
        style={
          guiaPosTransferencia || guiaPosConsolidacao
            ? ({ '--pds-guia-qtd-colunas': colunasVisiveis.length } as CSSProperties)
            : undefined
        }
      >
        <table className="pds-lista-tabela">
          <colgroup>
            <col className="pds-lista-col-expand" />
            <col className="pds-lista-col-check" />
            {janelaColunasTabela.espacoEsquerda > 0 && (
              <col className="pds-lista-col-espacador" style={{ width: janelaColunasTabela.espacoEsquerda }} />
            )}
            {colunasRenderTabela.map((c) => (
              <col key={c.id} className="pds-lista-col-dado" />
            ))}
            {janelaColunasTabela.espacoDireita > 0 && (
              <col className="pds-lista-col-espacador" style={{ width: janelaColunasTabela.espacoDireita }} />
            )}
          </colgroup>
          <thead>
            <tr>
              <th className="pds-lista-th-expand" aria-label="Expandir" />
              <th className="pds-lista-th-check" data-sds-tutorial-alvo="pedido-lista-selecao">
                <input
                  type="checkbox"
                  className="gtv-checkbox"
                  checked={todosPedidosPaginaSelecionados}
                  onChange={toggleTodos}
                  aria-label="Selecionar todos"
                />
              </th>
              {janelaColunasTabela.espacoEsquerda > 0 && (
                <th
                  className="pds-lista-th-espacador-col"
                  style={{ width: janelaColunasTabela.espacoEsquerda, minWidth: janelaColunasTabela.espacoEsquerda }}
                  aria-hidden
                />
              )}
              {colunasRenderTabela.map((c) => {
                const arrastando = dragColunaId === c.id
                const filtravel = colunaListaSimuladorFiltravel(c.id)
                const filtroAtivo = filtrosAtivosKeys.has(c.id)
                return (
                  <th
                    key={c.id}
                    data-pds-coluna-id={c.id}
                    title={c.label}
                    draggable
                    className={[
                      'pds-lista-th-col',
                      arrastando ? 'pds-lista-th-col--arrastando' : '',
                      classeDropColuna(c.id, true),
                      classeDestaqueCabecalhoColuna(c.id),
                    ].filter(Boolean).join(' ') || undefined}
                    style={{ opacity: arrastando ? 0.45 : undefined }}
                    {...(c.id === idColunaTutorialCabecalho ? { 'data-sds-tutorial-alvo': 'pedido-lista-cabecalho-colunas' } : {})}
                    {...(c.id === 'saldo_itens_do_pedido' ? { 'data-sds-tutorial-alvo': 'pedido-lista-coluna-saldo' } : {})}
                    onDragStart={() => handleColunaDragStart(c.id)}
                    onDragOver={(e) => handleColunaDragOver(e, c.id, true)}
                    onDrop={(e) => handleColunaDrop(e, c.id, true)}
                    onDragEnd={handleColunaDragEnd}
                  >
                    <span className="pds-lista-th-col-label">{c.label}</span>
                    {filtravel && (
                      <button
                        type="button"
                        className={`gtv-filtro-btn${filtroAtivo ? ' gtv-filtro-btn--ativo' : ''}`}
                        aria-label={`Filtrar por ${c.label}`}
                        title={`Filtrar por ${c.label}`}
                        {...(c.id === idColunaTutorialFiltro ? { 'data-sds-tutorial-alvo': 'pedido-lista-filtro-coluna' } : {})}
                        onClick={(e) => {
                          e.stopPropagation()
                          onFiltroColuna(c.id, e.currentTarget)
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                          <path d="M0 1.5A.5.5 0 0 1 .5 1h9a.5.5 0 0 1 .354.854L6 5.707V9a.5.5 0 0 1-.724.447l-2-1A.5.5 0 0 1 3 8V5.707L.146 1.854A.5.5 0 0 1 0 1.5z" />
                        </svg>
                      </button>
                    )}
                  </th>
                )
              })}
              {janelaColunasTabela.espacoDireita > 0 && (
                <th
                  className="pds-lista-th-espacador-col"
                  style={{ width: janelaColunasTabela.espacoDireita, minWidth: janelaColunasTabela.espacoDireita }}
                  aria-hidden
                />
              )}
            </tr>
          </thead>
          <tbody>
            {linhasRender.map((entrada, indiceRender) => {
              if (entrada.tipo === 'pai') {
                const linha = entrada.linha
                const aberto = expandidos.has(linha.id)
                const temItens = linha.itens > 0
                const classes = [
                  selecionados.has(linha.id) ? 'pds-lista-row--sel' : '',
                  aberto ? 'pds-lista-row--pai-expandido' : '',
                  aberto && entrada.ultimoFilho ? 'pds-lista-row--pai-expandido-solo' : '',
                  ehNovoPedidoPosTransferencia(linha.id) ? 'pds-lista-row--novo-pedido-transferencia' : '',
                  ehPedidoConsolidadoDestaque(linha.id) ? 'pds-lista-row--pedido-consolidado-novo' : '',
                ].filter(Boolean).join(' ')

                return (
                  <tr
                    key={linha.id}
                    data-pds-linha-id={linha.id}
                    className={classes || undefined}
                    {...(indiceRender === 0 ? { 'data-sds-tutorial-alvo': 'pedido-lista-linha' } : {})}
                  >
                    <td className="pds-lista-td-expand">
                      {temItens ? (
                        <button
                          type="button"
                          className="pds-lista-expandir"
                          {...(indiceRender === 0 ? { 'data-sds-tutorial-alvo': 'pedido-lista-expandir' } : {})}
                          onClick={() => toggleExpansao(linha.id)}
                          aria-expanded={aberto}
                          aria-label={aberto ? `Recolher ${linha.numeroPedido}` : `Expandir ${linha.numeroPedido}`}
                        >
                          {aberto ? <CaretDown size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
                        </button>
                      ) : null}
                    </td>
                    <td className="pds-lista-td-check">
                      <input
                        type="checkbox"
                        className="gtv-checkbox"
                        checked={selecionados.has(linha.id)}
                        onChange={() => toggleSelecaoPedido(linha)}
                        aria-label={`Selecionar ${linha.numeroPedido}`}
                      />
                    </td>
                    {janelaColunasTabela.espacoEsquerda > 0 && (
                      <td
                        className="pds-lista-td-espacador-col"
                        style={{ width: janelaColunasTabela.espacoEsquerda, minWidth: janelaColunasTabela.espacoEsquerda }}
                        aria-hidden
                      />
                    )}
                    {colunasRenderTabela.map((c) => (
                      <td
                        key={c.id}
                        data-pds-coluna-id={c.id}
                        className={classeTdDestaqueGuia(linha.id, c.id)}
                      >
                        {renderCelula(c, linha, undefined, resolverTutorialAlvoCelula(linha.id, c.id))}
                      </td>
                    ))}
                    {janelaColunasTabela.espacoDireita > 0 && (
                      <td
                        className="pds-lista-td-espacador-col"
                        style={{ width: janelaColunasTabela.espacoDireita, minWidth: janelaColunasTabela.espacoDireita }}
                        aria-hidden
                      />
                    )}
                  </tr>
                )
              }

              const { item, pai, ultimoFilho } = entrada
              const classes = [
                selecionados.has(item.id) ? 'pds-lista-row--sel' : '',
                'pds-lista-row--filho',
                ultimoFilho ? 'pds-lista-row--filho-ultimo' : '',
                guiaPosTransferencia && itemEnvolvidoPosTransferencia(item.id)
                  ? 'pds-lista-row--item-transferencia'
                  : '',
              ].filter(Boolean).join(' ')

              return (
                <tr
                  key={item.id}
                  data-pds-linha-id={`item-${item.id}`}
                  className={classes}
                  {...(linhasRender.findIndex((e) => e.tipo === 'filho') === indiceRender
                    ? { 'data-sds-tutorial-alvo': 'pedido-lista-itens' }
                    : {})}
                >
                  <td className="pds-lista-td-expand" />
                  <td className="pds-lista-td-check">
                    <input
                      type="checkbox"
                      className="gtv-checkbox gtv-checkbox--filho"
                      checked={selecionados.has(item.id)}
                      onChange={() => toggleSelecaoItem(item, pai)}
                      aria-label={`Selecionar item ${item.numeroItem}`}
                    />
                  </td>
                  {janelaColunasTabela.espacoEsquerda > 0 && (
                    <td
                      className="pds-lista-td-espacador-col"
                      style={{ width: janelaColunasTabela.espacoEsquerda, minWidth: janelaColunasTabela.espacoEsquerda }}
                      aria-hidden
                    />
                  )}
                  {colunasRenderTabela.map((c) => (
                    <td
                      key={c.id}
                      data-pds-coluna-id={c.id}
                      className={classeTdDestaqueGuia(pai.id, c.id, item.id)}
                    >
                      {renderCelula(
                        c,
                        pai,
                        item,
                        resolverTutorialAlvoCelula(pai.id, c.id, item.id),
                      )}
                    </td>
                  ))}
                  {janelaColunasTabela.espacoDireita > 0 && (
                    <td
                      className="pds-lista-td-espacador-col"
                      style={{ width: janelaColunasTabela.espacoDireita, minWidth: janelaColunasTabela.espacoDireita }}
                      aria-hidden
                    />
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <footer className="pds-lista-footer gtv-paginacao" role="navigation" aria-label="Paginação">
        <span className="gtv-paginacao-info">
          {linhasFiltradas.length} pedidos · {resumo.totalItens} itens · página {paginaAtual} de {totalPaginas}
        </span>
        {totalPaginas > 1 && (
          <div className="gtv-paginacao-controles">
            <button
              type="button"
              className="gtv-pag-btn"
              disabled={paginaAtual <= 1}
              onClick={() => setPagina(1)}
              aria-label="Primeira página"
            >
              «
            </button>
            <button
              type="button"
              className="gtv-pag-btn"
              disabled={paginaAtual <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              aria-label="Página anterior"
            >
              ‹
            </button>
            {itensPaginacaoRodape.map((item, i) =>
              item === '...' ? (
                <span key={`ellipsis-${i}`} className="gtv-pag-reticencias" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={`gtv-pag-btn${item === paginaAtual ? ' gtv-pag-btn--ativo' : ''}`}
                  onClick={() => setPagina(item)}
                  aria-current={item === paginaAtual ? 'page' : undefined}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              className="gtv-pag-btn"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              aria-label="Próxima página"
            >
              ›
            </button>
            <button
              type="button"
              className="gtv-pag-btn"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => setPagina(totalPaginas)}
              aria-label="Última página"
            >
              »
            </button>
          </div>
        )}
      </footer>
      </div>

      {renderPopoverEdicao()}

      {colunasAberto && typeof document !== 'undefined' && createPortal(
        <div
          ref={colunasDropdownRef}
          className="pds-lista-dropdown pds-lista-dropdown--colunas pds-lista-dropdown--colunas-portal"
          data-sds-tutorial-alvo="pedido-lista-colunas-painel"
          style={{ top: colunasDropdownPos.top, left: colunasDropdownPos.left }}
          role="dialog"
          aria-label="Gerenciar colunas"
        >
          <div className="pds-lista-dropdown-colunas-cabecalho">
            <span className="pds-lista-dropdown-colunas-titulo">Colunas</span>
            <button
              type="button"
              className="pds-lista-dropdown-colunas-fechar"
              aria-label="Fechar painel de colunas"
              onClick={() => setColunasAberto(false)}
            >
              <X size={14} weight="bold" />
            </button>
          </div>
          <div className="pds-lista-dropdown-busca">
            <MagnifyingGlass size={12} aria-hidden />
            <input
              type="search"
              placeholder="Buscar coluna..."
              value={buscaColuna}
              onChange={(e) => setBuscaColuna(e.target.value)}
            />
          </div>
          <div className="pds-lista-dropdown-tabs">
            {([
              ['todas', `Todas (${totalColunas})`],
              ['exibidas', `Exibidas (${totalExibidas})`],
              ['ocultas', `Ocultas (${totalOcultas})`],
              ['manuais', `Manuais (${totalManuais})`],
            ] as Array<[FiltroAbaColunas, string]>).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`pds-lista-dropdown-tab ${filtroAbaColunas === id ? 'pds-lista-dropdown-tab--ativo' : ''}`}
                onClick={() => setFiltroAbaColunas(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="pds-lista-dropdown-acoes">
            <label className="pds-lista-dropdown-check">
              <input
                type="checkbox"
                checked={colunasVisiveis.length === colunas.length}
                onChange={() => setColunas((prev) => prev.map((c) => ({ ...c, visivel: true })))}
              />
              Selecionar tudo
            </label>
            <button
              type="button"
              className="pds-lista-restaurar"
              onClick={() => {
                setColunas(criarEstadoColunasListaSimuladorPedido())
                setFiltroAbaColunas('todas')
              }}
            >
              <ArrowCounterClockwise size={12} aria-hidden />
              Restaurar padrão
            </button>
          </div>
          <ul className="pds-lista-colunas-lista">
            {colunasFiltradas.map((c) => (
              <li
                key={c.id}
                className={[
                  'pds-lista-coluna-item',
                  dragColunaId === c.id ? 'pds-lista-coluna-item--arrastando' : '',
                  classeDropColuna(c.id, false),
                ].filter(Boolean).join(' ') || undefined}
                onDragOver={(e) => handleColunaDragOver(e, c.id, false)}
                onDrop={(e) => handleColunaDrop(e, c.id, false)}
              >
                <label>
                  <span
                    className="pds-lista-coluna-handle"
                    draggable
                    aria-label={`Arrastar coluna ${c.label}`}
                    onDragStart={(e) => {
                      e.stopPropagation()
                      handleColunaDragStart(c.id)
                    }}
                    onDragEnd={handleColunaDragEnd}
                  >
                    ⋮⋮
                  </span>
                  <input
                    type="checkbox"
                    checked={c.visivel}
                    onChange={() =>
                      setColunas((prev) =>
                        prev.map((col) => (col.id === c.id ? { ...col, visivel: !col.visivel } : col)),
                      )
                    }
                  />
                  {c.label}
                </label>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )}

      {popoverFiltroAberto && typeof document !== 'undefined' && (() => {
        const col = colunasGt.find((c) => c.key === popoverFiltroAberto)
        if (!col || !col.filtravel) return null
        return createPortal(
          <FiltroPopoverColuna
            campo={col.key}
            label={col.label}
            tipo={detectarTipoFiltroColunaSimulador(col)}
            filtroAtual={filtrosAtivos[col.key]}
            valoresUnicos={valoresUnicosPorCampo[col.key] ?? []}
            onAplicar={handleAplicarFiltro}
            onLimpar={handleLimparFiltro}
            onOrdenar={handleOrdenar}
            onFechar={() => setPopoverFiltroAberto(null)}
            anchorPos={popoverFiltroPos}
            labelInverso={getLabelsFiltroInversoSimulador(col.key)}
          />,
          document.body,
        )
      })()}

      <ModalNovoPedidoSimulador
        aberto={modalNovoPedidoAberto}
        onFechar={() => setModalNovoPedidoAberto(false)}
        onPassoChange={setPassoModalNovoPedido}
        onCadastroRapidoChange={setCadastroRapidoEmpresaAberto}
        onSalvo={handleSalvarNovoPedido}
      />
      <ModalNovoItemSimuladorPedido
        aberto={modalNovoItemAberto}
        linhas={linhas}
        onFechar={() => setModalNovoItemAberto(false)}
        onSalvo={handleSalvarNovoItem}
      />
      <ModalDuplicarListaSimuladorPedido
        aberto={modalDuplicarAberto}
        selecao={selecaoLista}
        onFechar={handleFecharModalDuplicar}
        onConfirmar={handleConfirmarDuplicar}
      />
      <ModalConsolidarListaSimuladorPedido
        aberto={modalConsolidarAberto}
        linhas={linhas}
        selecao={selecaoLista}
        onFechar={handleFecharModalConsolidar}
        onConcluido={handleConcluidoConsolidar}
        onEstadoTutorialChange={({ passo, concluido }) => {
          setPassoModalConsolidar(passo)
          setModalConsolidarConcluido(concluido)
        }}
      />
      <ModalEdicaoMassaListaSimuladorPedido
        aberto={modalEdicaoMassaAberto}
        selecao={selecaoLista}
        linhas={linhas}
        onFechar={handleFecharModalEdicaoMassa}
        onConfirmar={handleConfirmarEdicaoMassa}
        onEstadoTutorialChange={setPassoModalEdicaoMassa}
      />
      <ModalTransferirListaSimuladorPedido
        aberto={modalTransferirAberto}
        selecao={selecaoLista}
        linhas={linhas}
        onFechar={handleFecharModalTransferir}
        onConcluido={handleConcluidoTransferir}
        onEstadoTutorialChange={({ passo, concluido, cenario }) => {
          setPassoModalTransferir(passo)
          setCenarioModalTransferir(cenario)
          setModalTransferirConcluido(concluido)
        }}
      />
      {explicacaoTransferencia && (
        <ModalExplicacaoTransferenciaSimuladorPedido
          aberto
          resumo={explicacaoTransferencia.resumo}
          onEntendi={handleEntendiExplicacaoTransferencia}
        />
      )}
      <ModalExcluirListaSimuladorPedido
        aberto={modalExcluirAberto}
        selecao={selecaoLista}
        onFechar={() => setModalExcluirAberto(false)}
        onConfirmar={handleConfirmarExcluir}
      />
      {guiaPosTransferencia && (
        <GuiaPosTransferenciaSimuladorPedido
          passo={guiaPosTransferencia.passo}
          resumo={guiaPosTransferencia.resumo}
          onProximo={handleProximoGuiaPosTransferencia}
          onConcluir={handleConcluirGuiaPosTransferencia}
          dataTutorialAlvo="pedido-guia-pos-transferencia"
        />
      )}
      {guiaPosConsolidacao && (
        <GuiaPosConsolidacaoSimuladorPedido
          passo={guiaPosConsolidacao.passo}
          resumo={guiaPosConsolidacao.resumo}
          onProximo={handleProximoGuiaPosConsolidacao}
          onConcluir={handleConcluirGuiaPosConsolidacao}
          dataTutorialAlvo="pedido-guia-pos-consolidacao"
        />
      )}
      {toastDemo && (
        <ToastDemoNovoSimuladorPedido
          titulo={toastDemo.titulo}
          mensagem={toastDemo.mensagem}
          onFechar={() => setToastDemo(null)}
        />
      )}
    </div>
  )
}
