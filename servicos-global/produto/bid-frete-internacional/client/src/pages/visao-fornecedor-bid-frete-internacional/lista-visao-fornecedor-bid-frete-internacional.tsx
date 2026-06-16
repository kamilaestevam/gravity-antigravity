/**
 * Lista + Kanban — Visão fornecedor (paridade com lista-bid-frete-internacional operacional).
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import {
  FiltroChips,
  FiltroPopoverColuna,
  TabelaVirtualGlobal,
} from '@nucleo/tabela-virtual-global'
import type { GTColuna, GTPreferencias } from '@nucleo/tabela-virtual-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  ClipboardText,
  CurrencyDollar,
  Eye,
  Kanban,
  ListBullets,
  Package,
  Trash,
  X,
} from '@phosphor-icons/react'

import { KanbanFornecedorConteudo } from './kanban-fornecedor-conteudo'
import { BidFreteListaFaixaNavegacao } from '../../components/BidFreteListaFaixaNavegacao'
import '../../shared/lista-bid-frete-internacional-layout.css'
import {
  estiloChromeTabelaListaBidFreteInternacional,
  estiloWrapperTabelaListaBidFreteInternacional,
} from '../../shared/altura-tabela-lista-bid-frete-internacional'
import { useSincronizarTituloPaginaTopo } from '../../shared/useSincronizarTituloPaginaTopo'
import {
  criarTituloCarregandoTopo,
  ConteudoCarregandoBidFreteInternacional,
} from '../../shared/pagina-carregando-bid-frete-internacional'
import { useShellStore } from '@gravity/shell'
import { getVisaoFornecedorBidFreteInternacionalCotacoesPendentes, paineisListaBidFreteApi } from '../../shared/api'
import type { Cotacao, DisparoCotacaoBidFreteInternacional } from '../../shared/types'
import {
  disparosParaListaFornecedor,
  navegarOportunidadeFornecedor,
  type FunilPorCotacaoMap,
} from '../../shared/lista-visao-fornecedor-bid-frete-dados'
import {
  gerarAbasListaFornecedor,
  gerarOpcoesStatusFiltroListaFornecedor,
} from '../../shared/lista-visao-fornecedor-bid-frete-abas'
import {
  lerIdsOportunidadesOcultasFornecedor,
  ocultarOportunidadesFornecedor,
} from '../../shared/lista-visao-fornecedor-ocultas-bid-frete-internacional'
import type { FiltroAtivo, FiltrosAtivosMap } from '../../components/lista/filtros'
import {
  calcularValoresUnicosPorCampoBidFrete,
  cotacaoPassaFiltrosColuna,
  detectarTipoColunaBidFrete,
  getLabelsFiltroInversoBidFrete,
  resolverValoresUnicosPopoverBidFrete,
} from '../../shared/filtros-coluna-lista-bid-frete-internacional'
import type { OpcoesColunasLista } from '../colunas-lista-bid-frete-internacional'
import {
  COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
  lerPreferenciasTabelaFornecedor,
  salvarPreferenciasTabelaFornecedor,
} from '../../shared/lista-visao-fornecedor-preferencias-tabela'
import { ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL } from '../../shared/rotas-bid-frete-internacional'
import { calcularStatsListaFornecedor } from '../../shared/lista-visao-fornecedor-bid-frete-kpi-metrics'
import { montarAcoesExportacaoListaBidFrete } from '../../shared/acoes-exportacao-lista-bid-frete-internacional'
import { filtrarCotacoesPorPeriodoCards } from '../../shared/lista-bid-frete-card-periodo'
import { useCardPreferencesBidFrete, CARD_PERIODOS, type CardPeriodoCodigo } from '../../shared/use-card-preferences'
import {
  carregarTabelaConfigBidFrete,
  HORAS_LIMITE_DESTAQUE_EXPIRACAO,
  SYNC_EVENT_TABELA_BID_FRETE,
} from '../../shared/tabela-config-bid-frete'
import { SYNC_EVENT_FORMATO_DATA_BID_FRETE } from '../../shared/formato-data-bid-frete'
import {
  buildColunasExportListaFornecedor,
  buildColunasListaFornecedor,
  formatValorExportColunaFornecedor,
} from './colunas-lista-visao-fornecedor-bid-frete-internacional'
import { cotacaoPrestesAExpirar } from '../lista-bid-frete-internacional-utils'
import { fmtQuantidade } from '../colunas-lista-bid-frete-internacional'
import { useListaPainelFornecedorBidFrete } from '../../shared/useListaPainelFornecedorBidFrete'
import {
  configListaPainelPadraoV1,
  parsearConfigListaPainelSeguro,
  serializarConfigListaPainel,
} from '../../../../shared/listaPainelConfigSchema'
import '../kanban-bid-frete-internacional.css'

function ToggleVisaoListaKanbanFornecedor({
  visao,
  onLista,
  onKanban,
  labelToggle,
}: {
  visao: 'lista' | 'kanban'
  onLista: () => void
  onKanban: () => void
  labelToggle: string
}) {
  return (
    <div className="bf-toggle-group" role="group" aria-label={labelToggle}>
      <button
        type="button"
        className={`bf-toggle-btn ${visao === 'lista' ? 'bf-toggle-btn--ativo' : ''}`}
        aria-pressed={visao === 'lista'}
        onClick={onLista}
        title="Lista"
      >
        <ListBullets size={18} weight="duotone" />
      </button>
      <button
        type="button"
        className={`bf-toggle-btn ${visao === 'kanban' ? 'bf-toggle-btn--ativo' : ''}`}
        aria-pressed={visao === 'kanban'}
        onClick={onKanban}
        title="Kanban"
      >
        <Kanban size={18} weight="duotone" />
      </button>
    </div>
  )
}

export default function ListaVisaoFornecedorBidFreteInternacional() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const meStatus = useShellStore(s => s.meStatus)
  const addNotification = useShellStore(s => s.addNotification)
  const idUsuario = useShellStore(s => s.currentUser.id)
  const idOrganizacao = useShellStore(s => s.currentUser.idOrganizacao)
  const visao: 'lista' | 'kanban' = location.pathname.includes('/kanban') ? 'kanban' : 'lista'

  const [disparos, setDisparos] = useState<DisparoCotacaoBidFreteInternacional[]>([])
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [funilPorCotacaoId, setFunilPorCotacaoId] = useState<FunilPorCotacaoMap>(new Map())
  const [disparoPorCotacaoId, setDisparoPorCotacaoId] = useState(
    () => new Map<string, DisparoCotacaoBidFreteInternacional>(),
  )
  const [carregando, setCarregando] = useState(true)
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroTab, setFiltroTab] = useState<string>('TODAS')
  const [filtrosAtivosLista, setFiltrosAtivosLista] = useState<FiltrosAtivosMap>({})
  const filtrosAtivosKeys = useMemo(
    () => new Set(Object.keys(filtrosAtivosLista)),
    [filtrosAtivosLista],
  )
  const [popoverFiltroAberto, setPopoverFiltroAberto] = useState<string | null>(null)
  const [popoverFiltroPos, setPopoverFiltroPos] = useState({ top: 0, left: 0 })
  const [selecionados, setSelecionados] = useState<Cotacao[]>([])
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [idsOcultos, setIdsOcultos] = useState(() => lerIdsOportunidadesOcultasFornecedor())

  const opcoesColunasLista = useMemo(
    (): OpcoesColunasLista => ({
      statusOpcoes: gerarOpcoesStatusFiltroListaFornecedor(t),
    }),
    [t],
  )

  const abas = useMemo(() => gerarAbasListaFornecedor(t), [t])
  const {
    visiveis: cardsVisiveis,
    periodo: periodoCards,
    setPeriodo: setPeriodoCards,
    persistir: persistirCardPrefs,
    prefs: cardPrefs,
  } = useCardPreferencesBidFrete('fornecedor')

  const [tabelaConfig, setTabelaConfig] = useState(carregarTabelaConfigBidFrete)
  const [paginaLista, setPaginaLista] = useState(1)
  const [formatoDataVersion, setFormatoDataVersion] = useState(0)
  const [preferencias, setPreferencias] = useState<GTPreferencias | undefined>(() => lerPreferenciasTabelaFornecedor())

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
  } = useListaPainelFornecedorBidFrete()
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
    setFiltrosAtivos: setFiltrosAtivosLista,
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
      const prefsLocal = lerPreferenciasTabelaFornecedor()
      const configAtual = parsearConfigListaPainelSeguro(
        painelListaAtual.config_json,
        configListaPainelPadraoV1(),
        { id_painel: painelListaAtual.id, origem: 'lista-fornecedor.migracaoLocalStorage' },
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
        setPreferencias({
          colunas_visiveis: merged.colunas_visiveis,
          colunas_largura: merged.colunas_largura,
        })
      } else if (configAtual.colunas_visiveis.length === 0) {
        const merged = configListaPainelPadraoV1({
          ...configAtual,
          colunas_visiveis: COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
        })
        void paineisListaBidFreteApi.atualizar(painelListaAtual.id, {
          config_json: serializarConfigListaPainel(merged),
        })
        setPreferencias({ colunas_visiveis: merged.colunas_visiveis })
      }
      migrouLocalStoragePainelRef.current = true
    }
  }, [painelListaAtual, carregandoPaineisLista, aplicarConfigDoPainel, listaPainelCallbacks])

  const estadoListaParaPainel = useCallback(() => ({
    preferencias,
    abaAtiva: filtroTab,
    sortCampo: 'numero_cotacao_bid_frete_internacional',
    sortDir: 'desc' as const,
    busca,
    filtrosAtivos: filtrosAtivosLista,
    cardsVisiveisIds: cardsVisiveis.map(c => c.id),
    periodoCards,
  }), [preferencias, filtroTab, busca, filtrosAtivosLista, cardsVisiveis, periodoCards])

  const handleTrocarPainelLista = useCallback((id: string) => {
    painelListaAplicadoRef.current = null
    void trocarPainelLista(id, estadoListaParaPainel(), listaPainelCallbacks)
  }, [trocarPainelLista, estadoListaParaPainel, listaPainelCallbacks])

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
          : t('bid_frete_internacional.lista.painel_criado_erro', { defaultValue: 'Não foi possível salvar o painel.' }),
      })
      return false
    }
  }, [criarPainelLista, estadoListaParaPainel, listaPainelCallbacks, addNotification, t])

  useEffect(() => {
    if (!painelListaAtualId || carregandoPaineisLista) return
    if (painelListaAplicadoRef.current !== painelListaAtualId) return
    persistirPainelAtual(estadoListaParaPainel())
  }, [
    preferencias, filtroTab, busca, painelListaAtualId, carregandoPaineisLista,
    persistirPainelAtual, estadoListaParaPainel, cardsVisiveis, periodoCards, filtrosAtivosLista,
  ])

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

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErroCarregar(null)
    try {
      const lista = await getVisaoFornecedorBidFreteInternacionalCotacoesPendentes()
      setDisparos(lista)
      const { cotacoes: cot, funilPorCotacaoId: funil, disparoPorCotacaoId: porCot } = disparosParaListaFornecedor(lista)
      setCotacoes(cot)
      setFunilPorCotacaoId(funil)
      setDisparoPorCotacaoId(porCot)
    } catch (e: unknown) {
      setDisparos([])
      setCotacoes([])
      setFunilPorCotacaoId(new Map())
      setDisparoPorCotacaoId(new Map())
      setErroCarregar(e instanceof Error ? e.message : 'Erro ao carregar oportunidades')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (meStatus !== 'success' || !idUsuario || !idOrganizacao) return
    void carregar()
  }, [carregar, meStatus, idUsuario, idOrganizacao])

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    salvarPreferenciasTabelaFornecedor(prefs)
    if (painelListaAtualId) {
      persistirPainelAtualImediato({
        preferencias: prefs,
        abaAtiva: filtroTab,
        sortCampo: 'numero_cotacao_bid_frete_internacional',
        sortDir: 'desc',
        busca,
        filtrosAtivos: filtrosAtivosLista,
        cardsVisiveisIds: cardsVisiveis.map(c => c.id),
        periodoCards,
      })
    }
  }, [
    painelListaAtualId, persistirPainelAtualImediato, filtroTab, busca,
    cardsVisiveis, periodoCards, filtrosAtivosLista,
  ])

  const abrirOportunidade = useCallback((item: Cotacao) => {
    const disparo = disparoPorCotacaoId.get(item.id_cotacao_bid_frete_internacional)
    if (disparo) {
      navegarOportunidadeFornecedor(navigate, ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL, disparo)
    }
  }, [navigate, disparoPorCotacaoId])

  const colunasTabela = useMemo(
    () => buildColunasListaFornecedor(t, abrirOportunidade),
    [t, abrirOportunidade, formatoDataVersion],
  )
  const colunasExport = useMemo(
    () => buildColunasExportListaFornecedor(t),
    [t, formatoDataVersion],
  )

  const colunasPorCampoMap = useMemo(() => {
    const map = new Map<string, GTColuna<Cotacao>>()
    for (const col of colunasTabela) {
      if (col.key) map.set(String(col.key), col)
    }
    return map
  }, [colunasTabela])

  const colunasSeletorLista = useMemo(
    () => colunasTabela.map(c => ({
      key: String(c.key),
      label: c.label,
      naoOcultavel: c.naoOcultavel,
    })),
    [colunasTabela],
  )

  const labelsFiltroCtx = useMemo(
    () => ({ statusOpcoes: opcoesColunasLista.statusOpcoes }),
    [opcoesColunasLista.statusOpcoes],
  )

  const cotacoesVisiveis = useMemo(
    () => cotacoes.filter(c => !idsOcultos.has(c.id_cotacao_bid_frete_internacional)),
    [cotacoes, idsOcultos],
  )

  const valoresUnicosPorCampo = useMemo(
    () => calcularValoresUnicosPorCampoBidFrete(
      cotacoesVisiveis,
      colunasTabela,
      opcoesColunasLista,
      labelsFiltroCtx,
    ),
    [cotacoesVisiveis, colunasTabela, opcoesColunasLista, labelsFiltroCtx],
  )

  const handleAplicarFiltroColuna = useCallback((campo: string, filtro: FiltroAtivo) => {
    setFiltrosAtivosLista(prev => ({ ...prev, [campo]: filtro }))
  }, [])

  const handleLimparFiltroColuna = useCallback((campo: string) => {
    setFiltrosAtivosLista(prev => {
      const novo = { ...prev }
      delete novo[campo]
      return novo
    })
  }, [])

  const handleLimparTodosFiltrosColuna = useCallback(() => {
    setFiltrosAtivosLista({})
    setBusca('')
  }, [])

  const onFiltroColuna = useCallback((key: string, anchor: HTMLElement) => {
    setPopoverFiltroAberto(prev => prev === key ? null : key)
    const rect = anchor.getBoundingClientRect()
    const page = anchor.closest('.bf-lista-page') as HTMLElement | null
    const offset = page ? page.getBoundingClientRect() : { top: 0, left: 0 }
    const maxW = page ? page.clientWidth : window.innerWidth
    const adjustedLeft = rect.left - offset.left
    const left = Math.max(0, Math.min(adjustedLeft, maxW - 292))
    setPopoverFiltroPos({ top: rect.bottom + 4 - offset.top, left })
  }, [])

  const handleOrdenarFiltroColuna = useCallback((_campo: string, _dir: 'asc' | 'desc') => {
    /* ordenação fixa na lista fornecedor */
  }, [])

  const filtrarCotacaoItem = useCallback((c: Cotacao): boolean => {
    if (filtroTab !== 'TODAS' && c.status_cotacao_bid_frete_internacional !== filtroTab) {
      return false
    }
    if (busca.trim()) {
      const term = busca.toLowerCase()
      if (
        !c.numero_cotacao_bid_frete_internacional.toLowerCase().includes(term)
        && !(c.referencia_interna_cotacao_bid_frete_internacional ?? '').toLowerCase().includes(term)
        && !c.origem_nome_cotacao_bid_frete_internacional.toLowerCase().includes(term)
        && !c.destino_nome_cotacao_bid_frete_internacional.toLowerCase().includes(term)
      ) {
        return false
      }
    }
    if (Object.keys(filtrosAtivosLista).length > 0) {
      return cotacaoPassaFiltrosColuna(
        c,
        filtrosAtivosLista,
        colunasPorCampoMap,
        opcoesColunasLista,
        labelsFiltroCtx,
      )
    }
    return true
  }, [
    filtroTab,
    busca,
    filtrosAtivosLista,
    colunasPorCampoMap,
    opcoesColunasLista,
    labelsFiltroCtx,
  ])

  const cotacoesFiltradas = useMemo(
    () => cotacoesVisiveis.filter(filtrarCotacaoItem),
    [cotacoesVisiveis, filtrarCotacaoItem],
  )

  const cotacoesPagina = useMemo(() => {
    const inicio = (paginaLista - 1) * tabelaConfig.linhasPorPagina
    return cotacoesFiltradas.slice(inicio, inicio + tabelaConfig.linhasPorPagina)
  }, [cotacoesFiltradas, paginaLista, tabelaConfig.linhasPorPagina])

  const labelCotacaoPaginacao = useMemo(
    (): [string, string] => [
      t('bidfrete.lista.label_cotacao_one', 'cotação'),
      t('bidfrete.lista.label_cotacao_other', 'cotações'),
    ],
    [t],
  )

  useEffect(() => {
    setPaginaLista(1)
  }, [filtroTab, busca, tabelaConfig.linhasPorPagina, filtrosAtivosLista])

  const handleConfirmarExcluir = useCallback(() => {
    const ids = selecionados.map(c => c.id_cotacao_bid_frete_internacional)
    ocultarOportunidadesFornecedor(ids)
    setIdsOcultos(lerIdsOportunidadesOcultasFornecedor())
    setSelecionados([])
    addNotification({
      type: 'success',
      message: t(
        'bidfrete.visao_fornecedor_bid_frete_internacional.lista.excluir_sucesso',
        'Oportunidade(s) removida(s) da sua lista.',
      ),
    })
  }, [selecionados, addNotification, t])

  const cotacoesParaKpi = useMemo(
    () => filtrarCotacoesPorPeriodoCards(cotacoesFiltradas, periodoCards),
    [cotacoesFiltradas, periodoCards],
  )

  const stats = useMemo(
    () => calcularStatsListaFornecedor(cotacoesParaKpi, funilPorCotacaoId),
    [cotacoesParaKpi, funilPorCotacaoId],
  )

  const classNameLinha = useCallback((linha: Cotacao) => {
    if (!tabelaConfig.destacarAtrasados) return undefined
    return cotacaoPrestesAExpirar(linha, HORAS_LIMITE_DESTAQUE_EXPIRACAO)
      ? 'gtv-linha--expira-prestes'
      : undefined
  }, [tabelaConfig.destacarAtrasados])

  const acoes = useMemo(() => [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.acao_abrir', 'Abrir'),
      onClick: (item: Cotacao) => abrirOportunidade(item),
    },
    {
      id: 'excluir',
      icone: <Trash weight="duotone" size={16} />,
      tooltip: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.acao_excluir', 'Remover da lista'),
      onClick: (item: Cotacao) => {
        setSelecionados([item])
        setModalExcluirAberto(true)
      },
    },
  ], [abrirOportunidade, t])

  const acoesExportacao = useMemo(
    () => montarAcoesExportacaoListaBidFrete({
      colunas: colunasExport,
      preferencias,
      colunasPadrao: COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
      dados: cotacoesFiltradas,
      formatValorExport: (key, row) => formatValorExportColunaFornecedor(key, row, t),
      nomeArquivo: 'oportunidades_fornecedor',
      titulo: t(
        'bidfrete.visao_fornecedor_bid_frete_internacional.lista.export_titulo',
        'Oportunidades — Visão Fornecedor',
      ),
    }),
    [colunasExport, preferencias, cotacoesFiltradas, t],
  )

  const toggleVisao = (
    <ToggleVisaoListaKanbanFornecedor
      visao={visao}
      onLista={() => navigate(ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.lista)}
      onKanban={() => navigate(ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.kanban)}
      labelToggle={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.toggle_visao', 'Alternar visualização')}
    />
  )

  const acoesBarra = useMemo(() => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
      {(Object.keys(filtrosAtivosLista).length > 0 || busca.trim()) && (
        <FiltroChips
          colunas={colunasTabela}
          filtrosAtivos={filtrosAtivosLista}
          onLimparFiltro={handleLimparFiltroColuna}
          onLimparTodos={handleLimparTodosFiltrosColuna}
          onEditarFiltro={onFiltroColuna}
          thresholdConsolidar={2}
          prefixo={busca.trim() ? (
            <span className="fc-chip">
              <span className="fc-chip-label">{t('bidfrete.lista.chip_busca', { defaultValue: 'Busca' })}:</span>
              <span className="fc-chip-valor">{busca}</span>
              <button
                type="button"
                className="fc-chip-remove"
                onClick={() => setBusca('')}
                aria-label={t('bidfrete.lista.remover_busca', { defaultValue: 'Remover busca' })}
              >
                <X size={10} weight="bold" />
              </button>
            </span>
          ) : null}
        />
      )}

      <TooltipGlobal
        titulo={selecionados.length > 0
          ? t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.excluir_selecionados', {
              defaultValue: 'Remover {{n}} oportunidade(s) da lista',
              n: selecionados.length,
            })
          : t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.excluir', 'Remover da lista')}
        descricao={t(
          'bidfrete.visao_fornecedor_bid_frete_internacional.lista.excluir_desc',
          'Remove as oportunidades selecionadas apenas da sua visualização.',
        )}
      >
        <BotaoGlobal
          variante="perigo"
          tamanho="pequeno"
          icone={<Trash size={14} weight="duotone" />}
          aria-label={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.excluir', 'Remover da lista')}
          disabled={selecionados.length === 0}
          onClick={() => setModalExcluirAberto(true)}
        />
      </TooltipGlobal>
    </div>
  ), [
    filtrosAtivosLista, busca, colunasTabela, handleLimparFiltroColuna,
    handleLimparTodosFiltrosColuna, onFiltroColuna, selecionados.length, t,
  ])

  const renderCard = useCallback((id: string) => {
    switch (id) {
      case 'total_cotacoes':
        return (
          <CardBasicoGlobal
            key="total_cotacoes"
            titulo={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.kpi_oportunidades', 'Oportunidades')}
            icone={<Package weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
            valor={stats.total}
            subtexto={t(
              'bidfrete.visao_fornecedor_bid_frete_internacional.lista.kpi_oportunidades_desc',
              'Convites e cotações no seu funil',
            )}
          />
        )
      case 'valor_total_frete':
        return (
          <CardBasicoGlobal
            key="valor_total_frete"
            titulo={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.kpi_valor_aprovado', 'Valor aprovado')}
            icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
            valor={`${stats.moedaPrincipal} ${fmtQuantidade(stats.valorPropostasAprovadas, 2)}`}
            variante="sucesso"
            subtexto={t(
              'bidfrete.visao_fornecedor_bid_frete_internacional.lista.kpi_valor_aprovado_desc',
              'Soma das suas propostas aprovadas no período',
            )}
          />
        )
      case 'propostas_recebidas':
        return (
          <CardBasicoGlobal
            key="propostas_recebidas"
            titulo={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.kpi_propostas_enviadas', 'Propostas enviadas')}
            icone={<ClipboardText weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
            valor={stats.propostasEnviadas}
            subtexto={t(
              'bidfrete.visao_fornecedor_bid_frete_internacional.lista.kpi_propostas_enviadas_desc',
              'Respostas que você já enviou',
            )}
          />
        )
      default:
        return null
    }
  }, [stats, t])

  const tituloTopo = useMemo(() => {
    if (!carregando) return null
    const icone = visao === 'kanban'
      ? <Kanban weight="duotone" size={22} />
      : <ListBullets weight="duotone" size={22} />
    return criarTituloCarregandoTopo(icone, t)
  }, [carregando, visao, t])

  useSincronizarTituloPaginaTopo(tituloTopo)

  return (
    <div className="bf-lista-page bf-cotacoes bid-frete-page-shell">
      {carregando ? (
        <ConteudoCarregandoBidFreteInternacional />
      ) : (
        <>
          {visao === 'lista' && (
            <div className="lp-stats-row">
              <div className="lp-cards">
                {cardsVisiveis.map(pref => renderCard(pref.id))}
              </div>
            </div>
          )}

          {visao === 'lista' ? (
            <div
              className="lp-tabela-wrapper lp-tabela-wrapper--faixa-unificada"
              style={estiloWrapperTabelaListaBidFreteInternacional}
            >
            <div className="lp-tabela-chrome" style={estiloChromeTabelaListaBidFreteInternacional}>
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
              {popoverFiltroAberto && (() => {
                const col = colunasTabela.find(c => c.key === popoverFiltroAberto)
                if (!col?.key) return null
                return (
                  <FiltroPopoverColuna
                    campo={String(col.key)}
                    label={col.label}
                    tipo={detectarTipoColunaBidFrete(col)}
                    filtroAtual={filtrosAtivosLista[String(col.key)]}
                    valoresUnicos={resolverValoresUnicosPopoverBidFrete(
                      col,
                      valoresUnicosPorCampo,
                    )}
                    onAplicar={handleAplicarFiltroColuna}
                    onLimpar={handleLimparFiltroColuna}
                    onOrdenar={handleOrdenarFiltroColuna}
                    onFechar={() => setPopoverFiltroAberto(null)}
                    anchorPos={popoverFiltroPos}
                    labelInverso={getLabelsFiltroInversoBidFrete(String(col.key), labelsFiltroCtx)}
                  />
                )
              })()}
              <TabelaVirtualGlobal<Cotacao, never>
                dados={cotacoesPagina}
                colunas={colunasTabela}
                colunasSeletor={colunasSeletorLista}
                itemId={(c) => c.id_cotacao_bid_frete_internacional}
                onSelecaoMudar={setSelecionados}
                itensPorPagina={tabelaConfig.linhasPorPagina}
                totalItens={cotacoesFiltradas.length}
                paginaAtual={paginaLista}
                onMudarPagina={setPaginaLista}
                classNameLinhaPai={classNameLinha}
                labelPai={labelCotacaoPaginacao}
                totalRodapePai={cotacoesFiltradas.length}
                acoes={acoes}
                acoesExportacao={acoesExportacao}
                acoesBarra={acoesBarra}
                onBuscar={setBusca}
                modoLocalizar
                onFiltroColuna={onFiltroColuna}
                filtrosAtivosKeys={filtrosAtivosKeys}
                placeholderBusca="Buscar"
                distribuirLarguraColunas
                preferencias={preferencias}
                onSalvarPreferencias={handleSalvarPreferencias}
                colunasPadrao={COLUNAS_PADRAO_VISIVEIS_FORNECEDOR}
                emptyIcon={<Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
                emptyTitle={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.vazio', 'Nenhuma oportunidade encontrada')}
                emptyDescription={
                  busca.trim() || Object.keys(filtrosAtivosLista).length > 0
                    ? t(
                        'bidfrete.visao_fornecedor_bid_frete_internacional.lista.vazio_desc',
                        'Nenhuma oportunidade encontrada com os filtros selecionados.',
                      )
                    : t(
                        'bidfrete.visao_fornecedor_bid_frete_internacional.lista.vazio_sem_filtro',
                        'Nenhuma oportunidade no seu funil.',
                      )
                }
                ariaLabel={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.aria', 'Lista de oportunidades')}
              />
            </div>
            </div>
          ) : (
            <KanbanFornecedorConteudo disparos={disparos} toolbarInicio={toggleVisao} />
          )}
        </>
      )}

      {modalExcluirAberto && selecionados.length > 0 && (
        <ModalConfirmarExcluirGlobal
          aberto
          titulo={t(
            'bidfrete.visao_fornecedor_bid_frete_internacional.lista.modal_excluir_titulo',
            'Remover da lista?',
          )}
          descricao={t(
            'bidfrete.visao_fornecedor_bid_frete_internacional.lista.modal_excluir_desc',
            'As oportunidades selecionadas serão ocultadas da sua lista. Você pode continuar acessando convites pendentes pelo Kanban.',
          )}
          nomeItem={selecionados.length === 1
            ? selecionados[0].numero_cotacao_bid_frete_internacional
            : t(
                'bidfrete.visao_fornecedor_bid_frete_internacional.lista.modal_excluir_n_itens',
                '{{n}} oportunidades',
                { n: selecionados.length },
              )}
          aoConfirmar={handleConfirmarExcluir}
          aoCancelar={() => setModalExcluirAberto(false)}
        />
      )}

      <style>{`
        .bf-toggle-group {
          display: inline-flex;
          gap: 0.25rem;
          flex-shrink: 0;
        }
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
      `}</style>
    </div>
  )
}
