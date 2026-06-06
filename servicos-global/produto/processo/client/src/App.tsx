/**
 * App.tsx — Raiz da SPA Processo
 *
 * Usa o <Layout> do @gravity/shell (CabecalhoGlobal + MenuLateralGlobal + Gabi).
 * O PRODUCT_CONFIG define quais menus aparecem e quais serviços de tenant são acessados.
 * Lazy imports com React.lazy + Suspense para code-splitting por rota.
 *
 * Rotas relativas ao splat do Configurador (/acesso-processos/* e /processo/*).
 * Workspace: Insights | Lista hierárquica | Dashboard | Kanban (ProcessoMultiView).
 * Detalhe: rotas planas legadas (workflow, pedidos/…) + slug da lista + id mock (p1…p7).
 */

import React, { lazy, Suspense, useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@shell'
import { corOficialProdutoGravity, LogoProcesso } from '@nucleo/logo-produtos'
import { PRODUCT_CONFIG } from './shared/config'
import { CurrencyDollar, Briefcase, Folders } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { ProcessoVisualizacaoLayout } from './components/ProcessoVisualizacaoLayout'
import { ProcessoMultiView } from './components/ProcessoMultiView'
import './shared/processo-page-shell.css'

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

const processoVisualizacoesElement = <ProcessoMultiView />

/** Sub-rotas do ProcessoLayout — detalhe de um processo (todas as entradas). */
function rotasFilhasDetalheProcesso() {
  return [
    <Route key="index" index element={<Navigate to="workflow" replace />} />,
    <Route key="workflow" path="workflow" element={<Workflow />} />,
    <Route key="documentos" path="documentos" element={<DocumentosPlaceholder />} />,
    <Route key="pedidos" path="pedidos">
      <Route index element={<Navigate to="resumo" replace />} />
      <Route path="resumo" element={<PedidosResumo />} />
      <Route path="lista" element={<PedidosLista />} />
    </Route>,
    <Route key="dados-tecnicos" path="dados-tecnicos" element={<DadosTecnicos />} />,
    <Route key="email" path="email" element={<Email />} />,
    <Route key="financeiro" path="financeiro">
      <Route index element={<Navigate to="movimentacao" replace />} />
      <Route path="movimentacao" element={<FinanceiroMovimentacao />} />
      <Route path="numerario" element={<FinanceiroNumerario />} />
      <Route path="rateio" element={<FinanceiroRateio />} />
    </Route>,
    <Route key="workspace" path="workspace" element={<WorkspacePlaceholder />} />,
    <Route key="configuracoes" path="configuracoes" element={<ConfiguracoesLayout />}>
      <Route index element={<Navigate to="status" replace />} />
      <Route path="status" element={<StatusProcesso />} />
      <Route path="cards" element={<Navigate to="../status" replace />} />
      <Route path="visao-geral" element={<Navigate to="../status" replace />} />
      <Route path="tabela" element={<Navigate to="../status" replace />} />
      <Route path="colunas" element={<Navigate to="../status" replace />} />
      <Route path="kanban" element={<Navigate to="../status" replace />} />
      <Route path="numeracao" element={<Navigate to="../status" replace />} />
      <Route path="templates-pdf" element={<Navigate to="../status" replace />} />
      <Route path="regras" element={<Navigate to="../status" replace />} />
      <Route path="categ-anexos" element={<Navigate to="../status" replace />} />
      <Route path="taxa-cambio" element={<Navigate to="../status" replace />} />
      <Route path="cadastros" element={<Navigate to="../status" replace />} />
      <Route path="notificacoes" element={<Navigate to="../status" replace />} />
      <Route path="exportacao" element={<Navigate to="../status" replace />} />
    </Route>,
    <Route key="fallback" path="*" element={<Navigate to="workflow" replace />} />,
  ]
}

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

          {/* Workspace — Insights | Lista hierárquica | Dashboard | Kanban */}
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

          {/* Detalhe via lista hierárquica — /acesso-processos/lista/:slug/workflow */}
          <Route path="lista/:slug_processo" element={<ProcessoLayout />}>
            {rotasFilhasDetalheProcesso()}
          </Route>

          {/* Legado — /acesso-processos/detalhe/workflow?id=… */}
          <Route path="detalhe" element={<ProcessoLayout />}>
            {rotasFilhasDetalheProcesso()}
          </Route>

          {/* Mock kanban — /acesso-processos/p1/workflow (apenas p + dígito) */}
          <Route path=":id_processo(p\\d+)" element={<ProcessoLayout />}>
            {rotasFilhasDetalheProcesso()}
          </Route>

          {/* Detalhe plano legado — /processo/workflow, /processo/pedidos/resumo, etc. */}
          <Route element={<ProcessoLayout />}>
            {rotasFilhasDetalheProcesso()}
          </Route>

          <Route path="*" element={<Navigate to="lista" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export { PRODUCT_CONFIG }
export default App
