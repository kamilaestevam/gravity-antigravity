import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useShellStore, ToastContainer } from '@gravity/shell'
import { TelaProdutoGlobal } from '@nucleo/tela-produto-global'
import { useLocalizadorHistory, type EcosystemNode } from '@nucleo/localizador-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import { ChartPieSlice, ListBullets, Kanban, ClockCounterClockwise, GearSix, UserCircle, CheckCircle, Envelope, WhatsappLogo } from '@phosphor-icons/react'
import { PRODUCT_CONFIG, type NavigationItem } from './shared/config'
import { setApiContext } from './shared/api'
import type { NavItem } from '@nucleo/tela-produto-global'

// ── Lazy loading das telas ────────────────────────────────────────────────────
const ListaPedidos     = lazy(() => import('./pages/ListaPedidos'))
const Configuracoes    = lazy(() => import('./pages/Configuracoes'))
const NovoPedido       = lazy(() => import('./pages/NovoPedido'))
const DashboardPedido  = lazy(() => import('./pages/DashboardPedido'))
const Historico        = lazy(() => import('./pages/Historico'))

// ── Identidade do produto ─────────────────────────────────────────────────────
const PRODUTO       = getProdutoMeta('pedido')
const PRODUCT_ID    = 'pedido'
const PRODUCT_NAME  = 'Pedido'
const PRODUCT_COLOR = PRODUTO.color

const iconMap: Record<string, React.ReactNode> = {
  'chart-pie-slice':         <ChartPieSlice         weight="duotone" size={20} />,
  'list-bullets':            <ListBullets           weight="duotone" size={20} />,
  'kanban':                  <Kanban                weight="duotone" size={20} />,
  'clock-counter-clockwise': <ClockCounterClockwise weight="duotone" size={20} />,
  'gear-six':                <GearSix               weight="duotone" size={20} />,
  'user-circle':             <UserCircle            weight="duotone" size={20} />,
  'check-circle':            <CheckCircle           weight="duotone" size={20} />,
  'envelope':                <Envelope              weight="duotone" size={20} />,
  'whatsapp-logo':           <WhatsappLogo          weight="duotone" size={20} />,
}

function mapNavItem(item: NavigationItem): NavItem {
  if (item.sectionDivider) {
    return { label: item.label, sectionDivider: true as const }
  }
  return {
    to:           item.id,
    label:        item.label,
    icon:         iconMap[item.icon ?? ''] ?? <ListBullets weight="duotone" size={20} />,
    disabled:     item.disabled,
    badge:        item.badge,
    badgeVariant: item.badgeVariant as 'accent' | 'muted' | undefined,
    children:     item.children?.map(mapNavItem),
  }
}

const navItems = PRODUCT_CONFIG.navigation.map(mapNavItem)

// ── Workspaces demo ───────────────────────────────────────────────────────────
const DEMO_WORKSPACES = [
  { id: 'ws-1',  name: 'Gravity Soluções',     plan: 'Pro' },
  { id: 'ws-2',  name: 'Acme Importações',     plan: 'Enterprise' },
  { id: 'ws-3',  name: 'Comex Express',        plan: 'Starter' },
  { id: 'ws-4',  name: 'Global Trade Co.',     plan: 'Pro' },
  { id: 'ws-5',  name: 'Brasília Logistics',   plan: 'Pro' },
  { id: 'ws-6',  name: 'Porto Sul LTDA',       plan: 'Enterprise' },
  { id: 'ws-7',  name: 'Nordeste Import',      plan: 'Starter' },
  { id: 'ws-8',  name: 'Sul Cargo',            plan: 'Pro' },
  { id: 'ws-9',  name: 'Importadora Paulista', plan: 'Enterprise' },
  { id: 'ws-10', name: 'Rio Trade Group',      plan: 'Starter' },
]

// ── Nós do ecossistema ────────────────────────────────────────────────────────
const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'gravity',      label: 'Gravity',      sublabel: 'workspace',      color: '#818cf8',     type: 'gravity',      status: 'accessible' },
  { id: 'configurador', label: 'Configurador', sublabel: 'auth · billing', color: '#f472b6',     type: 'configurador', status: 'accessible' },
  { id: PRODUCT_ID,     label: PRODUCT_NAME,   sublabel: PRODUTO.sublabel,  color: PRODUCT_COLOR, type: 'produto',      status: 'current' },
]

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '2rem' }}>
      <div style={{ height: '1.5rem', width: '60%', background: 'var(--bg-surface)', borderRadius: '0.375rem' }} />
      <div style={{ height: '20rem', width: '100%', background: 'var(--bg-surface)', borderRadius: '0.5rem' }} />
    </div>
  )
}

export function App() {
  const location = useLocation()
  const {
    currentUser,
    tooltipsDisabled,
    toggleTooltips,
    toggleTheme,
    currentTheme,
    clearCurrentUser,
  } = useShellStore()

  const { history, addEntry } = useLocalizadorHistory(PRODUCT_ID)

  // Sincroniza tenant/user do Shell com o contexto de API
  useEffect(() => {
    setApiContext({
      tenantId: currentUser.tenantId ?? import.meta.env.VITE_DEV_TENANT_ID ?? '',
      userId:   currentUser.id       ?? '',
    })
  }, [currentUser.tenantId, currentUser.id])

  useEffect(() => {
    const pageLabel = location.pathname.split('/').filter(Boolean).pop() ?? 'Pedidos'
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
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  const ROUTE_LABELS: Record<string, string> = {
    'pedidos':           'Lista',
    'pedidos/dashboard': 'Dashboard',
    'pedidos/kanban':    'Kanban',
    'pedidos/novo':      'Novo Pedido',
    'historico':         'Histórico',
    'configuracoes':     'Configurações',
  }
  const routeKey  = location.pathname.split('/').filter(Boolean).join('/')
  const pageLabel = ROUTE_LABELS[routeKey] ?? 'Lista'

  return (
    <TelaProdutoGlobal
      productId={PRODUCT_ID}
      productName={PRODUCT_NAME}
      tenantName={currentUser.tenantName ?? 'Minha Empresa'}
      tenantPlan="Pro"
      navItems={navItems}
      workspaces={DEMO_WORKSPACES}
      onSwitchWorkspace={(id: string) => { console.info('switch workspace', id) }}
      onCreateWorkspace={() => { window.location.href = '/configurador/workspace/novo' }}
      onManageWorkspace={() => { window.location.href = '/configurador/workspace' }}
      tooltipsDisabled={tooltipsDisabled}
      onToggleTooltips={toggleTooltips}
      onNavigateHub={() => { window.location.href = '/hub' }}
      onNavigateCore={() => { window.location.href = '/core' }}
      localizador={{
        workspaceName:    currentUser.tenantName ?? 'Minha Empresa',
        currentPageLabel: pageLabel,
        history,
        nodes: ECOSYSTEM_NODES,
        onNavigate: (node: EcosystemNode) => {
          if (node.type === 'gravity')           window.location.href = '/hub'
          else if (node.type === 'configurador') window.location.href = '/configurador'
          else if (node.type === 'produto')      window.location.href = `/produto/${node.id}`
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
          <Route path="/"       element={<Navigate to="pedidos" replace />} />
          <Route path="pedidos"              element={<ListaPedidos />} />
          <Route path="pedidos/dashboard"    element={<DashboardPedido />} />
          <Route path="pedidos/novo"         element={<NovoPedido />} />
          <Route path="pedidos/:id/editar"   element={<NovoPedido />} />
          <Route path="historico"            element={<Historico />} />
          <Route path="configuracoes"        element={<Configuracoes />} />
          <Route path="*"                    element={<Navigate to="pedidos" replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoGlobal>
  )
}

export { PRODUCT_CONFIG }
export default App
