import type { ReactNode } from 'react'
import type { TFunction } from 'i18next'
import {
  ChartPieSlice,
  ChartBar,
  ListBullets,
  Kanban,
  GearSix,
  Package,
  UploadSimple,
} from '@phosphor-icons/react'
import { resolveRouteKey } from '@nucleo/menu-topo-global'

export interface PageMetaTopo {
  label: string
  icone?: ReactNode
  subtitulo?: string
}

const NOVO_PEDIDO_META_BASE = {
  icone: <Package weight="duotone" size={22} />,
} as const

const IMPORTAR_META_BASE = {
  icone: <UploadSimple weight="duotone" size={22} />,
} as const

function metaFromRoute(routeKey: string, t: TFunction): PageMetaTopo {
  const map: Record<string, PageMetaTopo> = {
    'pedidos/visao-geral': {
      label:     t('pedido.nav.visao_geral'),
      icone:     <ChartPieSlice weight="duotone" size={22} />,
      subtitulo: t('pedido.visao_geral.header.subtitulo'),
    },
    'pedidos/dashboard': {
      label:     t('pedido.nav.dashboard'),
      icone:     <ChartBar weight="duotone" size={22} />,
      subtitulo: t('pedido.page_topo.dashboard_subtitulo'),
    },
    'pedidos/lista': {
      label:     t('pedido.nav.lista'),
      icone:     <ListBullets weight="duotone" size={22} />,
      subtitulo: t('pedido.page_topo.lista_subtitulo'),
    },
    'pedidos/kanban': {
      label:     t('pedido.nav.kanban'),
      icone:     <Kanban weight="duotone" size={22} />,
      subtitulo: t('pedido.page_topo.kanban_subtitulo'),
    },
    'pedidos/novo': {
      label:     t('pedido.novo_pedido'),
      ...NOVO_PEDIDO_META_BASE,
      subtitulo: t('pedido.criar_subtitulo'),
    },
    'pedidos/importar': {
      label:     t('pedido.importar.titulo'),
      ...IMPORTAR_META_BASE,
      subtitulo: t('pedido.importar.subtitulo'),
    },
    'configuracoes': {
      label:     t('pedido.nav.configuracoes'),
      icone:     <GearSix weight="duotone" size={22} />,
      subtitulo: t('pedido.page_topo.configuracoes_subtitulo'),
    },
  }

  return map[routeKey] ?? map['pedidos/visao-geral']
}

const FORMULARIO_PEDIDO_META: Omit<PageMetaTopo, 'label' | 'subtitulo'> = {
  icone: <Package weight="duotone" size={22} />,
}

/** Resolve label + ícone + subtítulo estáticos para o MenuTopoGlobal. */
export function resolverPageMetaTopo(pathname: string, _search: string, t: TFunction): PageMetaTopo {
  const routeKey = resolveRouteKey(pathname)

  if (/^pedidos\/[^/]+\/editar$/.test(routeKey)) {
    return {
      label:     t('pedido.editar'),
      ...FORMULARIO_PEDIDO_META,
      subtitulo: t('pedido.page_topo.editar_subtitulo'),
    }
  }

  return metaFromRoute(routeKey, t)
}
