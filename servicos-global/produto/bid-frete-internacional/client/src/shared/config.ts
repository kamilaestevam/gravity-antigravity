import { ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL, rotaBidFreteInternacional } from './rotas-bid-frete-internacional'

/**
 * config.ts — PRODUCT_CONFIG do BID Frete Internacional
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
  /** Se true, o item abre em nova aba (link externo cross-aplicação) */
  external?:     boolean
}

export const PRODUCT_CONFIG = {
  id: 'bid-frete-internacional',
  productId: 'bid-frete-internacional',
  name: 'Bid Frete Internacional',
  port: 8023,

  tenantServices: [
    'atividades',
    'dashboard',
    'relatorios',
    'historico',
    'notificacoes',
    'gabi',
    'email',
    'whatsapp',
    'agendamento',
    'api-cockpit',
  ] as const,

  productServices: [
    'bid-engine',
    'comparativo-engine',
    'rating-engine',
    'savings-engine',
    'connectors',
  ] as const,

  navigation: [

    // ── Meu Espaço ───────────────────────────────────────────────────────────
    {
      id: 'meu-espaco', label: 'Meu Espaço', icon: 'user-circle', source: 'tenant',
      children: [
        { id: '/core/atividades', label: 'Minhas Atividades', icon: 'check-circle',  source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
        { id: '/core/email',      label: 'Email',             icon: 'envelope',      source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
        { id: '/core/whatsapp',   label: 'WhatsApp',          icon: 'whatsapp-logo', source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
      ],
    },

    // ── BID Frete Internacional ─────────────────────────────────────────────────
    { id: 'section-bid-frete',                          label: 'Bid Frete Internacional', sectionDivider: true },
    { id: rotaBidFreteInternacional('visao-geral'),    label: 'Visão Geral',    icon: 'chart-pie-slice', source: 'product' },
    { id: rotaBidFreteInternacional('dashboard'),      label: 'Dashboard',      icon: 'chart-bar',       source: 'product' },
    { id: rotaBidFreteInternacional('lista'),          label: 'Lista',          icon: 'list-bullets',    source: 'product' },
    { id: rotaBidFreteInternacional('kanban'),         label: 'Kanban',         icon: 'kanban',          source: 'product' },
    { id: rotaBidFreteInternacional('fornecedores'),   label: 'Fornecedores',   icon: 'buildings',       source: 'product' },

    // ── Serviços ──────────────────────────────────────────────────────────────
    { id: '/workspace/historico-organizacao?id_produto_historico_log=bid-frete', label: 'Histórico', icon: 'clock-counter-clockwise', source: 'tenant', external: true },
    { id: rotaBidFreteInternacional('configuracoes'), label: 'Configurações', icon: 'gear-six', source: 'product' },

  ] satisfies NavigationItem[],

  features: {
    cotacao_aberta: true,
    nota_global_classificacao_bid_frete_internacional: true,
    monetizacao: false,
    visao_fornecedor_bid_frete_internacional_publico: true,
    importacao_bloco: true,
    mapa_rotas: true,
    conectores_erp: false,
  },

  navigation_visao_fornecedor_bid_frete_internacional: [
    { id: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.dashboard, labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.dashboard', label: 'Visão geral', icon: 'chart-pie-slice', source: 'product' },
    { id: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.paineisDashboard, labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.paineis_dashboard', label: 'Dashboard', icon: 'chart-bar', source: 'product' },
    { id: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.lista, labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.lista', label: 'Lista', icon: 'list-bullets', source: 'product' },
    { id: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.kanban, labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.kanban', label: 'Kanban', icon: 'kanban', source: 'product' },
    { id: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.cotacoesPendentes, labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.cotacoes_pendentes', label: 'Cotações pendentes', icon: 'envelope', source: 'product' },
    { id: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.propostas, labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.propostas', label: 'Minhas propostas', icon: 'paper-plane-tilt', source: 'product' },
    { id: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.tabelasValor, labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.tabelas_valor', label: 'Tabelas de valor', icon: 'currency-dollar', source: 'product' },
    { id: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.desempenho, labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.desempenho', label: 'Meu desempenho', icon: 'chart-bar', source: 'product' },
    { id: ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.configuracoes, labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.nav.configuracoes', label: 'Configurações', icon: 'gear-six', source: 'product' },
  ] satisfies NavigationItem[],
} as const
