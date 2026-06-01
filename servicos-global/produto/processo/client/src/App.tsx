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
import { CurrencyDollar, Briefcase, Folders } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'

// ─── Lazy loading das telas do produto ─────────────────────────────────────

const ProcessoLayout = lazy(() => import('./pages/ProcessoLayout'))
const Workflow = lazy(() => import('./pages/workflow/Workflow'))
const PedidosResumo = lazy(() => import('./pages/pedidos/PedidosResumo'))
const PedidosLista = lazy(() => import('./pages/pedidos/PedidosLista'))
const DadosTecnicos = lazy(() => import('./pages/dados-tecnicos/DadosTecnicos'))
const FinanceiroMovimentacao = lazy(() => import('./pages/financeiro/FinanceiroMovimentacao'))
const FinanceiroNumerario = lazy(() => import('./pages/financeiro/FinanceiroNumerario'))
const FinanceiroRateio = lazy(() => import('./pages/financeiro/FinanceiroRateio'))
const ConfiguracoesLayout = lazy(() => import('./pages/configuracoes/ConfiguracoesLayout'))
const StatusProcesso = lazy(() => import('./pages/configuracoes/status/StatusProcesso'))
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

// ─── Placeholder: Documentos ───────────────────────────────────────────────

function DocumentosPlaceholder() {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Folders weight="duotone" size={22} />}
          titulo="Documentos"
          subtitulo="Documentos vinculados ao processo"
        />
      }
    >
      <div className="proc-empty-state ws-fade-up ws-fade-up-d1">
        <Folders weight="duotone" size={48} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Módulo de documentos em desenvolvimento
        </p>
      </div>
    </PaginaGlobal>
  )
}

// ─── Placeholder: Workspace ────────────────────────────────────────────────

function WorkspacePlaceholder() {
  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Briefcase weight="duotone" size={22} />}
          titulo="Workspace"
          subtitulo="Área de trabalho do processo"
        />
      }
    >
      <div className="proc-empty-state ws-fade-up ws-fade-up-d1">
        <Briefcase weight="duotone" size={48} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Workspace em construção
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
            <Route path="documentos" element={<DocumentosPlaceholder />} />
            {/* Pedidos: rotas aninhadas — /pedidos cai no index (Navigate
                pra resumo); /pedidos/resumo e /pedidos/lista sao filhos. */}
            <Route path="pedidos">
              <Route index element={<Navigate to="resumo" replace />} />
              <Route path="resumo" element={<PedidosResumo />} />
              <Route path="lista"  element={<PedidosLista />} />
            </Route>
            <Route path="dados-tecnicos" element={<DadosTecnicos />} />
            <Route path="email" element={<Email />} />
            {/* Financeiro: rotas aninhadas — /financeiro cai no index
                (Navigate pra movimentacao); cada aba e um filho. */}
            <Route path="financeiro">
              <Route index element={<Navigate to="movimentacao" replace />} />
              <Route path="movimentacao" element={<FinanceiroMovimentacao />} />
              <Route path="numerario"    element={<FinanceiroNumerario />} />
              <Route path="rateio"       element={<FinanceiroRateio />} />
            </Route>
            <Route path="workspace"  element={<WorkspacePlaceholder />} />
            {/* Configuracoes: layout com sub-sidebar + sub-paginas */}
            <Route path="configuracoes" element={<ConfiguracoesLayout />}>
              <Route index element={<Navigate to="status" replace />} />
              <Route path="status" element={<StatusProcesso />} />
              <Route path="cards"         element={<Navigate to="../status" replace />} />
              <Route path="visao-geral"   element={<Navigate to="../status" replace />} />
              <Route path="tabela"        element={<Navigate to="../status" replace />} />
              <Route path="colunas"       element={<Navigate to="../status" replace />} />
              <Route path="kanban"        element={<Navigate to="../status" replace />} />
              <Route path="numeracao"     element={<Navigate to="../status" replace />} />
              <Route path="templates-pdf" element={<Navigate to="../status" replace />} />
              <Route path="regras"        element={<Navigate to="../status" replace />} />
              <Route path="categ-anexos"  element={<Navigate to="../status" replace />} />
              <Route path="taxa-cambio"   element={<Navigate to="../status" replace />} />
              <Route path="cadastros"     element={<Navigate to="../status" replace />} />
              <Route path="notificacoes"  element={<Navigate to="../status" replace />} />
              <Route path="exportacao"    element={<Navigate to="../status" replace />} />
            </Route>
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
