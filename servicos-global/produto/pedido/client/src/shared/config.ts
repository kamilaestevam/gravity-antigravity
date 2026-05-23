/**
 * config.ts — PRODUCT_CONFIG do Pedido
 *
 * Fonte de verdade do produto: declara servicos de tenant usados,
 * servicos de produto internos e a navegacao lateral.
 * Icones referem-se a nomes Phosphor Icons (kebab-case para o registry, PascalCase no React).
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
  id: 'pedido',
  productId: 'pedido',
  name: 'Pedido',

  tenantServices: [
    'atividades',
    'historico',
    'notificacoes',
    'api-cockpit',
    'conector-erp',
  ] as const,

  productServices: [
    'saldo-engine',
    'import-engine',
  ] as const,

  navigation: [

    // ── Meu Espaço ───────────────────────────────────────────────────────────
    {
      id: 'meu-espaco', label: 'Meu Espaço', labelKey: 'pedido.nav.meu_espaco', icon: 'user-circle', source: 'tenant',
      children: [
        { id: '/core/atividades', label: 'Minhas Atividades', labelKey: 'pedido.nav.minhas_atividades', icon: 'check-circle',  source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
        { id: '/core/email',      label: 'Email',             labelKey: 'pedido.nav.email',             icon: 'envelope',      source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
        { id: '/core/whatsapp',   label: 'WhatsApp',          labelKey: 'pedido.nav.whatsapp',          icon: 'whatsapp-logo', source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
      ],
    },

    // ── Pedidos ──────────────────────────────────────────────────────────────
    { id: 'section-pedidos',                    label: 'Pedidos',    labelKey: 'pedido.nav.pedidos',       sectionDivider: true },
    { id: '/pedido/pedidos/visao-geral', label: 'Visão Geral', labelKey: 'pedido.nav.visao_geral', icon: 'chart-pie-slice', source: 'product' },
    { id: '/pedido/pedidos/dashboard',  label: 'Dashboard',  labelKey: 'pedido.nav.dashboard',     icon: 'chart-bar',               source: 'product' },
    { id: '/pedido/pedidos/lista',      label: 'Lista',      labelKey: 'pedido.nav.lista',         icon: 'list-bullets',            source: 'product' },
    { id: '/pedido/pedidos/kanban',     label: 'Kanban',     labelKey: 'pedido.nav.kanban',        icon: 'kanban',                  source: 'product' },

    // ── Servicos ──────────────────────────────────────────────────────────────
    // Historico: link externo para a tela centralizada do Configurador (SSOT da UI de auditoria).
    // O filtro id_produto_historico_log=pedido pre-aplica o escopo do produto na tela.
    { id: '/workspace/historico-organizacao?id_produto_historico_log=pedido', label: 'Historico', labelKey: 'pedido.nav.historico', icon: 'clock-counter-clockwise', source: 'tenant', external: true },
    { id: '/pedido/configuracoes', label: 'Configurações', labelKey: 'pedido.nav.configuracoes', icon: 'gear-six',                source: 'product' },

  ] satisfies NavigationItem[],

  features: {
    importacao_exportacao:  true,
    importacao_arquivo:     true,
    integracao_erp:         true,
    smart_read:             false,
    dashboard_analitico:    true,
  },
} as const
