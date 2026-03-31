/**
 * config.ts — PRODUCT_CONFIG do LPCO
 *
 * Fonte de verdade do produto: declara servicos de tenant usados,
 * servicos de produto internos e a navegacao lateral.
 */

export interface NavigationItem {
  id: string
  label: string
  icon: string
  source: 'product' | 'tenant'
}

export const PRODUCT_CONFIG = {
  id: 'lpco',
  productId: 'lpco',
  name: 'LPCO',
  port: 8027,

  tenantServices: [
    'historico',
    'notificacoes',
    'email',
    'dashboard',
    'api-cockpit',
    'conector-erp',
  ] as const,

  productServices: [
    'status-engine',
    'saldo-engine',
    'portal-unico-adapter',
    'smart-read',
  ] as const,

  navigation: [
    { id: 'lpcos',       label: 'LPCOs',        icon: 'file-check',       source: 'product' },
    { id: 'novo',        label: 'Novo LPCO',     icon: 'plus',             source: 'product' },
    { id: 'simulador',   label: 'Simulador TA',  icon: 'magnifying-glass', source: 'product' },
    { id: 'historico',   label: 'Historico',      icon: 'clock',            source: 'tenant'  },
    { id: 'notificacoes', label: 'Notificacoes', icon: 'bell',             source: 'tenant'  },
  ] satisfies NavigationItem[],

  features: {
    importacao_exportacao: true,
    importacao_planilha: true,
    smart_read: true,
    integracao_portal_unico: true,
    integracao_erp: true,
    controle_saldo_flex: true,
    cancelamento_automatico: true,
    simulador_ta: true,
  },
} as const
