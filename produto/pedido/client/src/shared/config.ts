/**
 * config.ts — PRODUCT_CONFIG do Pedido
 *
 * Fonte de verdade do produto: declara servicos de tenant usados,
 * servicos de produto internos e a navegacao lateral.
 * Icones referem-se a nomes Phosphor Icons (kebab-case para o registry, PascalCase no React).
 */

export interface NavigationItem {
  id: string
  label: string
  icon: string
  source: 'product' | 'tenant'
}

export const PRODUCT_CONFIG = {
  id: 'pedido',
  productId: 'pedido',
  name: 'Pedido',

  // Servicos de tenant consumidos via proxy (residem em tenant-db)
  tenantServices: [
    'atividades',
    'historico',
    'notificacoes',
    'api-cockpit',
    'conector-erp',
  ] as const,

  // Servicos de produto (logica interna — rotas em processos-core)
  productServices: [
    'saldo-engine',
    'import-engine',
  ] as const,

  // Navegacao: telas do produto + servicos de tenant
  navigation: [
    { id: 'pedidos',    label: 'Pedidos',    icon: 'package',        source: 'product' },
    { id: 'importar',   label: 'Importar',   icon: 'upload-simple',  source: 'product' },
    { id: 'historico',  label: 'Historico',   icon: 'clock',          source: 'tenant'  },
  ] satisfies NavigationItem[],

  features: {
    importacao_exportacao: true,
    importacao_arquivo: true,
    integracao_erp: true,
    smart_read: false,
    dashboard_analitico: false,
  },
} as const
