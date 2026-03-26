import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { AuthPage } from './pages/AuthPage'

export type Page =
  | { name: 'admin' }
  | { name: 'tenant-detail'; tenantId: string }
  | { name: 'hub' }
  | { name: 'store' }

import { AdminPanel } from './pages/AdminPanel'
import { AdminLayout } from './pages/admin/AdminLayout'
import { VisaoGeralAdmin } from './pages/admin/VisaoGeralAdmin'
import { ProdutosAdmin } from './pages/admin/ProdutosAdmin'
import { HistoricoGlobalAdmin } from './pages/admin/HistoricoGlobalAdmin'
import { AdminFinanceiro } from './pages/admin/AdminFinanceiro'
import { LogTestes } from './pages/admin/LogTestes'
import { MonitorApisAdmin } from './pages/admin/MonitorApisAdmin'
import { UsuariosGlobaisAdmin } from './pages/admin/UsuariosGlobaisAdmin'
import { TenantDetail } from './pages/TenantDetail'
import { Onboarding } from './pages/Onboarding'
import { Hub } from './pages/Hub'
import { Store } from './pages/Store'
import { WorkspaceLayout } from './pages/workspace/WorkspaceLayout'
import { Organizacao }       from './pages/workspace/Organizacao'
import { Workspaces }                 from './pages/workspace/Workspaces'
import { Usuarios }          from './pages/workspace/Usuarios'
import { Assinaturas }       from './pages/workspace/Assinaturas'
import { Financeiro }        from './pages/workspace/Financeiro'
import { ApiCockpit }        from './pages/workspace/ApiCockpit'
import { ConectorCargoWise } from './pages/workspace/ConectorCargoWise'
import { SelecionarWorkspace } from './pages/SelecionarWorkspace'
import { DeployRailwayAdmin } from './pages/admin/DeployRailwayAdmin'

function TenantDetailWrapper() {
  const { id } = useParams()
  const navigate = useNavigate()
  return <TenantDetail tenantId={id!} onBack={() => navigate('/admin/tenants')} />
}

/** Rota raiz: se logado → /selecionar-workspace, se não → AuthPage */
function RootRedirect() {
  const { isLoaded, isSignedIn } = useAuth()

  // Evita flash de login enquanto o estado não é carregado
  if (!isLoaded) return null

  return isSignedIn ? (
    <Navigate to="/selecionar-workspace" replace />
  ) : (
    <AuthPage />
  )
}

/** Guarda para rotas públicas (Login/Cadastro). Se logado, expulsa para o sistema. */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  
  if (!isLoaded) return null

  return isSignedIn ? (
    <Navigate to="/selecionar-workspace" replace />
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

        {/* Área autenticada */}
        {/* /hub → redireciona para /selecionar-workspace */}
        <Route path="/hub" element={<Navigate to="/selecionar-workspace" replace />} />
        <Route path="/selecionar-workspace" element={<ProtectedRoute><SelecionarWorkspace /></ProtectedRoute>} />
        <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />

        {/* Admin — área interna restrita */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/visao-geral" replace />} />
          <Route path="visao-geral" element={<VisaoGeralAdmin />} />
          <Route path="usuarios" element={<UsuariosGlobaisAdmin />} />
          <Route path="produtos" element={<ProdutosAdmin />} />
          <Route path="financeiro" element={<AdminFinanceiro />} />
          <Route path="historico" element={<HistoricoGlobalAdmin />} />
          <Route path="deploy" element={<DeployRailwayAdmin />} />
          <Route path="testes" element={<LogTestes />} />
          <Route path="apis" element={<MonitorApisAdmin />} />
          <Route path="tenants" element={<AdminPanel navigate={adminNavigate} />} />
          <Route path="tenant/:id" element={<TenantDetailWrapper />} />
        </Route>

        {/* Workspace — área do cliente */}
        <Route path="/workspace" element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/workspace/organizacao" replace />} />
          <Route path="organizacao" element={<Organizacao />} />
          <Route path="workspaces" element={<Workspaces />} />
          <Route path="usuarios"    element={<Usuarios />} />
          <Route path="assinaturas" element={<Assinaturas />} />
          <Route path="financeiro"  element={<Financeiro />} />
          <Route path="api-cockpit" element={<ApiCockpit />} />
          <Route path="conector-cargowise" element={<ConectorCargoWise />} />
        </Route>
      </Routes>
    </div>
  )
}

