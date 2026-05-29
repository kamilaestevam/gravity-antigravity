/**
 * Cotacoes.tsx — Lista + Kanban de Cotações (T2/T3)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Migrado para TabelaVirtualGlobal para suportar ordenação manual,
 * persistência de colunas, edição inline e precisão numérica reativa.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef, type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'

import CotacoesKanban from './kanban-bid-frete-internacional'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type { GTPreferencias, GTColuna } from '@nucleo/tabela-virtual-global'
import {
  FileText,
  Truck,
  Eye,
  ListBullets,
  Kanban,
  Upload,
  ArrowCounterClockwise,
  Warning,
  Package,
  Plus,
  CaretDown,
  Clock,
  Coins,
  DownloadSimple,
  CurrencyDollar,
  ClipboardText,
  Gauge,
} from '@phosphor-icons/react'

import { getBidsFreteInternacional, getCotacoes, listarUsuariosOrganizacao } from '../shared/api'
import type { BidFreteInternacional, Cotacao, StatusCotacao } from '../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, MODALIDADE_LABELS } from '../shared/types'
import {
  calcularMetricaCardCustom,
  formatarValorCardCustom,
} from '../shared/lista-bid-frete-card-custom'
import { COTACOES_LIMIT_LISTA, filtrarCotacoesPorPeriodoCards } from '../shared/lista-bid-frete-card-periodo'
import { calcularStatsListaBidFrete } from '../shared/lista-bid-frete-kpi-metrics'
import {
  carregarTabelaConfigBidFrete,
  HORAS_LIMITE_DESTAQUE_EXPIRACAO,
  SYNC_EVENT_TABELA_BID_FRETE,
} from '../shared/tabela-config-bid-frete'
import { SYNC_EVENT_CASAS_BID_FRETE } from '../shared/casas-config-bid-frete'
import { SYNC_EVENT_FORMATO_DATA_BID_FRETE } from '../shared/formato-data-bid-frete'
import { listarCardsCatalogo, useCardPreferencesBidFrete } from '../shared/use-card-preferences'
import {
  buildColunasPaiLista,
  buildColunasCotacoes,
  buildMapaColunasFilho,
  CHAVES_COLUNAS_COTACAO,
  CHAVES_COLUNAS_PADRAO_VISIVEIS,
  type OpcoesColunasLista,
  formatValorExportColuna,
  fmtData,
  fmtQuantidade,
  RenderBadgeStatus,
  RenderModalIcon,
} from './colunas-lista-bid-frete-internacional'
import {
  montarLinhasPaiLista,
  idLinhaPaiLista,
  idLinhaFilhaLista,
  isLinhaBidGrupo,
  isLinhaProposta,
  cotacaoDaLinhaPai,
  propostasFilhasDaCotacaoAvulsa,
  cotacaoPrestesAExpirar,
  linhaPaiPrestesAExpirar,
  type LinhaPaiLista,
  type LinhaFilhaLista,
} from './lista-bid-frete-internacional-utils'

// ─── Status Config (localStorage) ───

interface StatusConfig {
  id: string
  nome: string
  rotulo: string
  cor: string
  ordem: number
  is_sistema: boolean
}

const STATUS_CONFIG_KEY = 'bid-frete:config:status'

/** 9 status canônicos como fallback quando localStorage está vazio */
const STATUS_CANONICOS: StatusConfig[] = [
  { id: 'rascunho', nome: 'RASCUNHO', rotulo: 'Rascunho', cor: '#94a3b8', ordem: 1, is_sistema: true },
  { id: 'enviada_fornecedores', nome: 'ENVIADA_FORNECEDORES', rotulo: 'Enviada ao fornecedor', cor: '#60a5fa', ordem: 2, is_sistema: true },
  { id: 'em_cotacao', nome: 'EM_COTACAO', rotulo: 'Em cotação', cor: '#fbbf24', ordem: 3, is_sistema: true },
  { id: 'aguardando_aprovacao', nome: 'AGUARDANDO_APROVACAO', rotulo: 'Aprovação pendente', cor: '#818cf8', ordem: 4, is_sistema: true },
  { id: 'aprovada', nome: 'APROVADA', rotulo: 'Aprovada', cor: '#10b981', ordem: 5, is_sistema: false },
  { id: 'reprovada', nome: 'REPROVADA', rotulo: 'Reprovada', cor: '#ef4444', ordem: 6, is_sistema: false },
  { id: 'cancelada', nome: 'CANCELADA', rotulo: 'Cancelada', cor: '#6b7280', ordem: 7, is_sistema: false },
  { id: 'falta_informacao', nome: 'FALTA_INFORMACAO', rotulo: 'Falta de informação', cor: '#fb7185', ordem: 8, is_sistema: false },
  { id: 'expirada', nome: 'EXPIRADA', rotulo: 'Expirada', cor: '#d1d5db', ordem: 9, is_sistema: false },
]

/** Lê status do localStorage (sincronizado pelo Configurações) */
function lerStatusConfig(): StatusConfig[] {
  try {
    const raw = localStorage.getItem(STATUS_CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* storage indisponível */ }
  return STATUS_CANONICOS
}

/** Gera abas dinâmicas a partir da lista de status config */
function gerarAbasDinamicas(statusList: StatusConfig[]): Array<{ valor: string; label: string }> {
  const abas: Array<{ valor: string; label: string }> = [
    { valor: 'TODAS', label: 'Todas as cotações' },
  ]
  for (const s of statusList) {
    abas.push({ valor: s.nome, label: s.rotulo })
  }
  return abas
}

// ─── Campos Editáveis Inline ───

const CAMPOS_EDITAVEIS = [
  'referencia_interna_cotacao_bid_frete_internacional',
  'data_limite_resposta_cotacao_bid_frete_internacional',
  'origem_nome_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
  'modal_cotacao_bid_frete_internacional',
  'modalidade_cotacao_bid_frete_internacional',
  'peso_kg_cotacao_bid_frete_internacional',
  'cubagem_m3_cotacao_bid_frete_internacional',
  'quantidade_cotacao_bid_frete_internacional',
  'incoterm_cotacao_bid_frete_internacional',
  'valor_meta_cotacao_bid_frete_internacional',
]

// ─── Colunas padrão = todas as colunas escalares do banco ───

/** Incrementar quando adicionar colunas ao schema — força reset das prefs salvas. */
const VERSAO_COLUNAS_LISTA = 3
const STORAGE_COLUNAS_VERSAO = 'bid-frete-internacional:config:tabela_colunas_versao'
const STORAGE_PREFS_INTL = 'bid-frete-internacional:config:tabela_preferencias'
const STORAGE_PREFS_LEGADO = 'bid-frete:config:tabela_preferencias'

const COLUNAS_PADRAO_VISIVEIS = CHAVES_COLUNAS_PADRAO_VISIVEIS

function migrarPreferenciasColunasSeNecessario(): void {
  try {
    const versaoSalva = Number(localStorage.getItem(STORAGE_COLUNAS_VERSAO) ?? '1')
    if (versaoSalva >= VERSAO_COLUNAS_LISTA) return
    localStorage.removeItem(STORAGE_PREFS_INTL)
    localStorage.removeItem(STORAGE_PREFS_LEGADO)
    localStorage.setItem(STORAGE_COLUNAS_VERSAO, String(VERSAO_COLUNAS_LISTA))
  } catch { /* storage indisponível */ }
}

function lerPreferenciasTabela(): GTPreferencias | undefined {
  migrarPreferenciasColunasSeNecessario()
  try {
    let raw = localStorage.getItem(STORAGE_PREFS_INTL)
    if (!raw) {
      raw = localStorage.getItem(STORAGE_PREFS_LEGADO)
    }
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as GTPreferencias
    if (!parsed || !Array.isArray(parsed.colunas_visiveis)) {
      return undefined
    }

    const colunasValidas = parsed.colunas_visiveis
      .filter(k => CHAVES_COLUNAS_COTACAO.includes(k))
      .filter(k => k !== 'id_cotacao_bid_frete_internacional')
    const faltantes = CHAVES_COLUNAS_PADRAO_VISIVEIS.filter(k => !colunasValidas.includes(k))

    const hasIntlCore = colunasValidas.includes('numero_cotacao_bid_frete_internacional')
    if (!hasIntlCore || colunasValidas.length < 3) {
      return undefined
    }

    // Novas colunas do banco entram automaticamente ao final da lista visível
    const colunasVisiveis = faltantes.length > 0
      ? [...colunasValidas, ...faltantes]
      : colunasValidas

    return {
      ...parsed,
      colunas_visiveis: colunasVisiveis,
    }
  } catch {
    return undefined
  }
}

export default function Cotacoes() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const addNotification = useShellStore(s => s.addNotification)
  const { getToken } = useAuth()
  const currentUser = useShellStore(s => s.currentUser)
  const workspacesStore = useShellStore(s => s.workspaces)
  const organizacoesStore = useShellStore(s => s.organizacoes)
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)

  useEffect(() => {
    if (currentUser.id) {
      sessionStorage.setItem('gravity_id_usuario', currentUser.id)
    }
  }, [currentUser.id])

  const [usuariosOrganizacao, setUsuariosOrganizacao] = useState<Array<{ id_usuario: string; nome_usuario: string }>>([])

  useEffect(() => {
    let cancelado = false
    listarUsuariosOrganizacao(getToken)
      .then((lista) => { if (!cancelado) setUsuariosOrganizacao(lista) })
      .catch(() => { if (!cancelado) setUsuariosOrganizacao([]) })
    return () => { cancelado = true }
  }, [getToken])

  const organizacoesMap = useMemo(() => {
    const mapa = new Map<string, string>()
    if (currentUser.idOrganizacao && currentUser.nomeOrganizacao) {
      mapa.set(currentUser.idOrganizacao, currentUser.nomeOrganizacao)
    }
    for (const org of organizacoesStore) {
      mapa.set(org.id_organizacao, org.nome_organizacao)
    }
    return mapa
  }, [currentUser.idOrganizacao, currentUser.nomeOrganizacao, organizacoesStore])

  const workspacesMap = useMemo(() => {
    const mapa = new Map<string, { nome: string }>()
    for (const ws of workspacesStore) {
      mapa.set(ws.id, { nome: ws.nome_workspace })
    }
    return mapa
  }, [workspacesStore])

  const usuariosMap = useMemo(() => {
    const mapa = new Map<string, string>()
    for (const u of usuariosOrganizacao) {
      mapa.set(u.id_usuario, u.nome_usuario)
    }
    if (currentUser.id && currentUser.name) {
      mapa.set(currentUser.id, currentUser.name)
    }
    return mapa
  }, [usuariosOrganizacao, currentUser.id, currentUser.name])

  const nomeWorkspaceAtivo = useMemo(() => {
    if (!idWorkspaceAtivo) return undefined
    return workspacesMap.get(idWorkspaceAtivo)?.nome
  }, [idWorkspaceAtivo, workspacesMap])

  const opcoesColunasLista = useMemo<OpcoesColunasLista>(() => ({
    organizacoesMap,
    workspacesMap,
    usuariosMap,
    idUsuarioAtual: currentUser.id,
    nomeUsuarioAtual: currentUser.name || currentUser.email,
    nomeWorkspaceFallback: nomeWorkspaceAtivo,
  }), [organizacoesMap, workspacesMap, usuariosMap, currentUser.id, currentUser.name, currentUser.email, nomeWorkspaceAtivo])

  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [cotacoesAvulsas, setCotacoesAvulsas] = useState<Cotacao[]>([])
  const [bidsFreteInternacional, setBidsFreteInternacional] = useState<BidFreteInternacional[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const visaoParam = searchParams.get('visao')
  const visao = visaoParam === 'kanban' ? 'kanban' : 'lista'

  const setVisao = (novaVisao: 'lista' | 'kanban') => {
    setSearchParams(
      (prev) => {
        prev.set('visao', novaVisao)
        return prev
      },
      { replace: true }
    )
  }

  useEffect(() => {
    if (!searchParams.has('visao')) {
      setSearchParams(
        (prev) => {
          prev.set('visao', 'lista')
          return prev
        },
        { replace: true }
      )
    }
  }, [searchParams, setSearchParams])

  const [filtroTab, setFiltroTab] = useState('TODAS')

  // ─── Status Config dinâmico (sincronizado com Configurações via localStorage) ───
  const [statusConfig, setStatusConfig] = useState<StatusConfig[]>(lerStatusConfig)

  useEffect(() => {
    const handleStorage = () => setStatusConfig(lerStatusConfig())
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [])

  const abas = useMemo(() => gerarAbasDinamicas(statusConfig), [statusConfig])
  const { visiveis: cardsVisiveis, periodo: periodoCards } = useCardPreferencesBidFrete()

  const [tabelaConfig, setTabelaConfig] = useState(carregarTabelaConfigBidFrete)
  const [paginaLista, setPaginaLista] = useState(1)
  const [casasVersion, setCasasVersion] = useState(0)
  const [formatoDataVersion, setFormatoDataVersion] = useState(0)

  useEffect(() => {
    function syncTabelaConfig() {
      setTabelaConfig(carregarTabelaConfigBidFrete())
    }
    window.addEventListener(SYNC_EVENT_TABELA_BID_FRETE, syncTabelaConfig)
    window.addEventListener('storage', syncTabelaConfig)
    window.addEventListener('focus', syncTabelaConfig)
    return () => {
      window.removeEventListener(SYNC_EVENT_TABELA_BID_FRETE, syncTabelaConfig)
      window.removeEventListener('storage', syncTabelaConfig)
      window.removeEventListener('focus', syncTabelaConfig)
    }
  }, [])

  useEffect(() => {
    const syncCasas = () => setCasasVersion(v => v + 1)
    window.addEventListener(SYNC_EVENT_CASAS_BID_FRETE, syncCasas)
    window.addEventListener('storage', syncCasas)
    return () => {
      window.removeEventListener(SYNC_EVENT_CASAS_BID_FRETE, syncCasas)
      window.removeEventListener('storage', syncCasas)
    }
  }, [])

  useEffect(() => {
    const syncFormato = () => setFormatoDataVersion(v => v + 1)
    window.addEventListener(SYNC_EVENT_FORMATO_DATA_BID_FRETE, syncFormato)
    window.addEventListener('storage', syncFormato)
    return () => {
      window.removeEventListener(SYNC_EVENT_FORMATO_DATA_BID_FRETE, syncFormato)
      window.removeEventListener('storage', syncFormato)
    }
  }, [])

  useEffect(() => {
    setPaginaLista(1)
  }, [tabelaConfig.linhasPorPagina])

  const classNameLinhaPai = useCallback((linha: LinhaPaiLista) => {
    if (!tabelaConfig.destacarAtrasados) return undefined
    return linhaPaiPrestesAExpirar(linha, HORAS_LIMITE_DESTAQUE_EXPIRACAO)
      ? 'gtv-linha--expira-prestes'
      : undefined
  }, [tabelaConfig.destacarAtrasados])

  const classNameLinhaFilho = useCallback((filha: LinhaFilhaLista) => {
    if (isLinhaProposta(filha)) return undefined
    if (!tabelaConfig.destacarAtrasados) return undefined
    return cotacaoPrestesAExpirar(filha, HORAS_LIMITE_DESTAQUE_EXPIRACAO)
      ? 'gtv-linha--expira-prestes'
      : undefined
  }, [tabelaConfig.destacarAtrasados])

  // Carregar dados de cotações
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErroCarregar(null)
    try {
      const [resTodas, resAvulsas, resBids] = await Promise.allSettled([
        getCotacoes({ limit: COTACOES_LIMIT_LISTA }),
        getCotacoes({ limit: COTACOES_LIMIT_LISTA, apenas_avulsas: true }),
        getBidsFreteInternacional(),
      ])

      const erros: string[] = []

      if (resTodas.status === 'fulfilled') {
        setCotacoes(resTodas.value.cotacoes)
      } else {
        setCotacoes([])
        erros.push(resTodas.reason instanceof Error ? resTodas.reason.message : 'Falha ao carregar cotações')
      }

      if (resAvulsas.status === 'fulfilled') {
        setCotacoesAvulsas(resAvulsas.value.cotacoes)
      } else {
        setCotacoesAvulsas([])
        erros.push(resAvulsas.reason instanceof Error ? resAvulsas.reason.message : 'Falha ao carregar cotações avulsas')
      }

      if (resBids.status === 'fulfilled') {
        setBidsFreteInternacional(resBids.value)
      } else {
        setBidsFreteInternacional([])
        erros.push(resBids.reason instanceof Error ? resBids.reason.message : 'Falha ao carregar BIDs (camada 2)')
      }

      setErroCarregar(erros.length > 0 ? erros.join(' · ') : null)
    } catch (e: unknown) {
      setCotacoes([])
      setCotacoesAvulsas([])
      setBidsFreteInternacional([])
      setErroCarregar(e instanceof Error ? e.message : 'Erro ao carregar cotações')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ─── Tabela Virtual: Preferências, Colunas e Edição ───

  const [preferencias, setPreferencias] = useState<GTPreferencias | undefined>(() => lerPreferenciasTabela())

  useEffect(() => {
    const prefs = lerPreferenciasTabela()
    if (prefs) {
      setPreferencias(prefs)
      try {
        localStorage.setItem(STORAGE_PREFS_INTL, JSON.stringify(prefs))
      } catch { /* ignore */ }
    }
  }, [])

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    try {
      localStorage.setItem(STORAGE_COLUNAS_VERSAO, String(VERSAO_COLUNAS_LISTA))
      localStorage.setItem(STORAGE_PREFS_INTL, JSON.stringify(prefs))
    } catch { /* ignore */ }
  }, [])

  const abrirDetalheCotacao = useCallback((item: Cotacao) => {
    navigate(`/produto/bid-frete/cotacoes/${item.id_cotacao_bid_frete_internacional}`)
  }, [navigate])

  const colunasTabela = useMemo(
    () => buildColunasPaiLista(t, opcoesColunasLista, abrirDetalheCotacao),
    [t, opcoesColunasLista, abrirDetalheCotacao, casasVersion, formatoDataVersion],
  )
  const mapaColunasFilho = useMemo(
    () => buildMapaColunasFilho(t, opcoesColunasLista, abrirDetalheCotacao),
    [t, opcoesColunasLista, abrirDetalheCotacao, casasVersion, formatoDataVersion],
  )
  const colunasFilhoExport = useMemo(
    () => buildColunasCotacoes(t, opcoesColunasLista, abrirDetalheCotacao),
    [t, opcoesColunasLista, abrirDetalheCotacao, casasVersion, formatoDataVersion],
  )

  const handleEditar = useCallback(async (id: string, campo: string, valor: unknown) => {
    let updatedCotacao: Cotacao | undefined
    setCotacoes(prev => prev.map(c => {
      if (c.id_cotacao_bid_frete_internacional === id) {
        updatedCotacao = { ...c, [campo as keyof Cotacao]: valor } as Cotacao
        return updatedCotacao
      }
      return c
    }))
    const current = cotacoes.find(c => c.id_cotacao_bid_frete_internacional === id)
    if (!current) throw new Error('Cotação não encontrada')
    const updated = { ...current, [campo as keyof Cotacao]: valor } as Cotacao
    return updated
  }, [cotacoes])

  // ─── Filtragem Reativa (Busca + Abas) ───

  const filtrarCotacaoItem = useCallback((c: Cotacao): boolean => {
    if (filtroTab !== 'TODAS' && c.status_cotacao_bid_frete_internacional !== filtroTab) {
      return false
    }
    if (busca.trim()) {
      const term = busca.toLowerCase()
      return (
        c.numero_cotacao_bid_frete_internacional.toLowerCase().includes(term) ||
        (c.referencia_interna_cotacao_bid_frete_internacional ?? '').toLowerCase().includes(term) ||
        c.origem_nome_cotacao_bid_frete_internacional.toLowerCase().includes(term) ||
        c.destino_nome_cotacao_bid_frete_internacional.toLowerCase().includes(term)
      )
    }
    return true
  }, [filtroTab, busca])

  const cotacoesFiltradas = useMemo(
    () => cotacoes.filter(filtrarCotacaoItem),
    [cotacoes, filtrarCotacaoItem],
  )

  const cotacoesAvulsasFiltradas = useMemo(
    () => cotacoesAvulsas.filter(filtrarCotacaoItem),
    [cotacoesAvulsas, filtrarCotacaoItem],
  )

  const bidsFiltrados = useMemo(() => {
    const term = busca.trim().toLowerCase()
    return bidsFreteInternacional
      .map(bid => {
        const cotacoesFilhas = (bid.cotacoes ?? []).filter(filtrarCotacaoItem)
        if (cotacoesFilhas.length === 0) {
          if (!term) return null
          const matchBid =
            bid.numero_bid_bid_frete_internacional.toLowerCase().includes(term) ||
            (bid.referencia_interna_bid_bid_frete_internacional ?? '').toLowerCase().includes(term)
          if (!matchBid) return null
        }
        return { ...bid, cotacoes: cotacoesFilhas.length > 0 ? cotacoesFilhas : (bid.cotacoes ?? []) }
      })
      .filter((b): b is BidFreteInternacional => b != null)
  }, [bidsFreteInternacional, filtrarCotacaoItem, busca])

  const linhasPaiFiltradas = useMemo(
    () => montarLinhasPaiLista(bidsFiltrados, cotacoesAvulsasFiltradas),
    [bidsFiltrados, cotacoesAvulsasFiltradas],
  )

  const totalCotacoesFiltradas = cotacoesFiltradas.length

  const cotacoesParaKpi = useMemo(
    () => filtrarCotacoesPorPeriodoCards(cotacoesFiltradas, periodoCards),
    [cotacoesFiltradas, periodoCards],
  )

  const handleCarregarFilhos = useCallback(async (pai: LinhaPaiLista): Promise<LinhaFilhaLista[]> => {
    if (isLinhaBidGrupo(pai)) return pai.cotacoes
    return propostasFilhasDaCotacaoAvulsa(pai)
  }, [])

  const handleReordenarCotacoes = useCallback((ids: string[]) => {
    const mapa = new Map(linhasPaiFiltradas.map(l => [idLinhaPaiLista(l), l]))
    const reordenados = ids.map(id => mapa.get(id)).filter((l): l is LinhaPaiLista => l != null)
    const restantes = linhasPaiFiltradas.filter(l => !ids.includes(idLinhaPaiLista(l)))
    const reordenadasCotacoes = [...reordenados, ...restantes].flatMap(l =>
      isLinhaBidGrupo(l) ? l.cotacoes : [l],
    )
    const idsOrdenados = new Set(reordenadasCotacoes.map(c => c.id_cotacao_bid_frete_internacional))
    const resto = cotacoes.filter(c => !idsOrdenados.has(c.id_cotacao_bid_frete_internacional))
    setCotacoes([...reordenadasCotacoes, ...resto])
  }, [cotacoes, linhasPaiFiltradas])

  // ─── Ações de Linha ───

  const acoes = useMemo(() => [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: 'Ver detalhes',
      onClick: (item: LinhaPaiLista) => {
        const cotacao = cotacaoDaLinhaPai(item)
        if (cotacao) abrirDetalheCotacao(cotacao)
      },
      visivel: (item: LinhaPaiLista) => !isLinhaBidGrupo(item),
    },
  ], [abrirDetalheCotacao])

  const acoesFilho = useCallback((item: LinhaFilhaLista) => {
    if (isLinhaProposta(item)) return []
    return [{
      id: 'ver-filho',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: 'Ver detalhes',
      onClick: () => abrirDetalheCotacao(item),
    }]
  }, [abrirDetalheCotacao])

  // ─── Dropdown + Novo e Exportar Toolbar ───

  const novoDropdownRef = useRef<HTMLDivElement>(null)
  const [novoDropdownAberto, setNovoDropdownAberto] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (novoDropdownRef.current && !novoDropdownRef.current.contains(event.target as Node)) {
        setNovoDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const acoesBarra = useMemo(() => (
    <div ref={novoDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <BotaoGlobal
        variante="primario"
        tamanho="pequeno"
        icone={<Plus size={14} weight="bold" />}
        onClick={() => setNovoDropdownAberto(prev => !prev)}
      >
        Novo <CaretDown size={12} weight="bold" style={{ marginLeft: 2, transition: 'transform 0.15s', transform: novoDropdownAberto ? 'rotate(180deg)' : 'none' }} />
      </BotaoGlobal>

      {novoDropdownAberto && (
        <div className="lp-dropdown-menu" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
          minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
        }}>
          <button
            type="button"
            className="lp-dropdown-btn"
            onClick={() => {
              navigate('/produto/bid-frete/cotacoes/nova')
              setNovoDropdownAberto(false)
            }}
          >
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
              <Truck size={16} weight="duotone" />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Buscar Frete</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Criar cotação manual</span>
            </span>
          </button>

          <button
            type="button"
            className="lp-dropdown-btn"
            onClick={() => {
              navigate('/produto/bid-frete/cotacoes/importar')
              setNovoDropdownAberto(false)
            }}
          >
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
              <Upload size={16} weight="duotone" />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Importar de Planilha</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Subir planilha de dados</span>
            </span>
          </button>
        </div>
      )}
    </div>
  ), [novoDropdownAberto, navigate])

  const exportarCSVCotacoes = useCallback((formato: 'excel' | 'csv') => {
    const sep = formato === 'excel' ? ';' : ','
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    
    const colunasExport = colunasFilhoExport.filter(c => {
      if (!c.key) return false
      if (preferencias?.colunas_visiveis) {
        return preferencias.colunas_visiveis.includes(c.key as string)
      }
      return COLUNAS_PADRAO_VISIVEIS.includes(c.key as string)
    })

    const cabecalho = colunasExport.map(c => escape(c.label)).join(sep)
    
    const linhas = cotacoesFiltradas.map(row => {
      return colunasExport.map(c => {
        const key = c.key as string
        const val = row[c.key as keyof Cotacao]

        if (
          key === 'id_organizacao' ||
          key === 'id_usuario' ||
          key === 'id_workspace' ||
          key === 'id_produto_gravity'
        ) {
          return escape(formatValorExportColuna(key, row, opcoesColunasLista))
        }

        if (val == null) return escape('')
        if (
          key === 'data_criacao_cotacao_bid_frete_internacional' ||
          key === 'data_limite_resposta_cotacao_bid_frete_internacional' ||
          key === 'data_atualizacao_cotacao_bid_frete_internacional' ||
          key === 'data_aprovacao_cotacao_bid_frete_internacional' ||
          key === 'data_cancelamento_cotacao_bid_frete_internacional'
        ) {
          return escape(fmtData(val as string))
        }
        if (
          key === 'ganho_valor_cotacao_bid_frete_internacional' ||
          key === 'valor_meta_cotacao_bid_frete_internacional'
        ) {
          return escape(val != null ? String(val) : '')
        }
        return escape(String(val))
      }).join(sep)
    })

    const conteudo = [cabecalho, ...linhas].join('\n')
    const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cotacoes_${formato === 'excel' ? 'excel' : 'csv'}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }, [cotacoesFiltradas, colunasFilhoExport, preferencias, opcoesColunasLista])

  const acoesExportacao = useMemo(() => [
    {
      label: 'Excel (.xlsx)',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarCSVCotacoes('excel'),
    },
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarCSVCotacoes('csv'),
    },
  ], [exportarCSVCotacoes])

  // ─── KPI Metrics ───

  const stats = useMemo(
    () => calcularStatsListaBidFrete(cotacoesParaKpi),
    [cotacoesParaKpi],
  )

  // ─── Renderizador de Cards Dinâmico ───
  const renderCard = useCallback((id: string) => {
    switch (id) {
      case 'total_cotacoes':
        return (
          <CardBasicoGlobal
            key="total_cotacoes"
            titulo={t('bidfrete.cotacoes.kpi.totalCotacoes.titulo', 'Total de Cotações')}
            icone={<Package weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
            valor={stats.total}
            subtexto={t('bidfrete.cotacoes.kpi.totalCotacoes.subtexto', 'Todas as cotações carregadas')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.totalCotacoes.tooltipTotal', 'Cotações Totais')}</span>
                  <strong>{stats.total}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.totalCotacoes.tooltipAtivas', 'Ativas / Em Andamento')}</span>
                  <strong style={{ color: '#fb923c' }}>{stats.emAndamento}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.totalCotacoes.tooltipAguardando', 'Aguardando Decisão')}</span>
                  <strong style={{ color: '#facc15' }}>{stats.aguardandoAprovacao}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.totalCotacoes.tooltipFechado', 'Histórico Fechado')}</span>
                  <strong style={{ color: '#34d399' }}>{stats.fechadas}</strong>
                </div>
              </>
            }
          />
        )
      case 'cotacoes_andamento':
        return (
          <CardBasicoGlobal
            key="cotacoes_andamento"
            titulo={t('bidfrete.cotacoes.kpi.emAndamento.titulo', 'Cotações em Andamento')}
            icone={<Clock weight="duotone" size={16} style={{ color: '#fb923c' }} />}
            valor={stats.emAndamento}
            variante="aviso"
            subtexto={t('bidfrete.cotacoes.kpi.emAndamento.subtexto', 'Em cotação ou enviadas')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.emAndamento.tooltipAndamento', 'Em Andamento')}</span>
                  <strong>{stats.emAndamento}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.emAndamento.tooltipEnviada', 'Enviada ao fornecedor')}</span>
                  <strong>{stats.enviadaFornecedores}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.emAndamento.tooltipEmCotacao', 'Em cotação')}</span>
                  <strong style={{ color: '#34d399' }}>{stats.emCotacao}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.emAndamento.tooltipPropostas', 'Propostas no período')}</span>
                  <strong>{stats.propostas}</strong>
                </div>
              </>
            }
          />
        )
      case 'aguardando_aprovacao':
        return (
          <CardBasicoGlobal
            key="aguardando_aprovacao"
            titulo={t('bidfrete.cotacoes.kpi.aguardandoAprovacao.titulo', 'Aguardando Aprovação')}
            icone={<Warning weight="duotone" size={16} style={{ color: '#facc15' }} />}
            valor={stats.aguardandoAprovacao}
            variante="aviso"
            subtexto={t('bidfrete.cotacoes.kpi.aguardandoAprovacao.subtexto', 'Necessitam de ação')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.aguardandoAprovacao.tooltipDecisao', 'Aguardando Decisão')}</span>
                  <strong>{stats.aguardandoAprovacao}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.aguardandoAprovacao.tooltipVolume', 'Valor meta acumulado')}</span>
                  <strong style={{ color: '#facc15' }}>USD {fmtQuantidade(stats.aguardandoValorMeta, 2)}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.aguardandoAprovacao.tooltipTempo', 'Tempo médio até o prazo')}</span>
                  <strong>
                    {stats.aguardandoTempoMedioEsperaHoras == null
                      ? '—'
                      : `${fmtQuantidade(stats.aguardandoTempoMedioEsperaHoras, 1)} h`}
                  </strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.aguardandoAprovacao.tooltipPropostas', 'Propostas recebidas')}</span>
                  <strong>{stats.aguardandoPropostas}</strong>
                </div>
              </>
            }
          />
        )
      case 'valor_total_frete':
        return (
          <CardBasicoGlobal
            key="valor_total_frete"
            titulo={t('bidfrete.config.cards.valor_total_frete', 'Valor Total de Frete')}
            icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={`USD ${fmtQuantidade(stats.valorTotalFrete, 2)}`}
            variante="sucesso"
            subtexto={t('bidfrete.config.cards.valor_total_frete_desc', 'Valor acumulado de frete aprovado')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>Cotações Totais</span>
                  <strong>{stats.total}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Valor Total</span>
                  <strong style={{ color: '#34d399' }}>USD {fmtQuantidade(stats.valorTotalFrete, 2)}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Média por Cotação</span>
                  <strong>USD {fmtQuantidade(stats.valorTotalFrete / (stats.total || 1), 2)}</strong>
                </div>
              </>
            }
          />
        )
      case 'propostas_recebidas':
        return (
          <CardBasicoGlobal
            key="propostas_recebidas"
            titulo={t('bidfrete.config.cards.propostas_recebidas', 'Propostas Recebidas')}
            icone={<ClipboardText weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
            valor={stats.propostas}
            subtexto={t('bidfrete.config.cards.propostas_recebidas_desc', 'Respostas de fornecedores')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>Respostas Recebidas</span>
                  <strong>{stats.propostas}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Média por Cotação</span>
                  <strong>{(stats.propostas / (stats.total || 1)).toFixed(1)}</strong>
                </div>
              </>
            }
          />
        )
      case 'saving_total':
      case 'saving_estimado':
        return (
          <CardBasicoGlobal
            key="saving_total"
            titulo={t('bidfrete.cotacoes.kpi.saving.titulo', 'Saving Estimado')}
            icone={<Coins weight="duotone" size={16} style={{ color: '#fb923c' }} />}
            valor={`USD ${fmtQuantidade(stats.savingTotal, 2)}`}
            variante="sucesso"
            subtexto={t('bidfrete.cotacoes.kpi.saving.subtexto', 'Soma do saving das cotações ativas')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.saving.tooltipTotal', 'Saving Estimado Total')}</span>
                  <strong style={{ color: '#34d399' }}>USD {fmtQuantidade(stats.savingTotal, 2)}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.saving.tooltipMedia', 'Média por Bid')}</span>
                  <strong>USD {fmtQuantidade(stats.savingTotal / (stats.emAndamento || 1), 2)}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.saving.tooltipCotacoes', 'Cotações com saving')}</span>
                  <strong>{stats.cotacoesComSaving}</strong>
                </div>
              </>
            }
          />
        )
      case 'tempo_medio_resposta':
        return (
          <CardBasicoGlobal
            key="tempo_medio_resposta"
            titulo={t('bidfrete.config.cards.tempo_medio_resposta', 'Tempo Médio de Resposta')}
            icone={<Gauge weight="duotone" size={16} style={{ color: '#a78bfa' }} />}
            valor={stats.tempoMedioRespostaHoras == null ? '—' : `${fmtQuantidade(stats.tempoMedioRespostaHoras, 1)} h`}
            subtexto={t('bidfrete.config.cards.tempo_medio_resposta_desc', 'Tempo médio de resposta')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>SLA de Resposta</span>
                  <strong>24 horas</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Tempo Médio Real</span>
                  <strong style={{ color: '#a78bfa' }}>
                    {stats.tempoMedioRespostaHoras == null ? 'Sem respostas' : `${fmtQuantidade(stats.tempoMedioRespostaHoras, 1)} h`}
                  </strong>
                </div>
              </>
            }
          />
        )
      case 'cotacoes_expiradas':
      case 'expiradas':
        return (
          <CardBasicoGlobal
            key="cotacoes_expiradas"
            titulo={t('bidfrete.cotacoes.kpi.expiradas.titulo', 'Expiradas')}
            icone={<Warning weight="duotone" size={16} style={{ color: '#f87171' }} />}
            valor={stats.expiradas}
            variante="perigo"
            subtexto={t('bidfrete.cotacoes.kpi.expiradas.subtexto', 'Prazo de resposta vencido')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.expiradas.tooltipTotal', 'Total Expirado')}</span>
                  <strong style={{ color: '#f87171' }}>{stats.expiradas}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.expiradas.tooltipTaxa', 'Taxa de Perda')}</span>
                  <strong style={{ color: '#f87171' }}>{((stats.expiradas / (stats.total || 1)) * 100).toFixed(1)}%</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.expiradas.tooltipSemProposta', 'Sem proposta recebida')}</span>
                  <strong>{stats.expiradasSemProposta}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.expiradas.tooltipComProposta', 'Com pelo menos 1 proposta')}</span>
                  <strong>{stats.expiradas - stats.expiradasSemProposta}</strong>
                </div>
              </>
            }
          />
        )
      default: {
        const defCustom = listarCardsCatalogo().find(c => c.id === id)
        if (!defCustom) return null
        const valorMetrica = calcularMetricaCardCustom(defCustom, cotacoesParaKpi)
        const valorFormatado = formatarValorCardCustom(defCustom, valorMetrica, fmtQuantidade)
        return (
          <CardBasicoGlobal
            key={id}
            titulo={defCustom.labelKey}
            icone={<Package weight="duotone" size={16} style={{ color: defCustom.cor ?? 'var(--ws-accent, #818cf8)' }} />}
            valor={valorFormatado}
            subtexto={defCustom.descricao}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.custom.tooltipTipo', 'Agregação')}</span>
                  <strong>{`${defCustom.tipoAgg} · ${defCustom.origem}`}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.custom.tooltipCampo', 'Campo base')}</span>
                  <strong>{defCustom.campoBase}</strong>
                </div>
                {defCustom.descKey ? (
                  <div className="cg-tooltip__row">
                    <span>{t('bidfrete.cotacoes.kpi.custom.tooltipFormula', 'Fórmula / nota')}</span>
                    <strong>{defCustom.descKey}</strong>
                  </div>
                ) : null}
              </>
            }
          />
        )
      }
    }
  }, [stats, cotacoesParaKpi, t])

  // ─── Render ───

  return (
    <PaginaGlobal
      className="bf-cotacoes bid-frete-page-shell"
    >
      {/* ── KPI cards (Configuração dinâmica com sincronização do local storage) ── */}
      {visao === 'lista' && (
        <div className="lp-stats-row">
          <div className="lp-cards">
            {cardsVisiveis.map(pref => renderCard(pref.id))}
          </div>
        </div>
      )}

      {/* Conteúdo da Visão */}
      {visao === 'lista' ? (
        <div className="bf-table-section">
          {erroCarregar && (
            <div
              role="alert"
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: 'var(--text-primary, #f1f5f9)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <span>{erroCarregar}</span>
              <button type="button" className="dc-btn dc-btn--secondary" onClick={() => void carregar()}>
                {t('comum.tentar_novamente', 'Tentar novamente')}
              </button>
            </div>
          )}
          <TabelaVirtualGlobal<LinhaPaiLista, LinhaFilhaLista>
            dados={linhasPaiFiltradas}
            colunas={colunasTabela}
            itemId={idLinhaPaiLista}
            mapaColunasFilho={mapaColunasFilho}
            onCarregarFilhos={handleCarregarFilhos}
            filhoId={idLinhaFilhaLista}
            
            itensPorPagina={tabelaConfig.linhasPorPagina}
            totalItens={linhasPaiFiltradas.length}
            totalFilhos={totalCotacoesFiltradas}
            paginaAtual={paginaLista}
            onMudarPagina={setPaginaLista}
            classNameLinhaPai={classNameLinhaPai}
            classNameLinhaFilho={classNameLinhaFilho}
            labelPai={['registro', 'registros']}
            
            abas={abas}
            abaAtiva={filtroTab}
            onMudarAba={setFiltroTab}
            
            acoes={acoes}
            acoesFilho={acoesFilho}
            acoesExportacao={acoesExportacao}
            acoesBarra={acoesBarra}
            
            onBuscar={setBusca}
            modoLocalizar={true}
            placeholderBusca="Buscar por processo, referência, origem ou destino..."
            
            camposEditaveis={CAMPOS_EDITAVEIS}
            onEditar={handleEditar}
            onSalvoComSucesso={() => addNotification({ type: 'success', message: 'Campo atualizado com sucesso.' })}
            onErroAoSalvar={(msg) => addNotification({ type: 'error', message: msg })}
            
            arrastavelPai={true}
            onReordenarPai={handleReordenarCotacoes}
            
            preferencias={preferencias}
            onSalvarPreferencias={handleSalvarPreferencias}
            colunasPadrao={COLUNAS_PADRAO_VISIVEIS}
            
            carregando={carregando}
            emptyIcon={<Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
            emptyTitle={t('bidfrete.cotacoes.vazio')}
            emptyDescription="Nenhuma cotação encontrada com os filtros selecionados."
            
            ariaLabel="Lista de Cotações"
          />
        </div>
      ) : (
        <CotacoesKanban
          cotacoes={cotacoesFiltradas}
          carregando={carregando}
          onRefresh={carregar}
        />
      )}

      <style>{`
        .bf-cotacoes {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          height: 100%;
        }

        .bf-cotacoes .pg-conteudo-area {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          gap: 1rem;
        }

        /* Destaque: cotação com menos de 2h para expirar (config Tabela) */
        .bf-cotacoes .gtv-linha--expira-prestes {
          box-shadow: inset 3px 0 0 rgba(248, 113, 113, 0.9);
        }
        .bf-cotacoes .gtv-linha--expira-prestes:hover {
          box-shadow: inset 3px 0 0 rgba(248, 113, 113, 1);
        }

        /* ── KPI Cards / Row ── */
        .lp-stats-row {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          padding: 0.5rem 0 1.5rem;
        }

        .lp-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }

        /* ── Dropdown "Novo" ── */
        .lp-dropdown-menu {
          animation: gtv-fade-in 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lp-dropdown-btn {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.5rem 0.625rem;
          border: none;
          border-radius: 0.375rem;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.8125rem;
          cursor: pointer;
          width: 100%;
          font-family: inherit;
          text-align: left;
          transition: background 0.15s ease;
        }

        .lp-dropdown-btn:hover {
          background: var(--bg-hover, rgba(255,255,255,0.06));
        }

        @keyframes gtv-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Toggle lista/kanban ── */
        .bf-toggle-btn {
          background: var(--bg-elevated, #475569);
          border: none;
          border-radius: var(--radius-md, 8px);
          padding: 0.4rem 0.5rem;
          cursor: pointer;
          color: var(--text-muted, #64748b);
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .bf-toggle-btn:hover {
          color: var(--text-secondary, #94a3b8);
        }
        .bf-toggle-btn--ativo {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .bf-toggle-btn--ativo:hover {
          color: #fff;
        }

        /* ── Table section ── */
        .bf-table-section {
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          overflow: hidden;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* ── Kanban Board ── */
        .bf-kanban-board {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 1rem;
          flex: 1;
          min-height: 0;
        }

        .bf-kanban-col {
          min-width: 280px;
          max-width: 320px;
          flex-shrink: 0;
          flex: 1;
          background: var(--bg-surface, #334155);
          border-radius: var(--radius-lg, 12px);
          display: flex;
          flex-direction: column;
        }

        .bf-kanban-col-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-lg, 12px) var(--radius-lg, 12px) 0 0;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .bf-kanban-col-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .bf-kanban-col-count {
          margin-left: auto;
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0.8;
        }

        .bf-kanban-col-body {
          flex: 1;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-height: 200px;
          overflow-y: auto;
        }

        .bf-kanban-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: 0.8125rem;
          color: var(--text-muted, #64748b);
          opacity: 0.5;
        }

        .bf-kanban-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--dark-border, rgba(255, 255, 255, 0.08));
          border-radius: 10px;
          padding: 0.75rem 0.85rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          user-select: none;
          transition: background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s;
        }
        .bf-kanban-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(96, 165, 250, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        .bf-kanban-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          min-width: 0;
        }

        .bf-kanban-card-numero {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: var(--text-main, #e2e8f0);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bf-kanban-card-route {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          min-width: 0;
          font-size: 0.75rem;
          line-height: 1.35;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
        }

        .bf-kanban-card-route span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bf-kanban-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          font-size: 0.68rem;
          line-height: 1.2;
          font-weight: 600;
          color: var(--text-secondary, #94a3b8);
        }

        .bf-kanban-card-meta span {
          padding: 0.12rem 0.38rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.04);
          white-space: nowrap;
        }

        .bf-kanban-card-ref {
          font-size: 0.7rem;
          line-height: 1.3;
          font-weight: 500;
          color: var(--text-muted, #94a3b8);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bf-kanban-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.4rem;
          font-size: 0.67rem;
          line-height: 1.2;
          font-weight: 600;
          color: var(--text-muted, #64748b);
          padding-top: 0.35rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* ── Botões ── */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-pill, 9999px);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          font-family: inherit;
        }
        .btn-primary {
          background: var(--accent, #6366f1);
          color: #fff;
        }
        .btn-primary:hover { background: var(--accent-hover, #4f46e5); }
        .btn-secondary {
          background: var(--bg-surface, #334155);
          color: var(--text-secondary, #94a3b8);
          border: 1px solid var(--bg-elevated, #475569);
        }
        .btn-secondary:hover {
          background: var(--bg-elevated, #475569);
          color: var(--text-primary, #f1f5f9);
        }
      `}</style>
    </PaginaGlobal>
  )
}
