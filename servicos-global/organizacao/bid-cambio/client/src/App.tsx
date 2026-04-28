/**
 * App.tsx — Raiz da SPA BID Cambio
 * Skill: antigravity-criar-produto (Passo 6)
 *
 * Usa o <Layout> do @gravity/shell (CabecalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais servicos de tenant sao acessados.
 */

import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { PRODUCT_CONFIG } from './shared/config'

// --- Paginas do Comprador (Importador/Exportador/Trading) ---
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ListaCambios = lazy(() => import('./pages/ListaCambios'))
const NovaCotacao = lazy(() => import('./pages/NovaCotacao'))
const DetalheCotacao = lazy(() => import('./pages/DetalheCotacao'))
const Comparativo = lazy(() => import('./pages/Comparativo'))
const Corretoras = lazy(() => import('./pages/Corretoras'))
const DetalheCorretora = lazy(() => import('./pages/DetalheCorretora'))
const ModalPagamentoCambio = lazy(() => import('./pages/ModalCambioPagamento'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))

// --- Portal da Corretora (logado) ---
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'))
const CotacoesPendentes = lazy(() => import('./pages/portal/CotacoesPendentes'))
const ResponderCotacao = lazy(() => import('./pages/portal/ResponderCotacao'))
const PortalRespostas = lazy(() => import('./pages/portal/Respostas'))
const PortalDesempenho = lazy(() => import('./pages/portal/Desempenho'))
const PortalConfiguracoes = lazy(() => import('./pages/portal/Configuracoes'))

// --- Portal Publico (sem login — via token) ---
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
    Carregando modulo...
  </div>
)

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Rotas do Comprador */}
          <Route path="/" element={<Navigate to="visao-geral" replace />} />
          <Route path="visao-geral" element={<Dashboard />} />
          <Route path="cambios" element={<ListaCambios />} />
          <Route path="cambios/:id_cambio/pagar" element={<ModalPagamentoCambio />} />
          <Route path="cotacoes" element={<NovaCotacao />} />
          <Route path="cotacoes/nova" element={<NovaCotacao />} />
          <Route path="cotacoes/:id_cotacao" element={<DetalheCotacao />} />
          <Route path="cotacoes/:id_cotacao/comparativo" element={<Comparativo />} />
          <Route path="corretoras" element={<Corretoras />} />
          <Route path="corretoras/:id_corretora" element={<DetalheCorretora />} />
          <Route path="configuracoes" element={<Configuracoes />} />

          {/* Portal da Corretora (logado) */}
          <Route path="portal" element={<Navigate to="portal/dashboard" replace />} />
          <Route path="portal/dashboard" element={<PortalDashboard />} />
          <Route path="portal/pendentes" element={<CotacoesPendentes />} />
          <Route path="portal/respostas" element={<PortalRespostas />} />
          <Route path="portal/desempenho" element={<PortalDesempenho />} />
          <Route path="portal/responder/:id_cotacao" element={<ResponderCotacao />} />
          <Route path="portal/configuracoes" element={<PortalConfiguracoes />} />

          {/* Portal Publico */}
          <Route path="portal/public/responder/:token_resposta" element={<ResponderPublico />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="visao-geral" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export { PRODUCT_CONFIG }
