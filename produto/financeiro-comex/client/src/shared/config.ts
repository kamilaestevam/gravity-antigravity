export interface NavigationItem {
  id: string
  label: string
  icon: string
  source: 'product' | 'tenant'
}

export const PRODUCT_CONFIG = {
  id: 'financeiro-comex',
  productId: 'financeiro-comex',
  name: 'Financeiro Comex',
  port: 8029,
  color: '#22c55e',

  tenantServices: [
    'historico',
    'notificacoes',
    'email',
    'dashboard',
    'conector-erp',
  ] as const,

  navigation: [
    { id: 'movimentacao',  label: 'Movimentacao',  icon: 'list',       source: 'product' },
    { id: 'numerario',     label: 'Numerario',      icon: 'wallet',     source: 'product' },
    { id: 'rateio',        label: 'Rateio',         icon: 'git-branch', source: 'product' },
    { id: 'categorias',    label: 'Categorias',     icon: 'tag',        source: 'product' },
    { id: 'condicoes',     label: 'Condicoes',      icon: 'file-text',  source: 'product' },
  ] satisfies NavigationItem[],
} as const
