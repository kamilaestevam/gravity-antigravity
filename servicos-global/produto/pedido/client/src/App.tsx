import React, { lazy, Suspense, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useShellStore, ToastContainer, useMeSync } from '@gravity/shell'
import { useAuth, useClerk } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TelaProdutoGlobal } from '@nucleo/tela-produto-global'
import { useLocalizadorHistory, type EcosystemNode } from '@nucleo/localizador-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import { ChartPieSlice, ListBullets, Kanban, ClockCounterClockwise, GearSix, UserCircle, CheckCircle, Envelope, WhatsappLogo } from '@phosphor-icons/react'
import { PRODUCT_CONFIG, type NavigationItem } from './shared/config'
import { Notificacoes } from '../../../../servicos-plataforma/notificacoes/src/Notificacoes'
import { setApiContext, injectTenantGetter, injectTokenGetter, injectWorkspaceGetter } from './shared/api'
import { usePermissoesPedido, type SecaoPedido } from './shared/permissoes/usePermissoesPedido'
import { BloqueioPermissaoOpaco } from './shared/permissoes/BloqueioPermissaoOpaco'
import type { NavItem } from '@nucleo/tela-produto-global'

/**
 * Mapa `id da navItem → seção do produto Pedido`. Decisão dono 2026-05-13.
 * Itens cujo id NÃO está aqui não são gateados (Meu Espaço, section divider).
 */
const ID_NAV_PARA_SECAO: Record<string, SecaoPedido> = {
  '/produto/pedido/pedidos/dashboard': 'dashboard',
  '/produto/pedido/pedidos/lista':     'lista',
  '/produto/pedido/pedidos/kanban':    'kanban',
  '/produto/pedido/configuracoes':     'configuracao',
  '/workspace/historico-organizacao?id_produto_historico_log=pedido': 'historico',
}

// Injeta o getter uma vez quando o módulo carrega — lê o Zustand sincronamente
// no exato momento de cada request, sem depender do ciclo de vida do React.
// IMPORTANTE: só retorna o tenantId autoritativo do store. Nunca mistura com env fallback
// aqui — caso contrário, quando o store pisca (Clerk refresh), o env sobrescreve
// o cache com um valor que pode não ser o do usuário atual.
injectTenantGetter(() => useShellStore.getState().currentUser?.idOrganizacao)

// Injeta o getter de id_workspace — exigido pelo middleware verificarAcessoProduto
// (Portão 3 / Mandamento 04) no backend do Pedido. Workspace ativo mora em
// sessionStorage('gravity_company_id'), definido pelo Shell em SelecionarWorkspace.tsx.
injectWorkspaceGetter(() => {
  try { return sessionStorage.getItem('gravity_company_id') || undefined }
  catch { return undefined }
})

// ── Lazy loading das telas ────────────────────────────────────────────────────
const Pedidos          = lazy(() => import('./pages/Pedidos'))
const PedidosKanban    = lazy(() => import('./pages/PedidosKanban'))
const Configuracoes    = lazy(() => import('./pages/Configuracoes'))
const PedidoFormulario = lazy(() => import('./pages/PedidoFormulario'))
const PedidosDashboard = lazy(() => import('./pages/PedidosDashboard'))

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

function mapNavItem(item: NavigationItem, t: (key: string) => string): NavItem {
  const label = item.labelKey ? t(item.labelKey) : item.label
  if (item.sectionDivider) {
    return { label, sectionDivider: true as const }
  }
  return {
    id:           item.id,
    to:           item.id,
    label,
    icon:         iconMap[item.icon ?? ''] ?? <ListBullets weight="duotone" size={20} />,
    disabled:     item.disabled,
    badge:        item.badge,
    badgeVariant: item.badgeVariant as 'accent' | 'muted' | undefined,
    external:     item.external,
    children:     item.children?.map(child => mapNavItem(child, t)),
  }
}

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

// QueryClient único do produto Pedido — instanciado fora do componente
// para sobreviver a re-renders. Stale 60s espelha a config recomendada
// no comentário de usePermissoesPedido.ts.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: true },
  },
})

function AppInner() {
  useMeSync()
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  // Pivô 2026-05-14 (Coordenador + Líder Técnico):
  // - `podeVer`/`podeEditar` agora ESTRITOS (só true em 'permitido')
  // - `carregando` distingue load real de terminal-incompleto (Mand. 08)
  // - `estado()` tri-state: 'permitido' | 'negado' | 'indeterminado'
  // Sidebar abaixo combina `carregando || podeVer` pra evitar flash durante load real.
  // Rotas usam `estado() !== 'negado'` pra liberar durante load e bloquear só no negado definitivo.
  const { podeVer, carregando: permissoesCarregando, estado: estadoPermissao } = usePermissoesPedido()

  // Backend do Pedido exige Authorization: Bearer <jwt> via @gravity/resolver-organizacao.
  // Re-injeta sempre que getToken muda (inclui rotacao automatica do Clerk).
  useEffect(() => {
    injectTokenGetter(() => getToken())
  }, [getToken])

  // Gating de sidebar:
  // - Master/SAdmin/Admin → tudo liberado (bypass embutido em podeVer)
  // - Padrão/Fornecedor → item sem `:ver` vira opaco com tag "sem permissão"
  // - Durante load REAL (`permissoesCarregando=true`) → render normal sem tag,
  //   evita flash "Sem permissão" em usuário legítimo.
  // - Em terminal-incompleto (success + !workspace) → permissoesCarregando=false
  //   E podeVer=false → mostra "sem permissão" corretamente (não destrava em silêncio).
  const navItems = useMemo(
    () => PRODUCT_CONFIG.navigation.map(item => {
      const secao = ID_NAV_PARA_SECAO[item.id]
      // Sem mapping (Meu Espaço, dividers, children) → render normal
      if (!secao) return mapNavItem(item, t)
      // Durante load real OU permitido → render normal (sem tag)
      if (permissoesCarregando || podeVer(secao)) return mapNavItem(item, t)
      // Negado definitivo — sobrescreve disabled+badge antes do map
      return mapNavItem({
        ...item,
        disabled: true,
        badge: 'sem permissão',
        badgeVariant: 'muted',
      }, t)
    }),
    [t, podeVer, permissoesCarregando]
  )

  const location = useLocation()
  const navigate = useNavigate()
  const currentUser      = useShellStore(s => s.currentUser)
  const tooltipsDisabled = useShellStore(s => s.tooltipsDisabled)
  const toggleTooltips   = useShellStore(s => s.toggleTooltips)
  const toggleTheme      = useShellStore(s => s.toggleTheme)
  const currentTheme     = useShellStore(s => s.currentTheme)
  const workspacesStore  = useShellStore(s => s.workspaces)
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)
  const setWorkspaceAtivo = useShellStore(s => s.setWorkspaceAtivo)

  const { history, visitedIds, addEntry } = useLocalizadorHistory(PRODUCT_ID)

  // userId/userName não são críticos para auth — atualizados via context quando disponíveis
  useEffect(() => {
    if (currentUser.id) setApiContext({ idOrganizacao: '', userId: currentUser.id, userName: currentUser.name ?? '' })
  }, [currentUser.id, currentUser.name])

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
    : currentUser.email?.[0]?.toUpperCase() ?? '?'

  const isAdmin =
    currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ||
    currentUser.role === 'SUPER_ADMIN'  || currentUser.role === 'ADMIN'

  const ROUTE_LABELS: Record<string, string> = {
    'pedidos':           'Lista',
    'pedidos/lista':     'Lista',
    'pedidos/dashboard': 'Dashboard',
    'pedidos/kanban':    'Kanban',
    'pedidos/novo':      'Novo Pedido',
    'configuracoes':     'Configurações',
  }
  // Extrai segmentos relativos ao produto — funciona standalone (/pedidos)
  // e embarcado no shell (/produto/pedido/pedidos)
  const segments     = location.pathname.split('/').filter(Boolean)
  const productIdx   = segments.findIndex(s => s === PRODUCT_ID)
  const relSegments  = productIdx >= 0 ? segments.slice(productIdx + 1) : segments
  const routeKey     = relSegments.join('/')
  const pageLabel    = ROUTE_LABELS[routeKey] ?? 'Lista'

  const wsAtivo = workspacesStore.find(ws => ws.id === idWorkspaceAtivo)
  const nomeWorkspaceAtivo = wsAtivo?.nome_workspace ?? currentUser.nomeWorkspacePreferido ?? currentUser.nomeOrganizacao ?? 'Minha Empresa'

  const workspacesSidebar = workspacesStore.length > 0
    ? workspacesStore.map(ws => ({ id: ws.id, name: ws.nome_workspace, plan: '' }))
    : DEMO_WORKSPACES

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
      onNavigateSettings={() => { navigate('/produto/pedido/configuracoes') }}
      headerActions={<Notificacoes />}
      localizador={{
        workspaceName:    nomeWorkspaceAtivo,
        currentPageLabel: pageLabel,
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
          <Route path="/"       element={<Navigate to="/produto/pedido/pedidos/lista" replace />} />
          <Route path="pedidos"                  element={<Navigate to="/produto/pedido/pedidos/lista" replace />} />
          {/* Defesa de URL direta — usuário cola link sem permissão. Backend
              também rejeita 403 (defesa em profundidade). Decisão dono 2026-05-13.
              Pivô 2026-05-14: usa `estadoPermissao() !== 'negado'` — durante load
              ('indeterminado') a rota renderiza children (otimista), e só bloqueia
              quando há negação definitiva. Evita flash de "Sem permissão" em
              usuário legítimo enquanto /me + query carregam. */}
          <Route path="pedidos/lista"            element={
            <BloqueioPermissaoOpaco pode={estadoPermissao('lista', 'ver') !== 'negado'} motivo="Sem permissão para ver a Lista de Pedidos" modo="bloqueio-tela">
              <Pedidos />
            </BloqueioPermissaoOpaco>
          } />
          <Route path="pedidos/dashboard"        element={
            <BloqueioPermissaoOpaco pode={estadoPermissao('dashboard', 'ver') !== 'negado'} motivo="Sem permissão para ver o Dashboard" modo="bloqueio-tela">
              <PedidosDashboard />
            </BloqueioPermissaoOpaco>
          } />
          <Route path="pedidos/kanban"           element={
            <BloqueioPermissaoOpaco pode={estadoPermissao('kanban', 'ver') !== 'negado'} motivo="Sem permissão para ver o Kanban" modo="bloqueio-tela">
              <PedidosKanban />
            </BloqueioPermissaoOpaco>
          } />
          {/* Novo/Editar Pedido — entra com lista:ver (modo leitura quando faltar
              lista:editar; botões Salvar ficam opacos via gating local nas páginas). */}
          <Route path="pedidos/novo"             element={
            <BloqueioPermissaoOpaco pode={estadoPermissao('lista', 'ver') !== 'negado'} motivo="Sem permissão para abrir formulário de Pedido" modo="bloqueio-tela">
              <PedidoFormulario />
            </BloqueioPermissaoOpaco>
          } />
          <Route path="pedidos/:id_pedido/editar" element={
            <BloqueioPermissaoOpaco pode={estadoPermissao('lista', 'ver') !== 'negado'} motivo="Sem permissão para abrir formulário de Pedido" modo="bloqueio-tela">
              <PedidoFormulario />
            </BloqueioPermissaoOpaco>
          } />
          <Route path="configuracoes"        element={
            <BloqueioPermissaoOpaco pode={estadoPermissao('configuracao', 'ver') !== 'negado'} motivo="Sem permissão para ver Configurações" modo="bloqueio-tela">
              <Configuracoes />
            </BloqueioPermissaoOpaco>
          } />
          <Route path="*"                    element={<Navigate to="/produto/pedido/pedidos/lista" replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoGlobal>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}

export { PRODUCT_CONFIG }
export default App
