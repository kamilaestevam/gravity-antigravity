/**
 * config.ts — PRODUCT_CONFIG do SimulaCusto
 * Skill: antigravity-criar-produto (Passo 5)
 * Skill: antigravity-simulacusto
 *
 * Fonte de verdade do produto: declara serviços de tenant usados,
 * serviços de produto internos e a navegação lateral.
 * Ícones: nomes Phosphor Icons em kebab-case.
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
  id: 'simula-custo',
  productId: 'simula-custo',
  name: 'SimulaCusto',
  port: 8020,

  tenantServices: [
    'atividades',
    'dashboard',
    'relatorios',
    'historico',
    'notificacoes',
    'gabi',
    'email',
    'whatsapp',
    'api-cockpit',
  ] as const,

  productServices: [
    'engine-fiscal',
    'siscomex-connector',
    'ptax-service',
    'docx-generator',
  ] as const,

  navigation: [

    // ── Meu Espaço ──────────────────────────────────────────────────────────
    {
      id: 'meu-espaco', label: 'Meu Espaço', icon: 'user-circle', source: 'tenant' as const,
      children: [
        { id: 'meu-espaco/atividades', label: 'Minhas Atividades', icon: 'check-circle',  source: 'tenant'  as const },
        { id: 'meu-espaco/email',      label: 'Email',             icon: 'envelope',       source: 'tenant'  as const },
        { id: 'meu-espaco/whatsapp',   label: 'WhatsApp',          icon: 'chat-circle',    source: 'tenant'  as const },
      ],
    },

    // ── Estimativas ─────────────────────────────────────────────────────────
    { id: 'section-estimativas', label: 'Estimativas', sectionDivider: true },
    { id: 'dashboard',     label: 'Dashboard',    icon: 'chart-pie-slice', source: 'product' as const },
    { id: 'estimativas',   label: 'Lista',         icon: 'list-bullets',   source: 'product' as const },
    { id: 'kanban',        label: 'Kanban',         icon: 'kanban',         source: 'product' as const, disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },

    // ── Serviços ─────────────────────────────────────────────────────────────
    { id: 'relatorios',    label: 'Relatórios',    icon: 'file-text',      source: 'product' as const },
    { id: 'historico',     label: 'Histórico',     icon: 'clock-counter-clockwise', source: 'tenant'  as const },
    { id: 'configuracoes', label: 'Configurações', icon: 'gear-six',       source: 'product' as const },

  ] satisfies NavigationItem[],

  features: {
    siscomex_integration:  'active',
    bacen_auto_update:     true,
    default_icms_mode:     'inside_calc',
    anti_captcha_provider: 'capsolver',
    token_pool_enabled:    true,
  },
} as const
