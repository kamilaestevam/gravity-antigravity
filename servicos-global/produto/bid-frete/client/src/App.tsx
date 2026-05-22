/**
 * App.tsx — Raiz da SPA BID Frete
 *
 * Usa <TelaProdutoGlobal> (mesmo padrão do Pedido):
 * sidebar com logo + nome do produto, workspace, navegação, título de página.
 */

import React, { lazy, Suspense, useEffect, useMemo } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useShellStore, ToastContainer, useMeSync } from '@gravity/shell'
import { useAuth, useClerk } from '@clerk/clerk-react'
import { TelaProdutoGlobal } from '@nucleo/tela-produto-global'
import { useLocalizadorHistory, type EcosystemNode } from '@nucleo/localizador-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import {
  ChartPieSlice,
  ChartBar,
  ListBullets,
  FileText,
  Buildings,
  ClockCounterClockwise,
  GearSix,
  UserCircle,
  CheckCircle,
  Envelope,
  WhatsappLogo,
  Kanban,
} from '@phosphor-icons/react'
import { PRODUCT_CONFIG, type NavigationItem } from './shared/config'
import type { NavItem } from '@nucleo/tela-produto-global'

// ── Lazy loading das telas ────────────────────────────────────────────────────

// Páginas do Cliente (Importador/Exportador)
// VisaoGeral removida — arquivo nao commitado; bid-frete descontinuado (substituido por bid-frete-internacional)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Cotacoes = lazy(() => import('./pages/Cotacoes'))
const NovaCotacao = lazy(() => import('./pages/NovaCotacao'))
const CotacoesImportar = lazy(() => import('./pages/CotacoesImportar'))
const DetalheCotacao = lazy(() => import('./pages/DetalheCotacao'))
const Comparativo = lazy(() => import('./pages/Comparativo'))
const Fornecedores = lazy(() => import('./pages/Fornecedores'))
const DetalheFornecedor = lazy(() => import('./pages/DetalheFornecedor'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))

// Portal do Fornecedor (logado)
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'))
const CotacoesPendentes = lazy(() => import('./pages/portal/CotacoesPendentes'))
const Respostas = lazy(() => import('./pages/portal/Respostas'))
const TabelaPrecos = lazy(() => import('./pages/portal/TabelaPrecos'))
const Desempenho = lazy(() => import('./pages/portal/Desempenho'))
const ResponderCotacao = lazy(() => import('./pages/portal/ResponderCotacao'))

// Portal Público (sem login — via token)
const ResponderPublico = lazy(() => import('./pages/portal/ResponderPublico'))

// ── Identidade do produto ─────────────────────────────────────────────────────
const PRODUTO       = getProdutoMeta('bid-frete')
const PRODUCT_ID    = 'bid-frete'
const PRODUCT_NAME  = 'BID Frete'
const PRODUCT_COLOR = PRODUTO.color

const iconMap: Record<string, React.ReactNode> = {
  'chart-pie-slice':         <ChartPieSlice         weight="duotone" size={20} />,
  'chart-bar':               <ChartBar              weight="duotone" size={20} />,
  'file-text':               <FileText              weight="duotone" size={20} />,
  'list-bullets':            <ListBullets           weight="duotone" size={20} />,
  'buildings':               <Buildings             weight="duotone" size={20} />,
  'clock-counter-clockwise': <ClockCounterClockwise weight="duotone" size={20} />,
  'gear-six':                <GearSix               weight="duotone" size={20} />,
  'user-circle':             <UserCircle            weight="duotone" size={20} />,
  'check-circle':            <CheckCircle           weight="duotone" size={20} />,
  'envelope':                <Envelope              weight="duotone" size={20} />,
  'whatsapp-logo':           <WhatsappLogo          weight="duotone" size={20} />,
  'kanban':                  <Kanban                weight="duotone" size={20} />,
}

function mapNavItem(item: NavigationItem): NavItem {
  if (item.sectionDivider) {
    return { label: item.label, sectionDivider: true as const, icon: null as any }
  }
  return {
    id:           item.id,
    to:           item.id,
    label:        item.label,
    icon:         iconMap[item.icon ?? ''] ?? <ListBullets weight="duotone" size={20} />,
    disabled:     item.disabled,
    badge:        item.badge,
    badgeVariant: item.badgeVariant as 'accent' | 'muted' | undefined,
    external:     item.external,
    children:     item.children?.map(child => mapNavItem(child)),
  }
}

// ── Workspaces demo ───────────────────────────────────────────────────────────
const DEMO_WORKSPACES = [
  { id: 'ws-1',  name: 'Gravity Soluções',     plan: 'Pro' },
  { id: 'ws-2',  name: 'Acme Importações',     plan: 'Enterprise' },
  { id: 'ws-3',  name: 'Comex Express',        plan: 'Starter' },
]

// ── Nós do ecossistema ───────────────────────────────────────────────────────
const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'hub',          label: 'Hub',          sublabel: 'workspaces',     color: '#818cf8',     type: 'hub',          status: 'accessible' },
  { id: 'configurador', label: 'Configurador', sublabel: 'auth · billing', color: '#f472b6',     type: 'configurador', status: 'accessible' },
  { id: PRODUCT_ID,     label: PRODUCT_NAME,   sublabel: PRODUTO.sublabel, color: PRODUCT_COLOR, type: 'produto',      status: 'current' },
]

// ── Labels de rota para título de página ──────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  'visao-geral':                        'Visão Geral',
  'dashboard':                          'Dashboard',
  'cotacoes':                           'Cotações',
  'cotacoes/nova':                      'Nova Cotação',
  'cotacoes/importar':                  'Importar Cotações',
  'fornecedores':                       'Fornecedores',
  'configuracoes':                      'Configurações',
  'portal/dashboard':                   'Portal — Dashboard',
  'portal/pendentes':                   'Cotações Pendentes',
  'portal/respostas':                   'Respostas',
  'portal/tabela-precos':               'Tabela de Preços',
  'portal/desempenho':                  'Desempenho',
}

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '2rem' }}>
      <div style={{ height: '1.5rem', width: '60%', background: 'var(--bg-surface)', borderRadius: '0.375rem' }} />
      <div style={{ height: '20rem', width: '100%', background: 'var(--bg-surface)', borderRadius: '0.5rem' }} />
    </div>
  )
}

export default function App() {
  useMeSync()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const location = useLocation()
  const navigate = useNavigate()

  const currentUser      = useShellStore(s => s.currentUser)
  const tooltipsDisabled = useShellStore(s => s.tooltipsDisabled)
  const toggleTooltips   = useShellStore(s => s.toggleTooltips)
  const toggleTheme      = useShellStore(s => s.toggleTheme)
  const currentTheme     = useShellStore(s => s.currentTheme)
  const workspacesStore  = useShellStore(s => s.workspaces)
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)

  const { history, addEntry } = useLocalizadorHistory(PRODUCT_ID)

  // Registra navegação no localizador
  useEffect(() => {
    const pageLabel = location.pathname.split('/').filter(Boolean).pop() ?? 'BID Frete'
    addEntry({
      productId:    PRODUCT_ID,
      productLabel: PRODUCT_NAME,
      productColor: PRODUCT_COLOR,
      pageLabel,
      pagePath:     location.pathname,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Resolve título da página a partir dos segmentos relativos ao produto
  const segments    = location.pathname.split('/').filter(Boolean)
  const productIdx  = segments.findIndex(s => s === PRODUCT_ID)
  const relSegments = productIdx >= 0 ? segments.slice(productIdx + 1) : segments
  const routeKey    = relSegments.join('/')
  const pageLabel   = routeKey === 'configuracoes' ? '' : (ROUTE_LABELS[routeKey] ?? 'Visão Geral')

  // Dados do usuário
  const initials = currentUser.name
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser.email?.[0]?.toUpperCase() ?? '?'

  const isAdmin =
    currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ||
    currentUser.role === 'SUPER_ADMIN'  || currentUser.role === 'ADMIN'

  // Workspace ativo
  const wsAtivo = workspacesStore.find(ws => ws.id === idWorkspaceAtivo)
  const nomeWorkspaceAtivo = wsAtivo?.nome_workspace ?? currentUser.nomeWorkspacePreferido ?? currentUser.nomeOrganizacao ?? 'Minha Empresa'

  const workspacesSidebar = workspacesStore.length > 0
    ? workspacesStore.map(ws => ({ id: ws.id, name: ws.nome_workspace, plan: '' }))
    : DEMO_WORKSPACES

  const navItems = useMemo(
    () => PRODUCT_CONFIG.navigation.map(item => mapNavItem(item)),
    []
  )

  return (
    <TelaProdutoGlobal
      productId={PRODUCT_ID}
      productName={PRODUCT_NAME}
      tenantName={nomeWorkspaceAtivo}
      tenantPlan={currentUser.nomeOrganizacao ?? ''}
      navItems={navItems}
      workspaces={workspacesSidebar}
      onSwitchWorkspace={(id: string) => {
        const ws = workspacesStore.find(w => w.id === id)
        sessionStorage.setItem('gravity_company_id', id)
        if (ws) sessionStorage.setItem('gravity_company_name', ws.nome_workspace)
        window.location.reload()
      }}
      onCreateWorkspace={() => { window.location.href = '/configurador/workspace/novo' }}
      onManageWorkspace={() => { window.location.href = '/configurador/workspace' }}
      tooltipsDisabled={tooltipsDisabled}
      onToggleTooltips={toggleTooltips}
      onNavigateHub={() => { window.location.href = '/hub' }}
      onNavigateCore={() => { window.location.href = '/core' }}
      onNavigateSettings={() => { navigate('/produto/bid-frete/configuracoes') }}
      localizador={{
        workspaceName:    nomeWorkspaceAtivo,
        currentPageLabel: pageLabel,
        history,
        nodes: ECOSYSTEM_NODES,
        onNavigate: (node: EcosystemNode) => {
          if (node.type === 'hub')               window.location.href = '/hub'
          else if (node.type === 'configurador') window.location.href = '/configurador'
          else if (node.type === 'produto')      window.location.href = `/produto/${node.id}`
        },
      }}
      usuario={{
        userName:              currentUser.name  || 'Usuário',
        userEmail:             currentUser.email || '',
        userInitials:          initials,
        userRole:              currentUser.role  ?? 'Membro',
        isAdmin,
        onNavigateAdmin:       () => { window.location.href = '/admin' },
        isLight:               currentTheme === 'light',
        onToggleTheme:         toggleTheme,
        onNavigateWorkspace:   () => { window.location.href = '/configurador' },
        onNavigateMarketPlace: () => { window.location.href = '/store' },
        onSignOut:             () => { signOut(() => { window.location.href = '/' }) },
      }}
    >
      <ToastContainer />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Rotas do Cliente */}
          <Route path="/"              element={<Navigate to="dashboard" replace />} />
          {/* Route visao-geral removida — pagina nao commitada (bid-frete descontinuado) */}
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="cotacoes"       element={<Cotacoes />} />
          <Route path="cotacoes/nova"  element={<NovaCotacao />} />
          <Route path="cotacoes/importar" element={<CotacoesImportar />} />
          <Route path="cotacoes/:id_cotacao" element={<DetalheCotacao />} />
          <Route path="cotacoes/:id_cotacao/comparativo" element={<Comparativo />} />
          <Route path="fornecedores"   element={<Fornecedores />} />
          <Route path="fornecedores/:id_fornecedor" element={<DetalheFornecedor />} />
          <Route path="configuracoes"  element={<Configuracoes />} />

          {/* Portal do Fornecedor (logado) */}
          <Route path="portal"                  element={<Navigate to="portal/dashboard" replace />} />
          <Route path="portal/dashboard"        element={<PortalDashboard />} />
          <Route path="portal/pendentes"        element={<CotacoesPendentes />} />
          <Route path="portal/respostas"        element={<Respostas />} />
          <Route path="portal/tabela-precos"    element={<TabelaPrecos />} />
          <Route path="portal/desempenho"       element={<Desempenho />} />
          <Route path="portal/responder/:id_cotacao" element={<ResponderCotacao />} />

          {/* Portal Público */}
          <Route path="portal/public/responder/:token_resposta" element={<ResponderPublico />} />

          <Route path="*" element={<Navigate to="visao-geral" replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoGlobal>
  )
}

export { PRODUCT_CONFIG }
