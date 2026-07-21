/**
 * page-meta-topo-simula-custo — título, ícone e subtítulo do MenuTopoGlobal
 * por rota (paridade page-meta-topo do Bid Frete Internacional).
 */
import type { ReactNode } from 'react'
import {
  Compass,
  ChartBar,
  ListBullets,
  Kanban,
  GearSix,
  Calculator,
} from '@phosphor-icons/react'
import type { TFunction } from 'i18next'
import { BASE_ROTA_SIMULA_CUSTO } from './rotas-simula-custo'

export interface PageMetaTopoSimulaCusto {
  label: string
  icone?: ReactNode
  subtitulo?: string
}

interface MetaDef {
  labelKey: string
  labelDefault: string
  subtituloKey: string
  subtituloDefault: string
  icone: ReactNode
}

const METAS: Array<{ match: (routeKey: string) => boolean; def: MetaDef }> = [
  {
    match: rk => rk === 'insights' || rk === 'visao-geral' || rk === '',
    def: {
      labelKey: 'simulacusto.nav.insights',
      labelDefault: 'Insights',
      subtituloKey: 'simulacusto.insights.subtitulo',
      subtituloDefault: 'Resumo das simulas de custo de importação',
      icone: <Compass weight="duotone" size={22} />,
    },
  },
  {
    match: rk => rk === 'lista',
    def: {
      labelKey: 'simulacusto.nav.lista',
      labelDefault: 'Lista',
      subtituloKey: 'simulacusto.simulas.lista_subtitulo',
      subtituloDefault: 'Todas as simulas de custo em tabela',
      icone: <ListBullets weight="duotone" size={22} />,
    },
  },
  {
    match: rk => rk === 'dashboard',
    def: {
      labelKey: 'simulacusto.nav.dashboard',
      labelDefault: 'Dashboard',
      subtituloKey: 'simulacusto.dashboard.subtitulo_pagina',
      subtituloDefault: 'KPIs e cards configuráveis',
      icone: <ChartBar weight="duotone" size={22} />,
    },
  },
  {
    match: rk => rk === 'kanban',
    def: {
      labelKey: 'simulacusto.nav.kanban',
      labelDefault: 'Kanban',
      subtituloKey: 'simulacusto.kanban.subtitulo',
      subtituloDefault: 'Simulas organizadas por status',
      icone: <Kanban weight="duotone" size={22} />,
    },
  },
  {
    match: rk => rk === 'configuracoes',
    def: {
      labelKey: 'simulacusto.nav.configuracoes',
      labelDefault: 'Configurações',
      subtituloKey: 'simulacusto.configuracoes.subtitulo',
      subtituloDefault: 'Personalize cards, kanban e preferências do produto',
      icone: <GearSix weight="duotone" size={22} />,
    },
  },
  {
    match: rk => rk === 'simulas/nova',
    def: {
      labelKey: 'simulacusto.formulario.titulo_nova',
      labelDefault: 'Nova Simula de Custo',
      subtituloKey: 'simulacusto.formulario.subtitulo_nova',
      subtituloDefault: 'Preencha as informações para calcular o custo nacionalizado',
      icone: <Calculator weight="duotone" size={22} />,
    },
  },
  {
    match: rk => /^simulas\/[^/]+$/.test(rk),
    def: {
      labelKey: 'simulacusto.formulario.titulo_editar',
      labelDefault: 'Editar Simula de Custo',
      subtituloKey: 'simulacusto.formulario.subtitulo_editar',
      subtituloDefault: 'Revise os dados e o resultado fiscal da simula',
      icone: <Calculator weight="duotone" size={22} />,
    },
  },
]

function resolverRouteKeySimulaCusto(pathname: string): string {
  const semBase = pathname.startsWith(BASE_ROTA_SIMULA_CUSTO)
    ? pathname.slice(BASE_ROTA_SIMULA_CUSTO.length)
    : pathname
  return semBase.split('/').filter(Boolean).join('/')
}

export function traduzirPageMetaTopoSimulaCusto(
  pathname: string,
  t: TFunction,
): PageMetaTopoSimulaCusto {
  const routeKey = resolverRouteKeySimulaCusto(pathname)
  const entrada = METAS.find(m => m.match(routeKey))
  if (!entrada) {
    return { label: t('simulacusto.nav.insights', 'Insights') }
  }
  return {
    label: t(entrada.def.labelKey, entrada.def.labelDefault),
    icone: entrada.def.icone,
    subtitulo: t(entrada.def.subtituloKey, entrada.def.subtituloDefault),
  }
}
