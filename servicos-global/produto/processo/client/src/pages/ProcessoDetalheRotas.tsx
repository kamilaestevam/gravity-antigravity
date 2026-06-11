/**
 * Rotas internas do detalhe — pathname (splat /processo/* do configurador quebra Outlet/Routes).
 */
import React, { lazy, Suspense } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Briefcase, Folders } from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import Workflow from './workflow/Workflow'
import PedidosResumo from './pedidos/PedidosResumo'
import DadosTecnicos from './dados-tecnicos/DadosTecnicos'

const PedidosLista = lazy(() => import('./pedidos/PedidosLista'))
const FinanceiroMovimentacao = lazy(() => import('./financeiro/FinanceiroMovimentacao'))
const FinanceiroNumerario = lazy(() => import('./financeiro/FinanceiroNumerario'))
const FinanceiroRateio = lazy(() => import('./financeiro/FinanceiroRateio'))
const ConfiguracoesLayout = lazy(() => import('./configuracoes/ConfiguracoesLayout'))
const StatusProcesso = lazy(() => import('./configuracoes/status/StatusProcesso'))
const Email = lazy(() => import('./email/Email'))

import {
  baseDetalheLegado,
  baseListaProcesso,
  resolverSegmentoDetalhe,
  rotaListaWorkspace,
} from './resolver-segmento-detalhe-processo'

function DetalhePaginaLoading() {
  return (
    <div className="p2-page-loading processo-detalhe-page" aria-busy="true" aria-live="polite">
      <div className="p2-skeleton p2-skeleton--lg" />
      <div className="p2-skeleton p2-skeleton--md" />
      <div className="p2-skeleton p2-skeleton--bar" />
    </div>
  )
}

function DocumentosPlaceholder() {
  return (
    <PaginaGlobal className="processo-detalhe-page" layout="lista" cabecalho={
      <CabecalhoGlobal icone={<Folders weight="duotone" size={22} />} titulo="Documentos" subtitulo="Documentos vinculados ao processo" />
    }>
      <div className="proc-empty-state">
        <Folders weight="duotone" size={48} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Módulo de documentos em desenvolvimento</p>
      </div>
    </PaginaGlobal>
  )
}

function WorkspacePlaceholder() {
  return (
    <PaginaGlobal className="processo-detalhe-page" layout="lista" cabecalho={
      <CabecalhoGlobal icone={<Briefcase weight="duotone" size={22} />} titulo="Workspace" subtitulo="Área de trabalho do processo" />
    }>
      <div className="proc-empty-state">
        <Briefcase weight="duotone" size={48} color="var(--text-muted)" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Workspace em construção</p>
      </div>
    </PaginaGlobal>
  )
}

function renderPaginaDetalhe(segmento: string): React.ReactNode {
  switch (segmento) {
    case 'workflow':
      return <Workflow />

    case 'documentos':
      return <DocumentosPlaceholder />

    case 'dados-tecnicos':
      return <DadosTecnicos />

    case 'email':
      return <Email />

    case 'pedidos':
    case 'pedidos/resumo':
      return <PedidosResumo />

    case 'pedidos/lista':
      return <PedidosLista />

    case 'financeiro':
    case 'financeiro/movimentacao':
      return <FinanceiroMovimentacao />

    case 'financeiro/numerario':
      return <FinanceiroNumerario />

    case 'financeiro/rateio':
      return <FinanceiroRateio />

    case 'workspace':
      return <WorkspacePlaceholder />

    case 'configuracoes':
    case 'configuracoes/status':
      return (
        <ConfiguracoesLayout>
          <StatusProcesso />
        </ConfiguracoesLayout>
      )

    case 'configuracoes/cards':
    case 'configuracoes/visao-geral':
    case 'configuracoes/tabela':
    case 'configuracoes/colunas':
    case 'configuracoes/kanban':
    case 'configuracoes/numeracao':
    case 'configuracoes/templates-pdf':
    case 'configuracoes/regras':
    case 'configuracoes/categ-anexos':
    case 'configuracoes/taxa-cambio':
    case 'configuracoes/cadastros':
    case 'configuracoes/notificacoes':
    case 'configuracoes/exportacao':
      return (
        <ConfiguracoesLayout>
          <StatusProcesso />
        </ConfiguracoesLayout>
      )

    default:
      return null
  }
}

const PAGINAS_EAGER = new Set(['workflow', 'dados-tecnicos', 'pedidos', 'pedidos/resumo'])

export function ProcessoDetalheRotas() {
  const { pathname, search } = useLocation()
  const detalhe = resolverSegmentoDetalhe(pathname)

  if (!detalhe) {
    return <Navigate to={rotaListaWorkspace(pathname)} replace />
  }

  const segmento = detalhe.segmento
  const slugProcesso = detalhe.slug
  const pagina = renderPaginaDetalhe(segmento)

  if (!pagina && detalhe?.modo === 'legado') {
    return <Navigate to={`${baseDetalheLegado(pathname)}/workflow${search}`} replace />
  }

  if (!pagina && slugProcesso) {
    const base = baseListaProcesso(pathname, slugProcesso)
    return <Navigate to={`${base}/workflow${search}`} replace />
  }

  if (!pagina) {
    return <Navigate to={rotaListaWorkspace(pathname)} replace />
  }

  const conteudo = PAGINAS_EAGER.has(segmento) ? pagina : (
    <Suspense fallback={<DetalhePaginaLoading />}>
      {pagina}
    </Suspense>
  )

  return (
    <div className="p2-outlet-root" data-processo-segmento={segmento}>
      {conteudo}
    </div>
  )
}
