import { jsx as _jsx } from "react/jsx-runtime";
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, ChatCircle, CurrencyCircleDollar, Briefcase } from '@phosphor-icons/react';
import { useShellStore } from './store';
import { MenuLateralGlobal } from '@nucleo/menu-lateral-global';
/**
 * ContextualSidebar — Menu focado inteiramente no Processo/Deep Work.
 * Suprime os itens corporativos e injeta um controle de retorno "<- Voltar".
 */
export function ContextualSidebar({ tenantName, tenantPlan }) {
    const { sidebarOpen, toggleSidebar } = useShellStore();
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    // Extrai o ID do processo da URL (ex: /processo/1234 -> 1234)
    const processId = location.pathname.split('/')[2] || 'Desconhecido';
    const customNavItems = [
        {
            // O item de 'Voltar' funciona como um escape hatch do Deep Work.
            label: 'Sair do Processo',
            icon: _jsx(ArrowLeft, { weight: "bold", size: 20, color: "#f87171" }),
            to: '/dashboard',
            // Nós usamos 'to' para a Rota via Link, mas poderíamos interceptar o clique se necessário.
        },
        {
            label: `Processo #${processId.substring(0, 6)}...`,
            icon: _jsx(Briefcase, { weight: "duotone", size: 20 }),
            children: [
                { to: `/processo/${processId}/resumo`, label: 'Resumo da D.I.', icon: _jsx(FileText, { weight: "duotone", size: 18 }) },
                { to: `/processo/${processId}/faturas`, label: 'Financeiro', icon: _jsx(CurrencyCircleDollar, { weight: "duotone", size: 18 }) },
                { to: `/processo/${processId}/chat`, label: 'Mensageria', icon: _jsx(ChatCircle, { weight: "duotone", size: 18 }) },
            ]
        }
    ];
    return (_jsx(MenuLateralGlobal, { tenantName: tenantName, tenantPlan: tenantPlan, navItems: customNavItems, moduleName: "Deep Work", moduleColor: "#10b981" // Um verde ou cor destacada para simbolizar "foco interno"
        , isCollapsed: !sidebarOpen, onToggleCollapse: toggleSidebar, defaultCollapsed: false }));
}
