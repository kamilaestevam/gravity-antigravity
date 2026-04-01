/**
 * App.tsx — Raiz da SPA Financeiro Comex
 * Layout com 3 tabs: Movimentação | Numerário | Rateio
 * + Config: Categorias, Condições
 */

import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'

const MovimentacaoPage   = lazy(() => import('./pages/Movimentacao/MovimentacaoPage'))
const NumerarioPage      = lazy(() => import('./pages/Numerario/NumerarioPage'))
const RateioPage         = lazy(() => import('./pages/Rateio/RateioPage'))
const CategoriasPage     = lazy(() => import('./pages/Config/CategoriasPage'))
const CondicoesPagamentoPage = lazy(() => import('./pages/Config/CondicoesPagamentoPage'))

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '2rem' }}>
      <div style={{
        height: '1.5rem', width: '60%',
        background: 'var(--bg-surface, #1e1e2e)',
        borderRadius: '0.375rem',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
      <div style={{
        height: '20rem', width: '100%',
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
          <Route path="/" element={<Navigate to="/financeiro-comex" replace />} />
          <Route path="/financeiro-comex" element={<Navigate to="/financeiro-comex/movimentacao" replace />} />
          <Route path="/financeiro-comex/movimentacao" element={<MovimentacaoPage />} />
          <Route path="/financeiro-comex/movimentacao/:processoId" element={<MovimentacaoPage />} />
          <Route path="/financeiro-comex/numerario" element={<NumerarioPage />} />
          <Route path="/financeiro-comex/numerario/:processoId" element={<NumerarioPage />} />
          <Route path="/financeiro-comex/rateio" element={<RateioPage />} />
          <Route path="/financeiro-comex/rateio/:processoId" element={<RateioPage />} />
          <Route path="/financeiro-comex/config/categorias" element={<CategoriasPage />} />
          <Route path="/financeiro-comex/config/condicoes" element={<CondicoesPagamentoPage />} />
          <Route path="*" element={<Navigate to="/financeiro-comex" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export { PRODUCT_CONFIG }
export default App
