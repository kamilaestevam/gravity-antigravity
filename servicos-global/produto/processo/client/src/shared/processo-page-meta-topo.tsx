import type { ReactNode } from 'react'
import { ChartPieSlice, ChartBar, Kanban, ListBullets } from '@phosphor-icons/react'
import type { ProcessoVisualizacaoId } from '../components/processo-visualizacao-context'

export interface ProcessoPageMetaTopo {
  label: string
  subtitulo: string
  icone: ReactNode
}

const META_POR_VISUALIZACAO: Record<ProcessoVisualizacaoId, ProcessoPageMetaTopo> = {
  insights: {
    label: 'Insights',
    subtitulo: 'Visão consolidada dos processos do workspace',
    icone: <ChartPieSlice weight="duotone" size={22} />,
  },
  lista: {
    label: 'Lista',
    subtitulo: 'Processos do workspace — Processo, Pedido e Item',
    icone: <ListBullets weight="duotone" size={22} />,
  },
  dashboard: {
    label: 'Dashboard',
    subtitulo: 'KPIs e widgets configuráveis',
    icone: <ChartBar weight="duotone" size={22} />,
  },
  kanban: {
    label: 'Kanban',
    subtitulo: 'Processos do workspace agrupados por etapa',
    icone: <Kanban weight="duotone" size={22} />,
  },
}

/** Título da view — paridade page-meta-topo do BID Frete / MenuTopoGlobal. */
export function resolverProcessoPageMetaTopo(
  visualizacao: ProcessoVisualizacaoId,
): ProcessoPageMetaTopo {
  return META_POR_VISUALIZACAO[visualizacao]
}
