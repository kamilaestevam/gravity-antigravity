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
import { TelaProdutoComOrganizacaoOverride } from '@gravity/shell'
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
import { resolverPageMetaTopo } from './shared/page-meta-topo'
import './shared/bid-frete-page-shell.css'
import type { NavItem } from '@nucleo/tela-produto-global'

// ── Lazy loading das telas ────────────────────────────────────────────────────

const VisaoGeral = lazy(() => import('./pages/visao-geral'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const Cotacoes = lazy(() => import('./pages/cotacoes-lista'))
const NovaCotacao = lazy(() => import('./pages/cotacao-nova'))
const CotacoesImportar = lazy(() => import('./pages/cotacoes-importar'))
const DetalheCotacao = lazy(() => import('./pages/cotacao-detalhe'))
const Comparativo = lazy(() => import('./pages/comparativo'))
const Fornecedores = lazy(() => import('./pages/fornecedores-lista'))
const DetalheFornecedor = lazy(() => import('./pages/fornecedor-detalhe'))
const Configuracoes = lazy(() => import('./pages/configuracoes'))

const PortalDashboard = lazy(() => import('./pages/portal/portal-dashboard'))
const CotacoesPendentes = lazy(() => import('./pages/portal/portal-cotacoes-pendentes'))
const Respostas = lazy(() => import('./pages/portal/portal-propostas'))
const TabelaPrecos = lazy(() => import('./pages/portal/portal-tabelas-valor'))
const Desempenho = lazy(() => import('./pages/portal/portal-desempenho'))
const ResponderCotacao = lazy(() => import('./pages/portal/portal-responder-cotacao'))
const ResponderPublico = lazy(() => import('./pages/portal/portal-responder-publico'))

const PRODUTO       = getProdutoMeta('bid-frete-internacional')
const PRODUCT_ID    = 'bid-frete-internacional'
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

const DEMO_WORKSPACES = [
  { id: 'ws-1',  name: 'Gravity Soluções',     plan: 'Pro' },
  { id: 'ws-2',  name: 'Acme Importações',     plan: 'Enterprise' },
  { id: 'ws-3',  name: 'Comex Express',        plan: 'Starter' },
]

const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'hub',          label: 'Hub',          sublabel: 'workspaces',     color: '#818cf8',     type: 'hub',          status: 'accessible' },
  { id: 'configurador', label: 'Configurador', sublabel: 'auth · billing', color: '#f472b6',     type: 'configurador', status: 'accessible' },
  { id: PRODUCT_ID,     label: PRODUCT_NAME,   sublabel: PRODUTO.sublabel, color: PRODUCT_COLOR, type: 'produto',      status: 'current' },
]

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

  const pageMeta = useMemo(
    () => resolverPageMetaTopo(location.pathname, location.search),
    [location.pathname, location.search],
  )

  const initials = currentUser.name
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser.email?.[0]?.toUpperCase() ?? '?'

  const isAdmin =
    currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ||
    currentUser.role === 'SUPER_ADMIN'  || currentUser.role === 'ADMIN'

  const wsAtivo = workspacesStore.find(ws => ws.id === idWorkspaceAtivo)
  const nomeWorkspaceAtivo = wsAtivo?.nome_workspace ?? currentUser.nomeWorkspacePreferido ?? currentUser.nomeOrganizacao ?? 'Minha Empresa'

  const workspacesSidebar = workspacesStore.length > 0
    ? workspacesStore.map(ws => ({ id: ws.id, name: ws.nome_workspace, plan: '' }))
    : DEMO_WORKSPACES

  const navItems = useMemo(
    () => PRODUCT_CONFIG.navigation.map(item => mapNavItem(item)),
    [],
  )

  return (
    <TelaProdutoComOrganizacaoOverride
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
      onNavigateSettings={() => { navigate('/bid-frete/configuracoes') }}
      localizador={{
        workspaceName:       nomeWorkspaceAtivo,
        currentPageLabel:    pageMeta.label,
        currentPageIcon:     pageMeta.icone,
        currentPageSubtitle: pageMeta.subtitulo,
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
          <Route path="/"              element={<Navigate to="visao-geral" replace />} />
          <Route path="visao-geral"    element={<VisaoGeral />} />
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="cotacoes"       element={<Cotacoes />} />
          <Route path="cotacoes/nova"  element={<NovaCotacao />} />
          <Route path="cotacoes/importar" element={<CotacoesImportar />} />
          <Route path="cotacoes/:id_cotacao" element={<DetalheCotacao />} />
          <Route path="cotacoes/:id_cotacao/comparativo" element={<Comparativo />} />
          <Route path="fornecedores"   element={<Fornecedores />} />
          <Route path="fornecedores/:id_fornecedor" element={<DetalheFornecedor />} />
          <Route path="configuracoes"  element={<Configuracoes />} />

          <Route path="portal"                  element={<Navigate to="portal/dashboard" replace />} />
          <Route path="portal/dashboard"        element={<PortalDashboard />} />
          <Route path="portal/pendentes"        element={<CotacoesPendentes />} />
          <Route path="portal/respostas"        element={<Respostas />} />
          <Route path="portal/tabela-precos"    element={<TabelaPrecos />} />
          <Route path="portal/desempenho"       element={<Desempenho />} />
          <Route path="portal/responder/:id_cotacao" element={<ResponderCotacao />} />

          <Route path="portal/public/responder/:token_resposta_pedido_cotacao_bid_frete_internacional" element={<ResponderPublico />} />

          <Route path="*" element={<Navigate to="visao-geral" replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoComOrganizacaoOverride>
  )
}

export { PRODUCT_CONFIG }
