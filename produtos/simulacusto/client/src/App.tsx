/**
 * App.tsx — Raiz da SPA SimulaCusto
 * Skill: antigravity-criar-produto (Passo 6)
 *
 * Usa o <Layout> do @gravity/shell (CabeçalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais serviços de tenant são acessados.
 */

import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'

// Lazy loading das telas do produto
const Estimativas = lazy(() => import('./pages/estimativas/Estimativas'))
const ImportarMassa = lazy(() => import('./pages/importar/ImportarMassa'))

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    fontFamily: 'Plus Jakarta Sans, sans-serif'
  }}>
    Carregando módulo…
  </div>
)

export function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/estimativas" replace />} />
          <Route path="/estimativas" element={<Estimativas />} />
          <Route path="/importar" element={<ImportarMassa />} />
          {/* Serviços de tenant são renderizados pelo Shell automaticamente via PRODUCT_CONFIG */}
          <Route path="*" element={<Navigate to="/estimativas" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

// Exporta o config para uso pelo Shell
export { PRODUCT_CONFIG }
