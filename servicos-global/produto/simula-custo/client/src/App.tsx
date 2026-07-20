/**
 * App.tsx — Raiz da SPA Estimativa Custo (simula-custo)
 *
 * Montado pelo Configurador sob /simula-custo/* (rotas-convencao.md).
 * Navegação lateral usa caminhos absolutos via rotaSimulaCusto —
 * links relativos duplicavam segmentos na URL (TASK-000425).
 */
import React, { lazy, Suspense, useEffect, useMemo } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShellStore, useMeSync, ToastContainer } from '@gravity/shell'
import { TelaProdutoComOrganizacaoOverride } from '@gravity/shell'
import {
  useLocalizadorHistory,
  type EcosystemNode,
} from '@nucleo/localizador-global'
import { PRODUCT_CONFIG, type NavigationItem } from './shared/config'
import { setApiContext } from './shared/api'
import { rotaSimulaCusto } from './shared/rotas-estimativa-custo'
import { traduzirPageMetaTopoEstimativaCusto } from './shared/page-meta-topo-estimativa-custo'
import { ConteudoCarregandoEstimativaCusto } from './shared/pagina-carregando-estimativa-custo'
import { EstimativaCustoVisualizacaoLayout } from './components/EstimativaCustoVisualizacaoLayout'
import { EstimativaCustoMultiView } from './components/EstimativaCustoMultiView'
import { getProdutoMeta } from '@nucleo/logo-produtos'

import {
  Calculator,
  ChartPieSlice,
  CheckCircle,
  Clock,
  Sparkle,
  Envelope,
  ChatCircle,
  ListBullets,
  GearSix,
  Kanban,
  UserCircle,
} from '@phosphor-icons/react'

// ── Lazy loading das telas ────────────────────────────────────────────────────
// Insights/Lista/Dashboard/Kanban montam dentro do EstimativaCustoMultiView
// (keep-alive — paridade BidFreteMultiView).
const Configuracoes = lazy(() => import('./pages/configuracoes-estimativa-custo'))
const Formulario    = lazy(() => import('./pages/formulario-estimativa-custo'))

const estimativaCustoVisualizacoesElement = <EstimativaCustoMultiView />

// ── Identidade do produto ─────────────────────────────────────────────────────
const PRODUTO       = getProdutoMeta('simula-custo')
const PRODUCT_ID    = 'simula-custo'
const PRODUCT_NAME  = 'SimulaCusto'
const PRODUCT_COLOR = PRODUTO.color

const iconMap: Record<string, React.ReactNode> = {
  'calculator':              <Calculator    weight="duotone" size={20} />,
  'chart-pie-slice':         <ChartPieSlice weight="duotone" size={20} />,
  'check-circle':            <CheckCircle   weight="duotone" size={20} />,
  'clock-counter-clockwise': <Clock         weight="duotone" size={20} />,
  'sparkle':                 <Sparkle       weight="duotone" size={20} />,
  'envelope':                <Envelope      weight="duotone" size={20} />,
  'chat-circle':             <ChatCircle    weight="duotone" size={20} />,
  'list-bullets':            <ListBullets   weight="duotone" size={20} />,
  'gear-six':                <GearSix       weight="duotone" size={20} />,
  'kanban':                  <Kanban        weight="duotone" size={20} />,
  'user-circle':             <UserCircle    weight="duotone" size={20} />,
}

type NavItemShell = {
  id?: string
  to?: string
  label: string
  icon: React.ReactNode
  disabled?: boolean
  badge?: string
  badgeVariant?: 'accent' | 'muted'
  external?: boolean
  sectionDivider?: boolean
  children?: NavItemShell[]
}

function mapNavItem(item: NavigationItem): NavItemShell {
  if (item.sectionDivider) {
    return { label: item.label, sectionDivider: true, icon: null }
  }
  return {
    id:           item.id,
    to:           item.children ? undefined : item.id,
    label:        item.label,
    icon:         iconMap[item.icon ?? ''] ?? <ListBullets weight="duotone" size={20} />,
    disabled:     item.disabled,
    badge:        item.badge,
    badgeVariant: item.badgeVariant,
    external:     item.external,
    children:     item.children?.map(mapNavItem),
  }
}

const LoadingFallback = () => <ConteudoCarregandoEstimativaCusto />

// ── Labels de rota ────────────────────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  'insights':      'Insights',
  'lista':         'Lista',
  'dashboard':     'Dashboard',
  'kanban':        'Kanban',
  'estimativas':   'Estimativas',
  'nova':          'Nova Estimativa',
  'configuracoes': 'Configurações',
}

// ── Nós do ecossistema para o Localizador ─────────────────────────────────────
const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'hub',          label: 'Gravity',      sublabel: 'workspace',      color: '#818cf8',     type: 'hub',          status: 'accessible' },
  { id: 'configurador', label: 'Configurador', sublabel: 'auth · billing', color: '#f472b6',     type: 'configurador', status: 'accessible' },
  { id: PRODUCT_ID,     label: PRODUCT_NAME,   sublabel: 'fiscal · NCM',   color: PRODUCT_COLOR, type: 'produto',      status: 'current' },
]

export default function App() {
  useMeSync()
  const { t } = useTranslation()
  const location = useLocation()
  const {
    currentUser,
    tooltipsDisabled,
    toggleTooltips,
    toggleTheme,
    currentTheme,
    clearCurrentUser,
  } = useShellStore()
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)
  const workspacesStore  = useShellStore(s => s.workspaces)

  const { history, addEntry } = useLocalizadorHistory(PRODUCT_ID)

  useEffect(() => {
    if (currentUser.id && currentUser.idOrganizacao) {
      setApiContext({
        idOrganizacao: currentUser.idOrganizacao,
        idUsuario: currentUser.id,
        idWorkspace: idWorkspaceAtivo ?? undefined,
      })
    }
  }, [currentUser.idOrganizacao, currentUser.id, idWorkspaceAtivo])

  useEffect(() => {
    const seg = location.pathname.split('/').filter(Boolean).pop() ?? 'insights'
    const pageLabel = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
    addEntry({
      productId:    PRODUCT_ID,
      productLabel: PRODUCT_NAME,
      productColor: PRODUCT_COLOR,
      pageLabel,
      pagePath:     location.pathname,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser.email?.[0]?.toUpperCase() ?? '?'

  const navItems = PRODUCT_CONFIG.navigation.map(item => mapNavItem(item as NavigationItem))

  const pageMeta = useMemo(
    () => traduzirPageMetaTopoEstimativaCusto(location.pathname, t),
    [location.pathname, t],
  )

  const wsAtivo = workspacesStore.find(ws => ws.id === idWorkspaceAtivo)
  const nomeWorkspaceAtivo =
    wsAtivo?.nome_workspace ?? currentUser.nomeWorkspacePreferido ?? currentUser.nomeOrganizacao ?? 'Minha Empresa'

  return (
    <TelaProdutoComOrganizacaoOverride
      productId={PRODUCT_ID}
      productName={PRODUCT_NAME}
      tenantName={nomeWorkspaceAtivo}
      tenantPlan={currentUser.nomeOrganizacao ?? ''}
      navItems={navItems as never}
      tooltipsDisabled={tooltipsDisabled}
      onToggleTooltips={toggleTooltips}
      onNavigateHub={() => { window.location.href = '/hub' }}
      localizador={{
        workspaceName:       nomeWorkspaceAtivo,
        currentPageLabel:    pageMeta.label,
        currentPageIcon:     pageMeta.icone,
        currentPageSubtitle: pageMeta.subtitulo,
        history,
        nodes: ECOSYSTEM_NODES,
        onNavigate: (node) => {
          if (node.type === 'hub')               window.location.href = '/hub'
          else if (node.type === 'configurador') window.location.href = '/configurador'
          else if (node.type === 'produto')      window.location.href = `/${node.id}`
        },
      }}
      usuario={{
        userName:              currentUser.name  || 'Usuário',
        userEmail:             currentUser.email || '',
        userInitials:          initials,
        userRole:              currentUser.role  ?? 'Membro',
        isLight:               currentTheme === 'light',
        onToggleTheme:         toggleTheme,
        onNavigateWorkspace:   () => { window.location.href = '/configurador' },
        onNavigateMarketPlace: () => { window.location.href = '/store' },
        onSignOut:             () => { clearCurrentUser(); window.location.href = '/' },
      }}
    >
      <ToastContainer />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route index element={<Navigate to={rotaSimulaCusto('insights')} replace />} />
          <Route element={<EstimativaCustoVisualizacaoLayout />}>
            <Route path="insights"      element={estimativaCustoVisualizacoesElement} />
            <Route path="lista"         element={estimativaCustoVisualizacoesElement} />
            <Route path="dashboard"     element={estimativaCustoVisualizacoesElement} />
            <Route path="kanban"        element={estimativaCustoVisualizacoesElement} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="estimativas/nova"                  element={<Formulario />} />
          <Route path="estimativas/:id_estimativa_custo"  element={<Formulario />} />
          {/* Redirects legado */}
          <Route path="estimativas"   element={<Navigate to={rotaSimulaCusto('lista')} replace />} />
          <Route path="visao-geral"   element={<Navigate to={rotaSimulaCusto('insights')} replace />} />
          <Route path="*"             element={<Navigate to={rotaSimulaCusto('insights')} replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoComOrganizacaoOverride>
  )
}

export { PRODUCT_CONFIG }
