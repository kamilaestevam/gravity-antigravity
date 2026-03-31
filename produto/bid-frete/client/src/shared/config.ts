/**
 * config.ts — PRODUCT_CONFIG do BID Frete
 * Skill: antigravity-criar-produto (Passo 1 — shared/config.ts)
 *
 * Source of truth para navegação, serviços consumidos e feature flags.
 */

export const PRODUCT_CONFIG = {
  id: 'bid-frete',
  productId: 'bid-frete',
  name: 'BID Frete',
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
  ],

  productServices: [
    'bid-engine',
    'comparativo-engine',
    'rating-engine',
    'savings-engine',
    'connectors',
  ],

  navigation: [
    { id: 'visao-geral',   label: 'Visão Geral',   icon: 'ChartPieSlice', source: 'product' as const },
    { id: 'cotacoes',      label: 'Cotações',       icon: 'FileText',      source: 'product' as const },
    { id: 'fornecedores',  label: 'Fornecedores',   icon: 'Buildings',     source: 'product' as const },
    { id: 'configuracoes', label: 'Configurações',  icon: 'GearSix',       source: 'product' as const },
    { id: 'atividades',    label: 'Atividades',     icon: 'BookOpen',      source: 'tenant' as const },
    { id: 'historico',     label: 'Histórico',      icon: 'ClockCounterClockwise', source: 'tenant' as const },
  ],

  features: {
    cotacao_aberta: true,
    rating_global: true,
    monetizacao: false,
    portal_publico: true,
    importacao_bloco: true,
    mapa_rotas: true,
    conectores_erp: false,
  },
}
