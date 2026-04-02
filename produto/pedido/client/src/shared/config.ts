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
  icon?:         string
  source?:       'product' | 'tenant'
  sectionDivider?: boolean
  disabled?:     boolean
  badge?:        string
  badgeVariant?: 'accent' | 'muted'
  children?:     NavigationItem[]
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
      id: 'meu-espaco', label: 'Meu Espaço', icon: 'user-circle', source: 'tenant',
      children: [
        { id: 'atividades', label: 'Minhas Atividades', icon: 'check-circle', source: 'tenant' },
        { id: 'email',      label: 'Email',             icon: 'envelope',     source: 'tenant' },
        { id: 'whatsapp',   label: 'WhatsApp',          icon: 'whatsapp-logo', source: 'tenant' },
      ],
    },

    // ── Pedidos ──────────────────────────────────────────────────────────────
    { id: 'section-pedidos',   label: 'Pedidos',    sectionDivider: true },
    { id: 'pedidos/dashboard', label: 'Dashboard',  icon: 'chart-pie-slice',         source: 'product', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
    { id: 'pedidos',           label: 'Lista',       icon: 'list-bullets',            source: 'product' },
    { id: 'pedidos/kanban',    label: 'Kanban',       icon: 'kanban',                  source: 'product', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },

    // ── Serviços ──────────────────────────────────────────────────────────────
    { id: 'historico',     label: 'Histórico',     icon: 'clock-counter-clockwise', source: 'tenant'  },
    { id: 'configuracoes', label: 'Configurações', icon: 'gear-six',                source: 'product' },

  ] satisfies NavigationItem[],

  features: {
    importacao_exportacao:  true,
    importacao_arquivo:     true,
    integracao_erp:         true,
    smart_read:             false,
    dashboard_analitico:    false,
  },
} as const
