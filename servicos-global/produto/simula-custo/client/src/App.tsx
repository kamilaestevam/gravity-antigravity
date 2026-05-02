import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useShellStore } from '@gravity/shell'
import { TelaProdutoGlobal } from '@nucleo/tela-produto-global'
import {
  useLocalizadorHistory,
  type EcosystemNode,
} from '@nucleo/localizador-global'
import { PRODUCT_CONFIG } from './shared/config'
import { setApiContext } from './shared/api'
import { getProdutoMeta } from '@nucleo/logo-produtos'

import {
  Calculator,
  Upload,
  ChartBar,
  ChartPieSlice,
  CheckCircle,
  FileText,
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
const EstimativasDashboard = lazy(() => import('./pages/estimativas/EstimativasDashboard'))
const EstimativasImportar  = lazy(() => import('./pages/importar/EstimativasImportar'))
const Configuracoes        = lazy(() => import('./pages/Configuracoes'))

import Dashboard from './pages/dashboard/Dashboard'
import EstimativaFormulario from './pages/estimativas/EstimativaFormulario'
import RelatoriosPage from './pages/relatorios/Relatorios'
import { Dashboard as GlobalDashboard } from '@plataforma/dashboard/src/Dashboard'

// ── Identidade do produto ─────────────────────────────────────────────────────
const PRODUTO       = getProdutoMeta('simula-custo')
const PRODUCT_ID    = 'simula-custo'
const PRODUCT_NAME  = 'SimulaCusto'
const PRODUCT_COLOR = PRODUTO.color   // usado nos ECOSYSTEM_NODES

const iconMap: Record<string, React.ReactNode> = {
  'calculator':              <Calculator    weight="duotone" size={20} />,
  'upload':                  <Upload        weight="duotone" size={20} />,
  'bar-chart':               <ChartBar      weight="duotone" size={20} />,
  'chart-pie-slice':         <ChartPieSlice weight="duotone" size={20} />,
  'check-circle':            <CheckCircle   weight="duotone" size={20} />,
  'file-text':               <FileText      weight="duotone" size={20} />,
  'clock-counter-clockwise': <Clock         weight="duotone" size={20} />,
  'clock':                   <Clock         weight="duotone" size={20} />,
  'sparkle':                 <Sparkle       weight="duotone" size={20} />,
  'envelope':                <Envelope      weight="duotone" size={20} />,
  'chat-circle':             <ChatCircle    weight="duotone" size={20} />,
  'list-bullets':            <ListBullets   weight="duotone" size={20} />,
  'gear-six':                <GearSix       weight="duotone" size={20} />,
  'kanban':                  <Kanban        weight="duotone" size={20} />,
  'user-circle':             <UserCircle    weight="duotone" size={20} />,
}

function mapNavigation(items: typeof PRODUCT_CONFIG.navigation): ReturnType<typeof mapNavigation> {
  return (items as readonly any[]).map((item) => ({
    to:       item.children ? undefined : item.id,
    label:    item.label,
    icon:     iconMap[item.icon] ?? <CheckCircle weight="duotone" size={20} />,
    children: item.children ? mapNavigation(item.children as any) : undefined,
  }))
}

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
  }}>
    Carregando módulo…
  </div>
)

// ── Labels de rota ────────────────────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  'dashboard':     'Dashboard',
  'estimativas':   'Estimativas',
  'nova':          'Nova Estimativa',
  'importar':      'Importar',
  'relatorios':    'Relatórios',
  'historico':     'Histórico',
  'kanban':        'Kanban',
  'configuracoes': 'Configurações',
}

// ── Nós do ecossistema para o Localizador ─────────────────────────────────────
const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'hub',          label: 'Gravity',     sublabel: 'workspace',      color: '#818cf8',     type: 'hub',          status: 'accessible' },
  { id: 'configurador', label: 'Configurador', sublabel: 'auth · billing', color: '#f472b6',     type: 'configurador', status: 'accessible' },
  { id: PRODUCT_ID,     label: PRODUCT_NAME,  sublabel: 'fiscal · NCM',   color: PRODUCT_COLOR, type: 'produto',      status: 'current' },
]

export default function App() {
  const location = useLocation()
  const {
    currentUser,
    setCurrentUser,
    tooltipsDisabled,
    toggleTooltips,
    toggleTheme,
    currentTheme,
    clearCurrentUser,
  } = useShellStore()

  const { history, addEntry } = useLocalizadorHistory(PRODUCT_ID)

  useEffect(() => {
    if (currentUser.tenantId) {
      setApiContext({ tenantId: currentUser.tenantId, userId: currentUser.id })
    }
  }, [currentUser.tenantId, currentUser.id])

  useEffect(() => {
    if (!currentUser.name) {
      setCurrentUser({
        id: 'user-demo',
        name: 'Daniel Silva',
        email: 'dmmltda@gmail.com',
        tenantId: 'tenant-1',
        tenantName: 'Gravity Soluções',
      })
    }
  }, [currentUser, setCurrentUser])

  useEffect(() => {
    const seg = location.pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
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
    : '??'

  const navItems = mapNavigation(PRODUCT_CONFIG.navigation as any)

  const routeSegment = location.pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
  const pageLabel = ROUTE_LABELS[routeSegment] ?? routeSegment.charAt(0).toUpperCase() + routeSegment.slice(1)

  return (
    <TelaProdutoGlobal
      productId={PRODUCT_ID}
      productName={PRODUCT_NAME}
      tenantName={currentUser.tenantName ?? 'Minha Empresa'}
      tenantPlan="Pro"
      navItems={navItems}
      tooltipsDisabled={tooltipsDisabled}
      onToggleTooltips={toggleTooltips}
      onNavigateHub={() => { window.location.href = '/hub' }}
      onNavigateCore={() => { window.location.href = '/core' }}
      localizador={{
        workspaceName:    currentUser.tenantName ?? 'Minha Empresa',
        currentPageLabel: pageLabel,
        history,
        nodes: ECOSYSTEM_NODES,
        onNavigate: (node) => {
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
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"                  element={<Dashboard />} />
          <Route path="estimativas"                element={<EstimativasDashboard />} />
          <Route path="estimativas/nova"           element={<EstimativaFormulario />} />
          <Route path="estimativas/:id_estimativa" element={<EstimativaFormulario />} />
          <Route path="importar"                   element={<EstimativasImportar />} />
          <Route path="relatorios"       element={<RelatoriosPage />} />
          <Route path="configuracoes"    element={<Configuracoes />} />
          <Route path="kanban"           element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Kanban (Em breve)</div>} />
          <Route path="meu-espaco"       element={<GlobalDashboard />} />
          <Route path="meu-espaco/atividades" element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Módulo de Atividades (Tenant)</div>} />
          <Route path="meu-espaco/email"      element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Módulo de E-mails (Tenant)</div>} />
          <Route path="meu-espaco/whatsapp"   element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Módulo de Whatsapp (Tenant)</div>} />
          <Route path="historico"        element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Módulo de Histórico (Tenant)</div>} />
          <Route path="*"                element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoGlobal>
  )
}

export { PRODUCT_CONFIG }
