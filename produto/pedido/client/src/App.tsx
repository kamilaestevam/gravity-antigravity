import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useShellStore } from '@gravity/shell'
import { TelaProdutoGlobal } from '@nucleo/tela-produto-global'
import { useLocalizadorHistory, type EcosystemNode } from '@nucleo/localizador-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import { Archive, Upload, Timer } from '@phosphor-icons/react'
import { PRODUCT_CONFIG } from './shared/config'

// ── Lazy loading das telas ────────────────────────────────────────────────────
const ListaPedidos    = lazy(() => import('./pages/ListaPedidos'))
const NovoPedido      = lazy(() => import('./pages/NovoPedido'))
const ImportarArquivo = lazy(() => import('./pages/ImportarArquivo'))

// ── Identidade do produto — via registry central ──────────────────────────────
const PRODUTO       = getProdutoMeta('pedido')
const PRODUCT_ID    = 'pedido'
const PRODUCT_NAME  = 'Pedido'
const PRODUCT_COLOR = PRODUTO.color
const PRODUCT_ICON  = PRODUTO.icon

const iconMap: Record<string, React.ReactNode> = {
  'package':       <Archive weight="duotone" size={20} />,
  'upload-simple': <Upload  weight="duotone" size={20} />,
  'clock':         <Timer   weight="duotone" size={20} />,
}

const navItems = PRODUCT_CONFIG.navigation.map(item => ({
  to:    item.id,
  label: item.label,
  icon:  iconMap[item.icon] ?? <Archive weight="duotone" size={20} />,
}))

const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'gravity',      label: 'Gravity',      sublabel: 'workspace',      color: '#818cf8', type: 'gravity',      status: 'accessible' },
  { id: 'configurador', label: 'Configurador',  sublabel: 'auth · billing', color: '#f472b6', type: 'configurador', status: 'accessible' },
  { id: PRODUCT_ID,     label: PRODUCT_NAME,   sublabel: PRODUTO.sublabel,  color: PRODUCT_COLOR, type: 'produto', status: 'current' },
]

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '2rem' }}>
      <div style={{ height: '1.5rem', width: '60%', background: 'var(--bg-surface)', borderRadius: '0.375rem' }} />
      <div style={{ height: '1rem',   width: '40%', background: 'var(--bg-surface)', borderRadius: '0.375rem' }} />
      <div style={{ height: '20rem', width: '100%', background: 'var(--bg-surface)', borderRadius: '0.5rem' }} />
    </div>
  )
}

export function App() {
  const location = useLocation()
  const {
    currentUser,
    tooltipsDisabled,
    toggleTooltips,
    toggleTheme,
    currentTheme,
    clearCurrentUser,
  } = useShellStore()

  const { history, addEntry } = useLocalizadorHistory(PRODUCT_ID)

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
    : '??'

  const pageLabel = location.pathname.split('/').filter(Boolean).pop() ?? 'Pedidos'

  return (
    <TelaProdutoGlobal
      menuTopo={{
        productName:  PRODUCT_NAME,
        productColor: PRODUCT_COLOR,
        productIcon:  PRODUCT_ICON,
        tooltipsDisabled,
        onToggleTooltips: toggleTooltips,
        onNavigateHub:  () => { window.location.href = '/hub' },
        onNavigateCore: () => { window.location.href = '/core' },
        localizador: {
          workspaceName:       currentUser.tenantName ?? 'Minha Empresa',
          currentProductId:    PRODUCT_ID,
          currentProductLabel: PRODUCT_NAME,
          currentProductColor: PRODUCT_COLOR,
          currentPageLabel:    pageLabel,
          history,
          nodes: ECOSYSTEM_NODES,
          onNavigate: (node: EcosystemNode) => {
            if (node.type === 'gravity')           window.location.href = '/hub'
            else if (node.type === 'configurador') window.location.href = '/configurador'
            else if (node.type === 'produto')      window.location.href = `/produto/${node.id}`
          },
        },
        usuario: {
          userName:              currentUser.name  || 'Usuário',
          userEmail:             currentUser.email || '',
          userInitials:          initials,
          userRole:              currentUser.role  ?? 'Membro',
          isLight:               currentTheme === 'light',
          onToggleTheme:         toggleTheme,
          onNavigateWorkspace:   () => { window.location.href = '/configurador' },
          onNavigateMarketPlace: () => { window.location.href = '/store' },
          onSignOut:             () => { clearCurrentUser(); window.location.href = '/' },
        },
      }}
      menuLateral={{
        tenantName:  currentUser.tenantName ?? 'Minha Empresa',
        tenantPlan:  'Pro',
        navItems,
        moduleName:  PRODUCT_NAME,
        moduleColor: PRODUCT_COLOR,
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/"                  element={<Navigate to="pedidos" replace />} />
          <Route path="pedidos"            element={<ListaPedidos />} />
          <Route path="pedidos/novo"       element={<NovoPedido />} />
          <Route path="pedidos/:id/editar" element={<NovoPedido />} />
          <Route path="importar"           element={<ImportarArquivo />} />
          <Route path="*"                  element={<Navigate to="pedidos" replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoGlobal>
  )
}

export { PRODUCT_CONFIG }
export default App
