/**
 * Cotacoes.tsx — Lista + Kanban de Cotações (T2/T3)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Migrado para TabelaVirtualGlobal para suportar ordenação manual,
 * persistência de colunas, edição inline e precisão numérica reativa.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useShellStore } from '@gravity/shell'

import CotacoesKanban from './kanban-bid-frete-internacional'
import { ModalNovoBidFreteInternacional } from './modal-novo-bid-frete-internacional'
import { useSincronizarTituloPaginaTopo } from '../shared/useSincronizarTituloPaginaTopo'
import {
  criarTituloCarregandoTopo,
  ConteudoCarregandoBidFreteInternacional,
} from '../shared/pagina-carregando-bid-frete-internacional'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type { GTPreferencias, GTColuna, GTAbaTipo, GTVirtualHandle } from '@nucleo/tabela-virtual-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  FileText,
  Globe,
  Eye,
  ListBullets,
  Kanban,
  UploadSimple,
  PencilSimple,
  ArrowsLeftRight,
  Sparkle,
  ArrowCounterClockwise,
  Warning,
  Package,
  Plus,
  Stack,
  CaretDown,
  CaretRight,
  CaretDoubleDown,
  CaretDoubleUp,
  StackPlus,
  Trash,
  SquaresFour,
  Clock,
  Coins,
  DownloadSimple,
  CurrencyDollar,
  ClipboardText,
  Gauge,
  Target,
} from '@phosphor-icons/react'

import {
  duplicacoesBidFreteApi,
  getBidsFreteInternacional,
  getCotacoes,
  listarUsuariosOrganizacao,
  paineisListaBidFreteApi,
} from '../shared/api'
import { ModalExcluirListaBidFreteInternacional } from './modal-excluir-lista-bid-frete-internacional'
import {
  resolverIdsWorkspacesParaApi,
  useEscopoWorkspacesBidFreteInternacional,
} from '../shared/useEscopoWorkspacesBidFreteInternacional'
import {
  publicarCotacaoAtualizadaBidFrete,
  inscreverCotacaoAtualizadaBidFrete,
} from '../shared/bus-cotacao-atualizada-bid-frete-internacional'
import { patchCotacaoNoEstadoListaBidFrete } from '../shared/patch-estado-cotacoes-lista-bid-frete-internacional'
import { salvarCampoCotacaoBidFreteInternacional } from '../shared/salvar-campo-cotacao-bid-frete-internacional'
import type { BidFreteInternacional, Cotacao } from '../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, MODALIDADE_LABELS } from '../shared/types'
import {
  calcularMetricaCardCustom,
  formatarValorCardCustom,
} from '../shared/lista-bid-frete-card-custom'
import { resolverIconeCard } from '../shared/card-icone-map-bid-frete'
import { decodeMetricaCard } from '../shared/card-metrica-catalog-bid-frete'
import { COTACOES_LIMIT_LISTA, filtrarCotacoesPorPeriodoCards } from '../shared/lista-bid-frete-card-periodo'
import { calcularStatsListaBidFrete } from '../shared/lista-bid-frete-kpi-metrics'
import { calcularMetricasCotacoesAcimaMeta } from '../shared/lista-bid-frete-meta-metrics'
import {
  carregarTabelaConfigBidFrete,
  HORAS_LIMITE_DESTAQUE_EXPIRACAO,
  SYNC_EVENT_TABELA_BID_FRETE,
} from '../shared/tabela-config-bid-frete'
import { SYNC_EVENT_CASAS_BID_FRETE } from '../shared/casas-config-bid-frete'
import { SYNC_EVENT_FORMATO_DATA_BID_FRETE } from '../shared/formato-data-bid-frete'
import {
  CARD_PERIODOS,
  listarCardsCatalogo,
  type CardPeriodoCodigo,
  useCardPreferencesBidFrete,
} from '../shared/use-card-preferences'
import { BidFreteListaFaixaNavegacao } from '../components/BidFreteListaFaixaNavegacao'
import '../shared/lista-bid-frete-internacional-layout.css'
import { useListaPainelBidFrete } from '../shared/useListaPainelBidFrete'
import {
  configListaPainelPadraoV1,
  parsearConfigListaPainelSeguro,
  serializarConfigListaPainel,
} from '../../../shared/listaPainelConfigSchema'
import { useCadastrosListaBidFrete } from '../shared/useCadastrosListaBidFrete'
import {
  buildColunasPaiLista,
  buildColunasCotacoes,
  buildMapaColunasFilho,
  CAMPOS_EDITAVEIS_LISTA,
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
  montarLinhasPaiListaComFallback,
  filtrarBidsParaLista,
  idLinhaPaiLista,
  idLinhaFilhaLista,
  isLinhaBidGrupo,
  isLinhaProposta,
  cotacaoDaLinhaPai,
  cotacaoPrestesAExpirar,
  linhaPaiPrestesAExpirar,
  type LinhaPaiLista,
  type LinhaFilhaLista,
} from './lista-bid-frete-internacional-utils'
import { renderConectorPaiListaBidFreteInternacional } from './conector-pai-lista-bid-frete-internacional'
import {
  EVENTO_STATUS_COTACAO_CONFIG_ATUALIZADO_BID_FRETE_INTERNACIONAL,
  lerStatusCotacaoConfigBidFreteInternacional,
  type StatusCotacaoConfigBidFreteInternacional,
} from '../shared/status-config-bid-frete-internacional'

/** Gera abas dinâmicas a partir da lista de status config */
function gerarAbasDinamicas(
  statusList: StatusCotacaoConfigBidFreteInternacional[],
): GTAbaTipo[] {
  const ordenados = [...statusList].sort((a, b) => a.ordem - b.ordem)
  return [
    { valor: 'TODAS', label: 'Todas as cotações' },
    ...ordenados.map(s => ({ valor: s.nome, label: s.rotulo, cor: s.cor })),
  ]
}

// ─── Colunas padrão = todas as colunas escalares do banco ───

/** Incrementar quando adicionar colunas ao schema — força reset das prefs salvas. */
const VERSAO_COLUNAS_LISTA = 4
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

    const visiveisSet = new Set([...colunasValidas, ...faltantes])
    const colunasVisiveis = CHAVES_COLUNAS_PADRAO_VISIVEIS.filter(k => visiveisSet.has(k))

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
  const location = useLocation()
  const addNotification = useShellStore(s => s.addNotification)
  const { getToken } = useAuth()
  const meStatus = useShellStore(s => s.meStatus)
  const currentUser = useShellStore(s => s.currentUser)
  const workspacesStore = useShellStore(s => s.workspaces)
  const organizacoesStore = useShellStore(s => s.organizacoes)
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)
  const idsWorkspacesEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.idsWorkspacesEscopo)
  const escopoHidratado = useEscopoWorkspacesBidFreteInternacional(s => s.hidratado)
  const versaoEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.versaoEscopo)

  const idsWorkspacesFiltro = useMemo(
    () => resolverIdsWorkspacesParaApi(idsWorkspacesEscopo, idWorkspaceAtivo ?? ''),
    [idsWorkspacesEscopo, idWorkspaceAtivo],
  )

  useEffect(() => {
    if (currentUser.id) {
      sessionStorage.setItem('gravity_id_usuario', currentUser.id)
    }
    if (currentUser.idOrganizacao) {
      sessionStorage.setItem('gravity_id_organizacao', currentUser.idOrganizacao)
    }
  }, [currentUser.id, currentUser.idOrganizacao])

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

  const [statusConfig, setStatusConfig] = useState(lerStatusCotacaoConfigBidFreteInternacional)

  useEffect(() => {
    const atualizar = () => setStatusConfig(lerStatusCotacaoConfigBidFreteInternacional())
    window.addEventListener('storage', atualizar)
    window.addEventListener('focus', atualizar)
    window.addEventListener(EVENTO_STATUS_COTACAO_CONFIG_ATUALIZADO_BID_FRETE_INTERNACIONAL, atualizar)
    return () => {
      window.removeEventListener('storage', atualizar)
      window.removeEventListener('focus', atualizar)
      window.removeEventListener(EVENTO_STATUS_COTACAO_CONFIG_ATUALIZADO_BID_FRETE_INTERNACIONAL, atualizar)
    }
  }, [])

  const statusOpcoesColunas = useMemo(
    () => statusConfig.map(s => ({ valor: s.nome, label: s.rotulo })),
    [statusConfig],
  )

  const {
    paisesOpcoes,
    portosOpcoes,
    aeroportosOpcoes,
    containersOpcoes,
    portos: portosCadastro,
    aeroportos: aeroportosCadastro,
  } = useCadastrosListaBidFrete()

  const opcoesColunasLista = useMemo<OpcoesColunasLista>(() => ({
    organizacoesMap,
    workspacesMap,
    usuariosMap,
    idUsuarioAtual: currentUser.id,
    nomeUsuarioAtual: currentUser.name || currentUser.email,
    nomeWorkspaceFallback: nomeWorkspaceAtivo,
    statusOpcoes: statusOpcoesColunas,
    paisesOpcoes,
    portosOpcoes,
    aeroportosOpcoes,
    containersOpcoes,
  }), [
    organizacoesMap,
    workspacesMap,
    usuariosMap,
    currentUser.id,
    currentUser.name,
    currentUser.email,
    nomeWorkspaceAtivo,
    statusOpcoesColunas,
    paisesOpcoes,
    portosOpcoes,
    aeroportosOpcoes,
    containersOpcoes,
  ])

  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [cotacoesAvulsas, setCotacoesAvulsas] = useState<Cotacao[]>([])
  const [bidsFreteInternacional, setBidsFreteInternacional] = useState<BidFreteInternacional[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const visao: 'lista' | 'kanban' = location.pathname.includes('/kanban') ? 'kanban' : 'lista'

  const [filtroTab, setFiltroTab] = useState('TODAS')

  const abas = useMemo(() => gerarAbasDinamicas(statusConfig), [statusConfig])
  const {
    prefs: cardPrefs,
    visiveis: cardsVisiveis,
    periodo: periodoCards,
    persistir: persistirCardPrefs,
    setPeriodo: setPeriodoCards,
  } = useCardPreferencesBidFrete()

  const [tabelaConfig, setTabelaConfig] = useState(carregarTabelaConfigBidFrete)
  const [paginaLista, setPaginaLista] = useState(1)
  const [casasVersion, setCasasVersion] = useState(0)
  const [formatoDataVersion, setFormatoDataVersion] = useState(0)

  // ─── Seleção (BID ou cotação) + Expandir/Recolher todos ───
  const tabelaRef = useRef<GTVirtualHandle | null>(null)
  const [temExpandido, setTemExpandido] = useState(false)
  const [linhasPaiSelecionadas, setLinhasPaiSelecionadas] = useState<LinhaPaiLista[]>([])
  const [cotacoesFilhasSelecionadas, setCotacoesFilhasSelecionadas] = useState<Cotacao[]>([])
  const [resetSelecaoFilhos, setResetSelecaoFilhos] = useState(0)
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [duplicando, setDuplicando] = useState(false)

  const handleExpandidosMudar = useCallback((count: number) => {
    setTemExpandido(count > 0)
  }, [])

  // Propostas (filhas de cotação avulsa) não são selecionáveis — só cotações.
  const handleSelecaoFilho = useCallback((itens: LinhaFilhaLista[]) => {
    setCotacoesFilhasSelecionadas(itens.filter((i): i is Cotacao => !isLinhaProposta(i)))
  }, [])

  const bidsSelecionados = useMemo(
    () => linhasPaiSelecionadas.filter(isLinhaBidGrupo),
    [linhasPaiSelecionadas],
  )

  const cotacoesAvulsasSelecionadas = useMemo(
    () => linhasPaiSelecionadas.filter((l): l is Cotacao => !isLinhaBidGrupo(l)),
    [linhasPaiSelecionadas],
  )

  /**
   * Cotações alvo das ações em lote: avulsas selecionadas + filhas selecionadas
   * cujo BID pai NÃO está selecionado inteiro (o BID selecionado já carrega as
   * suas filhas — evita duplicar/excluir duas vezes).
   */
  const cotacoesSelecionadasParaAcao = useMemo(() => {
    const idsBids = new Set(bidsSelecionados.map(b => b.id_bid_bid_frete_internacional))
    const mapa = new Map<string, Cotacao>()
    for (const c of cotacoesAvulsasSelecionadas) {
      mapa.set(c.id_cotacao_bid_frete_internacional, c)
    }
    for (const c of cotacoesFilhasSelecionadas) {
      const idBid = c.id_bid_bid_frete_internacional
      if (idBid && idsBids.has(idBid)) continue
      mapa.set(c.id_cotacao_bid_frete_internacional, c)
    }
    return [...mapa.values()]
  }, [bidsSelecionados, cotacoesAvulsasSelecionadas, cotacoesFilhasSelecionadas])

  const totalSelecionados = bidsSelecionados.length + cotacoesSelecionadasParaAcao.length

  const idsBidsParaExclusao = useMemo(
    () => bidsSelecionados.map(b => b.id_bid_bid_frete_internacional),
    [bidsSelecionados],
  )
  const idsCotacoesParaExclusao = useMemo(
    () => cotacoesSelecionadasParaAcao.map(c => c.id_cotacao_bid_frete_internacional),
    [cotacoesSelecionadasParaAcao],
  )

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
    // Propostas não são selecionáveis — classe oculta o checkbox da linha (CSS abaixo)
    if (isLinhaProposta(filha)) return 'bf-linha-filha-proposta'
    if (!tabelaConfig.destacarAtrasados) return undefined
    return cotacaoPrestesAExpirar(filha, HORAS_LIMITE_DESTAQUE_EXPIRACAO)
      ? 'gtv-linha--expira-prestes'
      : undefined
  }, [tabelaConfig.destacarAtrasados])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErroCarregar(null)
    try {
      const filtro = idsWorkspacesFiltro
      const [resTodas, resAvulsas, resBids] = await Promise.allSettled([
        getCotacoes({ limit: COTACOES_LIMIT_LISTA, idsWorkspacesFiltro: filtro }),
        getCotacoes({ limit: COTACOES_LIMIT_LISTA, apenas_avulsas: true, idsWorkspacesFiltro: filtro }),
        getBidsFreteInternacional(filtro),
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

      setErroCarregar(erros.length > 0 ? [...new Set(erros)].join(' · ') : null)
    } catch (e: unknown) {
      setCotacoes([])
      setCotacoesAvulsas([])
      setBidsFreteInternacional([])
      setErroCarregar(e instanceof Error ? e.message : 'Erro ao carregar cotações')
    } finally {
      setCarregando(false)
    }
  }, [idsWorkspacesFiltro])

  const carregarRef = useRef(carregar)
  carregarRef.current = carregar

  useEffect(() => {
    if (meStatus !== 'success' || !currentUser.id || !currentUser.idOrganizacao || !escopoHidratado) return
    void carregarRef.current()
  }, [meStatus, currentUser.id, currentUser.idOrganizacao, escopoHidratado, versaoEscopo])

  // ─── Ações em lote: Duplicar e Excluir ───

  const handleDuplicarSelecionados = useCallback(async () => {
    if (duplicando) return
    const idsBids = bidsSelecionados.map(b => b.id_bid_bid_frete_internacional)
    const idsCotacoes = cotacoesSelecionadasParaAcao.map(c => c.id_cotacao_bid_frete_internacional)
    if (idsBids.length === 0 && idsCotacoes.length === 0) return

    setDuplicando(true)
    try {
      let totalBids = 0
      let totalCotacoes = 0
      if (idsBids.length > 0) {
        totalBids = (await duplicacoesBidFreteApi.duplicarBids(idsBids)).total_duplicadas
      }
      if (idsCotacoes.length > 0) {
        totalCotacoes = (await duplicacoesBidFreteApi.duplicarCotacoes(idsCotacoes)).total_duplicadas
      }
      const partes: string[] = []
      if (totalBids > 0) partes.push(`${totalBids} BID${totalBids !== 1 ? 's' : ''}`)
      if (totalCotacoes > 0) partes.push(`${totalCotacoes} cotaç${totalCotacoes !== 1 ? 'ões' : 'ão'}`)
      addNotification({
        type: 'success',
        message: t('bidfrete.duplicar.toast_sucesso', {
          defaultValue: 'Duplicado com sucesso: {{itens}} (em rascunho).',
          itens: partes.join(' e '),
        }),
      })
      await carregar()
    } catch (e: unknown) {
      addNotification({
        type: 'error',
        message: e instanceof Error
          ? e.message
          : t('bidfrete.duplicar.toast_erro', { defaultValue: 'Falha ao duplicar. Tente novamente.' }),
      })
    } finally {
      setDuplicando(false)
    }
  }, [duplicando, bidsSelecionados, cotacoesSelecionadasParaAcao, addNotification, carregar, t])

  const handleExcluidoLote = useCallback((totais: { bids: number; cotacoes: number }) => {
    const partes: string[] = []
    if (totais.bids > 0) partes.push(`${totais.bids} BID${totais.bids !== 1 ? 's' : ''}`)
    if (totais.cotacoes > 0) partes.push(`${totais.cotacoes} cotaç${totais.cotacoes !== 1 ? 'ões' : 'ão'}`)
    if (partes.length > 0) {
      addNotification({
        type: 'success',
        message: t('bidfrete.excluir.toast_sucesso', {
          defaultValue: 'Excluído com sucesso: {{itens}}.',
          itens: partes.join(' e '),
        }),
      })
    }
    setLinhasPaiSelecionadas([])
    setCotacoesFilhasSelecionadas([])
    setResetSelecaoFilhos(v => v + 1)
    void carregar()
  }, [addNotification, carregar, t])

  // ─── Tabela Virtual: Preferências, Colunas e Edição ───

  const [preferencias, setPreferencias] = useState<GTPreferencias | undefined>(undefined)
  const sortCampoLista = 'numero_cotacao_bid_frete_internacional'
  const sortDirLista = 'desc' as const
  const filtrosAtivosLista = useMemo(() => ({}), [])

  const {
    paineis: paineisLista,
    setPaineis: setPaineisLista,
    painelAtualId: painelListaAtualId,
    setPainelAtualId: setPainelListaAtualId,
    painelAtual: painelListaAtual,
    carregando: carregandoPaineisLista,
    aplicarConfigDoPainel,
    persistirPainelAtual,
    persistirPainelAtualImediato,
    trocarPainel: trocarPainelLista,
    criarPainel: criarPainelLista,
  } = useListaPainelBidFrete()
  const painelListaAplicadoRef = useRef<string | null>(null)
  const migrouLocalStoragePainelRef = useRef(false)

  const aplicarCardsTopoDoPainel = useCallback((
    cardsTopo: { ids_visiveis: string[]; periodo?: string } | undefined,
  ) => {
    if (!cardsTopo) return
    const periodosValidos = CARD_PERIODOS.map(p => p.id)
    if (cardsTopo.periodo && periodosValidos.includes(cardsTopo.periodo as CardPeriodoCodigo)) {
      setPeriodoCards(cardsTopo.periodo as CardPeriodoCodigo)
    }
    if (cardsTopo.ids_visiveis.length > 0) {
      const visiveisSet = new Set(cardsTopo.ids_visiveis)
      const algumIdValido = cardPrefs.some(p => visiveisSet.has(p.id))
      if (algumIdValido) {
        persistirCardPrefs(cardPrefs.map(p => ({ ...p, visible: visiveisSet.has(p.id) })))
      }
    }
  }, [cardPrefs, persistirCardPrefs, setPeriodoCards])

  const listaPainelCallbacks = useMemo(() => ({
    setPreferencias,
    setAbaAtiva: setFiltroTab,
    setSortCampo: () => {},
    setSortDir: () => {},
    setBusca,
    setFiltrosAtivos: () => {},
    setCardsTopoDoPainel: aplicarCardsTopoDoPainel,
    onPainelHidratado: (id: string) => {
      painelListaAplicadoRef.current = id
    },
  }), [aplicarCardsTopoDoPainel])

  useEffect(() => {
    if (!painelListaAtual || carregandoPaineisLista) return
    if (painelListaAplicadoRef.current === painelListaAtual.id) return
    aplicarConfigDoPainel(painelListaAtual, listaPainelCallbacks)

    if (!migrouLocalStoragePainelRef.current) {
      const prefsLocal = lerPreferenciasTabela()
      const configAtual = parsearConfigListaPainelSeguro(
        painelListaAtual.config_json,
        configListaPainelPadraoV1(),
        { id_painel: painelListaAtual.id, origem: 'lista-bid-frete.migracaoLocalStorage' },
      )
      if (prefsLocal?.colunas_visiveis?.length && configAtual.colunas_visiveis.length === 0) {
        const merged = configListaPainelPadraoV1({
          ...configAtual,
          colunas_visiveis: prefsLocal.colunas_visiveis,
          colunas_largura: prefsLocal.colunas_largura as Record<string, number> | undefined,
        })
        void paineisListaBidFreteApi.atualizar(painelListaAtual.id, {
          config_json: serializarConfigListaPainel(merged),
        })
        setPreferencias({ colunas_visiveis: merged.colunas_visiveis, colunas_largura: merged.colunas_largura })
      } else if (configAtual.colunas_visiveis.length === 0) {
        const merged = configListaPainelPadraoV1({
          ...configAtual,
          colunas_visiveis: COLUNAS_PADRAO_VISIVEIS,
        })
        void paineisListaBidFreteApi.atualizar(painelListaAtual.id, {
          config_json: serializarConfigListaPainel(merged),
        })
        setPreferencias({ colunas_visiveis: merged.colunas_visiveis })
      }
      migrouLocalStoragePainelRef.current = true
    }
  }, [painelListaAtual, carregandoPaineisLista, aplicarConfigDoPainel, listaPainelCallbacks])

  const handleTrocarPainelLista = useCallback((id: string) => {
    painelListaAplicadoRef.current = null
    void trocarPainelLista(
      id,
      {
        preferencias,
        abaAtiva: filtroTab,
        sortCampo: sortCampoLista,
        sortDir: sortDirLista,
        busca,
        filtrosAtivos: filtrosAtivosLista,
        cardsVisiveisIds: cardsVisiveis.map(c => c.id),
        periodoCards,
      },
      listaPainelCallbacks,
    )
  }, [
    trocarPainelLista, preferencias, filtroTab, busca, filtrosAtivosLista,
    cardsVisiveis, periodoCards, listaPainelCallbacks, sortCampoLista, sortDirLista,
  ])

  const estadoListaParaPainel = useCallback(() => ({
    preferencias,
    abaAtiva: filtroTab,
    sortCampo: sortCampoLista,
    sortDir: sortDirLista,
    busca,
    filtrosAtivos: filtrosAtivosLista,
    cardsVisiveisIds: cardsVisiveis.map(c => c.id),
    periodoCards,
  }), [
    preferencias, filtroTab, busca, filtrosAtivosLista,
    cardsVisiveis, periodoCards, sortCampoLista, sortDirLista,
  ])

  const handleCriarPainelLista = useCallback(async (nome: string): Promise<boolean> => {
    painelListaAplicadoRef.current = null
    try {
      const criado = await criarPainelLista(nome, estadoListaParaPainel(), listaPainelCallbacks)
      if (!criado) {
        addNotification({
          type: 'error',
          message: t('bid_frete_internacional.lista.painel_criado_erro', {
            defaultValue: 'Não foi possível salvar o painel.',
          }),
        })
        return false
      }
      addNotification({
        type: 'success',
        message: t('bid_frete_internacional.lista.painel_criado_sucesso', {
          defaultValue: 'Painel "{{nome}}" criado.',
          nome: criado.nome,
        }),
      })
      return true
    } catch (err) {
      const detalhe = err instanceof Error ? err.message : ''
      addNotification({
        type: 'error',
        message: detalhe
          ? `${t('bid_frete_internacional.lista.painel_criado_erro', { defaultValue: 'Não foi possível salvar o painel.' })} ${detalhe}`
          : t('bid_frete_internacional.lista.painel_criado_erro', {
              defaultValue: 'Não foi possível salvar o painel.',
            }),
      })
      return false
    }
  }, [criarPainelLista, estadoListaParaPainel, listaPainelCallbacks, addNotification, t])

  useEffect(() => {
    if (!painelListaAtualId || carregandoPaineisLista) return
    if (painelListaAplicadoRef.current !== painelListaAtualId) return
    persistirPainelAtual({
      preferencias,
      abaAtiva: filtroTab,
      sortCampo: sortCampoLista,
      sortDir: sortDirLista,
      busca,
      filtrosAtivos: filtrosAtivosLista,
      cardsVisiveisIds: cardsVisiveis.map(c => c.id),
      periodoCards,
    })
  }, [
    preferencias, filtroTab, busca, painelListaAtualId, carregandoPaineisLista,
    persistirPainelAtual, cardsVisiveis, periodoCards, filtrosAtivosLista,
  ])

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    if (painelListaAtualId) {
      persistirPainelAtualImediato({
        preferencias: prefs,
        abaAtiva: filtroTab,
        sortCampo: sortCampoLista,
        sortDir: sortDirLista,
        busca,
        filtrosAtivos: filtrosAtivosLista,
        cardsVisiveisIds: cardsVisiveis.map(c => c.id),
        periodoCards,
      })
    }
  }, [
    painelListaAtualId, persistirPainelAtualImediato, filtroTab, busca,
    cardsVisiveis, periodoCards, filtrosAtivosLista, sortCampoLista, sortDirLista,
  ])

  const abrirDetalheCotacao = useCallback((item: Cotacao) => {
    navigate(`/bid-frete/cotacoes/${item.id_cotacao_bid_frete_internacional}`)
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

  const resolverCotacaoPorId = useCallback((id: string): Cotacao | null => {
    const avulsa = cotacoesAvulsas.find(c => c.id_cotacao_bid_frete_internacional === id)
    if (avulsa) return avulsa
    const flat = cotacoes.find(c => c.id_cotacao_bid_frete_internacional === id)
    if (flat) return flat
    for (const bid of bidsFreteInternacional) {
      const filha = (bid.cotacoes ?? []).find(c => c.id_cotacao_bid_frete_internacional === id)
      if (filha) return filha
    }
    return null
  }, [cotacoes, cotacoesAvulsas, bidsFreteInternacional])

  const salvarEdicaoCotacao = useCallback(async (
    id: string,
    campo: string,
    valor: unknown,
  ): Promise<Cotacao> => {
    if (id.startsWith('bid:')) {
      throw new Error('Expanda o BID e edite a cotação na linha filha.')
    }
    const atual = resolverCotacaoPorId(id)
    if (!atual) throw new Error('Cotação não encontrada')

    const cotacaoSalva = await salvarCampoCotacaoBidFreteInternacional({
      id,
      campo,
      valor,
      cotacaoAtual: atual,
      portosCadastro,
      aeroportosCadastro,
    })

    patchCotacaoNoEstadoListaBidFrete(
      cotacaoSalva,
      setCotacoes,
      setCotacoesAvulsas,
      setBidsFreteInternacional,
    )
    publicarCotacaoAtualizadaBidFrete(cotacaoSalva)
    return cotacaoSalva
  }, [resolverCotacaoPorId, portosCadastro, aeroportosCadastro])

  useEffect(() => {
    return inscreverCotacaoAtualizadaBidFrete((cotacao) => {
      patchCotacaoNoEstadoListaBidFrete(
        cotacao,
        setCotacoes,
        setCotacoesAvulsas,
        setBidsFreteInternacional,
      )
    })
  }, [])

  const handleEditar = useCallback(async (
    id: string,
    campo: string,
    valor: unknown,
  ): Promise<LinhaPaiLista> => {
    const cotacaoSalva = await salvarEdicaoCotacao(id, campo, valor)
    return cotacaoSalva
  }, [salvarEdicaoCotacao])

  const handleEditarFilho = useCallback(async (
    id: string,
    campo: string,
    valor: unknown,
  ): Promise<LinhaFilhaLista> => {
    const cotacaoSalva = await salvarEdicaoCotacao(id, campo, valor)
    return cotacaoSalva
  }, [salvarEdicaoCotacao])

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

  const bidsFiltrados = useMemo(
    () => filtrarBidsParaLista(bidsFreteInternacional, filtrarCotacaoItem, busca),
    [bidsFreteInternacional, filtrarCotacaoItem, busca],
  )

  const linhasPaiFiltradas = useMemo(
    () => montarLinhasPaiListaComFallback(
      bidsFiltrados,
      cotacoesAvulsasFiltradas,
      cotacoesFiltradas,
    ),
    [bidsFiltrados, cotacoesAvulsasFiltradas, cotacoesFiltradas],
  )

  const totalCotacoesFiltradas = cotacoesFiltradas.length

  const cotacoesParaKpi = useMemo(
    () => filtrarCotacoesPorPeriodoCards(cotacoesFiltradas, periodoCards),
    [cotacoesFiltradas, periodoCards],
  )

  const metricasAcimaMeta30d = useMemo(
    () => calcularMetricasCotacoesAcimaMeta(
      filtrarCotacoesPorPeriodoCards(cotacoesFiltradas, '30d'),
    ),
    [cotacoesFiltradas],
  )

  const handleCarregarFilhos = useCallback(async (pai: LinhaPaiLista): Promise<LinhaFilhaLista[]> => {
    if (isLinhaBidGrupo(pai)) return pai.cotacoes
    return []
  }, [])

  const renderConectorPai = useCallback(
    (item: LinhaPaiLista, ctx: Parameters<typeof renderConectorPaiListaBidFreteInternacional>[1]) =>
      renderConectorPaiListaBidFreteInternacional(item, ctx),
    [],
  )

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
  const [novoSubmenu, setNovoSubmenu] = useState<'painel' | 'buscar-frete' | 'bid' | null>(null)
  const [novoNomePainelLista, setNovoNomePainelLista] = useState('')
  const [modalNovoBidAberto, setModalNovoBidAberto] = useState(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (novoDropdownRef.current && !novoDropdownRef.current.contains(event.target as Node)) {
        setNovoDropdownAberto(false)
        setNovoSubmenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const acoesBarra = useMemo(() => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      {/* Expandir/Recolher todos — mesmo padrão da Lista de Pedidos */}
      <TooltipGlobal
        descricao={temExpandido
          ? t('bidfrete.lista.recolher_todos', { defaultValue: 'Recolher todas as linhas' })
          : t('bidfrete.lista.expandir_todos', { defaultValue: 'Expandir todas as linhas' })}
      >
        <button
          type="button"
          className="bf-btn-expandir-todos"
          onClick={() => {
            if (temExpandido) {
              tabelaRef.current?.recolherTodos()
              return
            }
            for (const linha of linhasPaiFiltradas) {
              if (isLinhaBidGrupo(linha)) {
                tabelaRef.current?.expandir(idLinhaPaiLista(linha))
              }
            }
          }}
          aria-label={temExpandido
            ? t('bidfrete.lista.recolher_todos', { defaultValue: 'Recolher todas as linhas' })
            : t('bidfrete.lista.expandir_todos', { defaultValue: 'Expandir todas as linhas' })}
        >
          {temExpandido
            ? <CaretDoubleUp size={14} weight="bold" />
            : <CaretDoubleDown size={14} weight="bold" />}
        </button>
      </TooltipGlobal>

    <div ref={novoDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <BotaoGlobal
        variante="primario"
        tamanho="pequeno"
        icone={<Plus size={14} weight="bold" />}
        onClick={() => setNovoDropdownAberto(prev => !prev)}
      >
        {t('bidfrete.cotacoes.toolbar.novo')} <CaretDown size={12} weight="bold" style={{ marginLeft: 2, transition: 'transform 0.15s', transform: novoDropdownAberto ? 'rotate(180deg)' : 'none' }} />
      </BotaoGlobal>

      {novoDropdownAberto && (
        <div className="lp-dropdown-menu" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 300,
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
          minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
        }}>
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setNovoSubmenu('buscar-frete')}
            onMouseLeave={() => setNovoSubmenu(null)}
          >
            <button
              type="button"
              className="lp-dropdown-btn"
              style={{ width: '100%', background: (novoSubmenu === 'buscar-frete' || novoSubmenu === 'bid') ? 'var(--bg-hover)' : undefined }}
              onClick={() => setNovoSubmenu(prev => (prev === 'buscar-frete' || prev === 'bid' ? null : 'buscar-frete'))}
            >
              <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                <Globe size={16} weight="duotone" />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left', flex: 1 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('bidfrete.cotacoes.toolbar.buscarFrete')}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{t('bidfrete.cotacoes.toolbar.buscarFreteDesc')}</span>
              </span>
              <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0, alignSelf: 'center' }} />
            </button>

            {(novoSubmenu === 'buscar-frete' || novoSubmenu === 'bid') && (
              <div style={{ position: 'absolute', left: '100%', top: 0, paddingLeft: '8px', zIndex: 301 }}>
                <div style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
                  minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
                }}>
                <button
                  type="button"
                  className="lp-dropdown-btn"
                  onClick={() => {
                    navigate('/bid-frete/cotacoes/nova')
                    setNovoDropdownAberto(false)
                    setNovoSubmenu(null)
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                    <FileText size={16} weight="duotone" />
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('bidfrete.cotacoes.toolbar.cotacaoAvulsa')}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{t('bidfrete.cotacoes.toolbar.cotacaoAvulsaDesc')}</span>
                  </span>
                </button>

                <div
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setNovoSubmenu('bid')}
                  onMouseLeave={() => setNovoSubmenu('buscar-frete')}
                >
                  <button
                    type="button"
                    className="lp-dropdown-btn"
                    style={{ width: '100%', background: novoSubmenu === 'bid' ? 'var(--bg-hover)' : undefined }}
                  >
                    <span style={{ color: 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                      <Stack size={16} weight="duotone" />
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem', textAlign: 'left', flex: 1 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('bidfrete.cotacoes.toolbar.bid')}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{t('bidfrete.cotacoes.toolbar.bidDesc')}</span>
                    </span>
                    <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0, alignSelf: 'center' }} />
                  </button>

                  {novoSubmenu === 'bid' && (
                    <div style={{ position: 'absolute', left: '100%', top: 0, paddingLeft: '8px', zIndex: 302 }}>
                      <div style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                        borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
                        minWidth: '230px', padding: '0.375rem', display: 'flex', flexDirection: 'column',
                      }}>
                      {([
                        {
                          icon: 'upload' as const,
                          label: t('bidfrete.novo_bid.importacao'),
                          desc: t('bidfrete.novo_bid.importacao_desc'),
                          action: () => {
                            navigate('/bid-frete/cotacoes/importar?contexto=bid')
                            setNovoDropdownAberto(false)
                            setNovoSubmenu(null)
                          },
                        },
                        {
                          icon: 'api' as const,
                          label: t('bidfrete.novo_bid.api'),
                          desc: t('bidfrete.novo_bid.api_desc'),
                          badge: t('comum.em_breve'),
                          disabled: true,
                        },
                        {
                          icon: 'sparkle' as const,
                          label: t('bidfrete.novo_bid.smart_read'),
                          desc: t('bidfrete.novo_bid.smart_read_desc'),
                          badge: t('comum.em_breve'),
                          disabled: true,
                        },
                        {
                          icon: 'pencil' as const,
                          label: t('bidfrete.novo_bid.manual'),
                          desc: t('bidfrete.novo_bid.manual_desc'),
                          action: () => {
                            setModalNovoBidAberto(true)
                            setNovoDropdownAberto(false)
                            setNovoSubmenu(null)
                          },
                        },
                      ] as {
                        icon: 'upload' | 'api' | 'sparkle' | 'pencil'
                        label: string
                        desc: string
                        badge?: string
                        disabled?: boolean
                        action?: () => void
                      }[]).map(item => (
                        <button
                          key={item.label}
                          type="button"
                          className="lp-dropdown-btn"
                          disabled={item.disabled}
                          style={item.disabled ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                          onClick={item.disabled ? undefined : item.action}
                        >
                          <span style={{ color: item.icon === 'sparkle' ? '#a78bfa' : 'var(--text-secondary)', flexShrink: 0, marginTop: '0.1875rem', width: '1.5rem', display: 'inline-flex', justifyContent: 'flex-start' }}>
                            {item.icon === 'pencil' && <PencilSimple size={16} weight="duotone" />}
                            {item.icon === 'sparkle' && <Sparkle size={16} weight="duotone" />}
                            {item.icon === 'upload' && <UploadSimple size={16} weight="duotone" />}
                            {item.icon === 'api' && <ArrowsLeftRight size={16} weight="duotone" />}
                          </span>
                          <span style={{ display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                              {item.label}
                              {item.badge && (
                                <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                  {item.badge}
                                </span>
                              )}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{item.desc}</span>
                          </span>
                        </button>
                      ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ height: 1, margin: '0.25rem 0.375rem', background: 'var(--border-subtle)' }} />

          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setNovoSubmenu('painel')}
            onMouseLeave={() => setNovoSubmenu(null)}
          >
            <button type="button" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '0.5rem', padding: '0.5rem 0.625rem', border: 'none', borderRadius: '0.5rem',
              background: novoSubmenu === 'painel' ? 'var(--bg-hover)' : 'transparent',
              color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 600,
              cursor: 'pointer', width: '100%', fontFamily: 'inherit',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', background: 'rgba(139,92,246,0.12)', flexShrink: 0 }}>
                  <SquaresFour size={13} weight="duotone" style={{ color: '#a78bfa' }} />
                </span>
                {t('bid_frete_internacional.lista.painel_novo', { defaultValue: 'Novo painel' })}
              </span>
              <CaretRight size={11} weight="bold" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            </button>

            {novoSubmenu === 'painel' && (
              <div style={{ position: 'absolute', left: '100%', top: 0, paddingLeft: '8px', zIndex: 301 }}>
                <form
                  style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: '0.625rem', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
                    minWidth: '220px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem',
                  }}
                onSubmit={e => {
                  e.preventDefault()
                  const nome = novoNomePainelLista.trim()
                  if (!nome) return
                  void (async () => {
                    const ok = await handleCriarPainelLista(nome)
                    if (!ok) return
                    setNovoNomePainelLista('')
                    setNovoDropdownAberto(false)
                    setNovoSubmenu(null)
                  })()
                }}
                onClick={e => e.stopPropagation()}
              >
                <input
                  autoFocus
                  type="text"
                  placeholder={t('bid_frete_internacional.lista.painel_novo_placeholder', {
                    defaultValue: 'Ex.: Exportação Q2',
                  })}
                  value={novoNomePainelLista}
                  onChange={e => setNovoNomePainelLista(e.target.value)}
                  maxLength={60}
                  style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.375rem',
                    padding: '0.375rem 0.5rem',
                    fontSize: '0.8125rem',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.375rem 0.625rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: 'rgba(139,92,246,0.25)',
                    color: '#c4b5fd',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {t('bid_frete_internacional.lista.painel_criar', { defaultValue: 'Criar' })}
                </button>
              </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

      {/* Duplicar — paridade Lista de Pedidos: ícone + tooltip (sem rótulo na barra) */}
      <TooltipGlobal
        titulo={(() => {
          const labelBid = bidsSelecionados.length === 1
            ? t('bidfrete.lista.label_bid_one', { defaultValue: 'BID' })
            : t('bidfrete.lista.label_bid_other', { defaultValue: 'BIDs' })
          const labelCotacao = cotacoesSelecionadasParaAcao.length === 1
            ? t('bidfrete.lista.label_cotacao_one', { defaultValue: 'cotação' })
            : t('bidfrete.lista.label_cotacao_other', { defaultValue: 'cotações' })
          const rotulo = t('bidfrete.lista.duplicar', { defaultValue: 'Duplicar' })
          if (bidsSelecionados.length > 0 && cotacoesSelecionadasParaAcao.length > 0) {
            return `${rotulo} · ${bidsSelecionados.length} ${labelBid} + ${cotacoesSelecionadasParaAcao.length} ${labelCotacao}`
          }
          if (bidsSelecionados.length > 0) {
            return `${rotulo} · ${bidsSelecionados.length} ${labelBid}`
          }
          if (cotacoesSelecionadasParaAcao.length > 0) {
            return `${rotulo} · ${cotacoesSelecionadasParaAcao.length} ${labelCotacao}`
          }
          return rotulo
        })()}
        descricao={t('bidfrete.lista.duplicar_desc', { defaultValue: 'Duplicar BID ou cotação selecionados (cópia nasce em rascunho)' })}
      >
        <BotaoGlobal
          variante="secundario"
          tamanho="pequeno"
          icone={<StackPlus size={14} weight="duotone" />}
          aria-label={t('bidfrete.lista.duplicar', { defaultValue: 'Duplicar selecionados' })}
          disabled={totalSelecionados === 0 || duplicando}
          onClick={() => void handleDuplicarSelecionados()}
        />
      </TooltipGlobal>

      {/* Excluir — paridade Lista de Pedidos: ícone vermelho + tooltip */}
      <TooltipGlobal
        titulo={(() => {
          const labelBid = bidsSelecionados.length === 1
            ? t('bidfrete.lista.label_bid_one', { defaultValue: 'BID' })
            : t('bidfrete.lista.label_bid_other', { defaultValue: 'BIDs' })
          const labelCotacao = cotacoesSelecionadasParaAcao.length === 1
            ? t('bidfrete.lista.label_cotacao_one', { defaultValue: 'cotação' })
            : t('bidfrete.lista.label_cotacao_other', { defaultValue: 'cotações' })
          const rotulo = t('bidfrete.lista.excluir', { defaultValue: 'Excluir' })
          if (bidsSelecionados.length > 0 && cotacoesSelecionadasParaAcao.length > 0) {
            return `${rotulo} · ${bidsSelecionados.length} ${labelBid} e ${cotacoesSelecionadasParaAcao.length} ${labelCotacao}`
          }
          if (bidsSelecionados.length > 0) {
            return `${rotulo} · ${bidsSelecionados.length} ${labelBid}`
          }
          if (cotacoesSelecionadasParaAcao.length > 0) {
            return `${rotulo} · ${cotacoesSelecionadasParaAcao.length} ${labelCotacao}`
          }
          return rotulo
        })()}
        descricao={t('bidfrete.lista.excluir_desc', { defaultValue: 'Excluir BID ou cotação selecionados (rascunho ou nunca enviados)' })}
      >
        <BotaoGlobal
          variante="perigo"
          tamanho="pequeno"
          icone={<Trash size={14} weight="duotone" />}
          aria-label={t('bidfrete.lista.excluir', { defaultValue: 'Excluir selecionados' })}
          disabled={totalSelecionados === 0}
          onClick={() => setModalExcluirAberto(true)}
        />
      </TooltipGlobal>
    </div>
  ), [
    novoDropdownAberto, novoSubmenu, novoNomePainelLista, handleCriarPainelLista,
    navigate, t, temExpandido, totalSelecionados, duplicando, handleDuplicarSelecionados,
    bidsSelecionados.length, cotacoesSelecionadasParaAcao.length, linhasPaiFiltradas,
  ])

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
      case 'cotacoes_em_atraso':
        return (
          <CardBasicoGlobal
            key="cotacoes_em_atraso"
            titulo={t('bidfrete.cotacoes.kpi.emAtraso.titulo', 'Cotações em Atraso')}
            icone={<Clock weight="duotone" size={16} style={{ color: '#fb923c' }} />}
            valor={stats.cotacoesEmAtraso}
            variante="aviso"
            subtexto={t('bidfrete.cotacoes.kpi.emAtraso.subtexto', 'Prazo de resposta vencido')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.emAtraso.tooltipTotal', 'Total em atraso')}</span>
                  <strong style={{ color: '#fb923c' }}>{stats.cotacoesEmAtraso}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.emAtraso.tooltipCriterio', 'Critério')}</span>
                  <strong>{t('bidfrete.cotacoes.kpi.emAtraso.tooltipCriterioValor', 'Prazo anterior a hoje · em aberto')}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.emAtraso.tooltipExpiradas', 'Já marcadas como expiradas')}</span>
                  <strong>{stats.expiradas}</strong>
                </div>
              </>
            }
          />
        )
      case 'cotacoes_acima_meta': {
        const { quantidade, percentualMedioAcima, percentualDoTotalComMeta, totalComMetaAvaliavel, detalhes } =
          metricasAcimaMeta30d
        const subtextoPercentual = percentualMedioAcima != null
          ? t('bidfrete.cotacoes.kpi.acimaMeta.subtextoComMedia', {
            percentual: fmtQuantidade(percentualMedioAcima, 1),
            defaultValue: `+${fmtQuantidade(percentualMedioAcima, 1)}% acima da meta (média)`,
          })
          : t('bidfrete.cotacoes.kpi.acimaMeta.subtextoVazio', 'Nenhuma cotação acima da meta')
        return (
          <CardBasicoGlobal
            key="cotacoes_acima_meta"
            titulo={t('bidfrete.cotacoes.kpi.acimaMeta.titulo', 'Cotações acima da meta')}
            icone={<Target weight="duotone" size={16} style={{ color: '#f87171' }} />}
            valor={quantidade}
            variante={quantidade > 0 ? 'perigo' : undefined}
            subtexto={subtextoPercentual}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.acimaMeta.tooltipPeriodo', 'Período')}</span>
                  <strong>{t('bidfrete.cotacoes.kpi.acimaMeta.tooltipPeriodoValor', 'Últimos 30 dias')}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.acimaMeta.tooltipTotal', 'Acima da meta')}</span>
                  <strong style={{ color: '#f87171' }}>{quantidade}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.acimaMeta.tooltipComMeta', 'Com meta e proposta')}</span>
                  <strong>{totalComMetaAvaliavel}</strong>
                </div>
                {percentualDoTotalComMeta != null && (
                  <div className="cg-tooltip__row">
                    <span>{t('bidfrete.cotacoes.kpi.acimaMeta.tooltipPercentualPeriodo', '% do período')}</span>
                    <strong>{fmtQuantidade(percentualDoTotalComMeta, 1)}%</strong>
                  </div>
                )}
                {percentualMedioAcima != null && (
                  <div className="cg-tooltip__row">
                    <span>{t('bidfrete.cotacoes.kpi.acimaMeta.tooltipMediaAcima', 'Média acima da meta')}</span>
                    <strong>+{fmtQuantidade(percentualMedioAcima, 1)}%</strong>
                  </div>
                )}
                {detalhes.length > 0 ? (
                  detalhes.map(item => (
                    <div key={item.id} className="cg-tooltip__row">
                      <span>{item.numero}</span>
                      <strong>
                        {item.moeda} {fmtQuantidade(item.valorReferencia, 2)}
                        {' '}
                        (+{fmtQuantidade(item.percentualAcima, 1)}%)
                      </strong>
                    </div>
                  ))
                ) : (
                  <div className="cg-tooltip__row">
                    <span>{t('bidfrete.cotacoes.kpi.acimaMeta.tooltipVazio', 'Nenhuma nos últimos 30 dias')}</span>
                    <strong>—</strong>
                  </div>
                )}
              </>
            }
          />
        )
      }
      default: {
        const defCustom = listarCardsCatalogo().find(c => c.id === id)
        if (!defCustom) return null
        const valorMetrica = calcularMetricaCardCustom(defCustom, cotacoesParaKpi)
        const valorFormatado = formatarValorCardCustom(defCustom, valorMetrica, fmtQuantidade)
        const metricaId = decodeMetricaCard(defCustom.descKey)
        const metricaLabel = metricaId
          ? t(`bidfrete.config.cards.${metricaId}`, defCustom.descricao)
          : defCustom.descricao
        return (
          <CardBasicoGlobal
            key={id}
            titulo={defCustom.labelKey}
            icone={resolverIconeCard(defCustom.icone, 16, defCustom.cor ?? 'var(--ws-accent, #818cf8)')}
            valor={valorFormatado}
            subtexto={metricaLabel}
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
  }, [stats, cotacoesParaKpi, metricasAcimaMeta30d, t])

  const tituloTopo = useMemo(() => {
    if (!carregando) return null
    const icone = visao === 'kanban'
      ? <Kanban weight="duotone" size={22} />
      : <ListBullets weight="duotone" size={22} />
    return criarTituloCarregandoTopo(icone, t)
  }, [carregando, visao, t])

  useSincronizarTituloPaginaTopo(tituloTopo)

  // ─── Render ───

  return (
    <div className="bf-lista-page bf-cotacoes bid-frete-page-shell">
      {carregando ? (
        <ConteudoCarregandoBidFreteInternacional />
      ) : (
        <>
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
        <div className="lp-tabela-wrapper lp-tabela-wrapper--faixa-unificada">
        <div className="lp-tabela-chrome">
          <BidFreteListaFaixaNavegacao
            paineis={paineisLista}
            painelAtualId={painelListaAtualId}
            setPaineis={setPaineisLista}
            setPainelAtualId={setPainelListaAtualId}
            onTrocarPainel={handleTrocarPainelLista}
            onCriarPainel={handleCriarPainelLista}
            carregando={carregandoPaineisLista}
            abas={abas}
            abaAtiva={filtroTab}
            onMudarAba={setFiltroTab}
          />
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
            renderConectorPai={renderConectorPai}
            filhoId={idLinhaFilhaLista}

            imperativeRef={tabelaRef}
            onExpandidosMudar={handleExpandidosMudar}
            onSelecaoMudar={setLinhasPaiSelecionadas}
            selecionavelFilhos
            onSelecaoFilho={handleSelecaoFilho}
            resetSelecaoFilhos={resetSelecaoFilhos}
            
            itensPorPagina={tabelaConfig.linhasPorPagina}
            totalItens={linhasPaiFiltradas.length}
            totalFilhos={totalCotacoesFiltradas}
            paginaAtual={paginaLista}
            onMudarPagina={setPaginaLista}
            classNameLinhaPai={classNameLinhaPai}
            classNameLinhaFilho={classNameLinhaFilho}
            labelPai={['registro', 'registros']}
            
            acoes={acoes}
            acoesFilho={acoesFilho}
            acoesExportacao={acoesExportacao}
            acoesBarra={acoesBarra}
            
            onBuscar={setBusca}
            modoLocalizar={true}
            placeholderBusca="Buscar por processo, referência, origem ou destino..."
            
            camposEditaveis={CAMPOS_EDITAVEIS_LISTA}
            camposEditaveisFilhos={CAMPOS_EDITAVEIS_LISTA}
            onEditar={handleEditar}
            onEditarFilho={handleEditarFilho}
            onSalvoComSucesso={() => addNotification({ type: 'success', message: 'Campo atualizado com sucesso.' })}
            onErroAoSalvar={(msg) => addNotification({ type: 'error', message: msg })}
            
            arrastavelPai={true}
            onReordenarPai={handleReordenarCotacoes}
            
            preferencias={preferencias}
            onSalvarPreferencias={handleSalvarPreferencias}
            colunasPadrao={COLUNAS_PADRAO_VISIVEIS}
            
            emptyIcon={<Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
            emptyTitle={t('bidfrete.cotacoes.vazio')}
            emptyDescription="Nenhuma cotação encontrada com os filtros selecionados."
            
            ariaLabel="Lista de Cotações"
          />
        </div>
        </div>
      ) : (
        <CotacoesKanban
          cotacoes={cotacoesFiltradas}
          onRefresh={carregar}
        />
      )}

        </>
      )}

      <ModalNovoBidFreteInternacional
        aberto={modalNovoBidAberto}
        aoFechar={() => setModalNovoBidAberto(false)}
        aoCriarBid={() => { void carregar() }}
      />

      {modalExcluirAberto && totalSelecionados > 0 && (
        <ModalExcluirListaBidFreteInternacional
          aberto
          aoFechar={() => setModalExcluirAberto(false)}
          idsBidsSelecionados={idsBidsParaExclusao}
          idsCotacoesSelecionadas={idsCotacoesParaExclusao}
          aoExcluido={handleExcluidoLote}
        />
      )}

      <style>{`
        /* Destaque: cotação com menos de 2h para expirar (config Tabela) — layout em bid-frete-page-shell.css */

        /* ── Expandir/Recolher todos (paridade Lista de Pedidos) ── */
        .bf-btn-expandir-todos {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 8px;
          color: var(--ws-muted, #94a3b8);
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .bf-btn-expandir-todos:hover {
          background: var(--bg-hover, rgba(255,255,255,0.06));
          color: var(--text-primary, #f1f5f9);
        }

        /* Propostas (filhas de cotação avulsa) não são selecionáveis */
        .bf-linha-filha-proposta .gtv-checkbox--filho {
          display: none;
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
    </div>
  )
}
