/**
 * App.tsx — Raiz da SPA BID Cambio
 *
 * Usa <TelaProdutoGlobal> (mesmo padrão do BID Frete):
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
  ArrowsLeftRight,
  Kanban,
  Compass,
  Ranking,
  CurrencyDollar,
  PencilSimple,
  PaperPlaneTilt,
  Star,
} from '@phosphor-icons/react'
import { PRODUCT_CONFIG, type NavigationItem } from './shared/config'
import type { NavItem } from '@nucleo/tela-produto-global'

// ── Lazy loading das telas ────────────────────────────────────────────────────

// Páginas do Comprador (Importador/Exportador/Trading)
const VisaoGeral = lazy(() => import('./pages/VisaoGeral'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ListaCambios = lazy(() => import('./pages/ListaCambios'))
const NovaCotacao = lazy(() => import('./pages/NovaCotacao'))
const DetalheCotacao = lazy(() => import('./pages/DetalheCotacao'))
const Comparativo = lazy(() => import('./pages/Comparativo'))
const Corretoras = lazy(() => import('./pages/Corretoras'))
const DetalheCorretora = lazy(() => import('./pages/DetalheCorretora'))
const ModalPagamentoCambio = lazy(() => import('./pages/ModalCambioPagamento'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))
const Lista = lazy(() => import('./pages/Lista'))
const KanbanPage = lazy(() => import('./pages/Kanban'))

// Portal da Corretora (logado)
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'))
const CotacoesPendentes = lazy(() => import('./pages/portal/CotacoesPendentes'))
const ResponderCotacao = lazy(() => import('./pages/portal/ResponderCotacao'))
const PortalRespostas = lazy(() => import('./pages/portal/Respostas'))
const PortalDesempenho = lazy(() => import('./pages/portal/Desempenho'))
const PortalConfiguracoes = lazy(() => import('./pages/portal/Configuracoes'))

// Portal Público (sem login — via token)
const ResponderPublico = lazy(() => import('./pages/portal/ResponderPublico'))

// ── Identidade do produto ─────────────────────────────────────────────────────
const PRODUTO       = getProdutoMeta('bid-cambio')
const PRODUCT_ID    = 'bid-cambio'
const PRODUCT_NAME  = 'BID Cambio'
const PRODUCT_COLOR = PRODUTO.color

const iconMap: Record<string, React.ReactNode> = {
  'chart-pie-slice':         <ChartPieSlice         weight="duotone" size={20} />,
  'chart-bar':               <ChartBar              weight="duotone" size={20} />,
  'file-text':               <FileText              weight="duotone" size={20} />,
  'list-bullets':            <ListBullets           weight="duotone" size={20} />,
  'arrows-left-right':       <ArrowsLeftRight       weight="duotone" size={20} />,
  'buildings':               <Buildings             weight="duotone" size={20} />,
  'clock-counter-clockwise': <ClockCounterClockwise weight="duotone" size={20} />,
  'gear-six':                <GearSix               weight="duotone" size={20} />,
  'user-circle':             <UserCircle            weight="duotone" size={20} />,
  'check-circle':            <CheckCircle           weight="duotone" size={20} />,
  'envelope':                <Envelope              weight="duotone" size={20} />,
  'kanban':                  <Kanban                weight="duotone" size={20} />,
}

function mapNavItem(item: NavigationItem): NavItem {
  if (item.sectionDivider) {
    return { label: item.label, sectionDivider: true as const }
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
  'lista':                              'Lista',
  'kanban':                             'Kanban',
  'cambios':                            'Câmbios',
  'cotacoes':                           'Cotações',
  'cotacoes/nova':                      'Nova Cotação',
  'corretoras':                         'Corretoras',
  'configuracoes':                      'Configurações',
  'portal/dashboard':                   'Portal — Dashboard',
  'portal/pendentes':                   'Cotações Pendentes',
  'portal/respostas':                   'Respostas',
  'portal/desempenho':                  'Desempenho',
}

// ── Cabeçalho da página por rota (ícone + subtítulo) — renderizado no top bar ──
const ROUTE_HEADERS: Record<string, { icone: React.ReactNode; subtitulo: string }> = {
  'visao-geral':       { icone: <Compass          weight="duotone" size={22} />, subtitulo: 'Resumo das operações de câmbio' },
  'dashboard':         { icone: <ChartBar         weight="duotone" size={22} />, subtitulo: 'KPIs e widgets configuráveis' },
  'lista':             { icone: <ListBullets      weight="duotone" size={22} />, subtitulo: 'Todas as operações de câmbio em tabela' },
  'kanban':            { icone: <Kanban           weight="duotone" size={22} />, subtitulo: 'Operações de câmbio organizadas por status' },
  'cambios':           { icone: <CurrencyDollar   weight="duotone" size={22} />, subtitulo: 'Pagamentos e recebimentos em moeda estrangeira' },
  'cotacoes':          { icone: <FileText         weight="duotone" size={22} />, subtitulo: 'Cotações de câmbio recebidas das corretoras' },
  'cotacoes/nova':     { icone: <ArrowsLeftRight  weight="duotone" size={22} />, subtitulo: 'Crie uma nova cotação de câmbio' },
  'corretoras':        { icone: <Buildings        weight="duotone" size={22} />, subtitulo: 'Corretoras de câmbio cadastradas' },
  'configuracoes':     { icone: <GearSix          weight="duotone" size={22} />, subtitulo: 'Personalize cards, colunas e status do produto' },
  'portal/dashboard':  { icone: <ChartPieSlice    weight="duotone" size={22} />, subtitulo: 'Visão geral das suas cotações e desempenho' },
  'portal/pendentes':  { icone: <Envelope         weight="duotone" size={22} />, subtitulo: 'Cotações aguardando sua resposta' },
  'portal/respostas':  { icone: <PaperPlaneTilt   weight="duotone" size={22} />, subtitulo: 'Propostas que você enviou' },
  'portal/desempenho': { icone: <Star             weight="duotone" size={22} />, subtitulo: 'Métricas das suas propostas' },
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

  const { history, visitedIds, addEntry } = useLocalizadorHistory(PRODUCT_ID)

  useEffect(() => {
    const pageLabel = location.pathname.split('/').filter(Boolean).pop() ?? 'BID Cambio'
    addEntry({
      productId:    PRODUCT_ID,
      productLabel: PRODUCT_NAME,
      productColor: PRODUCT_COLOR,
      pageLabel,
      pagePath:     location.pathname,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const segments     = location.pathname.split('/').filter(Boolean)
  const productIdx   = segments.findIndex(s => s === PRODUCT_ID)
  const relSegments  = productIdx >= 0 ? segments.slice(productIdx + 1) : segments
  const routeKey     = relSegments.join('/')
  const pageLabel    = ROUTE_LABELS[routeKey] ?? 'Visão Geral'
  const pageHeader   = ROUTE_HEADERS[routeKey]

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
      onNavigateSettings={() => { navigate('/produto/bid-cambio/configuracoes') }}
      localizador={{
        workspaceName:       nomeWorkspaceAtivo,
        currentPageLabel:    pageLabel,
        currentPageIcon:     pageHeader?.icone,
        currentPageSubtitle: pageHeader?.subtitulo,
        history,
        nodes: ECOSYSTEM_NODES,
        visitedNodeIds: visitedIds,
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
          {/* Rotas do Comprador */}
          <Route path="/"              element={<Navigate to="visao-geral" replace />} />
          <Route path="visao-geral"    element={<VisaoGeral />} />
          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="lista"          element={<Lista />} />
          <Route path="kanban"         element={<KanbanPage />} />
          <Route path="cambios"        element={<ListaCambios />} />
          <Route path="cambios/:id_cambio/pagar" element={<ModalPagamentoCambio />} />
          <Route path="cotacoes"       element={<NovaCotacao />} />
          <Route path="cotacoes/nova"  element={<NovaCotacao />} />
          <Route path="cotacoes/:id_cotacao" element={<DetalheCotacao />} />
          <Route path="cotacoes/:id_cotacao/comparativo" element={<Comparativo />} />
          <Route path="corretoras"     element={<Corretoras />} />
          <Route path="corretoras/:id_corretora" element={<DetalheCorretora />} />
          <Route path="configuracoes"  element={<Configuracoes />} />

          {/* Portal da Corretora (logado) */}
          <Route path="portal"                  element={<Navigate to="portal/dashboard" replace />} />
          <Route path="portal/dashboard"        element={<PortalDashboard />} />
          <Route path="portal/pendentes"        element={<CotacoesPendentes />} />
          <Route path="portal/respostas"        element={<PortalRespostas />} />
          <Route path="portal/desempenho"       element={<PortalDesempenho />} />
          <Route path="portal/responder/:id_cotacao" element={<ResponderCotacao />} />
          <Route path="portal/configuracoes"    element={<PortalConfiguracoes />} />

          {/* Portal Público */}
          <Route path="portal/public/responder/:token_resposta" element={<ResponderPublico />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="visao-geral" replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoGlobal>
  )
}

export { PRODUCT_CONFIG }
