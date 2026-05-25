import type { ReactNode } from 'react'
import type { TFunction } from 'i18next'
import {
  Crown,
  Buildings,
  Users,
  Receipt,
  Desktop,
  CloudArrowUp,
  Pulse,
  ShoppingBagOpen,
  Bug,
  ShieldCheck,
  ArrowsClockwise,
  Certificate,
  Database,
  CurrencyCircleDollar,
  CreditCard,
  ClockCounterClockwise,
  Truck,
} from '@phosphor-icons/react'

export interface PageMetaTopo {
  label: string
  icone?: ReactNode
  subtitulo?: string
}

const ICON_SIZE = 22

function adminMeta(pathname: string, t: TFunction): PageMetaTopo {
  const map: Record<string, PageMetaTopo> = {
    '/admin/visao-geral': {
      label:     t('admin.visao-geral.titulo'),
      icone:     <Crown weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.visao-geral.subtitulo'),
    },
    '/admin/organizacoes': {
      label:     'Organizações',
      icone:     <Buildings weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Gerencie as organizações e seus workspaces e usuários.',
    },
    '/admin/produtos-gravity': {
      label:     t('admin.produtos-gravity.titulo'),
      icone:     <ShoppingBagOpen weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.produtos-gravity.subtitulo'),
    },
    '/admin/usuarios': {
      label:     t('admin.usuarios-globais.titulo'),
      icone:     <Users weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.usuarios-globais.subtitulo'),
    },
    '/admin/financeiro': {
      label:     t('admin.financeiro-admin.titulo'),
      icone:     <Receipt weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.financeiro-admin.subtitulo'),
    },
    '/admin/historico-global': {
      label:     t('admin.historico-global.titulo'),
      icone:     <Desktop weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.historico-global.subtitulo'),
    },
    '/admin/deploy': {
      label:     t('admin.deploy.titulo', 'Deploy Railway'),
      icone:     <CloudArrowUp weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.deploy.subtitulo', 'Histórico de versões, status de implantação e controle de CI/CD em todos os ambientes'),
    },
    '/admin/testes-gerais': {
      label:     t('admin.testes-gerais.titulo'),
      icone:     <Bug weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.testes-gerais.subtitulo'),
    },
    '/admin/api-cockpit': {
      label:     t('admin.api-cockpit.titulo'),
      icone:     <Pulse weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.api-cockpit.subtitulo'),
    },
    '/admin/api-cockpit/tokens': {
      label:     'API Cockpit',
      icone:     <Pulse weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Tokens de API por organização — visão administrativa com CRUD completo',
    },
    '/admin/api-cockpit/webhooks': {
      label:     'API Cockpit',
      icone:     <Pulse weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Webhooks por organização — visão administrativa com CRUD completo',
    },
    '/admin/api-cockpit/consumo': {
      label:     'API Cockpit',
      icone:     <Pulse weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Consumo da API — visão global de todas as organizações',
    },
    '/admin/api-cockpit/monitor-llm': {
      label:     t('admin.api-cockpit.titulo'),
      icone:     <Pulse weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.monitor-llm.subtitulo'),
    },
    '/admin/seguranca': {
      label:     t('admin.seguranca-admin.titulo'),
      icone:     <ShieldCheck weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.seguranca-admin.subtitulo_template', { time: '—', interval: 30 }),
    },
    '/admin/ncm-integracao': {
      label:     t('admin.ncm.titulo'),
      icone:     <ArrowsClockwise weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.ncm.subtitulo'),
    },
    '/admin/certificados-digitais': {
      label:     t('admin.certificados.titulo', 'Certificados Digitais Siscomex'),
      icone:     <Certificate weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.certificados.subtitulo', 'Upload e gestão de e-CNPJ para autenticação no Portal Único'),
    },
    '/admin/cadastros-globais': {
      label:     'Cadastros Globais',
      icone:     <Database weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Catálogos compartilhados por todas as organizações (NCM, Moedas, Unidades). Somente leitura nesta onda.',
    },
    '/admin/empresas-e-parceiros': {
      label:     'Empresas e Parceiros',
      icone:     <Buildings weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Visão cross-organização (SUPER_ADMIN / ADMIN Gravity)',
    },
    '/admin/taxas-moeda': {
      label:     'Taxas de Moeda',
      icone:     <CurrencyCircleDollar weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Cotações PTAX oficiais e projeções de câmbio do BACEN Focus',
    },
  }

  if (map[pathname]) return map[pathname]

  if (/^\/admin\/organizacoes\/[^/]+$/.test(pathname)) {
    return {
      label:     'Painel de Auditoria',
      icone:     <ShieldCheck weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Visão forense completa da organização',
    }
  }

  return {
    label:     t('admin.layout.module_name', 'Admin'),
    icone:     <Crown weight="duotone" size={ICON_SIZE} />,
    subtitulo: t('admin.layout.visao_geral'),
  }
}

function configuradorMeta(pathname: string, t: TFunction): PageMetaTopo {
  const map: Record<string, PageMetaTopo> = {
    '/configurador/organizacao': {
      label:     t('workspace.organizacao.titulo'),
      icone:     <Crown weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('workspace.organizacao.subtitulo'),
    },
    '/configurador/workspaces': {
      label:     t('workspace.workspaces.titulo'),
      icone:     <Buildings weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('workspace.workspaces.subtitulo'),
    },
    '/configurador/usuarios': {
      label:     t('workspace.users.titulo'),
      icone:     <Users weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('workspace.users.subtitulo'),
    },
    '/configurador/empresas-e-parceiros': {
      label:     'Empresas e Parceiros',
      icone:     <Buildings weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Cadastre e gerencie os parceiros da sua jornada COMEX',
    },
    '/configurador/assinaturas': {
      label:     t('workspace.subscriptions.titulo'),
      icone:     <CreditCard weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('workspace.subscriptions.subtitulo'),
    },
    '/configurador/financeiro': {
      label:     t('workspace.financial.titulo'),
      icone:     <Receipt weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('workspace.financial.subtitulo'),
    },
    '/configurador/api-cockpit': {
      label:     t('admin.cockpit.titulo'),
      icone:     <Pulse weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('admin.cockpit.subtitulo'),
    },
    '/configurador/api-cockpit/tokens': {
      label:     'Tokens de API',
      icone:     <Pulse weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Gere e gerencie tokens para integrar seus sistemas com a API Gravity',
    },
    '/configurador/api-cockpit/webhooks': {
      label:     'Webhooks',
      icone:     <Pulse weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Receba notificacoes em tempo real dos eventos do Gravity em sua aplicacao',
    },
    '/configurador/api-cockpit/consumo': {
      label:     'Consumo da API',
      icone:     <Pulse weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Historico detalhado de cada requisicao recebida pela API Gravity desta organizacao',
    },
    '/configurador/conector-cargowise': {
      label:     t('workspace.cargowise.titulo'),
      icone:     <Truck weight="duotone" size={ICON_SIZE} />,
      subtitulo: t('workspace.cargowise.subtitulo'),
    },
    '/configurador/taxas-moeda': {
      label:     'Taxas de Moeda',
      icone:     <CurrencyCircleDollar weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Cotações PTAX oficiais e projeções de câmbio do BACEN Focus',
    },
    '/configurador/historico-organizacao': {
      label:     t('workspace.layout.historico-organizacao'),
      icone:     <ClockCounterClockwise weight="duotone" size={ICON_SIZE} />,
      subtitulo: 'Registro de alterações na organização e workspaces',
    },
  }

  return map[pathname] ?? {
    label:     t('workspace.layout.modulo_nome', 'Configurador'),
    icone:     <Crown weight="duotone" size={ICON_SIZE} />,
    subtitulo: t('workspace.layout.organizacao'),
  }
}

/** Resolve label + ícone + subtítulo estáticos para o topo da página. */
export function resolverPageMetaTopo(
  pathname: string,
  t: TFunction,
  area: 'admin' | 'configurador',
): PageMetaTopo {
  return area === 'admin' ? adminMeta(pathname, t) : configuradorMeta(pathname, t)
}

/** Label curto para o LocalizadorGlobal (sem subtítulo). */
export function resolverPageLabelTopo(
  pathname: string,
  t: TFunction,
  area: 'admin' | 'configurador',
): string {
  return resolverPageMetaTopo(pathname, t, area).label
}
