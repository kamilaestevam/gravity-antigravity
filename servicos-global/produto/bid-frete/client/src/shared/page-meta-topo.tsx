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

export interface PageMetaTopo {
  label: string
  icone?: ReactNode
  subtitulo?: string
}

const ROUTE_LABELS: Record<string, string> = {
  'visao-geral':          'Visão Geral',
  'dashboard':            'Dashboard',
  'cotacoes':             'Cotações',
  'cotacoes/nova':        'Nova Cotação',
  'cotacoes/importar':    'Importar Cotações',
  'fornecedores':         'Fornecedores',
  'configuracoes':        'Configurações',
  'portal/dashboard':     'Portal — Dashboard',
  'portal/pendentes':     'Cotações Pendentes',
  'portal/respostas':     'Respostas',
  'portal/tabela-precos': 'Tabela de Preços',
  'portal/desempenho':    'Desempenho',
}

const ROUTE_HEADERS: Record<string, Omit<PageMetaTopo, 'label'>> = {
  'visao-geral':          { icone: <Compass         weight="duotone" size={22} />, subtitulo: 'Resumo das cotações de frete' },
  'dashboard':            { icone: <ChartBar        weight="duotone" size={22} />, subtitulo: 'KPIs e widgets configuráveis' },
  'cotacoes':             { icone: <FileText        weight="duotone" size={22} />, subtitulo: 'Cotações de frete' },
  'cotacoes/nova':        { icone: <Truck           weight="duotone" size={22} />, subtitulo: 'Preencha as informações para buscar as melhores opções de frete' },
  'cotacoes/importar':    { icone: <Upload          weight="duotone" size={22} />, subtitulo: 'Importar cotações em massa via planilha' },
  'fornecedores':         { icone: <Buildings       weight="duotone" size={22} />, subtitulo: 'Transportadoras e agentes cadastrados' },
  'configuracoes':        { icone: <GearSix         weight="duotone" size={22} />, subtitulo: 'Personalize cards, colunas e status do produto' },
  'portal/dashboard':     { icone: <ChartPieSlice   weight="duotone" size={22} />, subtitulo: 'Visão geral das suas cotações e desempenho' },
  'portal/pendentes':     { icone: <Envelope        weight="duotone" size={22} />, subtitulo: 'Cotações aguardando sua resposta' },
  'portal/respostas':     { icone: <PaperPlaneTilt  weight="duotone" size={22} />, subtitulo: 'Propostas que você enviou' },
  'portal/tabela-precos': { icone: <CurrencyDollar  weight="duotone" size={22} />, subtitulo: 'Sua tabela de preços e fretes' },
  'portal/desempenho':    { icone: <Star            weight="duotone" size={22} />, subtitulo: 'Métricas das suas propostas' },
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

function metaFromRoute(routeKey: string): PageMetaTopo {
  const header = ROUTE_HEADERS[routeKey]
  return {
    label:     ROUTE_LABELS[routeKey] ?? 'Visão Geral',
    icone:     header?.icone,
    subtitulo: header?.subtitulo,
  }
}

/** Resolve label + ícone + subtítulo estáticos para o MenuTopoGlobal. */
export function resolverPageMetaTopo(pathname: string, search: string): PageMetaTopo {
  const routeKey = resolveRouteKey(pathname)
  const visao = new URLSearchParams(search).get('visao')

  if (routeKey === 'cotacoes' && visao === 'kanban') return KANBAN_META
  if (routeKey === 'cotacoes' && (visao === 'lista' || !visao)) return LISTA_META

  if (/^cotacoes\/[^/]+\/comparativo$/.test(routeKey)) return COMPARATIVO_META
  if (/^cotacoes\/[^/]+$/.test(routeKey) && routeKey !== 'cotacoes/nova' && routeKey !== 'cotacoes/importar') {
    return DETALHE_COTACAO_META
  }
  if (/^fornecedores\/[^/]+$/.test(routeKey)) return DETALHE_FORNECEDOR_META
  if (/^portal\/responder\/[^/]+$/.test(routeKey)) return RESPONDER_COTACAO_META

  return metaFromRoute(routeKey)
}
