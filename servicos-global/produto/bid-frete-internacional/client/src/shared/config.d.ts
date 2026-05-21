/**
 * config.ts — PRODUCT_CONFIG do BID Frete
 *
 * Fonte de verdade do produto: declara servicos de tenant usados,
 * servicos de produto internos e a navegação lateral.
 * Ícones referem-se a nomes Phosphor Icons (kebab-case para o registry).
 */
export interface NavigationItem {
    id: string;
    label: string;
    labelKey?: string;
    icon?: string;
    source?: 'product' | 'tenant';
    sectionDivider?: boolean;
    disabled?: boolean;
    badge?: string;
    badgeVariant?: 'accent' | 'muted';
    children?: NavigationItem[];
    /** Se true, o item abre em nova aba (link externo cross-aplicação) */
    external?: boolean;
}
export declare const PRODUCT_CONFIG: {
    readonly id: "bid-frete-internacional";
    readonly productId: "bid-frete-internacional";
    readonly name: "BID Frete";
    readonly port: 8023;
    readonly tenantServices: readonly ["atividades", "dashboard", "relatorios", "historico", "notificacoes", "gabi", "email", "whatsapp", "agendamento", "api-cockpit"];
    readonly productServices: readonly ["bid-engine", "comparativo-engine", "rating-engine", "savings-engine", "connectors"];
    readonly navigation: ({
        id: string;
        label: string;
        icon: string;
        source: "tenant";
        children: {
            id: string;
            label: string;
            icon: string;
            source: "tenant";
            disabled: true;
            badge: string;
            badgeVariant: "muted";
        }[];
        sectionDivider?: undefined;
        external?: undefined;
    } | {
        id: string;
        label: string;
        sectionDivider: true;
        icon?: undefined;
        source?: undefined;
        children?: undefined;
        external?: undefined;
    } | {
        id: string;
        label: string;
        icon: string;
        source: "product";
        children?: undefined;
        sectionDivider?: undefined;
        external?: undefined;
    } | {
        id: string;
        label: string;
        icon: string;
        source: "tenant";
        external: true;
        children?: undefined;
        sectionDivider?: undefined;
    })[];
    readonly features: {
        readonly cotacao_aberta: true;
        readonly nota_global_classificacao_bid_frete_internacional: true;
        readonly monetizacao: false;
        readonly portal_publico: true;
        readonly importacao_bloco: true;
        readonly mapa_rotas: true;
        readonly conectores_erp: false;
    };
};
//# sourceMappingURL=config.d.ts.map