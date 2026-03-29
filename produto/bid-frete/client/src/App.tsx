/**
 * App.tsx — BID Frete Internacional
 * Layout com sidebar + rotas do produto + portal do fornecedor
 */

import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Paginas do Cliente (Importador/Exportador)
const Dashboard = lazy(() => import('./pages/Dashboard.js'))
const Cotacoes = lazy(() => import('./pages/Cotacoes.js'))
const NovaCotacao = lazy(() => import('./pages/NovaCotacao.js'))
const ImportarBloco = lazy(() => import('./pages/ImportarBloco.js'))
const DetalheCotacao = lazy(() => import('./pages/DetalheCotacao.js'))
const Comparativo = lazy(() => import('./pages/Comparativo.js'))
const Fornecedores = lazy(() => import('./pages/Fornecedores.js'))
const DetalheFornecedor = lazy(() => import('./pages/DetalheFornecedor.js'))
const Configuracoes = lazy(() => import('./pages/Configuracoes.js'))

// Portal do Fornecedor (logado)
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard.js'))
const CotacoesPendentes = lazy(() => import('./pages/portal/CotacoesPendentes.js'))
const MinhasRespostas = lazy(() => import('./pages/portal/MinhasRespostas.js'))
const TabelaPrecos = lazy(() => import('./pages/portal/TabelaPrecos.js'))
const MeuDesempenho = lazy(() => import('./pages/portal/MeuDesempenho.js'))
const ResponderCotacao = lazy(() => import('./pages/portal/ResponderCotacao.js'))

// Portal Publico (sem login — via token)
const ResponderPublico = lazy(() => import('./pages/portal/ResponderPublico.js'))

const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
)

const mainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/cotacoes', label: 'Cotacoes', icon: '📋' },
  { to: '/cotacoes/nova', label: 'Nova Cotacao', icon: '➕' },
  { to: '/fornecedores', label: 'Fornecedores', icon: '🏢' },
  { to: '/configuracoes', label: 'Configuracoes', icon: '⚙️' },
]

const portalNav = [
  { to: '/portal/dashboard', label: 'Painel', icon: '📊' },
  { to: '/portal/pendentes', label: 'Pendentes', icon: '📩' },
  { to: '/portal/respostas', label: 'Respostas', icon: '📤' },
  { to: '/portal/tabela-precos', label: 'Tabela Precos', icon: '💰' },
  { to: '/portal/desempenho', label: 'Desempenho', icon: '⭐' },
]

function Sidebar() {
  const location = useLocation()
  const isPortal = location.pathname.startsWith('/portal')
  const nav = isPortal ? portalNav : mainNav

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">BID Frete</h1>
        <p className="text-xs text-gray-500 mt-1">
          {isPortal ? 'Portal do Fornecedor' : 'Frete Internacional'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <div className="p-4 border-t border-gray-200">
        <NavLink
          to={isPortal ? '/dashboard' : '/portal/dashboard'}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <span>{isPortal ? '← Voltar ao Sistema' : '🔗 Portal Fornecedor'}</span>
        </NavLink>
      </div>
    </aside>
  )
}

export default function App() {
  const isPublicRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/portal/public')

  if (isPublicRoute) {
    return (
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/portal/public/responder/:token" element={<ResponderPublico />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Rotas do Cliente */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cotacoes" element={<Cotacoes />} />
            <Route path="/cotacoes/nova" element={<NovaCotacao />} />
            <Route path="/cotacoes/importar" element={<ImportarBloco />} />
            <Route path="/cotacoes/:id" element={<DetalheCotacao />} />
            <Route path="/cotacoes/:id/comparativo" element={<Comparativo />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/fornecedores/:id" element={<DetalheFornecedor />} />
            <Route path="/configuracoes" element={<Configuracoes />} />

            {/* Portal do Fornecedor (logado) */}
            <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
            <Route path="/portal/dashboard" element={<PortalDashboard />} />
            <Route path="/portal/pendentes" element={<CotacoesPendentes />} />
            <Route path="/portal/respostas" element={<MinhasRespostas />} />
            <Route path="/portal/tabela-precos" element={<TabelaPrecos />} />
            <Route path="/portal/desempenho" element={<MeuDesempenho />} />
            <Route path="/portal/responder/:bidRequestId" element={<ResponderCotacao />} />

            {/* Portal Publico */}
            <Route path="/portal/public/responder/:token" element={<ResponderPublico />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
