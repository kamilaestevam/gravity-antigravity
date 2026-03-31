/**
 * App.tsx — Raiz da SPA LPCO
 *
 * Usa o <Layout> do @gravity/shell (CabecalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais servicos de tenant sao acessados.
 */

import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'

const LpcoLista = lazy(() => import('./pages/LpcoLista'))
const LpcoNovo = lazy(() => import('./pages/LpcoNovo'))
const LpcoDetalhe = lazy(() => import('./pages/LpcoDetalhe'))
const LpcoSimulador = lazy(() => import('./pages/LpcoSimulador'))

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      padding: '2rem',
    }}>
      <div style={{
        height: '1.5rem',
        width: '60%',
        background: 'var(--bg-surface, #1e1e2e)',
        borderRadius: '0.375rem',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
      <div style={{
        height: '20rem',
        width: '100%',
        background: 'var(--bg-surface, #1e1e2e)',
        borderRadius: '0.5rem',
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.2s',
      }} />
    </div>
  )
}

export function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/lpco" replace />} />
          <Route path="/lpco" element={<LpcoLista />} />
          <Route path="/lpco/novo" element={<LpcoNovo />} />
          <Route path="/lpco/novo/:step" element={<LpcoNovo />} />
          <Route path="/lpco/simulador" element={<LpcoSimulador />} />
          <Route path="/lpco/:id" element={<LpcoDetalhe />} />
          <Route path="/lpco/:id/:tab" element={<LpcoDetalhe />} />
          <Route path="*" element={<Navigate to="/lpco" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export { PRODUCT_CONFIG }
export default App
