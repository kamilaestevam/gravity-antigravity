/**
 * App.tsx — Raiz da SPA Processo
 *
 * Rotas relativas ao splat do Configurador (/acesso-processos/* e /processo/*).
 * Conteudo do detalhe via ProcessoDetalheRotas (pathname) — Outlet quebra com splat.
 */

import React, { lazy, Suspense, useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { corOficialProdutoGravity, LogoProcesso } from '@nucleo/logo-produtos'
import { PRODUCT_CONFIG } from './shared/config'
import { ProcessoVisualizacaoLayout } from './components/ProcessoVisualizacaoLayout'
import { ProcessoMultiView } from './components/ProcessoMultiView'
import './shared/processo-page-shell.css'

const ProcessoLayout = lazy(() => import('./pages/ProcessoLayout'))

const processoVisualizacoesElement = <ProcessoMultiView />
const detalheProcessoElement = <ProcessoLayout />

const ROTA_ID_PROCESSO_MOCK = ':id_processo(p\\d+)/*'

function LoadingFallback() {
  return (
    <div className="proc-loading-fallback">
      <div className="proc-loading-skeleton" />
      <div className="proc-loading-skeleton proc-loading-skeleton--sm" />
      <div className="proc-loading-skeleton proc-loading-skeleton--lg" />
    </div>
  )
}

const PROCESSO_COR = corOficialProdutoGravity('processo')

export function App() {
  const moduleIcon = useMemo(
    () => <LogoProcesso size={26} color={PROCESSO_COR} />,
    [],
  )

  return (
    <Layout
      moduleName="Processos"
      moduleColor={PROCESSO_COR}
      moduleIcon={moduleIcon}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="lista" replace />} />

          <Route element={<ProcessoVisualizacaoLayout />}>
            <Route path="insights" element={processoVisualizacoesElement} />
            <Route path="lista" element={processoVisualizacoesElement} />
            <Route path="dashboard" element={processoVisualizacoesElement} />
            <Route path="kanban" element={processoVisualizacoesElement} />
          </Route>

          <Route path="todos">
            <Route index element={<Navigate to="../lista" replace />} />
            <Route path="insights" element={<Navigate to="../../insights" replace />} />
            <Route path="lista" element={<Navigate to="../../lista" replace />} />
            <Route path="dashboard" element={<Navigate to="../../dashboard" replace />} />
            <Route path="kanban" element={<Navigate to="../../kanban" replace />} />
          </Route>

          <Route path="lista/:slug_processo/*" element={detalheProcessoElement} />
          <Route path="detalhe/*" element={detalheProcessoElement} />
          <Route path="workflow" element={detalheProcessoElement} />
          <Route path="dados-tecnicos" element={detalheProcessoElement} />
          <Route path="documentos" element={detalheProcessoElement} />
          <Route path="email" element={detalheProcessoElement} />
          <Route path="workspace" element={detalheProcessoElement} />
          <Route path="duimp" element={detalheProcessoElement} />
          <Route path="li" element={detalheProcessoElement} />
          <Route path="taxas" element={detalheProcessoElement} />
          <Route path="todo" element={detalheProcessoElement} />
          <Route path="pedidos/*" element={detalheProcessoElement} />
          <Route path="financeiro/*" element={detalheProcessoElement} />
          <Route path="configuracoes/*" element={detalheProcessoElement} />
          <Route path={ROTA_ID_PROCESSO_MOCK} element={detalheProcessoElement} />

          <Route path="*" element={<Navigate to="lista" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export { PRODUCT_CONFIG }
export default App
