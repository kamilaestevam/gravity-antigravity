/**
 * config.ts — PRODUCT_CONFIG do Smart Read
 *
 * Fonte de verdade do produto: declara serviços de tenant usados
 * e a navegação lateral. Ícones referem-se a nomes Phosphor Icons
 * (kebab-case para o registry, PascalCase no React).
 */

export interface NavigationItem {
  id:            string
  label:         string
  labelKey?:     string
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
  id: 'smart-read',
  productId: 'smart-read',
  name: 'Smart Read',
  port: 8033,
  color: '#a78bfa',

  tenantServices: ['historico', 'notificacoes'] as const,

  navigation: [

    // ── Meu Espaço ───────────────────────────────────────────────────────────
    {
      id: 'meu-espaco', label: 'Meu Espaço', icon: 'user-circle', source: 'tenant',
      children: [
        { id: '/hub', label: 'Minhas Atividades', icon: 'check-circle',  source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
        { id: '/hub', label: 'Email',             icon: 'envelope',      source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
        { id: '/hub', label: 'WhatsApp',          icon: 'whatsapp-logo', source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
      ],
    },

    // ── Smart Read ──────────────────────────────────────────────────────────
    { id: 'section-smart-read',  label: 'Smart Read', sectionDivider: true },
    { id: '/smart-read/lista',   label: 'Lista',      icon: 'list-bullets', source: 'product' },

    // ── Serviços ──────────────────────────────────────────────────────────────
    // Histórico: link externo para a tela centralizada do Configurador (SSOT da UI de auditoria).
    // O filtro id_produto_historico_log=smart-read pré-aplica o escopo do produto na tela.
    { id: '/workspace/historico-organizacao?id_produto_historico_log=smart-read', label: 'Histórico', icon: 'clock-counter-clockwise', source: 'tenant', external: true },
    { id: '/smart-read/configuracoes', label: 'Configurações', icon: 'gear-six', source: 'product' },

  ] satisfies NavigationItem[],
} as const
