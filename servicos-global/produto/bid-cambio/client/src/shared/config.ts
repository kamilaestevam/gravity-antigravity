/**
 * config.ts — PRODUCT_CONFIG do BID Cambio
 *
 * Fonte de verdade do produto: declara servicos de tenant usados,
 * servicos de produto internos e a navegação lateral.
 * Ícones referem-se a nomes Phosphor Icons (kebab-case para o registry).
 */

export interface NavigationItem {
  id:            string
  label:         string
  labelKey?:     string
  icon?:         string
  source?:       'product' | 'tenant'
  sectionDivider?: boolean
  disabled?:     boolean
  badge?:        string
  badgeVariant?: 'accent' | 'muted'
  children?:     NavigationItem[]
  external?:     boolean
}

export const PRODUCT_CONFIG = {
  id: 'bid-cambio',
  productId: 'bid-cambio',
  name: 'BID Cambio',
  port: 8025,

  tenantServices: [
    'atividades',
    'dashboard',
    'relatorios',
    'historico',
    'notificacoes',
    'gabi',
    'email',
    'agendamento',
    'api-cockpit',
  ] as const,

  productServices: [
    'bid-engine',
    'comparativo-engine',
    'rating-engine',
    'parcela-engine',
    'savings-engine',
    'vencimento-engine',
    'email-engine',
  ] as const,

  navigation: [

    // ── Meu Espaço ───────────────────────────────────────────────────────────
    {
      id: 'meu-espaco', label: 'Meu Espaço', icon: 'user-circle', source: 'tenant',
      children: [
        { id: '/core/atividades', label: 'Minhas Atividades', icon: 'check-circle',  source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
        { id: '/core/email',      label: 'Email',             icon: 'envelope',      source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
      ],
    },

    // ── BID Cambio ────────────────────────────────────────────────────────────
    { id: 'section-bid-cambio',                            label: 'BID Cambio',     sectionDivider: true },
    { id: '/produto/bid-cambio/visao-geral',               label: 'Visão Geral',    icon: 'chart-pie-slice',          source: 'product' },
    { id: '/produto/bid-cambio/dashboard',                 label: 'Dashboard',      icon: 'chart-bar',                source: 'product' },
    { id: '/produto/bid-cambio/lista',                     label: 'Lista',          icon: 'list-bullets',             source: 'product' },
    { id: '/produto/bid-cambio/kanban',                    label: 'Kanban',         icon: 'kanban',                   source: 'product' },
    { id: '/produto/bid-cambio/cambios',                   label: 'Câmbios',        icon: 'file-text',                source: 'product' },
    { id: '/produto/bid-cambio/cotacoes',                  label: 'Cotações',       icon: 'arrows-left-right',        source: 'product' },
    { id: '/produto/bid-cambio/corretoras',                label: 'Corretoras',     icon: 'buildings',                source: 'product' },

    // ── Serviços ──────────────────────────────────────────────────────────────
    { id: '/workspace/historico-organizacao?id_produto_historico_log=bid-cambio', label: 'Histórico', icon: 'clock-counter-clockwise', source: 'tenant', external: true },
    { id: '/produto/bid-cambio/configuracoes', label: 'Configurações', icon: 'gear-six', source: 'product' },

  ] satisfies NavigationItem[],

  navigationCorretora: [
    { id: 'dashboard',          label: 'Dashboard',          icon: 'chart-pie-slice',          source: 'product' },
    { id: 'cotacoes-pendentes', label: 'Cotações Pendentes', icon: 'clock',                    source: 'product' },
    { id: 'minhas-respostas',   label: 'Minhas Respostas',   icon: 'check-circle',             source: 'product' },
    { id: 'meu-desempenho',    label: 'Meu Desempenho',     icon: 'chart-line-up',            source: 'product' },
    { id: 'configuracoes',     label: 'Configurações',       icon: 'gear-six',                 source: 'product' },
  ] satisfies NavigationItem[],

  features: {
    cotacao_aberta: true,
    rating_global: true,
    monetizacao_corretora: true,
    portal_publico: true,
    gestao_parcelas: true,
    integracao_processo: true,
    alerta_vencimento: true,
    exportacao: true,
  },
} as const
