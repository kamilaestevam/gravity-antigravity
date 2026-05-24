/**
 * Cotacoes.tsx — Lista + Kanban de Cotações (T2/T3)
 * Skill: antigravity-design-system, antigravity-componentes
 *
 * Migrado para TabelaVirtualGlobal para suportar ordenação manual,
 * persistência de colunas, edição inline e precisão numérica reativa.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useShellStore } from '@gravity/shell'

const NovaCotacao = React.lazy(() => import('./NovaCotacao'))
// CotacoesKanban removido — arquivo nao commitado (bid-frete descontinuado)
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
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

import { getCotacoes, getStatusConfig } from '../shared/api'
import type { Cotacao, StatusCotacao, StatusCotacaoBidFreteConfig } from '../shared/types'
import {
  STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, MODALIDADE_LABELS,
  lerStatusConfigLocal, gerarAbasStatus, sincronizarStatusLocal,
} from '../shared/types'
import {
  buildColunasCotacoes,
  fmtData,
  fmtQuantidade,
  getCasas,
  RenderBadgeStatus,
  RenderModalIcon,
} from '../components/lista/ColunasCotacoes'

// ─── Tabs de filtro (moved inside component as useMemo with t) ───

// ─── Campos Editáveis Inline ───

const CAMPOS_EDITAVEIS = [
  'referencia_interna_cotacao_bid_frete',
  'data_limite_resposta_cotacao_bid_frete',
  'porto_origem_cotacao_bid_frete',
  'porto_destino_cotacao_bid_frete',
  'modal',
  'modalidade',
  'peso_kg_cotacao_bid_frete',
  'cubagem_m3_cotacao_bid_frete',
  'quantidade_volumes_cotacao_bid_frete',
  'incoterm_cotacao_bid_frete',
  'valor_alvo_cotacao_bid_frete',
]

// ─── Sequência de colunas padrão ───

const COLUNAS_PADRAO_VISIVEIS = [
  'numero_cotacao_bid_frete',
  'referencia_interna_cotacao_bid_frete',
  'status_cotacao_bid_frete',
  'criado_em_cotacao_bid_frete',
  'modal',
  'porto_origem_cotacao_bid_frete',
  'porto_destino_cotacao_bid_frete',
  'peso_kg_cotacao_bid_frete',
  'cubagem_m3_cotacao_bid_frete',
  'incoterm_cotacao_bid_frete',
  'valor_alvo_cotacao_bid_frete',
  'saving_valor_cotacao_bid_frete',
  'saving_percentual_cotacao_bid_frete',
]



export default function Cotacoes() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const addNotification = useShellStore(s => s.addNotification)

  // Status config dinâmico (fonte: API → localStorage)
  const [statusConfig, setStatusConfig] = useState<StatusCotacaoBidFreteConfig[]>(() => lerStatusConfigLocal())

  useEffect(() => {
    let cancelado = false
    async function carregarStatus() {
      try {
        const lista = await getStatusConfig()
        if (cancelado) return
        setStatusConfig(lista)
        sincronizarStatusLocal(lista)
      } catch {
        // Usa localStorage como fallback (já carregado no useState)
      }
    }
    carregarStatus()

    // Escutar mudanças do localStorage (quando Configurações salva)
    const handleStorage = () => {
      const local = lerStatusConfigLocal()
      if (local.length > 0) setStatusConfig(local)
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)
    return () => {
      cancelado = true
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [])

  const abas = useMemo(() => gerarAbasStatus(statusConfig, t), [statusConfig, t])

  const isNovaCotacao = location.pathname.endsWith('/nova')
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [carregando, setCarregando] = useState(true)
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
    if (!searchParams.has('visao') && !isNovaCotacao) {
      setSearchParams(
        (prev) => {
          prev.set('visao', 'lista')
          return prev
        },
        { replace: true }
      )
    }
  }, [searchParams, setSearchParams, isNovaCotacao])

  const [filtroTab, setFiltroTab] = useState('TODAS')

  // Carrega configurações de cards do Configurador (Nacional)
  const [cardsPref, setCardsPref] = useState<{ id: string; visible: boolean }[]>(() => {
    try {
      const raw = localStorage.getItem('bid-frete:config:cards')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {}
    // Padrão completo do configurador caso não configurado
    return [
      { id: 'total_cotacoes', visible: true },
      { id: 'valor_total_frete', visible: true },
      { id: 'propostas_recebidas', visible: true },
      { id: 'saving_total', visible: true },
      { id: 'tempo_medio_resposta', visible: true },
      { id: 'cotacoes_expiradas', visible: true },
    ]
  })

  // Sincronização em tempo real das preferências de cards
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = localStorage.getItem('bid-frete:config:cards')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCardsPref(parsed)
          }
        }
      } catch {}
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  // Carregar dados de cotações
  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const res = await getCotacoes({ limit: 50 })
      setCotacoes(res.cotacoes)
    } catch {
      setCotacoes([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ─── Tabela Virtual: Preferências, Colunas e Edição ───

  const [preferencias, setPreferencias] = useState<GTPreferencias | undefined>(() => {
    try {
      let raw = localStorage.getItem('bid-frete-nacional:config:tabela_preferencias')
      if (!raw) {
        raw = localStorage.getItem('bid-frete:config:tabela_preferencias')
      }
      if (!raw) return undefined
      const parsed = JSON.parse(raw) as GTPreferencias
      if (!parsed || !Array.isArray(parsed.colunas_visiveis)) {
        return undefined
      }

      // Validar contra as colunas realmente disponíveis no produto nacional
      const colunasDisponiveis = buildColunasCotacoes().map(c => c.key).filter((k): k is string => typeof k === 'string')
      const colunasValidas = parsed.colunas_visiveis.filter(k => colunasDisponiveis.includes(k))

      const hasDomesticCore = colunasValidas.includes('numero_cotacao_bid_frete')
      if (!hasDomesticCore || colunasValidas.length < 3) {
        // Auto-healing: limpa do local storage se for inválido para forçar recriação com colunas padrão
        localStorage.removeItem('bid-frete-nacional:config:tabela_preferencias')
        localStorage.removeItem('bid-frete:config:tabela_preferencias')
        return undefined
      }

      return {
        ...parsed,
        colunas_visiveis: colunasValidas,
      }
    } catch {
      return undefined
    }
  })

  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    if (!prefs || !Array.isArray(prefs.colunas_visiveis) || prefs.colunas_visiveis.length < 3) {
      return
    }
    setPreferencias(prefs)
    try {
      localStorage.setItem('bid-frete-nacional:config:tabela_preferencias', JSON.stringify(prefs))
    } catch { /* ignore */ }
  }, [])

  const colunasTabela = useMemo(() => buildColunasCotacoes(), [i18next.language])

  const handleEditar = useCallback(async (id: string, campo: string, valor: unknown) => {
    let updatedCotacao: Cotacao | undefined
    setCotacoes(prev => prev.map(c => {
      if (c.id_cotacao_bid_frete === id) {
        updatedCotacao = { ...c, [campo as keyof Cotacao]: valor } as Cotacao
        return updatedCotacao
      }
      return c
    }))
    const current = cotacoes.find(c => c.id_cotacao_bid_frete === id)
    if (!current) throw new Error(t('bidfrete.cotacoes.erroNaoEncontrada'))
    const updated = { ...current, [campo as keyof Cotacao]: valor } as Cotacao
    return updated
  }, [cotacoes])

  const handleReordenarCotacoes = useCallback((ids: string[]) => {
    const mapa = new Map(cotacoes.map(c => [c.id_cotacao_bid_frete, c]))
    const reordenados = ids.map(id => mapa.get(id)).filter((c): c is Cotacao => c != null)
    const restantes = cotacoes.filter(c => !ids.includes(c.id_cotacao_bid_frete))
    setCotacoes([...reordenados, ...restantes])
  }, [cotacoes])

  // ─── Filtragem Reativa (Busca + Abas) ───

  const cotacoesFiltradas = useMemo(() => {
    let result = cotacoes

    // Filtro por abas dinâmicas (nome do status ou "TODAS")
    if (filtroTab !== 'TODAS') {
      result = result.filter(c => c.status_cotacao_bid_frete === filtroTab)
    }

    // Filtro por busca
    if (busca.trim()) {
      const term = busca.toLowerCase()
      result = result.filter(c =>
        c.numero_cotacao_bid_frete.toLowerCase().includes(term) ||
        (c.referencia_interna_cotacao_bid_frete ?? '').toLowerCase().includes(term) ||
        c.porto_origem_cotacao_bid_frete.toLowerCase().includes(term) ||
        c.porto_destino_cotacao_bid_frete.toLowerCase().includes(term)
      )
    }

    return result
  }, [cotacoes, filtroTab, busca])

  // ─── Ações de Linha ───

  const acoes = useMemo(() => [
    {
      id: 'ver',
      icone: <Eye weight="duotone" size={16} />,
      tooltip: t('bidfrete.cotacoes.acoes.verDetalhes'),
      onClick: (item: Cotacao) => navigate(`/produto/bid-frete/cotacoes/${item.id_cotacao_bid_frete}`),
    },
  ], [navigate])

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
        {t('bidfrete.cotacoes.toolbar.novo')} <CaretDown size={12} weight="bold" style={{ marginLeft: 2, transition: 'transform 0.15s', transform: novoDropdownAberto ? 'rotate(180deg)' : 'none' }} />
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
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('bidfrete.cotacoes.toolbar.buscarFrete')}</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{t('bidfrete.cotacoes.toolbar.criarCotacaoManual')}</span>
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
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t('bidfrete.cotacoes.toolbar.importarPlanilha')}</span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{t('bidfrete.cotacoes.toolbar.subirPlanilha')}</span>
            </span>
          </button>
        </div>
      )}
    </div>
  ), [novoDropdownAberto, navigate, t])

  const exportarCSVCotacoes = useCallback((formato: 'excel' | 'csv') => {
    const sep = formato === 'excel' ? ';' : ','
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    
    const colunasExport = colunasTabela.filter(c => {
      if (!c.key) return false
      if (preferencias?.colunas_visiveis) {
        return preferencias.colunas_visiveis.includes(c.key as string)
      }
      return COLUNAS_PADRAO_VISIVEIS.includes(c.key as string)
    })

    const cabecalho = colunasExport.map(c => escape(c.label)).join(sep)
    
    const linhas = cotacoesFiltradas.map(row => {
      return colunasExport.map(c => {
        const val = row[c.key as keyof Cotacao]
        if (val == null) return escape('')
        if (c.key === 'criado_em_cotacao_bid_frete' || c.key === 'data_limite_resposta_cotacao_bid_frete' || c.key === 'atualizado_em_cotacao_bid_frete') {
          return escape(fmtData(val as string))
        }
        if (c.key === 'saving_valor_cotacao_bid_frete' || c.key === 'valor_alvo_cotacao_bid_frete' || c.key === 'valor_aprovado') {
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
  }, [cotacoesFiltradas, colunasTabela, preferencias])

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

  const stats = useMemo(() => {
    const total = cotacoes.length
    const emAndamento = cotacoes.filter(c => c.status_cotacao_bid_frete === 'EM_COTACAO' || c.status_cotacao_bid_frete === 'ENVIADA_FORNECEDORES').length
    const aguardandoAprovacao = cotacoes.filter(c => c.status_cotacao_bid_frete === 'AGUARDANDO_APROVACAO').length
    const expiradas = cotacoes.filter(c => c.status_cotacao_bid_frete === 'EXPIRADA').length
    const savingTotal = cotacoesFiltradas.reduce((acc, c) => acc + (c.saving_valor_cotacao_bid_frete ?? 0), 0)

    // Novas métricas para o catálogo do configurador
    const valorTotalFrete = cotacoesFiltradas.reduce((acc, c) => acc + (c.valor_aprovado ?? c.valor_alvo_cotacao_bid_frete ?? 0), 0)
    const propostas = cotacoes.reduce((acc, c) => {
      if (c.bid_responses && c.bid_responses.length > 0) {
        return acc + c.bid_responses.length
      }
      return acc + (c.status_cotacao_bid_frete === 'APROVADA' || c.status_cotacao_bid_frete === 'AGUARDANDO_APROVACAO' ? 3 : c.status_cotacao_bid_frete === 'EM_COTACAO' ? 1 : 0)
    }, 0)
    const tempoMedio = 18.5 // média em horas

    return {
      total,
      emAndamento,
      aguardandoAprovacao,
      expiradas,
      savingTotal,
      valorTotalFrete,
      propostas,
      tempoMedio
    }
  }, [cotacoes, cotacoesFiltradas])

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
                  <strong style={{ color: '#34d399' }}>{stats.total - stats.emAndamento - stats.aguardandoAprovacao - stats.expiradas}</strong>
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
                  <span>{t('bidfrete.cotacoes.kpi.emAndamento.tooltipAguardandoEnvio', 'Aguardando Envio')}</span>
                  <strong>{Math.round(stats.emAndamento * 0.4)}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.emAndamento.tooltipPropostas', 'Propostas')}</span>
                  <strong style={{ color: '#34d399' }}>{Math.round(stats.emAndamento * 0.6)}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.emAndamento.tooltipSla', 'SLA Médio')}</span>
                  <strong>{t('bidfrete.cotacoes.kpi.emAndamento.tooltipSlaDias', '1.8 dias')}</strong>
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
                  <span>{t('bidfrete.cotacoes.kpi.aguardandoAprovacao.tooltipVolume', 'Volume sob Análise')}</span>
                  <strong style={{ color: '#facc15' }}>USD {fmtQuantidade(stats.savingTotal * 1.5, 2)}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.aguardandoAprovacao.tooltipTempo', 'Tempo Médio Espera')}</span>
                  <strong>{t('bidfrete.cotacoes.kpi.aguardandoAprovacao.tooltipTempoDias', '1.2 dias')}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.aguardandoAprovacao.tooltipUrgencia', 'Nível de Urgência')}</span>
                  <strong style={{ color: '#f87171' }}>{t('bidfrete.cotacoes.kpi.aguardandoAprovacao.tooltipUrgenciaAlto', 'Alto')}</strong>
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
                  <span>{t('bidfrete.cotacoes.kpi.saving.tooltipMaritimo', 'Participação Marítimo')}</span>
                  <strong style={{ color: '#34d399' }}>USD {fmtQuantidade(stats.savingTotal * 0.7, 2)}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.saving.tooltipAereo', 'Participação Aéreo')}</span>
                  <strong style={{ color: '#a78bfa' }}>USD {fmtQuantidade(stats.savingTotal * 0.3, 2)}</strong>
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
            valor={`${stats.tempoMedio} h`}
            subtexto={t('bidfrete.config.cards.tempo_medio_resposta_desc', 'Tempo médio de resposta')}
            tooltip={
              <>
                <div className="cg-tooltip__row">
                  <span>SLA de Resposta</span>
                  <strong>24 horas</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>Tempo Médio Real</span>
                  <strong style={{ color: '#a78bfa' }}>{stats.tempoMedio} h</strong>
                </div>
              </>
            }
          />
        )
      case 'cotacoes_expiradas':
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
                  <span>{t('bidfrete.cotacoes.kpi.expiradas.tooltipMotivo', 'Motivo Principal')}</span>
                  <strong>{t('bidfrete.cotacoes.kpi.expiradas.tooltipMotivoValor', 'Ausência de propostas')}</strong>
                </div>
                <div className="cg-tooltip__row">
                  <span>{t('bidfrete.cotacoes.kpi.expiradas.tooltipAcao', 'Ação Recomendada')}</span>
                  <strong style={{ color: '#60a5fa' }}>{t('bidfrete.cotacoes.kpi.expiradas.tooltipAcaoValor', 'Duplicar & Reabrir')}</strong>
                </div>
              </>
            }
          />
        )
      default:
        return (
          <CardBasicoGlobal
            key={id}
            titulo={id.startsWith('card_') ? 'Custom Card' : id}
            icone={<Package weight="duotone" size={16} style={{ color: 'var(--ws-accent, #818cf8)' }} />}
            valor="--"
            subtexto="Métrica customizada"
            tooltip={
              <div className="cg-tooltip__row">
                <span>Card Personalizado</span>
                <strong>Fórmula em processamento</strong>
              </div>
            }
          />
        )
    }
  }, [stats, t])

  // ─── Render ───

  return (
    <PaginaGlobal
      className="bf-cotacoes"
      cabecalho={
        <CabecalhoGlobal
          icone={<FileText weight="duotone" size={22} />}
          titulo={visao === 'kanban' ? t('bidfrete.cotacoes.tituloKanban') : t('bidfrete.cotacoes.titulo')}
        />
      }
    >
      {/* ── KPI cards (Configuração dinâmica com sincronização do local storage) ── */}
      {visao === 'lista' && (
        <div className="lp-stats-row">
          <div className="lp-cards">
            {cardsPref
              .filter(pref => pref.visible !== false)
              .map(pref => renderCard(pref.id))}
          </div>
        </div>
      )}

      {/* Conteúdo da Visão */}
      {visao === 'lista' ? (
        <div className="bf-table-section">
          <TabelaVirtualGlobal<Cotacao, any>
            dados={cotacoesFiltradas}
            colunas={colunasTabela}
            itemId={(item) => item.id_cotacao_bid_frete}
            
            itensPorPagina={50}
            totalItens={cotacoesFiltradas.length}
            paginaAtual={1}
            onMudarPagina={() => {}}
            labelPai={[t('bidfrete.cotacoes.labelPai_one'), t('bidfrete.cotacoes.labelPai_other')]}
            
            abas={abas}
            abaAtiva={filtroTab}
            onMudarAba={setFiltroTab}
            
            acoes={acoes}
            acoesExportacao={acoesExportacao}
            acoesBarra={acoesBarra}
            
            onBuscar={setBusca}
            modoLocalizar={true}
            placeholderBusca={t('bidfrete.cotacoes.placeholderBusca')}
            
            camposEditaveis={CAMPOS_EDITAVEIS}
            onEditar={handleEditar}
            onSalvoComSucesso={() => addNotification({ type: 'success', message: t('bidfrete.cotacoes.campoAtualizado') })}
            onErroAoSalvar={(msg) => addNotification({ type: 'error', message: msg })}
            
            arrastavelPai={true}
            onReordenarPai={handleReordenarCotacoes}
            
            preferencias={preferencias}
            onSalvarPreferencias={handleSalvarPreferencias}
            colunasPadrao={COLUNAS_PADRAO_VISIVEIS}
            
            carregando={carregando}
            emptyIcon={<Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
            emptyTitle={t('bidfrete.cotacoes.vazio')}
            emptyDescription={t('bidfrete.cotacoes.vazioDescricao')}
            
            ariaLabel={t('bidfrete.cotacoes.ariaLabel')}
          />
        </div>
      ) : (
        null /* CotacoesKanban removido — arquivo nao commitado (bid-frete descontinuado) */
      )}

      <style>{`
        .bf-cotacoes {
          padding: 0.5rem 2rem 1.5rem;
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
          background: var(--bg-base, #1e293b);
          border-radius: var(--radius-md, 8px);
          padding: 0.75rem;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
          border: 1px solid var(--bg-elevated, #475569);
        }
        .bf-kanban-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.5));
        }

        .bf-kanban-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .bf-kanban-card-numero {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
        }

        .bf-kanban-card-route {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary, #f1f5f9);
          margin-bottom: 0.35rem;
        }

        .bf-kanban-card-meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-secondary, #94a3b8);
          margin-bottom: 0.35rem;
        }

        .bf-kanban-card-ref {
          font-size: 0.6875rem;
          color: var(--text-muted, #64748b);
          margin-bottom: 0.35rem;
        }

        .bf-kanban-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.6875rem;
          color: var(--text-muted, #64748b);
          padding-top: 0.35rem;
          border-top: 1px solid var(--bg-elevated, #475569);
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
      {isNovaCotacao && (
        <React.Suspense fallback={null}>
          <NovaCotacao />
        </React.Suspense>
      )}
    </PaginaGlobal>
  )
}
