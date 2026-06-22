/**
 * App.tsx — Raiz da SPA Smart Read
 *
 * Mesmo padrão do BID Frete: <TelaProdutoComOrganizacaoOverride> + multi-view
 * (Insights | Lista | Dashboard | Kanban) com default em /lista.
 */

import React, { lazy, Suspense, useEffect, useMemo } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useShellStore, ToastContainer, useMeSync, TelaProdutoComOrganizacaoOverride } from '@gravity/shell'
import { useClerk } from '@clerk/clerk-react'
import { useLocalizadorHistory, type EcosystemNode } from '@nucleo/localizador-global'
import {
  FileMagnifyingGlass, FileText, GearSix, UserCircle, CheckCircle,
  Envelope, WhatsappLogo, ClockCounterClockwise, ListBullets,
} from '@phosphor-icons/react'
import { PRODUCT_CONFIG, type NavigationItem } from './shared/config'
import { setApiContext } from './shared/api'
import { rotaSmartRead } from './shared/rotas-smart-read'
import { SmartReadVisualizacaoLayout } from './components/SmartReadVisualizacaoLayout'
import { SmartReadMultiView } from './components/SmartReadMultiView'
import type { NavItem } from '@nucleo/tela-produto-global'

const ConfiguracoesSmartRead = lazy(() => import('./pages/configuracoes-smart-read/ConfiguracoesSmartRead'))

const smartReadVisualizacoesElement = <SmartReadMultiView />

const PRODUCT_ID = 'smart-read'
const PRODUCT_NAME = 'Smart Read'
const PRODUCT_COLOR = PRODUCT_CONFIG.color

const iconMap: Record<string, React.ReactNode> = {
  'file-text':               <FileText              weight="duotone" size={20} />,
  'gear-six':                <GearSix               weight="duotone" size={20} />,
  'user-circle':             <UserCircle            weight="duotone" size={20} />,
  'check-circle':            <CheckCircle           weight="duotone" size={20} />,
  'envelope':                <Envelope              weight="duotone" size={20} />,
  'whatsapp-logo':           <WhatsappLogo          weight="duotone" size={20} />,
  'clock-counter-clockwise': <ClockCounterClockwise weight="duotone" size={20} />,
}

function mapNavItem(item: NavigationItem): NavItem {
  if (item.sectionDivider) {
    return { label: item.label, icon: null, sectionDivider: true as const }
  }
  return {
    id:           item.id,
    to:           item.id,
    label:        item.label,
    icon:         iconMap[item.icon ?? ''] ?? <ListBullets weight="duotone" size={20} />,
    disabled:     item.disabled,
    badge:        item.badge,
    badgeVariant: item.badgeVariant,
    external:     item.external,
    children:     item.children?.map(mapNavItem),
  }
}

const NAV_ITEMS: NavItem[] = PRODUCT_CONFIG.navigation.map(mapNavItem)

const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'hub',          label: 'Hub',          sublabel: 'workspaces',            color: '#818cf8',     type: 'hub',          status: 'accessible' },
  { id: 'configurador', label: 'Configurador', sublabel: 'auth · billing',        color: '#f472b6',     type: 'configurador', status: 'accessible' },
  { id: PRODUCT_ID,     label: PRODUCT_NAME,   sublabel: 'leitura de documentos', color: PRODUCT_COLOR, type: 'produto',      status: 'current' },
]

const ROTULO_PAGINA: Record<string, string> = {
  lista: 'Leituras',
  insights: 'Insights',
  dashboard: 'Dashboard',
  kanban: 'Kanban',
  leituras: 'Leituras',
  configuracoes: 'Configurações',
}

const ROUTE_HEADERS: Record<string, { icone: React.ReactNode; subtitulo: string }> = {
  lista: {
    icone: <FileText weight="duotone" size={22} />,
    subtitulo: 'Envios, transações API e métricas de leitura',
  },
  insights: {
    icone: <FileText weight="duotone" size={22} />,
    subtitulo: '',
  },
  dashboard: {
    icone: <FileText weight="duotone" size={22} />,
    subtitulo: 'Painéis configuráveis — em breve',
  },
  kanban: {
    icone: <FileText weight="duotone" size={22} />,
    subtitulo: 'Acompanhamento por status de leitura',
  },
  leituras: {
    icone: <FileMagnifyingGlass weight="duotone" size={22} />,
    subtitulo: 'Leitura inteligente de documentos COMEX',
  },
  configuracoes: {
    icone: <GearSix weight="duotone" size={22} />,
    subtitulo: 'Preferências e ajustes do Smart Read',
  },
}

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '2rem' }}>
      <div style={{ height: '1.5rem', width: '60%', background: 'var(--bg-surface)', borderRadius: '0.375rem' }} />
      <div style={{ height: '20rem', width: '100%', background: 'var(--bg-surface)', borderRadius: '0.5rem' }} />
    </div>
  )
}

function resolverRouteKey(relSegments: string[]): string {
  if (relSegments[0] === 'leituras') return 'leituras'
  if (relSegments[0] === 'configuracoes') return 'configuracoes'
  return relSegments[0] ?? 'lista'
}

export default function App() {
  useMeSync()
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
    setApiContext({
      idOrganizacao: currentUser?.idOrganizacao ?? '',
      idUsuario: currentUser?.id ?? '',
    })
  }, [currentUser?.idOrganizacao, currentUser?.id])

  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const productIdx = segments.findIndex(s => s === PRODUCT_ID)
    const relSegments = productIdx >= 0 ? segments.slice(productIdx + 1) : segments
    const routeKey = resolverRouteKey(relSegments)
    const pageLabel = ROTULO_PAGINA[routeKey] ?? PRODUCT_NAME

    addEntry({
      productId:    PRODUCT_ID,
      productLabel: PRODUCT_NAME,
      productColor: PRODUCT_COLOR,
      pageLabel,
      pagePath:     location.pathname,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const segments    = location.pathname.split('/').filter(Boolean)
  const productIdx  = segments.findIndex(s => s === PRODUCT_ID)
  const relSegments = productIdx >= 0 ? segments.slice(productIdx + 1) : segments
  const routeKey    = resolverRouteKey(relSegments)
  const pageHeader  = ROUTE_HEADERS[routeKey] ?? ROUTE_HEADERS.lista

  const currentPageLabel = useMemo(
    () => ROTULO_PAGINA[routeKey] ?? 'Leituras',
    [routeKey],
  )

  const initials = currentUser.name
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser.email?.[0]?.toUpperCase() ?? '?'

  const isAdmin =
    currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ||
    currentUser.role === 'SUPER_ADMIN'  || currentUser.role === 'ADMIN'

  const wsAtivo = workspacesStore.find(ws => ws.id === idWorkspaceAtivo)
  const nomeWorkspaceAtivo = wsAtivo?.nome_workspace ?? currentUser.nomeWorkspacePreferido ?? currentUser.nomeOrganizacao ?? 'Minha Empresa'

  const workspacesSidebar = workspacesStore.map(ws => ({ id: ws.id, name: ws.nome_workspace, plan: '' }))

  return (
    <TelaProdutoComOrganizacaoOverride
      productId={PRODUCT_ID}
      productName={PRODUCT_NAME}
      tenantName={nomeWorkspaceAtivo}
      tenantPlan={currentUser.nomeOrganizacao ?? ''}
      navItems={NAV_ITEMS}
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
      onNavigateSettings={() => { navigate('/smart-read/configuracoes') }}
      localizador={{
        workspaceName:       nomeWorkspaceAtivo,
        currentPageLabel:    currentPageLabel,
        currentPageIcon:     pageHeader?.icone,
        currentPageSubtitle: pageHeader?.subtitulo,
        history,
        nodes: ECOSYSTEM_NODES,
        onNavigate: (node: EcosystemNode) => {
          if (node.type === 'hub')               window.location.href = '/hub'
          else if (node.type === 'configurador') window.location.href = '/configurador'
          else if (node.type === 'produto')      window.location.href = rotaSmartRead('lista')
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
          <Route path="/" element={<Navigate to={rotaSmartRead('lista')} replace />} />
          <Route path="visao-geral" element={<Navigate to={rotaSmartRead('lista')} replace />} />
          <Route path="leituras" element={<Navigate to={rotaSmartRead('lista')} replace />} />
          <Route element={<SmartReadVisualizacaoLayout />}>
            <Route path="insights"  element={smartReadVisualizacoesElement} />
            <Route path="lista"     element={smartReadVisualizacoesElement} />
            <Route path="dashboard" element={smartReadVisualizacoesElement} />
            <Route path="kanban"    element={smartReadVisualizacoesElement} />
          </Route>
          <Route path="configuracoes" element={<ConfiguracoesSmartRead />} />
          <Route path="*" element={<Navigate to={rotaSmartRead('lista')} replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoComOrganizacaoOverride>
  )
}

export { PRODUCT_CONFIG }
