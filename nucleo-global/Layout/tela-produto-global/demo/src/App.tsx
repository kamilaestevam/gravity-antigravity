/**
 * App.tsx — Demo standalone da TelaProdutoGlobal
 *
 * Zero conexão com produtos reais.
 * Estado local — sem shell store, sem APIs.
 */

import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { TelaProdutoGlobal } from '@nucleo/tela-produto-global'
import {
  useLocalizadorHistory,
  type EcosystemNode,
} from '@nucleo/localizador-global'
import {
  SquaresFour,
  ListBullets,
  Kanban,
  GearSix,
} from '@phosphor-icons/react'

const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Lista         = lazy(() => import('./pages/Lista'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))

// ── Identidade do Demo ────────────────────────────────────────────────────────

const PRODUCT_ID    = 'demo'
const PRODUCT_NAME  = 'Meu Produto'
const PRODUCT_COLOR = '#818cf8'

// ── Navegação ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: 'dashboard',    label: 'Dashboard',    icon: <SquaresFour size={20} weight="duotone" /> },
  { to: 'lista',        label: 'Lista',        icon: <ListBullets size={20} weight="duotone" /> },
  { to: 'kanban',       label: 'Kanban',       icon: <Kanban      size={20} weight="duotone" /> },
  { to: 'configuracoes',label: 'Configurações',icon: <GearSix     size={20} weight="duotone" /> },
]

// ── Labels de rota ────────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  'dashboard':     'Dashboard',
  'lista':         'Lista',
  'kanban':        'Kanban',
  'configuracoes': 'Configurações',
}

// ── Nós do ecossistema (demo) ─────────────────────────────────────────────────

const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'gravity', label: 'Gravity', sublabel: 'workspace', color: '#818cf8', type: 'gravity', status: 'accessible' },
  { id: PRODUCT_ID, label: PRODUCT_NAME, sublabel: 'demo', color: PRODUCT_COLOR, type: 'produto', status: 'current' },
]

// ── Fallback de carregamento ──────────────────────────────────────────────────

function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
      Carregando…
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const location = useLocation()

  const [theme, setTheme]               = useState<'dark' | 'light'>('dark')
  const [tooltipsDisabled, setTooltips] = useState(false)

  const { history, addEntry } = useLocalizadorHistory(PRODUCT_ID)

  // Sincroniza atributo data-theme no <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Registra navegação no localizador
  useEffect(() => {
    const seg = location.pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
    const pageLabel = ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
    addEntry({
      productId:    PRODUCT_ID,
      productLabel: PRODUCT_NAME,
      productColor: PRODUCT_COLOR,
      pageLabel,
      pagePath: location.pathname,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const routeSeg = location.pathname.split('/').filter(Boolean).pop() ?? 'dashboard'
  const pageLabel = ROUTE_LABELS[routeSeg] ?? routeSeg.charAt(0).toUpperCase() + routeSeg.slice(1)

  return (
    <TelaProdutoGlobal
      productId={PRODUCT_ID}
      productName={PRODUCT_NAME}
      tenantName="Minha Empresa"
      tenantPlan="Pro"
      navItems={NAV_ITEMS}
      tooltipsDisabled={tooltipsDisabled}
      onToggleTooltips={() => setTooltips(d => !d)}
      onNavigateHub={() => {}}
      onNavigateCore={() => {}}
      localizador={{
        workspaceName:    'Minha Empresa',
        currentPageLabel: pageLabel,
        history,
        nodes:      ECOSYSTEM_NODES,
        onNavigate: () => {},
      }}
      usuario={{
        userName:              'Usuário Demo',
        userEmail:             'demo@gravity.com',
        userInitials:          'UD',
        userRole:              'Admin',
        isLight:               theme === 'light',
        onToggleTheme:         () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
        onNavigateWorkspace:   () => {},
        onNavigateMarketPlace: () => {},
        onSignOut:             () => {},
      }}
    >
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="lista"         element={<Lista />} />
          <Route path="kanban"        element={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Kanban (Em breve)</div>} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="*"             element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoGlobal>
  )
}
