/**
 * App.tsx — Raiz da SPA BID Frete
 * Skill: antigravity-criar-produto (Passo 6)
 *
 * Usa o <Layout> do @gravity/shell (CabecalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais serviços de tenant são acessados.
 */

import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'

// ─── Páginas do Cliente (Importador/Exportador) ─────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Cotacoes = lazy(() => import('./pages/Cotacoes'))
const NovaCotacao = lazy(() => import('./pages/NovaCotacao'))
const ImportarBloco = lazy(() => import('./pages/ImportarBloco'))
const DetalheCotacao = lazy(() => import('./pages/DetalheCotacao'))
const Comparativo = lazy(() => import('./pages/Comparativo'))
const Fornecedores = lazy(() => import('./pages/Fornecedores'))
const DetalheFornecedor = lazy(() => import('./pages/DetalheFornecedor'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))

// ─── Portal do Fornecedor (logado) ──────────────────────────────────────────
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'))
const CotacoesPendentes = lazy(() => import('./pages/portal/CotacoesPendentes'))
const MinhasRespostas = lazy(() => import('./pages/portal/MinhasRespostas'))
const TabelaPrecos = lazy(() => import('./pages/portal/TabelaPrecos'))
const MeuDesempenho = lazy(() => import('./pages/portal/MeuDesempenho'))
const ResponderCotacao = lazy(() => import('./pages/portal/ResponderCotacao'))

// ─── Portal Público (sem login — via token) ─────────────────────────────────
const ResponderPublico = lazy(() => import('./pages/portal/ResponderPublico'))

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  }}>
    Carregando módulo…
  </div>
)

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Rotas do Cliente */}
          <Route path="/" element={<Navigate to="/visao-geral" replace />} />
          <Route path="/visao-geral" element={<Dashboard />} />
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

          {/* Portal Público */}
          <Route path="/portal/public/responder/:token" element={<ResponderPublico />} />

          {/* Serviços de tenant são renderizados pelo Shell automaticamente via PRODUCT_CONFIG */}
          <Route path="*" element={<Navigate to="/visao-geral" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

// Exporta o config para uso pelo Shell
export { PRODUCT_CONFIG }
