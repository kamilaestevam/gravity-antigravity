import { jsx as _jsx } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { House, ChartBar, Envelope, ChatCircle, Bell, FileText, BookOpen, Plugs, Star, Gear, Package, Calculator, Anchor, FileArchive, } from '@phosphor-icons/react';
import { useShellStore } from './store';
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global';
import { useProductMenu } from './hooks/useProductMenu';

/** Ícones por slug de produto */
const PRODUCT_ICONS = {
    'simula-custo': _jsx(Calculator, { weight: "duotone", size: 18 }),
    'pedidos-de-compra': _jsx(Package, { weight: "duotone", size: 18 }),
    'exportador-duimp': _jsx(FileArchive, { weight: "duotone", size: 18 }),
    'tracking-de-carga': _jsx(Anchor, { weight: "duotone", size: 18 }),
    'smart-read': _jsx(FileText, { weight: "duotone", size: 18 }),
    'bid-frete-internacional': _jsx(Anchor, { weight: "duotone", size: 18 }),
    'bid-cambio': _jsx(ChartBar, { weight: "duotone", size: 18 }),
};

/**
 * Sidebar — menu lateral modernizado usando MenuLateralGlobal do núcleo.
 */
export function Sidebar({ navItems: customNavItems, moduleName = 'SimulaCusto', moduleColor = '#818cf8', tenantName, tenantPlan }) {
    const { sidebarOpen, toggleSidebar } = useShellStore();
    const { t } = useTranslation();
    const { products } = useProductMenu();

    /** Monta children do grupo "Produtos Gravity" dinamicamente */
    function buildProductChildren() {
        return products.map((p) => {
            const icon = PRODUCT_ICONS[p.slug] || _jsx(Package, { weight: "duotone", size: 18 });
            switch (p.status) {
                case 'active':
                    return { to: `/produto/${p.slug}`, label: p.name, icon };
                case 'contract':
                    return { to: '/store', label: p.name, icon, badge: 'Contratar', badgeVariant: 'accent' };
                case 'coming_soon':
                    return { to: undefined, label: p.name, icon, disabled: true, badge: 'Em Breve', badgeVariant: 'muted' };
            }
        });
    }

    const defaultNavItems = [
        // ── Meu Espaço (primeiro) ──────────────────────────────────────────
        {
            label: 'Meu Espaço',
            icon: _jsx(House, { weight: "duotone", size: 20 }),
            children: [
                { to: '/meu-espaco', label: t('shell.menu.dashboard', 'Dashboard'), icon: _jsx(House, { weight: "duotone", size: 18 }) },
                { to: '/meu-espaco/atividades', label: t('shell.menu.atividades', 'Minhas Atividades'), icon: _jsx(BookOpen, { weight: "duotone", size: 18 }) },
                { to: '/meu-espaco/email', label: t('shell.menu.email', 'E-mails'), icon: _jsx(Envelope, { weight: "duotone", size: 18 }) },
                { to: '/meu-espaco/whatsapp', label: t('shell.menu.whatsapp', 'WhatsApp'), icon: _jsx(ChatCircle, { weight: "duotone", size: 18 }) },
            ]
        },
        // ── Produtos Gravity (abaixo de Meu Espaço) ───────────────────────
        {
            label: 'Produtos Gravity',
            icon: _jsx(Star, { weight: "duotone", size: 20 }),
            children: buildProductChildren(),
        },
        // ── Geral ──────────────────────────────────────────────────────────
        { to: '/notificacoes', label: t('shell.menu.notificacoes', 'Notificações'), icon: _jsx(Bell, { weight: "duotone", size: 20 }) },
        { to: '/historico', label: t('shell.menu.historico', 'Histórico'), icon: _jsx(FileText, { weight: "duotone", size: 20 }) },
        { to: '/conector-erp', label: t('shell.menu.conector_erp', 'Conector ERP'), icon: _jsx(Plugs, { weight: "duotone", size: 20 }) },
        { to: '/configurador', label: t('shell.menu.configuracoes', 'Configurações'), icon: _jsx(Gear, { weight: "duotone", size: 20 }) },
    ];

    // Grupo "Produtos Gravity" — sempre presente, injetado automaticamente
    const productGroup = {
        label: 'Produtos Gravity',
        icon: _jsx(Star, { weight: "duotone", size: 20 }),
        children: buildProductChildren(),
    };

    // Se o produto proveu navItems customizados, injeta "Produtos Gravity" logo após "Meu Espaço"
    let navItems;
    if (customNavItems) {
        const meuEspacoIdx = customNavItems.findIndex(item => item.label === 'Meu Espaço');
        const insertAt = meuEspacoIdx >= 0 ? meuEspacoIdx + 1 : 0;
        navItems = [
            ...customNavItems.slice(0, insertAt),
            productGroup,
            ...customNavItems.slice(insertAt),
        ];
    } else {
        navItems = defaultNavItems;
    }

    return (_jsx(MenuLateralGlobal, { tenantName: tenantName, tenantPlan: tenantPlan, navItems: navItems, moduleName: moduleName, moduleColor: moduleColor, isCollapsed: !sidebarOpen, onToggleCollapse: toggleSidebar }));
}
