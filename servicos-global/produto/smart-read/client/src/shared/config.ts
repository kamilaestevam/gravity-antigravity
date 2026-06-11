export interface NavigationItem {
  id: string
  label: string
  icon: string
  source: 'product' | 'tenant'
}

export const PRODUCT_CONFIG = {
  id: 'smart-read',
  productId: 'smart-read',
  name: 'Smart Read',
  port: 8033,
  color: '#a78bfa',

  tenantServices: ['historico', 'notificacoes'] as const,

  navigation: [
    { id: 'leituras', label: 'Leituras', icon: 'file-text', source: 'product' },
  ] satisfies NavigationItem[],
} as const
