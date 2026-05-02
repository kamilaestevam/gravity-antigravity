/**
 * config.ts — PRODUCT_CONFIG do BID Cambio
 * Skill: antigravity-criar-produto (Passo 1 — shared/config.ts)
 *
 * Source of truth para navegacao, servicos consumidos e feature flags.
 */

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
  ],

  productServices: [
    'bid-engine',
    'comparativo-engine',
    'rating-engine',
    'parcela-engine',
    'savings-engine',
    'vencimento-engine',
    'email-engine',
  ],

  navigation: [
    { id: 'visao-geral',   label: 'Visao Geral',   icon: 'LayoutDashboard',       source: 'product' as const },
    { id: 'cambios',       label: 'Cambios',        icon: 'FileText',              source: 'product' as const },
    { id: 'cotacoes',      label: 'Cotacoes',       icon: 'ArrowLeftRight',        source: 'product' as const },
    { id: 'corretoras',    label: 'Corretoras',     icon: 'Building2',             source: 'product' as const },
    { id: 'configuracoes', label: 'Configuracoes',  icon: 'Settings',              source: 'product' as const },
    { id: 'atividades',    label: 'Atividades',     icon: 'BookOpen',              source: 'tenant' as const },
    { id: 'historico',     label: 'Historico',       icon: 'ClockCounterClockwise', source: 'tenant' as const },
  ],

  navigationCorretora: [
    { id: 'dashboard',         label: 'Dashboard',          icon: 'LayoutDashboard', source: 'product' as const },
    { id: 'cotacoes-pendentes', label: 'Cotacoes Pendentes', icon: 'Clock',           source: 'product' as const },
    { id: 'minhas-respostas',  label: 'Minhas Respostas',   icon: 'CheckCircle',     source: 'product' as const },
    { id: 'meu-desempenho',   label: 'Meu Desempenho',     icon: 'TrendingUp',      source: 'product' as const },
    { id: 'configuracoes',    label: 'Configuracoes',       icon: 'Settings',        source: 'product' as const },
  ],

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
}
