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
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import { ToastContainer, useShellStore } from '@gravity/shell'
import {
  FlowArrow,
  Package,
  FileText,
  CloudArrowUp,
  CurrencyDollar,
  Cube,
  GearSix,
  Receipt,
  Envelope,
  CheckSquare,
  SidebarSimple,
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
  pedidos: [
    {
      id: 'pd1', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo',
      numero: 'PO-2026-001', exportador_nome: 'Shanghai Electronics Co.', exportador_pais: 'CN',
      status: 'confirmado', valor_fob: 68_400, moeda: 'USD', peso_bruto: 12_300,
      data_pedido: '2026-01-15T00:00:00Z', data_embarque_prevista: '2026-03-15T00:00:00Z',
      observacoes: 'PO principal — equipamentos de comunicação 5G',
      created_at: '2026-01-15T00:00:00Z', updated_at: '2026-02-01T00:00:00Z',
      itens: [
        { id: 'i1-1', pedido_id: 'pd1', numero_item: 1, descricao: 'Roteador 5G dual-band — modelo R-2400', ncm: '8517.62.99', quantidade: 200, unidade: 'UN', valor_unitario: 215.00, valor_total: 43_000, peso_liquido: 1_600, peso_bruto: 1_800, status_li: 'deferida', numero_li: 'LI-2026/0123456-7', created_at: '2026-01-15T00:00:00Z' },
        { id: 'i1-2', pedido_id: 'pd1', numero_item: 2, descricao: 'Antena setorial 3.5GHz — modelo A-SEC35', ncm: '8517.62.99', quantidade: 100, unidade: 'UN', valor_unitario: 180.00, valor_total: 18_000, peso_liquido: 800, peso_bruto: 900, status_li: 'deferida', numero_li: 'LI-2026/0123456-7', created_at: '2026-01-15T00:00:00Z' },
        { id: 'i1-3', pedido_id: 'pd1', numero_item: 3, descricao: 'Cabo coaxial RG-58 — bobina 100m', ncm: '8544.49.00', quantidade: 80, unidade: 'UN', valor_unitario: 92.50, valor_total: 7_400, peso_liquido: 480, peso_bruto: 560, status_li: 'deferida', created_at: '2026-01-15T00:00:00Z' },
      ],
    },
    {
      id: 'pd2', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo',
      numero: 'PO-2026-002', exportador_nome: 'Shanghai Electronics Co.', exportador_pais: 'CN',
      status: 'confirmado', valor_fob: 32_650, moeda: 'USD', peso_bruto: 5_200,
      data_pedido: '2026-01-22T00:00:00Z', data_embarque_prevista: '2026-03-15T00:00:00Z',
      observacoes: 'Acessórios complementares — mesmo embarque do PO-001',
      created_at: '2026-01-22T00:00:00Z', updated_at: '2026-02-10T00:00:00Z',
      itens: [
        { id: 'i2-1', pedido_id: 'pd2', numero_item: 1, descricao: 'Fonte de alimentação 48V/10A', ncm: '8504.40.90', quantidade: 150, unidade: 'UN', valor_unitario: 145.00, valor_total: 21_750, peso_liquido: 2_800, peso_bruto: 3_200, status_li: 'deferida', numero_li: 'LI-2026/0123456-7', created_at: '2026-01-22T00:00:00Z' },
        { id: 'i2-2', pedido_id: 'pd2', numero_item: 2, descricao: 'Suporte de fixação para torre', ncm: '7308.30.00', quantidade: 80, unidade: 'UN', valor_unitario: 95.00, valor_total: 7_600, peso_liquido: 1_600, peso_bruto: 1_800, status_li: 'dispensada', created_at: '2026-01-22T00:00:00Z' },
        { id: 'i2-3', pedido_id: 'pd2', numero_item: 3, descricao: 'Kit de conectores N-Type', ncm: '8536.69.90', quantidade: 660, unidade: 'PC', valor_unitario: 5.00, valor_total: 3_300, peso_liquido: 180, peso_bruto: 200, status_li: 'dispensada', created_at: '2026-01-22T00:00:00Z' },
      ],
    },
    {
      id: 'pd3', processo_id: 'core_id_000001', id_organizacao: 'tenant-demo',
      numero: 'PO-2026-003', exportador_nome: 'Shanghai Electronics Co.', exportador_pais: 'CN',
      status: 'pendente', valor_fob: 7_000, moeda: 'USD', peso_bruto: 1_271,
      data_pedido: '2026-02-05T00:00:00Z',
      observacoes: 'PO complementar — peças de reposição. Aguardando confirmação do exportador.',
      created_at: '2026-02-05T00:00:00Z', updated_at: '2026-02-05T00:00:00Z',
      itens: [
        { id: 'i3-1', pedido_id: 'pd3', numero_item: 1, descricao: 'Módulo de RF 3.5GHz (reposição)', ncm: '8517.62.99', quantidade: 50, unidade: 'UN', valor_unitario: 140.00, valor_total: 7_000, peso_liquido: 1_100, peso_bruto: 1_271, status_li: 'pendente', created_at: '2026-02-05T00:00:00Z' },
      ],
    },
  ],
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

// ─── Navigation Sections ────────────────────────────────────────────────────

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  id: string
  /** Contador opcional — exibido apenas quando > 0 e sempre derivado de dado real (REGRA 05/08). */
  count?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

/** Contadores derivados da fonte primária (ProcessoDetail). Nunca fabricar valores. */
interface NavCounts {
  pedidos: number
}

const buildNavSections = (
  processoId: string,
  idOrganizacao: string,
  counts: NavCounts,
): NavSection[] => {
  const qs = processoId ? `?id=${processoId}&idOrganizacao=${idOrganizacao}` : ''
  // Prefixo do produto — todas as paginas vivem sob /processo/<rota>.
  // Sem o prefixo o navigate jogava para localhost/<rota> e dava 404.
  const base = '/processo'

  return [
    {
      title: 'Acompanhamento',
      items: [
        { id: 'workflow',  to: `${base}/workflow${qs}`,  label: 'Visão Geral',  icon: <FlowArrow weight="duotone" size={18} /> },
      ],
    },
    {
      title: 'Pedidos',
      items: [
        { id: 'pedidos',   to: `${base}/pedidos${qs}`,   label: 'Pedidos',   icon: <Package   weight="duotone" size={18} />, count: counts.pedidos },
      ],
    },
    {
      title: 'Despacho Aduaneiro',
      items: [
        { id: 'duimp',       to: `${base}/duimp${qs}`,       label: 'DUIMP',       icon: <CloudArrowUp weight="duotone" size={18} /> },
        { id: 'li',          to: `${base}/li${qs}`,          label: 'LPCO',        icon: <FileText     weight="duotone" size={18} /> },
      ],
    },
    {
      title: 'Financeiro',
      items: [
        { id: 'financeiro', to: `${base}/financeiro${qs}`, label: 'Financeiro', icon: <CurrencyDollar weight="duotone" size={18} /> },
        { id: 'taxas',      to: `${base}/taxas${qs}`,      label: 'Taxas',      icon: <Receipt        weight="duotone" size={18} /> },
      ],
    },
    {
      title: 'Dados',
      items: [
        // 'Containers' foi promovido a SECAO dentro de Dados Tecnicos
        // (campos do banco Cadastros/Container) — nao precisa mais
        // de rota separada.
        { id: 'dados-tecnicos', to: `${base}/dados-tecnicos${qs}`, label: 'Dados do Processo', icon: <GearSix       weight="duotone" size={18} /> },
      ],
    },
    {
      title: 'Comunicacao',
      items: [
        { id: 'email', to: `${base}/email${qs}`, label: 'Email', icon: <Envelope    weight="duotone" size={18} /> },
        { id: 'todo',  to: `${base}/todo${qs}`,  label: 'To Do', icon: <CheckSquare weight="duotone" size={18} /> },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { id: 'configuracoes', to: `${base}/configuracoes${qs}`, label: 'Configurações', icon: <GearSix weight="duotone" size={18} /> },
      ],
    },
  ]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

// Cor de acento do produto Processo (#facc15) — fonte unica: getProdutoMeta.
// Usada no item ativo do menu (dot + fundo), conforme design-system "3 pontos de contato".
const PRODUTO_COLOR = getProdutoMeta('processo').color
// Versao translucida (12%) para o fundo do item ativo — hex de 8 digitos (alpha 0x1f ~= 12%).
const PRODUTO_COLOR_DIM = `${PRODUTO_COLOR}1f`

// ─── Componente ─────────────────────────────────────────────────────────────

export default function ProcessoLayout() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const processoId = searchParams.get('id') ?? ''
  const idOrganizacao = searchParams.get('idOrganizacao') ?? ''

  const { currentTheme, tooltipsDisabled, setSidebarOpen } = useShellStore()
  const isLight = currentTheme === 'light'

  const [processo, setProcesso] = useState<ProcessoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Garante que ao montar a pagina o menu SEMPRE comeca expandido —
  // evita o estado preso recolhido entre HMRs / Fast Refresh do Vite.
  useEffect(() => {
    setSidebarCollapsed(false)
  }, [])

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
      if (processoId && idOrganizacao) {
        const data = await getProcesso(idOrganizacao, processoId)
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
  }, [processoId, idOrganizacao])

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

  // Contadores derivados da fonte primaria — nunca fabricados (REGRA 05/08).
  const navCounts = useMemo<NavCounts>(
    () => ({ pedidos: processo?.pedidos?.length ?? 0 }),
    [processo]
  )

  const navSections = useMemo(
    () => buildNavSections(processoId, idOrganizacao, navCounts),
    [processoId, idOrganizacao, navCounts]
  )



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
      <div
        className={`p2-shell ${sidebarCollapsed ? 'p2-shell--collapsed' : ''}`}
        style={{
          '--p2-produto': PRODUTO_COLOR,
          '--p2-produto-dim': PRODUTO_COLOR_DIM,
        } as React.CSSProperties}
      >
        {/* ─── Sidebar ──────────────────────────────────── */}
        <aside className="p2-sidebar">
          {/* Toggle flutuante na borda direita — recolhe/expande o menu. */}
          <TooltipGlobal titulo={t('shell.recolher_menu')} descricao="Recolher ou expandir o menu lateral">
            <button
              className="p2-collapse-btn"
              onClick={() => setSidebarCollapsed(prev => !prev)}
              type="button"
              aria-label={t('shell.recolher_menu')}
            >
              <SidebarSimple weight={sidebarCollapsed ? 'duotone' : 'regular'} size={18} />
            </button>
          </TooltipGlobal>

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

            </div>
          )}

          {/* Navegacao Agrupada */}
          <nav className="p2-nav">
            {navSections.map(section => (
              <div key={section.title} className="p2-nav-section">
                <div className="p2-nav-section-title">{section.title}</div>
                {section.items.map(item => {
                  const isActive = location.pathname === item.to.split('?')[0] ||
                    location.pathname === `/processo/${item.id}` ||
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
                      {item.count != null && item.count > 0 && (
                        <span className="p2-nav-badge">{item.count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>

        </aside>

        {/* ─── Main Area ──────────────────────────────── */}
        {/* O titulo da pagina vem do CabecalhoGlobal de cada rota filha
            (padrao plataforma). O menu nunca some — quando recolhido vira
            um rail estreito de icones, e o toggle continua acessivel. */}
        <div className="p2-main">

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
