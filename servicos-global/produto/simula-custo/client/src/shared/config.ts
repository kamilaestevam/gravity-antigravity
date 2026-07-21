/**
 * config.ts — PRODUCT_CONFIG do SimulaCusto
 * Skill: antigravity-criar-produto (Passo 5)
 * Skill: antigravity-simulacusto
 *
 * Fonte de verdade do produto: declara serviços de tenant usados,
 * serviços de produto internos e a navegação lateral.
 * Ícones: nomes Phosphor Icons em kebab-case.
 */

import { rotaSimulaCusto } from './rotas-simula-custo'

export interface NavigationItem {
  id:            string
  label:         string
  icon?:         string
  source?:       'product' | 'tenant'
  sectionDivider?: boolean
  disabled?:     boolean
  badge?:        string
  badgeVariant?: 'accent' | 'muted'
  children?:     NavigationItem[]
  /** Se true, o item abre em nova aba (link externo cross-aplicação) */
  external?:     boolean
}

export const PRODUCT_CONFIG = {
  id: 'simula-custo',
  productId: 'simula-custo',
  name: 'SimulaCusto',
  port: 8020,

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

  productServices: [
    'engine-fiscal',
    'siscomex-connector',
    'ptax-service',
    'docx-generator',
  ] as const,

  navigation: [

    // ── Meu Espaço ──────────────────────────────────────────────────────────
    {
      id: 'meu-espaco', label: 'Meu Espaço', icon: 'user-circle', source: 'tenant' as const,
      children: [
        { id: '/hub', label: 'Minhas Atividades', icon: 'check-circle', source: 'tenant' as const, disabled: true, badge: 'Em Breve', badgeVariant: 'muted' as const },
        { id: '/hub', label: 'Email',             icon: 'envelope',     source: 'tenant' as const, disabled: true, badge: 'Em Breve', badgeVariant: 'muted' as const },
        { id: '/hub', label: 'WhatsApp',          icon: 'chat-circle',  source: 'tenant' as const, disabled: true, badge: 'Em Breve', badgeVariant: 'muted' as const },
      ],
    },

    // ── Serviços ─────────────────────────────────────────────────────────────
    // Insights/Lista/Dashboard/Kanban navegam pelas pills no topo da página
    // (SimulaCustoVisualizacaoTabs) — paridade Bid Frete Internacional.
    { id: '/workspace/historico-organizacao?id_produto_historico_log=simula-custo', label: 'Histórico', icon: 'clock-counter-clockwise', source: 'tenant' as const, external: true },
    { id: rotaSimulaCusto('configuracoes'), label: 'Configurações', icon: 'gear-six',        source: 'product' as const },

  ] satisfies NavigationItem[],

  features: {
    siscomex_integration:  'active',
    ptax_via_taxas_moeda:  true,
    default_icms_mode:     'inside_calc',
    anti_captcha_provider: 'capsolver',
    token_pool_enabled:    true,
  },
} as const
