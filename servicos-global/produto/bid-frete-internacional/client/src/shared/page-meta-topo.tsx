import type { ReactNode } from 'react'

import {

  ChartPieSlice,

  ChartBar,

  ListBullets,

  FileText,

  Buildings,

  GearSix,

  Envelope,

  Kanban,

  Compass,

  Truck,

  Upload,

  PaperPlaneTilt,

  Star,

  CurrencyDollar,

  Ranking,

} from '@phosphor-icons/react'

import { resolveRouteKey } from '@nucleo/menu-topo-global'

import type { TFunction } from 'i18next'



export interface PageMetaTopo {

  label: string

  icone?: ReactNode

  subtitulo?: string

}



const ROUTE_LABELS: Record<string, string> = {

  insights:               'Insights',

  'visao-geral':          'Insights',

  'dashboard':            'Dashboard',

  'lista':                'Lista',

  'kanban':               'Kanban',

  'cotacoes':             'Cotações',

  'cotacoes/nova':        'Nova Cotação de Frete Internacional',

  'cotacoes/importar':    'Importar Cotações',

  'fornecedores':         'Fornecedores',

  'configuracoes':        'Configurações',

  'visao-fornecedor-bid-frete-internacional/dashboard':     'Insights',

  'visao-fornecedor-bid-frete-internacional/paineis-dashboard': 'Dashboard',

  'visao-fornecedor-bid-frete-internacional/lista':         'Lista',

  'visao-fornecedor-bid-frete-internacional/kanban':        'Kanban',

  'visao-fornecedor-bid-frete-internacional/cotacoes-pendentes': 'Cotações pendentes',

  'visao-fornecedor-bid-frete-internacional/propostas':     'Minhas propostas',

  'visao-fornecedor-bid-frete-internacional/tabelas-valor': 'Tabelas de valor',

  'visao-fornecedor-bid-frete-internacional/desempenho':    'Meu desempenho',

  'visao-fornecedor-bid-frete-internacional/configuracoes': 'Configurações',

}



const ROUTE_HEADERS: Record<string, Omit<PageMetaTopo, 'label'>> = {

  insights:               { icone: <Compass         weight="duotone" size={22} />, subtitulo: 'Resumo das cotações de frete internacional' },

  'visao-geral':          { icone: <Compass         weight="duotone" size={22} />, subtitulo: 'Resumo das cotações de frete internacional' },

  'dashboard':            { icone: <ChartBar        weight="duotone" size={22} />, subtitulo: 'KPIs e widgets configuráveis' },

  'lista':                { icone: <ListBullets     weight="duotone" size={22} />, subtitulo: 'Todas as cotações de frete em tabela' },

  'kanban':               { icone: <Kanban          weight="duotone" size={22} />, subtitulo: 'Cotações organizadas por status' },

  'cotacoes':             { icone: <FileText        weight="duotone" size={22} />, subtitulo: 'Cotações de frete internacional' },

  'cotacoes/nova':        { icone: <Truck           weight="duotone" size={22} />, subtitulo: 'Preencha as informações para buscar as melhores opções de frete' },

  'cotacoes/importar':    { icone: <Upload          weight="duotone" size={22} />, subtitulo: 'Importar cotações em massa via planilha' },

  'fornecedores':         { icone: <Buildings       weight="duotone" size={22} />, subtitulo: 'Transportadores e agentes de carga cadastrados' },

  'configuracoes':        { icone: <GearSix         weight="duotone" size={22} />, subtitulo: 'Personalize cards, colunas e status do produto' },

  'visao-fornecedor-bid-frete-internacional/dashboard':     { icone: <ChartPieSlice   weight="duotone" size={22} />, subtitulo: 'Visão geral das suas cotações e desempenho' },

  'visao-fornecedor-bid-frete-internacional/paineis-dashboard': { icone: <ChartBar        weight="duotone" size={22} />, subtitulo: 'KPIs e widgets configuráveis do fornecedor' },

  'visao-fornecedor-bid-frete-internacional/lista':         { icone: <ListBullets     weight="duotone" size={22} />, subtitulo: 'Todas as oportunidades em tabela' },

  'visao-fornecedor-bid-frete-internacional/kanban':        { icone: <Kanban          weight="duotone" size={22} />, subtitulo: 'Suas cotações e propostas por etapa' },

  'visao-fornecedor-bid-frete-internacional/cotacoes-pendentes': { icone: <Envelope        weight="duotone" size={22} />, subtitulo: 'Cotações aguardando sua proposta' },

  'visao-fornecedor-bid-frete-internacional/propostas':     { icone: <PaperPlaneTilt  weight="duotone" size={22} />, subtitulo: 'Propostas que você enviou' },

  'visao-fornecedor-bid-frete-internacional/tabelas-valor': { icone: <CurrencyDollar  weight="duotone" size={22} />, subtitulo: 'Suas tabelas de valor' },

  'visao-fornecedor-bid-frete-internacional/desempenho':    { icone: <Star            weight="duotone" size={22} />, subtitulo: 'Métricas e classificação' },

  'visao-fornecedor-bid-frete-internacional/configuracoes': { icone: <GearSix         weight="duotone" size={22} />, subtitulo: 'Personalize cards, colunas e kanban da sua visão' },

}



const LISTA_META: PageMetaTopo = {

  label:     'Lista',

  icone:     <ListBullets weight="duotone" size={22} />,

  subtitulo: 'Todas as cotações de frete em tabela',

}



const KANBAN_META: PageMetaTopo = {

  label:     'Kanban',

  icone:     <Kanban weight="duotone" size={22} />,

  subtitulo: 'Cotações organizadas por status',

}



const DETALHE_COTACAO_META: PageMetaTopo = {

  label:     'Detalhe da Cotação',

  icone:     <FileText weight="duotone" size={22} />,

  subtitulo: 'Informações, propostas e ações da cotação',

}



const COMPARATIVO_META: PageMetaTopo = {

  label:     'Comparativo',

  icone:     <Ranking weight="duotone" size={22} />,

  subtitulo: 'Compare propostas e selecione a melhor opção',

}



const DETALHE_FORNECEDOR_META: PageMetaTopo = {

  label:     'Detalhe do Fornecedor',

  icone:     <Buildings weight="duotone" size={22} />,

  subtitulo: 'Histórico, rating e dados do transportador',

}



const RESPONDER_COTACAO_META: PageMetaTopo = {

  label:     'Responder Cotação',

  icone:     <PaperPlaneTilt weight="duotone" size={22} />,

  subtitulo: 'Envie sua proposta para esta cotação',

}



type MetaI18nKeys = { labelKey?: string; subtitleKey?: string }



function metaFromRoute(routeKey: string): PageMetaTopo {

  const header = ROUTE_HEADERS[routeKey]

  return {

    label:     ROUTE_LABELS[routeKey] ?? 'Insights',

    icone:     header?.icone,

    subtitulo: header?.subtitulo,

  }

}



/** Resolve label + ícone + subtítulo estáticos para o MenuTopoGlobal. */

export function resolverPageMetaTopo(pathname: string, search: string): PageMetaTopo {

  const routeKey = resolveRouteKey(pathname)

  const visao = new URLSearchParams(search).get('visao')



  if (routeKey === 'kanban') return KANBAN_META

  if (routeKey === 'lista') return LISTA_META

  if (routeKey === 'cotacoes' && visao === 'kanban') return KANBAN_META

  if (routeKey === 'cotacoes' && (visao === 'lista' || !visao)) return LISTA_META



  if (/^cotacoes\/[^/]+\/comparativo$/.test(routeKey)) return COMPARATIVO_META

  if (/^cotacoes\/[^/]+$/.test(routeKey) && routeKey !== 'cotacoes/nova' && routeKey !== 'cotacoes/importar') {

    return DETALHE_COTACAO_META

  }

  if (/^fornecedores\/[^/]+$/.test(routeKey)) return DETALHE_FORNECEDOR_META

  if (/^visao-fornecedor-bid-frete-internacional\/responder\/[^/]+$/.test(routeKey)) return RESPONDER_COTACAO_META



  return metaFromRoute(routeKey)

}



const PREFIXO = 'bidfrete'

const NAV = `${PREFIXO}.nav`

const PAGE_META = `${PREFIXO}.page_meta`

const VISAO_NAV = `${PREFIXO}.visao_fornecedor_bid_frete_internacional.nav`



const ROTAS_ESTATICAS: Record<string, MetaI18nKeys> = {

  insights: { labelKey: `${NAV}.insights`, subtitleKey: `${PREFIXO}.insights.subtitulo` },

  'visao-geral': { labelKey: `${NAV}.insights`, subtitleKey: `${PREFIXO}.insights.subtitulo` },

  dashboard: { labelKey: `${NAV}.dashboard`, subtitleKey: `${PREFIXO}.dashboard.subtitulo_pagina` },

  cotacoes: { labelKey: `${NAV}.cotacoes`, subtitleKey: `${PAGE_META}.cotacoes` },

  'cotacoes/nova': {

    labelKey: `${PREFIXO}.nova_cotacao.titulo_internacional`,

    subtitleKey: `${PREFIXO}.nova_cotacao.subtitulo`,

  },

  'cotacoes/importar': { labelKey: `${NAV}.importar`, subtitleKey: `${PAGE_META}.importar` },

  fornecedores: { labelKey: `${PREFIXO}.fornecedores.titulo`, subtitleKey: `${PREFIXO}.fornecedores.subtitulo` },

  configuracoes: { labelKey: `${PREFIXO}.configuracoes.titulo`, subtitleKey: `${PAGE_META}.configuracoes` },

  'visao-fornecedor-bid-frete-internacional/dashboard': {

    labelKey: `${VISAO_NAV}.insights`,

    subtitleKey: `${PAGE_META}.fornecedor.dashboard`,

  },

  'visao-fornecedor-bid-frete-internacional/paineis-dashboard': {

    labelKey: `${VISAO_NAV}.paineis_dashboard`,

    subtitleKey: `${PREFIXO}.dashboard.subtitulo_pagina_fornecedor`,

  },

  'visao-fornecedor-bid-frete-internacional/lista': {

    labelKey: `${VISAO_NAV}.lista`,

    subtitleKey: `${PAGE_META}.fornecedor.lista`,

  },

  'visao-fornecedor-bid-frete-internacional/kanban': {

    labelKey: `${VISAO_NAV}.kanban`,

    subtitleKey: `${PREFIXO}.visao_fornecedor_bid_frete_internacional.kanban.subtitulo`,

  },

  'visao-fornecedor-bid-frete-internacional/cotacoes-pendentes': {

    labelKey: `${VISAO_NAV}.cotacoes_pendentes`,

    subtitleKey: `${PAGE_META}.fornecedor.cotacoes_pendentes`,

  },

  'visao-fornecedor-bid-frete-internacional/propostas': {

    labelKey: `${VISAO_NAV}.propostas`,

    subtitleKey: `${PAGE_META}.fornecedor.propostas`,

  },

  'visao-fornecedor-bid-frete-internacional/tabelas-valor': {

    labelKey: `${VISAO_NAV}.tabelas_valor`,

    subtitleKey: `${PAGE_META}.fornecedor.tabelas_valor`,

  },

  'visao-fornecedor-bid-frete-internacional/desempenho': {

    labelKey: `${VISAO_NAV}.desempenho`,

    subtitleKey: `${PAGE_META}.fornecedor.desempenho`,

  },

  'visao-fornecedor-bid-frete-internacional/configuracoes': {

    labelKey: `${VISAO_NAV}.configuracoes`,

    subtitleKey: `${PAGE_META}.fornecedor.configuracoes`,

  },

}



function resolverChavesI18nPageMeta(routeKey: string, search: string): MetaI18nKeys {

  const visao = new URLSearchParams(search).get('visao')



  if (routeKey === 'lista' || (routeKey === 'cotacoes' && (visao === 'lista' || !visao))) {

    return { labelKey: `${NAV}.lista`, subtitleKey: `${PAGE_META}.lista` }

  }

  if (routeKey === 'kanban' || (routeKey === 'cotacoes' && visao === 'kanban')) {

    return { labelKey: `${NAV}.kanban`, subtitleKey: `${PREFIXO}.kanban.subtitulo` }

  }

  if (/^cotacoes\/[^/]+\/comparativo$/.test(routeKey)) {

    return {

      labelKey: `${PREFIXO}.comparativo.titulo`,

      subtitleKey: `${PAGE_META}.comparativo.subtitulo`,

    }

  }

  if (/^cotacoes\/[^/]+$/.test(routeKey) && routeKey !== 'cotacoes/nova' && routeKey !== 'cotacoes/importar') {

    return {

      labelKey: `${PAGE_META}.detalhe_cotacao.titulo`,

      subtitleKey: `${PAGE_META}.detalhe_cotacao.subtitulo`,

    }

  }

  if (/^fornecedores\/[^/]+$/.test(routeKey)) {

    return {

      labelKey: `${PAGE_META}.detalhe_fornecedor.titulo`,

      subtitleKey: `${PAGE_META}.detalhe_fornecedor.subtitulo`,

    }

  }

  if (/^visao-fornecedor-bid-frete-internacional\/responder\/[^/]+$/.test(routeKey)) {

    return {

      labelKey: `${PREFIXO}.visao_fornecedor_bid_frete_internacional.responder_cotacao.titulo`,

      subtitleKey: `${PAGE_META}.responder_cotacao.subtitulo`,

    }

  }



  return ROTAS_ESTATICAS[routeKey] ?? {}

}



/** Resolve meta do topo traduzida (label + subtítulo via i18n). */

export function traduzirPageMetaTopo(pathname: string, search: string, t: TFunction): PageMetaTopo {

  const raw = resolverPageMetaTopo(pathname, search)

  const routeKey = resolveRouteKey(pathname)

  const keys = resolverChavesI18nPageMeta(routeKey, search)



  return {

    ...raw,

    label: keys.labelKey ? t(keys.labelKey, { defaultValue: raw.label }) : raw.label,

    subtitulo:

      keys.subtitleKey && raw.subtitulo

        ? t(keys.subtitleKey, { defaultValue: raw.subtitulo })

        : raw.subtitulo,

  }

}


