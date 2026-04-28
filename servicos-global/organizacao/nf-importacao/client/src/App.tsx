/**
 * App.tsx — Raiz da SPA NF Importacao
 *
 * Usa o <Layout> do @gravity/shell (CabecalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais servicos de tenant sao acessados.
 */

import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'

// ── Lazy loading das telas ──────────────────────────────────────────────────

const NfLista = lazy(() => import('./pages/NfLista'))
const NfNovaOrigem = lazy(() => import('./pages/NfNovaOrigem'))
const NfNovaDuimp = lazy(() => import('./pages/NfNovaDuimp'))
const NfNovaDespesas = lazy(() => import('./pages/NfNovaDespesas'))
const NfNovaRateio = lazy(() => import('./pages/NfNovaRateio'))
const NfNovaFiscal = lazy(() => import('./pages/NfNovaFiscal'))
const NfNovaExportacao = lazy(() => import('./pages/NfNovaExportacao'))
const NfDetalhe = lazy(() => import('./pages/NfDetalhe'))
const DespesasCatalogo = lazy(() => import('./pages/Config/DespesasCatalogo'))
const DespesasTemplates = lazy(() => import('./pages/Config/DespesasTemplates'))
const LayoutsExportacao = lazy(() => import('./pages/Config/LayoutsExportacao'))
const FavoritosFiscais = lazy(() => import('./pages/Config/FavoritosFiscais'))

// ── Loading Fallback ────────────────────────────────────────────────────────

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

// ── App ─────────────────────────────────────────────────────────────────────

export function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/nf-importacao" replace />} />

          {/* Lista de NFs */}
          <Route path="/nf-importacao" element={<NfLista />} />

          {/* Wizard de criacao — 6 steps */}
          <Route path="/nf-importacao/nova" element={<NfNovaOrigem />} />
          <Route path="/nf-importacao/nova/duimp" element={<NfNovaDuimp />} />
          <Route path="/nf-importacao/nova/despesas" element={<NfNovaDespesas />} />
          <Route path="/nf-importacao/nova/rateio" element={<NfNovaRateio />} />
          <Route path="/nf-importacao/nova/fiscal" element={<NfNovaFiscal />} />
          <Route path="/nf-importacao/nova/exportacao" element={<NfNovaExportacao />} />

          {/* Detalhe com abas */}
          <Route path="/nf-importacao/:id_nf" element={<NfDetalhe />} />
          <Route path="/nf-importacao/:id_nf/:aba" element={<NfDetalhe />} />

          {/* Configuracoes */}
          <Route path="/nf-importacao/config/despesas" element={<DespesasCatalogo />} />
          <Route path="/nf-importacao/config/despesas-templates" element={<DespesasTemplates />} />
          <Route path="/nf-importacao/config/layouts-exportacao" element={<LayoutsExportacao />} />
          <Route path="/nf-importacao/config/favoritos-fiscais" element={<FavoritosFiscais />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/nf-importacao" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export { PRODUCT_CONFIG }
export default App
