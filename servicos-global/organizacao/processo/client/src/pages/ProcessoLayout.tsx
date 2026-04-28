/**
 * ProcessoLayout.tsx — Layout principal do Processo
 *
 * - Navegacao agrupada por secoes (Acompanhamento, Documentos, Financeiro, Dados, Comunicacao)
 * - Breadcrumb contextual (< Processos > [etapa atual])
 * - Card de info com barra de progresso das etapas
 * - Quick stats (valor FOB, peso, etapa) no sidebar
 * - Sidebar colapsavel com toggle
 * - Responsividade e transicoes
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { ToastContainer, useShellStore } from '@gravity/shell'
import {
  FlowArrow,
  Package,
  FileText,
  FileDashed,
  CloudArrowUp,
  PencilLine,
  CurrencyDollar,
  Cube,
  GearSix,
  ClipboardText,
  Receipt,
  Envelope,
  CheckSquare,
  ArrowLeft,
  Info,
  CaretRight,
  Sidebar,
  Anchor,
  CalendarBlank,
  Scales,
} from '@phosphor-icons/react'
import { getProcesso } from '../shared/api'
import type { ProcessoDetail } from '../shared/types'
import './ProcessoLayout.css'

// ─── Context ────────────────────────────────────────────────────────────────

interface ProcessoContextValue {
  processo: ProcessoDetail | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const ProcessoContext = createContext<ProcessoContextValue>({
  processo: null,
  loading: true,
  error: null,
  refetch: () => {},
})

export function useProcesso() {
  return useContext(ProcessoContext)
}

// ─── Mock Data (para preview sem backend) ───────────────────────────────────

const MOCK_PROCESSO: ProcessoDetail = {
  id: 'core_id_000001',
  id_organizacao: 'tenant-demo',
  numero: 'IMP-2026/0150',
  referencia_cliente: 'RC-4821',
  importador_nome: 'Acme Importacoes Ltda.',
  importador_cnpj: '12.345.678/0001-99',
  exportador_nome: 'Shanghai Electronics Co.',
  exportador_pais: 'CN',
  status: 'em_andamento',
  etapa_atual: 'Embarque',
  modal_transporte: 'maritima',
  incoterm: 'CIF',
  canal: 'verde',
  regime: 'comum',
  valor_fob_total: 108_050.00,
  moeda_fob: 'USD',
  peso_bruto_total: 18_771.30,
  data_abertura: '2026-01-10T00:00:00Z',
  data_embarque: '2026-03-15T00:00:00Z',
  data_chegada: '2026-04-05T00:00:00Z',
  observacoes: 'Processo prioritario — cliente VIP',
  created_at: '2026-01-10T10:00:00Z',
  updated_at: '2026-03-28T14:30:00Z',
  etapas: [
    { id: 'e1', processo_id: 'core_id_000001', nome: 'Abertura',    ordem: 1, status: 'concluida',    data_inicio: '2026-01-10T00:00:00Z', data_conclusao: '2026-01-10T00:00:00Z', created_at: '2026-01-10T00:00:00Z' },
    { id: 'e2', processo_id: 'core_id_000001', nome: 'Pedido',      ordem: 2, status: 'concluida',    data_inicio: '2026-01-15T00:00:00Z', data_conclusao: '2026-02-01T00:00:00Z', created_at: '2026-01-15T00:00:00Z' },
    { id: 'e3', processo_id: 'core_id_000001', nome: 'LI',          ordem: 3, status: 'concluida',    data_inicio: '2026-02-05T00:00:00Z', data_conclusao: '2026-02-20T00:00:00Z', created_at: '2026-02-05T00:00:00Z' },
    { id: 'e4', processo_id: 'core_id_000001', nome: 'Embarque',    ordem: 4, status: 'em_andamento', data_inicio: '2026-03-15T00:00:00Z', created_at: '2026-03-15T00:00:00Z' },
    { id: 'e5', processo_id: 'core_id_000001', nome: 'Desembaraco', ordem: 5, status: 'pendente',     created_at: '2026-01-10T00:00:00Z' },
    { id: 'e6', processo_id: 'core_id_000001', nome: 'Entrega',     ordem: 6, status: 'pendente',     created_at: '2026-01-10T00:00:00Z' },
  ],
  pedidos: [],
  followUps: [],
  documentos: [
    { id: 'd1', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', tipo: 'invoice',           nome: 'Invoice_Proforma_PO2026001.pdf', arquivo_url: '#', tamanho_bytes: 251_000, mime_type: 'application/pdf', uploaded_by: 'user1', created_at: '2026-01-20T00:00:00Z' },
    { id: 'd2', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', tipo: 'packing_list',      nome: 'Packing_List_PO2026001.pdf',     arquivo_url: '#', tamanho_bytes: 128_000, mime_type: 'application/pdf', uploaded_by: 'user1', created_at: '2026-02-10T00:00:00Z' },
    { id: 'd3', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', tipo: 'bl',                nome: 'BL_MSKU1234567.pdf',             arquivo_url: '#', tamanho_bytes: 312_000, mime_type: 'application/pdf', uploaded_by: 'user1', created_at: '2026-03-16T00:00:00Z' },
    { id: 'd4', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', tipo: 'certificado_origem', nome: 'CO_Shanghai_Electronics.pdf',     arquivo_url: '#', tamanho_bytes: 95_000,  mime_type: 'application/pdf', uploaded_by: 'user1', created_at: '2026-02-15T00:00:00Z' },
  ],
  estimativasCusto: [
    { id: 'c1', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', categoria: 'Frete',       descricao: 'Frete maritimo Shanghai-Santos',    valor_estimado: 4_200, valor_real: 4_350,    moeda: 'USD', status: 'confirmado', data_vencimento: '2026-04-10T00:00:00Z', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-03-20T00:00:00Z' },
    { id: 'c2', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', categoria: 'Seguro',      descricao: 'Seguro de transporte internacional', valor_estimado: 1_080, moeda: 'USD', status: 'estimado',   created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 'c3', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', categoria: 'Impostos',    descricao: 'II + IPI + ICMS + PIS/COFINS',      valor_estimado: 52_000, moeda: 'BRL', status: 'estimado',   created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 'c4', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo', categoria: 'Despachante', descricao: 'Honorarios de despacho aduaneiro',   valor_estimado: 3_500, valor_real: 3_500, moeda: 'BRL', status: 'pago',       data_vencimento: '2026-03-25T00:00:00Z', created_at: '2026-01-10T00:00:00Z', updated_at: '2026-03-25T00:00:00Z' },
  ],
}

// ─── Status Map ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  em_andamento: 'Em Andamento',
  aguardando_documentos: 'Aguardando Docs',
  em_desembaraco: 'Em Desembaraco',
  concluido: 'Concluido',
  cancelado: 'Cancelado',
}

// ─── Navigation Sections ────────────────────────────────────────────────────

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  id: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const buildNavSections = (processoId: string, tenantId: string): NavSection[] => {
  const qs = processoId ? `?id=${processoId}&tenantId=${tenantId}` : ''

  return [
    {
      title: 'Acompanhamento',
      items: [
        { id: 'workflow',  to: `/workflow${qs}`,  label: 'Workflow',  icon: <FlowArrow weight="duotone" size={18} /> },
        { id: 'pedidos',   to: `/pedidos${qs}`,   label: 'Pedidos',   icon: <Package   weight="duotone" size={18} /> },
      ],
    },
    {
      title: 'Documentos',
      items: [
        { id: 'li',          to: `/li${qs}`,          label: 'LI',          icon: <FileText     weight="duotone" size={18} /> },
        { id: 'di',          to: `/di${qs}`,          label: 'DI',          icon: <FileDashed   weight="duotone" size={18} /> },
        { id: 'duimp',       to: `/duimp${qs}`,       label: 'DUIMP',       icon: <CloudArrowUp weight="duotone" size={18} /> },
        { id: 'retificacao', to: `/retificacao${qs}`, label: 'Retificacao', icon: <PencilLine   weight="duotone" size={18} /> },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        { id: 'financeiro', to: `/financeiro${qs}`, label: 'Financeiro', icon: <CurrencyDollar weight="duotone" size={18} /> },
        { id: 'taxas',      to: `/taxas${qs}`,      label: 'Taxas',      icon: <Receipt        weight="duotone" size={18} /> },
      ],
    },
    {
      title: 'Dados',
      items: [
        { id: 'containers',     to: `/containers${qs}`,     label: 'Containers',        icon: <Cube          weight="duotone" size={18} /> },
        { id: 'dados-tecnicos', to: `/dados-tecnicos${qs}`, label: 'Dados Tecnicos',    icon: <GearSix       weight="duotone" size={18} /> },
        { id: 'dados-processo', to: `/dados-processo${qs}`, label: 'Dados do Processo', icon: <ClipboardText weight="duotone" size={18} /> },
      ],
    },
    {
      title: 'Comunicacao',
      items: [
        { id: 'email', to: `/email${qs}`, label: 'Email', icon: <Envelope    weight="duotone" size={18} /> },
        { id: 'todo',  to: `/todo${qs}`,  label: 'To Do', icon: <CheckSquare weight="duotone" size={18} /> },
      ],
    },
  ]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const brl = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const usd = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(val)

const fmtPeso = (val: number) =>
  val.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })

// ─── Componente ─────────────────────────────────────────────────────────────

export default function ProcessoLayout() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const processoId = searchParams.get('id') ?? ''
  const tenantId = searchParams.get('tenantId') ?? ''

  const { currentTheme, tooltipsDisabled, toggleTooltips, setSidebarOpen } = useShellStore()
  const isLight = currentTheme === 'light'

  const [processo, setProcesso] = useState<ProcessoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Recolhe o nav global ao entrar no processo; restaura ao sair
  useEffect(() => {
    const prevOpen = useShellStore.getState().sidebarOpen
    setSidebarOpen(false)
    return () => setSidebarOpen(prevOpen)
  }, [setSidebarOpen])

  const fetchProcesso = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (processoId && tenantId) {
        const data = await getProcesso(tenantId, processoId)
        setProcesso(data)
      } else {
        // Mock data para preview sem backend
        await new Promise(r => setTimeout(r, 400))
        setProcesso(MOCK_PROCESSO)
      }
    } catch {
      // Fallback para mock se API falhar
      setProcesso(MOCK_PROCESSO)
    } finally {
      setLoading(false)
    }
  }, [processoId, tenantId])

  useEffect(() => {
    fetchProcesso()
  }, [fetchProcesso])

  // Sincroniza tema com body
  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [isLight])

  // Sincroniza tooltips com body
  useEffect(() => {
    if (tooltipsDisabled) {
      document.body.classList.add('tooltips-disabled')
    } else {
      document.body.classList.remove('tooltips-disabled')
    }
  }, [tooltipsDisabled])

  const navSections = useMemo(
    () => buildNavSections(processoId, tenantId),
    [processoId, tenantId]
  )

  // Detecta rota ativa para o breadcrumb
  const activeRoute = useMemo(() => {
    const path = location.pathname.replace(/^\//, '')
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.to.startsWith(`/${path}`)) {
          return { label: item.label, sectionTitle: section.title }
        }
      }
    }
    return { label: 'Workflow', sectionTitle: 'Acompanhamento' }
  }, [location.pathname, navSections])

  // Progresso das etapas
  const { etapasConcluidas, etapasTotal, progressPercent } = useMemo(() => {
    const etapas = processo?.etapas ?? []
    const total = etapas.length
    const concluidas = etapas.filter(e => e.status === 'concluida').length
    return {
      etapasConcluidas: concluidas,
      etapasTotal: total,
      progressPercent: total > 0 ? Math.round((concluidas / total) * 100) : 0,
    }
  }, [processo])

  return (
    <ProcessoContext.Provider value={{ processo, loading, error, refetch: fetchProcesso }}>
      <div className={`p2-shell ${sidebarCollapsed ? 'p2-shell--collapsed' : ''}`}>
        {/* ─── Sidebar ──────────────────────────────────── */}
        <aside className="p2-sidebar">
          {/* Breadcrumb / Back */}
          <div className="p2-breadcrumb">
            <TooltipGlobal titulo="Voltar" descricao="Retornar para a listagem de processos">
              <button
                className="p2-breadcrumb-back"
                onClick={() => navigate(-1)}
                type="button"
              >
                <ArrowLeft weight="bold" size={14} />
                <span>{t('processo.titulo')}</span>
              </button>
            </TooltipGlobal>
            <CaretRight size={12} className="p2-breadcrumb-sep" />
            <span className="p2-breadcrumb-current">{activeRoute.label}</span>
          </div>

          {/* Card de Info do Processo */}
          {loading && !processo && (
            <div className="p2-info-card p2-info-card--loading ws-fade-up">
              <div className="p2-skeleton p2-skeleton--lg" />
              <div className="p2-skeleton p2-skeleton--md" />
              <div className="p2-skeleton p2-skeleton--sm" />
              <div className="p2-skeleton p2-skeleton--bar" />
            </div>
          )}

          {processo && (
            <div className="p2-info-card ws-fade-up">
              <div className="p2-info-top">
                <div className="p2-info-numero">{processo.numero}</div>
                <StatusBadgeGlobal
                  valor={STATUS_LABELS[processo.status] ?? processo.status}
                  genero="masculino"
                />
              </div>
              <div className="p2-info-empresa">{processo.importador_nome}</div>

              {processo.exportador_nome && (
                <div className="p2-info-row">
                  <span className="p2-info-label">{t('processo.dados_tecnicos.exportador')}</span>
                  <span className="p2-info-value">{processo.exportador_nome}</span>
                </div>
              )}
              {processo.referencia_cliente && (
                <div className="p2-info-row">
                  <span className="p2-info-label">{t('processo.ref_cliente')}</span>
                  <span className="p2-info-value">{processo.referencia_cliente}</span>
                </div>
              )}

              {/* Barra de Progresso */}
              {etapasTotal > 0 && (
                <div className="p2-progress">
                  <div className="p2-progress-header">
                    <span className="p2-progress-label">{t('processo.dados_tecnicos.preenchimento')}</span>
                    <span className="p2-progress-value">{etapasConcluidas}/{etapasTotal}</span>
                  </div>
                  <div className="p2-progress-bar">
                    <div
                      className="p2-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="p2-quick-stats">
                {processo.valor_fob_total > 0 && (
                  <TooltipGlobal titulo="Valor FOB Total" descricao="Valor total das mercadorias no ponto de embarque">
                    <div className="p2-stat">
                      <CurrencyDollar weight="duotone" size={14} />
                      <span>{usd(processo.valor_fob_total)}</span>
                    </div>
                  </TooltipGlobal>
                )}
                {processo.peso_bruto_total > 0 && (
                  <TooltipGlobal titulo="Peso Bruto Total" descricao="Peso total incluindo embalagem">
                    <div className="p2-stat">
                      <Scales weight="duotone" size={14} />
                      <span>{fmtPeso(processo.peso_bruto_total)} kg</span>
                    </div>
                  </TooltipGlobal>
                )}
                {processo.data_embarque && (
                  <TooltipGlobal titulo="Data de Embarque" descricao="Data prevista ou realizada do embarque">
                    <div className="p2-stat">
                      <Anchor weight="duotone" size={14} />
                      <span>{fmtDate(processo.data_embarque)}</span>
                    </div>
                  </TooltipGlobal>
                )}
                {processo.data_chegada && (
                  <TooltipGlobal titulo="Data de Chegada" descricao="Data prevista ou realizada da chegada">
                    <div className="p2-stat">
                      <CalendarBlank weight="duotone" size={14} />
                      <span>{fmtDate(processo.data_chegada)}</span>
                    </div>
                  </TooltipGlobal>
                )}
              </div>
            </div>
          )}

          {/* Navegacao Agrupada */}
          <nav className="p2-nav">
            {navSections.map(section => (
              <div key={section.title} className="p2-nav-section">
                <div className="p2-nav-section-title">{section.title}</div>
                {section.items.map(item => {
                  const isActive = location.pathname === item.to.split('?')[0] ||
                    location.pathname === `/${item.id}`
                  return (
                    <button
                      key={item.id}
                      className={`p2-nav-item ${isActive ? 'p2-nav-item--active' : ''}`}
                      onClick={() => navigate(item.to)}
                      type="button"
                    >
                      <span className="p2-nav-icon">{item.icon}</span>
                      <span className="p2-nav-label">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Toggle Collapse */}
          <div className="p2-sidebar-footer">
            <TooltipGlobal titulo={t('shell.recolher_menu')} descricao="Recolher ou expandir o menu lateral">
              <button
                className="p2-collapse-btn"
                onClick={() => setSidebarCollapsed(prev => !prev)}
                type="button"
              >
                <Sidebar weight="duotone" size={16} />
              </button>
            </TooltipGlobal>
          </div>
        </aside>

        {/* ─── Main Area ──────────────────────────────── */}
        <div className="p2-main">
          {/* Top Bar */}
          <div className="p2-topbar">
            {/* Sidebar toggle para mobile / collapsed */}
            {sidebarCollapsed && (
              <button
                className="p2-topbar-toggle"
                onClick={() => setSidebarCollapsed(false)}
                type="button"
              >
                <Sidebar weight="duotone" size={18} />
              </button>
            )}

            <div className="p2-topbar-title">
              {processo && (
                <>
                  <span className="p2-topbar-numero">{processo.numero}</span>
                  <CaretRight size={12} className="p2-topbar-sep" />
                  <span className="p2-topbar-page">{activeRoute.label}</span>
                </>
              )}
            </div>

            <div className="p2-topbar-actions">
              <TooltipGlobal
                titulo="Dicas e Explicacoes"
                descricao={tooltipsDisabled ? 'Tooltips desabilitadas' : 'Tooltips habilitadas'}
              >
                <button
                  className="p2-topbar-btn"
                  onClick={toggleTooltips}
                  style={{ color: tooltipsDisabled ? 'var(--p2-muted)' : 'var(--p2-accent)' }}
                  type="button"
                >
                  <Info size={18} weight={tooltipsDisabled ? 'regular' : 'fill'} />
                </button>
              </TooltipGlobal>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p2-error-banner ws-fade-up">
              <span>{error}</span>
              <BotaoGlobal
                variante="fantasma"
                tamanho="pequeno"
                onClick={fetchProcesso}
              >
                {t('comum.tentar_novamente')}
              </BotaoGlobal>
            </div>
          )}

          {/* Page content rendered by child routes */}
          <div className="p2-content">
            <Outlet />
          </div>
        </div>

        {/* Notificacoes Globais */}
        <ToastContainer />
      </div>
    </ProcessoContext.Provider>
  )
}
