import { jsx as _jsx } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { House, Envelope, ChatCircle, Bell, FileText, BookOpen, Plugs, Star, Gear, Package, Calculator, Anchor, FileArchive, } from '@phosphor-icons/react';
import { useShellStore } from './store';
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global';
/**
 * Sidebar — menu lateral modernizado usando MenuLateralGlobal do núcleo.
 */
export function Sidebar({ navItems: customNavItems, moduleName = 'SimulaCusto', moduleColor = '#818cf8', tenantName, tenantPlan }) {
    const { sidebarOpen, toggleSidebar } = useShellStore();
    const { t } = useTranslation();
    // Mock de Permissões: Numa etapa futura, leremos "company_products" do contexto global.
    const hasPedidos = false;
    const hasDuimp = false;
    const hasTracking = false;
    // Se o produto não proveu itens customizados, usamos o padrão da plataforma
    const defaultNavItems = [
        // ── Produtos Gravity (primeiro) ─────────────────────────────────────
        {
            label: 'Produtos Gravity',
            icon: _jsx(Star, { weight: "duotone", size: 20 }),
            children: [
                { to: '/simulacusto', label: 'SimulaCusto', icon: _jsx(Calculator, { weight: "duotone", size: 18 }) },
                { to: '/pedidos', label: 'Pedidos de Compra', icon: _jsx(Package, { weight: "duotone", size: 18 }), disabled: !hasPedidos },
                { to: '/duimp', label: 'Exportador DUIMP', icon: _jsx(FileArchive, { weight: "duotone", size: 18 }), disabled: !hasDuimp },
                { to: '/tracking', label: 'Tracking de Carga', icon: _jsx(Anchor, { weight: "duotone", size: 18 }), disabled: !hasTracking }
            ]
        },
        // ── Meu Espaço (grupo expansível) ───────────────────────────────────
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
        // ── Geral ───────────────────────────────────────────────────────────
        // ── Geral ───────────────────────────────────────────────────────────
        { to: '/notificacoes', label: t('shell.menu.notificacoes', 'Notificações'), icon: _jsx(Bell, { weight: "duotone", size: 20 }) },
        { to: '/historico', label: t('shell.menu.historico', 'Histórico'), icon: _jsx(FileText, { weight: "duotone", size: 20 }) },
        { to: '/conector-erp', label: t('shell.menu.conector_erp', 'Conector ERP'), icon: _jsx(Plugs, { weight: "duotone", size: 20 }) },
        { to: '/configurador', label: t('shell.menu.configuracoes', 'Configurações'), icon: _jsx(Gear, { weight: "duotone", size: 20 }) },
    ];
    const navItems = customNavItems || defaultNavItems;
    return (_jsx(MenuLateralGlobal, { tenantName: tenantName, tenantPlan: tenantPlan, navItems: navItems, moduleName: moduleName, moduleColor: moduleColor, isCollapsed: !sidebarOpen, onToggleCollapse: toggleSidebar }));
}
