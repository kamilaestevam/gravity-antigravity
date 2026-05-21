/**
 * config.ts — PRODUCT_CONFIG do BID Frete
 *
 * Fonte de verdade do produto: declara servicos de tenant usados,
 * servicos de produto internos e a navegação lateral.
 * Ícones referem-se a nomes Phosphor Icons (kebab-case para o registry).
 */
export const PRODUCT_CONFIG = {
    id: 'bid-frete',
    productId: 'bid-frete',
    name: 'BID Frete',
    port: 8023,
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
        'api-cockpit',
    ],
    productServices: [
        'bid-engine',
        'comparativo-engine',
        'rating-engine',
        'savings-engine',
        'connectors',
    ],
    navigation: [
        // ── Meu Espaço ───────────────────────────────────────────────────────────
        {
            id: 'meu-espaco', label: 'Meu Espaço', icon: 'user-circle', source: 'tenant',
            children: [
                { id: '/core/atividades', label: 'Minhas Atividades', icon: 'check-circle', source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
                { id: '/core/email', label: 'Email', icon: 'envelope', source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
                { id: '/core/whatsapp', label: 'WhatsApp', icon: 'whatsapp-logo', source: 'tenant', disabled: true, badge: 'Em Breve', badgeVariant: 'muted' },
            ],
        },
        // ── BID Frete ─────────────────────────────────────────────────────────────
        { id: 'section-bid-frete', label: 'BID Frete', sectionDivider: true },
        { id: '/produto/bid-frete/visao-geral', label: 'Visão Geral', icon: 'chart-pie-slice', source: 'product' },
        { id: '/produto/bid-frete/dashboard', label: 'Dashboard', icon: 'chart-bar', source: 'product' },
        { id: '/produto/bid-frete/cotacoes?visao=lista', label: 'Lista', icon: 'list-bullets', source: 'product' },
        { id: '/produto/bid-frete/cotacoes?visao=kanban', label: 'Kanban', icon: 'kanban', source: 'product' },
        { id: '/produto/bid-frete/fornecedores', label: 'Fornecedores', icon: 'buildings', source: 'product' },
        // ── Serviços ──────────────────────────────────────────────────────────────
        { id: '/workspace/historico-organizacao?id_produto_historico_log=bid-frete', label: 'Histórico', icon: 'clock-counter-clockwise', source: 'tenant', external: true },
        { id: '/produto/bid-frete/configuracoes', label: 'Configurações', icon: 'gear-six', source: 'product' },
    ],
    features: {
        cotacao_aberta: true,
        rating_global: true,
        monetizacao: false,
        portal_publico: true,
        importacao_bloco: true,
        mapa_rotas: true,
        conectores_erp: false,
    },
};
//# sourceMappingURL=config.js.map