/**
 * App.tsx — Raiz da SPA Processo
 *
 * Usa o <Layout> do @gravity/shell (CabecalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais serviços de tenant são acessados.
 * Lazy imports com React.lazy + Suspense para code-splitting por rota.
 */

import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'
import { CurrencyDollar } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'

// ─── Lazy loading das telas do produto ─────────────────────────────────────

const ProcessoLayout = lazy(() => import('./pages/ProcessoLayout'))
const Workflow = lazy(() => import('./pages/workflow/Workflow'))
const Pedidos = lazy(() => import('./pages/pedidos/Pedidos'))
const DadosTecnicos = lazy(() => import('./pages/dados-tecnicos/DadosTecnicos'))
const Email = lazy(() => import('./pages/email/Email'))

// ─── Loading Fallback ──────────────────────────────────────────────────────

function LoadingFallback() {
  return (
    <div className="proc-loading-fallback">
      <div className="proc-loading-skeleton" />
      <div className="proc-loading-skeleton proc-loading-skeleton--sm" />
      <div className="proc-loading-skeleton proc-loading-skeleton--lg" />
    </div>
  )
}

// ─── Placeholder: Financeiro ───────────────────────────────────────────────

function FinanceiroPlaceholder() {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<CurrencyDollar weight="duotone" size={22} />}
          titulo="Financeiro"
          subtitulo="Gestão financeira do processo"
        />
      }
    >
      <div className="proc-empty-state ws-fade-up ws-fade-up-d1">
        <CurrencyDollar weight="duotone" size={48} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Módulo financeiro em desenvolvimento
        </p>
      </div>
    </PaginaGlobal>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────

export function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="workflow" replace />} />
          <Route element={<ProcessoLayout />}>
            <Route path="workflow" element={<Workflow />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="dados-tecnicos" element={<DadosTecnicos />} />
            <Route path="email" element={<Email />} />
            <Route path="financeiro" element={<FinanceiroPlaceholder />} />
          </Route>
          <Route path="*" element={<Navigate to="workflow" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

// Exporta o config para uso pelo Shell
export { PRODUCT_CONFIG }
export default App
