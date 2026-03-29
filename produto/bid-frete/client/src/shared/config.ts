/**
 * config.ts — PRODUCT_CONFIG do BID Frete Internacional
 * Skill: antigravity-criar-produto (Passo 5)
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
  id: 'bid-frete',
  productId: 'bid-frete',
  name: 'BID Frete Internacional',
  port: 8023,

  // Servicos de tenant consumidos via proxy (residem em tenant-db)
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
  ] as const,

  // Servicos de produto (rodam dentro deste servidor, dados em bid-frete-db)
  productServices: [
    'bid-engine',
    'comparativo-engine',
    'rating-engine',
    'savings-engine',
    'connector-armadores',
    'connector-cias-aereas',
    'connector-agentes',
    'connector-erp',
  ] as const,

  // Navegacao: telas do produto + servicos de tenant
  navigation: [
    // Telas exclusivas do produto — BID Frete
    { id: 'dashboard-bid',   label: 'Visao Geral',         icon: 'chart-bar',       source: 'product' },
    { id: 'cotacoes',        label: 'Cotacoes',             icon: 'file-text',       source: 'product' },
    { id: 'nova-cotacao',    label: 'Nova Cotacao',         icon: 'plus-circle',     source: 'product' },
    { id: 'importar-bloco',  label: 'Importar em Bloco',   icon: 'upload',          source: 'product' },
    { id: 'comparativo',     label: 'Comparativo',          icon: 'scales',          source: 'product' },
    { id: 'fornecedores',    label: 'Fornecedores',         icon: 'users',           source: 'product' },
    { id: 'configuracoes',   label: 'Configuracoes',        icon: 'gear',            source: 'product' },
    // Servicos de tenant acessados via shell
    { id: 'atividades',      label: 'Minhas Atividades',    icon: 'check-circle',    source: 'tenant' },
    { id: 'dashboard',       label: 'Dashboard',            icon: 'bar-chart',       source: 'tenant' },
    { id: 'relatorios',      label: 'Relatorios',           icon: 'file-text',       source: 'tenant' },
    { id: 'historico',        label: 'Historico',            icon: 'clock',           source: 'tenant' },
    { id: 'gabi',             label: 'Gabi IA',             icon: 'sparkle',         source: 'tenant' },
  ] satisfies NavigationItem[],

  // Navegacao do Portal do Fornecedor
  portalNavigation: [
    { id: 'portal-dashboard',     label: 'Meu Dashboard',        icon: 'chart-bar',    source: 'product' },
    { id: 'cotacoes-pendentes',   label: 'Cotacoes Pendentes',   icon: 'clock',        source: 'product' },
    { id: 'minhas-respostas',     label: 'Minhas Respostas',     icon: 'check-circle', source: 'product' },
    { id: 'tabela-precos',        label: 'Tabela de Precos',     icon: 'list',         source: 'product' },
    { id: 'meu-desempenho',       label: 'Meu Desempenho',       icon: 'star',         source: 'product' },
  ] satisfies NavigationItem[],

  features: {
    cotacao_aberta: true,          // permite cotacao aberta para qualquer fornecedor
    cotacao_automatica: true,      // cotacao via tabela padrao do fornecedor
    anonimato_empresa: true,       // cliente pode ocultar nome da empresa
    rating_global: true,           // reputacao global cross-tenant
    connectors_api: true,          // integracao com APIs de armadores/agentes
    connector_erp: true,           // integracao com SAP/ERP
    disparo_email: true,           // disparo de BID via email
    disparo_whatsapp: true,        // disparo de BID via whatsapp
    gabi_analise: true,            // Gabi AI para analise de propostas
    monetizacao_fornecedor: true,  // cobranca por frete fechado (USD 5.00)
  }
} as const
