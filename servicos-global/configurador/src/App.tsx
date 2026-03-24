import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { AuthPage } from './pages/AuthPage'

export type Page =
  | { name: 'admin' }
  | { name: 'tenant-detail'; tenantId: string }
  | { name: 'hub' }
  | { name: 'store' }

import { AdminPanel } from './pages/AdminPanel'
import { TenantDetail } from './pages/TenantDetail'
import { Onboarding } from './pages/Onboarding'
import { Hub } from './pages/Hub'
import { Store } from './pages/Store'
import { WorkspaceLayout } from './pages/workspace/WorkspaceLayout'
import { Empresas }          from './pages/workspace/Empresas'
import { Usuarios }          from './pages/workspace/Usuarios'
import { Assinaturas }       from './pages/workspace/Assinaturas'
import { Financeiro }        from './pages/workspace/Financeiro'
import { ApiCockpit }        from './pages/workspace/ApiCockpit'
import { SelecionarWorkspace } from './pages/SelecionarWorkspace'

function TenantDetailWrapper() {
  const { id } = useParams()
  const navigate = useNavigate()
  return <TenantDetail tenantId={id!} onBack={() => navigate('/admin')} />
}

/** Rota raiz: se logado → /selecionar-workspace, se não → AuthPage */
function RootRedirect() {
  return (
    <>
      <SignedIn>
        <Navigate to="/selecionar-workspace" replace />
      </SignedIn>
      <SignedOut>
        <AuthPage />
      </SignedOut>
    </>
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
    if (next.name === 'admin') routerNavigate('/admin')
    if (next.name === 'tenant-detail') routerNavigate(`/admin/tenant/${next.tenantId}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body-dark)' }}>
      <Routes>
        {/* Tela de login — clientes existentes */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/sign-in/*" element={<AuthPage />} />

        {/* Onboarding — novos clientes vindos do Marketplace */}
        <Route path="/trial" element={<Onboarding />} />

        {/* Área autenticada */}
        {/* /hub → redireciona para /selecionar-workspace */}
        <Route path="/hub" element={<Navigate to="/selecionar-workspace" replace />} />
        <Route path="/selecionar-workspace" element={<ProtectedRoute><SelecionarWorkspace /></ProtectedRoute>} />
        <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel navigate={adminNavigate} /></ProtectedRoute>} />
        <Route path="/admin/tenant/:id" element={<ProtectedRoute><TenantDetailWrapper /></ProtectedRoute>} />

        {/* Workspace — área do cliente */}
        <Route path="/workspace" element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/workspace/empresas" replace />} />
          <Route path="empresas"    element={<Empresas />} />
          <Route path="usuarios"    element={<Usuarios />} />
          <Route path="assinaturas" element={<Assinaturas />} />
          <Route path="financeiro"  element={<Financeiro />} />
          <Route path="api-cockpit" element={<ApiCockpit />} />
        </Route>
      </Routes>
    </div>
  )
}

