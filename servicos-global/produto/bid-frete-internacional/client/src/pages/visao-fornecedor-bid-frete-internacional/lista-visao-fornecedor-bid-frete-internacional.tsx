/**
 * Lista + Kanban — Visão fornecedor (paridade com lista-bid-frete-internacional operacional).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type { GTPreferencias } from '@nucleo/tabela-virtual-global'
import {
  ClipboardText,
  CurrencyDollar,
  DownloadSimple,
  Eye,
  Kanban,
  ListBullets,
  Package,
} from '@phosphor-icons/react'

import { KanbanFornecedorConteudo } from './kanban-fornecedor-conteudo'
import { BidFreteListaFaixaNavegacao } from '../../components/BidFreteListaFaixaNavegacao'
import '../../shared/lista-bid-frete-internacional-layout.css'
import { useSincronizarTituloPaginaTopo } from '../../shared/useSincronizarTituloPaginaTopo'
import {
  criarTituloCarregandoTopo,
  ConteudoCarregandoBidFreteInternacional,
} from '../../shared/pagina-carregando-bid-frete-internacional'
import { useShellStore } from '@gravity/shell'
import { getVisaoFornecedorBidFreteInternacionalCotacoesPendentes } from '../../shared/api'
import type { Cotacao, DisparoCotacaoBidFreteInternacional } from '../../shared/types'
import {
  disparosParaListaFornecedor,
  navegarOportunidadeFornecedor,
  type FunilPorCotacaoMap,
} from '../../shared/lista-visao-fornecedor-bid-frete-dados'
import { gerarAbasListaFornecedor } from '../../shared/lista-visao-fornecedor-bid-frete-abas'
import {
  COLUNAS_PADRAO_VISIVEIS_FORNECEDOR,
  lerPreferenciasTabelaFornecedor,
  salvarPreferenciasTabelaFornecedor,
} from '../../shared/lista-visao-fornecedor-preferencias-tabela'
import { ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL } from '../../shared/rotas-bid-frete-internacional'
import { calcularStatsListaFornecedor } from '../../shared/lista-visao-fornecedor-bid-frete-kpi-metrics'
import { filtrarCotacoesPorPeriodoCards } from '../../shared/lista-bid-frete-card-periodo'
import { useCardPreferencesBidFrete } from '../../shared/use-card-preferences'
import {
  carregarTabelaConfigBidFrete,
  HORAS_LIMITE_DESTAQUE_EXPIRACAO,
  SYNC_EVENT_TABELA_BID_FRETE,
} from '../../shared/tabela-config-bid-frete'
import { SYNC_EVENT_FORMATO_DATA_BID_FRETE } from '../../shared/formato-data-bid-frete'
import {
  buildColunasPaiListaFornecedor,
  buildColunasExportListaFornecedor,
  formatValorExportColunaFornecedor,
} from './colunas-lista-visao-fornecedor-bid-frete-internacional'
import {
  montarLinhasPaiLista,
  idLinhaPaiLista,
  isLinhaBidGrupo,
  cotacaoDaLinhaPai,
  cotacaoPrestesAExpirar,
  linhaPaiPrestesAExpirar,
  type LinhaPaiLista,
} from '../lista-bid-frete-internacional-utils'
import { fmtQuantidade } from '../colunas-lista-bid-frete-internacional'
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

  const abas = useMemo(() => gerarAbasListaFornecedor(t), [t])
  const { visiveis: cardsVisiveis, periodo: periodoCards } = useCardPreferencesBidFrete('fornecedor')

  const [tabelaConfig, setTabelaConfig] = useState(carregarTabelaConfigBidFrete)
  const [paginaLista, setPaginaLista] = useState(1)
  const [formatoDataVersion, setFormatoDataVersion] = useState(0)
  const [preferencias, setPreferencias] = useState<GTPreferencias | undefined>(() => lerPreferenciasTabelaFornecedor())

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
  }, [])

  const abrirOportunidade = useCallback((item: Cotacao) => {
    const disparo = disparoPorCotacaoId.get(item.id_cotacao_bid_frete_internacional)
    if (disparo) {
      navegarOportunidadeFornecedor(navigate, ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL, disparo)
    }
  }, [navigate, disparoPorCotacaoId])

  const colunasTabela = useMemo(
    () => buildColunasPaiListaFornecedor(t, abrirOportunidade),
    [t, abrirOportunidade, formatoDataVersion],
  )
  const colunasExport = useMemo(
    () => buildColunasExportListaFornecedor(t),
    [t, formatoDataVersion],
  )

  const filtrarCotacaoItem = useCallback((c: Cotacao): boolean => {
    const funil = funilPorCotacaoId.get(c.id_cotacao_bid_frete_internacional)
    if (filtroTab !== 'TODAS' && funil !== filtroTab) return false
    if (busca.trim()) {
      const term = busca.toLowerCase()
      return (
        c.numero_cotacao_bid_frete_internacional.toLowerCase().includes(term)
        || (c.referencia_interna_cotacao_bid_frete_internacional ?? '').toLowerCase().includes(term)
        || c.origem_nome_cotacao_bid_frete_internacional.toLowerCase().includes(term)
        || c.destino_nome_cotacao_bid_frete_internacional.toLowerCase().includes(term)
      )
    }
    return true
  }, [filtroTab, busca, funilPorCotacaoId])

  const cotacoesFiltradas = useMemo(
    () => cotacoes.filter(filtrarCotacaoItem),
    [cotacoes, filtrarCotacaoItem],
  )

  const linhasPaiFiltradas = useMemo(
    () => montarLinhasPaiLista([], cotacoesFiltradas),
    [cotacoesFiltradas],
  )

  const cotacoesParaKpi = useMemo(
    () => filtrarCotacoesPorPeriodoCards(cotacoesFiltradas, periodoCards),
    [cotacoesFiltradas, periodoCards],
  )

  const stats = useMemo(
    () => calcularStatsListaFornecedor(cotacoesParaKpi, funilPorCotacaoId),
    [cotacoesParaKpi, funilPorCotacaoId],
  )

  const classNameLinhaPai = useCallback((linha: LinhaPaiLista) => {
    if (!tabelaConfig.destacarAtrasados) return undefined
    return linhaPaiPrestesAExpirar(linha, HORAS_LIMITE_DESTAQUE_EXPIRACAO)
      ? 'gtv-linha--expira-prestes'
      : undefined
  }, [tabelaConfig.destacarAtrasados])

  const handleCarregarFilhos = useCallback(async (): Promise<never[]> => [], [])

  const acoes = useMemo(() => [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.acao_abrir', 'Abrir'),
      onClick: (item: LinhaPaiLista) => {
        const cotacao = cotacaoDaLinhaPai(item)
        if (cotacao) abrirOportunidade(cotacao)
      },
      visivel: (item: LinhaPaiLista) => !isLinhaBidGrupo(item),
    },
  ], [abrirOportunidade, t])

  const exportarCSVCotacoes = useCallback((formato: 'excel' | 'csv') => {
    const sep = formato === 'excel' ? ';' : ','
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`

    const colunasExportVisiveis = colunasExport.filter(c => {
      if (!c.key) return false
      if (preferencias?.colunas_visiveis) {
        return preferencias.colunas_visiveis.includes(c.key as string)
      }
      return COLUNAS_PADRAO_VISIVEIS_FORNECEDOR.includes(c.key as string)
    })

    const cabecalho = colunasExportVisiveis.map(c => escape(c.label)).join(sep)
    const linhas = cotacoesFiltradas.map(row => colunasExportVisiveis.map(c => {
      const key = c.key as string
      return escape(formatValorExportColunaFornecedor(key, row))
    }).join(sep))

    const conteudo = [cabecalho, ...linhas].join('\n')
    const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oportunidades_fornecedor_${formato === 'excel' ? 'excel' : 'csv'}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }, [cotacoesFiltradas, colunasExport, preferencias])

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

  const toggleVisao = (
    <ToggleVisaoListaKanbanFornecedor
      visao={visao}
      onLista={() => navigate(ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.lista)}
      onKanban={() => navigate(ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.kanban)}
      labelToggle={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.toggle_visao', 'Alternar visualização')}
    />
  )

  const acoesBarra = useMemo(() => toggleVisao, [toggleVisao])

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
            <div className="lp-tabela-wrapper lp-tabela-wrapper--faixa-unificada">
            <div className="lp-tabela-chrome">
              <BidFreteListaFaixaNavegacao
                exibirLinhaPaineis={false}
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
              <TabelaVirtualGlobal<LinhaPaiLista, Cotacao>
                dados={linhasPaiFiltradas}
                colunas={colunasTabela}
                itemId={idLinhaPaiLista}
                onCarregarFilhos={handleCarregarFilhos}
                itensPorPagina={tabelaConfig.linhasPorPagina}
                totalItens={linhasPaiFiltradas.length}
                paginaAtual={paginaLista}
                onMudarPagina={setPaginaLista}
                classNameLinhaPai={classNameLinhaPai}
                labelPai={['registro', 'registros']}
                acoes={acoes}
                acoesExportacao={acoesExportacao}
                acoesBarra={acoesBarra}
                onBuscar={setBusca}
                modoLocalizar
                placeholderBusca={t(
                  'bidfrete.visao_fornecedor_bid_frete_internacional.lista.buscar',
                  'Buscar por processo, referência, origem ou destino...',
                )}
                preferencias={preferencias}
                onSalvarPreferencias={handleSalvarPreferencias}
                colunasPadrao={COLUNAS_PADRAO_VISIVEIS_FORNECEDOR}
                emptyIcon={<Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
                emptyTitle={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.vazio', 'Nenhuma oportunidade encontrada')}
                emptyDescription={t(
                  'bidfrete.visao_fornecedor_bid_frete_internacional.lista.vazio_desc',
                  'Nenhuma oportunidade encontrada com os filtros selecionados.',
                )}
                ariaLabel={t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.aria', 'Lista de oportunidades')}
              />
            </div>
            </div>
          ) : (
            <KanbanFornecedorConteudo disparos={disparos} toolbarInicio={toggleVisao} />
          )}
        </>
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
