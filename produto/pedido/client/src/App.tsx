/**
 * App.tsx — Raiz da SPA Pedido
 *
 * Usa o <Layout> do @gravity/shell (CabecalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais servicos de tenant sao acessados.
 * Lazy imports com React.lazy + Suspense para code-splitting por rota.
 */

import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'

// ── Lazy loading das telas do produto ─────────────────────────────────────

const ListaPedidos = lazy(() => import('./pages/ListaPedidos'))
const NovoPedido = lazy(() => import('./pages/NovoPedido'))
const ImportarArquivo = lazy(() => import('./pages/ImportarArquivo'))

// ── Loading Fallback ──────────────────────────────────────────────────────

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
        height: '1rem',
        width: '40%',
        background: 'var(--bg-surface, #1e1e2e)',
        borderRadius: '0.375rem',
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.2s',
      }} />
      <div style={{
        height: '20rem',
        width: '100%',
        background: 'var(--bg-surface, #1e1e2e)',
        borderRadius: '0.5rem',
        animation: 'pulse 1.5s ease-in-out infinite',
        animationDelay: '0.4s',
      }} />
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────

export function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="pedidos" replace />} />
          <Route path="pedidos" element={<ListaPedidos />} />
          <Route path="pedidos/novo" element={<NovoPedido />} />
          <Route path="pedidos/:id/editar" element={<NovoPedido />} />
          <Route path="importar" element={<ImportarArquivo />} />
          <Route path="*" element={<Navigate to="pedidos" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export { PRODUCT_CONFIG }
export default App
