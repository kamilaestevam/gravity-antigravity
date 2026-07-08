import { useCallback, useEffect, useMemo, useState, type CSSProperties, type DragEvent } from 'react'
import { createPortal } from 'react-dom'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { EdicaoTextoPopoverGlobal } from '../../../Tabelas/tabela-virtual-global/src/EdicaoTextoPopoverGlobal'
import { FiltroChips } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltroChips'
import { FiltroPopoverColuna } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltroPopoverColuna'
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
  Trash,
  Warning,
  X,
} from '@phosphor-icons/react'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  formatarValorListaPedidoSimulador,
  listarPedidosEmpresasSimulador,
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
  tooltipEditarMassaListaSimulador,
  tooltipExcluirListaSimulador,
  tooltipGerarPdfListaSimulador,
  tooltipTransferirListaSimulador,
} from './regras-acoes-barra-lista-simulador-pedido'
import { MenuNovoListaSimuladorPedido, ToastDemoNovoSimuladorPedido } from './menu-novo-lista-simulador-pedido'
import { ModalNovoPedidoSimulador } from './modal-novo-pedido-simulador'
import { ModalNovoItemSimuladorPedido } from './modal-novo-item-simulador-pedido'
import { montarLinhaNovoPedidoSimulador } from './montar-linha-novo-pedido-simulador'
import type { FornecedorSimuladorNovoPedido } from './dados-fornecedores-simulador-novo-pedido'
import type { FormNovoPedidoSimulador, ItemNovoPedidoSimulador } from './regras-modal-novo-pedido-simulador'

type FiltroAbaColunas = 'todas' | 'exibidas' | 'ocultas' | 'manuais'

const STATUS_FILTROS: Array<{ id: string; label: string; cor: string; valor?: StatusListaPedidoSimulador }> = [
  { id: 'todas', label: 'Todos', cor: '#818cf8' },
  { id: 'rascunho', label: 'Rascunho', cor: '#94a3b8', valor: 'RASCUNHO' },
  { id: 'aberto', label: 'Aberto', cor: '#f472b6', valor: 'ABERTO' },
  { id: 'andamento', label: 'Em Andamento', cor: '#fb923c', valor: 'EM ANDAMENTO' },
  { id: 'transferido', label: 'Transferido', cor: '#2dd4bf', valor: 'TRANSFERIDO' },
  { id: 'consolidado', label: 'Consolidado', cor: '#a78bfa', valor: 'CONSOLIDADO' },
]

const EXPORTAR_OPCOES = ['Excel (.xlsx)', 'CSV', 'TXT', 'XML', 'JSON', 'PDF']

const ITENS_POR_PAGINA = 10

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

const STATUS_LABELS: Record<StatusListaPedidoSimulador, string> = {
  RASCUNHO: 'Rascunho',
  ABERTO: 'Aberto',
  'EM ANDAMENTO': 'Em Andamento',
  TRANSFERIDO: 'Transferido',
  CONSOLIDADO: 'Consolidado',
}

function estiloStatusBadge(status: StatusListaPedidoSimulador): CSSProperties {
  const cor = STATUS_CORES[status]
  return {
    color: cor,
    background: `${cor}1e`,
    border: `1px solid ${cor}33`,
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
  onAbrirMenuWorkspaces?: () => void
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

export function ListaSimuladorPedido({ empresasSelecionadas, onAbrirMenuWorkspaces }: Props) {
  const [paineisLista, setPaineisLista] = useState<PainelItemSimulador[]>(PAINEIS_LISTA_SIMULADOR_INICIAIS)
  const [painelAtualId, setPainelAtualId] = useState('geral')
  const [statusFiltro, setStatusFiltro] = useState('todas')
  const [busca, setBusca] = useState('')
  const [pagina, setPagina] = useState(1)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [colunas, setColunas] = useState<ColunaListaSimuladorPedido[]>(criarEstadoColunasListaSimuladorPedido)
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
  const [modalNovoItemAberto, setModalNovoItemAberto] = useState(false)
  const [toastDemo, setToastDemo] = useState<{ titulo: string; mensagem: string } | null>(null)

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

  const toggleExpandirTodos = useCallback(() => {
    if (temExpandido) {
      setExpandidos(new Set())
      return
    }
    setExpandidos(new Set(linhas.filter((l) => l.detalhesItens.length > 0).map((l) => l.id)))
  }, [temExpandido, linhas])

  const rotuloEscopoWorkspaces = useMemo(() => {
    if (empresasSelecionadas.length === 0) return null
    const nomes = empresasSelecionadas.map((empresa) => empresa.nome)
    if (nomes.length === 1) return nomes[0]
    if (nomes.length === 2) return nomes.join(', ')
    return `${nomes.length} selecionados`
  }, [empresasSelecionadas])

  const tooltipEscopoWorkspaces = useMemo(() => {
    if (empresasSelecionadas.length === 0) return null
    const nomes = empresasSelecionadas.map((empresa) => empresa.nome)
    if (nomes.length === 0) return null
    return <ListaNumeradaWorkspacesTooltipSimulador nomes={nomes} />
  }, [empresasSelecionadas])

  const filtrosAtivosKeys = useMemo(() => new Set(Object.keys(filtrosAtivos)), [filtrosAtivos])
  const colunasGt = useMemo(() => montarColunasGtListaSimulador(colunas), [colunas])

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

  const linhasBase = linhas

  const linhasFiltradas = useMemo(() => {
    const statusValor = STATUS_FILTROS.find((s) => s.id === statusFiltro)?.valor
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

  const totalPaginas = Math.max(1, Math.ceil(linhasFiltradas.length / ITENS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)

  const linhasPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
    return linhasFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA)
  }, [linhasFiltradas, paginaAtual])

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

  const colunasVisiveis = colunas.filter((c) => c.visivel)
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
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelecao = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleTodos = () => {
    if (todosPedidosPaginaSelecionados) {
      setSelecionados((prev) => {
        const next = new Set(prev)
        for (const linha of linhasPagina) next.delete(linha.id)
        return next
      })
    } else {
      setSelecionados((prev) => {
        const next = new Set(prev)
        for (const linha of linhasPagina) next.add(linha.id)
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

  function renderCelulaConteudo(
    colunaId: string,
    linha: LinhaListaPedidoSimulador,
    item?: ItemListaPedidoSimulador,
  ) {
    const campos = item?.campos ?? linha.campos
    const valor = campos[colunaId]

    if (colunaId === 'numero_pedido') {
      if (item) {
        return (
          <span className="pds-lista-numero pds-lista-numero--filho">
            <span className="pds-lista-sequencia">{item.sequencia}</span>
            <span className="pds-lista-item-id">{item.numeroItem}</span>
            {item.alerta && <Warning size={12} weight="fill" className="pds-lista-alerta" aria-hidden />}
          </span>
        )
      }
      return (
        <span className="pds-lista-numero">
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
      if (!valor) return <span className="pds-lista-vazio">—</span>
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
          {valor ?? '—'}
          {alertaPai && (
            <Warning size={12} weight="fill" className="pds-lista-alerta" aria-hidden />
          )}
        </span>
      )
    }

    if (colunaId.startsWith('anexo_') && valor) {
      return <span className="pds-lista-anexo">{valor}</span>
    }

    return <span className={valor ? '' : 'pds-lista-vazio'}>{valor ?? '—'}</span>
  }

  function renderCelula(
    coluna: ColunaListaSimuladorPedido,
    linha: LinhaListaPedidoSimulador,
    item?: ItemListaPedidoSimulador,
  ) {
    const nivel: NivelLinhaLista = item ? 'item' : 'pai'
    const flash = flashCelulas.get(chaveCelula(linha.id, coluna.id, item?.id))

    return (
      <CelulaEditavelListaSimuladorPedido
        colunaId={coluna.id}
        nivel={nivel}
        linha={linha}
        item={item}
        labelColuna={coluna.label}
        flashSalvo={flash === 'salvo'}
        flashErro={flash === 'erro'}
        onIniciarEdicao={setCelulaEmEdicao}
      >
        {renderCelulaConteudo(coluna.id, linha, item)}
      </CelulaEditavelListaSimuladorPedido>
    )
  }

  return (
    <div className="pds-lista">
      <div className="lp-stats-row">
        <div className="lp-cards">
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

      <div className="pds-lista-status-bar">
        <span className="pds-lista-status-label">Status</span>
        <div className="pds-lista-status-pills">
        {STATUS_FILTROS.map((s) => (
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

      <div className="pds-lista-toolbar gtv-toolbar">
        <div className="pds-lista-toolbar-esq gtv-toolbar-esquerda">
          <div className="gtv-busca-wrapper">
            <span className="gtv-busca-icone"><MagnifyingGlass size={14} aria-hidden /></span>
            <input
              type="search"
              className="gtv-busca-input pds-lista-busca-input"
              placeholder="Buscar pedido."
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
          />
          <span className="pds-lista-toolbar-divisor" aria-hidden="true" />
          <TooltipGlobal titulo={tooltipTransferir.titulo} descricao={tooltipTransferir.descricao}>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              icone={<ArrowRight size={14} weight="duotone" />}
              disabled={!acoesBarra.podeTransferir}
            >
              {rotuloTransferir}
            </BotaoGlobal>
          </TooltipGlobal>
          <TooltipGlobal titulo={tooltipEditar.titulo} descricao={tooltipEditar.descricao}>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              icone={<PencilLine size={14} weight="duotone" />}
              disabled={!acoesBarra.podeEditarMassa}
              aria-label={tooltipEditar.titulo}
            />
          </TooltipGlobal>
          <TooltipGlobal titulo={tooltipConsolidar.titulo} descricao={tooltipConsolidar.descricao}>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              icone={<GitMerge size={14} weight="duotone" />}
              disabled={!acoesBarra.podeConsolidar}
              aria-label={tooltipConsolidar.titulo}
            />
          </TooltipGlobal>
          <TooltipGlobal titulo={tooltipPdf.titulo} descricao={tooltipPdf.descricao}>
            <BotaoGlobal
              variante="secundario"
              tamanho="pequeno"
              icone={<FilePdf size={14} weight="duotone" />}
              disabled={!acoesBarra.podeGerarPdf}
              aria-label={tooltipPdf.titulo}
            />
          </TooltipGlobal>
          <TooltipGlobal titulo={tooltipExcluir.titulo} descricao={tooltipExcluir.descricao}>
            <BotaoGlobal
              variante="perigo"
              tamanho="pequeno"
              icone={<Trash size={14} weight="duotone" />}
              disabled={!acoesBarra.podeExcluir}
              aria-label={tooltipExcluir.titulo}
            />
          </TooltipGlobal>
          {(Object.keys(filtrosAtivos).length > 0 || busca.trim().length > 0 || rotuloEscopoWorkspaces) && (
            <FiltroChips
              colunas={colunasGt}
              filtrosAtivos={filtrosAtivos}
              onLimparFiltro={handleLimparFiltro}
              onLimparTodos={handleLimparTodosFiltros}
              onEditarFiltro={onFiltroColuna}
              thresholdConsolidar={2}
              prefixo={(
                <>
                  {rotuloEscopoWorkspaces ? (
                    <TooltipGlobal
                      titulo="Workspaces"
                      descricao={tooltipEscopoWorkspaces ?? rotuloEscopoWorkspaces}
                      interativo
                      posicaoPreferida="abaixo"
                    >
                      <button
                        type="button"
                        className="fc-chip fc-chip--escopo fc-chip--escopo-btn"
                        onClick={onAbrirMenuWorkspaces}
                        aria-label="Alterar workspaces selecionados"
                      >
                        <span className="fc-chip-label">Workspaces:</span>
                        <span className="fc-chip-valor">{rotuloEscopoWorkspaces}</span>
                      </button>
                    </TooltipGlobal>
                  ) : null}
                  {busca.trim().length > 0 ? (
                    <span className="fc-chip">
                      <span className="fc-chip-label">Busca:</span>
                      <span className="fc-chip-valor">{busca}</span>
                      <button
                        type="button"
                        className="fc-chip-remove"
                        onClick={() => { setBusca(''); setPagina(1) }}
                        aria-label="Remover busca"
                      >
                        <X size={10} weight="bold" />
                      </button>
                    </span>
                  ) : null}
                </>
              )}
            />
          )}
        </div>
        <div className="pds-lista-toolbar-dir gtv-toolbar-direita">
          <div className="pds-lista-dropdown-wrap">
            <button
              type="button"
              className={`gtv-btn${colunasAberto ? ' gtv-btn--ativo' : ''}`}
              onClick={() => setColunasAberto((v) => !v)}
              aria-label="Gerenciar colunas"
              title="Colunas"
            >
              <IconeColunasToolbar />
              Colunas
            </button>
            {colunasAberto && (
              <div className="pds-lista-dropdown pds-lista-dropdown--colunas">
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
                          ⠿
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
              </div>
            )}
          </div>
          <BotaoCompletoExportar acoes={acoesExportacao} />
        </div>
      </div>

      <div className="pds-lista-tabela-wrap">
        <table className="pds-lista-tabela">
          <colgroup>
            <col className="pds-lista-col-expand" />
            <col className="pds-lista-col-check" />
            {colunasVisiveis.map((c) => (
              <col key={c.id} className="pds-lista-col-dado" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="pds-lista-th-expand" aria-label="Expandir" />
              <th className="pds-lista-th-check">
                <input
                  type="checkbox"
                  className="gtv-checkbox"
                  checked={todosPedidosPaginaSelecionados}
                  onChange={toggleTodos}
                  aria-label="Selecionar todos"
                />
              </th>
              {colunasVisiveis.map((c) => {
                const arrastando = dragColunaId === c.id
                const filtravel = colunaListaSimuladorFiltravel(c.id)
                const filtroAtivo = filtrosAtivosKeys.has(c.id)
                return (
                  <th
                    key={c.id}
                    title={c.label}
                    draggable
                    className={[
                      'pds-lista-th-col',
                      arrastando ? 'pds-lista-th-col--arrastando' : '',
                      classeDropColuna(c.id, true),
                    ].filter(Boolean).join(' ') || undefined}
                    style={{ opacity: arrastando ? 0.45 : undefined }}
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
            </tr>
          </thead>
          <tbody>
            {linhasRender.map((entrada) => {
              if (entrada.tipo === 'pai') {
                const linha = entrada.linha
                const aberto = expandidos.has(linha.id)
                const temItens = linha.detalhesItens.length > 0
                const classes = [
                  selecionados.has(linha.id) ? 'pds-lista-row--sel' : '',
                  aberto ? 'pds-lista-row--pai-expandido' : '',
                  aberto && entrada.ultimoFilho ? 'pds-lista-row--pai-expandido-solo' : '',
                ].filter(Boolean).join(' ')

                return (
                  <tr key={linha.id} className={classes || undefined}>
                    <td className="pds-lista-td-expand">
                      {temItens ? (
                        <button
                          type="button"
                          className="pds-lista-expandir"
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
                        onChange={() => toggleSelecao(linha.id)}
                        aria-label={`Selecionar ${linha.numeroPedido}`}
                      />
                    </td>
                    {colunasVisiveis.map((c) => (
                      <td key={c.id}>{renderCelula(c, linha)}</td>
                    ))}
                  </tr>
                )
              }

              const { item, pai, ultimoFilho } = entrada
              const classes = [
                selecionados.has(item.id) ? 'pds-lista-row--sel' : '',
                'pds-lista-row--filho',
                ultimoFilho ? 'pds-lista-row--filho-ultimo' : '',
              ].filter(Boolean).join(' ')

              return (
                <tr key={item.id} className={classes}>
                  <td className="pds-lista-td-expand" />
                  <td className="pds-lista-td-check">
                    <input
                      type="checkbox"
                      className="gtv-checkbox gtv-checkbox--filho"
                      checked={selecionados.has(item.id)}
                      onChange={() => toggleSelecao(item.id)}
                      aria-label={`Selecionar item ${item.numeroItem}`}
                    />
                  </td>
                  {colunasVisiveis.map((c) => (
                    <td key={c.id}>{renderCelula(c, pai, item)}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <footer className="pds-lista-footer">
        <span>
          {linhasFiltradas.length} pedidos · {resumo.totalItens} itens · página {paginaAtual} de {totalPaginas}
        </span>
        <div className="pds-lista-paginacao">
          <button
            type="button"
            disabled={paginaAtual <= 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={n === paginaAtual ? 'pds-lista-pagina--ativa' : ''}
              onClick={() => setPagina(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={paginaAtual >= totalPaginas}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          >
            ›
          </button>
        </div>
      </footer>
      </div>

      {renderPopoverEdicao()}

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
        onSalvo={handleSalvarNovoPedido}
      />
      <ModalNovoItemSimuladorPedido
        aberto={modalNovoItemAberto}
        linhas={linhas}
        onFechar={() => setModalNovoItemAberto(false)}
        onSalvo={handleSalvarNovoItem}
      />
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
