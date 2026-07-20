/**
 * ListaSimuladorBidFrete — Lista de cotações no padrão do produto real:
 * KPIs no topo, faixa de painéis, chips de status, filtros por coluna
 * (popover com ordenação), colunas reordenáveis por drag-and-drop,
 * seleção por checkbox e paginação.
 */

import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  AirplaneTilt,
  Anchor,
  ArrowSquareOut,
  CaretDoubleDown,
  CaretDoubleUp,
  CaretDown,
  CaretRight,
  CheckCircle,
  CurrencyDollar,
  DownloadSimple,
  Envelope,
  ListNumbers,
  MagnifyingGlass,
  PiggyBank,
  Plus,
  StackPlus,
  Trash,
  Truck,
  UploadSimple,
  X,
  XCircle,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '../../../Layout/card-global/src/index'
import { TooltipGlobal } from '../../../Feedback/tooltip-global/src/tooltip'
import { FiltroPopoverColuna } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltroPopoverColuna'
import { rotulofiltro } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/rotulofiltro'
import type { FiltroAtivo, FiltrosAtivosMap, FiltroTipo } from '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/tipos'
import '../../../Tabelas/tabela-virtual-global/src/FiltrosColuna/FiltrosColuna.css'
import {
  FaixaPaineisListaSimuladorPedido,
  type PainelItemSimulador,
} from '../pedido/faixa-paineis-lista-simulador-pedido'
import {
  FiltrosConsolidadosListaSimuladorPedido,
  type ItemFiltroConsolidadoListaSimuladorPedido,
} from '../pedido/filtros-consolidados-lista-simulador-pedido'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  agruparLinhasPaiListaSimuladorBidFrete,
  formatarDataCurtaSimuladorBidFrete,
  formatarUsdSimuladorBidFrete,
  isBidGrupoSimuladorBidFrete,
  listarCotacoesEmpresasSimuladorBidFrete,
  savingsCotacaoSimuladorBidFrete,
  MODAL_SIMULADOR_BID_FRETE,
  OPERACAO_SIMULADOR_BID_FRETE,
  STATUS_SIMULADOR_BID_FRETE,
  type BidGrupoSimuladorBidFrete,
  type CotacaoSimuladorBidFrete,
  type LinhaPaiListaSimuladorBidFrete,
  type ModalSimuladorBidFrete,
  type StatusCotacaoSimuladorBidFrete,
} from './dados-simulador-bid-frete'
import { DropdownNovoSimuladorBidFrete } from './dropdown-novo-simulador-bid-frete'
import {
  ModalExcluirListaSimuladorBidFrete,
  mensagemToastExclusaoSimuladorBidFrete,
} from './modal-excluir-lista-simulador-bid-frete'
import '../pedido/lista-simulador-pedido.css'
import '../../../Tabelas/tabela-virtual-global/src/tabela-virtual.css'
import './lista-simulador-bid-frete.css'

type Props = {
  empresasSelecionadas: PerfilEmpresaSimulador[]
  numeroCotacaoFoco?: string | null
  onConsumirFoco?: () => void
  /** Cotações criadas pelo wizard "Nova Cotação" da demonstração. */
  cotacoesCriadas?: CotacaoSimuladorBidFrete[]
  onAbrirNovaCotacaoManual?: () => void
  /** Abre o Painel da Cotação (qualquer linha da Lista). */
  onAbrirPainelCotacao?: (cotacao: CotacaoSimuladorBidFrete) => void
}

// ─── Colunas (reordenáveis) ──────────────────────────────────────────────────

type ColunaListaBidFrete = { id: string; label: string; numerica?: boolean }

function classeCelulaColunaLista(col: ColunaListaBidFrete): string | undefined {
  if (col.numerica) return 'bfs-lista-num'
  if (col.id === 'status') return 'bfs-lista-col-status'
  return undefined
}

const COLUNAS_INICIAIS_BID: ColunaListaBidFrete[] = [
  { id: 'numero', label: 'Nº Cotação' },
  { id: 'status', label: 'Status' },
  { id: 'operacao', label: 'Operação' },
  { id: 'modal', label: 'Modal' },
  { id: 'origem', label: 'Origem' },
  { id: 'destino', label: 'Destino' },
  { id: 'incoterm', label: 'Incoterm' },
  { id: 'carga', label: 'Carga' },
  { id: 'propostas', label: 'Propostas', numerica: true },
  { id: 'meta', label: 'Meta (USD)', numerica: true },
  { id: 'lance', label: 'Melhor Lance', numerica: true },
  { id: 'savings', label: 'Savings', numerica: true },
  { id: 'prazo', label: 'Prazo Resposta' },
]

const TIPO_FILTRO_COLUNA_BID: Record<string, FiltroTipo> = {
  numero: 'texto',
  status: 'enum',
  operacao: 'enum',
  modal: 'enum',
  origem: 'enum',
  destino: 'enum',
  incoterm: 'enum',
  carga: 'enum',
  propostas: 'numero',
  meta: 'numero',
  lance: 'numero',
  savings: 'numero',
  prazo: 'texto',
}

// ─── Painéis (visões salvas, como no produto real) ───────────────────────────

const PAINEIS_LISTA_BID_INICIAIS: PainelItemSimulador[] = [
  { id: 'geral', nome: 'Geral', ordem: 0 },
  { id: 'asia', nome: 'Ásia', ordem: 1 },
  { id: 'america-sul', nome: 'América do Sul', ordem: 2 },
  { id: 'maritimo', nome: 'Marítimo', ordem: 3 },
]

const PAISES_AMERICA_SUL = new Set(['BR', 'AR', 'CL'])

const FILTRO_PAINEL_BID: Record<string, (c: CotacaoSimuladorBidFrete) => boolean> = {
  asia: (c) => c.origem.pais === 'CN' || c.destino.pais === 'CN',
  'america-sul': (c) => PAISES_AMERICA_SUL.has(c.origem.pais) && PAISES_AMERICA_SUL.has(c.destino.pais),
  maritimo: (c) => c.modal === 'MARITIMO',
}

// ─── Extração de valores por coluna ──────────────────────────────────────────

function rotuloPorto(porto: CotacaoSimuladorBidFrete['origem']): string {
  return `${porto.cidade} (${porto.codigo})`
}

function valorCampoCotacao(c: CotacaoSimuladorBidFrete, campo: string): string | number | null {
  switch (campo) {
    case 'numero': return c.numero
    case 'status': return STATUS_SIMULADOR_BID_FRETE[c.status].rotulo
    case 'operacao': return OPERACAO_SIMULADOR_BID_FRETE[c.operacao]
    case 'modal': return MODAL_SIMULADOR_BID_FRETE[c.modal].rotulo
    case 'origem': return rotuloPorto(c.origem)
    case 'destino': return rotuloPorto(c.destino)
    case 'incoterm': return c.incoterm
    case 'carga': return c.modalidade
    case 'propostas': return c.propostasRecebidas
    case 'meta': return c.valorMetaUsd
    case 'lance': return c.melhorLanceUsd
    case 'savings': return savingsCotacaoSimuladorBidFrete(c)
    case 'prazo': return formatarDataCurtaSimuladorBidFrete(c.dataLimiteResposta)
    default: return null
  }
}

/** Valor bruto para ordenação (datas ISO, ordem de status). */
function valorOrdenacaoCotacao(c: CotacaoSimuladorBidFrete, campo: string): string | number | null {
  if (campo === 'prazo') return c.dataLimiteResposta
  if (campo === 'status') return STATUS_SIMULADOR_BID_FRETE[c.status].ordem
  return valorCampoCotacao(c, campo)
}

function cotacaoPassaFiltrosColuna(c: CotacaoSimuladorBidFrete, filtros: FiltrosAtivosMap): boolean {
  for (const [campo, filtro] of Object.entries(filtros)) {
    const val = valorCampoCotacao(c, campo)
    if (filtro.tipo === 'texto') {
      if (!String(val ?? '').toLowerCase().includes(filtro.valor.toLowerCase())) return false
    } else if (filtro.tipo === 'enum') {
      if (filtro.valor.size > 0 && !filtro.valor.has(String(val ?? ''))) return false
    } else if (filtro.tipo === 'numero') {
      if (typeof val !== 'number') return false
      if (filtro.valor.min != null && val < filtro.valor.min) return false
      if (filtro.valor.max != null && val > filtro.valor.max) return false
    }
  }
  return true
}

type LadoDropColunaBid = 'before' | 'after'

function reordenarColunasBid(
  colunas: ColunaListaBidFrete[],
  fromId: string,
  toId: string,
  lado: LadoDropColunaBid,
): ColunaListaBidFrete[] {
  if (fromId === toId) return colunas
  const fromIdx = colunas.findIndex((c) => c.id === fromId)
  if (fromIdx < 0) return colunas
  const next = [...colunas]
  const [movida] = next.splice(fromIdx, 1)
  let insertIdx = next.findIndex((c) => c.id === toId)
  if (insertIdx < 0) return colunas
  if (lado === 'after') insertIdx += 1
  next.splice(insertIdx, 0, movida)
  return next
}

function resolverLadoDropColunaBid(e: DragEvent<HTMLElement>): LadoDropColunaBid {
  const rect = e.currentTarget.getBoundingClientRect()
  return e.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
}

const ICONE_MODAL: Record<ModalSimuladorBidFrete, JSX.Element> = {
  MARITIMO: <Anchor size={13} weight="duotone" />,
  AEREO: <AirplaneTilt size={13} weight="duotone" />,
  RODOVIARIO: <Truck size={13} weight="duotone" />,
}

const ITENS_POR_PAGINA = 10

// ─── Duplicação (demo) — cópia nasce em rascunho, como no produto real ───────

function numeroCotacaoDuplicada(): string {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `COT-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`
}

function isoHojeListaBid(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function duplicarCotacaoSimulador(
  c: CotacaoSimuladorBidFrete,
  bidNumero?: string,
): CotacaoSimuladorBidFrete {
  return {
    ...c,
    id: `dup-${c.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    numero: numeroCotacaoDuplicada(),
    bidNumero,
    status: 'RASCUNHO',
    propostasRecebidas: 0,
    fornecedoresConvidados: 0,
    melhorLanceUsd: null,
    fornecedorLider: null,
    transitTimeDias: null,
    dataCriacao: isoHojeListaBid(),
  }
}

function estiloChipStatusBid(id: string, cor: string, ativo: boolean): CSSProperties {
  if (id === 'todas') {
    return {
      color: ativo ? '#bfdbfe' : '#94a3b8',
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
  return { color: '#94a3b8', background: 'transparent', borderColor: 'transparent' }
}

export function ListaSimuladorBidFrete({
  empresasSelecionadas,
  numeroCotacaoFoco,
  onConsumirFoco,
  cotacoesCriadas,
  onAbrirNovaCotacaoManual,
  onAbrirPainelCotacao,
}: Props) {
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<StatusCotacaoSimuladorBidFrete | 'todas'>('todas')
  const [colunas, setColunas] = useState<ColunaListaBidFrete[]>(COLUNAS_INICIAIS_BID)
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAtivosMap>({})
  const [popoverFiltroAberto, setPopoverFiltroAberto] = useState<string | null>(null)
  const [popoverFiltroPos, setPopoverFiltroPos] = useState({ top: 0, left: 0 })
  const [sortCampo, setSortCampo] = useState<string | null>('numero')
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>('desc')
  const [paineis, setPaineis] = useState<PainelItemSimulador[]>(PAINEIS_LISTA_BID_INICIAIS)
  const [painelAtualId, setPainelAtualId] = useState('geral')
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [pagina, setPagina] = useState(1)
  const [dragColunaId, setDragColunaId] = useState<string | null>(null)
  const [dragOverColunaId, setDragOverColunaId] = useState<string | null>(null)
  const [ladoDropColuna, setLadoDropColuna] = useState<LadoDropColunaBid>('before')
  const [linhaFocada, setLinhaFocada] = useState<string | null>(null)
  /** BIDs expandidos (id da linha pai). */
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  /** Cópias criadas via "Duplicar" na demo. */
  const [duplicadas, setDuplicadas] = useState<CotacaoSimuladorBidFrete[]>([])
  /** Ids de cotações excluídas na demo. */
  const [excluidosIds, setExcluidosIds] = useState<Set<string>>(new Set())
  /** Toast de sucesso/erro das ações em lote (paridade shell-toast). */
  const [toastAcao, setToastAcao] = useState<{ tipo: 'success' | 'error'; mensagem: string } | null>(null)
  /** Modal de confirmação de exclusão (paridade produto real). */
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const corpoRef = useRef<HTMLTableSectionElement>(null)

  function abrirCotacaoPelaLinha(c: CotacaoSimuladorBidFrete, ev: MouseEvent<HTMLTableRowElement>) {
    if (!onAbrirPainelCotacao) return
    const target = ev.target as HTMLElement
    if (target.closest('input, button, a, label')) return
    onAbrirPainelCotacao(c)
  }

  useEffect(() => {
    if (!toastAcao) return
    const timer = window.setTimeout(() => setToastAcao(null), 4200)
    return () => window.clearTimeout(timer)
  }, [toastAcao])

  const cotacoesEscopo = useMemo(
    () => [
      ...(cotacoesCriadas ?? []),
      ...duplicadas,
      ...listarCotacoesEmpresasSimuladorBidFrete(empresasSelecionadas),
    ].filter((c) => !excluidosIds.has(c.id)),
    [empresasSelecionadas, cotacoesCriadas, duplicadas, excluidosIds],
  )

  useEffect(() => {
    setSelecionados(new Set())
    setFiltrosAtivos({})
    setPopoverFiltroAberto(null)
    setPagina(1)
  }, [empresasSelecionadas])

  useEffect(() => {
    if (!numeroCotacaoFoco) return
    setBusca('')
    setStatusFiltro('todas')
    setFiltrosAtivos({})
    setPainelAtualId('geral')
    setSortCampo('prazo')
    setSortDir('asc')
    // Navega até a página onde a cotação focada aparece (ordenação padrão por prazo)
    const ordenadas = [...cotacoesEscopo].sort((a, b) =>
      a.dataLimiteResposta.localeCompare(b.dataLimiteResposta),
    )
    const pais = agruparLinhasPaiListaSimuladorBidFrete(ordenadas)
    const idx = pais.findIndex((linha) =>
      isBidGrupoSimuladorBidFrete(linha)
        ? linha.cotacoes.some((c) => c.numero === numeroCotacaoFoco)
        : linha.numero === numeroCotacaoFoco,
    )
    const pai = idx >= 0 ? pais[idx] : null
    if (pai && isBidGrupoSimuladorBidFrete(pai)) {
      setExpandidos((prev) => new Set(prev).add(pai.id))
    }
    setPagina(idx >= 0 ? Math.floor(idx / ITENS_POR_PAGINA) + 1 : 1)
    setLinhaFocada(numeroCotacaoFoco)
    onConsumirFoco?.()
    const timer = window.setTimeout(() => {
      corpoRef.current
        ?.querySelector(`[data-numero="${numeroCotacaoFoco}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
    const limparDestaque = window.setTimeout(() => setLinhaFocada(null), 3200)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(limparDestaque)
    }
  }, [numeroCotacaoFoco, onConsumirFoco, cotacoesEscopo])

  // Painel ativo restringe o universo de cotações (visões salvas)
  const cotacoesPainel = useMemo(() => {
    const filtroPainel = FILTRO_PAINEL_BID[painelAtualId]
    return filtroPainel ? cotacoesEscopo.filter(filtroPainel) : cotacoesEscopo
  }, [cotacoesEscopo, painelAtualId])

  const statusPresentes = useMemo(() => {
    const presentes = new Set(cotacoesPainel.map((c) => c.status))
    return (Object.keys(STATUS_SIMULADOR_BID_FRETE) as StatusCotacaoSimuladorBidFrete[]).filter(
      (status) => presentes.has(status),
    )
  }, [cotacoesPainel])

  const linhasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    let resultado = cotacoesPainel.filter((c) => {
      if (statusFiltro !== 'todas' && c.status !== statusFiltro) return false
      if (!termo) return true
      return [
        c.numero,
        c.origem.cidade,
        c.origem.codigo,
        c.destino.cidade,
        c.destino.codigo,
        c.incoterm,
        c.fornecedorLider ?? '',
        MODAL_SIMULADOR_BID_FRETE[c.modal].rotulo,
      ]
        .join(' ')
        .toLowerCase()
        .includes(termo)
    })
    if (Object.keys(filtrosAtivos).length > 0) {
      resultado = resultado.filter((c) => cotacaoPassaFiltrosColuna(c, filtrosAtivos))
    }
    if (sortCampo && sortDir) {
      const fator = sortDir === 'asc' ? 1 : -1
      resultado = [...resultado].sort((a, b) => {
        const va = valorOrdenacaoCotacao(a, sortCampo)
        const vb = valorOrdenacaoCotacao(b, sortCampo)
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * fator
        return String(va ?? '').localeCompare(String(vb ?? ''), 'pt-BR') * fator
      })
    }
    return resultado
  }, [cotacoesPainel, busca, statusFiltro, filtrosAtivos, sortCampo, sortDir])

  // KPIs — paridade com o topo da Lista real
  const kpis = useMemo(() => {
    let valorFrete = 0
    let propostas = 0
    let saving = 0
    for (const c of linhasFiltradas) {
      if (c.melhorLanceUsd != null) valorFrete += c.melhorLanceUsd
      propostas += c.propostasRecebidas
      const s = savingsCotacaoSimuladorBidFrete(c)
      if (s != null && s > 0) saving += s
    }
    return { total: linhasFiltradas.length, valorFrete, propostas, saving }
  }, [linhasFiltradas])

  // Hierarquia BID (pai) → cotações (filhas): agrupamento após filtros/ordenação
  const linhasPaiFiltradas = useMemo(
    () => agruparLinhasPaiListaSimuladorBidFrete(linhasFiltradas),
    [linhasFiltradas],
  )

  const totalPaginas = Math.max(1, Math.ceil(linhasPaiFiltradas.length / ITENS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const linhasPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
    return linhasPaiFiltradas.slice(inicio, inicio + ITENS_POR_PAGINA)
  }, [linhasPaiFiltradas, paginaAtual])

  const idLinhaPai = (linha: LinhaPaiListaSimuladorBidFrete) => linha.id

  const todosSelecionadosPagina =
    linhasPagina.length > 0 && linhasPagina.every((linha) => selecionados.has(idLinhaPai(linha)))

  function toggleTodos() {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (todosSelecionadosPagina) {
        for (const linha of linhasPagina) next.delete(idLinhaPai(linha))
      } else {
        for (const linha of linhasPagina) next.add(idLinhaPai(linha))
      }
      return next
    })
  }

  function toggleSelecao(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Expandir/Recolher todos (BIDs) ──────────────────────────────────────

  const temExpandido = expandidos.size > 0

  function toggleExpandido(bidId: string) {
    setExpandidos((prev) => {
      const next = new Set(prev)
      if (next.has(bidId)) next.delete(bidId)
      else next.add(bidId)
      return next
    })
  }

  function expandirOuRecolherTodos() {
    if (temExpandido) {
      setExpandidos(new Set())
      return
    }
    const ids = linhasPaiFiltradas
      .filter(isBidGrupoSimuladorBidFrete)
      .map((bid) => bid.id)
    setExpandidos(new Set(ids))
  }

  // ── Ações em lote: Duplicar e Excluir (paridade com o produto real) ─────

  const bidsSelecionados = useMemo(
    () => agruparLinhasPaiListaSimuladorBidFrete(cotacoesEscopo)
      .filter(isBidGrupoSimuladorBidFrete)
      .filter((bid) => selecionados.has(bid.id)),
    [cotacoesEscopo, selecionados],
  )

  /**
   * Cotações alvo das ações em lote: avulsas/filhas selecionadas cujo BID pai
   * NÃO está selecionado inteiro (o BID selecionado já carrega as suas filhas).
   */
  const cotacoesSelecionadasParaAcao = useMemo(() => {
    const bidsNumeros = new Set(bidsSelecionados.map((b) => b.numero))
    return cotacoesEscopo.filter((c) => {
      if (!selecionados.has(c.id)) return false
      if (c.bidNumero && bidsNumeros.has(c.bidNumero)) return false
      return true
    })
  }, [cotacoesEscopo, selecionados, bidsSelecionados])

  const totalSelecionados = bidsSelecionados.length + cotacoesSelecionadasParaAcao.length

  function rotuloSelecaoAcao(acao: string, conector: string): string {
    const nBids = bidsSelecionados.length
    const nCotacoes = cotacoesSelecionadasParaAcao.length
    const labelBid = nBids === 1 ? 'BID' : 'BIDs'
    const labelCotacao = nCotacoes === 1 ? 'cotação' : 'cotações'
    if (nBids > 0 && nCotacoes > 0) return `${acao} · ${nBids} ${labelBid} ${conector} ${nCotacoes} ${labelCotacao}`
    if (nBids > 0) return `${acao} · ${nBids} ${labelBid}`
    if (nCotacoes > 0) return `${acao} · ${nCotacoes} ${labelCotacao}`
    return acao
  }

  function handleDuplicarSelecionados() {
    if (totalSelecionados === 0) return
    try {
      const nBids = bidsSelecionados.length
      const nCotacoes = cotacoesSelecionadasParaAcao.length
      const novas: CotacaoSimuladorBidFrete[] = []
      for (const bid of bidsSelecionados) {
        const novoNumeroBid = `BID-2026-${Math.floor(1000 + Math.random() * 9000)}`
        for (const c of bid.cotacoes) novas.push(duplicarCotacaoSimulador(c, novoNumeroBid))
      }
      for (const c of cotacoesSelecionadasParaAcao) {
        novas.push(duplicarCotacaoSimulador(c, undefined))
      }
      setDuplicadas((atual) => [...novas, ...atual])
      setSelecionados(new Set())
      setPagina(1)
      // Paridade com o toast do produto real (bidfrete.duplicar.toast_sucesso)
      const partes: string[] = []
      if (nBids > 0) partes.push(`${nBids} BID${nBids !== 1 ? 's' : ''}`)
      if (nCotacoes > 0) partes.push(`${nCotacoes} cotaç${nCotacoes !== 1 ? 'ões' : 'ão'}`)
      setToastAcao({
        tipo: 'success',
        mensagem: `Duplicado com sucesso: ${partes.join(' e ')} (em rascunho).`,
      })
    } catch {
      setToastAcao({
        tipo: 'error',
        mensagem: 'Falha ao duplicar. Tente novamente.',
      })
    }
  }

  function abrirModalExcluir() {
    if (totalSelecionados === 0) return
    setModalExcluirAberto(true)
  }

  function handleConfirmarExclusao(
    totais: { bids: number; cotacoes: number },
    idsExcluidos: string[],
  ) {
    try {
      setExcluidosIds((prev) => {
        const next = new Set(prev)
        for (const id of idsExcluidos) next.add(id)
        return next
      })
      setSelecionados(new Set())
      if (totais.bids > 0 || totais.cotacoes > 0) {
        setToastAcao({
          tipo: 'success',
          mensagem: mensagemToastExclusaoSimuladorBidFrete(totais),
        })
      }
    } catch {
      setToastAcao({
        tipo: 'error',
        mensagem: 'Falha ao excluir. Tente novamente.',
      })
    }
  }

  // ── Filtros por coluna ──────────────────────────────────────────────────

  const valoresUnicosPorCampo = useMemo(() => {
    const result: Record<string, string[]> = {}
    for (const col of colunas) {
      if (TIPO_FILTRO_COLUNA_BID[col.id] !== 'enum') continue
      const valores = new Set<string>()
      for (const c of cotacoesPainel) {
        const v = valorCampoCotacao(c, col.id)
        if (v != null && v !== '') valores.add(String(v))
      }
      result[col.id] = [...valores].sort((a, b) => a.localeCompare(b, 'pt-BR'))
    }
    return result
  }, [colunas, cotacoesPainel])

  function onFiltroColuna(campo: string, anchor: HTMLElement) {
    setPopoverFiltroAberto((prev) => (prev === campo ? null : campo))
    const rect = anchor.getBoundingClientRect()
    setPopoverFiltroPos({
      top: rect.bottom + 4,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 292)),
    })
  }

  function handleAplicarFiltro(campo: string, filtro: FiltroAtivo) {
    setFiltrosAtivos((prev) => ({ ...prev, [campo]: filtro }))
    setPagina(1)
    setPopoverFiltroAberto(null)
  }

  function handleLimparFiltro(campo: string) {
    setFiltrosAtivos((prev) => {
      const next = { ...prev }
      delete next[campo]
      return next
    })
    setPagina(1)
    setPopoverFiltroAberto(null)
  }

  function handleOrdenar(campo: string, dir: 'asc' | 'desc') {
    setSortCampo(campo)
    setSortDir(dir)
    setPagina(1)
    setPopoverFiltroAberto(null)
  }

  function limparTodosFiltros() {
    setBusca('')
    setStatusFiltro('todas')
    setFiltrosAtivos({})
    setPagina(1)
  }

  const itensFiltrosConsolidados = useMemo((): ItemFiltroConsolidadoListaSimuladorPedido[] => {
    const itens: ItemFiltroConsolidadoListaSimuladorPedido[] = []
    const termo = busca.trim()
    if (termo) itens.push({ id: 'busca', rotulo: 'Busca', valorResumo: termo })
    if (statusFiltro !== 'todas') {
      itens.push({
        id: 'status-bar',
        rotulo: 'Status',
        valorResumo: STATUS_SIMULADOR_BID_FRETE[statusFiltro].rotulo,
      })
    }
    for (const col of colunas) {
      const filtro = filtrosAtivos[col.id]
      if (!filtro) continue
      itens.push({ id: col.id, rotulo: col.label, valorResumo: rotulofiltro(filtro, 2) })
    }
    return itens
  }, [busca, statusFiltro, colunas, filtrosAtivos])

  const podeLimparFiltros =
    busca.trim().length > 0 || statusFiltro !== 'todas' || Object.keys(filtrosAtivos).length > 0

  // ── Drag-and-drop de colunas ────────────────────────────────────────────

  function handleColunaDragOver(e: DragEvent<HTMLElement>, colunaId: string) {
    e.preventDefault()
    if (!dragColunaId || dragColunaId === colunaId) return
    setDragOverColunaId(colunaId)
    setLadoDropColuna(resolverLadoDropColunaBid(e))
  }

  function handleColunaDrop(e: DragEvent<HTMLElement>, colunaId: string) {
    e.preventDefault()
    if (dragColunaId && dragColunaId !== colunaId) {
      setColunas((prev) => reordenarColunasBid(prev, dragColunaId, colunaId, resolverLadoDropColunaBid(e)))
    }
    setDragColunaId(null)
    setDragOverColunaId(null)
  }

  function classeDropColuna(colunaId: string): string {
    if (dragOverColunaId !== colunaId || !dragColunaId) return ''
    return ladoDropColuna === 'before' ? 'pds-lista-th-col--drop-before' : 'pds-lista-th-col--drop-after'
  }

  // ── Células ─────────────────────────────────────────────────────────────

  function renderCelula(colunaId: string, c: CotacaoSimuladorBidFrete): JSX.Element | string {
    switch (colunaId) {
      case 'numero':
        return (
          <span className="bfs-lista-numero-wrap">
            <span className="bfs-lista-numero">{c.numero}</span>
            {onAbrirPainelCotacao ? (
              <TooltipGlobal descricao="Abrir cotação" posicaoPreferida="abaixo">
                <button
                  type="button"
                  className="bfs-lista-link-detalhe"
                  onClick={() => onAbrirPainelCotacao(c)}
                  aria-label={`Abrir cotação ${c.numero}`}
                >
                  <ArrowSquareOut size={14} weight="bold" aria-hidden />
                </button>
              </TooltipGlobal>
            ) : null}
          </span>
        )
      case 'status': {
        const meta = STATUS_SIMULADOR_BID_FRETE[c.status]
        return (
          <span className="bfs-lista-pill" style={{ '--pill-cor': meta.cor } as CSSProperties}>
            {meta.rotulo}
          </span>
        )
      }
      case 'operacao':
        return OPERACAO_SIMULADOR_BID_FRETE[c.operacao]
      case 'modal': {
        const meta = MODAL_SIMULADOR_BID_FRETE[c.modal]
        return (
          <span className="bfs-lista-modal" style={{ color: meta.cor }}>
            {ICONE_MODAL[c.modal]}
            {meta.rotulo}
          </span>
        )
      }
      case 'origem':
        return (
          <span className="bfs-lista-porto">
            <span aria-hidden>{c.origem.flag}</span> {c.origem.cidade}
            <small>{c.origem.codigo}</small>
          </span>
        )
      case 'destino':
        return (
          <span className="bfs-lista-porto">
            <span aria-hidden>{c.destino.flag}</span> {c.destino.cidade}
            <small>{c.destino.codigo}</small>
          </span>
        )
      case 'incoterm':
        return c.incoterm
      case 'carga':
        return (
          <span className="bfs-lista-carga">
            <strong>{c.modalidade}</strong>
            <small>{c.equipamento}</small>
          </span>
        )
      case 'propostas':
        return (
          <TooltipGlobal
            descricao={`${c.propostasRecebidas} propostas recebidas de ${c.fornecedoresConvidados} fornecedores convidados`}
          >
            <span className="bfs-lista-propostas">
              {c.propostasRecebidas}/{c.fornecedoresConvidados}
            </span>
          </TooltipGlobal>
        )
      case 'meta':
        return formatarUsdSimuladorBidFrete(c.valorMetaUsd)
      case 'lance':
        return c.melhorLanceUsd != null ? (
          <TooltipGlobal
            descricao={
              c.fornecedorLider
                ? `Lance líder da ${c.fornecedorLider}${c.transitTimeDias != null ? ` · trânsito ${c.transitTimeDias} dias` : ''}`
                : 'Melhor lance recebido'
            }
          >
            <span className="bfs-lista-lance">{formatarUsdSimuladorBidFrete(c.melhorLanceUsd)}</span>
          </TooltipGlobal>
        ) : (
          <span className="bfs-lista-vazio">—</span>
        )
      case 'savings': {
        const savings = savingsCotacaoSimuladorBidFrete(c)
        return savings != null ? (
          <span
            className="bfs-lista-savings"
            style={{ color: savings >= 0 ? '#34d399' : '#f87171' }}
          >
            {savings >= 0 ? (
              <UploadSimple size={11} weight="bold" style={{ transform: 'rotate(180deg)' }} />
            ) : (
              <UploadSimple size={11} weight="bold" />
            )}
            {formatarUsdSimuladorBidFrete(Math.abs(savings))}
          </span>
        ) : (
          <span className="bfs-lista-vazio">—</span>
        )
      }
      case 'prazo':
        return formatarDataCurtaSimuladorBidFrete(c.dataLimiteResposta)
      default:
        return ''
    }
  }

  // ── Células da linha de BID (agregado das cotações filhas) ──────────────

  function renderCelulaBid(colunaId: string, bid: BidGrupoSimuladorBidFrete): JSX.Element | string {
    const cotacoes = bid.cotacoes
    const unicos = (vals: string[]): string | null => {
      const set = new Set(vals)
      return set.size === 1 ? vals[0] : null
    }
    switch (colunaId) {
      case 'numero': {
        const aberto = expandidos.has(bid.id)
        return (
          <span className="bfs-lista-numero-wrap">
            <TooltipGlobal
              descricao={aberto ? 'Recolher cotações do BID' : 'Expandir cotações do BID'}
              posicaoPreferida="abaixo"
            >
              <button
                type="button"
                className="bfs-lista-caret-bid"
                onClick={() => toggleExpandido(bid.id)}
                aria-expanded={aberto}
                aria-label={aberto ? `Recolher ${bid.numero}` : `Expandir ${bid.numero}`}
              >
                {aberto ? <CaretDown size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
              </button>
            </TooltipGlobal>
            <span className="bfs-lista-numero-bid-grupo">
              <span className="bfs-lista-numero">{bid.numero}</span>
              <small>{bid.quantidadeCotacoes} cotações</small>
            </span>
            {onAbrirPainelCotacao && cotacoes[0] ? (
              <TooltipGlobal descricao="Abrir primeira cotação do BID" posicaoPreferida="abaixo">
                <button
                  type="button"
                  className="bfs-lista-link-detalhe"
                  onClick={() => onAbrirPainelCotacao(cotacoes[0])}
                  aria-label={`Abrir cotação ${cotacoes[0].numero} do ${bid.numero}`}
                >
                  <ArrowSquareOut size={14} weight="bold" aria-hidden />
                </button>
              </TooltipGlobal>
            ) : null}
          </span>
        )
      }
      case 'status': {
        const maisAvancado = cotacoes.reduce((melhor, c) =>
          STATUS_SIMULADOR_BID_FRETE[c.status].ordem > STATUS_SIMULADOR_BID_FRETE[melhor.status].ordem
            ? c
            : melhor,
        )
        const meta = STATUS_SIMULADOR_BID_FRETE[maisAvancado.status]
        return (
          <span className="bfs-lista-pill" style={{ '--pill-cor': meta.cor } as CSSProperties}>
            {meta.rotulo}
          </span>
        )
      }
      case 'operacao': {
        const op = unicos(cotacoes.map((c) => c.operacao))
        return op ? OPERACAO_SIMULADOR_BID_FRETE[op as CotacaoSimuladorBidFrete['operacao']] : '—'
      }
      case 'modal': {
        const modal = unicos(cotacoes.map((c) => c.modal)) as ModalSimuladorBidFrete | null
        if (!modal) return <span className="bfs-lista-vazio">Vários</span>
        const meta = MODAL_SIMULADOR_BID_FRETE[modal]
        return (
          <span className="bfs-lista-modal" style={{ color: meta.cor }}>
            {ICONE_MODAL[modal]}
            {meta.rotulo}
          </span>
        )
      }
      case 'origem': {
        const codigo = unicos(cotacoes.map((c) => c.origem.codigo))
        if (!codigo) return <span className="bfs-lista-vazio">{new Set(cotacoes.map((c) => c.origem.codigo)).size} origens</span>
        const porto = cotacoes[0].origem
        return (
          <span className="bfs-lista-porto">
            <span aria-hidden>{porto.flag}</span> {porto.cidade}
            <small>{porto.codigo}</small>
          </span>
        )
      }
      case 'destino': {
        const codigo = unicos(cotacoes.map((c) => c.destino.codigo))
        if (!codigo) return <span className="bfs-lista-vazio">{new Set(cotacoes.map((c) => c.destino.codigo)).size} destinos</span>
        const porto = cotacoes[0].destino
        return (
          <span className="bfs-lista-porto">
            <span aria-hidden>{porto.flag}</span> {porto.cidade}
            <small>{porto.codigo}</small>
          </span>
        )
      }
      case 'incoterm':
        return unicos(cotacoes.map((c) => c.incoterm)) ?? '—'
      case 'carga':
        return (
          <span className="bfs-lista-carga">
            <strong>{bid.quantidadeCotacoes} cotações</strong>
            <small>Expanda para editar cada uma</small>
          </span>
        )
      case 'propostas': {
        const recebidas = cotacoes.reduce((s, c) => s + c.propostasRecebidas, 0)
        const convidados = cotacoes.reduce((s, c) => s + c.fornecedoresConvidados, 0)
        return (
          <TooltipGlobal descricao={`${recebidas} propostas recebidas de ${convidados} convites nas cotações do BID`}>
            <span className="bfs-lista-propostas">{recebidas}/{convidados}</span>
          </TooltipGlobal>
        )
      }
      case 'meta':
        return formatarUsdSimuladorBidFrete(cotacoes.reduce((s, c) => s + c.valorMetaUsd, 0))
      case 'lance': {
        const soma = cotacoes.reduce((s, c) => s + (c.melhorLanceUsd ?? 0), 0)
        return soma > 0
          ? formatarUsdSimuladorBidFrete(soma)
          : <span className="bfs-lista-vazio">—</span>
      }
      case 'savings': {
        const soma = cotacoes.reduce((s, c) => s + (savingsCotacaoSimuladorBidFrete(c) ?? 0), 0)
        if (soma === 0) return <span className="bfs-lista-vazio">—</span>
        return (
          <span className="bfs-lista-savings" style={{ color: soma >= 0 ? '#34d399' : '#f87171' }}>
            <UploadSimple
              size={11}
              weight="bold"
              style={soma >= 0 ? { transform: 'rotate(180deg)' } : undefined}
            />
            {formatarUsdSimuladorBidFrete(Math.abs(soma))}
          </span>
        )
      }
      case 'prazo': {
        const menor = cotacoes.reduce((min, c) =>
          c.dataLimiteResposta < min ? c.dataLimiteResposta : min, cotacoes[0].dataLimiteResposta)
        return formatarDataCurtaSimuladorBidFrete(menor)
      }
      default:
        return ''
    }
  }

  const filtrosAtivosKeys = useMemo(() => new Set(Object.keys(filtrosAtivos)), [filtrosAtivos])

  return (
    <div className="pds-lista bfs-lista">
      {/* KPIs — paridade com a Lista real */}
      <div className="lp-stats-row">
        <div className="lp-cards">
          <CardBasicoGlobal
            titulo="Total de Cotações"
            icone={<ListNumbers weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
            valor={kpis.total}
            subtexto="Total acumulado"
          />
          <CardBasicoGlobal
            titulo="Valor Total do Frete"
            icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={formatarUsdSimuladorBidFrete(kpis.valorFrete)}
            subtexto="Valor acumulado das propostas líderes"
          />
          <CardBasicoGlobal
            titulo="Propostas Recebidas"
            icone={<Envelope weight="duotone" size={16} style={{ color: '#c084fc' }} />}
            valor={kpis.propostas}
            subtexto="Quantidade total de respostas recebidas"
          />
          <CardBasicoGlobal
            titulo="Saving Total"
            icone={<PiggyBank weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
            valor={formatarUsdSimuladorBidFrete(kpis.saving)}
            subtexto="Economia acumulada"
          />
        </div>
      </div>

      <div className="pds-lista-chrome">
        <div className="pds-lista-faixa">
          <FaixaPaineisListaSimuladorPedido
            paineis={paineis}
            painelAtualId={painelAtualId}
            onPaineisChange={setPaineis}
            onPainelAtualIdChange={(id) => {
              setPainelAtualId(id)
              setPagina(1)
            }}
          />

          <div className="pds-lista-status-bar">
            <span className="pds-lista-status-label">Status</span>
            <div className="pds-lista-status-pills">
              <button
                type="button"
                className={`pds-lista-status-chip ${statusFiltro === 'todas' ? 'pds-lista-status-chip--ativo' : ''}`}
                style={estiloChipStatusBid('todas', '#94a3b8', statusFiltro === 'todas')}
                onClick={() => { setStatusFiltro('todas'); setPagina(1) }}
              >
                Todas as cotações
              </button>
              {statusPresentes.map((status) => {
                const meta = STATUS_SIMULADOR_BID_FRETE[status]
                return (
                  <button
                    key={status}
                    type="button"
                    className={`pds-lista-status-chip ${statusFiltro === status ? 'pds-lista-status-chip--ativo' : ''}`}
                    style={estiloChipStatusBid(status, meta.cor, statusFiltro === status)}
                    onClick={() => {
                      setStatusFiltro((atual) => (atual === status ? 'todas' : status))
                      setPagina(1)
                    }}
                  >
                    <span className="pds-lista-status-dot" style={{ background: meta.cor }} />
                    {meta.rotulo}
                  </button>
                )
              })}
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
                placeholder="Buscar"
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPagina(1) }}
                aria-label="Buscar cotações"
              />
            </div>
            <TooltipGlobal
              descricao={temExpandido ? 'Recolher todas as linhas' : 'Expandir todas as linhas'}
              posicaoPreferida="abaixo"
            >
              <button
                type="button"
                className="bfs-lista-btn-expandir-todos"
                onClick={expandirOuRecolherTodos}
                aria-label={temExpandido ? 'Recolher todas as linhas' : 'Expandir todas as linhas'}
              >
                {temExpandido
                  ? <CaretDoubleUp size={14} weight="bold" />
                  : <CaretDoubleDown size={14} weight="bold" />}
              </button>
            </TooltipGlobal>
            {onAbrirNovaCotacaoManual ? (
              <DropdownNovoSimuladorBidFrete
                onAbrirNovaCotacaoManual={onAbrirNovaCotacaoManual}
                onCriarPainelLista={(nome) => {
                  const id = `painel-${Date.now()}`
                  setPaineis((atuais) => [...atuais, { id, nome, ordem: atuais.length }])
                  setPainelAtualId(id)
                  setPagina(1)
                  return true
                }}
              />
            ) : (
              <TooltipGlobal
                titulo="Nova Cotação"
                descricao="Cria um BID e dispara aos fornecedores por e-mail, WhatsApp e portal — recurso do tenant completo"
                posicaoPreferida="abaixo"
              >
                <span className="pds-shell-acao-demo-wrap">
                  <button type="button" className="bfs-lista-btn-primario" disabled>
                    <Plus size={13} weight="bold" />
                    Nova Cotação
                  </button>
                </span>
              </TooltipGlobal>
            )}
            <TooltipGlobal
              titulo={rotuloSelecaoAcao('Duplicar', '+')}
              descricao="Duplicar BID ou cotação selecionados (cópia nasce em rascunho)"
              posicaoPreferida="abaixo"
            >
              <button
                type="button"
                className="bfs-lista-btn-acao-lote"
                disabled={totalSelecionados === 0}
                onClick={handleDuplicarSelecionados}
                aria-label="Duplicar selecionados"
              >
                <StackPlus size={14} weight="duotone" />
              </button>
            </TooltipGlobal>
            <TooltipGlobal
              titulo={rotuloSelecaoAcao('Excluir', 'e')}
              descricao="Excluir BID ou cotação selecionados (rascunho ou nunca enviados)"
              posicaoPreferida="abaixo"
            >
              <button
                type="button"
                className="bfs-lista-btn-acao-lote bfs-lista-btn-acao-lote--perigo"
                disabled={totalSelecionados === 0}
                onClick={abrirModalExcluir}
                aria-label="Excluir selecionados"
              >
                <Trash size={14} weight="duotone" />
              </button>
            </TooltipGlobal>
            {itensFiltrosConsolidados.length > 0 ? (
              <FiltrosConsolidadosListaSimuladorPedido
                itens={itensFiltrosConsolidados}
                onLimparTodos={limparTodosFiltros}
                podeLimparTodos={podeLimparFiltros}
              />
            ) : null}
          </div>
          <div className="bfs-lista-toolbar__acoes">
            <TooltipGlobal
              titulo="Exportar"
              descricao="Exporta as cotações filtradas em XLSX — recurso do tenant completo"
              posicaoPreferida="abaixo"
            >
              <span className="pds-shell-acao-demo-wrap">
                <button type="button" className="bfs-lista-btn-secundario" disabled>
                  <DownloadSimple size={13} weight="bold" />
                  Exportar
                </button>
              </span>
            </TooltipGlobal>
          </div>
        </div>

        <div className="bfs-lista-tabela-wrap">
          <table className="bfs-lista-tabela">
            <thead>
              <tr>
                <th className="bfs-lista-th-check">
                  <input
                    type="checkbox"
                    className="gtv-checkbox"
                    checked={todosSelecionadosPagina}
                    onChange={toggleTodos}
                    aria-label="Selecionar todos"
                  />
                </th>
                {colunas.map((col) => {
                  const arrastando = dragColunaId === col.id
                  const filtroAtivo = filtrosAtivosKeys.has(col.id)
                  return (
                    <th
                      key={col.id}
                      title={col.label}
                      draggable
                      data-pds-coluna-id={col.id}
                      className={[
                        'pds-lista-th-col',
                        classeCelulaColunaLista(col) ?? '',
                        arrastando ? 'pds-lista-th-col--arrastando' : '',
                        classeDropColuna(col.id),
                      ].filter(Boolean).join(' ')}
                      style={{ opacity: arrastando ? 0.45 : undefined }}
                      onDragStart={() => setDragColunaId(col.id)}
                      onDragOver={(e) => handleColunaDragOver(e, col.id)}
                      onDrop={(e) => handleColunaDrop(e, col.id)}
                      onDragEnd={() => { setDragColunaId(null); setDragOverColunaId(null) }}
                    >
                      <span className="pds-lista-th-col-label">{col.label}</span>
                      <button
                        type="button"
                        className={`gtv-filtro-btn${filtroAtivo ? ' gtv-filtro-btn--ativo' : ''}`}
                        aria-label={`Filtrar por ${col.label}`}
                        title={`Filtrar por ${col.label}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onFiltroColuna(col.id, e.currentTarget)
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                          <path d="M0 1.5A.5.5 0 0 1 .5 1h9a.5.5 0 0 1 .354.854L6 5.707V9a.5.5 0 0 1-.724.447l-2-1A.5.5 0 0 1 3 8V5.707L.146 1.854A.5.5 0 0 1 0 1.5z" />
                        </svg>
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody ref={corpoRef}>
              {linhasPagina.map((linha) => {
                if (isBidGrupoSimuladorBidFrete(linha)) {
                  const bid = linha
                  const aberto = expandidos.has(bid.id)
                  return (
                    <Fragment key={bid.id}>
                      <tr
                        className={[
                          'bfs-lista-linha-bid',
                          selecionados.has(bid.id) ? 'bfs-lista-linha--sel' : '',
                        ].filter(Boolean).join(' ')}
                      >
                        <td className="bfs-lista-td-check">
                          <input
                            type="checkbox"
                            className="gtv-checkbox"
                            checked={selecionados.has(bid.id)}
                            onChange={() => toggleSelecao(bid.id)}
                            aria-label={`Selecionar ${bid.numero}`}
                          />
                        </td>
                        {colunas.map((col) => (
                          <td key={col.id} data-pds-coluna-id={col.id} className={classeCelulaColunaLista(col)}>
                            {renderCelulaBid(col.id, bid)}
                          </td>
                        ))}
                      </tr>
                      {aberto && bid.cotacoes.map((c) => (
                        <tr
                          key={c.id}
                          data-numero={c.numero}
                          className={[
                            'bfs-lista-linha-filha',
                            onAbrirPainelCotacao ? 'bfs-lista-linha--clicavel' : '',
                            selecionados.has(c.id) ? 'bfs-lista-linha--sel' : '',
                            linhaFocada === c.numero ? 'bfs-lista-linha--focada' : '',
                          ].filter(Boolean).join(' ')}
                          onClick={(ev) => abrirCotacaoPelaLinha(c, ev)}
                        >
                          <td className="bfs-lista-td-check">
                            <input
                              type="checkbox"
                              className="gtv-checkbox"
                              checked={selecionados.has(c.id)}
                              onChange={() => toggleSelecao(c.id)}
                              aria-label={`Selecionar ${c.numero}`}
                            />
                          </td>
                          {colunas.map((col) => (
                            <td key={col.id} data-pds-coluna-id={col.id} className={classeCelulaColunaLista(col)}>
                              {renderCelula(col.id, c)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  )
                }
                const c = linha
                return (
                  <tr
                    key={c.id}
                    data-numero={c.numero}
                    className={[
                      onAbrirPainelCotacao ? 'bfs-lista-linha--clicavel' : '',
                      selecionados.has(c.id) ? 'bfs-lista-linha--sel' : '',
                      linhaFocada === c.numero ? 'bfs-lista-linha--focada' : '',
                    ].filter(Boolean).join(' ') || undefined}
                    onClick={(ev) => abrirCotacaoPelaLinha(c, ev)}
                  >
                    <td className="bfs-lista-td-check">
                      <input
                        type="checkbox"
                        className="gtv-checkbox"
                        checked={selecionados.has(c.id)}
                        onChange={() => toggleSelecao(c.id)}
                        aria-label={`Selecionar ${c.numero}`}
                      />
                    </td>
                    {colunas.map((col) => (
                      <td key={col.id} data-pds-coluna-id={col.id} className={classeCelulaColunaLista(col)}>
                        {renderCelula(col.id, c)}
                      </td>
                    ))}
                  </tr>
                )
              })}
              {linhasPagina.length === 0 ? (
                <tr>
                  <td colSpan={colunas.length + 1} className="bfs-lista-vazia">
                    Nenhuma cotação encontrada para o filtro atual.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <footer className="pds-lista-footer gtv-paginacao" role="navigation" aria-label="Paginação">
          <span className="gtv-paginacao-info">
            {linhasFiltradas.length} cotações · página {paginaAtual} de {totalPaginas}
            {selecionados.size > 0 ? ` · ${selecionados.size} selecionadas` : ''}
          </span>
          {totalPaginas > 1 && (
            <div className="gtv-paginacao-controles">
              <button
                type="button"
                className="gtv-pag-btn"
                disabled={paginaAtual <= 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                aria-label="Página anterior"
              >
                ‹
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`gtv-pag-btn${n === paginaAtual ? ' gtv-pag-btn--ativo' : ''}`}
                  onClick={() => setPagina(n)}
                  aria-current={n === paginaAtual ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="gtv-pag-btn"
                disabled={paginaAtual >= totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                aria-label="Próxima página"
              >
                ›
              </button>
            </div>
          )}
        </footer>
      </div>

      {popoverFiltroAberto && typeof document !== 'undefined' && (() => {
        const col = colunas.find((c) => c.id === popoverFiltroAberto)
        if (!col) return null
        return createPortal(
          <FiltroPopoverColuna
            campo={col.id}
            label={col.label}
            tipo={TIPO_FILTRO_COLUNA_BID[col.id] ?? 'texto'}
            filtroAtual={filtrosAtivos[col.id]}
            valoresUnicos={valoresUnicosPorCampo[col.id] ?? []}
            onAplicar={handleAplicarFiltro}
            onLimpar={handleLimparFiltro}
            onOrdenar={handleOrdenar}
            onFechar={() => setPopoverFiltroAberto(null)}
            anchorPos={popoverFiltroPos}
          />,
          document.body,
        )
      })()}

      <ModalExcluirListaSimuladorBidFrete
        aberto={modalExcluirAberto}
        bids={bidsSelecionados}
        cotacoes={cotacoesSelecionadasParaAcao}
        onFechar={() => setModalExcluirAberto(false)}
        onConfirmar={handleConfirmarExclusao}
      />

      {toastAcao && createPortal(
        <div className="bfs-toast-container" role="region" aria-label="Notificações" aria-live="polite">
          <div
            className={`bfs-toast bfs-toast--${toastAcao.tipo}`}
            role="alert"
            aria-label={toastAcao.mensagem}
          >
            <span
              className={`bfs-toast__icon bfs-toast__icon--${toastAcao.tipo}`}
              aria-hidden
            >
              {toastAcao.tipo === 'success'
                ? <CheckCircle weight="fill" size={18} />
                : <XCircle weight="fill" size={18} />}
            </span>
            <p className="bfs-toast__message">{toastAcao.mensagem}</p>
            <button
              type="button"
              className="bfs-toast__close"
              onClick={() => setToastAcao(null)}
              aria-label="Fechar notificação"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
