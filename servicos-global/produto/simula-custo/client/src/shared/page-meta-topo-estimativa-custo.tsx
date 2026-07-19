/**
 * page-meta-topo-estimativa-custo — título, ícone e subtítulo do MenuTopoGlobal
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
import { BASE_ROTA_SIMULA_CUSTO } from './rotas-estimativa-custo'

export interface PageMetaTopoEstimativaCusto {
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
      subtituloDefault: 'Resumo das estimativas de custo de importação',
      icone: <Compass weight="duotone" size={22} />,
    },
  },
  {
    match: rk => rk === 'lista',
    def: {
      labelKey: 'simulacusto.nav.lista',
      labelDefault: 'Lista',
      subtituloKey: 'simulacusto.estimativas.lista_subtitulo',
      subtituloDefault: 'Todas as estimativas de custo em tabela',
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
      subtituloDefault: 'Estimativas organizadas por status',
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
    match: rk => rk === 'estimativas/nova',
    def: {
      labelKey: 'simulacusto.estimativas.nova',
      labelDefault: 'Nova Estimativa',
      subtituloKey: 'simulacusto.formulario.subtitulo_nova',
      subtituloDefault: 'Preencha os dados para calcular o custo nacionalizado',
      icone: <Calculator weight="duotone" size={22} />,
    },
  },
  {
    match: rk => /^estimativas\/[^/]+$/.test(rk),
    def: {
      labelKey: 'simulacusto.formulario.titulo_editar',
      labelDefault: 'Estimativa de Custo',
      subtituloKey: 'simulacusto.formulario.subtitulo_editar',
      subtituloDefault: 'Detalhes, taxas e resultado fiscal da estimativa',
      icone: <Calculator weight="duotone" size={22} />,
    },
  },
]

function resolverRouteKeyEstimativaCusto(pathname: string): string {
  const semBase = pathname.startsWith(BASE_ROTA_SIMULA_CUSTO)
    ? pathname.slice(BASE_ROTA_SIMULA_CUSTO.length)
    : pathname
  return semBase.split('/').filter(Boolean).join('/')
}

export function traduzirPageMetaTopoEstimativaCusto(
  pathname: string,
  t: TFunction,
): PageMetaTopoEstimativaCusto {
  const routeKey = resolverRouteKeyEstimativaCusto(pathname)
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
