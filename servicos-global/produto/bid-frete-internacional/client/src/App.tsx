/**
 * App.tsx — Raiz da SPA BID Frete Internacional
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
const Cotacoes = lazy(() => import('./pages/lista-bid-frete-internacional'))
const ModalNovaCotacaoBidFreteInternacional = lazy(
  () => import('./pages/modal-nova-cotacao-bid-frete-internacional'),
)
const CotacoesImportar = lazy(() => import('./pages/cotacoes-importar'))
const DetalheCotacao = lazy(() => import('./pages/cotacao-detalhe'))
const Comparativo = lazy(() => import('./pages/comparativo'))
const Fornecedores = lazy(() => import('./pages/fornecedores-lista'))
const DetalheFornecedor = lazy(() => import('./pages/fornecedor-detalhe'))
const Configuracoes = lazy(() => import('./pages/configuracoes'))

const VisaoFornecedorDashboard = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-dashboard'))
const VisaoFornecedorCotacoesPendentes = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-cotacoes-pendentes'))
const VisaoFornecedorPropostas = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-propostas'))
const VisaoFornecedorTabelasValor = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-tabelas-valor'))
const VisaoFornecedorDesempenho = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-desempenho'))
const VisaoFornecedorResponderCotacao = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-responder-cotacao'))
const VisaoFornecedorResponderPublico = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-responder-publico'))

const PRODUTO       = getProdutoMeta('bid-frete-internacional')
const PRODUCT_ID    = 'bid-frete-internacional'
const PRODUCT_NAME  = 'BID Frete Internacional'
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
    const pageLabel = location.pathname.split('/').filter(Boolean).pop() ?? 'BID Frete Internacional'
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

  const isRespostaPublica = location.pathname.includes(
    '/visao-fornecedor-bid-frete-internacional/publico/',
  )

  const navItems = useMemo(() => {
    const isVisaoFornecedor =
      location.pathname.includes('visao-fornecedor-bid-frete-internacional')
      && !isRespostaPublica
    const nav = isVisaoFornecedor
      ? PRODUCT_CONFIG.navigation_visao_fornecedor_bid_frete_internacional
      : PRODUCT_CONFIG.navigation
    return nav.map(item => mapNavItem(item))
  }, [location.pathname, isRespostaPublica])

  if (isRespostaPublica) {
    return (
      <>
        <ToastContainer />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route
              path="visao-fornecedor-bid-frete-internacional/publico/:token_resposta_disparo_cotacao_bid_frete_internacional"
              element={<VisaoFornecedorResponderPublico />}
            />
          </Routes>
        </Suspense>
      </>
    )
  }

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
          <Route path="cotacoes/nova" element={<ModalNovaCotacaoBidFreteInternacional />} />
          <Route path="cotacoes/importar" element={<CotacoesImportar />} />
          <Route path="cotacoes/:id_cotacao" element={<DetalheCotacao />} />
          <Route path="cotacoes/:id_cotacao/comparativo" element={<Comparativo />} />
          <Route path="fornecedores"   element={<Fornecedores />} />
          <Route path="fornecedores/:id_fornecedor" element={<DetalheFornecedor />} />
          <Route path="configuracoes"  element={<Configuracoes />} />

          <Route path="visao-fornecedor-bid-frete-internacional" element={<Navigate to="visao-fornecedor-bid-frete-internacional/dashboard" replace />} />
          <Route path="visao-fornecedor-bid-frete-internacional/dashboard" element={<VisaoFornecedorDashboard />} />
          <Route path="visao-fornecedor-bid-frete-internacional/cotacoes-pendentes" element={<VisaoFornecedorCotacoesPendentes />} />
          <Route path="visao-fornecedor-bid-frete-internacional/propostas" element={<VisaoFornecedorPropostas />} />
          <Route path="visao-fornecedor-bid-frete-internacional/tabelas-valor" element={<VisaoFornecedorTabelasValor />} />
          <Route path="visao-fornecedor-bid-frete-internacional/desempenho" element={<VisaoFornecedorDesempenho />} />
          <Route path="visao-fornecedor-bid-frete-internacional/responder/:id_disparo_cotacao_bid_frete_internacional" element={<VisaoFornecedorResponderCotacao />} />

          {/* Redirects legado portal → visão fornecedor */}
          <Route path="portal/*" element={<Navigate to="/visao-fornecedor-bid-frete-internacional/dashboard" replace />} />

          <Route path="*" element={<Navigate to="visao-geral" replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoComOrganizacaoOverride>
  )
}

export { PRODUCT_CONFIG }
