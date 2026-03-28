/**
 * config.ts — PRODUCT_CONFIG do SimulaCusto
 * Skill: antigravity-criar-produto (Passo 5)
 * Skill: antigravity-simulacusto
 *
 * Fonte de verdade do produto: declara serviços de tenant usados,
 * serviços de produto internos e a navegação lateral.
 */

export interface NavigationItem {
  id: string
  label: string
  icon: string
  source: 'product' | 'tenant'
}

export const PRODUCT_CONFIG = {
  id: 'simula-custo',
  productId: 'simula-custo',         // ID canônico para permissões no Configurador
  name: 'SimulaCusto',
  port: 8020,

  // Serviços de tenant consumidos via proxy (residem em tenant-db)
  tenantServices: [
    'atividades',
    'dashboard',
    'relatorios',
    'historico',
    'notificacoes',
    'gabi',
  ] as const,

  // Serviços de produto (rodam dentro deste servidor, dados em simulacusto-db)
  productServices: [
    'engine-fiscal',
    'siscomex-connector',
    'ptax-service',
    'docx-generator',
  ] as const,

  // Navegação: telas do produto + serviços de tenant
  navigation: [
    // Telas exclusivas do produto
    { id: 'estimativas',   label: 'Estimativas',       icon: 'calculator',     source: 'product' },
    { id: 'importar',      label: 'Importar em Massa', icon: 'upload',         source: 'product' },
    // Serviços de tenant acessados via shell
    { id: 'atividades',   label: 'Atividades',         icon: 'check-circle',   source: 'tenant'  },
    { id: 'dashboard',    label: 'Dashboard',          icon: 'bar-chart',      source: 'tenant'  },
    { id: 'relatorios',   label: 'Relatórios',         icon: 'file-text',      source: 'tenant'  },
    { id: 'historico',    label: 'Histórico',          icon: 'clock',          source: 'tenant'  },
    { id: 'gabi',         label: 'Gabi IA',            icon: 'sparkle',        source: 'tenant'  },
  ] satisfies NavigationItem[],

  features: {
    siscomex_integration: 'active',
    bacen_auto_update: true,
    default_icms_mode: 'inside_calc',
    anti_captcha_provider: 'capsolver',
    token_pool_enabled: true,
  }
} as const
