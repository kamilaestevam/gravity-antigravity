import React from 'react'
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { AuthPage } from './pages/AuthPage'

export type Page =
  | { name: 'admin' }
  | { name: 'tenant-detail'; tenantId: string }
  | { name: 'hub' }
  | { name: 'store' }

import { Onboarding } from './pages/Onboarding'
import { Contato } from './pages/Contato'
import { Waitlist } from './pages/Waitlist'
import { SelecionarWorkspace } from './pages/SelecionarWorkspace'

// Lazy-load — cada grupo carrega só quando o usuário navega para a rota
const lazy = (fn: () => Promise<{ [k: string]: React.ComponentType<any> }>, name: string) =>
  React.lazy(() => fn().then(m => ({ default: (m as any)[name] })))

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

// Lazy-load dos produtos (carregados sob demanda quando o usuário navega)
const SimulaCustoApp = React.lazy(() => import('../../../produto/simula-custo/client/src/App'))
const ProcessoApp = React.lazy(() => import('../../../produto/processo/client/src/App'))

const ProductLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: 'var(--color-text-muted)' }}>
    Carregando produto...
  </div>
)

function TenantDetailWrapper() {
  const { id } = useParams()
  const navigate = useNavigate()
  return <TenantDetail tenantId={id!} onBack={() => navigate('/admin/tenants')} />
}

/** Rota raiz: se logado → /hub, se não → AuthPage */
function RootRedirect() {
  const { isLoaded, isSignedIn } = useAuth()

  // Evita flash de login enquanto o estado não é carregado
  if (!isLoaded) return null

  return isSignedIn ? (
    <Navigate to="/hub" replace />
  ) : (
    <AuthPage />
  )
}

/** Guarda para rotas públicas (Login/Cadastro). Se logado, expulsa para o sistema. */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return null

  return isSignedIn ? (
    <Navigate to="/hub" replace />
  ) : (
    <>{children}</>
  )
}

/** Wrapper para rotas que exigem autenticação */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  )
}

export default function App() {
  const routerNavigate = useNavigate()

  const adminNavigate = (next: Page) => {
    if (next.name === 'admin') routerNavigate('/admin/tenants')
    if (next.name === 'tenant-detail') routerNavigate(`/admin/tenant/${next.tenantId}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body-dark)' }}>
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

        {/* Área autenticada */}
        <Route path="/hub" element={<ProtectedRoute><SelecionarWorkspace /></ProtectedRoute>} />
        <Route path="/store" element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><Store /></React.Suspense></ProtectedRoute>} />

        {/* Produtos — carregados como lazy routes dentro do Configurador */}
        <Route path="/produto/simula-custo/*" element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><SimulaCustoApp /></React.Suspense></ProtectedRoute>} />
        <Route path="/produto/processo/*" element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><ProcessoApp /></React.Suspense></ProtectedRoute>} />

        {/* Admin — área interna restrita */}
        <Route path="/admin" element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><AdminLayout /></React.Suspense></ProtectedRoute>}>
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
    </div>
  )
}
