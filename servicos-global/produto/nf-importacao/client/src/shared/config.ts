export interface NavigationItem {
  id: string
  label: string
  icon: string
  source: 'product' | 'tenant'
}

export const PRODUCT_CONFIG = {
  id: 'nf-importacao',
  productId: 'nf-importacao',
  name: 'NF Importacao',
  port: 8028,

  tenantServices: [
    'historico',
    'notificacoes',
    'email',
    'dashboard',
    'api-cockpit',
    'conector-erp',
  ] as const,

  productServices: [
    'rateio-engine',
    'export-engine',
    'status-engine',
    'smart-read',
  ] as const,

  navigation: [
    { id: 'lista',          label: 'Notas Fiscais',     icon: 'file-text',          source: 'product' },
    { id: 'nova',           label: 'Nova NF',           icon: 'plus',               source: 'product' },
    { id: 'config-despesas', label: 'Catalogo Despesas', icon: 'package',            source: 'product' },
    { id: 'config-templates', label: 'Templates',        icon: 'copy',              source: 'product' },
    { id: 'config-layouts',  label: 'Layouts Export',    icon: 'layout',            source: 'product' },
    { id: 'config-favoritos', label: 'Favoritos Fiscais', icon: 'star',             source: 'product' },
    { id: 'historico',      label: 'Historico',          icon: 'clock',              source: 'tenant'  },
    { id: 'notificacoes',   label: 'Notificacoes',      icon: 'bell',               source: 'tenant'  },
  ] satisfies NavigationItem[],

  features: {
    rateio_multi_metodo: true,
    export_multi_formato: true,
    smart_read_duimp: true,
    smart_read_recibos: true,
    catalogo_despesas: true,
    templates_despesas: true,
    construtor_layout: true,
    favoritos_fiscais: true,
    integracao_processo: true,
    integracao_erp: true,
    ids_corporativos: true,
  },
} as const
