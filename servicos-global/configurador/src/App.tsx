import React from 'react'
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth, useUser } from '@clerk/clerk-react'
import { useLoadSystemRole } from './hooks/useLoadSystemRole'
import { AuthPage } from './pages/AuthPage'

// Lazy-load — Gabi é pesado e não é crítico para o primeiro render
const GabiOnboardingWidget = React.lazy(() =>
  import('./components/GabiOnboardingWidget').then(m => ({ default: m.GabiOnboardingWidget }))
)

export type Page =
  | { name: 'admin' }
  | { name: 'tenant-detail'; tenantId: string }
  | { name: 'hub' }
  | { name: 'store' }

import { Onboarding } from './pages/Onboarding'
import { Contato } from './pages/Contato'
import { Waitlist } from './pages/Waitlist'

// Lazy-load — cada grupo carrega só quando o usuário navega para a rota
const lazy = (fn: () => Promise<{ [k: string]: React.ComponentType<any> }>, name: string) =>
  React.lazy(() => fn().then(m => ({ default: (m as any)[name] })))

// SelecionarWorkspace lazy — evita carregar 30+ ícones phosphor no bundle inicial
const SelecionarWorkspace = lazy(() => import('./pages/SelecionarWorkspace'), 'SelecionarWorkspace')

const Hub = lazy(() => import('./pages/Hub'), 'Hub')
const Store = lazy(() => import('./pages/Store'), 'Store')
const AdminPanel = lazy(() => import('./pages/AdminPanel'), 'AdminPanel')
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'), 'AdminLayout')
const VisaoGeralAdmin = lazy(() => import('./pages/admin/VisaoGeralAdmin'), 'VisaoGeralAdmin')
const ProdutosAdmin = lazy(() => import('./pages/admin/ProdutosAdmin'), 'ProdutosAdmin')
const HistoricoGlobalAdmin = lazy(() => import('./pages/admin/HistoricoGlobalAdmin'), 'HistoricoGlobalAdmin')
const AdminFinanceiro = lazy(() => import('./pages/admin/AdminFinanceiro'), 'AdminFinanceiro')
const LogTestes = lazy(() => import('./pages/admin/LogTestes'), 'LogTestes')
const MonitorApisAdmin = lazy(() => import('./pages/admin/MonitorApisAdmin'), 'MonitorApisAdmin')
const UsuariosGlobaisAdmin = lazy(() => import('./pages/admin/UsuariosGlobaisAdmin'), 'UsuariosGlobaisAdmin')
const TenantDetail = lazy(() => import('./pages/TenantDetail'), 'TenantDetail')
const DeployRailwayAdmin = lazy(() => import('./pages/admin/DeployRailwayAdmin'), 'DeployRailwayAdmin')
const SegurancaAdmin = lazy(() => import('./pages/admin/SegurancaAdmin'), 'SegurancaAdmin')
const WorkspaceLayout = lazy(() => import('./pages/workspace/WorkspaceLayout'), 'WorkspaceLayout')
const Organizacao = lazy(() => import('./pages/workspace/Organizacao'), 'Organizacao')
const Workspaces = lazy(() => import('./pages/workspace/Workspaces'), 'Workspaces')
const Usuarios = lazy(() => import('./pages/workspace/Usuarios'), 'Usuarios')
const Assinaturas = lazy(() => import('./pages/workspace/Assinaturas'), 'Assinaturas')
const Financeiro = lazy(() => import('./pages/workspace/Financeiro'), 'Financeiro')
const ApiCockpit = lazy(() => import('./pages/workspace/ApiCockpit'), 'ApiCockpit')
const ConectorCargoWise = lazy(() => import('./pages/workspace/ConectorCargoWise'), 'ConectorCargoWise')
const TaxaCambioPage = lazy(() => import('./pages/workspace/TaxaCambio'), 'TaxaCambio')

// Core — tela pós-seleção de workspace (menu lateral + conteúdo)
const Core = lazy(() => import('./pages/Core'), 'Core')
const CoreDashboard = React.lazy(() => import('./pages/core/CoreDashboard'))
const HistoricoTenant = React.lazy(() =>
  import('../../../servicos-global/tenant/historico-global/src/Historico').then(m => ({ default: m.Historico }))
)

// Lazy-load dos produtos (carregados sob demanda quando o usuário navega)
const SimulaCustoApp = React.lazy(() => import('../../../produto/simula-custo/client/src/App'))
const ProcessoApp = React.lazy(() => import('../../../produto/processo/client/src/App'))
const BidFreteApp = React.lazy(() => import('../../../produto/bid-frete/client/src/App'))
const BidCambioApp = React.lazy(() => import('../../../produto/bid-cambio/client/src/App'))
const PedidoApp = React.lazy(() => import('../../../produto/pedido/client/src/App'))

const ProductLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: 'var(--color-text-muted)' }}>
    Carregando produto...
  </div>
)

class ProductErrorBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { error: Error | null }
> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#f87171', background: '#1e293b', borderRadius: '8px', margin: '2rem' }}>
          <h2>Erro ao carregar: {this.props.name}</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', marginTop: '1rem' }}>
            {this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

function TenantDetailWrapper() {
  const { id } = useParams()
  const navigate = useNavigate()
  return <TenantDetail tenantId={id!} onBack={() => navigate('/admin/tenants')} />
}

/** Rota raiz: se logado → /hub, se não → AuthPage */
function RootRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  const [clerkTimeout, setClerkTimeout] = React.useState(false)

  React.useEffect(() => {
    if (isLoaded) return
    const timer = setTimeout(() => setClerkTimeout(true), 1500)
    return () => clearTimeout(timer)
  }, [isLoaded])

  // Se Clerk não carregou após timeout (ex: cookies bloqueados em anônima), mostra login direto
  if (!isLoaded && !clerkTimeout) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Carregando…
      </div>
    )
  }

  return isSignedIn ? (
    <Navigate to="/hub" replace />
  ) : (
    <AuthPage />
  )
}

/** Guarda para rotas públicas (Login/Cadastro). Se logado, expulsa para o sistema. */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const [clerkTimeout, setClerkTimeout] = React.useState(false)

  React.useEffect(() => {
    if (isLoaded) return
    const timer = setTimeout(() => setClerkTimeout(true), 1500)
    return () => clearTimeout(timer)
  }, [isLoaded])

  if (!isLoaded && !clerkTimeout) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Carregando…
      </div>
    )
  }

  return isSignedIn ? (
    <Navigate to="/hub" replace />
  ) : (
    <>{children}</>
  )
}

/** Wrapper para rotas que exigem autenticação — otimizado para evitar round-trip ao Clerk */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  // Enquanto Clerk não carregou, não renderiza nada (evita flash)
  if (!isLoaded) return null

  // Se não autenticado, redireciona para /sign-in local (sem round-trip ao Clerk hosted)
  if (!isSignedIn) return <Navigate to="/sign-in" replace />

  return <>{children}</>
}

/** Wrapper para rotas exclusivas de administradores Gravity (SUPER_ADMIN ou ADMIN).
 *  Role lido do banco via /api/v1/me — não depende de Clerk publicMetadata. */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { isReady, isGravityAdmin } = useLoadSystemRole()

  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/sign-in" replace />
  if (!isReady) return null  // aguarda resultado do banco

  if (!isGravityAdmin) return <Navigate to="/hub" replace />

  return <>{children}</>
}

/** Gabi IA global — aparece em todas as telas autenticadas (lazy-loaded) */
function GabiGlobal() {
  const { user } = useUser()
  const location = useLocation()

  return (
    <React.Suspense fallback={null}>
      <GabiOnboardingWidget
        userName={user?.firstName ?? 'Usuario'}
        pathname={location.pathname}
      />
    </React.Suspense>
  )
}

export default function App() {
  const routerNavigate = useNavigate()

  const adminNavigate = (next: Page) => {
    if (next.name === 'admin') routerNavigate('/admin/tenants')
    if (next.name === 'tenant-detail') routerNavigate(`/admin/tenant/${next.tenantId}`)
  }

  return (
    <div style={{ height: '100%', background: 'var(--bg-body-dark)' }}>
      <Routes>
        {/* Tela de login — clientes existentes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/sign-in/*" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/sign-up/*" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/forgot-password/*" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* Onboarding — novos clientes vindos do Marketplace */}
        <Route path="/trial" element={<Onboarding />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/waitlist" element={<Waitlist />} />

        {/* Redirect legado — Clerk antigo redirecionava para /selecionar-workspace */}
        <Route path="/selecionar-workspace" element={<Navigate to="/hub" replace />} />

        {/* Área autenticada */}
        <Route path="/hub" element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><SelecionarWorkspace /></React.Suspense></ProtectedRoute>} />
        <Route path="/store" element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><Store /></React.Suspense></ProtectedRoute>} />

        {/* Core — workspace selecionado */}
        {/* Index → Hub standalone (sem sidebar); sub-rotas → Core layout com sidebar */}
        <Route path="/core">
          <Route index element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><Hub /></React.Suspense></ProtectedRoute>} />
          <Route element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><Core /></React.Suspense></ProtectedRoute>}>
            <Route path="atividades" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Atividades — em desenvolvimento</div>} />
            <Route path="email" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Email — em desenvolvimento</div>} />
            <Route path="whatsapp" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>WhatsApp — em desenvolvimento</div>} />
            <Route path="notificacoes" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Notificações — em desenvolvimento</div>} />
            <Route path="historico" element={<React.Suspense fallback={<ProductLoading />}><HistoricoTenant /></React.Suspense>} />
            <Route path="conector-erp" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Conector ERP — em desenvolvimento</div>} />
            <Route path="configuracoes" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Configurações — em desenvolvimento</div>} />
          </Route>
        </Route>

        {/* Produtos — carregados como lazy routes dentro do Configurador */}
        <Route path="/produto/simula-custo/*" element={<ProtectedRoute><ProductErrorBoundary name="SimulaCusto"><React.Suspense fallback={<ProductLoading />}><SimulaCustoApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />
        <Route path="/produto/processo/*" element={<ProtectedRoute><ProductErrorBoundary name="Processo"><React.Suspense fallback={<ProductLoading />}><ProcessoApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />
        <Route path="/produto/bid-frete/*" element={<ProtectedRoute><ProductErrorBoundary name="BID Frete"><React.Suspense fallback={<ProductLoading />}><BidFreteApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />
        <Route path="/produto/bid-cambio/*" element={<ProtectedRoute><ProductErrorBoundary name="BID Câmbio"><React.Suspense fallback={<ProductLoading />}><BidCambioApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />
        <Route path="/produto/pedido/*" element={<ProtectedRoute><ProductErrorBoundary name="Pedido"><React.Suspense fallback={<ProductLoading />}><PedidoApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />

        {/* Admin — área interna restrita — exclusivo gravity_admin */}
        <Route path="/admin" element={<AdminRoute><React.Suspense fallback={<ProductLoading />}><AdminLayout /></React.Suspense></AdminRoute>}>
          <Route index element={<Navigate to="/admin/visao-geral" replace />} />
          <Route path="visao-geral" element={<React.Suspense fallback={<ProductLoading />}><VisaoGeralAdmin /></React.Suspense>} />
          <Route path="usuarios" element={<React.Suspense fallback={<ProductLoading />}><UsuariosGlobaisAdmin /></React.Suspense>} />
          <Route path="produtos" element={<React.Suspense fallback={<ProductLoading />}><ProdutosAdmin /></React.Suspense>} />
          <Route path="financeiro" element={<React.Suspense fallback={<ProductLoading />}><AdminFinanceiro /></React.Suspense>} />
          <Route path="historico" element={<React.Suspense fallback={<ProductLoading />}><HistoricoGlobalAdmin /></React.Suspense>} />
          <Route path="deploy" element={<React.Suspense fallback={<ProductLoading />}><DeployRailwayAdmin /></React.Suspense>} />
          <Route path="testes" element={<React.Suspense fallback={<ProductLoading />}><LogTestes /></React.Suspense>} />
          <Route path="apis" element={<React.Suspense fallback={<ProductLoading />}><MonitorApisAdmin /></React.Suspense>} />
          <Route path="seguranca" element={<React.Suspense fallback={<ProductLoading />}><SegurancaAdmin /></React.Suspense>} />
          <Route path="tenants" element={<React.Suspense fallback={<ProductLoading />}><AdminPanel navigate={adminNavigate} /></React.Suspense>} />
          <Route path="tenant/:id" element={<React.Suspense fallback={<ProductLoading />}><TenantDetailWrapper /></React.Suspense>} />
        </Route>

        {/* Workspace — área do cliente */}
        <Route path="/workspace" element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><WorkspaceLayout /></React.Suspense></ProtectedRoute>}>
          <Route index element={<Navigate to="/workspace/organizacao" replace />} />
          <Route path="organizacao" element={<React.Suspense fallback={<ProductLoading />}><Organizacao /></React.Suspense>} />
          <Route path="workspaces" element={<React.Suspense fallback={<ProductLoading />}><Workspaces /></React.Suspense>} />
          <Route path="usuarios" element={<React.Suspense fallback={<ProductLoading />}><Usuarios /></React.Suspense>} />
          <Route path="assinaturas" element={<React.Suspense fallback={<ProductLoading />}><Assinaturas /></React.Suspense>} />
          <Route path="financeiro" element={<React.Suspense fallback={<ProductLoading />}><Financeiro /></React.Suspense>} />
          <Route path="api-cockpit" element={<React.Suspense fallback={<ProductLoading />}><ApiCockpit /></React.Suspense>} />
          <Route path="conector-cargowise" element={<React.Suspense fallback={<ProductLoading />}><ConectorCargoWise /></React.Suspense>} />
          <Route path="taxa-cambio" element={<React.Suspense fallback={<ProductLoading />}><TaxaCambioPage /></React.Suspense>} />
        </Route>

        {/* 404 — rota nao encontrada */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
            <p style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--bg-elevated)', lineHeight: 1 }}>404</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>Pagina nao encontrada</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>A pagina que voce procura nao existe ou foi movida.</p>
            <a href="/" style={{ color: 'var(--accent)' }}>Voltar ao inicio</a>
          </div>
        } />
      </Routes>

      {/* Gabi IA — presente em todas as telas pos-login */}
      <SignedIn>
        <GabiGlobal />
      </SignedIn>
    </div>
  )
}
