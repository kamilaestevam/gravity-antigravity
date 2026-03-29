/**
 * ProcessoLayout.tsx — Layout principal que envolve todas as sub-paginas do Processo
 *
 * Segue exatamente o padrao WorkspaceLayout.tsx do Configurador:
 * - MenuLateralGlobal com navItems (Phosphor duotone size={18})
 * - Card de info do processo no topo da sidebar
 * - StatusBadgeGlobal para status do processo
 * - React Context para dados do processo
 * - useShellStore para tema e tooltips
 * - Outlet para rotas filhas
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom'
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global'
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

const ProcessoContext = createContext<ProcessoContextValue>({
  processo: null,
  loading: true,
  error: null,
  refetch: () => {},
})

export function useProcesso() {
  return useContext(ProcessoContext)
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

// ─── Navigation (flat array — MenuLateralGlobal nao suporta sections) ───────

const buildNavItems = (processoId: string, tenantId: string) => {
  const qs = processoId ? `?id=${processoId}&tenantId=${tenantId}` : ''

  return [
    // Acompanhamento
    { to: `/workflow${qs}`,        label: 'Workflow',          icon: <FlowArrow      weight="duotone" size={18} /> },
    { to: `/pedidos${qs}`,         label: 'Pedidos',           icon: <Package        weight="duotone" size={18} /> },
    // Documentos
    { to: `/li${qs}`,              label: 'LI',                icon: <FileText       weight="duotone" size={18} /> },
    { to: `/di${qs}`,              label: 'DI',                icon: <FileDashed     weight="duotone" size={18} /> },
    { to: `/duimp${qs}`,           label: 'DUIMP',             icon: <CloudArrowUp   weight="duotone" size={18} /> },
    { to: `/retificacao${qs}`,     label: 'Retificacao',       icon: <PencilLine     weight="duotone" size={18} /> },
    // Financeiro
    { to: `/financeiro${qs}`,      label: 'Financeiro',        icon: <CurrencyDollar weight="duotone" size={18} /> },
    { to: `/taxas${qs}`,           label: 'Taxas',             icon: <Receipt        weight="duotone" size={18} /> },
    // Dados
    { to: `/containers${qs}`,      label: 'Containers',        icon: <Cube           weight="duotone" size={18} /> },
    { to: `/dados-tecnicos${qs}`,  label: 'Dados Tecnicos',    icon: <GearSix        weight="duotone" size={18} /> },
    { to: `/dados-processo${qs}`,  label: 'Dados do Processo', icon: <ClipboardText  weight="duotone" size={18} /> },
    // Comunicacao
    { to: `/email${qs}`,           label: 'Email',             icon: <Envelope       weight="duotone" size={18} /> },
    { to: `/todo${qs}`,            label: 'To Do',             icon: <CheckSquare    weight="duotone" size={18} /> },
  ]
}

// ─── Componente ─────────────────────────────────────────────────────────────

export default function ProcessoLayout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const processoId = searchParams.get('id') ?? ''
  const tenantId = searchParams.get('tenantId') ?? ''

  const { currentTheme, tooltipsDisabled, toggleTooltips } = useShellStore()
  const isLight = currentTheme === 'light'

  const [processo, setProcesso] = useState<ProcessoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProcesso = useCallback(async () => {
    if (!processoId || !tenantId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getProcesso(tenantId, processoId)
      setProcesso(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar processo'
      setError(msg)
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

  const navItems = buildNavItems(processoId, tenantId)

  return (
    <ProcessoContext.Provider value={{ processo, loading, error, refetch: fetchProcesso }}>
      <div className="proc-shell">
        {/* ─── Sidebar (MenuLateralGlobal + info card) ──────── */}
        <div className="proc-sidebar-wrap">
          {/* Card de Informacoes do Processo — acima do menu */}
          {loading && !processo && (
            <div className="proc-info-card proc-info-card--loading ws-fade-up">
              <div className="proc-skeleton proc-skeleton--lg" />
              <div className="proc-skeleton proc-skeleton--md" />
              <div className="proc-skeleton proc-skeleton--sm" />
            </div>
          )}

          {processo && (
            <div className="proc-info-card ws-fade-up">
              <div className="proc-info-numero">{processo.numero}</div>
              <div className="proc-info-empresa">{processo.importador_nome}</div>
              <div className="proc-info-status">
                <StatusBadgeGlobal
                  valor={STATUS_LABELS[processo.status] ?? processo.status}
                  genero="masculino"
                />
              </div>
              {processo.referencia_cliente && (
                <TooltipGlobal
                  titulo="Referencia do Cliente"
                  descricao="Codigo de referencia usado pelo importador"
                >
                  <div className="proc-info-ref">
                    <span className="proc-info-ref-label">Ref. Cliente:</span>
                    <span>{processo.referencia_cliente}</span>
                  </div>
                </TooltipGlobal>
              )}
              {processo.exportador_nome && (
                <div className="proc-info-exportador">
                  <span className="proc-info-ref-label">Exportador:</span>
                  <span>{processo.exportador_nome}</span>
                </div>
              )}
            </div>
          )}

          {/* Menu Lateral */}
          <MenuLateralGlobal
            tenantName={processo?.importador_nome ?? 'Processo'}
            tenantPlan={STATUS_LABELS[processo?.status ?? ''] ?? 'Carregando'}
            navItems={navItems}
            moduleName="Processo"
            moduleColor="#6366f1"
            defaultCollapsed={false}
          />

          {/* Voltar para Processos */}
          <div className="proc-back-area">
            <TooltipGlobal
              titulo="Voltar"
              descricao="Retornar para a listagem de processos"
            >
              <BotaoGlobal
                variante="fantasma"
                icone={<ArrowLeft weight="duotone" size={16} />}
                onClick={() => navigate('/')}
                className="proc-back-btn"
              >
                Voltar para Processos
              </BotaoGlobal>
            </TooltipGlobal>
          </div>
        </div>

        {/* ─── Main Area ──────────────────────────────────── */}
        <div className="proc-main">
          {/* Global Actions (tooltip toggle) */}
          <div className="proc-global-actions">
            <TooltipGlobal
              titulo="Dicas e Explicacoes"
              descricao={tooltipsDisabled ? 'Tooltips desabilitadas' : 'Tooltips habilitadas'}
            >
              <button
                className="proc-global-btn"
                onClick={toggleTooltips}
                style={{ color: tooltipsDisabled ? 'var(--proc-muted)' : 'var(--proc-accent)' }}
                type="button"
              >
                <Info size={20} weight={tooltipsDisabled ? 'regular' : 'fill'} />
              </button>
            </TooltipGlobal>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="proc-error-banner ws-fade-up">
              <span>{error}</span>
              <BotaoGlobal
                variante="fantasma"
                tamanho="pequeno"
                onClick={fetchProcesso}
              >
                Tentar novamente
              </BotaoGlobal>
            </div>
          )}

          {/* Page content rendered by child routes */}
          <div className="proc-content">
            <Outlet />
          </div>
        </div>

        {/* Notificacoes Globais */}
        <ToastContainer />
      </div>
    </ProcessoContext.Provider>
  )
}
