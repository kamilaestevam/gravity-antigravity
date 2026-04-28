/**
 * config.ts — PRODUCT_CONFIG do Processo
 *
 * Fonte de verdade do produto: declara serviços de tenant usados,
 * serviços de produto internos e a navegação lateral.
 * Ícones referem-se a nomes Phosphor Icons (kebab-case para o registry, PascalCase no React).
 */

export interface NavigationItem {
  id: string
  label: string
  icon: string
  source: 'product' | 'tenant'
}

export const PRODUCT_CONFIG = {
  id: 'processo',
  productId: 'processo',
  name: 'Processo',
  port: 8025,

  // Serviços de tenant consumidos via proxy (residem em tenant-db)
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

  // Serviços de produto (rodam dentro deste servidor, dados em processo-db)
  productServices: [
    'workflow-engine',
    'follow-up-tracker',
    'documento-manager',
    'custo-estimator',
  ] as const,

  // Navegação: telas do produto + serviços de tenant
  navigation: [
    // Telas exclusivas do produto
    { id: 'workflow',        label: 'Workflow',           icon: 'flow-arrow',        source: 'product' },
    { id: 'pedidos',         label: 'Pedidos',            icon: 'package',           source: 'product' },
    { id: 'li',              label: 'LI',                 icon: 'file-text',         source: 'product' },
    { id: 'di',              label: 'DI',                 icon: 'file-dashed',       source: 'product' },
    { id: 'duimp',           label: 'DUIMP',              icon: 'cloud-arrow-up',    source: 'product' },
    { id: 'retificacao',     label: 'Retificação',        icon: 'pencil-line',       source: 'product' },
    { id: 'financeiro',      label: 'Financeiro',         icon: 'currency-dollar',   source: 'product' },
    { id: 'containers',      label: 'Containers',         icon: 'cube',             source: 'product' },
    { id: 'dados-tecnicos',  label: 'Dados Técnicos',     icon: 'gear-six',          source: 'product' },
    { id: 'dados-processo',  label: 'Dados do Processo',  icon: 'clipboard-text',    source: 'product' },
    { id: 'taxas',           label: 'Taxas',              icon: 'receipt',           source: 'product' },
    // Serviços de tenant acessados via shell
    { id: 'email',           label: 'Email',              icon: 'envelope',          source: 'tenant'  },
    { id: 'todo',            label: 'To Do',              icon: 'check-square',      source: 'tenant'  },
  ] satisfies NavigationItem[],

  features: {
    workflow_automation: 'active',
    followup_tracking: true,
    documento_upload: true,
    custo_estimativa: true,
    email_integration: true,
  }
} as const
