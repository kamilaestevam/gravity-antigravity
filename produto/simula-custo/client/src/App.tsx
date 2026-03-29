/**
 * App.tsx — Raiz da SPA SimulaCusto
 * Skill: antigravity-criar-produto (Passo 6)
 *
 * Usa o <Layout> do @gravity/shell (CabeçalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais serviços de tenant são acessados.
 */

import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { useShellStore } from '@gravity/shell'
import { PRODUCT_CONFIG } from './shared/config'
import { setApiContext } from './shared/api'

// Lazy loading das telas do produto
const EstimativasDashboard = lazy(() => import('./pages/estimativas/EstimativasDashboard'))
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

export default function App() {
  const { currentUser } = useShellStore()

  // Injeta contexto do tenant na camada de API do produto
  useEffect(() => {
    if (currentUser.tenantId) {
      setApiContext({
        tenantId: currentUser.tenantId,
        userId: currentUser.id,
      })
    }
  }, [currentUser.tenantId, currentUser.id])

  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/estimativas" replace />} />
          <Route path="/estimativas" element={<EstimativasDashboard />} />
          <Route path="/estimativas/nova" element={<Estimativas />} />
          <Route path="/estimativas/:id" element={<Estimativas />} />
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
